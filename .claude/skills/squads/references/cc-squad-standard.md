# CC Squad Standard — Definitive Reference

> This is the source of truth for squad file formats. All new squads MUST follow this standard. Existing squads should be migrated.

## Agent File Format

**Location:** `agents/{agent-name}.md`

### Frontmatter (runtime config — LLM never sees this)

```yaml
---
name: agent-name
description: "One paragraph: when to use this agent and what it does"
tools: [Read, Write, Bash, web_search]    # optional — omit for all tools
model: sonnet                              # optional — omit to inherit
---
```

**Required:** `name`, `description`
**Optional:** `tools`, `model`, `effort`, `maxTurns`, `memory`, `context`, `background`, `isolation`, `mcpServers`, `hooks`

### Body (system prompt — this is ALL the LLM sees)

The body follows a **4-section structure**. Target: **1000–2000 tokens** (4000–8000 chars).

```markdown
[One paragraph: who you are, what you do, your approach. No headers.]

## Guidelines
[3–7 bullet points: your core operating principles. Positive statements only.]

## Process
[Numbered steps: what you do when activated. Be specific, not abstract.]

## Output
[Expected format, where to save, schema references if any.]
```

### Why this structure

| Section | Purpose | Token budget |
|---------|---------|-------------|
| Opening paragraph | Identity + approach — primes the LLM's behavior | ~200 tokens |
| Guidelines | Operating principles — the LLM references these on every decision | ~300 tokens |
| Process | Concrete steps — ensures consistent execution | ~500 tokens |
| Output | Delivery format — ensures usable results | ~200 tokens |

**Total: ~1200 tokens.** Leaves 98.8% of a 100K context window for actual work.

### What does NOT go in the agent file

| Don't include | Why | Where it goes |
|---------------|-----|---------------|
| `agent.id` | Redundant with filename | Nowhere (filename IS the id) |
| `agent.icon` | UI metadata | `squad.yaml` → `agents_metadata` |
| `agent.version` | Squad has version | Nowhere |
| `agent.phase` / `agent.tier` | Orchestration metadata | Workflow definition |
| `persona_profile.archetype` | UI category | `squad.yaml` → `agents_metadata` |
| `greeting_levels` | UI chrome | Nowhere (unnecessary) |
| `commands` as YAML array | Instruction for LLM | Body → ## Process or ## Commands |
| `collaboration` | Documentation | Workflow definition or body |
| `voice_dna` | Instruction for LLM | Body opening paragraph |
| `core_principles` as YAML | Instruction for LLM | Body → ## Guidelines |
| Anti-patterns | Negative examples waste tokens | Omit (positive guidelines are more effective) |
| Self-diagnosis | Meta-reasoning | Omit (QA agent handles quality) |
| Cognitive patterns | Abstract meta-description | Omit (LLM already knows how to think) |
| Psychological composition | Flavor text | Omit |
| Edge cases | Rarely triggered | Omit (handle in task-specific context) |
| Validation metrics | Self-evaluation | Omit (external QA) |

### Example: researcher agent

```yaml
---
name: researcher
description: "Research topics using web search. Finds competitors, analyzes trends, compares alternatives. Use when you need data-backed analysis before making decisions."
tools: [Read, Write, Bash, web_search, fetch_page]
model: sonnet
---

You are a senior research analyst. You investigate topics by searching the web for real data — never guess or fabricate. Every claim must have a source. You compare at least 3 alternatives for any decision and present findings in structured JSON.

## Guidelines
- Search the web for every factual claim. If you can't find a source, say so.
- Compare at least 3 alternatives with concrete pros/cons for each.
- Cite sources with URLs. No source = no claim.
- Prioritize recent data (2025–2026). Flag anything older than 2 years.
- Output JSON following the schema. No prose reports unless asked.

## Process
1. Parse the research brief to identify specific questions to answer.
2. Run 3–5 targeted web searches (specific queries, not broad).
3. For each finding, extract: source URL, key data point, date, relevance.
4. Compare alternatives in a decision matrix (option × criteria).
5. Write structured findings to `output/research-report.json`.

## Output
JSON file at `output/research-report.json` with:
- `findings[]`: source, data, date, relevance
- `alternatives[]`: option, pros, cons, verdict
- `recommendation`: best option with rationale
- `confidence`: high/medium/low based on source quality
```

**Size: ~1100 tokens.** Contains everything the LLM needs. Zero waste.

---

## Task File Format

**Location:** `tasks/{task-name}.md`

### Frontmatter

```yaml
---
name: task-name
description: "What this task accomplishes in one sentence"
---
```

**Required:** `name`
**Optional:** `description`, `context` (fork/inline), `allowed-tools`

### Body

```markdown
# Task Name

## Input
[What this task receives and from where]

## Steps
[Numbered steps with specific actions]

## Output
[What to produce and where to save it]

## Acceptance Criteria
[Verifiable conditions for completion]
```

### Why tasks don't have `owner`

In the CC model, a task describes WHAT to do. The WORKFLOW decides WHO does it. This decouples tasks from agents — the same task can be executed by different agents in different contexts.

```yaml
# workflow.yaml — this is where agent↔task binding lives
steps:
  - id: research
    agent: researcher          # WHO
    task: research-topic       # WHAT
  - id: review
    agent: reviewer
    task: review-findings
```

---

## squad.yaml Changes

### Agent metadata (moved from agent frontmatter)

```yaml
# squad.yaml
agents_metadata:
  researcher:
    icon: "🔬"
    archetype: Builder
    phase: discovery
    tier: 1
    color: blue
  reviewer:
    icon: "🛡️"
    archetype: Guardian
    phase: quality
    tier: 2
```

This metadata is for the squads.sh marketplace UI. Agents don't need it to function.

---

## Token Budget Guidelines

| Agent complexity | Target body size | Sections |
|-----------------|-----------------|----------|
| Simple (single task) | 500–800 tokens | Paragraph + process + output |
| Standard (multi-step) | 800–1500 tokens | Paragraph + guidelines + process + output |
| Complex (domain expert) | 1500–2000 tokens | Paragraph + guidelines + process + output + references |
| Maximum | 2500 tokens | Never exceed this. If larger, the agent scope is too broad — split it. |

**Rule: if an agent body exceeds 2500 tokens, split the agent into 2 agents with narrower scopes.**

---

## Migration Checklist (per agent)

When converting from legacy format:

- [ ] `agent.name` → `name:` in frontmatter
- [ ] `agent.whenToUse` or `agent.title` → `description:` in frontmatter
- [ ] `agent.model` → `model:` in frontmatter (if not default)
- [ ] `persona.role` + `persona.style` + `persona.focus` → opening paragraph (prose)
- [ ] `persona.core_principles` → ## Guidelines (bullet points, positive only)
- [ ] `voice_dna` → woven into opening paragraph
- [ ] `commands` → ## Process or ## Commands
- [ ] `output` → ## Output
- [ ] `collaboration` → workflow or ## Process context
- [ ] `persona_profile.archetype` / `icon` → `squad.yaml` `agents_metadata`
- [ ] `greeting_levels` → REMOVED
- [ ] Body content preserved and enhanced
- [ ] Total body ≤ 2000 tokens
- [ ] Reads as natural prose (not YAML dump)
