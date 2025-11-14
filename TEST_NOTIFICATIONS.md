# 🔔 Test Notifications System

## ✅ What's Been Implemented

### Backend:
- ✅ Notification entity and database table
- ✅ REST API endpoints for notifications
- ✅ Auto-create notifications on user actions
- ✅ Notification types: follow, message, like, comment
- ✅ Mark as read/unread functionality
- ✅ Delete notifications
- ✅ Unread count tracking

### Frontend:
- ✅ Notification bell in header with badge
- ✅ Dropdown with recent notifications
- ✅ Full notifications page
- ✅ Real-time updates via WebSocket
- ✅ Mark as read/delete actions
- ✅ Click to navigate to relevant page

---

## 🧪 How to Test

### Test 1: Follow Notification

1. **Create 2 accounts** (use different browsers)
2. **Account A**: Login and go to dashboard
3. **Account B**: Go to Account A's profile
4. **Account B**: Click "Follow" button
5. **Account A**: Should see:
   - Bell icon shows badge with "1"
   - Click bell to see notification
   - "John Doe started following you"
   - Click notification → Goes to Account B's profile

### Test 2: Message Notification

1. **Account A & B**: Both logged in
2. **Account B**: Go to connections
3. **Account B**: Click "Message" next to Account A
4. **Account B**: Send a message
5. **Account A**: Should see:
   - Bell badge increases
   - New notification: "John Doe sent you a message"
   - Click notification → Goes to chat

### Test 3: Like Notification

1. **Account A**: Create a post in a community
2. **Account B**: Go to that community
3. **Account B**: Like Account A's post
4. **Account A**: Should see:
   - Bell badge increases
   - "John Doe liked your post"
   - Click notification → Goes to post

### Test 4: Comment Notification

1. **Account A**: Has a post in community
2. **Account B**: Comment on Account A's post
3. **Account A**: Should see:
   - Bell badge increases
   - "John Doe commented on your post"
   - Click notification → Goes to post

### Test 5: Mark as Read

1. **Click bell icon** to open dropdown
2. **Click a notification** → Badge count decreases
3. **Notification background** changes from blue to white
4. **Click "Mark all as read"** → All notifications marked

### Test 6: Notifications Page

1. **Click "View all notifications"** in dropdown
2. **See full history** of all notifications
3. **Click mark as read** icon → Marks individual notification
4. **Click delete** icon → Removes notification
5. **Click notification** → Navigates to relevant page

### Test 7: Real-time Updates

1. **Keep Account A on dashboard**
2. **Account B**: Follow, message, like, or comment
3. **Account A**: Should see:
   - Bell badge updates instantly
   - No page refresh needed
   - Notification appears in real-time

---

## 📊 Expected Behavior

### Notification Bell:
- Shows unread count badge
- Badge disappears when all read
- Dropdown shows 5 most recent
- Click outside closes dropdown

### Notifications:
- Unread notifications have blue background
- Read notifications have white background
- Each notification has icon based on type:
  - 👤 Follow
  - 💬 Message
  - ❤️ Like
  - 💭 Comment
- Time ago format (just now, 5m ago, 2h ago, etc.)

### Actions:
- Click notification → Navigate to relevant page
- Mark as read → Badge count decreases
- Delete → Notification removed
- Mark all as read → All notifications marked

---

## 🐛 Troubleshooting

### Issue: No notifications appearing

**Check**:
1. Backend is running
2. Database has notifications table
3. User is logged in
4. Actions are being performed (follow, like, etc.)

**Solution**:
```bash
# Check backend logs
docker-compose logs user-service | grep notification

# Check database
docker-compose exec postgres psql -U postgres -d profession_db -c "SELECT * FROM notifications;"
```

### Issue: Badge not updating

**Check**:
1. WebSocket is connected
2. NotificationContext is loaded
3. Browser console for errors

**Solution**:
- Refresh page
- Check WebSocket connection status
- Verify real-time updates are working

### Issue: Notifications not creating

**Check**:
1. Backend services are integrated
2. NotificationsService is injected
3. Methods are being called

**Solution**:
- Check backend logs for errors
- Verify notification creation in database
- Test API endpoints directly

---

## 🎯 Success Criteria

- ✅ Notifications created automatically on actions
- ✅ Bell badge shows correct unread count
- ✅ Dropdown displays recent notifications
- ✅ Click notification navigates correctly
- ✅ Mark as read updates badge
- ✅ Delete removes notification
- ✅ Real-time updates work without refresh
- ✅ Notifications page shows full history
- ✅ UI is responsive and intuitive

---

## 📝 API Endpoints to Test

```bash
# Get notifications
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/notifications

# Get unread count
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/notifications/unread-count

# Mark as read
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/notifications/NOTIFICATION_ID/read

# Mark all as read
curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/notifications/read-all

# Delete notification
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/notifications/NOTIFICATION_ID
```

---

## 🚀 Next Steps

Once notifications are working:

1. **Test all notification types**
2. **Verify real-time delivery**
3. **Check mobile responsiveness**
4. **Test with multiple users**
5. **Verify database persistence**

---

**🎉 Notifications system is complete! Test it out and enjoy real-time updates!**
