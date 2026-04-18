# Schema Reference

## When to load
Intent: CREATE, VALIDATE, MODIFY

## Two Formats

### CC Format (preferred for new squads)

**Agent required fields:**
- `name` (string) — agent identifier
- `description` (string) — when to use this agent

**Agent optional fields:**
- `tools` (array of strings) — tool whitelist
- `model` (string) — LLM model override
- `effort` (string) — thinking effort level
- `maxTurns` (integer) — max agentic turns
- `memory` (string) — persistent memory scope
- `context` (fork | inline) — execution context
- `background` (boolean) — run as background task
- `isolation` (worktree) — git isolation mode

**Task required fields:**
- `name` (string) — task identifier

**Task optional fields:**
- `description` (string) — what this task does
- `context` (fork | inline)
- `allowed-tools` (string or array)

### Legacy Format (backward compatible)

**Agent required fields:**
- `agent.name` (string)
- `agent.id` (string, kebab-case)

**Task required fields:**
- `task` (string)
- `owner` or `responsavel` (string — must match an agent name)

### Squad Manifest (same for both formats)

**Required:**
- `name` (string, kebab-case, 2-50 chars)
- `version` (string, semver X.Y.Z)

**Important optional:**
- `description` (string) — what the squad does
- `components.agents` (array) — must list at least 1 agent

## Validation Commands

```bash
squads validate ./my-squad              # Full validation
squads validate ./my-squad --report     # AI-friendly fix report
squads validate ./my-squad --fix        # Auto-fix then validate
```
