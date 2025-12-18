const { AudioFile } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Get all audio files
 */
exports.getAllFiles = asyncHandler(async (req, res) => {
  const files = await AudioFile.findAll();
  res.json({
    success: true,
    count: files.length,
    data: files
  });
});

/**
 * Get a single audio file by ID
 */
exports.getFileById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const file = await AudioFile.findById(id);

  if (!file) {
    return res.status(404).json({
      success: false,
      error: { message: 'Audio file not found' }
    });
  }

  res.json({
    success: true,
    data: file
  });
});

/**
 * Create a new audio file
 */
exports.createFile = asyncHandler(async (req, res) => {
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: { message: 'No file uploaded' }
    });
  }

  const { filename, originalname, path, size, mimetype } = req.file;
  console.log(`Processing upload for file: ${originalname} (${(size / 1024 / 1024).toFixed(2)} MB)`);

  // Create file record in database
  const fileData = {
    filename: filename,
    originalFilename: originalname,
    filePath: path,
    fileSize: size,
    fileType: mimetype,
    status: 'uploaded'
  };

  const file = await AudioFile.create(fileData);
  console.log(`Database record created for file ID: ${file.id}`);

  // Trigger transcription asynchronously (don't wait for it)
  // This allows the upload to complete quickly while transcription happens in background
  try {
    const transcriptionService = require('../services/groqTranscriptionService'); // Using Groq
    const { Transcript } = require('../models');
    const pineconeService = require('../services/pineconeService');
    
    console.log('Transcription service loaded successfully');

    // Start transcription in background
    (async () => {
      try {
        console.log(`Starting background transcription for file ID: ${file.id}`);
        // Update status to transcribing
        await AudioFile.updateStatus(file.id, 'transcribing');
        
        // Transcribe the audio file
        const transcriptionResult = await transcriptionService.transcribeWithRetry(
          file.file_path,
          file.original_filename
        );

        // Save transcript to database
        const transcriptData = {
          audioFileId: file.id,
          transcriptText: transcriptionResult.text,
          language: transcriptionResult.language,
          confidenceScore: transcriptionResult.confidenceScore,
          status: transcriptionResult.status
        };

        await Transcript.create(transcriptData);

        // Update audio file status to completed
        await AudioFile.updateStatus(file.id, 'completed');
        
        console.log(`Transcription completed for file: ${file.original_filename}`);

        // Store in Pinecone for semantic search (async, don't wait)
        if (transcriptionResult.text && transcriptionResult.text.length > 0) {
          pineconeService.storeTranscript(file.id, transcriptionResult.text)
            .then(() => {
              console.log(`✅ Transcript stored in Pinecone for file ${file.id}`);
            })
            .catch(err => {
              console.log(`⚠️ Failed to store in Pinecone (will use fallback search): ${err.message}`);
            });
        }
      } catch (error) {
        // Update status to failed
        await AudioFile.updateStatus(file.id, 'failed');
        console.error(`Transcription failed for file ${file.original_filename}:`, error.message);
        console.error(error);
      }
    })();
  } catch (err) {
    console.error('Error initializing transcription service:', err);
    // Don't fail the upload response, just log the error
  }

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully. Transcription started.',
    data: file
  });
});

/**
 * Delete an audio file
 */
exports.deleteFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const fs = require('fs').promises;
  const path = require('path');

  // First, get the file info to know the file path
  const file = await AudioFile.findById(id);

  if (!file) {
    return res.status(404).json({
      success: false,
      error: { message: 'Audio file not found' }
    });
  }

  // Delete from database (this will cascade delete related records)
  const deletedFile = await AudioFile.delete(id);

  // Delete the physical file from filesystem
  try {
    if (file.file_path) {
      await fs.unlink(file.file_path);
    }
  } catch (err) {
    // Log error but don't fail the request if file doesn't exist
    console.error('Error deleting physical file:', err.message);
  }

  res.json({
    success: true,
    message: 'Audio file deleted successfully',
    data: deletedFile
  });
});

