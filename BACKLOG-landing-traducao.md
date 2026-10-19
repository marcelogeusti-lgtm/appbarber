# Backlog — Landing Page (tradução + melhorias)

> Auditoria feita em 2026-07-05 com o site em inglês (produção, via domínio de deploy
> `appbarber-meusaas.vercel.app`, que mostra a landing como visitante — no
> `corteconexao.com.br` o Marcelo está logado como cliente e cai em `/inicio`).
> Todas as seções da landing já usam `useTranslation`, mas alguns pontos têm texto
> "chapado" (hardcoded) que não passa pelo `t()`. Padrão para corrigir: mover o texto
> para o namespace certo em `client/contexts/LanguageContext.js` (PT/EN/ES) e ler via `t()`.

## Prioridade 1 — Vazamentos de tradução (inglês mostra português)

### 1a. Marquee (faixa de tags que passa correndo no topo) — 100% fixo em PT
- Arquivo: `client/components/landing/Marquee.jsx` (arrays `features` ~linha 8 e `niches` ~linha 22).
- Hoje: dois arrays hardcoded ("Agenda 24/7", "Link na Bio", "Gestão de Comissões",
  "Lembretes no WhatsApp", "Relatórios Financeiros", "Fidelização Automática", "NPS Sigiloso",
  e nichos "Barbearias de Bairro", "Barbearias Premium", "Espaços Masculinos", "Barbeiros Autônomos"...).
- Ação: criar `marquee.features` e `marquee.niches` (arrays) em cada idioma; `t()` retorna array.

### 1b. Rodapé — mistura os 3 idiomas ao mesmo tempo
- Arquivo: `client/components/landing/Footer.jsx`.
- Fixos em PT: cabeçalho "JURÍDICO" (linha ~48); links "Funcionalidades", "Preços", "Painel", "Contato";
  copyright "© {ano} NEXT. Todos os direitos reservados." (linha ~59).
- Fixos em EN (aparecem mesmo com site em PT): cabeçalhos "PRODUCT" e "COMPANY"; slogan
  "The ultimate platform for barbershop scheduling and management. From beginners to large chains."
- Já traduzem: "About Us", "Terms of Service", "Privacy Policy" (usam `t()`).
- Ação: criar namespace `footer.*` (colSproduct, colCompany, colLegal, tagline, rights, links) nos 3 idiomas.

### 1c. HowItWorks — balão de demonstração (notificação WhatsApp) fixo em PT
- Arquivo: `client/components/landing/HowItWorks.jsx` (~linhas 428-460).
- Strings: "Data & Hora", "Sáb, 28 Mai às 14:30", "Agendamento Criptografado", "Agora mesmo",
  "Barbearia Império", "Olá! Seu Combo Imperador para Sábado às 14:30 está confirmado! ✂️".
- Ação: mover para `howItWorks.demo.*` (PT/EN/ES). Nomes próprios podem virar exemplos localizados.

## Prioridade 2 — Links mortos / quebrados
- Rodapé: "Contato" (`href="#"`) e "Blog" (`href="#"`) não levam a lugar nenhum.
  Decidir: Contato → WhatsApp (`https://wa.me/5521991164174`) ou página; Blog → página real ou remover.
- Institucionais OK (existem, sem 404): `/sobre-nos`, `/termos-de-uso`, `/politica-de-privacidade`.

## Prioridade 3 — Robustez visual
- `body` tem fundo branco (`rgb(255,255,255)`). É a causa raiz de "faixas brancas" quando há gap
  de layout (foi o que aconteceu nas páginas de funcionalidade). Definir o fundo global como
  escuro (ex.: `#050505`) em `globals.css`/`body` deixa à prova disso.

## Escopo maior (decisão do dono — projeto à parte)
- O painel do barbeiro (dashboard administrativo) é 100% em português, sem `useTranslation`.
  A parte pública e a do cliente traduzem; o painel não. Se cliente internacional for objetivo,
  é o maior gap — porém é um projeto grande e dedicado (centenas de strings em dezenas de telas).

## O que já está OK (traduz nos 3 idiomas)
Navbar, Hero, Showcase (mockups HTML novos), HowItWorks (fora o balão), Testimonials,
ComparisonMatrix, Features (cards + páginas `/features/[slug]`), Pricing (3 períodos), FAQ, PerspectiveCTA.
