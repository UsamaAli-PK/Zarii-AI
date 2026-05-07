const router = require("express").Router();
const multer = require("multer");
const supabase = require("../supabase");
const auth = require("../middleware/auth");
const { answerVoiceQuery } = require("../services/aiRouter");
const apiKeys = require("../services/apiKeys");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ─── E-codes used in frontend error display ───────────────────
// E003 = STT API failure   E004 = AI answer failure   E005 = TTS failure

// POST /api/voice/stt — audio → transcript
router.post("/stt", auth, upload.single("audio"), async (req, res) => {
  try {
    const lang = req.body.lang || "ur";
    let transcript = null;
    let provider = "mock";
    let sttError = null;

    if (req.file) {
      const keyObj = await apiKeys.getServiceKey(
        "voice",
        (k) =>
          k.provider.toLowerCase().includes("stt") ||
          k.provider.toLowerCase().includes("scribe"),
      );

      if (!keyObj || !keyObj.api_key) {
        sttError = "E003: No STT API key found in voice pool";
        console.error("[Voice STT]", sttError);
      } else {
        try {
          // Use Node 18+ native fetch + FormData (no npm packages needed)
          const mimeType = req.file.mimetype || "audio/webm";
          const audioBlob = new Blob([req.file.buffer], { type: mimeType });

          const form = new FormData();
          form.append("file", audioBlob, "audio." + (mimeType.split("/")[1] || "webm"));
          form.append("model_id", keyObj.model_id || "scribe_v2");

          const langMap = { ur: "ur", en: "en" };
          form.append("language_code", langMap[lang] || "en");

          const endpoint = keyObj.base_url || "https://api.elevenlabs.io/v1/speech-to-text";
          console.log("[Voice STT] Calling ElevenLabs:", endpoint, "| lang:", lang, "| mime:", mimeType, "| size:", req.file.size);

          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "xi-api-key": keyObj.api_key },
            body: form,
          });

          if (response.ok) {
            const result = await response.json();
            transcript = result.text || result.transcript || null;
            provider = "ElevenLabs Scribe";
            console.log("[Voice STT] ✓ Success, transcript length:", transcript?.length);
            await apiKeys.reportUsage(keyObj.id, true);
          } else {
            const errBody = await response.text();
            sttError = `E003: ElevenLabs STT returned HTTP ${response.status} — ${errBody.slice(0, 200)}`;
            console.error("[Voice STT]", sttError);
            await apiKeys.reportUsage(keyObj.id, false);
          }
        } catch (err) {
          sttError = `E003: STT network/runtime error — ${err.message}`;
          console.error("[Voice STT]", sttError);
          if (keyObj?.id) await apiKeys.reportUsage(keyObj.id, false);
        }
      }
    } else {
      sttError = "E003: No audio file received in request";
      console.error("[Voice STT]", sttError);
    }

    // Return error so frontend can show it — no silent mock fallback
    if (!transcript) {
      return res.status(422).json({
        error: sttError || "E003: Speech recognition failed — no transcript returned",
        error_code: "E003",
        provider: "failed",
      });
    }

    res.json({ transcript, lang, provider });
  } catch (err) {
    console.error("[Voice STT] Unexpected error:", err);
    res.status(500).json({ error: `E003: Unexpected STT error — ${err.message}`, error_code: "E003" });
  }
});

// POST /api/voice/ask — text → AI answer
router.post("/ask", auth, async (req, res) => {
  try {
    const { text, lang } = req.body;
    if (!text) return res.status(400).json({ error: "text required", error_code: "E004" });

    console.log("[Voice ASK] question:", text.slice(0, 80), "| lang:", lang);

    let answer;
    try {
      answer = await answerVoiceQuery({ text, lang: lang || "ur" });
    } catch (aiErr) {
      const msg = `E004: AI failed to answer — ${aiErr.message}`;
      console.error("[Voice ASK]", msg);
      return res.status(502).json({ error: msg, error_code: "E004" });
    }

    if (!answer) {
      return res.status(502).json({ error: "E004: AI returned empty answer", error_code: "E004" });
    }

    console.log("[Voice ASK] ✓ Answer length:", answer.length);

    const { data: voiceRow } = await supabase
      .from("voice_queries")
      .insert({ user_id: req.user.id, transcript: text, lang: lang || "ur", answer })
      .select("id")
      .single();

    res.json({ answer, query_id: voiceRow?.id });
  } catch (err) {
    console.error("[Voice ASK] Unexpected error:", err);
    res.status(500).json({ error: `E004: Unexpected AI error — ${err.message}`, error_code: "E004" });
  }
});

// POST /api/voice/tts — text → audio URL
router.post("/tts", auth, async (req, res) => {
  try {
    const { text, lang, query_id } = req.body;
    if (!text) return res.status(400).json({ error: "text required", error_code: "E005" });

    let audioUrl = null;
    let provider = null;
    let ttsError = null;

    const keyObj = await apiKeys.getServiceKey(
      "voice",
      (k) => k.provider.toLowerCase().includes("tts"),
    );

    if (!keyObj || !keyObj.api_key) {
      ttsError = "E005: No TTS API key found in voice pool";
      console.error("[Voice TTS]", ttsError);
    } else {
      try {
        const url = keyObj.base_url || "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM";
        console.log("[Voice TTS] Calling ElevenLabs:", url, "| model:", keyObj.model_id);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "xi-api-key": keyObj.api_key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            model_id: keyObj.model_id || "eleven_multilingual_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        });

        if (response.ok) {
          // Use native arrayBuffer() — node-fetch v2's .buffer() not needed
          const arrayBuf = await response.arrayBuffer();
          const buf = Buffer.from(arrayBuf);
          const filename = `tts-${Date.now()}.mp3`;

          const { error: uploadErr } = await supabase.storage
            .from("scans")
            .upload(`tts/${filename}`, buf, { contentType: "audio/mpeg", upsert: false });

          if (!uploadErr) {
            const { data: signed } = await supabase.storage
              .from("scans")
              .createSignedUrl(`tts/${filename}`, 3600);
            audioUrl = signed?.signedUrl || null;
            provider = keyObj.provider;
            console.log("[Voice TTS] ✓ Audio uploaded, size:", buf.length, "bytes");
            await apiKeys.reportUsage(keyObj.id, true);
          } else {
            ttsError = `E005: Supabase storage upload failed — ${uploadErr.message}`;
            console.error("[Voice TTS]", ttsError);
          }
        } else {
          const errBody = await response.text();
          ttsError = `E005: ElevenLabs TTS returned HTTP ${response.status} — ${errBody.slice(0, 200)}`;
          console.error("[Voice TTS]", ttsError);
          await apiKeys.reportUsage(keyObj.id, false);
        }
      } catch (err) {
        ttsError = `E005: TTS network/runtime error — ${err.message}`;
        console.error("[Voice TTS]", ttsError);
        if (keyObj?.id) await apiKeys.reportUsage(keyObj.id, false);
      }
    }

    if (query_id && audioUrl) {
      await supabase
        .from("voice_queries")
        .update({ tts_url: audioUrl, tts_provider: provider })
        .eq("id", query_id);
    }

    // TTS failure is non-fatal — return text answer still works, just no audio
    res.json({
      audio_url: audioUrl,
      provider,
      supported: !!audioUrl,
      tts_error: ttsError || undefined,
    });
  } catch (err) {
    console.error("[Voice TTS] Unexpected error:", err);
    res.status(500).json({ error: `E005: Unexpected TTS error — ${err.message}`, error_code: "E005" });
  }
});

module.exports = router;
