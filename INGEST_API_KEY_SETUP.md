# Ingest API Key Setup Guide

## Issue: 401 Unauthorized Error

The ingest endpoint is now working correctly, but the external Instore API is returning `401 Unauthorized` because the API key is not configured.

The database currently has a placeholder API key: `your-api-key-here`

---

## Solution: Update the API Key in Database

You need to update the channel configuration with your actual Instore API key.

### Option 1: Update via SQL (Recommended)

```sql
-- Update the instore channel with your actual API key
UPDATE channels
SET "authConfig" = jsonb_set(
  "authConfig"::jsonb,
  '{apiKey}',
  '"YOUR_ACTUAL_API_KEY_HERE"'
)
WHERE "channelId" = 'instore';

-- Verify the update
SELECT "channelId", "authType", "authConfig"
FROM channels
WHERE "channelId" = 'instore';
```

Replace `YOUR_ACTUAL_API_KEY_HERE` with your actual Instore API key.

### Option 2: Check Current Configuration

```sql
-- See what's currently configured
SELECT
  "channelId",
  "channelName",
  "baseUrl",
  "authType",
  "authConfig"
FROM channels
WHERE "channelId" = 'instore';
```

This will show you the current configuration. The `authConfig` should look like:
```json
{
  "apiKey": "your-api-key-here",
  "apiKeyHeaderName": "x-api-key"
}
```

---

## Getting Your Instore API Key

1. Contact your Instore API administrator
2. Request an API key for the endpoint: `https://dipstick.timhortonsindia.com/server/api/v1/feedbacks`
3. Once you have the key, update the database using the SQL above

---

## Verifying the API Key Header

The current configuration sends the API key as:
```
Header: x-api-key
Value: your-api-key-here
```

If the Instore API uses a different header name (e.g., `api-key`, `X-API-Key`, `Authorization`), you need to update both fields:

```sql
UPDATE channels
SET "authConfig" = '{
  "apiKey": "YOUR_ACTUAL_API_KEY",
  "apiKeyHeaderName": "X-API-Key"
}'::jsonb
WHERE "channelId" = 'instore';
```

Common API key header names:
- `x-api-key`
- `X-API-Key`
- `api-key`
- `apikey`
- `Authorization` (with value: `ApiKey YOUR_KEY`)

---

## Testing After Update

### 1. Verify Database Update
```sql
SELECT "authConfig"->>'apiKey' as api_key
FROM channels
WHERE "channelId" = 'instore';
```

Should show your actual API key (not the placeholder).

### 2. Test the Ingest Endpoint
```bash
curl -X POST http://localhost:3010/api/v1/ingest/instore \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fromDate": "2024-01-01",
    "toDate": "2024-01-01"
  }'
```

### 3. Check Server Logs
```bash
# Look for the API request being made
# Should show: "Fetching from https://dipstick.timhortonsindia.com/..."
tail -f logs/all.log
```

---

## Expected Responses

### ✅ Success (200)
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

### ❌ Invalid API Key (401)
```json
{
  "success": false,
  "message": "API request failed: 401 Unauthorized",
  "stack": "Error: API request failed: 401 Unauthorized..."
}
```
**Fix:** Update the API key in the database.

### ❌ Wrong Header Name
If you get 401 even with a valid key, the header name might be wrong.

**Check with the API provider:**
- What is the expected header name?
- Is there a specific format? (e.g., `Bearer API_KEY`, just `API_KEY`, etc.)

---

## Alternative: JWT Authentication

If the Instore API uses JWT instead of API key:

```sql
UPDATE channels
SET
  "authType" = 'JWT',
  "authConfig" = '{
    "token": "YOUR_JWT_TOKEN",
    "authHeaderName": "Authorization",
    "headerPrefix": "Bearer"
  }'::jsonb
WHERE "channelId" = 'instore';
```

This will send:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Environment Variable Approach (Future Enhancement)

For better security, the API key should come from environment variables instead of being stored directly in the database.

### Step 1: Add to .env
```bash
INSTORE_API_KEY=your-actual-api-key
```

### Step 2: Update Seeder
```typescript
// In src/seeders/20231230000002-seed-channels.ts
authConfig: JSON.stringify({
  apiKey: process.env.INSTORE_API_KEY || 'your-api-key-here',
  apiKeyHeaderName: 'x-api-key',
}),
```

### Step 3: Rerun Seeder
```bash
# Delete existing channel
npm run db:seed:undo

# Reseed with new config
npm run db:seed
```

---

## Troubleshooting

### Issue: API key updated but still getting 401

**Possible causes:**
1. API key is incorrect
2. API key header name is wrong
3. API endpoint URL is wrong
4. API key needs activation/whitelist

**Debug steps:**

1. Test the API directly with curl:
```bash
curl -X GET "https://dipstick.timhortonsindia.com/server/api/v1/feedbacks?startDate=2024-01-01&endDate=2024-01-01&page=1" \
  -H "x-api-key: YOUR_API_KEY" \
  -v
```

2. Check the response:
   - 401: Invalid API key or wrong header
   - 403: API key valid but not authorized
   - 200: Success! Use this configuration

3. If you get a different header requirement from direct testing, update the database accordingly.

---

## Quick Fix Script

Save this as `update-api-key.sql`:

```sql
-- Update with your actual API key
\set api_key 'paste-your-actual-api-key-here'

UPDATE channels
SET "authConfig" = jsonb_build_object(
  'apiKey', :'api_key',
  'apiKeyHeaderName', 'x-api-key'
)
WHERE "channelId" = 'instore';

-- Verify
SELECT
  "channelId",
  "authType",
  "authConfig"->>'apiKey' as api_key,
  "authConfig"->>'apiKeyHeaderName' as header_name
FROM channels
WHERE "channelId" = 'instore';
```

Run it:
```bash
psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -f update-api-key.sql
```

---

## Security Best Practice

**Important:** Never commit API keys to git!

Add to `.gitignore`:
```
.env
.env.local
*.sql
```

Store API keys in:
- Environment variables (.env file)
- AWS Secrets Manager
- Azure Key Vault
- Or your preferred secrets management solution
