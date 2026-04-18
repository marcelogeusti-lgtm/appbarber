---
task: aapAnalystDiscover()
owner: aap-analyst-discover
responsavel: "aap-analyst"
responsavel_type: Agente
atomic_layer: Molecule
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


# Task: Deep Project Discovery

**Agent**: aap-analyst  
**Action**: Pesquisa e análise profunda do projeto

## Entrada
- Discovery mission brief do Commander (JSON)

## Processo
1. Excavate real intent do projeto
2. Web search: competidores diretos (2-3 queries)
3. Web search: stack/tecnologia trending para este tipo (2-3 queries)
4. Análise de feasibility (complexidade, escopo, riscos)
5. Mapeamento de personas e user journeys
6. Consolidar em discovery_report.json

## Saída
- discovery_report.json validado contra schema

## Checklist
### Pre
- [ ] Mission brief recebido com contexto do projeto

### Post
- [ ] Web research executada (competidores + tech)
- [ ] discovery_report.json gerado
- [ ] Schema validation passed

### Verify
```bash
ajv validate -s schemas/discovery-report.schema.json -d output.json
```
