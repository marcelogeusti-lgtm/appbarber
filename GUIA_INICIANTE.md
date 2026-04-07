# Guia de Hospedagem para Iniciantes

Olá! Não se preocupe, é normal ter dúvidas no começo. Vamos esclarecer o que você precisa.

Você já tem o **Domínio** (o nome do site, ex: `suabarbearia.com.br`). Isso é ótimo! Mas o domínio é apenas o endereço. Agora precisamos da "casa" (Hospedagem) e dos "móveis" (Banco de Dados e Sistema).

- **Dashboard**: Área para proprietários gerenciarem sua barbearia.
- **Blueprint de Arquitetura**: Clique aqui para ver o [Gold Standard do projeto](ARCHITECTURE_BLUEPRINT.md).

## O que este sistema precisa?

Diferente de sites antigos (feitos apenas em HTML ou PHP simples), este sistema é moderno e usa tecnologias que exigem um servidor mais robusto.

Você precisa de uma hospedagem que suporte:

1. **Node.js** (para rodar o "cérebro" do sistema/Backend).
2. **PostgreSQL** (para guardar os dados/Banco de Dados).

### ⚠️ O Problema das Hospedagens Comuns

Muitas hospedagens comuns (como Hostinger plano básico, Locaweb básica) suportam apenas PHP. Elas **não** vão rodar este sistema diretamente.

## Dúvida Comum: Qual versão do PostgreSQL eu baixo

Para rodar no seu computador (testes locais), recomendo baixar a **Versão 16 ou 17** (são as mais estáveis e modernas).

- Se você usar o **Supabase** (banco na nuvem), você **não é obrigado** a instalar o PostgreSQL no seu computador, pois o sistema vai conectar direto na internet. Mas é bom ter instalado para ter as ferramentas de comando se precisar.

## Opção Recomendada (100% Vercel & Supabase)

Para este projeto, padronizamos o uso da **Vercel** para tudo (Site e Servidor), o que o torna extremamente rápido e confiável.

### 1. Banco de Dados (PostgreSQL)

Lugar onde ficam os dados.

- **Recomendação**: [Supabase](https://supabase.com) ou [Neon.tech](https://neon.tech).
- **Custo**: Grátis para começar.
- **O que você vai pegar lá**: Uma URL que começa com `postgresql://...` (essa é a que colocamos no arquivo `.env`).

### 2. Sistema Completo (Frontend e Backend na Vercel)

- **Recomendação**: [Vercel](https://vercel.com).
- **Custo**: Grátis para começar.
- **Como funciona**: Você conecta seu GitHub e ele gerencia tanto o site (`client`) quanto a API (`server`).

---

## Passo a Passo para Colocar no Ar

### 1. GitHub (Sua Nuvem de Código)
1. Crie uma conta no [GitHub.com](https://github.com).
2. Crie um repositório chamado `appbarber`.
3. Suba seus arquivos (pastas `client` e `server`).

### 2. Vercel (Hospedagem do Site)
1. Acesse [vercel.com](https://vercel.com) e importe seu repositório.
2. **Frontend**: Aponte o **Root Directory** para a pasta `client`.
3. **Backend**: Crie um segundo projeto na Vercel apontando o **Root Directory** para a pasta `server`.

### 3. Ligação Final
No projeto do **Frontend** na Vercel, adicione uma variável de ambiente chamada `NEXT_PUBLIC_API_URL` com o link que a Vercel te deu para o projeto do **Backend**.

---

## Resumo: O que eu preciso agora

Se você quiser colocar no ar **agora**, os dados que eu preciso dependem de onde você vai hospedar.

Se você criar uma conta no **Supabase** (para o banco), você vai me passar:

1. O **Link de Conexão** (Connection String).

Parece algo assim:
`postgresql://postgres.user:senha@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`

### Passo a Passo Sugerido para você

1. Crie uma conta no **GitHub** (para guardar seu código).
2. Crie uma conta no **Supabase** (crie um projeto novo e copie a senha do banco).
3. Me avise quando tiver feito isso, que eu te ensino a conectar!
