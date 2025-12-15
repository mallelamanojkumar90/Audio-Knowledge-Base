const express = require('express');
const router = express.Router();
const filesController = require('../controllers/filesController');
const upload = require('../config/multer');

// GET /api/files - Get all audio files
router.get('/', filesController.getAllFiles);

// GET /api/files/:id - Get a single audio file
router.get('/:id', filesController.getFileById);

// POST /api/files - Upload a new audio file
router.post('/', upload.single('audio'), filesController.createFile);

// DELETE /api/files/:id - Delete an audio file
router.delete('/:id', filesController.deleteFile);

module.exports = router;


