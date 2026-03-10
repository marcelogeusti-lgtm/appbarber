'use client';
import Link from 'next/link';

export default function FooterNeo() {
    return (
        <footer className="bg-[#171e19] text-white py-24 border-t-2 border-black px-6 md:px-12">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">

                {/* Brand Column */}
                <div className="col-span-1 md:col-span-1">
                    <Link href="/" className="flex items-center gap-3 mb-8 group">
                        <div className="w-10 h-10 bg-[#3b82f6] border-2 border-black flex items-center justify-center neo-shadow-sm transition-transform group-hover:-translate-y-1">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                        </div>
                        <span className="font-cabinet font-extrabold text-2xl tracking-tighter uppercase">NEXT</span>
                    </Link>
                    <p className="font-satoshi text-gray-400 font-medium leading-relaxed">
                        Redefinindo o futuro da gestão para barbearias de elite.
                    </p>
                </div>

                {/* Links Columns */}
                <div>
                    <h4 className="font-cabinet font-extrabold text-lg uppercase mb-8">Produto</h4>
                    <ul className="space-y-4 font-satoshi font-medium text-gray-400">
                        <li><Link href="#recursos" className="hover:text-[#ffe17c]">Recursos</Link></li>
                        <li><Link href="#como-funciona" className="hover:text-[#ffe17c]">Como Funciona</Link></li>
                        <li><Link href="#pricing" className="hover:text-[#ffe17c]">Preços</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-cabinet font-extrabold text-lg uppercase mb-8">Comunidade</h4>
                    <ul className="space-y-4 font-satoshi font-medium text-gray-400">
                        <li><Link href="#" className="hover:text-[#ffe17c]">Instagram</Link></li>
                        <li><Link href="#" className="hover:text-[#ffe17c]">YouTube</Link></li>
                        <li><Link href="#" className="hover:text-[#ffe17c]">WhatsApp</Link></li>
                    </ul>
                </div>

                {/* Social Square Icons */}
                <div>
                    <h4 className="font-cabinet font-extrabold text-lg uppercase mb-8">Siga-nos</h4>
                    <div className="flex gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-12 h-12 bg-[#272727] border-2 border-gray-600 flex items-center justify-center hover:bg-[#ffe17c] hover:border-black hover:text-black transition-all cursor-pointer neo-shadow-sm">
                                <span className="font-cabinet font-black">X</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto mt-24 pt-12 border-t border-gray-800 text-center font-satoshi font-medium text-gray-500 text-xs uppercase tracking-widest">
                © 2026 NEXT SAAS. Todos os direitos reservados.
            </div>
        </footer>
    );
}
