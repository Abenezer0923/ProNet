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

## 🚀 YOUR ACTION ITEMS (5 minutes)

### Step 1: Add Environment Variable to Vercel

Go to: **https://vercel.com/dashboard** → Your Project → **Settings** → **Environment Variables**

**Add this new variable:**
```
Name: NEXT_PUBLIC_AUTH_URL
Value: https://pronet-user-service.onrender.com
Environment: Production, Preview, Development (select all)
```

Click **Save**

### Step 2: Redeploy Frontend

Vercel will prompt you to redeploy. Click **"Redeploy"**

OR push the changes:
```bash
git add .
git commit -m "Fix OAuth 502 error - use direct user service URL"
git push origin main
```

### Step 3: Verify Google OAuth Console

Make sure your Google OAuth client has these redirect URIs:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://pro-net-ten.vercel.app
```

**Authorized redirect URIs:**
```
http://localhost:3001/auth/google/callback
https://pronet-user-service.onrender.com/auth/google/callback
```

Visit: https://console.cloud.google.com/apis/credentials

### Step 4: Verify Render Environment Variables

Your Render User Service should have these variables set:
- `GOOGLE_CLIENT_ID` (your Google OAuth client ID)
- `GOOGLE_CLIENT_SECRET` (your Google OAuth client secret)
- `GOOGLE_CALLBACK_URL` = `https://pronet-user-service.onrender.com/auth/google/callback`
- `FRONTEND_URL` = `https://pro-net-ten.vercel.app`

Visit: https://dashboard.render.com → pronet-user-service → Environment

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

## 🐛 Troubleshooting

### "Service Unavailable" or takes long to load
**Cause:** Render free tier services sleep after 15 min of inactivity  
**Fix:** Visit https://pronet-user-service.onrender.com to wake it up (takes 30-60 seconds)

### Still getting 502
**Check:**
1. Did you add `NEXT_PUBLIC_AUTH_URL` to Vercel? ✓
2. Did you redeploy the frontend? ✓
3. Is the User Service awake? Visit the URL above ✓

### OAuth redirects but doesn't log in
**Check Render logs:**
```
https://dashboard.render.com → pronet-user-service → Logs
```

Look for errors related to Google OAuth configuration.

## 📝 Environment Variables Checklist

### Vercel (Frontend)
- [x] `NEXT_PUBLIC_API_URL` = `https://pronet-api-gateway.onrender.com`
- [x] `NEXT_PUBLIC_WS_URL` = `https://pronet-user-service.onrender.com`
- [ ] `NEXT_PUBLIC_AUTH_URL` = `https://pronet-user-service.onrender.com` ← **ADD THIS**

### Render (User Service)
- [x] `GOOGLE_CLIENT_ID` (from Google Console)
- [x] `GOOGLE_CLIENT_SECRET` (from Google Console)
- [x] `GOOGLE_CALLBACK_URL` = `https://pronet-user-service.onrender.com/auth/google/callback`
- [x] `FRONTEND_URL` = `https://pro-net-ten.vercel.app`

## 🎉 Success Criteria

When everything works:
1. Click "Continue with Google" on homepage
2. Redirects to Google sign-in page
3. After signing in, returns to ProNet
4. You see your dashboard/profile
5. No 502 errors!

## 🔗 Quick Links
- Frontend: https://pro-net-ten.vercel.app
- User Service: https://pronet-user-service.onrender.com
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- Google Console: https://console.cloud.google.com/apis/credentials

---

**Questions?** Check the Render logs or run `./verify-oauth-setup.sh`
