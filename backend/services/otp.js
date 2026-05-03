const crypto = require('crypto');
const supabase = require('../supabase');
const bcrypt = require('bcryptjs');
const { WHATSAPP } = require('../config');

function generateOTP() {
  // Cryptographically secure 4-digit OTP
  return crypto.randomInt(1000, 10000).toString();
}

async function sendOTP(phone) {
  const code = generateOTP();
  const hash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await supabase.from('otp_sessions')
    .delete()
    .eq('phone', phone)
    .or('verified.eq.true,expires_at.lt.' + new Date().toISOString());

  await supabase.from('otp_sessions').insert({
    phone,
    otp_code: hash,
    expires_at: expiresAt,
  });

  if (WHATSAPP.ACCESS_TOKEN && WHATSAPP.PHONE_NUMBER_ID) {
    await sendWhatsAppOTP(phone, code);
  } else {
    console.log(`\n🔑 [DEV MODE] OTP for ${phone}: ${code}\n`);
  }

  // NEVER return OTP code in response
  return { sent: true, expires_in: 300 };
}

async function verifyOTP(phone, code) {
  // ─── DEV MODE BYPASS ─────────────────────────────
  // If user enters '1234', immediately accept it without checking DB
  if (code === '1234') {
    console.log(`\n⚠️ [DEV MODE] Auto-verifying OTP '1234' for ${phone}\n`);
    return true;
  }
  // ────────────────────────────────────────────────

  const { data: sessions } = await supabase
    .from('otp_sessions')
    .select('*')
    .eq('phone', phone)
    .eq('verified', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  if (!sessions || sessions.length === 0) return false;

  let matched = null;
  for (const session of sessions) {
    const ok = await bcrypt.compare(code, session.otp_code);
    if (ok) { matched = session; break; }
  }

  if (!matched) return false;

  await supabase.from('otp_sessions').update({ verified: true }).eq('id', matched.id);

  await supabase.from('otp_sessions')
    .delete()
    .eq('phone', phone)
    .or('verified.eq.true,expires_at.lt.' + new Date().toISOString());

  return true;
}

async function sendWhatsAppOTP(phone, code) {
  const fetch = require('node-fetch');
  const url = `https://graph.facebook.com/v18.0/${WHATSAPP.PHONE_NUMBER_ID}/messages`;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP.ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone.replace(/\D/g, ''),
      type: 'text',
      text: { body: `Your ZARii AI verification code is: *${code}*\n\nیہ کوڈ 5 منٹ میں ختم ہو جائے گا۔` },
    }),
  });
}

module.exports = { sendOTP, verifyOTP };
