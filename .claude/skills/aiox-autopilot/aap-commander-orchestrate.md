---
task: aapCommanderOrchestrate()
owner: aap-commander-orchestrate
responsavel: "aap-commander"
responsavel_type: Agente
atomic_layer: Organism
Entrada:
  - campo: context
    tipo: json
    origem: Commander
    obrigatorio: true
Saida:
  - campo: result
    tipo: json
    destino: Commander
    persistido: true
Checklist:
  pre:
    - Input artifacts available
    - Schema loaded
  post:
    - Output valid JSON
    - Quality gates checked
---


# Task: Orchestrate Full Project Lifecycle

**Agent**: aap-commander  
**Action**: Orquestra o ciclo completo AIOX de ideia a deploy

## Entrada
- User query: descrição do projeto (texto livre)
- Optional: project_brief.md se já existir

## Processo

### 1. Receber e interpretar a ideia do projeto
- Extrair o que o usuário quer construir
- Identificar tipo: greenfield vs brownfield
- Determinar escopo inicial: MVP vs full product

### 2. Fase 0 — DISCOVERY
- Despachar aap-analyst com briefing de discovery
- Validar discovery_report contra schema
- Compactar resultado para próxima fase

### 3. Fase 1 — PLANNING
- Despachar aap-product-architect com discovery compactado
- Validar PRD + Architecture + Frontend Spec
- Cross-reference: verificar coerência entre documentos
- Se inconsistências, re-despachar com feedback específico

### 4. Fase 2 — SHARDING
- Despachar aap-story-forge com documentos aprovados
- Validar stories: acceptance criteria, estimativas, waves
- Aprovar backlog de stories

### 5. Fase 3 — DEVELOPMENT (loop)
Para cada wave:
  Para cada story na wave (paralelo quando possível):
    a. Despachar aap-builder com story
    b. Despachar aap-guardian com implementação
    c. Se FAIL: despachar aap-builder com fix request
    d. Se FAIL 2x: mudar estratégia ou escalar
    e. Se PASS: marcar story como Done
  Gate de wave: verificar integração entre stories

### 6. Fase 4 — DELIVERY
- Despachar aap-deployer com todas stories Done
- Validar delivery report
- Gerar retrospective do projeto

## Saída
- Projeto completo: código + testes + deploy + documentação
- Project retrospective com decisões tomadas e lições aprendidas

## Checklist
### Pre
- [ ] User query recebida e interpretada
- [ ] Tipo de projeto identificado (greenfield/brownfield)

### Post
- [ ] Todas as fases completadas
- [ ] Todos os gates passaram
- [ ] Projeto deployed e funcionando

### Verify
```bash
# Verificar que todos os artefatos foram gerados
ls squads-output/aiox-autopilot/discovery/
ls squads-output/aiox-autopilot/planning/
ls squads-output/aiox-autopilot/stories/
ls squads-output/aiox-autopilot/delivery/
```
