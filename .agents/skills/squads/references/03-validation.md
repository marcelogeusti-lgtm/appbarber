# Squad Validation

## When to load
Intent: VALIDATE (keywords: validate, check, verify, fix, repair, lint, audit)

## Protocol Reference
SQUAD_PROTOCOL.md Section 4.3, cc-squad-standard.md

## Validation — Two Formats Accepted

The validator accepts both CC format (preferred) and legacy format (backward compatible).

### CC Format Detection
- Top-level `name:` + `description:` in agent frontmatter → CC format
- Top-level `name:` in task frontmatter (no `task:` field) → CC format
- Nested `agent:` block in agent frontmatter → legacy format
- `task:` + `owner:` in task frontmatter → legacy format

### Blocking Checks (MUST pass)

| # | Check | CC Format | Legacy Format |
|---|-------|-----------|---------------|
| B1 | squad.yaml exists and valid YAML | Same | Same |
| B2 | name is kebab-case | Same | Same |
| B3 | version is semver | Same | Same |
| B4 | All referenced files exist | Same | Same |
| B5 | Agent has identity | `name` + `description` | `agent.name` + `agent.id` |
| B6 | Agent frontmatter valid | Same | Same |
| B7 | Task has identity | `name` | `task` + `owner` |
| B8 | Task frontmatter valid | Same | Same |
| B9 | Task→agent cross-ref | Skipped (no owner) | `owner` must match agent name |
| B10 | Workflow valid YAML | Same | Same |
| B11 | Workflow has name | `name` or `workflow_name` | Same |
| B12 | Agent IDs unique | Filename-based | `agent.id` based |

### Not Validated (optional, never scored)

These fields do NOT affect validation score:
- tools, model, effort, maxTurns, memory, context, background, isolation
- persona_profile, archetype, greeting_levels, commands, icon
- owner_type, atomic_layer, Entrada/Saida/input/output, Checklist
- description (in squad.yaml — recommended but not required)

## Validation Procedure

1. Run all blocking checks
2. Report results with score
3. If errors found: offer `--report` for AI-friendly fix guidance
4. If errors found: offer `--fix` for auto-fix of common issues

## CLI Commands

```bash
squads validate ./my-squad              # Validate with colored report
squads validate ./my-squad --json       # JSON output (includes fixReport)
squads validate ./my-squad --report     # AI-friendly fix report (copy-pasteable)
squads validate ./my-squad --fix        # Auto-fix then validate
```
