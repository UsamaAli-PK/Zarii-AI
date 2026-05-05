# Skills Quick Start Guide for Zarii-AI

**How to use each skill category with practical examples**

---

## 🎯 Global Skills

### `/graphify` — Knowledge Graph Visualization

**Create interactive knowledge graph of the project:**
```bash
/graphify F:/Github/Hackathons/Zarii-AI --html --obsidian
```

**Visualize just the backend code:**
```bash
/graphify F:/Github/Hackathons/Zarii-AI/backend --directed --cluster-only
```

**Export for Neo4j database:**
```bash
/graphify F:/Github/Hackathons/Zarii-AI --neo4j
```

**Use Cases:**
- Map AI provider failover chain relationships
- Visualize database schema and table relationships
- Create knowledge graph of agricultural diseases
- Document API endpoint dependencies

---

## 👥 Project Agents (Use with `Agent` tool)

### Backend Development

**Optimize database queries:**
```
Agent(
  description: "Optimize database queries",
  subagent_type: "backend-specialist",
  prompt: "Review backend/routes/admin/overview.js and suggest query optimizations for the scans table"
)
```

**Design new database schema:**
```
Agent(
  description: "Design new database schema",
  subagent_type: "database-architect",
  prompt: "Design a new table for tracking farmer engagement metrics with proper RLS policies"
)
```

**Set up Vercel deployment:**
```
Agent(
  description: "Configure Vercel deployment",
  subagent_type: "devops-engineer",
  prompt: "Set up Vercel deployment for Zarii-AI with environment variables and cron jobs"
)
```

### Frontend Development

**Build admin dashboard component:**
```
Agent(
  description: "Build admin dashboard",
  subagent_type: "frontend-specialist",
  prompt: "Create a React component for the admin overview dashboard showing real-time KPIs"
)
```

**Optimize React performance:**
```
Agent(
  description: "Optimize React performance",
  subagent_type: "performance-optimizer",
  prompt: "Profile the Analyze.jsx component and suggest performance improvements"
)
```

### Testing & Quality

**Create test suite:**
```
Agent(
  description: "Create test suite",
  subagent_type: "qa-automation-engineer",
  prompt: "Design a test suite for the diagnosis API endpoint with edge cases"
)
```

**Debug authentication issue:**
```
Agent(
  description: "Debug auth issue",
  subagent_type: "debugger",
  prompt: "Investigate why JWT tokens are expiring prematurely in the voice assistant"
)
```

### Security

**Conduct security audit:**
```
Agent(
  description: "Security audit",
  subagent_type: "security-auditor",
  prompt: "Review backend/middleware/auth.js and backend/services/apiKeys.js for security vulnerabilities"
)
```

**Penetration testing:**
```
Agent(
  description: "Penetration testing",
  subagent_type: "penetration-tester",
  prompt: "Perform authorized security testing on the admin authentication endpoints"
)
```

### Documentation

**Write API documentation:**
```
Agent(
  description: "Write API docs",
  subagent_type: "documentation-writer",
  prompt: "Create comprehensive API documentation for all admin endpoints in backend/routes/admin/"
)
```

**Explore codebase:**
```
Agent(
  description: "Explore codebase",
  subagent_type: "code-archaeologist",
  prompt: "Map out the AI failover chain implementation in backend/services/aiRouter.js"
)
```

### Planning & Strategy

**Plan sprint:**
```
Agent(
  description: "Plan sprint",
  subagent_type: "project-planner",
  prompt: "Create a 2-week sprint plan for completing the WhatsApp integration"
)
```

**Define product roadmap:**
```
Agent(
  description: "Define roadmap",
  subagent_type: "product-manager",
  prompt: "Create a 6-month product roadmap for Zarii-AI focusing on farmer retention"
)
```

### SEO & Marketing

**Develop SEO strategy:**
```
Agent(
  description: "SEO strategy",
  subagent_type: "seo-specialist",
  prompt: "Create an SEO strategy for Zarii-AI targeting Pakistani agricultural keywords"
)
```

---

## 🛠️ Secondary Skills (Use with `Skill` tool)

### Research & Analysis

**Deep research on market:**
```
Skill(
  skill: "deep-research",
  args: "Pakistani agricultural market size, farmer demographics, technology adoption 2024-2026"
)
```

**Competitive analysis:**
```
Skill(
  skill: "competitive-analysis",
  args: "Competitors to Zarii-AI in crop disease diagnosis: Plantix, Agrio, CropIn"
)
```

**SEO audit:**
```
Skill(
  skill: "seo-auditor",
  args: "Audit Zarii-AI website for SEO: keywords, backlinks, technical SEO"
)
```

### Content & Marketing

**Generate marketing content:**
```
Skill(
  skill: "content-machine",
  args: "Create 10 blog posts about common Pakistani crop diseases and treatments"
)
```

**Create ad copy:**
```
Skill(
  skill: "ad-creative",
  args: "Write 5 variations of WhatsApp ad copy targeting Pakistani farmers"
)
```

**Build infographics:**
```
Skill(
  skill: "infographic-builder",
  args: "Create infographic showing crop disease identification flowchart"
)
```

### Business & Finance

**Create financial model:**
```
Skill(
  skill: "excel-generator",
  args: "Build financial model for Zarii-AI: revenue projections, unit economics, CAC/LTV"
)
```

### Development & Automation

**Build programmatic SEO:**
```
Skill(
  skill: "programmatic-seo",
  args: "Create page generator for '[disease] in [region]' pages targeting 500+ combinations"
)
```

**Geographic optimization:**
```
Skill(
  skill: "geo",
  args: "Optimize Zarii-AI for Punjab and Sindh: location-specific content, regional keywords"
)
```

---

## 📊 Recommended Workflows

### Workflow 1: Complete Feature Development
```
1. Use project-planner to break down feature
2. Use backend-specialist to design API
3. Use frontend-specialist to build UI
4. Use qa-automation-engineer to create tests
5. Use security-auditor to review security
6. Use documentation-writer to document
```

### Workflow 2: Market Analysis & Strategy
```
1. Use deep-research for market sizing
2. Use competitive-analysis for competitor landscape
3. Use seo-specialist for SEO strategy
4. Use content-machine for content creation
5. Use product-manager for roadmap
```

### Workflow 3: Performance Optimization
```
1. Use performance-optimizer to profile
2. Use database-architect to optimize queries
3. Use backend-specialist to optimize APIs
4. Use qa-automation-engineer to test
5. Use debugger to verify improvements
```

### Workflow 4: Security Hardening
```
1. Use security-auditor for audit
2. Use penetration-tester for testing
3. Use backend-specialist to fix issues
4. Use devops-engineer to deploy securely
5. Use documentation-writer to document
```

### Workflow 5: Knowledge Management
```
1. Use graphify to visualize architecture
2. Use deep-research for research topics
3. Use documentation-writer for docs
4. Use code-archaeologist to explore code
```

---

## 🎯 Skills by Project Phase

### Phase 1: Planning & Analysis
- **deep-research** — Market research
- **competitive-analysis** — Competitor analysis
- **project-planner** — Project planning
- **product-manager** — Product strategy
- **graphify** — Architecture visualization

### Phase 2: Development
- **backend-specialist** — API development
- **frontend-specialist** — UI development
- **database-architect** — Schema design
- **mobile-developer** — Mobile features
- **debugger** — Bug fixes

### Phase 3: Testing & QA
- **qa-automation-engineer** — Test automation
- **test-engineer** — Test design
- **performance-optimizer** — Performance testing
- **security-auditor** — Security testing

### Phase 4: Deployment & Operations
- **devops-engineer** — Deployment setup
- **performance-optimizer** — Performance tuning
- **security-auditor** — Security hardening

### Phase 5: Marketing & Growth
- **seo-specialist** — SEO strategy
- **programmatic-seo** — Page generation
- **content-machine** — Content creation
- **ad-creative** — Ad copy
- **competitive-analysis** — Market positioning

---

## 💡 Pro Tips

1. **Use graphify first** to understand project structure before deep work
2. **Use deep-research** before making strategic decisions
3. **Use security-auditor** before deploying to production
4. **Use performance-optimizer** when users report slowness
5. **Use documentation-writer** to keep docs in sync with code
6. **Use project-planner** to break down complex features
7. **Use debugger** when stuck on a bug for >30 minutes

---

## 🔗 Integration Examples

### Example 1: Add New Feature
```
1. /graphify to understand current architecture
2. Agent(project-planner) to plan feature
3. Agent(backend-specialist) to design API
4. Agent(frontend-specialist) to build UI
5. Agent(qa-automation-engineer) to test
6. Agent(security-auditor) to review
7. Agent(documentation-writer) to document
```

### Example 2: Optimize Performance
```
1. Agent(performance-optimizer) to profile
2. Agent(database-architect) to optimize queries
3. Agent(backend-specialist) to optimize APIs
4. Skill(deep-research) to research best practices
5. Agent(qa-automation-engineer) to verify
```

### Example 3: Launch Marketing Campaign
```
1. Skill(competitive-analysis) to analyze competitors
2. Skill(deep-research) to research market
3. Agent(seo-specialist) to plan SEO
4. Skill(programmatic-seo) to build pages
5. Skill(content-machine) to generate content
6. Skill(ad-creative) to create ads
```

---

## 📞 When to Use Each Skill

| Situation | Skill | Command |
|-----------|-------|---------|
| Need to understand architecture | graphify | `/graphify [path]` |
| Stuck on a bug | debugger | `Agent(subagent_type: "debugger")` |
| Need to optimize queries | database-architect | `Agent(subagent_type: "database-architect")` |
| Need to build UI | frontend-specialist | `Agent(subagent_type: "frontend-specialist")` |
| Need security review | security-auditor | `Agent(subagent_type: "security-auditor")` |
| Need market research | deep-research | `Skill(skill: "deep-research")` |
| Need competitor analysis | competitive-analysis | `Skill(skill: "competitive-analysis")` |
| Need SEO strategy | seo-specialist | `Agent(subagent_type: "seo-specialist")` |
| Need to generate pages | programmatic-seo | `Skill(skill: "programmatic-seo")` |
| Need content | content-machine | `Skill(skill: "content-machine")` |

---

*Last Updated: 2026-05-04*
