# Community System MVP - Testing Guide

## Quick Start

### 1. Start Services

```bash
# Terminal 1: Backend
cd services/user-service
npm run start:dev

# Terminal 2: API Gateway
cd services/api-gateway
npm run start:dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

### 2. Access Application

- Frontend: http://localhost:3002
- API Gateway: http://localhost:3000
- Backend: http://localhost:3001

## Testing Checklist

### A. Community Management

#### Create Community
1. Login to the application
2. Navigate to `/communities`
3. Click "Create Community"
4. Fill in:
   - Name: "Test Community"
   - Description: "A test community"
   - Category: "Technology"
   - Privacy: "Public"
5. Click "Create"
6. ✅ Verify: Community is created and you're redirected to it

#### Join Community (Second User)
1. Login with a different account
2. Navigate to `/communities`
3. Find the test community
4. Click "Join"
5. ✅ Verify: You're now a member

#### Leave Community
1. Open the community
2. Click "Leave" button
3. Confirm the action
4. ✅ Verify: You're no longer a member

### B. Group Management

#### Create Group
1. Open your community
2. Click "Groups" tab
3. Click "+ Add" button
4. Fill in:
   - Name: "General Chat"
   - Type: "Chat"
   - Category: "General"
5. Click "Create"
6. ✅ Verify: Group appears in sidebar

#### Create Multiple Groups
Create these groups to test organization:
- 📢 Announcements (Announcement type, Announcements category)
- 💬 General (Chat type, General category)
- ❓ Q&A (Chat type, Help category)
- 🎯 Events (Meeting type, Events category)

✅ Verify: Groups are organized by category

### C. Real-time Messaging

#### Send Message
1. Select a group from sidebar
2. Type a message in the input field
3. Press "Send" or hit Enter
4. ✅ Verify: Message appears immediately

#### Receive Message (Two Users)
1. Open the same group in two different browsers/accounts
2. Send a message from User 1
3. ✅ Verify: User 2 receives the message in real-time

#### Typing Indicator
1. Open the same group in two browsers
2. Start typing in User 1's browser
3. ✅ Verify: User 2 sees "Someone is typing..." indicator

#### Connection Status
1. Check the small dot next to the message input
2. ✅ Verify: Green dot = connected, Gray dot = disconnected

### D. Member Management

#### View Members
1. Open community
2. Click "Members" tab
3. ✅ Verify: All members are listed with their roles

#### Update Member Role (Admin Only)
1. Login as community owner/admin
2. Go to Settings → Members tab
3. Change a member's role
4. ✅ Verify: Role is updated

#### Remove Member (Admin Only)
1. Go to Settings → Members tab
2. Click "Remove" on a member
3. Confirm the action
4. ✅ Verify: Member is removed

### E. Settings Management

#### Update Community Info
1. Go to Settings → General tab
2. Update name, description, or privacy
3. Click "Save Changes"
4. ✅ Verify: Changes are saved

#### Delete Group
1. Go to Settings → Groups tab
2. Click "Delete" on a group
3. Confirm the action
4. ✅ Verify: Group is deleted

## Common Issues & Solutions

### Issue 1: Messages Not Sending

**Symptoms:**
- Message input is disabled
- "Join the community to send messages" appears

**Solution:**
- Ensure you're a member of the community
- Check if you're logged in
- Verify WebSocket connection (green dot)

### Issue 2: WebSocket Not Connecting

**Symptoms:**
- Gray dot next to message input
- Messages don't appear in real-time

**Solution:**
```bash
# Check backend logs
cd services/user-service
npm run start:dev

# Look for WebSocket connection logs
# Should see: "Client connected: <socket-id>, User: <user-id>"
```

**Check:**
- Backend is running on port 3001
- API Gateway is proxying WebSocket correctly
- JWT token is valid

### Issue 3: Groups Not Appearing

**Symptoms:**
- Created group doesn't show in sidebar
- Empty group list

**Solution:**
- Refresh the page
- Check browser console for errors
- Verify API response: `GET /communities/:id`

### Issue 4: Can't Create Group

**Symptoms:**
- "Insufficient permissions" error
- Create button not visible

**Solution:**
- Only Owner, Admin, and Moderator can create groups
- Check your role in the community
- Ask an admin to promote you

### Issue 5: Database Errors

**Symptoms:**
- 500 errors when creating community/group
- "relation does not exist" errors

**Solution:**
```bash
# Check if database is running
psql -h localhost -U postgres -d profession_db -c "SELECT 1"

# Restart backend to trigger auto-sync
cd services/user-service
npm run start:dev
```

## API Testing with cURL

### Get Communities
```bash
curl -X GET http://localhost:3000/communities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Community
```bash
curl -X POST http://localhost:3000/communities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Community",
    "description": "A test community",
    "privacy": "public",
    "category": "Technology"
  }'
```

### Join Community
```bash
curl -X POST http://localhost:3000/communities/COMMUNITY_ID/join \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Group
```bash
curl -X POST http://localhost:3000/communities/COMMUNITY_ID/groups \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "General Chat",
    "type": "chat",
    "category": "General",
    "privacy": "public"
  }'
```

### Send Message
```bash
curl -X POST http://localhost:3000/communities/groups/GROUP_ID/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, World!"
  }'
```

### Get Messages
```bash
curl -X GET http://localhost:3000/communities/groups/GROUP_ID/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## WebSocket Testing

### Using Browser Console

```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000/communities', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

// Listen for connection
socket.on('connect', () => {
  console.log('Connected!', socket.id);
});

// Join a group
socket.emit('join_group', { groupId: 'GROUP_ID' });

// Send a message
socket.emit('send_message', {
  groupId: 'GROUP_ID',
  content: 'Test message from console'
});

// Listen for messages
socket.on('message_received', (message) => {
  console.log('New message:', message);
});

// Start typing
socket.emit('typing_start', { groupId: 'GROUP_ID' });

// Stop typing
socket.emit('typing_stop', { groupId: 'GROUP_ID' });
```

## Performance Testing

### Load Test Messages
```bash
# Send 100 messages
for i in {1..100}; do
  curl -X POST http://localhost:3000/communities/groups/GROUP_ID/messages \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"content\": \"Test message $i\"}"
  sleep 0.1
done
```

### Check Database Size
```sql
-- Connect to database
psql -h localhost -U postgres -d profession_db

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Count records
SELECT 'communities' as table_name, COUNT(*) FROM communities
UNION ALL
SELECT 'community_members', COUNT(*) FROM community_members
UNION ALL
SELECT 'groups', COUNT(*) FROM groups
UNION ALL
SELECT 'group_messages', COUNT(*) FROM group_messages;
```

## Success Criteria

### MVP is successful if:

- ✅ Users can create communities
- ✅ Users can join/leave communities
- ✅ Admins can create groups
- ✅ Members can send messages in groups
- ✅ Messages appear in real-time for all users
- ✅ Typing indicators work
- ✅ Connection status is visible
- ✅ Member management works
- ✅ Settings can be updated
- ✅ No critical bugs or crashes

### Known Limitations (Acceptable for MVP):

- ⏳ No message pagination (loads all messages)
- ⏳ No file upload in messages
- ⏳ No message editing/deletion
- ⏳ No message reactions
- ⏳ No read receipts
- ⏳ Posts tab is placeholder
- ⏳ No article system yet
- ⏳ No events system yet
- ⏳ No search within messages
- ⏳ No notifications for new messages

## Next Steps After MVP

1. Add message pagination
2. Implement file upload
3. Add message reactions
4. Build article system
5. Build events system
6. Add notifications
7. Implement search
8. Add moderation tools
9. Performance optimization
10. Mobile app

---

**Last Updated**: November 19, 2025
**Status**: MVP Ready for Testing
**Feedback**: Report issues in COMMUNITY_FIXES.md
