'use client';
import { Rocket, Zap, Bell, CheckCircle } from 'lucide-react';

export default function UpdatesPage() {
    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-10 rounded-[2.5rem] border border-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] -mr-40 -mt-40" />
                <div className="flex items-center gap-5 relative z-10">
                    <div className="p-4 bg-primary/10 text-primary rounded-[1.5rem] border border-primary/20 shadow-xl shadow-primary/5">
                        <Rocket className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">Central de Evolução</h1>
                        <p className="text-muted-foreground text-sm font-medium italic mt-1 uppercase tracking-widest text-[10px] opacity-80">Histórico de implementações e novos recursos do sistema</p>
                    </div>
                </div>
                <div className="bg-background/50 border border-border px-6 py-4 rounded-2xl relative z-10 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Versão Atual: v5.0 Diamond</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card p-10 rounded-[3rem] border border-border shadow-2xl relative overflow-hidden">
                        <div className="text-center py-24 space-y-8 relative z-10">
                            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto border border-primary/20 shadow-inner">
                                <Rocket className="w-12 h-12 text-primary animate-bounce" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-foreground uppercase tracking-tight">Plataforma em Dia</h3>
                                <div className="flex justify-center flex-wrap gap-4">
                                    <span className="px-6 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">v5.0.4 Build Diamond</span>
                                    <span className="px-6 py-2 bg-background border border-border rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">Último Check: Hoje, 09:15</span>
                                </div>
                                <p className="text-muted-foreground mt-4 font-medium italic text-sm max-w-md mx-auto leading-relaxed">
                                    Sua barbearia está operando com a tecnologia mais avançada do <span className="text-primary font-black">Ecossistema NEXT</span>. Todos os módulos estão otimizados.
                                </p>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-12 opacity-5">
                            <Rocket className="w-48 h-48 -rotate-12" />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">Notas da Versão</h4>
                        {[
                            { title: 'Harmonização de Interface Diamond', date: 'Há 2 horas', desc: 'Sincronização completa de todos os módulos com os novos tokens de tema semanticamente vinculados para Light e Dark mode.', type: 'UI/UX' },
                            { title: 'Otimização de Performance API', date: 'Ontem', desc: 'Redução de 40% na latência de carregamento de comandas através de novos índices de banco de dados.', type: 'Performance' },
                            { title: 'Novo Módulo de Caixa (Beta)', date: '3 dias atrás', desc: 'Lançamento do sistema de abertura e fechamento de turnos com multi-conferência.', type: 'Feature' }
                        ].map((update, i) => (
                            <div key={i} className="bg-card p-8 rounded-[2.5rem] border border-border hover:border-primary/30 transition-all group flex gap-6">
                                <div className="flex-shrink-0 w-14 h-14 bg-muted rounded-2xl flex items-center justify-center border border-border group-hover:bg-primary/10 transition-colors">
                                    <CheckCircle className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h5 className="font-black text-lg text-foreground uppercase tracking-tight">{update.title}</h5>
                                        <span className="px-3 py-1 bg-background border border-border rounded-lg text-[9px] font-black text-muted-foreground uppercase tracking-widest">{update.type}</span>
                                    </div>
                                    <p className="text-muted-foreground text-xs font-medium italic mb-2 leading-relaxed opacity-80">{update.desc}</p>
                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">{update.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-primary p-10 rounded-[3rem] text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                        <Bell className="w-10 h-10 mb-8 opacity-50" />
                        <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 leading-tight">Próximas Novidades</h4>
                        <ul className="space-y-5">
                            <li className="flex items-start gap-3">
                                <Zap className="w-4 h-4 flex-shrink-0 mt-1" />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Integração Direta WhatsApp 2.0</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Zap className="w-4 h-4 flex-shrink-0 mt-1" />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Relatórios por IA Preditiva</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Zap className="w-4 h-4 flex-shrink-0 mt-1" />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-relaxed">App Mobile Nativo (PWA+)</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm text-center">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Deseja Sugerir algo?</p>
                        <button className="w-full py-4 bg-muted border border-border rounded-2xl text-[10px] font-black text-foreground uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all active:scale-95">
                            Abrir Ticket de Evolução
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
