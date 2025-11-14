# Search & Discovery Testing Guide

## Overview
This guide helps you test the new Search & Discovery features in ProNet.

## Features to Test

### 1. Global Search
**Location**: `/search` or use the search bar in the dashboard header

**Test Cases**:
- Search for users by name
- Search for communities by name
- Search for posts by content
- Use type filters (All, Users, Communities, Posts)
- Test empty search results
- Test special characters in search

**Expected Behavior**:
- Results appear as you type (debounced)
- Autocomplete suggestions show in dropdown
- Results are categorized by type
- Clicking a result navigates to the detail page

### 2. User Search
**Endpoint**: `GET /search/users?q=query&skills=skill1&location=city`

**Test Cases**:
```bash
# Search by name
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/search/users?q=john"

# Search by location
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/search/users?location=New%20York"

# Search by skills
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/search/users?skills=JavaScript,React"
```

**Expected Results**:
- Users matching the criteria
- Profile pictures displayed
- Skills shown as tags
- Location displayed

### 3. Community Search
**Endpoint**: `GET /search/communities?q=query&category=tech`

**Test Cases**:
```bash
# Search by name
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/search/communities?q=developers"

# Filter by category
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/search/communities?category=Technology"

# Filter by minimum members
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/search/communities?minMembers=10"
```

**Expected Results**:
- Only public communities shown
- Cover images displayed
- Member count shown
- Category displayed

### 4. Post Search
**Endpoint**: `GET /search/posts?q=query&authorId=1&communityId=1`

**Test Cases**:
```bash
# Search by content
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/search/posts?q=javascript"

# Filter by author
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/search/posts?authorId=1"

# Filter by community
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/search/posts?communityId=1"

# Filter by date range
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/search/posts?dateFrom=2024-01-01&dateTo=2024-12-31"
```

**Expected Results**:
- Posts with matching content
- Author info displayed
- Community name shown (if applicable)
- Like and comment counts

### 5. Autocomplete Suggestions
**Endpoint**: `GET /search/suggestions?q=query`

**Test Cases**:
```bash
# Get suggestions
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/search/suggestions?q=jo"
```

**Expected Results**:
- Top 5 users matching the query
- Top 5 communities matching the query
- Results start with the query string

### 6. Recommendations
**Location**: `/discover` page

**Test Cases**:

#### Recommended Users
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/search/recommendations/users?limit=10"
```

**Expected Results**:
- Users from same location (prioritized)
- Users with similar skills
- Excludes already connected users
- Excludes current user

#### Recommended Communities
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/search/recommendations/communities?limit=10"
```

**Expected Results**:
- Public communities only
- Excludes communities user already joined
- Sorted by creation date (newest first)

## UI Testing Checklist

### Search Page (`/search`)
- [ ] Search bar is visible and functional
- [ ] Type filters work (All, Users, Communities, Posts)
- [ ] Autocomplete dropdown appears after 2 characters
- [ ] Clicking suggestion navigates correctly
- [ ] Results load with proper formatting
- [ ] Profile pictures/cover images display
- [ ] Loading spinner shows during search
- [ ] Empty state shows when no results
- [ ] Pagination works (if implemented)

### Discover Page (`/discover`)
- [ ] "People You May Know" section loads
- [ ] "Communities for You" section loads
- [ ] User cards display correctly
- [ ] Community cards display correctly
- [ ] "See all" links work
- [ ] Clicking cards navigates to detail pages
- [ ] Loading state shows initially
- [ ] Empty state shows if no recommendations

### Dashboard Search Bar
- [ ] Search bar visible in header
- [ ] Submitting search navigates to `/search`
- [ ] Query parameter passed correctly
- [ ] Works on all authenticated pages

## Performance Testing

### Search Response Times
- Global search: < 500ms
- User search: < 300ms
- Community search: < 300ms
- Post search: < 400ms
- Suggestions: < 200ms
- Recommendations: < 500ms

### Load Testing
```bash
# Test with multiple concurrent searches
for i in {1..10}; do
  curl -H "Authorization: Bearer YOUR_TOKEN" \
    "http://localhost:3001/search/global?q=test" &
done
wait
```

## Edge Cases to Test

1. **Empty Search Query**
   - Should show no results or prompt to enter query

2. **Very Long Search Query**
   - Should handle gracefully (truncate or limit)

3. **Special Characters**
   - Test: `@#$%^&*()`
   - Should escape properly

4. **SQL Injection Attempts**
   - Test: `'; DROP TABLE users; --`
   - Should be sanitized by TypeORM

5. **Large Result Sets**
   - Search for common terms
   - Should paginate properly

6. **No Results**
   - Search for gibberish: `xyzabc123`
   - Should show empty state

7. **Slow Network**
   - Throttle network in DevTools
   - Should show loading state

## Database Optimization

### Check Query Performance
```sql
-- Explain user search query
EXPLAIN ANALYZE
SELECT * FROM "user"
WHERE LOWER("firstName") LIKE LOWER('%john%')
   OR LOWER("lastName") LIKE LOWER('%john%')
LIMIT 20;

-- Check if indexes exist
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('user', 'community', 'post');
```

### Recommended Indexes
```sql
-- Add indexes for better search performance
CREATE INDEX idx_user_firstname_lower ON "user" (LOWER("firstName"));
CREATE INDEX idx_user_lastname_lower ON "user" (LOWER("lastName"));
CREATE INDEX idx_user_location_lower ON "user" (LOWER("location"));
CREATE INDEX idx_community_name_lower ON "community" (LOWER("name"));
CREATE INDEX idx_post_content_lower ON "post" (LOWER("content"));
CREATE INDEX idx_post_created_at ON "post" ("createdAt" DESC);
```

## Common Issues & Solutions

### Issue: Autocomplete not showing
**Solution**: Check that query length >= 2 characters

### Issue: Search results not updating
**Solution**: Check debounce timing (300ms default)

### Issue: Recommendations empty
**Solution**: 
- Ensure user has location/skills set
- Create more test users/communities
- Check that user has connections

### Issue: Search slow
**Solution**:
- Add database indexes
- Implement caching
- Reduce result limit

### Issue: Images not loading
**Solution**:
- Check Cloudinary configuration
- Verify image URLs are valid
- Check CORS settings

## Next Steps

After testing, consider implementing:
1. **Full-Text Search**: PostgreSQL `tsvector` for better text search
2. **Search Analytics**: Track popular searches
3. **Search History**: Save user's recent searches
4. **Saved Searches**: Let users save frequent queries
5. **Advanced Filters**: More granular filtering options
6. **Trending**: Show trending searches/content
7. **Elasticsearch**: For very large datasets

## Success Criteria

✅ All search types return results in < 500ms
✅ Autocomplete works smoothly
✅ Recommendations are relevant
✅ UI is responsive and intuitive
✅ No errors in console
✅ Proper error handling
✅ Loading states work correctly
✅ Empty states are user-friendly
