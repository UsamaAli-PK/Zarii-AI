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
  id                  BIGSERIAL PRIMARY KEY,
  supabase_uid        TEXT UNIQUE,
  name                TEXT NOT NULL,
  email               TEXT NOT NULL UNIQUE,
  password_hash       TEXT,
  role                TEXT NOT NULL DEFAULT 'Support',
  tfa_enabled         BOOLEAN DEFAULT false,
  email_verified      BOOLEAN DEFAULT false,
  verification_token  TEXT,
  verification_exp    TIMESTAMPTZ,
  last_active         TIMESTAMPTZ DEFAULT NOW(),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_supabase_uid ON admin_users(supabase_uid);

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
-- WAITLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS waitlist (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
  contact     TEXT,
  feature     TEXT NOT NULL DEFAULT 'whatsapp',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_waitlist_feature ON waitlist(feature);

-- ============================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsored_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbreaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE failover_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- ── USERS TABLE ──────────────────────────────────────────
-- Farmers can only see and update their own row
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid()::bigint = id);

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid()::bigint = id);

DROP POLICY IF EXISTS "users_insert_deny" ON users;
CREATE POLICY "users_insert_deny" ON users
  FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "users_delete_deny" ON users;
CREATE POLICY "users_delete_deny" ON users
  FOR DELETE USING (false);

-- ── SCANS TABLE ──────────────────────────────────────────
-- Farmers can only see and insert their own scans
DROP POLICY IF EXISTS "scans_select_own" ON scans;
CREATE POLICY "scans_select_own" ON scans
  FOR SELECT USING (auth.uid()::bigint = user_id);

DROP POLICY IF EXISTS "scans_insert_own" ON scans;
CREATE POLICY "scans_insert_own" ON scans
  FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);

DROP POLICY IF EXISTS "scans_update_own" ON scans;
CREATE POLICY "scans_update_own" ON scans
  FOR UPDATE USING (auth.uid()::bigint = user_id);

DROP POLICY IF EXISTS "scans_delete_deny" ON scans;
CREATE POLICY "scans_delete_deny" ON scans
  FOR DELETE USING (false);

-- ── VOICE_QUERIES TABLE ──────────────────────────────────
-- Farmers can only see and insert their own voice queries
DROP POLICY IF EXISTS "voice_select_own" ON voice_queries;
CREATE POLICY "voice_select_own" ON voice_queries
  FOR SELECT USING (auth.uid()::bigint = user_id);

DROP POLICY IF EXISTS "voice_insert_own" ON voice_queries;
CREATE POLICY "voice_insert_own" ON voice_queries
  FOR INSERT WITH CHECK (auth.uid()::bigint = user_id);

DROP POLICY IF EXISTS "voice_delete_deny" ON voice_queries;
CREATE POLICY "voice_delete_deny" ON voice_queries
  FOR DELETE USING (false);

-- ── OTP_SESSIONS TABLE ───────────────────────────────────
-- Public can insert (for login), but cannot read/update/delete
DROP POLICY IF EXISTS "otp_insert_public" ON otp_sessions;
CREATE POLICY "otp_insert_public" ON otp_sessions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "otp_deny_all" ON otp_sessions;
CREATE POLICY "otp_deny_all" ON otp_sessions
  FOR SELECT USING (false);

-- ── CATALOG TABLE ────────────────────────────────────────
-- Public can read catalog (products/diseases)
DROP POLICY IF EXISTS "catalog_select_public" ON catalog;
CREATE POLICY "catalog_select_public" ON catalog
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "catalog_deny_write" ON catalog;
CREATE POLICY "catalog_deny_write" ON catalog
  FOR INSERT WITH CHECK (false);

-- ── TREATMENTS TABLE ─────────────────────────────────────
-- Farmers can only see treatments for their own scans
DROP POLICY IF EXISTS "treatments_select_own" ON treatments;
CREATE POLICY "treatments_select_own" ON treatments
  FOR SELECT USING (
    scan_id IN (
      SELECT id FROM scans WHERE auth.uid()::bigint = user_id
    )
  );

DROP POLICY IF EXISTS "treatments_deny_write" ON treatments;
CREATE POLICY "treatments_deny_write" ON treatments
  FOR INSERT WITH CHECK (false);

-- ── SPONSORS TABLE ───────────────────────────────────────
-- Public can read sponsors
DROP POLICY IF EXISTS "sponsors_select_public" ON sponsors;
CREATE POLICY "sponsors_select_public" ON sponsors
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "sponsors_deny_write" ON sponsors;
CREATE POLICY "sponsors_deny_write" ON sponsors
  FOR INSERT WITH CHECK (false);

-- ── SPONSORED_PRODUCTS TABLE ─────────────────────────────
-- Public can read sponsored products
DROP POLICY IF EXISTS "sponsored_products_select_public" ON sponsored_products;
CREATE POLICY "sponsored_products_select_public" ON sponsored_products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "sponsored_products_deny_write" ON sponsored_products;
CREATE POLICY "sponsored_products_deny_write" ON sponsored_products
  FOR INSERT WITH CHECK (false);

-- ── OUTBREAKS TABLE ──────────────────────────────────────
-- Public can read outbreaks (disease alerts)
DROP POLICY IF EXISTS "outbreaks_select_public" ON outbreaks;
CREATE POLICY "outbreaks_select_public" ON outbreaks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "outbreaks_deny_write" ON outbreaks;
CREATE POLICY "outbreaks_deny_write" ON outbreaks
  FOR INSERT WITH CHECK (false);

-- ── ADVISORIES TABLE ─────────────────────────────────────
-- Public can read advisories
DROP POLICY IF EXISTS "advisories_select_public" ON advisories;
CREATE POLICY "advisories_select_public" ON advisories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "advisories_deny_write" ON advisories;
CREATE POLICY "advisories_deny_write" ON advisories
  FOR INSERT WITH CHECK (false);

-- ── WA_CONVERSATIONS TABLE ───────────────────────────────
-- Farmers can only see their own conversations
DROP POLICY IF EXISTS "wa_conversations_select_own" ON wa_conversations;
CREATE POLICY "wa_conversations_select_own" ON wa_conversations
  FOR SELECT USING (auth.uid()::bigint = user_id);

DROP POLICY IF EXISTS "wa_conversations_deny_write" ON wa_conversations;
CREATE POLICY "wa_conversations_deny_write" ON wa_conversations
  FOR INSERT WITH CHECK (false);

-- ── API_KEYS TABLE ───────────────────────────────────────
-- Admin only (deny all public access)
DROP POLICY IF EXISTS "api_keys_deny_all" ON api_keys;
CREATE POLICY "api_keys_deny_all" ON api_keys
  FOR ALL USING (false);

-- ── API_USAGE TABLE ──────────────────────────────────────
-- Admin only (deny all public access)
DROP POLICY IF EXISTS "api_usage_deny_all" ON api_usage;
CREATE POLICY "api_usage_deny_all" ON api_usage
  FOR ALL USING (false);

-- ── FAILOVER_EVENTS TABLE ────────────────────────────────
-- Admin only (deny all public access)
DROP POLICY IF EXISTS "failover_events_deny_all" ON failover_events;
CREATE POLICY "failover_events_deny_all" ON failover_events
  FOR ALL USING (false);

-- ── ADMIN_USERS TABLE ────────────────────────────────────
-- Admin only (deny all public access)
DROP POLICY IF EXISTS "admin_users_deny_all" ON admin_users;
CREATE POLICY "admin_users_deny_all" ON admin_users
  FOR ALL USING (false);

-- ── AUDIT_LOG TABLE ──────────────────────────────────────
-- Admin only (deny all public access)
DROP POLICY IF EXISTS "audit_log_deny_all" ON audit_log;
CREATE POLICY "audit_log_deny_all" ON audit_log
  FOR ALL USING (false);

-- ── REVENUE_EVENTS TABLE ─────────────────────────────────
-- Admin only (deny all public access)
DROP POLICY IF EXISTS "revenue_events_deny_all" ON revenue_events;
CREATE POLICY "revenue_events_deny_all" ON revenue_events
  FOR ALL USING (false);

-- ── SUBSCRIPTIONS TABLE ──────────────────────────────────
-- Farmers can only see their own subscriptions
DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (auth.uid()::bigint = user_id);

DROP POLICY IF EXISTS "subscriptions_deny_write" ON subscriptions;
CREATE POLICY "subscriptions_deny_write" ON subscriptions
  FOR INSERT WITH CHECK (false);

-- ── PROMPTS TABLE ────────────────────────────────────────
-- Admin only (deny all public access)
DROP POLICY IF EXISTS "prompts_deny_all" ON prompts;
CREATE POLICY "prompts_deny_all" ON prompts
  FOR ALL USING (false);

-- ── WAITLIST TABLE ───────────────────────────────────────
-- Public can insert (for signup), but cannot read/update/delete
DROP POLICY IF EXISTS "waitlist_insert_public" ON waitlist;
CREATE POLICY "waitlist_insert_public" ON waitlist
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "waitlist_deny_read" ON waitlist;
CREATE POLICY "waitlist_deny_read" ON waitlist
  FOR SELECT USING (false);

-- ============================================================
-- FOREIGN KEY CONSTRAINTS (Missing)
-- ============================================================

-- Add missing FK to outbreaks (user_id column doesn't exist, but we can add it for future use)
-- ALTER TABLE outbreaks ADD COLUMN user_id BIGINT REFERENCES users(id) ON DELETE CASCADE;

-- Add missing FK to advisories (created_by → admin_users)
ALTER TABLE advisories ADD CONSTRAINT advisories_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL;

-- Add missing FK to revenue_events (user_id → users)
ALTER TABLE revenue_events ADD CONSTRAINT revenue_events_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================
-- CHECK CONSTRAINTS (Missing)
-- ============================================================

-- Add CHECK constraint for users.region
ALTER TABLE users ADD CONSTRAINT users_region_check
  CHECK (region IN ('Punjab', 'Sindh', 'KPK', 'Balochistan', 'GB', 'AJK', 'FATA', NULL));

-- Add CHECK constraint for subscriptions.plan
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'premium', 'enterprise'));

-- Add CHECK constraint for outbreaks.pressure_level (standardize values)
ALTER TABLE outbreaks ADD CONSTRAINT outbreaks_pressure_level_check
  CHECK (pressure_level IN ('Low', 'Moderate', 'High', 'Critical'));

-- ============================================================
-- SUPABASE STORAGE — create bucket for farmer scans
-- ============================================================
-- Run this separately in Supabase Dashboard > Storage:
-- CREATE BUCKET scans (public: false)
-- Or use the Storage tab to create a private bucket named "scans"

-- ============================================================
-- SPEC COMPLIANCE MIGRATIONS (2026-05-05)
-- Weather/location context, two-step AI tracking, Punjabi support
-- ============================================================

ALTER TABLE scans ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS weather_temp REAL;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS weather_humidity INTEGER;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS weather_condition TEXT;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS input_lang TEXT DEFAULT 'ur';
ALTER TABLE scans ADD COLUMN IF NOT EXISTS solution_provider TEXT;

ALTER TABLE voice_queries ADD COLUMN IF NOT EXISTS input_format TEXT DEFAULT 'voice';
ALTER TABLE voice_queries ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE voice_queries ADD COLUMN IF NOT EXISTS weather_context TEXT;

ALTER TABLE users ADD COLUMN IF NOT EXISTS detected_city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lang_preference TEXT DEFAULT 'ur';
