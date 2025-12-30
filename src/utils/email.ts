import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const createTransporter = () => {
  const provider = env.EMAIL_PROVIDER;

  if (provider === 'gmail') {
    if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
      throw new Error('Gmail credentials not configured');
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
      },
    });
  }

  if (provider === 'outlook') {
    if (!env.OUTLOOK_USER || !env.OUTLOOK_PASSWORD) {
      throw new Error('Outlook credentials not configured');
    }

    return nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: env.OUTLOOK_USER,
        pass: env.OUTLOOK_PASSWORD,
      },
      tls: {
        ciphers: 'SSLv3',
      },
    });
  }

  throw new Error(`Unsupported email provider: ${provider}`);
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}`, {
      messageId: info.messageId,
    });
  } catch (error) {
    logger.error('Failed to send email', {
      to: options.to,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

export const sendOtpEmail = async (email: string, otp: string, purpose: string): Promise<void> => {
  const subjectMap: Record<string, string> = {
    login: 'Your Login OTP',
    register: 'Complete Your Registration',
    reset_password: 'Password Reset OTP',
  };

  const subject = subjectMap[purpose] || 'Your OTP Code';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #4CAF50;
            text-align: center;
            letter-spacing: 5px;
            padding: 20px;
            background-color: #fff;
            border: 2px dashed #4CAF50;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${env.EMAIL_FROM_NAME}</h1>
          </div>
          <div class="content">
            <h2>Your OTP Code</h2>
            <p>Please use the following One-Time Password (OTP) to ${purpose === 'login' ? 'log in to your account' : purpose === 'register' ? 'complete your registration' : 'reset your password'}:</p>
            <div class="otp-code">${otp}</div>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Your OTP Code

    Please use the following One-Time Password (OTP): ${otp}

    This code will expire in 10 minutes.

    If you didn't request this code, please ignore this email.
  `;

  await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
};
