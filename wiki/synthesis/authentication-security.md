# Authentication & Security

Core authentication mechanisms and security patterns for [[zarii-ai]].

## Phone OTP Authentication Flow

ZARii AI uses phone-based OTP (One-Time Password) authentication to onboard farmers without requiring email or complex password management.

**Flow:**
1. Farmer enters phone number → `POST /api/auth/send-otp`
2. OTP generated cryptographically (6 digits, 10-minute expiry)
3. OTP sent via WhatsApp Business API (or logged in development)
4. Farmer enters OTP → `POST /api/auth/verify-otp`
5. Server validates OTP and returns JWT token
6. Farmer uses JWT for all subsequent requests

**Security:**
- OTP never returned in API responses (only sent via WhatsApp)
- OTP stored hashed in database (not plaintext)
- Rate limited to 10 requests per 15 minutes per IP
- 10-minute expiry window prevents brute force attacks

## JWT Token Generation and Expiration

After successful OTP verification, the server issues a JWT (JSON Web Token) that acts as the farmer's session credential.

**Token Structure:**
- Payload includes: `farmer_id`, `phone`, `iat` (issued at), `exp` (expiration)
- Signed with `JWT_SECRET` (stored in environment)
- 7-day expiration window (604,800 seconds)
- Refresh endpoint allows extending session without re-authentication

**Token Usage:**
- Included in `Authorization: Bearer <token>` header on all farmer requests
- Verified by `middleware/auth.js` on protected routes
- Expired tokens rejected with 401 Unauthorized
- Refresh endpoint (`POST /api/auth/refresh`) issues new token if current is valid

## Admin Authentication and Role-Based Access

Admin users authenticate separately with username/password and receive admin-specific JWT tokens.

**Admin Login:**
1. Admin enters username/password → `POST /api/admin/auth/login`
2. Password verified against bcrypt hash in database
3. Admin JWT issued with role claim (`role: 'admin'`)
4. Rate limited to 5 requests per 15 minutes per IP

**Role-Based Access Control (RBAC):**
- `middleware/adminAuth.js` verifies both JWT validity and admin role
- All `/api/admin/*` routes require admin JWT
- Admin routes include: overview, diagnoses, users, outbreaks, catalog, apiKeys, whatsapp, revenue, sponsors, team
- Future: Support for granular permissions (e.g., read-only, editor, owner)

## Security Best Practices

**Encryption at Rest:**
- API keys stored with AES-256 encryption in database
- Passwords hashed with bcrypt (10 salt rounds)
- Sensitive data never logged or exposed in error messages

**Transport Security:**
- HTTPS enforced in production (Vercel auto-enables)
- Helmet middleware adds security headers (CSP, X-Frame-Options, etc.)
- CORS restricted to whitelisted origins via `CORS_ORIGINS` env var

**Input Validation:**
- Phone numbers validated against E.164 format
- Image uploads validated for MIME type and size
- SSRF protection: Image URLs validated before server-side fetch (blocks private IPs, cloud metadata)
- Path traversal protection: Static file serving restricted to `uploads/` directory

**Rate Limiting:**
- Global: 100 requests per 15 minutes per IP
- Auth endpoints: 10 requests per 15 minutes per IP
- Admin login: 5 requests per 15 minutes per IP
- Implemented via `express-rate-limit` middleware

**Row-Level Security (RLS):**
- All 19 database tables have RLS policies enabled
- Farmers can only access their own diagnoses, voice history, and profile
- Admin queries use `service_role` key (bypasses RLS for admin operations)

**Token Expiry & Refresh:**
- JWT tokens expire after 7 days
- Refresh endpoint allows extending session without re-authentication
- Expired tokens cannot be refreshed (forces re-login)

## Related Pages
- [[security-architecture]]
- [[supabase]]
- [[zarii-ai]]
