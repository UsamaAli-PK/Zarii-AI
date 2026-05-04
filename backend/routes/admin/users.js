const router = require('express').Router();
const supabase = require('../../supabase');
const { requirePermission } = require('../../middleware/adminAuth');

// GET /api/admin/users
router.get('/', requirePermission('view_users'), async (req, res) => {
  try {
    const { search, region, channel, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);

    let query = supabase.from('users').select('*', { count: 'exact' });
    if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    if (region) query = query.eq('region', region);
    if (channel) query = query.eq('channel', channel);
    query = query.order('created_at', { ascending: false }).range(offset, offset + lim - 1);

    const { data: users, count: total } = await query;

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const [{ data: wauData }, { data: mauData }] = await Promise.all([
      supabase.from('scans').select('user_id').gt('created_at', sevenDaysAgo),
      supabase.from('scans').select('user_id').gt('created_at', thirtyDaysAgo),
    ]);
    const wau = new Set((wauData || []).map(r => r.user_id)).size;
    const mau = new Set((mauData || []).map(r => r.user_id)).size;

    const enriched = await Promise.all((users || []).map(async u => {
      const [{ count: scan_count }, { count: voice_count }, { data: lastScanData }] = await Promise.all([
        supabase.from('scans').select('*', { count: 'exact', head: true }).eq('user_id', u.id),
        supabase.from('voice_queries').select('*', { count: 'exact', head: true }).eq('user_id', u.id),
        supabase.from('scans').select('created_at').eq('user_id', u.id).order('created_at', { ascending: false }).limit(1),
      ]);
      return { ...u, crops: u.crops || [], premium: !!u.premium, scan_count: scan_count || 0, voice_count: voice_count || 0, last_scan: lastScanData?.[0]?.created_at || null };
    }));

    res.json({
      users: enriched,
      pagination: { page: parseInt(page), limit: lim, total: total || 0 },
      summary: { total: total || 0, wau: wau, mau: mau },
    });
  } catch (err) {
    console.error('admin users error:', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// GET /api/admin/users/:id
router.get('/:id', async (req, res) => {
  try {
    const { data: user } = await supabase.from('users').select('*').eq('id', req.params.id).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [{ data: scans }, { data: voices }, { data: sub }] = await Promise.all([
      supabase.from('scans').select('id, crop_type, disease_name, confidence, severity, created_at, user_feedback').eq('user_id', req.params.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('voice_queries').select('id, transcript, answer, lang, created_at').eq('user_id', req.params.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('subscriptions').select('*').eq('user_id', req.params.id).eq('status', 'active').limit(1),
    ]);

    res.json({ ...user, crops: user.crops || [], premium: !!user.premium, subscription: sub?.[0] || null, scan_history: scans || [], voice_history: voices || [] });
  } catch (err) {
    console.error('admin user detail error:', err);
    res.status(500).json({ error: 'Failed to load user' });
  }
});

// PATCH /api/admin/users/:id/churn-risk
router.patch('/:id/churn-risk', requirePermission('view_users'), async (req, res) => {
  try {
    const { churn_risk } = req.body;
    await supabase.from('users').update({ churn_risk }).eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update churn risk' });
  }
});

module.exports = router;
