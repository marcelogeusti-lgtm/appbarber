'use client';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

export default function MainDashboardShowcase() {
    return (
        <section className="py-24 bg-[#050505] relative overflow-hidden border-y border-white/5">
            <div className="container mx-auto px-4 text-center">

                <div className="max-w-4xl mx-auto mb-20 text-center">
                    <h2 className="text-3xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-8 tracking-tighter">
                        O Painel de Controle <br />
                        <span className="bg-gradient-to-r from-primary via-blue-400 to-blue-500 bg-clip-text text-transparent">do Seu Império.</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed">
                        Uma interface limpa e poderosa. Tenha visão total do seu faturamento, agenda e desempenho da equipe em tempo real.
                    </p>
                </div>

                {/* Big Centered Mockup */}
                <div className="relative max-w-6xl mx-auto">
                    {/* Shadow/Glow Background */}
                    <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full scale-90 pointer-events-none" />

                    {/* The Image Container */}
                    <div className="relative z-10 rounded-[3.5rem] border border-white/10 bg-[#0A0A0B]/60 backdrop-blur-3xl p-3 lg:p-6 shadow-[0_0_100px_rgba(0,0,0,0.6)] flex flex-col items-center group hover:border-white/20 transition-all duration-700">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500 via-primary to-blue-500 rounded-t-[3.5rem] shadow-[0_0_15px_rgba(77,114,228,0.4)]" />
                        
                        {/* Realistic UI Header dots */}
                        <div className="w-full flex justify-start gap-3 px-8 pt-6 pb-4 border-b border-white/5 mb-4">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
                        </div>

                        <div className="rounded-[2.5rem] overflow-hidden border border-white/5 bg-black relative shadow-2xl">
                            <img 
                                src="/screenshots/dashboard-overview.png" 
                                alt="Dashboard Central" 
                                className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                            />
                        </div>
                    </div>

                    {/* Floating Badges */}
                    <div className="absolute -left-12 top-1/4 hidden lg:flex p-6 bg-[#0A0A0B]/90 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 items-center gap-5 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-1000">
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-2">Total Mês</p>
                            <p className="text-xl font-black text-white leading-none tracking-tighter">R$ 18.420</p>
                        </div>
                    </div>

                    <div className="absolute -right-12 bottom-1/4 hidden lg:flex p-6 bg-[#0A0A0B]/90 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 items-center gap-5 -translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-1000 delay-150">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_15px_rgba(77,114,228,0.2)]">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-2">Agendamentos</p>
                            <p className="text-xl font-black text-white leading-none tracking-tighter">42 Hoje</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid Under Image */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 max-w-5xl mx-auto mt-24">
                    {[
                        { label: 'Faturamento do Mês', val: 'R$ 18.420', color: 'green' },
                        { label: 'Serviço Mais Vendido', val: 'Corte + Barba', color: 'blue' },
                        { label: 'Ticket Médio', val: 'R$ 64,00', color: 'purple' },
                        { label: 'Taxa de Retorno', val: '84%', color: 'orange' }
                    ].map((stat, i) => (
                        <div key={i} className="text-center group border-x border-white/5 first:border-l-0 last:border-r-0">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.35em] mb-3 group-hover:text-primary transition-all duration-300">{stat.label}</p>
                            <p className="text-3xl font-black text-white tracking-tighter group-hover:scale-105 transition-transform duration-500">{stat.val}</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
