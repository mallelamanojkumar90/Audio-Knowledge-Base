/**
 * Email Service Test Script
 * 
 * This script tests the email service configuration and sends a test email.
 * 
 * Usage:
 *   node src/scripts/test-email.js your-email@example.com
 */

require('dotenv').config();
const emailService = require('../services/emailService');

async function testEmail() {
  console.log('========================================');
  console.log('Email Service Test');
  console.log('========================================\n');

  // Get recipient from command line or use default
  const recipient = process.argv[2];
  
  if (!recipient) {
    console.error('❌ Error: Please provide a recipient email address');
    console.log('\nUsage: node src/scripts/test-email.js your-email@example.com\n');
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(recipient)) {
    console.error(`❌ Error: Invalid email address: ${recipient}\n`);
    process.exit(1);
  }

  // Display current configuration
  const status = emailService.getStatus();
  console.log('Current Configuration:');
  console.log('---------------------');
  console.log(`Provider: ${status.provider}`);
  console.log(`Configured: ${status.configured ? '✅ Yes' : '❌ No (console mode)'}`);
  console.log(`From Email: ${status.fromEmail}`);
  console.log(`From Name: ${status.fromName}`);
  console.log('');

  if (!status.configured) {
    console.log('⚠️  Email service is running in CONSOLE MODE');
    console.log('   Emails will be logged to the console instead of being sent.');
    console.log('   To send actual emails, configure EMAIL_PROVIDER in .env');
    console.log('   See EMAIL_INTEGRATION_GUIDE.md for setup instructions.\n');
  }

  // Send test email
  console.log(`Sending test email to: ${recipient}...`);
  console.log('');

  const testSummary = `
This is a test email from the Audio Knowledge Base Q&A Application.

If you're seeing this, the email service is working correctly!

Test Details:
- Timestamp: ${new Date().toISOString()}
- Provider: ${status.provider}
- Mode: ${status.configured ? 'SMTP' : 'Console'}

Key Features:
✅ Agentic AI with ReAct architecture
✅ 4 powerful tools (Search, Timestamps, Web Search, Email)
✅ High-speed transcription with Groq Whisper V3
✅ Intelligent chat interface with Pinecone integration

Next Steps:
1. Upload an audio file
2. Get it transcribed
3. Ask the AI to email you a summary!

---
Audio Knowledge Base Q&A Application
  `.trim();

  try {
    const result = await emailService.sendTranscriptSummary(
      recipient,
      'Test Audio File.mp3',
      testSummary
    );

    console.log('========================================');
    console.log('Result:');
    console.log('========================================');
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      
      if (result.mode === 'smtp') {
        console.log(`📧 Message ID: ${result.messageId}`);
        console.log(`\n✨ Check your inbox at: ${recipient}`);
      } else if (result.mode === 'console') {
        console.log('\n💡 To send actual emails:');
        console.log('   1. Set EMAIL_PROVIDER in .env (gmail, outlook, or smtp)');
        console.log('   2. Add EMAIL_USER and EMAIL_PASSWORD');
        console.log('   3. Restart the backend server');
        console.log('   4. Run this test again');
      }
    } else {
      console.log(`❌ ${result.message}`);
      if (result.error) {
        console.log(`Error: ${result.error}`);
      }
    }
    
    console.log('');
    
  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testEmail()
  .then(() => {
    console.log('Test completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
