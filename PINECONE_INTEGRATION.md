# Pinecone Vector Store Integration

## Overview

The Audio Knowledge Base Q&A App uses **Pinecone** as a persistent vector store for semantic search over audio transcripts. This provides high-quality, context-aware search capabilities that go beyond simple keyword matching.

## How It Works

### 1. **Transcript Indexing**

When an audio file is uploaded and transcribed:

- The transcript text is split into chunks (1000 characters with 200 character overlap)
- Each chunk is converted into a vector embedding using OpenAI's `text-embedding-3-small` model
- Vectors are stored in Pinecone with metadata (file ID, chunk index, original text)
- Each file gets its own namespace: `file-{audioFileId}`

### 2. **Semantic Search**

When a user asks a question:

- The agent first checks if the transcript is indexed in Pinecone
- If indexed, it performs semantic search to find the most relevant chunks
- If not indexed, it automatically triggers background indexing and uses keyword fallback
- Search results are used as context for the AI to generate accurate answers

### 3. **Fallback Mechanism**

The system has multiple fallback layers:

1. **Pinecone Semantic Search** (best quality)
2. **Keyword Search** (good for exact matches)
3. **Full Context** (for small transcripts)

## Configuration

### Required Environment Variables

```env
# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=audio-transcripts

# OpenAI (for embeddings)
OPENAI_API_KEY=your_openai_api_key_here
```

### Setting Up Pinecone

1. **Create a Pinecone Account**

   - Go to [https://www.pinecone.io/](https://www.pinecone.io/)
   - Sign up for a free account

2. **Create an Index**

   - Name: `audio-transcripts` (or your preferred name)
   - Dimensions: `1536` (for OpenAI text-embedding-3-small)
   - Metric: `cosine`
   - Cloud: Choose your preferred region

3. **Get API Key**
   - Go to API Keys section
   - Copy your API key
   - Add to `.env` file

## Usage

### Automatic Indexing

Transcripts are automatically indexed in Pinecone when:

- A new audio file is uploaded and transcribed
- A transcript is regenerated
- The agent detects a missing index during search

### Manual Indexing Check

To check which files are indexed and fix any missing ones:

```bash
npm run check-pinecone
```

This script will:

- List all audio files in the database
- Check if each has a transcript
- Verify if the transcript is indexed in Pinecone
- Automatically index any missing transcripts

### Programmatic Access

```javascript
const pineconeService = require("./services/pineconeService");

// Initialize
await pineconeService.initialize();

// Check if available
if (pineconeService.isAvailable()) {
  // Store transcript
  await pineconeService.storeTranscript(audioFileId, transcriptText);

  // Search transcript
  const results = await pineconeService.searchTranscript(audioFileId, query, 4);

  // Check if indexed
  const hasVectors = await pineconeService.hasTranscript(audioFileId);

  // Delete transcript
  await pineconeService.deleteTranscript(audioFileId);
}
```

## Troubleshooting

### "Transcript not in Pinecone yet"

**Cause**: The transcript hasn't been indexed yet (indexing happens asynchronously).

**Solutions**:

1. Wait a few seconds and try again (indexing usually takes 5-10 seconds)
2. Run `npm run check-pinecone` to manually trigger indexing
3. The system will automatically use keyword fallback and trigger background indexing

### "Pinecone is not available"

**Cause**: Missing or invalid API keys.

**Solutions**:

1. Check that `PINECONE_API_KEY` is set in `.env`
2. Check that `OPENAI_API_KEY` is set (needed for embeddings)
3. Verify your Pinecone API key is valid
4. Ensure your Pinecone index exists and has the correct dimensions (1536)

### "Error initializing Pinecone"

**Cause**: Network issues or invalid index configuration.

**Solutions**:

1. Check your internet connection
2. Verify the index name in `PINECONE_INDEX` matches your actual index
3. Ensure the index dimensions are set to 1536
4. Check Pinecone dashboard for service status

### Slow Search Performance

**Cause**: Large number of chunks or network latency.

**Solutions**:

1. Reduce chunk size in `pineconeService.js` (line 111)
2. Reduce number of results (`k` parameter)
3. Consider using a Pinecone region closer to your server
4. Upgrade to a paid Pinecone plan for better performance

## Architecture

### File Structure

```
backend/
├── src/
│   └── services/
│       ├── pineconeService.js    # Pinecone client and operations
│       ├── agentService.js        # Uses Pinecone for search
│       └── ragService.js          # Fallback vector store
├── check-pinecone-status.js       # Diagnostic script
└── .env                           # Configuration
```

### Data Flow

```
Upload Audio
    ↓
Transcribe (Groq)
    ↓
Save to Database
    ↓
Index in Pinecone (async) ──→ [Namespace: file-{id}]
    ↓
Ready for Search
```

### Search Flow

```
User Question
    ↓
Check Pinecone Available? ──No──→ Keyword Fallback
    ↓ Yes
Check Indexed? ──No──→ Trigger Indexing + Keyword Fallback
    ↓ Yes
Semantic Search
    ↓
Return Top 4 Chunks
    ↓
Generate AI Answer
```

## Performance Considerations

### Indexing Speed

- Small files (< 5 min): ~5 seconds
- Medium files (5-30 min): ~10-20 seconds
- Large files (> 30 min): ~30-60 seconds

### Search Speed

- Pinecone semantic search: ~200-500ms
- Keyword fallback: ~50-100ms

### Cost

- **Pinecone Free Tier**: 1 index, 100K vectors (enough for ~100 hours of audio)
- **OpenAI Embeddings**: ~$0.0001 per 1000 tokens (~$0.01 per hour of audio)

## Best Practices

1. **Always set API keys** before running the application
2. **Run `npm run check-pinecone`** after bulk uploads
3. **Monitor console logs** for indexing status
4. **Use namespaces** to keep files separate (already implemented)
5. **Delete old vectors** when deleting audio files (already implemented)

## Future Enhancements

- [ ] Batch indexing for multiple files
- [ ] Progress tracking for indexing
- [ ] Metadata filtering (by date, speaker, etc.)
- [ ] Multi-language support
- [ ] Hybrid search (semantic + keyword)
- [ ] Caching frequently accessed chunks

## Support

For issues or questions:

1. Check the console logs for detailed error messages
2. Run `npm run check-pinecone` to diagnose indexing issues
3. Verify your Pinecone dashboard shows the correct index and vectors
4. Review this documentation for common troubleshooting steps
