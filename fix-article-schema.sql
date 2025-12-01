-- Fix article schema by handling existing NULL values
-- Run this script directly on your database before restarting the service

BEGIN;

-- 1. Add columns as NULLABLE first (if they don't exist)
DO $$ 
BEGIN
    -- Add userId to article_comments if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='article_comments' AND column_name='userId') THEN
        ALTER TABLE article_comments ADD COLUMN "userId" uuid;
    END IF;

    -- Add articleId to article_comments if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='article_comments' AND column_name='articleId') THEN
        ALTER TABLE article_comments ADD COLUMN "articleId" uuid;
    END IF;

    -- Add userId to article_claps if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='article_claps' AND column_name='userId') THEN
        ALTER TABLE article_claps ADD COLUMN "userId" uuid;
    END IF;

    -- Add articleId to article_claps if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='article_claps' AND column_name='articleId') THEN
        ALTER TABLE article_claps ADD COLUMN "articleId" uuid;
    END IF;

    -- Add communityId to articles if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='articles' AND column_name='communityId') THEN
        ALTER TABLE articles ADD COLUMN "communityId" uuid;
    END IF;

    -- Add authorId to articles if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='articles' AND column_name='authorId') THEN
        ALTER TABLE articles ADD COLUMN "authorId" uuid;
    END IF;
END $$;

-- 2. Delete orphaned records that can't be fixed
-- (records where we can't determine the proper foreign key values)
DELETE FROM article_comments WHERE "userId" IS NULL;
DELETE FROM article_claps WHERE "userId" IS NULL;

-- 3. If there are still articles without communityId or authorId, delete them
DELETE FROM articles WHERE "communityId" IS NULL OR "authorId" IS NULL;

-- 4. Now make columns NOT NULL and add constraints
DO $$
BEGIN
    -- article_comments constraints
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='article_comments' AND column_name='userId' 
               AND is_nullable='YES') THEN
        ALTER TABLE article_comments ALTER COLUMN "userId" SET NOT NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='article_comments' AND column_name='articleId' 
               AND is_nullable='YES') THEN
        ALTER TABLE article_comments ALTER COLUMN "articleId" SET NOT NULL;
    END IF;

    -- article_claps constraints
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='article_claps' AND column_name='userId' 
               AND is_nullable='YES') THEN
        ALTER TABLE article_claps ALTER COLUMN "userId" SET NOT NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='article_claps' AND column_name='articleId' 
               AND is_nullable='YES') THEN
        ALTER TABLE article_claps ALTER COLUMN "articleId" SET NOT NULL;
    END IF;

    -- articles constraints
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='articles' AND column_name='communityId' 
               AND is_nullable='YES') THEN
        ALTER TABLE articles ALTER COLUMN "communityId" SET NOT NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='articles' AND column_name='authorId' 
               AND is_nullable='YES') THEN
        ALTER TABLE articles ALTER COLUMN "authorId" SET NOT NULL;
    END IF;
END $$;

-- 5. Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- article_comments foreign keys
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_article_comments_user') THEN
        ALTER TABLE article_comments 
        ADD CONSTRAINT "FK_article_comments_user" 
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_article_comments_article') THEN
        ALTER TABLE article_comments 
        ADD CONSTRAINT "FK_article_comments_article" 
        FOREIGN KEY ("articleId") REFERENCES articles(id) ON DELETE CASCADE;
    END IF;

    -- article_claps foreign keys
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_article_claps_user') THEN
        ALTER TABLE article_claps 
        ADD CONSTRAINT "FK_article_claps_user" 
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_article_claps_article') THEN
        ALTER TABLE article_claps 
        ADD CONSTRAINT "FK_article_claps_article" 
        FOREIGN KEY ("articleId") REFERENCES articles(id) ON DELETE CASCADE;
    END IF;

    -- articles foreign keys
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_articles_community') THEN
        ALTER TABLE articles 
        ADD CONSTRAINT "FK_articles_community" 
        FOREIGN KEY ("communityId") REFERENCES communities(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_articles_author') THEN
        ALTER TABLE articles 
        ADD CONSTRAINT "FK_articles_author" 
        FOREIGN KEY ("authorId") REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

COMMIT;

-- Verify the changes
SELECT 'article_comments columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'article_comments' 
ORDER BY ordinal_position;

SELECT 'article_claps columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'article_claps' 
ORDER BY ordinal_position;

SELECT 'articles columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'articles' 
ORDER BY ordinal_position;
