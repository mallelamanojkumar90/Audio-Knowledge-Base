# How to Run the Audio Knowledge Base Q&A Application

This guide will help you run both the backend and frontend servers for the Audio Knowledge Base Q&A application.

## Prerequisites

Before running the application, ensure you have:

1. **Node.js** installed (v16 or higher)
2. **PostgreSQL** database running locally
3. **npm** package manager

## Quick Start (Both Servers)

### Option 1: Run Both Servers Simultaneously

Open **two separate terminal windows**:

#### Terminal 1 - Backend Server

```bash
cd "C:\Manojkumar\development\Audio KnowledgeBase Q&A App\backend"
npm run dev
```

#### Terminal 2 - Frontend Server

```bash
cd "C:\Manojkumar\development\Audio KnowledgeBase Q&A App\frontend"
npm start
```

### Option 2: Using PowerShell (Single Command)

You can also run both in the background from the root directory:

```powershell
# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Manojkumar\development\Audio KnowledgeBase Q&A App\backend'; npm run dev"

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Manojkumar\development\Audio KnowledgeBase Q&A App\frontend'; npm start"
```

## Detailed Setup Instructions

### 1. First Time Setup

If this is your first time running the application:

#### Backend Setup

```bash
cd backend
npm install
```

#### Frontend Setup

```bash
cd frontend
npm install
```

### 2. Environment Configuration

#### Backend (.env file)

Make sure you have a `.env` file in the `backend` directory with:

```env
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/your_database
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

#### Frontend (.env file - if needed)

Create a `.env` file in the `frontend` directory if you need custom configuration:

```env
REACT_APP_API_URL=http://localhost:3001
```

### 3. Database Setup

Before running the backend, ensure your PostgreSQL database is set up:

```bash
cd backend
npm run migrate
```

Or test the database connection:

```bash
npm run test-db
```

## Running the Application

### Backend Server

**Development Mode (with auto-reload):**

```bash
cd backend
npm run dev
```

**Production Mode:**

```bash
cd backend
npm start
```

The backend server will start on: **http://localhost:3001**

### Frontend Server

**Development Mode:**

```bash
cd frontend
npm start
```

The frontend will automatically open in your browser at: **http://localhost:3000**

**Production Build:**

```bash
cd frontend
npm run build
```

## Verify Everything is Running

### Check Backend Health

Open your browser or use curl:

```
http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2025-12-15T...",
  "database": "connected"
}
```

### Check Frontend

Open your browser:

```
http://localhost:3000
```

You should see the Audio Knowledge Base Q&A application interface.

## Available Scripts

### Backend Scripts

- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run test-db` - Test database connection

### Frontend Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (⚠️ irreversible)

## Troubleshooting

### Backend Won't Start

1. **Check if port 3001 is already in use:**

   ```powershell
   netstat -ano | findstr :3001
   ```

2. **Kill the process if needed:**

   ```powershell
   taskkill /PID <process_id> /F
   ```

3. **Check database connection:**
   - Ensure PostgreSQL is running
   - Verify DATABASE_URL in .env file
   - Run `npm run test-db`

### Frontend Won't Start

1. **Check if port 3000 is already in use:**

   ```powershell
   netstat -ano | findstr :3000
   ```

2. **Clear node_modules and reinstall:**
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   ```

### Module Not Found Errors

If you see errors like "Cannot find module", reinstall dependencies:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Windows Path Issues

If you encounter path-related errors on Windows, the package.json files have been configured to work around spaces in directory names. The scripts use full paths to executables.

## Stopping the Servers

To stop the servers:

- Press `Ctrl + C` in each terminal window
- Or close the terminal windows

## Current Status

✅ **Backend**: Running on http://localhost:3001  
✅ **Frontend**: Running on http://localhost:3000  
✅ **Database**: Connected

Both servers are currently running with hot-reload enabled!

## API Endpoints

Once the backend is running, you can access:

- **Health Check**: `GET http://localhost:3001/health`
- **API Info**: `GET http://localhost:3001/api`
- **Files**: `GET http://localhost:3001/api/files`
- **Transcripts**: `GET http://localhost:3001/api/transcripts/:audioFileId`
- **Conversations**: `GET http://localhost:3001/api/conversations/:audioFileId`
- **Chat**: `POST http://localhost:3001/api/chat/:conversationId`

## Development Workflow

1. **Start both servers** (backend and frontend)
2. **Make changes** to your code
3. **Servers auto-reload** - changes are reflected immediately
4. **Test your changes** in the browser
5. **Check backend logs** in the backend terminal
6. **Check frontend logs** in the frontend terminal or browser console

## Need Help?

- Check the logs in the terminal windows
- Verify all environment variables are set correctly
- Ensure the database is running and accessible
- Make sure all dependencies are installed

---

**Happy Coding! 🚀**
