-- ============================================
-- Update Instore API Key Configuration
-- ============================================
--
-- Instructions:
-- 1. Replace 'YOUR_ACTUAL_API_KEY_HERE' with your real Instore API key
-- 2. Run this script against your database:
--    psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -f update-instore-api-key.sql
--
-- ============================================

-- Update the API key
UPDATE channels
SET "authConfig" = jsonb_set(
  "authConfig"::jsonb,
  '{apiKey}',
  '"YOUR_ACTUAL_API_KEY_HERE"'
)
WHERE "channelId" = 'instore';

-- Verify the update (this will show your new configuration)
SELECT
  "channelId",
  "channelName",
  "authType",
  "authConfig"->>'apiKey' as api_key,
  "authConfig"->>'apiKeyHeaderName' as header_name,
  "baseUrl",
  "isActive"
FROM channels
WHERE "channelId" = 'instore';
