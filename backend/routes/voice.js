const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../supabase');
const auth = require('../middleware/auth');
const { answerVoiceQuery } = require('../services/aiRouter');
const { AI, UPLOAD_DIR } = require('../config');
const apiKeys = require('../services/apiKeys');

const audioStorage = multer.memoryStorage();
const upload = multer({ storage: audioStorage, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/voice/stt — audio → transcript
router.post('/stt', auth, upload.single('audio'), async (req, res) => {
  try {
    const lang = req.body.lang || 'ur';
    let transcript = null;
    let provider = 'mock';

    if (req.file) {
      const keyObj = await apiKeys.getServiceKey('voice', k => k.provider.toLowerCase().includes('stt') || k.provider.toLowerCase().includes('groq') || k.provider.toLowerCase().includes('openai'));
      
      if (keyObj && keyObj.api_key) {
        try {
          const { OpenAI } = require('openai');
          // If Groq is used, base_url is required. If OpenAI, it uses default.
          const client = new OpenAI({ 
            apiKey: keyObj.api_key,
            baseURL: keyObj.base_url || undefined
          });
          const { toFile } = require('openai');
          const file = await toFile(req.file.buffer, 'audio.webm', { type: 'audio/webm' });
          const response = await client.audio.transcriptions.create({
            file,
            model: keyObj.model_id || 'whisper-large-v3-turbo', // groq default
            language: lang === 'ur' ? 'ur' : 'en',
          });
          transcript = response.text;
          provider = keyObj.provider;
          await apiKeys.reportUsage(keyObj.id, true);
        } catch (err) {
          console.error('STT error:', err.message);
          await apiKeys.reportUsage(keyObj.id, false);
        }
      }
    }

    if (!transcript) {
      const mockTranscripts = {
        ur: 'میرے گندم کے پتے پیلے ہو رہے ہیں، کیا مسئلہ ہے؟',
        en: 'My wheat leaves are turning yellow, what is the problem?',
      };
      transcript = mockTranscripts[lang] || mockTranscripts.en;
      provider = 'mock';
    }

    res.json({ transcript, lang, provider });
  } catch (err) {
    console.error('STT error:', err);
    res.status(500).json({ error: 'Speech recognition failed' });
  }
});

// POST /api/voice/ask — text query → AI answer
router.post('/ask', auth, async (req, res) => {
  try {
    const { text, lang } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });

    const answer = await answerVoiceQuery({ text, lang: lang || 'ur' });

    const { data: voiceRow } = await supabase.from('voice_queries').insert({
      user_id: req.user.id,
      transcript: text,
      lang: lang || 'ur',
      answer,
    }).select('id').single();

    res.json({ answer, query_id: voiceRow?.id });
  } catch (err) {
    console.error('ask error:', err);
    res.status(500).json({ error: 'Failed to get answer' });
  }
});

// POST /api/voice/tts — text → audio URL
router.post('/tts', auth, async (req, res) => {
  try {
    const { text, lang, query_id } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });

    let audioUrl = null;
    let provider = 'mock';

    const keyObj = await apiKeys.getServiceKey('voice', k => k.provider.toLowerCase().includes('tts') || k.provider.toLowerCase().includes('eleven'));

    if (keyObj && keyObj.api_key) {
      try {
        const fetch = require('node-fetch');
        // If it's elevenlabs, url is specific. If it's base_url, we can override.
        const url = keyObj.base_url || 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM';
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'xi-api-key': keyObj.api_key,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, model_id: keyObj.model_id || 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
        });
        if (response.ok) {
          const buf = await response.buffer();
          const filename = `tts-${Date.now()}.mp3`;
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('scans')
            .upload(`tts/${filename}`, buf, { contentType: 'audio/mpeg', upsert: false });

          if (!uploadErr) {
            const { data: signed } = await supabase.storage.from('scans').createSignedUrl(`tts/${filename}`, 3600);
            audioUrl = signed?.signedUrl || null;
            provider = keyObj.provider;
            await apiKeys.reportUsage(keyObj.id, true);
          }
        } else {
          throw new Error('TTS API error ' + response.status);
        }
      } catch (err) {
        console.error('TTS error:', err.message);
        await apiKeys.reportUsage(keyObj.id, false);
      }
    }

    if (query_id && audioUrl) {
      await supabase.from('voice_queries').update({ tts_url: audioUrl, tts_provider: provider }).eq('id', query_id);
    }

    res.json({ audio_url: audioUrl, provider, supported: !!audioUrl });
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: 'TTS failed' });
  }
});

module.exports = router;
