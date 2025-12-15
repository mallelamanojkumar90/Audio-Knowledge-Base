# API Structure Documentation

## Overview

The backend follows a clean architecture pattern with separation of concerns:

```
backend/src/
├── index.js              # Application entry point
├── config/               # Configuration files
│   └── database.js       # Database connection pool
├── controllers/          # Request handlers
│   ├── filesController.js
│   └── healthController.js
├── middleware/           # Express middleware
│   ├── asyncHandler.js   # Wrapper for async route handlers
│   ├── errorHandler.js   # Global error handler
│   ├── notFound.js       # 404 handler
│   └── validateRequest.js # Request validation
├── models/               # Database models
│   ├── AudioFile.js
│   ├── Transcript.js
│   ├── Conversation.js
│   └── Message.js
├── routes/               # Route definitions
│   ├── index.js          # Main router
│   ├── files.js
│   ├── transcripts.js
│   ├── conversations.js
│   └── chat.js
└── services/             # Business logic (to be added)
```

## Route Structure

### Base URL
- Development: `http://localhost:3001`
- API Base: `http://localhost:3001/api`

### Endpoints

#### Health Check
- `GET /health` - Server health check (includes database status)

#### Files
- `GET /api/files` - Get all audio files
- `GET /api/files/:id` - Get a single audio file
- `POST /api/files` - Upload a new audio file (Phase 2)
- `DELETE /api/files/:id` - Delete an audio file

#### Transcripts
- `GET /api/transcripts/:audioFileId` - Get transcript for an audio file (Phase 3)

#### Conversations
- `GET /api/conversations/:audioFileId` - Get conversations for an audio file (Phase 4)

#### Chat
- `POST /api/chat/:conversationId` - Send a message in a conversation (Phase 4)

## Middleware

### Error Handling
- **errorHandler**: Global error handler that formats error responses
- **notFound**: Handles 404 errors for undefined routes
- **asyncHandler**: Wraps async route handlers to catch errors automatically

### Request Validation
- **validateRequest**: Validates request body/query/params using Joi schemas (ready for use)

### Development
- Request logging middleware (only in development mode)

## Controllers

Controllers handle HTTP requests and responses. They use:
- `asyncHandler` wrapper to catch errors
- Model methods to interact with the database
- Standardized response format

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "count": 10  // optional
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "details": [...]  // optional, for validation errors
  }
}
```

## Models

Models provide a clean interface for database operations:
- `AudioFile`: CRUD operations for audio files
- `Transcript`: Create and retrieve transcripts
- `Conversation`: Manage conversations
- `Message`: Store and retrieve messages

## Error Handling Flow

1. Route handler throws error or calls `next(error)`
2. `asyncHandler` catches async errors
3. Error propagates to `errorHandler` middleware
4. Error is formatted and sent as JSON response

## Adding New Routes

1. Create controller in `controllers/`
2. Create route file in `routes/`
3. Import and mount route in `routes/index.js`
4. Route is automatically available at `/api/[route-name]`

## Example: Adding a New Endpoint

```javascript
// controllers/exampleController.js
const asyncHandler = require('../middleware/asyncHandler');

exports.getExample = asyncHandler(async (req, res) => {
  const data = await SomeModel.findAll();
  res.json({ success: true, data });
});

// routes/example.js
const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');

router.get('/', exampleController.getExample);
module.exports = router;

// routes/index.js
const exampleRoutes = require('./example');
router.use('/example', exampleRoutes);
```

