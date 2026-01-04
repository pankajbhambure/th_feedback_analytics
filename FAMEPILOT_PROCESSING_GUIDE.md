# Famepilot Processing Guide

This guide explains how to use the Famepilot processing pipeline to convert Famepilot-ingested feedback_raw records into analytics tables.

## Overview

The Famepilot processing pipeline is a **separate, independent** pipeline from the Instore processing pipeline. It processes feedback from online channels (Swiggy, Zomato, Google, Magicpin) ingested via the Famepilot API.

## Endpoint

```
POST /api/v1/process/feedback-raw/famepilot
```

## Authentication

This endpoint requires authentication. Include a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Request Body

```json
{
  "startDate": "2025-12-01",
  "endDate": "2025-12-06",
  "batchSize": 100
}
```

### Parameters

- **startDate** (required): Start date in YYYY-MM-DD format
- **endDate** (required): End date in YYYY-MM-DD format
- **batchSize** (optional): Number of records to process in each batch (default: 100, max: 1000)

## Response

```json
{
  "success": true,
  "message": "Famepilot processing completed",
  "data": {
    "message": "Famepilot processing completed",
    "processed": 75,
    "skipped": 7,
    "logFile": "famepilot_2025-12-01_2025-12-06_2026-01-04_14-30-15.log"
  }
}
```

### Response Fields

- **processed**: Number of records successfully processed
- **skipped**: Number of records skipped (due to store resolution issues)
- **logFile**: Name of the log file containing details of skipped records

## Processing Rules

### Channel Scope

The pipeline processes ONLY these channels:
- swiggy
- zomato
- google
- magicpin

All other channels (including `instore`) are ignored.

### Store Resolution

The pipeline uses **strict store resolution** based on the `branch` field in the Famepilot payload:

1. Extracts `branch` from the raw payload
2. Searches for stores where: `LOWER(store_location) LIKE '%' || LOWER(branch) || '%'`
3. Resolution logic:
   - **Exactly 1 match** → Use that store and process the record
   - **0 matches** → Skip with reason `STORE_NOT_FOUND`
   - **Multiple matches** → Skip with reason `MULTIPLE_STORE_MATCH`

**No store creation or fallback logic** - if a store cannot be uniquely resolved, the record is skipped.

### Customer Resolution

Customers are identified by: `channelId + external_customer_id`

- If customer exists → Use existing record
- If customer doesn't exist → Create new customer with:
  - `customerId`: `{channelId}_{external_customer_id}`
  - `fullName`: From `reviewer.name`
  - `repeatCustomer`: Based on `reviewer.type` (Repeat/New)
  - `email` and `phone`: May be NULL

### Analytics Tables

For successfully resolved records, the pipeline inserts into:

1. **customer_visits**
   - Links customer, store, channel, and feedback_raw
   - Calculates visit date, day, week, month, quarter, year
   - Derives sentiment from rating
   - Sets `has_food_order` based on `menu_tags` presence

2. **ratings**
   - Stores overall_rating
   - food_rating and beverage_rating are NULL (not available in Famepilot data)

3. **feedbacks**
   - Stores overall comments (review text)
   - Stores food ordered (menu tags as comma-separated string)
   - Sets feedback_status to 'Pending'

4. **feedback_responses**
   - Only created if a reply exists in the payload
   - Stores response text and response date

### Processing Status

After processing, each feedback_raw record is marked:

- **PROCESSED**: Successfully inserted into analytics tables
- **SKIPPED**: Could not be processed due to store resolution issues

## Skip Logs

For each API execution, a log file is created containing details of ALL skipped records.

### Log File Format

```
famepilot_{startDate}_{endDate}_{runDate}_{runTime}.log
```

Example: `famepilot_2025-12-01_2025-12-06_2026-01-04_14-30-15.log`

### Log File Location

```
/logs/famepilot_*.log
```

### Log File Content

Each skipped record entry includes:

```
Feedback Raw ID: 550e8400-e29b-41d4-a716-446655440000
External Feedback ID: famepilot_123456
Channel ID: swiggy
Branch Name: Connaught Place
Skip Reason: MULTIPLE_STORE_MATCH
Timestamp: 2026-01-04T14:30:15.123Z
---
```

## Example Usage

### Using cURL

```bash
curl -X POST http://localhost:3010/api/v1/process/feedback-raw/famepilot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "startDate": "2025-12-01",
    "endDate": "2025-12-06",
    "batchSize": 100
  }'
```

### Using JavaScript/TypeScript

```typescript
const response = await fetch('http://localhost:3010/api/v1/process/feedback-raw/famepilot', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    startDate: '2025-12-01',
    endDate: '2025-12-06',
    batchSize: 100,
  }),
});

const result = await response.json();
console.log(`Processed: ${result.data.processed}, Skipped: ${result.data.skipped}`);
console.log(`Log file: ${result.data.logFile}`);
```

## Idempotency

The pipeline is **fully idempotent**:

- Each feedback_raw record is processed exactly once
- Re-running the pipeline with the same date range will skip already-processed records
- Uniqueness is enforced via `feedback_raw.id` in `customer_visits.feedback_raw_id`

## Error Handling

- One record failure does NOT crash the entire batch
- Failed records are marked with `processing_status = 'FAILED'`
- All skipped records are logged to the log file
- API response summarizes results

## Troubleshooting

### High Skip Rate

If you see a high number of skipped records:

1. Check the log file to identify skip reasons
2. For `STORE_NOT_FOUND`:
   - Verify that stores exist in the database
   - Check if `store_location` values match the `branch` values in Famepilot data
3. For `MULTIPLE_STORE_MATCH`:
   - Review `store_location` values for ambiguity
   - Consider making store locations more specific

### No Records Processed

If no records are processed:

1. Verify that feedback_raw records exist for the date range
2. Check that records have `processing_status = 'NEW'`
3. Confirm that records belong to Famepilot channels (swiggy, zomato, google, magicpin)
4. Run query to check:

```sql
SELECT channelId, COUNT(*)
FROM feedback_raw
WHERE createdAt BETWEEN '2025-12-01' AND '2025-12-06'
  AND processing_status = 'NEW'
  AND channelId IN ('swiggy', 'zomato', 'google', 'magicpin')
GROUP BY channelId;
```

### View Skip Logs

```bash
cat logs/famepilot_2025-12-01_2025-12-06_2026-01-04_14-30-15.log
```

## Database Migration

Before using this endpoint, run the migration to add the `SKIPPED` status:

```bash
npm run db:migrate
```

This adds the `SKIPPED` value to the `processing_status` enum in the `feedback_raw` table.

## Important Notes

1. **Separate Pipeline**: This is completely separate from the Instore processing pipeline
2. **No Store Creation**: Stores are NOT auto-created; they must exist in the database
3. **Strict Resolution**: Only exact single matches are processed
4. **Channel-Specific**: Only processes Famepilot channels (swiggy, zomato, google, magicpin)
5. **Log Files**: Every execution creates a log file, even if no records are skipped
6. **Batch Processing**: Processes records in batches for performance
7. **Transactional**: Each record is processed in its own transaction
