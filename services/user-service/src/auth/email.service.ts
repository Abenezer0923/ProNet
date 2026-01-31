import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';

@Injectable()
export class EmailService {
  private emailProvider: 'resend' | 'gmail-api' | 'smtp' | 'console';
  private oauth2Client: any;
  private resendApiKey: string;

  constructor() {
    // Priority 1: Resend API (Most reliable for production)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      this.resendApiKey = resendApiKey;
      this.emailProvider = 'resend';
      console.log('📧 Email service initialized with Resend API');
      return;
    }

    // Priority 2: Gmail API
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const emailUser = process.env.EMAIL_USER;

    if (clientId && clientSecret && refreshToken && emailUser) {
      this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      this.emailProvider = 'gmail-api';
      console.log('📧 Email service initialized with Gmail API');
      return;
    }

    // Priority 3: SMTP (will likely fail on Render free tier)
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;

    if (smtpUser && smtpPass) {
      this.emailProvider = 'smtp';
      console.log('📧 Email service initialized with SMTP');
    } else {
      console.warn('⚠️  No email provider configured. OTP will be logged to console only.');
      this.emailProvider = 'console';
    }
  }

  async sendOtpEmail(email: string, otp: string, subject: string = 'Your ProNet Verification Code'): Promise<void> {
    // Always log to console as fallback
    console.log(`📧 OTP for ${email}: ${otp}`);
    console.log(`⏰ OTP expires in 10 minutes`);

    try {
      if (this.emailProvider === 'resend') {
        console.log('🚀 Attempting to send email via Resend API...');
        await this.sendWithResend(email, otp, subject);
      } else if (this.emailProvider === 'gmail-api') {
        console.log('🚀 Attempting to send email via Gmail API...');
        await this.sendWithGmailApi(email, otp, subject);
      } else if (this.emailProvider === 'smtp') {
        console.log('🚀 Attempting to send email via SMTP...');
        await this.sendWithSmtp(email, otp, subject);
      } else {
        console.log('📝 Email service not configured - OTP logged to console only');
      }
    } catch (error) {
      console.error('❌ Error sending OTP email:', error.message);
      console.log('📝 Falling back to console OTP due to email service error');
      console.log(`🔑 Use OTP: ${otp} (expires in 10 minutes)`);
    }
  }

  private async sendWithResend(email: string, otp: string, subject: string) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ProNet <onboarding@resend.dev>', // Use your verified domain or resend.dev for testing
          to: [email],
          subject: subject,
          html: this.getEmailTemplate(otp, subject),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log(`✅ OTP email sent successfully via Resend to ${email}`);
      console.log(`📬 Email ID: ${data.id}`);
    } catch (error) {
      console.error('💥 Resend API Send Error:', error.message);
      throw error;
    }
  }

  private async sendWithGmailApi(email: string, otp: string, subject: string) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      // Create the raw email string
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `From: ProNet <${process.env.EMAIL_USER}>`,
        `To: ${email}`,
        `Subject: ${utf8Subject}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        this.getEmailTemplate(otp, subject),
      ];
      const message = messageParts.join('\n');

      // Encode the message
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      console.log(`✅ OTP email sent successfully via Gmail API to ${email}`);
      console.log(`📬 Message ID: ${res.data.id}`);
    } catch (error) {
      console.error('💥 Gmail API Send Error:', error.message);
      throw error;
    }
  }

  private async sendWithSmtp(email: string, otp: string, subject: string) {
    // ... Legacy SMTP implementation if needed, but likely unused on Render ...
    // For brevity, we can keep a minimal version or just throw an error if we want to force API usage.
    // But let's keep it simple for now and assume the user will use the API.
    throw new Error('SMTP is blocked on Render. Please configure Gmail API or Resend.');
  }

  private getEmailTemplate(otp: string, subject: string): string {
    const isPasswordReset = subject.toLowerCase().includes('reset');
    const title = isPasswordReset ? '🔐 Password Reset' : '🔐 Email Verification';
    const greeting = isPasswordReset 
      ? 'You requested to reset your password for ProNet.' 
      : 'You requested to verify your email address for ProNet.';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>${greeting} Use the code below to complete the process:</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">This code expires in 10 minutes</p>
            </div>

            <p><strong>Important:</strong></p>
            <ul>
              <li>Never share this code with anyone</li>
              <li>ProNet will never ask for your code via phone or email</li>
              <li>If you didn't request this code, please ignore this email</li>
            </ul>

            <div class="footer">
              <p>This is an automated email from ProNet. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} ProNet. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}