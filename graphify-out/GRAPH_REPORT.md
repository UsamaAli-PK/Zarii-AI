# Graph Report - Zarii-AI  (2026-05-03)

## Corpus Check
- 48 files · ~209,325 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 146 nodes · 123 edges · 7 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `request()` - 7 edges
2. `ssrHtmlShell()` - 5 edges
3. `diagnoseImage()` - 5 edges
4. `callGemini()` - 5 edges
5. `callOpenAIVision()` - 4 edges
6. `buildDiagnosisPrompt()` - 3 edges
7. `parseAIResponse()` - 3 edges
8. `fetchKeys()` - 3 edges
9. `sendOTP()` - 3 edges
10. `getToken()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 1 - "Community 1"
Cohesion: 0.4
Nodes (8): buildDiagnosisPrompt(), callGemini(), callOpenAIVision(), diagnoseImage(), logFailover(), parseAIResponse(), updateKeyUsage(), validateImageUrl()

### Community 3 - "Community 3"
Cohesion: 0.46
Nodes (7): del(), get(), getAdminToken(), getToken(), patch(), post(), request()

### Community 4 - "Community 4"
Cohesion: 0.39
Nodes (5): esc(), footer(), header(), sharedCss(), ssrHtmlShell()

### Community 9 - "Community 9"
Cohesion: 0.6
Nodes (3): decrypt(), fetchKeys(), getServiceKey()

### Community 10 - "Community 10"
Cohesion: 0.6
Nodes (3): generateOTP(), sendOTP(), sendWhatsAppOTP()

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (2): runMigrations(), seedDefaults()

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (2): notifyBatch(), notifyGoogle()

## Knowledge Gaps
- **Thin community `Community 14`** (3 nodes): `migrate.js`, `runMigrations()`, `seedDefaults()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (3 nodes): `indexing.js`, `notifyBatch()`, `notifyGoogle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._