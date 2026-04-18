# Squad Upgrade

## When to load
Intent: UPGRADE (keywords: upgrade, migrate, convert)

## Migration: Legacy → CC Format

### What changes

| Component | Legacy | CC |
|-----------|--------|-----|
| Agent frontmatter | `agent:` nested block | `name:` + `description:` flat |
| Agent persona | YAML in frontmatter | Prose in body |
| Agent commands | YAML array in frontmatter | ## Process or ## Commands in body |
| Agent output | YAML in frontmatter | ## Output in body |
| Agent collaboration | YAML in frontmatter | Workflow definition |
| Agent icon/archetype | Frontmatter | `squad.yaml` → `agents_metadata` |
| Agent greeting_levels | Frontmatter | Removed |
| Task identity | `task:` + `owner:` | `name:` (no owner) |
| Task I/O | YAML arrays (Entrada/Saida) | Body sections (## Input / ## Output) |
| Task owner | In task frontmatter | In workflow definition |

### Migration process per agent

1. **Read** the full agent file
2. **Extract runtime config** → new flat frontmatter:
   - `agent.name` → `name:`
   - `agent.whenToUse` or `agent.title` → `description:`
   - `agent.model` → `model:` (only if not default)
3. **Convert persona to prose** → body opening paragraph:
   - `persona.role` → "You are [role]."
   - `persona.style` → describe approach naturally
   - `persona.focus` → what you concentrate on
   - `voice_dna.tone` → weave into paragraph
4. **Convert principles to guidelines** → ## Guidelines:
   - `persona.core_principles` array → bullet points
   - Rewrite as positive statements (not "Don't X" but "Always Y")
5. **Convert commands/steps to process** → ## Process:
   - Extract the actual steps the agent follows
   - Number them in order
6. **Convert output spec** → ## Output:
   - `output.format` + `output.schema_ref` → prose description
7. **Move UI metadata** → `squad.yaml`:
   - `agent.icon`, `persona_profile.archetype` → `agents_metadata:`
8. **Delete** greeting_levels, version, phase, tier, context.budget
9. **Validate**: run `squads validate` → must be SAFE
10. **Quality check**: body reads as natural prose, ≤2000 tokens

### Migration process per task

1. **Read** the full task file
2. **Extract** `task:` → `name:` (convert camelCase to kebab-case)
3. **Remove** `owner:` (moves to workflow)
4. **Convert** Entrada/inputs YAML → ## Input body section
5. **Convert** Saida/outputs YAML → ## Output body section
6. **Convert** Checklist YAML → ## Acceptance Criteria body section
7. **Keep** existing body content
8. **Validate**: run `squads validate` → must be SAFE

### Version compatibility

- v1/v2/v3 legacy squads continue to work without changes
- v4 CC format is the standard for new squads
- Both formats can coexist in the same squad during transition
- The validator accepts both and reports format type
