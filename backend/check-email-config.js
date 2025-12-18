/**
 * Email Configuration Checker
 * Verifies your email setup without sending anything
 */
require('dotenv').config();

console.log('🔍 Email Configuration Check\n');
console.log('================================\n');

// Check environment variables
const checks = [
  { name: 'EMAIL_PROVIDER', value: process.env.EMAIL_PROVIDER, required: false, default: 'console' },
  { name: 'EMAIL_USER', value: process.env.EMAIL_USER, required: true },
  { name: 'EMAIL_PASSWORD', value: process.env.EMAIL_PASSWORD, required: true, masked: true },
  { name: 'EMAIL_FROM', value: process.env.EMAIL_FROM, required: false },
  { name: 'EMAIL_FROM_NAME', value: process.env.EMAIL_FROM_NAME, required: false },
];

let allGood = true;

checks.forEach(check => {
  const value = check.value || check.default;
  const status = value ? '✅' : (check.required ? '❌' : '⚠️');
  const displayValue = check.masked && value ? '****' + value.slice(-4) : (value || 'Not set');
  
  console.log(`${status} ${check.name.padEnd(20)} = ${displayValue}`);
  
  if (check.required && !value) {
    allGood = false;
  }
});

console.log('\n================================\n');

const provider = process.env.EMAIL_PROVIDER || 'console';

if (provider === 'console') {
  console.log('ℹ️  Email Provider: CONSOLE MODE');
  console.log('   Emails will be logged to console, not sent.\n');
  console.log('💡 To send real emails:');
  console.log('   Set EMAIL_PROVIDER=gmail (or outlook/smtp)');
  console.log('   See QUICK_EMAIL_SETUP.md for instructions\n');
} else if (allGood) {
  console.log(`✅ Email Provider: ${provider.toUpperCase()}`);
  console.log('   Configuration looks good!\n');
  console.log('📧 Test it:');
  console.log('   npm run test-email-quick\n');
} else {
  console.log('❌ Email configuration incomplete');
  console.log('   Missing required variables (see above)\n');
  console.log('💡 See QUICK_EMAIL_SETUP.md for setup instructions\n');
}

// Try to load email service
try {
  const emailService = require('./src/services/emailService');
  const status = emailService.getStatus();
  
  console.log('📊 Email Service Status:');
  console.log(`   Configured: ${status.configured ? '✅ YES' : '❌ NO'}`);
  console.log(`   Provider: ${status.provider}`);
  console.log(`   From: ${status.fromName} <${status.fromEmail}>\n`);
  
  if (status.configured) {
    console.log('✅ Email service is ready to send emails!');
    console.log('   Run: npm run test-email-quick');
  } else {
    console.log('ℹ️  Email service is in console mode');
    console.log('   Emails will be logged to terminal');
  }
  
} catch (error) {
  console.log('❌ Error loading email service:');
  console.log(`   ${error.message}\n`);
}

console.log('\n================================\n');
