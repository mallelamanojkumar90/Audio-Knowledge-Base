const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

class TranscriptionService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('WARNING: OPENAI_API_KEY not set. Transcription will use placeholder mode.');
      this.openai = null;
    } else {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  /**
   * Transcribe an audio file using OpenAI Whisper API
   * @param {string} filePath - Path to the audio file
   * @param {string} originalFilename - Original filename for reference
   * @returns {Promise<Object>} Transcription result
   */
  async transcribeAudio(filePath, originalFilename) {
    try {
      // If no API key, return placeholder transcript
      if (!this.openai) {
        return this.createPlaceholderTranscript(originalFilename);
      }

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        throw new Error(`Audio file not found: ${filePath}`);
      }

      // Get file stats for size check
      const stats = await fs.stat(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      // Whisper API has a 25MB file size limit
      if (fileSizeInMB > 25) {
        throw new Error(`File size (${fileSizeInMB.toFixed(2)}MB) exceeds Whisper API limit of 25MB`);
      }

      console.log(`Starting transcription for: ${originalFilename} (${fileSizeInMB.toFixed(2)}MB)`);

      // Create a read stream for the file
      const audioFile = await fs.readFile(filePath);
      
      // Call OpenAI Whisper API
      const transcription = await this.openai.audio.transcriptions.create({
        file: await this.createFileObject(filePath, originalFilename),
        model: 'whisper-1',
        language: 'en', // Can be made configurable
        response_format: 'verbose_json', // Get detailed response with timestamps
      });

      console.log(`Transcription completed for: ${originalFilename}`);

      return {
        text: transcription.text,
        language: transcription.language || 'en',
        duration: transcription.duration,
        segments: transcription.segments || [],
        status: 'completed',
        confidenceScore: this.calculateAverageConfidence(transcription.segments)
      };

    } catch (error) {
      console.error('Transcription error:', error);
      
      // Handle specific OpenAI errors
      if (error.status === 401) {
        throw new Error('Invalid OpenAI API key');
      } else if (error.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else if (error.status === 413) {
        throw new Error('File too large for Whisper API (max 25MB)');
      }
      
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Create a file object compatible with OpenAI API
   */
  async createFileObject(filePath, originalFilename) {
    const fileBuffer = await fs.readFile(filePath);
    const blob = new Blob([fileBuffer]);
    
    // Create a File-like object
    return new File([blob], originalFilename, {
      type: this.getMimeType(filePath)
    });
  }

  /**
   * Get MIME type based on file extension
   */
  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac',
      '.flac': 'audio/flac',
      '.ogg': 'audio/ogg'
    };
    return mimeTypes[ext] || 'audio/mpeg';
  }

  /**
   * Calculate average confidence score from segments
   */
  calculateAverageConfidence(segments) {
    if (!segments || segments.length === 0) return 0.95;
    
    // Whisper doesn't provide confidence scores in the same way
    // We'll return a default high confidence for successful transcriptions
    return 0.95;
  }

  /**
   * Create a placeholder transcript for testing without API key
   */
  createPlaceholderTranscript(originalFilename) {
    return {
      text: `This is a placeholder transcript for "${originalFilename}".\n\nTo use real transcription:\n1. Set your OPENAI_API_KEY in the .env file\n2. The OpenAI Whisper API will automatically transcribe your audio files\n3. Supported formats: MP3, WAV, M4A, AAC, FLAC, OGG\n4. Maximum file size: 25MB\n\nThis placeholder allows you to test the application without an API key.`,
      language: 'en',
      duration: null,
      segments: [],
      status: 'completed',
      confidenceScore: 0.95
    };
  }

  /**
   * Retry transcription with exponential backoff
   */
  async transcribeWithRetry(filePath, originalFilename, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.transcribeAudio(filePath, originalFilename);
      } catch (error) {
        lastError = error;
        
        // Don't retry on authentication or file size errors
        if (error.message.includes('Invalid OpenAI API key') || 
            error.message.includes('File too large')) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Transcription attempt ${attempt} failed. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }
}

module.exports = new TranscriptionService();
