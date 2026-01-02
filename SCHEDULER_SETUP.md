# Scheduler Setup Guide

This guide explains how to enable automatic scheduled ingestion for Instore feedback data.

## Overview

The ingestion system can be run manually via API or automatically on a schedule using node-cron.

## Manual Triggering

Use the REST API endpoint to manually trigger ingestion for any date range:

```bash
POST /api/ingest/instore
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "fromDate": "2024-01-01",
  "toDate": "2024-01-31"
}
```

## Automatic Scheduling

To enable automatic daily ingestion, follow these steps:

### 1. Install node-cron

```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

### 2. Update scheduler.config.ts

Replace the contents of `src/config/scheduler.config.ts` with:

```typescript
import cron from 'node-cron';
import { runDailyInstoreIngestion } from '../modules/ingest/ingest.scheduler';
import { logger } from '../utils/logger';

export function setupScheduledJobs(): void {
  // Run daily at 3:00 AM
  cron.schedule('0 3 * * *', async () => {
    logger.info('Starting scheduled Instore ingestion job');
    try {
      await runDailyInstoreIngestion();
    } catch (error) {
      logger.error('Scheduled ingestion job failed:', error);
    }
  });

  logger.info('Scheduled jobs configured: Daily Instore ingestion at 3:00 AM');
}
```

### 3. Enable in server.ts

Add this import and call in `src/server.ts`:

```typescript
import { setupScheduledJobs } from './config/scheduler.config';

// After database sync, add:
setupScheduledJobs();
```

### 4. Cron Schedule Examples

- `0 3 * * *` - Every day at 3:00 AM
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Every Sunday at midnight
- `0 2 * * 1-5` - Every weekday at 2:00 AM

## Testing

1. Test manually first:
```bash
curl -X POST http://localhost:3000/api/ingest/instore \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fromDate": "2024-01-01", "toDate": "2024-01-01"}'
```

2. Enable scheduler and monitor logs for scheduled runs

## Monitoring

Check application logs for:
- `Starting scheduled Instore ingestion job` - Job triggered
- `Scheduled ingestion completed: X inserted, Y skipped` - Success
- `Scheduled ingestion job failed` - Errors

## Notes

- The scheduler runs for yesterday's date by default
- Duplicate feedbacks are automatically skipped (idempotent)
- Failed runs are logged but don't crash the application
- Manual API calls can be used to backfill any missed dates
