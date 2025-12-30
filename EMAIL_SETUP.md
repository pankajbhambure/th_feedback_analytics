# Email Configuration Guide

This guide will help you set up email functionality for OTP (One-Time Password) delivery in your application.

## Supported Email Providers

- Gmail
- Outlook/Hotmail

## Configuration Steps

### Option 1: Gmail Configuration

1. **Enable 2-Step Verification**
   - Go to your Google Account: https://myaccount.google.com
   - Navigate to Security > 2-Step Verification
   - Follow the steps to enable it

2. **Generate an App Password**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-character password (it will look like: `xxxx xxxx xxxx xxxx`)

3. **Update your `.env` file**
   ```env
   EMAIL_PROVIDER=gmail
   EMAIL_FROM=your-email@gmail.com
   EMAIL_FROM_NAME=Your App Name
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   ```

### Option 2: Outlook Configuration

1. **Update your `.env` file**
   ```env
   EMAIL_PROVIDER=outlook
   EMAIL_FROM=your-email@outlook.com
   EMAIL_FROM_NAME=Your App Name
   OUTLOOK_USER=your-email@outlook.com
   OUTLOOK_PASSWORD=your-outlook-password
   ```

## Environment Variables Explained

| Variable | Description | Required |
|----------|-------------|----------|
| `EMAIL_PROVIDER` | Email service to use (`gmail` or `outlook`) | Yes |
| `EMAIL_FROM` | The email address that will appear as sender | Yes |
| `EMAIL_FROM_NAME` | The name that will appear as sender | Yes |
| `GMAIL_USER` | Your Gmail address | If using Gmail |
| `GMAIL_APP_PASSWORD` | Gmail App Password (16 characters) | If using Gmail |
| `OUTLOOK_USER` | Your Outlook email address | If using Outlook |
| `OUTLOOK_PASSWORD` | Your Outlook password | If using Outlook |

## Testing Email Configuration

After configuring your email settings:

1. Rebuild and restart your application:
   ```bash
   npm run build
   npm start
   ```

2. Test the OTP functionality by making a request to one of these endpoints:
   - `POST /api/auth/register` (without password)
   - `POST /api/auth/login/otp`
   - `POST /api/auth/forgot-password`

3. Check your email inbox for the OTP

## Troubleshooting

### Gmail Issues

- **"Invalid credentials"**: Make sure you're using an App Password, not your regular Gmail password
- **"Less secure app access"**: This is no longer needed if you use App Passwords
- **Email not received**: Check spam folder and verify 2-Step Verification is enabled

### Outlook Issues

- **"Authentication failed"**: Verify your email and password are correct
- **"Connection timeout"**: Check your firewall settings for port 587
- **Email not received**: Check spam folder

### General Issues

- **Environment variables not loading**: Restart your application after changing `.env`
- **Email validation error**: Ensure `EMAIL_FROM` is a valid email address
- **Provider not configured**: Make sure you filled in the credentials for your chosen provider

## Email Template

The OTP emails are automatically formatted with:
- Professional HTML styling
- Clear OTP code display
- Purpose-specific messaging
- 10-minute expiration notice
- Security disclaimer

## Security Notes

- Never commit your `.env` file to version control
- Keep your App Passwords secure
- Rotate passwords periodically
- Use different App Passwords for different applications
