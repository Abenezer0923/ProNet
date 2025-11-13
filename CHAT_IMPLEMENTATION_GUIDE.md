# 💬 Real-time Chat Implementation Guide

## ✅ What We Built

A complete real-time chat system with:
- **WebSocket communication** using Socket.IO
- **Direct messaging** between connections
- **Real-time message delivery**
- **Online/offline status**
- **Unread message counts**
- **Conversation history**
- **Message persistence** in PostgreSQL

---

## 🏗️ Architecture

### Backend Components:
1. **Chat Module** (`services/user-service/src/chat/`)
   - `chat.controller.ts` - REST API endpoints
   - `chat.service.ts` - Business logic
   - `chat.gateway.ts` - WebSocket gateway
   - `entities/` - Database entities (Conversation, Message)
   - `dto/` - Data transfer objects

2. **Database Tables**:
   - `conversations` - Stores chat conversations between users
   - `messages` - Stores individual messages

3. **WebSocket Events**:
   - `sendMessage` - Send a message
   - `message` - Receive a message
   - `typing` - Typing indicator
   - `userOnline` - User came online
   - `userOffline` - User went offline
   - `markAsRead` - Mark message as read

### Frontend Components:
1. **Socket Context** (`frontend/src/contexts/SocketContext.tsx`)
   - Manages WebSocket connection
   - Handles authentication
   - Provides socket instance to components

2. **Chat Page** (`frontend/src/app/chat/page.tsx`)
   - Conversation list
   - Message display
   - Real-time updates
   - Send messages

3. **Integration**:
   - Added "Message" button to connections page
   - Added chat link to dashboard
   - Socket provider in root layout

---

## 🚀 How to Test with Docker

### Step 1: Rebuild Docker Containers

Since we added new dependencies, rebuild the containers:

```bash
# Stop existing containers
docker-compose down

# Rebuild with new dependencies
docker-compose build

# Start containers
docker-compose up -d

# Check logs
docker-compose logs -f user-service
docker-compose logs -f frontend
```

### Step 2: Verify Services are Running

```bash
# Check all services
docker-compose ps

# Should see:
# - postgres (port 5432)
# - redis (port 6379)
# - api-gateway (port 3000)
# - user-service (port 3001)
# - frontend (port 3100)
```

### Step 3: Test the Chat System

1. **Open two browser windows** (or use incognito mode for second user)

2. **Create/Login as User A**:
   - Go to `http://localhost:3100`
   - Register or login
   - Go to Dashboard
   - Note your user ID from profile URL

3. **Create/Login as User B** (in second browser):
   - Go to `http://localhost:3100`
   - Register or login with different email
   - Go to Dashboard

4. **Connect Users**:
   - User B: Go to `/profile/[user-a-id]`
   - Click "Follow" button
   - User A: Go to `/connections`
   - See User B in followers
   - Click "Message" button next to User B

5. **Start Chatting**:
   - User A: Should see chat page with User B
   - Type a message and send
   - User B: Go to `/chat`
   - Should see conversation with User A
   - Should see User A's message in real-time
   - Reply to User A
   - User A: Should see reply instantly

6. **Test Real-time Features**:
   - Send messages back and forth
   - Check connection status indicator (green = connected)
   - Close one browser and see offline status
   - Reopen and see online status

---

## 📊 API Endpoints

### REST Endpoints:

```
POST   /chat/conversations
Body: { "participantId": "user-uuid" }
Response: Conversation object
Description: Create or get existing conversation

GET    /chat/conversations
Response: Array of conversations with unread counts
Description: Get all user's conversations

GET    /chat/conversations/:id/messages
Response: Array of messages
Description: Get messages for a conversation

GET    /chat/unread-count
Response: { "count": number }
Description: Get total unread message count

PUT    /chat/messages/:id/read
Response: Updated message
Description: Mark message as read
```

### WebSocket Events:

```javascript
// Client -> Server
socket.emit('sendMessage', {
  conversationId: 'uuid',
  content: 'Hello!'
});

socket.emit('typing', {
  conversationId: 'uuid',
  isTyping: true
});

socket.emit('joinConversation', {
  conversationId: 'uuid'
});

socket.emit('markAsRead', {
  messageId: 'uuid'
});

// Server -> Client
socket.on('message', (message) => {
  // New message received
});

socket.on('userOnline', ({ userId }) => {
  // User came online
});

socket.on('userOffline', ({ userId }) => {
  // User went offline
});

socket.on('typing', ({ userId, isTyping }) => {
  // Someone is typing
});

socket.on('messageRead', ({ messageId }) => {
  // Message was read
});
```

---

## 🐛 Troubleshooting

### Issue: WebSocket not connecting

**Solution**:
```bash
# Check user-service logs
docker-compose logs user-service

# Check if port 3001 is accessible
curl http://localhost:3001

# Verify JWT token is being sent
# Open browser console and check WebSocket connection
```

### Issue: Messages not appearing

**Solution**:
```bash
# Check database tables exist
docker-compose exec postgres psql -U postgres -d profession_db -c "\dt"

# Should see: conversations, messages tables

# Check if messages are being saved
docker-compose exec postgres psql -U postgres -d profession_db -c "SELECT * FROM messages;"
```

### Issue: "Cannot find module socket.io"

**Solution**:
```bash
# Rebuild containers to install dependencies
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Issue: CORS errors

**Solution**:
- Check `services/user-service/src/main.ts` has CORS enabled
- Check `services/user-service/src/chat/chat.gateway.ts` has CORS config
- Verify frontend is using correct WebSocket URL

---

## 🔧 Configuration

### Environment Variables:

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

**Backend** (`services/user-service/.env`):
```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=profession_db
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
```

---

## 📈 Database Schema

### conversations table:
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant1_id UUID NOT NULL REFERENCES users(id),
  participant2_id UUID NOT NULL REFERENCES users(id),
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### messages table:
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ Testing Checklist

- [ ] Docker containers rebuild successfully
- [ ] All services are running
- [ ] Can create two user accounts
- [ ] Users can follow each other
- [ ] "Message" button appears on connections page
- [ ] Chat page loads without errors
- [ ] WebSocket connection shows "Connected"
- [ ] Can send messages between users
- [ ] Messages appear in real-time
- [ ] Conversation list updates
- [ ] Unread count shows correctly
- [ ] Messages persist after page refresh
- [ ] Online/offline status works

---

## 🎉 Success Criteria

Your chat system is working if:
1. ✅ Two users can send messages to each other
2. ✅ Messages appear instantly without page refresh
3. ✅ Connection status indicator shows green
4. ✅ Conversation list shows latest messages
5. ✅ Messages persist in database
6. ✅ Unread counts update correctly

---

## 🚀 Next Steps

Once chat is working, you can add:
- [ ] Typing indicators (already implemented, just needs UI)
- [ ] Message read receipts
- [ ] File/image sharing
- [ ] Group chats
- [ ] Message search
- [ ] Push notifications
- [ ] Voice/video calls
- [ ] Message reactions
- [ ] Message editing/deletion

---

## 📝 Notes

- WebSocket connection requires valid JWT token
- Messages are stored in PostgreSQL for persistence
- Socket.IO handles reconnection automatically
- CORS is configured for development (adjust for production)
- Each user joins their own room (`user:{userId}`)
- Conversations are bidirectional (no duplicate conversations)

---

**Happy Chatting! 💬**
