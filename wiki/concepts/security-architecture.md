# Security Architecture

The multi-layered security design protecting farmer data, API keys, and system integrity in [[zarii-ai]].

## Row-Level Security (RLS)

All 19 database tables enforce RLS policies via [[supabase]]:

- **diagnoses:** Farmers see only their own scans
- **voice_history:** Farmers see only their own voice interactions
- **users:** Farmers see only their own profile
- **alerts:** Farmers see only alerts for their location/crops
- **scan_history:** Farmers see only their own scan history
- **admin_logs:** Admins see only logs for their organization
- **api_keys:** Encrypted and RLS-protected by organization

RLS is enforced at the database layer, preventing unauthorized data access even if application logic is compromised.

## SSRF Protection

Image URLs are validated before server-side fetch to prevent Server-Side Request Forgery:

- Blocks private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
- Blocks cloud metadata endpoints (169.254.169.254)
- Blocks localhost and reserved ranges
- Allows only HTTP/HTTPS protocols
- Validates URL format before fetch

This prevents attackers from using the server to access internal resources or cloud credentials.

## JWT Expiration Enforcement

- **Farmer JWT:** 7-day maximum expiry
- **Admin JWT:** 7-day maximum expiry
- **Verification:** Every request checks token expiry
- **Refresh:** Farmers can refresh via `/api/auth/refresh-otp`
- **Revocation:** Logout invalidates token (stored in blacklist)

Expired tokens are rejected immediately; no grace period.

## OTP Security

One-Time Passwords are generated with cryptographic security:

- **Generation:** `crypto.randomBytes(3)` converted to 6-digit number
- **Entropy:** 1 million possible values (2^20 bits)
- **Storage:** Hashed with bcrypt before database storage
- **Expiry:** 10 minutes (configurable)
- **Never Returned:** OTP never included in API responses
- **Rate Limited:** 10 OTP attempts per 15 minutes per phone

## API Key Encryption

Third-party API keys (Gemini, OpenAI, ElevenLabs, etc.) are encrypted at rest:

- **Algorithm:** AES-256-GCM
- **Key Derivation:** PBKDF2 from master key
- **Storage:** Encrypted blob in `api_keys` table
- **Access:** Only decrypted when needed for API calls
- **Rotation:** Keys can be rotated without downtime

Encryption keys are stored in environment variables, never in code or database.

## Admin Password Hashing

Admin passwords are hashed with bcrypt:

- **Algorithm:** bcrypt with salt rounds = 12
- **Storage:** Hash only (plaintext never stored)
- **Verification:** Constant-time comparison
- **Reset:** Via secure token sent to email

Passwords are never logged or transmitted in plaintext.

## Rate Limiting

Three-tier rate limiting protects against abuse:

- **Global:** 100 requests per 15 minutes per IP
- **Auth Endpoints:** 10 OTP attempts per 15 minutes per phone
- **Admin Login:** 5 attempts per 15 minutes per IP

Rate limits are enforced via `express-rate-limit` middleware with Redis backing (in production).

## Additional Protections

- **Helmet:** Security headers (CSP, X-Frame-Options, etc.)
- **Path Traversal:** Static file serving restricted to `uploads/` directory
- **CORS:** Configured to allow only trusted origins
- **Input Validation:** All user inputs validated before processing
- **SQL Injection:** Parameterized queries via Supabase client
- **XSS Protection:** React auto-escapes content; CSP headers enabled

## Related Concepts

- [[zarii-ai]] — Main platform
- [[supabase]] — Database provider with RLS
- [[database-architecture]] — Schema and table design
