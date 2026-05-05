# ElevenLabs

ElevenLabs provides high-quality text-to-speech (TTS) for the [[urdu-voice-assistant]], converting AI responses to natural-sounding Urdu audio.

## Service Overview

ElevenLabs specializes in:

- **Natural Voice Synthesis:** Human-like Urdu voice
- **Low Latency:** Real-time audio generation
- **Emotional Tone:** Adjustable voice characteristics
- **Multilingual:** Supports 29+ languages including Urdu

## Urdu Voice

The Urdu voice is optimized for:

- **Clarity:** Clear pronunciation of agricultural terminology
- **Naturalness:** Conversational tone for farmer engagement
- **Speed:** Adjustable speech rate (default: 1.0x)
- **Accent:** Standard Pakistani Urdu pronunciation

## Integration

ElevenLabs is integrated via REST API:

```javascript
// backend/routes/voice.js
POST /api/voice/tts — Converts text to Urdu audio
```

Workflow:

1. AI generates text response (Urdu)
2. Text sent to ElevenLabs API
3. ElevenLabs returns audio file (MP3)
4. Audio streamed to farmer's device
5. Farmer hears response in Urdu

## Voice Characteristics

- **Voice ID:** Urdu-optimized voice (e.g., "Aria")
- **Stability:** 0.5 (balanced naturalness vs. consistency)
- **Similarity Boost:** 0.75 (high similarity to training voice)
- **Style:** Neutral (professional, friendly tone)

## Fallback

If ElevenLabs is unavailable, system falls back to [[azure-speech]] for TTS.

## Cost & Rate Limits

- **Pricing:** Per-character billing (typically $0.30 per 1M characters)
- **Rate Limits:** 100 requests per minute (configurable)
- **Quota:** Monitored via `api_usage` table in [[supabase]]

## Accessibility

ElevenLabs TTS enables:

- **Voice-first interaction:** Farmers don't need to read text
- **Low literacy support:** Audio responses accessible to all farmers
- **Hands-free operation:** Farmers can listen while working
- **Multilingual:** Urdu language ensures cultural relevance

## Related Concepts

- [[zarii-ai]] — Main platform
- [[urdu-voice-assistant]] — Voice interaction layer
- [[azure-speech]] — Secondary TTS provider
