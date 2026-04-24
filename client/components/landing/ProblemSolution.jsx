'use client';
import { XCircle, CheckCircle2, UserX, BookOpen, DollarSign, Heart, Zap, Calendar } from 'lucide-react';
import LEDCardWrapper from './LEDCardWrapper';

export default function ProblemSolution() {
    const comparisons = [
        {
            pain: "Clientes esquecem o horário e não avisam.",
            painIcon: UserX,
            solution: "Lembretes automáticos via WhatsApp reduzem faltas em 80%.",
            solutionIcon: Zap
        },
        {
            pain: "Agenda física bagunçada ou no WhatsApp pessoal.",
            painIcon: BookOpen,
            solution: "Link de agendamento 24h que organiza tudo sozinho.",
            solutionIcon: Calendar
        },
        {
            pain: "Sem controle real do que entra e sai no caixa.",
            painIcon: DollarSign,
            solution: "Fluxo de caixa em tempo real e relatórios de lucro limpos.",
            solutionIcon: CheckCircle2
        },
        {
            pain: "Dificuldade em fidelizar e trazer o cliente de volta.",
            painIcon: Heart,
            solution: "Sistema de pontos e promoções que recupera clientes.",
            solutionIcon: Heart
        }
    ];

    return (
        <section className="py-24 bg-[#050505] overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <h2 className="text-3xl lg:text-6xl font-extrabold text-white mb-8 tracking-tighter">
                        Você corta cabelo ou <br />
                        <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">gerencia problemas?</span>
                    </h2>
                    <p className="text-slate-400 text-xl font-medium leading-relaxed">
                        Pare de perder tempo com tarefas manuais. Veja a diferença entre quem usa o NEXT e quem ainda está no papel.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-stretch">
                    {/* Pain Side */}
                    <LEDCardWrapper className="h-full">
                        <div className="p-8 lg:p-14 rounded-xl bg-[#0A0A0B]/40 backdrop-blur-3xl border border-white/5 flex flex-col group/pain transition-all hover:bg-[#0A0A0B]/60 h-full">
                            <div className="flex items-center gap-4 mb-14">
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 group-hover/pain:scale-110 transition-transform">
                                    <XCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tighter transition-colors group-hover/pain:text-white">Sem o NEXT</h3>
                            </div>

                            <div className="space-y-10 flex-1">
                                {comparisons.map((c, i) => (
                                    <div key={i} className="flex gap-5 group">
                                        <div className="mt-1 w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-red-400 group-hover:border-red-400/50 transition-all duration-300">
                                            <c.painIcon className="w-3.5 h-3.5" />
                                        </div>
                                        <p className="text-slate-400 font-medium text-base leading-relaxed group-hover:text-slate-300 transition-colors">{c.pain}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-14 pt-10 border-t border-white/5">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.35em]">Resultado Cruel:</p>
                                <p className="text-xl font-bold text-slate-300 mt-2 italic transition-colors group-hover/pain:text-white">Noites em claro e faturamento escorrendo pelo ralo.</p>
                            </div>
                        </div>
                    </LEDCardWrapper>

                    {/* Solution Side */}
                    <LEDCardWrapper className="h-full">
                        <div className="p-8 lg:p-14 rounded-xl bg-gradient-to-br from-[#0A0A0B] to-[#050505] border-2 border-primary flex flex-col relative overflow-hidden shadow-[0_0_100px_rgba(77,114,228,0.15)] group/solution hover:shadow-[0_0_120px_rgba(77,114,228,0.25)] transition-all h-full">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 blur-[130px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

                            <div className="flex items-center gap-4 mb-14 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-[0_0_40px_#4d72e4] group-hover/solution:scale-110 transition-transform">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Com o NEXT</h3>
                            </div>

                            <div className="space-y-10 flex-1 relative z-10">
                                {comparisons.map((c, i) => (
                                    <div key={i} className="flex gap-5 group">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-[0_0_20px_rgba(77,114,228,0.2)]">
                                            <c.solutionIcon className="w-3.5 h-3.5" />
                                        </div>
                                        <p className="text-slate-300 font-medium text-base leading-relaxed group-hover:text-white transition-colors">{c.solution}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-14 pt-10 border-t border-white/10 relative z-10">
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.35em]">Resultado Master:</p>
                                <p className="text-xl font-bold text-white mt-2 italic shadow-primary/10">Agenda lotada e gestão em piloto automático.</p>
                            </div>
                        </div>
                    </LEDCardWrapper>
                </div>
            </div>
        </section>
    );
}
