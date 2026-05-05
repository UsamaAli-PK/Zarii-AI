const router = require('express').Router();
const bcrypt = require('bcryptjs');
const supabase = require('../supabase');
const { diagnoseImage, answerVoiceQuery } = require('../services/aiRouter');
const { WHATSAPP } = require('../config');

// GET /webhooks/whatsapp — Meta verification
router.get(['/', '/whatsapp'], (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === WHATSAPP.VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Verified');
    return res.status(200).send(challenge);
  }
  res.status(403).json({ error: 'Verification failed' });
});

// POST /webhooks/whatsapp — Incoming messages
router.post(['/', '/whatsapp'], async (req, res) => {
  res.sendStatus(200);

  try {
    const body = req.body;
    if (!body?.entry?.[0]?.changes?.[0]?.value?.messages) return;

    const value = body.entry[0].changes[0].value;
    const message = value.messages[0];
    const waPhone = message.from;
    const msgType = message.type;

    let { data: user } = await supabase.from('users').select('*').eq('phone', waPhone).single();
    if (!user) {
      const { data: newUser } = await supabase.from('users').insert({
        name: 'WhatsApp User', phone: waPhone, lang: 'ur', channel: 'whatsapp',
      }).select().single();
      user = newUser;
    }

    let { data: convo } = await supabase.from('wa_conversations').select('*').eq('wa_phone', waPhone).single();
    if (!convo) {
      const { data: newConvo } = await supabase.from('wa_conversations').insert({
        user_id: user.id, wa_phone: waPhone, messages: [],
      }).select().single();
      convo = newConvo;
    }

    const messages = convo.messages || [];

    if (msgType === 'image') {
      const mediaId = message.image.id;
      messages.push({ role: 'user', type: 'image', mediaId, ts: new Date().toISOString() });

      try {
        const imageUrl = await getWhatsAppMediaUrl(mediaId);
        const diagnosis = await diagnoseImage({ imageUrl, cropType: null, lang: user.lang, userId: user.id });
        const reply = formatDiagnosisForWhatsApp(diagnosis, user.lang);
        await sendWhatsAppMessage(waPhone, reply);

        await supabase.from('scans').insert({
          user_id: user.id, image_url: imageUrl,
          disease_name: diagnosis.disease_name, disease_name_ur: diagnosis.disease_name_ur,
          pathogen: diagnosis.pathogen, confidence: diagnosis.confidence, severity: diagnosis.severity,
          symptoms: diagnosis.symptoms || [], prevention: diagnosis.prevention || [],
          ai_provider: diagnosis.ai_provider, solution_provider: diagnosis.solution_provider, processing_ms: diagnosis.processing_ms,
        });

        messages.push({ role: 'bot', text: reply, ts: new Date().toISOString() });
      } catch (err) {
        const errMsg = user.lang === 'ur'
          ? 'معذرت، تصویر کا تجزیہ کرنے میں مسئلہ ہوا۔ دوبارہ کوشش کریں۔'
          : 'Sorry, could not analyze the image. Please try again.';
        await sendWhatsAppMessage(waPhone, errMsg);
      }

    } else if (msgType === 'text') {
      const text = message.text.body.trim();
      messages.push({ role: 'user', type: 'text', text, ts: new Date().toISOString() });

      const { data: otpSessions } = await supabase
        .from('otp_sessions')
        .select('*')
        .eq('phone', waPhone)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      const otp = otpSessions?.[0] || null;

      if (otp && /^\d{4}$/.test(text)) {
        const valid = await bcrypt.compare(text, otp.otp_code);
        if (valid) {
          await supabase.from('otp_sessions').update({ verified: true }).eq('id', otp.id);
          const reply = user.lang === 'ur' ? '✅ تصدیق کامیاب! ZARii AI میں خوش آمدید۔' : '✅ Verified! Welcome to ZARii AI.';
          await sendWhatsAppMessage(waPhone, reply);
          messages.push({ role: 'bot', text: reply, ts: new Date().toISOString() });
        } else {
          const reply = user.lang === 'ur' ? '❌ غلط کوڈ۔ دوبارہ کوشش کریں۔' : '❌ Wrong code. Please try again.';
          await sendWhatsAppMessage(waPhone, reply);
        }
      } else {
        const answer = await answerVoiceQuery({ text, lang: user.lang });
        await sendWhatsAppMessage(waPhone, answer);
        await supabase.from('voice_queries').insert({ user_id: user.id, transcript: text, lang: user.lang, answer });
        messages.push({ role: 'bot', text: answer, ts: new Date().toISOString() });
      }

    } else if (msgType === 'audio') {
      messages.push({ role: 'user', type: 'audio', ts: new Date().toISOString() });
      const reply = user.lang === 'ur'
        ? 'آپ کی آواز سن رہا ہوں... ابھی یہ فیچر بیٹا میں ہے۔ براہ کرم اپنا سوال ٹیکسٹ میں لکھیں۔'
        : 'Voice notes are in beta. Please type your question for now.';
      await sendWhatsAppMessage(waPhone, reply);
      messages.push({ role: 'bot', text: reply, ts: new Date().toISOString() });
    }

    await supabase.from('wa_conversations').update({
      messages: messages.slice(-50),
      updated_at: new Date().toISOString(),
    }).eq('id', convo.id);

  } catch (err) {
    console.error('[WhatsApp Webhook] Error:', err);
  }
});

async function getWhatsAppMediaUrl(mediaId) {
  const fetch = require('node-fetch');
  const r = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
    headers: { 'Authorization': `Bearer ${WHATSAPP.ACCESS_TOKEN}` },
  });
  const data = await r.json();
  return data.url;
}

async function sendWhatsAppMessage(to, text) {
  if (!WHATSAPP.ACCESS_TOKEN || !WHATSAPP.PHONE_NUMBER_ID) {
    console.log(`[WhatsApp BOT → ${to}]: ${text.slice(0, 80)}...`);
    return;
  }
  const fetch = require('node-fetch');
  await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP.PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP.ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'text',
      text: { body: text },
    }),
  });
}

function formatDiagnosisForWhatsApp(dx, lang) {
  if (lang === 'ur') {
    return `🌿 *ZARii AI تجزیہ*

🔬 *بیماری:* ${dx.disease_name_ur || dx.disease_name}
📊 *اعتماد:* ${dx.confidence}%
⚠️ *شدت:* ${dx.severity}

💊 *علاج:*
${dx.primary_treatment?.name} - ₨${dx.primary_treatment?.price}
${dx.primary_treatment?.dosage || ''}

🛡️ *احتیاطی تدابیر:*
${(dx.prevention || []).slice(0, 2).map(p => `• ${p}`).join('\n')}

مزید معلومات کے لیے zarii.ai پر جائیں`;
  }
  return `🌿 *ZARii AI Diagnosis*

🔬 *Disease:* ${dx.disease_name}
📊 *Confidence:* ${dx.confidence}%
⚠️ *Severity:* ${dx.severity}

💊 *Recommended Treatment:*
${dx.primary_treatment?.name} - ₨${dx.primary_treatment?.price}
${dx.primary_treatment?.dosage || ''}

🛡️ *Prevention:*
${(dx.prevention || []).slice(0, 2).map(p => `• ${p}`).join('\n')}

Visit zarii.ai for full details`;
}

module.exports = router;
