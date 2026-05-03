const router = require('express').Router();
const supabase = require('../../supabase');
const { requirePermission } = require('../../middleware/adminAuth');

// GET /api/admin/outbreaks
router.get('/', async (req, res) => {
  try {
    const [{ data: outbreaks }, { data: advisories }] = await Promise.all([
      supabase.from('outbreaks').select('*').order('pressure_level'),
      supabase.from('advisories').select('*, admin_users(name)').order('sent_at', { ascending: false }).limit(10),
    ]);

    const sorted = (outbreaks || []).sort((a, b) => {
      const order = { Critical: 1, High: 2, Moderate: 3 };
      return (order[a.pressure_level] || 4) - (order[b.pressure_level] || 4);
    });

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    res.json({
      outbreaks: sorted,
      advisories: (advisories || []).map(a => ({ ...a, regions: a.regions || [], sent_by: a.admin_users?.name })),
      summary: {
        active_outbreaks: sorted.filter(o => ['Critical', 'High'].includes(o.pressure_level)).length,
        districts_on_alert: 22,
        advisories_sent_7d: (advisories || []).filter(a => new Date(a.sent_at) > new Date(sevenDaysAgo)).length,
        avg_reach: 84000,
      },
    });
  } catch (err) {
    console.error('outbreaks error:', err);
    res.status(500).json({ error: 'Failed to load outbreaks' });
  }
});

// POST /api/admin/outbreaks
router.post('/', async (req, res) => {
  try {
    const { region, disease, crop, pressure_level, farm_count, trend_pct } = req.body;
    const { data } = await supabase.from('outbreaks').insert({ region, disease, crop, pressure_level, farm_count, trend_pct }).select('id').single();
    res.json({ id: data?.id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create outbreak' });
  }
});

// POST /api/admin/advisories
router.post('/advisories', requirePermission('send_advisories'), async (req, res) => {
  try {
    const { title, body_en, body_ur, regions, disease } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });

    const { data: advisory } = await supabase.from('advisories').insert({
      title, body_en, body_ur, regions: regions || [], disease,
      created_by: req.admin?.id, status: 'Active',
    }).select().single();

    await supabase.from('audit_log').insert({
      admin_id: req.admin?.id, admin_name: req.admin?.name,
      action: 'sent advisory', target: title, ip_address: req.ip,
    });

    res.json({ success: true, advisory: { ...advisory, regions: advisory.regions || [] } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send advisory' });
  }
});

// GET /api/admin/advisories
router.get('/advisories', async (req, res) => {
  try {
    const { data: advisories } = await supabase.from('advisories').select('*').order('sent_at', { ascending: false });
    res.json({ advisories: (advisories || []).map(a => ({ ...a, regions: a.regions || [] })) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load advisories' });
  }
});

module.exports = router;
