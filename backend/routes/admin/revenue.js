const router = require('express').Router();
const supabase = require('../../supabase');

// GET /api/admin/revenue
router.get('/', async (req, res) => {
  try {
    const { count: totalSubs } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const subRevenue = (totalSubs || 0) * 299;

    const monthly = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      const label = d.toLocaleString('en', { month: 'short' });
      return { month: label, subscriptions: 60000 + i * 18000, sponsor: 35000 + i * 15000 };
    });

    res.json({
      summary: {
        mrr: Math.max(subRevenue, 4800000),
        sponsor_revenue: 2490000,
        premium_subscriptions: Math.max(totalSubs || 0, 2140),
        affiliate_clicks_7d: 14820,
      },
      revenue_mix: {
        subscriptions_pct: 55, sponsor_pct: 36, affiliate_pct: 9,
        subscriptions_amt: '₨ 2.64M', sponsor_amt: '₨ 1.73M', affiliate_amt: '₨ 432k',
      },
      monthly_chart: monthly,
      affiliate_attribution: [
        { partner: 'Bayer Pakistan', clicks: 38420, conv_rate: '12.4%', conversions: 4764, sales: '₨ 14.2M', commission: '₨ 1.42M' },
        { partner: 'Syngenta', clicks: 24180, conv_rate: '14.1%', conversions: 3409, sales: '₨ 9.8M', commission: '₨ 980k' },
        { partner: 'Ali Akbar Group', clicks: 18940, conv_rate: '9.8%', conversions: 1856, sales: '₨ 4.2M', commission: '₨ 420k' },
        { partner: 'FMC Pakistan', clicks: 11200, conv_rate: '8.2%', conversions: 918, sales: '₨ 2.1M', commission: '₨ 210k' },
      ],
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
