#!/bin/bash

# Debug script to check article data
# Usage: ./debug-articles.sh <communityId>

COMMUNITY_ID="${1:-59d9d2a8-85e4-42c0-8061-8cb22813bff4}"
API_URL="${API_URL:-http://localhost:3001}"

echo "Debugging Articles for Community: $COMMUNITY_ID"
echo "================================================"
echo ""

# Check backend logs for article creation
echo "1. Checking if articles exist in database..."
echo "   (You need to run this SQL query in your database):"
echo ""
echo "   SELECT id, title, status, \"communityId\", \"authorId\", \"createdAt\""
echo "   FROM articles"
echo "   WHERE \"communityId\" = '$COMMUNITY_ID'"
echo "   ORDER BY \"createdAt\" DESC;"
echo ""

# Check API response
echo "2. Testing API endpoint..."
if command -v curl &> /dev/null; then
    echo "   GET /communities/$COMMUNITY_ID/articles"
    curl -s "http://localhost:3001/communities/$COMMUNITY_ID/articles" | jq '.' || echo "   (Install jq for formatted output)"
else
    echo "   curl not found, skipping API test"
fi
echo ""

# Check backend logs
echo "3. Check your backend logs for these messages:"
echo "   - 'Fetching articles:' - shows the query parameters"
echo "   - 'Found X articles' - shows how many were returned"
echo "   - 'Creating article:' - shows article creation attempts"
echo "   - 'Article saved successfully:' - confirms article was saved"
echo ""

echo "4. Common issues:"
echo "   - Articles exist but status is 'draft' instead of 'published'"
echo "   - Articles exist but communityId doesn't match"
echo "   - Service hasn't been restarted after code changes"
echo "   - Database columns weren't created (check schema)"
echo ""

echo "5. To check database schema:"
echo "   SELECT column_name, data_type, is_nullable"
echo "   FROM information_schema.columns"
echo "   WHERE table_name = 'articles'"
echo "   ORDER BY ordinal_position;"
