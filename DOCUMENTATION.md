# ZARii AI — Technical Documentation

> Bilingual (Urdu/English) AI-powered crop disease diagnosis platform for Pakistani farmers.

**Version**: 1.0.0 · **Database**: Supabase PostgreSQL 17.6 (eu-central-1)  
**Stack**: Node.js/Express · React 18 (CDN) · Supabase · OpenAI/Gemini · ElevenLabs

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Getting Started](#getting-started)
3. [Environment Variables](#environment-variables)
4. [Database Schema](#database-schema)
5. [API Reference — Farmer Endpoints](#api-reference--farmer-endpoints)
6. [API Reference — Admin Endpoints](#api-reference--admin-endpoints)
7. [Services & Background Jobs](#services--background-jobs)
8. [Frontend Components](#frontend-components)
9. [Security Architecture](#security-architecture)
10. [SEO & SSR System](#seo--ssr-system)
11. [Deployment Guide](#deployment-guide)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTS                               │
│  Browser (React SPA)  ·  WhatsApp  ·  Search Engines    │
└────────────┬──────────────┬──────────────┬──────────────┘
             │              │              │
             ▼              ▼              ▼
┌─────────────────────────────────────────────────────────┐
│              EXPRESS SERVER (backend/server.js)           │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Helmet   │ │ CORS     │ │ Rate     │ │ JWT Auth   │ │
│  │ Headers  │ │ Policy   │ │ Limiter  │ │ Middleware │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│                                                          │
│  FARMER API        ADMIN API        WEBHOOKS    SEO/SSR  │
│  /api/auth/*       /api/admin/*     /webhooks   /*       │
│  /api/diagnose     (JWT-protected)  /webhook    (SSR)    │
│  /api/voice/*                                            │
│  /api/history/*                                          │
│  /api/users/*                                            │
└────────────┬─────────────────────────────────────────────┘
             │
     ┌───────┴───────┐
     ▼               ▼
┌──────────┐   ┌──────────────┐
│ Supabase │   │  AI Providers │
│ Postgres │   │  Gemini 1.5   │
│ Storage  │   │  GPT-4o       │
│ Auth     │   │  ElevenLabs   │
└──────────┘   │  Whisper      │
               └──────────────┘
```

### Key Design Decisions
- **Phone-based auth**: Farmers authenticate via OTP sent to WhatsApp (or SMS). No email/password.
- **AI failover chain**: Gemini → GPT-4o → Mock. If all AI providers fail, hardcoded mock diagnoses are returned.
- **Service role key**: Backend uses Supabase `service_role` key (bypasses RLS). All authorization is enforced at the Express middleware layer.
- **CDN React**: Frontend uses React 18 via unpkg CDN with Babel standalone transpilation (no build step).

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (PostgreSQL)
- npm

### Installation
```bash
git clone <repo-url>
cd Zarii-AI
npm install
cp .env.example .env   # Fill in your keys
```

### Running
```bash
# Full app (backend + frontend serving)
node backend/server.js

# Frontend-only static server (development)
node server.js
```

The backend serves both the API (`/api/*`) and the frontend SPA on the same port (default `5000`).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | **Yes (prod)** | Secret for farmer JWT tokens. Server crashes in production if missing. |
| `ADMIN_JWT_SECRET` | **Yes (prod)** | Secret for admin JWT tokens. |
| `SUPABASE_URL` | **Yes** | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase service role key (bypasses RLS) |
| `GEMINI_API_KEY` | No | Google Gemini API key for vision diagnosis |
| `OPENAI_API_KEY` | No | OpenAI API key for GPT-4o vision + Whisper STT |
| `ELEVENLABS_API_KEY` | No | ElevenLabs key for text-to-speech |
| `OPENWEATHER_API_KEY` | No | OpenWeather key for live weather data |
| `WA_ACCESS_TOKEN` | No | WhatsApp Business API access token |
| `WA_PHONE_NUMBER_ID` | No | WhatsApp phone number ID |
| `WA_VERIFY_TOKEN` | No | WhatsApp webhook verification token |
| `ENCRYPT_KEY` | No | AES-256 key for API key encryption at rest |
| `CORS_ORIGINS` | No | Comma-separated allowed origins (defaults to `*` in dev) |
| `GOOGLE_INDEXING_CREDENTIALS` | **Yes (prod)** | JSON string of Google Service Account credentials for Indexing API |
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | `development` or `production` |

---

## Database Schema

**19 tables** in `public` schema. RLS is enabled on all tables with deny-all policies for PostgREST. Backend accesses data via service_role key.

### Core Tables

#### `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint (PK) | Auto-increment |
| `name` | text | NOT NULL |
| `phone` | text | UNIQUE, NOT NULL |
| `lang` | text | Default `'ur'` |
| `region` | text | Nullable (Punjab, Sindh, etc.) |
| `crops` | jsonb | Default `[]` |
| `channel` | text | `'web'` or `'whatsapp'` |
| `premium` | boolean | Default false |
| `churn_risk` | text | `'low'`, `'med'`, `'high'` |
| `created_at` | timestamptz | Default `now()` |
| `last_seen` | timestamptz | Default `now()` |

#### `scans`
| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint (PK) | Auto-increment |
| `user_id` | bigint (FK→users) | |
| `crop_type` | text | e.g. `'wheat'`, `'cotton'` |
| `image_url` | text | Supabase Storage signed URL |
| `disease_name` | text | English name |
| `disease_name_ur` | text | Urdu name |
| `pathogen` | text | Scientific name |
| `confidence` | float4 | CHECK: 0–100 |
| `severity` | text | CHECK: None/Low/Moderate/High/Critical |
| `symptoms` | jsonb | Array of strings |
| `prevention` | jsonb | Array of strings |
| `ai_provider` | text | `'Gemini 1.5 Pro'`, `'GPT-4o Vision'`, `'mock'` |
| `processing_ms` | int4 | AI processing time |
| `user_feedback` | text | CHECK: positive/negative/neutral |
| `flagged` | boolean | Admin flag |
| `created_at` | timestamptz | |

#### `admin_users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint (PK) | |
| `name` | text | |
| `email` | text | UNIQUE |
| `password_hash` | text | bcrypt hash |
| `role` | text | CHECK: Owner/Admin/Manager/Support |
| `tfa_enabled` | boolean | Default false |

### Supporting Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `otp_sessions` | Phone verification OTPs | phone, otp_code (hashed), expires_at |
| `voice_queries` | Voice Q&A history | user_id, transcript, answer, lang |
| `catalog` | Pesticide/product catalog | name, category, company, pkr_price |
| `treatments` | Scan→product recommendations | scan_id, catalog_id, dosage, schedule |
| `sponsors` | Sponsor companies | name, contract dates, budget |
| `sponsored_products` | Boosted product placements | sponsor_id, catalog_id, boost_weight |
| `outbreaks` | Disease outbreak alerts | region, disease, pressure_level |
| `advisories` | Admin-sent warnings | title, body_en, body_ur, regions |
| `api_keys` | AI provider key management | pool, provider, key_encrypted |
| `api_usage` | Daily API usage tracking | key_id, date, calls_count |
| `failover_events` | AI provider failover log | from_provider, to_provider, reason |
| `audit_log` | Admin action tracking | admin_id, action, target, ip_address |
| `revenue_events` | Revenue tracking | type, amount, partner |
| `subscriptions` | User premium plans | user_id, plan, price, status |
| `prompts` | AI prompt A/B testing | name, content, traffic_pct, accuracy |

### Indexes
- `users`: `users_phone_key` (unique)
- `scans`: `idx_scans_user` (user_id, created_at DESC)
- `voice_queries`: `idx_voice_user` (user_id, created_at DESC)
- `otp_sessions`: `idx_otp_phone_expires` (phone, expires_at)
- `treatments`: `idx_treatments_scan`, `idx_treatments_catalog`
- `sponsored_products`: `idx_sponsored_products_catalog`, `idx_sponsored_products_sponsor`
- `subscriptions`: `idx_subscriptions_user`

---

## API Reference — Farmer Endpoints

### Authentication

#### `POST /api/auth/send-otp`
Send OTP to phone number.
```json
// Request
{ "phone": "+923001234567" }
// Response
{ "sent": true, "expires_in": 300 }
```

#### `POST /api/auth/verify-otp`
Verify OTP and receive JWT token. Creates user if new.
```json
// Request
{ "phone": "+923001234567", "code": "1234", "name": "Muhammad Aslam", "lang": "ur", "region": "Punjab", "crops": ["wheat","cotton"] }
// Response
{ "token": "eyJ...", "user": { "id": 1, "name": "Muhammad Aslam", "phone": "+923001234567", ... } }
```

#### `POST /api/auth/refresh`
Refresh an expired JWT (within 30-day grace period).
```json
// Request
{ "token": "eyJ..." }
// Response
{ "token": "eyJ...(new)", "user": {...} }
```

### Diagnosis

#### `POST /api/diagnose` 🔒
Upload crop leaf image for AI diagnosis.
- **Auth**: Bearer token required
- **Content-Type**: `multipart/form-data`
- **Fields**: `image` (file), `crop_type` (string), `lang` (string), `image_url` (string, HTTPS only)
```json
// Response
{
  "scan_id": 42,
  "disease": { "name": "Early Blight", "name_ur": "ابتدائی جھلساؤ", "pathogen": "Alternaria solani", "confidence": 94, "severity": "Moderate" },
  "symptoms": ["Concentric brown rings on lower leaves", ...],
  "prevention": ["Water at base, not on leaves", ...],
  "treatment": {
    "primary": { "name": "Antracol 70 WP", "company": "Bayer", "price": "1,180", "dosage": "2g per L water", "schedule": "Every 7 days" },
    "alternatives": [...]
  },
  "ai_provider": "Gemini 1.5 Pro",
  "processing_ms": 2340
}
```

#### `POST /api/diagnose/:id/feedback` 🔒
Submit diagnosis feedback.
```json
{ "feedback": "positive" }  // positive|negative|neutral
```

### Voice

#### `POST /api/voice/stt` 🔒
Speech-to-text: Upload audio, get transcript.
- **Fields**: `audio` (file), `lang` (`'ur'` or `'en'`)
- **Provider**: OpenAI Whisper → mock fallback

#### `POST /api/voice/ask` 🔒
Ask agricultural question, get AI answer.
```json
// Request
{ "text": "میرے گندم کے پتے پیلے ہو رہے ہیں", "lang": "ur" }
// Response
{ "answer": "...", "query_id": 15 }
```

#### `POST /api/voice/tts` 🔒
Text-to-speech: Convert answer to audio.
```json
// Request
{ "text": "...", "lang": "ur", "query_id": 15 }
// Response
{ "audio_url": "https://...signed-url...", "provider": "ElevenLabs" }
```

### User Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/me` 🔒 | Get profile + stats |
| `PATCH` | `/api/users/me` 🔒 | Update name, lang, region, crops |
| `GET` | `/api/users/me/health-score` 🔒 | Crop health score (0-100) |

### History & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/history?type=scan&page=1&limit=20` 🔒 | Paginated scan/voice history |
| `GET` | `/api/history/recent?limit=4` 🔒 | Recent scans |
| `GET` | `/api/history/analytics` 🔒 | Personal analytics dashboard |
| `POST` | `/api/history/feedback` 🔒 | Submit scan feedback |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health + feature flags |
| `GET` | `/api/weather?lat=30&lon=71` | Weather data (OpenWeather → mock) |
| `GET` | `/api/platform-stats` | Public homepage statistics |
| `GET` | `/api/alerts?region=Punjab` 🔒 | Active disease outbreak alerts |

---

## API Reference — Admin Endpoints

All admin endpoints require `Authorization: Bearer <admin_jwt>`. Routes pass through `adminAuthMiddleware`.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/auth/login` | Admin login (email/password) → JWT |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/overview` | KPIs, system health, live feed, chart |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/users?page=1&limit=20&search=` | Paginated user list |
| `GET` | `/api/admin/users/:id` | User detail |
| `PATCH` | `/api/admin/users/:id/churn-risk` | Update churn risk |
| `GET` | `/api/admin/users/meta/growth-chart` | 30-day user growth |

### Diagnosis Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/diagnoses?page=1&limit=20` | Paginated scan list |
| `POST` | `/api/admin/diagnoses/:id/flag` | Flag/unflag diagnosis |
| `GET` | `/api/admin/diagnoses/meta/accuracy-chart` | 30-day accuracy chart |

### Outbreak Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/outbreaks` | All outbreaks |
| `POST` | `/api/admin/outbreaks` | Create outbreak |
| `POST` | `/api/admin/outbreaks/:id/advisory` | Send advisory to region |

### Sponsor & Catalog
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/admin/sponsors` | List/create sponsors |
| `PATCH` | `/api/admin/sponsors/:id` | Update sponsor |
| `GET/POST` | `/api/admin/catalog` | List/create products |
| `PATCH` | `/api/admin/catalog/:id` | Update product |
| `POST` | `/api/admin/catalog/:id/ban` | Ban/unban product |

### Revenue & API Keys
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/revenue` | Revenue overview |
| `POST` | `/api/admin/revenue/subscription` | Grant premium to user |
| `GET/POST` | `/api/admin/api-keys` | Manage AI provider keys |
| `PATCH` | `/api/admin/api-keys/:id` | Update key |
| `GET` | `/api/admin/api-keys/:id/test` | Test key connectivity |

### Team & Audit
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/team` | List admin users |
| `POST` | `/api/admin/team/invite` | Invite admin |
| `GET` | `/api/admin/audit-log` | View audit trail |

### WhatsApp
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/whatsapp/conversations` | All conversations |
| `POST` | `/api/admin/whatsapp/:convoId/send` | Send message |

---

## Services & Background Jobs

### AI Router (`services/aiRouter.js`)
- **`diagnoseImage()`**: Gemini → GPT-4o → Mock failover chain. Validates image URLs against SSRF blocklist. Parses JSON from AI response.
- **`answerVoiceQuery()`**: GPT-4o text completion for agricultural Q&A.
- **Failover logging**: Records provider switches in `failover_events` table.
- **Usage tracking**: Updates `api_keys.calls_today` after each call.

### OTP Service (`services/otp.js`)
- Uses `crypto.randomInt()` for cryptographically secure 4-digit codes.
- OTP is bcrypt-hashed before storage.
- OTP is **never** returned in the API response.
- Cleanup: Deletes verified/expired OTPs on each send/verify cycle.

### Cron Jobs (`services/cronJobs.js`)

| Schedule | Job | Description |
|----------|-----|-------------|
| Every hour | Outbreak Detector | Aggregates scans by region/disease, detects ≥3× spikes vs 7-day baseline |
| Midnight | Churn Risk Calculator | Scores users as low/med/high based on last_seen and scan count |
| Midnight | Counter Reset | Resets `impressions_today` and `calls_today` |
| Every 15 min | Analytics Aggregation | Writes `api_usage` daily rollups |

---

## Frontend Components

All components are in `/components/` as `.jsx` files, loaded via CDN Babel transpilation.

| Component | File | Description |
|-----------|------|-------------|
| `Landing` | `Landing.jsx` | Public homepage with hero, features, stats |
| `Onboarding` | `Onboarding.jsx` | Phone verification + profile setup flow |
| `AppShell` | `shared.jsx` | Navigation shell with bottom bar |
| `Dashboard` | `Dashboard.jsx` | Farmer home: weather, alerts, recent scans |
| `Analyze` | `Analyze.jsx` | Camera/upload → diagnosis result flow |
| `Voice` | `Pages.jsx` | Voice Q&A interface |
| `History` | `Pages.jsx` | Scan/voice history with filtering |
| `Analytics` | `Pages.jsx` | Personal crop health analytics |
| `WhatsAppView` | `Pages.jsx` | WhatsApp integration status |
| `AdminConsole` | `Admin.jsx` + `AdminTabs.jsx` | Full admin dashboard (10 tabs) |

### Routing
Hash-based routing (`window.location.hash`):
- `#landing` → Landing page
- `#onboarding` → Phone verification
- `#dashboard` → Main app
- `#analyze` → Crop diagnosis
- `#voice` → Voice assistant
- `#history` → Scan history
- `#analytics` → Analytics
- `#admin` → Admin console

---

## Security Architecture

### Authentication Flow
```
Farmer: Phone → OTP (WhatsApp) → Verify → JWT (7d expiry)
Admin:  Email/Password → bcrypt verify → Admin JWT (24h)
```

### Middleware Stack
1. **Helmet** — Security headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
2. **CORS** — Configurable origins via `CORS_ORIGINS` env var
3. **Rate Limiting**:
   - Global: 100 req/15min per IP on `/api/*`
   - Auth: 10 req/15min per IP on `/api/auth/*`
   - Admin auth: 5 req/15min per IP on `/api/admin/auth/*`
4. **JWT Auth** (`middleware/auth.js`) — Verifies farmer tokens
5. **Admin Auth** (`middleware/adminAuth.js`) — Verifies admin tokens + role-based permissions

### SSRF Protection
`image_url` parameter in `/api/diagnose` is validated:
- Must be HTTPS only
- Blocked: localhost, private IPs (10.x, 172.16-31.x, 192.168.x), cloud metadata (169.254.x)
- 10s timeout, 10MB max response size

### Path Traversal Protection
Root static server (`server.js`) validates all paths:
- Resolved path must stay within project root
- Blocked directories: `backend/`, `.env`, `.git`, `node_modules/`

### Database Security
- RLS enabled on all 19 tables with deny-all policies for anonymous/authenticated PostgREST access
- Backend uses service_role key (bypasses RLS) — authorization enforced at Express layer
- OTP codes stored as bcrypt hashes
- API keys encrypted with AES-256-CBC at rest

---

## SEO & SSR System

The SEO layer (`backend/seo/`) provides server-side rendered pages for search engines:

| Route Pattern | Page |
|---------------|------|
| `/diseases/:slug` | Disease detail page |
| `/products/:slug` | Product detail page |
| `/regions/:slug` | Region overview page |
| `/blog/:slug` | Blog article page |
| `/sitemap.xml` | Dynamic XML sitemap |
| `/robots.txt` | Standard robots instructions |

The SEO layer is fully integrated with **Supabase**. All disease, product, and regional data are fetched directly from the production PostgreSQL database.

### Google Indexing API
ZARii AI includes a specialized indexing service (`backend/services/indexing.js`) that programmatically notifies Google whenever new agricultural content is added or existing content is updated. This ensures:
- **Rapid Indexing**: New outbreaks or products appear in search results within 24 hours.
- **Data Freshness**: Search engines always point to the latest pesticide prices and regional advisories.

---

## Intelligence Layer

ZARii AI employs automated background services (`backend/services/cronJobs.js`) to monitor agricultural and environmental trends.

### 1. Outbreak Intelligence
- **Clustering**: The system monitors scans in real-time. If a 300% spike in a specific disease is detected within a tehsil (district sub-division) over 24 hours, an `outbreak` event is triggered.
- **Pressure Levels**: Outbreaks are graded as Moderate, High, or Critical based on the statistical deviation from the 8-day baseline.
- **Crop Context**: Intelligence is segmented by crop type (e.g., distinguishing between Whitefly in Cotton vs. Whitefly in Citrus).

### 2. Weather Intelligence
- **Disease Correlation**: Correlates humidity and temperature with known fungal and bacterial risks.
- **Predictive Alerts**: Generates "Weather Risks" in regions where conditions (e.g., >80% humidity) favor disease development, allowing for preventive fungicide recommendations.

### 3. Churn Intelligence
- Monitors farmer engagement and calculates a `churn_risk` (low, med, high).
- "High Risk" farmers are automatically flagged for WhatsApp re-engagement or re-marketing.

---

## Strategic Roadmap & Future Integrations

ZARii AI is architected to evolve beyond diagnosis into a comprehensive agricultural OS.

### 1. Agri-Fintech Pipeline
- **Credit Scoring**: Developing an algorithm to weigh scan frequency, treatment compliance, and regional yield data into a "Farmer Reliability Index" for micro-loan pre-qualification.
- **Parametric Insurance**: Using regional outbreak data to automate payout triggers for crop insurance providers.

### 2. Supply Chain & Market Intelligence
- **Mandi Integration**: Future ingestion of Punjab/Sindh Market Committee prices to correlate disease impact with market volatility.
- **Inventory Heatmaps**: Providing sponsors with predictive heatmaps showing where specific chemical inventories should be shifted based on emerging outbreaks.

### 3. Compliance & Export Safety
- **EU/US MRL Check**: Expanding the `catalog` database to include Maximum Residue Limit (MRL) data for major export crops.
- **Safe-Harvest Timer**: Calculating the "Pre-Harvest Interval" (PHI) to notify farmers when it is safe to harvest after the last chemical application.

---

## Deployment Guide

### Environment Setup
1. Set all required env vars (JWT_SECRET, ADMIN_JWT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
2. Set `NODE_ENV=production`
3. Set `CORS_ORIGINS` to your frontend domain(s)

### Start
```bash
NODE_ENV=production node backend/server.js
```

### Important Notes
- The root `server.js` is a legacy static file server — use `backend/server.js` for production
- Database migrations are applied automatically on startup via `db/migrate.js`
- Cron jobs start automatically after migrations
- File uploads go to `./uploads/` directory (ensure write permissions)
- Supabase Storage bucket `scans` is used for crop images and TTS audio

### Health Check
```
GET /api/health
```
Returns server status and feature flag availability for all AI providers.
