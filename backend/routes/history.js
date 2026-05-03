const router = require('express').Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');

// GET /api/history?type=scan|voice|all&page=1&limit=20
router.get('/', auth, async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const userId = req.user.id;
    const lim = parseInt(limit);

    let scans = [], voices = [];

    if (type === 'all' || type === 'scan') {
      const { data } = await supabase
        .from('scans')
        .select('id, disease_name, disease_name_ur, crop_type, confidence, severity, image_url, user_feedback, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + lim - 1);
      scans = (data || []).map(s => ({ ...s, type: 'scan' }));
    }

    if (type === 'all' || type === 'voice') {
      const { data } = await supabase
        .from('voice_queries')
        .select('id, transcript, answer, lang, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + lim - 1);
      voices = (data || []).map(v => ({ ...v, type: 'voice' }));
    }

    let items = [...scans, ...voices];
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    items = items.slice(0, lim);

    const [{ count: totalScans }, { count: totalVoice }] = await Promise.all([
      supabase.from('scans').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('voice_queries').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    ]);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: lim,
        total: type === 'scan' ? (totalScans || 0) : type === 'voice' ? (totalVoice || 0) : (totalScans || 0) + (totalVoice || 0),
      },
    });
  } catch (err) {
    console.error('history error:', err);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// GET /api/history/recent?limit=4
router.get('/recent', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const { data: scans } = await supabase
      .from('scans')
      .select('id, disease_name, disease_name_ur, crop_type, confidence, severity, image_url, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    res.json({ scans: scans || [] });
  } catch (err) {
    console.error('recent error:', err);
    res.status(500).json({ error: 'Failed to get recent scans' });
  }
});

// GET /api/history/analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [{ count: totalScans }, { count: totalVoice }, { data: allScans }, { data: diseases }] = await Promise.all([
      supabase.from('scans').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('voice_queries').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('scans').select('severity').eq('user_id', userId),
      supabase.from('scans').select('disease_name').eq('user_id', userId).neq('disease_name', 'Healthy'),
    ]);

    const sevMap = { None: 100, Low: 85, Moderate: 60, High: 35, Critical: 10 };
    let healthScore = 80;
    if (allScans && allScans.length > 0) {
      const avg = allScans.reduce((s, sc) => s + (sevMap[sc.severity] || 60), 0) / allScans.length;
      healthScore = Math.round(avg);
    }

    const diseaseCount = {};
    (diseases || []).forEach(d => {
      diseaseCount[d.disease_name] = (diseaseCount[d.disease_name] || 0) + 1;
    });
    const topDiseases = Object.entries(diseaseCount)
      .map(([disease_name, count]) => ({ disease_name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const moneySaved = (totalScans || 0) * 1100;

    const weekly = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { date: d.toISOString().slice(0, 10), scans: 0, health: Math.max(50, healthScore + Math.floor(Math.random() * 16 - 8)) };
    });

    res.json({
      total_scans: totalScans || 0,
      total_voice: totalVoice || 0,
      unique_diseases: topDiseases.length,
      health_score: healthScore,
      money_saved: moneySaved,
      top_diseases: topDiseases,
      weekly_activity: weekly,
    });
  } catch (err) {
    console.error('analytics error:', err);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// POST /api/history/feedback
router.post('/feedback', auth, async (req, res) => {
  try {
    const { scan_id, type } = req.body;
    if (!scan_id) return res.status(400).json({ error: 'scan_id required' });
    if (!['positive', 'negative'].includes(type)) return res.status(400).json({ error: 'type must be positive or negative' });

    const { data: scan } = await supabase.from('scans').select('id').eq('id', scan_id).eq('user_id', req.user.id).single();
    if (!scan) return res.status(404).json({ error: 'Scan not found' });

    await supabase.from('scans').update({ user_feedback: type }).eq('id', scan_id);
    res.json({ success: true, scan_id, feedback: type });
  } catch (err) {
    console.error('feedback error:', err);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

module.exports = router;
