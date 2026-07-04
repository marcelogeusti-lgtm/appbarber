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
        color: 'text-primary',
        bgIcon: 'bg-primary/10',
        title: "Agendadora Anti-Falta",
        oneLiner: "Lembretes no WhatsApp e cobrança de garantias para acabar de vez com os horários furados.",
        heroTitle: "Cadeira vazia custa muito caro.",
        heroDesc: "Garanta que seus clientes compareçam. Nosso sistema inteligente reduz as faltas na sua barbearia em até 85%.",
        benefits: [
            { title: "Lembretes Automáticos", desc: "O sistema envia mensagens 2h e 24h antes do horário. O cliente não esquece e você não perde dinheiro." },
            { title: "Sinal de Garantia", desc: "Exija o pagamento de um sinal (via PIX ou cartão) de clientes com o costume de marcar e não aparecer." },
            { title: "Mapeamento Visual", desc: "Bata o olho na agenda e saiba imediatamente pelas cores quem confirmou, quem pagou e quem atrasou." }
        ]
    },
    'financeiro-avancado': {
        slug: 'financeiro-avancado',
        icon: TrendingUp,
        color: 'text-emerald-500',
        bgIcon: 'bg-emerald-500/10',
        title: "Financeiro & Split Automático",
        oneLiner: "Repasse comissões do time na exata hora da transação e feche o mês sem planilhas confusas.",
        heroTitle: "Fim da confusão no fechamento.",
        heroDesc: "Livre-se das contas de papel e planilhas instáveis. Automatize o acerto com sua equipe e tenha o controle na mão.",
        benefits: [
            { title: "Fechamento Imediato", desc: "Com 1 clique, visualize lucros reais já deduzindo custos, saídas e até as taxas invisíveis da maquininha." },
            { title: "Split de Recebimento", desc: "Pagamentos online são divididos instantaneamente: a sua fatia vai pro salão e a do barbeiro cai na conta dele." },
            { title: "Previsibilidade Diária", desc: "Pare de adivinhar. O sistema mostra quanto faturamento futuro já está travado na sua agenda de amanhã." }
        ]
    },
    'garcom-digital': {
        slug: 'garcom-digital',
        icon: MessageSquare,
        color: 'text-primary',
        bgIcon: 'bg-primary/10',
        title: "Recepcionista 24/7",
        oneLiner: "Um link que atende, vende serviços adicionais e fecha reservas sozinho — até de madrugada.",
        heroTitle: "Agende clientes até de madrugada.",
        heroDesc: "Um link de agendamento sempre aberto, que atende seus clientes mesmo fora do horário comercial, sem precisar de ninguém na recepção.",
        benefits: [
            { title: "Link Direto pro Instagram/WhatsApp", desc: "Um link leve e rápido pra colocar na bio ou mandar no WhatsApp — o cliente abre e agenda em segundos, sem precisar instalar nada." },
            { title: "Funciona no Navegador", desc: "Não exige que o cliente baixe nenhum aplicativo. Basta abrir o link em qualquer celular e agendar." },
            { title: "Remarcação com Aprovação", desc: "O cliente pode pedir para mudar o horário, mas a remarcação só é confirmada depois que você aprova." }
        ]
    },
    'fidelizacao-magnetica': {
        slug: 'fidelizacao-magnetica',
        icon: Heart,
        color: 'text-primary',
        bgIcon: 'bg-primary/10',
        title: "Motor de Retenção",
        oneLiner: "Um clube de pontos que estimula o cliente a voltar, com cartão de fidelidade direto na Apple Wallet.",
        heroTitle: "Transforme clientes de uma vez em clientes fiéis.",
        heroDesc: "Um programa de pontos simples de configurar, que incentiva o cliente a voltar e a gastar mais a cada visita.",
        benefits: [
            { title: "Clube de Pontos Customizável", desc: "Defina quantos reais equivalem a um ponto e crie recompensas que incentivam o cliente a gastar mais pra resgatar." },
            { title: "Lembrete de Retorno", desc: "O sistema avisa automaticamente o cliente no WhatsApp quando já passou da época recomendada para ele voltar a cortar." },
            { title: "Cartão de Fidelidade na Apple Wallet", desc: "O cliente guarda o cartão de pontos direto na carteira digital do iPhone, sem precisar de nenhum aplicativo extra." }
        ]
    },
    'controle-equipe': {
        slug: 'controle-equipe',
        icon: Users,
        color: 'text-primary',
        bgIcon: 'bg-primary/10',
        title: "Raio-X da Equipe",
        oneLiner: "Veja o desempenho de cada profissional e controle exatamente o que cada um pode acessar no sistema.",
        heroTitle: "Chega de gerenciar o salão por intuição.",
        heroDesc: "Acompanhe a agenda e o faturamento de cada profissional, com permissões de acesso claras para cada função da equipe.",
        benefits: [
            { title: "Painel Individual do Profissional", desc: "Cada barbeiro acessa sua própria agenda e seus próprios ganhos, sem precisar te perguntar." },
            { title: "Permissões por Função", desc: "Defina o que cada papel pode fazer: Recepcionista, Barbeiro Padrão ou Gerente têm acessos diferentes dentro do mesmo sistema." },
            { title: "Ranking de Performance", desc: "Veja quem mais fatura e quem mais atende, direto no painel do gestor, sem precisar cruzar planilhas." }
        ]
    },
    'padrao-premium': {
        slug: 'padrao-premium',
        icon: Smartphone,
        color: 'text-primary',
        bgIcon: 'bg-primary/10',
        title: "Vitrine Ultra-Premium",
        oneLiner: "Uma página de agendamento bonita, rápida e com a sua marca, não um formulário genérico.",
        heroTitle: "Primeira impressão de alto padrão.",
        heroDesc: "Sua página de agendamento leva o logo e as fotos da sua barbearia, com uma interface rápida e no estilo Dark Mode.",
        benefits: [
            { title: "Sua Marca na Página", desc: "Coloque o logo e as fotos da sua barbearia na página de agendamento que o cliente vê e usa." },
            { title: "Galeria de Trabalhos", desc: "Mostre fotos dos cortes e serviços realizados direto na vitrine, pra atrair quem ainda não te conhece." },
            { title: "Interface Rápida e Moderna", desc: "Uma experiência de agendamento fluida, pensada pro celular, sem telas lentas ou poluídas." }
        ]
    },
    'gestao-estoque': {
        slug: 'gestao-estoque',
        icon: Package,
        color: 'text-primary',
        bgIcon: 'bg-primary/10',
        title: "Vazamento Zero (Estoque)",
        oneLiner: "Controle o estoque de produtos com baixa automática toda vez que algo é vendido na comanda.",
        heroTitle: "Saiba exatamente o que está no seu estoque.",
        heroDesc: "Pare de perder dinheiro com produtos vencendo ou sumindo sem explicação. Tenha controle real do que entra e sai.",
        benefits: [
            { title: "Baixa Automática na Venda", desc: "Quando um produto é vendido numa comanda, ele já é descontado do seu estoque na hora, sem precisar lançar de novo." },
            { title: "Alerta de Estoque Baixo", desc: "O painel avisa quando um produto está acabando, pra você repor antes de faltar." },
            { title: "Comparativo de Custo e Venda", desc: "Veja lado a lado quanto você paga no produto e quanto está cobrando do cliente, pra saber se a margem está saudável." }
        ]
    },
    'importacao-lote': {
        slug: 'importacao-lote',
        icon: Import,
        color: 'text-primary',
        bgIcon: 'bg-primary/10',
        title: "Migração Mágica (1-Click)",
        oneLiner: "Traga sua lista de clientes de qualquer planilha ou sistema antigo em poucos minutos.",
        heroTitle: "Trocar de sistema sem perder nada.",
        heroDesc: "Suba um arquivo de planilha (CSV) com sua base de clientes atual e o NEXT organiza tudo pra você começar já com sua carteira completa.",
        benefits: [
            { title: "Importação por Planilha", desc: "Aceita arquivos CSV ou exportados do Google Sheets, sem precisar formatar nada manualmente." },
            { title: "Detecção de Duplicados", desc: "O sistema identifica clientes cadastrados mais de uma vez e ajuda a evitar cadastros repetidos." },
            { title: "Histórico Preservado", desc: "As informações de contato e cadastro dos seus clientes são mantidas exatamente como estavam antes da migração." }
        ]
    },
    'avaliacoes-clientes': {
        slug: 'avaliacoes-clientes',
        icon: Star,
        color: 'text-primary',
        bgIcon: 'bg-primary/10',
        title: "Avaliações de Clientes",
        oneLiner: "O cliente avalia o atendimento direto pelo app, vinculado ao agendamento que ele realmente fez.",
        heroTitle: "Saiba o que seus clientes realmente acham.",
        heroDesc: "Depois de cada atendimento, o cliente pode dar uma nota e deixar um comentário — só quem realmente foi atendido pode avaliar.",
        benefits: [
            { title: "Avaliação Vinculada ao Agendamento", desc: "Só quem teve um horário confirmado ou concluído pode avaliar, evitando notas falsas." },
            { title: "Nota e Comentário por Atendimento", desc: "O cliente dá uma nota de 1 a 5 estrelas e pode deixar um comentário sobre o serviço." },
            { title: "Visão por Profissional", desc: "Acompanhe a média de avaliações de cada barbeiro e identifique quem precisa de atenção no atendimento." }
        ]
    },
    'universidade': {
        slug: 'universidade',
        icon: Video,
        color: 'text-primary',
        bgIcon: 'bg-primary/10',
        title: "Universidade Privada",
        oneLiner: "Cursos de gestão e marketing pra barbearia, direto dentro do próprio sistema.",
        heroTitle: "Cresça como gestor, não só na tesoura.",
        heroDesc: "Acesse cursos práticos sobre gestão, marketing e atendimento pensados especificamente pra quem administra uma barbearia.",
        benefits: [
            { title: "Conteúdo Prático e Direto", desc: "Aulas focadas em aplicar no dia a dia da barbearia, sem enrolação teórica." },
            { title: "Acesso Dentro do Painel", desc: "Assista aos cursos direto no sistema que você já usa, sem precisar entrar em outra plataforma." },
            { title: "Conteúdo Atualizado Periodicamente", desc: "Novos cursos são adicionados conforme a plataforma evolui, mantendo você e sua equipe atualizados." }
        ]
    },
    'relatorios-bi': {
        slug: 'relatorios-bi',
        icon: BarChart3,
        color: 'text-emerald-500',
        bgIcon: 'bg-emerald-500/10',
        title: "B.I. (Business Intelligence)",
        oneLiner: "Chega de achismo. Relatórios diretos que mostram, em segundos, onde seu lucro está vazando.",
        heroTitle: "Decisões com dados, não com feeling.",
        heroDesc: "Veja exatamente quanto entra, quanto sai e onde seu lucro está escapando — sem precisar abrir uma planilha.",
        benefits: [
            { title: "Horários de Pico e Vazios", desc: "Gráficos simples mostram quais dias e horários lotam e quais ficam vazios, pra você ajustar preços e escalas com precisão." },
            { title: "Exportação para o Contador", desc: "Gere relatórios em .csv e PDF prontos para enviar direto pro seu contador, sem retrabalho no fim do mês." },
            { title: "Lucro por Serviço", desc: "Descubra quais serviços realmente dão lucro e quais só ocupam a cadeira sem valer o tempo do profissional." }
        ]
    },
    'multi-unidades': {
        slug: 'multi-unidades',
        icon: Building2,
        color: 'text-primary',
        bgIcon: 'bg-primary/10',
        title: "Franquias (Super Host)",
        oneLiner: "Gerencie todas as unidades da sua rede, em qualquer bairro ou cidade, com um único login.",
        heroTitle: "Feito para quem tem mais de uma unidade.",
        heroDesc: "Troque entre suas unidades com um clique no painel e adicione novas barbearias sempre que sua rede crescer.",
        benefits: [
            { title: "Troca de Unidade em 1 Clique", desc: "Um seletor no topo do painel mostra todas as suas unidades. Escolha uma e o painel inteiro muda para os dados dela na hora." },
            { title: "Adicione Unidades Quando Quiser", desc: "Crie novas barbearias direto em Configurações > Minhas Unidades, sem precisar criar um novo login." },
            { title: "Uma Assinatura Só", desc: "Toda unidade nova entra automaticamente no seu plano Empire — sem cobrança separada por loja." }
        ]
    }
};

export const getFeaturesArray = () => Object.values(featuresData);
export const getFeatureBySlug = (slug) => featuresData[slug] || null;
