# Quick Start Guide - Audio Knowledge Base Q&A App

## 🚀 Running the Application (Currently Running!)

### ✅ Current Status

Both servers are **ALREADY RUNNING**:

- **Backend**: http://localhost:3001 ✅
- **Frontend**: http://localhost:3000 ✅
- **Database**: Connected ✅

### 📱 Access the Application

Simply open your browser and go to:

```
http://localhost:3000
```

---

## 🔄 Starting Fresh (If Servers Are Not Running)

### Step 1: Start Backend

Open a terminal and run:

```bash
cd "C:\Manojkumar\development\Audio KnowledgeBase Q&A App\backend"
npm run dev
```

✅ Backend will start on port 3001

### Step 2: Start Frontend

Open **another terminal** and run:

```bash
cd "C:\Manojkumar\development\Audio KnowledgeBase Q&A App\frontend"
npm start
```

✅ Frontend will start on port 3000 and open in your browser

---

## 🛑 Stopping the Servers

Press `Ctrl + C` in each terminal window

---

## 🔍 Quick Health Check

**Backend Health:**

```
http://localhost:3001/health
```

**Frontend:**

```
http://localhost:3000
```

---

## 📋 Common Commands

### Backend

```bash
npm run dev      # Start development server
npm start        # Start production server
npm run migrate  # Run database migrations
npm run test-db  # Test database connection
```

### Frontend

```bash
npm start        # Start development server
npm run build    # Create production build
npm test         # Run tests
```

---

## ⚠️ Troubleshooting

### Port Already in Use?

```powershell
# Check what's using port 3001 (backend)
netstat -ano | findstr :3001

# Check what's using port 3000 (frontend)
netstat -ano | findstr :3000

# Kill a process
taskkill /PID <process_id> /F
```

### Module Not Found?

```bash
# Reinstall dependencies
npm install
```

### Database Connection Failed?

1. Check if PostgreSQL is running
2. Verify `.env` file in backend folder
3. Run: `npm run test-db`

---

## 📚 More Information

See `HOW_TO_RUN.md` for detailed instructions and troubleshooting.

---

**Everything is ready to go! Just open http://localhost:3000 in your browser! 🎉**
