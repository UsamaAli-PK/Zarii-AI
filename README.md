# 🌿 ZARii AI

Bilingual AI-powered crop disease diagnosis platform for Pakistani farmers.

---

## 🌾 What It Does

- **📸 Photo Diagnosis** — Upload leaf photo → get disease name + treatment in seconds
- **🎙️ Voice in Urdu** — Speak your question → hear Urdu answer
- **🏥 2 Scans/Day** — Fair usage limit per farmer
- **📲 WhatsApp** — Get results directly in WhatsApp

---

## 🔬 How It Works

1. **Detection** — AI analyzes crop image (95%+ confidence required)
2. **Solution** — Recommends Pakistani products with PKR prices
3. **Alert** — If many similar diseases → notifies nearby farmers

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini (vision), OpenAI (voice) |
| Voice | ElevenLabs (TTS), OpenAI Whisper (STT) |
| Deployment | Vercel |

---

## 📁 Project Structure

```
Zarii-AI/
├── backend/
│   ├── routes/        # API endpoints (diagnose, voice, auth, admin)
│   ├── services/      # AI logic, API keys, cron jobs
│   └── db/           # Supabase schema
├── frontend-assets/  # React UI components
├── wiki/             # Project documentation
└── docs/             # Technical guides
```

---

## ✨ Key Features (May 2026)

- Upload-only images (jpg/jpeg/png/webp)
- 2 diagnoses per user per day (enforced)
- Reupload prompt for low confidence
- Pakistani products + PKR pricing
- Auto-failover across 6 API keys
- "Healthy" = prevention tips only
- No mock data on failure (shows "System down")

---

## 📄 License

MIT

---

For technical docs, see `/docs` folder. For project details, see `/wiki` folder.