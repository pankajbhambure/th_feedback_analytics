# Quick Fix: Ingest Route Not Found

## TL;DR

The route `/api/v1/ingest/instore` **IS** properly configured in the code. If you're getting a 404, you need to:

```bash
# 1. Rebuild the application
npm run build

# 2. Restart the server
npm start

# 3. Test the route
./verify-ingest-route.sh
```

---

## The Route Setup (Verified ✓)

The route is correctly configured:

**Path:** `/api/v1/ingest/instore`
**Method:** `POST` (not GET!)
**Authentication:** Required (JWT token)

The code structure is:
```
app.ts          → /api/v1
  └─ routes.ts  → /ingest
      └─ ingest.routes.ts → /instore (POST)
```

---

## Why You're Getting 404

**Most likely cause:** The server is running old compiled code.

After we updated the code to support API_KEY authentication, the TypeScript files were recompiled, but if your server was already running, it's still using the old JavaScript files.

**Solution:** Restart the server to load the new compiled code.

---

## Step-by-Step Fix

### 1. Stop the Current Server

If your server is running:
- Press `Ctrl+C` in the terminal
- Or if using PM2: `pm2 stop your-app-name`

### 2. Rebuild the Application

```bash
npm run build
```

You should see no errors. This compiles TypeScript to JavaScript in the `dist/` folder.

### 3. Restart the Server

```bash
# For production
npm start

# For development (with auto-reload)
npm run dev
```

### 4. Verify the Route Works

```bash
# Run the verification script
./verify-ingest-route.sh
```

You should see:
- ✓ Server is running
- ✓ Route exists (401 unauthorized without token)

If you still see 404, see "Advanced Troubleshooting" below.

---

## Testing the Endpoint

Once the route is working (returns 401 instead of 404), here's how to use it:

### Step 1: Get a JWT Token

```bash
# Request OTP
curl -X POST http://localhost:3010/api/v1/auth/login-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'

# Check your email or database for the OTP

# Verify OTP and get token
curl -X POST http://localhost:3010/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "otp": "123456",
    "purpose": "login"
  }'
```

Save the `token` from the response.

### Step 2: Call the Ingest Endpoint

```bash
curl -X POST http://localhost:3010/api/v1/ingest/instore \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
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
    "inserted": 150,
    "skipped": 5
  }
}
```

---

## Common Mistakes

### ❌ Using GET instead of POST
```bash
# Wrong
curl http://localhost:3010/api/v1/ingest/instore
```

### ✅ Using POST
```bash
# Correct
curl -X POST http://localhost:3010/api/v1/ingest/instore \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"fromDate": "2024-01-01", "toDate": "2024-01-31"}'
```

### ❌ Forgetting Authentication
```bash
# Wrong - missing Authorization header
curl -X POST http://localhost:3010/api/v1/ingest/instore \
  -H "Content-Type: application/json" \
  -d '{"fromDate": "2024-01-01", "toDate": "2024-01-31"}'
```

### ✅ Including Authentication
```bash
# Correct
curl -X POST http://localhost:3010/api/v1/ingest/instore \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"fromDate": "2024-01-01", "toDate": "2024-01-31"}'
```

---

## Advanced Troubleshooting

If you've restarted the server and still getting 404:

### Check 1: Verify Compiled Files Exist

```bash
ls dist/modules/ingest/
```

Should show:
- ingest.routes.js
- ingest.controller.js
- ingest.service.js
- ingest.validator.js

If missing, run `npm run build` again.

### Check 2: Check Server Logs

When starting the server, look for:
- "Server is running on port 3010"
- No error messages about routes or modules

### Check 3: Verify Port

Make sure you're using the correct port:
```bash
cat .env | grep PORT
```

Use that port in your curl commands.

### Check 4: Test Other Routes

```bash
# Health check should work
curl http://localhost:3010/api/v1/health

# Auth endpoints should work
curl -X POST http://localhost:3010/api/v1/auth/login-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

If these also return 404, there's a server configuration issue.

---

## Expected Status Codes

| Status | Meaning | What to do |
|--------|---------|------------|
| 404 | Route not found | Restart server after `npm run build` |
| 401 | Unauthorized | Route works! Provide valid JWT token |
| 400 | Bad request | Route works! Fix request data |
| 200 | Success | Everything working! |

---

## Files Modified for API_KEY Support

These files were updated to support API_KEY authentication:
- `src/models/channel.model.ts` - Added API_KEY enum
- `src/seeders/20231230000002-seed-channels.ts` - Changed instore to use API_KEY
- `src/modules/ingest/ingest.service.ts` - Added API_KEY handling
- `src/migrations/20231230000017-add-api-key-auth-type.ts` - Database migration

All these changes have been compiled and are ready to use after restarting the server.

---

## Still Need Help?

Run these diagnostic scripts:

```bash
# Full route testing
./test-routes.sh

# Ingest-specific verification
./verify-ingest-route.sh
```

Check the detailed troubleshooting guide:
```bash
cat ROUTE_TROUBLESHOOTING.md
```
