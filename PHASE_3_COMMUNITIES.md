# 🏘️ Phase 3: Communities System

## What We're Building

### Backend:
- Community entity (name, description, category, avatar)
- CommunityMember entity (user-community relationship)
- Community CRUD endpoints
- Join/leave community endpoints
- Member management

### Frontend:
- `/communities` - Browse all communities
- `/communities/create` - Create new community
- `/communities/[id]` - Community detail page
- `/communities/my` - My communities

### Features:
- ✅ Create community
- ✅ Browse communities
- ✅ Join/leave community
- ✅ View community members
- ✅ Community categories
- ✅ Member roles (admin, moderator, member)

---

## Database Schema

### communities table:
```sql
- id (UUID)
- name (VARCHAR)
- description (TEXT)
- category (VARCHAR) - e.g., "Technology", "Marketing", "Healthcare"
- avatar (VARCHAR)
- coverImage (VARCHAR)
- isPrivate (BOOLEAN)
- createdBy (UUID) -> users.id
- memberCount (INT)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### community_members table:
```sql
- id (UUID)
- communityId (UUID) -> communities.id
- userId (UUID) -> users.id
- role (VARCHAR) - "admin", "moderator", "member"
- joinedAt (TIMESTAMP)
```

---

## API Endpoints

```
GET    /communities              - List all communities
POST   /communities              - Create community
GET    /communities/:id          - Get community details
PUT    /communities/:id          - Update community (admin only)
DELETE /communities/:id          - Delete community (admin only)

POST   /communities/:id/join     - Join community
DELETE /communities/:id/leave    - Leave community
GET    /communities/:id/members  - Get community members
GET    /communities/my           - Get my communities

GET    /communities/categories   - Get available categories
GET    /communities/search       - Search communities
```

---

Let's implement this! 🚀
