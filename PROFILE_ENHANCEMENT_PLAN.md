# Profile Enhancement Plan - LinkedIn Style

## Overview
Transform the profile system to match LinkedIn's best practices with unique usernames and improved UX.

## Key Features to Implement

### 1. Unique Username System
- **URL Format:** `/in/{username}` (like LinkedIn)
- **Username Requirements:**
  - Unique across platform
  - 3-30 characters
  - Alphanumeric + hyphens/underscores
  - Case-insensitive
  - Auto-generated from name on signup
  - User can customize later

### 2. Enhanced Navigation Bar
**Current:** Basic nav with profile link
**New LinkedIn-style nav:**
- Home icon
- My Network icon with badge
- Jobs/Opportunities icon
- Messaging icon with unread count
- Notifications bell with count
- Profile dropdown menu:
  - View Profile
  - Settings & Privacy
  - Help
  - Sign Out

### 3. Settings Section
New `/settings` page with tabs:
- **Account:** Email, password, username
- **Privacy:** Who can see your profile, connections
- **Notifications:** Email preferences, push notifications
- **Display:** Theme, language
- **Data:** Download data, delete account

### 4. Profile Page Improvements
**LinkedIn-inspired sections:**
- Profile header with banner
- About section (expandable)
- Featured (posts, articles, media)
- Activity (recent posts/comments)
- Experience (with company logos)
- Education (with school logos)
- Skills & Endorsements
- Recommendations
- Interests (communities, hashtags)
- Analytics (profile views, post impressions)

## Implementation Steps

### Phase 1: Backend - Username System
1. Add `username` field to User entity
2. Add unique constraint
3. Create username validation
4. Add username generation utility
5. Update registration to create username
6. Add username update endpoint
7. Add username availability check endpoint

### Phase 2: Backend - Settings
1. Create settings endpoints
2. Add privacy settings entity
3. Add notification preferences entity
4. Implement data export
5. Add account deletion with confirmation

### Phase 3: Frontend - Username URLs
1. Update routing to support `/in/{username}`
2. Add username to profile URLs
3. Update all profile links
4. Add username edit in settings
5. Add username availability checker

### Phase 4: Frontend - Enhanced Navigation
1. Create new navbar component
2. Add icons for each section
3. Add notification badges
4. Create profile dropdown menu
5. Add settings link

### Phase 5: Frontend - Settings Page
1. Create settings layout with tabs
2. Implement account settings
3. Implement privacy settings
4. Implement notification settings
5. Implement data export
6. Improve delete account flow

### Phase 6: Frontend - Profile Enhancements
1. Improve profile header design
2. Add profile analytics
3. Add activity feed
4. Improve sections layout
5. Add edit buttons for each section
6. Add profile completeness indicator

## Database Changes

### User Entity Updates
```typescript
@Entity()
export class User {
  // ... existing fields
  
  @Column({ unique: true, length: 30 })
  username: string;
  
  @Column({ default: 0 })
  profileViews: number;
  
  @Column({ default: true })
  isProfilePublic: boolean;
  
  @Column({ default: true })
  showEmail: boolean;
  
  @Column({ default: true })
  showConnections: boolean;
}
```

### New Entities
```typescript
@Entity()
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @OneToOne(() => User)
  user: User;
  
  @Column({ default: true })
  emailNotifications: boolean;
  
  @Column({ default: true })
  connectionRequests: boolean;
  
  @Column({ default: true })
  messages: boolean;
  
  @Column({ default: 'light' })
  theme: string;
}
```

## API Endpoints to Add

### Username
- `GET /users/username/:username` - Check availability
- `PATCH /users/username` - Update username
- `GET /users/by-username/:username` - Get user by username

### Settings
- `GET /users/settings` - Get user settings
- `PUT /users/settings` - Update settings
- `GET /users/settings/privacy` - Get privacy settings
- `PUT /users/settings/privacy` - Update privacy
- `POST /users/export-data` - Request data export
- `POST /users/delete-account` - Delete with confirmation

### Analytics
- `GET /users/profile-views` - Get profile view count
- `POST /users/profile-views/:userId` - Track profile view

## UI/UX Best Practices (from LinkedIn)

### Navigation
- Fixed top navbar
- Icons with labels
- Notification badges
- Search bar prominent
- Profile picture in nav

### Profile
- Large cover photo
- Profile picture overlapping cover
- Clear CTA buttons
- Sections with edit buttons
- Expandable content
- Profile completeness bar
- Share profile button

### Settings
- Tab-based navigation
- Clear section headers
- Toggle switches for preferences
- Save confirmation messages
- Danger zone for destructive actions

### Responsive Design
- Mobile-first approach
- Hamburger menu on mobile
- Collapsible sections
- Touch-friendly buttons
- Optimized images

## Priority Order

**High Priority (Do First):**
1. Username system backend
2. Username URLs frontend
3. Enhanced navigation
4. Settings page basics

**Medium Priority:**
5. Profile enhancements
6. Privacy settings
7. Profile analytics

**Low Priority:**
8. Advanced features
9. Recommendations
10. Featured content

## Estimated Timeline
- Phase 1-2 (Backend): 2-3 hours
- Phase 3-4 (Frontend Core): 3-4 hours
- Phase 5-6 (Frontend Polish): 4-5 hours
- **Total:** 9-12 hours of development

## Next Steps
1. Review and approve plan
2. Start with Phase 1 (Username backend)
3. Test each phase before moving forward
4. Deploy incrementally
