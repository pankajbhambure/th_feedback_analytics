#!/bin/bash

BASE_URL="http://localhost:3000"
API_BASE="${BASE_URL}/api/v1"

echo "=== Testing Famepilot Ingestion Route ==="
echo ""

# First, check if server is responding
echo "1. Checking server health..."
curl -s "${API_BASE}/health" | jq '.' || echo "Health check failed"
echo ""

# Test the route without auth (should fail)
echo "2. Testing /ingest/famepilot without auth (should fail)..."
curl -s -X POST "${API_BASE}/ingest/famepilot" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }' | jq '.' || echo "Request failed"
echo ""

# Instructions for authenticated test
echo "3. To test with authentication, first login:"
echo "   curl -X POST ${API_BASE}/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"your-email\",\"password\":\"your-password\"}'"
echo ""
echo "   Then use the token:"
echo "   curl -X POST ${API_BASE}/ingest/famepilot -H 'Authorization: Bearer YOUR_TOKEN' -H 'Content-Type: application/json' -d '{\"startDate\":\"2024-01-01\",\"endDate\":\"2024-01-31\"}'"
