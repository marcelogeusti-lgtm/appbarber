---
task: aapGuardianReview()
owner: aap-guardian-review
responsavel: "aap-guardian"
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


# Task: Quality Gate Review

**Agent**: aap-guardian  
**Action**: Review completo de story implementada com veredicto PASS/FAIL

## Entrada
- Story file com acceptance criteria
- Implementation result do Builder
- Código implementado (diff/files)

## Processo
1. Verificar cada acceptance criteria (BLOCKING)
2. Code review (legibilidade, patterns, naming)
3. Test coverage analysis
4. Security check (OWASP basics)
5. Performance check (N+1, indexes, re-renders)
6. Architecture compliance
7. Emitir veredicto PASS/FAIL

## Saída
- qa_verdict.json com veredicto + issues detalhados

## Checklist
### Pre
- [ ] Story + implementation result disponíveis
### Post
- [ ] Veredicto emitido (PASS ou FAIL)
- [ ] Se FAIL: issues com severity + suggested fix
### Verify
```bash
# Veredicto deve existir
test -s squads-output/aiox-autopilot/qa/qa_verdict.json
```
