'use client';
import { FileText, Shield, Scale, Info, CheckCircle, Smartphone, Lock, RefreshCw, CreditCard, MessageCircle } from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { useTranslation } from '../../contexts/LanguageContext';

export default function TermsPage() {
    const { t } = useTranslation();

    const clauses = [
        {
            id: 'licenca',
            title: t('terms.section1_title') || '1. Concessão de Licença',
            icon: <FileText className="w-5 h-5 text-emerald-500" />,
            content: t('terms.section1_content') || `O NEXT concede a você uma licença revogável, não exclusiva e intransferível para usar a plataforma de acordo com o plano contratado. A conta do Estabelecimento é pessoal e intransferível, sendo expressamente proibido o compartilhamento de credenciais de administrador com terceiros não autorizados.`
        },
        {
            id: 'propriedade',
            title: t('terms.section2_title') || '2. Propriedade Intelectual',
            icon: <Shield className="w-5 h-5 text-blue-500" />,
            content: t('terms.section2_content') || `Todos os direitos de propriedade intelectual sobre o sistema NEXT, incluindo marcas, logotipos, designs, algoritmos e artes, pertencem exclusivamente à StarApp Sistemas LTDA ME. É terminantemente proibida qualquer tentativa de engenharia reversa, descompilação ou cópia de funcionalidades sem autorização prévia por escrito.`
        },
        {
            id: 'dpa',
            title: t('terms.section3_title') || '3. Acordo de Processamento de Dados (DPA)',
            icon: <Lock className="w-5 h-5 text-emerald-500" />,
            content: t('terms.section3_content') || `Em conformidade com a LGPD (Lei 13.709/2018):\na) O **Estabelecimento** atuará como **Controlador** dos dados de seus clientes finais.\nb) O **NEXT** atuará como **Operador**, processando os dados apenas para as finalidades de execução do serviço contratado.\nc) O NEXT implementa medidas técnicas de segurança, mas a responsabilidade pela coleta lícita e consentimento dos clientes finais é inteiramente do Estabelecimento.`
        },
        {
            id: 'planos',
            title: t('terms.section4_title') || '4. Pagamentos e Recorrência',
            icon: <CreditCard className="w-5 h-5 text-purple-500" />,
            content: t('terms.section4_content') || `Os planos são operados em regime de pré-pagamento. A falta de quitação na data de vencimento resultará na suspensão imediata dos serviços após 48 horas de atraso. O cancelamento pode ser solicitado a qualquer momento pelo painel, porém não haverá reembolso de valores já pagos para o período corrente, dado que a licença já foi disponibilizada.`
        },
        {
            id: 'conteudo',
            title: t('terms.section5_title') || '5. Responsabilidade por Conteúdo',
            icon: <Smartphone className="w-5 h-5 text-amber-500" />,
            content: t('terms.section5_content') || `O Estabelecimento é o único responsável pelas informações, fotos e portfólio cadastrados em sua página no NEXT. O NEXT reserva-se o direito de remover qualquer conteúdo que infrinja direitos autorais de terceiros, contenha material impróprio ou viole as leis vigentes em território nacional.`
        },
        {
            id: 'disponibilidade',
            title: t('terms.section6_title') || '6. SLA e Disponibilidade',
            icon: <RefreshCw className="w-5 h-5 text-teal-500" />,
            content: t('terms.section6_content') || `O NEXT busca manter uma disponibilidade (uptime) superior a 99,5%. Interrupções agendadas para manutenção serão comunicadas previamente. O NEXT não se responsabiliza por falhas decorrentes de instabilidades na internet do usuário, problemas em gateways de pagamento de terceiros ou serviços de nuvem externos.`
        },
        {
            id: 'suporte',
            title: t('terms.section7_title') || '7. Suporte Técnico',
            icon: <MessageCircle className="w-5 h-5 text-sky-500" />,
            content: t('terms.section7_content') || `O suporte é oferecido via chat online e e-mail em horário comercial brasileiro. O tempo médio de resposta para o primeiro contato é de 10 minutos para questões críticas. Sugestões de melhorias são registradas e priorizadas de acordo com o roadmap técnico da plataforma, sem garantia de implementação imediata.`
        },
        {
            id: 'finalizacao',
            title: t('terms.section8_title') || '8. Rescisão e Portabilidade',
            icon: <Scale className="w-5 h-5 text-zinc-500" />,
            content: t('terms.section8_content') || `Caso o contrato seja encerrado, o Estabelecimento tem o direito de solicitar a exportação de seus dados de clientes e histórico de agendamentos em formato padrão (CSV/JSON). Após 60 dias do encerramento definitivo da conta, o NEXT poderá excluir permanentemente os dados do banco de dados, exceto aqueles exigidos por lei.`
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white relative">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 py-32 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="flex flex-col gap-4 text-center">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        {t('terms.title') || 'Termos de Uso'}
                    </h1>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
                        {t('terms.subtitle') || 'Padrão SaaS Profissional • Atualizado em 19 de Abril de 2026'}
                    </p>
                    <div className="h-1 w-20 bg-primary/20 mx-auto rounded-full mt-4" />
                </div>

                {/* Intro text */}
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
                    <p className="text-slate-400 text-lg leading-relaxed mb-0 relative z-10" dangerouslySetInnerHTML={{__html: t('terms.intro') || 'Bem-vindo ao <strong class="text-white">NEXT</strong>. Estes Termos de Uso regem o acesso e a utilização da nossa plataforma de gestão por parte de estabelecimentos de beleza e barbearias. Ao utilizar o sistema, você confirma sua aceitação integral destes termos operados pela <strong class="text-white font-bold ml-1">StarApp Sistemas LTDA ME (CNPJ 21.239.503/0001-94)</strong>.'}} />
                </div>

                {/* Clauses List */}
                <div className="grid gap-6">
                    {clauses.map((clause, idx) => (
                        <div 
                            key={clause.id} 
                            className="bg-[#111] border border-white/5 rounded-[2rem] p-8 md:p-10 space-y-6 hover:border-white/10 transition-all group"
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-3.5 bg-white/5 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                    {clause.icon}
                                </div>
                                <div>
                                    <span className="text-primary/40 text-[10px] font-black uppercase tracking-widest block mb-1">
                                        Cláusula {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                    </span>
                                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-none">
                                        {clause.title}
                                    </h2>
                                </div>
                            </div>
                            <p className="text-slate-400 text-base md:text-lg leading-relaxed whitespace-pre-line border-l-2 border-white/5 pl-6 group-hover:border-primary/20 transition-all" dangerouslySetInnerHTML={{ __html: clause.content.replace(/\\*\\*(.*?)\\*\\*/g, '<strong class="text-white">$1</strong>') }} />
                        </div>
                    ))}
                </div>

                {/* Bottom Disclaimer */}
                <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-10 text-center mt-12 mb-20">
                    <h3 className="text-lg font-bold text-white mb-2">Dúvidas Jurídicas?</h3>
                    <p className="text-slate-500 text-sm max-w-xl mx-auto mb-6">
                        Se você tiver dúvidas sobre estes termos, entre em contato com nossa equipe de compliance.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all border border-white/5">
                            juridico@corteconexao.com.br
                        </button>
                        <a href="/" className="px-6 py-3 bg-primary text-black text-xs font-bold rounded-xl transition-all hover:scale-105 active:scale-95 inline-flex items-center justify-center">
                            Voltar para o Início
                        </a>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
