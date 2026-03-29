# AppBarber Cloud SaaS

Atualizado em: 30/12/2025

# App Barbeiro SaaS 🚀

Sistema completo para gerenciamento de barbearias com agendamento, financeiro e controle de profissionais.

### ⚡ Deploy Rápido (Vercel)
Sempre utilize o comando abaixo para manter a vinculação oficial (`appbarber` e `appbarber-api`):
```powershell
# Deploy Unificado
npx vercel deploy --prod --yes --cwd server; npx vercel deploy --prod --yes --cwd .
```
Mais detalhes em: [.agents/workflows/deploy.md](file:///c:/Users/wanie/Downloads/MARCELO/EU/App%20Barbeiro/.agents/workflows/deploy.md)
Este é um sistema SaaS completo para gestão de barbearias, construído com Node.js (Backend) e Next.js (Frontend).

## 🚀 Pré-requisitos

O ambiente atual não possui as ferramentas necessárias instaladas. Para rodar este projeto, você precisa instalar:

1. **Node.js** (v18 ou superior) - [Baixar aqui](https://nodejs.org/)
2. **Git** - [Baixar aqui](https://git-scm.com/)
3. **PostgreSQL** (Banco de dados) - [Baixar aqui](https://www.postgresql.org/) (Recomendado: Versão 16 ou 17)

## 🛠️ Instalação e Configuração

Após instalar o Node.js e Git:

### 1. Backend (Servidor)

Abra o terminal na pasta `server`:

```bash
cd server
npm install
```

Configure o arquivo `.env`:

1. Renomeie o arquivo `.env.example` para `.env`
2. Configure a `DATABASE_URL` com os dados da sua hospedagem.

**Exemplo para Hospedagem (cPanel, VPS, Supabase, Neon, etc):**
Se o seu banco de dados estiver na sua hospedagem, a URL será algo como:
`postgresql://usuario:senha@ip_da_hospedagem:5432/nome_do_banco`

**Exemplo Local:**
`postgresql://postgres:123456@localhost:5432/appbarber`

Inicialize o Banco de Dados:

```bash
npx prisma migrate dev --name init
npx prisma db seed # Opcional: Popular com dados de teste
```

Inicie o servidor:

```bash
npm run dev
# O servidor rodará em http://localhost:3001
```

### 2. Frontend (Cliente)

Abra outro terminal na pasta `client`:

```bash
cd client
npm install
```

Inicie o frontend:

```bash
npm run dev
# O app abrirá em http://localhost:3000
```

## 📚 Funcionalidades Implementadas

- **Autenticação**: Login/Registro (JWT).
- **Multi-tenant**: Suporte a múltiplas barbearias.
- **Agendamento**: Clientes podem agendar horários.
- **Painel Admin**: Gestão de serviços, profissionais e horários.
- **Landing Page**: Página de apresentação do SaaS.
- **Página da Barbearia**: URL pública (ex: /marcelo-cuts).

- [Guia do Iniciante](GUIA_INICIANTE.md)
- [Blueprint de Arquitetura (Gold Standard)](ARCHITECTURE_BLUEPRINT.md)

## 🧪 Dados de Teste (Seed)

Se rodar `npx prisma db seed`, você terá:

- **Admin/Dono**: `owner@barber.com` / `123456`
- **Cliente**: `client@email.com` / `123456`
- **Barbearia**: Marcelo Cuts

---
Desenvolvido por Antigravity.
