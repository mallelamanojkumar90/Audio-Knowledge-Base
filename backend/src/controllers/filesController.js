const { AudioFile } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Get all audio files
 */
exports.getAllFiles = asyncHandler(async (req, res) => {
  const files = await AudioFile.findAll();
  res.json({
    success: true,
    count: files.length,
    data: files
  });
});

/**
 * Get a single audio file by ID
 */
exports.getFileById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const file = await AudioFile.findById(id);

  if (!file) {
    return res.status(404).json({
      success: false,
      error: { message: 'Audio file not found' }
    });
  }

  res.json({
    success: true,
    data: file
  });
});

/**
 * Create a new audio file
 */
exports.createFile = asyncHandler(async (req, res) => {
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: { message: 'No file uploaded' }
    });
  }

  const { filename, originalname, path, size, mimetype } = req.file;

  // Create file record in database
  const fileData = {
    filename: filename,
    originalFilename: originalname,
    filePath: path,
    fileSize: size,
    fileType: mimetype,
    status: 'uploaded'
  };

  const file = await AudioFile.create(fileData);

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: file
  });
});

/**
 * Delete an audio file
 */
exports.deleteFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const file = await AudioFile.delete(id);

  if (!file) {
    return res.status(404).json({
      success: false,
      error: { message: 'Audio file not found' }
    });
  }

  res.json({
    success: true,
    message: 'Audio file deleted successfully',
    data: file
  });
});

