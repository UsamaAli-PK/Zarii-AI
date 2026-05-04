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
router.get('/queue', requirePermission('view_whatsapp'), async (req, res) => {
  try {
    const [
      { data: dbConvos },
      { count: waitlistCount },
      { count: autoResolved },
      { count: totalConvos },
      { data: allConvos },
    ] = await Promise.all([
      supabase.from('wa_conversations').select('*, users(name)').order('updated_at', { ascending: false }).limit(20),
      supabase.from('waitlist').select('*', { count: 'exact', head: true }).eq('feature', 'whatsapp'),
      supabase.from('wa_conversations').select('*', { count: 'exact', head: true }).eq('mode', 'auto'),
      supabase.from('wa_conversations').select('*', { count: 'exact', head: true }),
      supabase.from('wa_conversations').select('messages'),
    ]);

    const hasRealData = dbConvos && dbConvos.length > 0;
    const queue = hasRealData
      ? dbConvos.map(c => ({
          id: c.id, user: c.users?.name || 'Unknown',
          wa_phone: c.wa_phone, last: 'Recent message',
          mode: c.mode, unread: c.unread,
        }))
      : MOCK_QUEUE;

    const autoResolvedPct = (totalConvos || 0) > 0
      ? parseFloat(((autoResolved || 0) / totalConvos * 100).toFixed(1))
      : null;

    // Calculate average response time from all conversations
    let avgResponseTime = null;
    if (allConvos && allConvos.length > 0) {
      const responseTimes = [];

      allConvos.forEach(convo => {
        const messages = convo.messages || [];
        if (messages.length < 2) return;

        // Find pairs of user message followed by AI response
        for (let i = 0; i < messages.length - 1; i++) {
          const current = messages[i];
          const next = messages[i + 1];

          // Check if current is user message and next is AI response
          if (current.role === 'user' && next.role === 'ai' && current.ts && next.ts) {
            const userTime = new Date(current.ts).getTime();
            const aiTime = new Date(next.ts).getTime();
            const diffMs = aiTime - userTime;

            // Only count positive differences (valid response times)
            if (diffMs >= 0) {
              responseTimes.push(diffMs / 1000); // Convert to seconds
            }
          }
        }
      });

      if (responseTimes.length > 0) {
        const sum = responseTimes.reduce((a, b) => a + b, 0);
        avgResponseTime = parseFloat((sum / responseTimes.length).toFixed(1));
      }
    }

    res.json({
      queue,
      is_mock: !hasRealData,
      summary: {
        active_conversations: hasRealData ? dbConvos.length : MOCK_QUEUE.length,
        waitlist_count: waitlistCount || 0,
        auto_resolved_pct: autoResolvedPct,
        awaiting_human: queue.filter(q => q.mode === 'human').length,
        avg_response_s: avgResponseTime,
      },
      templates: MOCK_TEMPLATES,
      templates_static: true,
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
router.get('/templates', requirePermission('view_whatsapp'), (req, res) => {
  res.json({ templates: MOCK_TEMPLATES, templates_static: true });
});

module.exports = router;
