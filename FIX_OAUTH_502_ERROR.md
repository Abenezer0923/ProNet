# 🔧 Fix OAuth 502 Error - Complete Guide

## 🎯 Problem
Getting 502 error when clicking "Continue with Google" because:
1. Frontend was routing through API Gateway (which sleeps on Render free tier)
2. OAuth should go **directly to User Service**, not through gateway

## ✅ What I've Fixed

### 1. Updated Frontend Code
- Changed OAuth to point directly to User Service
- Added `NEXT_PUBLIC_AUTH_URL` environment variable

### 2. Local Environment
- Updated `frontend/.env.local` with new auth URL

## 🚀 What You Need to Do

### Step 1: Update Vercel Environment Variables (2 minutes)

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Add this new variable:**
```
NEXT_PUBLIC_AUTH_URL = https://pronet-user-service.onrender.com
```

**Verify these existing variables:**
```
NEXT_PUBLIC_API_URL = https://pronet-api-gateway.onrender.com
NEXT_PUBLIC_WS_URL = https://pronet-user-service.onrender.com
```

Click **"Save"**

### Step 2: Redeploy Frontend (1 minute)

After adding the environment variable, Vercel will ask to redeploy. Click **"Redeploy"** or:

```bash
# Push the updated code to trigger auto-deploy
git add .
git commit -m "Fix OAuth to use direct user service URL"
git push origin main
```

### Step 3: Verify Google OAuth Console (Already Done ✅)

Your Google OAuth should already have these redirect URIs:
```
https://pronet-user-service.onrender.com/auth/google/callback
```

If not, add it at: https://console.cloud.google.com/apis/credentials

### Step 4: Verify Render Environment Variables (Already Done ✅)

Your Render User Service should have:
```
GOOGLE_CLIENT_ID = [Your Google Client ID]
GOOGLE_CLIENT_SECRET = [Your Google Client Secret]
GOOGLE_CALLBACK_URL = https://pronet-user-service.onrender.com/auth/google/callback
FRONTEND_URL = https://pro-net-ten.vercel.app
```

## 🧪 Testing

### Production Test:
1. Go to: https://pro-net-ten.vercel.app
2. Click "Continue with Google"
3. Should redirect to: `https://pronet-user-service.onrender.com/auth/google`
4. Complete Google sign-in
5. Should redirect back to: `https://pro-net-ten.vercel.app/auth/callback`

### Local Test:
```bash
# Start services
docker-compose up

# Visit
http://localhost:3000

# Click "Continue with Google"
# Should work perfectly!
```

## 📊 Architecture Flow

### ❌ OLD (Broken):
```
Frontend → API Gateway (502 error) → User Service
```

### ✅ NEW (Fixed):
```
Frontend → User Service (direct) → Google OAuth → Callback
```

## 🔍 Why This Fixes It

1. **No Gateway Dependency**: OAuth doesn't need to go through the gateway
2. **No Sleep Issues**: Direct connection to User Service
3. **Faster**: One less hop in the authentication flow
4. **More Reliable**: Fewer points of failure

## 🎉 Expected Result

After completing Step 1 & 2:
- Click "Continue with Google" on production
- Redirects to Google sign-in
- After signing in, returns to your app
- You're logged in! 🎊

---

**Need help?** Check the Render logs:
```
https://dashboard.render.com → pronet-user-service → Logs
```
