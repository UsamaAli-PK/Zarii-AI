# Zarii-AI Project Structure & Setup Guide

**Last Updated:** 2026-05-04  
**Status:** 🟢 Ready for Testing  
**Supabase Connected:** ✅ YES

---

## 📁 Project Directory Structure

```
zarii-ai/
├── backend/                          # Node.js Express backend
│   ├── server.js                     # Express app entry point
│   ├── config.js                     # Environment configuration
│   ├── supabase.js                   # Supabase client initialization
│   ├── db/
│   │   ├── migrate.js                # Database migrations & seeding
│   │   └── supabase-schema.sql       # Full database schema with RLS
│   ├── middleware/
│   │   ├── auth.js                   # Farmer JWT verification
│   │   └── adminAuth.js              # Admin JWT + role-based access
│   ├── routes/
│   │   ├── auth.js                   # OTP send/verify/refresh
│   │   ├── diagnose.js               # Image upload + AI diagnosis
│   │   ├── voice.js                  # STT, Q&A, TTS endpoints
│   │   ├── history.js                # Scan/voice history + analytics
│   │   ├── users.js                  # Profile, health score
│   │   ├── dashboard.js              # Weather, alerts, stats
│   │   ├── webhook.js                # WhatsApp webhook
│   │   ├── cron.js                   # Vercel cron trigger
│   │   ├── waitlist.js               # Waitlist signup
│   │   └── admin/                    # Admin modules
│   │       ├── overview.js           # Dashboard stats
│   │       ├── diagnoses.js          # Diagnosis history
│   │       ├── users.js              # Farmer management
│   │       ├── outbreaks.js          # Disease tracking
│   │       ├── catalog.js            # Product catalog
│   │       ├── apiKeys.js            # API key management
│   │       ├── whatsapp.js           # WhatsApp campaigns
│   │       ├── revenue.js            # Revenue tracking
│   │       ├── sponsors.js           # Sponsor management
│   │       └── team.js               # Team management
│   ├── services/
│   │   ├── aiRouter.js               # AI provider failover chain
│   │   ├── apiKeys.js                # AES-256 encryption/decryption
│   │   ├── otp.js                    # OTP generation & verification
│   │   └── cronJobs.js               # Background jobs
│   └── seo/
│       ├── seoRoutes.js              # SSR routes for search engines
│       ├── ssrShell.js               # HTML template renderer
│       ├── seoData.js                # SEO metadata
│       ├── diseaseData.js            # Disease pages
│       ├── glossaryData.js           # Glossary pages
│       └── locationData.js           # Location-specific pages
│
├── components/                       # React JSX components (CDN-transpiled)
│   ├── Landing.jsx                   # Marketing landing page
│   ├── Onboarding.jsx                # Farmer signup/login flow
│   ├── Dashboard.jsx                 # Main farmer dashboard
│   ├── Analyze.jsx                   # Leaf scan + diagnosis UI
│   ├── Admin.jsx                     # Admin panel entry
│   ├── AdminTabs.jsx                 # Admin tab navigation
│   ├── Pages.jsx                     # Static pages
│   └── shared.jsx                    # Shared UI components
│
├── app.jsx                           # React root component
├── api.js                            # API bridge (48 endpoints)
├── styles.css                        # Global styles
├── index.html                        # SPA entry point
│
├── wiki/                             # Knowledge base
│   ├── index.md                      # Wiki index
│   ├── log.md                        # Wiki activity log
│   ├── entities/                     # Entity pages
│   ├── concepts/                     # Concept pages
│   ├── synthesis/                    # Analysis & design pages
│   └── audits/                       # Audit reports
│       ├── COMPREHENSIVE_AUDIT_REPORT.md
│       ├── SECURITY_AUDIT.md
│       ├── PERFORMANCE_AUDIT.md
│       ├── FRONTEND_BACKEND_AUDIT.md
│       ├── CODE_ARCHITECTURE_AUDIT.md
│       ├── LIVE_DATABASE_VERIFICATION.md
│       ├── PHASE_2_CRITICAL_FIXES.md
│       ├── ENTERPRISE_REMEDIATION_PLAN.md
│       └── EXECUTION_SUMMARY.md
│
├── .agents/                          # Agent definitions & skills
├── .config/                          # Configuration files
├── .local/                           # Local task tracking
├── assets/                           # Static assets
├── uploads/                          # User-uploaded files (local dev)
├── scripts/                          # Utility scripts
│
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── .replit                           # Replit configuration
├── package.json                      # Node.js dependencies
├── package-lock.json                 # Dependency lock file
├── vercel.json                       # Vercel deployment config
├── CLAUDE.md                         # Claude Code instructions
├── DOCUMENTATION.md                  # Technical documentation
├── README.md                         # Project overview
├── Summary.md                        # Feature summary
└── PROJECT_STRUCTURE.md              # This file
```

---

## 🗄️ Database Schema (19 Tables)

### User Management
- **users** — Farmer profiles (7 rows)
- **admin_users** — Admin accounts (2 rows)
- **otp_sessions** — OTP verification (3 rows)

### Diagnosis & History
- **scans** — Leaf diagnosis results (1 row)
- **voice_queries** — Voice Q&A history (2 rows)
- **treatments** — Treatment recommendations (1 row)

### Products & Catalog
- **catalog** — Pesticides/fertilizers (12 rows)
- **sponsors** — Sponsor companies (5 rows)
- **sponsored_products** — Sponsored items (0 rows)

### Disease & Alerts
- **outbreaks** — Disease outbreaks (8 rows)
- **advisories** — Disease alerts (0 rows)

### Communication
- **wa_conversations** — WhatsApp chats (0 rows)

### System & Operations
- **api_keys** — Encrypted API keys (0 rows)
- **api_usage** — API usage logs (0 rows)
- **failover_events** — AI provider failovers (0 rows)
- **audit_log** — Admin actions (27 rows)
- **revenue_events** — Revenue tracking (0 rows)
- **subscriptions** — Premium subscriptions (0 rows)
- **prompts** — A/B testing prompts (0 rows)
- **waitlist** — Feature waitlist (0 rows)

---

## 🔧 Environment Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- API keys for: Gemini/OpenAI, ElevenLabs, OpenWeather

### Step 1: Clone & Install

```bash
cd F:\Github\Hackathons\Zarii-AI
npm install
```

### Step 2: Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
# Supabase (REQUIRED)
SUPABASE_URL=https://unbibbdoksruvwudxcwc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Auth Secrets (REQUIRED)
JWT_SECRET=your-secure-jwt-secret-here
ADMIN_JWT_SECRET=your-secure-admin-jwt-secret-here

# AI Providers (At least one required)
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key

# Voice TTS (Optional)
ELEVENLABS_API_KEY=your-elevenlabs-key

# Weather (Optional)
OPENWEATHER_API_KEY=your-openweather-key

# WhatsApp (Optional)
WA_ACCESS_TOKEN=your-wa-token
WA_PHONE_NUMBER_ID=your-wa-phone-id
WA_VERIFY_TOKEN=your-random-verify-token

# Deployment
NODE_ENV=development
PORT=5000
CORS_ORIGINS=http://localhost:5000,http://localhost:3000
```

### Step 3: Run Database Migrations

Migrations run automatically on server startup via `backend/db/migrate.js`. The system will:
1. Check if tables exist
2. Create tables if missing
3. Seed default data (catalog, sponsors, outbreaks, admin user)

---

## 🚀 Running the Project

### Development Mode

```bash
# Start the server (auto-restarts on file changes)
npm run dev
# or
node backend/server.js
```

**Server will start on:** `http://localhost:5000`

### Frontend Access

Open in browser:
- **SPA:** `http://localhost:5000/` (React app)
- **Admin:** `http://localhost:5000/#/admin` (Admin dashboard)
- **API:** `http://localhost:5000/api/` (REST endpoints)

### Testing Credentials

**Farmer Login:**
- Phone: `+923001234567` (any phone works)
- OTP: `1234` (hardcoded in dev mode)

**Admin Login:**
- Email: `admin@zarii.ai`
- Password: `admin123` (hardcoded in dev mode)

---

## 📊 API Endpoints (48 Total)

### Public Endpoints
- `POST /api/auth/send-otp` — Send OTP to phone
- `POST /api/auth/verify-otp` — Verify OTP and get JWT
- `POST /api/auth/refresh` — Refresh JWT token
- `POST /api/waitlist` — Join waitlist

### Farmer Endpoints (Require JWT)
- `POST /api/diagnose` — Upload image for diagnosis
- `POST /api/voice/stt` — Speech-to-text
- `POST /api/voice/ask` — Ask question
- `POST /api/voice/tts` — Text-to-speech
- `GET /api/history` — Get scan history
- `GET /api/users/me` — Get profile
- `GET /api/dashboard` — Get dashboard data

### Admin Endpoints (Require Admin JWT)
- `GET /api/admin/overview` — Dashboard stats
- `GET /api/admin/users` — List farmers
- `GET /api/admin/diagnoses` — List diagnoses
- `GET /api/admin/outbreaks` — List outbreaks
- `POST /api/admin/outbreaks` — Create outbreak
- `GET /api/admin/sponsors` — List sponsors
- `GET /api/admin/revenue` — Revenue stats
- `GET /api/admin/catalog` — Product catalog
- `GET /api/admin/api-keys` — API key management
- `GET /api/admin/whatsapp` — WhatsApp queue
- `GET /api/admin/team` — Team management
- Plus 20+ more admin operations

### Webhook Endpoints
- `POST /api/webhook` — WhatsApp webhook
- `GET /api/cron` — Vercel cron trigger

---

## 🔐 Security Features

### Authentication
- **Farmer Auth:** Phone OTP + JWT (7-day expiry)
- **Admin Auth:** Email/password + JWT + role-based access
- **Token Verification:** Checked on every request

### Authorization
- **RLS Policies:** Row-level security on all 19 tables
- **Permission Checks:** Admin endpoints require specific permissions
- **Role-Based Access:** Owner, Manager, Support roles

### Data Protection
- **API Keys:** AES-256 encrypted at rest
- **Passwords:** Bcrypt hashed
- **SSRF Protection:** Image URLs validated before fetch
- **CORS:** Origin whitelist validation
- **Rate Limiting:** Global (100/15min), Auth (10/15min), Admin (5/15min)

---

## 📈 Performance Metrics

### Current State
- **Database:** 19 tables, 37 indexes, RLS enabled
- **API:** 48 endpoints, all with error handling
- **Frontend:** React 18 via CDN, Babel transpilation
- **Deployment:** Vercel (Node.js backend + static frontend)

### Optimization Opportunities
- N+1 queries in analytics (Phase 2 fix)
- Missing query caching (Phase 2 fix)
- No performance monitoring (Phase 3 fix)

---

## 🧪 Testing the Project

### 1. Test Farmer Flow

```bash
# 1. Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+923001234567"}'

# 2. Verify OTP (use '1234' in dev mode)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+923001234567", "code": "1234"}'

# 3. Get profile (use JWT from step 2)
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Test Admin Flow

```bash
# 1. Login as admin
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@zarii.ai", "password": "admin123"}'

# 2. Get dashboard (use admin JWT from step 1)
curl -X GET http://localhost:5000/api/admin/overview \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### 3. Test Supabase Connection

```bash
# Check if database is connected
curl -X GET http://localhost:5000/api/admin/overview \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Should return dashboard stats from Supabase
```

---

## 📝 Documentation Files

### Main Documentation
- **CLAUDE.md** — Claude Code instructions & tech stack
- **DOCUMENTATION.md** — Full API documentation
- **README.md** — Project overview & features
- **PROJECT_STRUCTURE.md** — This file

### Audit Reports
- **COMPREHENSIVE_AUDIT_REPORT.md** — All 102 issues
- **SECURITY_AUDIT.md** — 19 security vulnerabilities
- **PERFORMANCE_AUDIT.md** — 28 performance issues
- **FRONTEND_BACKEND_AUDIT.md** — 30 frontend/backend issues
- **CODE_ARCHITECTURE_AUDIT.md** — 25 architecture issues

### Remediation Plans
- **PHASE_2_CRITICAL_FIXES.md** — Completed fixes (4 issues)
- **ENTERPRISE_REMEDIATION_PLAN.md** — 7-day plan (98 issues)
- **EXECUTION_SUMMARY.md** — Quick reference guide

---

## ✅ Pre-Remediation Checklist

Before starting Phase 1 fixes, verify:

- [ ] Project structure organized ✅
- [ ] All documentation updated ✅
- [ ] Environment configured with Supabase
- [ ] Server starts without errors
- [ ] Database migrations run successfully
- [ ] Can login as farmer (OTP: 1234)
- [ ] Can login as admin (password: admin123)
- [ ] API endpoints respond correctly
- [ ] Supabase connection verified
- [ ] All 19 tables exist in database

---

## 🎯 Next Steps

1. **Configure .env** with your Supabase credentials
2. **Run the project:** `npm run dev`
3. **Test the flows** using curl commands above
4. **Verify Supabase connection** by checking database
5. **Approve for remediation** once everything works
6. **Start Phase 1** security hardening

---

## 📞 Support

**Issues?**
- Check `.env` configuration
- Verify Supabase credentials
- Check server logs for errors
- Review DOCUMENTATION.md for API details

**Ready to start remediation?**
- Review ENTERPRISE_REMEDIATION_PLAN.md
- Approve Phase 1 execution
- Launch 8 parallel agents

---

**Status:** 🟢 READY FOR TESTING  
**Last Updated:** 2026-05-04  
**Supabase Connected:** ✅ YES
