---
task: aapBuilderImplement()
owner: aap-builder-implement
responsavel: "aap-builder"
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


# Task: Implement Story

**Agent**: aap-builder  
**Action**: Implementar uma story com código production-ready

## Entrada
- Story file (.md) com acceptance criteria
- Project context (tech stack, source tree, coding standards)

## Processo
1. Analisar acceptance criteria da story
2. Planejar implementação em subtasks
3. Implementar código seguindo architecture
4. Criar/atualizar testes
5. Rodar lint + tests + build
6. Self-verify contra acceptance criteria
7. Gerar implementation_result.json

## Saída
- Código implementado (files created/modified)
- Testes passando
- implementation_result.json

## Checklist
### Pre
- [ ] Story file com AC disponível
- [ ] Architecture context disponível
### Post
- [ ] Todos AC implementados
- [ ] Testes passando
- [ ] Build/lint clean
### Verify
```bash
npm run lint && npm test && npm run build
```
