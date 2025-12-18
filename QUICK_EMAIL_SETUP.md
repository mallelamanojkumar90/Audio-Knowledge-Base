# Quick Email Setup Guide

## Current Status

Your email service is running in **CONSOLE MODE** (default). This means when you ask the AI to send an email, it logs the content to the backend console instead of actually sending it.

## To Actually Send Emails

You need to configure an email provider. Here are the easiest options:

---

## Option 1: Gmail (Recommended - Easiest)

### Step 1: Get Gmail App Password

1. Go to https://myaccount.google.com
2. Click **Security** (left sidebar)
3. Enable **2-Step Verification** if not already enabled
4. Scroll down to **App passwords**
5. Click **App passwords**
6. Select "Mail" and "Windows Computer"
7. Click **Generate**
8. Copy the 16-character password (looks like: `xxxx xxxx xxxx xxxx`)

### Step 2: Update Your .env File

Open `backend/.env` and add these lines:

```env
# Email Configuration
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Audio Knowledge Base
```

**Replace:**

- `your-email@gmail.com` with your actual Gmail address
- `xxxx xxxx xxxx xxxx` with the app password you generated

### Step 3: Restart Backend

Stop the backend server (Ctrl+C) and restart:

```bash
cd backend
npm run dev
```

### Step 4: Test It!

In the chat, ask:

```
"Email a summary of this transcript to your-email@gmail.com"
```

Check your Gmail inbox!

---

## Option 2: Outlook/Hotmail

If you prefer Outlook:

```env
EMAIL_PROVIDER=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
EMAIL_FROM_NAME=Audio Knowledge Base
```

Then restart the backend.

---

## Option 3: Keep Console Mode (For Testing)

If you just want to test without setting up email:

1. Keep the current settings (or set `EMAIL_PROVIDER=console`)
2. When you ask the AI to send an email, check your **backend terminal**
3. You'll see the email content logged there

Example output in console:

```
========== EMAIL (Console Mode) ==========
From: Audio Knowledge Base <noreply@audiokb.com>
To: boss@example.com
Subject: Audio Transcript Summary: Meeting.mp3
-------------------------------------------
[Email content here]
===========================================
```

---

## Troubleshooting

### "Email service not configured"

- This is normal - it means console mode is active
- Follow Option 1 or 2 above to send real emails

### Gmail "Less secure app" error

- Gmail no longer supports this
- You MUST use an App Password (see Option 1)

### Email not arriving

1. Check spam/junk folder
2. Verify EMAIL_USER and EMAIL_PASSWORD are correct
3. Check backend console for error messages
4. Make sure you restarted the backend after changing .env

### Still not working?

1. Check backend terminal for `[Email Service]` messages
2. Try console mode first to verify the feature works
3. Review the full guide: `EMAIL_INTEGRATION_GUIDE.md`

---

## Quick Reference

**Current Mode:** Console (emails logged to terminal)

**To send real emails:**

1. Add email config to `backend/.env`
2. Restart backend
3. Ask AI to send email
4. Check your inbox!

**For detailed setup:** See `EMAIL_INTEGRATION_GUIDE.md`
