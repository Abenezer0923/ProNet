# Article Schema Fix Instructions

## Problem
The service is failing to start because it's trying to add NOT NULL columns to tables that already have NULL values.

Error: `column "userId" of relation "article_comments" contains null values`

## Solution

We've made the foreign key columns nullable temporarily so the service can start. Follow these steps:

### Step 1: Run the Schema Fix SQL

Connect to your database and run the fix script:

```bash
# If using psql
psql -h <host> -U <user> -d <database> -f fix-article-schema.sql

# Or if you have DATABASE_URL
psql $DATABASE_URL -f fix-article-schema.sql
```

This script will:
1. Add the missing columns as nullable
2. Delete any orphaned records with NULL foreign keys
3. Make the columns NOT NULL
4. Add proper foreign key constraints

### Step 2: Restart the Service

After running the SQL script, restart your user-service:

```bash
# If using Docker
docker-compose restart user-service

# If running locally
cd services/user-service
npm run start:dev
```

### Step 3: Verify

Check that articles are now working:

```bash
# Test article creation
curl -X POST http://localhost:3001/communities/{communityId}/articles \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "content": "This is a test",
    "status": "published"
  }'

# Test article listing
curl http://localhost:3001/communities/{communityId}/articles \
  -H "Authorization: Bearer {your-token}"
```

## Alternative: Clean Slate Approach

If you don't have important article data, you can simply drop and recreate the tables:

```sql
-- WARNING: This will delete all articles, comments, and claps!
DROP TABLE IF EXISTS article_comments CASCADE;
DROP TABLE IF EXISTS article_claps CASCADE;
DROP TABLE IF EXISTS articles CASCADE;

-- Then restart the service and TypeORM will recreate them correctly
```

## What Changed

We temporarily made these columns nullable:
- `articles.communityId`
- `articles.authorId`
- `article_comments.articleId`
- `article_comments.userId`
- `article_claps.articleId`
- `article_claps.userId`

After running the fix script, they will be NOT NULL with proper foreign key constraints.

## Files Modified

- `services/user-service/src/communities/entities/article.entity.ts`
- `services/user-service/src/communities/entities/article-comment.entity.ts`
- `services/user-service/src/communities/entities/article-clap.entity.ts`
- `services/user-service/src/communities/articles.service.ts`

## Next Steps

Once the service is running:
1. Test creating a new article
2. Test viewing articles in a community
3. Test commenting on an article
4. Test clapping for an article

All functionality should now work correctly!
