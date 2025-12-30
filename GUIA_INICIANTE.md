# Guia de Hospedagem para Iniciantes

Olá! Não se preocupe, é normal ter dúvidas no começo. Vamos esclarecer o que você precisa.

Você já tem o **Domínio** (o nome do site, ex: `suabarbearia.com.br`). Isso é ótimo! Mas o domínio é apenas o endereço. Agora precisamos da "casa" (Hospedagem) e dos "móveis" (Banco de Dados e Sistema).

## O que este sistema precisa?

Diferente de sites antigos (feitos apenas em HTML ou PHP simples), este sistema é moderno e usa tecnologias que exigem um servidor mais robusto.

Você precisa de uma hospedagem que suporte:
1.  **Node.js** (para rodar o "cérebro" do sistema/Backend).
2.  **PostgreSQL** (para guardar os dados/Banco de Dados).

### ⚠️ O Problema das Hospedagens Comuns
Muitas hospedagens comuns (como Hostinger plano básico, Locaweb básica) suportam apenas PHP. Elas **não** vão rodar este sistema diretamente.

## Dúvida Comum: Qual versão do PostgreSQL eu baixo?
Para rodar no seu computador (testes locais), recomendo baixar a **Versão 16 ou 17** (são as mais estáveis e modernas).
*   Se você usar o **Supabase** (banco na nuvem), você **não é obrigado** a instalar o PostgreSQL no seu computador, pois o sistema vai conectar direto na internet. Mas é bom ter instalado para ter as ferramentas de comando se precisar.

## Opção Recomendada (Grátis ou Barata para começar)

Para iniciantes, eu recomendo separar as coisas para ficar mais fácil e muitas vezes gratuito:

### 1. Banco de Dados (PostgreSQL)
Lugar onde ficam os dados.
*   **Recomendação**: [Supabase](https://supabase.com) ou [Neon.tech](https://neon.tech).
*   **Custo**: Grátis para começar.
*   **O que você vai pegar lá**: Uma URL que começa com `postgresql://...` (essa é a que colocamos no arquivo `.env`).

### 2. Backend (O código "server")
Onde o sistema processa os agendamentos.
*   **Recomendação**: [Render](https://render.com) ou [Railway](https://railway.app).
*   **Custo**: Render tem plano grátis (um pouco lento) ou pago ($7/mês). Railway é pago (~$5/mês).
*   **Como funciona**: Você conecta seu GitHub e ele "puxa" o código da pasta `server`.

### 3. Frontend (O site "client")
O que o cliente vê.
*   **Recomendação**: [Vercel](https://vercel.com).
*   **Custo**: Grátis.
*   **Como funciona**: Você conecta seu GitHub e ele "puxa" o código da pasta `client`.

## Se você quiser usar VPS (Servidor Próprio)
Se você comprou uma **VPS** (um computador virtual na nuvem, ex: DigitalOcean, AWS, Hostinger VPS), você tem controle total.
*   **Prós**: Tudo em um lugar só.
*   **Contras**: Mais difícil de configurar (precisa instalar Linux, configurar firewall, etc).

---

## Resumo: O que eu preciso agora?

Se você quiser colocar no ar **agora**, os dados que eu preciso dependem de onde você vai hospedar.

Se você criar uma conta no **Supabase** (para o banco), você vai me passar:
1.  O **Link de Conexão** (Connection String).

Parece algo assim:
`postgresql://postgres.user:senha@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`

### Passo a Passo Sugerido para você:
1.  Crie uma conta no **GitHub** (para guardar seu código).
2.  Crie uma conta no **Supabase** (crie um projeto novo e copie a senha do banco).
3.  Me avise quando tiver feito isso, que eu te ensino a conectar!

## 🚀 Como colocar o código no GitHub (Sem Terminal)
Como seu terminal não reconheceu o Git, você pode fazer o envio manual:

1.  Crie uma conta no [GitHub.com](https://github.com).
2.  Crie um **Novo Repositório** (botão "New"). Dê o nome de `appbarber`.
3.  Na tela do repositório vazio, clique no link **"uploading an existing file"**.
4.  Arraste **todo o conteúdo** da pasta do projeto para lá.
    *   *Dica*: Arraste as pastas `client` e `server` (mas NÃO arraste a pasta `node_modules` se ela existir).
5.  Clique em "Commit changes".

Agora seu código está na nuvem!

## 🌍 Como colocar o Site no Ar (Vercel)

Agora que o código está no GitHub, vamos colocar o site online usando a **Vercel** (que é grátis e excelente para Next.js).

1.  Acesse [vercel.com](https://vercel.com) e crie uma conta (Login com GitHub).
2.  Clique em **"Add New..."** -> **"Project"**.
3.  Na lista "Import Git Repository", encontre seu projeto `appbarber` e clique em **Import**.
4.  **⚡ CONFIGURAÇÃO IMPORTANTE** (Não pule essa etapa):
    *   No campo **Framework Preset**, deixe `Next.js`.
    *   No campo **Root Directory**, clique em "Edit" e selecione a pasta `client`. (Isso é crucial porque seu projeto tem 2 pastas).
5.  Clique em **Deploy**.

A Vercel vai instalar tudo e te dar um link (ex: `appbarber.vercel.app`).

### Configurando a API (Depois)
Quando o deploy terminar, o site vai abrir. Porém, ele ainda vai tentar conectar no `localhost` (seu computador).
Futuramente, para conectar no seu n8n ou Backend, você vai:
1.  Ir no painel da Vercel -> Settings -> Environment Variables.
2.  Adicionar uma variável chamada `NEXT_PUBLIC_API_URL`.
3.  Colocar o link do seu Webhook do n8n (ou do backend Render).

## 🧠 Como ligar o Cérebro (Backend no Render)

O site está bonito (Vercel) e o Banco está pronto (Supabase). Agora falta o "cérebro" que liga um no outro. Vamos usar o **Render**.

1.  Crie conta em [render.com](https://render.com) (Login com GitHub).
2.  Clique em **New +** -> **Web Service**.
3.  Conecte seu repositório `appbarber` (ou `marcelogeusti-lgtm/appbarber`).
4.  **⚡ CONFIGURAÇÃO IMPORTANTE:**
    *   **Name:** `barber-api` (ou o que quiser).
    *   **Root Directory:** `server` (MUITO IMPORTANTE).
    *   **Environment:** `Node`.
    *   **Build Command:** `npm install` (se der erro, tente `npm install && npx prisma generate`).
    *   **Start Command:** `npm start`.
5.  Role para baixo até **Environment Variables** e adicione:
    *   Key: `DATABASE_URL` | Value: (O link do seu Supabase).
    *   Key: `JWT_SECRET` | Value: `sua_senha_secreta_super_dificil` (invente uma).
6.  Clique em **Create Web Service**.

Ele vai demorar uns 5 minutos. Quando terminar, vai te dar um link (ex: `https://barber-api.onrender.com`).
Esse é o link que você vai colocar lá na Vercel (passo anterior) em `NEXT_PUBLIC_API_URL`!

