const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../../supabase');
const { requirePermission } = require('../../middleware/adminAuth');
const { ADMIN_JWT_SECRET, JWT_EXPIRY, APP_URL } = require('../../config');

// Password strength validation
const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('Minimum 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least 1 uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('At least 1 lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('At least 1 number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('At least 1 special character (!@#$%^&*...)');
  return errors;
};

// Email validation
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// POST /api/admin/auth/register (Admin only - create new admin/operator)
router.post('/register', requirePermission('Manage admins'), async (req, res) => {
  try {
    const { name, email, role, sendInvite } = req.body;
    if (!name || !email || !role) return res.status(400).json({ error: 'name, email, role required' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (!['Owner', 'Ops', 'Agronomist', 'Support'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    // Check if email exists
    const { data: existing } = await supabase.from('admin_users').select('id').eq('email', email).single();
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create admin user (password set later via invite)
    const { data: admin, error } = await supabase.from('admin_users').insert({
      name,
      email: email.toLowerCase(),
      role,
      verification_token: verificationToken,
      verification_exp: verificationExp,
      email_verified: !sendInvite, // auto-verify if not sending invite
    }).select().single();

    if (error) throw error;

    // Send invite email (if sendInvite is true)
    if (sendInvite) {
      // TODO: Send email with verification link
      // const verifyLink = `${APP_URL}/admin/verify/${verificationToken}`;
      console.log(`[INVITE] Would send invite to ${email}: /admin/verify/${verificationToken}`);
    }

    res.status(201).json({ 
      message: sendInvite ? 'Invitation sent' : 'Admin created',
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (err) {
    console.error('admin register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET /api/admin/auth/verify - Verify token and show setup page
router.get('/verify', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Missing verification token');

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id, name, email')
    .eq('verification_token', token)
    .gte('verification_exp', new Date().toISOString())
    .single();

  if (!admin) return res.status(400).send('Invalid or expired verification link');

  res.send(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Set Admin Password - ZARii AI</title>
<style>body{font-family:system-ui,sans-serif;background:#f0fdf4;min-height:100vh;display:flex;align-items:center;justify-content:center;margin:0}
.box{background:white;padding:2rem;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);max-width:400px;width:100%}
h2{color:#166534;margin:0 0 1rem}label{display:block;margin-bottom:0.5rem;color:#374151}
input,select{width:100%;padding:0.75rem;margin-bottom:1rem;border:1px solid #d1d5db;border-radius:8px;box-sizing:border-box}
button{width:100%;background:#16a34a;color:white;border:none;padding:1rem;border-radius:8px;font-weight:600;cursor:pointer}
button:hover{background:#15803d}.error{color:#dc2626;font-size:0.875rem;margin-bottom:1rem}</style></head>
<body>
<div class="box"><h2>Set Your Admin Password</h2><p>Welcome, ${admin.name}!</p><form id="f">
<input type="hidden" name="token" value="${token}">
<label>Password (8+ chars, uppercase, lowercase, number, special)</label>
<input type="password" name="password" required minlength="8">
<label>Confirm Password</label>
<input type="password" name="confirm" required>
<div class="error" id="e"></div>
<button type="submit">Set Password</button></form></div>
<script>document.getElementById('f').onsubmit=async e=>{e.preventDefault();const p=document.querySelector('[name=password]').value,c=document.querySelector('[name=confirm]').value,t=document.querySelector('[name=token]').value;if(p!==c){document.getElementById('e').textContent='Passwords mismatch';return}const r=await fetch('/api/admin/auth/verify-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:t,password:p})});const d=await r.json();if(d.error){document.getElementById('e').textContent=d.error}else{alert('Password set! Login at /admin');window.location.href='/'}};</script>
</body></html>`);
});

// POST /api/admin/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'token and password required' });

    const pwErrors = validatePassword(password);
    if (pwErrors.length > 0) return res.status(400).json({ error: pwErrors.join(', ') });

    const { data: admin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('verification_token', token)
      .gte('verification_exp', new Date().toISOString())
      .single();

    if (!admin) return res.status(400).json({ error: 'Invalid or expired token' });

    const password_hash = await bcrypt.hash(password, 12);
    await supabase.from('admin_users').update({
      password_hash,
      email_verified: true,
      verification_token: null,
      verification_exp: null,
    }).eq('id', admin.id);

    res.json({ message: 'Email verified and password set successfully' });
  } catch (err) {
    console.error('verify email error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// POST /api/admin/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const { data: admin, error } = await supabase.from('admin_users').select('*').eq('email', email.toLowerCase()).single();
    console.log('[LOGIN] Query result:', { email, admin, error });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    // Check email verification
    if (!admin.email_verified) {
      return res.status(403).json({ error: 'Email not verified. Check your inbox or request a new verification link.' });
    }

    if (!admin.password_hash) {
      return res.status(401).json({ error: 'Password not set. Complete setup via verification link.' });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    await supabase.from('admin_users').update({ last_active: new Date().toISOString() }).eq('id', admin.id);

    const token = jwt.sign(
      { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
      ADMIN_JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    await supabase.from('audit_log').insert({ admin_id: admin.id, admin_name: admin.name, action: 'logged in', target: 'admin console', ip_address: req.ip });

    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, tfa_enabled: !!admin.tfa_enabled } });
  } catch (err) {
    console.error('admin login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/admin/auth/me — verify token + return admin info
router.get('/me', async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const jwt = require('jsonwebtoken');
    const { ADMIN_JWT_SECRET } = require('../../config');
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    // Confirm admin still exists in DB
    const supabase = require('../../supabase');
    const { data: admin } = await supabase.from('admin_users').select('id, name, email, role').eq('id', decoded.id).single();
    if (!admin) return res.status(401).json({ error: 'Admin not found' });
    res.json({ admin });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// GET /api/admin/team
router.get('/', async (req, res) => {
  try {
    const [{ data: members }, { data: auditLog }] = await Promise.all([
      supabase.from('admin_users').select('id, name, email, role, tfa_enabled, last_active, created_at').order('created_at'),
      supabase.from('audit_log').select('*, admin_users(name)').order('created_at', { ascending: false }).limit(50),
    ]);

    res.json({
      members: (members || []).map(m => ({ ...m, tfa_enabled: !!m.tfa_enabled })),
      audit_log: (auditLog || []).map(a => ({ ...a, admin_name: a.admin_users?.name || a.admin_name })),
      summary: {
        total: (members || []).length,
        roles: (members || []).reduce((acc, m) => { acc[m.role] = (acc[m.role] || 0) + 1; return acc; }, {}),
        pending_invites: (members || []).filter(m => !m.last_active || m.last_active === m.created_at).length,
        audit_events_7d: (auditLog || []).length,
      },
      permission_matrix: [
        { capability: 'View users',         Owner: true, Ops: true, Agronomist: true, Support: true },
        { capability: 'Edit catalog',       Owner: true, Ops: true, Agronomist: true, Support: false },
        { capability: 'Manage sponsors',    Owner: true, Ops: true, Agronomist: false, Support: false },
        { capability: 'Rotate API keys',    Owner: true, Ops: true, Agronomist: false, Support: false },
        { capability: 'Send advisories',    Owner: true, Ops: true, Agronomist: true, Support: false },
        { capability: 'Take over WhatsApp', Owner: true, Ops: true, Agronomist: true, Support: true },
        { capability: 'Invite members',     Owner: true, Ops: false, Agronomist: false, Support: false },
        { capability: 'Billing & contracts',Owner: true, Ops: false, Agronomist: false, Support: false },
      ],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load team' });
  }
});

// POST /api/admin/team/invite
router.post('/invite', requirePermission('invite_members'), async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    if (!name || !email || !role) return res.status(400).json({ error: 'name, email, role required' });

    const { data: existing } = await supabase.from('admin_users').select('id').eq('email', email).single();
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const hash = await bcrypt.hash(password || 'ZARii2024!', 10);
    const { data } = await supabase.from('admin_users').insert({ name, email, password_hash: hash, role }).select('id').single();

    await supabase.from('audit_log').insert({ admin_id: req.admin?.id, admin_name: req.admin?.name, action: 'invited member', target: `${name} (${role})`, ip_address: req.ip });

    res.json({ id: data?.id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to invite member' });
  }
});

// PATCH /api/admin/team/:id/role
router.patch('/:id/role', requirePermission('invite_members'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['Owner', 'Ops', 'Agronomist', 'Support'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    await supabase.from('admin_users').update({ role }).eq('id', req.params.id);
    await supabase.from('audit_log').insert({ admin_id: req.admin?.id, admin_name: req.admin?.name, action: 'changed role', target: `admin #${req.params.id} → ${role}`, ip_address: req.ip });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// GET /api/admin/audit-log
router.get('/audit-log', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { data: logs, count: total } = await supabase.from('audit_log').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + parseInt(limit) - 1);
    res.json({ logs: logs || [], pagination: { page: parseInt(page), limit: parseInt(limit), total: total || 0 } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load audit log' });
  }
});

module.exports = router;
