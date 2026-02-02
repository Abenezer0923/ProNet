# Gmail API Setup Guide

Your Gmail API refresh token has expired. Here's how to fix it:

## Quick Fix: Use SMTP (Easiest)

1. Go to Render Dashboard → pronet-user-service → Environment
2. **Delete** or comment out `RESEND_API_KEY` 
3. **Delete** or comment out `GOOGLE_REFRESH_TOKEN`
4. Make sure these are set:
   - `EMAIL_USER=abenezerforjobs2@gmail.com`
   - `EMAIL_PASSWORD=tgacdgacavrsyotq` (your app password)
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_SECURE=false`
5. Save and the service will use SMTP

## Better Fix: Generate New Gmail API Token

### Step 1: Run the Token Generator

```bash
cd services/user-service
node scripts/generate-gmail-token.js
```

### Step 2: Follow the Instructions

1. The script will print a URL
2. Open the URL in your browser
3. Sign in with your Google account (`abenezerforjobs2@gmail.com`)
4. Grant permissions
5. Copy the authorization code
6. Paste it back into the terminal

### Step 3: Update Environment Variables

The script will output a new `GOOGLE_REFRESH_TOKEN`. Update it in:

1. **Local `.env` file:**
   ```
   GOOGLE_REFRESH_TOKEN=your_new_token_here
   ```

2. **Render Dashboard:**
   - Go to pronet-user-service → Environment
   - Update `GOOGLE_REFRESH_TOKEN` with the new value
   - Save changes

### Step 4: Remove Resend API Key

On Render Dashboard:
- Delete `RESEND_API_KEY` environment variable
- Save changes

## Verify It Works

After deployment, check the logs. You should see:

```
📧 Email service initialized with Gmail API
🚀 Attempting to send email via Gmail API...
✅ OTP email sent successfully via Gmail API to user@example.com
```

## Troubleshooting

### "invalid_grant" Error
- Your refresh token has expired
- Generate a new one using the script above

### "SMTP blocked on Render" Error
- SMTP ports might be blocked on Render free tier
- Use Gmail API instead

### "Resend API" Still Showing in Logs
- The `RESEND_API_KEY` environment variable is still set on Render
- Delete it from the Environment tab

## Current Status

Your current setup:
- ✅ Gmail credentials configured
- ❌ Gmail refresh token expired
- ✅ SMTP credentials configured (fallback)
- ❌ Resend API key still active (should be removed)

**Recommended Action:** Remove `RESEND_API_KEY` from Render, and the system will automatically use SMTP which should work immediately.
