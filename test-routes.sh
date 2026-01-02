#!/bin/bash

# Test script for API routes
SERVER="${SERVER:-http://localhost:3010}"

echo "==================================="
echo "API Route Testing Script"
echo "==================================="
echo "Server: $SERVER"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
echo "GET $SERVER/api/v1/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$SERVER/api/v1/health")
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed (200)${NC}"
    curl -s "$SERVER/api/v1/health" | jq . 2>/dev/null || curl -s "$SERVER/api/v1/health"
else
    echo -e "${RED}✗ Health check failed ($RESPONSE)${NC}"
fi
echo ""

# Test 2: Register (without authentication)
echo -e "${YELLOW}Test 2: Register Endpoint${NC}"
echo "POST $SERVER/api/v1/auth/register"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SERVER/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}')
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "409" ]; then
    echo -e "${GREEN}✓ Register endpoint exists ($RESPONSE)${NC}"
else
    echo -e "${RED}✗ Register endpoint issue ($RESPONSE)${NC}"
fi
echo ""

# Test 3: Login OTP
echo -e "${YELLOW}Test 3: Login OTP Endpoint${NC}"
echo "POST $SERVER/api/v1/auth/login-otp"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SERVER/api/v1/auth/login-otp" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}')
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "400" ]; then
    echo -e "${GREEN}✓ Login OTP endpoint exists ($RESPONSE)${NC}"
else
    echo -e "${RED}✗ Login OTP endpoint issue ($RESPONSE)${NC}"
fi
echo ""

# Test 4: Ingest endpoint (should fail with 401 without auth)
echo -e "${YELLOW}Test 4: Ingest Endpoint (without auth)${NC}"
echo "POST $SERVER/api/v1/ingest/instore"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SERVER/api/v1/ingest/instore" \
  -H "Content-Type: application/json" \
  -d '{"fromDate": "2024-01-01", "toDate": "2024-01-31"}')
if [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "403" ]; then
    echo -e "${GREEN}✓ Ingest endpoint exists but requires auth ($RESPONSE)${NC}"
elif [ "$RESPONSE" = "404" ]; then
    echo -e "${RED}✗ Ingest endpoint NOT FOUND ($RESPONSE)${NC}"
    echo "This indicates a routing issue!"
else
    echo -e "${YELLOW}⚠ Ingest endpoint returned unexpected status ($RESPONSE)${NC}"
fi
echo ""

# Test 5: Check route listing
echo -e "${YELLOW}Test 5: All Available Routes${NC}"
echo "Checking server response for common endpoints..."
echo ""

echo "Available auth routes:"
echo "  POST $SERVER/api/v1/auth/register"
echo "  POST $SERVER/api/v1/auth/login-otp"
echo "  POST $SERVER/api/v1/auth/verify-otp"
echo "  POST $SERVER/api/v1/auth/forgot-password"
echo ""

echo "Available ingest routes:"
echo "  POST $SERVER/api/v1/ingest/instore (requires JWT)"
echo ""

echo "Available user routes:"
echo "  GET  $SERVER/api/v1/users/me (requires JWT)"
echo ""

echo "==================================="
echo "Testing Complete"
echo "==================================="
echo ""
echo "If the ingest endpoint returns 404, possible causes:"
echo "1. Server needs to be restarted after code changes"
echo "2. TypeScript compilation errors (check npm run build)"
echo "3. Route registration issue"
echo ""
echo "To debug further:"
echo "1. Check server logs"
echo "2. Run: npm run build"
echo "3. Restart the server"
