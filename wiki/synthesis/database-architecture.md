# Database Architecture

Schema design, security model, and optimization strategy for ZARii AI's Supabase PostgreSQL database.

## Schema Overview

ZARii AI uses a 19-table schema optimized for farmer data isolation, audit trails, and multi-tenant operations.

### Core Tables (Farmer Data)

**users** (1 row per farmer)
- Stores phone, language preference, region, crops, premium status, churn risk
- Primary key: `id` (BIGSERIAL)
- Index: `idx_users_phone` (for OTP lookups)
- RLS: Farmers can only read/update their own row

**scans** (1 row per diagnosis)
- Stores leaf image URL, disease name (English + Urdu), pathogen, confidence, severity, symptoms, prevention tips
- Foreign key: `user_id` → users
- Indexes: `idx_scans_user` (user_id, created_at DESC) for history queries
- RLS: Farmers can only read their own scans; admins can read all

**voice_queries** (1 row per voice interaction)
- Stores Urdu transcript, AI answer, TTS audio URL, provider info
- Foreign key: `user_id` → users
- Index: `idx_voice_user` (user_id, created_at DESC)
- RLS: Farmers can only read their own queries

### Product Catalog (Shared Data)

**catalog** (pesticides, fertilizers, seeds)
- Stores product name, category, company, PKR price, unit, dosage, sponsor info
- No user_id (shared across all farmers)
- Index: `idx_catalog_category` (category, is_banned)
- RLS: All farmers can read; only admins can write

**treatments** (links scans to recommended products)
- Stores scan_id, catalog_id, is_primary flag, dosage, schedule
- Foreign keys: scan_id → scans, catalog_id → catalog
- RLS: Farmers can read treatments for their own scans

### Sponsorship & Revenue

**sponsors** (pesticide/fertilizer companies)
- Stores company name, logo, contract dates, monthly budget, status
- No user_id (admin-managed)
- RLS: Only admins can read/write

**sponsored_products** (boost weight for specific products)
- Stores sponsor_id, catalog_id, boost_weight, target regions/crops, daily impression cap
- Foreign keys: sponsor_id → sponsors, catalog_id → catalog
- RLS: Only admins can read/write; farmers see boosted products in recommendations

### Disease Tracking

**outbreaks** (regional disease alerts)
- Stores region, disease name, crop type, pressure level, farm count, trend percentage
- No user_id (regional aggregate)
- Index: `idx_outbreaks_region` (region)
- RLS: All farmers can read outbreaks for their region

**advisories** (broadcast alerts)
- Stores title, body (English + Urdu), target regions, disease, reach/engagement counts
- Foreign key: created_by → admin_users
- RLS: All farmers can read; only admins can write

### Communication

**wa_conversations** (WhatsApp message history)
- Stores user_id, WhatsApp phone, mode (auto/manual), messages (JSONB array), unread count
- Foreign key: user_id → users
- Indexes: `idx_wa_convo_user`, `idx_wa_convo_phone`
- RLS: Farmers can only read their own conversations; admins can read all

### API Management

**api_keys** (encrypted API key pool)
- Stores pool (vision/stt/tts), provider (Gemini/OpenAI/ElevenLabs), encrypted key, priority, weight, quota, status
- No user_id (system-level)
- RLS: Only admins can read/write

**api_usage** (daily usage tracking)
- Stores key_id, date, calls_count, errors_count, latency_p95, cost
- Foreign key: key_id → api_keys
- Index: `idx_api_usage_date` (key_id, date)
- RLS: Only admins can read

**failover_events** (audit trail for AI provider failovers)
- Stores from_key_id, to_key_id, from_provider, to_provider, reason, pool
- Foreign keys: from_key_id, to_key_id → api_keys
- RLS: Only admins can read

### Admin & Audit

**admin_users** (admin accounts)
- Stores name, email, password_hash, role, 2FA status, last_active
- No user_id (separate from farmers)
- RLS: Only admins can read; only super-admins can write

**audit_log** (admin action history)
- Stores admin_id, admin_name, action, target, IP address, timestamp
- Foreign key: admin_id → admin_users
- Index: `idx_audit_admin` (admin_id, created_at DESC)
- RLS: Only admins can read

### Revenue & Subscriptions

**revenue_events** (transaction log)
- Stores type (diagnosis_fee, sponsor_payment, subscription), amount, partner, user_id, description
- Foreign key: user_id → users (nullable for sponsor payments)
- RLS: Only admins can read

**subscriptions** (premium plans)
- Stores user_id, plan (premium/enterprise), price, started_at, expires_at, status
- Foreign key: user_id → users
- RLS: Farmers can read their own subscription; admins can read all

### Experimentation

**prompts** (A/B testing for AI prompts)
- Stores name, category, content, traffic percentage, accuracy score
- No user_id (system-level)
- RLS: Only admins can read/write

## Row-Level Security (RLS) Model

All 19 tables have RLS enabled. Security model:

### Farmer Access
```sql
-- Farmers can only read/update their own data
CREATE POLICY farmer_read_own ON scans
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY farmer_update_own ON scans
  FOR UPDATE USING (user_id = auth.uid());
```

### Admin Access
```sql
-- Admins can read all data
CREATE POLICY admin_read_all ON scans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );
```

### Public Read (Shared Data)
```sql
-- All users can read catalog (no RLS needed)
ALTER TABLE catalog DISABLE ROW LEVEL SECURITY;
```

## Indexing Strategy

### Query Patterns & Indexes

**Farmer History** (most common query)
```sql
SELECT * FROM scans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10;
-- Index: idx_scans_user (user_id, created_at DESC)
```

**Regional Outbreaks**
```sql
SELECT * FROM outbreaks WHERE region = $1 AND created_at > NOW() - INTERVAL '7 days';
-- Index: idx_outbreaks_region (region)
```

**API Usage Tracking**
```sql
SELECT * FROM api_usage WHERE key_id = $1 AND date = CURRENT_DATE;
-- Index: idx_api_usage_date (key_id, date)
```

**Audit Trail**
```sql
SELECT * FROM audit_log WHERE admin_id = $1 ORDER BY created_at DESC;
-- Index: idx_audit_admin (admin_id, created_at DESC)
```

### Missing Indexes (Optimization Opportunities)
- `idx_scans_disease` (disease_name) for outbreak detection
- `idx_treatments_catalog` (catalog_id) for product popularity
- `idx_revenue_events_date` (created_at) for monthly reporting

## Query Optimization Patterns

### 1. Batch Fetch with JOINs
**Bad**: Loop through scans, fetch disease name for each
```javascript
const scans = await supabase.from('scans').select('*').eq('user_id', userId);
for (const scan of scans) {
  const disease = await supabase.from('catalog').select('*').eq('id', scan.disease_id);
}
```

**Good**: Single JOIN query
```sql
SELECT s.*, c.name as disease_name FROM scans s
LEFT JOIN catalog c ON s.disease_id = c.id
WHERE s.user_id = $1 ORDER BY s.created_at DESC;
```

### 2. Aggregation for Outbreaks
**Bad**: Count scans in application code
```javascript
const scans = await supabase.from('scans').select('*').eq('region', region);
const count = scans.filter(s => s.disease === disease).length;
```

**Good**: PostgreSQL aggregation
```sql
SELECT COUNT(*) as farm_count FROM scans
WHERE region = $1 AND disease_name = $2 AND created_at > NOW() - INTERVAL '7 days';
```

### 3. Pagination for Large Result Sets
```sql
SELECT * FROM scans WHERE user_id = $1
ORDER BY created_at DESC LIMIT 10 OFFSET $2;
```

## Backup & Disaster Recovery

- **Automated Backups**: Supabase backs up daily (7-day retention)
- **Point-in-Time Recovery**: Available for 7 days
- **Manual Backups**: Export schema + data weekly to GitHub
- **Replication**: Consider read replicas for analytics queries

## Scaling Considerations

### Current Capacity
- **Rows**: ~1M scans, ~100K users (comfortable)
- **Storage**: ~50GB (images in Supabase Storage, not database)
- **Connections**: 100 concurrent (Supabase default)

### Future Scaling (5M farmers)
1. **Partition scans table** by user_id or date range
2. **Archive old scans** (>1 year) to cold storage
3. **Read replicas** for analytics queries
4. **Caching layer** (Redis) for frequently accessed data

## Related Pages

- [[supabase]] - Backend provider and infrastructure
- [[security-architecture]] - RLS policies and access control
- [[zarii-ai]] - Core platform using this schema
