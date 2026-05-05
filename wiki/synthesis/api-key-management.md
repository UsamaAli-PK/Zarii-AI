# API Key Management

Encryption, rotation, and lifecycle management of API keys for [[zarii-ai]].

## AES-256 Encryption at Rest

All API keys stored in the database are encrypted using AES-256 (Advanced Encryption Standard with 256-bit keys) to protect against database breaches.

**Encryption Process:**
1. API key received from admin via secure form
2. Key encrypted using `crypto.createCipheriv()` with AES-256-GCM
3. Initialization Vector (IV) generated randomly for each key
4. Authentication tag (GCM) prevents tampering
5. Encrypted key + IV + tag stored in database

**Decryption Process:**
1. Encrypted key retrieved from database
2. IV and authentication tag extracted
3. Key decrypted using `crypto.createDecipheriv()` with same secret
4. Decrypted key used for API calls (never logged or exposed)

**Security Properties:**
- 256-bit key size (2^256 possible keys, computationally infeasible to brute force)
- GCM mode provides authenticated encryption (detects tampering)
- Random IV per key prevents pattern analysis
- Encryption key stored in environment variable (`ENCRYPTION_KEY`)
- Encryption key never stored in database

**Implementation:**
- Service: `backend/services/apiKeys.js`
- Functions: `encryptKey()`, `decryptKey()`
- Used for: Gemini API key, OpenAI API key, WhatsApp token, etc.

## Key Rotation Strategy

API keys are rotated periodically to limit exposure window if a key is compromised.

**Rotation Schedule:**
- **AI Provider Keys** (Gemini, OpenAI): Quarterly (every 3 months)
- **WhatsApp Token**: Quarterly or on provider request
- **Admin Passwords**: Annually (or on employee departure)
- **JWT Secrets**: Annually (or on security incident)

**Rotation Process:**
1. Generate new API key from provider (Gemini, OpenAI, WhatsApp)
2. Admin adds new key via admin panel (`POST /api/admin/apiKeys`)
3. New key encrypted and stored in database
4. Mark old key as "deprecated" (keep for 7 days for grace period)
5. Update environment variable or application config
6. Restart server to use new key
7. Delete old key after grace period

**Grace Period:**
- 7-day window allows for rollback if new key is invalid
- Requests can use either old or new key during grace period
- Monitoring alerts if old key is still in use after 7 days

**Automation:**
- Calendar reminders for quarterly rotations
- Automated key generation for some providers (e.g., GitHub tokens)
- Audit log tracks all key changes (who, when, which key)

## Admin Panel for Key Management

The admin dashboard provides a secure interface for managing API keys without exposing them in code.

**Admin Panel Features:**
- **View Keys**: List all stored keys (masked, only last 4 chars visible)
- **Add Key**: Encrypt and store new key
- **Update Key**: Replace existing key (old key deprecated)
- **Delete Key**: Remove key (only after grace period)
- **Test Key**: Verify key is valid by making test API call
- **Audit Log**: View history of all key changes

**Key Display:**
- Keys never displayed in full (only last 4 characters)
- Example: `sk-proj-...****` (Gemini key)
- Prevents accidental exposure in screenshots or logs

**Access Control:**
- Only admin users can access key management
- Admin JWT required for all key operations
- Rate limited to 5 requests per 15 minutes per IP
- All key operations logged with admin username and timestamp

**Testing:**
- "Test Key" button makes sample API call to verify key works
- Example: Test Gemini key by sending sample image
- Helps catch invalid keys before they cause production issues

## Security Considerations

**Key Storage:**
- Never store keys in source code or `.env` files
- Never log keys in application logs
- Never send keys in API responses
- Never expose keys in error messages

**Key Access:**
- Only backend server has access to encryption key
- Frontend never sees unencrypted API keys
- Admin panel uses HTTPS (enforced by Vercel)
- Admin JWT required for all key operations

**Key Compromise:**
- If key is compromised, rotate immediately (don't wait for quarterly schedule)
- Revoke compromised key from provider (e.g., Gemini console)
- Check logs for unauthorized API usage
- Update audit log with incident details

**Backup and Recovery:**
- Supabase automated backups include encrypted keys
- Encryption key stored separately in environment (not in backup)
- Recovery requires both backup and encryption key
- Test recovery procedure quarterly

**Compliance:**
- Encryption at rest meets GDPR and SOC 2 requirements
- Key rotation aligns with security best practices
- Audit logs enable compliance audits
- No plaintext keys ever stored or transmitted

## Related Pages
- [[security-architecture]]
- [[supabase]]
- [[authentication-security]]
