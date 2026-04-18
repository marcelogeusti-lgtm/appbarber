---
task: aapStoryForgeCreateStories()
owner: aap-story-forge-create-stories
responsavel: "aap-story-forge"
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


# Task: Shard PRD into Stories

**Agent**: aap-story-forge  
**Action**: Transformar PRD em stories prontas para dev organizadas em waves

## Entrada
- docs/prd.md (aprovado)
- docs/architecture.md (aprovado)
- docs/frontend-spec.md (aprovado)

## Processo
1. Extrair epics do PRD
2. Para cada epic, gerar stories detalhadas
3. Aplicar PO checklist (10 pontos) em cada story
4. Organizar em waves respeitando dependências
5. Gerar story_batch.json com todas as stories

## Saída
- stories/epic-{id}/story-{id}.md (uma por story)
- story_batch.json (índice de todas as stories por wave)

## Checklist
### Pre
- [ ] PRD + Architecture aprovados pelo Commander
### Post
- [ ] Todas stories com acceptance criteria Given/When/Then
- [ ] Stories organizadas em waves
- [ ] Dependências mapeadas
- [ ] PO checklist 10/10 para cada story
### Verify
```bash
# Verificar que stories existem
ls squads-output/aiox-autopilot/stories/
```
