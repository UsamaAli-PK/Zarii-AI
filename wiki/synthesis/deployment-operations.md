# Deployment & Operations

Deployment strategy, infrastructure setup, and operational procedures for [[zarii-ai]].

## Vercel Deployment Setup

ZARii AI is deployed on Vercel, which provides serverless Node.js runtime, automatic HTTPS, and global CDN for static assets.

**Deployment Process:**
1. Push code to GitHub repository
2. Vercel automatically detects changes and builds
3. `npm install` runs to install dependencies
4. `node backend/server.js` starts the Express server
5. Frontend static files served from CDN
6. Supabase Storage handles image uploads (not local filesystem)

**Build Configuration:**
- Framework: Node.js
- Build command: None (dependencies installed, server starts directly)
- Start command: `node backend/server.js`
- Environment: Production (NODE_ENV=production)

**Advantages:**
- Zero-downtime deployments
- Automatic SSL/TLS certificates
- Global edge network for low latency
- Integrated with GitHub for CI/CD

## Environment Variables and Secrets Management

All sensitive configuration is managed via environment variables, never hardcoded in source code.

**Required Variables:**
- `JWT_SECRET` — Secret key for signing farmer JWT tokens
- `ADMIN_JWT_SECRET` — Secret key for signing admin JWT tokens
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key for admin operations (bypasses RLS)

**AI Provider Keys:**
- `GEMINI_API_KEY` — Google Gemini API key (primary vision provider)
- `OPENAI_API_KEY` — OpenAI API key (fallback vision provider)

**Optional Services:**
- `ELEVENLABS_API_KEY` — ElevenLabs for Urdu text-to-speech
- `AZURE_SPEECH_KEY` / `AZURE_SPEECH_REGION` — Azure Speech Services (alternative TTS)
- `OPENWEATHER_API_KEY` — Weather data for disease risk correlation
- `WA_ACCESS_TOKEN` — WhatsApp Business API token
- `WA_PHONE_NUMBER_ID` — WhatsApp phone number ID
- `WA_VERIFY_TOKEN` — Webhook verification token
- `GOOGLE_INDEXING_CREDENTIALS` — JSON credentials for Google Indexing API (SEO)
- `CORS_ORIGINS` — Comma-separated list of allowed origins

**Secrets Management:**
- Set variables in Vercel dashboard (Project Settings → Environment Variables)
- Never commit `.env` files to Git
- Use `.env.example` to document required variables
- Rotate API keys regularly (especially WhatsApp and AI provider keys)

## Supabase Storage for Image Uploads

Images are stored in Supabase Storage (S3-compatible object storage), not on the server filesystem.

**Upload Flow:**
1. Farmer uploads leaf image → `POST /api/diagnose`
2. Image validated (MIME type, size limit)
3. Image uploaded to Supabase Storage bucket `diagnoses/`
4. Storage URL returned and stored in database
5. URL passed to AI provider for vision analysis

**Storage Configuration:**
- Bucket: `diagnoses` (public read, authenticated write)
- Path structure: `diagnoses/{farmer_id}/{timestamp}-{filename}`
- Retention: Images kept indefinitely (consider archival policy)
- CDN: Supabase CDN caches images globally

**Benefits:**
- Scales beyond server storage limits
- Global CDN reduces latency
- Automatic backups via Supabase
- Decouples storage from compute

## Cron Jobs and Background Tasks

Vercel Cron Triggers invoke background jobs on a schedule via `GET /api/cron`.

**Scheduled Jobs:**
1. **Disease Outbreak Detection** (hourly)
   - Analyzes recent diagnoses for regional spikes (300% threshold)
   - Triggers alerts to farmers in affected areas
   - Updates `outbreaks` table

2. **Weather-Disease Correlation** (daily)
   - Fetches weather data from OpenWeather API
   - Correlates with disease patterns
   - Sends proactive alerts to at-risk farmers

3. **Churn Risk Scoring** (weekly)
   - Identifies inactive farmers
   - Sends re-engagement messages via WhatsApp
   - Tracks retention metrics

**Cron Configuration:**
- Defined in `vercel.json` with cron expressions
- Example: `"0 * * * *"` runs hourly
- Endpoint: `GET /api/cron?token={CRON_SECRET}`
- Token verified to prevent unauthorized invocation

## Monitoring and Alerting

**Logging:**
- Vercel Logs: Real-time logs accessible in Vercel dashboard
- Supabase Logs: Database query logs, API logs, auth logs
- Application Logs: Structured logging via `console.log()` (captured by Vercel)

**Error Tracking:**
- Unhandled errors logged with stack traces
- AI provider failures logged with fallback chain status
- Database errors logged with query context

**Metrics to Monitor:**
- Request latency (p50, p95, p99)
- Error rate (5xx, 4xx by endpoint)
- AI provider success rate (Gemini vs OpenAI)
- Database query performance
- Storage usage (Supabase Storage)
- WhatsApp delivery rate

**Alerting:**
- Set up Vercel alerts for deployment failures
- Monitor Supabase for database performance issues
- Track AI provider status pages for outages
- Manual review of error logs weekly

## Related Pages
- [[supabase]]
- [[zarii-ai]]
- [[security-architecture]]
