'use client';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Twitter, ArrowUp } from 'lucide-react';

export default function FooterCliente() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-[#050505] border-t border-white/5 pt-16 pb-8 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand & Social */}
                    <div className="space-y-6">
                        <Link href="/inicio">
                            <img src="/logos/logo_icon.png" alt="appbarber" className="h-10 w-auto rounded-xl opacity-90" />
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                            Uma nova experiência para uma antiga tradição.
                        </p>
                        <div className="flex gap-5 text-slate-400">
                            <a href="#" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                            <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                            <a href="#" className="hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>
                            <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div>
                        <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">Acesso rápido</h4>
                        <ul className="space-y-4">
                             <li><Link href="/inicio" className="text-slate-500 hover:text-white transition-colors text-sm">Início</Link></li>
                             <li><Link href="/buscar" className="text-slate-500 hover:text-white transition-colors text-sm">Buscar</Link></li>
                             <li><Link href="/agenda" className="text-slate-500 hover:text-white transition-colors text-sm">Agenda</Link></li>
                             <li><Link href="/favoritos" className="text-slate-500 hover:text-white transition-colors text-sm">Favoritos</Link></li>
                        </ul>
                    </div>

                    {/* More */}
                    <div>
                        <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">Mais</h4>
                        <ul className="space-y-4">
                            <li><Link href="/terms" className="text-slate-500 hover:text-white transition-colors text-sm">Termos de uso</Link></li>
                            <li><button className="text-slate-500 hover:text-white transition-colors text-sm text-left">Preferências de cookies</button></li>
                        </ul>
                    </div>

                    {/* App & CTA */}
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">Baixe nosso App</h4>
                            <div className="flex flex-col gap-3">
                                <a href="#" className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-xl px-4 py-2 hover:bg-white/5 transition-all group">
                                    <img src="https://cdn.simpleicons.org/apple/white" alt="Apple" className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                                    <div className="leading-none">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Download on the</p>
                                        <p className="text-sm font-bold text-white">App Store</p>
                                    </div>
                                </a>
                                <a href="#" className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-xl px-4 py-2 hover:bg-white/5 transition-all group">
                                    <img src="https://cdn.simpleicons.org/googleplay/white" alt="Google Play" className="w-5 h-5 opacity-70 group-hover:opacity-100" />
                                    <div className="leading-none">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Get it on</p>
                                        <p className="text-sm font-bold text-white">Google Play</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-white font-bold text-sm mb-2 uppercase tracking-wider">É um gestor?</h4>
                            <p className="text-slate-500 text-xs mb-4">
                                Cadastre seu estabelecimento e comece a receber agendamentos online.
                            </p>
                            <button className="bg-[#111] border border-white/10 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-white/5 transition-colors">
                                Saiba mais
                            </button>
                        </div>
                    </div>

                </div>

                {/* Bottom Row */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-600 text-[10px] font-medium tracking-wide text-center md:text-left">
                        © 2026 StarApp Sistemas. Todos os direitos reservados.
                    </p>
                    <button
                        onClick={scrollToTop}
                        className="w-10 h-10 bg-[#111] border border-white/10 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:border-white/20 transition-all"
                    >
                        <ArrowUp className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </footer>
    );
}
