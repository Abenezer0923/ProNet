import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️  Email credentials not configured. OTP will be logged to console only.');
      this.transporter = null;
      return;
    }

    // Create transporter with Gmail
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    console.log(`📧 Email service initialized with: ${process.env.EMAIL_USER}`);
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    // If transporter is not configured, throw error
    if (!this.transporter) {
      throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
    }

    try {
      const mailOptions = {
        from: `"ProNet" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your ProNet Verification Code',
        html: `
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
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
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
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent successfully to ${email}`);
      console.log(`📬 Message ID: ${info.messageId}`);
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
      
      // Provide helpful error messages
      if (error.code === 'EAUTH') {
        console.error('🔐 Authentication failed. Please check:');
        console.error('   1. EMAIL_USER is correct');
        console.error('   2. EMAIL_PASSWORD is a Gmail App Password (not your regular password)');
        console.error('   3. 2-Step Verification is enabled in your Google Account');
        console.error('   4. Generate App Password at: https://myaccount.google.com/apppasswords');
      }
      
      throw error;
    }
  }
}
