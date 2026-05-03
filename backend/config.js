require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// ─── Require critical secrets in production ────────────────────
const NODE_ENV = process.env.NODE_ENV || 'development';

function requireSecret(name) {
  const val = process.env[name];
  if (!val && NODE_ENV === 'production') {
    console.error(`FATAL: ${name} environment variable is required in production`);
    process.exit(1);
  }
  return val || `dev-only-${name}-${Date.now()}`;
}

module.exports = {
  NODE_ENV,
  PORT: parseInt(process.env.PORT || process.env.BACKEND_PORT || '5000', 10),
  JWT_SECRET: requireSecret('JWT_SECRET'),
  JWT_EXPIRY: '7d',
  ADMIN_JWT_SECRET: requireSecret('ADMIN_JWT_SECRET'),

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
