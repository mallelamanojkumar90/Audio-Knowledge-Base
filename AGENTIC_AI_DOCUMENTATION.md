# Agentic AI & ReAct Architecture Documentation

This document describes the **Advanced Audio Knowledge Agent** implemented in the Audio KnowledgeBase Q&A App. The system has moved beyond simple RAG (Retrieval Augmented Generation) to a fully **Agentic** architecture using a **ReAct (Reasoning and Acting)** loop.

## 1. Overview

The Agentic AI is designed to not just answer questions based on retrieved text, but to _actively reason_ about the user's request. It can:

1.  **Analyze** the intent (e.g., retrieving facts vs. finding timestamps vs. external validation).
2.  **Plan** a sequence of actions.
3.  **Execute Tools** to gather information.
4.  **Synthesize** a final answer based on multiple data sources.

## 2. Architecture: Single-Turn ReAct Loop

The core of the agent is the `AgentService` (`backend/src/services/agentService.js`). Unlike a standard chatbot that takes input and predicts output, this service enters a loop:

1.  **Input**: User message + Conversation History.
2.  **Thought (Process)**:
    - The Agent (LLM) receives a System Prompt defining its persona and available **Tools**.
    - It "thinks" about which tool to call.
    - It outputs a structural decision (JSON).
3.  **Action (Tool Execution)**:
    - The `AgentService` detects the JSON tool call.
    - It executes the corresponding JavaScript function (e.g., searching the DB or the Web).
4.  **Observation**:
    - The tool calculates a result (e.g., a search string or timestamp list).
    - This result is fed _back_ into the LLM as a "System" message.
5.  **Final Response**:
    - The LLM assumes the role of "Analyst" having seen the tool output.
    - It generates the final natural language response for the user.

_Note: The current implementation supports a multi-step loop (up to 5 steps), allowing the agent to chain tools (e.g., Search Transcript -> Then Web Search)._

## 3. Capabilities & Tools

The agent has access to the following 4 distinct tools:

### A. `search_transcript(query)`

- **Purpose**: Semantic search over the audio content.
- **Internal Mechanism**: Uses the existing stored Vector Store (RAG) to find up to 4 relevant context chunks.
- **Use Case**: "What did the speaker say about upcoming features?", "Summarize the marketing section."

### B. `get_audio_timestamp(topic_keywords)`

- **Purpose**: Pinpoint exact moments in time.
- **Internal Mechanism**: Scans the specific `segments` JSON data stored in the `transcripts` database table. It performs keyword matching against these granular segments.
- **Use Case**: "When did they mention 'API rate limits'?", "Give me the timestamp for the budget discussion."
- **Requirement**: Audio files must be transcribed _after_ this feature was implemented to have segment data.

### C. `web_search(query)`

- **Purpose**: Fetch live information from the internet.
- **Internal Mechanism**: Uses `DuckDuckGoSearchRun` from LangChain Community.
- **Use Case**: "The speaker mentioned 'Project Apollo' - what is that in the real world?", "Fact check the population figure mentioned.", "What is the stock price of the company mentioned?"

### D. `send_summary_email(recipient_email, summary_text)`

- **Purpose**: Action execution.
- **Internal Mechanism**: Currently a **Mock** implementation that logs the email content to the server console.
- **Use Case**: "Email a summary of this meeting to boss@example.com."

## 4. Database Changes

To support the Timestamp tool (`get_audio_timestamp`), the database schema was modified:

- **Table**: `transcripts`
- **New Column**: `segments` (Type: `JSONB`)
- **Description**: Stores the full array of `start`, `end`, and `text` segments returned by the connection to the Groq Whisper model.

## 5. Usage Examples

### Example 1: Fact Checking (Multi-Step)

**User**: "The speaker said Python was created in 1989. Is that true?"
**Agent Thought**:

1.  Call `search_transcript("Python creation date")` -> Returns quote "Python was created in 1989."
2.  Call `web_search("When was Python created?")` -> Returns "Python was first released in 1991, conceived in late 1980s."
3.  **Final Answer**: "The speaker mentioned 1989, which is close. According to external sources, implementation started in 1989 but it was first released in 1991."

### Example 2: Finding Timestamps

**User**: "Skip to the part where they talk about deployment."
**Agent Thought**:

1.  Call `get_audio_timestamp("deployment")`.
2.  **Final Answer**: "They discuss deployment at the following times:
    - 04:23 - 04:30: '...ready for deployment...'
    - 10:15 - 10:20: '...deployment strategies...'"

## 6. Configuration & Setup

- **Groq API Key**: Essential for the underlying LLM (Llama 3) to perform the reasoning. Ensure `GROQ_API_KEY` is set in `.env`.
- **Dependencies**: Requires `@langchain/community` for the web search tool (already installed).

## 7. Future Improvements

- **Email Integration**: Connect `send_summary_email` into a real provider like SendGrid or Nodemailer.
- **Context Management**: Allow the agent to "remember" tool outputs across different turns of conversation (currently it carries context largely within the single request loop + basic chat history).
