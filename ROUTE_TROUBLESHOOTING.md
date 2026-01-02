# Route Troubleshooting Guide

## Issue: Route /api/v1/ingest/instore not found (404)

### Quick Fix Checklist

1. **Rebuild the application**
```bash
npm run build
```

2. **Restart the server**
```bash
# If using npm
npm start

# If using PM2
pm2 restart your-app-name

# If using nodemon (development)
npm run dev
```

3. **Test the route**
```bash
./test-routes.sh
```

---

## Understanding the Route Structure

The `/api/v1/ingest/instore` endpoint is constructed from:

### 1. Base Path (app.ts:10)
```typescript
app.use('/api/v1', routes);
```
Base: `/api/v1`

### 2. Route Group (routes.ts:19)
```typescript
router.use('/ingest', ingestRoutes);
```
Group: `/ingest`

### 3. Specific Route (ingest.routes.ts:9-14)
```typescript
router.post('/instore', ...)
```
Endpoint: `/instore`

**Full Path:** `/api/v1` + `/ingest` + `/instore` = `/api/v1/ingest/instore`

**Method:** POST (not GET!)

---

## Common Causes and Solutions

### Cause 1: Server Not Restarted After Code Changes

**Symptom:** Route was working before, now returns 404

**Solution:**
```bash
# Stop the current server
# Press Ctrl+C if running in terminal

# Rebuild
npm run build

# Restart
npm start
```

### Cause 2: TypeScript Compilation Errors

**Symptom:** Build fails or has errors

**Solution:**
```bash
# Check for compilation errors
npm run build

# Look for any errors in the output
# Fix any TypeScript errors reported
```

### Cause 3: Wrong HTTP Method

**Symptom:** Route returns 404 or 405

**Problem:** The endpoint requires POST, not GET

**Solution:**
```bash
# ✗ Wrong - using GET
curl http://localhost:3010/api/v1/ingest/instore

# ✓ Correct - using POST
curl -X POST http://localhost:3010/api/v1/ingest/instore \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"fromDate": "2024-01-01", "toDate": "2024-01-31"}'
```

### Cause 4: Missing Authentication

**Symptom:** Route returns 401 Unauthorized

**Note:** This is actually CORRECT behavior! The route exists but requires authentication.

**Solution:**
1. First, get a JWT token by logging in:
```bash
# Request OTP
curl -X POST http://localhost:3010/api/v1/auth/login-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'

# Verify OTP (get token)
curl -X POST http://localhost:3010/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "otp": "123456",
    "purpose": "login"
  }'
```

2. Use the token in your ingest request:
```bash
curl -X POST http://localhost:3010/api/v1/ingest/instore \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{"fromDate": "2024-01-01", "toDate": "2024-01-31"}'
```

### Cause 5: Module Not Imported

**Symptom:** Route consistently returns 404

**Check:** Verify these imports exist

In `src/routes.ts`:
```typescript
import ingestRoutes from './modules/ingest/ingest.routes';
router.use('/ingest', ingestRoutes);
```

In `src/app.ts`:
```typescript
import routes from './routes';
app.use('/api/v1', routes);
```

### Cause 6: Wrong Port

**Symptom:** Connection refused or timeout

**Solution:**
```bash
# Check what port the server is running on
cat .env | grep PORT

# Default is 3010
# Make sure you're using the correct port in your requests
```

---

## Diagnostic Steps

### Step 1: Verify Server is Running

```bash
# Check if Node process is running
ps aux | grep node

# Check if port is listening
netstat -tuln | grep 3010
# OR
ss -tuln | grep 3010
```

### Step 2: Check Compilation Status

```bash
# Rebuild the application
npm run build

# If successful, you should see no errors
# Check the dist/ folder was created
ls -la dist/
```

### Step 3: Check Server Logs

```bash
# Look for startup messages
# Should show "Server is running on port 3010"

# Look for route registration logs
# Should show no errors during route registration
```

### Step 4: Test with the Test Script

```bash
# Run the automated test script
./test-routes.sh

# Look for the ingest endpoint test result
# Should show 401 (requires auth) or 400 (validation error)
# NOT 404!
```

### Step 5: Test All Route Methods

```bash
# Test GET (should fail - wrong method)
curl -v http://localhost:3010/api/v1/ingest/instore

# Test POST without auth (should return 401)
curl -v -X POST http://localhost:3010/api/v1/ingest/instore \
  -H "Content-Type: application/json"

# Test POST with invalid data (should return 400)
curl -v -X POST http://localhost:3010/api/v1/ingest/instore \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-token" \
  -d '{}'
```

---

## Expected Responses

### 404 Not Found
```json
{
  "success": false,
  "message": "Route /api/v1/ingest/instore not found"
}
```
**Problem:** Route doesn't exist or server needs restart

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```
**OK:** Route exists! You need to provide authentication

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [...]
}
```
**OK:** Route exists! You need to provide valid data

### 200 Success
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
**Perfect:** Everything is working!

---

## Complete Working Example

### 1. Start the Server
```bash
npm run build
npm start
```

### 2. Create a User (if needed)
```bash
curl -X POST http://localhost:3010/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123"
  }'
```

### 3. Get OTP
```bash
curl -X POST http://localhost:3010/api/v1/auth/login-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com"}'
```

### 4. Check Email or Database for OTP
```sql
SELECT * FROM otps
WHERE "userId" IN (SELECT id FROM users WHERE email = 'admin@example.com')
ORDER BY "createdAt" DESC LIMIT 1;
```

### 5. Verify OTP and Get Token
```bash
curl -X POST http://localhost:3010/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "otp": "YOUR_OTP_HERE",
    "purpose": "login"
  }'
```

Save the token from the response.

### 6. Call Ingest Endpoint
```bash
curl -X POST http://localhost:3010/api/v1/ingest/instore \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fromDate": "2024-01-01",
    "toDate": "2024-01-31"
  }'
```

---

## Still Not Working?

If you've tried all the above and still getting 404:

1. **Check file structure:**
```bash
ls -la src/modules/ingest/
# Should show:
# - ingest.routes.ts
# - ingest.controller.ts
# - ingest.service.ts
# - ingest.validator.ts
```

2. **Verify routes file exists:**
```bash
cat src/routes.ts | grep ingest
# Should show the import and router.use
```

3. **Check dist folder:**
```bash
ls -la dist/modules/ingest/
# Should show compiled .js files
```

4. **Check for runtime errors:**
```bash
# Start server and watch for errors
npm run dev
# Look for any error messages during startup
```

5. **Test with curl verbose:**
```bash
curl -v -X POST http://localhost:3010/api/v1/ingest/instore \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test" \
  -d '{"fromDate": "2024-01-01", "toDate": "2024-01-31"}'
```

Look at the response headers and body carefully.
