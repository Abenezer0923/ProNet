# Community System - Testing Guide

## Prerequisites

1. Backend running on `http://localhost:3001`
2. Frontend running on `http://localhost:3000`
3. PostgreSQL database running
4. Two user accounts for testing

## Test Scenarios

### 1. Community Creation & Management

#### Test 1.1: Create a Community
1. Log in as User A
2. Navigate to `/communities`
3. Click "Create Community"
4. Fill in:
   - Name: "Test Community"
   - Description: "A test community"
   - Category: "Technology"
   - Privacy: "Public"
5. Click "Create"
6. ✅ Verify: Community is created and you're redirected to community page

#### Test 1.2: Join a Community
1. Log in as User B
2. Navigate to `/communities`
3. Find "Test Community"
4. Click on it
5. Click "Join Community"
6. ✅ Verify: Button changes to "Leave" and you can see groups

#### Test 1.3: Member Management
1. Log in as User A (creator/admin)
2. Go to community settings
3. Navigate to "Members" tab
4. ✅ Verify: See User B in the list
5. Change User B's role to "Moderator"
6. ✅ Verify: Role is updated

### 2. Groups & Real-time Chat

#### Test 2.1: Create a Group
1. Log in as User A (admin)
2. Open "Test Community"
3. Click "Groups" tab
4. Click "+ Add" button
5. Fill in:
   - Name: "General Chat"
   - Type: "Chat"
   - Category: "General"
6. Click "Create"
7. ✅ Verify: Group appears in sidebar

#### Test 2.2: Real-time Messaging (Single User)
1. Log in as User A
2. Open "Test Community" → "Groups" tab
3. Click on "General Chat"
4. ✅ Verify: Green dot shows "Connected"
5. Type a message: "Hello, World!"
6. Press Send
7. ✅ Verify: Message appears immediately

#### Test 2.3: Real-time Messaging (Multiple Users)
1. Open two browser windows/tabs
2. Window 1: Log in as User A
3. Window 2: Log in as User B
4. Both: Navigate to "Test Community" → "Groups" → "General Chat"
5. ✅ Verify: Both show green "Connected" dot
6. User A: Send message "Hi from User A"
7. ✅ Verify: User B sees the message instantly
8. User B: Send message "Hi from User B"
9. ✅ Verify: User A sees the message instantly

#### Test 2.4: Typing Indicators
1. Keep both windows open (User A and User B)
2. User A: Start typing (don't send)
3. ✅ Verify: User B sees "Someone is typing..." with animated dots
4. User A: Stop typing for 2 seconds
5. ✅ Verify: Typing indicator disappears for User B

#### Test 2.5: Message History
1. Send 10 messages between User A and User B
2. User A: Refresh the page
3. ✅ Verify: All 10 messages are still visible
4. ✅ Verify: Messages are in correct order (oldest to newest)

### 3. Group Categories

#### Test 3.1: Multiple Categories
1. Log in as admin
2. Create groups in different categories:
   - "Announcements" category: "Important Updates"
   - "Q&A" category: "Help Desk"
   - "General" category: "Random"
3. ✅ Verify: Groups are organized by category in sidebar
4. ✅ Verify: Can collapse/expand categories

#### Test 3.2: Group Navigation
1. Click on different groups
2. ✅ Verify: Messages load for each group
3. ✅ Verify: Selected group is highlighted
4. ✅ Verify: Can switch between groups smoothly

### 4. Permissions & Access Control

#### Test 4.1: Non-member Access
1. Log out
2. Try to access `/communities/[id]`
3. ✅ Verify: Can view community info
4. ✅ Verify: Cannot see group messages
5. ✅ Verify: "Join Community" button is visible

#### Test 4.2: Member Permissions
1. Log in as regular member (not admin)
2. Try to create a group
3. ✅ Verify: "+ Add" button is not visible
4. Try to access settings
5. ✅ Verify: Settings button is not visible

#### Test 4.3: Admin Permissions
1. Log in as admin
2. ✅ Verify: Can create groups
3. ✅ Verify: Can access settings
4. ✅ Verify: Can remove members
5. ✅ Verify: Can delete groups

### 5. Edge Cases & Error Handling

#### Test 5.1: Network Disconnection
1. Open community chat
2. ✅ Verify: Green dot shows "Connected"
3. Disconnect internet
4. ✅ Verify: Dot turns gray (Disconnected)
5. Try to send a message
6. ✅ Verify: Message fails gracefully
7. Reconnect internet
8. ✅ Verify: Dot turns green again
9. Send a message
10. ✅ Verify: Message sends successfully

#### Test 5.2: Empty States
1. Create a new group
2. ✅ Verify: Shows "No messages yet. Start the conversation!"
3. Send first message
4. ✅ Verify: Empty state disappears

#### Test 5.3: Long Messages
1. Type a very long message (500+ characters)
2. Send it
3. ✅ Verify: Message displays correctly
4. ✅ Verify: No layout breaking

#### Test 5.4: Special Characters
1. Send messages with:
   - Emojis: "Hello 👋 🎉"
   - Code: "`const x = 10;`"
   - Links: "https://example.com"
2. ✅ Verify: All display correctly

### 6. Performance Tests

#### Test 6.1: Many Messages
1. Send 100 messages in a group
2. ✅ Verify: Scroll works smoothly
3. ✅ Verify: New messages auto-scroll to bottom
4. ✅ Verify: No lag or freezing

#### Test 6.2: Multiple Groups
1. Create 20 groups
2. ✅ Verify: Sidebar scrolls smoothly
3. ✅ Verify: Can switch between groups quickly
4. ✅ Verify: No performance degradation

#### Test 6.3: Concurrent Users
1. Have 5+ users join the same group
2. All users send messages simultaneously
3. ✅ Verify: All messages appear for all users
4. ✅ Verify: No message loss
5. ✅ Verify: Correct order maintained

## API Testing

### Using cURL

```bash
# Get JWT token first (login)
TOKEN="your-jwt-token"

# Test 1: Get all communities
curl -X GET http://localhost:3000/communities \
  -H "Authorization: Bearer $TOKEN"

# Test 2: Create community
curl -X POST http://localhost:3000/communities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Community",
    "description": "Testing via API",
    "privacy": "public"
  }'

# Test 3: Join community
curl -X POST http://localhost:3000/communities/{id}/join \
  -H "Authorization: Bearer $TOKEN"

# Test 4: Create group
curl -X POST http://localhost:3000/communities/{id}/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Group",
    "type": "chat",
    "category": "General",
    "privacy": "public"
  }'

# Test 5: Send message
curl -X POST http://localhost:3000/communities/groups/{groupId}/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test message via API"
  }'

# Test 6: Get messages
curl -X GET http://localhost:3000/communities/groups/{groupId}/messages \
  -H "Authorization: Bearer $TOKEN"
```

### Using the Test Script

```bash
chmod +x test-community-api.sh
./test-community-api.sh YOUR_JWT_TOKEN
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

## Common Issues & Solutions

### Issue 1: Messages not appearing
**Solution:**
- Check browser console for errors
- Verify WebSocket connection (green dot)
- Check if user is a member of the community
- Verify backend is running

### Issue 2: "Disconnected" status
**Solution:**
- Check if backend is running
- Verify JWT token is valid
- Check CORS settings
- Look at backend logs for errors

### Issue 3: Can't create groups
**Solution:**
- Verify user is admin/moderator
- Check if community exists
- Verify all required fields are filled

### Issue 4: Typing indicator not working
**Solution:**
- Verify WebSocket is connected
- Check if both users are in the same group
- Clear browser cache and reload

## Success Criteria

✅ All test scenarios pass
✅ Real-time messaging works between multiple users
✅ Typing indicators appear and disappear correctly
✅ Messages persist after page refresh
✅ Permissions are enforced correctly
✅ No console errors
✅ Smooth performance with many messages
✅ Graceful error handling

## Next Steps After Testing

1. Fix any bugs found during testing
2. Add message reactions
3. Add file attachments
4. Add message editing/deletion
5. Add read receipts
6. Add user presence (online/offline)
7. Add message search
8. Add notifications

---

**Last Updated**: November 19, 2025
**Status**: Ready for Testing
