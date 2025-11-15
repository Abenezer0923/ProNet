# Google Cloud Console Setup Guide (2025 Interface)

## Step-by-Step Guide for New Google Cloud Console

### Step 1: Access Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. Select your project (or create a new one)

### Step 2: Navigate to APIs & Services

**Option A: Using the hamburger menu (☰)**
1. Click the hamburger menu (☰) in the top left
2. Scroll down to **"APIs & Services"**
3. Click **"Credentials"**

**Option B: Using search**
1. Click the search bar at the top
2. Type: "Credentials"
3. Click on **"Credentials - APIs & Services"**

**Option C: Direct link**
- Go to: https://console.cloud.google.com/apis/credentials

### Step 3: Find Your OAuth Client

On the Credentials page, you should see:
- **OAuth 2.0 Client IDs** section
- Your client ID: `1075769500266-gee3kfr5mt1obnc06q2c21vamscfcq0t`

**If you don't see it:**
1. Click **"+ CREATE CREDENTIALS"** button at the top
2. Select **"OAuth client ID"**
3. Choose **"Web application"**
4. Give it a name: "ProNet Web Client"

### Step 4: Configure OAuth Client

Click on your OAuth client ID name to edit it.

You'll see these sections:

#### A. **Authorized JavaScript origins**

Click **"+ ADD URI"** and add these URLs:

```
http://localhost:3000
```

```
https://pro-net-ten.vercel.app
```

#### B. **Authorized redirect URIs**

Click **"+ ADD URI"** and add these URLs:

```
http://localhost:3001/auth/google/callback
```

```
https://pronet-user-service.onrender.com/auth/google/callback
```

**Important Notes:**
- URLs must be exact (no trailing slashes)
- Use HTTPS for production URLs
- Use HTTP only for localhost

### Step 5: Save Changes

1. Scroll to the bottom
2. Click **"SAVE"** button
3. Wait a few seconds for changes to propagate

### Step 6: Copy Your Credentials

You should see:
- **Client ID**: `1075769500266-gee3kfr5mt1obnc06q2c21vamscfcq0t.apps.googleusercontent.com`
- **Client secret**: `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`

(These are already configured in your Render environment variables)

---

## OAuth Consent Screen (If Not Configured)

If you see a warning about OAuth consent screen:

### Step 1: Configure Consent Screen

1. Go to **"OAuth consent screen"** tab (left sidebar)
2. Choose **"External"** (for public apps)
3. Click **"CREATE"**

### Step 2: Fill in App Information

**App information:**
- App name: `ProNet`
- User support email: Your email
- App logo: (optional)

**App domain:**
- Application home page: `https://pro-net-ten.vercel.app`
- Privacy policy: (optional for testing)
- Terms of service: (optional for testing)

**Developer contact:**
- Email: Your email

Click **"SAVE AND CONTINUE"**

### Step 3: Scopes

1. Click **"ADD OR REMOVE SCOPES"**
2. Select:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
3. Click **"UPDATE"**
4. Click **"SAVE AND CONTINUE"**

### Step 4: Test Users (If in Testing Mode)

If your app is in "Testing" mode:
1. Click **"+ ADD USERS"**
2. Add your email address
3. Click **"ADD"**
4. Click **"SAVE AND CONTINUE"**

### Step 5: Summary

Review and click **"BACK TO DASHBOARD"**

---

## Verification Checklist

After setup, verify:

- [ ] OAuth client ID exists
- [ ] Client ID matches: `1075769500266-gee3kfr5mt1obnc06q2c21vamscfcq0t`
- [ ] Authorized JavaScript origins include:
  - `http://localhost:3000`
  - `https://pro-net-ten.vercel.app`
- [ ] Authorized redirect URIs include:
  - `http://localhost:3001/auth/google/callback`
  - `https://pronet-user-service.onrender.com/auth/google/callback`
- [ ] OAuth consent screen is configured
- [ ] Your email is added as test user (if in testing mode)

---

## Common Issues

### Issue: Can't find Credentials page

**Solution:**
- Use direct link: https://console.cloud.google.com/apis/credentials
- Make sure you're in the correct project (check project name at top)

### Issue: "OAuth consent screen not configured"

**Solution:**
- Go to "OAuth consent screen" tab
- Follow the consent screen setup steps above

### Issue: "Redirect URI mismatch" error

**Solution:**
- Double-check the redirect URIs are exactly:
  - `https://pronet-user-service.onrender.com/auth/google/callback`
- No `/api` prefix
- No trailing slash
- Must be HTTPS (not HTTP) for production

### Issue: "Access blocked: This app's request is invalid"

**Solution:**
- Make sure OAuth consent screen is configured
- Add your email as a test user
- Or publish the app (if ready for production)

---

## Testing OAuth

After configuration:

1. Visit: https://pro-net-ten.vercel.app
2. Click "Continue with Google"
3. You should see Google's consent screen
4. Authorize the app
5. Get redirected back and logged in ✅

---

## Screenshots Guide (What to Look For)

### Credentials Page
- Look for: "OAuth 2.0 Client IDs" section
- Your client should be listed there
- Click on it to edit

### OAuth Client Edit Page
- **Authorized JavaScript origins** section at top
- **Authorized redirect URIs** section below
- **SAVE** button at bottom

### OAuth Consent Screen
- Left sidebar: "OAuth consent screen" tab
- Configure app name, email, domains
- Add scopes: email and profile
- Add test users if in testing mode

---

## Quick Reference

**Your OAuth Client:**
```
Client ID: 1075769500266-gee3kfr5mt1obnc06q2c21vamscfcq0t.apps.googleusercontent.com
Client Secret: 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
```

**Required JavaScript Origins:**
```
http://localhost:3000
https://pro-net-ten.vercel.app
```

**Required Redirect URIs:**
```
http://localhost:3001/auth/google/callback
https://pronet-user-service.onrender.com/auth/google/callback
```

---

## Need Help?

1. Check you're in the correct Google Cloud project
2. Verify the URLs are exactly as shown (no typos)
3. Wait a few minutes after saving for changes to propagate
4. Try in an incognito window to avoid cache issues

---

**After completing this setup, OAuth should work!** 🚀
