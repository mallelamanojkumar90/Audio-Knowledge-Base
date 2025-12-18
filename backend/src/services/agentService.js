const aiModelService = require('./aiModelService');
const ragService = require('./ragService');
const { Transcript } = require('../models');
const { DuckDuckGoSearch } = require('@langchain/community/tools/duckduckgo_search');

class AgentService {
  constructor() {
    this.searchTool = new DuckDuckGoSearch({ maxResults: 5 });
  }

  /**
   * Tool: Search Transcript
   * Semantic search over the transcript (with fallback to simple search)
   */
  async toolSearchTranscript(audioFileId, transcriptText, query) {
    console.log(`[Tool] Searching transcript for: ${query}`);
    try {
      // Try semantic search first
      const vectorStore = await ragService.getVectorStore(audioFileId, transcriptText);
      const retriever = vectorStore.asRetriever({ k: 4 });
      const docs = await retriever.getRelevantDocuments(query);
      
      if (docs.length === 0) return "No relevant information found in the transcript.";
      
      return docs.map(d => d.pageContent).join('\n\n');
    } catch (error) {
      // Fallback to simple keyword search if embeddings aren't available
      console.log('[Tool] Embeddings not available, using simple text search...');
      
      if (!transcriptText || transcriptText.length === 0) {
        return "No transcript text available.";
      }
      
      // Simple approach: split into paragraphs and find relevant ones
      const paragraphs = transcriptText.split(/\n\n+/).filter(p => p.trim().length > 0);
      const queryWords = query.toLowerCase().split(/\s+/);
      
      // Score each paragraph by keyword matches
      const scored = paragraphs.map(para => {
        const paraLower = para.toLowerCase();
        const score = queryWords.reduce((sum, word) => {
          return sum + (paraLower.includes(word) ? 1 : 0);
        }, 0);
        return { para, score };
      }).filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4); // Top 4 paragraphs
      
      if (scored.length === 0) {
        // Return first few paragraphs as context
        return paragraphs.slice(0, 3).join('\n\n');
      }
      
      return scored.map(item => item.para).join('\n\n');
    }
  }

  /**
   * Tool: Get Audio Timestamp
   * Returns exact start/end timestamps for keywords
   */
  async toolGetAudioTimestamp(audioFileId, keywords) {
    console.log(`[Tool] Getting timestamps for: ${keywords}`);
    try {
      // Fetch fresh transcript to ensure we have segments
      const transcript = await Transcript.findByAudioFileId(audioFileId);
      
      if (!transcript || !transcript.segments) {
        return "Timestamp information is not available for this file (it might have been transcribed before this feature was added).";
      }

      const segments = transcript.segments; // JSONB array
      if (!Array.isArray(segments) || segments.length === 0) {
        return "No timestamp segments available.";
      }

      const lowerKeywords = keywords.toLowerCase();
      // Simple keyword matching for now
      const matches = segments.filter(seg => 
        seg.text && seg.text.toLowerCase().includes(lowerKeywords)
      );

      if (matches.length === 0) {
        return `No exact matches found for "${keywords}".`;
      }

      // Return top 5 matches
      return matches.slice(0, 5).map(m => 
        `Time: ${m.start.toFixed(2)}s - ${m.end.toFixed(2)}s: "${m.text.trim()}"`
      ).join('\n');

    } catch (error) {
      console.error('Error in get_audio_timestamp:', error);
      return "Error retrieving timestamps: " + error.message;
    }
  }

  /**
   * Tool: Web Search
   * Searches the internet
   */
  async toolWebSearch(query) {
    console.log(`[Tool] Web searching for: ${query}`);
    try {
      // First try DuckDuckGo
      const result = await this.searchTool.invoke(query);
      return result;
    } catch (error) {
      console.error('Error in web_search:', error);
      return "Error performing web search. Please try again or rely on internal knowledge.";
    }
  }

  /**
   * Tool: Send Summary Email
   * Sends an email (Mock)
   */
  async toolSendSummaryEmail(recipient, summary) {
    console.log(`[Tool] Sending email to ${recipient}...`);
    // Mock implementation
    console.log(`Subject: Audio Transcript Summary\nTo: ${recipient}\nBody:\n${summary}`);
    return `Email successfully sent to ${recipient}.`;
  }

  /**
   * Main Agent Execution Method - Simplified Approach
   */
  async generateResponse(audioFileId, transcriptText, userMessage, history) {
    try {
      // For most questions, we'll search the transcript first
      let context = '';
      
      // Check if the question is about the transcript content
      const needsTranscript = !userMessage.toLowerCase().includes('email') && 
                             !userMessage.toLowerCase().includes('search the web');
      
      if (needsTranscript && transcriptText) {
        console.log('[Agent] Searching transcript for context...');
        context = await this.toolSearchTranscript(audioFileId, transcriptText, userMessage);
      }
      
      // Build conversation for LLM
      const messages = [
        {
          role: 'system',
          content: `You are a helpful AI assistant that answers questions about audio transcripts.

${context ? `Here is relevant information from the transcript:\n${context}\n\n` : ''}

Instructions:
- Answer the user's question naturally and conversationally
- If the answer is in the transcript context above, cite it appropriately (e.g., "According to the transcript...")
- If asked about timestamps, mention that timestamp information is available
- Be concise but informative
- Never output JSON or mention internal tools`
        },
        ...history.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })),
        {
          role: 'user',
          content: userMessage
        }
      ];

      // Get response from AI
      const model = aiModelService.getModel();
      const response = await model.invoke(messages);
      
      return {
        answer: response.content,
        sources: []
      };
      
    } catch (error) {
      console.error('Agent Error:', error);
      return {
        answer: "I encountered an error processing your request. Please try again.",
        sources: []
      };
    }
  }
}

module.exports = new AgentService();
