'use client';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

export default function MainDashboardShowcase() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 text-center">

                <div className="max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl lg:text-6xl font-black text-gray-900 leading-tight mb-6 tracking-tighter">
                        O Painel de Controle <br />
                        <span className="text-primary italic">do Seu Império.</span>
                    </h2>
                    <p className="text-lg text-gray-500 font-medium">
                        Uma interface limpa e poderosa. Tenha visão total do seu faturamento, agenda e desempenho da equipe em tempo real.
                    </p>
                </div>

                {/* Big Centered Mockup */}
                <div className="relative max-w-6xl mx-auto">
                    {/* Shadow/Glow Background */}
                    <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full scale-90 pointer-events-none" />

                    {/* The Image Container */}
                    <div className="relative z-10 rounded-[2.5rem] border border-gray-100 bg-white p-2 shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden">
                        <img
                            src="/screenshots/dashboard_main_1772068419823.png"
                            alt="Dashboard Maestro NEXT"
                            className="w-full h-auto rounded-[2rem]"
                        />
                    </div>

                    {/* Floating Badges */}
                    <div className="absolute -left-10 top-1/4 hidden lg:flex p-4 bg-white rounded-2xl shadow-2xl border border-gray-50 items-center gap-4 animate-float">
                        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
                            <DollarSign className="w-5 h-5 font-bold" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Mês</p>
                            <p className="text-lg font-black text-gray-900 leading-none">R$ 15.420</p>
                        </div>
                    </div>

                    <div className="absolute -right-10 bottom-1/4 hidden lg:flex p-4 bg-white rounded-2xl shadow-2xl border border-gray-50 items-center gap-4 animate-float-delayed">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Agendamentos</p>
                            <p className="text-lg font-black text-gray-900 leading-none">42 Hoje</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid Under Image */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20">
                    {[
                        { label: 'Lucro Líquido', val: 'R$ 8.240', color: 'green' },
                        { label: 'Novos Clientes', val: '+ 42', color: 'blue' },
                        { label: 'Ticket Médio', val: 'R$ 85,00', color: 'purple' },
                        { label: 'Recorrência', val: '78%', color: 'orange' }
                    ].map((stat, i) => (
                        <div key={i} className="text-center group">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tighter">{stat.val}</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
