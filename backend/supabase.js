const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const NODE_ENV = process.env.NODE_ENV || 'development';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  if (NODE_ENV === 'production') {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in production');
  } else {
    console.warn('[Supabase] WARNING: Missing environment variables. Using placeholders for dev-mode rendering.');
  }
}

const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

module.exports = supabase;
