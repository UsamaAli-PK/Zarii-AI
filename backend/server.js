const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { runMigrations } = require('./db/migrate');

const app = express();

// ─── Trust Replit's proxy (required for rate limiting) ─────────
app.set('trust proxy', 1);

// ─── Security headers ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now (CDN React requires it off)
  crossOriginEmbedderPolicy: false,
}));

// ─── CORS: Restrict to configured origins ───────────────────────
const corsOrigins = config.CORS_ORIGINS;
app.use(cors({
  origin: corsOrigins === '*' ? '*' : corsOrigins.split(',').map(s => s.trim()),
  credentials: corsOrigins !== '*',
}));

// ─── Global rate limiting ───────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', globalLimiter);

// ─── Strict rate limiting for auth endpoints ────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Only 10 OTP attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again later' },
});
app.use('/api/auth/', authLimiter);

// ─── Strict rate limiting for admin login ───────────────────────
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // Temporarily increased for testing
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, account temporarily locked' },
});
app.use('/api/admin/auth/', adminAuthLimiter);

// Raw body for WhatsApp webhooks, JSON for everything else
app.use((req, res, next) => {
  const isWebhook = req.method === 'POST' &&
    (req.path === '/whatsapp' || req.path.endsWith('/whatsapp'));
  if (isWebhook) return next();
  express.json({ limit: '20mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ─── Uploads ─────────────────────────────────────────────────
// On Vercel, we use Supabase Storage directly, but locally we ensure the dir exists
if (!process.env.VERCEL && !fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

// Protect farmer leaf scan uploads — require valid farmer or admin JWT
const jwt = require('jsonwebtoken');
app.use('/uploads', (req, res, next) => {
  // Allow logo, favicon and other public non-scan assets by filename
  const file = path.basename(req.path);
  const isPublicAsset = /^(logo|icon|brand|placeholder|favicon)\.(png|jpg|jpeg|webp|svg|ico)$/i.test(file);
  if (isPublicAsset) return next();

  // All other uploads require a valid token (farmer or admin)
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.query.token;
  if (!token) return res.status(401).json({ error: 'Auth required to access uploads' });
  try {
    jwt.verify(token, config.JWT_SECRET);
    next();
  } catch {
    try {
      jwt.verify(token, config.ADMIN_JWT_SECRET);
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}, express.static(config.UPLOAD_DIR));

// ─── Serve frontend static files (js, css, assets, etc.) ─────
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend-assets');
app.use(express.static(FRONTEND_DIR, {
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
    else if (filePath.match(/\.(js|jsx|css)$/)) res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  },
}));

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      vision_ai: !!(config.AI.GEMINI_API_KEY || config.AI.OPENAI_API_KEY),
      voice_stt: !!config.AI.OPENAI_API_KEY,
      tts: !!config.AI.ELEVENLABS_API_KEY,
      weather: !!config.WEATHER.OPENWEATHER_API_KEY,
      whatsapp: !!config.WHATSAPP.ACCESS_TOKEN,
    },
  });
});

// ─── Farmer routes ────────────────────────────────────────────
app.use('/api', require('./routes/cron'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/diagnose', require('./routes/diagnose'));
app.use('/api/history', require('./routes/history'));
app.use('/api/voice', require('./routes/voice'));
app.use('/api', require('./routes/dashboard'));
app.use('/api/waitlist', require('./routes/waitlist'));

// ─── WhatsApp webhook ─────────────────────────────────────────
const webhookRouter = require('./routes/webhook');
app.use('/webhooks', webhookRouter);
app.use('/webhook', webhookRouter);

// ─── Admin auth (public login endpoint) ──────────────────────
const teamRouter = require('./routes/admin/team');
app.post('/api/admin/auth/login', (req, res, next) => {
  req.url = '/login';
  teamRouter(req, res, next);
});
// Token verification — no adminAuthMiddleware (self-contained in /me handler)
app.get('/api/admin/auth/me', (req, res, next) => {
  req.url = '/me';
  teamRouter(req, res, next);
});

// ─── Admin routes (JWT-protected) ────────────────────────────
const { adminAuthMiddleware } = require('./middleware/adminAuth');
app.use('/api/admin/overview',   adminAuthMiddleware, require('./routes/admin/overview'));
app.use('/api/admin/users',      adminAuthMiddleware, require('./routes/admin/users'));
app.use('/api/admin/diagnoses',  adminAuthMiddleware, require('./routes/admin/diagnoses'));
app.use('/api/admin/outbreaks',  adminAuthMiddleware, require('./routes/admin/outbreaks'));
app.use('/api/admin/sponsors',   adminAuthMiddleware, require('./routes/admin/sponsors'));
app.use('/api/admin/revenue',    adminAuthMiddleware, require('./routes/admin/revenue'));
app.use('/api/admin/catalog',    adminAuthMiddleware, require('./routes/admin/catalog'));
app.use('/api/admin/api-keys',   adminAuthMiddleware, require('./routes/admin/apiKeys'));
app.use('/api/admin/whatsapp',   adminAuthMiddleware, require('./routes/admin/whatsapp'));
app.use('/api/admin/team',       adminAuthMiddleware, teamRouter);

// Audit log shortcut (/api/admin/audit-log without /team prefix)
app.get('/api/admin/audit-log', adminAuthMiddleware, (req, res, next) => {
  req.url = '/audit-log';
  teamRouter(req, res, next);
});

// ─── SEO / programmatic pages (SSR — must be before SPA fallback) ────────────
app.use('/', require('./seo/seoRoutes'));

// ─── SPA fallback & Redirection ──────────────────────────────

// Redirect /admin to the SPA's admin entry point
app.get('/admin', (req, res) => res.redirect('/#admin'));

// Explicit 404 for API routes to prevent falling through to SPA HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
});

// SPA fallback (MUST be after all API and SEO routes)
app.get(/^\/(?!api\/|uploads\/|webhook).*$/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// ─── Error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large (max 10MB)' });
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const { startCronJobs } = require('./services/cronJobs');

runMigrations().then(() => {
  // Only start cron jobs if not running in a Vercel serverless environment
  if (!process.env.VERCEL) {
    startCronJobs();
  }
}).catch(err => console.error('Migration failed:', err));

if (process.env.VERCEL) {
  // Export the Express app for Vercel Serverless Functions
  module.exports = app;
} else {
  // Standard local Node server
  app.listen(config.PORT, '0.0.0.0', () => {
    const port = config.PORT;
    console.log(`\n🌿 ZARii AI — unified server on port ${port}`);
    console.log(`   App:     http://localhost:${port}/`);
    console.log(`   API:     http://localhost:${port}/api/health`);
    console.log(`   Admin:   http://localhost:${port}/#admin`);
    console.log(`   Vision:  ${config.AI.GEMINI_API_KEY ? '✓ Gemini' : config.AI.OPENAI_API_KEY ? '✓ GPT-4o' : '⚠ mock'}`);
    console.log(`   Weather: ${config.WEATHER.OPENWEATHER_API_KEY ? '✓ Live' : '⚠ mock'}`);
    console.log(`   WhatsApp:${config.WHATSAPP.ACCESS_TOKEN ? '✓ Connected' : '⚠ not configured'}\n`);
  });
}
