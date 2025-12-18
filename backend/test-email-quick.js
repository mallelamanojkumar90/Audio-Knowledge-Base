/**
 * Quick Email Test Script
 * Tests if your email configuration is working
 */
require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Show current configuration
  const status = emailService.getStatus();
  console.log('📋 Current Configuration:');
  console.log(`   Provider: ${status.provider}`);
  console.log(`   Configured: ${status.configured ? '✅ Yes' : '❌ No (Console Mode)'}`);
  console.log(`   From Email: ${status.fromEmail}`);
  console.log(`   From Name: ${status.fromName}\n`);
  
  if (!status.configured) {
    console.log('ℹ️  Email service is in CONSOLE MODE');
    console.log('   Emails will be logged to console instead of being sent.\n');
    console.log('   To send real emails:');
    console.log('   1. Add EMAIL_PROVIDER, EMAIL_USER, EMAIL_PASSWORD to .env');
    console.log('   2. See QUICK_EMAIL_SETUP.md for step-by-step instructions\n');
  }
  
  // Prompt for test email
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Enter your email address to send a test email: ', async (email) => {
    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email address');
      readline.close();
      process.exit(1);
    }
    
    console.log(`\n📤 Sending test email to ${email}...\n`);
    
    try {
      const result = await emailService.sendTranscriptSummary(
        email,
        'Test Audio File',
        'This is a test email from your Audio Knowledge Base Q&A Application.\n\nIf you received this email, your email configuration is working correctly! 🎉\n\nKey points:\n- Email service is configured\n- SMTP connection successful\n- Ready to send transcript summaries'
      );
      
      console.log('\n✅ Test Complete!\n');
      
      if (result.mode === 'console') {
        console.log('📝 Email was logged to console (see above)');
        console.log('   To send real emails, configure EMAIL_PROVIDER in .env');
        console.log('   See QUICK_EMAIL_SETUP.md for instructions');
      } else if (result.success) {
        console.log('✉️  Email sent successfully!');
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`   Check your inbox at: ${email}`);
      } else {
        console.log('❌ Email failed to send');
        console.log(`   Error: ${result.message}`);
        console.log('   Check your email configuration in .env');
      }
      
    } catch (error) {
      console.log('\n❌ Error sending email:');
      console.log(`   ${error.message}`);
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check EMAIL_USER and EMAIL_PASSWORD in .env');
      console.log('   - For Gmail, use an App Password (not your regular password)');
      console.log('   - See QUICK_EMAIL_SETUP.md for detailed setup');
    }
    
    readline.close();
    process.exit(0);
  });
}

testEmail();
