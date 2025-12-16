# Transcription Feature Guide - Audio Knowledge Base Q&A App

## 🎙️ Overview

The application now features **automatic audio transcription** using OpenAI's Whisper API. When you upload an audio file, it is automatically transcribed in the background.

---

## 🚀 How It Works

### Automatic Transcription

1. **Upload an Audio File**

   - Go to the Dashboard (http://localhost:3000)
   - Upload your audio file (drag & drop or click to browse)
   - File is saved immediately

2. **Automatic Processing**

   - Transcription starts automatically in the background
   - File status changes to "Transcribing" (yellow badge)
   - You can continue using the app while transcription happens

3. **Completion**
   - When done, status changes to "Completed" (green badge)
   - Transcript is now available to view
   - Click "View Transcript" to see the full text

---

## 📋 Transcription Status

### Status Badges

- **🔵 Uploaded** - File uploaded, waiting for transcription
- **🟡 Transcribing** - Currently being transcribed
- **🟢 Completed** - Transcription successful
- **🔴 Failed** - Transcription failed (can retry)

### Real-Time Updates

- The Files page automatically refreshes every 5 seconds when files are being transcribed
- You'll see status changes in real-time
- No need to manually refresh the page

---

## 🔄 Retry Transcription

If transcription fails or you want to re-transcribe a file:

1. Go to the **Files** page
2. Find the file with "Failed" or "Uploaded" status
3. Click the **Retry** button (green refresh icon)
4. Transcription will start again

---

## ⚙️ Configuration

### OpenAI API Key (Required for Real Transcription)

To use real transcription, you need an OpenAI API key:

1. Get your API key from https://platform.openai.com/api-keys
2. Open `backend/.env` file
3. Add your key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
4. Restart the backend server

### Placeholder Mode (No API Key)

If you don't set an API key:

- The app will still work
- It will create placeholder transcripts for testing
- Perfect for development without API costs

---

## 📊 Supported Audio Formats

- **MP3** (.mp3)
- **WAV** (.wav)
- **M4A** (.m4a)
- **AAC** (.aac)
- **FLAC** (.flac)
- **OGG** (.ogg)

### File Size Limits

- **Upload Limit**: 100MB
- **Whisper API Limit**: 25MB

**Note**: If your file is between 25MB-100MB, upload will succeed but transcription will fail. You'll need to compress the audio file.

---

## 🔧 Technical Details

### API Endpoints

#### Generate Transcript

```
POST /api/transcripts/generate/:audioFileId
```

Manually trigger transcription for a specific file.

**Response:**

```json
{
  "success": true,
  "message": "Transcript generated successfully",
  "data": {
    "id": 1,
    "audio_file_id": 1,
    "transcript_text": "Full transcript text...",
    "language": "en",
    "confidence_score": 0.95,
    "status": "completed"
  }
}
```

#### Get Transcript

```
GET /api/transcripts/:audioFileId
```

Retrieve the transcript for a specific audio file.

### Transcription Process

1. **File Upload** → Status: "uploaded"
2. **Background Job Starts** → Status: "transcribing"
3. **OpenAI Whisper API Call** → Processing audio
4. **Save to Database** → Store transcript text
5. **Update Status** → Status: "completed"

### Error Handling

The system includes:

- **Retry Logic**: Automatic retry with exponential backoff (3 attempts)
- **Error States**: Failed transcriptions are marked and can be retried
- **Validation**: File size and format validation
- **Graceful Degradation**: Placeholder mode if no API key

---

## 📱 User Interface

### Files Page Features

1. **Status Column**

   - Color-coded badges for quick status identification
   - Real-time updates during transcription

2. **Actions Column**

   - **View Transcript**: See the full transcription
   - **Retry**: Re-run transcription (for failed/uploaded files)
   - **Delete**: Remove file and transcript

3. **Auto-Refresh**
   - Page polls every 5 seconds when transcriptions are in progress
   - Stops polling when all transcriptions complete

---

## 💡 Tips & Best Practices

### For Best Results

1. **Audio Quality**

   - Clear audio produces better transcripts
   - Minimize background noise
   - Use good quality microphones

2. **File Size**

   - Keep files under 25MB for Whisper API
   - Compress large files before uploading
   - Consider splitting very long recordings

3. **Language**
   - Currently set to English ("en")
   - Can be configured in the transcription service

### Cost Management

- OpenAI Whisper API pricing: $0.006 per minute
- Example: 10-minute audio = ~$0.06
- Monitor your usage on OpenAI dashboard
- Use placeholder mode for development

---

## 🐛 Troubleshooting

### "Transcription Failed"

**Possible Causes:**

1. No OpenAI API key set
2. Invalid API key
3. File too large (>25MB)
4. Network issues
5. API rate limit exceeded

**Solutions:**

1. Check your `.env` file has `OPENAI_API_KEY`
2. Verify key is valid on OpenAI dashboard
3. Compress or split large files
4. Check internet connection
5. Wait a few minutes and retry

### "Status Stuck on Transcribing"

**Solutions:**

1. Refresh the page
2. Check backend logs for errors
3. Retry the transcription
4. Check if backend server is running

### "Placeholder Transcript Appears"

**Cause**: No OpenAI API key configured

**Solution**: Add your API key to `backend/.env`

---

## 🔍 Viewing Transcripts

1. Go to **Files** page
2. Find a file with "Completed" status
3. Click **View Transcript**
4. See the full transcription with:
   - Original filename
   - Transcript text
   - Language
   - Confidence score
   - Timestamps

---

## 📈 What's Next

After transcription is complete, you can:

1. **View the Transcript** - Read the full text
2. **Ask Questions** - Use the Q&A feature (Phase 4)
3. **Search Content** - Find specific information
4. **Export** - Copy or download the transcript

---

## 🎯 Quick Start Example

```bash
# 1. Set up your API key
echo "OPENAI_API_KEY=sk-your-key-here" >> backend/.env

# 2. Restart backend
cd backend
npm run dev

# 3. Upload a file
# Go to http://localhost:3000
# Upload an audio file

# 4. Watch the magic happen!
# Status changes: Uploaded → Transcribing → Completed
# Click "View Transcript" to see results
```

---

## 📞 Need Help?

- Check backend logs: `backend/` terminal
- Check frontend logs: Browser console (F12)
- Review `HOW_TO_RUN.md` for setup instructions
- Check OpenAI status: https://status.openai.com/

---

**Enjoy automatic transcription! 🎉**
