# Article Display Troubleshooting Guide

## Issue: Articles not displaying in UI

### Step 1: Verify Service is Running with Latest Code

```bash
# Check if service is running
docker-compose ps user-service
# OR
ps aux | grep "nest start"

# Restart the service to load latest code
docker-compose restart user-service
# OR
cd services/user-service && npm run start:dev
```

### Step 2: Check Backend Logs

Look for these log messages when you visit the articles tab:

```
Fetching articles: { communityId: '...', status: 'published', page: 1, limit: 10 }
Found X articles
```

If you see `Found 0 articles`, the articles either don't exist or don't match the query.

### Step 3: Check Database

Run these SQL queries in your database:

```sql
-- Check if articles table has the new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'articles'
ORDER BY ordinal_position;

-- Check if any articles exist
SELECT COUNT(*) as total_articles FROM articles;

-- Check articles for your community
SELECT id, title, status, "communityId", "authorId", "createdAt"
FROM articles
WHERE "communityId" = 'YOUR_COMMUNITY_ID_HERE'
ORDER BY "createdAt" DESC;

-- Check article status distribution
SELECT status, COUNT(*) as count
FROM articles
GROUP BY status;
```

### Step 4: Create a Test Article

Try creating an article via the API:

```bash
# Replace with your actual values
COMMUNITY_ID="your-community-id"
TOKEN="your-jwt-token"

curl -X POST "http://localhost:3001/communities/$COMMUNITY_ID/articles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "content": "This is a test article to verify the system is working. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "status": "published",
    "excerpt": "A test article",
    "tags": ["test"]
  }'
```

Check the backend logs for:
```
Creating article: { communityId: '...', userId: '...', dto: {...} }
Community found: ...
Article entity created, saving to database...
Article saved successfully: ...
```

### Step 5: Verify Article Retrieval

```bash
# List articles for the community
curl "http://localhost:3001/communities/$COMMUNITY_ID/articles" \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
[
  {
    "id": "...",
    "title": "Test Article",
    "content": "...",
    "status": "published",
    "communityId": "...",
    "authorId": "...",
    "author": {
      "id": "...",
      "firstName": "...",
      "lastName": "..."
    },
    "createdAt": "...",
    ...
  }
]
```

### Step 6: Check Frontend Console

Open browser DevTools (F12) and check:

1. **Network Tab**: Look for the request to `/communities/{id}/articles`
   - Status should be 200
   - Response should contain article array

2. **Console Tab**: Look for:
   - `Error fetching articles:` - indicates API error
   - Any other errors related to articles

### Common Issues and Solutions

#### Issue: "Found 0 articles" but articles exist in database

**Cause**: Articles have wrong status or communityId

**Solution**:
```sql
-- Update article status to published
UPDATE articles 
SET status = 'published' 
WHERE status = 'draft';

-- Check communityId matches
SELECT "communityId", COUNT(*) 
FROM articles 
GROUP BY "communityId";
```

#### Issue: Service won't start - "column contains null values"

**Cause**: Existing data has NULL foreign keys

**Solution**: Run the fix script:
```bash
psql -h <host> -U <user> -d <database> -f fix-article-schema.sql
```

#### Issue: Articles created but not saved

**Cause**: Missing communityId or authorId columns

**Solution**: 
1. Run `fix-article-schema.sql`
2. Restart service
3. Try creating article again

#### Issue: Frontend shows "No articles yet" but API returns data

**Cause**: Frontend state not updating

**Solution**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check if `fetchArticles()` is being called when tab changes

### Debug Checklist

- [ ] Service restarted after code changes
- [ ] Database has `communityId` and `authorId` columns in articles table
- [ ] Articles exist in database with `status='published'`
- [ ] Articles have correct `communityId` matching the community you're viewing
- [ ] API endpoint returns articles (test with curl)
- [ ] Frontend makes request to correct endpoint
- [ ] Frontend receives 200 response with article data
- [ ] Browser console shows no errors
- [ ] User is viewing the "Articles" tab in the community

### Still Not Working?

1. Check the exact SQL query in the logs - it should use `article.communityId = :communityId`
2. Verify the communityId in the URL matches the communityId in the database
3. Try creating a brand new article and immediately check if it appears
4. Check if there are any CORS or authentication issues in the browser console

### Quick Test Script

```bash
#!/bin/bash
# Save as test-article-flow.sh

COMMUNITY_ID="your-community-id"
TOKEN="your-token"
API_URL="http://localhost:3001"

echo "1. Creating article..."
RESPONSE=$(curl -s -X POST "$API_URL/communities/$COMMUNITY_ID/articles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content","status":"published"}')

echo "$RESPONSE"
ARTICLE_ID=$(echo "$RESPONSE" | jq -r '.id')

echo ""
echo "2. Fetching articles..."
curl -s "$API_URL/communities/$COMMUNITY_ID/articles" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo ""
echo "3. Check if article appears in list above"
```
