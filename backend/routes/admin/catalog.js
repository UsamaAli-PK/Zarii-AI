const router = require('express').Router();
const supabase = require('../../supabase');
const { requirePermission } = require('../../middleware/adminAuth');

// GET /api/admin/catalog
router.get('/', requirePermission('view_catalog'), async (req, res) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);

    let query = supabase.from('catalog').select('*, sponsors(name)', { count: 'exact' });
    if (search) query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%`);
    if (category) query = query.eq('category', category);
    query = query.order('is_sponsored', { ascending: false }).order('name').range(offset, offset + lim - 1);

    const { data: items, count: total } = await query;
    const [{ count: sponsored }, { count: banned }, { data: prompts }] = await Promise.all([
      supabase.from('catalog').select('*', { count: 'exact', head: true }).eq('is_sponsored', true),
      supabase.from('catalog').select('*', { count: 'exact', head: true }).eq('is_banned', true),
      supabase.from('prompts').select('*').order('status', { ascending: false }),
    ]);

    res.json({
      items: (items || []).map(i => ({ ...i, sponsor_name: i.sponsors?.name })),
      pagination: { page: parseInt(page), limit: lim, total: total || 0 },
      summary: { total: total || 0, sponsored: sponsored || 0, banned: banned || 0 },
      prompts: prompts || [],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load catalog' });
  }
});

// POST /api/admin/catalog
router.post('/', requirePermission('edit_catalog'), async (req, res) => {
  try {
    const { name, category, company, pkr_price, unit, dosage } = req.body;
    if (!name || !category || !company) return res.status(400).json({ error: 'name, category, company required' });
    const { data } = await supabase.from('catalog').insert({ name, category, company, pkr_price, unit, dosage }).select('id').single();
    await supabase.from('audit_log').insert({ admin_id: req.admin?.id, admin_name: req.admin?.name, action: 'added product', target: name, ip_address: req.ip });
    res.json({ id: data?.id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create catalog item' });
  }
});

// PATCH /api/admin/catalog/:id
router.patch('/:id', requirePermission('edit_catalog'), async (req, res) => {
  try {
    const { name, category, company, pkr_price, unit, dosage, is_banned } = req.body;
    const updates = { last_price_refresh: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (category !== undefined) updates.category = category;
    if (company !== undefined) updates.company = company;
    if (pkr_price !== undefined) updates.pkr_price = pkr_price;
    if (unit !== undefined) updates.unit = unit;
    if (dosage !== undefined) updates.dosage = dosage;
    if (is_banned !== undefined) updates.is_banned = !!is_banned;
    await supabase.from('catalog').update(updates).eq('id', req.params.id);
    if (is_banned) {
      await supabase.from('audit_log').insert({ admin_id: req.admin?.id, admin_name: req.admin?.name, action: 'banned product', target: `catalog #${req.params.id}`, ip_address: req.ip });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update catalog item' });
  }
});

// DELETE /api/admin/catalog/:id
router.delete('/:id', requirePermission('edit_catalog'), async (req, res) => {
  try {
    await supabase.from('catalog').delete().eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete catalog item' });
  }
});

// POST /api/admin/catalog/bulk-refresh
router.post('/bulk-refresh', requirePermission('edit_catalog'), async (req, res) => {
  try {
    await supabase.from('catalog').update({ last_price_refresh: new Date().toISOString() }).eq('is_banned', false);
    res.json({ success: true, message: 'Price refresh triggered for all active products' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh prices' });
  }
});

// GET /api/admin/catalog/prompts
router.get('/prompts', async (req, res) => {
  try {
    const { data: prompts } = await supabase.from('prompts').select('*').order('status', { ascending: false }).order('created_at', { ascending: false });
    res.json({ prompts: prompts || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load prompts' });
  }
});

// POST /api/admin/catalog/prompts
router.post('/prompts', requirePermission('edit_catalog'), async (req, res) => {
  try {
    const { name, category, content, traffic_pct, status } = req.body;
    const { data } = await supabase.from('prompts').insert({ name, category, content, traffic_pct: traffic_pct || 100, status: status || 'champion' }).select('id').single();
    res.json({ id: data?.id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// PATCH /api/admin/catalog/prompts/:id
router.patch('/prompts/:id', requirePermission('edit_catalog'), async (req, res) => {
  try {
    const { content, traffic_pct, status } = req.body;
    const updates = {};
    if (content !== undefined) updates.content = content;
    if (traffic_pct !== undefined) updates.traffic_pct = traffic_pct;
    if (status !== undefined) updates.status = status;
    await supabase.from('prompts').update(updates).eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

module.exports = router;
