# Guia de Configuração de Login Social (Google & Facebook)

Este guia prático descreve os passos necessários para ativar o login social no Firebase e conectar com os serviços do Google e Facebook, garantindo a conformidade com as lojas de aplicativos.

## 1. Firebase (Ponto Central)

O Firebase gerencia a autenticação.

1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Vá em **Authentication** -> **Sign-in method**.
3. **Google**: Clique em Enable (Ativar).
4. **Facebook**: Clique em Enable (Ativar). Ele vai pedir `App ID` e `App Secret` (veja passo 3).
5. **Authorized Domains** (Domínios Autorizados):
    Adicione os seguintes domínios na lista:
    - `corteconexao.com.br`
    - `www.corteconexao.com.br`
    - `localhost` (para testes locais)

    - Seu domínio na Vercel (ex: `appbarber.vercel.app`)

## 2. Google Cloud (Para obter permissão do Google)

O Firebase cria um projeto no Google Cloud automaticamente, mas você deve autorizar seu domínio.

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Selecione o projeto correspondente ao seu Firebase.
3. Vá em **APIs & Services** -> **Credentials**.
4. Edite a credencial do tipo **Web Client** (geralmente criada automaticamente pelo Firebase).
5. **Authorized JavaScript Origins** (Origens Autorizadas):
    - `https://www.corteconexao.com.br`
    - `https://corteconexao.com.br`
    - `http://localhost:3000` (Para testes locais)
6. **Authorized Redirect URIs**:
    - `https://www.corteconexao.com.br/__/auth/handler`
    - `https://barberon-ac7f5.firebaseapp.com/__/auth/handler` (URI padrão do seu projeto Firebase - **RECOMENDADO**)

## 3. Facebook Developers (Meta)

1. Acesse [Meta Developers](https://developers.facebook.com/).
2. Crie um App: Tipo **Consumer (Consumidor)** -> **Facebook Login**.
3. Copie o **App ID** e **App Secret** e cole nas configurações do provedor Facebook no Firebase (Passo 1).
4. No menu lateral do Facebook Developers: **Facebook Login** -> **Settings**.
5. **Valid OAuth Redirect URIs**:
    - `https://barberon-ac7f5.firebaseapp.com/__/auth/handler` (Copie da sua tela do Firebase).
    - `https://www.corteconexao.com.br/__/auth/handler`
6. Salve as alterações.

## 4. Variáveis de Ambiente (Vercel/Local)

O frontend precisa destas chaves para inicializar o Firebase.

1. No Firebase Console, vá em **Project Settings** (ícone de engrenagem) -> **General** -> Role até **Your apps**.
2. Selecione o app Web (ou crie um se não houver) e copie as configurações (`firebaseConfig`).
3. Adicione/Atualize estas variáveis no arquivo `.env.local` (localmente) e no painel da **Vercel** (Settings -> Environment Variables):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---
**Observação**: Após configurar as variáveis na Vercel, será necessário fazer um "Redeploy" para que elas entrem em vigor.
