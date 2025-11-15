# Check Render Environment Variables

## The Problem

Google OAuth is returning 400 Bad Request because the environment variables aren't being loaded correctly on Render.

## Immediate Fix

### Step 1: Verify Environment Variables in Render

1. Go to: https://dashboard.render.com
2. Click on **pronet-user-service**
3. Click **"Environment"** tab
4. **Verify these variables exist and have correct values:**

```
GOOGLE_CLIENT_ID=1075769500266-gee3kfr5mt1obnc06q2c21vamscfcq0t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://pronet-user-service.onrender.com/api/auth/google/callback
FRONTEND_URL=https://pro-net-ten.vercel.app
```

### Step 2: If Variables Are Missing

If the variables aren't there or are wrong:

1. Click **"Add Environment Variable"**
2. Add each variable one by one
3. Click **"Save Changes"**
4. Service will automatically redeploy

### Step 3: Force Redeploy

After adding/updating variables:

1. Go to **"Manual Deploy"**
2. Click **"Deploy latest commit"**
3. Wait 5-10 minutes for deployment

### Step 4: Test Again

Visit: https://pro-net-ten.vercel.app

Click "Continue with Google" - should work now!

---

## Why This Happens

When deploying with Blueprint, Render should automatically set the environment variables from `render.yaml`. However, sometimes:

1. Variables don't sync properly
2. Service was created before variables were added to render.yaml
3. Variables need to be manually added

## Verification

After setting variables, you can test the OAuth endpoint directly:

```bash
# This should redirect to Google (302)
curl -I https://pronet-user-service.onrender.com/api/auth/google

# If you get 400, env vars aren't set
# If you get 302, env vars are working!
```

---

## Alternative: Update render.yaml and Redeploy

If you want to ensure variables are always set from render.yaml:

1. The render.yaml already has the correct values
2. Delete the service in Render
3. Redeploy using Blueprint
4. Render will read render.yaml and set all variables

---

## Quick Checklist

- [ ] Logged into Render Dashboard
- [ ] Opened pronet-user-service
- [ ] Clicked Environment tab
- [ ] Verified GOOGLE_CLIENT_ID is set
- [ ] Verified GOOGLE_CLIENT_SECRET is set
- [ ] Verified GOOGLE_CALLBACK_URL is set
- [ ] Verified FRONTEND_URL is set
- [ ] Clicked "Save Changes"
- [ ] Waited for redeploy (5-10 min)
- [ ] Tested OAuth again

---

## Expected Values

Copy these exactly into Render:

**GOOGLE_CLIENT_ID:**
```
1075769500266-gee3kfr5mt1obnc06q2c21vamscfcq0t.apps.googleusercontent.com
```

**GOOGLE_CLIENT_SECRET:**
```
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
```

**GOOGLE_CALLBACK_URL:**
```
https://pronet-user-service.onrender.com/api/auth/google/callback
```

**FRONTEND_URL:**
```
https://pro-net-ten.vercel.app
```

---

## Still Getting 400?

If you still get 400 after setting env vars:

1. **Check Google Cloud Console:**
   - Go to: https://console.cloud.google.com/
   - APIs & Services → Credentials
   - Click your OAuth 2.0 Client ID
   - Verify redirect URI: `https://pronet-user-service.onrender.com/api/auth/google/callback`
   - Click Save

2. **Check Render Logs:**
   - Dashboard → pronet-user-service → Logs
   - Look for errors mentioning "google" or "oauth"
   - Should see: "Google OAuth initialized" or similar

3. **Test Direct URL:**
   ```bash
   curl -v https://pronet-user-service.onrender.com/api/auth/google
   ```
   - Should see redirect to `accounts.google.com`
   - If you see 400, env vars still aren't loaded

---

**Most Common Issue:** Environment variables aren't set in Render Dashboard. Check there first!
