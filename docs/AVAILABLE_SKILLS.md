# Available Skills for Zarii-AI Project

**Generated:** 2026-05-04  
**Total Skills:** 63 (20 Agents + 2 Global Skills + 41 Secondary Skills)

---

## 🎯 Global Skills (Always Available)

### 1. **graphify** — `/graphify`
- **Description:** Convert any input (code, docs, papers, images) into a knowledge graph with community detection
- **Outputs:** Interactive HTML, GraphRAG-ready JSON, audit report
- **Use Cases for Zarii-AI:**
  - Map AI provider relationships and failover chains
  - Visualize database schema and RLS policies
  - Create knowledge graph of agricultural diseases
  - Document market analysis and competitive landscape
- **Trigger:** `/graphify [path] [options]`
- **Location:** `~/.claude/skills/graphify/`

### 2. **gstack** — Stack Management
- **Description:** Manage and organize development stacks
- **Location:** `~/.claude/skills/gstack/`

---

## 👥 Project-Level Agents (`.agents/agents/`)

These are specialized agents for different roles. Invoke via `Agent` tool with `subagent_type`.

### Backend & Infrastructure
1. **backend-specialist** — Backend architecture, API design, server optimization
2. **database-architect** — Database schema, query optimization, RLS policies
3. **devops-engineer** — Deployment, CI/CD, infrastructure, Vercel/Supabase setup
4. **performance-optimizer** — Performance profiling, optimization, caching strategies

### Frontend & UI
5. **frontend-specialist** — React components, UI/UX, CDN-based frontend
6. **game-developer** — Interactive features, animations, gamification

### Development & Testing
7. **debugger** — Bug diagnosis, error analysis, troubleshooting
8. **qa-automation-engineer** — Test automation, test coverage, QA strategy
9. **test-engineer** — Test design, test cases, testing frameworks

### Security & Compliance
10. **security-auditor** — Security review, vulnerability assessment, threat modeling
11. **penetration-tester** — Authorized security testing, CTF challenges, defensive security

### Documentation & Knowledge
12. **documentation-writer** — Technical docs, API documentation, wiki pages
13. **code-archaeologist** — Code exploration, legacy code analysis, refactoring

### Planning & Strategy
14. **project-planner** — Project planning, task breakdown, timeline estimation
15. **product-manager** — Product strategy, feature prioritization, roadmap
16. **product-owner** — Requirements gathering, user stories, acceptance criteria
17. **orchestrator** — Multi-agent coordination, complex task orchestration

### Specialized Roles
18. **seo-specialist** — SEO strategy, programmatic SEO, GEO optimization
19. **mobile-developer** — Mobile app development, cross-platform solutions
20. **explorer-agent** — Codebase exploration, file discovery, pattern matching

---

## 🛠️ Secondary Skills (`.local/secondary_skills/`)

### Research & Analysis
- **deep-research** — Comprehensive multi-source research with structured reports
- **competitive-analysis** — Competitor analysis, market positioning, strategic recommendations
- **github-solution-finder** — Find solutions in GitHub repositories
- **seo-auditor** — SEO audit, keyword analysis, optimization recommendations
- **stock-analyzer** — Financial analysis, stock research
- **supplier-research** — Supplier evaluation and research

### Content & Marketing
- **content-machine** — Bulk content generation, content calendars
- **ad-creative** — Ad copy, creative variations, campaign optimization
- **branding-generator** — Brand identity, naming, positioning
- **podcast-generator** — Podcast script generation
- **podcast-marketing** — Podcast promotion and marketing strategy
- **storyboard** — Visual storyboarding, narrative planning
- **infographic-builder** — Data visualization, infographic creation

### Business & Finance
- **excel-generator** — Financial models, spreadsheets, data analysis
- **invoice-generator** — Invoice creation and management
- **tax-reviewer** — Tax optimization, compliance review
- **insurance-optimizer** — Insurance analysis and optimization
- **real-estate-analyzer** — Real estate market analysis

### HR & Recruitment
- **ai-recruiter** — Recruitment strategy, candidate sourcing
- **ai-sdr** — Sales development, outreach sequences
- **ai-secretary** — Administrative tasks, scheduling, organization
- **interview-prep** — Interview preparation, coaching

### Design & Creative
- **design-thinker** — Design thinking methodology, problem solving
- **photo-editor** — Image editing, photo manipulation
- **video-editing** — Video editing, post-production
- **recreate-screenshot** — Recreate UI from screenshots
- **website-cloning** — Clone website design and functionality

### Productivity & Utilities
- **file-converter** — File format conversion
- **flashcard-generator** — Spaced repetition learning
- **legal-contract** — Contract generation and review
- **meal-planner** — Meal planning and nutrition
- **personal-shopper** — Shopping recommendations
- **recipe-creator** — Recipe generation and meal ideas
- **resume-maker** — Resume creation and optimization
- **travel-assistant** — Travel planning and itineraries

### Development & Automation
- **programmatic-seo** — Build SEO-optimized pages at scale
- **geo** — Geographic optimization and location-based features
- **skill-creator** — Create custom skills
- **skill-finder** — Discover and recommend skills
- **replit-migration-guardrails** — Replit migration assistance

---

## 🎯 Recommended Skills for Zarii-AI

### For Current Tasks
| Task | Recommended Skills |
|------|-------------------|
| **Wiki Expansion** | deep-research, documentation-writer, graphify |
| **Admin Dashboard** | frontend-specialist, performance-optimizer, debugger |
| **Database Optimization** | database-architect, performance-optimizer |
| **Security Review** | security-auditor, penetration-tester |
| **API Documentation** | documentation-writer, backend-specialist |
| **Market Analysis** | competitive-analysis, deep-research, seo-specialist |
| **SEO Strategy** | seo-specialist, programmatic-seo, geo |
| **Testing** | qa-automation-engineer, test-engineer, debugger |
| **Deployment** | devops-engineer, performance-optimizer |

### For Feature Development
| Feature | Recommended Skills |
|---------|-------------------|
| **Voice Assistant** | backend-specialist, frontend-specialist, debugger |
| **Disease Diagnosis** | database-architect, performance-optimizer, security-auditor |
| **WhatsApp Integration** | backend-specialist, devops-engineer |
| **Admin Panel** | frontend-specialist, database-architect, security-auditor |
| **Programmatic SEO** | seo-specialist, programmatic-seo, content-machine |
| **Mobile App** | mobile-developer, frontend-specialist |

---

## 📋 How to Use Skills

### Invoke a Global Skill
```bash
/graphify F:/Github/Hackathons/Zarii-AI/wiki --html --obsidian
```

### Invoke a Project Agent
```
Agent(
  description: "Optimize database queries",
  subagent_type: "database-architect",
  prompt: "Review the scans table queries in backend/routes/admin/overview.js and suggest optimizations"
)
```

### Invoke a Secondary Skill
```
Skill(
  skill: "deep-research",
  args: "Pakistani agricultural market trends 2024-2026"
)
```

---

## 🔍 Skills by Category

### 🏗️ Architecture & Design
- database-architect
- backend-specialist
- frontend-specialist
- devops-engineer
- design-thinker
- graphify

### 🔒 Security & Compliance
- security-auditor
- penetration-tester
- legal-contract
- tax-reviewer

### 📊 Analysis & Research
- deep-research
- competitive-analysis
- seo-auditor
- stock-analyzer
- real-estate-analyzer

### 🚀 Performance & Optimization
- performance-optimizer
- seo-specialist
- programmatic-seo
- geo

### 📝 Content & Documentation
- documentation-writer
- content-machine
- ad-creative
- branding-generator

### 🧪 Testing & Quality
- qa-automation-engineer
- test-engineer
- debugger

### 💼 Business & Strategy
- product-manager
- product-owner
- project-planner
- competitive-analysis

### 🎨 Creative & Design
- design-thinker
- infographic-builder
- storyboard
- photo-editor
- video-editing

---

## 💡 Quick Reference

**For Zarii-AI Development:**
- **Backend work:** backend-specialist, database-architect, debugger
- **Frontend work:** frontend-specialist, performance-optimizer
- **Security:** security-auditor, penetration-tester
- **Documentation:** documentation-writer, deep-research
- **SEO/Marketing:** seo-specialist, programmatic-seo, competitive-analysis
- **Deployment:** devops-engineer, performance-optimizer
- **Testing:** qa-automation-engineer, test-engineer

**For Knowledge Management:**
- **Visualize architecture:** graphify
- **Research topics:** deep-research
- **Create documentation:** documentation-writer
- **Analyze market:** competitive-analysis, deep-research

---

## 📍 Skill Locations

- **Global Skills:** `~/.claude/skills/`
- **Project Agents:** `F:/Github/Hackathons/Zarii-AI/.agents/agents/`
- **Secondary Skills:** `F:/Github/Hackathons/Zarii-AI/.local/secondary_skills/`

---

## 🚀 Next Steps

1. **Use graphify** to visualize the project architecture
2. **Use deep-research** for market analysis
3. **Use backend-specialist** for API optimization
4. **Use security-auditor** for security review
5. **Use seo-specialist** for SEO strategy

---

*Last Updated: 2026-05-04*
