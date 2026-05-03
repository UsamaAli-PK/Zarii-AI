const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../../supabase');
const { requirePermission } = require('../../middleware/adminAuth');
const { ADMIN_JWT_SECRET, JWT_EXPIRY } = require('../../config');

// POST /api/admin/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const { data: admin } = await supabase.from('admin_users').select('*').eq('email', email).single();
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

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
      summary: { total: (members || []).length, roles: { Owner: 1, Ops: 2, Agronomist: 2, Support: 4 }, pending_invites: 2, audit_events_7d: (auditLog || []).length },
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
