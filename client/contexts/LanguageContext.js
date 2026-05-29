'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  pt: {
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
    "stat3_value": "+2.300",
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
    "yearly": "Anual",
    "freeTrialText": "Teste grátis por 7 dias. Cancele quando quiser.",
    "recommended": "Recomendado",
    "perMonth": "/mês",
    "subscribe": "Assinar",
    "plan_start_desc": "O essencial para quem está começando e quer profissionalismo.",
    "plan_pro_desc": "O equilíbrio perfeito para barbearias em crescimento.",
    "plan_ultimate_desc": "Poder total para impérios e grandes barbearias.",
    "f_start_1": "Agenda Maestro Ilimitada",
    "f_start_2": "Gestão de 1 Profissional",
    "f_start_3": "Comandas Básicas",
    "f_start_4": "Relatórios Mensais",
    "f_start_5": "Suporte via Email",
    "f_pro_1": "Tudo do plano Start",
    "f_pro_2": "Até 3 Profissionais",
    "f_pro_3": "WhatsApp Automation",
    "f_pro_4": "Comandas de Consumo",
    "f_pro_5": "Fidelidade & Promoções",
    "f_pro_6": "Suporte Prioritário",
    "f_ult_1": "Tudo do plano PRO",
    "f_ult_2": "Profissionais Ilimitados",
    "f_ult_3": "Relatórios em Tempo Real",
    "f_ult_4": "Checkout Customizado",
    "f_ult_5": "API de Integração",
    "f_ult_6": "Gerente de Conta"
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
  "featuresData": {
    "agenda-inteligente": {
      "title": "Agendadora Anti-Falta",
      "oneLiner": "Lembretes no WhatsApp e cobrança de garantias para acabar de vez com os horários furados."
    },
    "financeiro-avancado": {
      "title": "Financeiro & Split Automático",
      "oneLiner": "Repasse comissões do time na exata hora da transação e feche o mês sem planilhas confusas."
    },
    "garcom-digital": {
      "title": "Recepcionista 24/7",
      "oneLiner": "Um link que atende, vende serviços adicionais e fecha reservas sozinho — até de madrugada."
    },
    "fidelizacao-magnetica": {
      "title": "Motor de Retenção",
      "oneLiner": "Estimule o retorno semanas antes com nosso Clube de Pontos direto na Apple Wallet."
    },
    "controle-equipe": {
      "title": "Raio-X da Equipe",
      "oneLiner": "Acompanhe quem capta mais lucro e crie metas gamificadas sem que sintam que estão vigiados."
    },
    "padrao-premium": {
      "title": "Vitrine Ultra-Premium",
      "oneLiner": "Projete muito luxo no primeiro contato com uma aplicação bela, rápida e no padrão Dark Mode."
    },
    "gestao-estoque": {
      "title": "Vazamento Zero (Estoque)",
      "oneLiner": "Controle mercadorias preciosas rigorosamente. Baixas em tempo real na hora da comanda."
    },
    "importacao-lote": {
      "title": "Migração Mágica (1-Click)",
      "oneLiner": "Largue amanhã sua plataforma ultrapassada e mova mil nomes VIP ao seu novo palco agora."
    },
    "avaliacoes-clientes": {
      "title": "Pesquisa NPS Sigilosa",
      "oneLiner": "Colha reclamações antes da indignação pública e potencialize apenas as notas 5 lá no Google."
    },
    "universidade": {
      "title": "Universidade Privada",
      "oneLiner": "Software sozinho não atrai gente. Aperte o play nos cursos de marketing pra barbeiros aqui dentro."
    },
    "relatorios-bi": {
      "title": "B.I. (Business Intelligence)",
      "oneLiner": "Abomine achismos. Relatórios contundentes que respondem em segundos as falhas ocultas no lucro."
    },
    "multi-unidades": {
      "title": "Franquias (Super Host)",
      "oneLiner": "Transacione a matriz da zona norte contra o polo litorâneo perfeitamente dentro da mesma sessão logada."
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
},
  en: {
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
    "stat3_value": "+2,300",
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
    "yearly": "Yearly",
    "freeTrialText": "Try it free for 7 days. Cancel anytime.",
    "recommended": "Recommended",
    "perMonth": "/month",
    "subscribe": "Subscribe to",
    "plan_start_desc": "The essentials for those starting out and wanting professionalism.",
    "plan_pro_desc": "The perfect balance for growing barbershops.",
    "plan_ultimate_desc": "Total power for empires and large barbershops.",
    "f_start_1": "Unlimited Maestro Schedule",
    "f_start_2": "Manage 1 Professional",
    "f_start_3": "Basic Orders",
    "f_start_4": "Monthly Reports",
    "f_start_5": "Email Support",
    "f_pro_1": "Everything in Start",
    "f_pro_2": "Up to 3 Professionals",
    "f_pro_3": "WhatsApp Automation",
    "f_pro_4": "Consumption Orders",
    "f_pro_5": "Loyalty & Promotions",
    "f_pro_6": "Priority Support",
    "f_ult_1": "Everything in PRO",
    "f_ult_2": "Unlimited Professionals",
    "f_ult_3": "Real-Time Reports",
    "f_ult_4": "Custom Checkout",
    "f_ult_5": "Integration API",
    "f_ult_6": "Account Manager"
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
  "featuresData": {
    "agenda-inteligente": {
      "title": "Anti-No-Show Scheduler",
      "oneLiner": "WhatsApp reminders and upfront payments to end empty chairs for good."
    },
    "financeiro-avancado": {
      "title": "Advanced Finance & Auto-Split",
      "oneLiner": "Transfer staff commissions at the exact moment of the transaction and close the month without messy spreadsheets."
    },
    "garcom-digital": {
      "title": "24/7 Digital Receptionist",
      "oneLiner": "A link that answers, upsells services, and books reservations on its own — even at dawn."
    },
    "fidelizacao-magnetica": {
      "title": "Retention Engine",
      "oneLiner": "Stimulate returns weeks in advance with our Points Club right in Apple Wallet."
    },
    "controle-equipe": {
      "title": "Staff X-Ray",
      "oneLiner": "Track who generates the most profit and set gamified goals without them feeling watched."
    },
    "padrao-premium": {
      "title": "Ultra-Premium Storefront",
      "oneLiner": "Project luxury at first contact with a beautiful, fast, Dark Mode-standard app."
    },
    "gestao-estoque": {
      "title": "Zero Leakage Inventory",
      "oneLiner": "Strictly control precious goods. Real-time stock drops at the moment of the order."
    },
    "importacao-lote": {
      "title": "Magic 1-Click Migration",
      "oneLiner": "Drop your outdated platform tomorrow and move a thousand VIP names to your new stage right now."
    },
    "avaliacoes-clientes": {
      "title": "Secret NPS Survey",
      "oneLiner": "Gather complaints before public outrage and amplify only the 5-star ratings on Google."
    },
    "universidade": {
      "title": "Private University",
      "oneLiner": "Software alone doesn't attract people. Hit play on the marketing courses for barbers inside here."
    },
    "relatorios-bi": {
      "title": "Business Intelligence",
      "oneLiner": "Abhor guesswork. Hard-hitting reports that answer hidden profit flaws in seconds."
    },
    "multi-unidades": {
      "title": "Franchises (Super Host)",
      "oneLiner": "Transact the north zone headquarters against the coastal branch perfectly within the same logged-in session."
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
},
  es: {
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
    "stat3_value": "+2.300",
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
    "yearly": "Anual",
    "freeTrialText": "Pruébalo gratis por 7 días. Cancela cuando quieras.",
    "recommended": "Recomendado",
    "perMonth": "/mes",
    "subscribe": "Suscribirse a",
    "plan_start_desc": "Lo esencial para quienes empiezan y buscan profesionalismo.",
    "plan_pro_desc": "El equilibrio perfecto para barberías en crecimiento.",
    "plan_ultimate_desc": "Poder total para imperios y grandes barberías.",
    "f_start_1": "Agenda Maestro Ilimitada",
    "f_start_2": "Gestión de 1 Profesional",
    "f_start_3": "Comandas Básicas",
    "f_start_4": "Reportes Mensuales",
    "f_start_5": "Soporte por Correo",
    "f_pro_1": "Todo lo de Start",
    "f_pro_2": "Hasta 3 Profesionales",
    "f_pro_3": "Automatización WhatsApp",
    "f_pro_4": "Comandas de Consumo",
    "f_pro_5": "Fidelidad y Promociones",
    "f_pro_6": "Soporte Prioritario",
    "f_ult_1": "Todo lo de PRO",
    "f_ult_2": "Profesionales Ilimitados",
    "f_ult_3": "Reportes en Tiempo Real",
    "f_ult_4": "Checkout Personalizado",
    "f_ult_5": "API de Integración",
    "f_ult_6": "Gerente de Cuenta"
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
  "featuresData": {
    "agenda-inteligente": {
      "title": "Agenda Anti-Faltas",
      "oneLiner": "Recordatorios de WhatsApp y cobros anticipados para acabar de una vez con las sillas vacías."
    },
    "financeiro-avancado": {
      "title": "Finanzas y División Automática",
      "oneLiner": "Transfiere comisiones del equipo en el momento exacto de la transacción y cierra el mes sin hojas de cálculo confusas."
    },
    "garcom-digital": {
      "title": "Recepcionista 24/7",
      "oneLiner": "Un enlace que responde, vende servicios adicionales y cierra reservas por sí solo, incluso de madrugada."
    },
    "fidelizacao-magnetica": {
      "title": "Motor de Retención",
      "oneLiner": "Estimula el regreso semanas antes con nuestro Club de Puntos directamente en Apple Wallet."
    },
    "controle-equipe": {
      "title": "Rayos X del Equipo",
      "oneLiner": "Sigue quién genera más ganancias y crea metas gamificadas sin que se sientan vigilados."
    },
    "padrao-premium": {
      "title": "Vitrina Ultra-Premium",
      "oneLiner": "Proyecta lujo en el primer contacto con una aplicación hermosa, rápida y en estándar Dark Mode."
    },
    "gestao-estoque": {
      "title": "Inventario Cero Fugas",
      "oneLiner": "Controla mercancías preciosas estrictamente. Bajas en tiempo real en el momento del pedido."
    },
    "importacao-lote": {
      "title": "Migración Mágica (1 Clic)",
      "oneLiner": "Abandona mañana tu plataforma obsoleta y mueve mil nombres VIP a tu nuevo escenario ahora."
    },
    "avaliacoes-clientes": {
      "title": "Encuesta NPS Secreta",
      "oneLiner": "Recopila quejas antes de la indignación pública y amplifica solo las calificaciones de 5 estrellas en Google."
    },
    "universidade": {
      "title": "Universidad Privada",
      "oneLiner": "El software por sí solo no atrae gente. Presiona play en los cursos de marketing para barberos aquí adentro."
    },
    "relatorios-bi": {
      "title": "B.I. (Inteligencia de Negocios)",
      "oneLiner": "Aborrece las suposiciones. Informes contundentes que responden en segundos a las fallas de ganancias ocultas."
    },
    "multi-unidades": {
      "title": "Franquicias (Súper Anfitrión)",
      "oneLiner": "Realiza transacciones en la sede central de la zona norte frente a la sucursal costera perfectamente dentro de la misma sesión iniciada."
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
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, mounted }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useTranslation = () => useContext(LanguageContext);
