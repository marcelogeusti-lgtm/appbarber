'use client';
import Link from 'next/link';
import { Calendar, DollarSign, Bell, CheckCircle, Star, Play, Scissors, Users, BarChart3, Clock, Shield, Smartphone, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-600">

            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
                <div className="container mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {/* Logo Icon */}
                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                            <Scissors className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">Barber On</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#funcionalidades" className="text-sm font-bold text-slate-600 hover:text-orange-500 transition uppercase tracking-wide">Funcionalidades</Link>
                        <Link href="#planos" className="text-sm font-bold text-slate-600 hover:text-orange-500 transition uppercase tracking-wide">Planos</Link>
                        <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-orange-500 transition uppercase tracking-wide">Login</Link>
                        <Link href="/register" className="bg-orange-500 text-white px-6 py-2.5 rounded hover:bg-orange-600 transition font-bold shadow-lg shadow-orange-500/30">
                            TESTAR GRÁTIS
                        </Link>
                    </div>

                    <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Hero Section (Dark Blue Background) */}
            <section className="pt-32 pb-24 md:pt-48 md:pb-32 px-6 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>

                <div className="container mx-auto text-center relative z-10 max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                        Sistema Completo para <br />
                        <span className="text-orange-500">Gestão de Barbearias</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                        Organize sua agenda, controle o financeiro e fidelize seus clientes com o sistema mais completo do Brasil.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <Link href="/register" className="w-full md:w-auto bg-orange-500 text-white px-8 py-4 rounded font-bold text-lg hover:bg-orange-600 transition shadow-xl uppercase tracking-wide">
                            Quero Testar Grátis
                        </Link>
                        <div className="flex gap-2 mt-4 md:mt-0">
                            {/* Badge Placeholders similar to App Store */}
                            <div className="bg-black border border-white/20 rounded px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition">
                                <Smartphone className="w-5 h-5" /> <span className="text-xs text-left leading-tight">Disponível no<br /><span className="font-bold text-sm">Google Play</span></span>
                            </div>
                            <div className="bg-black border border-white/20 rounded px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition">
                                <Smartphone className="w-5 h-5" /> <span className="text-xs text-left leading-tight">Baixar na<br /><span className="font-bold text-sm">App Store</span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features (Grid like the image) */}
            <section id="funcionalidades" className="py-20 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Funcionalidades do Barber On</h2>
                        <div className="w-20 h-1 bg-orange-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <GridFeature icon={<Calendar className="w-8 h-8 text-blue-900" />} title="Agenda Online" />
                        <GridFeature icon={<Users className="w-8 h-8 text-blue-900" />} title="Gestão de Equipe" />
                        <GridFeature icon={<DollarSign className="w-8 h-8 text-blue-900" />} title="Financeiro Completo" />
                        <GridFeature icon={<BarChart3 className="w-8 h-8 text-blue-900" />} title="Relatórios" />

                        <GridFeature icon={<Bell className="w-8 h-8 text-blue-900" />} title="Lembretes SMS/Zap" />
                        <GridFeature icon={<Star className="w-8 h-8 text-blue-900" />} title="Avaliações" />
                        <GridFeature icon={<Shield className="w-8 h-8 text-blue-900" />} title="Controle de Acesso" />
                        <GridFeature icon={<Clock className="w-8 h-8 text-blue-900" />} title="Histórico" />
                    </div>
                </div>
            </section>

            {/* Video / Case de Sucesso Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-12">Case de Sucesso</h2>
                    <div className="relative max-w-4xl mx-auto aspect-video bg-slate-900 rounded-2xl shadow-2xl overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="w-8 h-8 text-white fill-current ml-1" />
                            </div>
                        </div>
                        {/* Placeholder text for video */}
                        <div className="absolute bottom-10 left-0 w-full text-center">
                            <p className="text-white font-bold text-xl drop-shadow-md">Veja como a Barbearia "Cortes do Juca" cresceu 300%</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="planos" className="py-20 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Escolha seu Plano</h2>
                        <p className="text-slate-500">Comece grátis. Cancele quando quiser.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Plan 1 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Mensal</h3>
                            <div className="text-4xl font-extrabold text-blue-900 mb-6">R$ 89<span className="text-sm font-normal text-slate-500">/mês</span></div>
                            <ul className="space-y-4 mb-8 text-slate-600">
                                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Agenda Ilimitada</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> 1 Profissional</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Financeiro Básico</li>
                            </ul>
                            <Link href="/register" className="block w-full text-center border-2 border-slate-900 text-slate-900 font-bold py-3 rounded hover:bg-slate-900 hover:text-white transition">Escolher Mensal</Link>
                        </div>

                        {/* Plan 2 (Featured) */}
                        <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-orange-500 relative transform md:-translate-y-4">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">MAIS POPULAR</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Trimestral</h3>
                            <div className="text-4xl font-extrabold text-blue-900 mb-6">R$ 79<span className="text-sm font-normal text-slate-500">/mês</span></div>
                            <ul className="space-y-4 mb-8 text-slate-600">
                                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Tudo do Mensal</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> 3 Profissionais</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Disparos WhatsApp</li>
                            </ul>
                            <Link href="/register" className="block w-full text-center bg-orange-500 text-white font-bold py-3 rounded hover:bg-orange-600 transition shadow-lg">Escolher Trimestral</Link>
                        </div>

                        {/* Plan 3 */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Anual</h3>
                            <div className="text-4xl font-extrabold text-blue-900 mb-6">R$ 59<span className="text-sm font-normal text-slate-500">/mês</span></div>
                            <ul className="space-y-4 mb-8 text-slate-600">
                                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Tudo do pro</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Profissionais Ilimitados</li>
                                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> Domínio Grátis</li>
                            </ul>
                            <Link href="/register" className="block w-full text-center border-2 border-slate-900 text-slate-900 font-bold py-3 rounded hover:bg-slate-900 hover:text-white transition">Escolher Anual</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 py-12">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <Scissors className="text-orange-500 w-6 h-6" />
                        <span className="text-2xl font-bold text-white">Barber On</span>
                    </div>
                    <p className="text-sm opacity-60">&copy; 2025 Barber On. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
}

function GridFeature({ icon, title }) {
    return (
        <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition text-center flex flex-col items-center gap-4 group">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition">
                {icon}
            </div>
            <h3 className="font-bold text-slate-900">{title}</h3>
        </div>
    );
}
