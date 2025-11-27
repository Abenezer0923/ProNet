# Community Posts & Feed Implementation

## Overview
Implementing a comprehensive post system for communities and feed with proper permissions and photo support.

## Requirements

### Community Posts
1. **Only community owners** can create posts in their community
2. **All members** can view, like, and comment on posts
3. Posts support **photo attachments**
4. Comments visible in both community and feed

### Feed Posts
1. **Anyone** can create posts in the feed (public posting)
2. Posts support **photo attachments**
3. Feed shows both public posts and community posts

## Implementation Plan

### Backend Changes

#### 1. Post Service (`services/user-service/src/posts/posts.service.ts`)
- ✅ Added permission check: Only community owners can create community posts
- Posts with `communityId` require owner verification
- Public posts (no `communityId`) can be created by anyone

#### 2. Post Entity (`services/user-service/src/posts/entities/post.entity.ts`)
- ✅ Already supports `images` array
- ✅ Already supports `communityId` for community posts
- ✅ Already supports `visibility` field

### Frontend Changes

#### 1. CreatePost Component (`frontend/src/components/posts/CreatePost.tsx`)
- ✅ Added image upload functionality
- ✅ Uploads image to `/upload` endpoint
- ✅ Includes image URL in post data
- Shows community selection dropdown
- Handles permission errors gracefully

#### 2. Community Page (`frontend/src/app/communities/[id]/page.tsx`)
- Need to add: Fetch community posts
- Need to add: Create post component (owner only)
- Need to add: Display posts with PostCard component
- Need to add: Handle post creation, likes, comments

#### 3. Feed Page (`frontend/src/app/feed/page.tsx`)
- ✅ Already fetches all posts (including community posts)
- ✅ Already displays posts with PostCard
- ✅ Already has CreatePost component with image support

## Features

### Post Creation
- **Feed**: Anyone can create posts
- **Community**: Only owners can create posts
- Both support photo attachments
- Image upload via `/upload` endpoint
- Multiple images support (array)

### Post Interactions
- **Like**: All users can like posts
- **Comment**: All users can comment
- **Repost**: All users can repost
- **Share**: Share functionality available

### Visibility
- **Public posts**: Visible in feed to everyone
- **Community posts**: Visible in both community page and feed
- Posts show community badge when from a community

## API Endpoints

### Posts
- `POST /posts` - Create post (with optional communityId and images)
- `GET /posts` - Get all posts (feed)
- `GET /posts?communityId={id}` - Get community posts
- `POST /posts/:id/like` - Like a post
- `DELETE /posts/:id/unlike` - Unlike a post
- `POST /posts/:id/comments` - Add comment
- `GET /posts/:id/comments` - Get comments

### Upload
- `POST /upload` - Upload image (returns URL)

## Permission Matrix

| Action | Feed | Community (Owner) | Community (Member) |
|--------|------|-------------------|-------------------|
| Create Post | ✅ | ✅ | ❌ |
| View Posts | ✅ | ✅ | ✅ |
| Like Posts | ✅ | ✅ | ✅ |
| Comment | ✅ | ✅ | ✅ |
| Upload Photos | ✅ | ✅ | ❌ |

## Next Steps

1. Update community page to fetch and display posts
2. Add create post component for community owners
3. Integrate PostCard component in community page
4. Test permission checks
5. Test image uploads
6. Test cross-posting (community posts in feed)

## Files to Modify

### Backend
- ✅ `services/user-service/src/posts/posts.service.ts`

### Frontend
- ✅ `frontend/src/components/posts/CreatePost.tsx`
- ⏳ `frontend/src/app/communities/[id]/page.tsx`
- ✅ `frontend/src/app/feed/page.tsx` (already working)
- ✅ `frontend/src/components/posts/PostCard.tsx` (already working)

## Testing Checklist

- [ ] Community owner can create posts with photos
- [ ] Community members cannot create posts
- [ ] All members can like and comment
- [ ] Community posts appear in feed
- [ ] Public posts appear in feed
- [ ] Image upload works correctly
- [ ] Permission errors show user-friendly messages
- [ ] Comments sync between community and feed views
