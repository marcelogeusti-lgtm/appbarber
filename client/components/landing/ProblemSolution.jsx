'use client';
import { XCircle, CheckCircle2, UserX, BookOpen, DollarSign, Heart, Zap, Calendar } from 'lucide-react';

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
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl lg:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Você corta cabelo ou <br />
                        <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">gerencia problemas?</span>
                    </h2>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed">
                        Pare de perder tempo com tarefas manuais. Veja a diferença entre quem usa o NEXT e quem ainda está no papel.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-stretch">
                    {/* Pain Side */}
                    <div className="p-8 lg:p-12 rounded-[2.5rem] bg-gray-50 border border-gray-100 flex flex-col">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Sem o NEXT</h3>
                        </div>

                        <div className="space-y-8 flex-1">
                            {comparisons.map((c, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="mt-1 w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-red-400 transition-colors">
                                        <c.painIcon className="w-3 h-3" />
                                    </div>
                                    <p className="text-gray-500 font-medium text-sm leading-relaxed">{c.pain}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resultado:</p>
                            <p className="text-lg font-bold text-gray-900 mt-2 italic">Noites em claro e dinheiro na mesa.</p>
                        </div>
                    </div>

                    {/* Solution Side */}
                    <div className="p-8 lg:p-12 rounded-[2.5rem] bg-gray-900 border-2 border-primary flex flex-col relative overflow-hidden shadow-[0_40px_80px_rgba(77,114,228,0.2)]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />

                        <div className="flex items-center gap-3 mb-12 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/40">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Com o NEXT</h3>
                        </div>

                        <div className="space-y-8 flex-1 relative z-10">
                            {comparisons.map((c, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all shadow-lg shadow-primary/10">
                                        <c.solutionIcon className="w-3 h-3" />
                                    </div>
                                    <p className="text-gray-300 font-medium text-sm leading-relaxed">{c.solution}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5 relative z-10">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Resultado:</p>
                            <p className="text-lg font-bold text-white mt-2 italic">Agenda lotada e gestão em piloto automático.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
