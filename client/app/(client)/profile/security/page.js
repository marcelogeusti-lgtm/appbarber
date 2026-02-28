'use client';
import { ShieldCheck, Key, Smartphone, Lock, ChevronRight } from 'lucide-react';

export default function SecurityPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-white tracking-tight">Segurança</h1>
                <p className="text-slate-500 text-sm font-medium">Gerencie o acesso e a proteção da sua conta.</p>
            </div>

            <div className="grid gap-4">
                {[
                    { icon: Key, title: 'Alterar Senha', desc: 'Recomendamos o uso de senhas fortes e únicas.', action: 'Alterar' },
                    { icon: Smartphone, title: 'Verificação em Duas Etapas', desc: 'Adicione uma camada extra de segurança ao seu acesso.', action: 'Configurar', badge: 'Recomendado' },
                    { icon: Lock, title: 'Dispositivos Conectados', desc: 'Gerencie os aparelhos onde sua conta está ativa.', action: 'Gerenciar' },
                ].map((item, idx) => (
                    <div key={idx} className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-white">{item.title}</h3>
                                    {item.badge && <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded-full">{item.badge}</span>}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                            </div>
                        </div>
                        <button className="w-full md:w-auto px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                            {item.action}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
