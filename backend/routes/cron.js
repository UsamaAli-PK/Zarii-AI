const express = require('express');
const router = express.Router();
const { 
  runOutbreakDetection, 
  runWeatherAlerts, 
  runChurnCalculation, 
  runDailyResets, 
  runAnalyticsAggregation 
} = require('../services/cronJobs');

/**
 * Vercel Cron Trigger
 * GET /api/cron
 * Secured by checking for the Vercel-specific CRON header.
 */
router.get('/cron', async (req, res) => {
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const isDev = process.env.NODE_ENV !== 'production';

  if (!isVercelCron && !isDev) {
    return res.status(401).json({ error: 'Unauthorized cron trigger' });
  }

  console.log('[Cron] Manual trigger received');
  
  try {
    // Run all tasks in parallel
    await Promise.all([
      runOutbreakDetection(),
      runWeatherAlerts(),
      runChurnCalculation(),
      runDailyResets(),
      runAnalyticsAggregation()
    ]);
    
    res.json({ status: 'success', message: 'All cron tasks completed' });
  } catch (err) {
    console.error('[Cron] Handler error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
