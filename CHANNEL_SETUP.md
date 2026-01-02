# Channel Configuration Guide

## Overview

This guide explains how to configure channels in the database, including setting up authentication credentials.

## Instore Channel Configuration

The Instore channel uses API Key authentication to access the external feedback API.

### Initial Setup

1. Run migrations to create the channels table:
```bash
npm run db:migrate
```

2. Run seeders to create the default Instore channel:
```bash
npm run db:seed
```

### Update API Key

After seeding, you need to update the API key with your actual credentials:

```sql
UPDATE channels
SET auth_config = jsonb_set(
  auth_config,
  '{apiKey}',
  '"your-actual-api-key-here"'
)
WHERE channel_id = 'instore';
```

### Verify Configuration

Check that the channel is configured correctly:

```sql
SELECT
  channel_id,
  channel_name,
  base_url,
  auth_type,
  auth_config,
  is_active
FROM channels
WHERE channel_id = 'instore';
```

Expected result:
- `auth_type`: API_KEY
- `auth_config`: Contains `apiKey` and `apiKeyHeaderName`
- `is_active`: true

## Authentication Types

The system supports multiple authentication types:

### 1. NONE
No authentication required.

```json
{
  "authType": "NONE",
  "authConfig": null
}
```

### 2. JWT
JSON Web Token authentication.

```json
{
  "authType": "JWT",
  "authConfig": {
    "token": "your-jwt-token",
    "authHeaderName": "Authorization",
    "headerPrefix": "Bearer"
  }
}
```

### 3. API_KEY
API Key authentication (used by Instore).

```json
{
  "authType": "API_KEY",
  "authConfig": {
    "apiKey": "your-api-key",
    "apiKeyHeaderName": "x-api-key"
  }
}
```

## Channel Parameters

### Base Configuration
- `channelId`: Unique identifier (e.g., 'instore')
- `channelName`: Display name
- `baseUrl`: API endpoint URL
- `httpMethod`: GET or POST
- `isActive`: Enable/disable the channel

### Authentication
- `authType`: NONE, JWT, or API_KEY
- `authConfig`: JSON object with auth-specific fields

### Date Parameters
- `dateFromParam`: Query parameter name for start date
- `dateToParam`: Query parameter name for end date
- `dateFormat`: Date format string (e.g., 'YYYY-MM-DD')

### Pagination
- `paginationType`: PAGE or NONE
- `pageParam`: Query parameter name for page number
- `startPage`: Initial page number (usually 1)

## Adding New Channels

To add a new channel:

1. Add the channel ID to the validation in `channel.model.ts`:
```typescript
validate: {
  isIn: {
    args: [['swiggy', 'zomato', 'instore', 'magicpin', 'yournewchannel']],
    msg: 'Invalid channel_id',
  },
}
```

2. Insert the channel configuration:
```sql
INSERT INTO channels (
  id,
  channel_id,
  channel_name,
  base_url,
  http_method,
  auth_type,
  auth_config,
  date_from_param,
  date_to_param,
  date_format,
  pagination_type,
  page_param,
  start_page,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'yournewchannel',
  'Your New Channel',
  'https://api.example.com/feedback',
  'GET',
  'API_KEY',
  '{"apiKey": "your-key", "apiKeyHeaderName": "x-api-key"}',
  'startDate',
  'endDate',
  'YYYY-MM-DD',
  'PAGE',
  'page',
  1,
  true,
  now(),
  now()
);
```

## Security Notes

- Never commit actual API keys to version control
- Store API keys in environment variables when possible
- Update the placeholder API key immediately after seeding
- Use database access controls to protect channel configurations
- Rotate API keys regularly according to your security policy
