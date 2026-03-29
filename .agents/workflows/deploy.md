---
description: Guia Oficial de Deploy Unificado (Vercel)
---

Este workflow é a **Fonte de Verdade** para o deploy do ecossistema App Barbeiro.

### 🎯 Projetos Oficiais (MANTER)

1. **Frontend (App):** `appbarber` 
   - **ID:** `prj_ojtf8CjDrCPSeGrncVy6okbbpID6`
   - **Domínio:** `www.corteconexao.com.br`
   - **Pasta Local:** `/client`

2. **Backend (API):** `appbarber-api`
   - **ID:** `prj_7vwUDTQN52hyrxCXgMj0kAUc0pQz`
   - **Domínio:** `appbarber-api.vercel.app`
   - **Pasta Local:** `/server`

### 🗑️ Projetos Redundantes (APAGAR)

Estes projetos podem ser removidos da Vercel para limpeza:
- **`client`** (Não está vinculado ao repositório Git atual)
- **Render Backend** (O backend agora está consolidado na Vercel para melhor performance e integração)

---

### 🚀 Comandos de Deploy

Sempre execute os deploys a partir de suas respectivas pastas para garantir que os arquivos `.vercel/project.json` sejam respeitados.

#### 1. Deploy do Backend (API)
```powershell
# A partir da raiz
npx vercel deploy --prod --yes --cwd server
```

#### 2. Deploy do Frontend (App)
```powershell
# A partir da raiz
npx vercel deploy --prod --yes --cwd client
```

#### 3. Deploy Consolidado (Tudo de uma vez)
// turbo
```powershell
npx vercel deploy --prod --yes --cwd server; npx vercel deploy --prod --yes --cwd client
```
