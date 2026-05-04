# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ZARii AI** is a bilingual (Urdu/English) AI-powered crop disease diagnosis platform for Pakistani farmers. It combines computer vision (leaf disease detection), voice AI (Urdu STT/TTS), weather monitoring, and WhatsApp integration to provide real-time agricultural advice.

**Core Features:**
- Instant photo diagnosis of crop diseases using Google Gemini or OpenAI GPT-4o
- Urdu voice assistant (speech-to-text, Q&A, text-to-speech)
- Hyper-local disease alerts based on neighbor reports
- Smart weather warnings tied to disease risk
- Pesticide/fertilizer recommendations with PKR pricing
- WhatsApp integration for results and alerts
- Admin dashboard for disease tracking, revenue, team management

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express 4 |
| **Database** | Supabase PostgreSQL 17 (RLS enabled on all 19 tables) |
| **AI Vision** | Google Gemini 1.5 Pro, OpenAI GPT-4o (with failover chain) |
| **Voice STT** | OpenAI Whisper |
| **Voice TTS** | ElevenLabs or Azure Speech |
| **Weather** | OpenWeather API |
| **Messaging** | WhatsApp Business API |
| **Frontend** | React 18 (CDN-transpiled via Babel standalone) |
| **Auth** | Phone OTP + JWT (7-day expiry) |
| **Security** | Helmet, express-rate-limit, bcrypt, SSRF protection |

---

## Architecture

### Backend Structure

```
backend/
├── server.js              # Express app entry point; sets up middleware, routes, static serving
├── config.js              # Environment validation; exports all config constants
├── supabase.js            # Supabase client initialization
├── db/
│   ├── migrate.js         # Auto-runs migrations on startup (idempotent)
│   └── supabase-schema.sql # Full schema with RLS policies
├── middleware/
│   ├── auth.js            # Farmer JWT verification (Bearer token)
│   └── adminAuth.js       # Admin JWT + role-based access control
├── routes/
│   ├── auth.js            # OTP send/verify/refresh (public)
│   ├── diagnose.js        # Image upload + AI diagnosis (farmer auth)
│   ├── voice.js           # STT, Q&A, TTS endpoints (farmer auth)
│   ├── history.js         # Scan/voice history + analytics (farmer auth)
│   ├── users.js           # Profile, health score (farmer auth)
│   ├── dashboard.js       # Weather, alerts, stats (farmer auth)
│   ├── webhook.js         # WhatsApp webhook (public, token-verified)
│   ├── cron.js            # Vercel cron trigger (public, token-verified)
│   ├── waitlist.js        # Waitlist signup (public)
│   └── admin/             # 10 admin modules (admin auth required)
│       ├── overview.js    # Dashboard stats
│       ├── diagnoses.js   # Diagnosis history + feedback
│       ├── users.js       # Farmer management
│       ├── outbreaks.js   # Disease outbreak tracking
│       ├── catalog.js     # Disease/product catalog
│       ├── apiKeys.js     # API key management
│       ├── whatsapp.js    # WhatsApp campaign management
│       ├── revenue.js     # Revenue tracking
│       ├── sponsors.js    # Sponsor management
│       └── team.js        # Team member management
├── services/
│   ├── aiRouter.js        # AI provider failover chain (Gemini → OpenAI → mock)
│   ├── apiKeys.js         # AES-256 encryption/decryption for stored API keys
│   ├── otp.js             # Cryptographically secure OTP generation + verification
│   ├── cronJobs.js        # Background jobs (disease alerts, weather checks)
│   └── indexing.js        # Google Indexing API for SEO
└── seo/
    ├── seoRoutes.js       # SSR routes for search engines
    ├── ssrShell.js        # HTML template renderer
    ├── seoData.js         # SEO metadata
    ├── diseaseData.js     # Disease pages
    ├── glossaryData.js    # Glossary pages
    └── locationData.js    # Location-specific pages
```

### Frontend Structure

```
components/               # React JSX (CDN-transpiled)
├── Landing.jsx          # Marketing landing page
├── Onboarding.jsx       # Farmer signup/login flow
├── Dashboard.jsx        # Main farmer dashboard
├── Analyze.jsx          # Leaf scan + diagnosis UI
├── Admin.jsx            # Admin panel entry
├── AdminTabs.jsx        # Admin tab navigation
├── Pages.jsx            # Static pages (about, privacy, etc.)
└── shared.jsx           # Shared UI components

app.jsx                   # React root component
ZARii AI Web App.html     # SPA entry point (loads React from CDN)
styles.css               # Global styles
```

### Key Data Flow

1. **Diagnosis Flow:**
   - Farmer uploads leaf image → `POST /api/diagnose`
   - Image stored in Supabase Storage
   - `aiRouter.js` sends to Gemini/OpenAI with SSRF-validated URL
   - AI returns disease name, confidence, treatment options
   - Result stored in `diagnoses` table with RLS policy (farmer can only see own)
   - Farmer receives result in UI + WhatsApp notification

2. **Voice Flow:**
   - Farmer records audio → `POST /api/voice/stt`
   - OpenAI Whisper transcribes to Urdu text
   - `POST /api/voice/ask` sends question to AI
   - AI response converted to Urdu speech via ElevenLabs/Azure
   - Audio returned to frontend

3. **Auth Flow:**
   - Farmer enters phone → `POST /api/auth/send-otp`
   - OTP sent via WhatsApp (or logged in dev)
   - Farmer enters OTP → `POST /api/auth/verify-otp`
   - Server returns JWT (7-day expiry)
   - All subsequent requests include `Authorization: Bearer <JWT>`

4. **Admin Flow:**
   - Admin logs in with username/password → `POST /api/admin/auth/login`
   - Password verified against bcrypt hash
   - Admin JWT returned (includes role: 'admin')
   - Admin routes check both JWT validity and role

---

## Common Development Commands

```bash
# Install dependencies
npm install

# Development (auto-restarts on file changes with nodemon, if installed)
npm run dev
# or
node backend/server.js

# Production
NODE_ENV=production node backend/server.js

# Frontend only (legacy static server)
npm run frontend-only

# Backend only
npm run backend-only
```

### Environment Setup

Create `.env` in project root:

```env
# Required
JWT_SECRET=your-strong-secret-here
ADMIN_JWT_SECRET=your-admin-secret-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Providers (at least one required)
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key

# Optional
ELEVENLABS_API_KEY=your-elevenlabs-key
AZURE_SPEECH_KEY=your-azure-key
AZURE_SPEECH_REGION=eastus
OPENWEATHER_API_KEY=your-weather-key
WA_ACCESS_TOKEN=your-whatsapp-token
WA_PHONE_NUMBER_ID=your-wa-phone-id
WA_VERIFY_TOKEN=your-wa-verify-token
GOOGLE_INDEXING_CREDENTIALS=your-json-credentials-string
CORS_ORIGINS=http://localhost:3000,https://example.com
```

---

## Rate Limiting

- **Global:** 100 requests per 15 minutes per IP
- **Auth endpoints:** 10 requests per 15 minutes per IP
- **Admin login:** 5 requests per 15 minutes per IP

---

## Security Highlights

- **RLS (Row-Level Security):** All 19 database tables have RLS policies. Farmers can only access their own data.
- **SSRF Protection:** Image URLs validated before server-side fetch (blocks private IPs, cloud metadata).
- **Path Traversal Protection:** Static file serving restricted to `uploads/` directory.
- **OTP Security:** Cryptographically secure generation; never returned in API responses.
- **JWT Expiry:** 7-day max, enforced on every request.
- **Admin Passwords:** Bcrypt-hashed, never stored in plaintext.
- **API Keys:** AES-256 encrypted at rest in database.
- **Helmet:** Security headers enabled (CSP disabled for CDN React).

---

## AI Provider Failover Chain

`backend/services/aiRouter.js` implements automatic failover:

1. Try Google Gemini 1.5 Pro
2. If Gemini fails, try OpenAI GPT-4o
3. If both fail, return mock diagnosis (for development/testing)

This ensures the app remains functional even if one AI provider is down.

---

## Database Migrations

Migrations run automatically on server startup via `backend/db/migrate.js`. The migration system is idempotent—running the same migration twice is safe.

To add a new migration:
1. Add SQL to `backend/db/supabase-schema.sql`
2. Increment the migration version in `migrate.js`
3. Restart the server

---

## WhatsApp Integration

- **Webhook:** `POST /api/webhook` receives WhatsApp messages
- **Verification:** Token verified against `WA_VERIFY_TOKEN`
- **Outbound:** Diagnosis results and alerts sent via WhatsApp Business API
- **Raw Body:** Webhook endpoint uses raw body parsing (not JSON)

---

## Admin Routes

Admin endpoints are under `/api/admin/` and require admin JWT. Key modules:

- **overview:** Dashboard stats (total farmers, diagnoses, revenue)
- **diagnoses:** View all diagnoses, manage feedback
- **users:** Farmer management, health scores
- **outbreaks:** Track disease outbreaks by location
- **catalog:** Manage disease and product databases
- **apiKeys:** Manage encrypted API keys
- **whatsapp:** Campaign management
- **revenue:** Revenue tracking and analytics
- **sponsors:** Sponsor management
- **team:** Team member management

---

## Frontend (React via CDN)

The frontend is a single-page app (SPA) loaded from `ZARii AI Web App.html`. React is loaded from CDN and transpiled on-the-fly using Babel standalone. This approach:

- Eliminates build step for frontend
- Allows rapid iteration
- Keeps deployment simple (just static files + Node backend)

Components are in `components/` and imported via `<script>` tags in the HTML.

---

## Testing & Debugging

- **Mock Diagnoses:** `aiRouter.js` includes mock diagnoses for testing without API keys
- **Development OTP:** In dev mode, OTP is logged to console
- **Supabase Studio:** Access database directly at `https://app.supabase.com`
- **WhatsApp Webhook Testing:** Use ngrok or Vercel to expose local server

---

## Deployment

- **Vercel:** Recommended for Node.js backend + static frontend
- **Environment Variables:** Set in Vercel dashboard (not in `.env`)
- **Uploads:** On Vercel, use Supabase Storage (local dev uses `uploads/` directory)
- **Cron Jobs:** Vercel cron triggers `GET /api/cron` (token-verified)

---

## Key Files to Know

- `backend/server.js` — Entry point; understand middleware order and route registration
- `backend/config.js` — All configuration; understand what's required vs optional
- `backend/services/aiRouter.js` — AI failover logic; modify here to add new providers
- `backend/middleware/auth.js` — JWT verification; understand token structure
- `backend/db/supabase-schema.sql` — Database schema and RLS policies
- `app.jsx` — React root; understand component hierarchy
- `ZARii AI Web App.html` — SPA entry point; understand how React is loaded

---

## References

- **Full API Documentation:** See `DOCUMENTATION.md`
- **Knowledge Base:** See `AGENTS.md` for wiki structure and conventions
- **Gemini Rules:** See `.agents/rules/GEMINI.md` for Gemini-specific guidance
