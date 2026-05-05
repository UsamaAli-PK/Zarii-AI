# Azure Speech

Microsoft Azure Speech Services provide an alternative text-to-speech (TTS) provider for the [[urdu-voice-assistant]], offering fallback redundancy for voice synthesis.

## Service Overview

Azure Speech Services include:

- **Text-to-Speech:** Converting text to natural speech
- **Speech-to-Text:** Alternative STT provider (currently using [[openai]] Whisper)
- **Speech Translation:** Multilingual translation (future feature)
- **Speaker Recognition:** Voice biometrics (future feature)

## Urdu Voice Support

Azure Speech offers multiple Urdu voices:

- **Fatima (Female):** Warm, friendly tone
- **Salman (Male):** Professional, clear tone
- **Regional Variants:** Lahore, Karachi, Islamabad accents

## Integration

Azure Speech is integrated via REST API:

```javascript
// backend/routes/voice.js
// Fallback TTS provider if ElevenLabs unavailable
const azureSpeechKey = process.env.AZURE_SPEECH_KEY;
const azureSpeechRegion = process.env.AZURE_SPEECH_REGION;
```

Workflow:

1. If [[elevenlabs]] fails, system attempts Azure Speech
2. Text sent to Azure Speech API
3. Azure returns audio file (WAV/MP3)
4. Audio streamed to farmer's device

## Fallback Role

Azure Speech is the **secondary TTS provider**:

- Used only if [[elevenlabs]] is unavailable
- Provides redundancy for voice synthesis
- Ensures farmer can always receive audio responses

## Voice Characteristics

- **Voice:** Urdu-optimized (Fatima or Salman)
- **Rate:** Adjustable speech rate (0.5x - 2.0x)
- **Pitch:** Adjustable pitch (0.5 - 2.0)
- **Style:** Neutral (professional, friendly)

## Cost & Rate Limits

- **Pricing:** Per-character billing (typically $0.16 per 1M characters)
- **Rate Limits:** 200 requests per minute (configurable)
- **Quota:** Monitored via `api_usage` table in [[supabase]]

## Advantages vs. ElevenLabs

- **Lower Cost:** Cheaper per character
- **Regional Variants:** Multiple Urdu accents available
- **Integration:** Easier Azure ecosystem integration
- **Reliability:** Microsoft's infrastructure redundancy

## Related Concepts

- [[zarii-ai]] — Main platform
- [[urdu-voice-assistant]] — Voice interaction layer
- [[elevenlabs]] — Primary TTS provider
