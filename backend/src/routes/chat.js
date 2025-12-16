const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// GET /api/chat/:fileId - Get chat history for a file
router.get('/:fileId', chatController.getChatHistory);

// POST /api/chat/:fileId - Send a message to chat about a file
router.post('/:fileId', chatController.sendMessage);

module.exports = router;
