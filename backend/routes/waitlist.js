const router = require('express').Router();
const supabase = require('../supabase');

// POST /api/waitlist
router.post('/', async (req, res) => {
  try {
    const { user_id, contact, feature } = req.body;
    
    // Check if already in waitlist
    let query = supabase.from('waitlist').select('id').eq('feature', feature || 'whatsapp');
    if (user_id) query = query.eq('user_id', user_id);
    else if (contact) query = query.eq('contact', contact);
    else return res.status(400).json({ error: 'user_id or contact required' });

    const { data: existing } = await query.single();

    if (existing) {
      return res.json({ success: true, message: 'Already on waitlist' });
    }

    const { error } = await supabase
      .from('waitlist')
      .insert({ user_id, contact, feature: feature || 'whatsapp' });

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('Waitlist error:', err);
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

module.exports = router;
