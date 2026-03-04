'use client';
import { ShieldCheck, Key, Smartphone, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SecurityPage() {
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

    const securityItems = [
        { icon: Key, title: 'Alterar Senha', desc: 'Recomendamos o uso de senhas fortes e únicas para sua proteção.', action: 'Alterar' },
        { icon: Smartphone, title: 'Verificação em Duas Etapas', desc: 'Adicione uma camada extra de segurança ao seu acesso.', action: 'Configurar', badge: 'Recomendado' },
        { icon: Lock, title: 'Dispositivos Conectados', desc: 'Gerencie os aparelhos onde sua conta está ativa no momento.', action: 'Gerenciar' },
    ];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-12 animate-in fade-in duration-500"
        >
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
                <h1 className="text-4xl font-black text-white tracking-tight">Segurança</h1>
                <p className="text-slate-500 text-sm font-medium max-w-md leading-relaxed">
                    Proteja sua conta e controle seus acessos com ferramentas de segurança avançadas.
                </p>
            </motion.div>

            <div className="grid gap-6">
                {securityItems.map((item, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className="group relative overflow-hidden bg-[#0A0A0B]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:border-white/10 shadow-xl"
                    >
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[60px] pointer-events-none" />

                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-[1.8rem] bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:bg-primary/5 transition-all duration-500">
                                <item.icon className="w-8 h-8" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-white text-lg tracking-tight">{item.title}</h3>
                                    {item.badge && (
                                        <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 max-w-[320px] leading-relaxed italic">{item.desc}</p>
                            </div>
                        </div>

                        <div className="relative z-10 w-full md:w-auto">
                            <button className="w-full md:w-auto px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-95">
                                {item.action}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div variants={itemVariants} className="pt-8 flex justify-center">
                <div className="flex items-center gap-4 px-8 py-4 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
                    <span className="text-[10px] text-emerald-500/80 font-black uppercase tracking-[0.2em]">
                        Sua conta está protegida com criptografia de ponta a ponta
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
}
