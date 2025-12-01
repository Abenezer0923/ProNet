# CRITICAL: You Must Restart the User Service!

## The Problem
The query log you're seeing is from the OLD code that's still running. The new QueryBuilder code has been written but isn't being used because the service hasn't been restarted.

## How to Restart

### Option 1: Using Docker Compose (Most Common)
```bash
# Stop and restart the user-service container
docker-compose restart user-service

# Or rebuild and restart
docker-compose up -d --build user-service

# Check the logs to confirm it restarted
docker-compose logs -f user-service
```

### Option 2: Running Locally with npm
```bash
# Navigate to the service directory
cd services/user-service

# Stop the current process (press Ctrl+C in the terminal where it's running)

# Rebuild the TypeScript
npm run build

# Start the service again
npm run start:dev
```

### Option 3: Using PM2
```bash
pm2 restart user-service

# Or
pm2 restart all
```

### Option 4: Using systemd
```bash
sudo systemctl restart user-service
```

## How to Verify the Restart Worked

After restarting, you should see in the logs:
1. "Creating article:" log messages (from our new logging)
2. "Fetching articles:" log messages (from our new logging)
3. "Found X articles" log messages

The SQL query should change from:
```sql
WHERE (((("Article__Article_community"."id" = $1)))
```

To:
```sql
WHERE article.communityId = $1 AND article.status = $2
```

## Test After Restart

1. Try creating a new article
2. Check the backend logs for "Creating article:" message
3. Check if the article appears in the list
4. Look at the SQL query in the logs - it should be simpler now

## If Still Not Working

If you've restarted and it's still not working, run:

```bash
# Check if the database columns exist
./check-article-schema.sh

# Or manually check
docker-compose exec postgres psql -U postgres -d profession_db -c "\d articles"
```

You should see `communityId` and `authorId` columns in the articles table.
