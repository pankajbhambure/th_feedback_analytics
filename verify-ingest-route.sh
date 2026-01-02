#!/bin/bash

# Verification script for ingest route
SERVER="${SERVER:-http://localhost:3010}"

echo "=========================================="
echo "Ingest Route Verification"
echo "=========================================="
echo ""

# Check if server is running
echo "1. Checking if server is running..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$SERVER/api/v1/health" 2>/dev/null)
if [ "$HEALTH_CHECK" = "200" ]; then
    echo "✓ Server is running at $SERVER"
else
    echo "✗ Server is NOT running or not accessible"
    echo "  Please start the server first: npm start"
    exit 1
fi
echo ""

# Test GET (should fail with 404 - wrong method)
echo "2. Testing GET request (wrong method)..."
GET_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$SERVER/api/v1/ingest/instore" 2>/dev/null)
echo "   Status: $GET_RESPONSE"
if [ "$GET_RESPONSE" = "404" ]; then
    echo "   Expected: 404 (route doesn't accept GET)"
else
    echo "   Note: Got $GET_RESPONSE instead of 404"
fi
echo ""

# Test POST without auth (should fail with 401)
echo "3. Testing POST request without authentication..."
POST_NO_AUTH=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$SERVER/api/v1/ingest/instore" \
  -H "Content-Type: application/json" \
  -d '{"fromDate": "2024-01-01", "toDate": "2024-01-31"}' 2>/dev/null)
HTTP_CODE=$(echo "$POST_NO_AUTH" | grep "HTTP_CODE:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$POST_NO_AUTH" | grep -v "HTTP_CODE:")

echo "   Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "   ✓ Route exists! Authentication required (as expected)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ✗ Route NOT FOUND!"
    echo "   This means the route is not registered."
    echo ""
    echo "   Troubleshooting steps:"
    echo "   1. Rebuild: npm run build"
    echo "   2. Restart the server"
    echo "   3. Check for errors in server logs"
else
    echo "   Got status: $HTTP_CODE"
    echo "   Response: $RESPONSE_BODY"
fi
echo ""

# Test POST with invalid data (should fail with 400)
echo "4. Testing POST request with invalid data..."
POST_INVALID=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$SERVER/api/v1/ingest/instore" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-token" \
  -d '{}' 2>/dev/null)
HTTP_CODE=$(echo "$POST_INVALID" | grep "HTTP_CODE:" | cut -d: -f2)
echo "   Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "400" ]; then
    echo "   ✓ Validation working correctly"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "   ✓ Route exists (auth checked before validation)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ✗ Route NOT FOUND!"
fi
echo ""

echo "=========================================="
echo "Summary"
echo "=========================================="
if [ "$HTTP_CODE" = "404" ]; then
    echo "❌ Route is NOT registered"
    echo ""
    echo "Fix this by:"
    echo "  1. npm run build"
    echo "  2. Restart your server"
    echo "  3. Run this script again"
else
    echo "✅ Route is correctly registered!"
    echo ""
    echo "To use the endpoint:"
    echo "  1. Get a JWT token by logging in"
    echo "  2. Make a POST request with the token:"
    echo ""
    echo "     curl -X POST $SERVER/api/v1/ingest/instore \\"
    echo "       -H \"Content-Type: application/json\" \\"
    echo "       -H \"Authorization: Bearer YOUR_JWT_TOKEN\" \\"
    echo "       -d '{
    echo "         \"fromDate\": \"2024-01-01\","
    echo "         \"toDate\": \"2024-01-31\""
    echo "       }'"
fi
echo ""
