const { ChatGroq } = require('@langchain/groq');
const { ChatAnthropic } = require('@langchain/anthropic');
const { ChatOpenAI } = require('@langchain/openai');

/**
 * Multi-Model AI Service
 * Supports multiple AI providers: Groq (Llama), OpenAI, Anthropic
 */
class AIModelService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'groq'; // Default to Groq
    this.model = null;
    this.initialized = false;
    // Don't initialize immediately - wait until first use
  }

  /**
   * Initialize the AI model based on the configured provider
   */
  initializeModel() {
    if (this.initialized) {
      return; // Already initialized
    }

    try {
      switch (this.provider.toLowerCase()) {
        case 'groq':
          this.model = this.initializeGroq();
          console.log('✅ AI Model initialized: Groq (Llama)');
          break;

        case 'openai':
          this.model = this.initializeOpenAI();
          console.log('✅ AI Model initialized: OpenAI');
          break;

        case 'anthropic':
          this.model = this.initializeAnthropic();
          console.log('✅ AI Model initialized: Anthropic (Claude)');
          break;

        default:
          console.warn(`⚠️ Unknown AI provider: ${this.provider}. Defaulting to Groq.`);
          this.provider = 'groq';
          this.model = this.initializeGroq();
      }
      this.initialized = true;
    } catch (error) {
      console.error('❌ Error initializing AI model:', error.message);
      console.warn('⚠️ AI Model will be unavailable for Q&A. Transcription will still work.');
      // Don't throw - allow server to start even if AI model fails
    }
  }

  /**
   * Initialize Groq (Llama) model
   */
  initializeGroq() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }

    const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    return new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: modelName,
      temperature: 0.7,
      maxTokens: 2048,
    });
  }

  /**
   * Initialize OpenAI model
   */
  initializeOpenAI() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    const modelName = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

    return new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: modelName,
      temperature: 0.7,
      maxTokens: 2048,
    });
  }

  /**
   * Initialize Anthropic (Claude) model
   */
  initializeAnthropic() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }

    const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

    return new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: modelName,
      temperature: 0.7,
      maxTokens: 2048,
    });
  }

  /**
   * Get the initialized model
   */
  getModel() {
    if (!this.initialized) {
      this.initializeModel();
    }
    if (!this.model) {
      throw new Error('AI model not initialized - check API key configuration');
    }
    return this.model;
  }

  /**
   * Get the current provider name
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Invoke the model with a prompt
   * @param {string} prompt - The prompt to send to the model
   * @returns {Promise<string>} The model's response
   */
  async invoke(prompt) {
    try {
      const response = await this.model.invoke(prompt);
      return response.content;
    } catch (error) {
      console.error('Error invoking AI model:', error);
      throw new Error(`AI model invocation failed: ${error.message}`);
    }
  }

  /**
   * Get model information
   */
  getModelInfo() {
    const info = {
      provider: this.provider,
      isInitialized: !!this.model,
    };

    switch (this.provider) {
      case 'groq':
        info.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
        info.apiKeySet = !!process.env.GROQ_API_KEY;
        break;
      case 'openai':
        info.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
        info.apiKeySet = !!process.env.OPENAI_API_KEY;
        break;
      case 'anthropic':
        info.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
        info.apiKeySet = !!process.env.ANTHROPIC_API_KEY;
        break;
    }

    return info;
  }

  /**
   * Initialize Embeddings model
   * Currently defaults to OpenAI as it's the most reliable standard
   */
  initializeEmbeddings() {
    // We prioritize OpenAI for embeddings even if using Groq for Chat
    if (process.env.OPENAI_API_KEY) {
      const { OpenAIEmbeddings } = require('@langchain/openai');
      return new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'text-embedding-3-small', // Cheap and fast
      });
    }
    
    // Future: Add HuggingFace or others here
    
    // If no embedding provider available
    console.warn('⚠️ No embedding provider available (checking OPENAI_API_KEY). RAG functionality may be limited.');
    return null;
  }

  /**
   * Get embeddings model
   */
  getEmbeddings() {
    if (!this.embeddings) {
      this.embeddings = this.initializeEmbeddings();
    }
    return this.embeddings;
  }
}

// Export singleton instance
module.exports = new AIModelService();
