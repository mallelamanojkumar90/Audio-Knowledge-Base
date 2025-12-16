# Quick Start with Groq (Llama)

## 🚀 Get Started in 3 Minutes

### Step 1: Get Your Free Groq API Key (1 minute)

1. Go to **https://console.groq.com/keys**
2. Sign up with Google/GitHub (free)
3. Click **"Create API Key"**
4. Copy your key (starts with `gsk_...`)

### Step 2: Configure Your App (30 seconds)

**Option A: Interactive Setup (Recommended)**

```bash
cd backend
npm run configure-ai
# Select option 1 (Groq)
# Paste your API key
# Press Enter to use default model
```

**Option B: Manual Setup**

```bash
cd backend
# Edit .env file and add:
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

### Step 3: Restart Backend (30 seconds)

```bash
# Stop the current backend (Ctrl+C)
npm run dev
```

You should see:

```
✅ AI Model initialized: Groq (Llama)
```

### Step 4: Test It! (1 minute)

1. Go to **http://localhost:3000**
2. Upload an audio file
3. Watch it transcribe automatically!
4. View the transcript when complete

---

## ✅ That's It!

Your app now uses **Groq's Llama 3.3 70B** for:

- 🎙️ **Audio Transcription** (Whisper)
- 💬 **Q&A** (Coming in Phase 4)

---

## 💰 Groq Pricing

- **FREE TIER**: Generous limits for development
- **Pay-as-you-go**: Very affordable rates
- **No credit card required** to start

---

## 🎯 Why Groq?

✅ **Fast**: Lightning-fast inference  
✅ **Free**: Generous free tier  
✅ **Powerful**: Llama 3.3 70B model  
✅ **Easy**: Simple API, great docs  
✅ **Reliable**: Built by AI infrastructure experts

---

## 🔧 Troubleshooting

### "Invalid API key"

- Make sure you copied the full key (starts with `gsk_`)
- Generate a new key if needed
- Check for extra spaces in `.env`

### "Model not initialized"

- Restart the backend server
- Check `.env` file has `AI_PROVIDER=groq`
- Verify API key is set

### Still having issues?

- Check `MULTI_MODEL_CONFIG.md` for detailed help
- View backend logs for error messages
- Ensure dependencies are installed: `npm install`

---

## 📚 Learn More

- **Groq Console**: https://console.groq.com
- **Groq Docs**: https://console.groq.com/docs
- **Available Models**: https://console.groq.com/docs/models
- **Full Config Guide**: See `MULTI_MODEL_CONFIG.md`

---

## 🎉 You're Ready!

Start uploading audio files and watch the magic happen! 🎙️✨
