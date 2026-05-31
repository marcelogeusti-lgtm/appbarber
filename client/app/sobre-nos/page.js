'use client';
import { 
    Users, Target, Zap, Crown, CheckCircle, ChevronRight
} from 'lucide-react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';
import { useTranslation } from '../../contexts/LanguageContext';

export default function AboutPage() {
    const { t } = useTranslation();

    const sections = [
        {
            id: 'missao',
            title: t('about.mission_title') || 'Nossa Missão',
            icon: <Target className="w-6 h-6 text-primary" />,
            content: t('about.mission_content') || 'Acabar de uma vez por todas com as cadeiras vazias. Queremos que cada barbeiro tenha o poder da tecnologia ao seu lado para multiplicar seu faturamento sem precisar trabalhar mais horas por dia.'
        },
        {
            id: 'visao',
            title: t('about.vision_title') || 'Visão de Império',
            icon: <Crown className="w-6 h-6 text-blue-500" />,
            content: t('about.vision_content') || 'Cada detalhe foi pensado para transformar uma barbearia simples em um verdadeiro império local. O NEXT não é apenas um sistema de agendamento, é o seu novo gerente de operações 24h.'
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 selection:text-emerald-200">
            <Navbar />

            <div className="max-w-4xl mx-auto py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="flex flex-col gap-4 text-center pt-20">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight" dangerouslySetInnerHTML={{ __html: t('about.title') || 'Sobre Nós' }}>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">
                        {t('about.subtitle') || 'O Motor de Crescimento das Barbearias'}
                    </p>
                    <div className="h-1 w-20 bg-primary/20 mx-auto rounded-full mt-4" />
                </div>

                {/* Sections List */}
                <div className="grid md:grid-cols-2 gap-6">
                    {sections.map((section) => (
                        <div 
                            key={section.id} 
                            className="bg-[#111] border border-white/5 rounded-[2rem] p-8 md:p-10 space-y-6 hover:border-white/10 transition-all group"
                        >
                            <div className="p-3.5 bg-white/5 w-fit rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                {section.icon}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight leading-none mb-4">
                                    {section.title}
                                </h2>
                                <p className="text-slate-400 text-base leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Manifesto */}
                <div className="bg-gradient-to-br from-[#111] to-black border border-white/5 rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                                <Zap className="w-4 h-4 text-primary" />
                                <span className="text-primary text-xs font-bold uppercase tracking-wider">NEXT</span>
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tight">O Fim das Agendas Vazias.</h3>
                            <p className="text-slate-400 leading-relaxed text-lg">
                                Nós desenvolvemos o NEXT porque acreditamos que barbeiros são artistas que não deveriam perder tempo com anotações de papel, clientes que faltam sem avisar ou fechamentos de caixa complicados. Nosso SaaS foi forjado no campo de batalha para automatizar as tarefas que sugam a sua energia.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Automação de WhatsApp Inteligente",
                                    "Controle de Caixa Blindado",
                                    "Vitrine Premium para o Cliente"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                                        <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-10 text-center">
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{t('about.contact_title') || 'Fale Conosco'}</h3>
                    <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
                        {t('about.contact_content') || 'Estamos prontos para ouvir você. Entre em contato através do nosso suporte oficial ou via e-mail corporativo.'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white text-sm font-black rounded-xl transition-all border border-white/5 tracking-widest">
                            CONTATO@CORTECONEXAO.COM.BR
                        </button>
                        <a href="/" className="px-8 py-4 bg-primary text-black text-sm font-black rounded-xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest inline-flex items-center justify-center">
                            Voltar para o Início
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
