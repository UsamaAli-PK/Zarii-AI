# OpenAI

OpenAI provides two critical services for [[zarii-ai]]: GPT-4o for vision (fallback) and Whisper for speech-to-text.

## GPT-4o Vision (Fallback)

**GPT-4o** serves as the secondary vision provider in the [[ai-failover-chain]]:

- Used when [[google-gemini]] is unavailable
- Same diagnosis workflow as Gemini
- Returns disease name, confidence, treatment recommendations
- Slightly slower than Gemini (typically 3-4 seconds)
- Higher cost per request

Integration via OpenAI SDK:

```javascript
// backend/services/aiRouter.js
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

## Whisper STT

**Whisper** is the primary speech-to-text provider for the [[urdu-voice-assistant]]:

- Transcribes farmer audio to Urdu text
- Handles noisy environments (farm background noise)
- Supports multiple languages (Urdu, English, Punjabi)
- Fast transcription (typically <1 second for 10-second audio)

Whisper endpoints:

```javascript
// backend/routes/voice.js
POST /api/voice/stt — Transcribes audio to text
```

## Failover Role

OpenAI is the **secondary provider** in the [[ai-failover-chain]]:

- Used only if [[google-gemini]] fails
- Provides redundancy for critical diagnosis functionality
- Ensures farmer uptime during Gemini outages

## Accuracy & Limitations

**GPT-4o Vision Strengths:**
- Excellent at complex visual reasoning
- Good with poor image quality
- Strong multilingual support

**Whisper STT Strengths:**
- Robust to background noise
- Accurate Urdu transcription
- Fast processing

**Limitations:**
- Higher latency than Gemini
- Higher cost per request
- Rate limits (3,500 requests per minute)

## Cost & Rate Limits

- **Vision:** Per-token billing (input + output)
- **Whisper:** Per-minute billing ($0.02 per minute)
- **Rate Limits:** 3,500 requests per minute (configurable)
- **Quota:** Monitored via `api_usage` table in [[supabase]]

## Related Concepts

- [[zarii-ai]] — Main platform
- [[crop-disease-diagnosis]] — Diagnosis workflow
- [[ai-failover-chain]] — Failover architecture
- [[google-gemini]] — Primary AI provider
- [[urdu-voice-assistant]] — Voice interaction layer
