const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAIEmbeddings } = require('@langchain/openai');

// Try different import paths for text splitter
let RecursiveCharacterTextSplitter;
try {
  RecursiveCharacterTextSplitter = require('@langchain/textsplitters').RecursiveCharacterTextSplitter;
} catch (e) {
  try {
    RecursiveCharacterTextSplitter = require('langchain/text_splitter').RecursiveCharacterTextSplitter;
  } catch (e2) {
    // Simple fallback splitter
    RecursiveCharacterTextSplitter = class {
      constructor(options) {
        this.chunkSize = options.chunkSize || 1000;
        this.chunkOverlap = options.chunkOverlap || 200;
      }
      async splitText(text) {
        const chunks = [];
        for (let i = 0; i < text.length; i += this.chunkSize - this.chunkOverlap) {
          chunks.push(text.slice(i, i + this.chunkSize));
        }
        return chunks;
      }
    };
  }
}

/**
 * Pinecone Vector Store Service
 * Provides persistent vector storage for audio transcripts
 * Uses Pinecone client directly for better compatibility
 */
class PineconeService {
  constructor() {
    this.pinecone = null;
    this.embeddings = null;
    this.index = null;
    this.initialized = false;
  }

  /**
   * Initialize Pinecone client
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Check for required environment variables
      if (!process.env.PINECONE_API_KEY) {
        console.warn('⚠️ PINECONE_API_KEY not set. Pinecone vector store will not be available.');
        return;
      }

      if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️ OPENAI_API_KEY not set. Cannot create embeddings for Pinecone.');
        return;
      }

      // Initialize Pinecone client
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });

      // Initialize embeddings
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'text-embedding-3-small', // Cost-effective and fast
      });

      // Get index name from env or use default
      const indexName = process.env.PINECONE_INDEX || 'audio-transcripts';
      
      // Get the index
      this.index = this.pinecone.Index(indexName);

      this.initialized = true;
      console.log(`✅ Pinecone initialized with index: ${indexName}`);
    } catch (error) {
      console.error('❌ Error initializing Pinecone:', error.message);
      this.initialized = false;
    }
  }

  /**
   * Check if Pinecone is available
   */
  isAvailable() {
    return this.initialized && this.index && this.embeddings;
  }

  /**
   * Store transcript in Pinecone
   * @param {number} audioFileId - The audio file ID
   * @param {string} transcriptText - The transcript text
   * @returns {Promise<void>}
   */
  async storeTranscript(audioFileId, transcriptText) {
    await this.initialize();

    if (!this.isAvailable()) {
      throw new Error('Pinecone is not available. Check API keys.');
    }

    console.log(`Storing transcript for file ${audioFileId} in Pinecone...`);

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitText(transcriptText);

    // Create embeddings for each chunk
    const embeddings = await this.embeddings.embedDocuments(chunks);

    // Prepare vectors for Pinecone
    const namespace = `file-${audioFileId}`;
    const vectors = chunks.map((chunk, index) => ({
      id: `${audioFileId}-chunk-${index}`,
      values: embeddings[index],
      metadata: {
        audioFileId: audioFileId.toString(),
        chunkIndex: index,
        text: chunk,
        source: 'audio_transcript',
      },
    }));

    // Upsert to Pinecone in batches
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await this.index.namespace(namespace).upsert(batch);
    }

    console.log(`✅ Stored ${chunks.length} chunks for file ${audioFileId} in Pinecone`);
  }

  /**
   * Search transcript in Pinecone
   * @param {number} audioFileId - The audio file ID
   * @param {string} query - The search query
   * @param {number} k - Number of results to return
   * @returns {Promise<Array>} Array of relevant document chunks
   */
  async searchTranscript(audioFileId, query, k = 4) {
    await this.initialize();

    if (!this.isAvailable()) {
      throw new Error('Pinecone is not available. Check API keys.');
    }

    console.log(`Searching Pinecone for file ${audioFileId}: "${query}"`);

    const namespace = `file-${audioFileId}`;

    // Create embedding for the query
    const queryEmbedding = await this.embeddings.embedQuery(query);

    // Search in Pinecone
    const searchResults = await this.index.namespace(namespace).query({
      vector: queryEmbedding,
      topK: k,
      includeMetadata: true,
    });

    // Convert to LangChain-like document format
    const results = searchResults.matches.map(match => ({
      pageContent: match.metadata.text || '',
      metadata: match.metadata,
      score: match.score,
    }));

    console.log(`Found ${results.length} relevant chunks`);
    return results;
  }

  /**
   * Delete transcript from Pinecone
   * @param {number} audioFileId - The audio file ID
   */
  async deleteTranscript(audioFileId) {
    await this.initialize();

    if (!this.isAvailable()) {
      console.warn('Pinecone not available, skipping deletion');
      return;
    }

    try {
      const namespace = `file-${audioFileId}`;
      
      // Delete all vectors in this namespace
      await this.index.namespace(namespace).deleteAll();
      
      console.log(`✅ Deleted transcript for file ${audioFileId} from Pinecone`);
    } catch (error) {
      console.error(`Error deleting from Pinecone:`, error.message);
    }
  }

  /**
   * Check if transcript exists in Pinecone
   * @param {number} audioFileId - The audio file ID
   * @returns {Promise<boolean>}
   */
  async hasTranscript(audioFileId) {
    await this.initialize();

    if (!this.isAvailable()) {
      return false;
    }

    try {
      const namespace = `file-${audioFileId}`;
      const stats = await this.index.describeIndexStats();
      
      // Check if namespace exists and has vectors
      return stats.namespaces && 
             stats.namespaces[namespace] && 
             stats.namespaces[namespace].vectorCount > 0;
    } catch (error) {
      console.error('Error checking Pinecone:', error.message);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new PineconeService();
