# 🌿 ZARii AI: The Smart Brain of Pakistan's Agriculture

> Bilingual AI-powered crop disease diagnosis platform for Pakistani farmers.

ZARii AI is an easy-to-use platform that helps Pakistani farmers grow better crops and earn more money. We use smart technology to give farmers the expert advice they need, right on their phones.

---

## 🚀 Working Features (Live Now)

- **🎙️ Urdu Voice Assistant**: Speak in Urdu to ask questions; receive spoken Urdu answers.
- **📸 Instant Photo Diagnosis**: Take a photo of a sick plant leaf for instant disease identification and treatment advice.
- **🚨 Local Disease Alerts**: Receive warnings if many neighbors in your district report similar crop diseases.
- **🌦️ Smart Weather Advice**: Hyper-local weather monitoring that warns you when conditions favor specific diseases.
- **🤝 Trusted Product Suggestions**: Accurate pesticide and fertilizer recommendations with real-time PKR pricing.
- **📱 WhatsApp Support**: Receive diagnosis results and alerts directly in your WhatsApp inbox.

---

## 💎 Future Roadmap (Coming Soon)

- **🏦 Agri-Fintech**: Building a data-driven "Agri-Credit Score" to help farmers qualify for bank loans and insurance.
- **🌍 Export Quality Checker**: Monitoring pesticide usage to ensure crops meet international (EU/US) export standards.
- **📊 National Health Map**: A live dashboard for government and NGOs to track disease spread across Pakistan.

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- npm
- [Supabase](https://supabase.com) project

### Install
```bash
git clone <repo-url>
cd Zarii-AI
npm install
```

### Configure
Create `.env` in the project root:
```env
# Required
JWT_SECRET=your-strong-secret-here
ADMIN_JWT_SECRET=your-admin-secret-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Providers (at least one required for real diagnoses)
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key

# Optional
ELEVENLABS_API_KEY=your-elevenlabs-key
OPENWEATHER_API_KEY=your-weather-key
WA_ACCESS_TOKEN=your-whatsapp-token
WA_PHONE_NUMBER_ID=your-wa-phone-id
WA_VERIFY_TOKEN=your-wa-verify-token
GOOGLE_INDEXING_CREDENTIALS=your-json-credentials-string
```

### Run
```bash
# Production
NODE_ENV=production node backend/server.js

# Development
node backend/server.js
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Project Structure

```
Zarii-AI/
├── backend/
│   ├── config.js              # Environment validation
│   ├── server.js              # Express app entry point
│   ├── supabase.js            # Supabase client
│   ├── db/
│   │   ├── migrate.js         # Auto-migration on startup
│   │   └── supabase-schema.sql
│   ├── middleware/
│   │   ├── auth.js            # Farmer JWT middleware
│   │   └── adminAuth.js       # Admin JWT + role middleware
│   ├── routes/
│   │   ├── auth.js            # OTP send/verify/refresh
│   │   ├── cron.js            # Vercel cron trigger
│   │   ├── diagnose.js        # Image upload + AI diagnosis
│   │   ├── voice.js           # STT, TTS, voice Q&A
│   │   ├── history.js         # Scan/voice history
│   │   ├── users.js           # User profile
│   │   ├── dashboard.js       # Weather, alerts, stats
│   │   ├── webhook.js         # WhatsApp webhook
│   │   └── admin/             # 10 admin route modules
│   ├── services/
│   │   ├── aiRouter.js        # AI provider failover chain
│   │   ├── otp.js             # OTP generation + verification
│   │   ├── cronJobs.js        # Background jobs
│   │   └── indexing.js        # Google Indexing API service
│   └── seo/
│       ├── seoRoutes.js       # SSR pages for search engines
│       └── ssrShell.js        # HTML template renderer
├── components/                 # React JSX (CDN-transpiled)
│   ├── Landing.jsx
│   ├── Onboarding.jsx
│   ├── Dashboard.jsx
│   ├── Analyze.jsx
│   ├── Admin.jsx
│   ├── AdminTabs.jsx
│   ├── Pages.jsx
│   └── shared.jsx
├── server.js                   # Static file server (legacy)
├── ZARii AI Web App.html       # SPA entry point
├── styles.css                  # Global styles
├── app.jsx                     # React root component
└── package.json
```

---

## API Overview

| Category | Base Path | Auth | Endpoints |
|----------|-----------|------|-----------|
| Auth | `/api/auth/` | Public | send-otp, verify-otp, refresh |
| Diagnosis | `/api/diagnose` | Bearer JWT | POST image, POST feedback |
| Voice | `/api/voice/` | Bearer JWT | stt, ask, tts |
| History | `/api/history/` | Bearer JWT | list, recent, analytics, feedback |
| Users | `/api/users/` | Bearer JWT | me, health-score |
| Public | `/api/` | None | health, weather, platform-stats |
| Admin | `/api/admin/` | Admin JWT | 30+ endpoints across 10 modules |

> 📖 Full API documentation: [DOCUMENTATION.md](./DOCUMENTATION.md)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | Supabase PostgreSQL 17 |
| AI Vision | Google Gemini 1.5 Pro, OpenAI GPT-4o |
| Voice STT | OpenAI Whisper |
| Voice TTS | ElevenLabs |
| Weather | OpenWeather API |
| Messaging | WhatsApp Business API |
| Frontend | React 18 (CDN) + Babel standalone |
| Auth | Phone OTP + JWT |
| Security | Helmet, express-rate-limit, bcrypt, RLS |

---

## Security

- ✅ RLS enabled on all 19 database tables
- ✅ Rate limiting (100 req/15min global, 10/15min auth, 5/15min admin)
- ✅ Helmet security headers
- ✅ SSRF protection on image URLs
- ✅ Path traversal protection on static serving
- ✅ Cryptographically secure OTP generation
- ✅ OTP codes never returned in API responses
- ✅ JWT expiration enforcement (30-day max grace)
- ✅ Admin passwords bcrypt-hashed
- ✅ API keys AES-256 encrypted at rest

---

## License

Proprietary. All rights reserved.
