'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  pt: {
    clientApp: {
      nav: { home: "Início", search: "Buscar", agenda: "Agenda", favorites: "Favoritos", profile: "Perfil" },
      header: { notifications: "Notificações", login: "Entrar", myAccount: "Minha Conta" },
      menu: {
        myData: "Meus Dados", addresses: "Endereços", cards: "Meus Cartões",
        security: "Segurança", access: "Meus Acessos", preferences: "Preferências",
        loyalty: "Fidelidade", history: "Histórico", packages: "Pacotes",
        subscriptions: "Assinaturas", support: "Ouvidoria", terms: "Termos de Uso", logout: "Sair da Conta"
      },
      prefs: {
        title: "Preferências", subtitle: "Minhas Configurações",
        appearance: "Aparência", darkMode: "Modo Escuro", lightMode: "Modo Claro",
        darkModeDesc: "Tema escuro em todo o app", lightModeDesc: "Tema claro em todo o app",
        language: "Idioma", languageDesc: "Escolha o idioma do aplicativo",
        shortcuts: "Atalhos", securityShortcut: "Segurança",
        securityShortcutDesc: "Senha e autenticação em 2 fatores",
        notifShortcut: "Notificações", notifShortcutDesc: "Lembretes de agendamento no app",
        open: "Abrir", active: "Ativo"
      },
      common: {
        save: "Salvar", saving: "Salvando...", cancel: "Cancelar", back: "Voltar",
        loading: "Carregando...", confirm: "Confirmar", delete: "Excluir", edit: "Editar"
      },
      footer: {
        tagline: "Uma nova experiência para uma antiga tradição.",
        quickAccess: "Acesso rápido", more: "Mais",
        cookiePrefs: "Preferências de cookies", downloadApp: "Baixe nosso App",
        isManager: "É um gestor?",
        managerDesc: "Cadastre seu estabelecimento e comece a receber agendamentos online.",
        learnMore: "Saiba mais", rights: "Todos os direitos reservados."
      }
    },
  "navbar": {
    "home": "Home",
    "about": "Sobre",
    "features": "Funções",
    "pricing": "Preços",
    "freeTrial": "Teste Grátis",
    "login": "Acessar",
    "customer": "Sou Cliente",
    "systemAccess": "Acesso ao Sistema",
    "professional": "Profissional",
    "createFreeAccount": "Criar Conta Grátis",
    "lang_pt": "Português",
    "lang_en": "Inglês",
    "lang_es": "Espanhol",
    "faq": "Perguntas Frequentes"
  },
  "hero": {
    "badge": "O Futuro é NEXT",
    "title_part1": "Acabe com as ",
    "title_highlight": "cadeiras vazias",
    "title_part2": " da sua barbearia.",
    "subtitle": "Zere a falta de clientes. O NEXT é o único sistema que agenda, cobra antecipado e traz seu cliente de volta no piloto automático enquanto você corta.",
    "cta_main": "Começar 15 Dias Grátis",
    "cta_secondary": "Ver Demonstração",
    "stat1_value": "+182.000",
    "stat1_label": "Agendamentos",
    "stat2_value": "+R$ 1.4M",
    "stat2_label": "Gerenciados",
    "stat3_value": "+2.000",
    "stat3_label": "Barbeiros",
    "social_proof_start": "Junte-se a",
    "social_proof_highlight": "+2.000 barbeiros",
    "social_proof_end": "vitoriosos",
    "trust1": "15 Dias Grátis",
    "trust2": "Sem fidelidade"
  },
  "pricing": {
    "title_part1": "Um investimento que",
    "title_highlight": "se paga sozinho.",
    "monthly": "Mensal",
    "semiannual": "Semestral",
    "yearly": "Anual",
    "billedOnceLabel": "cobrado uma vez",
    "freeTrialText": "Teste grátis por 15 dias. Cancele quando quiser.",
    "recommended": "Recomendado",
    "perMonth": "/mês",
    "subscribe": "Assinar",
    "plan_solo_desc": "O essencial para quem está começando sozinho e quer profissionalismo.",
    "plan_pro_desc": "O equilíbrio perfeito para barbearias em crescimento.",
    "plan_empire_desc": "Poder total para redes, franquias e grandes barbearias.",
    "f_solo_1": "Gestão de 1 Profissional",
    "f_solo_2": "Agenda Inteligente Ilimitada",
    "f_solo_3": "Comandas de Consumo",
    "f_solo_4": "Financeiro Básico",
    "f_solo_5": "Suporte via E-mail",
    "f_pro_1": "Tudo do plano Start",
    "f_pro_2": "Até 5 Profissionais",
    "f_pro_3": "WhatsApp Automation",
    "f_pro_4": "Fidelidade & Promoções",
    "f_pro_5": "Integrações via Webhook",
    "f_empire_1": "Tudo do plano Pro",
    "f_empire_2": "Até 100 Profissionais",
    "f_empire_3": "Multi-Unidades / Franquias",
    "f_empire_4": "B.I. e Relatórios em Tempo Real",
    "f_empire_5": "Gerente de Conta Dedicado"
  },
  "features": {
    "title_part1": "Sua Barbearia no",
    "title_highlight": "Piloto Automático.",
    "subtitle": "Explore o maior ecossistema nativo do mercado. O NEXT consolida de agendas e comandas até uma universidade completa para o gestor.",
    "explore": "Explorar",
    "viewAll": "Ver Todas Funcionalidades"
  },
  "howItWorks": {
    "eyebrow": "Experiência do Cliente",
    "title_part1": "Agendamento em",
    "title_highlight": "4 Passos Simples.",
    "subtitle": "Veja na prática como é rápido e intuitivo para o seu cliente realizar um agendamento na sua vitrine digital.",
    "s1_label": "Interface do Cliente",
    "s1_title": "Escolha do Profissional",
    "s1_desc": "Seus clientes selecionam o barbeiro de preferência, visualizando avaliações e portfólios reais em segundos.",
    "s2_label": "Cardápio Personalizado",
    "s2_title": "Menu de Serviços Online",
    "s2_desc": "Um catálogo digital premium que exibe serviços, preços, durações e combos promocionais com total clareza.",
    "s3_label": "Agenda Inteligente",
    "s3_title": "Horários em Tempo Real",
    "s3_desc": "Janelas de tempo integradas à agenda do barbeiro. Sem conflitos, sem ligações, agendamento direto.",
    "s4_label": "Redução de Faltas",
    "s4_title": "Disparo via WhatsApp",
    "s4_desc": "Confirmação instantânea e alertas automáticos enviados no celular do cliente para reduzir faltas em até 95%."
  },
  "comparison": {
    "eyebrow": "Comparação Eficiente",
    "title_part1": "Mais Organização.",
    "title_highlight": "Zero Estresse.",
    "subtitle": "Entenda por que manter sua barbearia no papel ou no WhatsApp manual está custando caro para o seu faturamento diário.",
    "recommended": "Recomendado",
    "c1_title": "Agenda de Papel",
    "c1_sub": "A barreira física",
    "c1_p1": "Rasuras frequentes e agenda desorganizada",
    "c1_p2": "Zero controle de caixa ou histórico de clientes",
    "c1_p3": "Risco constante de perder a agenda física",
    "c1_p4": "O cliente só agenda se você estiver disponível para atender",
    "c2_title": "WhatsApp Manual",
    "c2_sub": "O dreno de atenção",
    "c2_p1": "Parar de cortar cabelo a todo momento para responder",
    "c2_p2": "Mensagens acumuladas e clientes sem resposta fora do horário",
    "c2_p3": "Dificuldade extrema para calcular comissões e faturamento",
    "c2_p4": "Esquecimento constante de agendamentos informais",
    "c3_title": "App Barbeiro (NEXT)",
    "c3_sub": "O império no piloto automático",
    "c3_p1": "Link de agendamento online ativo 24 horas, 7 dias por semana",
    "c3_p2": "Disparo automático de lembretes via WhatsApp anti-faltas",
    "c3_p3": "Faturamento bruto, ticket médio e fluxo de caixa calculados na hora",
    "c3_p4": "Cobrança de sinal Pix antecipado para eliminar cadeiras vazias",
    "t_col1": "Funcionalidade Chave",
    "t_col2": "Agenda Física",
    "t_col3": "WhatsApp",
    "t_r1": "Agendamento autônomo 24/7",
    "t_r2": "Lembretes anti-falta via WhatsApp",
    "t_r3": "Histórico completo e perfis de clientes",
    "t_r4": "Cálculo automatizado de comissões",
    "t_r5": "Cobrança de sinal Pix pré-agendamento",
    "t_r6": "Controle financeiro e fluxo de caixa na nuvem",
    "t_r7": "Painel exclusivo para profissionais da equipe",
    "t_r8": "Suporte e atualizações constantes",
    "t_limits": "Limites"
  },
  "footer": {
    "cta_title_part1": "PREPARADO PARA O",
    "cta_title_highlight": "PRÓXIMO NÍVEL?",
    "cta_subtitle": "Junte-se a mais de 1.200 barbearias que já transformaram seu negócio com o NEXT.",
    "cta_button_main": "Começar Agora",
    "cta_button_sec": "Ver Preços",
    "desc": "A plataforma definitiva para agendamento e gestão de barbearias. Do barbeiro iniciante às grandes redes.",
    "col1_title": "Produto",
    "col1_l1": "Agenda",
    "col1_l2": "Financeiro",
    "col1_l3": "WhatsApp",
    "col1_l4": "Ponto",
    "col2_title": "Barbearia",
    "col2_l1": "Sobre o NEXT",
    "col2_l2": "Planos",
    "col2_l3": "Blog",
    "col2_l4": "Contato",
    "col3_title": "Contato",
    "rights": "© 2025 NEXT SISTEMAS. TODOS OS DIREITOS RESERVADOS.",
    "privacy": "Políticas de Privacidade",
    "terms": "Termos de Uso",
    "status": "Status: Operacional"
  },
  "featureDetail": {"back":"Voltar para visão geral","ctaTitle":"Pronto para dominar essa funcionalidade?","ctaDesc":"Pare de usar sistemas que limitam seu crescimento. O NEXT tem tudo o que você precisa habilitado agora.","ctaButton":"Começar Meus 15 Dias Grátis"},
  "mockups": {"intro":{"title1":"Visão do seu","highlight":"Império","subtitle":"Cada detalhe foi desenhado para facilitar a sua gestão e encantar seus clientes.","scroll":"Role para explorar"},"search":"Buscar cliente, serviço...","welcome":"BEM-VINDO,","cashier":"Caixa","nav":{"overview":"Visão Geral","analytics":"Análise","schedule":"Agenda","records":"CADASTROS","professionals":"Profissionais","services":"Serviços","products":"Produtos","clients":"Clientes","sales":"VENDAS","orders":"Comandas","plans":"Planos & Assinaturas","subscribers":"Assinantes","loyalty":"Fidelidade","reviews":"Avaliações","logout":"Sair"},"a":{"badge":"ANÁLISE ESTRATÉGICA","title":"Gestão de Negócio","subtitle":"Visão estratégica para maximizar lucros e crescimento.","alert1Title":"QUEDA DE FATURAMENTO","alert1Desc":"O movimento caiu 56% em relação à semana passada.","alert2Title":"HORÁRIO OCIOSO","alert2Desc":"O horário das 14h está sem faturamento neste período. Que tal uma promoção?","kpiTicket":"TICKET MÉDIO","kpiTicketSub":"Gasto médio por cliente","kpiRetention":"TAXA DE RETENÇÃO","kpiRetentionSub":"Clientes que voltaram","kpiForecast":"PREVISÃO (30D)","kpiForecastSub":"Receita já agendada","kpiProfit":"LUCRO","kpiProfitSub":"Resultado líquido","ranking":"Ranking por Lucro Gerado","gross":"Bruto","commission":"Comissão","net":"Líquido","topServices":"Serviços em Destaque","sales":"vendas","insight":"Insight: \"Serviço\" representa 45% do faturamento.","peakHours":"Horários com Maior Receita","peakHint":"A barra mais alta indica o horário de maior faturamento.","vip":"Clientes VIP (Top 5)"},"g":{"title":"AGENDA OPERACIONAL","allPros":"TODOS PROFISSIONAIS","day":"DIA","week":"SEMANA","month":"MÊS","print":"IMPRIMIR / PDF","quickFit":"ENCAIXE RÁPIDO","tabAppointments":"AGENDAMENTOS","tabWaitlist":"LISTA DE ESPERA","tabFree":"HORÁRIOS LIVRES","weekdays":["DOM","SEG","TER","QUA","QUI","SEX","SÁB"],"moreSlots":"HORÁRIOS","jobs":"JOBS"},"b":{"suggestions":"SUGESTÕES PARA VOCÊ","popular":"POPULAR","tabs":["Serviços","Detalhes","Profissionais","Produtos","Fidelidade","Assinaturas","Avaliações"],"book":"AGENDAR","min":"MIN"},"slides":[{"title":"Métricas de Performance","desc":"Acompanhe seu faturamento, lucros e o desempenho diário da sua barbearia com gráficos simples de entender."},{"title":"Agenda Inteligente","desc":"Controle todos os horários da equipe em uma única tela. Arraste agendamentos, confirme presenças e otimize o seu tempo."},{"title":"Agendamento Online","desc":"Seus clientes marcam horários direto pelo celular a qualquer momento, sem precisar esperar o seu atendimento no WhatsApp."}]},
  "featuresData": {
    "agenda-inteligente": {
      "title": "Agendadora Anti-Falta",
      "oneLiner": "Lembretes no WhatsApp e cobrança de garantias para acabar de vez com os horários furados.",
      "heroTitle": "Cadeira vazia custa muito caro.",
      "heroDesc": "Garanta que seus clientes compareçam. Nosso sistema inteligente reduz as faltas na sua barbearia em até 85%.",
      "benefits": [
        {
          "title": "Lembretes Automáticos",
          "desc": "O sistema envia mensagens 2h e 24h antes do horário. O cliente não esquece e você não perde dinheiro."
        },
        {
          "title": "Sinal de Garantia",
          "desc": "Exija o pagamento de um sinal (via PIX ou cartão) de clientes com o costume de marcar e não aparecer."
        },
        {
          "title": "Mapeamento Visual",
          "desc": "Bata o olho na agenda e saiba imediatamente pelas cores quem confirmou, quem pagou e quem atrasou."
        }
      ]
    },
    "financeiro-avancado": {
      "title": "Financeiro & Split Automático",
      "oneLiner": "Repasse comissões do time na exata hora da transação e feche o mês sem planilhas confusas.",
      "heroTitle": "Fim da confusão no fechamento.",
      "heroDesc": "Livre-se das contas de papel e planilhas instáveis. Automatize o acerto com sua equipe e tenha o controle na mão.",
      "benefits": [
        {
          "title": "Fechamento Imediato",
          "desc": "Com 1 clique, visualize lucros reais já deduzindo custos, saídas e até as taxas invisíveis da maquininha."
        },
        {
          "title": "Split de Recebimento",
          "desc": "Pagamentos online são divididos instantaneamente: a sua fatia vai pro salão e a do barbeiro cai na conta dele."
        },
        {
          "title": "Previsibilidade Diária",
          "desc": "Pare de adivinhar. O sistema mostra quanto faturamento futuro já está travado na sua agenda de amanhã."
        }
      ]
    },
    "garcom-digital": {
      "title": "Recepcionista 24/7",
      "oneLiner": "Um link que atende e fecha reservas sozinho — até de madrugada.",
      "heroTitle": "Agende clientes até de madrugada.",
      "heroDesc": "Um link de agendamento sempre aberto, que atende seus clientes mesmo fora do horário comercial, sem precisar de ninguém na recepção.",
      "benefits": [
        {
          "title": "Link Direto pro Instagram/WhatsApp",
          "desc": "Um link leve e rápido pra colocar na bio ou mandar no WhatsApp — o cliente abre e agenda em segundos, sem precisar instalar nada."
        },
        {
          "title": "Funciona no Navegador",
          "desc": "Não exige que o cliente baixe nenhum aplicativo. Basta abrir o link em qualquer celular e agendar."
        },
        {
          "title": "Remarcação com Aprovação",
          "desc": "O cliente pode pedir para mudar o horário, mas a remarcação só é confirmada depois que você aprova."
        }
      ]
    },
    "fidelizacao-magnetica": {
      "title": "Motor de Retenção",
      "oneLiner": "Um clube de pontos que estimula o cliente a voltar, com cartão de fidelidade direto na Apple Wallet.",
      "heroTitle": "Transforme clientes de uma vez em clientes fiéis.",
      "heroDesc": "Um programa de pontos simples de configurar, que incentiva o cliente a voltar e a gastar mais a cada visita.",
      "benefits": [
        {
          "title": "Clube de Pontos Customizável",
          "desc": "Defina quantos reais equivalem a um ponto e crie recompensas que incentivam o cliente a gastar mais pra resgatar."
        },
        {
          "title": "Lembrete de Retorno",
          "desc": "O sistema avisa automaticamente o cliente no WhatsApp quando já passou da época recomendada para ele voltar a cortar."
        },
        {
          "title": "Cartão de Fidelidade na Apple Wallet",
          "desc": "O cliente guarda o cartão de pontos direto na carteira digital do iPhone, sem precisar de nenhum aplicativo extra."
        }
      ]
    },
    "controle-equipe": {
      "title": "Raio-X da Equipe",
      "oneLiner": "Veja o desempenho de cada profissional e controle exatamente o que cada um pode acessar no sistema.",
      "heroTitle": "Chega de gerenciar o salão por intuição.",
      "heroDesc": "Acompanhe a agenda e o faturamento de cada profissional, com permissões de acesso claras para cada função da equipe.",
      "benefits": [
        {
          "title": "Painel Individual do Profissional",
          "desc": "Cada barbeiro acessa sua própria agenda e seus próprios ganhos, sem precisar te perguntar."
        },
        {
          "title": "Permissões por Função",
          "desc": "Defina o que cada papel pode fazer: Recepcionista, Barbeiro Padrão ou Gerente têm acessos diferentes dentro do mesmo sistema."
        },
        {
          "title": "Ranking de Performance",
          "desc": "Veja quem mais fatura e quem mais atende, direto no painel do gestor, sem precisar cruzar planilhas."
        }
      ]
    },
    "padrao-premium": {
      "title": "Vitrine Ultra-Premium",
      "oneLiner": "Uma página de agendamento bonita, rápida e com a sua marca, não um formulário genérico.",
      "heroTitle": "Primeira impressão de alto padrão.",
      "heroDesc": "Sua página de agendamento leva o logo e as fotos da sua barbearia, com uma interface rápida e no estilo Dark Mode.",
      "benefits": [
        {
          "title": "Sua Marca na Página",
          "desc": "Coloque o logo e as fotos da sua barbearia na página de agendamento que o cliente vê e usa."
        },
        {
          "title": "Galeria de Trabalhos",
          "desc": "Mostre fotos dos cortes e serviços realizados direto na vitrine, pra atrair quem ainda não te conhece."
        },
        {
          "title": "Interface Rápida e Moderna",
          "desc": "Uma experiência de agendamento fluida, pensada pro celular, sem telas lentas ou poluídas."
        }
      ]
    },
    "gestao-estoque": {
      "title": "Vazamento Zero (Estoque)",
      "oneLiner": "Controle o estoque de produtos com baixa automática toda vez que algo é vendido na comanda.",
      "heroTitle": "Saiba exatamente o que está no seu estoque.",
      "heroDesc": "Pare de perder dinheiro com produtos vencendo ou sumindo sem explicação. Tenha controle real do que entra e sai.",
      "benefits": [
        {
          "title": "Baixa Automática na Venda",
          "desc": "Quando um produto é vendido numa comanda, ele já é descontado do seu estoque na hora, sem precisar lançar de novo."
        },
        {
          "title": "Alerta de Estoque Baixo",
          "desc": "O painel avisa quando um produto está acabando, pra você repor antes de faltar."
        },
        {
          "title": "Comparativo de Custo e Venda",
          "desc": "Veja lado a lado quanto você paga no produto e quanto está cobrando do cliente, pra saber se a margem está saudável."
        }
      ]
    },
    "importacao-lote": {
      "title": "Migração Mágica (1-Click)",
      "oneLiner": "Traga sua lista de clientes de qualquer planilha ou sistema antigo em poucos minutos.",
      "heroTitle": "Trocar de sistema sem perder nada.",
      "heroDesc": "Suba um arquivo de planilha (CSV) com sua base de clientes atual e o NEXT organiza tudo pra você começar já com sua carteira completa.",
      "benefits": [
        {
          "title": "Importação por Planilha",
          "desc": "Aceita arquivos CSV ou exportados do Google Sheets, sem precisar formatar nada manualmente."
        },
        {
          "title": "Detecção de Duplicados",
          "desc": "O sistema identifica clientes cadastrados mais de uma vez e ajuda a evitar cadastros repetidos."
        },
        {
          "title": "Histórico Preservado",
          "desc": "As informações de contato e cadastro dos seus clientes são mantidas exatamente como estavam antes da migração."
        }
      ]
    },
    "avaliacoes-clientes": {
      "title": "Avaliações de Clientes",
      "oneLiner": "O cliente avalia o atendimento direto pelo app, vinculado ao agendamento que ele realmente fez.",
      "heroTitle": "Saiba o que seus clientes realmente acham.",
      "heroDesc": "Depois de cada atendimento, o cliente pode dar uma nota e deixar um comentário — só quem realmente foi atendido pode avaliar.",
      "benefits": [
        {
          "title": "Avaliação Vinculada ao Agendamento",
          "desc": "Só quem teve um horário confirmado ou concluído pode avaliar, evitando notas falsas."
        },
        {
          "title": "Nota e Comentário por Atendimento",
          "desc": "O cliente dá uma nota de 1 a 5 estrelas e pode deixar um comentário sobre o serviço."
        },
        {
          "title": "Visão por Profissional",
          "desc": "Acompanhe a média de avaliações de cada barbeiro e identifique quem precisa de atenção no atendimento."
        }
      ]
    },
    "universidade": {
      "title": "Universidade Privada",
      "oneLiner": "Cursos de gestão e marketing pra barbearia, direto dentro do próprio sistema.",
      "heroTitle": "Cresça como gestor, não só na tesoura.",
      "heroDesc": "Acesse cursos práticos sobre gestão, marketing e atendimento pensados especificamente pra quem administra uma barbearia.",
      "benefits": [
        {
          "title": "Conteúdo Prático e Direto",
          "desc": "Aulas focadas em aplicar no dia a dia da barbearia, sem enrolação teórica."
        },
        {
          "title": "Acesso Dentro do Painel",
          "desc": "Assista aos cursos direto no sistema que você já usa, sem precisar entrar em outra plataforma."
        },
        {
          "title": "Conteúdo Atualizado Periodicamente",
          "desc": "Novos cursos são adicionados conforme a plataforma evolui, mantendo você e sua equipe atualizados."
        }
      ]
    },
    "relatorios-bi": {
      "title": "B.I. (Business Intelligence)",
      "oneLiner": "Chega de achismo. Relatórios diretos que mostram, em segundos, onde seu lucro está vazando.",
      "heroTitle": "Decisões com dados, não com feeling.",
      "heroDesc": "Veja exatamente quanto entra, quanto sai e onde seu lucro está escapando — sem precisar abrir uma planilha.",
      "benefits": [
        {
          "title": "Horários de Pico e Vazios",
          "desc": "Gráficos simples mostram quais dias e horários lotam e quais ficam vazios, pra você ajustar preços e escalas com precisão."
        },
        {
          "title": "Exportação para o Contador",
          "desc": "Gere relatórios em .csv e PDF prontos para enviar direto pro seu contador, sem retrabalho no fim do mês."
        },
        {
          "title": "Lucro por Serviço",
          "desc": "Descubra quais serviços realmente dão lucro e quais só ocupam a cadeira sem valer o tempo do profissional."
        }
      ]
    },
    "multi-unidades": {
      "title": "Franquias (Super Host)",
      "oneLiner": "Gerencie todas as unidades da sua rede, em qualquer bairro ou cidade, com um único login.",
      "heroTitle": "Feito para quem tem mais de uma unidade.",
      "heroDesc": "Troque entre suas unidades com um clique no painel e adicione novas barbearias sempre que sua rede crescer.",
      "benefits": [
        {
          "title": "Troca de Unidade em 1 Clique",
          "desc": "Um seletor no topo do painel mostra todas as suas unidades. Escolha uma e o painel inteiro muda para os dados dela na hora."
        },
        {
          "title": "Adicione Unidades Quando Quiser",
          "desc": "Crie novas barbearias direto em Configurações > Minhas Unidades, sem precisar criar um novo login."
        },
        {
          "title": "Uma Assinatura Só",
          "desc": "Toda unidade nova entra automaticamente no seu plano Empire — sem cobrança separada por loja."
        }
      ]
    }
  },
  "group1": {
    "faq1_q": "Preciso cadastrar cartão de crédito para testar?",
    "faq1_a": "Não! O teste é 100% gratuito e não exigimos nenhum dado financeiro. Você só paga se decidir continuar após o período de teste.",
    "faq2_q": "O sistema funciona no celular?",
    "faq2_a": "Sim, o NEXT é totalmente responsivo e funciona perfeitamente em celulares, tablets e computadores.",
    "faq3_q": "Como funciona a migração de dados?",
    "faq3_a": "Possuímos uma ferramenta de importação fácil e, nos planos Pro e Empire, nossa equipe auxilia em todo o processo de migração.",
    "faq4_q": "Posso cancelar quando quiser?",
    "faq4_a": "Com certeza. Não há fidelidade ou multas. Você pode cancelar sua assinatura a qualquer momento diretamente pelo painel.",
    "faq5_q": "Vocês oferecem suporte?",
    "faq5_a": "Sim! Oferecemos suporte via chat, e-mail e WhatsApp (para planos Pro e Empire) em horário comercial.",
    "faq_title": "Dúvidas Frequentes",
    "faq_subtitle": "Tudo que você precisa saber antes de começar.",
    "t1_name": "João Pereira",
    "t1_role": "Proprietário - Barbearia Don João, SP",
    "t1_text": "Trocamos a agenda física pelo NEXT e nossas faltas caíram 90% em apenas 4 semanas. A cobrança de sinal Pix antecipado salvou meu faturamento mensal.",
    "t2_name": "Mariana Nunes",
    "t2_role": "Dona - Barber Queen & Esmalteria, RS",
    "t2_text": "A barreira de mensagens no WhatsApp acabou. Agora os clientes agendam sozinhos de madrugada e a nossa agenda amanhece lotada no piloto automático.",
    "t3_name": "Pedro Henrique",
    "t3_role": "Supervisor - Barber Shop Elite, GO",
    "t3_text": "O controle de comissão dos profissionais era o meu maior pesadelo mensal. Hoje o NEXT faz tudo automático em segundos. Não troco por nada.",
    "t4_name": "Beatriz Carvalho",
    "t4_role": "Gestora - Confeitaria & Barber Concept, SP",
    "t4_text": "A função de múltiplos profissionais dividindo a agenda com painéis individuais mudou o jogo da nossa barbearia. Visualização limpa e profissional.",
    "t5_name": "Lucas Silveira",
    "t5_role": "Dono - Barbearia Corleone, RJ",
    "t5_text": "O link de agendamento online é extremamente rápido. Meus clientes elogiam muito a facilidade de agendar pelo celular em segundos.",
    "t6_name": "Marcos Souza",
    "t6_role": "Proprietário - Club Men Salon, MG",
    "t6_text": "Subimos o ticket médio da barbearia oferecendo combos pelo sistema. O cliente vê os combos na hora de agendar e acaba escolhendo.",
    "t7_name": "Camila Rocha",
    "t7_role": "Gerente - Classic Barber Club, BA",
    "t7_text": "Meus clientes elogiam muito a facilidade do agendamento. Sem precisar baixar aplicativo, eles agendam em 3 cliques pelo navegador do próprio celular.",
    "t8_name": "Thiago Martins",
    "t8_role": "Proprietário - Barbearia VIP, SC",
    "t8_text": "Ter um sistema completo com a nossa marca e lembretes automáticos no WhatsApp reduziu o tempo de suporte a zero. Investimento extremamente justo.",
    "t9_name": "Fernanda Lima",
    "t9_role": "Dona - Retro Barber Studio, PR",
    "t9_text": "O fluxo de caixa e os relatórios de lucro me deram clareza sobre quais serviços dão mais margem. Subimos o faturamento real em 35%.",
    "t10_name": "Rodrigo Melo",
    "t10_role": "Sócio - Barber & Co., DF",
    "t10_text": "O NEXT roda liso no celular, tablet e computador. Gerencio minhas duas unidades de qualquer lugar do mundo pelo celular com total segurança.",
    "t11_name": "Amanda Costa",
    "t11_role": "Dona - Barber & Beauty, PE",
    "t11_text": "Os lembretes automáticos reduzem o no-show de forma drástica. O cliente recebe o link de cancelamento se precisar, liberando o horário.",
    "t12_name": "Gustavo Santos",
    "t12_role": "Proprietário - Santo Bigode, CE",
    "t12_text": "Excelente custo-benefício. O sistema se paga no primeiro dia com a economia de tempo e a redução de faltas dos clientes.",
    "testimonials_label": "Depoimentos Reais",
    "testimonials_heading_1": "Barbearias Reais.",
    "testimonials_heading_2": "Resultados Reais.",
    "testimonials_description": "Junte-se a milhares de gestores de elite que aposentaram a agenda de papel e escalaram seus lucros.",
    "stat1_label": "Barbearias Conectadas",
    "stat2_label": "Agendamentos Hoje",
    "stat3_label": "Serviços Realizados",
    "stat4_label": "Clientes Ativos",
    "video_title_prefix": "Case de ",
    "video_title_highlight": "Sucesso",
    "video_description": "Veja como barbearias de todo o Brasil estão transformando sua gestão com nossa plataforma.",
    "video_overlay_title": "A Revolução na Gestão",
    "video_overlay_subtitle": "Assista ao depoimento completo",
    "faq_label": "Perguntas Frequentes",
    "faq_headline": "Respostas rápidas.",
    "faq_desc": "Tudo que você precisa saber sobre o sistema e os planos. Não encontrou o que procurava? Nossa equipe está pronta para te ajudar.",
    "faq_contact": "Falar com suporte"
  },
  "group2": {
    "ProblemSolution": {
      "pain1": "Clientes esquecem o horário e não avisam.",
      "solution1": "Lembretes automáticos via WhatsApp reduzem faltas em 80%.",
      "pain2": "Agenda física bagunçada ou no WhatsApp pessoal.",
      "solution2": "Link de agendamento 24h que organiza tudo sozinho.",
      "pain3": "Sem controle real do que entra e sai no caixa.",
      "solution3": "Fluxo de caixa em tempo real e relatórios de lucro limpos.",
      "pain4": "Dificuldade em fidelizar e trazer o cliente de volta.",
      "solution4": "Sistema de pontos e promoções que recupera clientes.",
      "titlePart1": "Você corta cabelo ou",
      "titlePart2": "gerencia problemas?",
      "subtitle": "Pare de perder tempo com tarefas manuais. Veja a diferença entre quem usa o NEXT e quem ainda está no escuro.",
      "withoutNext": "Sem o NEXT",
      "commonResultLabel": "Resultado Comum:",
      "commonResultDesc1": "Noites em claro e faturamento",
      "commonResultDesc2": "escorrendo pelo ralo.",
      "withNext": "Com o NEXT",
      "eliteJumpLabel": "O Salto de Elite:",
      "eliteJumpDesc1": "Agenda lotada e gestão em",
      "eliteJumpDesc2": "piloto automático de verdade."
    },
    "CheckoutShowcase": {
      "step1Title": "Serviço",
      "step1Desc": "Corte + Barba",
      "step2Title": "Profissional",
      "step2Desc": "Marcelo Maestro",
      "step3Title": "Data/Hora",
      "step3Desc": "Hoje, 15:00",
      "step4Title": "Confirmação",
      "step4Desc": "Pagamento Seguro",
      "conversionMax": "Conversão Máxima",
      "titlePart1": "Agendamento Sem Fricção.",
      "titlePart2": "Checkout de Elite.",
      "subtitle": "Inspirado nos checkouts de e-commerce mais rápidos do mundo. Seu cliente agenda e paga em menos de 30 segundos, direto do navegador.",
      "clientExp": "Experiência do Cliente",
      "maestroSummary": "Resumo Maestro",
      "waiting": "Aguardando...",
      "totalInvested": "Total Investido",
      "totalValue": "R$ 85,00",
      "confirmReservation": "Confirmar Reserva",
      "encryptedTransaction": "Transação Criptografada",
      "maestroSuggestion": "Sugestão Maestro",
      "dryPomade": "Pomada Efeito Seco",
      "bumpPrice": "+ R$ 25"
    },
    "MainDashboardShowcase": {
      "titlePart1": "O Painel de Controle",
      "titlePart2": "do Seu Império.",
      "subtitle": "Uma interface limpa e poderosa. Tenha visão total do seu faturamento, agenda e desempenho da equipe em tempo real, sem planilhas confusas.",
      "imgAlt": "Dashboard Central",
      "revenue": "Faturamento",
      "revenueValue": "R$ 18.420",
      "appointments": "Agendamentos",
      "appointmentsValue": "42 Hoje",
      "expectedProfit": "Lucro Previsto",
      "expectedProfitValue": "R$ 18.420",
      "teamRanking": "Ranking Equipe",
      "teamRankingValue": "Felipe M.",
      "avgTicket": "Ticket Médio",
      "avgTicketValue": "R$ 64,00",
      "returnRate": "Taxa Retorno",
      "returnRateValue": "84%"
    },
    "PremiumExperience": {
      "cat1": "SIMPLICIDADE",
      "title1": "Acesso via QR Code ou Link",
      "desc1": "Zero barreiras. Seu cliente agenda no momento da impulsão.",
      "cat2": "AGILIDADE",
      "title2": "Agendamento em 3 toques",
      "desc2": "Interface ultra-rápida otimizada para conversão mobile.",
      "cat3": "RETENÇÃO",
      "title3": "Fidelização automática",
      "desc3": "O sistema reconhece o cliente e incentiva o retorno.",
      "titlePart1": "A EXPERIÊNCIA",
      "titlePart2": "PREMIUM",
      "titlePart3": "DE AGENDAMENTO.",
      "subtitle": "O NEXT foi desenhado para eliminar fricção. Seu cliente não precisa de apps pesados ou cadastros complexos. É agendar e pronto."
    }
  },
  "group3": {
    "productShowcase": {
      "sections": [
        {
          "title": "Agenda Maestro: Controle Total",
          "desc": "Visualize toda a sua operação em segundos. Arraste e solte agendamentos, gerencie profissionais e elimine o papel definitivamente.",
          "features": [
            "Visão Diária/Semanal Pro",
            "Bloqueio de Horas Inteligente",
            "Sincronização Cloud"
          ]
        },
        {
          "title": "As métricas que importam",
          "desc": "Decisões baseadas em dados, não em palpites. Acompanhe seu ticket médio, taxa de retenção e faturamento bruto com gráficos intuitivos.",
          "features": [
            "Relatórios de Faturamento",
            "Ranking de Profissionais",
            "Previsão de Receita"
          ]
        },
        {
          "title": "O Site da Sua Barbearia",
          "desc": "Uma vitrine digital profissional que funciona 24h por dia. Seu cliente escolhe o serviço, o barbeiro e o horário sem precisar te ligar.",
          "features": [
            "Agendamento Online 24/7",
            "Totalmente Responsivo",
            "Link Personalizado"
          ]
        }
      ],
      "headingLine1": "Visão Geral do Seu ",
      "headingLine2": "Império.",
      "bodyText": "Cada detalhe foi desenhado para facilitar sua gestão e encantar seus clientes.",
      "proFeature": "Recurso Pro",
      "exploreDetails": "Explorar Detalhes"
    },
    "rollingNotifications": {
      "services": [
        "João – Corte Degradê agendado agora",
        "Lucas – Corte Clássico agendado há 2 minutos",
        "Rafael – Barba completa agendada",
        "Mateus – Low Fade agendado há 5 minutos",
        "Carlos – Mid Fade agendado agora",
        "Felipe – Executivo agendado há 1 minuto",
        "André – Skin Fade agendado agora",
        "Pedro – Corte Social agendado há 3 minutos"
      ],
      "appName": "NEXT APP"
    },
    "sideSocialProof": {
      "messages": [
        "Felipe entrou na plataforma",
        "Lucas está explorando o sistema",
        "Rafael iniciou teste grátis",
        "Gabriel criou uma conta"
      ]
    },
    "toastActivity": {
      "messages": [
        "Lucas acabou de criar uma conta",
        "Pedro iniciou teste gratuito",
        "Barbearia Kings acabou de se cadastrar",
        "Marcos iniciou teste gratuito",
        "Studio VIP acabou de se cadastrar"
      ],
      "justNow": "Agora mesmo"
    }
  },
  "group4": {
    "vclSection": {
      "titlePart1": "Assista agora e descubra",
      "titlePart2": "o poder do NEXT",
      "subtitle": "Veja em menos de 2 minutos como barbearias de alta performance estão automatizando tudo e focando no que importa.",
      "altImage": "Múltiplos barbeiros trabalhando",
      "tourTitle": "TOUR PELO SISTEMA (01:54)",
      "resolution": "Alta Resolução 4K"
    },
    "whatsappHighlight": {
      "syncStatus": "Sincronizado",
      "encryption": "Criptografia Maestro",
      "message1": "Bom dia! Quero cortar cabelo às 17h.",
      "autoReserve": "Reserva Automática ✅",
      "confirmedTime": "Horário das 17:00 confirmado!",
      "confirmationTitle": "Confirmação NEXT",
      "confirmationDate": "Hoje às 17:00",
      "confirmationBarber": "Com Barbeiro Júnior",
      "paymentLink": "Te enviamos o link para pagamento antecipado. 🚀",
      "writeHere": "Escreva aqui...",
      "automationBadge": "Automação Nativa",
      "titlePart1": "Onde seu cliente está,",
      "titlePart2": "o NEXT também está.",
      "subtitle": "Acabe com as interrupções para responder mensagens. O NEXT automatiza seu agendamento via WhatsApp, garantindo zero atrito e agenda lotada.",
      "feature1Title": "Lembretes Anti-Falta",
      "feature1Desc": "Alertas proativos que reduzem o no-show em até 80%.",
      "feature2Title": "Link de Agendamento Elite",
      "feature2Desc": "Seu cliente agenda em segundos, direto do WhatsApp ou Instagram.",
      "feature3Title": "Confirmação via Chatbot",
      "feature3Desc": "O sistema valida a disponibilidade e reserva o horário instantaneamente.",
      "ctaButton": "Lotar Minha Agenda Agora"
    },
    "fixedCta": {
      "ctaButton": "Criar minha barbearia agora"
    },
    "liveActivity": {
      "notif1": "Lucas agendou Corte Degradê",
      "notif2": "Mateus agendou Corte + Barba",
      "notif3": "Pedro agendou Corte Social",
      "notif4": "João agendou Barba",
      "notif5": "Rafael agendou Corte Navalhado",
      "newAppointment": "Novo agendamento",
      "timeAgoPart1": "há ",
      "timeAgoPart2": " minutos"
    }
  },
  "perspectiveCta": {
    "title1": "Pronto para lotar as",
    "title2": "suas cadeiras?",
    "subtitle": "Configure sua barbearia em menos de 5 minutos. Teste grátis por 15 dias sem compromisso.",
    "feature1": "15 dias grátis",
    "feature2": "Sem taxa de adesão",
    "feature3": "Cancele a qualquer momento",
    "btnStart": "Iniciar Teste Grátis",
    "btnAccess": "Acessar Minha Conta",
    "trust1": "Suporte Humanizado incluso",
    "trust2": "Integração Pix imediata"
  }
,
    "terms": {
    "title": "Termos de Serviço",
    "subtitle": "Padrão SaaS Profissional • Atualizado em 19 de Abril de 2026",
    "intro": "Bem-vindo ao <strong className=\"text-white\">NEXT</strong>. Estes Termos de Uso regem o acesso e a utilização da nossa plataforma de gestão por parte de estabelecimentos de beleza e barbearias. Ao utilizar o sistema, você confirma sua aceitação integral destes termos operados pela <strong className=\"text-white font-bold ml-1\">StarApp Sistemas LTDA ME (CNPJ 21.239.503/0001-94)</strong>.",
    "disclaimer_title": "Dúvidas Jurídicas?",
    "disclaimer_desc": "Se você tiver dúvidas sobre estes termos, entre em contato com nossa equipe de compliance.",
    "clause1_title": "1. Definições e Objeto",
    "clause1_content": "O sistema NEXT é uma plataforma de Software como Serviço (SaaS) que oferece ferramentas de gestão para estabelecimentos de beleza. Ao contratar o NEXT, o Estabelecimento adquire uma licença de uso limitada, não exclusiva e revogável, não ocorrendo qualquer transferência de propriedade intelectual do software ou seus códigos-fonte.",
    "clause2_title": "2. Propriedade Intelectual",
    "clause2_content": "Todos os direitos de propriedade intelectual sobre o sistema NEXT, incluindo marcas, logotipos, designs, algoritmos e artes, pertencem exclusivamente à StarApp Sistemas LTDA ME. É terminantemente proibida qualquer tentativa de engenharia reversa, descompilação ou cópia de funcionalidades sem autorização prévia por escrito.",
    "clause3_title": "3. Acordo de Processamento de Dados (DPA)",
    "clause3_content": "Em conformidade com a LGPD (Lei 13.709/2018):\
a) O **Estabelecimento** atuará como **Controlador** dos dados de seus clientes finais.\
b) O **NEXT** atuará como **Operador**, processando os dados apenas para as finalidades de execução do serviço contratado.\
c) O NEXT implementa medidas técnicas de segurança, mas a responsabilidade pela coleta lícita e consentimento dos clientes finais é inteiramente do Estabelecimento.",
    "clause4_title": "4. Pagamentos e Recorrência",
    "clause4_content": "Os planos são operados em regime de pré-pagamento. A falta de quitação na data de vencimento resultará na suspensão imediata dos serviços após 48 horas de atraso. O cancelamento pode ser solicitado a qualquer momento pelo painel, porém não haverá reembolso de valores já pagos para o período corrente, dado que a licença já foi disponibilizada.",
    "clause5_title": "5. Responsabilidade por Conteúdo",
    "clause5_content": "O Estabelecimento é o único responsável pelas informações, fotos e portfólio cadastrados em sua página no NEXT. O NEXT reserva-se o direito de remover qualquer conteúdo que infrinja direitos autorais de terceiros, contenha material impróprio ou viole as leis vigentes em território nacional.",
    "clause6_title": "6. SLA e Disponibilidade",
    "clause6_content": "O NEXT busca manter uma disponibilidade (uptime) superior a 99,5%. Interrupções agendadas para manutenção serão comunicadas previamente. O NEXT não se responsabiliza por falhas decorrentes de instabilidades na internet do usuário, problemas em gateways de pagamento de terceiros ou serviços de nuvem externos.",
    "clause7_title": "7. Suporte Técnico",
    "clause7_content": "O suporte é oferecido via chat online e e-mail em horário comercial brasileiro. O tempo médio de resposta para o primeiro contato é de 10 minutos para questões críticas. Sugestões de melhorias são registradas e priorizadas de acordo com o roadmap técnico da plataforma, sem garantia de implementação imediata.",
    "clause8_title": "8. Rescisão e Portabilidade",
    "clause8_content": "Caso o contrato seja encerrado, o Estabelecimento tem o direito de solicitar a exportação de seus dados de clientes e histórico de agendamentos em formato padrão (CSV/JSON). Após 60 dias do encerramento definitivo da conta, o NEXT poderá excluir permanentemente os dados do banco de dados, exceto aqueles exigidos por lei."
},
    "privacy": {
    "title": "Política de Privacidade",
    "subtitle": "Transparência e Segurança de Dados",
    "intro": "A sua privacidade é nossa prioridade no <strong className=\"text-white\">NEXT</strong>. Coletamos, armazenamos e processamos seus dados e os dados dos seus clientes com os mais altos padrões de criptografia.",
    "section1_title": "Coleta de Dados",
    "section1_content": "Coletamos informações essenciais para a operação do sistema, como nome, e-mail, telefone e histórico de agendamentos.",
    "section2_title": "Uso das Informações",
    "section2_content": "As informações são utilizadas exclusivamente para viabilizar agendamentos, enviar notificações via WhatsApp e gerar relatórios financeiros para o estabelecimento.",
    "section3_title": "Compartilhamento",
    "section3_content": "O NEXT não vende ou compartilha dados com terceiros para fins de marketing. O compartilhamento ocorre apenas com provedores de infraestrutura (como gateways de pagamento e servidores cloud) necessários para a operação.",
    "section4_title": "Seus Direitos",
    "section4_content": "Você e seus clientes possuem o direito de solicitar acesso, correção ou exclusão dos dados pessoais armazenados na plataforma a qualquer momento."
},
    "about": {
    "title": "Sobre Nós",
    "subtitle": "O Motor de Crescimento das Barbearias",
    "mission_title": "Nossa Missão",
    "mission_content": "Acabar de uma vez por todas com as cadeiras vazias. Nós desenvolvemos o NEXT porque acreditamos que barbearias não deveriam perder tempo com anotações de papel, clientes que faltam sem avisar ou fechamentos de caixa complicados.",
    "vision_title": "Visão de Império",
    "vision_content": "Cada detalhe foi pensado para transformar uma barbearia simples em um verdadeiro império. De agendamentos automáticos a links de checkout profissionais, entregamos a melhor experiência para você e para o seu cliente final.",
    "contact_title": "Fale Conosco",
    "contact_content": "Estamos prontos para ouvir você. Entre em contato através do nosso suporte oficial ou via e-mail corporativo."
}
  },
  en: {
    clientApp: {
      nav: { home: "Home", search: "Search", agenda: "Bookings", favorites: "Favorites", profile: "Profile" },
      header: { notifications: "Notifications", login: "Sign in", myAccount: "My Account" },
      menu: {
        myData: "My Info", addresses: "Addresses", cards: "My Cards",
        security: "Security", access: "My Logins", preferences: "Preferences",
        loyalty: "Loyalty", history: "History", packages: "Packages",
        subscriptions: "Subscriptions", support: "Support", terms: "Terms of Use", logout: "Log out"
      },
      prefs: {
        title: "Preferences", subtitle: "My Settings",
        appearance: "Appearance", darkMode: "Dark Mode", lightMode: "Light Mode",
        darkModeDesc: "Dark theme across the app", lightModeDesc: "Light theme across the app",
        language: "Language", languageDesc: "Choose the app language",
        shortcuts: "Shortcuts", securityShortcut: "Security",
        securityShortcutDesc: "Password and two-factor authentication",
        notifShortcut: "Notifications", notifShortcutDesc: "Booking reminders in the app",
        open: "Open", active: "Active"
      },
      common: {
        save: "Save", saving: "Saving...", cancel: "Cancel", back: "Back",
        loading: "Loading...", confirm: "Confirm", delete: "Delete", edit: "Edit"
      },
      footer: {
        tagline: "A new experience for an old tradition.",
        quickAccess: "Quick access", more: "More",
        cookiePrefs: "Cookie preferences", downloadApp: "Get our App",
        isManager: "Are you a manager?",
        managerDesc: "Register your business and start taking online bookings.",
        learnMore: "Learn more", rights: "All rights reserved."
      }
    },
  "navbar": {
    "home": "Home",
    "about": "About",
    "features": "Features",
    "pricing": "Pricing",
    "freeTrial": "Free Trial",
    "login": "Login",
    "customer": "I am a Client",
    "systemAccess": "System Access",
    "professional": "Professional",
    "createFreeAccount": "Create Free Account",
    "lang_pt": "Portuguese",
    "lang_en": "English",
    "lang_es": "Spanish",
    "faq": "FAQ"
  },
  "hero": {
    "badge": "The Future is NEXT",
    "title_part1": "End the ",
    "title_highlight": "empty chairs",
    "title_part2": " in your barbershop.",
    "subtitle": "Zero out the lack of clients. NEXT is the only system that schedules, charges upfront, and brings your clients back on autopilot while you cut hair.",
    "cta_main": "Start 15 Days Free",
    "cta_secondary": "Watch Demo",
    "stat1_value": "+182,000",
    "stat1_label": "Appointments",
    "stat2_value": "+$ 280K",
    "stat2_label": "Managed",
    "stat3_value": "+2,000",
    "stat3_label": "Barbers",
    "social_proof_start": "Join",
    "social_proof_highlight": "+2,000 winning",
    "social_proof_end": "barbers",
    "trust1": "15 Days Free",
    "trust2": "No Commitment"
  },
  "pricing": {
    "title_part1": "An investment that",
    "title_highlight": "pays for itself.",
    "monthly": "Monthly",
    "semiannual": "6 Months",
    "yearly": "Yearly",
    "billedOnceLabel": "billed once",
    "freeTrialText": "Try it free for 15 days. Cancel anytime.",
    "recommended": "Recommended",
    "perMonth": "/month",
    "subscribe": "Subscribe to",
    "plan_solo_desc": "The essentials for those starting out solo and wanting professionalism.",
    "plan_pro_desc": "The perfect balance for growing barbershops.",
    "plan_empire_desc": "Total power for chains, franchises, and large barbershops.",
    "f_solo_1": "Manage 1 Professional",
    "f_solo_2": "Unlimited Smart Schedule",
    "f_solo_3": "Consumption Orders",
    "f_solo_4": "Basic Finance",
    "f_solo_5": "Email Support",
    "f_pro_1": "Everything in Start",
    "f_pro_2": "Up to 5 Professionals",
    "f_pro_3": "WhatsApp Automation",
    "f_pro_4": "Loyalty & Promotions",
    "f_pro_5": "Webhook Integrations",
    "f_empire_1": "Everything in Pro",
    "f_empire_2": "Up to 100 Professionals",
    "f_empire_3": "Multi-Unit / Franchise Management",
    "f_empire_4": "Real-Time B.I. & Reports",
    "f_empire_5": "Dedicated Account Manager"
  },
  "features": {
    "title_part1": "Your Barbershop on",
    "title_highlight": "Autopilot.",
    "subtitle": "Explore the largest native ecosystem in the market. NEXT consolidates everything from schedules and orders to a complete university for managers.",
    "explore": "Explore",
    "viewAll": "View All Features"
  },
  "howItWorks": {
    "eyebrow": "Client Experience",
    "title_part1": "Scheduling in",
    "title_highlight": "4 Simple Steps.",
    "subtitle": "See how fast and intuitive it is for your clients to book an appointment on your digital storefront.",
    "s1_label": "Client Interface",
    "s1_title": "Choose the Professional",
    "s1_desc": "Your clients select their preferred barber, viewing real reviews and portfolios in seconds.",
    "s2_label": "Custom Menu",
    "s2_title": "Online Service Menu",
    "s2_desc": "A premium digital catalog displaying services, prices, durations, and promos with total clarity.",
    "s3_label": "Smart Schedule",
    "s3_title": "Real-Time Availability",
    "s3_desc": "Time slots synced to the barber's schedule. No conflicts, no calls, direct booking.",
    "s4_label": "Reduce No-Shows",
    "s4_title": "WhatsApp Triggers",
    "s4_desc": "Instant confirmation and automated alerts sent to the client's phone to reduce no-shows by up to 95%."
  },
  "comparison": {
    "eyebrow": "Efficient Comparison",
    "title_part1": "More Organization.",
    "title_highlight": "Zero Stress.",
    "subtitle": "Understand why keeping your barbershop on paper or manual WhatsApp is costing you daily revenue.",
    "recommended": "Recommended",
    "c1_title": "Paper Schedule",
    "c1_sub": "The physical barrier",
    "c1_p1": "Frequent cross-outs and messy schedule",
    "c1_p2": "Zero cash flow control or client history",
    "c1_p3": "Constant risk of losing the physical book",
    "c1_p4": "Clients can only book if you are available to answer",
    "c2_title": "Manual WhatsApp",
    "c2_sub": "The attention drain",
    "c2_p1": "Stopping haircuts constantly to reply",
    "c2_p2": "Piled up messages and unanswered clients after hours",
    "c2_p3": "Extreme difficulty calculating commissions and revenue",
    "c2_p4": "Constantly forgetting informal bookings",
    "c3_title": "App Barbeiro (NEXT)",
    "c3_sub": "The empire on autopilot",
    "c3_p1": "Online booking link active 24/7",
    "c3_p2": "Automated anti-no-show WhatsApp reminders",
    "c3_p3": "Gross revenue, average ticket, and cash flow calculated instantly",
    "c3_p4": "Upfront Pix deposit to eliminate empty chairs",
    "t_col1": "Key Feature",
    "t_col2": "Physical Book",
    "t_col3": "WhatsApp",
    "t_r1": "24/7 autonomous scheduling",
    "t_r2": "Anti-no-show WhatsApp reminders",
    "t_r3": "Complete history and client profiles",
    "t_r4": "Automated commission calculation",
    "t_r5": "Upfront Pix deposit before booking",
    "t_r6": "Cloud-based financial control and cash flow",
    "t_r7": "Exclusive dashboard for staff members",
    "t_r8": "Constant support and updates",
    "t_limits": "Limits"
  },
  "footer": {
    "cta_title_part1": "READY FOR THE",
    "cta_title_highlight": "NEXT LEVEL?",
    "cta_subtitle": "Join over 1,200 barbershops that have already transformed their business with NEXT.",
    "cta_button_main": "Get Started Now",
    "cta_button_sec": "View Pricing",
    "desc": "The ultimate platform for barbershop scheduling and management. From beginners to large chains.",
    "col1_title": "Product",
    "col1_l1": "Schedule",
    "col1_l2": "Financial",
    "col1_l3": "WhatsApp",
    "col1_l4": "Time Clock",
    "col2_title": "Company",
    "col2_l1": "About NEXT",
    "col2_l2": "Plans",
    "col2_l3": "Blog",
    "col2_l4": "Contact",
    "col3_title": "Contact",
    "rights": "© 2025 NEXT SYSTEMS. ALL RIGHTS RESERVED.",
    "privacy": "Privacy Policy",
    "terms": "Terms of Use",
    "status": "Status: Operational"
  },
  "featureDetail": {"back":"Back to overview","ctaTitle":"Ready to master this feature?","ctaDesc":"Stop using systems that limit your growth. NEXT has everything you need enabled right now.","ctaButton":"Start My 15 Free Days"},
  "mockups": {"intro":{"title1":"Your empire","highlight":"at a glance","subtitle":"Every detail was designed to make managing easier and delight your clients.","scroll":"Scroll to explore"},"search":"Search client, service...","welcome":"WELCOME,","cashier":"Register","nav":{"overview":"Overview","analytics":"Analytics","schedule":"Schedule","records":"RECORDS","professionals":"Professionals","services":"Services","products":"Products","clients":"Clients","sales":"SALES","orders":"Tickets","plans":"Plans & Subscriptions","subscribers":"Subscribers","loyalty":"Loyalty","reviews":"Reviews","logout":"Log out"},"a":{"badge":"STRATEGIC ANALYSIS","title":"Business Management","subtitle":"A strategic view to maximize profit and growth.","alert1Title":"REVENUE DROP","alert1Desc":"Traffic fell 56% compared to last week.","alert2Title":"IDLE TIME SLOT","alert2Desc":"The 2 PM slot has no revenue this period. How about a promo?","kpiTicket":"AVG. TICKET","kpiTicketSub":"Average spend per client","kpiRetention":"RETENTION RATE","kpiRetentionSub":"Clients who came back","kpiForecast":"FORECAST (30D)","kpiForecastSub":"Revenue already booked","kpiProfit":"PROFIT","kpiProfitSub":"Net result","ranking":"Ranking by Profit Generated","gross":"Gross","commission":"Commission","net":"Net","topServices":"Top Services","sales":"sales","insight":"Insight: \"Service\" makes up 45% of revenue.","peakHours":"Highest-Revenue Hours","peakHint":"The tallest bar marks the highest-revenue hour.","vip":"VIP Clients (Top 5)"},"g":{"title":"OPERATIONAL SCHEDULE","allPros":"ALL PROFESSIONALS","day":"DAY","week":"WEEK","month":"MONTH","print":"PRINT / PDF","quickFit":"QUICK FIT-IN","tabAppointments":"APPOINTMENTS","tabWaitlist":"WAITLIST","tabFree":"FREE SLOTS","weekdays":["SUN","MON","TUE","WED","THU","FRI","SAT"],"moreSlots":"SLOTS","jobs":"JOBS"},"b":{"suggestions":"SUGGESTIONS FOR YOU","popular":"POPULAR","tabs":["Services","Details","Professionals","Products","Loyalty","Subscriptions","Reviews"],"book":"BOOK","min":"MIN"},"slides":[{"title":"Performance Metrics","desc":"Track your revenue, profit and your barbershop's daily performance with easy-to-read charts."},{"title":"Smart Schedule","desc":"Manage the whole team's schedule on one screen. Drag appointments, confirm attendance and save time."},{"title":"Online Booking","desc":"Your clients book straight from their phone anytime, with no need to wait for you to reply on WhatsApp."}]},
  "featuresData": {
    "agenda-inteligente": {
      "title": "Anti-No-Show Scheduler",
      "oneLiner": "WhatsApp reminders and upfront payments to end empty chairs for good.",
      "heroTitle": "An empty chair costs you dearly.",
      "heroDesc": "Make sure your clients show up. Our smart system cuts no-shows at your barbershop by up to 85%.",
      "benefits": [
        {
          "title": "Automatic Reminders",
          "desc": "The system sends messages 2h and 24h before the appointment. The client doesn't forget and you don't lose money."
        },
        {
          "title": "Booking Deposit",
          "desc": "Require a deposit (via PIX or card) from clients who tend to book and not show up."
        },
        {
          "title": "Visual Mapping",
          "desc": "Glance at the calendar and instantly know by color who confirmed, who paid and who is late."
        }
      ]
    },
    "financeiro-avancado": {
      "title": "Advanced Finance & Auto-Split",
      "oneLiner": "Transfer staff commissions at the exact moment of the transaction and close the month without messy spreadsheets.",
      "heroTitle": "The end of messy month-end.",
      "heroDesc": "Ditch paper accounts and shaky spreadsheets. Automate settlements with your team and keep control in your hands.",
      "benefits": [
        {
          "title": "Instant Close-Out",
          "desc": "In 1 click, see real profits already minus costs, outflows and even the invisible card-machine fees."
        },
        {
          "title": "Payment Split",
          "desc": "Online payments are split instantly: your share goes to the shop and the barber's share lands in their account."
        },
        {
          "title": "Daily Predictability",
          "desc": "Stop guessing. The system shows how much future revenue is already locked into tomorrow's schedule."
        }
      ]
    },
    "garcom-digital": {
      "title": "24/7 Digital Receptionist",
      "oneLiner": "A link that answers and books reservations on its own — even at dawn.",
      "heroTitle": "Book clients even at 3 AM.",
      "heroDesc": "A booking link that's always open, serving your clients even outside business hours, with no one needed at the front desk.",
      "benefits": [
        {
          "title": "Direct Link for Instagram/WhatsApp",
          "desc": "A light, fast link to put in your bio or send on WhatsApp — the client opens it and books in seconds, nothing to install."
        },
        {
          "title": "Works in the Browser",
          "desc": "No app download required. The client just opens the link on any phone and books."
        },
        {
          "title": "Reschedule with Approval",
          "desc": "The client can request a time change, but the reschedule is only confirmed after you approve it."
        }
      ]
    },
    "fidelizacao-magnetica": {
      "title": "Retention Engine",
      "oneLiner": "A points club that encourages clients to come back, with a loyalty card right in Apple Wallet.",
      "heroTitle": "Turn one-time clients into loyal ones.",
      "heroDesc": "A points program that's simple to set up, encouraging clients to come back and spend more with each visit.",
      "benefits": [
        {
          "title": "Customizable Points Club",
          "desc": "Set how much money equals one point and create rewards that push clients to spend more to redeem."
        },
        {
          "title": "Return Reminder",
          "desc": "The system automatically messages the client on WhatsApp when they're overdue for their next cut."
        },
        {
          "title": "Loyalty Card in Apple Wallet",
          "desc": "The client keeps their points card right in the iPhone's digital wallet, no extra app needed."
        }
      ]
    },
    "controle-equipe": {
      "title": "Staff X-Ray",
      "oneLiner": "See each professional's performance and control exactly what they can access in the system.",
      "heroTitle": "Stop running the shop on gut feeling.",
      "heroDesc": "Track each professional's schedule and revenue, with clear access permissions for every team role.",
      "benefits": [
        {
          "title": "Individual Professional Dashboard",
          "desc": "Each barber accesses their own schedule and earnings, without having to ask you."
        },
        {
          "title": "Role-Based Permissions",
          "desc": "Define what each role can do: Receptionist, Standard Barber or Manager get different access within the same system."
        },
        {
          "title": "Performance Ranking",
          "desc": "See who bills the most and who serves the most, right in the manager's dashboard, no spreadsheet cross-checking."
        }
      ]
    },
    "padrao-premium": {
      "title": "Ultra-Premium Storefront",
      "oneLiner": "A beautiful, fast booking page with your brand on it, not a generic form.",
      "heroTitle": "A high-end first impression.",
      "heroDesc": "Your booking page carries your barbershop's logo and photos, with a fast, dark-mode-style interface.",
      "benefits": [
        {
          "title": "Your Brand on the Page",
          "desc": "Put your barbershop's logo and photos on the booking page the client sees and uses."
        },
        {
          "title": "Work Gallery",
          "desc": "Show photos of your cuts and services right on the storefront, to attract those who don't know you yet."
        },
        {
          "title": "Fast, Modern Interface",
          "desc": "A smooth booking experience, built for mobile, with no slow or cluttered screens."
        }
      ]
    },
    "gestao-estoque": {
      "title": "Zero Leakage Inventory",
      "oneLiner": "Control your product stock with automatic deductions every time something is sold at checkout.",
      "heroTitle": "Know exactly what's in your stock.",
      "heroDesc": "Stop losing money to products expiring or vanishing without explanation. Get real control of what comes in and goes out.",
      "benefits": [
        {
          "title": "Automatic Deduction on Sale",
          "desc": "When a product is sold on a ticket, it's deducted from your stock right away, no need to log it again."
        },
        {
          "title": "Low Stock Alert",
          "desc": "The dashboard warns you when a product is running out, so you restock before it's gone."
        },
        {
          "title": "Cost vs. Sale Comparison",
          "desc": "See side by side what you pay for a product and what you charge the client, to know if the margin is healthy."
        }
      ]
    },
    "importacao-lote": {
      "title": "Magic 1-Click Migration",
      "oneLiner": "Bring your client list over from any spreadsheet or old system in a few minutes.",
      "heroTitle": "Switch systems without losing a thing.",
      "heroDesc": "Upload a spreadsheet file (CSV) with your current client base and NEXT organizes everything so you start with your full client list.",
      "benefits": [
        {
          "title": "Spreadsheet Import",
          "desc": "Accepts CSV files or exports from Google Sheets, with no manual formatting needed."
        },
        {
          "title": "Duplicate Detection",
          "desc": "The system spots clients registered more than once and helps avoid repeated entries."
        },
        {
          "title": "History Preserved",
          "desc": "Your clients' contact and profile info is kept exactly as it was before the migration."
        }
      ]
    },
    "avaliacoes-clientes": {
      "title": "Customer Reviews",
      "oneLiner": "Clients review the service directly in the app, linked to the appointment they actually had.",
      "heroTitle": "Know what your clients really think.",
      "heroDesc": "After each service, the client can leave a rating and a comment — only those who were actually served can review.",
      "benefits": [
        {
          "title": "Review Tied to the Booking",
          "desc": "Only clients with a confirmed or completed appointment can review, preventing fake ratings."
        },
        {
          "title": "Rating and Comment per Service",
          "desc": "The client gives a 1-to-5 star rating and can leave a comment about the service."
        },
        {
          "title": "View by Professional",
          "desc": "Track each barber's average rating and spot who needs attention in their service."
        }
      ]
    },
    "universidade": {
      "title": "Private University",
      "oneLiner": "Management and marketing courses for barbershops, right inside the system.",
      "heroTitle": "Grow as a manager, not just with scissors.",
      "heroDesc": "Access practical courses on management, marketing and service designed specifically for people who run a barbershop.",
      "benefits": [
        {
          "title": "Practical, To-the-Point Content",
          "desc": "Lessons focused on applying to the barbershop's day-to-day, with no theoretical fluff."
        },
        {
          "title": "Access Inside the Dashboard",
          "desc": "Watch the courses right in the system you already use, no need to log into another platform."
        },
        {
          "title": "Content Updated Regularly",
          "desc": "New courses are added as the platform evolves, keeping you and your team up to date."
        }
      ]
    },
    "relatorios-bi": {
      "title": "Business Intelligence",
      "oneLiner": "No more guesswork. Straight-to-the-point reports that show you, in seconds, where your profit is leaking.",
      "heroTitle": "Decisions from data, not from a hunch.",
      "heroDesc": "See exactly how much comes in, how much goes out and where your profit is leaking — without opening a spreadsheet.",
      "benefits": [
        {
          "title": "Peak and Empty Hours",
          "desc": "Simple charts show which days and times fill up and which stay empty, so you fine-tune prices and shifts."
        },
        {
          "title": "Export for Your Accountant",
          "desc": "Generate .csv and PDF reports ready to send straight to your accountant, no rework at month-end."
        },
        {
          "title": "Profit per Service",
          "desc": "Find out which services really turn a profit and which just take up the chair without being worth the time."
        }
      ]
    },
    "multi-unidades": {
      "title": "Franchises (Super Host)",
      "oneLiner": "Manage every unit in your network, in any neighborhood or city, from a single login.",
      "heroTitle": "Built for owners with more than one location.",
      "heroDesc": "Switch between your locations with one click in the dashboard and add new barbershops whenever your network grows.",
      "benefits": [
        {
          "title": "Switch Location in 1 Click",
          "desc": "A selector at the top of the dashboard shows all your locations. Pick one and the whole dashboard switches to its data instantly."
        },
        {
          "title": "Add Locations Anytime",
          "desc": "Create new barbershops right in Settings > My Locations, with no need for a new login."
        },
        {
          "title": "One Single Subscription",
          "desc": "Every new location automatically joins your Empire plan — no separate charge per shop."
        }
      ]
    }
  },
  "group1": {
    "faq1_q": "Do I need to register a credit card to test?",
    "faq1_a": "No! The trial is 100% free and we do not require any financial data. You only pay if you decide to continue after the trial period.",
    "faq2_q": "Does the system work on mobile?",
    "faq2_a": "Yes, NEXT is fully responsive and works perfectly on mobile phones, tablets, and computers.",
    "faq3_q": "How does data migration work?",
    "faq3_a": "We have an easy import tool and, in the Pro and Empire plans, our team assists throughout the migration process.",
    "faq4_q": "Can I cancel whenever I want?",
    "faq4_a": "Absolutely. There is no loyalty or fines. You can cancel your subscription at any time directly through the dashboard.",
    "faq5_q": "Do you offer support?",
    "faq5_a": "Yes! We offer support via chat, email, and WhatsApp (for Pro and Empire plans) during business hours.",
    "faq_title": "Frequently Asked Questions",
    "faq_subtitle": "Everything you need to know before getting started.",
    "t1_name": "João Pereira",
    "t1_role": "Owner - Don João Barbershop, SP",
    "t1_text": "We replaced the physical agenda with NEXT and our no-shows dropped 90% in just 4 weeks. Upfront Pix charging saved my monthly revenue.",
    "t2_name": "Mariana Nunes",
    "t2_role": "Owner - Barber Queen & Nail Salon, RS",
    "t2_text": "The messaging barrier on WhatsApp is over. Now clients book on their own in the middle of the night and our schedule is full in the morning on autopilot.",
    "t3_name": "Pedro Henrique",
    "t3_role": "Supervisor - Elite Barber Shop, GO",
    "t3_text": "Commission control was my biggest monthly nightmare. Today NEXT does everything automatically in seconds. I wouldn't trade it for anything.",
    "t4_name": "Beatriz Carvalho",
    "t4_role": "Manager - Confeitaria & Barber Concept, SP",
    "t4_text": "The multiple professionals feature sharing the agenda with individual panels changed the game for our barbershop. Clean and professional visualization.",
    "t5_name": "Lucas Silveira",
    "t5_role": "Owner - Corleone Barbershop, RJ",
    "t5_text": "The online booking link is extremely fast. My clients highly praise the ease of booking via mobile in seconds.",
    "t6_name": "Marcos Souza",
    "t6_role": "Owner - Club Men Salon, MG",
    "t6_text": "We increased the average ticket of the barbershop by offering combos through the system. The client sees the combos when booking and ends up choosing them.",
    "t7_name": "Camila Rocha",
    "t7_role": "Manager - Classic Barber Club, BA",
    "t7_text": "My clients highly praise the ease of booking. Without needing to download an app, they book in 3 clicks through their own phone browser.",
    "t8_name": "Thiago Martins",
    "t8_role": "Owner - VIP Barbershop, SC",
    "t8_text": "Having a complete system with our brand and automatic WhatsApp reminders reduced support time to zero. Extremely fair investment.",
    "t9_name": "Fernanda Lima",
    "t9_role": "Owner - Retro Barber Studio, PR",
    "t9_text": "The cash flow and profit reports gave me clarity on which services have more margin. We increased real revenue by 35%.",
    "t10_name": "Rodrigo Melo",
    "t10_role": "Partner - Barber & Co., DF",
    "t10_text": "NEXT runs smoothly on mobile, tablet, and computer. I manage my two units from anywhere in the world from my phone with total security.",
    "t11_name": "Amanda Costa",
    "t11_role": "Owner - Barber & Beauty, PE",
    "t11_text": "Automatic reminders drastically reduce no-shows. The client receives a cancellation link if needed, freeing up the slot.",
    "t12_name": "Gustavo Santos",
    "t12_role": "Owner - Santo Bigode, CE",
    "t12_text": "Excellent cost-benefit. The system pays for itself on the first day with time savings and reduced client no-shows.",
    "testimonials_label": "Real Testimonials",
    "testimonials_heading_1": "Real Barbershops.",
    "testimonials_heading_2": "Real Results.",
    "testimonials_description": "Join thousands of elite managers who retired the paper agenda and scaled their profits.",
    "stat1_label": "Connected Barbershops",
    "stat2_label": "Appointments Today",
    "stat3_label": "Services Performed",
    "stat4_label": "Active Clients",
    "video_title_prefix": "Success ",
    "video_title_highlight": "Case",
    "video_description": "See how barbershops all over Brazil are transforming their management with our platform.",
    "video_overlay_title": "The Management Revolution",
    "video_overlay_subtitle": "Watch the full testimonial",
    "faq_label": "Frequently Asked Questions",
    "faq_headline": "Quick answers.",
    "faq_desc": "Everything you need to know about the system and plans. Didn't find what you were looking for? Our team is ready to help.",
    "faq_contact": "Talk to support"
  },
  "group2": {
    "ProblemSolution": {
      "pain1": "Clients forget appointments and don't notify.",
      "solution1": "Automated WhatsApp reminders reduce no-shows by 80%.",
      "pain2": "Messy physical calendar or personal WhatsApp.",
      "solution2": "24/7 booking link that organizes everything itself.",
      "pain3": "No real control over cash flow.",
      "solution3": "Real-time cash flow and clean profit reports.",
      "pain4": "Difficulty building loyalty and bringing clients back.",
      "solution4": "Points and promotions system that recovers clients.",
      "titlePart1": "Do you cut hair or",
      "titlePart2": "manage problems?",
      "subtitle": "Stop wasting time on manual tasks. See the difference between those using NEXT and those still in the dark.",
      "withoutNext": "Without NEXT",
      "commonResultLabel": "Common Result:",
      "commonResultDesc1": "Sleepless nights and revenue",
      "commonResultDesc2": "going down the drain.",
      "withNext": "With NEXT",
      "eliteJumpLabel": "The Elite Leap:",
      "eliteJumpDesc1": "Fully booked schedule and true",
      "eliteJumpDesc2": "autopilot management."
    },
    "CheckoutShowcase": {
      "step1Title": "Service",
      "step1Desc": "Haircut + Beard",
      "step2Title": "Professional",
      "step2Desc": "Marcelo Maestro",
      "step3Title": "Date/Time",
      "step3Desc": "Today, 15:00",
      "step4Title": "Confirmation",
      "step4Desc": "Secure Payment",
      "conversionMax": "Maximum Conversion",
      "titlePart1": "Frictionless Booking.",
      "titlePart2": "Elite Checkout.",
      "subtitle": "Inspired by the world's fastest e-commerce checkouts. Your client books and pays in under 30 seconds, straight from the browser.",
      "clientExp": "Client Experience",
      "maestroSummary": "Maestro Summary",
      "waiting": "Waiting...",
      "totalInvested": "Total Invested",
      "totalValue": "$ 85.00",
      "confirmReservation": "Confirm Reservation",
      "encryptedTransaction": "Encrypted Transaction",
      "maestroSuggestion": "Maestro Suggestion",
      "dryPomade": "Dry Effect Pomade",
      "bumpPrice": "+ $ 25"
    },
    "MainDashboardShowcase": {
      "titlePart1": "The Control Panel",
      "titlePart2": "of Your Empire.",
      "subtitle": "A clean and powerful interface. Get a full view of your revenue, schedule, and team performance in real-time, without confusing spreadsheets.",
      "imgAlt": "Central Dashboard",
      "revenue": "Revenue",
      "revenueValue": "$ 18,420",
      "appointments": "Appointments",
      "appointmentsValue": "42 Today",
      "expectedProfit": "Expected Profit",
      "expectedProfitValue": "$ 18,420",
      "teamRanking": "Team Ranking",
      "teamRankingValue": "Felipe M.",
      "avgTicket": "Avg Ticket",
      "avgTicketValue": "$ 64.00",
      "returnRate": "Return Rate",
      "returnRateValue": "84%"
    },
    "PremiumExperience": {
      "cat1": "SIMPLICITY",
      "title1": "Access via QR Code or Link",
      "desc1": "Zero barriers. Your client books at the moment of impulse.",
      "cat2": "AGILITY",
      "title2": "Booking in 3 taps",
      "desc2": "Ultra-fast interface optimized for mobile conversion.",
      "cat3": "RETENTION",
      "title3": "Automated loyalty",
      "desc3": "The system recognizes the client and encourages return.",
      "titlePart1": "THE",
      "titlePart2": "PREMIUM",
      "titlePart3": "BOOKING EXPERIENCE.",
      "subtitle": "NEXT was designed to eliminate friction. Your client doesn't need heavy apps or complex sign-ups. Just book and done."
    }
  },
  "group3": {
    "productShowcase": {
      "sections": [
        {
          "title": "Agenda Maestro: Total Control",
          "desc": "Visualize your entire operation in seconds. Drag and drop appointments, manage professionals, and eliminate paper once and for all.",
          "features": [
            "Pro Daily/Weekly View",
            "Smart Time Blocking",
            "Cloud Sync"
          ]
        },
        {
          "title": "The metrics that matter",
          "desc": "Data-driven decisions, not guesses. Track your average ticket, retention rate, and gross revenue with intuitive charts.",
          "features": [
            "Revenue Reports",
            "Professional Ranking",
            "Revenue Forecast"
          ]
        },
        {
          "title": "Your Barbershop's Website",
          "desc": "A professional digital showcase working 24/7. Your client chooses the service, the barber, and the time without having to call you.",
          "features": [
            "24/7 Online Booking",
            "Fully Responsive",
            "Custom Link"
          ]
        }
      ],
      "headingLine1": "Overview of Your ",
      "headingLine2": "Empire.",
      "bodyText": "Every detail was designed to make your management easier and delight your clients.",
      "proFeature": "Pro Feature",
      "exploreDetails": "Explore Details"
    },
    "rollingNotifications": {
      "services": [
        "João – Fade Cut booked now",
        "Lucas – Classic Cut booked 2 mins ago",
        "Rafael – Full Beard booked",
        "Mateus – Low Fade booked 5 mins ago",
        "Carlos – Mid Fade booked now",
        "Felipe – Executive cut booked 1 min ago",
        "André – Skin Fade booked now",
        "Pedro – Social Cut booked 3 mins ago"
      ],
      "appName": "NEXT APP"
    },
    "sideSocialProof": {
      "messages": [
        "Felipe joined the platform",
        "Lucas is exploring the system",
        "Rafael started a free trial",
        "Gabriel created an account"
      ]
    },
    "toastActivity": {
      "messages": [
        "Lucas just created an account",
        "Pedro started a free trial",
        "Kings Barbershop just registered",
        "Marcos started a free trial",
        "VIP Studio just registered"
      ],
      "justNow": "Just now"
    }
  },
  "group4": {
    "vclSection": {
      "titlePart1": "Watch now and discover",
      "titlePart2": "the power of NEXT",
      "subtitle": "See in under 2 minutes how high-performance barbershops are automating everything and focusing on what matters.",
      "altImage": "Multiple barbers working",
      "tourTitle": "SYSTEM TOUR (01:54)",
      "resolution": "4K High Resolution"
    },
    "whatsappHighlight": {
      "syncStatus": "Synchronized",
      "encryption": "Maestro Encryption",
      "message1": "Good morning! I want a haircut at 5 PM.",
      "autoReserve": "Auto Reserve ✅",
      "confirmedTime": "5:00 PM slot confirmed!",
      "confirmationTitle": "NEXT Confirmation",
      "confirmationDate": "Today at 5:00 PM",
      "confirmationBarber": "With Junior Barber",
      "paymentLink": "We've sent you the link for advance payment. 🚀",
      "writeHere": "Type here...",
      "automationBadge": "Native Automation",
      "titlePart1": "Where your client is,",
      "titlePart2": "NEXT is too.",
      "subtitle": "End interruptions to answer messages. NEXT automates your scheduling via WhatsApp, ensuring zero friction and a fully booked schedule.",
      "feature1Title": "No-Show Reminders",
      "feature1Desc": "Proactive alerts that reduce no-shows by up to 80%.",
      "feature2Title": "Elite Booking Link",
      "feature2Desc": "Your client books in seconds, directly from WhatsApp or Instagram.",
      "feature3Title": "Chatbot Confirmation",
      "feature3Desc": "The system checks availability and books the time instantly.",
      "ctaButton": "Fill My Schedule Now"
    },
    "fixedCta": {
      "ctaButton": "Create my barbershop now"
    },
    "liveActivity": {
      "notif1": "Lucas booked Fade Haircut",
      "notif2": "Mateus booked Haircut + Beard",
      "notif3": "Pedro booked Classic Haircut",
      "notif4": "João booked Beard Trim",
      "notif5": "Rafael booked Razor Cut",
      "newAppointment": "New appointment",
      "timeAgoPart1": "",
      "timeAgoPart2": " minutes ago"
    }
  },
  "perspectiveCta": {
    "title1": "Ready to fill",
    "title2": "your chairs?",
    "subtitle": "Set up your barbershop in under 5 minutes. Try it free for 15 days, no commitment.",
    "feature1": "15 days free",
    "feature2": "No setup fee",
    "feature3": "Cancel anytime",
    "btnStart": "Start Free Trial",
    "btnAccess": "Access My Account",
    "trust1": "Human Support included",
    "trust2": "Instant Payments (Pix) integrated"
  }
,
    "terms": {
    "title": "Terms of Service",
    "subtitle": "Professional SaaS Standard • Updated April 19, 2026",
    "intro": "Welcome to <strong className=\"text-white\">NEXT</strong>. These Terms of Use govern the access and use of our management platform by beauty salons and barbershops. By using the system, you confirm your full acceptance of these terms operated by <strong className=\"text-white font-bold ml-1\">StarApp Sistemas LTDA ME (CNPJ 21.239.503/0001-94)</strong>.",
    "disclaimer_title": "Legal Questions?",
    "disclaimer_desc": "If you have questions about these terms, please contact our compliance team.",
    "clause1_title": "1. Definitions and Purpose",
    "clause1_content": "The NEXT system is a Software as a Service (SaaS) platform offering management tools for beauty establishments. By contracting NEXT, the Establishment acquires a limited, non-exclusive, and revocable license to use it, without any transfer of intellectual property of the software or its source codes.",
    "clause2_title": "2. Intellectual Property",
    "clause2_content": "All intellectual property rights regarding the NEXT system, including brands, logos, designs, algorithms, and artwork, belong exclusively to StarApp Sistemas LTDA ME. Any attempt at reverse engineering, decompilation, or copying of features without prior written authorization is strictly prohibited.",
    "clause3_title": "3. Data Processing Agreement (DPA)",
    "clause3_content": "In compliance with data protection laws:\
a) The **Establishment** will act as the **Controller** of their final customers data.\
b) **NEXT** will act as the **Processor**, processing data only for the purposes of executing the contracted service.\
c) NEXT implements technical security measures, but the responsibility for lawful collection and consent of final customers lies entirely with the Establishment.",
    "clause4_title": "4. Payments and Billing",
    "clause4_content": "Plans operate on a prepaid basis. Failure to pay on the due date will result in immediate suspension of services after a 48-hour delay. Cancellation can be requested at any time via the dashboard; however, there will be no refunds for amounts already paid for the current period, given that the license was already made available.",
    "clause5_title": "5. Content Responsibility",
    "clause5_content": "The Establishment is solely responsible for the information, photos, and portfolio registered on their page within NEXT. NEXT reserves the right to remove any content that infringes third-party copyrights, contains inappropriate material, or violates applicable local laws.",
    "clause6_title": "6. SLA and Availability",
    "clause6_content": "NEXT aims to maintain an uptime greater than 99.5%. Scheduled interruptions for maintenance will be communicated in advance. NEXT is not responsible for failures resulting from user internet instability, third-party payment gateway issues, or external cloud services.",
    "clause7_title": "7. Technical Support",
    "clause7_content": "Support is offered via online chat and email during standard business hours. The average response time for the first contact is 10 minutes for critical issues. Improvement suggestions are recorded and prioritized according to the platforms technical roadmap, with no guarantee of immediate implementation.",
    "clause8_title": "8. Termination and Data Portability",
    "clause8_content": "If the contract is terminated, the Establishment has the right to request the export of their customer data and appointment history in a standard format (CSV/JSON). 60 days after the final closure of the account, NEXT may permanently delete the data from the database, except those required by law."
},
    "privacy": {
    "title": "Privacy Policy",
    "subtitle": "Transparency and Data Security",
    "intro": "Your privacy is our priority at <strong className=\"text-white\">NEXT</strong>. We collect, store, and process your data and your customers data with the highest encryption standards.",
    "section1_title": "Data Collection",
    "section1_content": "We collect essential information for system operation, such as name, email, phone number, and appointment history.",
    "section2_title": "Use of Information",
    "section2_content": "Information is used exclusively to facilitate appointments, send WhatsApp notifications, and generate financial reports for the establishment.",
    "section3_title": "Data Sharing",
    "section3_content": "NEXT does not sell or share data with third parties for marketing purposes. Sharing only occurs with infrastructure providers (such as payment gateways and cloud servers) necessary for operation.",
    "section4_title": "Your Rights",
    "section4_content": "You and your customers have the right to request access, correction, or deletion of personal data stored on the platform at any time."
},
    "about": {
    "title": "About Us",
    "subtitle": "The Growth Engine for Barbershops",
    "mission_title": "Our Mission",
    "mission_content": "To end empty chairs once and for all. We developed NEXT because we believe barbershops shouldn't waste time with paper notes, no-show clients, or complicated cash register closings.",
    "vision_title": "Vision of Empire",
    "vision_content": "Every detail was designed to transform a simple barbershop into a true empire. From automatic scheduling to professional checkout links, we deliver the best experience for you and your end client.",
    "contact_title": "Contact Us",
    "contact_content": "We are ready to listen to you. Get in touch through our official support or via corporate email."
}
  },
  es: {
    clientApp: {
      nav: { home: "Inicio", search: "Buscar", agenda: "Citas", favorites: "Favoritos", profile: "Perfil" },
      header: { notifications: "Notificaciones", login: "Entrar", myAccount: "Mi Cuenta" },
      menu: {
        myData: "Mis Datos", addresses: "Direcciones", cards: "Mis Tarjetas",
        security: "Seguridad", access: "Mis Accesos", preferences: "Preferencias",
        loyalty: "Fidelidad", history: "Historial", packages: "Paquetes",
        subscriptions: "Suscripciones", support: "Soporte", terms: "Términos de Uso", logout: "Cerrar Sesión"
      },
      prefs: {
        title: "Preferencias", subtitle: "Mis Configuraciones",
        appearance: "Apariencia", darkMode: "Modo Oscuro", lightMode: "Modo Claro",
        darkModeDesc: "Tema oscuro en toda la app", lightModeDesc: "Tema claro en toda la app",
        language: "Idioma", languageDesc: "Elige el idioma de la aplicación",
        shortcuts: "Atajos", securityShortcut: "Seguridad",
        securityShortcutDesc: "Contraseña y autenticación en 2 pasos",
        notifShortcut: "Notificaciones", notifShortcutDesc: "Recordatorios de citas en la app",
        open: "Abrir", active: "Activo"
      },
      common: {
        save: "Guardar", saving: "Guardando...", cancel: "Cancelar", back: "Volver",
        loading: "Cargando...", confirm: "Confirmar", delete: "Eliminar", edit: "Editar"
      },
      footer: {
        tagline: "Una nueva experiencia para una antigua tradición.",
        quickAccess: "Acceso rápido", more: "Más",
        cookiePrefs: "Preferencias de cookies", downloadApp: "Descarga nuestra App",
        isManager: "¿Eres gestor?",
        managerDesc: "Registra tu establecimiento y empieza a recibir citas online.",
        learnMore: "Saber más", rights: "Todos los derechos reservados."
      }
    },
  "navbar": {
    "home": "Inicio",
    "about": "Sobre",
    "features": "Funciones",
    "pricing": "Precios",
    "freeTrial": "Prueba Gratis",
    "login": "Acceder",
    "customer": "Soy Cliente",
    "systemAccess": "Acceso al Sistema",
    "professional": "Profesional",
    "createFreeAccount": "Crear Cuenta Gratis",
    "lang_pt": "Portugués",
    "lang_en": "Inglés",
    "lang_es": "Español",
    "faq": "Preguntas Frecuentes"
  },
  "hero": {
    "badge": "El Futuro es NEXT",
    "title_part1": "Acaba con las ",
    "title_highlight": "sillas vacías",
    "title_part2": " en tu barbería.",
    "subtitle": "Elimina la falta de clientes. NEXT es el único sistema que agenda, cobra por adelantado y trae a tu cliente de vuelta en piloto automático mientras cortas el pelo.",
    "cta_main": "Empezar 15 Días Gratis",
    "cta_secondary": "Ver Demostración",
    "stat1_value": "+182.000",
    "stat1_label": "Citas",
    "stat2_value": "+$ 280K",
    "stat2_label": "Gestionados",
    "stat3_value": "+2.000",
    "stat3_label": "Barberos",
    "social_proof_start": "Únete a",
    "social_proof_highlight": "+2.000 barberos",
    "social_proof_end": "exitosos",
    "trust1": "15 Días Gratis",
    "trust2": "Sin compromiso"
  },
  "pricing": {
    "title_part1": "Una inversión que",
    "title_highlight": "se paga sola.",
    "monthly": "Mensual",
    "semiannual": "Semestral",
    "yearly": "Anual",
    "billedOnceLabel": "cobrado una vez",
    "freeTrialText": "Pruébalo gratis por 15 días. Cancela cuando quieras.",
    "recommended": "Recomendado",
    "perMonth": "/mes",
    "subscribe": "Suscribirse a",
    "plan_solo_desc": "Lo esencial para quienes empiezan solos y buscan profesionalismo.",
    "plan_pro_desc": "El equilibrio perfecto para barberías en crecimiento.",
    "plan_empire_desc": "Poder total para redes, franquicias y grandes barberías.",
    "f_solo_1": "Gestión de 1 Profesional",
    "f_solo_2": "Agenda Inteligente Ilimitada",
    "f_solo_3": "Comandas de Consumo",
    "f_solo_4": "Finanzas Básicas",
    "f_solo_5": "Soporte por Correo",
    "f_pro_1": "Todo lo de Start",
    "f_pro_2": "Hasta 5 Profesionales",
    "f_pro_3": "Automatización WhatsApp",
    "f_pro_4": "Fidelidad y Promociones",
    "f_pro_5": "Integraciones por Webhook",
    "f_empire_1": "Todo lo de Pro",
    "f_empire_2": "Hasta 100 Profesionales",
    "f_empire_3": "Gestión Multi-Unidad / Franquicias",
    "f_empire_4": "B.I. y Reportes en Tiempo Real",
    "f_empire_5": "Gerente de Cuenta Dedicado"
  },
  "features": {
    "title_part1": "Tu Barbería en",
    "title_highlight": "Piloto Automático.",
    "subtitle": "Explora el ecosistema nativo más grande del mercado. NEXT consolida desde agendas y comandas hasta una universidad completa para el gerente.",
    "explore": "Explorar",
    "viewAll": "Ver Todas las Funciones"
  },
  "howItWorks": {
    "eyebrow": "Experiencia del Cliente",
    "title_part1": "Agendamiento en",
    "title_highlight": "4 Pasos Simples.",
    "subtitle": "Mira lo rápido e intuitivo que es para tu cliente hacer una reserva en tu vitrina digital.",
    "s1_label": "Interfaz del Cliente",
    "s1_title": "Elige al Profesional",
    "s1_desc": "Tus clientes seleccionan su barbero preferido, viendo reseñas y portafolios reales en segundos.",
    "s2_label": "Menú Personalizado",
    "s2_title": "Menú de Servicios Online",
    "s2_desc": "Un catálogo digital premium que muestra servicios, precios, duraciones y combos con total claridad.",
    "s3_label": "Agenda Inteligente",
    "s3_title": "Horarios en Tiempo Real",
    "s3_desc": "Franjas de tiempo integradas a la agenda del barbero. Sin conflictos, sin llamadas, reserva directa.",
    "s4_label": "Reduce Inasistencias",
    "s4_title": "Disparos por WhatsApp",
    "s4_desc": "Confirmación instantánea y alertas automáticas enviadas al celular para reducir faltas hasta un 95%."
  },
  "comparison": {
    "eyebrow": "Comparación Eficiente",
    "title_part1": "Más Organización.",
    "title_highlight": "Cero Estrés.",
    "subtitle": "Entiende por qué llevar tu barbería en papel o WhatsApp manual te está costando ingresos diarios.",
    "recommended": "Recomendado",
    "c1_title": "Agenda de Papel",
    "c1_sub": "La barrera física",
    "c1_p1": "Tachaduras frecuentes y agenda desordenada",
    "c1_p2": "Cero control de caja o historial de clientes",
    "c1_p3": "Riesgo constante de perder la agenda física",
    "c1_p4": "El cliente solo agenda si estás disponible para responder",
    "c2_title": "WhatsApp Manual",
    "c2_sub": "Fuga de atención",
    "c2_p1": "Dejar de cortar el pelo a cada rato para responder",
    "c2_p2": "Mensajes acumulados y clientes sin respuesta fuera de horario",
    "c2_p3": "Dificultad extrema para calcular comisiones e ingresos",
    "c2_p4": "Olvido constante de citas informales",
    "c3_title": "App Barbeiro (NEXT)",
    "c3_sub": "El imperio en piloto automático",
    "c3_p1": "Enlace de reserva online activo 24/7",
    "c3_p2": "Recordatorios anti-falta automáticos por WhatsApp",
    "c3_p3": "Ingresos brutos, ticket promedio y flujo de caja calculados al instante",
    "c3_p4": "Cobro de anticipo por Pix para eliminar sillas vacías",
    "t_col1": "Funcionalidad Clave",
    "t_col2": "Agenda Física",
    "t_col3": "WhatsApp",
    "t_r1": "Agendamiento autónomo 24/7",
    "t_r2": "Recordatorios anti-falta por WhatsApp",
    "t_r3": "Historial completo y perfiles de clientes",
    "t_r4": "Cálculo automático de comisiones",
    "t_r5": "Cobro de anticipo Pix antes de reservar",
    "t_r6": "Control financiero en la nube y flujo de caja",
    "t_r7": "Panel exclusivo para el equipo",
    "t_r8": "Soporte y actualizaciones constantes",
    "t_limits": "Límites"
  },
  "footer": {
    "cta_title_part1": "¿PREPARADO PARA EL",
    "cta_title_highlight": "PRÓXIMO NIVEL?",
    "cta_subtitle": "Únete a más de 1.200 barberías que ya han transformado su negocio con NEXT.",
    "cta_button_main": "Empezar Ahora",
    "cta_button_sec": "Ver Precios",
    "desc": "La plataforma definitiva para reservas y gestión de barberías. Desde el barbero principiante hasta grandes cadenas.",
    "col1_title": "Producto",
    "col1_l1": "Agenda",
    "col1_l2": "Financiero",
    "col1_l3": "WhatsApp",
    "col1_l4": "Punto",
    "col2_title": "Empresa",
    "col2_l1": "Sobre NEXT",
    "col2_l2": "Planes",
    "col2_l3": "Blog",
    "col2_l4": "Contacto",
    "col3_title": "Contacto",
    "rights": "© 2025 NEXT SISTEMAS. TODOS LOS DERECHOS RESERVADOS.",
    "privacy": "Políticas de Privacidad",
    "terms": "Términos de Uso",
    "status": "Estado: Operacional"
  },
  "featureDetail": {"back":"Volver a la vista general","ctaTitle":"¿Listo para dominar esta función?","ctaDesc":"Deja de usar sistemas que limitan tu crecimiento. NEXT tiene todo lo que necesitas habilitado ahora.","ctaButton":"Empezar Mis 15 Días Gratis"},
  "mockups": {"intro":{"title1":"La visión de tu","highlight":"Imperio","subtitle":"Cada detalle fue diseñado para facilitar tu gestión y encantar a tus clientes.","scroll":"Desplázate para explorar"},"search":"Buscar cliente, servicio...","welcome":"BIENVENIDO,","cashier":"Caja","nav":{"overview":"Vista General","analytics":"Análisis","schedule":"Agenda","records":"REGISTROS","professionals":"Profesionales","services":"Servicios","products":"Productos","clients":"Clientes","sales":"VENTAS","orders":"Comandas","plans":"Planes y Suscripciones","subscribers":"Suscriptores","loyalty":"Fidelidad","reviews":"Reseñas","logout":"Salir"},"a":{"badge":"ANÁLISIS ESTRATÉGICO","title":"Gestión del Negocio","subtitle":"Una visión estratégica para maximizar ganancias y crecimiento.","alert1Title":"CAÍDA DE FACTURACIÓN","alert1Desc":"El movimiento cayó 56% respecto a la semana pasada.","alert2Title":"HORARIO OCIOSO","alert2Desc":"El horario de las 14h no tiene facturación este período. ¿Qué tal una promo?","kpiTicket":"TICKET PROMEDIO","kpiTicketSub":"Gasto promedio por cliente","kpiRetention":"TASA DE RETENCIÓN","kpiRetentionSub":"Clientes que volvieron","kpiForecast":"PREVISIÓN (30D)","kpiForecastSub":"Ingresos ya agendados","kpiProfit":"GANANCIA","kpiProfitSub":"Resultado neto","ranking":"Ranking por Ganancia Generada","gross":"Bruto","commission":"Comisión","net":"Neto","topServices":"Servicios Destacados","sales":"ventas","insight":"Insight: \"Servicio\" representa el 45% de la facturación.","peakHours":"Horarios de Mayor Ingreso","peakHint":"La barra más alta indica el horario de mayor facturación.","vip":"Clientes VIP (Top 5)"},"g":{"title":"AGENDA OPERATIVA","allPros":"TODOS LOS PROFESIONALES","day":"DÍA","week":"SEMANA","month":"MES","print":"IMPRIMIR / PDF","quickFit":"ENCAJE RÁPIDO","tabAppointments":"TURNOS","tabWaitlist":"LISTA DE ESPERA","tabFree":"HORARIOS LIBRES","weekdays":["DOM","LUN","MAR","MIÉ","JUE","VIE","SÁB"],"moreSlots":"HORARIOS","jobs":"JOBS"},"b":{"suggestions":"SUGERENCIAS PARA TI","popular":"POPULAR","tabs":["Servicios","Detalles","Profesionales","Productos","Fidelidad","Suscripciones","Reseñas"],"book":"AGENDAR","min":"MIN"},"slides":[{"title":"Métricas de Rendimiento","desc":"Sigue tu facturación, ganancias y el desempeño diario de tu barbería con gráficos fáciles de entender."},{"title":"Agenda Inteligente","desc":"Controla todos los horarios del equipo en una sola pantalla. Arrastra turnos, confirma asistencias y optimiza tu tiempo."},{"title":"Reserva Online","desc":"Tus clientes reservan directo desde el celular en cualquier momento, sin esperar a que respondas por WhatsApp."}]},
  "featuresData": {
    "agenda-inteligente": {
      "title": "Agenda Anti-Faltas",
      "oneLiner": "Recordatorios de WhatsApp y cobros anticipados para acabar de una vez con las sillas vacías.",
      "heroTitle": "Una silla vacía te cuesta muy caro.",
      "heroDesc": "Asegura que tus clientes asistan. Nuestro sistema inteligente reduce las ausencias en tu barbería hasta un 85%.",
      "benefits": [
        {
          "title": "Recordatorios Automáticos",
          "desc": "El sistema envía mensajes 2h y 24h antes del turno. El cliente no olvida y tú no pierdes dinero."
        },
        {
          "title": "Seña de Garantía",
          "desc": "Exige el pago de una seña (vía PIX o tarjeta) a clientes que suelen reservar y no aparecer."
        },
        {
          "title": "Mapeo Visual",
          "desc": "Mira la agenda y sabe al instante por los colores quién confirmó, quién pagó y quién se atrasó."
        }
      ]
    },
    "financeiro-avancado": {
      "title": "Finanzas y División Automática",
      "oneLiner": "Transfiere comisiones del equipo en el momento exacto de la transacción y cierra el mes sin hojas de cálculo confusas.",
      "heroTitle": "El fin del caos en el cierre.",
      "heroDesc": "Olvídate de las cuentas en papel y las planillas inestables. Automatiza la liquidación con tu equipo y ten el control en la mano.",
      "benefits": [
        {
          "title": "Cierre Inmediato",
          "desc": "Con 1 clic, ve las ganancias reales ya descontando costos, salidas y hasta las tasas invisibles de la máquina."
        },
        {
          "title": "División de Cobros",
          "desc": "Los pagos online se dividen al instante: tu parte va al salón y la del barbero cae en su cuenta."
        },
        {
          "title": "Previsibilidad Diaria",
          "desc": "Deja de adivinar. El sistema muestra cuánta facturación futura ya está asegurada en tu agenda de mañana."
        }
      ]
    },
    "garcom-digital": {
      "title": "Recepcionista 24/7",
      "oneLiner": "Un enlace que responde y cierra reservas por sí solo, incluso de madrugada.",
      "heroTitle": "Agenda clientes hasta de madrugada.",
      "heroDesc": "Un enlace de reservas siempre abierto, que atiende a tus clientes incluso fuera del horario comercial, sin necesidad de nadie en recepción.",
      "benefits": [
        {
          "title": "Enlace Directo para Instagram/WhatsApp",
          "desc": "Un enlace ligero y rápido para poner en la bio o enviar por WhatsApp — el cliente lo abre y agenda en segundos, sin instalar nada."
        },
        {
          "title": "Funciona en el Navegador",
          "desc": "No exige que el cliente descargue ninguna app. Basta abrir el enlace en cualquier celular y agendar."
        },
        {
          "title": "Reprogramación con Aprobación",
          "desc": "El cliente puede pedir cambiar el horario, pero la reprogramación solo se confirma después de que la apruebas."
        }
      ]
    },
    "fidelizacao-magnetica": {
      "title": "Motor de Retención",
      "oneLiner": "Un club de puntos que anima al cliente a volver, con tarjeta de fidelidad directo en Apple Wallet.",
      "heroTitle": "Convierte clientes de una vez en clientes fieles.",
      "heroDesc": "Un programa de puntos fácil de configurar, que incentiva al cliente a volver y a gastar más en cada visita.",
      "benefits": [
        {
          "title": "Club de Puntos Personalizable",
          "desc": "Define cuánto dinero equivale a un punto y crea recompensas que animan al cliente a gastar más para canjear."
        },
        {
          "title": "Recordatorio de Regreso",
          "desc": "El sistema avisa automáticamente al cliente por WhatsApp cuando ya pasó la época recomendada para volver a cortarse."
        },
        {
          "title": "Tarjeta de Fidelidad en Apple Wallet",
          "desc": "El cliente guarda la tarjeta de puntos directo en la billetera digital del iPhone, sin ninguna app extra."
        }
      ]
    },
    "controle-equipe": {
      "title": "Rayos X del Equipo",
      "oneLiner": "Mira el desempeño de cada profesional y controla exactamente lo que cada uno puede acceder en el sistema.",
      "heroTitle": "Deja de gestionar el salón por intuición.",
      "heroDesc": "Sigue la agenda y la facturación de cada profesional, con permisos de acceso claros para cada función del equipo.",
      "benefits": [
        {
          "title": "Panel Individual del Profesional",
          "desc": "Cada barbero accede a su propia agenda y sus propias ganancias, sin tener que preguntarte."
        },
        {
          "title": "Permisos por Función",
          "desc": "Define qué puede hacer cada rol: Recepcionista, Barbero Estándar o Gerente tienen accesos distintos dentro del mismo sistema."
        },
        {
          "title": "Ranking de Rendimiento",
          "desc": "Ve quién factura más y quién atiende más, directo en el panel del gestor, sin cruzar planillas."
        }
      ]
    },
    "padrao-premium": {
      "title": "Vitrina Ultra-Premium",
      "oneLiner": "Una página de reservas hermosa, rápida y con tu marca, no un formulario genérico.",
      "heroTitle": "Una primera impresión de alto nivel.",
      "heroDesc": "Tu página de reservas lleva el logo y las fotos de tu barbería, con una interfaz rápida y estilo Modo Oscuro.",
      "benefits": [
        {
          "title": "Tu Marca en la Página",
          "desc": "Pon el logo y las fotos de tu barbería en la página de reservas que el cliente ve y usa."
        },
        {
          "title": "Galería de Trabajos",
          "desc": "Muestra fotos de los cortes y servicios realizados directo en la vitrina, para atraer a quien aún no te conoce."
        },
        {
          "title": "Interfaz Rápida y Moderna",
          "desc": "Una experiencia de reserva fluida, pensada para el celular, sin pantallas lentas ni recargadas."
        }
      ]
    },
    "gestao-estoque": {
      "title": "Inventario Cero Fugas",
      "oneLiner": "Controla el stock de productos con descuento automático cada vez que algo se vende en la comanda.",
      "heroTitle": "Sabe exactamente qué hay en tu stock.",
      "heroDesc": "Deja de perder dinero con productos venciendo o desapareciendo sin explicación. Ten control real de lo que entra y sale.",
      "benefits": [
        {
          "title": "Descuento Automático en la Venta",
          "desc": "Cuando un producto se vende en una comanda, se descuenta de tu stock al instante, sin registrarlo de nuevo."
        },
        {
          "title": "Alerta de Stock Bajo",
          "desc": "El panel avisa cuando un producto se está agotando, para que repongas antes de que falte."
        },
        {
          "title": "Comparación de Costo y Venta",
          "desc": "Ve lado a lado cuánto pagas por el producto y cuánto le cobras al cliente, para saber si el margen es saludable."
        }
      ]
    },
    "importacao-lote": {
      "title": "Migración Mágica (1 Clic)",
      "oneLiner": "Trae tu lista de clientes de cualquier hoja de cálculo o sistema antiguo en pocos minutos.",
      "heroTitle": "Cambia de sistema sin perder nada.",
      "heroDesc": "Sube un archivo de planilla (CSV) con tu base de clientes actual y NEXT organiza todo para que empieces ya con tu cartera completa.",
      "benefits": [
        {
          "title": "Importación por Planilla",
          "desc": "Acepta archivos CSV o exportados de Google Sheets, sin formatear nada manualmente."
        },
        {
          "title": "Detección de Duplicados",
          "desc": "El sistema identifica clientes registrados más de una vez y ayuda a evitar registros repetidos."
        },
        {
          "title": "Historial Preservado",
          "desc": "La información de contacto y registro de tus clientes se mantiene exactamente como estaba antes de la migración."
        }
      ]
    },
    "avaliacoes-clientes": {
      "title": "Evaluaciones de Clientes",
      "oneLiner": "El cliente evalúa el servicio directo en la app, vinculado a la cita que realmente tuvo.",
      "heroTitle": "Sabe lo que tus clientes realmente piensan.",
      "heroDesc": "Después de cada atención, el cliente puede dar una nota y dejar un comentario — solo quien realmente fue atendido puede evaluar.",
      "benefits": [
        {
          "title": "Evaluación Vinculada a la Reserva",
          "desc": "Solo quien tuvo un turno confirmado o concluido puede evaluar, evitando notas falsas."
        },
        {
          "title": "Nota y Comentario por Atención",
          "desc": "El cliente da una nota de 1 a 5 estrellas y puede dejar un comentario sobre el servicio."
        },
        {
          "title": "Vista por Profesional",
          "desc": "Sigue el promedio de evaluaciones de cada barbero e identifica quién necesita atención en el servicio."
        }
      ]
    },
    "universidade": {
      "title": "Universidad Privada",
      "oneLiner": "Cursos de gestión y marketing para barberías, directo dentro del sistema.",
      "heroTitle": "Crece como gestor, no solo con la tijera.",
      "heroDesc": "Accede a cursos prácticos sobre gestión, marketing y atención pensados específicamente para quien administra una barbería.",
      "benefits": [
        {
          "title": "Contenido Práctico y Directo",
          "desc": "Clases enfocadas en aplicar en el día a día de la barbería, sin relleno teórico."
        },
        {
          "title": "Acceso Dentro del Panel",
          "desc": "Mira los cursos directo en el sistema que ya usas, sin entrar a otra plataforma."
        },
        {
          "title": "Contenido Actualizado Periódicamente",
          "desc": "Se agregan nuevos cursos a medida que la plataforma evoluciona, manteniéndote a ti y a tu equipo al día."
        }
      ]
    },
    "relatorios-bi": {
      "title": "B.I. (Inteligencia de Negocios)",
      "oneLiner": "Basta de suposiciones. Informes directos que muestran, en segundos, dónde se está filtrando tu ganancia.",
      "heroTitle": "Decisiones con datos, no con corazonadas.",
      "heroDesc": "Ve exactamente cuánto entra, cuánto sale y dónde se escapa tu ganancia — sin abrir una planilla.",
      "benefits": [
        {
          "title": "Horarios Pico y Vacíos",
          "desc": "Gráficos simples muestran qué días y horarios se llenan y cuáles quedan vacíos, para ajustar precios y turnos con precisión."
        },
        {
          "title": "Exportación para el Contador",
          "desc": "Genera reportes en .csv y PDF listos para enviar directo a tu contador, sin retrabajo a fin de mes."
        },
        {
          "title": "Ganancia por Servicio",
          "desc": "Descubre qué servicios realmente dan ganancia y cuáles solo ocupan la silla sin valer el tiempo del profesional."
        }
      ]
    },
    "multi-unidades": {
      "title": "Franquicias (Súper Anfitrión)",
      "oneLiner": "Gestiona todas las unidades de tu red, en cualquier barrio o ciudad, con un solo inicio de sesión.",
      "heroTitle": "Hecho para quien tiene más de una unidad.",
      "heroDesc": "Cambia entre tus unidades con un clic en el panel y agrega nuevas barberías siempre que tu red crezca.",
      "benefits": [
        {
          "title": "Cambio de Unidad en 1 Clic",
          "desc": "Un selector en la parte superior del panel muestra todas tus unidades. Elige una y todo el panel cambia a sus datos al instante."
        },
        {
          "title": "Agrega Unidades Cuando Quieras",
          "desc": "Crea nuevas barberías directo en Configuración > Mis Unidades, sin crear un nuevo login."
        },
        {
          "title": "Una Sola Suscripción",
          "desc": "Cada unidad nueva entra automáticamente en tu plan Empire — sin cobro separado por local."
        }
      ]
    }
  },
  "group1": {
    "faq1_q": "¿Necesito registrar una tarjeta de crédito para probar?",
    "faq1_a": "¡No! La prueba es 100% gratuita y no requerimos ningún dato financiero. Solo pagas si decides continuar después del período de prueba.",
    "faq2_q": "¿El sistema funciona en el celular?",
    "faq2_a": "Sí, NEXT es totalmente responsivo y funciona perfectamente en teléfonos móviles, tabletas y computadoras.",
    "faq3_q": "¿Cómo funciona la migración de datos?",
    "faq3_a": "Contamos con una herramienta de importación fácil y, en los planes Pro y Empire, nuestro equipo ayuda en todo el proceso de migración.",
    "faq4_q": "¿Puedo cancelar cuando quiera?",
    "faq4_a": "Por supuesto. No hay fidelidad ni multas. Puedes cancelar tu suscripción en cualquier momento directamente desde el panel.",
    "faq5_q": "¿Ofrecen soporte?",
    "faq5_a": "¡Sí! Ofrecemos soporte a través de chat, correo electrónico y WhatsApp (para planes Pro y Empire) en horario comercial.",
    "faq_title": "Preguntas Frecuentes",
    "faq_subtitle": "Todo lo que necesitas saber antes de empezar.",
    "t1_name": "João Pereira",
    "t1_role": "Propietario - Barbería Don João, SP",
    "t1_text": "Cambiamos la agenda física por NEXT y nuestras ausencias cayeron un 90% en solo 4 semanas. El cobro de anticipos por Pix salvó mis ingresos mensuales.",
    "t2_name": "Mariana Nunes",
    "t2_role": "Dueña - Barber Queen & Esmaltería, RS",
    "t2_text": "La barrera de mensajes en WhatsApp se acabó. Ahora los clientes reservan solos en la madrugada y nuestra agenda amanece llena en piloto automático.",
    "t3_name": "Pedro Henrique",
    "t3_role": "Supervisor - Elite Barber Shop, GO",
    "t3_text": "El control de comisiones era mi mayor pesadilla mensual. Hoy NEXT lo hace todo automáticamente en segundos. No lo cambio por nada.",
    "t4_name": "Beatriz Carvalho",
    "t4_role": "Gerente - Confeitaria & Barber Concept, SP",
    "t4_text": "La función de múltiples profesionales compartiendo la agenda con paneles individuales cambió el juego para nuestra barbería. Visualización limpia y profesional.",
    "t5_name": "Lucas Silveira",
    "t5_role": "Dueño - Barbería Corleone, RJ",
    "t5_text": "El enlace de reserva en línea es extremadamente rápido. Mis clientes elogian mucho la facilidad de reservar por celular en segundos.",
    "t6_name": "Marcos Souza",
    "t6_role": "Propietario - Club Men Salon, MG",
    "t6_text": "Aumentamos el ticket promedio de la barbería ofreciendo combos a través del sistema. El cliente ve los combos al momento de reservar y termina eligiéndolos.",
    "t7_name": "Camila Rocha",
    "t7_role": "Gerente - Classic Barber Club, BA",
    "t7_text": "Mis clientes elogian mucho la facilidad de reserva. Sin necesidad de descargar una aplicación, reservan en 3 clics a través del navegador de su propio teléfono.",
    "t8_name": "Thiago Martins",
    "t8_role": "Propietario - Barbería VIP, SC",
    "t8_text": "Tener un sistema completo con nuestra marca y recordatorios automáticos en WhatsApp redujo el tiempo de soporte a cero. Inversión extremadamente justa.",
    "t9_name": "Fernanda Lima",
    "t9_role": "Dueña - Retro Barber Studio, PR",
    "t9_text": "El flujo de caja y los informes de ganancias me dieron claridad sobre qué servicios tienen más margen. Aumentamos los ingresos reales en un 35%.",
    "t10_name": "Rodrigo Melo",
    "t10_role": "Socio - Barber & Co., DF",
    "t10_text": "NEXT funciona sin problemas en el móvil, la tableta y la computadora. Gestiono mis dos unidades desde cualquier parte del mundo desde mi celular con total seguridad.",
    "t11_name": "Amanda Costa",
    "t11_role": "Dueña - Barber & Beauty, PE",
    "t11_text": "Los recordatorios automáticos reducen drásticamente las ausencias. El cliente recibe un enlace de cancelación si lo necesita, liberando el horario.",
    "t12_name": "Gustavo Santos",
    "t12_role": "Propietario - Santo Bigode, CE",
    "t12_text": "Excelente costo-beneficio. El sistema se paga solo el primer día con ahorro de tiempo y reducción de ausencias de clientes.",
    "testimonials_label": "Testimonios Reales",
    "testimonials_heading_1": "Barberías Reales.",
    "testimonials_heading_2": "Resultados Reales.",
    "testimonials_description": "Únase a miles de gerentes de élite que jubilaron la agenda de papel y escalaron sus ganancias.",
    "stat1_label": "Barberías Conectadas",
    "stat2_label": "Citas de Hoy",
    "stat3_label": "Servicios Realizados",
    "stat4_label": "Clientes Activos",
    "video_title_prefix": "Caso de ",
    "video_title_highlight": "Éxito",
    "video_description": "Vea cómo las barberías de todo Brasil están transformando su gestión con nuestra plataforma.",
    "video_overlay_title": "La Revolución en la Gestión",
    "video_overlay_subtitle": "Mira el testimonio completo",
    "faq_label": "Preguntas Frecuentes",
    "faq_headline": "Respuestas rápidas.",
    "faq_desc": "Todo lo que necesitas saber sobre el sistema y los planes. ¿No encontraste lo que buscabas? Nuestro equipo está listo para ayudarte.",
    "faq_contact": "Hablar con soporte"
  },
  "group2": {
    "ProblemSolution": {
      "pain1": "Los clientes olvidan la cita y no avisan.",
      "solution1": "Los recordatorios automáticos por WhatsApp reducen las faltas en un 80%.",
      "pain2": "Agenda física desordenada o en el WhatsApp personal.",
      "solution2": "Enlace de reservas 24h que organiza todo solo.",
      "pain3": "Sin control real de lo que entra y sale en caja.",
      "solution3": "Flujo de caja en tiempo real e informes de ganancias claros.",
      "pain4": "Dificultad para fidelizar y hacer que el cliente vuelva.",
      "solution4": "Sistema de puntos y promociones que recupera clientes.",
      "titlePart1": "¿Cortas cabello o",
      "titlePart2": "gestionas problemas?",
      "subtitle": "Deja de perder tiempo con tareas manuales. Mira la diferencia entre quienes usan NEXT y quienes siguen a oscuras.",
      "withoutNext": "Sin NEXT",
      "commonResultLabel": "Resultado Común:",
      "commonResultDesc1": "Noches sin dormir e ingresos",
      "commonResultDesc2": "yendo por el desagüe.",
      "withNext": "Con NEXT",
      "eliteJumpLabel": "El Salto de Élite:",
      "eliteJumpDesc1": "Agenda llena y gestión en",
      "eliteJumpDesc2": "verdadero piloto automático."
    },
    "CheckoutShowcase": {
      "step1Title": "Servicio",
      "step1Desc": "Corte + Barba",
      "step2Title": "Profesional",
      "step2Desc": "Marcelo Maestro",
      "step3Title": "Fecha/Hora",
      "step3Desc": "Hoy, 15:00",
      "step4Title": "Confirmación",
      "step4Desc": "Pago Seguro",
      "conversionMax": "Conversión Máxima",
      "titlePart1": "Reservas Sin Fricción.",
      "titlePart2": "Checkout de Élite.",
      "subtitle": "Inspirado en los checkouts de e-commerce más rápidos del mundo. Tu cliente reserva y paga en menos de 30 segundos, directo desde el navegador.",
      "clientExp": "Experiencia del Cliente",
      "maestroSummary": "Resumen Maestro",
      "waiting": "Esperando...",
      "totalInvested": "Total Invertido",
      "totalValue": "$ 85,00",
      "confirmReservation": "Confirmar Reserva",
      "encryptedTransaction": "Transacción Encriptada",
      "maestroSuggestion": "Sugerencia Maestro",
      "dryPomade": "Pomada Efecto Seco",
      "bumpPrice": "+ $ 25"
    },
    "MainDashboardShowcase": {
      "titlePart1": "El Panel de Control",
      "titlePart2": "de Tu Imperio.",
      "subtitle": "Una interfaz limpia y potente. Ten visión total de tus ingresos, agenda y rendimiento del equipo en tiempo real, sin hojas de cálculo confusas.",
      "imgAlt": "Dashboard Central",
      "revenue": "Ingresos",
      "revenueValue": "$ 18.420",
      "appointments": "Reservas",
      "appointmentsValue": "42 Hoy",
      "expectedProfit": "Ganancia Esperada",
      "expectedProfitValue": "$ 18.420",
      "teamRanking": "Ranking del Equipo",
      "teamRankingValue": "Felipe M.",
      "avgTicket": "Ticket Promedio",
      "avgTicketValue": "$ 64,00",
      "returnRate": "Tasa de Retorno",
      "returnRateValue": "84%"
    },
    "PremiumExperience": {
      "cat1": "SIMPLICIDAD",
      "title1": "Acceso vía Código QR o Enlace",
      "desc1": "Cero barreras. Tu cliente reserva en el momento de la impulsión.",
      "cat2": "AGILIDAD",
      "title2": "Reserva en 3 toques",
      "desc2": "Interfaz ultrarrápida optimizada para conversión móvil.",
      "cat3": "RETENCIÓN",
      "title3": "Fidelización automática",
      "desc3": "El sistema reconoce al cliente y fomenta su regreso.",
      "titlePart1": "LA EXPERIENCIA",
      "titlePart2": "PREMIUM",
      "titlePart3": "DE RESERVAS.",
      "subtitle": "NEXT fue diseñado para eliminar la fricción. Tu cliente no necesita apps pesadas ni registros complejos. Es reservar y listo."
    }
  },
  "group3": {
    "productShowcase": {
      "sections": [
        {
          "title": "Agenda Maestro: Control Total",
          "desc": "Visualiza toda tu operación en segundos. Arrastra y suelta citas, gestiona profesionales y elimina el papel definitivamente.",
          "features": [
            "Vista Diaria/Semanal Pro",
            "Bloqueo de Horas Inteligente",
            "Sincronización Cloud"
          ]
        },
        {
          "title": "Las métricas que importan",
          "desc": "Decisiones basadas en datos, no en suposiciones. Rastrea tu ticket promedio, tasa de retención e ingresos brutos con gráficos intuitivos.",
          "features": [
            "Reportes de Facturación",
            "Ranking de Profesionales",
            "Previsión de Ingresos"
          ]
        },
        {
          "title": "El Sitio de Tu Barbería",
          "desc": "Una vitrina digital profesional funcionando 24/7. Tu cliente elige el servicio, el barbero y el horario sin tener que llamarte.",
          "features": [
            "Agendamiento Online 24/7",
            "Totalmente Responsivo",
            "Enlace Personalizado"
          ]
        }
      ],
      "headingLine1": "Visión General de Tu ",
      "headingLine2": "Imperio.",
      "bodyText": "Cada detalle fue diseñado para facilitar tu gestión y encantar a tus clientes.",
      "proFeature": "Función Pro",
      "exploreDetails": "Explorar Detalles"
    },
    "rollingNotifications": {
      "services": [
        "João – Corte Degradado agendado ahora",
        "Lucas – Corte Clásico agendado hace 2 minutos",
        "Rafael – Barba completa agendada",
        "Mateus – Low Fade agendado hace 5 minutos",
        "Carlos – Mid Fade agendado ahora",
        "Felipe – Ejecutivo agendado hace 1 minuto",
        "André – Skin Fade agendado ahora",
        "Pedro – Corte Social agendado hace 3 minutos"
      ],
      "appName": "NEXT APP"
    },
    "sideSocialProof": {
      "messages": [
        "Felipe entró en la plataforma",
        "Lucas está explorando el sistema",
        "Rafael inició una prueba gratis",
        "Gabriel creó una cuenta"
      ]
    },
    "toastActivity": {
      "messages": [
        "Lucas acaba de crear una cuenta",
        "Pedro inició prueba gratuita",
        "Barbería Kings acaba de registrarse",
        "Marcos inició prueba gratuita",
        "Studio VIP acaba de registrarse"
      ],
      "justNow": "Ahora mismo"
    }
  },
  "group4": {
    "vclSection": {
      "titlePart1": "Mira ahora y descubre",
      "titlePart2": "el poder de NEXT",
      "subtitle": "Mira en menos de 2 minutos cómo barberías de alto rendimiento automatizan todo y se centran en lo importante.",
      "altImage": "Múltiples barberos trabajando",
      "tourTitle": "TOUR POR EL SISTEMA (01:54)",
      "resolution": "Alta Resolución 4K"
    },
    "whatsappHighlight": {
      "syncStatus": "Sincronizado",
      "encryption": "Cifrado Maestro",
      "message1": "¡Buenos días! Quiero cortarme el pelo a las 17h.",
      "autoReserve": "Reserva Automática ✅",
      "confirmedTime": "¡Horario de las 17:00 confirmado!",
      "confirmationTitle": "Confirmación NEXT",
      "confirmationDate": "Hoy a las 17:00",
      "confirmationBarber": "Con Barbero Junior",
      "paymentLink": "Te hemos enviado el enlace para el pago anticipado. 🚀",
      "writeHere": "Escribe aquí...",
      "automationBadge": "Automatización Nativa",
      "titlePart1": "Donde está tu cliente,",
      "titlePart2": "NEXT también está.",
      "subtitle": "Acaba con las interrupciones para responder mensajes. NEXT automatiza tu agenda por WhatsApp, garantizando cero fricción y agenda llena.",
      "feature1Title": "Recordatorios Anti-Falta",
      "feature1Desc": "Alertas proactivas que reducen las inasistencias hasta en un 80%.",
      "feature2Title": "Enlace de Reserva Élite",
      "feature2Desc": "Tu cliente agenda en segundos, directo desde WhatsApp o Instagram.",
      "feature3Title": "Confirmación vía Chatbot",
      "feature3Desc": "El sistema valida la disponibilidad y reserva el horario al instante.",
      "ctaButton": "Llenar Mi Agenda Ahora"
    },
    "fixedCta": {
      "ctaButton": "Crear mi barbería ahora"
    },
    "liveActivity": {
      "notif1": "Lucas agendó Corte Degradado",
      "notif2": "Mateus agendó Corte + Barba",
      "notif3": "Pedro agendó Corte Clásico",
      "notif4": "João agendó Barba",
      "notif5": "Rafael agendó Corte a Navaja",
      "newAppointment": "Nueva reserva",
      "timeAgoPart1": "hace ",
      "timeAgoPart2": " minutos"
    }
  },
  "perspectiveCta": {
    "title1": "¿Listo para llenar",
    "title2": "tus sillas?",
    "subtitle": "Configura tu barbería en menos de 5 minutos. Pruébalo gratis por 15 días, sin compromiso.",
    "feature1": "15 días gratis",
    "feature2": "Sin costo de instalación",
    "feature3": "Cancela en cualquier momento",
    "btnStart": "Iniciar Prueba Gratis",
    "btnAccess": "Acceder a Mi Cuenta",
    "trust1": "Soporte Humano incluido",
    "trust2": "Integración de pagos inmediatos"
  }
},
    "terms": {
    "title": "Términos de Servicio",
    "subtitle": "Estándar Profesional SaaS • Actualizado el 19 de Abril de 2026",
    "intro": "Bienvenido a <strong className=\"text-white\">NEXT</strong>. Estos Términos de Uso rigen el acceso y la utilización de nuestra plataforma de gestión por parte de establecimientos de belleza y barberías. Al utilizar el sistema, usted confirma su aceptación íntegra de estos términos operados por <strong className=\"text-white font-bold ml-1\">StarApp Sistemas LTDA ME (CNPJ 21.239.503/0001-94)</strong>.",
    "disclaimer_title": "¿Dudas Legales?",
    "disclaimer_desc": "Si tiene preguntas sobre estos términos, comuníquese con nuestro equipo de cumplimiento.",
    "clause1_title": "1. Definiciones y Objeto",
    "clause1_content": "El sistema NEXT es una plataforma de Software como Servicio (SaaS) que ofrece herramientas de gestión para establecimientos de belleza. Al contratar NEXT, el Establecimiento adquiere una licencia de uso limitada, no exclusiva y revocable, sin que se produzca ninguna transferencia de propiedad intelectual del software o sus códigos fuente.",
    "clause2_title": "2. Propiedad Intelectual",
    "clause2_content": "Todos los derechos de propiedad intelectual sobre el sistema NEXT, incluyendo marcas, logotipos, diseños, algoritmos y artes, pertenecen exclusivamente a StarApp Sistemas LTDA ME. Queda terminantemente prohibida cualquier tentativa de ingeniería inversa, descompilación o copia de funcionalidades sin autorización previa por escrito.",
    "clause3_title": "3. Acuerdo de Procesamiento de Datos (DPA)",
    "clause3_content": "En cumplimiento con las leyes de protección de datos:\
a) El **Establecimiento** actuará como **Controlador** de los datos de sus clientes finales.\
b) **NEXT** actuará como **Operador**, procesando los datos solo para los fines de ejecución del servicio contratado.\
c) NEXT implementa medidas técnicas de seguridad, pero la responsabilidad por la recopilación lícita y el consentimiento de los clientes finales recae enteramente en el Establecimiento.",
    "clause4_title": "4. Pagos y Facturación",
    "clause4_content": "Los planes operan en régimen de prepago. La falta de pago en la fecha de vencimiento resultará en la suspensión inmediata de los servicios después de 48 horas de retraso. La cancelación se puede solicitar en cualquier momento a través del panel; sin embargo, no habrá reembolsos por los montos ya pagados correspondientes al período actual.",
    "clause5_title": "5. Responsabilidad de Contenido",
    "clause5_content": "El Establecimiento es el único responsable de la información, fotos y portafolio registrados en su página dentro de NEXT. NEXT se reserva el derecho de eliminar cualquier contenido que infrinja los derechos de autor de terceros, contenga material inapropiado o viole las leyes vigentes.",
    "clause6_title": "6. SLA y Disponibilidad",
    "clause6_content": "NEXT busca mantener una disponibilidad (uptime) superior al 99.5%. Las interrupciones programadas para mantenimiento serán comunicadas con antelación. NEXT no se responsabiliza por fallas derivadas de inestabilidades en el internet del usuario, problemas en pasarelas de pago de terceros o servicios en la nube externos.",
    "clause7_title": "7. Soporte Técnico",
    "clause7_content": "El soporte se ofrece a través de chat en línea y correo electrónico en horario comercial. El tiempo promedio de respuesta para el primer contacto es de 10 minutos para problemas críticos. Las sugerencias de mejora se registran y priorizan según la hoja de ruta técnica de la plataforma, sin garantía de implementación inmediata.",
    "clause8_title": "8. Rescisión y Portabilidad",
    "clause8_content": "En caso de finalizar el contrato, el Establecimiento tiene derecho a solicitar la exportación de los datos de sus clientes y el historial de citas en un formato estándar (CSV/JSON). Pasados 60 días del cierre definitivo de la cuenta, NEXT podrá eliminar permanentemente los datos de la base de datos, excepto aquellos requeridos por ley."
},
    "privacy": {
    "title": "Política de Privacidad",
    "subtitle": "Transparencia y Seguridad de Datos",
    "intro": "Su privacidad es nuestra prioridad en <strong className=\"text-white\">NEXT</strong>. Recopilamos, almacenamos y procesamos sus datos y los de sus clientes con los más altos estándares de cifrado.",
    "section1_title": "Recopilación de Datos",
    "section1_content": "Recopilamos información esencial para la operación del sistema, como nombre, correo electrónico, teléfono e historial de citas.",
    "section2_title": "Uso de la Información",
    "section2_content": "La información se utiliza exclusivamente para facilitar las citas, enviar notificaciones por WhatsApp y generar informes financieros para el establecimiento.",
    "section3_title": "Compartición de Datos",
    "section3_content": "NEXT no vende ni comparte datos con terceros con fines de marketing. La compartición solo ocurre con proveedores de infraestructura (como pasarelas de pago y servidores en la nube) necesarios para la operación.",
    "section4_title": "Tus Derechos",
    "section4_content": "Usted y sus clientes tienen derecho a solicitar el acceso, la corrección o la eliminación de los datos personales almacenados en la plataforma en cualquier momento."
},
    "about": {
    "title": "Sobre Nosotros",
    "subtitle": "El Motor de Crecimiento para Barberías",
    "mission_title": "Nuestra Misión",
    "mission_content": "Terminar de una vez por todas con las sillas vacías. Desarrollamos NEXT porque creemos que las barberías no deberían perder tiempo con notas en papel, clientes que no asisten o cierres de caja complicados.",
    "vision_title": "Visión de Imperio",
    "vision_content": "Cada detalle fue diseñado para transformar una barbería simple en un verdadero imperio. Desde citas automáticas hasta enlaces de pago profesionales, ofrecemos la mejor experiencia para usted y su cliente final.",
    "contact_title": "Contáctanos",
    "contact_content": "Estamos listos para escucharte. Ponte en contacto a través de nuestro soporte oficial o mediante correo electrónico corporativo."
}

};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('pt');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem('appbarber_lang');
        if (savedLang && translations[savedLang]) {
            setLanguage(savedLang);
        } else {
            setLanguage('pt');
        }
        setMounted(true);
    }, []);

    const changeLanguage = (lang) => {
        if (translations[lang]) {
            setLanguage(lang);
            localStorage.setItem('appbarber_lang', lang);
        }
    };

    const t = (key) => {
        const keys = key.split('.');
        const langToUse = mounted ? language : 'pt';
        let value = translations[langToUse];
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                return key;
            }
        }
        return value;
    }

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, mounted }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useTranslation = () => useContext(LanguageContext);
