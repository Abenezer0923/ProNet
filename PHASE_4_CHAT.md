# 💬 Phase 4: Real-time Chat System

## What We're Building

A real-time chat system where users can:
- Send direct messages to connections
- See online/offline status
- Get real-time message delivery
- View conversation history
- See typing indicators
- Get unread message counts

---

## Architecture

### Backend:
- **WebSocket Gateway** (Socket.IO)
- **Chat Module** (Messages, Conversations)
- **Database Entities** (Conversation, Message)
- **Real-time Events** (message, typing, online status)

### Frontend:
- **Socket.IO Client**
- **Chat UI Component**
- **Message List**
- **Conversation List**
- **Real-time Updates**

---

## Database Schema

### conversations table:
```sql
- id (UUID)
- participant1Id (UUID) -> users.id
- participant2Id (UUID) -> users.id
- lastMessageAt (TIMESTAMP)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

### messages table:
```sql
- id (UUID)
- conversationId (UUID) -> conversations.id
- senderId (UUID) -> users.id
- content (TEXT)
- isRead (BOOLEAN)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

---

## WebSocket Events

### Client -> Server:
- `join` - Join user's room
- `sendMessage` - Send a message
- `typing` - User is typing
- `markAsRead` - Mark messages as read

### Server -> Client:
- `message` - New message received
- `typing` - Someone is typing
- `online` - User came online
- `offline` - User went offline
- `messageRead` - Message was read

---

## API Endpoints

```
GET    /chat/conversations        - Get user's conversations
GET    /chat/conversations/:id    - Get conversation messages
POST   /chat/conversations        - Create/get conversation with user
GET    /chat/unread-count         - Get unread message count
PUT    /chat/messages/:id/read    - Mark message as read
```

---

## Implementation Steps

1. ✅ Install Socket.IO dependencies
2. ✅ Create Chat module (entities, service, controller)
3. ✅ Create WebSocket Gateway
4. ✅ Add chat endpoints
5. ✅ Create frontend chat UI
6. ✅ Integrate Socket.IO client
7. ✅ Add real-time message delivery
8. ✅ Add typing indicators
9. ✅ Add online status

Let's build it! 🚀
