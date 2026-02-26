'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden bg-white">

            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Content */}
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-8">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">O Futuro é NEXT</span>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
                            Gerencie sua <br />
                            <span className="text-primary italic">Barbearia</span> de forma <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                                simples & inteligente.
                            </span>
                        </h1>

                        <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-lg font-medium">
                            O ecossistema definitivo para transformar seu negócio.
                            Agendamento intuitivo, controle financeiro impecável e fidelização de elite.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 mb-10">
                            <Link href="/register">
                                <button className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2">
                                    Ativar Agora <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                            <Link href="#pricing">
                                <button className="w-full sm:w-auto px-6 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center">
                                    Ver Planos
                                </button>
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center gap-8">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <span>15 Dias Grátis</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <span>Sem fidelidade</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Visual / Clean Dashboard Mockup */}
                    <div className="relative hidden lg:block">
                        <div className="relative z-20 transition-transform duration-700 hover:scale-[1.02]">
                            <div className="rounded-xl bg-white border border-gray-100 shadow-soft p-3 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

                                {/* Mockup Header */}
                                <div className="flex items-center justify-between mb-8 px-4 pt-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-100" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-100" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-100" />
                                    </div>
                                    <div className="h-2 w-24 bg-gray-50 rounded-full" />
                                </div>

                                {/* Mockup Image - Using actual Dahsboard screenshot */}
                                <div className="rounded-2xl border border-gray-50 overflow-hidden bg-gray-50">
                                    <img
                                        src="/screenshots/dashboard_main_1772068419823.png"
                                        alt="Dashboard NEXT"
                                        className="w-full h-auto opacity-90"
                                    />
                                </div>
                            </div>

                            {/* Floating Stats Label / Animated Notification */}
                            <div className="absolute -left-8 bottom-8 p-4 bg-white rounded-xl shadow-soft border border-gray-100 flex items-center gap-3 animate-float group">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-lg animate-ping opacity-75" />
                                    <img src="/logos/logo_icon.svg" alt="Logo" className="w-5 h-5 object-contain relative z-10" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-0.5">
                                        Novo Agendamento
                                        <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                                    </p>
                                    <p className="text-base font-semibold text-gray-900 leading-tight group-hover:text-primary transition-colors">Corte + Barba</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
