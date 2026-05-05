# PSEO (Programmatic SEO)

The strategy for generating 35+ optimized web pages programmatically to capture search traffic from AI engines (ChatGPT, Perplexity) and traditional search engines.

## Overview

Programmatic SEO (pSEO) generates pages at scale using templates and data:

- **35+ Pages:** Diseases, pesticides, regions, glossary
- **Templates:** Reusable page structures
- **Data:** Sourced from [[crop-disease-diagnosis]], product catalog, regional data
- **Optimization:** Each page optimized for search engines and AI engines

## Four Playbooks

### 1. Disease Pages (10+ pages)

Each disease gets a dedicated page:

- **URL:** `/disease/early-blight`, `/disease/powdery-mildew`, etc.
- **Content:** Symptoms, prevention, treatment, regional prevalence
- **Data Source:** [[crop-disease-diagnosis]] database
- **SEO:** Optimized for "early blight treatment Pakistan" queries
- **AI Optimization:** Answer-first structure for ChatGPT/Perplexity

### 2. Pesticide Pages (10+ pages)

Each pesticide gets a dedicated page:

- **URL:** `/pesticide/antracol-70-wp`, `/pesticide/confidor-200-sl`, etc.
- **Content:** Active ingredient, dosage, price, effectiveness, safety
- **Data Source:** Product catalog with PKR pricing
- **SEO:** Optimized for "antracol price Pakistan" queries
- **AI Optimization:** Structured data for AI extraction

### 3. Regional Pages (5+ pages)

Each region gets a dedicated page:

- **URL:** `/region/punjab`, `/region/sindh`, etc.
- **Content:** Crops, diseases, seasonal calendar, local experts
- **Data Source:** [[punjab]], [[sindh]] entity pages
- **SEO:** Optimized for "crop diseases Punjab" queries
- **AI Optimization:** Regional context for localized answers

### 4. Glossary Pages (10+ pages)

Agricultural terms get dedicated pages:

- **URL:** `/glossary/powdery-mildew`, `/glossary/fungicide`, etc.
- **Content:** Definition, symptoms, treatment, related terms
- **Data Source:** Agricultural terminology database
- **SEO:** Optimized for "what is powdery mildew" queries
- **AI Optimization:** Concise definitions for AI extraction

## AI Engine Optimization

Pages are optimized for AI engines:

- **Answer-First:** Lead with direct answer (not buried in text)
- **Structured Data:** JSON-LD markup for AI parsing
- **Citations:** Expert sources for credibility
- **Entity Clarity:** Clear entity relationships (disease → treatment → product)
- **Conciseness:** Scannable sections for AI extraction

## SEO Strategy

Pages are optimized for traditional search:

- **Keywords:** Target long-tail keywords ("early blight treatment Pakistan")
- **Meta Tags:** Title, description, keywords
- **Headings:** H1, H2, H3 hierarchy
- **Internal Links:** Cross-linking between related pages
- **Mobile:** Responsive design for mobile search

## Information Moat

pSEO creates competitive advantage:

- **Content Depth:** 35+ pages vs. competitors' 5-10
- **Freshness:** Pages updated automatically as data changes
- **Localization:** Pakistan-specific content (prices, diseases, regions)
- **Authority:** Backed by real farmer diagnoses and expert data

## Implementation

Pages are generated via:

1. **Template Engine:** Jinja2 or similar
2. **Data Pipeline:** Extract from [[supabase]]
3. **Build Process:** Generate static HTML
4. **Deployment:** Deploy to CDN for fast loading
5. **Monitoring:** Track search rankings and AI mentions

## Related Concepts

- [[zarii-ai]] — Main platform
- [[geo-generative-engine-optimization]] — GEO strategy
- [[crop-disease-diagnosis]] — Data source
- [[punjab]], [[sindh]] — Regional pages
