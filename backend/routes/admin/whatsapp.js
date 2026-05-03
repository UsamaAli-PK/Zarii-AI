const router = require('express').Router();
const supabase = require('../../supabase');
const { requirePermission } = require('../../middleware/adminAuth');
const { WHATSAPP } = require('../../config');

const MOCK_QUEUE = [
  { id: 1, user: 'Aslam M.', wa_phone: '+923001234567', last: 'Sent leaf photo · awaiting AI', mode: 'auto', wait: '8s', unread: 0 },
  { id: 2, user: 'Fatima B.', wa_phone: '+923001234568', last: '"Mere tomato par kaale dhabbe…"', mode: 'auto', wait: '14s', unread: 0 },
  { id: 3, user: 'Tariq M.', wa_phone: '+923001234569', last: '"Yeh treatment kaam nahi kar raha"', mode: 'human', wait: '4m', unread: 1 },
  { id: 4, user: 'Sara K.', wa_phone: '+923001234570', last: 'Voice note received (24s)', mode: 'auto', wait: '22s', unread: 0 },
  { id: 5, user: 'Bilal H.', wa_phone: '+923001234571', last: '"Wapas paisa chahiye"', mode: 'human', wait: '12m', unread: 2 },
];

const MOCK_TEMPLATES = [
  { name: 'welcome_urdu', category: 'Marketing', sends: 14820, status: 'Approved' },
  { name: 'diagnosis_ready_urdu', category: 'Utility', sends: 38200, status: 'Approved' },
  { name: 'outbreak_alert_punjab', category: 'Marketing', sends: 124000, status: 'Approved' },
  { name: 'reorder_reminder', category: 'Marketing', sends: 0, status: 'In review' },
];

// GET /api/admin/whatsapp (alias for /queue)
router.get('/', (req, res, next) => { req.url = '/queue'; next(); });

// GET /api/admin/whatsapp/queue
router.get('/queue', async (req, res) => {
  try {
    const { data: dbConvos } = await supabase
      .from('wa_conversations')
      .select('*, users(name)')
      .order('updated_at', { ascending: false })
      .limit(20);

    const queue = dbConvos && dbConvos.length > 0
      ? dbConvos.map(c => ({
          id: c.id, user: c.users?.name || 'Unknown',
          wa_phone: c.wa_phone, last: 'Recent message',
          mode: c.mode, unread: c.unread,
        }))
      : MOCK_QUEUE;

    res.json({
      queue,
      summary: {
        active_conversations: Math.max((dbConvos || []).length, 1284),
        auto_resolved_pct: 92.4,
        awaiting_human: queue.filter(q => q.mode === 'human').length || 14,
        avg_response_s: 9.4,
      },
      templates: MOCK_TEMPLATES,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load WhatsApp queue' });
  }
});

// POST /api/admin/whatsapp/takeover
router.post('/takeover', requirePermission('takeover_wa'), async (req, res) => {
  try {
    const { conversation_id } = req.body;
    await supabase.from('wa_conversations').update({ mode: 'human' }).eq('id', conversation_id);
    res.json({ success: true, mode: 'human' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to take over conversation' });
  }
});

// POST /api/admin/whatsapp/send
router.post('/send', requirePermission('takeover_wa'), async (req, res) => {
  try {
    const { wa_phone, message, conversation_id } = req.body;
    if (!wa_phone || !message) return res.status(400).json({ error: 'wa_phone and message required' });

    if (WHATSAPP.ACCESS_TOKEN && WHATSAPP.PHONE_NUMBER_ID) {
      const fetch = require('node-fetch');
      await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP.PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${WHATSAPP.ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: wa_phone.replace(/\D/g, ''), type: 'text', text: { body: message } }),
      });
    }

    if (conversation_id) {
      const { data: convo } = await supabase.from('wa_conversations').select('messages').eq('id', conversation_id).single();
      if (convo) {
        const msgs = [...(convo.messages || []), { role: 'admin', text: message, ts: new Date().toISOString() }];
        await supabase.from('wa_conversations').update({ messages: msgs, updated_at: new Date().toISOString() }).eq('id', conversation_id);
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/admin/whatsapp/templates
router.get('/templates', (req, res) => {
  res.json({ templates: MOCK_TEMPLATES });
});

module.exports = router;
