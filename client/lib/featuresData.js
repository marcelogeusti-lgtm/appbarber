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
        heroTitle: "Seja contratado enquanto dorme.",
        heroDesc: "30% dos fechamentos ocorrem de madrugada. Tenha um assistente digital que agenda os clientes sem depender da sua recepção humanizada.",
        benefits: [
            { title: "Bio do Instagram Otimizada", desc: "Direcione as views das redes sociais para um link leve, ultrarrápido e projetado exclusivamente para a conversão." },
            { title: "Rodando Direto no Navegador", desc: "Zero necessidade de convencer o usuário a baixar aplicativos pesados. Ele abre o link e agenda em 30 segundos." },
            { title: "Remarcações Práticas", desc: "Clientes possuem autonomia para ajustar seus próprios horários sem te chamar, mas sempre exigindo seu aceite antecipado." }
        ]
    },
    'fidelizacao-magnetica': {
        slug: 'fidelizacao-magnetica',
        icon: Heart,
        color: 'text-rose-500',
        bgIcon: 'bg-rose-500/10',
        title: "Motor de Retenção",
        oneLiner: "Estimule o retorno semanas antes com nosso Clube de Pontos direto na Apple Wallet.",
        heroTitle: "Transforme sua base em clientes fanáticos.",
        heroDesc: "A ciência indica que programas de pontos reduzem o tempo de retorno do cliente em 42%. E o NEXT administra isso para você sozinha.",
        benefits: [
            { title: "Clube de Vantagens Customizado", desc: "Defina sozinho quantos reais equivalem a um ponto e engaje o usuário a comprar produtos mais caros para resgates VIP." },
            { title: "Disparos de Recuperação", desc: "Avisamos automaticamente ao celular do cliente que já chegou a época recomendada para ele cortar de novo." },
            { title: "Cartão de Bolso iOS", desc: "Surpreenda entregando um lindo passe digital de fidelidade que repousa oficialmente na carteira nativa 'Wallet' dos seus clientes." }
        ]
    },
    'controle-equipe': {
        slug: 'controle-equipe',
        icon: Users,
        color: 'text-violet-500',
        bgIcon: 'bg-violet-500/10',
        title: "Raio-X da Equipe",
        oneLiner: "Acompanhe quem capta mais lucro e crie metas gamificadas sem que sintam que estão vigiados.",
        heroTitle: "Chega de gerenciar o salão por intuição.",
        heroDesc: "Substitua a micro-gerência exaustiva por um painel de indicadores focados que atestam quem levanta a régua do seu negócio.",
        benefits: [
            { title: "Áreas Individuais Transparentes", desc: "Seu parceiro entra em um acesso pessoal dele apenas para prever sua agenda, seu caixa atual e validar onde pode melhorar." },
            { title: "Direitos e Permissões Seguras", desc: "Atribua senhas limitadas para Gerentes (podem cancelar compras) e Barbeiros Padrão (impedidos de olhar rendimento geral)." },
            { title: "Turnos Altamente Configuráveis", desc: "Estruture escalas personalizadas por membro, isolando feriados bancários e férias agendadas de forma modular." }
        ]
    },
    'padrao-premium': {
        slug: 'padrao-premium',
        icon: Smartphone,
        color: 'text-gray-900',
        bgIcon: 'bg-gray-900/10',
        title: "Vitrine Ultra-Premium",
        oneLiner: "Projete muito luxo no primeiro contato com uma aplicação bela, rápida e no padrão Dark Mode.",
        heroTitle: "Toda primeira impressão é dourada.",
        heroDesc: "Venda o seu corte por um valor elevado ancorando na estética impecável do seu app de marca. O livro é sim julgado pela capa.",
        benefits: [
            { title: "White-Label Sutil", desc: "Inserimos uma tonalidade seleta, botões polidos e toda a interface configurada para girar esteticamente ao redor do seu emblema." },
            { title: "Book Sensorial de Especialistas", desc: "Desfile catálogos fotográficos de resultados deslumbrantes que acionam no interessado um impulso irresistível pelo seu espaço." },
            { title: "Arquitetura de Vanguarda", desc: "Enraizado onde gigantes como Nike e Netflix rodam suas interfaces, as telas saltam sob os toques no celular do usuário final." }
        ]
    },
    'gestao-estoque': {
        slug: 'gestao-estoque',
        icon: Package,
        color: 'text-amber-500',
        bgIcon: 'bg-amber-500/10',
        title: "Vazamento Zero (Estoque)",
        oneLiner: "Controle mercadorias preciosas rigorosamente. Baixas em tempo real na hora da comanda.",
        heroTitle: "Aniquile furtos não intencionais.",
        heroDesc: "Acabou a conta de padaria nas pomadas ou bebidas caras. Mantenha controle hermético do seu catálogo sem ficar chato de gerir.",
        benefits: [
            { title: "Dedução Cruzada", desc: "Sempre que uma loção capilar é faturada dentro de um pedido presencial, esse mesmo produto já subtrai permanentemente da sua geladeira global." },
            { title: "Detecção de Queda Mínima", desc: "Os algoritmos do painel gerencial ficam amarelos instantaneamente assim que as cervejas beiram o final definido por você." },
            { title: "Fórmulas de Custo Reveladoras", desc: "Encare finalmente o choque de realidade comparando o seu valor gasto no atacadão perante o lucro purificado do balcão da sua recepção." }
        ]
    },
    'importacao-lote': {
        slug: 'importacao-lote',
        icon: Import,
        color: 'text-fuchsia-500',
        bgIcon: 'bg-fuchsia-500/10',
        title: "Migração Mágica (1-Click)",
        oneLiner: "Largue amanhã sua plataforma ultrapassada e mova mil nomes VIP ao seu novo palco agora.",
        heroTitle: "Diga não ao trauma de trocar sistema.",
        heroDesc: "Temos horror a formulários vazios no primeiro dia. Trouxemos um motor onde basta submeter um arquivo confuso que extraímos seus tesouros.",
        benefits: [
            { title: "Mapeador Universal Flexível", desc: "Upload amigável acatando arquivos confusos CSVs, listas soltas de Sheets, sem forçar que você trabalhe como digitador para limpar sujeira." },
            { title: "Cura Anti-Duplicação", desc: "Encontramos aquele cliente Marcos da Silva cadastrado 4 vezes, agrupamos sua relevância apagando duplos fantasmas do banco de dados." },
            { title: "Dignidade dos VIPs Intocada", desc: "Manutenção absoluta dos registros pregressos resguardando pontos históricos e preferência que você duramente fidelizou nos últimos 5 anos de carreira." }
        ]
    },
    'avaliacoes-clientes': {
        slug: 'avaliacoes-clientes',
        icon: Star,
        color: 'text-yellow-500',
        bgIcon: 'bg-yellow-500/10',
        title: "Pesquisa NPS Sigilosa",
        oneLiner: "Colha reclamações antes da indignação pública e potencialize apenas as notas 5 lá no Google.",
        heroTitle: "Blindado de críticas na ponta.",
        heroDesc: "Compreendemos que 1 estrela injusta custa clientes reais; nosso reator resolve focos de rebelião e amplifica a fama dos clientes gratos.",
        benefits: [
            { title: "Sondagem Fim de Expediente", desc: "Com um click, o cara sentado na praça de alimentação preenche anonimamente porque aquela barba de fato não foi bem desenhada hoje." },
            { title: "Interceptação Tática", desc: "Entregou 1 Estrela? Redireciona o frustrado para sua DM pedindo Desculpas com um Gift; Deu 5 estrelas? Joga imediamente pro Link da sua empresa no Google Reviews." },
            { title: "Mapa Termal do Atendimento", desc: "Informa impiedosamente a liderança evidenciando aquele cabelereiro recém admitido que não sorri perante à cartela mais chique do dia." }
        ]
    },
    'universidade': {
        slug: 'universidade',
        icon: Video,
        color: 'text-indigo-500',
        bgIcon: 'bg-indigo-500/10',
        title: "Universidade Privada",
        oneLiner: "Software sozinho não atrai gente. Aperte o play nos cursos de marketing pra barbeiros aqui dentro.",
        heroTitle: "Cresça como executivo, não apenas na tesoura.",
        heroDesc: "Uma tecnologia impecável precisa estar cravada de liderança estratégica afiada; Desbloqueie tutoriais táticos avançados construindo barreiras defensivas sobre rivais.",
        benefits: [
            { title: "Conteúdos Direto da Trincheira", desc: "Estratégias para inflar faturamento diário baseadas não em professores teóricos, porém implementadas nos corredores reais de quem cortou milhares de clientes." },
            { title: "Desbloqueio Progressivo", desc: "Alcance certas marcas gerenciais nos quadros de metas corporativas e garanta trilhas fechadas reservadas ao comitê de elite comercial." },
            { title: "Intenção para Proprietários Solitários", desc: "Afastamento progressivo operacional te ensinando as premissas contabeis que pavimentam sua primeira sala para a subsequente quarta franquia master." }
        ]
    },
    'relatorios-bi': {
        slug: 'relatorios-bi',
        icon: BarChart3,
        color: 'text-cyan-500',
        bgIcon: 'bg-cyan-500/10',
        title: "B.I. (Business Intelligence)",
        oneLiner: "Abomine achismos. Relatórios contundentes que respondem em segundos as falhas ocultas no lucro.",
        heroTitle: "O tabuleiro não mente mais.",
        heroDesc: "A intuição engana quando as faturas triplicam. Assuma um assento balizado onde relatórios cristalinos dão os prognósticos letais da gestão de capital.",
        benefits: [
            { title: "Gargalos Térmicos no Relógio", desc: "Painéis Chart.js agressivamente gráficos mapeando qual turno é o deserto da demanda vs qual sexta-feira lotou para orquestrar táticas just in time sobre a praça." },
            { title: "Expurgo de Burocracia Contadorial", desc: "Encaminhe para a agência contábil demonstrativos que reconciliam desvios passados formatados nativamente dentro de pacotes limpos (.csv/pdf)." },
            { title: "Cura da Margem Sufocada", desc: "Sindicância que mostra exatamente onde qual perfil de corte/tintura exige energia vital demais retornado menos receita percentual do ticket global do salão." }
        ]
    },
    'multi-unidades': {
        slug: 'multi-unidades',
        icon: Building2,
        color: 'text-orange-500',
        bgIcon: 'bg-orange-500/10',
        title: "Franquias (Super Host)",
        oneLiner: "Transacione a matriz da zona norte contra o polo litorâneo perfeitamente dentro da mesma sessão logada.",
        heroTitle: "Construído do zero para seu império.",
        heroDesc: "Fugimos dessa tortura que te faz logar trocando endereços de mail. Você acerta seus tentáculos como um comandante no alto sobre diversos quartéis dispersos simultaneamente.",
        benefits: [
            { title: "O Toggle Imediato", desc: "Alterne a visão de supervisão matriz SP ou filial RJ em um botão com velocidade atômica inspecionando desvios na contramão de quem é apenas gerente restrito." },
            { title: "Avaliação do Caçula", desc: "Coloque unidades novas recém estreadas versus corporações estabelecidas comparando percentuais de arranque validando a consistência do seu playbook original de modelo de barbearia." },
            { title: "Subsídio Escalado (Billing)", desc: "Uma fatura total de Software para o dono master encadeando filhos a taxas mínimas, gerando rentabilidade global barateando todo ecossistema das unidades caçulas." }
        ]
    }
};

export const getFeaturesArray = () => Object.values(featuresData);
export const getFeatureBySlug = (slug) => featuresData[slug] || null;
