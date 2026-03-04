'use client';
import { Key, Smartphone, Mail, Globe, CheckCircle2 } from 'lucide-react';
import { useClientAuth } from '../../../../contexts/ClientAuthContext';
import { motion } from 'framer-motion';

export default function AccessPage() {
    const { user } = useClientAuth();

    const accessMethods = [
        {
            icon: Mail,
            label: 'E-mail e Senha',
            value: user?.email || 'Não vinculado',
            connected: !!user?.email, // In a more complex setup, check provider field
            desc: 'Método padrão de acesso à sua conta.'
        },
        {
            icon: Globe,
            label: 'Google',
            value: user?.avatarUrl?.includes('googleusercontent') ? 'Conectado' : 'Não vinculado',
            connected: !!user?.avatarUrl?.includes('googleusercontent'),
            desc: 'Acesse rapidamente usando sua conta Google.'
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1,
                duration: 0.5
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-12 animate-in fade-in duration-500"
        >
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
                <h1 className="text-4xl font-black text-white tracking-tight">Meus Acessos</h1>
                <p className="text-slate-500 text-sm font-medium max-w-md leading-relaxed">
                    Gerencie como você acessa sua conta e mantenha sua segurança em dia.
                </p>
            </motion.div>

            <div className="grid gap-6">
                {accessMethods.map((method, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className="group relative overflow-hidden bg-[#0A0A0B]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between gap-6 transition-all hover:border-white/10 shadow-xl"
                    >
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[60px] pointer-events-none" />

                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-[1.8rem] bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:bg-primary/5 transition-all duration-500">
                                <method.icon className="w-8 h-8" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-white text-lg tracking-tight">{method.label}</h3>
                                <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed italic">{method.desc}</p>
                                <div className="pt-1 flex items-center gap-2">
                                    <div className="w-1 h-1 bg-primary rounded-full" />
                                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">{method.value}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10">
                            {method.connected ? (
                                <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                    <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Conectado</span>
                                </div>
                            ) : (
                                <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                                    Vincular agora
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div variants={itemVariants} className="pt-8 flex justify-center">
                <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.3em] flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-white/5" />
                    AppBarber Segurança Centralizada
                    <span className="w-8 h-[1px] bg-white/5" />
                </p>
            </motion.div>
        </motion.div>
    );
}
