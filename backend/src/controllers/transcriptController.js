const { Transcript } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Get transcript for an audio file
 */
exports.getTranscript = asyncHandler(async (req, res) => {
  const { audioFileId } = req.params;
  const fs = require('fs');
  const path = require('path');
  const logFile = path.join(__dirname, '../../debug.log');

  const log = (msg) => fs.appendFileSync(logFile, `${new Date().toISOString()} - ${msg}\n`);
  
  log(`Fetching transcript for file ${audioFileId}`);

  const transcript = await Transcript.findByAudioFileId(audioFileId);

  if (!transcript) {
    log(`No transcript found for file ${audioFileId}`);
    return res.json({
      success: true,
      data: null,
      message: 'No transcript found for this audio file'
    });
  }

  log(`Transcript found: ID ${transcript.id}, Text Length: ${transcript.transcript_text ? transcript.transcript_text.length : 'N/A'}`);

  res.json({
    success: true,
    data: transcript
  });
});

/**
 * Generate transcript for an audio file
 */
exports.generateTranscript = asyncHandler(async (req, res) => {
  const { audioFileId } = req.params;
  const { AudioFile } = require('../models');
  const transcriptionService = require('../services/groqTranscriptionService'); // Using Groq instead of OpenAI

  // Check if audio file exists
  const audioFile = await AudioFile.findById(audioFileId);
  if (!audioFile) {
    return res.status(404).json({
      success: false,
      error: { message: 'Audio file not found' }
    });
  }

  // Check if transcript already exists
  // Check if transcript already exists
  const existingTranscript = await Transcript.findByAudioFileId(audioFileId);
  if (existingTranscript) {
    // Check if the existing transcript is actually valid (has content)
    if (existingTranscript.transcript_text && existingTranscript.transcript_text.trim().length > 10) {
      return res.json({
        success: true,
        data: existingTranscript,
        message: 'Transcript already exists'
      });
    } else {
      // Existing transcript is empty or invalid - delete it and regenerate
      console.log(`Found empty transcript for file ${audioFileId}. Deleting and regenerating...`);
      await Transcript.delete(existingTranscript.id);
    }
  }

  try {
    // Update status to transcribing
    await AudioFile.updateStatus(audioFileId, 'transcribing');

    // Transcribe the audio file with retry logic
    const transcriptionResult = await transcriptionService.transcribeWithRetry(
      audioFile.file_path,
      audioFile.original_filename
    );

    // Save transcript to database
    const transcriptData = {
      audioFileId: parseInt(audioFileId),
      transcriptText: transcriptionResult.text,
      language: transcriptionResult.language,
      confidenceScore: transcriptionResult.confidenceScore,
      status: transcriptionResult.status
    };

    const transcript = await Transcript.create(transcriptData);

    // Update audio file status to completed
    await AudioFile.updateStatus(audioFileId, 'completed');

    res.status(201).json({
      success: true,
      message: 'Transcript generated successfully',
      data: transcript
    });

  } catch (error) {
    // Update status to failed
    await AudioFile.updateStatus(audioFileId, 'failed');

    console.error('Transcription error:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to generate transcript',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
});

/**
 * Delete a transcript
 */
exports.deleteTranscript = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const transcript = await Transcript.delete(id);

  if (!transcript) {
    return res.status(404).json({
      success: false,
      error: { message: 'Transcript not found' }
    });
  }

  res.json({
    success: true,
    message: 'Transcript deleted successfully',
    data: transcript
  });
});
