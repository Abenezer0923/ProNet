# Email OTP Setup Guide

## Overview
OTP codes are now sent via email using Nodemailer with Gmail.

## Setup Steps

### 1. Create Gmail App Password

Since you're using Gmail, you need to create an "App Password" (not your regular Gmail password):

1. **Go to your Google Account**: https://myaccount.google.com/
2. **Enable 2-Step Verification** (if not already enabled):
   - Go to Security → 2-Step Verification
   - Follow the setup process

3. **Create App Password**:
   - Go to Security → 2-Step Verification → App passwords
   - Or visit: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other" (enter "ProNet")
   - Click "Generate"
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### 2. Update Local Environment

Edit `services/user-service/.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

**Important**: Use the App Password (16 characters, no spaces), not your regular Gmail password!

### 3. Update Production Environment (Render)

1. Go to Render Dashboard: https://dashboard.render.com/
2. Click on `pronet-user-service`
3. Go to **Environment** tab
4. Add these variables:
   ```
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASSWORD = your-app-password-here
   ```
5. Click **Save Changes**

Render will automatically redeploy with the new environment variables.

### 4. Test Locally

```bash
# Rebuild with new dependencies
docker-compose down
docker-compose up --build

# Visit
http://localhost:3000

# Click "Continue with Google"
# Check your email for OTP code
```

### 5. Test in Production

After Render redeploys:
1. Visit `https://pro-net-ten.vercel.app`
2. Click "Continue with Google"
3. Check your email for OTP code
4. Enter OTP → Dashboard

## Email Template

The OTP email includes:
- Professional ProNet branding
- Large, easy-to-read OTP code
- 10-minute expiration notice
- Security warnings
- Responsive HTML design

## Troubleshooting

### Issue: "Failed to send email"

**Solution 1**: Check App Password
- Make sure you're using the App Password, not your regular password
- Remove any spaces from the App Password
- Generate a new App Password if needed

**Solution 2**: Check Gmail Settings
- Ensure 2-Step Verification is enabled
- Check if "Less secure app access" is disabled (it should be)
- Try generating a new App Password

**Solution 3**: Check Environment Variables
```bash
# Local
cat services/user-service/.env | grep EMAIL

# Production (Render)
# Check Environment tab in Render dashboard
```

### Issue: Email goes to spam

**Solution**:
- Check spam folder
- Mark ProNet emails as "Not Spam"
- Add sender to contacts

### Issue: Email not received

**Solution**:
- Check spam folder
- Wait a few minutes (email can be delayed)
- Click "Resend OTP" button
- Check Render logs for errors

## Alternative Email Services

If you don't want to use Gmail, you can use:

### SendGrid (Recommended for Production)
```typescript
// Update email.service.ts
this.transporter = nodemailer.createTransporter({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});
```

### AWS SES
```typescript
// Update email.service.ts
this.transporter = nodemailer.createTransporter({
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 587,
  auth: {
    user: process.env.AWS_SES_USER,
    pass: process.env.AWS_SES_PASSWORD,
  },
});
```

### Mailgun
```typescript
// Update email.service.ts
this.transporter = nodemailer.createTransporter({
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASSWORD,
  },
});
```

## Security Best Practices

1. **Never commit credentials**: Keep `.env` in `.gitignore`
2. **Use App Passwords**: Never use your main Gmail password
3. **Rotate passwords**: Change App Password periodically
4. **Monitor usage**: Check Gmail sent folder for suspicious activity
5. **Rate limiting**: Consider adding rate limiting to prevent abuse

## Email Sending Limits

### Gmail Free Account
- **Limit**: 500 emails per day
- **Burst**: 100 emails per hour
- **Recommendation**: Fine for development and small apps

### For Production (High Volume)
Consider using:
- **SendGrid**: 100 emails/day free, then paid plans
- **AWS SES**: $0.10 per 1,000 emails
- **Mailgun**: 5,000 emails/month free

## Files Modified

- `services/user-service/package.json` - Added nodemailer
- `services/user-service/src/auth/email.service.ts` - New email service
- `services/user-service/src/auth/auth.service.ts` - Integrated email service
- `services/user-service/src/auth/auth.module.ts` - Added EmailService provider
- `services/user-service/.env` - Added EMAIL_USER and EMAIL_PASSWORD
- `render.yaml` - Added email environment variables

## Next Steps

1. ✅ Set up Gmail App Password
2. ✅ Update local `.env` file
3. ✅ Test locally with Docker
4. ✅ Update Render environment variables
5. ✅ Test in production
6. ⏳ Consider upgrading to SendGrid/AWS SES for production

---

**Status**: Ready to deploy
**Email Service**: Nodemailer + Gmail
**Fallback**: Console logging if email fails
