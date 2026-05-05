// Only load .env if not on Vercel
if (!process.env.VERCEL) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
}

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_VERCEL = !!process.env.VERCEL;

function requireSecret(name) {
  const val = process.env[name];
  if (!val) {
    // On Vercel, use defaults for dev but warn
    if (IS_VERCEL) {
      console.warn(`Missing ${name}, using default (API keys from Supabase DB)`);
      return `vercel-dev-${name}-${Date.now()}`;
    }
    return val || `dev-only-${name}-${Date.now()}`;
  }
  return val;
}

module.exports = {
  NODE_ENV,
  PORT: parseInt(process.env.PORT || process.env.BACKEND_PORT || '5000', 10),
  JWT_SECRET: requireSecret('JWT_SECRET'),
  JWT_EXPIRY: '7d',
  ADMIN_JWT_SECRET: requireSecret('ADMIN_JWT_SECRET'),
  APP_URL: process.env.APP_URL || (IS_VERCEL ? 'https://zarii-ai.vercel.app' : 'http://localhost:5173'),

  AI: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY || '',
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION || 'eastus',
  },

  WEATHER: {
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
  },

  WHATSAPP: {
    ACCESS_TOKEN: process.env.WA_ACCESS_TOKEN || '',
    PHONE_NUMBER_ID: process.env.WA_PHONE_NUMBER_ID || '',
    VERIFY_TOKEN: process.env.WA_VERIFY_TOKEN || '',
  },

  UPLOAD_DIR: require('path').join(__dirname, '../uploads'),
  GOOGLE_INDEXING_CREDENTIALS: process.env.GOOGLE_INDEXING_CREDENTIALS || '',
  CORS_ORIGINS: process.env.CORS_ORIGINS || (NODE_ENV === 'production' ? '' : '*'),
};
