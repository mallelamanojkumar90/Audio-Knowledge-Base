/**
 * Check Audio Files and Transcripts Status
 */
require('dotenv').config();
const { AudioFile, Transcript } = require('./src/models');

async function checkFiles() {
  try {
    console.log('📁 Checking Audio Files Status...\n');
    
    const files = await AudioFile.findAll();
    
    if (files.length === 0) {
      console.log('No audio files found in database.');
      process.exit(0);
    }
    
    console.log(`Found ${files.length} audio file(s)\n`);
    console.log('='.repeat(80));
    
    for (const file of files) {
      console.log(`\n📄 File: ${file.original_filename}`);
      console.log(`   ID: ${file.id}`);
      console.log(`   Status: ${file.status}`);
      console.log(`   Size: ${(file.file_size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Uploaded: ${new Date(file.created_at).toLocaleString()}`);
      
      // Check transcript
      const transcript = await Transcript.findByAudioFileId(file.id);
      
      if (!transcript) {
        console.log(`   ❌ NO TRANSCRIPT FOUND`);
        console.log(`   → Action: Regenerate transcript in the UI`);
      } else {
        const textLength = transcript.transcript_text ? transcript.transcript_text.length : 0;
        console.log(`   ✅ Transcript exists`);
        console.log(`   → Length: ${textLength} characters`);
        console.log(`   → Language: ${transcript.language || 'N/A'}`);
        console.log(`   → Confidence: ${transcript.confidence_score || 'N/A'}`);
        
        if (textLength === 0) {
          console.log(`   ⚠️  WARNING: Transcript is EMPTY`);
          console.log(`   → Action: Regenerate transcript in the UI`);
        }
      }
      
      console.log('='.repeat(80));
    }
    
    console.log('\n✅ Check complete!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkFiles();
