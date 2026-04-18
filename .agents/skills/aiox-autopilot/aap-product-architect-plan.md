---
task: aapProductArchitectPlan()
owner: aap-product-architect-plan
responsavel: "aap-product-architect"
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


# Task: Generate PRD + Architecture + Frontend Spec

**Agent**: aap-product-architect  
**Action**: Gerar os 3 documentos fundacionais do projeto

## Entrada
- Validated discovery_report.json
- Tech research context

## Processo
1. Gerar PRD com requirements (FR/NFR), epics, MoSCoW
2. Gerar Architecture com stack, data model, APIs, infra
3. Gerar Frontend Spec com design system, screens, components
4. Cross-reference: garantir coerência entre os 3 docs
5. Web search: se stack precisa validação atualizada

## Saída
- docs/prd.md
- docs/architecture.md
- docs/frontend-spec.md
- planning_metadata.json

## Checklist
### Pre
- [ ] discovery_report.json disponível e validado
### Post
- [ ] 3 documentos gerados
- [ ] Cross-references verificadas
- [ ] Cada FR mapeia para pelo menos 1 epic story
### Verify
```bash
# Verificar que os 3 docs existem e não estão vazios
test -s squads-output/aiox-autopilot/planning/prd.md
test -s squads-output/aiox-autopilot/planning/architecture.md
test -s squads-output/aiox-autopilot/planning/frontend-spec.md
```
