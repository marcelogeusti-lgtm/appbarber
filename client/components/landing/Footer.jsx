'use client';
import Link from 'next/link';
import { useTranslation } from '../../contexts/LanguageContext';

export default function Footer() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#0a0a0a] border-t border-white/[0.04] py-16 lg:py-24 font-sans text-white">
            <div className="container mx-auto px-6 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-16 mb-20">
                    
                    {/* Brand Column */}
                    <div className="md:col-span-2">
                        <Link href="/" className="inline-block mb-6">
                            {/* TapRef uses a minimalist logo, we'll keep the NEXT logo but make it fit the dark theme nicely */}
                            <img src="/logos/logo_full.svg" alt="NEXT Logo" className="h-7 w-auto object-contain opacity-90" />
                        </Link>
                        <p className="text-[14px] leading-relaxed text-white/50 max-w-[280px] font-light">
                            {t('footer.desc') || "O sistema definitivo para barbearias. Um toque, tudo o que você precisa."}
                        </p>
                    </div>

                    {/* Coluna 1: Produto */}
                    <div>
                        <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.15em] mb-6">{t('footer.col1_title') || "PRODUTO"}</h4>
                        <ul className="flex flex-col gap-4">
                            <li><Link href="#features" className="text-[14px] text-white/50 hover:text-white transition-colors duration-200 font-light">Funcionalidades</Link></li>
                            <li><Link href="#pricing" className="text-[14px] text-white/50 hover:text-white transition-colors duration-200 font-light">Preços</Link></li>
                            <li><Link href="#faq" className="text-[14px] text-white/50 hover:text-white transition-colors duration-200 font-light">FAQ</Link></li>
                            <li><Link href="/login" className="text-[14px] text-white/50 hover:text-white transition-colors duration-200 font-light">Painel</Link></li>
                        </ul>
                    </div>

                    {/* Coluna 2: Empresa */}
                    <div>
                        <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.15em] mb-6">{t('footer.col2_title') || "EMPRESA"}</h4>
                        <ul className="flex flex-col gap-4">
                            <li><Link href="#" className="text-[14px] text-white/50 hover:text-white transition-colors duration-200 font-light">Sobre Nós</Link></li>
                            <li><Link href="#" className="text-[14px] text-white/50 hover:text-white transition-colors duration-200 font-light">Contato</Link></li>
                            <li><Link href="#" className="text-[14px] text-white/50 hover:text-white transition-colors duration-200 font-light">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Coluna 3: Jurídico */}
                    <div>
                        <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.15em] mb-6">JURÍDICO</h4>
                        <ul className="flex flex-col gap-4">
                            <li><Link href="#" className="text-[14px] text-white/50 hover:text-white transition-colors duration-200 font-light">Termos de Uso</Link></li>
                            <li><Link href="#" className="text-[14px] text-white/50 hover:text-white transition-colors duration-200 font-light">Política de Privacidade</Link></li>
                        </ul>
                    </div>

                </div>

                <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/[0.04]">
                    <p className="text-[13px] text-white/40 font-light">
                        © {currentYear} NEXT. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-6">
                        <Link href="#" className="text-[13px] text-white/40 hover:text-white transition-colors duration-200 font-light">Política de Privacidade</Link>
                        <Link href="#" className="text-[13px] text-white/40 hover:text-white transition-colors duration-200 font-light">Termos de Serviço</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
