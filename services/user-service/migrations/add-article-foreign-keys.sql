-- Migration to add foreign key columns to article-related tables
-- This migration adds communityId and authorId columns to articles table
-- and articleId/userId columns to article_comments and article_claps tables

-- Add columns to articles table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='articles' AND column_name='communityId') THEN
        ALTER TABLE articles ADD COLUMN "communityId" uuid;
        
        -- Populate communityId from existing community relation
        UPDATE articles a
        SET "communityId" = c.id
        FROM communities c
        WHERE a."communityId" IS NULL;
        
        -- Make it NOT NULL after populating
        ALTER TABLE articles ALTER COLUMN "communityId" SET NOT NULL;
        
        -- Add foreign key constraint
        ALTER TABLE articles ADD CONSTRAINT "FK_articles_community" 
            FOREIGN KEY ("communityId") REFERENCES communities(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='articles' AND column_name='authorId') THEN
        ALTER TABLE articles ADD COLUMN "authorId" uuid;
        
        -- Populate authorId from existing author relation
        UPDATE articles a
        SET "authorId" = u.id
        FROM users u
        WHERE a."authorId" IS NULL;
        
        -- Make it NOT NULL after populating
        ALTER TABLE articles ALTER COLUMN "authorId" SET NOT NULL;
        
        -- Add foreign key constraint
        ALTER TABLE articles ADD CONSTRAINT "FK_articles_author" 
            FOREIGN KEY ("authorId") REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add columns to article_comments table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='article_comments' AND column_name='articleId') THEN
        ALTER TABLE article_comments ADD COLUMN "articleId" uuid;
        
        -- Populate from existing relation if possible
        UPDATE article_comments ac
        SET "articleId" = a.id
        FROM articles a
        WHERE ac."articleId" IS NULL;
        
        ALTER TABLE article_comments ALTER COLUMN "articleId" SET NOT NULL;
        ALTER TABLE article_comments ADD CONSTRAINT "FK_article_comments_article" 
            FOREIGN KEY ("articleId") REFERENCES articles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='article_comments' AND column_name='userId') THEN
        ALTER TABLE article_comments ADD COLUMN "userId" uuid;
        
        -- Populate from existing relation if possible
        UPDATE article_comments ac
        SET "userId" = u.id
        FROM users u
        WHERE ac."userId" IS NULL;
        
        ALTER TABLE article_comments ALTER COLUMN "userId" SET NOT NULL;
        ALTER TABLE article_comments ADD CONSTRAINT "FK_article_comments_user" 
            FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add columns to article_claps table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='article_claps' AND column_name='articleId') THEN
        ALTER TABLE article_claps ADD COLUMN "articleId" uuid;
        
        -- Populate from existing relation if possible
        UPDATE article_claps ac
        SET "articleId" = a.id
        FROM articles a
        WHERE ac."articleId" IS NULL;
        
        ALTER TABLE article_claps ALTER COLUMN "articleId" SET NOT NULL;
        ALTER TABLE article_claps ADD CONSTRAINT "FK_article_claps_article" 
            FOREIGN KEY ("articleId") REFERENCES articles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='article_claps' AND column_name='userId') THEN
        ALTER TABLE article_claps ADD COLUMN "userId" uuid;
        
        -- Populate from existing relation if possible
        UPDATE article_claps ac
        SET "userId" = u.id
        FROM users u
        WHERE ac."userId" IS NULL;
        
        ALTER TABLE article_claps ALTER COLUMN "userId" SET NOT NULL;
        ALTER TABLE article_claps ADD CONSTRAINT "FK_article_claps_user" 
            FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;
