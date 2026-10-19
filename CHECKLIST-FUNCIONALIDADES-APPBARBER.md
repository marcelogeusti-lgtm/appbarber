# Checklist — Funcionalidades do AppBarber que faltam no NEXT

> Levantamento feito varrendo TODO o menu do AppBarber (15 grupos, com submenus)
> e cruzando com o código do NEXT (menu + páginas + api-lib). Data: 2026-07-08.
> Legenda: ❌ não existe · ⚠️ existe parcial · ✅ já temos (listado no fim).

## 🔴 Alta prioridade (barbearia usa muito / diferencial de venda)

- [ ] **Ordem de Chegada / Fila (walk-in)** ❌ — fila de espera do dia para quem chega sem agendar, com chamada por ordem. (AppBarber: "Ordem de Chegada → Fila / Histórico de Fila".) Muito usado em barbearia de bairro.
- [ ] **Cupons de Desconto** ❌ — criar cupons (valor/%, validade, limite de uso) aplicáveis no agendamento/comanda. Nenhum vestígio no NEXT.
- [ ] **Pacotes de serviços pré-pagos** ⚠️ — "compre 5 cortes, ganhe 1" / pacote de sessões com saldo abatido a cada uso. Diferente de assinatura mensal. (AppBarber: "Pacotes → Meus Pacotes / Venda de Pacotes".) NEXT só tem assinatura recorrente.
- [ ] **Lista de Espera (waitlist)** ❌ — cliente entra na espera de um horário lotado e é avisado se vagar. (AppBarber: "Configurações → Lista de Espera".)
- [ ] **Pesquisa de Satisfação / NPS** ❌ — enviar pesquisa pós-atendimento e medir nota. NEXT tem avaliações públicas, mas não pesquisa estruturada.
- [ ] **Notícias / Promoções (broadcast)** ❌ — disparar comunicado/promoção para grupos de clientes. (AppBarber: "Notícias/Promoções → Nova / Grupos".)

## 🟡 Média prioridade

- [ ] **Rodízio de Profissionais** ❌ — distribuição automática e justa dos clientes que chegam sem preferência de barbeiro. (AppBarber: "Configurações → Rodízio".)
- [ ] **Lista de Restrições (bloqueio de cliente)** ❌ — marcar cliente problemático / muitos no-shows para bloquear novos agendamentos.
- [ ] **Conta do Cliente / Fiado** ❌ — saldo/crédito do cliente na casa (consumo "na conta", pagar depois). (AppBarber: "Financeiro → Conta do Cliente".)
- [ ] **Anamnese / Ficha técnica** ❌ — formulários de ficha do cliente (alergias, preferências, histórico). (AppBarber: grupo "Anamnese".)
- [ ] **Rankings** ⚠️ — relatório de top clientes / serviços / profissionais. NEXT tem "produto mais usado" no dashboard, mas não um relatório de rankings dedicado.
- [ ] **Aniversariantes (relatório + automação)** ⚠️ — NEXT já importou as datas, mas falta a régua de mensagem automática de aniversário. (AppBarber: "Relatórios → Aniversariantes".)
- [ ] **Imagens de Divulgação** ❌ — biblioteca de artes prontas para o barbeiro baixar e postar nas redes.

## 🟢 Baixa prioridade (cadastros de apoio / nichos)

- [ ] **Fornecedores** ❌ e **Equipamentos** ❌ — cadastros de apoio (mais p/ controle de estoque/patrimônio).
- [ ] **Categorias** de serviço/produto ❌ — agrupar serviços/produtos por categoria.
- [ ] **Conta do Profissional** ⚠️ — extrato/saldo por profissional (parcialmente coberto agora pelo módulo de Comissões + Vale).
- [ ] **Documentos** ❌ — anexar/guardar documentos por barbearia/cliente/profissional (contratos etc.).
- [ ] **Deduções / Remunerações / Bandeiras / Contas (plano de contas) / Transportadora** ❌ — configs financeiras avançadas (folha, taxas de bandeira, sub-contas contábeis).
- [ ] **Comandas Canceladas / Comandas Itens (relatórios gerenciais)** ⚠️ — NEXT tem comandas, mas não esses relatórios gerenciais específicos.

## ✅ O que o NEXT JÁ tem (cobertura equivalente — não falta)

Agenda · Profissionais · Serviços · Produtos/Estoque · Clientes · Comandas (abertas/histórico) ·
Planos & Assinaturas · Assinantes · Clube · Fidelidade · Avaliações · Cursos · Vídeos Tutoriais ·
Financeiro (Caixa, Histórico, Entrada/Saída, Fluxo, Comissões + **Vale/Adiantamento** que o AppBarber
faz de forma limitada) · Lembretes de agendamento · Integrações de pagamento (Mercado Pago + Stripe) ·
Conta/Acessos/Segurança/2FA · Configurações (parâmetros, funcionamento, preferências) ·
Análise com IA ("Turbine seu Faturamento" — o AppBarber **não tem** IA). Além de **multi-unidades** e
o app do cliente (vitrine + agendamento online), que são pontos fortes do NEXT.

## Observação estratégica
O NEXT já cobre o núcleo (agenda, financeiro, comandas, assinaturas, comissões) e tem coisas que o
AppBarber **não tem** (IA de faturamento, multi-unidades, Stripe). As maiores lacunas para "empatar e
superar" são as de **🔴 alta prioridade** — em especial **Ordem de Chegada/Fila**, **Cupons** e
**Pacotes pré-pagos**, que são muito pedidos por barbearia.
