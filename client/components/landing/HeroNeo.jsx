'use client';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HeroNeo() {
    return (
        <section className="relative min-h-screen pt-32 pb-20 bg-[#ffe17c] overflow-hidden">
            {/* Radial Dot Pattern Overlay */}
            <div className="absolute inset-0 neo-dot-pattern pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left Column: Content */}
                    <div className="flex flex-col items-start text-black">
                        {/* New Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white neo-border neo-shadow-sm mb-8 rounded-full">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#3b82f6]">NEW</span>
                            <span className="text-xs font-bold font-satoshi">AI Content Assistant 2.0</span>
                        </div>

                        {/* Heading */}
                        <h1 className="font-cabinet font-extrabold text-[5rem] lg:text-[7rem] leading-[0.9] tracking-tighter mb-8 uppercase">
                            Gerencie <br />
                            sua <span style={{ WebkitTextStroke: '2px black', color: 'transparent' }}>BARBEARIA</span> <br />
                            com PODER.
                        </h1>

                        <p className="font-satoshi font-medium text-xl max-w-lg mb-12 leading-tight">
                            O ecossistema definitivo para transformar seu negócio.
                            Agendamento intuitivo, controle financeiro impecável e fidelização de elite.
                        </p>

                        {/* CTA Group */}
                        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                            <Link href="/register">
                                <button className="w-full sm:w-auto px-10 py-5 bg-black text-white neo-border neo-shadow-md font-cabinet font-extrabold text-xl uppercase tracking-tighter neo-push-button">
                                    Ativar Grátis
                                </button>
                            </Link>
                            <Link href="#pricing">
                                <button className="w-full sm:w-auto px-10 py-5 bg-white text-black neo-border neo-shadow-sm font-cabinet font-extrabold text-xl uppercase tracking-tighter neo-push-button">
                                    Ver Planos
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Browser Mockup */}
                    <div className="relative hidden lg:block">
                        <div className="relative z-20 neo-border bg-white neo-shadow-lg p-3 rounded-2xl overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
                            {/* Browser Header */}
                            <div className="h-10 bg-black flex items-center justify-between px-4 mb-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                                </div>
                                <div className="h-1.5 w-32 bg-white/20 rounded-full" />
                            </div>

                            {/* App Content */}
                            <div className="aspect-[4/3] bg-[#b7c6c2] overflow-hidden flex items-center justify-center p-4">
                                <div className="w-full h-full bg-white neo-border neo-shadow-sm flex flex-col p-4">
                                    <div className="flex gap-4 mb-4">
                                        <div className="flex-1 h-32 bg-[#3b82f6] neo-border" />
                                        <div className="w-1/3 h-32 bg-black neo-border" />
                                    </div>
                                    <div className="w-full h-4 bg-gray-100 mb-2" />
                                    <div className="w-2/3 h-4 bg-gray-100" />

                                    {/* Placeholder for real screenshot if desired */}
                                    {/* <img src="/screenshots/dashboard_main_1772068419823.png" className="w-full h-auto" /> */}
                                </div>
                            </div>
                        </div>

                        {/* Secondary card offset */}
                        <div className="absolute -bottom-8 -left-8 w-64 h-48 bg-[#3b82f6] neo-border -z-10 animate-float" />
                    </div>
                </div>
            </div>
        </section>
    );
}
