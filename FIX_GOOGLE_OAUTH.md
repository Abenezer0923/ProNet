# Fix Google OAuth 400 Error

## Problem
Google OAuth returns "400 - malformed or illegal request" because the redirect URI is not authorized.

## Solution

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials

### Step 2: Find Your OAuth 2.0 Client ID
- Look for: `716006181490-r1fvklb9s9b26nk7jdmf69vf315b9uaa.apps.googleusercontent.com`
- Click on it to edit

### Step 3: Add ONLY This Authorized Redirect URI
Under "Authorized redirect URIs", make sure you have:

```
https://pronet-user-service-qpe6.onrender.com/api/auth/google/callback
```

**Remove any other redirect URIs** (like the API gateway URL) to avoid confusion.

### Step 4: Save Changes
- Click "SAVE" button
- Wait 5-10 minutes for changes to propagate

### Step 5: How It Works Now
1. Frontend button → `https://pronet-api-gateway-qpe6.onrender.com/api/auth/google`
2. API Gateway redirects → `https://pronet-user-service-qpe6.onrender.com/api/auth/google`
3. User Service redirects → Google OAuth
4. Google redirects back → `https://pronet-user-service-qpe6.onrender.com/api/auth/google/callback`
5. User Service redirects → Frontend with token

### Step 6: Test
Try Google login again from your frontend.

---

## Architecture

```
Frontend (Vercel)
    ↓
API Gateway (Render) - Redirects OAuth requests
    ↓
User Service (Render) - Handles OAuth flow
    ↓
Google OAuth
    ↓
User Service - Processes callback
    ↓
Frontend - Receives token
```

---

## Keep-Alive Service (Render Spin-Down Prevention)

The service now includes an automatic keep-alive feature that:

✅ **Pings the service every 14 minutes** to prevent Render free tier spin-down
✅ **Extra pings during peak hours** (9 AM - 9 PM UTC) every 10 minutes
✅ **Only runs in production** on Render (won't affect local development)
✅ **Automatic** - no manual intervention needed

### How It Works:
- Uses NestJS `@Cron` decorators
- Pings `/api/health` endpoint
- Logs success/failure for monitoring
- Runs in background automatically

### Monitoring:
Check Render logs to see keep-alive pings:
```
✅ Keep-alive ping successful
✅ Peak hours keep-alive ping
```

---

## Summary

**Issue 1: Google OAuth** ✅ Fixed by:
- API Gateway now redirects OAuth requests to User Service
- Only User Service URL needed in Google Cloud Console

**Issue 2: Render Spin-Down** ✅ Fixed with automatic keep-alive service

Both fixes are now deployed!

