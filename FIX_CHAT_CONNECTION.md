# 🔧 Fix Chat Connection Issue

## Problem
Chat page shows "Disconnected" status - WebSocket connection is not establishing.

## Root Cause
The new Socket.IO dependencies haven't been installed in the Docker containers yet.

---

## ✅ Solution: Rebuild Docker Containers

### Step 1: Stop All Containers
```bash
docker-compose down
```

### Step 2: Remove Old Images (Optional but Recommended)
```bash
# Remove old images to force fresh build
docker-compose down --rmi all

# Or just remove specific images
docker rmi pronet-frontend pronet-user-service
```

### Step 3: Rebuild Containers
```bash
# Rebuild without cache to ensure dependencies are installed
docker-compose build --no-cache

# Or rebuild specific services
docker-compose build --no-cache frontend user-service
```

### Step 4: Start Containers
```bash
docker-compose up -d
```

### Step 5: Verify Services are Running
```bash
# Check all services
docker-compose ps

# Check logs for errors
docker-compose logs -f user-service
docker-compose logs -f frontend
```

### Step 6: Verify Dependencies are Installed

**Check Backend:**
```bash
docker-compose exec user-service npm list socket.io
docker-compose exec user-service npm list @nestjs/websockets
```

**Check Frontend:**
```bash
docker-compose exec frontend npm list socket.io-client
```

---

## 🧪 Test the Connection

1. **Open Browser Console** (F12)
2. **Go to** `http://localhost:3100/chat`
3. **Check Console for**:
   - ✅ "Socket connected" - Connection successful
   - ❌ "Socket connection error" - Connection failed

---

## 🐛 If Still Not Working

### Check 1: Verify User Service is Running
```bash
curl http://localhost:3001
# Should return: Cannot GET /
```

### Check 2: Check WebSocket Port
```bash
# Check if port 3001 is listening
netstat -an | grep 3001

# Or on Linux
ss -tuln | grep 3001
```

### Check 3: Check User Service Logs
```bash
docker-compose logs user-service | grep -i websocket
docker-compose logs user-service | grep -i socket
docker-compose logs user-service | grep -i chat
```

### Check 4: Verify JWT Token Exists
Open browser console and run:
```javascript
localStorage.getItem('token')
// Should return a JWT token string
```

### Check 5: Test WebSocket Connection Manually
Open browser console and run:
```javascript
const io = require('socket.io-client');
const token = localStorage.getItem('token');
const socket = io('http://localhost:3001/chat', {
  auth: { token },
  transports: ['websocket', 'polling']
});

socket.on('connect', () => console.log('Connected!'));
socket.on('connect_error', (err) => console.error('Error:', err));
```

---

## 🔍 Common Issues

### Issue 1: "Cannot find module 'socket.io-client'"
**Solution**: Dependencies not installed
```bash
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

### Issue 2: "CORS error"
**Solution**: Check CORS configuration in `services/user-service/src/chat/chat.gateway.ts`
```typescript
@WebSocketGateway({
  cors: {
    origin: '*',  // Should allow all origins in development
    credentials: true,
  },
  namespace: '/chat',
})
```

### Issue 3: "Unauthorized" or "Invalid token"
**Solution**: 
1. Logout and login again to get fresh token
2. Check JWT_SECRET matches in user-service

### Issue 4: Port 3001 not accessible
**Solution**: Check docker-compose.yml has correct port mapping
```yaml
user-service:
  ports:
    - "3001:3001"
```

---

## 📝 Quick Fix Script

Create a file `rebuild-chat.sh`:
```bash
#!/bin/bash
echo "🛑 Stopping containers..."
docker-compose down

echo "🗑️  Removing old images..."
docker rmi pronet-frontend pronet-user-service 2>/dev/null || true

echo "🔨 Rebuilding containers..."
docker-compose build --no-cache frontend user-service

echo "🚀 Starting containers..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "✅ Checking services..."
docker-compose ps

echo "📋 Checking logs..."
docker-compose logs --tail=50 user-service | grep -i "running\|error\|websocket"

echo "✨ Done! Check http://localhost:3100/chat"
```

Make it executable and run:
```bash
chmod +x rebuild-chat.sh
./rebuild-chat.sh
```

---

## ✅ Success Indicators

You'll know it's working when you see:

1. **In Browser Console**:
   ```
   Socket connected
   ```

2. **In User Service Logs**:
   ```
   User {userId} connected to chat
   ```

3. **On Chat Page**:
   - Green dot next to "Connected"
   - Can send messages
   - Messages appear in real-time

---

## 🆘 Still Having Issues?

1. **Check all logs**:
   ```bash
   docker-compose logs -f
   ```

2. **Restart everything**:
   ```bash
   docker-compose restart
   ```

3. **Nuclear option** (clean slate):
   ```bash
   docker-compose down -v
   docker system prune -a
   docker-compose up -d --build
   ```

---

## 📞 Need More Help?

Check these files:
- `CHAT_IMPLEMENTATION_GUIDE.md` - Full implementation details
- `docker-compose.yml` - Service configuration
- `services/user-service/src/chat/chat.gateway.ts` - WebSocket gateway
- `frontend/src/contexts/SocketContext.tsx` - Socket connection logic
