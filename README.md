# Audio Knowledge Base Q&A Application

A powerful AI-driven application trying to transform audio files into interactive knowledge bases. Users can upload audio lectures, meetings, or podcasts, get accurate transcripts, and ask natural language questions to retrieve specific answers with citations.

## 🚀 Key Features

- **🎙️ High-Speed Transcription**:
  - Powered by **Groq Whisper V3** (Large V3 model).
  - **Extremely fast** (transcribes hours of audio in minutes).
  - Supports **Large Files** (up to 500MB) via automatic chunking.
  - Formats: MP3, WAV, M4A, FLAC, and more.
- **🧠 Intelligent Q&A (RAG)**:
  - Ask questions about your audio content.
  - **Retrieval Augmented Generation (RAG)** finds the exact relevant sections.
  - **Context Stuffing Fallback**: Works even without a vector database for files up to ~100k tokens using **Llama 3.3 70B**'s large context window.
- **🤖 Multi-Model AI Service**:
  - **Groq (Llama 3.3 70B)**: default, ultra-fast, and free/cheap.
  - **OpenAI (GPT-4o)**: Supported optional fallback.
  - **Anthropic (Claude 3.5)**: Supported optional fallback.
- **📊 Interactive UI**:
  - Upload dashboard.
  - Full transcript viewer.
  - ChatGPT-style chat interface with history.

## 🛠️ Tech Stack

- **Frontend**: React (TypeScript), Tailwind CSS.
- **Backend**: Node.js (Express).
- **Database**: PostgreSQL (Metadata & Chat History).
- **AI Orchestration**: LangChain.js.
- **AI Providers**: Groq SDK, OpenAI SDK.
- **Media Processing**: FFmpeg (via fluent-ffmpeg).

## 📋 Prerequisites

- **Node.js**: v18+
- **PostgreSQL**: v14+ (Local or Cloud)
- **FFmpeg**: Installed on system (or via `@ffmpeg-installer` which is included).
- **Groq API Key**: Required for fast transcription & Llama 3 models. [Get one here](https://console.groq.com).
- **OpenAI API Key**: Recommended for high-quality Embeddings (RAG), but optional (system has fallbacks).

## ⚙️ Installation & Setup

### 1. Clone & Install

```bash
git clone <repository-url>
cd "Audio KnowledgeBase Q&A App"

# Install Backend
cd backend
npm install

# Install Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env`:

```env
PORT=3001
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/audio_kb

# AI Keys
GROQ_API_KEY=gsk_...
# Optional but recommended for better RAG
OPENAI_API_KEY=sk-...
# Optional
ANTHROPIC_API_KEY=sk-ant-...

# Configuration
NODE_ENV=development
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:3001
```

### 3. Setup Database

Create the database and run migrations:

```bash
# In psql or PGAdmin
CREATE DATABASE audio_kb;

# Run Migrations (in backend folder)
npm run migrate
```

### 4. Run the App

Start both servers:

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd frontend
npm start
```

Visit `http://localhost:3000` to start using the app.

## 💡 How to Use

1.  **Upload**: Go to the **Files** tab and upload an audio file (drag & drop supported).
2.  **Transcribe**:
    - The system will auto-start transcription.
    - If it fails or is empty, click **Regenerate Transcript**.
    - Watch the status spinner. Large files (100MB+) may take 2-5 minutes.
3.  **View**: Click "View Transcript" to see the full text.
4.  **Chat**: Click **"Start Q&A Chat"** to enter the chat interface. Ask questions like:
    - _"Summarize the main points of this meeting."_
    - _"What was said about the Q3 budget?"_

## 🔧 Troubleshooting

- **Empty Transcript?**:
  - This usually happens if the AI service timed out.
  - Solution: Click the blue **"Regenerate Transcript"** button on the transcript page. The system handles cleaning up old invalid data automatically.
- **"Context too long"?**:
  - The system uses specific chunking strategies.
  - Ensure configuration uses `Llama-3.3-70b` (Groq) which has a 128k context window.

## 📄 License

MIT
