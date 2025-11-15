# Force Render to Sync Environment Variables from render.yaml

## Problem
Even though render.yaml has the correct environment variables, Render Blueprint isn't syncing them to the deployed services.

## Solution: Force Re-sync

### Option 1: Trigger Redeploy from GitHub (RECOMMENDED)

1. **Make a small change to render.yaml:**
   ```bash
   # Add a comment to force git change
   git commit --allow-empty -m "Force Render to re-read render.yaml"
   git push origin main
   ```

2. **In Render Dashboard:**
   - Go to: https://dashboard.render.com
   - Click on **pronet-user-service**
   - Wait for automatic deployment (5-10 minutes)
   - Check logs to verify environment variables are loaded

### Option 2: Delete and Recreate Blueprint

1. **Delete existing services** (keep database!):
   - Go to Render Dashboard
   - Delete `pronet-user-service`
   - Delete `pronet-api-gateway`
   - **DO NOT delete** `pronet-postgres`

2. **Redeploy with Blueprint:**
   - Click **"New"** → **"Blueprint"**
   - Connect: `Abenezer0923/ProNet`
   - Render reads render.yaml
   - Click **"Apply"**
   - Wait 10-15 minutes

### Option 3: Manually Add Environment Variables

If Blueprint still doesn't sync, add them manually:

1. Go to: https://dashboard.render.com
2. Click **pronet-user-service** → **Environment**
3. Add these variables:

```
GOOGLE_CLIENT_ID=1075769500266-gee3kfr5mt1obnc06q2c21vamscfcq0t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://pronet-user-service.onrender.com/auth/google/callback
FRONTEND_URL=https://pro-net-ten.vercel.app
```

4. Click **"Save Changes"**
5. Wait for redeploy

## Verify Environment Variables Are Loaded

After deployment, check Render logs:

1. Dashboard → pronet-user-service → **Logs**
2. Look for startup messages
3. Should NOT see errors about missing GOOGLE_CLIENT_ID

## Test OAuth

After environment variables are synced:

1. Visit: https://pro-net-ten.vercel.app
2. Click "Continue with Google"
3. Should redirect to Google OAuth (not 400 error)
4. Authorize and login successfully

## Why This Happens

Render Blueprint sometimes caches the initial deployment configuration. When you add new environment variables to render.yaml after the initial deployment, they might not sync automatically.

Solutions:
- Force redeploy from GitHub
- Delete and recreate services
- Add variables manually in dashboard

## Current render.yaml Values

```yaml
GOOGLE_CLIENT_ID: 1075769500266-gee3kfr5mt1obnc06q2c21vamscfcq0t.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET: 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
GOOGLE_CALLBACK_URL: https://pronet-user-service.onrender.com/auth/google/callback
FRONTEND_URL: https://pro-net-ten.vercel.app
```

Note: Callback URL is `/auth/google/callback` (no `/api` prefix)

## Quick Check

To verify if env vars are set in Render:

1. Go to Dashboard → pronet-user-service → Environment
2. Look for `GOOGLE_CLIENT_ID` in the list
3. If it's there with the correct value, env vars are synced ✅
4. If it's missing or has wrong value, use Option 3 above

---

**Recommended:** Try Option 1 first (force redeploy), then Option 3 if that doesn't work.
