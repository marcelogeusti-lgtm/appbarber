'use client';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

export default function MainDashboardShowcase() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 text-center">

                <div className="max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                        O Painel de Controle <br />
                        <span className="text-primary">do Seu Império.</span>
                    </h2>
                    <p className="text-lg text-gray-500 font-medium">
                        Uma interface limpa e poderosa. Tenha visão total do seu faturamento, agenda e desempenho da equipe em tempo real.
                    </p>
                </div>

                {/* Big Centered Mockup */}
                <div className="relative max-w-6xl mx-auto">
                    {/* Shadow/Glow Background */}
                    <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full scale-90 pointer-events-none" />

                    {/* The Image Container - Updated to Coded Metrics for conversion */}
                    <div className="relative z-10 rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-[0_50px_100px_rgba(0,0,0,0.1)] flex flex-col items-center">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-primary" />

                        <div className="w-full flex justify-between items-center mb-12">
                            <div className="text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Faturamento Mensal</p>
                                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">R$ 18.420,00</h3>
                                <div className="flex items-center gap-1.5 text-green-500 mt-1">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-xs font-bold">+12.5% em relação ao mês anterior</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Ticket Médio</p>
                                    <p className="text-xl font-black text-gray-900">R$ 64,00</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Recorrência</p>
                                    <p className="text-xl font-black text-gray-900">84%</p>
                                </div>
                            </div>
                        </div>

                        {/* Visual graph representation */}
                        <div className="w-full h-48 flex items-end justify-between gap-4 px-4 mb-6">
                            {[40, 65, 45, 90, 55, 75, 100].map((h, i) => (
                                <div key={i} className="flex-1 bg-primary/10 rounded-t-xl relative group">
                                    <div
                                        className="absolute bottom-0 left-0 w-full bg-primary rounded-t-xl transition-all duration-1000"
                                        style={{ height: `${h}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Floating Badges */}
                    <div className="absolute -left-10 top-1/4 hidden lg:flex p-4 bg-white rounded-2xl shadow-2xl border border-gray-50 items-center gap-4 animate-float">
                        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
                            <DollarSign className="w-5 h-5 font-bold" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Mês</p>
                            <p className="text-lg font-black text-gray-900 leading-none">R$ 18.420</p>
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
                        { label: 'Faturamento do Mês', val: 'R$ 18.420', color: 'green' },
                        { label: 'Serviço Mais Vendido', val: 'Corte Masculino', color: 'blue' },
                        { label: 'Ticket Médio', val: 'R$ 64,00', color: 'purple' },
                        { label: 'Taxa de Retorno', val: '84%', color: 'orange' }
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
