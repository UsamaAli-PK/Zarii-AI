# Urdu Voice Assistant

The voice interaction layer of [[zarii-ai]], enabling farmers to ask questions and receive answers in Urdu through a complete speech pipeline.

## Architecture

The voice assistant implements a three-stage pipeline:

1. **Speech-to-Text (STT):** Audio input is transcribed to Urdu text via [[openai]] Whisper
2. **Question Answering:** Text is sent to the AI provider (Gemini or OpenAI) for contextual answers
3. **Text-to-Speech (TTS):** AI response is converted back to Urdu speech via [[elevenlabs]] or [[azure-speech]]

## Implementation

Voice endpoints are located in `backend/routes/voice.js`:

- `POST /api/voice/stt` — Transcribes farmer audio to Urdu text
- `POST /api/voice/ask` — Sends question to [[ai-failover-chain]], returns text answer
- `POST /api/voice/tts` — Converts text response to Urdu audio

All endpoints require farmer JWT authentication. Audio files are temporarily stored in Supabase Storage and cleaned up after processing.

## Urdu Language Challenges

- **Script Complexity:** Urdu uses the Perso-Arabic script with context-dependent character forms
- **Diacritics:** Proper pronunciation requires accurate diacritical marks (aeraab)
- **Regional Dialects:** Pakistani Urdu varies by province; the system targets standard Urdu
- **Technical Terminology:** Agricultural terms (pesticide names, disease names) require specialized vocabulary
- **Voice Quality:** ElevenLabs Urdu voice is optimized for clarity; Azure Speech offers regional variants

## User Experience

Farmers interact via:
- **Mobile-first:** Voice input optimized for low-bandwidth environments
- **Fallback to Text:** If voice fails, farmers can type questions
- **Contextual Answers:** Questions are answered relative to the farmer's location and crop type
- **Persistent History:** All voice interactions stored in `voice_history` table with RLS

## Accessibility

- Voice-first design serves farmers with low literacy
- Audio responses eliminate need to read text
- Urdu language support ensures cultural relevance
- Slow network support via audio compression

## Related Concepts

- [[zarii-ai]] — Main platform
- [[openai]] — Whisper STT provider
- [[elevenlabs]] — Primary TTS provider
- [[azure-speech]] — Secondary TTS provider
- [[ai-failover-chain]] — Question answering backbone
