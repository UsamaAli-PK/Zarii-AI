const router = require('express').Router();
const supabase = require('../supabase');
const auth = require('../middleware/auth');
const { WEATHER } = require('../config');
const apiKeys = require('../services/apiKeys');

// GET /api/weather?lat=&lon=
router.get('/weather', async (req, res) => {
  const { lat = 30.2, lon = 71.4, city = 'Multan' } = req.query;

  const keyObj = await apiKeys.getServiceKey('weather');

  if (keyObj && keyObj.api_key) {
    try {
      const fetch = require('node-fetch');
      let url = keyObj.base_url || `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${keyObj.api_key}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      
      await apiKeys.reportUsage(keyObj.id, true);
      
      return res.json({
        city: data.name || city,
        temp: Math.round(data.main?.temp || 32),
        feels_like: Math.round(data.main?.feels_like || 36),
        humidity: data.main?.humidity || 48,
        condition: data.weather?.[0]?.description || 'Partly cloudy',
        icon: data.weather?.[0]?.icon || '02d',
        wind_speed: data.wind?.speed || 12,
        source: keyObj.provider,
      });
    } catch (err) {
      console.error('Weather API error:', err.message);
      await apiKeys.reportUsage(keyObj.id, false);
    }
  }

  res.json({
    city: city || 'Multan',
    temp: 32, feels_like: 36, humidity: 48,
    condition: 'Partly cloudy', icon: '02d',
    wind_speed: 12, source: 'mock',
  });
});

// GET /api/alerts?region=
router.get('/alerts', auth, async (req, res) => {
  try {
    const region = req.query.region;
    let query = supabase
      .from('outbreaks')
      .select('*')
      .in('pressure_level', ['High', 'Critical', 'Moderate'])
      .order('pressure_level')
      .limit(5);

    if (region) query = query.eq('region', region);
    const { data: alerts } = await query;
    res.json({ alerts: alerts || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load alerts' });
  }
});

// GET /api/platform-stats — public homepage stats
router.get('/platform-stats', async (req, res) => {
  try {
    const [{ count: farmers }, { count: diagnoses }, { data: diseaseRows }, { data: confData }, { data: regionRows }] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('scans').select('*', { count: 'exact', head: true }),
      supabase.from('scans').select('disease_name'),
      supabase.from('scans').select('confidence'),
      supabase.from('users').select('region'),
    ]);

    const uniqueDiseases = new Set((diseaseRows || []).map(r => r.disease_name).filter(Boolean)).size;
    const avgConf = confData && confData.length > 0
      ? (confData.reduce((s, r) => s + (r.confidence || 0), 0) / confData.length).toFixed(1) + '%'
      : null;
    const districts = new Set((regionRows || []).map(r => r.region).filter(Boolean)).size;

    res.json({
      farmers_helped: farmers || 0,
      diseases_detected: uniqueDiseases,
      diagnoses_total: diagnoses || 0,
      accuracy: avgConf,
      districts_covered: districts,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load platform stats' });
  }
});

module.exports = router;
