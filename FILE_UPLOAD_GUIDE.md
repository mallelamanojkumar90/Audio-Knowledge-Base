# File Upload Feature - Audio Knowledge Base Q&A App

## 📤 Where to Upload Files

You can upload audio files directly from the main dashboard of the application!

### **Access the Upload Feature:**

1. **Open the application** in your browser:

   ```
   http://localhost:3000
   ```

2. **Look for the "Upload Audio File" section** on the dashboard

3. **Upload your audio file** using one of two methods:
   - **Drag & Drop**: Drag an audio file from your computer and drop it into the upload area
   - **Click to Browse**: Click anywhere in the upload area to open a file browser

---

## 🎵 Supported Audio Formats

The application accepts the following audio file formats:

- **MP3** (.mp3) - MPEG Audio Layer 3
- **WAV** (.wav) - Waveform Audio File Format
- **M4A** (.m4a) - MPEG-4 Audio
- **AAC** (.aac) - Advanced Audio Coding
- **FLAC** (.flac) - Free Lossless Audio Codec
- **OGG** (.ogg) - Ogg Vorbis

### **File Size Limit:**

- Maximum file size: **100 MB**

---

## 📋 Upload Process

### **Step-by-Step:**

1. **Select or Drag Your Audio File**

   - The upload area will highlight when you drag a file over it
   - Only audio files will be accepted

2. **Upload Progress**

   - You'll see a progress bar showing the upload status
   - Wait for the upload to complete

3. **Success Confirmation**

   - A green success message will appear when the upload is complete
   - The uploaded file will be added to the "Uploaded Files" list below

4. **View Your Files**
   - All successfully uploaded files are displayed in the "Uploaded Files" section
   - Each file shows its name and upload status

---

## 🔧 Technical Details

### **Backend API Endpoint:**

```
POST http://localhost:3001/api/files
```

### **Request Format:**

- Content-Type: `multipart/form-data`
- Field name: `audio`
- Single file upload

### **Response Format:**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": 1,
    "filename": "audio-1234567890.mp3",
    "original_filename": "my-audio.mp3",
    "file_path": "/path/to/uploads/audio-1234567890.mp3",
    "file_size": 5242880,
    "file_type": "audio/mpeg",
    "status": "uploaded",
    "created_at": "2025-12-15T12:00:00.000Z"
  }
}
```

---

## 📁 Where Files Are Stored

### **Backend Storage:**

- **Location**: `backend/uploads/` directory
- **Filename Format**: `originalname-timestamp-randomnumber.ext`
- **Example**: `my-audio-1734268800000-123456789.mp3`

### **Database Record:**

Files are also recorded in the PostgreSQL database with metadata:

- ID
- Filename (stored)
- Original filename
- File path
- File size
- MIME type
- Upload status
- Created/Updated timestamps

---

## ⚠️ Error Handling

### **Common Errors:**

1. **"No file uploaded"**

   - Make sure you've selected a file before uploading
   - Try again with a valid audio file

2. **"Invalid file type"**

   - Only audio files are accepted
   - Check that your file has one of the supported extensions

3. **"File too large"**

   - Maximum file size is 100MB
   - Compress your audio file or use a smaller file

4. **"Upload failed"**
   - Check that the backend server is running
   - Verify your internet connection
   - Check the browser console for detailed error messages

---

## 🎯 What Happens After Upload

Once your audio file is uploaded:

1. ✅ **File is saved** to the server's uploads directory
2. ✅ **Database record is created** with file metadata
3. ✅ **File appears in your uploaded files list**
4. 🔄 **Ready for transcription** (Phase 2 feature - coming soon)
5. 🔄 **Ready for Q&A** (Phase 3 feature - coming soon)

---

## 🚀 Quick Example

### **Using the UI:**

1. Go to http://localhost:3000
2. Find the "Upload Audio File" section
3. Drag your MP3 file into the upload area
4. Wait for the green success message
5. Your file is now uploaded!

### **Using API (cURL):**

```bash
curl -X POST http://localhost:3001/api/files \
  -F "audio=@/path/to/your/audio.mp3"
```

### **Using API (JavaScript/Fetch):**

```javascript
const formData = new FormData();
formData.append("audio", audioFile);

const response = await fetch("http://localhost:3001/api/files", {
  method: "POST",
  body: formData,
});

const data = await response.json();
console.log(data);
```

---

## 📊 Viewing Uploaded Files

### **In the UI:**

- Uploaded files appear in the "Uploaded Files" section on the dashboard
- Each file shows:
  - Original filename
  - Upload status
  - Upload timestamp (coming soon)

### **Via API:**

```bash
# Get all uploaded files
curl http://localhost:3001/api/files

# Get a specific file by ID
curl http://localhost:3001/api/files/1
```

---

## 🛠️ Troubleshooting

### **Upload button not working?**

1. Check that both backend and frontend servers are running
2. Verify the backend is accessible at http://localhost:3001
3. Check browser console for errors

### **File not appearing after upload?**

1. Check for error messages in the UI
2. Verify the backend terminal for error logs
3. Check database connection

### **"Network Error" or "Failed to fetch"?**

1. Ensure backend server is running: `npm run dev` in backend folder
2. Check CORS settings in backend
3. Verify the API URL in the frontend code

---

## 📝 Next Steps

After uploading your audio files, you'll be able to:

1. **View transcriptions** (Phase 2 - Coming Soon)
2. **Ask questions** about the audio content (Phase 3 - Coming Soon)
3. **Manage conversations** with your audio knowledge base (Phase 4 - Coming Soon)

---

## 🎉 You're All Set!

The file upload feature is now fully functional. Simply open http://localhost:3000 and start uploading your audio files!

**Need help?** Check the main `HOW_TO_RUN.md` guide or the backend logs for more information.
