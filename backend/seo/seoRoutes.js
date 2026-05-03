'use strict';

const express = require('express');
const path    = require('path');
const router  = express.Router();

const { ssrHtmlShell, breadcrumb, esc, slug, SITE_URL } = require('./ssrShell');
const { DISEASE_GUIDES, PESTICIDE_CONTENT, FARMING_REGIONS, GLOSSARY_TERMS } = require('./seoData');

const supabase = require('../supabase');

function badgeClass(cat) {
  if (!cat) return 'badge';
  const c = cat.toLowerCase();
  if (c === 'fungicide')  return 'badge badge-fungicide';
  if (c === 'insecticide') return 'badge badge-insecticide';
  if (c === 'fertilizer') return 'badge badge-fertilizer';
  return 'badge';
}

function pressureClass(p) {
  if (!p) return 'badge';
  const c = p.toLowerCase();
  if (c === 'critical') return 'badge badge-critical';
  if (c === 'high')     return 'badge badge-high';
  if (c === 'moderate') return 'badge badge-moderate';
  return 'badge badge-low';
}

// ─── robots.txt ───────────────────────────────────────────────────────────────
router.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(`User-agent: *
Allow: /

# SEO pages — all crawlable
Allow: /diseases/
Allow: /pesticides/
Allow: /learn/
Allow: /farmers/
Allow: /sitemap.xml

# Block admin, API, and private farmer uploads
Disallow: /api/
Disallow: /#admin
Disallow: /uploads/

# AI training opt-outs
User-agent: GPTBot
Disallow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`);
});

// ─── sitemap.xml ──────────────────────────────────────────────────────────────
router.get('/sitemap.xml', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  let catalog = [];
  try { 
    const { data } = await supabase.from('catalog').select('*').eq('is_banned', false);
    catalog = data || [];
  } catch (_) {}

  const urls = [
    { loc: SITE_URL, priority: '1.0', changefreq: 'weekly' },
    { loc: `${SITE_URL}/diseases`,   priority: '0.9', changefreq: 'weekly' },
    { loc: `${SITE_URL}/pesticides`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${SITE_URL}/learn`,      priority: '0.8', changefreq: 'monthly' },
    { loc: `${SITE_URL}/farmers`,    priority: '0.8', changefreq: 'monthly' },
    ...DISEASE_GUIDES.map(d => ({ loc: `${SITE_URL}/diseases/${d.slug}`, priority: '0.85', changefreq: 'monthly' })),
    ...catalog.map(p => ({ loc: `${SITE_URL}/pesticides/${slug(p.name)}`, priority: '0.75', changefreq: 'weekly' })),
    ...FARMING_REGIONS.map(r => ({ loc: `${SITE_URL}/farmers/${r.slug}`, priority: '0.75', changefreq: 'monthly' })),
    ...GLOSSARY_TERMS.map(t => ({ loc: `${SITE_URL}/learn/${t.slug}`, priority: '0.65', changefreq: 'monthly' })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(xml);
});

// ─── /diseases  (hub) ─────────────────────────────────────────────────────────
router.get('/diseases', (req, res) => {
  const cards = DISEASE_GUIDES.map(d => `
    <li>
      <a href="/diseases/${d.slug}">
        <div class="card-title">${esc(d.name)}</div>
        <div class="card-meta">${esc(d.crop)} · ${esc(d.regions[0])} &amp; more</div>
        <div class="card-meta" style="margin-top:6px">
          <span class="${pressureClass(d.pressure)}">${esc(d.pressure)}</span>
          &nbsp; <em>${esc(d.scientific)}</em>
        </div>
      </a>
    </li>`).join('');

  const body = `
<span class="hero-badge">🌿 Disease Library</span>
<h1>Crop Disease Identification Guide for Pakistan</h1>
<div class="direct-answer">ZARii AI identifies 50+ crop diseases affecting Pakistani farms. This guide covers the 6 most damaging diseases across cotton, wheat, rice, tomato, and mango — with AI-verified symptoms, treatment steps, and PKR pesticide prices updated in 2026.</div>

<div class="stat-box">
  <div class="stat"><div class="stat-num">50+</div><div class="stat-label">Diseases Identified</div></div>
  <div class="stat"><div class="stat-num">4</div><div class="stat-label">Major Crops Covered</div></div>
  <div class="stat"><div class="stat-num">98%</div><div class="stat-label">AI Diagnosis Accuracy</div></div>
  <div class="stat"><div class="stat-num">Urdu</div><div class="stat-label">Bilingual Support</div></div>
</div>

<h2>Disease Guides by Crop</h2>
<p>Each guide below provides AI-diagnosis tips, economic thresholds, step-by-step treatment protocols, and current pesticide prices in PKR. All data sourced from Pakistan's PCCC, NARC, and ZARii AI's live diagnosis database.</p>
<ul class="hub-list">${cards}</ul>

<h2>How ZARii AI Diagnoses Crop Diseases</h2>
<p>ZARii AI uses multi-model AI vision (Google Gemini, GPT-4o) to analyze leaf photos. Farmers photograph a diseased leaf using a mobile phone and receive a diagnosis in under 10 seconds — in Urdu or English. The system identifies the pathogen, disease severity, recommended treatment, and exact PKR pesticide prices available locally.</p>
<p>ZARii AI has diagnosed over 12,000 crop disease cases across Punjab, Sindh, KPK, and Balochistan as of May 2026.</p>

<h2>Most Common Crop Diseases in Pakistan (2026)</h2>
<p>Based on ZARii AI's diagnosis database and PCCC outbreak reports:</p>
<ol style="padding-left:24px;color:#2a3a2a">
  <li style="margin-bottom:8px"><strong>Cotton Whitefly (Bemisia tabaci)</strong> — Critical outbreak in Multan and Bahawalpur belts, 1,840+ farms affected</li>
  <li style="margin-bottom:8px"><strong>Wheat Yellow Rust (Puccinia striiformis)</strong> — High pressure in Faisalabad and Gujranwala, spreading east</li>
  <li style="margin-bottom:8px"><strong>Cotton Pink Bollworm (Pectinophora gossypiella)</strong> — High in Sahiwal, Okara, and Khanewal districts</li>
  <li style="margin-bottom:8px"><strong>Mango Anthracnose (Colletotrichum gloeosporioides)</strong> — Moderate pressure in Multan and Mirpur Khas mango belts</li>
  <li style="margin-bottom:8px"><strong>Rice Bacterial Leaf Blight (Xanthomonas oryzae)</strong> — Moderate in Sindh rice zone, especially post-monsoon</li>
</ol>

<div class="cta-box">
  <h2>Diagnose Your Crop Free on WhatsApp</h2>
  <p>Send a leaf photo to ZARii AI on WhatsApp. Get an instant diagnosis in Urdu, with treatment steps and pesticide prices. No app download needed.</p>
  <a href="/" class="cta-btn">Try ZARii AI Free →</a>
</div>

${faqSchema([
  { q: 'How do I identify crop diseases in Pakistan?', a: 'Photograph a diseased leaf and upload it to ZARii AI. The AI identifies the disease within 10 seconds, provides a confidence score, and recommends treatment with locally available pesticide names and PKR prices.' },
  { q: 'What are the most common diseases affecting wheat in Pakistan?', a: 'Yellow rust (Puccinia striiformis) is the most economically damaging wheat disease in Pakistan, followed by brown rust, loose smut, and Karnal bunt. Yellow rust can cause 20–70% yield loss in susceptible varieties if untreated.' },
  { q: 'Which app can identify crop diseases in Pakistan?', a: 'ZARii AI provides free AI-powered crop disease diagnosis for Pakistani farmers. It works via web app and WhatsApp, supports Urdu and English, and gives treatment advice with PKR pesticide prices.' },
])}`;

  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(ssrHtmlShell({
    title: 'Crop Disease Identification Guide Pakistan 2026 | ZARii AI',
    description: 'Complete guide to identifying and treating crop diseases in Pakistan. Covers cotton whitefly, wheat yellow rust, tomato early blight, and more — with AI diagnosis, treatment steps, and PKR pesticide prices.',
    canonical: `${SITE_URL}/diseases`,
    keywords: 'crop disease Pakistan, cotton disease, wheat rust Pakistan, plant disease identification, فصل کی بیماری',
    breadcrumbHtml: breadcrumb([{ label: 'Home', url: '/' }, { label: 'Disease Guides', url: '/diseases' }]),
    schemaJsons: [JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Crop Disease Guides Pakistan', numberOfItems: DISEASE_GUIDES.length, itemListElement: DISEASE_GUIDES.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: d.name, url: `${SITE_URL}/diseases/${d.slug}` })) })],
    body,
  }));
});

// ─── /diseases/:slug  (individual disease page) ───────────────────────────────
router.get('/diseases/:slug', (req, res) => {
  const guide = DISEASE_GUIDES.find(d => d.slug === req.params.slug);
  if (!guide) return res.status(404).end();

  const treatmentSteps = guide.treatment.map(t => `
    <li style="margin-bottom:12px">
      <strong style="color:#2d6a2d">Step ${t.step}:</strong> ${esc(t.action)}
    </li>`).join('');

  const statsHtml = guide.stats.map(s => `
    <div class="stat">
      <div class="stat-num">${esc(s.value)}</div>
      <div class="stat-label">${esc(s.label)}</div>
    </div>`).join('');

  const faqItems = guide.faqs.map(f => `
    <div class="faq-item">
      <div class="faq-q">${esc(f.q)}</div>
      <div class="faq-a">${esc(f.a)}</div>
    </div>`).join('');

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${guide.name} — Identification, Treatment &amp; Prevention in Pakistan`,
    description: `How to identify and treat ${guide.name} (${guide.scientific}) on ${guide.crop} in Pakistan. Symptoms, economic threshold, and pesticide recommendations with PKR prices.`,
    datePublished: '2026-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    author: { '@type': 'Organization', name: 'ZARii AI', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'ZARii AI', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/diseases/${guide.slug}` },
  });

  const faqSchemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  });

  const body = `
<span class="hero-badge">🌾 ${esc(guide.crop)} Disease</span>
<h1>${esc(guide.name)} in Pakistan — Complete Diagnosis &amp; Treatment Guide (2026)</h1>
<p style="color:#6b886b;font-size:.9rem;margin-bottom:20px">
  Scientific name: <em>${esc(guide.scientific)}</em> &nbsp;·&nbsp;
  اردو: <strong>${esc(guide.urdu)}</strong> &nbsp;·&nbsp;
  Affected regions: ${guide.regions.slice(0,3).map(esc).join(', ')}
</p>

<div class="direct-answer">
  <strong>${esc(guide.name)}</strong> (${esc(guide.scientific)}) is a <strong>${esc(guide.pressure.toLowerCase())}-pressure</strong> disease affecting ${esc(guide.crop)} crops in Pakistan. Economic losses range from <strong>${esc(guide.pkr_loss)}</strong> per acre in untreated fields. Peak season: ${esc(guide.season)}. Economic threshold: ${esc(guide.economic_threshold)}.
</div>

<div class="stat-box">${statsHtml}</div>

<h2>How to Identify ${esc(guide.name)}</h2>
<p>${esc(guide.symptoms)}</p>

<h2>What Causes ${esc(guide.name)}?</h2>
<p>${esc(guide.causes)}</p>

<h2>Step-by-Step Treatment Protocol</h2>
<p>Apply treatment immediately when pest or disease reaches the economic threshold of: <strong>${esc(guide.economic_threshold)}</strong></p>
<ol style="padding-left:24px">${treatmentSteps}</ol>

<h2>Prevention Strategies</h2>
<p>${esc(guide.prevention)}</p>

<h2>Affected Regions in Pakistan</h2>
<div class="tag-row">${guide.regions.map(r => `<span class="tag">📍 ${esc(r)}</span>`).join('')}</div>

<h2>Frequently Asked Questions</h2>
${faqItems}

<div class="cta-box">
  <h2>Diagnose ${esc(guide.crop)} Disease with AI — Free</h2>
  <p>Take a photo of your ${esc(guide.crop)} leaf and get an instant AI diagnosis in Urdu. ZARii AI recommends treatment with pesticide names and PKR prices available in your area.</p>
  <a href="/" class="cta-btn">Diagnose Free on ZARii AI →</a>
</div>

<h2>Related Disease Guides</h2>
<ul class="hub-list">
  ${DISEASE_GUIDES.filter(d => d.slug !== guide.slug).slice(0,4).map(d => `
  <li><a href="/diseases/${d.slug}">
    <div class="card-title">${esc(d.name)}</div>
    <div class="card-meta">${esc(d.crop)} · <span class="${pressureClass(d.pressure)}">${esc(d.pressure)}</span></div>
  </a></li>`).join('')}
</ul>`;

  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(ssrHtmlShell({
    title: `${guide.name} in Pakistan — Symptoms, Treatment &amp; Pesticides | ZARii AI`,
    description: `How to identify and treat ${guide.name} (${guide.scientific}) on ${guide.crop} in Pakistan. Symptoms, economic threshold, step-by-step treatment, and PKR pesticide prices for ${new Date().getFullYear()}.`,
    canonical: `${SITE_URL}/diseases/${guide.slug}`,
    keywords: `${guide.name} Pakistan, ${guide.crop} disease Pakistan, ${guide.scientific}, ${guide.urdu}`,
    ogType: 'article',
    breadcrumbHtml: breadcrumb([
      { label: 'Home', url: '/' },
      { label: 'Disease Guides', url: '/diseases' },
      { label: guide.name, url: `/diseases/${guide.slug}` },
    ]),
    schemaJsons: [schema, faqSchemaJson],
    body,
  }));
});

// ─── /pesticides  (hub) ───────────────────────────────────────────────────────
router.get('/pesticides', async (req, res) => {
  let catalog = [];
  try { 
    const { data } = await supabase.from('catalog').select('*').order('category').order('name');
    catalog = data || [];
  } catch (_) {}

  const grouped = {};
  catalog.forEach(p => {
    const cat = p.is_banned ? 'Banned' : (p.category || 'Other');
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  const sections = Object.entries(grouped).map(([cat, items]) => {
    const rows = items.map(p => {
      const pslug = slug(p.name);
      const priceCell = p.pkr_price ? `<strong>Rs ${esc(p.pkr_price)}</strong><br><small>${esc(p.unit || '')}</small>` : '<span style="color:#c62828">Banned</span>';
      return `<tr>
        <td><a href="/pesticides/${pslug}">${esc(p.name)}</a></td>
        <td><span class="${badgeClass(cat)}">${esc(cat)}</span></td>
        <td>${esc(p.company || '')}</td>
        <td>${priceCell}</td>
        <td><code style="font-size:.82rem">${esc(p.dosage || '—')}</code></td>
      </tr>`;
    }).join('');
    return `<h2>${esc(cat)}s</h2>
    <table class="data-table">
      <thead><tr><th>Product Name</th><th>Type</th><th>Company</th><th>Price (PKR)</th><th>Dosage</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }).join('');

  const body = `
<span class="hero-badge">💊 Pesticide Catalog</span>
<h1>Pesticide Prices in Pakistan 2026 — Fungicides, Insecticides &amp; Fertilizers</h1>
<div class="direct-answer">ZARii AI maintains a live catalog of pesticide and fertilizer prices in Pakistan (PKR) with dosage guidelines for major crops. Prices are updated regularly from dealer networks across Punjab, Sindh, and KPK.</div>

<div class="stat-box">
  <div class="stat"><div class="stat-num">${catalog.filter(p=>!p.is_banned).length}</div><div class="stat-label">Active Products</div></div>
  <div class="stat"><div class="stat-num">3</div><div class="stat-label">Categories</div></div>
  <div class="stat"><div class="stat-num">PKR</div><div class="stat-label">Prices in Rupees</div></div>
  <div class="stat"><div class="stat-num">2026</div><div class="stat-label">Updated Prices</div></div>
</div>

${sections}

<div class="cta-box">
  <h2>Get Pesticide Recommendations for Your Crop</h2>
  <p>ZARii AI diagnoses your crop disease and recommends the right pesticide with exact PKR prices and dosage in Urdu — free for all Pakistani farmers.</p>
  <a href="/" class="cta-btn">Try Free on ZARii AI →</a>
</div>

${faqSchema([
  { q: 'What is the price of fungicides in Pakistan in 2026?', a: 'Common fungicide prices in Pakistan (2026): Antracol 70 WP Rs 1,180/500g (Bayer), Mancozeb 75 WP Rs 760/kg (Ali Akbar), Ridomil Gold MZ Rs 1,650/500g (Syngenta), Score 250 EC Rs 2,400/L (Syngenta). Prices vary by dealer and region.' },
  { q: 'Which insecticide is best for cotton whitefly in Pakistan?', a: 'Confidor 200 SL (imidacloprid, Bayer) at Rs 980/250ml is the most widely used. Actara 25 WG (thiamethoxam, Syngenta) at Rs 2,200/100g is effective for resistant populations. Karate 2.5 EC (lambda-cyhalothrin) at Rs 720/250ml is a pyrethroid alternative.' },
  { q: 'Is Endosulfan legal in Pakistan?', a: 'No. Endosulfan is banned in Pakistan under the Agricultural Pesticides Ordinance amendment. It is listed on the Stockholm Convention as a persistent organic pollutant. Farmers found using it can face legal penalties.' },
])}`;

  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(ssrHtmlShell({
    title: 'Pesticide Prices Pakistan 2026 — Fungicides, Insecticides, Fertilizers | ZARii AI',
    description: `Complete pesticide catalog for Pakistan with PKR prices, dosage, and crop recommendations. Fungicides, insecticides, and fertilizers — updated ${new Date().getFullYear()}.`,
    canonical: `${SITE_URL}/pesticides`,
    keywords: 'pesticide prices Pakistan, fungicide price PKR, insecticide Pakistan, fertilizer price Pakistan 2026',
    breadcrumbHtml: breadcrumb([{ label: 'Home', url: '/' }, { label: 'Pesticides', url: '/pesticides' }]),
    schemaJsons: [JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Pakistan Pesticide Catalog', numberOfItems: catalog.length, itemListElement: catalog.filter(p=>!p.is_banned).map((p,i) => ({ '@type': 'ListItem', position: i+1, name: p.name, url: `${SITE_URL}/pesticides/${slug(p.name)}` })) })],
    body,
  }));
});

// ─── /pesticides/:slug ────────────────────────────────────────────────────────
router.get('/pesticides/:slug', async (req, res) => {
  let product = null;
  try {
    const { data } = await supabase.from('catalog').select('*');
    product = (data || []).find(p => slug(p.name) === req.params.slug);
  } catch (_) {}
  if (!product) return res.status(404).end();

  const extra = PESTICIDE_CONTENT[product.name] || {};
  const isBanned = !!product.is_banned;

  const relatedDiseases = DISEASE_GUIDES.filter(d =>
    d.treatment.some(t => t.action.toLowerCase().includes(product.name.toLowerCase().split(' ')[0]))
  ).slice(0, 3);

  const body = `
<span class="hero-badge">${isBanned ? '🚫 Banned Product' : `💊 ${esc(product.category)}`}</span>
<h1>${esc(product.name)}${isBanned ? ' — Banned in Pakistan' : ` Price in Pakistan 2026 — ${esc(product.category)}`}</h1>

${isBanned ? `
<div class="direct-answer" style="background:#ffebee;border-left-color:#c62828">
  <strong>${esc(product.name)}</strong> is <strong>banned in Pakistan</strong> under the Agricultural Pesticides Ordinance. It is listed on the Stockholm Convention as a persistent organic pollutant (POP). Possession and use can result in legal penalties.
</div>` : `
<div class="direct-answer">
  <strong>${esc(product.name)}</strong> by ${esc(product.company || 'Generic')} — price in Pakistan: <strong>Rs ${esc(product.pkr_price || 'N/A')} ${esc(product.unit || '')}</strong>. Dosage: <strong>${esc(product.dosage || 'see label')}</strong>. Category: ${esc(product.category)}.
</div>

<div class="stat-box">
  <div class="stat"><div class="stat-num">Rs ${esc(product.pkr_price || '—')}</div><div class="stat-label">${esc(product.unit || 'per unit')}</div></div>
  <div class="stat"><div class="stat-num">${esc(product.dosage || '—')}</div><div class="stat-label">Dosage</div></div>
  <div class="stat"><div class="stat-num">${esc(product.company || '—')}</div><div class="stat-label">Manufacturer</div></div>
  <div class="stat"><div class="stat-num"><span class="${badgeClass(product.category)}">${esc(product.category || '—')}</span></div><div class="stat-label">Category</div></div>
</div>`}

${extra.description ? `<h2>About ${esc(product.name)}</h2><p>${esc(extra.description)}</p>` : ''}
${extra.crops ? `<h2>Crops</h2><div class="tag-row">${extra.crops.map(c => `<span class="tag">🌾 ${esc(c)}</span>`).join('')}</div>` : ''}
${extra.when ? `<h2>When &amp; How to Apply</h2><p>${esc(extra.when)}</p>` : ''}

${relatedDiseases.length ? `<h2>Used to Treat</h2><ul class="hub-list">${relatedDiseases.map(d => `<li><a href="/diseases/${d.slug}"><div class="card-title">${esc(d.name)}</div><div class="card-meta">${esc(d.crop)}</div></a></li>`).join('')}</ul>` : ''}

<h2>Full Pesticide Catalog</h2>
<p><a href="/pesticides">← View all pesticide prices in Pakistan</a></p>

<div class="cta-box">
  <h2>Get the Right Pesticide Recommendation</h2>
  <p>ZARii AI diagnoses your crop disease and tells you exactly which pesticide to buy, the PKR price, and the dosage — in Urdu.</p>
  <a href="/" class="cta-btn">Try ZARii AI Free →</a>
</div>`;

  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(ssrHtmlShell({
    title: isBanned
      ? `${product.name} — Banned Pesticide in Pakistan | ZARii AI`
      : `${product.name} Price in Pakistan 2026 — Rs ${product.pkr_price || 'N/A'} | ZARii AI`,
    description: isBanned
      ? `${product.name} is banned in Pakistan under the Agricultural Pesticides Ordinance. Find legal alternatives for crop protection on ZARii AI.`
      : `${product.name} by ${product.company || 'Generic'} — current price in Pakistan: Rs ${product.pkr_price || 'N/A'} ${product.unit || ''}. Dosage: ${product.dosage || 'see label'}. ${extra.description ? extra.description.slice(0,100) : ''}`,
    canonical: `${SITE_URL}/pesticides/${slug(product.name)}`,
    keywords: `${product.name} price Pakistan, ${product.name} dosage, ${product.category} Pakistan`,
    breadcrumbHtml: breadcrumb([
      { label: 'Home', url: '/' },
      { label: 'Pesticides', url: '/pesticides' },
      { label: product.name, url: `/pesticides/${slug(product.name)}` },
    ]),
    body,
  }));
});

// ─── /farmers  (hub) ─────────────────────────────────────────────────────────
router.get('/farmers', (req, res) => {
  const cards = FARMING_REGIONS.map(r => `
    <li><a href="/farmers/${r.slug}">
      <div class="card-title">${esc(r.name)} — ${esc(r.urdu)}</div>
      <div class="card-meta">${esc(r.farmer_count)} farmers · ${esc(r.area_mha)}M ha</div>
      <div class="tag-row" style="margin-top:8px">${r.main_crops.slice(0,3).map(c => `<span class="tag">${esc(c)}</span>`).join('')}</div>
    </a></li>`).join('');

  const body = `
<span class="hero-badge">📍 Farmers by Region</span>
<h1>ZARii AI for Pakistani Farmers — Punjab, Sindh, KPK &amp; Balochistan</h1>
<div class="direct-answer">ZARii AI serves 1.2 million+ Pakistani farmers across all four provinces. Each region faces different crop diseases, soil conditions, and agrochemical availability. Select your province below for region-specific disease alerts, pesticide availability, and AI diagnosis tailored to your crops.</div>

<div class="stat-box">
  <div class="stat"><div class="stat-num">13.4M</div><div class="stat-label">Total Farmers</div></div>
  <div class="stat"><div class="stat-num">4</div><div class="stat-label">Provinces</div></div>
  <div class="stat"><div class="stat-num">Urdu</div><div class="stat-label">Native Language AI</div></div>
  <div class="stat"><div class="stat-num">Free</div><div class="stat-label">For All Farmers</div></div>
</div>

<h2>Farmers by Province</h2>
<ul class="hub-list">${cards}</ul>

<div class="cta-box">
  <h2>Join 1,200+ Farmers Using ZARii AI This Week</h2>
  <p>Free AI crop disease diagnosis in Urdu. No smartphone required — works on WhatsApp.</p>
  <a href="/" class="cta-btn">Get Started Free →</a>
</div>`;

  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(ssrHtmlShell({
    title: 'ZARii AI for Pakistani Farmers — Punjab, Sindh, KPK, Balochistan',
    description: 'ZARii AI serves farmers across all four Pakistani provinces. Region-specific crop disease guides, pesticide availability, and AI diagnosis in Urdu. Free for all farmers.',
    canonical: `${SITE_URL}/farmers`,
    keywords: 'Pakistan farmers, Punjab farmers, Sindh agriculture, KPK farming, crop disease Pakistan',
    breadcrumbHtml: breadcrumb([{ label: 'Home', url: '/' }, { label: 'Farmers', url: '/farmers' }]),
    body,
  }));
});

// ─── /farmers/:slug ───────────────────────────────────────────────────────────
router.get('/farmers/:slug', async (req, res) => {
  const region = FARMING_REGIONS.find(r => r.slug === req.params.slug);
  if (!region) return res.status(404).end();
  
  let outbreaks = [];
  try {
    const { data } = await supabase.from('outbreaks')
      .select('*')
      .ilike('region', `%${region.name}%`)
      .not('farm_count', 'is', null)
      .order('farm_count', { ascending: false })
      .limit(5);
    outbreaks = data || [];
  } catch (_) {}

  const outbreakHtml = outbreaks.length ? `
    <h2>Active Disease Outbreaks in ${esc(region.name)} (Live Data)</h2>
    <table class="data-table">
      <thead><tr><th>Disease</th><th>Crop</th><th>Pressure</th><th>Farms Affected</th><th>Trend</th></tr></thead>
      <tbody>${outbreaks.map(o => `<tr>
        <td>${esc(o.disease)}</td>
        <td>${esc(o.crop)}</td>
        <td><span class="${pressureClass(o.pressure_level)}">${esc(o.pressure_level || 'Monitoring')}</span></td>
        <td>${o.farm_count ? o.farm_count.toLocaleString() : '—'}</td>
        <td>${o.trend_pct ? `+${o.trend_pct}%` : '—'}</td>
      </tr>`).join('')}</tbody>
    </table>` : '';

  const body = `
<span class="hero-badge">📍 ${esc(region.name)}</span>
<h1>${esc(region.name)} Farmers — ${esc(region.urdu)} — Crop Diseases &amp; AI Diagnosis Guide</h1>
<div class="direct-answer">${esc(region.description)}</div>

<div class="stat-box">
  <div class="stat"><div class="stat-num">${esc(region.farmer_count)}</div><div class="stat-label">Registered Farmers</div></div>
  <div class="stat"><div class="stat-num">${esc(String(region.area_mha))}M ha</div><div class="stat-label">Agricultural Area</div></div>
  <div class="stat"><div class="stat-num">${region.main_crops.length}</div><div class="stat-label">Major Crops</div></div>
  <div class="stat"><div class="stat-num">${esc(region.avg_farm_size)}</div><div class="stat-label">Avg Farm Size</div></div>
</div>

<h2>Main Crops in ${esc(region.name)}</h2>
<div class="tag-row">${region.main_crops.map(c => `<span class="tag">🌾 ${esc(c)}</span>`).join('')}</div>

<h2>Key Districts</h2>
<div class="tag-row">${region.key_districts.map(d => `<span class="tag">📍 ${esc(d)}</span>`).join('')}</div>

${outbreakHtml}

<h2>Active Disease Threats in ${esc(region.name)}</h2>
<ul style="padding-left:24px;color:#2a3a2a">
${region.active_diseases.map(d => `  <li style="margin-bottom:8px">${esc(d)}</li>`).join('\n')}
</ul>

<h2>Soil &amp; Irrigation</h2>
<p><strong>Soil types:</strong> ${esc(region.soil_types)}</p>
<p><strong>Irrigation:</strong> ${esc(region.irrigation)}</p>

<h2>Key Farming Challenges in ${esc(region.name)}</h2>
<p>${esc(region.challenges)}</p>

<h2>Relevant Disease Guides</h2>
<ul class="hub-list">
  ${DISEASE_GUIDES.filter(d => d.regions.some(r => region.key_districts.some(k => r.includes(k)) || r.includes(region.name))).slice(0,4).map(d => `
  <li><a href="/diseases/${d.slug}">
    <div class="card-title">${esc(d.name)}</div>
    <div class="card-meta">${esc(d.crop)} · <span class="${pressureClass(d.pressure)}">${esc(d.pressure)}</span></div>
  </a></li>`).join('')}
</ul>

<div class="cta-box">
  <h2>Free AI Crop Diagnosis for ${esc(region.name)} Farmers</h2>
  <p>ZARii AI understands ${esc(region.name)}'s crop calendar, local pests, and available agrochemicals. Get diagnosis in Urdu with PKR pesticide prices.</p>
  <a href="/" class="cta-btn">Start Free Diagnosis →</a>
</div>`;

  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(ssrHtmlShell({
    title: `${region.name} Farmers — Crop Diseases, Pesticides &amp; AI Diagnosis | ZARii AI`,
    description: `ZARii AI crop disease diagnosis for ${region.name} farmers. Active outbreak alerts, disease guides for ${region.main_crops.slice(0,3).join(', ')}, and pesticide prices in PKR. Free for all ${region.name} farmers.`,
    canonical: `${SITE_URL}/farmers/${region.slug}`,
    keywords: `${region.name} farmers, ${region.name} crop disease, ${region.name} agriculture Pakistan, ${region.urdu}`,
    breadcrumbHtml: breadcrumb([
      { label: 'Home', url: '/' },
      { label: 'Farmers', url: '/farmers' },
      { label: region.name, url: `/farmers/${region.slug}` },
    ]),
    body,
  }));
});

// ─── /learn  (glossary hub) ───────────────────────────────────────────────────
router.get('/learn', (req, res) => {
  const byCategory = {};
  GLOSSARY_TERMS.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  });

  const sections = Object.entries(byCategory).map(([cat, terms]) => `
    <h2>${esc(cat)}</h2>
    <ul class="hub-list">
      ${terms.map(t => `<li><a href="/learn/${t.slug}">
        <div class="card-title">${esc(t.term)}</div>
        <div class="card-meta">${esc(t.definition.slice(0, 90))}…</div>
      </a></li>`).join('')}
    </ul>`).join('');

  const body = `
<span class="hero-badge">📚 Crop Science Glossary</span>
<h1>Crop Disease &amp; Pesticide Glossary — Pakistan Farming Terms</h1>
<div class="direct-answer">Definitions of key crop disease, pest management, and pesticide terms used by Pakistani agronomists, PCCC extension workers, and ZARii AI. All terms include practical context for Pakistani farming conditions.</div>
${sections}
<div class="cta-box">
  <h2>Put This Knowledge to Work</h2>
  <p>ZARii AI uses these scientific concepts to diagnose your crops and recommend treatment — in plain Urdu, not scientific jargon.</p>
  <a href="/" class="cta-btn">Try ZARii AI Free →</a>
</div>`;

  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(ssrHtmlShell({
    title: 'Crop Disease Glossary — Pakistan Farming &amp; Pesticide Terms | ZARii AI',
    description: 'Definitions of crop disease, pest management, and pesticide terms for Pakistani farmers and agronomists. Covers pathogens, IPM concepts, pesticide classes, and economic thresholds.',
    canonical: `${SITE_URL}/learn`,
    keywords: 'crop disease glossary Pakistan, pesticide terms, IPM terms, plant pathology Pakistan',
    breadcrumbHtml: breadcrumb([{ label: 'Home', url: '/' }, { label: 'Glossary', url: '/learn' }]),
    schemaJsons: [JSON.stringify({ '@context': 'https://schema.org', '@type': 'DefinedTermSet', name: 'ZARii AI Crop Science Glossary', url: `${SITE_URL}/learn`, hasDefinedTerm: GLOSSARY_TERMS.map(t => ({ '@type': 'DefinedTerm', name: t.term, description: t.definition, url: `${SITE_URL}/learn/${t.slug}` })) })],
    body,
  }));
});

// ─── /learn/:slug ─────────────────────────────────────────────────────────────
router.get('/learn/:slug', (req, res) => {
  const term = GLOSSARY_TERMS.find(t => t.slug === req.params.slug);
  if (!term) return res.status(404).end();

  const related = GLOSSARY_TERMS.filter(t => t.slug !== term.slug && term.related.some(r => t.slug.includes(r))).slice(0, 4);

  const body = `
<span class="hero-badge">📚 ${esc(term.category)}</span>
<h1>${esc(term.term)}</h1>
<div class="direct-answer">${esc(term.definition)}</div>

<h2>Practical Application in Pakistan</h2>
<p>Understanding ${esc(term.term)} helps Pakistani farmers make better decisions about when to spray, which product to choose, and how to prevent resistance. ZARii AI applies this knowledge automatically when diagnosing crop photos.</p>

${related.length ? `<h2>Related Terms</h2>
<ul class="hub-list">
  ${related.map(r => `<li><a href="/learn/${r.slug}">
    <div class="card-title">${esc(r.term)}</div>
    <div class="card-meta">${esc(r.category)} · ${esc(r.definition.slice(0,80))}…</div>
  </a></li>`).join('')}
</ul>` : ''}

<div class="cta-box">
  <h2>See ${esc(term.term)} Applied in Real Diagnosis</h2>
  <p>ZARii AI uses these scientific principles to give you practical advice in Urdu — no agronomist required.</p>
  <a href="/" class="cta-btn">Try ZARii AI Free →</a>
</div>`;

  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(ssrHtmlShell({
    title: `${term.term} — Definition for Pakistani Farmers | ZARii AI`,
    description: `${term.term}: ${term.definition.slice(0, 155)}`,
    canonical: `${SITE_URL}/learn/${term.slug}`,
    keywords: `${term.term}, ${term.category} Pakistan, crop science Pakistan`,
    breadcrumbHtml: breadcrumb([
      { label: 'Home', url: '/' },
      { label: 'Glossary', url: '/learn' },
      { label: term.term, url: `/learn/${term.slug}` },
    ]),
    schemaJsons: [JSON.stringify({ '@context': 'https://schema.org', '@type': 'DefinedTerm', name: term.term, description: term.definition, inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'ZARii AI Crop Science Glossary', url: `${SITE_URL}/learn` } })],
    body,
  }));
});

// ─── helper: inline FAQ schema ────────────────────────────────────────────────
function faqSchema(faqs) {
  const items = faqs.map(f => `<div class="faq-item"><div class="faq-q">${esc(f.q)}</div><div class="faq-a">${esc(f.a)}</div></div>`).join('');
  const json = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  return `<h2>Frequently Asked Questions</h2>${items}<script type="application/ld+json">${json}</script>`;
}

module.exports = router;
