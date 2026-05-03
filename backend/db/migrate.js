/**
 * Supabase migration & seed runner.
 * Called once at server startup via runMigrations().
 * Uses the Supabase JS client (service role) — no direct pg connection needed.
 */
const supabase = require('../supabase');
const bcrypt = require('bcryptjs');

async function runMigrations() {
  console.log('[DB] Checking Supabase schema...');
  try {
    // Quick probe — if this returns data or an empty array, tables exist
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code === 'PGRST204') {
      // No rows — tables exist but empty, OK
    } else if (error) {
      console.warn('[DB] Schema check warning:', error.message);
      console.warn('[DB] → Please run backend/db/supabase-schema.sql in the Supabase SQL Editor.');
      return;
    }
    console.log('[DB] Schema OK');
    await seedDefaults();
  } catch (err) {
    console.error('[DB] Migration error:', err.message);
  }
}

async function seedDefaults() {
  // ── Catalog ──────────────────────────────────────────────────
  const { count: catalogCount } = await supabase.from('catalog').select('*', { count: 'exact', head: true });
  if (!catalogCount) {
    const products = [
      { name: 'Antracol 70 WP',   category: 'Fungicide',   company: 'Bayer',     pkr_price: '1,180', unit: 'per 500g',     dosage: '2.5 g/L water', is_sponsored: true },
      { name: 'Confidor 200 SL',  category: 'Insecticide', company: 'Bayer',     pkr_price: '980',   unit: 'per 250ml',    dosage: '0.5 ml/L',      is_sponsored: true },
      { name: 'Actara 25 WG',     category: 'Insecticide', company: 'Syngenta',  pkr_price: '2,200', unit: 'per 100g',     dosage: '0.4 g/L',       is_sponsored: true },
      { name: 'Ridomil Gold MZ',  category: 'Fungicide',   company: 'Syngenta',  pkr_price: '1,650', unit: 'per 500g',     dosage: '2 g/L',         is_sponsored: false },
      { name: 'Karate 2.5 EC',    category: 'Insecticide', company: 'Syngenta',  pkr_price: '720',   unit: 'per 250ml',    dosage: '0.8 ml/L',      is_sponsored: true },
      { name: 'Sarbex 5G',        category: 'Insecticide', company: 'Ali Akbar', pkr_price: '480',   unit: 'per 1kg',      dosage: '20 kg/acre',    is_sponsored: true },
      { name: 'Mancozeb 75 WP',   category: 'Fungicide',   company: 'Ali Akbar', pkr_price: '760',   unit: 'per kg',       dosage: '2 g/L',         is_sponsored: false },
      { name: 'Score 250 EC',     category: 'Fungicide',   company: 'Syngenta',  pkr_price: '2,400', unit: 'per L',        dosage: '0.5 ml/L',      is_sponsored: false },
      { name: 'Urea (46% N)',     category: 'Fertilizer',  company: 'Engro',     pkr_price: '4,200', unit: 'per 50kg bag', dosage: '50 kg/acre',    is_sponsored: false },
      { name: 'DAP',              category: 'Fertilizer',  company: 'FFC',       pkr_price: '11,200',unit: 'per 50kg bag', dosage: '50 kg/acre',    is_sponsored: false },
      { name: 'Endosulfan 35 EC', category: 'Insecticide', company: 'Generic',   pkr_price: null,    unit: null,           dosage: null,            is_sponsored: false, is_banned: true },
    ];
    await supabase.from('catalog').insert(products);
    console.log('[Seed] Catalog seeded');
  }

  // ── Sponsors ─────────────────────────────────────────────────
  const { count: sponsorCount } = await supabase.from('sponsors').select('*', { count: 'exact', head: true });
  if (!sponsorCount) {
    await supabase.from('sponsors').insert([
      { name: 'Bayer Pakistan',    pricing_model: 'CPM ₨480',       status: 'Active',  contract_start: '2026-01-01', contract_end: '2026-12-31' },
      { name: 'Syngenta',         pricing_model: 'Flat ₨350k/mo',  status: 'Active',  contract_start: '2026-03-01', contract_end: '2027-03-01' },
      { name: 'Ali Akbar Group',  pricing_model: 'CPC ₨18',        status: 'Active',  contract_start: '2026-02-01', contract_end: '2026-08-31' },
      { name: 'Engro Fertilizers',pricing_model: 'TBD',            status: 'Pending', contract_start: null,         contract_end: null },
    ]);
    console.log('[Seed] Sponsors seeded');
  }

  // ── Outbreaks ─────────────────────────────────────────────────
  const { count: outbreakCount } = await supabase.from('outbreaks').select('*', { count: 'exact', head: true });
  if (!outbreakCount) {
    await supabase.from('outbreaks').insert([
      { region: 'Multan, Punjab', disease: 'Whitefly',             crop: 'Cotton', pressure_level: 'Critical', farm_count: 1840, trend_pct: 312 },
      { region: 'Bahawalpur',     disease: 'Whitefly',             crop: 'Cotton', pressure_level: 'High',     farm_count: 920,  trend_pct: 210 },
      { region: 'Sahiwal',        disease: 'Bollworm',             crop: 'Cotton', pressure_level: 'High',     farm_count: 420,  trend_pct: 88  },
      { region: 'Faisalabad',     disease: 'Yellow Rust',          crop: 'Wheat',  pressure_level: 'Moderate', farm_count: 380,  trend_pct: 45  },
      { region: 'Hyderabad',      disease: 'Anthracnose',          crop: 'Mango',  pressure_level: 'Moderate', farm_count: 180,  trend_pct: 24  },
      { region: 'Sukkur',         disease: 'Bacterial Leaf Blight',crop: 'Rice',   pressure_level: 'Low',      farm_count: 95,   trend_pct: 12  },
    ]);
    console.log('[Seed] Outbreaks seeded');
  }

  // ── Admin user ────────────────────────────────────────────────
  const { count: adminCount } = await supabase.from('admin_users').select('*', { count: 'exact', head: true });
  if (!adminCount) {
    const hash = await bcrypt.hash('admin123', 10);
    await supabase.from('admin_users').insert({
      name: 'Hamza Ali', email: 'admin@zarii.ai', password_hash: hash, role: 'Owner',
    });
    console.log('[Seed] Admin user created: admin@zarii.ai / admin123');
  }
}

module.exports = { runMigrations };
