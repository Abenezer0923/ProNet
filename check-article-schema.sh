#!/bin/bash

# Script to check if article tables have the correct schema
# Usage: ./check-article-schema.sh

DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_USER="${DATABASE_USER:-postgres}"
DB_NAME="${DATABASE_NAME:-profession_db}"

echo "Checking Article Schema"
echo "======================="
echo "Database: $DB_NAME"
echo ""

# Check articles table columns
echo "1. Articles table columns:"
PGPASSWORD="${DATABASE_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'articles'
ORDER BY ordinal_position;
"

echo ""
echo "2. Article Comments table columns:"
PGPASSWORD="${DATABASE_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'article_comments'
ORDER BY ordinal_position;
"

echo ""
echo "3. Article Claps table columns:"
PGPASSWORD="${DATABASE_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'article_claps'
ORDER BY ordinal_position;
"

echo ""
echo "4. Count of articles in database:"
PGPASSWORD="${DATABASE_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT status, COUNT(*) as count
FROM articles
GROUP BY status;
"

echo ""
echo "5. Sample of recent articles:"
PGPASSWORD="${DATABASE_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT id, title, status, \"communityId\", \"authorId\", \"createdAt\"
FROM articles
ORDER BY \"createdAt\" DESC
LIMIT 5;
"
