#!/bin/bash

# Test Community API Endpoints
# Usage: ./test-community-api.sh <JWT_TOKEN>

TOKEN=$1
API_URL="http://localhost:3000"

if [ -z "$TOKEN" ]; then
  echo "Usage: ./test-community-api.sh <JWT_TOKEN>"
  exit 1
fi

echo "🧪 Testing Community API Endpoints..."
echo "======================================"

# Test 1: Get all communities
echo ""
echo "1️⃣ Testing GET /communities"
curl -s -X GET "$API_URL/communities" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Test 2: Create a community
echo ""
echo "2️⃣ Testing POST /communities"
COMMUNITY_RESPONSE=$(curl -s -X POST "$API_URL/communities" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Community",
    "description": "A test community for API testing",
    "privacy": "public",
    "category": "Technology"
  }')

echo "$COMMUNITY_RESPONSE" | jq '.'
COMMUNITY_ID=$(echo "$COMMUNITY_RESPONSE" | jq -r '.id')

if [ "$COMMUNITY_ID" != "null" ] && [ -n "$COMMUNITY_ID" ]; then
  echo "✅ Community created with ID: $COMMUNITY_ID"
  
  # Test 3: Get community details
  echo ""
  echo "3️⃣ Testing GET /communities/$COMMUNITY_ID"
  curl -s -X GET "$API_URL/communities/$COMMUNITY_ID" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  
  # Test 4: Create a group
  echo ""
  echo "4️⃣ Testing POST /communities/$COMMUNITY_ID/groups"
  GROUP_RESPONSE=$(curl -s -X POST "$API_URL/communities/$COMMUNITY_ID/groups" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "General Chat",
      "description": "General discussion",
      "type": "chat",
      "category": "General",
      "privacy": "public"
    }')
  
  echo "$GROUP_RESPONSE" | jq '.'
  GROUP_ID=$(echo "$GROUP_RESPONSE" | jq -r '.id')
  
  if [ "$GROUP_ID" != "null" ] && [ -n "$GROUP_ID" ]; then
    echo "✅ Group created with ID: $GROUP_ID"
    
    # Test 5: Send a message
    echo ""
    echo "5️⃣ Testing POST /communities/groups/$GROUP_ID/messages"
    MESSAGE_RESPONSE=$(curl -s -X POST "$API_URL/communities/groups/$GROUP_ID/messages" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "content": "Hello, this is a test message!"
      }')
    
    echo "$MESSAGE_RESPONSE" | jq '.'
    
    # Test 6: Get messages
    echo ""
    echo "6️⃣ Testing GET /communities/groups/$GROUP_ID/messages"
    curl -s -X GET "$API_URL/communities/groups/$GROUP_ID/messages" \
      -H "Authorization: Bearer $TOKEN" | jq '.'
    
  else
    echo "❌ Failed to create group"
  fi
  
  # Test 7: Get groups
  echo ""
  echo "7️⃣ Testing GET /communities/$COMMUNITY_ID/groups"
  curl -s -X GET "$API_URL/communities/$COMMUNITY_ID/groups" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  
else
  echo "❌ Failed to create community"
fi

echo ""
echo "======================================"
echo "✅ API Testing Complete!"
