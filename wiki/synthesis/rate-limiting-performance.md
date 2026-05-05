# Rate Limiting & Performance

Rate limiting strategy and performance optimization for [[zarii-ai]].

## User Daily Image Limit
Each farmer account is limited to **2 image diagnoses per day**.
- **Enforced at**: API level (diagnose.js) and database level (Supabase trigger)
- **Error**: 429 "Daily image limit reached (2/day). Come back tomorrow."
- **Reset**: Daily at midnight UTC

## Global Rate Limiting

A global rate limit of 100 requests per 15 minutes per IP address protects the server from abuse and ensures fair resource allocation.

**Implementation:**
- Middleware: `express-rate-limit` with in-memory store
- Window: 15 minutes (900 seconds)
- Limit: 100 requests per IP
- Applied to all routes except health checks

**Behavior:**
- Requests exceeding limit receive 429 Too Many Requests
- Response includes `Retry-After` header (seconds until reset)
- Rate limit counters reset every 15 minutes
- IP address determined from `X-Forwarded-For` header (Vercel proxy)

**Exceptions:**
- Health check endpoint (`GET /health`) not rate limited
- Webhook endpoints rate limited separately (see below)

## Auth Endpoint Rate Limiting

Authentication endpoints have stricter rate limits to prevent credential stuffing and OTP brute force attacks.

**OTP Send Endpoint (`POST /api/auth/send-otp`):**
- Limit: 10 requests per 15 minutes per IP
- Prevents spam and OTP exhaustion
- Logs suspicious patterns (multiple OTPs for same phone)

**OTP Verify Endpoint (`POST /api/auth/verify-otp`):**
- Limit: 10 requests per 15 minutes per IP
- Prevents brute force guessing (6-digit OTP = 1M combinations)
- Combined with OTP expiry (10 minutes) for defense in depth

**Token Refresh Endpoint (`POST /api/auth/refresh`):**
- Limit: 10 requests per 15 minutes per IP
- Prevents token refresh abuse

**Rationale:**
- Farmers typically send 1 OTP per login (1-2 per day)
- 10 requests per 15 minutes allows for legitimate retries
- Stricter than global limit to protect authentication layer

## Admin Endpoint Rate Limiting

Admin login endpoint has the strictest rate limit to prevent unauthorized access attempts.

**Admin Login Endpoint (`POST /api/admin/auth/login`):**
- Limit: 5 requests per 15 minutes per IP
- Prevents brute force password guessing
- Logs all failed attempts for security review

**Admin API Endpoints (`/api/admin/*`):**
- Limit: 50 requests per 15 minutes per IP (after authentication)
- Allows legitimate admin operations (bulk exports, dashboard queries)
- Stricter than farmer endpoints due to sensitive data access

**Rationale:**
- Admin login attempts are rare (1-2 per day per admin)
- 5 requests per 15 minutes allows for legitimate retries
- Failed attempts logged for intrusion detection

## Performance Optimization Strategies

**Database Query Optimization:**
- Indexes on frequently queried columns (farmer_id, created_at, phone)
- Pagination for large result sets (limit 100 per page)
- Connection pooling via Supabase (max 10 connections per client)
- Avoid N+1 queries (use JOINs instead of multiple queries)

**AI Provider Optimization:**
- **Rate Limit Failover**: When API returns 429 (rate limit), automatically tries next API key in pool until one works or all exhausted
- **No Mock Fallback**: If ALL providers fail, returns HTTP 503 "System temporarily unavailable" - NOT fake diagnosis data
- Caching of diagnosis results (same image hash = same result)
- Batch processing for outbreak detection (hourly, not per-request)
- Timeout: 30 seconds per AI request (fail fast)

**Image Optimization:**
- Resize images before upload (max 2MB, 1024x1024px)
- JPEG compression (quality 80) reduces storage and bandwidth
- Supabase CDN caches images globally
- Lazy loading on frontend (load images on demand)

**Frontend Optimization:**
- React loaded from CDN (no build step, instant updates)
- Babel standalone transpiles JSX on-the-fly
- Minified CSS and JavaScript
- Service worker for offline support (future)

**API Response Optimization:**
- Gzip compression enabled (express middleware)
- JSON responses include only necessary fields
- Pagination reduces payload size
- ETag headers for client-side caching

## Caching and CDN Considerations

**Supabase CDN:**
- Images cached globally with 1-year TTL
- Cache invalidation via URL versioning (timestamp in filename)
- Reduces bandwidth and latency for repeated image access

**Browser Caching:**
- Static assets (CSS, JS) cached with 1-year TTL
- API responses cached with `Cache-Control: no-cache` (validate with ETag)
- Service worker caches critical assets for offline access

**Database Query Caching:**
- Outbreak data cached for 1 hour (updated hourly anyway)
- Disease catalog cached for 24 hours (rarely changes)
- User profile cached for 5 minutes (balance freshness and performance)

**Cache Invalidation:**
- Manual invalidation via admin panel (clear cache button)
- Automatic invalidation on data updates (e.g., disease catalog edit)
- Time-based expiry for safety (prevent stale data)

## Monitoring Performance

**Key Metrics:**
- API response time (target: <500ms p95)
- AI provider latency (target: <10s p95)
- Database query time (target: <100ms p95)
- Image upload time (target: <5s p95)
- Frontend load time (target: <3s p95)

**Tools:**
- Vercel Analytics: Real-time performance metrics
- Supabase Logs: Database query performance
- Browser DevTools: Frontend performance profiling
- Lighthouse: SEO and accessibility audits

## Related Pages
- [[security-architecture]]
- [[database-architecture]]
- [[zarii-ai]]
