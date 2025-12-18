# Audio Knowledge Base Q&A Application

A powerful **Agentic AI** application that transforms audio files into interactive knowledge bases. Users can upload audio lectures, meetings, or podcasts, get accurate transcripts, and interact with an intelligent agent that can search, reason, and take actions based on audio content.

## 🚀 Key Features

### 🤖 **Agentic AI with ReAct Architecture**

- **Advanced Reasoning Engine**: Goes beyond simple Q&A with a **ReAct (Reasoning and Acting)** loop
- **Multi-Step Planning**: Agent analyzes intent, plans actions, and executes tools in sequence
- **4 Powerful Tools**:
  - 🔍 **Search Transcript**: Semantic search over audio content using vector embeddings
  - ⏱️ **Get Timestamps**: Pinpoint exact moments when topics are mentioned
  - 🌐 **Web Search**: Fetch live information from the internet for fact-checking and context
  - 📧 **Send Email**: Action execution (e.g., "Email a summary to boss@example.com")
- **Intelligent Tool Selection**: Agent automatically chooses the right tools for each task
- **Multi-Turn Conversations**: Maintains context across conversation history

### 🎙️ **High-Speed Transcription**

- Powered by **Groq Whisper V3** (Large V3 model)
- **Extremely fast** (transcribes hours of audio in minutes)
- Supports **Large Files** (up to 500MB) via automatic chunking
- Formats: MP3, WAV, M4A, FLAC, and more
- **Confidence scores** and **segment-level timestamps** for transcription quality
- **JSONB segment storage** for precise timestamp retrieval

### 💬 **Intelligent Chat Interface**

- Ask natural language questions about your audio content
- **3-tier search system**: Pinecone semantic → Keyword → Full text
- **Conversational AI responses** powered by Llama 3.3 70B
- **Chat history** persistence for ongoing conversations
- **Pinecone vector storage** for production-grade semantic search (optional)
- **Fact-checking capabilities** with web search integration

### 🤖 **Multi-Model AI Support**

- **Groq (Llama 3.3 70B)**: Default, ultra-fast, and cost-effective
- **OpenAI (GPT-4)**: Optional for embeddings and chat
- **Anthropic (Claude 3.5)**: Optional alternative
- Easy model switching via environment variables

### 📊 **Modern Interactive UI**

- Drag-and-drop file upload
- Real-time transcription status
- Full transcript viewer with timestamps
- ChatGPT-style chat interface
- Responsive design with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React (TypeScript), Tailwind CSS
- **Backend**: Node.js (Express), LangChain.js
- **Database**: PostgreSQL (Metadata & Chat History)
- **Vector Store**: Pinecone (Optional, for semantic search)
- **AI Services**: Groq SDK, OpenAI SDK, Anthropic SDK
- **Media Processing**: FFmpeg (via fluent-ffmpeg)

## 📋 Prerequisites

- **Node.js**: v18+
- **PostgreSQL**: v14+ (Local or Cloud)
- **FFmpeg**: Auto-installed via `@ffmpeg-installer`
- **Groq API Key**: Required for transcription & chat. [Get one here](https://console.groq.com) (Free tier available)
- **OpenAI API Key**: Optional for semantic search embeddings
- **Pinecone Account**: Optional for persistent vector storage. [Sign up here](https://www.pinecone.io/) (Free tier: 100K vectors)

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

# AI Configuration
AI_PROVIDER=groq  # Options: groq, openai, anthropic

# Required: Groq API Key (for transcription and chat)
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

# Optional: For semantic search (better accuracy)
OPENAI_API_KEY=sk-...

# Optional: Alternative AI providers
ANTHROPIC_API_KEY=sk-ant-...

# Environment
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
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

1. **Upload Audio File**:

   - Go to the **Files** tab
   - Drag & drop or click to upload (MP3, WAV, M4A, FLAC, etc.)
   - Supports files up to 500MB

2. **Transcription**:

   - Transcription starts automatically after upload
   - Watch the status indicator (Uploaded → Transcribing → Completed)
   - Large files (100MB+) may take 2-5 minutes
   - If transcription fails, click **"Regenerate Transcript"**

3. **View Transcript**:

   - Click "View Transcript" to see the full text
   - Includes confidence scores and metadata
   - Segment-level timestamps for precise navigation

4. **Chat with Your Audio (Agentic AI)**:

   The agent can perform multiple types of tasks:

   **Basic Questions:**

   - "What is this audio about?"
   - "Summarize the key points discussed"
   - "What did they say about [topic]?"

   **Timestamp Finding:**

   - "When was [topic] mentioned?"
   - "Skip to the part where they talk about deployment"
   - "Give me the timestamp for the budget discussion"

   **Fact-Checking & Web Search:**

   - "The speaker said Python was created in 1989. Is that true?"
   - "What is Project Apollo mentioned in the audio?"
   - "Verify the population figure mentioned"
   - "What's the current stock price of the company mentioned?"

   **Action Execution:**

   - "Email a summary of this meeting to boss@example.com"
   - "Send the key points to team@company.com"

   The agent will automatically:

   - Choose the right tool(s) for your request
   - Execute multiple steps if needed (e.g., search transcript → then web search)
   - Synthesize information from multiple sources
   - Provide natural, conversational responses

## 🔧 Features & Configuration

### Chat System

The chat system uses a **3-tier intelligent search** to find relevant information:

1. **Pinecone Semantic Search** (Best) - If configured with `PINECONE_API_KEY` and `OPENAI_API_KEY`

   - Vector-based similarity search
   - Understands meaning, not just keywords
   - Persistent storage across restarts
   - See [PINECONE_SETUP.md](./PINECONE_SETUP.md) for setup

2. **Keyword Search** (Good) - Automatic fallback

   - Fast, no configuration needed
   - Works without any API keys
   - Effective for most queries

3. **Full Text** (Fallback) - Last resort
   - Returns beginning of transcript if no matches found

### Multi-Model Support

Switch AI providers by changing `AI_PROVIDER` in `.env`:

```env
AI_PROVIDER=groq      # Fast, free tier available
AI_PROVIDER=openai    # High quality, requires paid API
AI_PROVIDER=anthropic # Claude models
```

### Transcription Quality

- Uses Groq Whisper Large V3 for high accuracy
- Automatic language detection
- Confidence scores for each segment
- Handles background noise well

## 🐛 Troubleshooting

### Empty or Failed Transcription

- **Cause**: API timeout or file format issue
- **Solution**: Click **"Regenerate Transcript"** button
- The system automatically cleans up invalid data

### Chat Not Working

- **Check**: Ensure `GROQ_API_KEY` is set in `backend/.env`
- **Check**: Backend server is running on port 3001
- **Check**: File has a completed transcript

### 500 Internal Server Error

- **Check**: All required dependencies are installed (`npm install`)
- **Check**: Database is running and migrations are complete
- **Check**: API keys are valid and not expired

### Slow Responses

- First chat message may be slower (model loading)
- Subsequent messages are faster
- Consider using OpenAI embeddings for better performance

### "Transcript not in Pinecone yet"

- **Cause**: Transcript indexing happens asynchronously in the background
- **Solution**: Wait a few seconds and try again, or run `npm run check-pinecone` in the backend folder
- The system automatically triggers indexing and uses keyword fallback in the meantime
- See [PINECONE_INTEGRATION.md](./PINECONE_INTEGRATION.md) for detailed troubleshooting

## 🧠 Agentic AI Architecture

The application uses a **ReAct (Reasoning and Acting)** architecture that goes beyond simple RAG:

### How It Works

1. **User Input**: You ask a question or make a request
2. **Reasoning**: The agent analyzes your intent and plans which tools to use
3. **Action**: The agent executes the selected tool(s)
4. **Observation**: Tool results are fed back to the agent
5. **Response**: The agent synthesizes a natural language answer

### The 4 Tools

#### 1. 🔍 Search Transcript

- **Purpose**: Semantic search over audio content
- **How**: Uses vector embeddings (Pinecone or in-memory)
- **Example**: "What did the speaker say about upcoming features?"

#### 2. ⏱️ Get Audio Timestamp

- **Purpose**: Find exact moments when topics are mentioned
- **How**: Scans segment-level transcript data (JSONB)
- **Example**: "When did they mention API rate limits?"
- **Note**: Requires transcripts created after this feature was implemented

#### 3. 🌐 Web Search

- **Purpose**: Fetch live information from the internet
- **How**: Uses DuckDuckGo search via LangChain
- **Example**: "The speaker mentioned Project Apollo - what is that?"

#### 4. � Send Summary Email

- **Purpose**: Action execution - send transcript summaries via email
- **How**: Uses Nodemailer with support for Gmail, Outlook, and custom SMTP
- **Example**: "Email a summary to boss@example.com"
- **Note**: Runs in console mode by default. See [Email Integration Guide](./EMAIL_INTEGRATION_GUIDE.md) for setup

### Multi-Step Reasoning

The agent can chain tools together:

**Example**: "The speaker said Python was created in 1989. Is that true?"

1. Agent calls `search_transcript("Python creation date")`
2. Finds: "Python was created in 1989"
3. Agent calls `web_search("When was Python created?")`
4. Finds: "Python first released in 1991, conceived in late 1980s"
5. Agent synthesizes: "The speaker mentioned 1989, which is close. Implementation started in 1989 but it was first released in 1991."

## 📚 Additional Documentation

- **[Agentic AI Documentation](./AGENTIC_AI_DOCUMENTATION.md)**: Deep dive into ReAct architecture and tools
- **[Email Integration Guide](./EMAIL_INTEGRATION_GUIDE.md)**: Configure email functionality (Gmail, Outlook, SMTP)
- **[Pinecone Integration Guide](./PINECONE_INTEGRATION.md)**: Complete guide to vector search setup and troubleshooting
- **[Pinecone Setup Guide](./PINECONE_SETUP.md)**: Quick start for Pinecone
- **[Chat Setup Guide](./CHAT_SETUP_GUIDE.md)**: Detailed chat configuration
- **[File Upload Guide](./FILE_UPLOAD_GUIDE.md)**: Upload best practices
- **[How to Run](./HOW_TO_RUN.md)**: Step-by-step startup guide
- **[Multi-Model Migration](./MULTI_MODEL_MIGRATION.md)**: AI provider switching

## 🚀 Recent Updates

- ✅ **Agentic AI with ReAct Architecture** (Latest!)
  - Advanced reasoning engine with multi-step planning
  - 4 powerful tools: Search, Timestamps, Web Search, Email
  - Intelligent tool selection and multi-turn conversations
  - Database schema update with JSONB segments for timestamps
- ✅ **Email Integration** (New!)
  - Real email functionality using Nodemailer
  - Support for Gmail, Outlook, and custom SMTP
  - Professional HTML email templates
  - Console mode for testing (default)
- ✅ **Pinecone integration** for production-grade semantic search
- ✅ 3-tier search system (Pinecone → Keyword → Full text)
- ✅ Automatic transcript indexing in Pinecone
- ✅ Simplified chat system with keyword search fallback
- ✅ Fixed 500 errors with missing dependencies
- ✅ Natural language responses (no JSON output)
- ✅ Improved error handling and logging
- ✅ Better support for large files

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
