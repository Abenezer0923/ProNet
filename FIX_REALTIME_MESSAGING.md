# Fix: Real-time Messaging Issue

## Problem
Messages sent from one user don't appear for other users in the same group in real-time.

## Root Causes Identified

### 1. Incomplete Author Data in WebSocket Broadcast
**Issue**: When a message is saved to the database, the author relation is not loaded before broadcasting via WebSocket.

**Fix**: Modified `sendMessage` method to fetch the complete message with author details after saving.

```typescript
// Before
return this.messageRepository.save(message);

// After
const savedMessage = await this.messageRepository.save(message);
const completeMessage = await this.messageRepository.findOne({
  where: { id: savedMessage.id },
  relations: ['author', 'group'],
});
return completeMessage;
```

### 2. Message Order
**Issue**: Messages were returned in DESC order but displayed without reversing.

**Fix**: Reverse messages array for display (oldest first).

```typescript
const reversedMessages = response.data.reverse();
setMessages(reversedMessages);
```

### 3. Message State Management
**Issue**: When switching groups, old messages might persist.

**Fix**: Clear messages when switching groups.

```typescript
useEffect(() => {
  if (selectedGroup) {
    setMessages([]); // Clear previous messages
    fetchMessages();
  }
}, [selectedGroup]);
```

## Testing Steps

### Test 1: Send and Receive Messages

1. **User 1**: Login and create/join a community
2. **User 1**: Create a group
3. **User 2**: Login with different account
4. **User 2**: Join the same community
5. **Both**: Navigate to the same group
6. **User 1**: Send a message
7. **Expected**: User 2 should see the message immediately
8. **User 2**: Send a message
9. **Expected**: User 1 should see the message immediately

### Test 2: Check Browser Console

Open browser console (F12) and look for:

**User 1 Console:**
```
Connected to community socket
Joining group: <group-id>
Message received: {id: "...", content: "...", author: {...}}
```

**User 2 Console:**
```
Connected to community socket
Joining group: <group-id>
Fetching messages for group: <group-id>
Received messages: 1
Messages set: 1
Message received: {id: "...", content: "...", author: {...}}
```

### Test 3: Check Backend Logs

In the backend terminal, you should see:

```
Client connected: <socket-id>, User: <user-id>
User <user-id> joined group <group-id>
Message sent in group <group-id> by user <user-id>
```

## Debugging Checklist

If messages still don't appear:

### 1. Check WebSocket Connection
- [ ] Green dot next to message input (both users)
- [ ] Console shows "Connected to community socket"
- [ ] No WebSocket errors in console

### 2. Check Group Membership
- [ ] Both users are members of the community
- [ ] Both users have selected the same group
- [ ] Group ID is the same for both users

### 3. Check Backend
- [ ] Backend is running on port 3001
- [ ] No errors in backend logs
- [ ] Database is accessible
- [ ] Messages are being saved to database

### 4. Check API Gateway
- [ ] API Gateway is running on port 3000
- [ ] WebSocket proxy is configured
- [ ] No CORS errors

### 5. Check Database
```sql
-- Check if messages are being saved
SELECT * FROM group_messages ORDER BY "createdAt" DESC LIMIT 10;

-- Check message with author
SELECT 
  gm.id,
  gm.content,
  gm."createdAt",
  u."firstName",
  u."lastName"
FROM group_messages gm
LEFT JOIN users u ON gm."authorId" = u.id
ORDER BY gm."createdAt" DESC
LIMIT 10;
```

## Common Issues

### Issue 1: WebSocket Not Connecting

**Symptoms:**
- Gray dot next to message input
- Console shows "Disconnected from community socket"

**Solutions:**
1. Check if backend is running
2. Verify JWT token is valid
3. Check CORS configuration
4. Restart backend

### Issue 2: Messages Saved But Not Broadcast

**Symptoms:**
- Messages appear after page refresh
- No real-time updates

**Solutions:**
1. Check WebSocket gateway is registered in module
2. Verify `this.server.to()` is broadcasting correctly
3. Check if users are in the same room (`group:${groupId}`)

### Issue 3: Author Information Missing

**Symptoms:**
- Messages appear but show "undefined undefined"
- Author name is blank

**Solutions:**
1. Verify author relation is loaded in `sendMessage`
2. Check User entity has firstName and lastName
3. Verify database has user data

### Issue 4: Messages Not Persisting

**Symptoms:**
- Messages disappear after page refresh
- Database is empty

**Solutions:**
1. Check database connection
2. Verify TypeORM synchronize is true
3. Check entity relationships
4. Verify foreign keys are set correctly

## Manual Testing Script

```bash
# Terminal 1: Start backend
cd services/user-service
npm run start:dev

# Terminal 2: Start API gateway
cd services/api-gateway
npm run start:dev

# Terminal 3: Start frontend
cd frontend
npm run dev

# Terminal 4: Monitor database
psql -h localhost -U postgres -d profession_db

# In psql, watch for new messages:
SELECT * FROM group_messages ORDER BY "createdAt" DESC LIMIT 5;
```

## API Testing

### Send Message via HTTP
```bash
curl -X POST http://localhost:3000/communities/groups/GROUP_ID/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test message"}'
```

### Get Messages
```bash
curl -X GET http://localhost:3000/communities/groups/GROUP_ID/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## WebSocket Testing

### Using Browser Console

```javascript
// Connect
const socket = io('http://localhost:3000/communities', {
  auth: { token: localStorage.getItem('token') }
});

// Join group
socket.emit('join_group', { groupId: 'YOUR_GROUP_ID' });

// Listen for messages
socket.on('message_received', (msg) => {
  console.log('Received:', msg);
});

// Send message
socket.emit('send_message', {
  groupId: 'YOUR_GROUP_ID',
  content: 'Test from console'
});
```

## Expected Behavior

### When User Sends Message:

1. **Frontend**: 
   - User types message and clicks Send
   - Message is sent via WebSocket
   - `sendSocketMessage(content)` is called

2. **Backend**:
   - WebSocket gateway receives `send_message` event
   - Message is saved to database with author relation
   - Complete message is fetched with author details
   - Message is broadcast to all users in `group:${groupId}` room

3. **All Users in Group**:
   - Receive `message_received` event
   - Message is added to messages array
   - UI updates to show new message
   - Auto-scroll to bottom

### When User Opens Group:

1. **Frontend**:
   - User clicks on group
   - `selectedGroup` state is updated
   - `useEffect` triggers
   - Messages are cleared
   - `fetchMessages()` is called

2. **Backend**:
   - HTTP GET request to `/communities/groups/:groupId/messages`
   - Messages are fetched from database with author relation
   - Messages are returned in DESC order

3. **Frontend**:
   - Messages are received
   - Array is reversed (oldest first)
   - Messages are set in state
   - UI displays all messages

## Success Criteria

- ✅ Messages appear in real-time for all users
- ✅ Author name is displayed correctly
- ✅ Messages persist after page refresh
- ✅ Typing indicators work
- ✅ Connection status is accurate
- ✅ No console errors
- ✅ No backend errors

## Files Modified

1. `services/user-service/src/communities/communities.service.ts`
   - Fixed `sendMessage` to load complete message with author

2. `frontend/src/app/communities/[id]/page.tsx`
   - Added message reversal for correct display order
   - Added message clearing when switching groups
   - Added debug logging

## Next Steps

1. Test with two users in different browsers
2. Verify messages appear in real-time
3. Check database for saved messages
4. Monitor backend logs for errors
5. If issues persist, check debugging checklist above

---

**Status**: Fixed
**Date**: November 19, 2025
**Tested**: Pending user verification
