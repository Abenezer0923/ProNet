# 🚀 Phase 2: User Profile & Communities

## ✅ Phase 1 Complete
- [x] User Authentication (Register, Login, JWT)
- [x] User Dashboard
- [x] Frontend/Backend Connection
- [x] Deployment (Vercel + Render)

---

## 🎯 Phase 2 Goals

### Part A: User Profile Management (Week 1)
1. **User Profile Page**
   - View own profile
   - View other users' profiles
   - Display user info, skills, bio

2. **Edit Profile**
   - Update personal info
   - Add/edit bio
   - Add/remove skills
   - Upload avatar (optional)

3. **User Connections**
   - Follow/unfollow users
   - View followers/following
   - Connection suggestions

### Part B: Communities (Week 2)
1. **Community CRUD**
   - Create community
   - Edit community
   - Delete community
   - List all communities

2. **Community Membership**
   - Join community
   - Leave community
   - View members
   - Member roles (admin, moderator, member)

3. **Community Pages**
   - Community list page
   - Community detail page
   - My communities page

---

## 📋 Implementation Order

### Step 1: User Profile Backend (30 min)
- [ ] Create User Profile endpoints
- [ ] Add skills management
- [ ] Add profile update logic

### Step 2: User Profile Frontend (45 min)
- [ ] Create profile page
- [ ] Create edit profile page
- [ ] Add skills display/edit
- [ ] Add profile navigation

### Step 3: User Connections Backend (30 min)
- [ ] Create follow/unfollow endpoints
- [ ] Add followers/following queries
- [ ] Create connection entity

### Step 4: User Connections Frontend (30 min)
- [ ] Add follow button
- [ ] Display followers/following count
- [ ] Create connections page

### Step 5: Communities Backend (1 hour)
- [ ] Create Community entity
- [ ] Create Community CRUD endpoints
- [ ] Add membership management
- [ ] Add member roles

### Step 6: Communities Frontend (1 hour)
- [ ] Create communities list page
- [ ] Create community detail page
- [ ] Add create community form
- [ ] Add join/leave buttons

---

## 🎨 New Pages to Create

### Frontend Pages:
1. `/profile/[id]` - User profile page
2. `/profile/edit` - Edit profile page
3. `/communities` - Browse communities
4. `/communities/[id]` - Community detail
5. `/communities/create` - Create community
6. `/communities/my` - My communities

### Backend Endpoints:
```
# User Profile
GET    /api/users/profile/:id
PUT    /api/users/profile
POST   /api/users/profile/skills
DELETE /api/users/profile/skills/:id

# Connections
POST   /api/users/connections/follow/:userId
DELETE /api/users/connections/unfollow/:userId
GET    /api/users/connections/followers
GET    /api/users/connections/following

# Communities
GET    /api/communities
POST   /api/communities
GET    /api/communities/:id
PUT    /api/communities/:id
DELETE /api/communities/:id
POST   /api/communities/:id/join
DELETE /api/communities/:id/leave
GET    /api/communities/:id/members
```

---

## 🗄️ Database Changes

### New Tables:

**1. user_skills**
```sql
CREATE TABLE user_skills (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  skill_name VARCHAR NOT NULL,
  proficiency_level VARCHAR, -- beginner, intermediate, expert
  created_at TIMESTAMP DEFAULT NOW()
);
```

**2. connections**
```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY,
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

**3. communities**
```sql
CREATE TABLE communities (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR,
  avatar VARCHAR,
  cover_image VARCHAR,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**4. community_members**
```sql
CREATE TABLE community_members (
  id UUID PRIMARY KEY,
  community_id UUID REFERENCES communities(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR DEFAULT 'member', -- admin, moderator, member
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);
```

---

## 🎯 Let's Start!

### Which would you like to implement first?

**Option A: User Profile** (Easier, builds on what we have)
- View and edit user profiles
- Add skills
- Better user experience

**Option B: Communities** (More exciting, core feature)
- Create and join communities
- Community pages
- Social features

**Option C: Both in parallel** (Faster, but more complex)
- I'll create both simultaneously
- You can test as we go

---

## 📊 Estimated Time

- **User Profile**: 2-3 hours
- **Communities**: 3-4 hours
- **Total Phase 2**: 5-7 hours

---

## 🎨 UI Components Needed

### User Profile:
- Profile card
- Skills badges
- Edit profile form
- Follow button
- Stats display (followers, following, posts)

### Communities:
- Community card
- Community list
- Create community form
- Member list
- Join/Leave button

---

**Which should we start with? User Profile or Communities?** 🚀
