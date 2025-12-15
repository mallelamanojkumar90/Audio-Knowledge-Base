const express = require('express');
const router = express.Router();
const transcriptController = require('../controllers/transcriptController');

// GET /api/transcripts/:audioFileId - Get transcript for an audio file
router.get('/:audioFileId', transcriptController.getTranscript);

// POST /api/transcripts/:audioFileId/generate - Generate transcript for an audio file
router.post('/:audioFileId/generate', transcriptController.generateTranscript);

// DELETE /api/transcripts/:id - Delete a transcript
router.delete('/:id', transcriptController.deleteTranscript);

module.exports = router;
