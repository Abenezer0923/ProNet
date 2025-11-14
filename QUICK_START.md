# 🚀 ProNet - Quick Start Guide

## ⚡ 30-Second Setup (Local)

```bash
# 1. Install dependencies
cd services/user-service && npm install && cd ../..

# 2. Start everything
docker-compose up --build

# 3. Visit
http://localhost:3000

# 4. Click "Continue with Google" and test!
```

---

## 🌐 30-Minute Production Deploy

### Step 1: Deploy Backend (10 min)
1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click **"New"** → **"Blueprint"**
3. Connect: `Abenezer0923/ProNet`
4. Click **"Apply"**
5. Wait 10-15 minutes

### Step 2: Configure Backend (2 min)
1. Click **pronet-user-service** → **Environment**
2. Add:
   ```
   GOOGLE_CALLBACK_URL=https://pronet-user-service.onrender.com/api/auth/google/callback
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Save (will update after Vercel)

### Step 3: Deploy Frontend (5 min)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import: `Abenezer0923/ProNet`
3. Root Directory: `frontend`
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://pronet-api-gateway.onrender.com
   NEXT_PUBLIC_WS_URL=https://pronet-user-service.onrender.com
   ```
5. Deploy

### Step 4: Update URLs (5 min)
1. Copy your Vercel URL
2. Update Render `FRONTEND_URL` with Vercel URL
3. Go to [Google Console](https://console.cloud.google.com/)
4. Add redirect URI: `https://pronet-user-service.onrender.com/api/auth/google/callback`
5. Add origin: `https://your-app.vercel.app`

### Step 5: Test (2 min)
1. Visit your Vercel URL
2. Click "Continue with Google"
3. Done! 🎉

---

## 📋 Google OAuth Credentials

```
Client ID: 1075769500266-h4qk4amb9du8pl4tnk3beht03dak9sju.apps.googleusercontent.com
Client Secret: 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
```

---

## 🔗 Important Links

### Documentation
- **Full Deployment Guide**: `GOOGLE_OAUTH_DEPLOYMENT.md`
- **OAuth Setup**: `GOOGLE_OAUTH_SETUP.md`
- **URL Reference**: `OAUTH_URLS_REFERENCE.md`
- **Complete Summary**: `OAUTH_SETUP_COMPLETE.md`

### Dashboards
- **Render**: https://dashboard.render.com
- **Vercel**: https://vercel.com/dashboard
- **Google Console**: https://console.cloud.google.com

---

## 🛠️ Helper Commands

### Local Development
```bash
# Start services
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose up --build
```

### Production
```bash
# Configure production URLs
./update-production-urls.sh

# Check if services are running
curl https://pronet-api-gateway.onrender.com/health
curl https://pronet-user-service.onrender.com/health
```

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Redirect URI mismatch" | Check Google Console redirect URIs |
| OAuth button doesn't work | Check `NEXT_PUBLIC_API_URL` in Vercel |
| "Invalid client" | Verify Client ID/Secret are correct |
| Slow first request | Normal for Render free tier (30-60s) |
| CORS error | Check API Gateway is running |

---

## ✅ What's Included

- ✅ LinkedIn-inspired landing page
- ✅ Google OAuth "Continue with Google"
- ✅ Email registration/login
- ✅ Professional dashboard
- ✅ Communities feature
- ✅ Real-time chat
- ✅ Notifications
- ✅ File uploads
- ✅ Search & discovery
- ✅ User profiles
- ✅ Connections

---

## 🎯 Quick Test

### Local
```bash
# 1. Start
docker-compose up

# 2. Visit
http://localhost:3000

# 3. Click "Continue with Google"
# 4. Should work! ✅
```

### Production
```bash
# 1. Visit your Vercel URL
https://your-app.vercel.app

# 2. Click "Continue with Google"
# 3. Should work! ✅
```

---

## 📞 Need Help?

1. Check the detailed guides in the docs folder
2. Review error messages in browser console
3. Check Render/Vercel logs
4. Verify all URLs match exactly

---

**Ready? Let's go! 🚀**

```bash
# Start local development
docker-compose up --build
```

Then visit: http://localhost:3000
