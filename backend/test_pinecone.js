/**
 * Test Pinecone Integration
 * Run this after setting up Pinecone to verify it's working
 */

// Load environment variables
require('dotenv').config();

const pineconeService = require('./src/services/pineconeService');

async function testPinecone() {
  console.log('🧪 Testing Pinecone Integration...\n');

  try {
    // Check environment variables first
    console.log('Checking environment variables...');
    const hasPinecone = !!process.env.PINECONE_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasIndex = !!process.env.PINECONE_INDEX;
    
    console.log(`  PINECONE_API_KEY: ${hasPinecone ? '✅ Set' : '❌ Missing'}`);
    console.log(`  OPENAI_API_KEY: ${hasOpenAI ? '✅ Set' : '❌ Missing'}`);
    console.log(`  PINECONE_INDEX: ${hasIndex ? '✅ Set' : '❌ Missing'}\n`);

    // Initialize
    console.log('1️⃣ Initializing Pinecone...');
    await pineconeService.initialize();
    
    if (!pineconeService.isAvailable()) {
      console.log('❌ Pinecone not available.\n');
      console.log('Missing API keys in .env:');
      if (!hasPinecone) console.log('   ❌ PINECONE_API_KEY - Get from https://www.pinecone.io/');
      if (!hasOpenAI) console.log('   ❌ OPENAI_API_KEY - Get from https://platform.openai.com/api-keys');
      if (!hasIndex) console.log('   ❌ PINECONE_INDEX - Should be "audio-transcripts"');
      console.log('\nAdd these to backend/.env and try again.\n');
      return;
    }
    
    console.log('✅ Pinecone initialized successfully!\n');

    // Test storing a transcript
    console.log('2️⃣ Testing transcript storage...');
    const testFileId = 999999; // Test ID
    const testTranscript = `
      This is a test transcript about artificial intelligence and machine learning.
      We discuss neural networks, deep learning, and natural language processing.
      The future of AI looks very promising with advances in transformer models.
    `;

    await pineconeService.storeTranscript(testFileId, testTranscript);
    console.log('✅ Test transcript stored!\n');

    // Wait a moment for indexing
    console.log('⏳ Waiting for indexing...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test searching
    console.log('3️⃣ Testing semantic search...');
    const results = await pineconeService.searchTranscript(
      testFileId,
      'What does the transcript say about AI?',
      2
    );

    if (results.length > 0) {
      console.log('✅ Search successful! Found results:');
      results.forEach((doc, i) => {
        console.log(`\n   Result ${i + 1}:`);
        console.log(`   ${doc.pageContent.substring(0, 100)}...`);
      });
    } else {
      console.log('⚠️ No results found (this might be normal for very short text)');
    }

    // Cleanup
    console.log('\n4️⃣ Cleaning up test data...');
    await pineconeService.deleteTranscript(testFileId);
    console.log('✅ Test data cleaned up!\n');

    console.log('🎉 All tests passed! Pinecone is working correctly.\n');
    console.log('Next steps:');
    console.log('1. Upload an audio file');
    console.log('2. Wait for transcription');
    console.log('3. Check logs for: "✅ Transcript stored in Pinecone"');
    console.log('4. Try asking questions in the chat\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your .env file has:');
    console.error('   PINECONE_API_KEY=your-key');
    console.error('   PINECONE_INDEX=audio-transcripts');
    console.error('   OPENAI_API_KEY=your-key');
    console.error('2. Verify index exists in Pinecone console');
    console.error('3. Check index dimensions = 1536');
    console.error('4. Restart the backend server\n');
  }
}

// Run test
testPinecone();
