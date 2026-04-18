# Squad Creation

## When to load
Intent: CREATE (keywords: create, new, scaffold, generate, build squad)

## Protocol Reference
cc-squad-standard.md (primary), SQUAD_PROTOCOL.md Section 4

## Creation Pipeline

### Phase 1: Elicitation

| Question | Field | Default |
|----------|-------|---------|
| Squad purpose? | description | — |
| Squad name? (kebab-case) | name | derived from purpose |
| Domain/tags? | tags | — |
| How many agents? | components.agents | 3 |
| Agent roles? | agent definitions | — |
| Slash command prefix? | slashPrefix | first 3 chars of name |

### Phase 2: Scaffold

```bash
mkdir -p ~/squads/{name}/{agents,tasks,workflows}
```

### Phase 3: Generate squad.yaml

```yaml
name: my-squad
version: "1.0.0"
description: "What this squad does"
author: "author"
license: MIT
slashPrefix: msq
tags: [domain, keywords]

components:
  agents:
    - agent-one.md
    - agent-two.md
  tasks:
    - task-one.md
    - task-two.md
  workflows:
    - main-pipeline.yaml

agents_metadata:
  agent-one:
    icon: "🔍"
    archetype: Builder
  agent-two:
    icon: "📊"
    archetype: Guardian

state:
  enabled: true
  storage: file
  checkpoint_dir: ".squad-state"
  resume: true

model_strategy:
  orchestrator: "claude-sonnet-4"
  workers: "claude-sonnet-4"

harness:
  doom_loop:
    enabled: true
    max_identical_outputs: 3
    on_detect: abort
  context_compaction:
    enabled: true
    strategy: key-fields
    max_handoff_tokens: 4000
  self_verify:
    default_enabled: true
```

### Phase 4: Generate agents (CC format)

Use template: `templates/agent-cc.md.tmpl`

```yaml
---
name: agent-name
description: "When to use — one paragraph"
tools: [Read, Write, Bash]
---

You are [role]. You [approach].

## Guidelines
- [principle 1]
- [principle 2]
- [principle 3]

## Process
1. [step 1]
2. [step 2]
3. [step 3]

## Output
[format and location]
```

**Rules:**
- Body target: 1000–2000 tokens
- Max body: 2500 tokens (split agent if larger)
- Prose only — no YAML in body
- 4 sections: opening paragraph + Guidelines + Process + Output

### Phase 5: Generate tasks (CC format)

Use template: `templates/task-cc.md.tmpl`

```yaml
---
name: task-name
description: "What this accomplishes"
---

# Task Name

## Input
[what this receives]

## Steps
1. [step]
2. [step]

## Output
[what to produce]

## Acceptance Criteria
- [criterion]
```

**Note:** Tasks do NOT have `owner`. The workflow decides who executes.

### Phase 6: Generate workflow

```yaml
name: main_pipeline
description: "What this workflow does"

steps:
  - id: step-1
    agent: agent-one
    task: task-one
    depends_on: []
  - id: step-2
    agent: agent-two
    task: task-two
    depends_on: [step-1]

success_indicators:
  - "criterion 1"
  - "criterion 2"
```

### Phase 7: Validate

Run `*squad validate {name}` → must be SAFE (100/100).
