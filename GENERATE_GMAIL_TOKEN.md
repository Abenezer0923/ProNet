# Generate Gmail API Refresh Token

Your Gmail API refresh token has expired. Follow these steps to generate a new one:

## Method 1: Using Localhost (Recommended)

### Step 1: Update Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add: `http://localhost:3000/oauth2callback`
4. Click "SAVE"
5. Wait 5 minutes for changes to propagate

### Step 2: Get Authorization URL

Visit this URL in your browser:

```
https://accounts.google.com/o/oauth2/v2/auth?client_id=716006181490-r1fvklb9s9b26nk7jdmf69vf315b9uaa.apps.googleusercontent.com&redirect_uri=http://localhost:3000/oauth2callback&response_type=code&scope=https://www.googleapis.com/auth/gmail.send%20https://www.googleapis.com/auth/gmail.compose&access_type=offline&prompt=consent
```

### Step 3: Authorize and Get Code

1. Sign in with your Gmail account (`abenezerforjobs2@gmail.com`)
2. Click "Allow" to grant permissions
3. You'll be redirected to `http://localhost:3000/oauth2callback?code=XXXXX`
4. Copy the `code` parameter from the URL (everything after `code=` and before `&scope`)

### Step 4: Exchange Code for Refresh Token

Run this PowerShell command (replace `YOUR_AUTH_CODE` with the code from step 3):

```powershell
$body = @{
    code = "YOUR_AUTH_CODE"
    client_id = "716006181490-r1fvklb9s9b26nk7jdmf69vf315b9uaa.apps.googleusercontent.com"
    client_secret = "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"
    redirect_uri = "http://localhost:3000/oauth2callback"
    grant_type = "authorization_code"
}

$response = Invoke-RestMethod -Uri "https://oauth2.googleapis.com/token" -Method Post -Body $body
$response | ConvertTo-Json
```

### Step 5: Update Environment Variable

Copy the `refresh_token` from the response and update it in:

1. **Render Dashboard:**
   - Go to pronet-user-service → Environment
   - Update `GOOGLE_REFRESH_TOKEN` with the new token
   - Save changes

2. **Local .env file:**
   ```
   GOOGLE_REFRESH_TOKEN=your_new_refresh_token_here
   ```

---

## Method 2: Using OAuth Playground (Easiest)

### Step 1: Go to OAuth Playground

Visit: https://developers.google.com/oauthplayground/

### Step 2: Configure Settings

1. Click the gear icon (⚙️) in the top right
2. Check "Use your own OAuth credentials"
3. Enter:
   - **OAuth Client ID:** `716006181490-r1fvklb9s9b26nk7jdmf69vf315b9uaa.apps.googleusercontent.com`
   - **OAuth Client secret:** `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`
4. Close settings

### Step 3: Select Scopes

1. In the left panel, find "Gmail API v1"
2. Expand it and select:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.compose`
3. Click "Authorize APIs"

### Step 4: Authorize

1. Sign in with your Gmail account (`abenezerforjobs2@gmail.com`)
2. Click "Allow"
3. You'll be redirected back to the playground

### Step 5: Exchange Code

1. Click "Exchange authorization code for tokens"
2. Copy the **Refresh token** from the response

### Step 6: Update Environment Variable

Update `GOOGLE_REFRESH_TOKEN` in:
- Render Dashboard → pronet-user-service → Environment
- Local .env file

---

## Important Notes

**Before using OAuth Playground:**
- Make sure `https://developers.google.com/oauthplayground` is added to "Authorized redirect URIs" in your Google Cloud Console
- This is usually already there by default

**Why SMTP Doesn't Work on Render:**
Render blocks outbound SMTP connections (ports 25, 465, 587) on free tier to prevent spam. Gmail API uses HTTPS (port 443) which works fine.

---

## Quick Links

- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [OAuth Playground](https://developers.google.com/oauthplayground/)
- [Gmail API Documentation](https://developers.google.com/gmail/api/guides)

