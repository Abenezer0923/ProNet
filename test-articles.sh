#!/bin/bash

# Test script for article creation and retrieval
# Usage: ./test-articles.sh

API_URL="${API_URL:-http://localhost:3001}"
TOKEN="${TOKEN:-your-jwt-token-here}"
COMMUNITY_ID="${COMMUNITY_ID:-your-community-id-here}"

echo "Testing Article Endpoints"
echo "========================="
echo "API URL: $API_URL"
echo ""

# Test 1: Create an article
echo "1. Creating a new article..."
ARTICLE_RESPONSE=$(curl -s -X POST "$API_URL/communities/$COMMUNITY_ID/articles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "content": "This is a test article to verify the article creation functionality is working correctly. It should be saved to the database with all the proper foreign key relationships.",
    "status": "published",
    "excerpt": "A test article",
    "tags": ["test", "article"]
  }')

echo "$ARTICLE_RESPONSE" | jq '.'
ARTICLE_ID=$(echo "$ARTICLE_RESPONSE" | jq -r '.id')
echo "Article ID: $ARTICLE_ID"
echo ""

# Test 2: Get all articles for the community
echo "2. Fetching all articles for community..."
curl -s -X GET "$API_URL/communities/$COMMUNITY_ID/articles" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 3: Get specific article
if [ "$ARTICLE_ID" != "null" ] && [ -n "$ARTICLE_ID" ]; then
  echo "3. Fetching specific article..."
  curl -s -X GET "$API_URL/communities/articles/$ARTICLE_ID" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  echo ""

  # Test 4: Clap for article
  echo "4. Clapping for article..."
  curl -s -X POST "$API_URL/communities/articles/$ARTICLE_ID/clap" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  echo ""

  # Test 5: Add comment
  echo "5. Adding comment to article..."
  curl -s -X POST "$API_URL/communities/articles/$ARTICLE_ID/comments" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"content": "Great article!"}' | jq '.'
  echo ""

  # Test 6: Get comments
  echo "6. Fetching article comments..."
  curl -s -X GET "$API_URL/communities/articles/$ARTICLE_ID/comments" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  echo ""
fi

echo "Testing complete!"
