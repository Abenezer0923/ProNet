# 🔔 Phase 5A: Notifications System

## What We're Building

A complete real-time notifications system that alerts users about:
- New followers
- New messages
- Post likes
- Post comments
- Community invitations
- Mentions (future)

---

## 🏗️ Architecture

### Backend Components:
1. **Notification Entity** - Store notifications in database
2. **Notification Service** - Business logic
3. **Notification Controller** - REST API endpoints
4. **WebSocket Events** - Real-time delivery
5. **Notification Triggers** - Auto-create on actions

### Frontend Components:
1. **Notification Bell** - Header icon with badge
2. **Notification Dropdown** - List of recent notifications
3. **Notification Page** - Full notification history
4. **Toast Notifications** - Pop-up alerts
5. **Real-time Updates** - WebSocket integration

---

## 📊 Database Schema

### notifications table:
```sql
- id (UUID)
- userId (UUID) -> users.id (recipient)
- type (VARCHAR) - 'follow', 'message', 'like', 'comment', 'community_invite'
- title (VARCHAR) - "New Follower"
- message (TEXT) - "John Doe started following you"
- actionUrl (VARCHAR) - "/profile/user-id"
- actorId (UUID) -> users.id (who triggered it)
- relatedId (UUID) - ID of related entity (post, message, etc)
- isRead (BOOLEAN) - default false
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

---

## 🔌 API Endpoints

```
GET    /notifications              - Get user's notifications
GET    /notifications/unread-count - Get unread count
PUT    /notifications/:id/read     - Mark as read
PUT    /notifications/read-all     - Mark all as read
DELETE /notifications/:id          - Delete notification
DELETE /notifications/clear-all    - Clear all notifications
```

---

## 🔄 WebSocket Events

```javascript
// Server -> Client
socket.emit('notification', {
  id: 'uuid',
  type: 'follow',
  title: 'New Follower',
  message: 'John Doe started following you',
  actionUrl: '/profile/user-id',
  createdAt: '2024-01-01T00:00:00Z'
});

// Client -> Server
socket.emit('markNotificationRead', { notificationId: 'uuid' });
```

---

## 🎯 Notification Types

### 1. Follow Notification
**Trigger**: When someone follows you
```
Title: "New Follower"
Message: "{firstName} {lastName} started following you"
ActionUrl: "/profile/{followerId}"
Type: "follow"
```

### 2. Message Notification
**Trigger**: When you receive a new message
```
Title: "New Message"
Message: "{firstName} {lastName} sent you a message"
ActionUrl: "/chat"
Type: "message"
```

### 3. Like Notification
**Trigger**: When someone likes your post
```
Title: "Post Liked"
Message: "{firstName} {lastName} liked your post"
ActionUrl: "/communities/{communityId}#post-{postId}"
Type: "like"
```

### 4. Comment Notification
**Trigger**: When someone comments on your post
```
Title: "New Comment"
Message: "{firstName} {lastName} commented on your post"
ActionUrl: "/communities/{communityId}#post-{postId}"
Type: "comment"
```

### 5. Community Invite (Future)
**Trigger**: When invited to a community
```
Title: "Community Invitation"
Message: "{firstName} {lastName} invited you to {communityName}"
ActionUrl: "/communities/{communityId}"
Type: "community_invite"
```

---

## 🎨 UI Components

### 1. Notification Bell (Header)
```
┌─────────────────────────┐
│  🔔 (3)                 │  <- Badge shows unread count
└─────────────────────────┘
```

### 2. Notification Dropdown
```
┌─────────────────────────────────────┐
│  Notifications                      │
├─────────────────────────────────────┤
│  🔵 John Doe started following you  │
│     2 minutes ago                   │
├─────────────────────────────────────┤
│  ⚪ Jane Smith liked your post      │
│     1 hour ago                      │
├─────────────────────────────────────┤
│  ⚪ Mike Johnson commented          │
│     3 hours ago                     │
├─────────────────────────────────────┤
│  [Mark all as read] [View all]     │
└─────────────────────────────────────┘
```

### 3. Toast Notification
```
┌─────────────────────────────────────┐
│  🔔 New Follower                    │
│  John Doe started following you     │
│                              [View] │
└─────────────────────────────────────┘
```

---

## 🔨 Implementation Steps

### Step 1: Backend - Database Entity
- Create Notification entity
- Add to app.module.ts

### Step 2: Backend - Service & Controller
- Create NotificationService
- Create NotificationController
- Add REST endpoints

### Step 3: Backend - Notification Triggers
- Add to UsersService (follow)
- Add to ChatService (message)
- Add to PostsService (like, comment)

### Step 4: Backend - WebSocket Integration
- Add notification events to ChatGateway
- Emit notifications in real-time

### Step 5: Frontend - Notification Context
- Create NotificationContext
- Manage notification state
- WebSocket integration

### Step 6: Frontend - Notification Bell
- Add bell icon to header
- Show unread count badge
- Dropdown menu

### Step 7: Frontend - Notification Page
- Create /notifications page
- List all notifications
- Mark as read functionality

### Step 8: Frontend - Toast Notifications
- Add toast component
- Show on new notifications
- Auto-dismiss after 5 seconds

---

## 🎯 Success Criteria

- ✅ Notifications created automatically on actions
- ✅ Real-time delivery via WebSocket
- ✅ Unread count badge updates instantly
- ✅ Click notification navigates to relevant page
- ✅ Mark as read functionality works
- ✅ Toast notifications appear for new notifications
- ✅ Notification history persists in database
- ✅ Clean, intuitive UI

---

## 📝 Testing Checklist

- [ ] Follow a user → Notification appears
- [ ] Send a message → Notification appears
- [ ] Like a post → Notification appears
- [ ] Comment on post → Notification appears
- [ ] Click notification → Navigates correctly
- [ ] Mark as read → Badge count decreases
- [ ] Mark all as read → All notifications marked
- [ ] Real-time delivery works
- [ ] Toast appears and dismisses
- [ ] Notification page shows history

---

## 🚀 Let's Build It!

Ready to implement? We'll build:
1. Backend notification system
2. Real-time WebSocket events
3. Frontend notification UI
4. Toast notifications

This will take about 1-2 hours to implement completely.

**Let's start! 🎉**
