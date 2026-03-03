# Blueprint: Arquitetura Perfeita (NEXT App Barbeiro)

Este documento registra a estrutura consolidada e aprovada como "perfeita" para o projeto. Qualquer melhoria futura deve respeitar estes pilares fundamentais para evitar regressões.

## 1. Sistema de Autenticação Globalizado

A autenticação foi centralizada para permitir uma transição fluida entre a Landing Page e as áreas logadas.

- **Provider de Raiz**: O `ClientAuthProvider` reside em `client/app/providers.js`, envolvendo toda a aplicação. Isso garante que o estado do usuário (logado/deslogado) seja acessível de qualquer componente.
- **Modais On-Demand**: Modais de `LoginModal`, `RegisterModal` e `ForgotPasswordModal` são injetados no `layout.js` raiz. Eles são acionados via funções descentralizadas (`openLoginModal()`), permitindo que botões na Landing Page abram o login sem redirecionamentos desnecessários.
- **Diferenciação de Contexto**: O sistema diferencia entre o contexto `PRO` (SaaS/Barbeiro) e `CLIENT` (Agendamento), usando `token` e `clientToken` respectivamente no `localStorage`.

## 2. Estrutura de Rotas e Organização

O projeto utiliza o App Router do Next.js com grupos de rotas para separação lógica de interesses.

- **Área do Cliente (`/home`, `/search`, `/agendamentos`)**: Organizada dentro do grupo `(client)`. Compartilha um layout escuro e premium específico para a experiência de consumo.
- **Área SaaS/Profissional (`/dashboard`, `/login`)**: Mantém a lógica de gestão da barbearia.
- **Landing Page (Raiz `/`)**: Serve como porta de entrada única, direcionando profissionais para o SaaS e clientes para o WebApp de agendamento.

## 3. Padrão de Integração API

- **Centralização**: Dois clientes Axios (`api.js` e `clientApi.js`) gerenciam as chamadas para o backend.
- **Segurança**: Interceptores anexam automaticamente os tokens de autorização corretos com base no contexto da rota.
- **Endpoints Públicos vs Protegidos**: A dashboard do cliente utiliza endpoints públicos de busca (`/barbershops/search`) para garantir que o conteúdo seja visível mesmo com permissões restritas.

## 4. Estética Premium e Design System

- **Visual Consistente**: Uso de cores escuras, bordas arredondadas (`rounded-3xl`, `rounded-[2.5rem]`), e efeitos de `backdrop-blur`.
- **Micro-interações**: Hover effects em cards, transições suaves em carrosséis e feedbacks visuais em botões.
- **Sem Placeholders**: Uso de fotos reais e ícones elegantes da biblioteca `lucide-react`.

## 5. Firebase e Notificações (FCM)

- **Instância Única**: Inicialização do Firebase protegida contra duplicidade em `lib/firebase.js`.
- **Gerenciamento de Mensagens**: O hook `useFcm.js` centraliza o registro de tokens para notificações push, essencial para os lembretes de agendamento.

---

**REGRA DE OURO**: Sempre que uma nova funcionalidade for adicionada, verifique se ela não quebra a acessibilidade global do `ClientAuthContext` ou a separação clara entre as rotas de cliente e profissional.
