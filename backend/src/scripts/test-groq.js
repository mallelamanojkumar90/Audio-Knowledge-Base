/**
 * Test script to verify Groq AI configuration
 * Run with: node src/scripts/test-groq.js
 */

require('dotenv').config();

async function testGroqConfiguration() {
  console.log('\n🧪 Testing Groq AI Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`   AI_PROVIDER: ${process.env.AI_PROVIDER || 'NOT SET'}`);
  console.log(`   GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✅ Set (starts with ' + process.env.GROQ_API_KEY.substring(0, 7) + '...)' : '❌ NOT SET'}`);
  console.log(`   GROQ_MODEL: ${process.env.GROQ_MODEL || 'NOT SET (will use default)'}\n`);

  if (!process.env.GROQ_API_KEY) {
    console.log('❌ ERROR: GROQ_API_KEY is not set in .env file\n');
    console.log('Please add your Groq API key to backend/.env:');
    console.log('   GROQ_API_KEY=gsk_your_key_here\n');
    process.exit(1);
  }

  // Test AI Model Service
  try {
    console.log('🤖 Testing AI Model Service...');
    const aiModelService = require('../services/aiModelService');
    const modelInfo = aiModelService.getModelInfo();
    
    console.log('   Provider:', modelInfo.provider);
    console.log('   Model:', modelInfo.model);
    console.log('   Initialized:', modelInfo.isInitialized ? '✅' : '❌');
    console.log('   API Key Set:', modelInfo.apiKeySet ? '✅' : '❌');
    
    if (!modelInfo.isInitialized) {
      console.log('\n❌ AI Model not initialized properly\n');
      process.exit(1);
    }
    
    console.log('   ✅ AI Model Service OK\n');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    process.exit(1);
  }

  // Test Groq Transcription Service
  try {
    console.log('🎙️ Testing Groq Transcription Service...');
    const transcriptionService = require('../services/groqTranscriptionService');
    
    // Test placeholder mode (without actual file)
    const placeholderResult = transcriptionService.createPlaceholderTranscript('test.mp3');
    
    if (placeholderResult && placeholderResult.text) {
      console.log('   ✅ Transcription Service loaded successfully');
      console.log('   ✅ Placeholder mode works\n');
    } else {
      console.log('   ❌ Transcription Service error\n');
      process.exit(1);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    process.exit(1);
  }

  // Summary
  console.log('✅ All tests passed!\n');
  console.log('Your Groq configuration is ready to use:');
  console.log('   - Transcription: Groq Whisper API');
  console.log('   - Q&A: Llama 3.3 70B (Phase 4)');
  console.log('\nNext steps:');
  console.log('   1. Upload an audio file via the web interface');
  console.log('   2. Watch automatic transcription happen');
  console.log('   3. View the transcript when complete\n');
}

testGroqConfiguration().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
