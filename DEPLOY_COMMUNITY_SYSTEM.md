# Deploy Community System

## Overview

This guide covers deploying the Community System with all its features including Groups, Articles, Events, and real-time messaging.

## Prerequisites

- PostgreSQL database
- Node.js 18+ installed
- Environment variables configured
- Redis (for future real-time features)

## Database Migration

The new entities will be automatically created by TypeORM synchronize feature. In production, you should use migrations.

### New Tables Created

```sql
-- Core Community Tables
communities
community_members

-- Groups System
groups
group_messages

-- Articles System
articles
article_claps
article_comments

-- Events System
community_events
event_attendees
```

### Manual Migration (if needed)

If you need to run migrations manually:

```bash
cd services/user-service
npm run migration:generate -- -n CommunitySystem
npm run migration:run
```

## Backend Deployment

### 1. Install Dependencies

```bash
cd services/user-service
npm install
```

### 2. Environment Variables

Ensure these are set in `services/user-service/.env`:

```env
# Database
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_USER=your-db-user
DATABASE_PASSWORD=your-db-password
DATABASE_NAME=your-db-name

# JWT
JWT_SECRET=your-jwt-secret

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Redis (for future features)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Build and Start

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 4. Verify Backend

Test the endpoints:

```bash
# Health check
curl http://localhost:3001/health

# Get communities
curl http://localhost:3001/communities

# Create community (requires auth)
curl -X POST http://localhost:3001/communities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Community",
    "description": "A test community",
    "privacy": "public"
  }'
```

## Frontend Deployment

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Update `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

For production (`frontend/.env.production`):

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_WS_URL=wss://your-api-domain.com
```

### 3. Build and Deploy

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Or deploy to Vercel
vercel --prod
```

## API Gateway Configuration

Update `services/api-gateway/src/proxy/proxy.service.ts` to include community routes:

```typescript
// Already configured - no changes needed
// Routes are proxied through /communities/*
```

## Testing the Deployment

### 1. Create a Community

1. Log in to the application
2. Navigate to `/communities`
3. Click "Create Community"
4. Fill in the details and submit

### 2. Test Groups

1. Open your community
2. Click on "Groups" tab
3. Create a new group
4. Send a message in the group

### 3. Test Member Management

1. Go to community settings
2. Navigate to "Members" tab
3. Update member roles
4. Remove a member (if needed)

## Monitoring

### Database Queries

Monitor slow queries:

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Application Logs

```bash
# Backend logs
cd services/user-service
npm run start:prod 2>&1 | tee logs/app.log

# Check for errors
tail -f logs/app.log | grep ERROR
```

## Performance Optimization

### 1. Database Indexes

Already created in entities, but verify:

```sql
-- Check existing indexes
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('communities', 'groups', 'group_messages', 'articles')
ORDER BY tablename, indexname;
```

### 2. Caching (Future)

When implementing Redis caching:

```typescript
// Cache community details
await redis.set(`community:${id}`, JSON.stringify(community), 'EX', 3600);

// Cache group messages
await redis.set(`group:${id}:messages`, JSON.stringify(messages), 'EX', 60);
```

### 3. CDN for Media

Ensure Cloudinary is configured for:
- Community cover images
- Community logos
- Article cover images
- Message attachments
- Event cover images

## Security Checklist

- ✅ JWT authentication on all protected routes
- ✅ Role-based access control (RBAC)
- ✅ Input validation with class-validator
- ✅ SQL injection prevention (TypeORM parameterized queries)
- ✅ XSS prevention (React escapes by default)
- ✅ CORS configured properly
- ⏳ Rate limiting (implement with @nestjs/throttler)
- ⏳ Content moderation
- ⏳ Spam detection

## Rollback Plan

If issues occur:

### 1. Database Rollback

```bash
# Revert to previous migration
npm run migration:revert
```

### 2. Code Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or checkout previous version
git checkout <previous-commit-hash>
```

### 3. Frontend Rollback

```bash
# Vercel
vercel rollback

# Or redeploy previous version
git checkout <previous-commit-hash>
vercel --prod
```

## Troubleshooting

### Issue: Communities not loading

**Check:**
1. Database connection
2. TypeORM entities registered in app.module.ts
3. API endpoint accessible
4. CORS configuration

```bash
# Test database connection
psql -h $DATABASE_HOST -U $DATABASE_USER -d $DATABASE_NAME -c "SELECT 1"

# Test API endpoint
curl http://localhost:3001/communities
```

### Issue: Messages not sending

**Check:**
1. Group exists and user is a member
2. User has permission to send messages
3. Message content is not empty
4. Database constraints

```bash
# Check group membership
curl http://localhost:3001/communities/:id/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Issue: Images not uploading

**Check:**
1. Cloudinary credentials
2. File size limits
3. File type restrictions
4. Network connectivity

```bash
# Test Cloudinary connection
curl -X POST https://api.cloudinary.com/v1_1/$CLOUD_NAME/image/upload \
  -F "file=@test.jpg" \
  -F "upload_preset=YOUR_PRESET"
```

## Next Steps

After successful deployment:

1. ✅ Monitor application logs
2. ✅ Check database performance
3. ✅ Test all features manually
4. ✅ Set up automated backups
5. ⏳ Implement real-time features (WebSocket)
6. ⏳ Add analytics tracking
7. ⏳ Set up monitoring (Sentry, DataDog)
8. ⏳ Configure auto-scaling

## Support

For issues or questions:
- Check logs: `services/user-service/logs/`
- Review documentation: `COMMUNITY_SYSTEM_ARCHITECTURE.md`
- Check implementation status: `COMMUNITY_IMPLEMENTATION_STATUS.md`

---

**Deployment Date**: November 19, 2025
**Version**: 1.0.0 - Community System MVP
