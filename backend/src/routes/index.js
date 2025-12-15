const express = require('express');
const router = express.Router();

// Import route modules
const filesRoutes = require('./files');
const transcriptsRoutes = require('./transcripts');
const conversationsRoutes = require('./conversations');
const chatRoutes = require('./chat');

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Audio Knowledge Base Q&A API',
    version: '1.0.0',
    endpoints: {
      files: '/api/files',
      transcripts: '/api/transcripts',
      conversations: '/api/conversations',
      chat: '/api/chat'
    }
  });
});

// Mount route modules
router.use('/files', filesRoutes);
router.use('/transcripts', transcriptsRoutes);
router.use('/conversations', conversationsRoutes);
router.use('/chat', chatRoutes);

module.exports = router;

