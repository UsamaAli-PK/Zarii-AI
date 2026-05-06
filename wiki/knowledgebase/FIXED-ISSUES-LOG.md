# ZARii AI - Fixed Issues Knowledgebase

> Record of all audit issues that have been FIXED and verified

**Last Updated**: May 5, 2026

---

## Security Fixes

| # | Issue | File | Fix Applied | Date |
|---|-------|------|-------------|------|
| 1 | OTP stored in plain text | backend/services/otp.js | Now using bcrypt.hash(code, 10) | May 2026 |
| 2 | Admin Users RLS disabled | Supabase | RLS enabled with policies | May 2026 |

---

## Validation Fixes

| # | Issue | File | Fix Applied | Date |
|---|-------|------|-------------|------|
| 3 | No input sanitization on admin name | backend/routes/admin/team.js | Added sanitizeInput() | May 2026 |
| 4 | Role validation missing trim | backend/middleware/adminAuth.js | Added role?.trim() in isValidRole | May 2026 |

---

## SEO Fixes

| # | Issue | File | Fix Applied | Date |
|---|-------|------|-------------|------|
| 5 | No robots.txt | backend/seo/seoRoutes.js | Implemented at /robots.txt | May 2026 |
| 6 | No sitemap.xml | backend/seo/seoRoutes.js | Implemented at /sitemap.xml | May 2026 |
| 7 | Privacy meta tags missing | frontend-assets/index.html | Added meta tags | May 2026 |
| 8 | Open Graph tags missing | frontend-assets/index.html | Added og:* tags | May 2026 |
| 9 | JSON-LD schema missing | frontend-assets/index.html | Added application/ld+json | May 2026 |

---

## SPEC Compliance Fixes

| # | Requirement | File | Fix Applied | Date |
|---|-------------|------|-------------|------|
| 10 | Two-step AI workflow | backend/services/aiRouter.js | Separate detectDisease and getSolution calls | May 2026 |
| 11 | Disease hidden until solution | frontend-assets/components/Analyze.jsx | 3-stage reveal animation | May 2026 |
| 12 | Sponsored products to second AI | backend/routes/diagnose.js | Products fetched before AI, passed to Step 2 | May 2026 |
| 13 | Punjabi language support | shared.jsx, aiRouter.js, voice.js | Added PA language option | May 2026 |
| 14 | IP-based location detection | backend/routes/diagnose.js | Added detectCityFromIP() | May 2026 |
| 15 | Weather shown with diagnosis | frontend-assets/components/Analyze.jsx | Weather context strip added | May 2026 |
| 16 | Weather stored with scan | backend/db/supabase-schema.sql | Added city, weather_temp, weather_humidity, weather_condition columns | May 2026 |
| 17 | Location stored with scan | backend/db/supabase-schema.sql | Added city column to scans table | May 2026 |
| 18 | Voice vs chat format tracked | backend/db/supabase-schema.sql | Added input_format column to voice_queries | May 2026 |
| 19 | Treatments linked to catalog | backend/routes/diagnose.js | Added catalog_id fuzzy matching | May 2026 |
| 20 | Response in user language | backend/services/aiRouter.js | Prompts specify language response | May 2026 |

---

## UI/UX Fixes

| # | Issue | File | Fix Applied | Date |
|---|-------|------|-------------|------|
| 21 | Voice mic stop button not working | frontend-assets/components/Pages.jsx | Added proper stream cleanup and state handling | May 5, 2026 |
| 22 | Voice message not showing in chat | frontend-assets/components/Pages.jsx | Added WhatsApp-style voice message display with play button and waveform | May 5, 2026 |
| 23 | No thinking indicator from AI | frontend-assets/components/Pages.jsx | Improved state management for thinking indicator | May 5, 2026 |
| 24 | Landing page squeezed on mobile | frontend-assets/components/Landing.jsx, styles.css | Simplified aggressive CSS, fixed responsive breakpoints | May 5, 2026 |
| 25 | Duplicate header code in Landing.jsx | frontend-assets/components/Landing.jsx | Removed duplicate </header> tag and orphan styles | May 5, 2026 |
| 26 | Inconsistent button styles | frontend-assets/styles.css | Standardized padding, font sizes, hover/focus/active states | May 5, 2026 |
| 27 | Missing loading states | Multiple components | Added skeleton loading states | May 5, 2026 |
| 28 | Inconsistent form input styles | Onboarding.jsx, Analyze.jsx | Standardized input styles across all forms | May 5, 2026 |
| 29 | Accessibility gaps | Multiple components | Added focus outlines, improved color contrast, added ARIA labels | May 5, 2026 |
| 30 | Inconsistent spacing system | styles.css | Implemented 4px grid spacing system | May 5, 2026 |

---

## Mobile Responsiveness Fixes (May 6, 2026)

| # | Issue | File | Fix Applied | Date |
|---|-------|------|-------------|------|
| 31 | Admin sidebar unusable on mobile (overflows viewport) | Admin.jsx + styles.css | Sidebar converts to fixed bottom tab bar at ≤900px via CSS; `display: contents` on group wrappers flattens structure | May 6, 2026 |
| 32 | Admin KPI/two-col/three-col grids not collapsing on mobile | Admin.jsx + AdminTabs.jsx + styles.css | Added `.admin-kpi-grid`, `.admin-two-col`, `.admin-three-col` class names; CSS collapses to 1-col at ≤900px/≤480px | May 6, 2026 |
| 33 | Landing features/testimonials/CTA grids not responsive | Landing.jsx + styles.css | Added `.features-grid`, `.testimonials-grid`, `.cta-grid` class names; CSS uses `!important` to override inline styles | May 6, 2026 |
| 34 | Landing header overflows on mobile, no mobile nav | Landing.jsx + styles.css | Added hamburger button + state-driven mobile dropdown with nav links, lang toggle, CTA | May 6, 2026 |
| 35 | Dashboard container padding excessive on mobile | Dashboard.jsx + styles.css | Added `.dashboard-container` class name; padding reduces to 16px at ≤768px | May 6, 2026 |
| 36 | Analyze container padding excessive on mobile | Analyze.jsx + styles.css | Added `.analyze-page-container` class name; padding reduces to 16px at ≤768px | May 6, 2026 |
| 37 | All admin data tables overflow horizontally on mobile | Admin.jsx + AdminTabs.jsx | Wrapped all 10 data tables in `table-wrapper` div with `overflowX: auto` and `minWidth` constraint | May 6, 2026 |
| 38 | Admin command palette overflows viewport on mobile | Admin.jsx + styles.css | Added `.admin-cmd-palette` class name; width set to `calc(100vw - 32px)` on mobile | May 6, 2026 |
| 39 | Inline React `style={{}}` grid props unresponsive to CSS media queries | All components | Root cause: inline styles need `!important` in `@media` rules to be overridden. Fixed by adding class names to all grid containers and using `!important` in breakpoint rules | May 6, 2026 |

---

## Total Fixed: 39 Issues

| Category | Count |
|----------|-------|
| Security | 2 |
| Validation | 2 |
| SEO | 5 |
| SPEC Compliance | 11 |
| UI/UX | 10 |
| Mobile Responsiveness | 9 |

---

*This knowledgebase records all verified fixes for audit issues.*