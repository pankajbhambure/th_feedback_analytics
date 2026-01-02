# Instore Feedback Ingestion API

## Overview

REST API endpoint for ingesting Instore feedback data into the feedback_raw table with automatic pagination, idempotency, and error handling.

## Endpoint

```
POST /api/ingest/instore
```

## Authentication

Requires a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Request Body

```json
{
  "fromDate": "YYYY-MM-DD",
  "toDate": "YYYY-MM-DD"
}
```

### Parameters

- `fromDate` (required): Start date of the range (inclusive), format: YYYY-MM-DD
- `toDate` (required): End date of the range (inclusive), format: YYYY-MM-DD

### Validation Rules

- Both dates must be in YYYY-MM-DD format
- Both dates must be valid calendar dates
- `fromDate` must be before or equal to `toDate`

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "message": "Ingestion completed",
    "inserted": 150,
    "skipped": 25
  }
}
```

### Error Responses

#### 400 Bad Request

Invalid date format or date range:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "fromDate",
      "message": "fromDate must be in YYYY-MM-DD format"
    }
  ]
}
```

#### 401 Unauthorized

Missing or invalid authentication token:

```json
{
  "success": false,
  "message": "Access token required"
}
```

#### 500 Internal Server Error

API or database failure:

```json
{
  "success": false,
  "message": "Ingestion failed: [error details]"
}
```

## How It Works

1. **Channel Configuration**: Reads Instore channel settings from the `channels` table:
   - API base URL
   - Authentication type (API_KEY) and credentials
   - Pagination settings
   - Date parameter names and format

2. **Date Range Processing**: Loops through each date from `fromDate` to `toDate`

3. **Pagination**: For each date:
   - Starts at the configured start page
   - Fetches data page by page
   - Continues until no more data is returned

4. **Idempotency**: Each feedback is uniquely identified by:
   - `channelId` (always 'instore')
   - `externalFeedbackId` (from the source system)
   - Duplicates are automatically skipped

5. **Data Storage**: Saves to `feedback_raw` table:
   - Raw JSON payload
   - Feedback timestamp
   - Ingestion timestamp
   - Processing status (NEW)
   - Source hash for integrity

## Usage Examples

### Single Day

```bash
curl -X POST http://localhost:3000/api/ingest/instore \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "fromDate": "2024-01-15",
    "toDate": "2024-01-15"
  }'
```

### Date Range

```bash
curl -X POST http://localhost:3000/api/ingest/instore \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "fromDate": "2024-01-01",
    "toDate": "2024-01-31"
  }'
```

### Using JavaScript/Node.js

```javascript
const response = await fetch('http://localhost:3000/api/ingest/instore', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fromDate: '2024-01-01',
    toDate: '2024-01-31'
  })
});

const result = await response.json();
console.log(`Inserted: ${result.data.inserted}, Skipped: ${result.data.skipped}`);
```

## Testing

### Prerequisites

1. Ensure the Instore channel is configured in the `channels` table:
```sql
SELECT * FROM channels WHERE channel_id = 'instore';
```

2. Obtain a valid JWT token (login via `/api/auth/login`)

### Test Cases

1. **Single date ingestion**:
   - Test with a recent date that has data
   - Verify inserted count > 0

2. **Duplicate handling**:
   - Run the same date twice
   - Second run should show skipped count matching first run's inserted count

3. **Date range**:
   - Test with a 7-day range
   - Verify logs show processing for each date

4. **Invalid inputs**:
   - Invalid date format: should return 400
   - Future dates: should return 200 with 0 inserted
   - fromDate > toDate: should return 400

## Monitoring

Check application logs for detailed progress:

```
Processing feedbacks for date: 2024-01-15
Fetching page 1 from https://api.example.com/feedback...
Found 100 feedbacks for 2024-01-15
Fetching page 2 from https://api.example.com/feedback...
Found 50 feedbacks for 2024-01-15
Ingestion completed: 150 inserted, 0 skipped
```

## Error Handling

- Network failures: Request times out or connection fails
- API errors: External API returns 4xx/5xx status
- Database errors: Constraint violations, connection issues
- All errors are logged with full details
- Transaction safety: Each feedback insert is independent

## Performance Considerations

- Processes one date at a time sequentially
- Pagination prevents memory issues with large datasets
- Unique constraint on (channelId, externalFeedbackId) ensures data integrity
- Can safely re-run for any date range without data duplication

## Next Steps

For automatic scheduling, see [SCHEDULER_SETUP.md](./SCHEDULER_SETUP.md)
