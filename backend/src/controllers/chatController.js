const { AudioFile, Transcript } = require('../models'); // We need direct DB access for messages/conversations since there are no models for them yet
const pool = require('../config/database');
const asyncHandler = require('../middleware/asyncHandler');
const ragService = require('../services/ragService');

/**
 * Get chat history for a file
 */
exports.getChatHistory = asyncHandler(async (req, res) => {
  const { fileId } = req.params;

  // Find conversation for this file
  const conversationResult = await pool.query(
    'SELECT * FROM conversations WHERE audio_file_id = $1 ORDER BY created_at DESC LIMIT 1',
    [fileId]
  );

  if (conversationResult.rows.length === 0) {
    return res.json({
      success: true,
      data: []
    });
  }

  const conversationId = conversationResult.rows[0].id;

  // Get messages
  const messagesResult = await pool.query(
    'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
    [conversationId]
  );

  res.json({
    success: true,
    data: messagesResult.rows
  });
});

/**
 * Send a message
 */
exports.sendMessage = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  // 1. Get Transcript
  const transcript = await Transcript.findByAudioFileId(fileId);
  if (!transcript) {
    return res.status(404).json({ success: false, error: 'No transcript found for this file. Please generate one first.' });
  }

  // 2. Get or Create Conversation
  let conversationId;
  const conversationResult = await pool.query(
    'SELECT * FROM conversations WHERE audio_file_id = $1 ORDER BY created_at DESC LIMIT 1',
    [fileId]
  );

  if (conversationResult.rows.length === 0) {
    const newConv = await pool.query(
      'INSERT INTO conversations (audio_file_id, title) VALUES ($1, $2) RETURNING id',
      [fileId, `Chat about File #${fileId}`]
    );
    conversationId = newConv.rows[0].id;
  } else {
    conversationId = conversationResult.rows[0].id;
  }

  // 3. Get Chat History (last 10 messages for context)
  const historyResult = await pool.query(
    'SELECT role, content FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
    [conversationId]
  );
  const history = historyResult.rows;

  // 4. Save User Message
  await pool.query(
    'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
    [conversationId, 'user', message]
  );

  // 5. Generate Answer via RAG
  console.log(`Generating answer for file ${fileId}...`);
  const result = await ragService.generateAnswer(
    fileId,
    transcript.transcript_text,
    message,
    history
  );

  // 6. Save Assistant Message
  await pool.query(
    'INSERT INTO messages (conversation_id, role, content, context_sections) VALUES ($1, $2, $3, $4)',
    [conversationId, 'assistant', result.answer, result.sources]
  );

  res.json({
    success: true,
    data: {
      answer: result.answer,
      sources: result.sources
    }
  });
});
