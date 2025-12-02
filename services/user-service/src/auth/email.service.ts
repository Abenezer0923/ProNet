import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

// Use global fetch if available (Node 18+). If not, we'll dynamically require 'node-fetch' at runtime.
let fetchFn: any = null;
try {
  // @ts-ignore
  if (typeof fetch !== 'undefined') fetchFn = fetch;
} catch (err) {
  fetchFn = null;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private emailProvider: 'sendgrid' | 'smtp' | 'console';
  private sendgridApiKey?: string;

  constructor() {
    // Configuration from environment variables
    // Support both SMTP_* and EMAIL_* naming conventions
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
    const smtpSecure = process.env.SMTP_SECURE === 'true';
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    // Prefer SendGrid HTTP API if configured (works over HTTPS so bypasses SMTP blocks)
    if (process.env.SENDGRID_API_KEY) {
      this.sendgridApiKey = process.env.SENDGRID_API_KEY;
      // ensure fetchFn exists
      if (!fetchFn) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          fetchFn = require('node-fetch');
        } catch (err) {
          console.warn('⚠️ node-fetch not available; SendGrid may not work in this runtime');
          fetchFn = null;
        }
      }

      if (this.sendgridApiKey && fetchFn) {
        this.emailProvider = 'sendgrid';
        console.log('📧 Email service initialized with SendGrid (HTTP API)');
        return;
      }
    }

    // Initialize SMTP if configured
    if (smtpUser && smtpPass) {
      // Standard Gmail SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        requireTLS: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        logger: true,
        debug: true,
      });
      
  this.emailProvider = 'smtp';
      
      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ SMTP Connection Error:', error);
        } else {
          console.log('✅ SMTP Server is ready to take our messages');
        }
      });
      
      console.log(`📧 Email service initialized with SMTP (smtp.gmail.com:587)`);
    } else {
      console.warn('⚠️  No email provider configured. OTP will be logged to console only.');
      console.warn('⚠️  To enable email delivery, configure EMAIL_USER and EMAIL_PASSWORD variables.');
      this.emailProvider = 'console';
    }
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    // Always log to console as fallback
    console.log(`📧 OTP for ${email}: ${otp}`);
    console.log(`⏰ OTP expires in 10 minutes`);

    try {
      if (this.emailProvider === 'sendgrid') {
        console.log('🚀 Attempting to send email via SendGrid API...');
        await this.sendWithSendGrid(email, otp);
      } else if (this.emailProvider === 'smtp') {
        console.log('🚀 Attempting to send email via SMTP...');
        await this.sendWithSmtp(email, otp);
      } else {
        console.log('📝 Email service not configured - OTP logged to console only');
      }
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      console.log('📝 Falling back to console OTP due to email service error');
      console.log(`🔑 Use OTP: ${otp} (expires in 10 minutes)`);
    }
  }

  private async sendWithSmtp(email: string, otp: string) {
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
    console.log(`📨 Sending email to ${email} from ${fromAddress}`);
    
    try {
      const info = await this.transporter.sendMail({
        from: `"ProNet" <${fromAddress}>`,
        to: email,
        subject: 'Your ProNet Verification Code',
        html: this.getEmailTemplate(otp),
      });

      console.log(`✅ OTP email sent successfully via SMTP to ${email}`);
      console.log(`📬 Message ID: ${info.messageId}`);
    } catch (error) {
      console.error('💥 SMTP Send Error:', error);
      throw error;
    }
  }

  private async sendWithSendGrid(email: string, otp: string) {
    if (!this.sendgridApiKey) throw new Error('SendGrid API key not configured');
    if (!fetchFn) throw new Error('Fetch not available to call SendGrid API');

    const fromAddress = process.env.SENDGRID_FROM || process.env.EMAIL_USER || process.env.SMTP_USER;
    const payload = {
      personalizations: [
        {
          to: [{ email }],
        },
      ],
      from: { email: fromAddress },
      subject: 'Your ProNet Verification Code',
      content: [
        {
          type: 'text/html',
          value: this.getEmailTemplate(otp),
        },
      ],
    };

    const res = await fetchFn('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SendGrid error: ${res.status} ${text}`);
    }

    console.log(`✅ OTP email sent successfully via SendGrid to ${email}`);
  }

  private getEmailTemplate(otp: string): string {
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
            <h1>🔐 ProNet Verification</h1>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>You requested to verify your email address for ProNet. Use the code below to complete your verification:</p>
            
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

