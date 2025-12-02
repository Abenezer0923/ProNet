# 📧 Email Service Setup Guide

## Overview
Your authentication system needs to send OTP codes via email. You have two options:

1. **Resend** (Recommended) - Modern, reliable, easy setup
2. **Gmail** (Current) - Already configured, needs code update

---

## Option 1: Resend (Recommended) ⭐

### Why Resend?
- ✅ Built for developers
- ✅ Free tier: 3,000 emails/month
- ✅ No complex SMTP setup
- ✅ Better deliverability
- ✅ Already integrated in code

### Setup Steps

#### 1. Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Click "Sign Up"
3. Enter email and create password
4. Verify email

#### 2. Get API Key
1. Log in to Resend dashboard
2. Go to "API Keys" section
3. Click "Create API Key"
4. Name it: "ProNet Production"
5. Copy the API key (starts with `re_`)
   - **Important**: Save it now, you won't see it again!

#### 3. Configure Domain (Optional but Recommended)
**For Testing (Use Default):**
- Resend provides `onboarding@resend.dev`
- Works immediately, no setup needed
- Limited to verified emails only

**For Production (Custom Domain):**
1. Go to "Domains" in Resend dashboard
2. Click "Add Domain"
3. Enter your domain (e.g., `pronet.com`)
4. Add DNS records to your domain provider:
   ```
   Type: TXT
   Name: @
   Value: [provided by Resend]
   
   Type: MX
   Name: @
   Value: [provided by Resend]
   ```
5. Wait for verification (5-30 minutes)
6. Update email sender in code

#### 4. Add to Render Environment
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select "pronet-user-service"
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_your_api_key_here`
6. Click "Save Changes"
7. Service will auto-redeploy

#### 5. Test Email Delivery
```bash
# Test locally first
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'

# Check your inbox for OTP email
```

### Resend Dashboard Features
- **Logs**: View all sent emails
- **Analytics**: Delivery rates, opens, clicks
- **Webhooks**: Get notified of bounces/complaints
- **Templates**: Create reusable email templates

---

## Option 2: Gmail (Current Setup)

### Current Configuration
```env
EMAIL_USER=abenezerforjobs2@gmail.com
EMAIL_PASSWORD=fzrlxrluiynrujpl
```

### Why Not Recommended?
- ⚠️ Gmail has sending limits (500/day)
- ⚠️ May be marked as spam
- ⚠️ Requires app password management
- ⚠️ Less reliable for production

### If You Want to Keep Gmail

#### Update Email Service Code
The current code uses Resend. To use Gmail, update `email.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️  Email credentials not configured.');
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: `ProNet <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your ProNet Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 ProNet Verification</h1>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>Your verification code is:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="font-size: 12px; color: #999;">Expires in 10 minutes</p>
              </div>
              <p><strong>Never share this code with anyone.</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
```

#### Install Nodemailer
```bash
cd services/user-service
npm install nodemailer
npm install --save-dev @types/nodemailer
```

---

## Option 3: Other Email Services

### SendGrid
- Free tier: 100 emails/day
- Setup: Similar to Resend
- Docs: https://sendgrid.com/docs

### Mailgun
- Free tier: 5,000 emails/month (first 3 months)
- Setup: Similar to Resend
- Docs: https://documentation.mailgun.com

### Amazon SES
- Free tier: 62,000 emails/month (if on AWS)
- Setup: More complex
- Docs: https://docs.aws.amazon.com/ses

---

## Email Template Customization

### Current Template Features
- ✅ Responsive design
- ✅ Professional styling
- ✅ Clear OTP display
- ✅ Security warnings
- ✅ Expiration notice

### Customize Template
Edit `services/user-service/src/auth/email.service.ts`:

```typescript
// Change colors
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);

// Change sender name
from: 'Your App Name <onboarding@resend.dev>',

// Add logo
<img src="https://your-domain.com/logo.png" alt="Logo" style="max-width: 200px;">

// Change subject
subject: 'Your Custom Subject - OTP Code',
```

---

## Testing Email Delivery

### 1. Test Locally
```bash
# Start user service
cd services/user-service
npm run start:dev

# Send test OTP
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'

# Check console for OTP (fallback)
# Check email inbox
```

### 2. Test on Render
```bash
# Send test OTP to production
curl -X POST https://pronet-user-service.onrender.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'

# Check Render logs
# Check email inbox
```

### 3. Check Spam Folder
- OTP emails may land in spam initially
- Mark as "Not Spam" to improve future delivery
- Consider custom domain for better deliverability

---

## Troubleshooting

### Issue: Email Not Received
**Check:**
1. Spam/Junk folder
2. Email address is correct
3. Resend API key is valid
4. Check Render logs for errors
5. Check Resend dashboard logs

**Solutions:**
- Verify API key in Render environment
- Check Resend account status
- Try different email address
- Check console logs for OTP (fallback)

### Issue: "Email service not configured"
**Cause:** Missing `RESEND_API_KEY` environment variable

**Solution:**
1. Add `RESEND_API_KEY` to Render environment
2. Restart service
3. Test again

### Issue: Emails Going to Spam
**Solutions:**
1. Use custom domain (not `onboarding@resend.dev`)
2. Add SPF/DKIM records
3. Warm up domain (send gradually increasing volume)
4. Avoid spam trigger words
5. Include unsubscribe link

### Issue: Rate Limiting
**Resend Free Tier Limits:**
- 3,000 emails/month
- 100 emails/day

**Solutions:**
1. Monitor usage in Resend dashboard
2. Upgrade to paid plan if needed
3. Implement email queuing
4. Cache OTPs to reduce resends

---

## Monitoring & Analytics

### Resend Dashboard
- **Emails**: View all sent emails
- **Status**: Delivered, bounced, complained
- **Logs**: Detailed delivery logs
- **Analytics**: Open rates, click rates

### Render Logs
```bash
# View logs
# Go to Render dashboard → user-service → Logs

# Look for:
✅ OTP email sent successfully to [email]
📬 Message ID: [id]
⚠️  Failed to send email to [email]: [error]
```

### Set Up Alerts
1. **Resend Webhooks**:
   - Configure webhook URL
   - Get notified of bounces/complaints
   - Update email list accordingly

2. **Render Alerts**:
   - Set up log alerts
   - Monitor error rates
   - Get notified of issues

---

## Best Practices

### 1. Security
- ✅ Never log full email content
- ✅ Use environment variables for credentials
- ✅ Rotate API keys regularly
- ✅ Monitor for suspicious activity

### 2. Deliverability
- ✅ Use custom domain
- ✅ Add SPF/DKIM records
- ✅ Maintain clean email list
- ✅ Handle bounces properly

### 3. User Experience
- ✅ Clear, professional templates
- ✅ Mobile-responsive design
- ✅ Fast delivery (< 5 seconds)
- ✅ Fallback to console logs

### 4. Compliance
- ✅ Include unsubscribe link
- ✅ Add physical address
- ✅ Follow CAN-SPAM Act
- ✅ Respect user preferences

---

## Quick Start Checklist

- [ ] Choose email service (Resend recommended)
- [ ] Create account
- [ ] Get API key
- [ ] Add to Render environment variables
- [ ] Test locally
- [ ] Test on production
- [ ] Check spam folder
- [ ] Verify delivery in dashboard
- [ ] Set up monitoring
- [ ] Document for team

---

## Cost Comparison

| Service | Free Tier | Paid Plans | Recommendation |
|---------|-----------|------------|----------------|
| Resend | 3,000/mo | $20/mo for 50k | ✅ Best choice |
| Gmail | 500/day | N/A | ⚠️ Not for production |
| SendGrid | 100/day | $15/mo for 40k | ✅ Good alternative |
| Mailgun | 5,000/mo (3 mo) | $35/mo for 50k | ✅ Good alternative |
| Amazon SES | 62,000/mo (on AWS) | $0.10/1000 | ✅ If using AWS |

**Recommendation: Start with Resend free tier** 🎉

---

## Next Steps

1. ✅ Sign up for Resend
2. ✅ Get API key
3. ✅ Add to Render environment
4. ✅ Test email delivery
5. ✅ Monitor for 24 hours
6. ✅ Consider custom domain
7. ✅ Set up monitoring
8. ✅ Update team docs
