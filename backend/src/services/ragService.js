let MemoryVectorStore;
try {
  ({ MemoryVectorStore } = require('langchain/vectorstores/memory'));
} catch (e) {
  try {
    ({ MemoryVectorStore } = require('@langchain/community/vectorstores/memory'));
  } catch (e2) {
    console.warn('Could not load MemoryVectorStore from standard paths.');
  }
}

let RecursiveCharacterTextSplitter;
try {
  ({ RecursiveCharacterTextSplitter } = require('langchain/text_splitter'));
} catch (e) {
   // Fallback or re-throw
   console.warn('Could not load RecursiveCharacterTextSplitter');
}

const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence } = require('@langchain/core/runnables');
const { Document } = require('@langchain/core/documents');
const aiModelService = require('./aiModelService');

class RAGService {
  constructor() {
    this.vectorStores = new Map(); // Cache vector stores by audioFileId
  }

  /**
   * Get or create a vector store for a transcript
   */
  async getVectorStore(audioFileId, transcriptText) {
    if (this.vectorStores.has(audioFileId)) {
      return this.vectorStores.get(audioFileId);
    }

    console.log(`Creating vector store for file ${audioFileId}...`);
    
    // Get embeddings model
    const embeddings = aiModelService.getEmbeddings();
    if (!embeddings) {
      throw new Error('Embeddings not configured. Cannot create vector store.');
    }

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([transcriptText]);
    
    // Create vector store
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    
    // Cache it (in memory for now)
    this.vectorStores.set(audioFileId, vectorStore);
    console.log(`Vector store created for file ${audioFileId} with ${docs.length} chunks.`);
    
    return vectorStore;
  }

  /**
   * Initialize RAG for a file (pre-compute embeddings)
   */
  async initializeRAG(audioFileId, transcriptText) {
    return await this.getVectorStore(audioFileId, transcriptText);
  }

  /**
   * Generate an answer using RAG
   */
  async generateAnswer(audioFileId, transcriptText, question, history = []) {
    try {
      // Get vector store
      const vectorStore = await this.getVectorStore(audioFileId, transcriptText);
      const retriever = vectorStore.asRetriever({ k: 4 }); // Retrieve top 4 chunks

      // Retrieve documents
      const contextDocs = await retriever.getRelevantDocuments(question);
      const context = contextDocs.map(doc => doc.pageContent).join('\n\n');

      console.log(`Retrieved ${contextDocs.length} chunks for context.`);

      // Get LLM
      const model = aiModelService.getModel();

      // Construct prompt
      const promptTemplate = ChatPromptTemplate.fromMessages([
        ["system", `You are a helpful assistant answering questions about an audio transcript.
Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context:
{context}
`],
        ...history.map(msg => [msg.role, msg.content]), // Include history
        ["user", "{question}"]
      ]);

      const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser()
      ]);

      const response = await chain.invoke({
        context: context,
        question: question
      });

      return {
        answer: response,
        sources: contextDocs.map(doc => doc.pageContent.substring(0, 100) + '...')
      };

    } catch (error) {
      console.error('RAG Error:', error);
      // Fallback: If embeddings fail, try context stuffing if text is small enough
      // Llama 3.3 on Groq has 128k context, so we can handle approx 400k-500k characters
      if (transcriptText.length < 500000) { 
         console.log('Falling back to context stuffing (Text length: ' + transcriptText.length + ')...');
         return this.generateAnswerContextStuffing(transcriptText, question, history);
      }
      throw error;
    }
  }

  /**
   * Fallback method without embeddings
   */
  async generateAnswerContextStuffing(transcriptText, question, history) {
      const model = aiModelService.getModel();
      
      const promptTemplate = ChatPromptTemplate.fromMessages([
        ["system", `You are a helpful assistant answering questions about an audio transcript.
Use the following full transcript to answer the question.

Transcript:
{context}
`],
        ...history.map(msg => [msg.role, msg.content]),
        ["user", "{question}"]
      ]);

      const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser()
      ]);

      const response = await chain.invoke({
        context: transcriptText,
        question: question
      });

      return {
        answer: response,
        sources: ['Full transcript used']
      };
  }
}

module.exports = new RAGService();
