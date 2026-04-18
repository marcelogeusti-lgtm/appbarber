import {
    Calendar,
    TrendingUp,
    MessageSquare,
    Heart,
    Users,
    Smartphone,
    Package,
    Import,
    Star,
    Video,
    BarChart3,
    Building2
} from 'lucide-react';

export const featuresData = {
    'agenda-inteligente': {
        slug: 'agenda-inteligente',
        icon: Calendar,
        color: 'text-blue-500',
        bgIcon: 'bg-blue-500/10',
        title: "Agenda Anti-Falta (Bot)",
        oneLiner: "O NEXT cobra os clientes antes e os lembra no WhatsApp. Acabe com o No-Show invisível.",
        heroTitle: "Não sofra mais com Cadeiras Vazias.",
        heroDesc: "Agendamento inteligente que garante a confirmação e reduz as faltas do seu estabelecimento em até 85%.",
        benefits: [
            { title: "Lembretes Automáticos", desc: "Envio de mensagens 2h e 24h via WhatsApp sem esforço manual." },
            { title: "Bloqueio de No-Show", desc: "Clientes com alto índice de faltas devem pagar sinal." },
            { title: "Gestão por Color-Code", desc: "Visão diária, semanal ou mensal categorizada por cores de status." }
        ]
    },
    'financeiro-avancado': {
        slug: 'financeiro-avancado',
        icon: TrendingUp,
        color: 'text-emerald-500',
        bgIcon: 'bg-emerald-500/10',
        title: "Financeiro Pro & Comissões",
        oneLiner: "Trave o fechamento do caixa sem erros. Divisão automática de comissões PIX na hora.",
        heroTitle: "Domínio Absoluto do Fluxo de Caixa.",
        heroDesc: "Acabe com a confusão para pagar o fim de semana dos barbeiros. Split de pagamentos automático.",
        benefits: [
            { title: "Fechamento Rápido", desc: "1 clique para ver entradas, saídas e taxas retidas da maquininha." },
            { title: "Split de Pagamentos", desc: "Ao receber via Mercado Pago ou cartão, a comissão já é descontada automaticamente." },
            { title: "Previsões Diárias", desc: "Saiba quanto você tem provisionado a receber amanhã com base na agenda." }
        ]
    },
    'garcom-digital': {
        slug: 'garcom-digital',
        icon: MessageSquare,
        color: 'text-primary',
        bgIcon: 'bg-primary/10',
        title: "Garçom Digital (24/7)",
        oneLiner: "Seu link de agendamento trabalha de madrugada enquanto você dorme, sem precisar baixar Apps.",
        heroTitle: "Seja contratado de Madrugada.",
        heroDesc: "Um bot completo que processa agendamentos por conta própria mesmo com você off-line.",
        benefits: [
            { title: "Link na Bio", desc: "Perfeito para redes sociais. Um fluxo leve e direto focando em vendas." },
            { title: "Sem Instalação", desc: "Nenhum cliente precisa baixar aplicativo. Roda 100% no navegador (Web App)." },
            { title: "Autonomia", desc: "Clientes cancelam e remarcam sozinhos de acordo com as regras de tempo que você definir." }
        ]
    },
    'fidelizacao-magnetica': {
        slug: 'fidelizacao-magnetica',
        icon: Heart,
        color: 'text-rose-500',
        bgIcon: 'bg-rose-500/10',
        title: "Fidelização Magnética",
        oneLiner: "Traga o cliente de volta semanas antes do cabelo dele crescer com avisos e pontos automatizados.",
        heroTitle: "Transforme Visitantes em Fanáticos.",
        heroDesc: "A ciência comprova: cliente com meta de pontos retorna 42% mais rápido. Apple Wallet Integrado.",
        benefits: [
            { title: "Cashback e Pontos", desc: "Configure quantos R$ representam 1 ponto e libere prêmios em serviços." },
            { title: "Retenção Passiva", desc: "Avisamos pelo WhatsApp quando os pontos do cliente estão prestes a expirar." },
            { title: "Passes da Apple Wallet", desc: "O seu próprio cartão digital vivendo dentro do iOS Wallet do seu cliente." }
        ]
    },
    'controle-equipe': {
        slug: 'controle-equipe',
        icon: Users,
        color: 'text-violet-500',
        bgIcon: 'bg-violet-500/10',
        title: "Controle da Equipe",
        oneLiner: "Saiba exatamente qual barbeiro dá mais lucro e quem mais atrai clientes novos na sua unidade.",
        heroTitle: "Painel Espião de Produtividade.",
        heroDesc: "Não gerencie por achismo. Tenha na palma da mão os indicadores de lucratividade de cada parceiro.",
        benefits: [
            { title: "Extratos Individuais", desc: "Seu barbeiro tem um login próprio pra ver quanto gerou e quanto irá receber." },
            { title: "Níveis de Permissão", desc: "Crie senhas para Barbeiros (vê só a própria agenda) ou Gerentes (vê tudo menos lucro master)." },
            { title: "Horários Customizados", desc: "Sete uma rotina individual: feriados, pausas para almoço e dias off por funcionário." }
        ]
    },
    'padrao-premium': {
        slug: 'padrao-premium',
        icon: Smartphone,
        color: 'text-gray-900',
        bgIcon: 'bg-gray-900/10',
        title: "Site com Padrão Premium",
        oneLiner: "Eleve o nível. Entregue uma experiência de agendamento sem fricção que impressiona seus clientes.",
        heroTitle: "A Primeira Impressão de Ouro.",
        heroDesc: "Apresente uma vitrine deslumbrante e Dark Mode customizada para a sua marca.",
        benefits: [
            { title: "White Label Sutil", desc: "Adicione sua logomarca e sua cor para que pareça que é um aplicativo só seu." },
            { title: "Portfólio de Barbeiros", desc: "Exiba as imagens do salão e fotos exclusivas para instigar o luxo." },
            { title: "Performance Rápida", desc: "Carregamento instantâneo feito com servidor Vercel para não perder ninguém no Loading." }
        ]
    },
    'gestao-estoque': {
        slug: 'gestao-estoque',
        icon: Package,
        color: 'text-amber-500',
        bgIcon: 'bg-amber-500/10',
        title: "Estoque & Inventário",
        oneLiner: "Acompanhe pomadas, bebidas e lâminas em tempo real e saiba quando recomprar.",
        heroTitle: "O Fim dos Desperdícios e Desvios.",
        heroDesc: "Produtos vendidos no caixa são baixados automaticamente do estoque interno da filial.",
        benefits: [
            { title: "Dedução Automática", desc: "Ao criar uma Comanda (Pedido), os itens vendidos saem direto do inventário." },
            { title: "Alerta de Estoque Baixo", desc: "Receba avisos na Dashboard de quais produtos precisam ser repostos urgente." },
            { title: "Valor de Revenda", desc: "Controle da margem de Lucro (Custo de Custo vs Custo de Venda)." }
        ]
    },
    'importacao-lote': {
        slug: 'importacao-lote',
        icon: Import,
        color: 'text-fuchsia-500',
        bgIcon: 'bg-fuchsia-500/10',
        title: "Importação 1-Clique",
        oneLiner: "Traga toda sua base atual de clientes das antigas planilhas do Excel para o sistema em segundos.",
        heroTitle: "Migração Sem Perder um Fio de Cabelo.",
        heroDesc: "Sabemos o trauma de migrar sistemas. Nós reduzimos de 40 horas de trabalho manual para 1 clique.",
        benefits: [
            { title: "CSV Universal", desc: "Suporte para arquivos Excel, Google Sheets ou exportação de concorrentes." },
            { title: "Validação Anti-Duplicata", desc: "O sistema limpa números de telefone quebrados ou nomes duplicados automaticamente." },
            { title: "Preserva Históricos", desc: "Guarde as informações pregressas dos seus frequentadores VIPs sem recomeçar do zero." }
        ]
    },
    'avaliacoes-clientes': {
        slug: 'avaliacoes-clientes',
        icon: Star,
        color: 'text-yellow-500',
        bgIcon: 'bg-yellow-500/10',
        title: "Avaliações Secretas",
        oneLiner: "Módulo interno de Feedbacks. Saiba discretamente o que os clientes acharam do serviço antes que postem no Google.",
        heroTitle: "O Termômetro Final de Qualidade.",
        heroDesc: "O Google Review salva a empresa, as Reviews Internas salvam o serviço diário.",
        benefits: [
            { title: "Feedback Automático", desc: "Ao fim de cada serviço, um link sutil pede nota de 1 a 5." },
            { title: "Visão Gerencial", desc: "Verifique quais profissionais ganham mais estrelas e bonifique-os." },
            { title: "Ação Preventiva", desc: "Intercepte clientes insatisfeitos com um cupom de desconto antes deles reclamarem na internet." }
        ]
    },
    'universidade': {
        slug: 'universidade',
        icon: Video,
        color: 'text-indigo-500',
        bgIcon: 'bg-indigo-500/10',
        title: "Universidade SaaS",
        oneLiner: "Assista cursos internos para destravar mais clientes, com dicas de marketing e vendas pro seu salão.",
        heroTitle: "Você Evoluindo Além do Software.",
        heroDesc: "De nada adianta a melhor ferramenta na mão errada. Adicionamos aulas de tração na sua Dashboard.",
        benefits: [
            { title: "Tutorias Estratégicos", desc: "Sessões semanais ensinando macetes comerciais de retenção." },
            { title: "Comunidade VIP", desc: "Desbloqueio de insígnias assistindo horas de curso gerencial." },
            { title: "Direcionado ao Líder", desc: "Conteúdo focado nos Administradores que querem abrir filiais novas." }
        ]
    },
    'relatorios-bi': {
        slug: 'relatorios-bi',
        icon: BarChart3,
        color: 'text-cyan-500',
        bgIcon: 'bg-cyan-500/10',
        title: "Analytics & B.I.",
        oneLiner: "Os números não mentem. Gráficos em tempo real com exportação para PDF das vendas diárias.",
        heroTitle: "Sua Barbearia Baseada em Dados.",
        heroDesc: "Decida com clareza. Módulo que agrega os dias mais lucrativos contra os piores gargalos.",
        benefits: [
            { title: "Gráficos Interativos", desc: "Painéis Chart.js modernos pra visualizar picos de receita mensais." },
            { title: "Heatmaps", desc: "Descubra qual os dias e as horas na semana com mais reservas e planeje promoções." },
            { title: "Exportação Segura", desc: "Envie relatórios para o contador fechados por período (.xlsx e .pdf)." }
        ]
    },
    'multi-unidades': {
        slug: 'multi-unidades',
        icon: Building2,
        color: 'text-orange-500',
        bgIcon: 'bg-orange-500/10',
        title: "Central de Franquias",
        oneLiner: "Controle duas, dez ou cinquenta barbearias a partir de um mesmo Super Dashboard Master.",
        heroTitle: "Construído para Impérios.",
        heroDesc: "Sem Gambiarras de abrir 'contas diferentes'. Mude a unidade operada num Toggle Button.",
        benefits: [
            { title: "Multi-Tenant Switch", desc: "Alterne a visão da barbearia de São Paulo pra do Rio de Janeiro num só clique." },
            { title: "Comparação de Performance", desc: "Veja na visão Owner/Master qual matriz está arrastando a cadeia pra baixo." },
            { title: "Assinaturas Conjuntas", desc: "Pague apenas o adicional proporcional, empacotado tudo em 1 conta global." }
        ]
    }
};

export const getFeaturesArray = () => Object.values(featuresData);
export const getFeatureBySlug = (slug) => featuresData[slug] || null;
