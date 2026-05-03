const router = require('express').Router();
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');
const { sendOTP, verifyOTP } = require('../services/otp');
const { JWT_SECRET, JWT_EXPIRY } = require('../config');

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number required' });
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) return res.status(400).json({ error: 'Invalid phone number' });

    const result = await sendOTP(phone);
    res.json(result);
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, name, lang, region, crops } = req.body;
    const code = req.body.code || req.body.otp;
    if (!phone || !code) return res.status(400).json({ error: 'Phone and code required' });

    const valid = await verifyOTP(phone, code);
    if (!valid) return res.status(401).json({ error: 'Invalid or expired OTP' });

    let { data: user } = await supabase.from('users').select('*').eq('phone', phone).maybeSingle();

    if (!user) {
      const { data: newUser } = await supabase.from('users').insert({
        name: name || 'Farmer',
        phone,
        lang: lang || 'ur',
        region: region || null,
        crops: crops || [],
      }).select().single();
      user = newUser;
    } else if (name) {
      await supabase.from('users').update({
        name,
        lang: lang || user.lang,
        last_seen: new Date().toISOString(),
      }).eq('id', user.id);
      const { data: updated } = await supabase.from('users').select('*').eq('id', user.id).single();
      user = updated;
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });
  try {
    // Verify signature but allow tokens expired within last 30 days only
    const payload = jwt.verify(token, JWT_SECRET, { ignoreExpiration: false });
    const { data: user } = await supabase.from('users').select('*').eq('id', payload.id).single();
    if (!user) return res.status(404).json({ error: 'User not found' });
    const newToken = jwt.sign({ id: user.id, phone: user.phone, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.json({ token: newToken, user: sanitizeUser(user) });
  } catch (err) {
    // If token is expired, check if within 30-day grace period
    if (err.name === 'TokenExpiredError') {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        const expiredAgo = Date.now() / 1000 - decoded.exp;
        if (expiredAgo < 30 * 24 * 60 * 60) { // 30 days grace
          const { data: user } = await supabase.from('users').select('*').eq('id', decoded.id).single();
          if (user) {
            const newToken = jwt.sign({ id: user.id, phone: user.phone, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
            return res.json({ token: newToken, user: sanitizeUser(user) });
          }
        }
      }
    }
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

function sanitizeUser(u) {
  return {
    id: u.id, name: u.name, phone: u.phone, lang: u.lang,
    region: u.region, crops: u.crops || [],
    channel: u.channel, premium: !!u.premium, created_at: u.created_at,
  };
}

module.exports = router;
