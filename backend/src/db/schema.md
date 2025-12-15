# Database Schema Documentation

## Overview
This document describes the database schema for the Audio Knowledge Base Q&A Application.

## Tables

### audio_files
Stores metadata about uploaded audio files.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Unique identifier |
| filename | VARCHAR(255) | Stored filename |
| original_filename | VARCHAR(255) | Original uploaded filename |
| file_path | VARCHAR(500) | Path to stored file |
| file_size | BIGINT | File size in bytes |
| file_type | VARCHAR(50) | MIME type (e.g., audio/mpeg) |
| duration_seconds | INTEGER | Audio duration in seconds (nullable) |
| status | VARCHAR(50) | Status: uploaded, transcribing, completed, failed |
| transcription_job_id | VARCHAR(255) | Job queue ID for transcription (nullable) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_audio_files_status` on `status`
- `idx_audio_files_created_at` on `created_at`

### transcripts
Stores transcribed text from audio files. One transcript per audio file.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Unique identifier |
| audio_file_id | INTEGER | Foreign key to audio_files.id |
| transcript_text | TEXT | Full transcript text |
| word_count | INTEGER | Number of words in transcript |
| language | VARCHAR(10) | Language code (default: 'en') |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Constraints:**
- UNIQUE constraint on `audio_file_id` (one transcript per audio file)
- Foreign key to `audio_files(id)` with CASCADE delete

**Indexes:**
- `idx_transcripts_audio_file_id` on `audio_file_id`

### conversations
Groups related Q&A sessions for an audio file. Users can have multiple conversations per audio file.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Unique identifier |
| audio_file_id | INTEGER | Foreign key to audio_files.id |
| title | VARCHAR(255) | Optional conversation title |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Constraints:**
- Foreign key to `audio_files(id)` with CASCADE delete

**Indexes:**
- `idx_conversations_audio_file_id` on `audio_file_id`
- `idx_conversations_created_at` on `created_at`

### messages
Stores individual questions and answers in conversations.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Unique identifier |
| conversation_id | INTEGER | Foreign key to conversations.id |
| role | VARCHAR(20) | 'user' or 'assistant' |
| content | TEXT | Message content (question or answer) |
| context_sections | TEXT[] | Array of transcript section references (nullable) |
| created_at | TIMESTAMP | Creation timestamp |

**Constraints:**
- Foreign key to `conversations(id)` with CASCADE delete
- `role` should be either 'user' or 'assistant'

**Indexes:**
- `idx_messages_conversation_id` on `conversation_id`
- `idx_messages_created_at` on `created_at`

## Relationships

```
audio_files (1) ──< (N) transcripts
audio_files (1) ──< (N) conversations
conversations (1) ──< (N) messages
```

## Triggers

- `update_updated_at_column()`: Automatically updates `updated_at` timestamp on UPDATE operations for:
  - audio_files
  - transcripts
  - conversations

## Notes

- All tables use CASCADE delete for foreign keys, so deleting an audio file will automatically delete related transcripts, conversations, and messages.
- The schema is designed for MVP without user authentication. A `users` table can be added later if needed.
- Transcripts are stored as full text. For very long transcripts, consider chunking strategies in the application layer.
- The `context_sections` field in messages is an array that can store references to specific parts of the transcript used to generate the answer.

