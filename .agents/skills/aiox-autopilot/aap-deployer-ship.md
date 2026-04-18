---
task: aapDeployerShip()
owner: aap-deployer-ship
responsavel: "aap-deployer"
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


# Task: Integration & Delivery

**Agent**: aap-deployer  
**Action**: Integrar, testar e fazer deploy do projeto

## Entrada
- Todas stories Done + QA Pass
- Architecture doc (para referência de infra)

## Processo
1. Integration review (conflitos entre stories)
2. Full test suite (unit + integration + e2e)
3. Pre-deploy checklist
4. Deploy na plataforma adequada
5. Health check pós-deploy
6. Gerar release notes e delivery report

## Saída
- delivery_report.json
- Projeto deployed e rodando
- Release notes

## Checklist
### Pre
- [ ] Todas stories da wave/epic estão Done + QA Pass
### Post
- [ ] Testes passando (full suite)
- [ ] Deploy bem-sucedido
- [ ] Health check passing
### Verify
```bash
npm test && npm run build
```
