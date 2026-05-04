const router = require('express').Router();
const supabase = require('../../supabase');
const { requirePermission } = require('../../middleware/adminAuth');

// GET /api/admin/revenue
router.get('/', requirePermission('view_revenue'), async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    const [
      { count: totalSubs },
      { data: activeSponsors },
      { data: affiliateEvents },
      { data: allSubs },
    ] = await Promise.all([
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('sponsors').select('monthly_budget').eq('status', 'Active'),
      supabase.from('revenue_events').select('*').eq('type', 'affiliate'),
      supabase.from('subscriptions').select('created_at, price').order('created_at'),
    ]);

    const subRevenue = (totalSubs || 0) * 299;
    const sponsorRevenue = (activeSponsors || []).reduce((sum, s) => sum + (s.monthly_budget || 0), 0);
    const affiliateRevenue = (affiliateEvents || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalRevenue = subRevenue + sponsorRevenue + affiliateRevenue;

    // Revenue mix percentages
    const subPct = totalRevenue > 0 ? Math.round((subRevenue / totalRevenue) * 100) : 0;
    const sponPct = totalRevenue > 0 ? Math.round((sponsorRevenue / totalRevenue) * 100) : 0;
    const affPct = totalRevenue > 0 ? 100 - subPct - sponPct : 0;

    // Monthly chart from real subscriptions (last 12 months)
    const monthlyMap = {};
    (allSubs || []).forEach(s => {
      const d = new Date(s.created_at);
      const key = d.toLocaleString('en', { month: 'short', year: '2-digit' });
      if (!monthlyMap[key]) monthlyMap[key] = { subscriptions: 0, sponsor: 0 };
      monthlyMap[key].subscriptions += (s.price || 299);
    });
    const monthly = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      const key = d.toLocaleString('en', { month: 'short', year: '2-digit' });
      const label = d.toLocaleString('en', { month: 'short' });
      return { month: label, subscriptions: monthlyMap[key]?.subscriptions || 0, sponsor: monthlyMap[key]?.sponsor || 0 };
    });

    // Affiliate attribution from revenue_events
    const affiliateByPartner = {};
    (affiliateEvents || []).forEach(e => {
      const p = e.partner || 'Unknown';
      if (!affiliateByPartner[p]) affiliateByPartner[p] = { partner: p, total: 0, count: 0 };
      affiliateByPartner[p].total += (e.amount || 0);
      affiliateByPartner[p].count += 1;
    });
    const affiliateAttribution = Object.values(affiliateByPartner).map(a => ({
      partner: a.partner, commission: `₨ ${Math.round(a.total).toLocaleString()}`, conversions: a.count,
    }));

    // Affiliate clicks in last 7 days
    const recentAff = (affiliateEvents || []).filter(e => new Date(e.created_at) >= new Date(sevenDaysAgo));

    res.json({
      summary: {
        mrr: subRevenue,
        sponsor_revenue: sponsorRevenue,
        premium_subscriptions: totalSubs || 0,
        affiliate_clicks_7d: recentAff.length,
      },
      revenue_mix: {
        subscriptions_pct: subPct, sponsor_pct: sponPct, affiliate_pct: affPct,
        subscriptions_amt: `₨ ${Math.round(subRevenue).toLocaleString()}`,
        sponsor_amt: `₨ ${Math.round(sponsorRevenue).toLocaleString()}`,
        affiliate_amt: `₨ ${Math.round(affiliateRevenue).toLocaleString()}`,
      },
      monthly_chart: monthly,
      affiliate_attribution: affiliateAttribution,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load revenue data' });
  }
});

// POST /api/admin/revenue/subscription
router.post('/subscription', async (req, res) => {
  try {
    const { user_id, plan, price } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    const expires = new Date(Date.now() + 30 * 86400000).toISOString();
    const { data } = await supabase.from('subscriptions').insert({ user_id, plan: plan || 'premium', price: price || 299, expires_at: expires, status: 'active' }).select('id').single();
    await supabase.from('users').update({ premium: true }).eq('id', user_id);
    res.json({ id: data?.id, success: true, expires_at: expires });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

module.exports = router;
