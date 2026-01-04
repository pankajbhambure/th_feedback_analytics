#!/bin/bash

# Test script for Famepilot processing endpoint

BASE_URL="http://localhost:3010"
TOKEN="your-jwt-token-here"

echo "Testing Famepilot processing endpoint..."
echo ""

# Test with sample date range
curl -X POST "$BASE_URL/api/v1/process/feedback-raw/famepilot" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "startDate": "2025-12-01",
    "endDate": "2025-12-06",
    "batchSize": 100
  }' | jq '.'

echo ""
echo "Check logs directory for skip logs:"
echo "ls -lh logs/famepilot_*.log"
