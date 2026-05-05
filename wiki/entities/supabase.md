# Supabase

The backend infrastructure provider powering [[zarii-ai]]'s data layer, authentication, and real-time capabilities.

## Overview

[[supabase]] is an open-source Firebase alternative built on PostgreSQL 17. It provides:

- **PostgreSQL Database:** 19 tables with Row-Level Security (RLS) policies
- **Authentication:** Phone OTP and JWT token management
- **Storage:** Image uploads for leaf scans and diagnostic results
- **Real-time:** WebSocket subscriptions for live data updates
- **Edge Functions:** Serverless functions for background jobs

## Database Architecture

All 19 tables enforce RLS policies to ensure farmers see only their own data:

- `users` — Farmer profiles with language, region, crops, premium status
- `scans` — Leaf disease diagnosis history with AI provider tracking
- `voice_queries` — Voice Q&A transcripts and responses
- `catalog` — Pesticide/fertilizer products with PKR pricing
- `treatments` — Recommended treatments linked to scans
- `otp_sessions` — Phone OTP verification
- `outbreaks` — Disease alerts by district
- `admin_users` — Admin accounts with bcrypt-hashed passwords
- `api_keys` — Encrypted API keys for integrations
- `sponsored_products` — Sponsored pesticide listings
- `advisories` — Regional disease advisories
- `wa_conversations` — WhatsApp conversation history
- `revenue_events` — Revenue tracking for sponsors
- `subscriptions` — Premium subscription records
- `audit_log` — Admin action audit trail
- `failover_events` — AI provider failover tracking
- `api_usage` — API call tracking and cost
- `waitlist` — WhatsApp coming-soon signups
- `sponsors` — Sponsor/partner information

## Authentication

Supabase handles phone OTP authentication:

1. Farmer enters phone number
2. OTP sent via WhatsApp (or logged in dev)
3. Farmer verifies OTP
4. JWT token returned (7-day expiry)
5. All subsequent requests include JWT in Authorization header

Admin authentication uses username/password with bcrypt hashing.

## Storage

Supabase Storage hosts:

- Leaf scan images (uploaded by farmers)
- Diagnostic result images
- Temporary files (cleaned up after processing)

All storage access is protected by RLS policies and JWT authentication.

## Real-time Subscriptions

Farmers receive live updates via WebSocket:

- New disease alerts in their region
- Weather warnings
- Outbreak notifications
- Sponsored product recommendations

## Migrations

Database schema changes are managed via `backend/db/migrate.js`:

- Migrations run automatically on server startup
- Idempotent design (safe to run multiple times)
- Version tracking prevents duplicate runs
- Rollback capability for emergency situations

## Related Concepts

- [[zarii-ai]] — Main platform
- [[security-architecture]] — RLS policies and encryption
- [[database-architecture]] — Schema design and optimization
