# Pinecone Integration Guide

## Overview

Pinecone provides **persistent vector storage** for your audio transcripts, enabling:

- ✅ **Semantic search** - Find content by meaning, not just keywords
- ✅ **Better accuracy** - More relevant results than keyword matching
- ✅ **Persistent storage** - Vectors survive server restarts
- ✅ **Scalability** - Handle thousands of transcripts efficiently

## Setup Instructions

### Step 1: Create Pinecone Account

1. Go to [Pinecone](https://www.pinecone.io/)
2. Sign up for a free account (includes 100K vectors free)
3. Create a new project

### Step 2: Create an Index

1. In the Pinecone console, click **"Create Index"**
2. Configure the index:

   - **Name**: `audio-transcripts` (or your preferred name)
   - **Dimensions**: `1536` (for OpenAI text-embedding-3-small)
   - **Metric**: `cosine`
   - **Cloud**: Choose your preferred region
   - **Plan**: Start with the free Starter plan

3. Click **"Create Index"**

### Step 3: Get API Keys

1. In Pinecone console, go to **API Keys**
2. Copy your API key
3. Note your environment (e.g., `us-east-1-aws`)

### Step 4: Configure Environment Variables

Add to `backend/.env`:

```env
# Pinecone Configuration
PINECONE_API_KEY=your-pinecone-api-key-here
PINECONE_INDEX=audio-transcripts

# Required: OpenAI for embeddings
OPENAI_API_KEY=sk-your-openai-key-here
```

### Step 5: Restart Backend

```bash
cd backend
npm run dev
```

## How It Works

### Automatic Indexing

When you upload an audio file:

1. Audio is transcribed by Groq Whisper
2. Transcript is saved to PostgreSQL
3. **Transcript is automatically indexed in Pinecone** (background)
4. Ready for semantic search!

### Search Priority

The system uses a **3-tier fallback**:

1. **Pinecone Semantic Search** (Best) - If configured and transcript is indexed
2. **Keyword Search** (Good) - If Pinecone unavailable
3. **Full Text** (Fallback) - If no matches found

### Namespace Organization

Each audio file gets its own namespace in Pinecone:

- Namespace format: `file-{audioFileId}`
- Example: `file-17`, `file-18`, etc.
- Keeps transcripts isolated and organized

## Cost Considerations

### Free Tier

- **100,000 vectors** free
- Typical transcript: 50-200 vectors (chunks)
- Free tier = ~500-2000 audio files

### Paid Plans

- Start at $70/month for 1M vectors
- Only needed for large-scale deployments

### OpenAI Embeddings Cost

- text-embedding-3-small: $0.02 per 1M tokens
- Typical transcript: ~1,000-5,000 tokens
- Cost per file: $0.00002-$0.0001 (negligible)

## Testing

### Check if Pinecone is Working

Upload a new audio file and check the backend logs:

```
✅ Pinecone initialized with index: audio-transcripts
✅ Transcript stored in Pinecone for file 17
```

### Test Semantic Search

Ask questions in the chat:

- "What is this about?" → Should use Pinecone
- "Summarize the main points" → Should use Pinecone

Check logs for:

```
[Tool] Using Pinecone semantic search...
Found 4 relevant chunks
```

## Troubleshooting

### "Pinecone not available"

**Check:**

- `PINECONE_API_KEY` is set in `.env`
- `OPENAI_API_KEY` is set (required for embeddings)
- Index name matches `PINECONE_INDEX` in `.env`
- Backend server restarted after adding keys

### "Index not found"

**Solution:**

- Verify index name in Pinecone console
- Update `PINECONE_INDEX` in `.env` to match
- Restart backend

### Slow Indexing

**Normal behavior:**

- Indexing happens in background
- Doesn't block transcript generation
- May take 10-30 seconds for large files
- Chat works immediately with keyword search

### High Costs

**Optimization:**

- Use text-embedding-3-small (cheapest)
- Adjust chunk size in `pineconeService.js` (default: 1000 chars)
- Monitor usage in Pinecone console

## Advanced Configuration

### Custom Index Name

```env
PINECONE_INDEX=my-custom-index
```

### Different Embedding Model

Edit `backend/src/services/pineconeService.js`:

```javascript
this.embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-large", // Higher quality, more expensive
});
```

Update index dimensions to `3072` in Pinecone console.

### Adjust Chunk Size

Edit `backend/src/services/pineconeService.js`:

```javascript
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500, // Smaller chunks = more vectors, better precision
  chunkOverlap: 100,
});
```

## Migration from Existing Transcripts

If you have existing transcripts, you can index them:

```bash
# Create a migration script (example)
node backend/src/scripts/index-existing-transcripts.js
```

Or manually regenerate transcripts (they'll auto-index).

## Monitoring

### Pinecone Console

- View vector count per namespace
- Monitor query performance
- Check storage usage

### Backend Logs

- `✅ Transcript stored in Pinecone` = Success
- `⚠️ Failed to store in Pinecone` = Fallback to keyword search

## Disable Pinecone

To disable Pinecone and use only keyword search:

1. Remove or comment out in `.env`:

```env
# PINECONE_API_KEY=...
# PINECONE_INDEX=...
```

2. System automatically falls back to keyword search

## Summary

✅ **Setup**: 5 minutes  
✅ **Cost**: Free for most users  
✅ **Benefit**: Much better search quality  
✅ **Fallback**: Works without Pinecone

Pinecone is **optional but recommended** for production deployments!
