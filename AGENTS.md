# ZARii AI Knowledge Base (LLM Wiki)

This file defines the conventions and workflows for building and maintaining the ZARii AI personal knowledge base.

## 📁 Structure

- `raw/`: Immutable source documents (articles, papers, transcripts, etc.).
- `wiki/`: LLM-generated markdown files.
    - `wiki/index.md`: Master catalog of all wiki pages.
    - `wiki/log.md`: Chronological log of operations (ingests, queries, etc.).
    - `wiki/entities/`: Key people, organizations, products (e.g., Supabase, Gemini).
    - `wiki/concepts/`: Technical or domain concepts (e.g., RAG, Crop Diseases, OTP).
    - `wiki/sources/`: One summary page per ingested raw source.
    - `wiki/synthesis/`: Cross-cutting analysis and evolving theses.

## 🛠 Workflows

### Ingest
When a new source is added to `raw/`:
1. Read the source.
2. Summarize key takeaways in `wiki/sources/[source-name].md`.
3. Update relevant pages in `wiki/entities/` and `wiki/concepts/`.
4. Create new pages if necessary.
5. Update `wiki/index.md`.
6. Append entry to `wiki/log.md` with prefix: `## [YYYY-MM-DD] ingest | [Source Title]`.

### Query
When answering complex questions:
1. Consult `wiki/index.md` to find relevant pages.
2. Synthesize an answer with citations to wiki pages.
3. If the answer is valuable, file it back into `wiki/synthesis/` or relevant sections.
4. Append entry to `wiki/log.md` with prefix: `## [YYYY-MM-DD] query | [Question]`.

### Lint
Periodically health-check the wiki:
1. Find contradictions or stale claims.
2. Identify orphan pages or missing cross-references.
3. Suggest new questions to investigate.
4. Append entry to `wiki/log.md` with prefix: `## [YYYY-MM-DD] lint | [Check Type]`.

## ✍️ Writing Conventions
- Use Wikilinks `[[page-name]]` for all cross-references.
- Keep pages focused and interlinked.
- Prefer synthesis and compounding value over simple summarization.
- The wiki is a persistent artifact; avoid re-discovering information from scratch.
