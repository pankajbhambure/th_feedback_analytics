# Getting Started with Ingest API

Quick guide to set up and use the Instore feedback ingestion endpoint.

---

## Step 1: Verify the Endpoint is Working

The route `/api/v1/ingest/instore` is now properly configured.

**Quick test:**
```bash
./verify-ingest-route.sh
```

**Expected result:** Should show `401 Unauthorized` (this is good - it means the route exists and requires authentication).

---

## Step 2: Configure the Instore API Key

The endpoint is failing with `401 Unauthorized` from the external API because the API key needs to be configured.

### Option A: Using SQL Script (Easiest)

1. Edit `update-instore-api-key.sql`
2. Replace `YOUR_ACTUAL_API_KEY_HERE` with your real API key
3. Run the script:
```bash
psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -f update-instore-api-key.sql
```

### Option B: Direct SQL

```sql
UPDATE channels
SET "authConfig" = jsonb_set(
  "authConfig"::jsonb,
  '{apiKey}',
  '"your-actual-api-key"'
)
WHERE "channelId" = 'instore';
```

### Verify Configuration

```sql
SELECT
  "channelId",
  "authType",
  "authConfig"->>'apiKey' as api_key
FROM channels
WHERE "channelId" = 'instore';
```

---

## Step 3: Get a JWT Token

You need a valid JWT token to call the ingest endpoint.

### Register a User (if you haven't already)

```bash
curl -X POST http://localhost:3010/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123!"
  }'
```

### Request OTP for Login

```bash
curl -X POST http://localhost:3010/api/v1/auth/login-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com"}'
```

### Get OTP from Email or Database

**From Database:**
```sql
SELECT * FROM otps
WHERE "userId" IN (SELECT id FROM users WHERE email = 'admin@example.com')
ORDER BY "createdAt" DESC LIMIT 1;
```

### Verify OTP and Get Token

```bash
curl -X POST http://localhost:3010/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "otp": "123456",
    "purpose": "login"
  }'
```

**Save the token from the response!**

---

## Step 4: Call the Ingest Endpoint

Now you can ingest Instore feedback:

```bash
curl -X POST http://localhost:3010/api/v1/ingest/instore \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "fromDate": "2024-01-01",
    "toDate": "2024-01-01"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Ingestion completed",
  "data": {
    "inserted": 150,
    "skipped": 5
  }
}
```

---

## Troubleshooting

### Error: Route not found (404)

**Cause:** Server needs restart after code changes

**Fix:**
```bash
npm run build
npm start
```

### Error: 401 Unauthorized (from external API)

**Cause:** Invalid or missing Instore API key

**Fix:** Update the API key in the database (see Step 2)

**Verify:** Test the external API directly:
```bash
curl -X GET "https://dipstick.timhortonsindia.com/server/api/v1/feedbacks?startDate=2024-01-01&endDate=2024-01-01&page=1" \
  -H "x-api-key: YOUR_API_KEY" \
  -v
```

If this returns 401, your API key is incorrect.

### Error: 401 Unauthorized (from your API)

**Cause:** Invalid or missing JWT token

**Fix:** Get a new token (see Step 3)

### Error: 400 Bad Request

**Cause:** Invalid date format or date range

**Fix:** Ensure:
- Dates are in YYYY-MM-DD format
- fromDate is before or equal to toDate
- Dates are valid calendar dates

---

## Quick Reference

### Files and Documentation

- `INGEST_API.md` - Full API documentation
- `INGEST_API_KEY_SETUP.md` - Detailed API key setup guide
- `update-instore-api-key.sql` - SQL script to update API key
- `verify-ingest-route.sh` - Route verification script
- `test-routes.sh` - Full API testing script
- `API_TESTING_GUIDE.md` - General API testing guide

### Useful Commands

**Verify route:**
```bash
./verify-ingest-route.sh
```

**Test all routes:**
```bash
./test-routes.sh
```

**Check server status:**
```bash
curl http://localhost:3010/api/v1/health
```

**View logs:**
```bash
tail -f logs/all.log
```

---

## Next Steps

1. **Automated Scheduling**: Set up cron jobs or schedulers to run ingestion automatically
   - See `SCHEDULER_SETUP.md` for details

2. **Data Processing**: The ingested data is stored in `feedback_raw` with status `NEW`
   - Implement processing logic to parse and store in normalized tables

3. **Analytics**: Build dashboards and reports on the ingested feedback data
   - See `ANALYTICS_LAYER_IMPLEMENTATION.md` for details

4. **Monitoring**: Set up alerts for ingestion failures
   - Monitor logs for errors
   - Track inserted/skipped counts

---

## Support

If you need help:

1. Check the error message and consult the relevant documentation
2. Review server logs: `tail -f logs/all.log`
3. Run diagnostic scripts: `./verify-ingest-route.sh`
4. Check database configuration: `SELECT * FROM channels WHERE "channelId" = 'instore';`
