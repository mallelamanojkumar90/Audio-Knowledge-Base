# Audio Knowledge Base Q&A Application

An intelligent web application that transforms audio files into interactive knowledge bases, enabling users to ask natural language questions and receive accurate answers derived from the audio content.

## Features

- 🎵 **Audio Upload**: Support for MP3, WAV, M4A, AAC, FLAC formats (up to 500MB)
- 🎤 **Automatic Transcription**: Powered by OpenAI Whisper API
- 💬 **AI-Powered Q&A**: Ask questions and get answers using Anthropic Claude API
- 📝 **Transcript Viewing**: View full transcripts with timestamps
- 💾 **Conversation History**: Maintain context across multiple questions

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS
- React Router

### Backend
- Node.js with Express
- PostgreSQL
- Bull/BullMQ for job processing

### AI Services
- OpenAI Whisper API (transcription)
- Anthropic Claude API (question answering)

## Project Structure

```
.
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── .cursor/           # Project planning and documentation
└── README.md          # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis (for job queue, optional for MVP)
- OpenAI API key
- Anthropic API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd "Audio KnowledgeBase Q&A App"
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables

Backend (create `backend/.env`):
```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/audio_kb
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

Frontend (create `frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:3001
```

5. Set up the database

First, create a PostgreSQL database:
```sql
CREATE DATABASE audio_kb;
```

Then, set the DATABASE_URL in your `backend/.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/audio_kb
```

Run migrations to create the database schema:
```bash
cd backend
npm run migrate
```

Test the database connection:
```bash
npm run test-db
```

6. Start the development servers

Backend:
```bash
cd backend
npm run dev
```

Frontend (in a new terminal):
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Development

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run migrate` - Run database migrations
- `npm run test` - Run tests

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## API Documentation

API documentation will be available at `/api/docs` once implemented.

## License

[To be determined]

## Contributing

[To be determined]

