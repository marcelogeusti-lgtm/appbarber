'use client';
import { Star, Sparkles } from 'lucide-react';

const row1 = [
    {
        name: "João Pereira",
        role: "Proprietário - Barbearia Don João, SP",
        initials: "JP",
        bg: "from-blue-500 to-indigo-600",
        text: "Trocamos a agenda física pelo NEXT e nossas faltas caíram 90% em apenas 4 semanas. A cobrança de sinal Pix antecipado salvou meu faturamento mensal."
    },
    {
        name: "Mariana Nunes",
        role: "Dona - Barber Queen & Esmalteria, RS",
        initials: "MN",
        bg: "from-purple-500 to-pink-600",
        text: "A barreira de mensagens no WhatsApp acabou. Agora os clientes agendam sozinhos de madrugada e a nossa agenda amanhece lotada no piloto automático."
    },
    {
        name: "Pedro Henrique",
        role: "Supervisor - Barber Shop Elite, GO",
        initials: "PH",
        bg: "from-emerald-500 to-teal-600",
        text: "O controle de comissão dos profissionais era o meu maior pesadelo mensal. Hoje o NEXT faz tudo automático em segundos. Não troco por nada."
    },
    {
        name: "Beatriz Carvalho",
        role: "Gestora - Confeitaria & Barber Concept, SP",
        initials: "BC",
        bg: "from-amber-500 to-orange-600",
        text: "A função de múltiplos profissionais dividindo a agenda com painéis individuais mudou o jogo da nossa barbearia. Visualização limpa e profissional."
    },
    {
        name: "Lucas Silveira",
        role: "Dono - Barbearia Corleone, RJ",
        initials: "LS",
        bg: "from-cyan-500 to-blue-600",
        text: "O link de agendamento online é extremamente rápido. Meus clientes elogiam muito a facilidade de agendar pelo celular em segundos."
    },
    {
        name: "Marcos Souza",
        role: "Proprietário - Club Men Salon, MG",
        initials: "MS",
        bg: "from-blue-600 to-indigo-700",
        text: "Subimos o ticket médio da barbearia oferecendo combos pelo sistema. O cliente vê os combos na hora de agendar e acaba escolhendo."
    }
];

const row2 = [
    {
        name: "Camila Rocha",
        role: "Gerente - Classic Barber Club, BA",
        initials: "CR",
        bg: "from-teal-500 to-blue-600",
        text: "Meus clientes elogiam muito a facilidade do agendamento. Sem precisar baixar aplicativo, eles agendam em 3 cliques pelo navegador do próprio celular."
    },
    {
        name: "Thiago Martins",
        role: "Proprietário - Barbearia VIP, SC",
        initials: "TM",
        bg: "from-indigo-500 to-purple-600",
        text: "Ter um sistema completo com a nossa marca e lembretes automáticos no WhatsApp reduziu o tempo de suporte a zero. Investimento extremamente justo."
    },
    {
        name: "Fernanda Lima",
        role: "Dona - Retro Barber Studio, PR",
        initials: "FL",
        bg: "from-pink-500 to-rose-600",
        text: "O fluxo de caixa e os relatórios de lucro me deram clareza sobre quais serviços dão mais margem. Subimos o faturamento real em 35%."
    },
    {
        name: "Rodrigo Melo",
        role: "Sócio - Barber & Co., DF",
        initials: "RM",
        bg: "from-cyan-500 to-blue-600",
        text: "O NEXT roda liso no celular, tablet e computador. Gerencio minhas duas unidades de qualquer lugar do mundo pelo celular com total segurança."
    },
    {
        name: "Amanda Costa",
        role: "Dona - Barber & Beauty, PE",
        initials: "AC",
        bg: "from-emerald-600 to-green-700",
        text: "Os lembretes automáticos reduzem o no-show de forma drástica. O cliente recebe o link de cancelamento se precisar, liberando o horário."
    },
    {
        name: "Gustavo Santos",
        role: "Proprietário - Santo Bigode, CE",
        initials: "GS",
        bg: "from-orange-500 to-red-600",
        text: "Excelente custo-benefício. O sistema se paga no primeiro dia com a economia de tempo e a redução de faltas dos clientes."
    }
];

export default function Testimonials() {
    
    // Duplicate arrays to double the items in the scrolling container, making it a 50% translation loop
    const row1Double = [...row1, ...row1];
    const row2Double = [...row2, ...row2];

    // Render a single testimonial card with mr-6 for pixel-perfect spacing
    const renderCard = (t, i) => (
        <div 
            key={i} 
            className="w-[310px] sm:w-[360px] shrink-0 p-6 rounded-[24px] bg-[#0A0A0C]/90 border border-white/[0.04] backdrop-blur-xl hover:border-primary/20 hover:bg-[#0E0E12]/80 transition-all duration-300 relative select-none mr-6"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${t.bg} flex items-center justify-center text-white text-[11px] font-black font-mono shadow-md`}>
                        {t.initials}
                    </div>
                    <div>
                        <h4 className="text-[12px] font-bold text-white font-display leading-tight">{t.name}</h4>
                        <p className="text-[9px] text-slate-500 font-body leading-tight mt-0.5">{t.role}</p>
                    </div>
                </div>

                {/* Highly Realistic Google Multi-color G Icon */}
                <svg className="w-3.5 h-3.5 shrink-0 opacity-80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
            </div>

            {/* Rating Stars */}
            <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-[13px] leading-relaxed text-slate-400 font-body">
                "{t.text}"
            </p>
        </div>
    );

    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden border-t border-white/[0.04]">
            {/* Background Grid */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
            
            <div className="container mx-auto px-4 relative z-10 mb-20">
                {/* Section Title */}
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-body bg-white/[0.03] border border-white/[0.08] text-primary tracking-[0.2em] uppercase mb-5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Depoimentos Reais</span>
                    </div>
                    <h2 className="font-display text-4xl lg:text-6xl font-extrabold text-white mb-6 tracking-[-0.04em] leading-[1.1]">
                        Barbearias Reais. <br />
                        <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent italic">Resultados Reais.</span>
                    </h2>
                    <p className="font-body text-slate-400 text-lg max-w-xl mx-auto">
                        Junte-se a milhares de gestores de elite que aposentaram a agenda de papel e escalaram seus lucros.
                    </p>
                </div>
            </div>

            {/* Infinite Carousels Area */}
            <div className="flex flex-col gap-6 relative w-full overflow-hidden py-4 select-none">
                
                {/* ROW 1: Moves Left */}
                <div className="flex overflow-hidden w-full relative group">
                    <div className="flex shrink-0 animate-marquee">
                        {row1Double.map((t, idx) => renderCard(t, `r1-${idx}`))}
                    </div>
                </div>

                {/* ROW 2: Moves Right */}
                <div className="flex overflow-hidden w-full relative group">
                    <div className="flex shrink-0 animate-marquee-reverse">
                        {row2Double.map((t, idx) => renderCard(t, `r2-${idx}`))}
                    </div>
                </div>

            </div>

            {/* Embedded Marquee keyframe styles with 20s duration and -50% translation loop */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes marquee-reverse {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
                .animate-marquee-reverse {
                    animation: marquee-reverse 20s linear infinite;
                }
                .animate-marquee:hover, 
                .animate-marquee-reverse:hover {
                    animation-play-state: paused;
                    cursor: grab;
                }
            `}</style>
        </section>
    );
}
