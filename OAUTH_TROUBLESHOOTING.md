# Google OAuth Troubleshooting - 400 Bad Request

## Issue
Getting "Error 400 (Bad Request)" from Google when clicking "Continue with Google"

## Root Cause
The Google OAuth endpoint URL is incorrect or the redirect URI doesn't match what's configured in Google Cloud Console.

## Solution Checklist

### 1. Verify Vercel Environment Variables

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Required variables:**
```
NEXT_PUBLIC_API_URL=https://pronet-api-gateway.onrender.com
NEXT_PUBLIC_WS_URL=https://pronet-user-service.onrender.com
```

**Important:** No `/api` suffix! The API Gateway handles routing.

### 2. Verify Google Cloud Console Configuration

Go to: https://console.cloud.google.com/ → APIs & Services → Credentials

**Your OAuth 2.0 Client ID:**
```
Client ID: 1075769500266-gee3kfr5mt1obnc06q2c21vamscfcq0t.apps.googleusercontent.com
Client Secret: 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
```

**Authorized redirect URIs (must include ALL of these):**
```
http://localhost:3001/api/auth/google/callback
https://pronet-user-service.onrender.com/api/auth/google/callback
```

**Authorized JavaScript origins:**
```
http://localhost:3000
https://pro-net-ten.vercel.app
```

### 3. Verify Render Environment Variables

Go to: https://dashboard.render.com → pronet-user-service → Environment

**Required variables:**
```
GOOGLE_CLIENT_ID=1075769500266-gee3kfr5mt1obnc06q2c21vamscfcq0t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://pronet-user-service.onrender.com/api/auth/google/callback
FRONTEND_URL=https://pro-net-ten.vercel.app
```

### 4. Test the OAuth Flow

**Step 1: Test API Gateway is running**
```bash
curl https://pronet-api-gateway.onrender.com/health
```

**Step 2: Test User Service is running**
```bash
curl https://pronet-user-service.onrender.com/health
```

**Step 3: Test OAuth endpoint (should redirect)**
```bash
curl -I https://pronet-api-gateway.onrender.com/auth/google
# Should return 302 redirect to Google
```

**Step 4: Test direct User Service OAuth**
```bash
curl -I https://pronet-user-service.onrender.com/api/auth/google
# Should return 302 redirect to Google
```

### 5. Common Issues

#### Issue: "redirect_uri_mismatch"
**Cause:** Redirect URI in Google Console doesn't match the callback URL

**Solution:**
1. Check Google Console redirect URIs
2. Must be exactly: `https://pronet-user-service.onrender.com/api/auth/google/callback`
3. No trailing slash
4. Must be HTTPS in production

#### Issue: "invalid_client"
**Cause:** Client ID or Secret is wrong

**Solution:**
1. Verify credentials in Render match Google Console
2. Check for extra spaces or line breaks
3. Redeploy service after updating

#### Issue: "access_denied"
**Cause:** OAuth consent screen not configured

**Solution:**
1. Go to Google Console → OAuth consent screen
2. Add test users (if in testing mode)
3. Or publish the app

#### Issue: 400 Bad Request
**Cause:** Missing or incorrect parameters in OAuth request

**Solution:**
1. Check that `passport-google-oauth20` is installed
2. Verify Google strategy is configured correctly
3. Check Render logs for errors

### 6. Check Render Logs

1. Go to: https://dashboard.render.com
2. Click on **pronet-user-service**
3. Click **"Logs"** tab
4. Look for errors related to:
   - `passport`
   - `google`
   - `oauth`
   - `GOOGLE_CLIENT_ID`

Common log errors:
```
Error: Missing required parameter: client_id
Error: Invalid client_id
Error: redirect_uri_mismatch
```

### 7. Verify Package Installation

The `passport-google-oauth20` package must be installed on Render.

**Check package.json:**
```json
{
  "dependencies": {
    "passport-google-oauth20": "^2.0.0"
  },
  "devDependencies": {
    "@types/passport-google-oauth20": "^2.0.11"
  }
}
```

**If missing, add and redeploy:**
```bash
cd services/user-service
npm install passport-google-oauth20 @types/passport-google-oauth20
git add package.json package-lock.json
git commit -m "Add Google OAuth dependencies"
git push origin main
```

### 8. OAuth Flow Diagram

```
User clicks "Continue with Google"
    ↓
Frontend: https://pro-net-ten.vercel.app
    ↓
Redirects to: https://pronet-api-gateway.onrender.com/auth/google
    ↓
API Gateway proxies to: https://pronet-user-service.onrender.com/api/auth/google
    ↓
User Service redirects to: Google OAuth consent screen
    ↓
User authorizes
    ↓
Google redirects to: https://pronet-user-service.onrender.com/api/auth/google/callback
    ↓
User Service generates JWT token
    ↓
Redirects to: https://pro-net-ten.vercel.app/auth/callback?token=xxx
    ↓
Frontend stores token and redirects to dashboard
```

### 9. Quick Fix Commands

**Redeploy Render services:**
```bash
# Push any change to trigger redeploy
git commit --allow-empty -m "Trigger Render redeploy"
git push origin main
```

**Redeploy Vercel:**
```bash
# Go to Vercel Dashboard
# Click on deployment → "Redeploy"
```

**Check if services are awake (Render free tier sleeps):**
```bash
# Wake up services (takes 30-60 seconds)
curl https://pronet-api-gateway.onrender.com/health
curl https://pronet-user-service.onrender.com/health
```

### 10. Test Locally First

Before debugging production, test locally:

```bash
# Start services
docker-compose up

# Visit
http://localhost:3000

# Click "Continue with Google"
# Should work locally
```

If it works locally but not in production:
- Environment variables are different
- Check Vercel and Render env vars match local `.env` files

---

## Current Configuration

### Production URLs
- **Frontend**: https://pro-net-ten.vercel.app
- **API Gateway**: https://pronet-api-gateway.onrender.com
- **User Service**: https://pronet-user-service.onrender.com

### OAuth Endpoints
- **Initiate**: `https://pronet-api-gateway.onrender.com/auth/google`
- **Callback**: `https://pronet-user-service.onrender.com/api/auth/google/callback`
- **Frontend Callback**: `https://pro-net-ten.vercel.app/auth/callback`

### Expected Behavior
1. User clicks button
2. Redirected to Google
3. Authorizes app
4. Redirected back to app
5. Logged in and on dashboard

---

## Still Not Working?

1. **Check all environment variables** are set correctly
2. **Verify Google Console** redirect URIs match exactly
3. **Check Render logs** for specific errors
4. **Test locally** to isolate the issue
5. **Wait 30-60 seconds** for Render services to wake up
6. **Clear browser cache** and try again

---

**Need more help?** Check the Render logs for specific error messages.
