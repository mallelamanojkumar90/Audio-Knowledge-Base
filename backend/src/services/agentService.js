const aiModelService = require('./aiModelService');
const ragService = require('./ragService');
const pineconeService = require('./pineconeService');
const emailService = require('./emailService');
const { Transcript } = require('../models');

class AgentService {
  constructor() {
    // Initialize Pinecone on startup
    pineconeService.initialize().catch(err => {
      console.log('Pinecone initialization deferred:', err.message);
    });
  }

  /**
   * Tool: Search Transcript
   * Tries Pinecone semantic search first, falls back to keyword search
   */
  async toolSearchTranscript(audioFileId, transcriptText, query) {
    console.log(`[Tool] Searching transcript for: ${query}`);
    
    // Try Pinecone first (best quality)
    try {
      if (pineconeService.isAvailable()) {
        const hasVectors = await pineconeService.hasTranscript(audioFileId);
        
        if (hasVectors) {
          console.log('[Tool] Using Pinecone semantic search...');
          const results = await pineconeService.searchTranscript(audioFileId, query, 4);
          
          if (results.length > 0) {
            return results.map(doc => doc.pageContent).join('\n\n');
          }
        } else {
          console.log('[Tool] Transcript not in Pinecone yet');
          
          // Auto-index if we have transcript text
          if (transcriptText && transcriptText.length > 0) {
            console.log('[Tool] Triggering background indexing...');
            // Don't wait for this - let it happen in background
            pineconeService.storeTranscript(audioFileId, transcriptText)
              .then(() => console.log(`[Tool] ✅ Transcript ${audioFileId} indexed in Pinecone`))
              .catch(err => console.log(`[Tool] ⚠️ Indexing failed: ${err.message}`));
          }
          
          console.log('[Tool] Using fallback search for now');
        }
      }
    } catch (error) {
      console.log('[Tool] Pinecone search failed, using fallback:', error.message);
    }

    // Fallback to keyword search
    console.log('[Tool] Using keyword search fallback...');
    
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
   * Sends an email with summary content
   */
  async toolSendSummaryEmail(recipient, summary, fileName = 'Audio Transcript') {
    console.log(`[Tool] Sending email to ${recipient}...`);
    
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipient)) {
        return `Invalid email address: ${recipient}. Please provide a valid email address.`;
      }

      // Send email using the email service
      const result = await emailService.sendTranscriptSummary(recipient, fileName, summary);
      
      if (result.success) {
        if (result.mode === 'console') {
          return `Email content has been logged to the console (email service not configured). To send actual emails, please configure EMAIL_PROVIDER in the environment variables.`;
        } else {
          return `Email successfully sent to ${recipient}. Message ID: ${result.messageId}`;
        }
      } else {
        return `Failed to send email: ${result.message}. The content has been logged to the console.`;
      }
      
    } catch (error) {
      console.error('[Tool] Error in send_summary_email:', error);
      return `Error sending email: ${error.message}`;
    }
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
