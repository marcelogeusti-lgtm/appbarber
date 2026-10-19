# Playbook de Migração AppBarber → NEXT

> Guia de referência para migrar TODOS os dados de um cliente vindo do AppBarber
> (sistema.appbarber.com.br) para o NEXT. Escrito a partir da migração real da
> barbearia **Corte Conexão** (barbershopId `e97acca4-fcb0-4673-a842-3b0b3ed1f13d`).
>
> **Regra de ouro (definida pelo Marcelo):** quando ele disser "migrar", fazer
> **tudo de uma vez**. O que acerta, a gente guarda; o que erra, a gente retira —
> iterando até ficar tudo certo. Sempre validar contra o painel do AppBarber antes
> de dar por concluído.

## 0. Princípios

- **Nunca** digitar senha/credencial do Marcelo ou do cliente. Ele faz o login no
  AppBarber; a sessão fica válida pro navegador todo e eu sigo sozinho.
- A barbearia de destino é **a do cliente** (ex.: Corte Conexão). A **Next App**
  (conta master do Marcelo) **nunca é mexida**.
- `Client` no NEXT é **global** (único por telefone). O vínculo com a barbearia é
  **derivado** de Appointment / CommunicationLog / Order. Cliente sem nenhum
  desses NÃO aparece no painel — por isso todo cliente importado precisa de um
  vínculo (ver §3).
- Trabalhar em produção com cuidado: extrair → conferir contagem com o Marcelo →
  importar em lotes idempotentes → validar números.

## 1. Ambiente / ferramentas

- **Origem:** AppBarber = SPA AngularJS (`sistema.appbarber.com.br/index.php#/rota`).
  - Dados carregam via endpoints PHP (`/pages/cadastros/*.php`, `/pages/relatorios/*.php`).
  - Muitas telas usam **DataTables server-side**: a config de ajax fica em
    `jQuery('#id').DataTable().settings()[0].ajax` → dá `url` e `data` (chaves dos params).
  - Extrair dados via `mcp__claude-in-chrome__javascript_tool` na aba logada.
  - O tool **trunca a saída ~1180 chars** e **bloqueia texto com cara de token/cookie**.
    Solução: retornar só resumos/contagens; pra volumes, **gerar download** (Blob→`<a download>`)
    e ler o arquivo de `~/Downloads` com a ferramenta Read.
  - `id` do estabelecimento aparece nos endpoints `ws.appbeleza.com.br` (não logar/expor).
- **Destino:** Supabase Postgres (projeto `rcqcjyjbuutumnquonnf`) via MCP `execute_sql`.
  - Produção roda com env na Vercel; `prisma/.env` local aponta pra localhost (NÃO serve
    pra rodar script contra produção). Por isso: **importar via SQL no Supabase**.
  - Campos `updatedAt` (Prisma `@updatedAt`) **não têm default no banco** → em INSERT cru
    é obrigatório setar `now()`. Idem `CommunicationLog.updatedAt`, `Order.updatedAt`, etc.

## 2. Mapa de rotas/endpoints do AppBarber (origem)

| Dado | Rota (#/) | Endpoint PHP | Observações |
|------|-----------|--------------|-------------|
| Clientes | `/clientes` | DataTable `tbBuscaCli` → `buscaClientes.php` | Campos: Nome, CPF, Email, Celular, Telefone, Pontos, Sexo, **Nascimento**, Endereço… |
| Agenda / agendamentos | `/agenda` | `buscaAgenda3.php` | Histórico via DataTable da agenda |
| Comandas (histórico) | `/comandashistorico` | `buscaComandasHistoricov2.php` (POST) | Params `tipo, dataini, datafim, comanda`. **Limite de período por consulta** → puxar em janelas ≤ ~3 meses. Campos: Codigo, Status (Aberta/Fechada/Cancelada), Valor, DataCadastro, DataFinaliza, CodigoCliente, Cliente, Profissional, TipoPagamento |
| Comandas abertas | `/comandasabertas` | — | |
| Caixa | `/caixa`, `/relatoriocaixa` | — | Receitas/despesas, abertura/fechamento |
| Fluxo de caixa | `/painelFinanceiro` | — | |
| Receitas / Despesas | `/receitas`, `/despesas` | `buscaReceita.php`, `buscaDespesa.php` | Lançamentos manuais do caixa |
| Pacotes (config) | `/pacotes` | `buscaPacotes.php` | |
| Pacotes vendidos | `/pacotesVenda`, `/relGerencialPacotes` | `buscaPacotePessoav2.php` / `v3` (tipo 7=ativo,10=…) | |
| Planos de assinatura | `/assinaturas`, `/assinantes` | `buscaAssinatura.php`, `PLANO_ASSINATURA_Busca.php`, `RELATORIO_PLANO_ASSINATURA.php` (type 1–15) | |
| Relatório financeiro | `/relatoriogerencialfinanceiro` | — | |

## 3. Mapa de destino (modelos NEXT / Prisma)

- **Client** (global): `name`, `phone` (único, `+55…`), `birthDate`, `gender`, `cpf` (único),
  `active`, `theme`. **NÃO tem email nem notes** (email vive em `AuthUser`).
- **Vínculo cliente↔barbearia** = criar `CommunicationLog { barbershopId, clientId,
  channel:'PORTAL', direction:'INBOUND', type:'MANUAL', content:'Cliente importado do AppBarber',
  status:'READ' }` (é o que o "Novo Cliente" faz). Sem isso o cliente não aparece na lista.
- **Appointment**: `date, status (COMPLETED/CONFIRMED/…), paymentStatus, clientId, barbershopId,
  professionalId, serviceId, notes`. **Não guarda valor** — o dinheiro vem de Order/Transaction.
- **Faturamento** = **Order** + **Transaction** (as duas!):
  - **Order**: `clientId` (obrigatório), `professionalId` (obrigatório), `barbershopId`,
    `status (OPEN/CLOSED/…)`, `subtotal/discount/total`, `paymentMethod`, `paymentStatus`,
    `paidAt`, itens em `OrderItem`.
  - **Transaction**: `description`, `amount` (Decimal), `type (INCOME/EXPENSE)`, `date`,
    `barbershopId`, `orderId?`, `paymentMethod?`, `origin?`, `professionalId?`.
  - **A dashboard de faturamento soma `Transaction` type INCOME** (e usa Orders p/ breakdown).
    Logo, comanda paga → **1 Order (CLOSED/PAID) + 1 Transaction (INCOME)**.
- **Profissionais** (Corte Conexão): Luan Guimarães `53a24e0d-e2a8-4801-9a75-c5eae91a0f6f`,
  Renan De Oliveira Guimarães `c8a15dbe-7108-416f-b473-dcd56f6fc75f`.

## 4. Normalizações

- **Telefone:** só dígitos → se começa com `55` e >11 díg → `+<n>`; se ≤11 díg → `+55<n>`; senão `+<n>`.
- **Data de nascimento:** aceitar `DD/MM/AAAA` e `AAAA-MM-DD`; **descartar** ano < 1930 ou > ano corrente
  (datas absurdas tipo 2064/2026 são erro de digitação).
- **Datas de comanda/caixa:** `DD/MM/AAAA HH:mm`.
- **Matching de profissional/serviço/cliente:** por nome (fuzzy, `includes` nos dois sentidos) e,
  quando houver, por `CodigoCliente`/telefone. Fallback: cliente "Balcão" e primeiro profissional.
- **Forma de pagamento** (AppBarber → enum NEXT PaymentMethod): Dinheiro→MONEY, Pix→PIX,
  Crédito→CREDIT_CARD, Débito→DEBIT_CARD (confirmar os rótulos reais na extração).

## 5. Procedimento (ordem)

1. **Cadastro de clientes** (base) — extrair `tbBuscaCli` inteiro → upsert por telefone +
   criar vínculo (CommunicationLog) pra CADA um. Preencher `birthDate` só se vazio (COALESCE).
2. **Agendamentos** — histórico da agenda → Appointment (dedupe por cliente+profissional+data).
3. **Financeiro** — comandas (janelas ≤3 meses) → para cada **Fechada**: Order(CLOSED/PAID) +
   Transaction(INCOME); **Aberta** → Order(OPEN) sem transação; **Cancelada** → ignorar (ou Order CANCELLED).
   Depois caixa/receitas/despesas → Transaction(INCOME/EXPENSE) que não vieram de comanda.
4. **Pacotes/assinaturas** — só se existirem vendas ativas (na Corte Conexão **não havia**).

## 6. Idempotência & rollback ("guarda o certo, retira o errado")

- Toda importação deve ser **re-executável** sem duplicar: upsert por chave natural
  (telefone p/ cliente) e `WHERE NOT EXISTS` p/ vínculos/linhas derivadas.
- **Marcar a origem** pra permitir remoção cirúrgica:
  - Clientes vinculados: `CommunicationLog.content = 'Cliente importado do AppBarber'`.
  - Agendamentos: `Appointment.notes = 'Importado'`.
  - Comandas/transações: usar `notes`/`description` com prefixo `[IMPORT AppBarber]` e/ou
    um campo de correlação (ex.: guardar o `Codigo` da comanda em `notes`).
- **Rollback** = deletar pelas marcas acima, na ordem inversa (Transaction → OrderItem → Order;
  CommunicationLog de import; Appointment notes='Importado'). Nunca apagar dado nativo do cliente.

## 7. Verificação (sempre)

- Contar na origem (AppBarber) e no destino (SQL) e **bater os números** com o Marcelo.
- Clientes no painel = `COUNT(DISTINCT clientId)` unindo Appointment+CommunicationLog+Order, `active=true`.
- Faturamento do mês = `SUM(Transaction.amount) WHERE type='INCOME' AND date no mês`.
  Conferir contra "faturamento do mês" exibido no AppBarber.
- Cuidado com **cache do React Query** no painel (pode mostrar número antigo alguns segundos →
  refresh forte). E com **estado intermediário** durante import em lotes.

## 8. Estado atual da Corte Conexão (registro)

- ✅ Clientes: **239** ativos e vinculados (de 253 no AppBarber; 14 sem telefone não entram).
- ✅ Agendamentos: **334** importados (`notes='Importado'`).
- ✅ Assinaturas/pacotes: **nada a migrar** (0 planos, 0 vendas — só 1 pacote "PLANO 2 CORTES" cadastrado e nunca vendido).
- ⏳ **Financeiro: PENDENTE.** Comandas existem em volume (Jan–Jul/2026 ≈ 2.000+;
  julho: 246 comandas, 67 fechadas ≈ R$1.587). Falta virar Order + Transaction. Caixa idem.
