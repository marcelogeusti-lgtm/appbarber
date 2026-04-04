# Registro de Decisões Arquiteturais e Deploy (Vercel)

Este documento registra a estratégia oficial de deploy para garantir que o projeto permaneça estável e funcional na Vercel, após a desativação do Render.

## Configuração de Vinculação Oficial (Vercel)

Para evitar duplicidade de projetos e garantir estabilidade, utilize sempre:

- **Frontend (App):** `appbarber` (`prj_ojtf8CjDrCPSeGrncVy6okbbpID6`)
- **Backend (API):** `appbarber-api` (`prj_7vwUDTQN52hyrxCXgMj0kAUc0pQz`)

### Comandos de Deploy
```powershell
# Backend
npx vercel deploy --prod --yes --cwd server

# Frontend
npx vercel deploy --prod --yes --cwd .
```

---

## 1. Estratégia de Deploy Seccionado
O projeto é composto por dois serviços distintos hospedados em projetos separados na Vercel:

1.  **Frontend (`appbarber`)**:
    *   **Fonte**: Pasta `/client`.
    *   **Tecnologia**: Next.js.
    *   **Configuração**: Gerenciado automaticamente pela integração da Vercel apontando para a pasta raiz, onde o `package.json` gerencia a subpasta.

2.  **Backend (`appbarber-api`)**:
    *   **Fonte**: Diretório raiz (com foco em `/api` e `/server/src`).
    *   **Configuração**: Utiliza `vercel.json` na raiz com o builder `@vercel/node`.
    *   **Prisma**: O script `build` e `postinstall` na raiz gera o Prisma Client (`npx prisma generate`).

## 2. Garantia de Estabilidade (Failsafe)
Para evitar quebras ("breaking changes") ao unificar o código:
-   **Base de Dados**: Permanecemos utilizando Supabase (PostgreSQL externo). Os dados não são afetados por alterações no código ou deploy.
-   **Isolamento**: Alterações no frontend não devem afetar a API e vice-versa, devido aos projetos estarem vinculados de forma independente na Vercel.

---
 
## 3. Protocolo de Backup e Recuperação (Failsafe)
 
Para garantir que o projeto nunca seja danificado permanentemente, siga estes comandos antes de qualquer alteração crítica:
 
- **Backup de Código**: `node server/scripts/safety/create_snapshot.js`
  - *Onde encontrar:* `backups/snapshots/snapshot-[timestamp]`
- **Backup de Dados (JSON)**: `node server/scripts/safety/dump_database.js`
  - *Onde encontrar:* `backups/db_dumps/dump-[timestamp]`
 
---
## 4. Histórico de Migração
- **Data**: 04/04/2026.
- **Ação**: Implementação de sistema de snapshots de segurança local.
- **Status**: Scripts prontos para uso em ambiente local.
 
---
*Assinado: Antigravity AI*
