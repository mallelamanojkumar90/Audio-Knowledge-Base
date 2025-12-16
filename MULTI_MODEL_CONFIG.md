# Multi-Model AI Configuration Guide

## 🎯 Overview

The Audio Knowledge Base Q&A App now supports **multiple AI providers** using LangChain:

- **Groq** (Llama models) - Default, Fast & Free tier available
- **OpenAI** (GPT models) - Premium option
- **Anthropic** (Claude models) - Alternative premium option

You can switch between providers by changing a single environment variable!

---

## 🚀 Quick Start with Groq (Recommended)

### Step 1: Get Your Groq API Key

1. Go to https://console.groq.com/keys
2. Sign up for a free account
3. Create a new API key
4. Copy the key (starts with `gsk_...`)

### Step 2: Configure Environment

Open `backend/.env` and add:

```env
# AI Provider Configuration
AI_PROVIDER=groq

# Groq API Key
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

### Step 3: Restart Backend

```bash
cd backend
npm run dev
```

**That's it!** Your app now uses Groq's Llama model for both transcription and Q&A.

---

## 🔧 Supported AI Providers

### 1. Groq (Llama) - **RECOMMENDED** ⭐

**Why Groq?**

- ✅ **Fast**: Lightning-fast inference
- ✅ **Free Tier**: Generous free usage
- ✅ **Powerful**: Llama 3.3 70B model
- ✅ **Whisper**: Built-in audio transcription

**Configuration:**

```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

**Available Models:**

- `llama-3.3-70b-versatile` (Recommended - Best balance)
- `llama-3.1-70b-versatile` (Alternative)
- `llama-3.1-8b-instant` (Faster, less capable)
- `mixtral-8x7b-32768` (Long context)

**Get API Key:** https://console.groq.com/keys

---

### 2. OpenAI (GPT)

**Why OpenAI?**

- ✅ Industry standard
- ✅ Excellent quality
- ❌ Paid only (no free tier)

**Configuration:**

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_key_here
OPENAI_MODEL=gpt-4-turbo-preview
```

**Available Models:**

- `gpt-4-turbo-preview` (Most capable)
- `gpt-4` (Stable)
- `gpt-3.5-turbo` (Faster, cheaper)

**Get API Key:** https://platform.openai.com/api-keys

---

### 3. Anthropic (Claude)

**Why Anthropic?**

- ✅ Long context windows
- ✅ Excellent reasoning
- ❌ Paid only

**Configuration:**

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

**Available Models:**

- `claude-3-5-sonnet-20241022` (Best balance)
- `claude-3-opus-20240229` (Most capable)
- `claude-3-haiku-20240307` (Fastest)

**Get API Key:** https://console.anthropic.com/

---

## 📝 Complete Environment Configuration

### Example `.env` File

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/audio_kb

# ============================================
# AI PROVIDER CONFIGURATION
# ============================================
# Choose one: 'groq', 'openai', or 'anthropic'
AI_PROVIDER=groq

# --------------------------------------------
# GROQ (Default - Recommended)
# --------------------------------------------
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# --------------------------------------------
# OPENAI (Optional)
# --------------------------------------------
# OPENAI_API_KEY=sk-your_openai_key_here
# OPENAI_MODEL=gpt-4-turbo-preview

# --------------------------------------------
# ANTHROPIC (Optional)
# --------------------------------------------
# ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
# ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# ============================================
# OTHER SETTINGS
# ============================================
# File Upload
MAX_FILE_SIZE=524288000
UPLOAD_DIR=./uploads

# CORS
FRONTEND_URL=http://localhost:3000
```

---

## 🔄 Switching Between Providers

To switch providers, just change the `AI_PROVIDER` variable:

### Switch to Groq:

```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_key_here
```

### Switch to OpenAI:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your_key_here
```

### Switch to Anthropic:

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your_key_here
```

**Then restart the backend server!**

---

## 🎯 What Each Provider Does

### Transcription (Audio → Text)

- **Groq**: Uses Groq's Whisper API (whisper-large-v3)
- **OpenAI**: Would use OpenAI's Whisper API
- **Anthropic**: Not supported (use Groq for transcription)

### Q&A (Ask Questions)

- **Groq**: Uses Llama 3.3 70B
- **OpenAI**: Uses GPT-4 Turbo
- **Anthropic**: Uses Claude 3.5 Sonnet

---

## 💰 Cost Comparison

### Groq (FREE TIER AVAILABLE) ⭐

- **Transcription**: FREE (Whisper)
- **Q&A**: FREE tier available
- **Limits**: Generous free tier, then pay-as-you-go
- **Best for**: Development, testing, production

### OpenAI

- **Transcription**: $0.006/minute (Whisper)
- **Q&A**: ~$0.01-0.03 per 1K tokens (GPT-4)
- **Best for**: Production with budget

### Anthropic

- **Transcription**: Not available (use Groq)
- **Q&A**: ~$0.003-0.015 per 1K tokens (Claude)
- **Best for**: Long context needs

---

## 🧪 Testing Your Configuration

### 1. Check Model Info

The backend logs will show which provider is active:

```
✅ AI Model initialized: Groq (Llama)
```

### 2. Test Transcription

1. Upload an audio file
2. Check the status changes to "Transcribing"
3. Wait for completion
4. View the transcript

### 3. Test Q&A (Phase 4)

1. Go to a completed transcript
2. Ask a question
3. Receive AI-generated answer

---

## 🔍 Troubleshooting

### "AI model not initialized"

**Cause**: Missing or invalid API key

**Solution**:

1. Check your `.env` file
2. Ensure `AI_PROVIDER` matches your configured provider
3. Verify API key is correct
4. Restart backend server

### "Invalid API key"

**Cause**: Wrong API key format or expired key

**Solution**:

1. Generate a new API key from provider dashboard
2. Update `.env` file
3. Restart backend

### "Rate limit exceeded"

**Cause**: Too many requests

**Solution**:

1. Wait a few minutes
2. Upgrade to paid tier
3. Switch to different provider temporarily

---

## 📊 Provider Comparison Table

| Feature            | Groq         | OpenAI      | Anthropic   |
| ------------------ | ------------ | ----------- | ----------- |
| **Free Tier**      | ✅ Yes       | ❌ No       | ❌ No       |
| **Speed**          | ⚡ Very Fast | 🚀 Fast     | 🚀 Fast     |
| **Transcription**  | ✅ Whisper   | ✅ Whisper  | ❌ No       |
| **Q&A Quality**    | ⭐⭐⭐⭐     | ⭐⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐  |
| **Context Length** | 32K tokens   | 128K tokens | 200K tokens |
| **Best For**       | Development  | Production  | Long docs   |

---

## 🎓 Recommended Setup

### For Development/Testing:

```env
AI_PROVIDER=groq
GROQ_API_KEY=your_key
```

**Why**: Free, fast, good quality

### For Production (Budget):

```env
AI_PROVIDER=groq
GROQ_API_KEY=your_key
```

**Why**: Cost-effective, reliable

### For Production (Premium):

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_key
```

**Why**: Best quality, industry standard

---

## 🔐 Security Best Practices

1. **Never commit API keys** to Git
2. **Use environment variables** only
3. **Rotate keys** regularly
4. **Set usage limits** in provider dashboards
5. **Monitor usage** to avoid unexpected costs

---

## 📚 Additional Resources

- **Groq**: https://console.groq.com/docs
- **OpenAI**: https://platform.openai.com/docs
- **Anthropic**: https://docs.anthropic.com/
- **LangChain**: https://js.langchain.com/docs/

---

## 🎉 You're All Set!

Your app now supports multiple AI providers. Start with Groq (free) and switch to others as needed!

**Next Steps:**

1. Get your Groq API key
2. Update `.env` file
3. Restart backend
4. Upload audio and test transcription
5. Try Q&A when Phase 4 is implemented

---

**Questions?** Check the main `HOW_TO_RUN.md` or the provider documentation links above.
