# Viewing Audio Transcripts - Audio Knowledge Base Q&A App

## 📝 Where to See Audio Transcripts

You can view audio transcripts in two ways:

### **Method 1: From the Files Page**

1. **Navigate to the Files page:**

   - Click on **"Files"** in the top navigation bar
   - Or go directly to: `http://localhost:3000/files`

2. **View your uploaded files:**

   - You'll see a table with all your uploaded audio files
   - Each file shows:
     - File name
     - File size
     - Upload status
     - Upload date
     - Actions

3. **Click "View Transcript":**
   - Click the "View Transcript" link for any file
   - This will take you to the transcript page for that specific file

### **Method 2: Direct URL**

If you know the file ID, you can go directly to:

```
http://localhost:3000/transcripts/{fileId}
```

Example: `http://localhost:3000/transcripts/1`

---

## 🎯 Transcript Page Features

When you view a transcript, you'll see:

### **1. File Information**

- Original filename
- Back button to return to files list

### **2. Transcript Metadata** (if transcript exists)

- **Language**: The detected language of the audio
- **Confidence Score**: How confident the transcription is (0-100%)
- **Generated Date**: When the transcript was created

### **3. Transcript Text**

- Full text of the audio transcription
- Easy-to-read format with proper spacing
- **Copy to Clipboard** button for easy copying

### **4. Actions**

- **Regenerate Transcript**: Create a new transcript
- **Start Q&A Chat**: Ask questions about the content (coming soon)

---

## 🔄 Generating Transcripts

If a file doesn't have a transcript yet:

1. **You'll see a message**: "No transcript available"

2. **Click "Generate Transcript"** button

3. **Wait for processing**:

   - A loading indicator will show
   - The transcript will be generated

4. **View the result**:
   - The transcript text will appear
   - Metadata will be displayed
   - Actions become available

---

## 📊 Navigation Flow

```
Dashboard (Upload Files)
    ↓
Files Page (View All Files)
    ↓
Transcript Page (View Specific Transcript)
    ↓
Q&A Chat (Ask Questions) - Coming Soon
```

---

## 🎨 User Interface

### **Files Page**

- **Clean table layout** with sortable columns
- **Status badges** showing upload/transcription status
- **Quick actions** for each file
- **Responsive design** works on all devices

### **Transcript Page**

- **Card-based layout** for easy reading
- **Metadata cards** showing key information
- **Large text area** for comfortable reading
- **Action buttons** for next steps

---

## 🔧 Technical Details

### **API Endpoints:**

**Get Transcript:**

```
GET http://localhost:3001/api/transcripts/:audioFileId
```

**Generate Transcript:**

```
POST http://localhost:3001/api/transcripts/:audioFileId/generate
```

**Delete Transcript:**

```
DELETE http://localhost:3001/api/transcripts/:id
```

### **Response Format:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "audio_file_id": 1,
    "transcript_text": "Full transcript text here...",
    "language": "en",
    "confidence_score": 0.95,
    "word_count": 250,
    "created_at": "2025-12-15T12:00:00.000Z"
  }
}
```

---

## 📋 Step-by-Step Guide

### **To View Transcripts:**

1. **Upload an audio file** (if you haven't already)

   - Go to Dashboard
   - Upload your audio file
   - Wait for upload to complete

2. **Navigate to Files page**

   - Click "Files" in the navigation bar
   - You'll see your uploaded file(s)

3. **Click "View Transcript"**

   - Find your file in the list
   - Click the "View Transcript" link

4. **Generate transcript** (if needed)

   - If no transcript exists, click "Generate Transcript"
   - Wait for the generation to complete

5. **Read and use your transcript**
   - Read the full text
   - Copy to clipboard if needed
   - Use for Q&A or other purposes

---

## 🎯 Quick Access

### **From Dashboard:**

```
Dashboard → Files (nav bar) → View Transcript (action)
```

### **Direct Access:**

```
http://localhost:3000/files
http://localhost:3000/transcripts/1
```

---

## ⚠️ Important Notes

### **Placeholder Transcripts**

Currently, the system generates **placeholder transcripts** for demonstration purposes. In a production environment, you would integrate with a real speech-to-text service like:

- **OpenAI Whisper API**
- **Google Cloud Speech-to-Text**
- **Amazon Transcribe**
- **AssemblyAI**

### **Transcript Status**

Files can have different statuses:

- **Uploaded**: File uploaded, no transcript yet
- **Transcribing**: Transcript being generated
- **Completed**: Transcript available
- **Failed**: Transcription failed

---

## 🚀 Features

✅ **View all uploaded files** in a clean table
✅ **Generate transcripts** with one click
✅ **View transcript text** with metadata
✅ **Copy to clipboard** for easy sharing
✅ **Regenerate transcripts** if needed
✅ **Navigate easily** between pages
✅ **Responsive design** for all devices

---

## 🎉 You're All Set!

To view your audio transcripts:

1. Go to **http://localhost:3000/files**
2. Click **"View Transcript"** on any file
3. Generate a transcript if needed
4. Read and use your transcript!

---

## 📚 Related Documentation

- **HOW_TO_RUN.md** - How to run the application
- **FILE_UPLOAD_GUIDE.md** - How to upload audio files
- **QUICK_START.md** - Quick reference guide

---

**Need help?** Check the backend logs or browser console for error messages.
