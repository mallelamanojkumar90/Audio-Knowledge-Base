const nodemailer = require('nodemailer');

/**
 * Email Service
 * Handles sending emails using Nodemailer
 * Supports multiple email providers (Gmail, Outlook, Custom SMTP)
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@audiokb.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'Audio Knowledge Base';
    
    this.initialize();
  }

  /**
   * Initialize email transporter based on environment variables
   */
  initialize() {
    try {
      const emailProvider = process.env.EMAIL_PROVIDER || 'console'; // console, gmail, outlook, smtp
      
      if (emailProvider === 'console') {
        console.log('[Email Service] Running in console mode (emails will be logged)');
        this.isConfigured = false;
        return;
      }

      let transportConfig;

      switch (emailProvider.toLowerCase()) {
        case 'gmail':
          transportConfig = {
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
            }
          };
          break;

        case 'outlook':
          transportConfig = {
            service: 'outlook',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD
            }
          };
          break;

        case 'smtp':
          transportConfig = {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD
            }
          };
          break;

        default:
          console.log(`[Email Service] Unknown provider: ${emailProvider}, using console mode`);
          this.isConfigured = false;
          return;
      }

      // Validate required fields
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('[Email Service] EMAIL_USER or EMAIL_PASSWORD not set, using console mode');
        this.isConfigured = false;
        return;
      }

      this.transporter = nodemailer.createTransport(transportConfig);
      this.isConfigured = true;
      
      console.log(`[Email Service] Initialized with provider: ${emailProvider}`);
      
      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('[Email Service] Connection verification failed:', error.message);
          this.isConfigured = false;
        } else {
          console.log('[Email Service] Ready to send emails');
        }
      });

    } catch (error) {
      console.error('[Email Service] Initialization error:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Send an email
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} text - Plain text content
   * @param {string} html - HTML content (optional)
   * @returns {Promise<Object>} - Result object
   */
  async sendEmail(to, subject, text, html = null) {
    try {
      // If not configured, log to console
      if (!this.isConfigured) {
        console.log('\n========== EMAIL (Console Mode) ==========');
        console.log(`From: ${this.fromName} <${this.fromEmail}>`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('-------------------------------------------');
        console.log(text);
        console.log('===========================================\n');
        
        return {
          success: true,
          message: 'Email logged to console (email service not configured)',
          mode: 'console'
        };
      }

      // Send actual email
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: to,
        subject: subject,
        text: text,
        html: html || this.generateHtmlFromText(text)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`[Email Service] Email sent successfully to ${to}`);
      console.log(`[Email Service] Message ID: ${info.messageId}`);
      
      return {
        success: true,
        message: 'Email sent successfully',
        messageId: info.messageId,
        mode: 'smtp'
      };

    } catch (error) {
      console.error('[Email Service] Error sending email:', error.message);
      
      // Fallback to console logging
      console.log('\n========== EMAIL (Fallback - Error Occurred) ==========');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('-------------------------------------------------------');
      console.log(text);
      console.log('=======================================================\n');
      
      return {
        success: false,
        message: `Email failed: ${error.message}. Content logged to console.`,
        error: error.message,
        mode: 'console-fallback'
      };
    }
  }

  /**
   * Send a transcript summary email
   * @param {string} to - Recipient email
   * @param {string} fileName - Audio file name
   * @param {string} summary - Summary text
   * @returns {Promise<Object>}
   */
  async sendTranscriptSummary(to, fileName, summary) {
    const subject = `Audio Transcript Summary: ${fileName}`;
    
    const text = `
Hello,

Here is the summary of the audio transcript for: ${fileName}

${summary}

---
This email was automatically generated by Audio Knowledge Base Q&A Application.
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .summary { background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🎙️ Audio Transcript Summary</h2>
    </div>
    <div class="content">
      <p><strong>Audio File:</strong> ${fileName}</p>
      <div class="summary">
        <h3>Summary:</h3>
        <p style="white-space: pre-wrap;">${summary}</p>
      </div>
    </div>
    <div class="footer">
      <p>This email was automatically generated by Audio Knowledge Base Q&A Application.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return await this.sendEmail(to, subject, text, html);
  }

  /**
   * Generate basic HTML from plain text
   * @param {string} text - Plain text
   * @returns {string} - HTML
   */
  generateHtmlFromText(text) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; }
    .content { max-width: 600px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="content">
    <p style="white-space: pre-wrap;">${text}</p>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Check if email service is configured
   * @returns {boolean}
   */
  isEmailConfigured() {
    return this.isConfigured;
  }

  /**
   * Get email service status
   * @returns {Object}
   */
  getStatus() {
    return {
      configured: this.isConfigured,
      provider: process.env.EMAIL_PROVIDER || 'console',
      fromEmail: this.fromEmail,
      fromName: this.fromName
    };
  }
}

module.exports = new EmailService();
