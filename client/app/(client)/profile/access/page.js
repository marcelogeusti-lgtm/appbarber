'use client';
import { Key, Smartphone, Mail, Globe, CheckCircle2 } from 'lucide-react';
import { useClientAuth } from '../../../../contexts/ClientAuthContext';

export default function AccessPage() {
    const { user } = useClientAuth();

    const accessMethods = [
        {
            icon: Mail,
            label: 'E-mail e Senha',
            value: user?.email || 'Não vinculado',
            connected: !!user?.email,
            desc: 'Método padrão de acesso à sua conta.'
        },
        {
            icon: Globe,
            label: 'Google',
            value: 'Vinculado',
            connected: true, // Assuming Google if avatar is from them or provider logic
            desc: 'Acesse rapidamente usando sua conta Google.'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-white tracking-tight">Meus Acessos</h1>
                <p className="text-slate-500 text-sm font-medium">Gerencie como você acessa sua conta no aplicativo.</p>
            </div>

            <div className="grid gap-4">
                {accessMethods.map((method, idx) => (
                    <div key={idx} className="bg-[#111] border border-white/5 rounded-3xl p-6 flex items-center justify-between gap-4 group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                                <method.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">{method.label}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{method.desc}</p>
                                <p className="text-[10px] text-primary font-bold mt-1">{method.value}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {method.connected ? (
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Ativo</span>
                                </div>
                            ) : (
                                <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                    Vincular
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
