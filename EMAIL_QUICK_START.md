# Email Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Option 1: Console Mode (Testing - No Setup Required)

**Default mode** - Emails are logged to console instead of being sent.

```bash
# Just use it! No configuration needed.
# Ask the AI: "Email a summary to test@example.com"
# Check backend console for email content
```

### Option 2: Gmail (Recommended)

**Step 1:** Generate Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Create password for "Mail"
5. Copy the 16-character password

**Step 2:** Add to `backend/.env`

```env
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Audio Knowledge Base
```

**Step 3:** Restart backend

```bash
cd backend
npm run dev
```

**Step 4:** Test it

```bash
npm run test-email your-email@gmail.com
```

### Option 3: Outlook

Add to `backend/.env`:

```env
EMAIL_PROVIDER=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
EMAIL_FROM_NAME=Audio Knowledge Base
```

### Option 4: Custom SMTP

Add to `backend/.env`:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@example.com
EMAIL_FROM_NAME=Audio Knowledge Base
```

## 📧 Usage Examples

Once configured, ask the AI:

```
"Email a summary of this transcript to boss@example.com"

"Send the key points about the budget to finance@company.com"

"Email the action items to team@company.com"
```

## 🧪 Testing

```bash
# Test email configuration
npm run test-email your-email@example.com

# Check backend console for results
```

## ❓ Troubleshooting

### "Email service not configured"

- Set `EMAIL_PROVIDER` in `.env`
- Add `EMAIL_USER` and `EMAIL_PASSWORD`
- Restart backend

### Gmail not working

- Use **App Password**, not regular password
- Enable 2-Step Verification first
- Check https://myaccount.google.com/apppasswords

### SMTP timeout

- Verify `SMTP_HOST` and `SMTP_PORT`
- Try port 587 (TLS) or 465 (SSL)
- Check firewall settings

## 📚 Full Documentation

See **[EMAIL_INTEGRATION_GUIDE.md](./EMAIL_INTEGRATION_GUIDE.md)** for:

- Detailed setup instructions
- Security best practices
- API reference
- Production recommendations

## ✅ Status Check

Run this to check your configuration:

```bash
npm run test-email test@example.com
```

Look for:

- ✅ Provider: gmail/outlook/smtp
- ✅ Configured: Yes
- ✅ Email sent successfully

---

**Need Help?** Check the backend console logs for `[Email Service]` messages.
