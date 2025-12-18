/**
 * Script to check Pinecone indexing status for all audio files
 */
require('dotenv').config();
const { AudioFile, Transcript } = require('./src/models');
const pineconeService = require('./src/services/pineconeService');

async function checkPineconeStatus() {
  try {
    console.log('🔍 Checking Pinecone status for all audio files...\n');

    // Initialize Pinecone
    await pineconeService.initialize();
    
    if (!pineconeService.isAvailable()) {
      console.log('❌ Pinecone is not available. Check your API keys.');
      return;
    }

    // Get all audio files
    const files = await AudioFile.findAll();
    
    if (files.length === 0) {
      console.log('No audio files found in database.');
      return;
    }

    console.log(`Found ${files.length} audio file(s)\n`);

    // Check each file
    for (const file of files) {
      console.log(`\n📄 File: ${file.original_filename} (ID: ${file.id})`);
      console.log(`   Status: ${file.status}`);
      
      // Check if transcript exists
      const transcript = await Transcript.findByAudioFileId(file.id);
      
      if (!transcript) {
        console.log('   ⚠️  No transcript found');
        continue;
      }
      
      const textLength = transcript.transcript_text ? transcript.transcript_text.length : 0;
      console.log(`   Transcript: ${textLength} characters`);
      
      // Check Pinecone status
      const hasVectors = await pineconeService.hasTranscript(file.id);
      
      if (hasVectors) {
        console.log('   ✅ Indexed in Pinecone');
      } else {
        console.log('   ❌ NOT indexed in Pinecone');
        
        // Offer to index it
        if (textLength > 0) {
          console.log('   📤 Indexing now...');
          try {
            await pineconeService.storeTranscript(file.id, transcript.transcript_text);
            console.log('   ✅ Successfully indexed!');
          } catch (error) {
            console.log(`   ❌ Failed to index: ${error.message}`);
          }
        }
      }
    }

    console.log('\n✅ Status check complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPineconeStatus();
