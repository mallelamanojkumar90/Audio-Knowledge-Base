const Groq = require('groq-sdk');
const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

// Set ffmpeg and ffprobe paths
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

/**
 * Enhanced Groq Transcription Service with Large File Support
 * Automatically chunks files larger than 25MB
 */
class GroqTranscriptionService {
  constructor() {
    if (!process.env.GROQ_API_KEY) {
      console.warn('WARNING: GROQ_API_KEY not set. Transcription will use placeholder mode.');
      this.groq = null;
    } else {
      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
      });
    }
    this.MAX_FILE_SIZE_MB = 25; // Groq Whisper API limit
  }

  /**
   * Transcribe an audio file (with automatic chunking for large files)
   */
  async transcribeAudio(filePath, originalFilename) {
    try {
      if (!this.groq) {
        return this.createPlaceholderTranscript(originalFilename);
      }

      // Check if file exists
      await fs.access(filePath);

      // Get file stats
      const stats = await fs.stat(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      console.log(`Starting Groq transcription for: ${originalFilename} (${fileSizeInMB.toFixed(2)}MB)`);

      // If file is under 25MB, transcribe directly
      if (fileSizeInMB <= this.MAX_FILE_SIZE_MB) {
        return await this.transcribeSingleFile(filePath, originalFilename);
      }

      // If file is over 25MB, chunk and transcribe
      console.log(`File is ${fileSizeInMB.toFixed(2)}MB - splitting into chunks...`);
      return await this.transcribeChunkedFile(filePath, originalFilename);

    } catch (error) {
      console.error('Groq transcription error:', error);
      throw this.handleTranscriptionError(error);
    }
  }

  /**
   * Transcribe a single file (under 25MB)
   */
  async transcribeWithRetry(filePath, originalFilename, maxRetries = 3) {
    const fsSync = require('fs');
    const path = require('path');
    const logFile = path.join(__dirname, '../../debug.log');
    const log = (msg) => {
        try { fsSync.appendFileSync(logFile, `${new Date().toISOString()} - ${msg}\n`); } catch(e) {}
    };

    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const stats = await fs.stat(filePath); // Use global fs.promises
        const fileSizeInMB = stats.size / (1024 * 1024);
        
        log(`Starting transcription for ${originalFilename} (${fileSizeInMB.toFixed(2)} MB). Attempt ${attempt}`);

        if (fileSizeInMB > this.MAX_FILE_SIZE_MB) {
          log(`File too large, using chunking strategy...`);
          return await this.transcribeChunkedFile(filePath, originalFilename);
        }
        
        return await this.transcribeSingleFile(filePath, originalFilename);
      } catch (error) {
        lastError = error;
        log(`Attempt ${attempt} failed: ${error.message}`);
        
        // Don't retry on authentication errors
        if (error.message.includes('Invalid Groq API key')) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          log(`Groq transcription attempt ${attempt} failed. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  async transcribeSingleFile(filePath, originalFilename) {
    const fileBuffer = await fs.readFile(filePath); // Global fs.promises
    
    const file = new File([fileBuffer], originalFilename, {
      type: this.getMimeType(filePath)
    });

    const fsSync = require('fs');
    const path = require('path');
    const logFile = path.join(__dirname, '../../debug.log');
    const log = (msg) => {
        try { fsSync.appendFileSync(logFile, `${new Date().toISOString()} - ${msg}\n`); } catch(e) {}
    };

    const transcription = await this.groq.audio.transcriptions.create({
      file: file,
      model: 'whisper-large-v3',
      language: 'en',
      response_format: 'verbose_json', // Use verbose_json to get confidence scores
    });

    log(`Groq API Response for ${originalFilename} (first 200 chars): ${JSON.stringify(transcription).substring(0, 200)}...`);

    const transcriptText = transcription.text || '';
    const confidenceScore = this.calculateConfidence(transcription.segments);

    log(`Groq transcription completed for: ${originalFilename}. Text length: ${transcriptText.length}, Confidence: ${confidenceScore}`);

    if (transcriptText.length === 0) {
        log(`WARNING: Transcription is empty! Raw response: ${JSON.stringify(transcription)}`);
    }

    return {
      text: transcriptText,
      language: 'en',
      duration: transcription.duration || 0,
      segments: transcription.segments || [],
      status: 'completed',
      confidenceScore: confidenceScore
    };
  }

  /**
   * Calculate average confidence score from segments
   */
  calculateConfidence(segments) {
    if (!segments || segments.length === 0) return 0.0;

    let totalConfidence = 0;
    let validSegments = 0;

    for (const segment of segments) {
      if (segment.avg_logprob !== undefined) {
        // Convert log probability to linear probability (0-1)
        // avg_logprob is usually negative. e.g. -0.1 -> 0.9
        const probability = Math.exp(segment.avg_logprob);
        totalConfidence += probability;
        validSegments++;
      }
    }

    if (validSegments === 0) return 0.0;
    
    // Return average, capped at 1.0
    return Math.min(totalConfidence / validSegments, 1.0);
  }

  /**
   * Transcribe a large file by splitting it into chunks
   */
  async transcribeChunkedFile(filePath, originalFilename) {
    const fsSync = require('fs');
    const path = require('path');
    const logFile = path.join(__dirname, '../../debug.log');
    const log = (msg) => {
        try { fsSync.appendFileSync(logFile, `${new Date().toISOString()} - ${msg}\n`); } catch(e) {}
    };

    log('Splitting audio file...');
    const chunks = await this.splitAudioFile(filePath);
    log(`Split into ${chunks.length} chunks. Transcribing each...`);
    
    const transcriptions = [];

    // Transcribe each chunk
    for (let i = 0; i < chunks.length; i++) {
      log(`Transcribing chunk ${i + 1}/${chunks.length}...`);
      
      try {
        const chunkResult = await this.transcribeSingleFile(
          chunks[i].path,
          `${originalFilename}_chunk_${i + 1}.mp3` // Add extension for Groq validation
        );
        
        log(`Chunk ${i + 1} transcript length: ${chunkResult.text ? chunkResult.text.length : 0}`);

        transcriptions.push({
          text: chunkResult.text || '', // Ensure string
          startTime: chunks[i].startTime,
          endTime: chunks[i].endTime,
          confidenceScore: chunkResult.confidenceScore || 0,
          segments: chunkResult.segments
        });
      } catch (error) {
        log(`Error transcribing chunk ${i + 1}: ${error.message}`);
        console.error(`Error transcribing chunk ${i + 1}:`, error.message);
        // Continue with other chunks
      }
    }

    // Clean up chunk files
    await this.cleanupChunks(chunks);

    // Combine transcriptions
    let combinedText = transcriptions.map(t => t.text).join(' ').trim();
    
    // Calculate global confidence score (weighted by text length as proxy for duration/importance)
    let totalWeightedConfidence = 0;
    let totalWeight = 0;

    for (const t of transcriptions) {
        const weight = t.text.length || 1; // logical weight
        totalWeightedConfidence += (t.confidenceScore * weight);
        totalWeight += weight;
    }

    const globalConfidence = totalWeight > 0 ? totalWeightedConfidence / totalWeight : 0;

    // Debug log
    log(`Groq chunked transcription completed. Total text length: ${combinedText.length}, Global Confidence: ${globalConfidence}`);

    if (combinedText.length === 0 && transcriptions.length > 0) {
      log('WARNING: Transcription segments found but combined text is empty.');
    }

    return {
      text: combinedText,
      language: 'en',
      duration: null,
      segments: transcriptions.flatMap(t => t.segments || []), // Combine all segments
      status: 'completed',
      confidenceScore: globalConfidence,
      chunked: true,
      chunkCount: chunks.length
    };
  }

  /**
   * Split audio file into chunks of approximately 10 minutes each
   */
  /**
   * Split audio file into chunks of approximately 10 minutes each
   */
  async splitAudioFile(filePath) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      const chunkDuration = 600; // 10 minutes in seconds
      const outputDir = path.join(path.dirname(filePath), 'chunks');
      
      console.log(`Analyzing audio file: ${filePath}`);
      
      // Create chunks directory
      fs.mkdir(outputDir, { recursive: true }).then(() => {
        // Set a timeout for ffprobe
        const probeTimeout = setTimeout(() => {
          reject(new Error('FFprobe analysis timed out (30s)'));
        }, 30000);

        // Get audio duration first
        ffmpeg.ffprobe(filePath, (err, metadata) => {
          clearTimeout(probeTimeout); // Clear timeout on response
          
          if (err) {
            console.error('FFprobe error:', err);
            reject(new Error(`Failed to analyze audio file: ${err.message}`));
            return;
          }

          const duration = metadata.format.duration;
          if (!duration) {
             reject(new Error('Could not determine audio duration'));
             return;
          }

          const numChunks = Math.ceil(duration / chunkDuration);

          console.log(`Audio duration: ${duration}s, splitting into ${numChunks} chunks`);

          let processedChunks = 0;
          let errors = [];

          // Create each chunk
          for (let i = 0; i < numChunks; i++) {
            const startTime = i * chunkDuration;
            const endTime = Math.min((i + 1) * chunkDuration, duration);
            const chunkPath = path.join(outputDir, `chunk_${i}.mp3`);

            console.log(`Scheduling chunk ${i}: ${startTime}s - ${endTime}s`);

            ffmpeg(filePath)
              .setStartTime(startTime)
              .setDuration(chunkDuration)
              .output(chunkPath)
              .audioCodec('libmp3lame')
              .audioBitrate('64k') // Reduce bitrate to keep size small
              .on('end', () => {
                console.log(`Chunk ${i} created successfully`);
                chunks.push({
                  path: chunkPath,
                  startTime: startTime,
                  endTime: endTime,
                  index: i
                });

                processedChunks++;
                if (processedChunks === numChunks) {
                  if (errors.length > 0) {
                    reject(new Error(`Some chunks failed to generate: ${errors.join(', ')}`));
                  } else {
                    // Sort chunks by index
                    chunks.sort((a, b) => a.index - b.index);
                    resolve(chunks);
                  }
                }
              })
              .on('error', (err) => {
                console.error(`Error creating chunk ${i}:`, err);
                errors.push(err.message);
                processedChunks++; // Still count as processed to avoid hanging
                if (processedChunks === numChunks) {
                   reject(new Error(`Failed to generate chunks: ${errors.join(', ')}`));
                }
              })
              .run();
          }
        });
      }).catch(reject);
    });
  }

  /**
   * Clean up temporary chunk files
   */
  async cleanupChunks(chunks) {
    for (const chunk of chunks) {
      try {
        await fs.unlink(chunk.path);
      } catch (error) {
        console.error(`Failed to delete chunk ${chunk.path}:`, error.message);
      }
    }

    // Try to remove chunks directory
    try {
      const chunksDir = path.dirname(chunks[0].path);
      await fs.rmdir(chunksDir);
    } catch (error) {
      // Ignore if directory is not empty or doesn't exist
    }
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
   * Handle transcription errors
   */
  handleTranscriptionError(error) {
    if (error.status === 401 || error.message?.includes('authentication')) {
      return new Error('Invalid Groq API key');
    } else if (error.status === 429) {
      return new Error('Groq API rate limit exceeded. Please try again later.');
    } else if (error.message?.includes('too large')) {
      return new Error('File processing error. Please try a smaller file.');
    }
    return new Error(`Groq transcription failed: ${error.message}`);
  }

  /**
   * Create placeholder transcript
   */
  createPlaceholderTranscript(originalFilename) {
    return {
      text: `This is a placeholder transcript for "${originalFilename}".\n\nTo use real transcription with Groq:\n1. Set your GROQ_API_KEY in the .env file\n2. Get your API key from: https://console.groq.com/keys\n3. The Groq Whisper API will automatically transcribe your audio files\n4. Large files (>25MB) are automatically split into chunks\n\nThis placeholder allows you to test the application without an API key.`,
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
        
        // Don't retry on authentication errors
        if (error.message.includes('Invalid Groq API key')) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Groq transcription attempt ${attempt} failed. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }
}

module.exports = new GroqTranscriptionService();
