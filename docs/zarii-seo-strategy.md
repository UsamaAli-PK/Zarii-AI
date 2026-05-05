# ZARii AI — SEO, GEO & Programmatic-SEO Strategy

**Last updated:** May 2026  
**Author:** ZARii AI Team  
**Status:** Phase 1 implemented and live

---

## Executive Summary

ZARii AI targets Pakistani farmers searching for crop disease help in Urdu and English. The strategy combines three layers:

1. **Technical SEO** — Making the site crawlable (was invisible to Googlebot as a pure SPA)
2. **Programmatic SEO** — Scaling to 35+ server-rendered pages using proprietary data (disease database, live PKR prices, outbreak data)
3. **GEO (Generative Engine Optimization)** — Structuring content so ChatGPT, Perplexity, and Google AI Overviews cite ZARii AI as the authority on Pakistani crop diseases

**Information gain advantage:** ZARii AI has data no competitor possesses — live disease outbreak counts by region, real PKR pesticide prices from dealer networks, and AI diagnosis statistics from 12,000+ real scans. This is the unfakeable moat.

---

## Part 1: Technical SEO Foundation

### Problems Fixed

| Issue | Before | After |
|---|---|---|
| `robots.txt` | SPA returned `<!DOCTYPE html>` | Proper `User-agent: *` plain text |
| `sitemap.xml` | SPA returned `<!DOCTYPE html>` | Valid XML, 35 URLs, auto-updates |
| Googlebot visibility | Saw `<div id="root"></div>` on all URLs | Full HTML content on all SEO pages |
| `index.html` meta | Title only, no description or schema | Full OG, Twitter Card, canonical, 3 JSON-LD schemas |
| Font loading | Blocking render (LCP impact) | Async preload with `media="print"` swap pattern |

### Architecture Decision: Express SSR alongside SPA

The app is a vanilla React SPA (CDN Babel). Googlebot cannot execute JavaScript, so the SPA is invisible for indexing purposes. Rather than migrating to Next.js, the correct approach for an existing Express app is to add SSR routes *before* the SPA fallback:

```
Request → Express
  ├── /api/*            → JSON API routes
  ├── /diseases/*       → SSR HTML (SEO pages — fully crawlable)
  ├── /pesticides/*     → SSR HTML
  ├── /farmers/*        → SSR HTML
  ├── /learn/*          → SSR HTML
  ├── /robots.txt       → Plain text
  ├── /sitemap.xml      → XML
  └── everything else  → SPA fallback (React app)
```

**Verification method:** `curl -s https://zarii.ai/diseases/cotton-whitefly-pakistan | grep "Bemisia"` — if the keyword appears in the raw output, Googlebot can index it.

### Schema Markup Deployed

| Schema type | Where | Purpose |
|---|---|---|
| `Organization` + `WebSite` | Every page (shell) | Entity identity for Google Knowledge Graph |
| `SoftwareApplication` | `index.html` | App store-style rich results |
| `Article` + `datePublished` | Disease pages | News/freshness signals, byline trust |
| `FAQPage` | Disease + hub pages | Featured snippets + Google AI Overviews |
| `BreadcrumbList` | Every SSR page | Sitelinks in SERPs |
| `DefinedTerm` + `DefinedTermSet` | Glossary pages | Knowledge panel potential |
| `ItemList` | Hub pages | Carousel rich results |

### Cache Strategy

| Page type | Cache header | Reason |
|---|---|---|
| Static (glossary, disease guides) | `public, max-age=86400` | Content rarely changes |
| Live data (pesticide prices, outbreak pages) | `public, s-maxage=3600, stale-while-revalidate=86400` | Prices change weekly |
| `sitemap.xml` | `public, max-age=3600` | Catalog additions should appear quickly |
| SPA (`index.html`) | `no-cache` | Always serve latest JS bundle |

---

## Part 2: Programmatic SEO Playbooks

### Why pSEO Works for ZARii AI

Programmatic SEO requires genuinely different data per page — not just swapped city names in boilerplate. ZARii AI passes this test:

- The **Cotton Whitefly** page has different biology, different treatment protocol, different affected districts, different economic threshold, and different PKR prices than the **Wheat Yellow Rust** page
- The **Punjab** region page has different active diseases, different outbreak counts (live from DB), different crop calendar, and different soil types than the **Sindh** page
- The **Antracol 70 WP** price page has a genuinely different price, company, dosage, and use-case than the **Confidor 200 SL** page

### Playbook 1: Disease Guides `/diseases/:slug`

**Pattern:** `crop-disease-pakistan` (e.g. `cotton-whitefly-pakistan`, `wheat-yellow-rust-pakistan`)  
**Current scale:** 6 pages  
**Target scale:** 40–60 pages  
**Information gain:** Proprietary outbreak data, AI diagnosis statistics, Pakistan-specific economic thresholds, PKR treatment costs

**Target queries:**
- "cotton whitefly treatment Pakistan"
- "گندم کا زرد زنگ علاج" (wheat yellow rust treatment — Urdu)
- "how to identify early blight on tomatoes"
- "wheat rust fungicide Pakistan price"

**Expansion roadmap:**
```
Phase 2 (next 20 pages):
- rice-blast-pakistan
- sugarcane-red-rot-pakistan
- potato-late-blight-pakistan
- chilli-anthracnose-pakistan
- citrus-greening-pakistan
- maize-stem-borer-pakistan
- onion-purple-blotch-pakistan
- sunflower-alternaria-pakistan
... etc.
```

### Playbook 2: Pesticide Prices `/pesticides/:slug`

**Pattern:** `product-name` (e.g. `antracol-70-wp`, `confidor-200-sl`)  
**Current scale:** 10 pages (all non-banned products)  
**Target scale:** 50–100 pages  
**Information gain:** Live PKR prices from dealer networks, dosage per crop, AI-recommended usage context, banned product warnings

**Target queries:**
- "Antracol 70 WP price Pakistan 2026"
- "Confidor 200 SL dosage cotton"
- "fungicide price PKR 2026"
- "is Endosulfan banned in Pakistan"

**Unique angle:** No other site in Pakistan shows current PKR pesticide prices alongside crop-specific dosage and disease use-cases in a single page. This is the core information gain.

**Price freshness:** Prices are served from the live `catalog` database table — when admin updates prices via the Admin Catalog tab, all SEO pages automatically reflect the new price. No manual page updates needed.

### Playbook 3: Farmers by Region `/farmers/:slug`

**Pattern:** `province-farmers` (e.g. `punjab-farmers`, `sindh-farmers`)  
**Current scale:** 4 pages (all provinces)  
**Target scale:** 30–40 pages (expand to districts)  
**Information gain:** Live outbreak data per region from DB, province-specific crop calendars, soil types, irrigation systems

**Target queries:**
- "Punjab farmers crop disease 2026"
- "Faisalabad wheat disease alert"
- "Sindh mango disease treatment"
- "KPK tomato disease Pakistan"

**Expansion roadmap — district-level pages:**
```
/farmers/multan        /farmers/faisalabad
/farmers/gujranwala    /farmers/bahawalpur
/farmers/sahiwal       /farmers/hyderabad
... (30 major agricultural districts)
```

District pages have the highest commercial intent — a farmer in Multan searching "cotton disease Multan" is more likely to sign up than someone searching generically.

### Playbook 4: Glossary `/learn/:slug`

**Pattern:** `term-slug` (e.g. `economic-threshold`, `ipm`, `neonicotinoid`)  
**Current scale:** 10 terms  
**Target scale:** 80–120 terms  
**Information gain:** Pakistan-specific context (e.g. resistance patterns in Punjab's cotton belt), practical application framing, cross-links to real disease and pesticide pages

**Target queries:**
- "what is economic threshold in farming"
- "IPM Pakistan crops"
- "systemic vs contact fungicide difference"
- "neonicotinoid resistance cotton Pakistan"

**Topical authority value:** Glossary pages build topical depth that signals expertise to Google. They rank for long-tail terms with low competition and link to commercial pages (disease guides → pesticide pages → app CTA).

---

## Part 3: GEO — Generative Engine Optimization

GEO is distinct from SEO. The goal is not to rank in blue links but to be *cited as a source* when someone asks ChatGPT, Perplexity, or Google AI Overviews about crop diseases in Pakistan.

### Research-Backed Signals (Princeton/IIT Delhi, KDD 2024)

| Signal | Visibility lift | Implementation |
|---|---|---|
| Statistics with specific numbers | +33.9% | Every page has a stat box (farms affected, yield loss %, economic threshold) |
| Expert citations / named sources | +32% | Pages cite PCCC, NARC, Pakistan Agriculture Research Council by name |
| Fluent, structured writing | +30% | Short paragraphs, answer-first structure, no filler phrases |
| Authoritative inline citations | +30.3% | References to official bodies in body text |

### Answer-First Structure (Applied to Every Page)

Every SEO page opens with a **Direct Answer Block** — a 40–60 word summary that directly answers the core query. Example from the Cotton Whitefly page:

> *Cotton Whitefly (Bemisia tabaci) is a critical-pressure disease affecting Cotton crops in Pakistan. Economic losses range from 15,000–60,000 per acre in untreated fields. Peak season: June–October (peak July–September). Economic threshold: 10 nymphs per leaf or 5 adults per yellow sticky trap per 24 hours.*

This block is extractable as a standalone answer. AI engines pull opening statements more than buried conclusions.

### FAQPage Schema — Featured Snippet and AI Overview Target

Every disease page includes 3–4 FAQ items in the exact phrasing farmers use in ChatGPT:

- "How do I identify [disease] in Pakistan?"
- "What fungicide/insecticide is best for [disease] in Pakistan?"
- "What varieties are resistant to [disease] in Pakistan?"

FAQPage JSON-LD schema is injected on every page so Google AI Overviews can extract structured Q&A pairs directly.

### Entity Clarity — Named Explicitly

AI engines match entities by name, not pronouns. Every page uses the full name of:
- The disease (both English and Urdu, scientific name in italics)
- The pathogen/pest (genus and species)
- The province/district
- The pesticide (brand name + active ingredient)
- The company (Bayer, Syngenta, Ali Akbar, Engro, FFC)

This maximizes entity matching in AI knowledge graphs.

### Quotable Statistics Per Page

Each page contains at least 4 specific data points that work as standalone citations:
- Farm count from ZARii AI's outbreak database
- Yield loss range (%)
- PKR loss per acre in untreated fields
- Economic threshold (specific number, not vague)
- Spray efficacy percentage where available

---

## Part 4: Internal Linking Architecture

### Hub and Spoke Model

```
Homepage (/)
├── /diseases  (hub)
│   ├── /diseases/cotton-whitefly-pakistan
│   ├── /diseases/wheat-yellow-rust-pakistan
│   └── ... (6 pages today → 60 target)
├── /pesticides  (hub)
│   ├── /pesticides/confidor-200-sl
│   ├── /pesticides/antracol-70-wp
│   └── ... (10 pages today → 100 target)
├── /farmers  (hub)
│   ├── /farmers/punjab-farmers
│   └── ... (4 pages today → 40 target)
└── /learn  (hub)
    ├── /learn/ipm
    └── ... (10 pages today → 120 target)
```

### Cross-Links Between Playbooks (Avoiding Orphan Pages)

Every disease page links to:
- Relevant pesticide pages (disease → treatment → product page)
- Relevant region pages (disease → affected districts → region page)

Every pesticide page links to:
- Disease pages where the product is recommended
- Pesticide hub (`/pesticides`)

Every region page links to:
- Disease pages active in that region
- Region hub (`/farmers`)

### Main App Footer

The SPA `Landing.jsx` footer now has a 4-column link grid to all hub pages and top spokes. This ensures:
- No SEO page is orphaned (all reachable within 2 clicks from homepage)
- Google distributes PageRank from the main app to the SEO section
- Users navigating the React app can discover the reference content

---

## Part 5: Sitemap Strategy

The `/sitemap.xml` route is **dynamically generated** from live data:

```
Priority 1.0  →  Homepage
Priority 0.9  →  Hub pages (/diseases, /pesticides, /farmers, /learn)
Priority 0.85 →  Disease guide pages
Priority 0.75 →  Pesticide product pages + region pages
Priority 0.65 →  Glossary term pages
```

**Auto-maintenance:** The sitemap queries the `catalog` table at runtime. When a new pesticide is added via the Admin Catalog tab, it automatically appears in the sitemap. No manual sitemap editing required.

**Google submission:** After deploying, submit `https://zarii.ai/sitemap.xml` to Google Search Console. Monitor the "Coverage" report weekly for the first 8 weeks.

---

## Part 6: robots.txt — Bot Governance

```
User-agent: *
Allow: /

# SEO pages — all crawlable
Allow: /diseases/
Allow: /pesticides/
Allow: /learn/
Allow: /farmers/

# Block admin and API
Disallow: /api/
Disallow: /#admin

# GPTBot (OpenAI training scraper) — blocked
# ZARii AI content should be cited, not trained on without permission
User-agent: GPTBot
Disallow: /

# Google-Extended (Gemini training) — allowed
# Google indexes and cites; Gemini citations benefit ZARii AI visibility
User-agent: Google-Extended
Allow: /
```

---

## Part 7: Measurement & Iteration Plan

### KPIs to Track in Google Search Console

| Metric | Target (6 months) | Check frequency |
|---|---|---|
| Total indexed pages | 35+ of 35 submitted | Weekly |
| Impressions from `/diseases/*` | 500+/month | Monthly |
| Impressions from `/pesticides/*` | 300+/month | Monthly |
| Average position for disease queries | Top 20 | Monthly |
| CTR on disease pages | >3% | Monthly |
| "Crawled, not indexed" errors | 0 | Weekly |

### GEO Measurement

Test monthly by asking these prompts in ChatGPT, Perplexity, and Google AI Overview:
- "What is the best treatment for cotton whitefly in Pakistan?"
- "What fungicide should I use for wheat yellow rust in Pakistan?"
- "How do I identify early blight on tomatoes?"
- "What is the price of Confidor 200 SL in Pakistan?"

Track: Does ZARii AI get cited? Does `zarii.ai` appear as a source link?

### 8-Week Review Decision Framework

```
After 8 weeks:

Indexed AND getting impressions?
  YES, position <10  → Monitor; optimize title/meta for CTR
  YES, position 11-30 → Improve content depth; add more data points
  YES, position >30   → Thin content or high competition; rewrite or merge

Not indexed (Crawled, not indexed)?
  <20 pages → Submit to Search Console for inspection; check for duplication
  20+ pages → Content too thin; enrich data or reduce page count

Not crawled?
  → Check sitemap submission
  → Check robots.txt for accidental blocks
  → Check crawl budget (too many low-quality pages)
```

---

## Part 8: Phase 2 Expansion Roadmap

### Immediate (next 30 days)

1. **Set `SITE_URL` environment variable** to actual deployed domain — all canonical URLs and sitemap auto-update
2. **Submit sitemap** to Google Search Console
3. **Add 10 more disease pages** (potato late blight, rice blast, citrus greening, maize stem borer, sugarcane red rot are highest-volume searches)
4. **District-level region pages** — `/farmers/multan`, `/farmers/faisalabad`, `/farmers/gujranwala` (high commercial intent, low competition)

### Medium-term (30–90 days)

5. **Crop-specific pesticide guides** — `/pesticides/fungicides-for-wheat`, `/pesticides/insecticides-for-cotton` (category landing pages)
6. **Seasonal alert pages** — `/alerts/cotton-season-2026`, `/alerts/wheat-rabi-2026` (time-sensitive, high GEO potential)
7. **Urdu-language pages** — `/ur/diseases/cotton-whitefly-pakistan` with `hreflang` tags (massive untapped search volume in Urdu)
8. **Expand glossary to 50+ terms** — targeting every term in ZARii AI's AI diagnosis output

### Long-term (90+ days)

9. **Comparison pages** — `/compare/mancozeb-vs-score`, `/compare/confidor-vs-actara` (high commercial intent)
10. **Crop calendars** — `/crops/wheat-pakistan`, `/crops/cotton-pakistan` (seasonal planting and disease windows)
11. **Structured data for diagnosis results** — if diagnosis pages become shareable, add `MedicalCondition`-equivalent schema for plant diseases
12. **Backlink strategy** — outreach to PARC, NARC, Punjab Agriculture Department, Dawn News agriculture section for citations

---

## Appendix: SEO Files Reference

| File | Purpose |
|---|---|
| `backend/seo/ssrShell.js` | Shared HTML shell function — edit once, all pages update |
| `backend/seo/seoData.js` | Disease guides, pesticide content, region data, glossary terms |
| `backend/seo/seoRoutes.js` | All Express SSR routes (robots, sitemap, all 4 playbooks) |
| `ZARii AI Web App.html` | SPA entry point — OG tags, canonical, JSON-LD schema |
| `components/Landing.jsx` | Footer with 4-column SEO link grid |

**To add a new disease page:** Add a new object to `DISEASE_GUIDES` array in `seoData.js`. The page, sitemap entry, breadcrumb, schema, and related-pages links all generate automatically.

**To add a new glossary term:** Add a new object to `GLOSSARY_TERMS` array in `seoData.js`. Same auto-generation applies.
