'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative min-h-[110vh] flex items-center pt-20 overflow-hidden bg-[#050505]">

            {/* Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-500/10 blur-[120px] rounded-full opacity-20 pointer-events-none" />

            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Text Content */}
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-medium text-primary uppercase tracking-wider">Novo Sistema 2.0</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                        A gestão da sua <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                            Barbearia
                        </span> <br />
                        em outro nível.
                    </h1>

                    <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-lg">
                        Deixe de ser apenas um barbeiro e torne-se um gestor de elite.
                        Agendamento, financeiro e marketing em uma única plataforma inteligente.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-12">
                        <Link href="/register">
                            <button className="w-full sm:w-auto px-8 py-4 bg-primary text-black text-lg font-bold rounded-2xl hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,230,118,0.4)] flex items-center justify-center gap-2">
                                Começar Teste Grátis <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                        <Link href="#features">
                            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white text-lg font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                                Ver Funcionalidades
                            </button>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            <span>Sem cartão de crédito</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                            <span>Setup instantâneo</span>
                        </div>
                    </div>
                </div>

                {/* Visual / Dashboard Mockup */}
                <div className="relative hidden lg:block perspective-1000">
                    {/* Floating Cards */}
                    <div className="relative z-20 animate-float-slow">
                        <div className="glass-card p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-black/90 aspect-[4/3] shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500" />

                            {/* Mock UI Header */}
                            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                </div>
                                <div className="h-2 w-20 bg-white/10 rounded-full" />
                            </div>

                            {/* Mock Graph */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-end h-32 gap-4">
                                    {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                        <div key={i} className="w-full bg-primary/20 rounded-t-lg relative group-hover:bg-primary/30 transition-all duration-500 overflow-hidden" style={{ height: `${h}%` }}>
                                            <div className="absolute bottom-0 w-full bg-primary h-full opacity-50 blur-sm" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sab</span><span>Dom</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge 1 - Daily Revenue */}
                        <div className="absolute -right-8 -top-8 p-4 glass rounded-2xl border border-white/10 animate-float-delayed shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Faturamento Hoje</p>
                                    <p className="text-xl font-bold text-white">R$ 1.240,00</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge 2 - Active Clients */}
                        <div className="absolute -left-12 bottom-20 p-4 glass rounded-2xl border border-white/10 animate-float shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Clientes Ativos</p>
                                    <p className="text-xl font-bold text-white">+ 2.400</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-20 " />
        </section>
    );
}
