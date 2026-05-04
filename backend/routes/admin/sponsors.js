const router = require('express').Router();
const supabase = require('../../supabase');
const { requirePermission } = require('../../middleware/adminAuth');

// GET /api/admin/sponsors
router.get('/', requirePermission('view_sponsors'), async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const { data: sponsors } = await supabase.from('sponsors').select('*').order('created_at', { ascending: false });

    const withStats = await Promise.all((sponsors || []).map(async s => {
      const [{ data: products }, { data: revEvents }] = await Promise.all([
        supabase.from('sponsored_products').select('*, catalog(name, category, pkr_price)').eq('sponsor_id', s.id),
        supabase.from('revenue_events').select('amount').eq('partner', s.name).gte('created_at', monthStart),
      ]);

      const totalProductImpressions = (products || []).reduce((sum, p) => sum + (p.impressions_today || 0), 0);
      const revenueMtd = (revEvents || []).reduce((sum, e) => sum + (e.amount || 0), 0);

      // Calculate CTR: count sponsored treatments for this sponsor's products in last 7 days
      let clicks = 0;
      let impressions = 0;

      if ((products || []).length > 0) {
        const catalogIds = (products || []).map(p => p.catalog_id);
        impressions = totalProductImpressions;

        // Count sponsored treatments for these catalog items
        const { count: clickCount } = await supabase
          .from('treatments')
          .select('id', { count: 'exact', head: true })
          .in('catalog_id', catalogIds)
          .eq('is_sponsored', true)
          .gte('created_at', sevenDaysAgo);

        clicks = clickCount || 0;
      }

      const ctr = impressions > 0 && clicks > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : null;

      return { ...s, products_count: (products || []).length, impressions_today: totalProductImpressions, ctr, revenue_mtd: revenueMtd };
    }));

    // Overall summary
    const totalRevenueMtd = withStats.reduce((sum, s) => sum + (s.revenue_mtd || 0), 0);
    const totalImpressions7d = withStats.reduce((sum, s) => sum + (s.impressions_today || 0), 0);

    res.json({
      sponsors: withStats,
      summary: {
        total_sponsors: (sponsors || []).length,
        active_sponsors: (sponsors || []).filter(s => s.status === 'Active').length,
        revenue_mtd: totalRevenueMtd || null,
        impressions_7d: totalImpressions7d || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load sponsors' });
  }
});

// POST /api/admin/sponsors
router.post('/', requirePermission('manage_sponsors'), async (req, res) => {
  try {
    const { name, logo_url, contact_email, contract_start, contract_end, pricing_model, monthly_budget } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const { data } = await supabase.from('sponsors').insert({ name, logo_url, contact_email, contract_start, contract_end, pricing_model, monthly_budget: monthly_budget || 0 }).select('id').single();
    await supabase.from('audit_log').insert({ admin_id: req.admin?.id, admin_name: req.admin?.name, action: 'added sponsor', target: name, ip_address: req.ip });
    res.json({ id: data?.id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create sponsor' });
  }
});

// PATCH /api/admin/sponsors/:id
router.patch('/:id', requirePermission('manage_sponsors'), async (req, res) => {
  try {
    const { name, status, pricing_model, monthly_budget, contract_end } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (status !== undefined) updates.status = status;
    if (pricing_model !== undefined) updates.pricing_model = pricing_model;
    if (monthly_budget !== undefined) updates.monthly_budget = monthly_budget;
    if (contract_end !== undefined) updates.contract_end = contract_end;
    await supabase.from('sponsors').update(updates).eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update sponsor' });
  }
});

// DELETE /api/admin/sponsors/:id
router.delete('/:id', requirePermission('manage_sponsors'), async (req, res) => {
  try {
    await supabase.from('sponsors').update({ status: 'Ended' }).eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to end sponsor' });
  }
});

// GET /api/admin/sponsored-products
router.get('/products', requirePermission('view_sponsors'), async (req, res) => {
  try {
    const { data: products } = await supabase
      .from('sponsored_products')
      .select('*, catalog(name, category, company, pkr_price), sponsors(name, status)')
      .order('boost_weight', { ascending: false });
    res.json({
      products: (products || []).map(p => ({
        ...p,
        product_name: p.catalog?.name, company: p.catalog?.company, pkr_price: p.catalog?.pkr_price,
        sponsor_name: p.sponsors?.name, sponsor_status: p.sponsors?.status,
        target_regions: p.target_regions || [], target_crops: p.target_crops || [],
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load sponsored products' });
  }
});

// POST /api/admin/sponsored-products
router.post('/products', requirePermission('manage_sponsors'), async (req, res) => {
  try {
    const { sponsor_id, catalog_id, boost_weight, target_regions, target_crops, daily_cap, start_date, end_date } = req.body;
    if (!sponsor_id || !catalog_id) return res.status(400).json({ error: 'sponsor_id and catalog_id required' });
    const { data } = await supabase.from('sponsored_products').insert({
      sponsor_id, catalog_id, boost_weight: boost_weight || 5,
      target_regions: target_regions || [], target_crops: target_crops || [],
      daily_cap: daily_cap || 1000, start_date, end_date,
    }).select('id').single();
    await supabase.from('catalog').update({ is_sponsored: true, sponsor_id }).eq('id', catalog_id);
    res.json({ id: data?.id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create sponsored product' });
  }
});

// PATCH /api/admin/sponsored-products/:id
router.patch('/products/:id', requirePermission('manage_sponsors'), async (req, res) => {
  try {
    const { boost_weight, daily_cap, status, target_regions, target_crops } = req.body;
    const updates = {};
    if (boost_weight !== undefined) updates.boost_weight = boost_weight;
    if (daily_cap !== undefined) updates.daily_cap = daily_cap;
    if (status !== undefined) updates.status = status;
    if (target_regions !== undefined) updates.target_regions = target_regions;
    if (target_crops !== undefined) updates.target_crops = target_crops;
    await supabase.from('sponsored_products').update(updates).eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update sponsored product' });
  }
});

module.exports = router;
