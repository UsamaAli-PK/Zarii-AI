const router = require('express').Router();
const supabase = require('../../supabase');
const { requirePermission } = require('../../middleware/adminAuth');

// GET /api/admin/diagnoses
router.get('/', requirePermission('view_diagnoses'), async (req, res) => {
  try {
    const { filter, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const lim = parseInt(limit);

    let query = supabase.from('scans').select('*, users(name, region)', { count: 'exact' });
    if (filter === 'flagged') query = query.eq('flagged', true);
    else if (filter === 'low_confidence') query = query.lt('confidence', 75);
    else if (filter === 'negative') query = query.eq('user_feedback', 'negative');
    query = query.order('created_at', { ascending: false }).range(offset, offset + lim - 1);

    const { data: scans, count: total } = await query;

    const today = new Date().toISOString().slice(0, 10);
    const [{ count: diagsToday }, { data: confData }, { count: flagged }, { count: positiveFb }, { count: withFb }] = await Promise.all([
      supabase.from('scans').select('*', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('scans').select('confidence').gte('created_at', today),
      supabase.from('scans').select('*', { count: 'exact', head: true }).eq('flagged', true),
      supabase.from('scans').select('*', { count: 'exact', head: true }).eq('user_feedback', 'positive'),
      supabase.from('scans').select('*', { count: 'exact', head: true }).not('user_feedback', 'is', null),
    ]);

    const avgConf = confData && confData.length > 0
      ? confData.reduce((s, r) => s + (r.confidence || 0), 0) / confData.length
      : null;

    // Compute confusion pairs from negative-feedback scans
    const { data: negScans } = await supabase
      .from('scans')
      .select('disease_name')
      .eq('user_feedback', 'negative')
      .not('disease_name', 'is', null);
    const pairCount = {};
    (negScans || []).forEach(s => {
      if (s.disease_name) {
        pairCount[s.disease_name] = (pairCount[s.disease_name] || 0) + 1;
      }
    });
    const confusionPairs = Object.entries(pairCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ a: name, b: 'Misidentified', count }));

    res.json({
      scans: (scans || []).map(s => ({
        ...s,
        user_name: s.users?.name,
        region: s.users?.region,
        symptoms: s.symptoms || [],
        prevention: s.prevention || [],
      })),
      pagination: { page: parseInt(page), limit: lim, total: total || 0 },
      summary: {
        today: diagsToday || 0,
        avg_confidence: avgConf !== null ? parseFloat(avgConf.toFixed(1)) : null,
        flagged_queue: flagged || 0,
        positive_feedback_rate: (withFb || 0) > 0 ? Math.round(((positiveFb || 0) / (withFb || 1)) * 100) : 0,
      },
      confusion_pairs: confusionPairs,
    });
  } catch (err) {
    console.error('admin diagnoses error:', err);
    res.status(500).json({ error: 'Failed to load diagnoses' });
  }
});

// POST /api/admin/diagnoses/:id/flag
router.post('/:id/flag', async (req, res) => {
  try {
    const { data: scan } = await supabase.from('scans').select('flagged').eq('id', req.params.id).single();
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    await supabase.from('scans').update({ flagged: !scan.flagged }).eq('id', req.params.id);
    res.json({ success: true, flagged: !scan.flagged });
  } catch (err) {
    res.status(500).json({ error: 'Failed to flag scan' });
  }
});

// GET /api/admin/diagnoses/meta/accuracy-chart
router.get('/meta/accuracy-chart', async (req, res) => {
  try {
    const days = await Promise.all(
      Array.from({ length: 30 }, async (_, i) => {
        const d = new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10);
        const { data } = await supabase.from('scans').select('confidence').gte('created_at', d).lt('created_at', d + 'T23:59:59');
        const avg = data && data.length > 0 ? data.reduce((s, r) => s + (r.confidence || 0), 0) / data.length : null;
        return { date: d, confidence: avg ? parseFloat(avg.toFixed(1)) : null };
      })
    );
    res.json({ chart: days.filter(d => d.confidence !== null) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load accuracy chart' });
  }
});

module.exports = router;
