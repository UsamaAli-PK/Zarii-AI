-- ZARii AI — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor to create all tables

-- ============================================================
-- FARMER USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL UNIQUE,
  lang        TEXT NOT NULL DEFAULT 'ur',
  region      TEXT,
  crops       JSONB DEFAULT '[]',
  channel     TEXT DEFAULT 'web',
  premium     BOOLEAN DEFAULT false,
  churn_risk  TEXT DEFAULT 'low',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  last_seen   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- ============================================================
-- OTP SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_sessions (
  id          BIGSERIAL PRIMARY KEY,
  phone       TEXT NOT NULL,
  otp_code    TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  verified    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_phone_expires ON otp_sessions(phone, expires_at);

-- ============================================================
-- SCAN HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS scans (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT REFERENCES users(id) ON DELETE CASCADE,
  crop_type       TEXT,
  image_url       TEXT,
  disease_name    TEXT,
  disease_name_ur TEXT,
  pathogen        TEXT,
  confidence      REAL,
  severity        TEXT,
  symptoms        JSONB DEFAULT '[]',
  prevention      JSONB DEFAULT '[]',
  ai_provider     TEXT,
  processing_ms   INTEGER,
  user_feedback   TEXT,
  flagged         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scans_user ON scans(user_id, created_at DESC);

-- ============================================================
-- VOICE QUERIES
-- ============================================================
CREATE TABLE IF NOT EXISTS voice_queries (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT REFERENCES users(id) ON DELETE CASCADE,
  transcript   TEXT,
  lang         TEXT DEFAULT 'ur',
  answer       TEXT,
  tts_url      TEXT,
  stt_provider TEXT,
  tts_provider TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_voice_user ON voice_queries(user_id, created_at DESC);

-- ============================================================
-- PESTICIDE / FERTILIZER CATALOG
-- ============================================================
CREATE TABLE IF NOT EXISTS catalog (
  id                 BIGSERIAL PRIMARY KEY,
  name               TEXT NOT NULL,
  category           TEXT NOT NULL,
  company            TEXT NOT NULL,
  pkr_price          TEXT,
  unit               TEXT,
  dosage             TEXT,
  is_sponsored       BOOLEAN DEFAULT false,
  is_banned          BOOLEAN DEFAULT false,
  sponsor_id         BIGINT,
  last_price_refresh TIMESTAMPTZ DEFAULT NOW(),
  created_at         TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_catalog_category ON catalog(category, is_banned);

-- ============================================================
-- TREATMENTS (linked to scans)
-- ============================================================
CREATE TABLE IF NOT EXISTS treatments (
  id           BIGSERIAL PRIMARY KEY,
  scan_id      BIGINT REFERENCES scans(id) ON DELETE CASCADE,
  catalog_id   BIGINT REFERENCES catalog(id),
  is_primary   BOOLEAN DEFAULT false,
  dosage       TEXT,
  schedule     TEXT,
  is_sponsored BOOLEAN DEFAULT false
);

-- ============================================================
-- SPONSORS
-- ============================================================
CREATE TABLE IF NOT EXISTS sponsors (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  logo_url        TEXT,
  contact_email   TEXT,
  contract_start  DATE,
  contract_end    DATE,
  pricing_model   TEXT,
  monthly_budget  REAL DEFAULT 0,
  status          TEXT DEFAULT 'Active',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SPONSORED PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS sponsored_products (
  id                BIGSERIAL PRIMARY KEY,
  sponsor_id        BIGINT REFERENCES sponsors(id) ON DELETE CASCADE,
  catalog_id        BIGINT REFERENCES catalog(id) ON DELETE CASCADE,
  boost_weight      INTEGER DEFAULT 5,
  target_regions    JSONB DEFAULT '[]',
  target_crops      JSONB DEFAULT '[]',
  daily_cap         INTEGER DEFAULT 1000,
  impressions_today INTEGER DEFAULT 0,
  status            TEXT DEFAULT 'Active',
  start_date        DATE,
  end_date          DATE
);

-- ============================================================
-- OUTBREAK DATA
-- ============================================================
CREATE TABLE IF NOT EXISTS outbreaks (
  id             BIGSERIAL PRIMARY KEY,
  region         TEXT NOT NULL,
  disease        TEXT NOT NULL,
  crop           TEXT,
  pressure_level TEXT DEFAULT 'Low',
  farm_count     INTEGER DEFAULT 0,
  trend_pct      REAL DEFAULT 0,
  detected_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_outbreaks_region ON outbreaks(region);

-- ============================================================
-- ADVISORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS advisories (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  body_en       TEXT,
  body_ur       TEXT,
  regions       JSONB DEFAULT '[]',
  disease       TEXT,
  reach_count   INTEGER DEFAULT 0,
  engaged_count INTEGER DEFAULT 0,
  status        TEXT DEFAULT 'Active',
  sent_at       TIMESTAMPTZ DEFAULT NOW(),
  created_by    BIGINT
);

-- ============================================================
-- WHATSAPP CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS wa_conversations (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT REFERENCES users(id) ON DELETE CASCADE,
  wa_phone    TEXT NOT NULL,
  mode        TEXT DEFAULT 'auto',
  messages    JSONB DEFAULT '[]',
  unread      INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wa_convo_user  ON wa_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_wa_convo_phone ON wa_conversations(wa_phone);

-- ============================================================
-- API KEY POOL
-- ============================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id            BIGSERIAL PRIMARY KEY,
  pool          TEXT NOT NULL,
  provider      TEXT NOT NULL,
  key_encrypted TEXT NOT NULL,
  priority      INTEGER DEFAULT 1,
  weight        INTEGER DEFAULT 50,
  daily_quota   TEXT,
  status        TEXT DEFAULT 'healthy',
  last_error    TEXT,
  cost_mtd      REAL DEFAULT 0,
  calls_today   INTEGER DEFAULT 0,
  errors_today  INTEGER DEFAULT 0,
  latency_p95   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- API USAGE LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS api_usage (
  id           BIGSERIAL PRIMARY KEY,
  key_id       BIGINT REFERENCES api_keys(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  calls_count  INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  latency_p95  INTEGER DEFAULT 0,
  cost         REAL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_api_usage_date ON api_usage(key_id, date);

-- ============================================================
-- FAILOVER EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS failover_events (
  id            BIGSERIAL PRIMARY KEY,
  from_key_id   BIGINT,
  to_key_id     BIGINT,
  from_provider TEXT,
  to_provider   TEXT,
  reason        TEXT,
  pool          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ADMIN USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'Support',
  tfa_enabled   BOOLEAN DEFAULT false,
  last_active   TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGSERIAL PRIMARY KEY,
  admin_id    BIGINT REFERENCES admin_users(id),
  admin_name  TEXT,
  action      TEXT NOT NULL,
  target      TEXT,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON audit_log(admin_id, created_at DESC);

-- ============================================================
-- REVENUE EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS revenue_events (
  id          BIGSERIAL PRIMARY KEY,
  type        TEXT NOT NULL,
  amount      REAL NOT NULL,
  partner     TEXT,
  user_id     BIGINT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT REFERENCES users(id) ON DELETE CASCADE,
  plan        TEXT DEFAULT 'premium',
  price       REAL DEFAULT 299,
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ,
  status      TEXT DEFAULT 'active'
);

-- ============================================================
-- PROMPTS LIBRARY (A/B testing)
-- ============================================================
CREATE TABLE IF NOT EXISTS prompts (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT,
  content     TEXT NOT NULL,
  traffic_pct INTEGER DEFAULT 100,
  accuracy    REAL,
  status      TEXT DEFAULT 'champion',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUPABASE STORAGE — create bucket for farmer scans
-- ============================================================
-- Run this separately in Supabase Dashboard > Storage:
-- CREATE BUCKET scans (public: false)
-- Or use the Storage tab to create a private bucket named "scans"
