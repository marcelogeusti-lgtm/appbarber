'use client';
import { Scissors, Instagram, Facebook, Twitter, Apple, PlayCircle } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-10">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-12 mb-16">

                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <img
                                src="/logos/NEXT_logo.svg"
                                alt="NEXT Logo"
                                className="h-10 w-auto object-contain brightness-0 invert"
                            />
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            A plataforma completa para barbeiros que desejam escalar seu negócio e fidelizar clientes.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-black transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-black transition-all">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-black transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>

                        {/* App Store Badges */}
                        <div className="flex flex-col gap-3 mt-8">
                            <p className="text-white font-bold text-sm">Baixe o App</p>
                            <div className="flex gap-2">
                                <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-2 px-3 flex items-center gap-2 transition-colors group">
                                    <Apple className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
                                    <div className="text-left">
                                        <div className="text-[8px] uppercase text-gray-400">Download on</div>
                                        <div className="text-xs font-bold text-white leading-none">App Store</div>
                                    </div>
                                </button>
                                <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-2 px-3 flex items-center gap-2 transition-colors group">
                                    <PlayCircle className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
                                    <div className="text-left">
                                        <div className="text-[8px] uppercase text-gray-400">Get it on</div>
                                        <div className="text-xs font-bold text-white leading-none">Google Play</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Produto</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary transition-colors">Funcionalidades</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Planos</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Atualizações</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Para Franquias</a></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Empresa</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary transition-colors">Sobre Nós</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Carreiras</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
                        </ul>
                    </div>

                    {/* Links 3 */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center bg-[#050505] gap-4">
                    <p className="text-gray-600 text-sm">© 2024 NEXT SaaS. Todos os direitos reservados.</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Feito com</span>
                        <span className="text-red-500">♥</span>
                        <span>para barbeiros.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
