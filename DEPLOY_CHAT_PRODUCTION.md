# 🚀 Deploy Chat System to Production

## Problem
Chat shows "Disconnected" on deployed version (Vercel + Render) because WebSocket connections need special configuration.

---

## 🎯 Solution Options

### Option 1: Deploy User Service Separately on Render (Recommended)

Since WebSocket needs a persistent connection, deploy the user-service as a separate service.

#### Step 1: Create New Render Service for User Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `pronet-user-service`
   - **Root Directory**: `services/user-service`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free

#### Step 2: Add Environment Variables

In Render dashboard for user-service, add:
```
DATABASE_HOST=<your-postgres-host>
DATABASE_PORT=5432
DATABASE_USER=<your-db-user>
DATABASE_PASSWORD=<your-db-password>
DATABASE_NAME=<your-db-name>
JWT_SECRET=<your-secret-key>
PORT=3001
NODE_ENV=production
```

#### Step 3: Update Vercel Environment Variables

In Vercel dashboard, add/update:
```
NEXT_PUBLIC_API_URL=https://pronet-api-gateway.onrender.com
NEXT_PUBLIC_WS_URL=https://pronet-user-service.onrender.com
```

#### Step 4: Redeploy Frontend

```bash
git add -A
git commit -m "feat: Configure WebSocket for production"
git push origin main
```

Vercel will auto-deploy with new environment variables.

---

### Option 2: Use API Gateway as WebSocket Proxy

If you want to keep everything through the API gateway:

#### Step 1: Update API Gateway to Proxy WebSocket

Edit `services/api-gateway/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Proxy WebSocket connections to user-service
  const wsProxy = createProxyMiddleware({
    target: process.env.USER_SERVICE_URL || 'http://user-service:3001',
    changeOrigin: true,
    ws: true, // Enable WebSocket proxying
    pathFilter: '/socket.io/**',
  });

  app.use(wsProxy);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API Gateway running on port ${port}`);
}
bootstrap();
```

#### Step 2: Update Frontend to Use API Gateway URL

In Vercel, set:
```
NEXT_PUBLIC_WS_URL=https://pronet-api-gateway.onrender.com
```

---

### Option 3: Use External WebSocket Service (Production-Ready)

For a production app, consider using a managed WebSocket service:

1. **Pusher** - https://pusher.com
2. **Ably** - https://ably.com
3. **Socket.IO Cloud** - https://socket.io/cloud

These services handle WebSocket connections at scale.

---

## 🔍 Debugging Production WebSocket

### Check 1: Verify Backend is Accessible

```bash
curl https://pronet-user-service.onrender.com
# Should return something (not 404)
```

### Check 2: Test WebSocket Connection

Open browser console on production site:
```javascript
const io = require('socket.io-client');
const token = localStorage.getItem('token');
const socket = io('https://pronet-user-service.onrender.com/chat', {
  auth: { token },
  transports: ['websocket', 'polling']
});

socket.on('connect', () => console.log('✅ Connected!'));
socket.on('connect_error', (err) => console.error('❌ Error:', err));
```

### Check 3: Check Render Logs

In Render dashboard:
1. Go to your user-service
2. Click "Logs"
3. Look for WebSocket connection attempts

---

## ⚠️ Important Notes

### Render Free Tier Limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- WebSocket connections may drop when service spins down
- **Solution**: Upgrade to paid plan ($7/month) for always-on service

### Vercel Limitations:
- Vercel doesn't support WebSocket on serverless functions
- Frontend must connect to external WebSocket server
- **Solution**: Deploy backend on Render/Railway/Heroku

---

## 🎯 Recommended Production Setup

For a production-ready chat system:

```
┌─────────────────┐
│   Vercel        │  Frontend (Next.js)
│   (Frontend)    │  https://pronet.vercel.app
└────────┬────────┘
         │
         │ HTTP/HTTPS
         │
┌────────▼────────┐
│   Render        │  API Gateway
│   (Gateway)     │  https://pronet-api-gateway.onrender.com
└────────┬────────┘
         │
         │ HTTP
         │
┌────────▼────────┐
│   Render        │  User Service + WebSocket
│   (User Svc)    │  https://pronet-user-service.onrender.com
└────────┬────────┘
         │
         │
┌────────▼────────┐
│   Render        │  PostgreSQL Database
│   (Database)    │
└─────────────────┘
```

---

## 📝 Quick Setup Script

Create `deploy-chat.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying Chat System to Production"
echo ""

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    echo "Installing Render CLI..."
    npm install -g @render/cli
fi

echo "📦 Step 1: Deploying User Service to Render..."
# You'll need to configure this with your Render account
# render deploy --service=pronet-user-service

echo ""
echo "🌐 Step 2: Updating Vercel Environment Variables..."
echo "Go to: https://vercel.com/your-username/pronet/settings/environment-variables"
echo ""
echo "Add these variables:"
echo "  NEXT_PUBLIC_WS_URL=https://pronet-user-service.onrender.com"
echo ""

echo "✅ Step 3: Commit and push changes..."
git add -A
git commit -m "feat: Configure production WebSocket"
git push origin main

echo ""
echo "⏳ Waiting for Vercel deployment..."
echo "Check: https://vercel.com/your-username/pronet"
echo ""
echo "✨ Done! Test at: https://pronet.vercel.app/chat"
```

---

## ✅ Verification Checklist

After deployment:

- [ ] User service is deployed and accessible
- [ ] Environment variables are set in Vercel
- [ ] Frontend redeploys with new env vars
- [ ] Can access chat page without errors
- [ ] Browser console shows "Socket connected"
- [ ] Can send messages between users
- [ ] Messages persist after page refresh

---

## 🆘 Still Not Working?

### Quick Fixes:

1. **Check Render service is running**:
   - Go to Render dashboard
   - Ensure service is "Live" (not "Suspended")

2. **Check environment variables**:
   - Vercel: Settings → Environment Variables
   - Render: Service → Environment

3. **Check CORS**:
   - Ensure backend allows your Vercel domain
   - Check `services/user-service/src/chat/chat.gateway.ts`

4. **Upgrade Render plan**:
   - Free tier has limitations
   - Paid plan ($7/month) keeps service always-on

---

## 💡 Alternative: Disable Chat in Production

If you want to launch without chat for now:

1. Hide chat link in dashboard
2. Add "Coming Soon" message on chat page
3. Deploy chat later when you have paid hosting

This is totally fine for MVP! You can add chat later.

---

**Need help?** Check the Render logs and browser console for specific error messages.
