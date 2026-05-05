# Technical Debt

Known issues, performance bottlenecks, and refactoring opportunities in ZARii AI.

## Current Technical Debt

### 1. Frontend Build Pipeline (High Priority)
**Issue**: React loaded from CDN with Babel standalone transpilation
- **Impact**: 2-3s slower page load, no tree-shaking, large bundle size
- **Workaround**: Works for MVP but not production-grade
- **Refactor**: Migrate to Next.js or Vite for proper build optimization
- **Effort**: 2-3 weeks
- **Benefit**: 40% faster load time, better SEO, code splitting

### 2. Image Processing (High Priority)
**Issue**: No image compression before sending to AI providers
- **Impact**: 10MB images sent to Gemini/OpenAI; wastes bandwidth and increases latency
- **Current**: Images stored uncompressed in Supabase Storage
- **Refactor**: Add Sharp.js pipeline to compress to 500KB max before upload
- **Effort**: 1 week
- **Benefit**: 50% cost reduction, 30% faster diagnosis

### 3. Database Query N+1 Problems (Medium Priority)
**Issue**: Dashboard queries fetch user data, then loop through scans to fetch disease names
- **Impact**: 50+ queries for a single dashboard load
- **Location**: `backend/routes/dashboard.js` and `backend/routes/history.js`
- **Refactor**: Use PostgreSQL JOINs and aggregations instead of application-level loops
- **Effort**: 3-4 days
- **Benefit**: 10x faster dashboard load (from 2s to 200ms)

### 4. Voice STT Latency (Medium Priority)
**Issue**: OpenAI Whisper API adds 2-3s latency per audio file
- **Impact**: Users wait 3-5s for transcription; poor UX
- **Current**: No streaming, full file upload required
- **Refactor**: Implement streaming STT with Azure Speech Services or local Whisper
- **Effort**: 1-2 weeks
- **Benefit**: Real-time transcription feedback, 50% latency reduction

### 5. RLS Policy Complexity (Medium Priority)
**Issue**: 19 tables with RLS policies; some policies are overly permissive
- **Impact**: Potential data leakage if policy logic has bugs
- **Example**: `advisories` table allows farmers to see all advisories (correct), but `scans` table has complex user_id checks
- **Refactor**: Audit all RLS policies, add test suite for edge cases
- **Effort**: 1 week
- **Benefit**: Reduced security risk, easier maintenance

### 6. Admin Authentication (Low Priority)
**Issue**: Admin passwords stored as bcrypt hashes; no 2FA, no session management
- **Impact**: Compromised admin account = full database access
- **Refactor**: Add 2FA (TOTP), session tokens, IP whitelisting
- **Effort**: 1 week
- **Benefit**: Enterprise-grade security for admin panel

### 7. API Rate Limiting (Low Priority)
**Issue**: Global rate limit (100 req/15min) too loose; no per-endpoint limits
- **Impact**: Brute force attacks on auth endpoints possible
- **Current**: `express-rate-limit` with single middleware
- **Refactor**: Implement per-endpoint limits (auth: 10/15min, diagnose: 50/15min)
- **Effort**: 2-3 days
- **Benefit**: Better DDoS protection, clearer API contracts

## Performance Bottlenecks

### Diagnosis Latency Breakdown
```
Image Upload:        200ms (network)
Image Compression:   300ms (Sharp.js)
Gemini API Call:   1,200ms (AI processing)
Database Insert:     100ms (Supabase)
WhatsApp Send:       500ms (async)
─────────────────────────────
Total:             2,300ms (current)
Target:            1,200ms (with optimizations)
```

### Dashboard Load Breakdown
```
Auth Check:          50ms
Fetch User:         100ms
Fetch Scans (N+1): 1,500ms (50 queries)
Fetch Weather:      300ms
Render HTML:        200ms
─────────────────────────────
Total:             2,150ms (current)
Target:              400ms (with JOINs)
```

## Refactoring Opportunities

### 1. Consolidate AI Router (Medium Effort)
**Current**: `aiRouter.js` has separate functions for Gemini, OpenAI, mock
**Refactor**: Create abstract `AIProvider` class with unified interface
**Benefit**: Easier to add new providers (Claude, Llama), cleaner code

### 2. Extract Voice Service (Medium Effort)
**Current**: Voice logic scattered across `routes/voice.js` and `services/`
**Refactor**: Create `VoiceService` class with STT, TTS, Q&A methods
**Benefit**: Reusable across WhatsApp, web, mobile

### 3. Migrate to TypeScript (High Effort)
**Current**: Pure JavaScript, no type safety
**Refactor**: Gradual migration to TypeScript (start with services/)
**Benefit**: Fewer runtime errors, better IDE support, easier refactoring

### 4. Extract Supabase Queries (Medium Effort)
**Current**: Raw SQL queries scattered across routes
**Refactor**: Create query builder or ORM layer (e.g., Prisma)
**Benefit**: Type-safe queries, easier migrations, less boilerplate

### 5. Separate Admin Routes (Low Effort)
**Current**: 10 admin modules in `routes/admin/`
**Refactor**: Move to separate Express app or monorepo package
**Benefit**: Cleaner separation of concerns, easier to scale

## Testing Gaps

- **Unit Tests**: None (0% coverage)
- **Integration Tests**: None
- **E2E Tests**: Manual testing only
- **Load Tests**: No performance benchmarks

**Recommendation**: Implement Jest + Supertest for API testing (1-2 weeks)

## Security Debt

1. **SSRF Protection**: Current validation is good but could be more robust
2. **CORS**: Hardcoded origins; should use environment-based config
3. **Helmet**: CSP disabled for CDN React; should enable with nonce
4. **Secrets**: API keys in `.env`; should use Supabase Vault or AWS Secrets Manager

## Prioritization Matrix

| Item | Effort | Impact | Priority |
|------|--------|--------|----------|
| Image Compression | 1 week | High (cost) | 1 |
| Frontend Build | 2-3 weeks | High (UX) | 2 |
| N+1 Queries | 3-4 days | High (perf) | 3 |
| Voice Streaming | 1-2 weeks | Medium (UX) | 4 |
| RLS Audit | 1 week | Medium (security) | 5 |
| Admin 2FA | 1 week | Medium (security) | 6 |
| Rate Limiting | 2-3 days | Low (security) | 7 |

## Related Pages

- [[zarii-ai]] - Core platform
- [[database-architecture]] - Schema and optimization
- [[security-architecture]] - Security model and policies
