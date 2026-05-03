const router = require('express').Router();
const crypto = require('crypto');
const supabase = require('../../supabase');
const { requirePermission } = require('../../middleware/adminAuth');

const ENCRYPT_KEY = process.env.ENCRYPT_KEY || 'zarii-key-32-char-secret-padding!';
const KEY = crypto.scryptSync(ENCRYPT_KEY, 'salt', 32);

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
  return iv.toString('hex') + ':' + cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(text) {
  try {
    const [ivHex, enc] = text.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, Buffer.from(ivHex, 'hex'));
    return decipher.update(enc, 'hex', 'utf8') + decipher.final('utf8');
  } catch { return '[decryption error]'; }
}

function maskKey(key) {
  if (!key || key.length < 8) return '••••••••';
  return key.slice(0, 4) + '••••••••••••' + key.slice(-4);
}

// GET /api/admin/api-keys
router.get('/', async (req, res) => {
  try {
    const [{ data: keys }, { data: failovers }] = await Promise.all([
      supabase.from('api_keys').select('*').order('pool').order('priority'),
      supabase.from('failover_events').select('*').order('created_at', { ascending: false }).limit(10),
    ]);

    const grouped = { vision: [], voice: [], weather: [] };
    for (const k of (keys || [])) {
      if (grouped[k.pool]) {
        grouped[k.pool].push({ ...k, key_masked: maskKey(k.key_encrypted?.includes(':') ? decrypt(k.key_encrypted) : k.key_encrypted) });
      }
    }

    res.json({
      pools: grouped, failover_log: failovers || [],
      summary: {
        total_keys: (keys || []).length,
        healthy: (keys || []).filter(k => k.status === 'healthy').length,
        degraded: (keys || []).filter(k => k.status === 'degraded').length,
        down: (keys || []).filter(k => k.status === 'down').length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load API keys' });
  }
});

// POST /api/admin/api-keys
router.post('/', requirePermission('rotate_keys'), async (req, res) => {
  try {
    const { pool, provider, api_key, priority, weight, daily_quota, model_id, base_url } = req.body;
    if (!pool || !provider || !api_key) return res.status(400).json({ error: 'pool, provider, api_key required' });
    if (!['vision', 'voice', 'weather'].includes(pool)) return res.status(400).json({ error: 'pool must be vision|voice|weather' });
    const encrypted = encrypt(api_key);
    const { data } = await supabase.from('api_keys').insert({ pool, provider, key_encrypted: encrypted, priority: priority || 1, weight: weight || 50, daily_quota: daily_quota || null, status: 'healthy', model_id: model_id || null, base_url: base_url || null }).select('id').single();
    await supabase.from('audit_log').insert({ admin_id: req.admin?.id, admin_name: req.admin?.name, action: 'added API key', target: `${provider} (${pool})`, ip_address: req.ip });
    res.json({ id: data?.id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// PATCH /api/admin/api-keys/:id
router.patch('/:id', requirePermission('rotate_keys'), async (req, res) => {
  try {
    const { priority, weight, status, api_key, model_id, base_url } = req.body;
    const updates = {};
    if (priority !== undefined) updates.priority = priority;
    if (weight !== undefined) updates.weight = weight;
    if (status !== undefined) updates.status = status;
    if (model_id !== undefined) updates.model_id = model_id;
    if (base_url !== undefined) updates.base_url = base_url;
    if (api_key) updates.key_encrypted = encrypt(api_key);
    await supabase.from('api_keys').update(updates).eq('id', req.params.id);
    const { data: key } = await supabase.from('api_keys').select('provider, pool').eq('id', req.params.id).single();
    await supabase.from('audit_log').insert({ admin_id: req.admin?.id, admin_name: req.admin?.name, action: 'rotated API key', target: `${key?.provider} (${key?.pool})`, ip_address: req.ip });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

// DELETE /api/admin/api-keys/:id
router.delete('/:id', requirePermission('rotate_keys'), async (req, res) => {
  try {
    await supabase.from('api_keys').delete().eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

// POST /api/admin/api-keys/:id/test
router.post('/:id/test', requirePermission('rotate_keys'), async (req, res) => {
  try {
    const { data: key } = await supabase.from('api_keys').select('*').eq('id', req.params.id).single();
    if (!key) return res.status(404).json({ error: 'Key not found' });
    const decrypted = decrypt(key.key_encrypted);
    const start = Date.now();
    let ok = false, error = null;
    try {
      if (key.pool === 'vision' && key.provider.includes('Gemini')) {
        const fetch = require('node-fetch');
        const r = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${decrypted}`);
        ok = r.ok;
      } else if (key.pool === 'weather' && key.provider.includes('OpenWeather')) {
        const fetch = require('node-fetch');
        const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Lahore&appid=${decrypted}`);
        ok = r.ok;
      } else { ok = decrypted.length > 8; }
    } catch (err) { error = err.message; }
    const latency = Date.now() - start;
    await supabase.from('api_keys').update({ status: ok ? 'healthy' : 'down', latency_p95: latency, last_error: error }).eq('id', key.id);
    res.json({ ok, latency_ms: latency, error });
  } catch (err) {
    res.status(500).json({ error: 'Failed to test API key' });
  }
});

// GET /api/admin/api-keys/failovers
router.get('/failovers', async (req, res) => {
  try {
    const { data: events } = await supabase.from('failover_events').select('*').order('created_at', { ascending: false }).limit(20);
    res.json({ events: events || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load failover events' });
  }
});

module.exports = router;
