# Google OAuth Setup Guide

## Overview
This guide will help you set up Google OAuth authentication for ProNet.

## Steps to Configure Google OAuth

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API for your project

### 2. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application** as the application type
4. Configure the OAuth consent screen if prompted:
   - Add your app name (ProNet)
   - Add your email
   - Add authorized domains

### 3. Configure Authorized Redirect URIs

Add the following redirect URIs:

**For Local Development:**
```
http://localhost:3001/api/auth/google/callback
```

**For Production:**
```
https://your-domain.com/api/auth/google/callback
```

### 4. Get Your Credentials

After creating the OAuth client, you'll receive:
- **Client ID**
- **Client Secret**

### 5. Update Environment Variables

Update `services/user-service/.env`:

```env
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

For production, update these values accordingly.

### 6. Install Dependencies

Run the following command in the user-service directory:

```bash
cd services/user-service
npm install passport-google-oauth20 @types/passport-google-oauth20
```

### 7. Test the Integration

1. Start your services:
   ```bash
   docker-compose up
   ```

2. Navigate to `http://localhost:3000`

3. Click "Continue with Google" button

4. You should be redirected to Google's OAuth consent screen

5. After authorization, you'll be redirected back to the app

## How It Works

1. User clicks "Continue with Google" on the landing page
2. User is redirected to `/api/auth/google` endpoint
3. Google OAuth flow is initiated
4. User authorizes the app on Google's consent screen
5. Google redirects back to `/api/auth/google/callback`
6. Backend creates/finds user and generates JWT token
7. User is redirected to frontend with token
8. Frontend stores token and redirects to dashboard

## Security Notes

- Never commit your actual Google Client ID and Secret to version control
- Use environment variables for all sensitive data
- In production, ensure your redirect URIs are HTTPS
- Regularly rotate your client secrets
- Implement rate limiting on auth endpoints

## Troubleshooting

### "Redirect URI mismatch" error
- Ensure the redirect URI in Google Console exactly matches your callback URL
- Check for trailing slashes
- Verify the protocol (http vs https)

### "Invalid client" error
- Verify your Client ID and Secret are correct
- Ensure the OAuth client is enabled in Google Console

### User not being created
- Check backend logs for errors
- Verify database connection
- Ensure User entity allows empty passwords for OAuth users

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport Google OAuth20 Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
