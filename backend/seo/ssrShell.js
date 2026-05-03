'use strict';

const path = require('path');
const fs   = require('fs');

let LOGO_B64 = '';
try {
  const buf = fs.readFileSync(path.join(__dirname, '../../assets/zarii-logo.png'));
  LOGO_B64 = `data:image/png;base64,${buf.toString('base64')}`;
} catch (_) {}

const SITE_NAME = 'ZARii AI';
const SITE_URL  = process.env.SITE_URL || 'https://zarii.ai';
const TWITTER   = '@ZARiiAI';
const YEAR      = new Date().getFullYear();

function sharedCss() {
  return `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',system-ui,sans-serif;color:#1a2e1a;background:#f8faf5;line-height:1.6}
    a{color:#2d6a2d;text-decoration:none}a:hover{text-decoration:underline}
    .ssr-header{background:#fff;border-bottom:1px solid #e0ead8;padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
    .ssr-logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:1.1rem;color:#1a2e1a}
    .ssr-logo img{height:36px;width:auto}
    .ssr-nav{display:flex;gap:24px;align-items:center;font-size:.9rem}
    .ssr-nav a{color:#4a7a4a;font-weight:500}
    .ssr-cta{background:#2d6a2d;color:#fff!important;padding:8px 18px;border-radius:8px;font-weight:600;font-size:.88rem}
    .ssr-main{max-width:900px;margin:0 auto;padding:40px 24px 80px}
    .breadcrumb{font-size:.82rem;color:#6b886b;margin-bottom:28px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
    .breadcrumb a{color:#4a7a4a}
    .breadcrumb-sep{color:#aaa}
    .hero-badge{display:inline-flex;align-items:center;gap:6px;background:#e8f5e8;color:#2d6a2d;font-size:.78rem;font-weight:600;padding:4px 12px;border-radius:20px;margin-bottom:16px;text-transform:uppercase;letter-spacing:.04em}
    h1{font-size:2rem;font-weight:800;color:#0f1f0f;line-height:1.2;margin-bottom:16px}
    h2{font-size:1.3rem;font-weight:700;color:#1a2e1a;margin:36px 0 12px;padding-bottom:6px;border-bottom:2px solid #e0ead8}
    h3{font-size:1.05rem;font-weight:600;color:#2d4a2d;margin:24px 0 8px}
    p{margin-bottom:14px;color:#2a3a2a}
    .direct-answer{background:#e8f5e8;border-left:4px solid #2d6a2d;padding:18px 22px;border-radius:0 8px 8px 0;margin:20px 0 28px;font-size:1.05rem;color:#0f1f0f;font-weight:500}
    .stat-box{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin:20px 0}
    .stat{background:#fff;border:1px solid #e0ead8;border-radius:10px;padding:16px;text-align:center}
    .stat-num{font-size:1.6rem;font-weight:800;color:#2d6a2d}
    .stat-label{font-size:.78rem;color:#6b886b;margin-top:4px}
    .data-table{width:100%;border-collapse:collapse;margin:20px 0;font-size:.9rem}
    .data-table th{background:#e8f5e8;padding:10px 14px;text-align:left;font-weight:600;color:#0f1f0f;border-bottom:2px solid #c5dbc5}
    .data-table td{padding:10px 14px;border-bottom:1px solid #e8f0e8;color:#2a3a2a}
    .data-table tr:hover td{background:#f4faf4}
    .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:600}
    .badge-fungicide{background:#fff3e0;color:#e65100}
    .badge-insecticide{background:#fce4ec;color:#c62828}
    .badge-fertilizer{background:#e8f5e8;color:#2e7d32}
    .badge-banned{background:#ffebee;color:#c62828}
    .badge-critical{background:#ffebee;color:#b71c1c}
    .badge-high{background:#fff3e0;color:#e65100}
    .badge-moderate{background:#fffde7;color:#f57f17}
    .badge-low{background:#e8f5e8;color:#2e7d32}
    .faq-item{border-bottom:1px solid #e0ead8;padding:18px 0}
    .faq-q{font-weight:700;color:#0f1f0f;margin-bottom:8px;font-size:.98rem}
    .faq-a{color:#2a3a2a;font-size:.92rem}
    .cta-box{background:#2d6a2d;color:#fff;border-radius:14px;padding:36px 28px;text-align:center;margin:48px 0}
    .cta-box h2{color:#fff;border:none;margin-top:0;font-size:1.5rem}
    .cta-box p{color:#c5e8c5;margin-bottom:22px}
    .cta-btn{display:inline-block;background:#fff;color:#2d6a2d;font-weight:700;padding:12px 28px;border-radius:8px;font-size:1rem}
    .grid-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin:20px 0}
    .card{background:#fff;border:1px solid #e0ead8;border-radius:10px;padding:18px;transition:box-shadow .15s}
    .card:hover{box-shadow:0 4px 16px rgba(45,106,45,.12)}
    .card-title{font-weight:700;color:#0f1f0f;margin-bottom:6px;font-size:.96rem}
    .card-meta{font-size:.8rem;color:#6b886b}
    .card-price{font-size:1.1rem;font-weight:800;color:#2d6a2d;margin-top:10px}
    .tag-row{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
    .tag{background:#e8f5e8;color:#2d6a2d;padding:4px 12px;border-radius:20px;font-size:.78rem;font-weight:600}
    .hub-list{list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin:20px 0}
    .hub-list li a{display:block;background:#fff;border:1px solid #e0ead8;border-radius:8px;padding:14px 18px;color:#2d6a2d;font-weight:600;font-size:.92rem;transition:background .15s}
    .hub-list li a:hover{background:#e8f5e8;text-decoration:none}
    .ssr-footer{background:#0f1f0f;color:#8aaa8a;padding:36px 24px;text-align:center;font-size:.82rem;margin-top:80px}
    .ssr-footer a{color:#6ab06a}
    .ssr-footer-links{display:flex;flex-wrap:wrap;gap:20px;justify-content:center;margin-bottom:18px}
    @media(max-width:600px){h1{font-size:1.4rem}.stat-box{grid-template-columns:1fr 1fr}.ssr-nav{gap:14px}}
  `;
}

function header() {
  const logoHtml = LOGO_B64
    ? `<img src="${LOGO_B64}" alt="ZARii AI logo" width="36" height="36" />`
    : `<span style="font-size:1.5rem">🌿</span>`;
  return `
<header class="ssr-header">
  <a class="ssr-logo" href="/">
    ${logoHtml}
    <span>ZARii<span style="color:#2d6a2d"> AI</span></span>
  </a>
  <nav class="ssr-nav">
    <a href="/diseases">Diseases</a>
    <a href="/pesticides">Pesticides</a>
    <a href="/learn">Glossary</a>
    <a href="/farmers">Farmers</a>
    <a href="/" class="ssr-cta">Try Free</a>
  </nav>
</header>`;
}

function footer() {
  return `
<footer class="ssr-footer">
  <div class="ssr-footer-links">
    <a href="/diseases">Disease Guides</a>
    <a href="/pesticides">Pesticide Catalog</a>
    <a href="/learn">Glossary</a>
    <a href="/farmers">Farmers by Region</a>
    <a href="/sitemap.xml">Sitemap</a>
    <a href="/">ZARii AI App</a>
  </div>
  <p>© ${YEAR} ZARii AI · AI-powered crop disease diagnosis for Pakistani farmers · Built for Punjab, Sindh, KPK, Balochistan</p>
  <p style="margin-top:8px">Bilingual Urdu &amp; English · WhatsApp Bot · Free for Farmers</p>
</footer>`;
}

function ssrHtmlShell({
  title,
  description,
  canonical,
  schemaJsons = [],
  keywords = '',
  lang = 'en',
  ogType = 'website',
  breadcrumbHtml = '',
  body,
}) {
  const fullTitle = title.includes('ZARii') ? title : `${title} | ${SITE_NAME}`;
  const allSchemas = [
    JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${SITE_URL}/#organization`,
          name: 'ZARii AI',
          url: SITE_URL,
          description: 'AI-powered crop disease diagnosis for Pakistani farmers. Snap a leaf photo and get instant diagnosis, treatment advice, and pesticide prices in Urdu and English.',
          areaServed: 'PK',
          knowsLanguage: ['ur', 'en'],
          sameAs: [],
        },
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          url: SITE_URL,
          name: 'ZARii AI',
          publisher: { '@id': `${SITE_URL}/#organization` },
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/learn/{search_term_string}` },
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    }),
    ...schemaJsons,
  ];

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}" />
  ${keywords ? `<meta name="keywords" content="${esc(keywords)}" />` : ''}
  <link rel="canonical" href="${esc(canonical)}" />
  <meta name="robots" content="index, follow" />

  <meta property="og:title" content="${esc(fullTitle)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:locale" content="en_PK" />
  <meta property="og:site_name" content="${SITE_NAME}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="${TWITTER}" />
  <meta name="twitter:title" content="${esc(fullTitle)}" />
  <meta name="twitter:description" content="${esc(description)}" />

  <meta name="theme-color" content="#2d6a2d" />
  <link rel="icon" type="image/png" href="/assets/farmer-badge.png" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" /></noscript>

  ${allSchemas.map(s => `<script type="application/ld+json">${s}</script>`).join('\n  ')}

  <style>${sharedCss()}</style>
</head>
<body>
${header()}
${breadcrumbHtml}
<main class="ssr-main">
${body}
</main>
${footer()}
</body>
</html>`;
}

function breadcrumb(items) {
  const parts = items.map((item, i) =>
    i < items.length - 1
      ? `<a href="${item.url}">${esc(item.label)}</a><span class="breadcrumb-sep">›</span>`
      : `<span>${esc(item.label)}</span>`
  ).join('');
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  });
  return `<div style="background:#fff;border-bottom:1px solid #e0ead8;padding:10px 24px">
<div style="max-width:900px;margin:0 auto"><nav class="breadcrumb" aria-label="Breadcrumb">${parts}</nav></div>
</div>
<script type="application/ld+json">${schema}</script>`;
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slug(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

module.exports = { ssrHtmlShell, breadcrumb, esc, slug, SITE_URL };
