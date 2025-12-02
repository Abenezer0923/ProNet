import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private resend: Resend;
  private transporter: nodemailer.Transporter;
  private emailProvider: 'resend' | 'smtp' | 'console';

  constructor() {
    // Check if Resend API key is configured
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
      this.emailProvider = 'resend';
      console.log(`📧 Email service initialized with Resend`);
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Fallback to SMTP (Gmail, etc.)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      this.emailProvider = 'smtp';
      console.log(`📧 Email service initialized with SMTP (${process.env.SMTP_HOST})`);
    } else {
      console.warn('⚠️  No email provider configured. OTP will be logged to console only.');
      console.warn('⚠️  To enable email delivery, configure RESEND_API_KEY or SMTP variables.');
      this.resend = null;
      this.emailProvider = 'console';
    }
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    // Always log to console as fallback
    console.log(`📧 OTP for ${email}: ${otp}`);
    console.log(`⏰ OTP expires in 10 minutes`);

    try {
      if (this.emailProvider === 'resend') {
        await this.sendWithResend(email, otp);
      } else if (this.emailProvider === 'smtp') {
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

  private async sendWithResend(email: string, otp: string) {
    const { data, error } = await this.resend.emails.send({
      from: 'ProNet <onboarding@resend.dev>', // Default Resend testing domain
      to: [email],
      subject: 'Your ProNet Verification Code',
      html: this.getEmailTemplate(otp),
    });

    if (error) {
      // If validation error (testing restriction), throw specific error to trigger fallback
      if (error.name === 'validation_error') {
        throw new Error(`Resend validation error: ${error.message}`);
      }
      throw new Error(error.message);
    }

    console.log(`✅ OTP email sent successfully via Resend to ${email}`);
    console.log(`📬 Message ID: ${data?.id}`);
  }

  private async sendWithSmtp(email: string, otp: string) {
    const info = await this.transporter.sendMail({
      from: `"ProNet" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your ProNet Verification Code',
      html: this.getEmailTemplate(otp),
    });

    console.log(`✅ OTP email sent successfully via SMTP to ${email}`);
    console.log(`📬 Message ID: ${info.messageId}`);
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

