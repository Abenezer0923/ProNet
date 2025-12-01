# Article Creation Fix

## Problem
Articles were not being saved to the database or displayed after creation. The query log showed that the system was looking for articles with `status = "published"`, but articles weren't being stored properly.

## Root Cause
The Article, ArticleComment, and ArticleClap entities were missing explicit foreign key columns (`communityId`, `authorId`, `articleId`, `userId`). While TypeORM relations were defined, the actual database columns weren't being created, causing save operations to fail silently or not persist the relationships correctly.

## Solution

### 1. Updated Entity Definitions
Added explicit foreign key columns to the following entities:

**Article Entity** (`services/user-service/src/communities/entities/article.entity.ts`):
- Added `communityId: string` column
- Added `authorId: string` column

**ArticleComment Entity** (`services/user-service/src/communities/entities/article-comment.entity.ts`):
- Added `articleId: string` column
- Added `userId: string` column

**ArticleClap Entity** (`services/user-service/src/communities/entities/article-clap.entity.ts`):
- Added `articleId: string` column
- Added `userId: string` column

### 2. Updated Service Methods
Modified the ArticlesService to explicitly set the foreign key values when creating articles, comments, and claps:

**ArticlesService** (`services/user-service/src/communities/articles.service.ts`):
- `create()`: Now sets `communityId` and `authorId` explicitly
- `clap()`: Now sets `articleId` and `userId` explicitly
- `addComment()`: Now sets `articleId` and `userId` explicitly

### 3. Database Migration
Created a SQL migration script at `services/user-service/migrations/add-article-foreign-keys.sql` that:
- Adds the missing columns to existing tables
- Populates them from existing data if available
- Adds proper foreign key constraints

## How to Apply the Fix

### Option 1: Automatic (Recommended for Development)
Since `synchronize: true` is enabled in the TypeORM configuration, simply restart the user-service:

```bash
cd services/user-service
npm run start:dev
```

TypeORM will automatically create the missing columns.

### Option 2: Manual Migration (For Production)
If you need to apply the migration manually without restarting:

```bash
# Connect to your PostgreSQL database
psql -h <host> -U <user> -d <database>

# Run the migration script
\i services/user-service/migrations/add-article-foreign-keys.sql
```

## Testing the Fix

1. **Create a new article**:
   - Navigate to a community you're a member of
   - Click "Create Article"
   - Fill in the title, content, and optionally add a cover image
   - Set status to "published"
   - Click "Publish"

2. **Verify the article is saved**:
   - Check that the article appears in the community's article list
   - Click on the article to view its details
   - Verify the author information is displayed correctly

3. **Test article interactions**:
   - Add a comment to the article
   - Clap for the article
   - Verify counts update correctly

## API Endpoints

The following endpoints are now working correctly:

- `POST /communities/:id/articles` - Create article
- `GET /communities/:id/articles` - List articles
- `GET /communities/articles/:articleId` - Get article details
- `PATCH /communities/articles/:articleId` - Update article
- `DELETE /communities/articles/:articleId` - Delete article
- `POST /communities/articles/:articleId/clap` - Clap for article
- `GET /communities/articles/:articleId/comments` - Get comments
- `POST /communities/articles/:articleId/comments` - Add comment

## Notes

- Articles with `status: 'draft'` will not appear in the public article list
- Only published articles (`status: 'published'`) are shown
- The `publishedAt` timestamp is automatically set when an article is published
- Reading time is calculated automatically based on word count (200 words/minute)
- Slugs are generated automatically from the article title
