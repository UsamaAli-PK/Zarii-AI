const supabase = require('../supabase');
const { AI } = require('../config');
const apiKeys = require('./apiKeys');

// ─── SSRF Protection: Validate URLs before server-side fetch ────
function validateImageUrl(urlStr) {
  if (!urlStr) return false;
  try {
    const parsed = new URL(urlStr);
    // Only allow HTTPS
    if (!['https:'].includes(parsed.protocol)) return false;
    // Block private/internal IPs and cloud metadata
    const hostname = parsed.hostname.toLowerCase();
    const blockedPatterns = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^169\.254\./,        // AWS/cloud metadata
      /^0\./,
      /^\[::1\]/,
      /^metadata\./i,
      /\.internal$/i,
      /\.local$/i,
    ];
    if (blockedPatterns.some(p => p.test(hostname))) return false;
    return true;
  } catch {
    return false;
  }
}

const MOCK_DIAGNOSES = [
  {
    disease_name: 'Early Blight',
    disease_name_ur: 'ابتدائی جھلساؤ',
    pathogen: 'Alternaria solani',
    confidence: 94,
    severity: 'Moderate',
    symptoms: ['Concentric brown rings on lower leaves', 'Yellow halo around lesions', 'Lesion size 4-12mm'],
    prevention: ['Water at base, not on leaves', 'Allow morning sun to dry leaves', 'Rotate crops every 2 seasons', 'Space plants 18" apart'],
    primary_treatment: { name: 'Antracol 70 WP', company: 'Bayer', price: '1,180', unit: 'per kg', dosage: '2g per L water', schedule: 'Every 7 days · 3 sprays' },
    alt_treatments: [
      { name: 'Mancozeb 75 WP', company: 'Ali Akbar', price: '760', unit: 'per kg' },
      { name: 'Score 250 EC', company: 'Syngenta', price: '2,400', unit: 'per L' },
    ],
  },
  {
    disease_name: 'Whitefly',
    disease_name_ur: 'سفید مکھی',
    pathogen: 'Bemisia tabaci',
    confidence: 89,
    severity: 'High',
    symptoms: ['White powdery insects on leaf undersides', 'Yellowing and wilting of leaves', 'Honeydew secretion causing sooty mold'],
    prevention: ['Use yellow sticky traps', 'Plant barrier crops', 'Spray in early morning', 'Remove heavily infested leaves'],
    primary_treatment: { name: 'Confidor 200 SL', company: 'Bayer', price: '980', unit: 'per 250ml', dosage: '0.5ml per L water', schedule: 'Every 10 days · 2 sprays' },
    alt_treatments: [
      { name: 'Actara 25 WG', company: 'Syngenta', price: '2,200', unit: 'per 100g' },
      { name: 'Karate 2.5 EC', company: 'Syngenta', price: '720', unit: 'per 250ml' },
    ],
  },
  {
    disease_name: 'Late Blight',
    disease_name_ur: 'جدید جھلساؤ',
    pathogen: 'Phytophthora infestans',
    confidence: 91,
    severity: 'Moderate',
    symptoms: ['Dark brown water-soaked lesions', 'White mold on leaf undersides', 'Rapid brown rot of stems'],
    prevention: ['Avoid overhead irrigation', 'Improve field drainage', 'Use certified disease-free seed', 'Destroy crop debris after harvest'],
    primary_treatment: { name: 'Ridomil Gold MZ', company: 'Syngenta', price: '1,650', unit: 'per 500g', dosage: '2g per L water', schedule: 'Every 7-10 days' },
    alt_treatments: [
      { name: 'Antracol 70 WP', company: 'Bayer', price: '1,180', unit: 'per kg' },
      { name: 'Mancozeb 75 WP', company: 'Ali Akbar', price: '760', unit: 'per kg' },
    ],
  },
  {
    disease_name: 'Yellow Rust',
    disease_name_ur: 'پیلی زنگ',
    pathogen: 'Puccinia striiformis',
    confidence: 88,
    severity: 'Moderate',
    symptoms: ['Yellow pustules in stripes on leaves', 'Yellowing of entire leaves', 'Reduced grain filling'],
    prevention: ['Plant resistant varieties', 'Avoid excessive nitrogen', 'Monitor from December onwards'],
    primary_treatment: { name: 'Tilt 250 EC', company: 'Syngenta', price: '1,800', unit: 'per L', dosage: '0.5ml per L water', schedule: 'Every 14 days · 2 sprays' },
    alt_treatments: [
      { name: 'Score 250 EC', company: 'Syngenta', price: '2,400', unit: 'per L' },
    ],
  },
];

async function diagnoseImage({ imageBase64, imageUrl, cropType, lang, userId }) {
  const start = Date.now();
  let result = null;
  let providerUsed = 'mock';

  const keyObj = await apiKeys.getServiceKey('vision');

  if (keyObj && keyObj.api_key) {
    try {
      if (keyObj.provider.toLowerCase().includes('gemini') || (keyObj.provider === 'env' && AI.GEMINI_API_KEY)) {
        result = await callGemini({ imageBase64, imageUrl, cropType, lang }, keyObj);
        providerUsed = keyObj.provider === 'env' ? 'Gemini 1.5 Pro' : keyObj.provider;
        await apiKeys.reportUsage(keyObj.id, true);
      } else if (keyObj.provider.toLowerCase().includes('openai') || (keyObj.provider === 'env' && AI.OPENAI_API_KEY)) {
        result = await callOpenAIVision({ imageBase64, imageUrl, cropType, lang }, keyObj);
        providerUsed = keyObj.provider === 'env' ? 'GPT-4o Vision' : keyObj.provider;
        await apiKeys.reportUsage(keyObj.id, true);
      }
    } catch (err) {
      console.error('[aiRouter] AI call failed:', err.message);
      await apiKeys.reportUsage(keyObj.id, false);
      if (keyObj.id) logFailover(keyObj.provider, 'mock', err.message, 'vision');
    }
  }

  if (!result) {
    const idx = Math.floor(Math.random() * MOCK_DIAGNOSES.length);
    result = { ...MOCK_DIAGNOSES[idx] };
    providerUsed = 'mock';
  }

  const processingMs = Date.now() - start;

  return { ...result, ai_provider: providerUsed, processing_ms: processingMs };
}

async function callGemini({ imageBase64, imageUrl, cropType, lang }, keyObj) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(keyObj.api_key);
  const model = genAI.getGenerativeModel({ model: keyObj.model_id || 'gemini-1.5-pro' });
  const prompt = buildDiagnosisPrompt(cropType, lang);

  let imagePart;
  if (imageBase64) {
    imagePart = { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } };
  } else if (imageUrl) {
    if (!validateImageUrl(imageUrl)) throw new Error('Invalid image URL: blocked by security policy');
    const fetch = require('node-fetch');
    const resp = await fetch(imageUrl, { timeout: 10000 });
    const buf = await resp.buffer();
    if (buf.length > 10 * 1024 * 1024) throw new Error('Image too large (max 10MB)');
    imagePart = { inlineData: { data: buf.toString('base64'), mimeType: 'image/jpeg' } };
  }

  const response = await model.generateContent([prompt, imagePart]);
  return parseAIResponse(response.response.text());
}

async function callOpenAIVision({ imageBase64, imageUrl, cropType, lang }, keyObj) {
  const { OpenAI } = require('openai');
  const client = new OpenAI({ 
    apiKey: keyObj.api_key,
    baseURL: keyObj.base_url || undefined
  });
  const imageContent = imageBase64
    ? { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
    : { type: 'image_url', image_url: { url: imageUrl } };

  const response = await client.chat.completions.create({
    model: keyObj.model_id || 'gpt-4o',
    messages: [{ role: 'user', content: [{ type: 'text', text: buildDiagnosisPrompt(cropType, lang) }, imageContent] }],
    max_tokens: 1000,
  });
  return parseAIResponse(response.choices[0].message.content);
}

function buildDiagnosisPrompt(cropType, lang) {
  return `You are ZARii AI, an expert agronomist for Pakistani farmers. Analyze this ${cropType || 'crop'} leaf image and return a JSON diagnosis with exactly this structure:
{
  "disease_name": "English disease name or Healthy",
  "disease_name_ur": "اردو نام",
  "pathogen": "Scientific name",
  "confidence": 0-100,
  "severity": "None|Low|Moderate|High|Critical",
  "symptoms": ["symptom1", "symptom2", "symptom3"],
  "prevention": ["tip1", "tip2", "tip3", "tip4"],
  "primary_treatment": {
    "name": "Pakistan market product name",
    "company": "Company name",
    "price": "PKR price number only",
    "unit": "per kg/L/etc",
    "dosage": "X per L water",
    "schedule": "Every X days"
  },
  "alt_treatments": [
    {"name": "...", "company": "...", "price": "...", "unit": "..."},
    {"name": "...", "company": "...", "price": "...", "unit": "..."}
  ]
}
Return ONLY the JSON, no other text.`;
}

function parseAIResponse(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in AI response');
  return JSON.parse(match[0]);
}

async function answerVoiceQuery({ text, lang }) {
  const keyObj = await apiKeys.getServiceKey('vision'); // LLMs are in the vision pool usually (Gemini/GPT-4)

  if (keyObj && keyObj.api_key && keyObj.provider.toLowerCase().includes('openai')) {
    try {
      const { OpenAI } = require('openai');
      const client = new OpenAI({ 
        apiKey: keyObj.api_key,
        baseURL: keyObj.base_url || undefined
      });
      const response = await client.chat.completions.create({
        model: keyObj.model_id || 'gpt-4o',
        messages: [
          { role: 'system', content: `You are ZARii AI, a bilingual (Urdu/English) agricultural expert for Pakistani farmers. Give concise, practical advice about crops, diseases, pesticides available in Pakistan with PKR prices. If asked in Urdu, answer in Urdu. Keep answers under 100 words.` },
          { role: 'user', content: text },
        ],
        max_tokens: 300,
      });
      return response.choices[0].message.content;
    } catch {}
  } else if (keyObj && keyObj.api_key && keyObj.provider.toLowerCase().includes('gemini')) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(keyObj.api_key);
      const model = genAI.getGenerativeModel({ model: keyObj.model_id || 'gemini-1.5-pro' });
      const prompt = `You are ZARii AI, a bilingual (Urdu/English) agricultural expert for Pakistani farmers. Give concise, practical advice about crops, diseases, pesticides available in Pakistan with PKR prices. If asked in Urdu, answer in Urdu. Keep answers under 100 words.\n\nUser: ${text}`;
      const response = await model.generateContent(prompt);
      return response.response.text();
    } catch {}
  }

  const mockAnswers = {
    en: 'Yellowing wheat leaves usually means nitrogen deficiency. Apply Urea at 1 bag per acre and water lightly. Want me to recommend a specific brand available in your area?',
    ur: 'گندم کے پیلے پتے عام طور پر نائٹروجن کی کمی کا اشارہ ہیں۔ فی ایکڑ ایک بوری یوریا ڈالیں اور ہلکا پانی دیں۔ کیا آپ چاہتے ہیں کہ میں آپ کے علاقے میں دستیاب برانڈ تجویز کروں؟',
  };
  return mockAnswers[lang] || mockAnswers.en;
}

async function logFailover(from, to, reason, pool) {
  try {
    await supabase.from('failover_events').insert({ from_provider: from, to_provider: to, reason, pool });
  } catch {}
}

async function updateKeyUsage(provider, latencyMs) {
  try {
    const { data: keys } = await supabase.from('api_keys').select('id, calls_today').ilike('provider', `%${provider.split(' ')[0]}%`);
    if (keys && keys.length > 0) {
      await supabase.from('api_keys').update({ calls_today: (keys[0].calls_today || 0) + 1, latency_p95: latencyMs }).eq('id', keys[0].id);
    }
  } catch {}
}

module.exports = { diagnoseImage, answerVoiceQuery };
