'use client';
import Link from 'next/link';

export default function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b-2 border-black z-50 flex items-center justify-between px-6 md:px-12 font-satoshi">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-black border-2 border-black flex items-center justify-center neo-shadow-sm transition-transform group-hover:-translate-y-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                </div>
                <span className="font-cabinet font-extrabold text-2xl tracking-tighter uppercase">NEXT</span>
            </Link>

            {/* Center: Links */}
            <nav className="hidden md:flex items-center gap-10">
                {['Recursos', 'Como Funciona', 'Preços', 'FAQ'].map((item) => (
                    <Link
                        key={item}
                        href={`#${item.toLowerCase().replace(' ', '-')}`}
                        className="font-bold text-sm uppercase tracking-widest hover:text-blue-600 transition-colors"
                    >
                        {item}
                    </Link>
                ))}
            </nav>

            {/* Right: CTA */}
            <div className="flex items-center gap-4">
                <Link href="/login" className="hidden sm:block font-bold text-sm uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                    Entrar
                </Link>
                <Link href="/register">
                    <button className="bg-black text-white px-6 py-2.5 neo-border neo-shadow-sm font-bold text-xs uppercase tracking-widest neo-push-button-sm">
                        Teste Grátis
                    </button>
                </Link>
            </div>
        </header>
    );
}
