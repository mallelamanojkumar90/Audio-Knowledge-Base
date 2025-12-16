# Phase 4 Implementation Plan: Q&A System with RAG

## Objective

Implement a robust Question & Answer system that allows users to chat with their audio transcripts using Retrieval Augmented Generation (RAG).

## Core Technologies

- **LangChain**: For orchestration, text splitting, and retrieval.
- **Vector Store**: `MemoryVectorStore` (transient) or `HNSWLib` (persistent) for storing embeddings.
- **Embeddings**: Configurable (OpenAI `text-embedding-3-small` recommended for speed/cost, or HuggingFace).
- **LLM**: Groq (Llama 3) for answer generation.

## Implementation Steps

### 1. Backend: RAG Service (`src/services/ragService.js`)

- [ ] Create `RAGService` class.
- [ ] Implement `ingestTranscript(transcriptText)`:
  - Split text into chunks (~1000 characters, 200 overlap).
  - Generate embeddings.
  - Store in Vector Store.
- [ ] Implement `query(question, conversationHistory)`:
  - Retrieve relevant chunks.
  - Format prompt with context.
  - call `aiModelService` to generate answer.
- [ ] Add caching for vector stores (don't re-embed on every query).

### 2. Backend: Chat Management (`src/controllers/chatController.js`)

- [ ] `POST /api/chat/start`: Initialize a chat session.
- [ ] `POST /api/chat/:sessionId/message`: Send a user message and get streaming response.
- [ ] `GET /api/chat/:sessionId/history`: Get past messages.

### 3. Database Updates

- [ ] Create `conversations` table (user sessions).
- [ ] Create `messages` table (chat history).

### 4. Frontend: Chat Interface (`src/pages/ChatPage.tsx`)

- [ ] Create chat layout (Sidebar for history, Main chat area).
- [ ] Implement real-time message streaming.
- [ ] Display citations/sources (which part of transcript was used).

## Dependencies Logic

- **Embeddings**: We need an embedding provider. The simplest reliable one is OpenAI.
  - _Action_: We will check `OPENAI_API_KEY`. If missing, we might need a fallback or prompt user.

## Estimated Timeline

1. Database Schema & RAG Service Skeleton (30 mins)
2. Embeddings & Vector Search Implementation (45 mins)
3. Chat Controller & API (30 mins)
4. Frontend Chat UI (60 mins)
