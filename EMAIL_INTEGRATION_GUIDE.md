# Email Integration Guide

This guide explains how to configure and use the email functionality in the Audio Knowledge Base Q&A Application.

## Overview

The application includes an **Email Service** that allows the Agentic AI to send transcript summaries via email. The service supports multiple email providers and includes a fallback console mode for testing.

## Features

- ✅ **Multiple Email Providers**: Gmail, Outlook, Custom SMTP
- ✅ **HTML Email Templates**: Professional-looking emails with styling
- ✅ **Console Mode**: Test without configuring email (default)
- ✅ **Email Validation**: Validates recipient email addresses
- ✅ **Error Handling**: Graceful fallback if email fails
- ✅ **Automatic Formatting**: Converts summaries to formatted HTML

## Quick Start (Console Mode)

By default, the email service runs in **console mode**, which means emails are logged to the server console instead of being sent. This is perfect for testing!

**No configuration needed!** Just ask the agent:

```
"Email a summary of this transcript to boss@example.com"
```

The email content will be logged to your backend console.

## Email Provider Configuration

### Option 1: Gmail (Recommended for Personal Use)

Gmail is easy to set up but requires an **App Password** (not your regular password).

#### Step 1: Generate Gmail App Password

1. Go to your Google Account: https://myaccount.google.com
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password

#### Step 2: Configure Environment Variables

Add to your `backend/.env`:

```env
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # Your 16-character app password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Audio Knowledge Base
```

#### Step 3: Restart Backend

```bash
cd backend
npm run dev
```

### Option 2: Outlook/Hotmail

For Outlook or Hotmail accounts:

```env
EMAIL_PROVIDER=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
EMAIL_FROM_NAME=Audio Knowledge Base
```

**Note**: You may need to enable "Less secure app access" in your Outlook settings.

### Option 3: Custom SMTP Server

For custom email servers (e.g., company email, SendGrid, Mailgun):

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false  # true for port 465, false for other ports
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@example.com
EMAIL_FROM_NAME=Audio Knowledge Base
```

**Common SMTP Settings:**

| Provider | Host                               | Port       | Secure        |
| -------- | ---------------------------------- | ---------- | ------------- |
| SendGrid | smtp.sendgrid.net                  | 587        | false         |
| Mailgun  | smtp.mailgun.org                   | 587        | false         |
| AWS SES  | email-smtp.us-east-1.amazonaws.com | 587        | false         |
| Custom   | Your SMTP host                     | 587 or 465 | false or true |

## Usage Examples

Once configured, you can ask the Agentic AI to send emails:

### Example 1: Basic Summary Email

```
User: "Email a summary of this meeting to john@example.com"
```

The agent will:

1. Generate a summary of the transcript
2. Send it to john@example.com
3. Confirm the email was sent

### Example 2: Specific Content

```
User: "Send the key points about the budget discussion to finance@company.com"
```

The agent will:

1. Search for budget-related content
2. Extract key points
3. Email them to finance@company.com

### Example 3: Multiple Recipients

```
User: "Email the action items to team@company.com and manager@company.com"
```

**Note**: Currently supports one recipient at a time. For multiple recipients, the agent will send separate emails.

## Email Template

Emails are sent with a professional HTML template that includes:

- **Header**: Audio Knowledge Base branding
- **File Name**: Name of the audio file
- **Summary Content**: Formatted summary text
- **Footer**: Auto-generated notice

### Example Email Output

```
Subject: Audio Transcript Summary: Meeting_2024.mp3

From: Audio Knowledge Base <noreply@audiokb.com>
To: boss@example.com

[Formatted HTML email with summary content]
```

## Testing

### Test in Console Mode (No Configuration)

1. Keep `EMAIL_PROVIDER=console` (or don't set it)
2. Ask the agent to send an email
3. Check your backend console for the email content

### Test with Real Email

1. Configure your email provider (see above)
2. Send a test email to yourself:
   ```
   "Email a summary to your-email@example.com"
   ```
3. Check your inbox!

## Troubleshooting

### Email Not Sending

**Check 1: Environment Variables**

- Ensure `EMAIL_PROVIDER`, `EMAIL_USER`, and `EMAIL_PASSWORD` are set
- Restart the backend after changing `.env`

**Check 2: Gmail App Password**

- Use an App Password, not your regular password
- Ensure 2-Step Verification is enabled

**Check 3: Backend Logs**

- Check the backend console for error messages
- Look for `[Email Service]` log entries

### "Email service not configured" Message

This means the email service is running in console mode. To fix:

1. Set `EMAIL_PROVIDER` to `gmail`, `outlook`, or `smtp`
2. Add required credentials
3. Restart backend

### Gmail "Less Secure App" Error

Gmail no longer supports "less secure apps". You **must** use an App Password:

1. Enable 2-Step Verification
2. Generate an App Password
3. Use the App Password in `EMAIL_PASSWORD`

### SMTP Connection Timeout

- Check `SMTP_HOST` and `SMTP_PORT` are correct
- Verify firewall isn't blocking the connection
- Try port 587 (TLS) or 465 (SSL)

## Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use App Passwords** - Don't use your main email password
3. **Limit Permissions** - Use email accounts with minimal permissions
4. **Rotate Credentials** - Change passwords periodically
5. **Monitor Usage** - Check email logs for suspicious activity

## API Reference

### Email Service Methods

#### `sendEmail(to, subject, text, html)`

Send a basic email.

```javascript
const emailService = require("./services/emailService");

await emailService.sendEmail(
  "recipient@example.com",
  "Subject Line",
  "Plain text content",
  "<html>HTML content</html>" // optional
);
```

#### `sendTranscriptSummary(to, fileName, summary)`

Send a formatted transcript summary.

```javascript
await emailService.sendTranscriptSummary(
  "recipient@example.com",
  "Meeting_2024.mp3",
  "Summary of the meeting..."
);
```

#### `getStatus()`

Get email service configuration status.

```javascript
const status = emailService.getStatus();
console.log(status);
// { configured: true, provider: 'gmail', fromEmail: '...', fromName: '...' }
```

## Environment Variables Reference

| Variable          | Required | Default                | Description                                           |
| ----------------- | -------- | ---------------------- | ----------------------------------------------------- |
| `EMAIL_PROVIDER`  | No       | `console`              | Email provider: `console`, `gmail`, `outlook`, `smtp` |
| `EMAIL_USER`      | Yes\*    | -                      | Email account username                                |
| `EMAIL_PASSWORD`  | Yes\*    | -                      | Email account password (or app password)              |
| `EMAIL_FROM`      | No       | `noreply@audiokb.com`  | Sender email address                                  |
| `EMAIL_FROM_NAME` | No       | `Audio Knowledge Base` | Sender display name                                   |
| `SMTP_HOST`       | Yes\*\*  | -                      | SMTP server hostname                                  |
| `SMTP_PORT`       | No       | `587`                  | SMTP server port                                      |
| `SMTP_SECURE`     | No       | `false`                | Use SSL/TLS (true for port 465)                       |

\* Required if `EMAIL_PROVIDER` is not `console`  
\*\* Required if `EMAIL_PROVIDER` is `smtp`

## Advanced Configuration

### Custom Email Templates

To customize email templates, edit `backend/src/services/emailService.js`:

```javascript
// Modify the sendTranscriptSummary method
async sendTranscriptSummary(to, fileName, summary) {
  const html = `
    <!-- Your custom HTML template here -->
  `;

  return await this.sendEmail(to, subject, text, html);
}
```

### Rate Limiting

For production use, consider adding rate limiting:

```javascript
// Example: Limit to 10 emails per hour per user
const rateLimit = require("express-rate-limit");

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per windowMs
});

app.use("/api/chat", emailLimiter);
```

## Production Recommendations

For production deployments:

1. **Use a Dedicated Email Service**: SendGrid, Mailgun, or AWS SES
2. **Implement Rate Limiting**: Prevent abuse
3. **Add Email Queue**: Use Bull or similar for background processing
4. **Monitor Deliverability**: Track bounce rates and spam reports
5. **Implement Unsubscribe**: Add unsubscribe links if sending to users
6. **Use Environment-Specific Configs**: Different settings for dev/staging/prod

## Support

If you encounter issues:

1. Check the backend console logs
2. Verify environment variables are set correctly
3. Test in console mode first
4. Review the troubleshooting section above

For additional help, refer to:

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail App Passwords Guide](https://support.google.com/accounts/answer/185833)
