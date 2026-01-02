# API Testing & Troubleshooting Guide

## Available OTP Endpoints

### 1. Request OTP for Login
```bash
curl -X POST http://your-server-ip:3010/api/v1/auth/login-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "If the email exists, an OTP has been sent",
  "data": {
    "message": "If the email exists, an OTP has been sent"
  }
}
```

### 2. Request OTP for Registration (passwordless)
```bash
curl -X POST http://your-server-ip:3010/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "message": "OTP sent to your email"
  }
}
```

### 3. Request OTP for Password Reset
```bash
curl -X POST http://your-server-ip:3010/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 4. Verify OTP
```bash
curl -X POST http://your-server-ip:3010/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "purpose": "login"
  }'
```

**Purpose values:** `login`, `register`, or `reset_password`

### 5. Health Check
```bash
curl http://your-server-ip:3010/api/v1/health
```

## Ingest Endpoints

### 1. Ingest Instore Feedback
```bash
curl -X POST http://your-server-ip:3010/api/v1/ingest/instore \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fromDate": "2024-01-01",
    "toDate": "2024-01-31"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Ingestion completed",
  "data": {
    "message": "Ingestion completed",
    "inserted": 150,
    "skipped": 5
  }
}
```

**Notes:**
- Requires authentication (JWT token)
- Date format: YYYY-MM-DD
- The endpoint will fetch feedback from the external Instore API for the specified date range
- Returns counts of inserted and skipped records

## Troubleshooting Steps

### Step 1: Check if the Server is Running

```bash
# Check if the application is running
ps aux | grep node

# Check if port 3010 is listening
netstat -tuln | grep 3010
# OR
ss -tuln | grep 3010
```

### Step 2: Check Application Logs

```bash
# If using PM2
pm2 logs your-app-name

# If running with npm
# Check the console output where you started the app
```

Look for:
- Database connection errors
- Email configuration errors
- Any error messages when making requests

### Step 3: Verify Database Connection

Connect to your PostgreSQL database and check:

```sql
-- Check if tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check if otps table has the correct structure
\d otps

-- Check if any OTPs were created
SELECT * FROM otps ORDER BY "createdAt" DESC LIMIT 10;

-- Check if users exist
SELECT id, email, "isEmailVerified", status FROM users;
```

### Step 4: Test with Verbose Logging

Add this to your test request to see the full response:

```bash
curl -X POST http://your-server-ip:3010/api/v1/auth/login-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}' \
  -v
```

The `-v` flag shows:
- Request headers
- Response headers
- HTTP status code
- Any redirect information

### Step 5: Check Email Configuration

```bash
# Check if environment variables are loaded
# SSH into your server and check
cat /path/to/your/app/.env | grep EMAIL
```

Verify:
- `EMAIL_PROVIDER` is set to `gmail` or `outlook`
- `EMAIL_FROM` has a valid email
- `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set (if using Gmail)
- `OUTLOOK_USER` and `OUTLOOK_PASSWORD` are set (if using Outlook)

### Step 6: Check for Validation Errors

If you get a 400 error, check the error message:

```bash
curl -X POST http://your-server-ip:3010/api/v1/auth/login-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email"}' \
  -i
```

Common validation errors:
- Invalid email format
- Missing required fields

### Step 7: Test Database Migrations

Ensure all migrations have run:

```bash
# In your application directory
npm run db:migrate
```

Check migration status in database:

```sql
SELECT * FROM "SequelizeMeta";
```

## Common Issues and Solutions

### Issue 1: "Environment validation failed"

**Solution:** Check that all required environment variables are set in `.env`:
```bash
# Required variables
NODE_ENV=development
PORT=3010
DB_HOST=...
DB_PORT=...
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
JWT_SECRET=...
EMAIL_PROVIDER=gmail
EMAIL_FROM=...
EMAIL_FROM_NAME=...
GMAIL_USER=...
GMAIL_APP_PASSWORD=...
```

### Issue 2: OTP not being stored but getting success response

**Possible causes:**
1. User doesn't exist in database (for login-otp)
2. Database connection issue
3. Transaction failure

**Debug:**
```bash
# Check application logs for database errors
# Look for lines containing "Sequelize" or "database"
```

### Issue 3: Email not sending

**Check:**
1. Email credentials are correct
2. Gmail App Password is used (not regular password)
3. No firewall blocking SMTP ports (587 for Outlook, 465/587 for Gmail)
4. Check application logs for email errors

### Issue 4: Cannot connect to API

**Check:**
1. Server firewall allows port 3010
```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow 3010

# CentOS/RHEL
sudo firewall-cmd --list-ports
sudo firewall-cmd --add-port=3010/tcp --permanent
sudo firewall-cmd --reload
```

2. Application is bound to correct interface
```bash
# Check if listening on 0.0.0.0 or specific IP
netstat -tuln | grep 3010
```

## Testing Workflow

### Complete OTP Login Flow Test

1. **First, register a user** (if not exists):
```bash
curl -X POST http://your-server-ip:3010/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test@1234"
  }'
```

2. **Request OTP:**
```bash
curl -X POST http://your-server-ip:3010/api/v1/auth/login-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@example.com"}'
```

3. **Check database for OTP:**
```sql
SELECT * FROM otps WHERE "userId" IN (
  SELECT id FROM users WHERE email = 'testuser@example.com'
) ORDER BY "createdAt" DESC LIMIT 1;
```

4. **Verify OTP:**
```bash
curl -X POST http://your-server-ip:3010/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "otp": "YOUR_OTP_FROM_DATABASE_OR_EMAIL",
    "purpose": "login"
  }'
```

## Quick Diagnostic Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

SERVER="http://your-server-ip:3010"
EMAIL="test@example.com"

echo "=== Testing API Health ==="
curl -s "$SERVER/api/v1/health" | jq .

echo -e "\n=== Requesting OTP ==="
curl -s -X POST "$SERVER/api/v1/auth/login-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\"}" | jq .

echo -e "\n=== Check logs for errors ==="
echo "Run: pm2 logs OR check your application console"
```

Make it executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Getting Detailed Error Information

Enable debug mode in your environment:

```bash
# Add to .env
NODE_ENV=development
```

Restart your application and check logs for detailed error traces.
