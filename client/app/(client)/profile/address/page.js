'use client';
import { MapPin, Plus, Loader2, Home } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AddressPage() {
    const [loading, setLoading] = useState(false);

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
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-12 animate-in fade-in duration-500"
        >
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
                <h1 className="text-4xl font-black text-white tracking-tight">Endereço</h1>
                <p className="text-slate-500 text-sm font-medium max-w-md leading-relaxed">
                    Gerencie seus endereços para agilizar seus agendamentos e atendimentos personalizados.
                </p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid gap-4">
                <div className="group relative overflow-hidden bg-[#0A0A0B]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center gap-6 transition-all hover:border-white/10 shadow-2xl">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[80px] pointer-events-none translate-y-1/2" />

                    <motion.div
                        initial={{ rotate: -15, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ duration: 1, type: "spring" }}
                        className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center text-slate-700 group-hover:text-primary group-hover:bg-primary/5 transition-all duration-500 relative z-10"
                    >
                        <MapPin className="w-10 h-10" strokeWidth={1.5} />
                    </motion.div>

                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white tracking-tight">Vazio, por enquanto...</h3>
                        <p className="text-sm text-slate-500 mt-2 max-w-[280px] leading-relaxed mx-auto">
                            Você ainda não tem endereços cadastrados. Que tal adicionar seu primeiro endereço agora?
                        </p>
                    </div>

                    <button className="relative z-10 px-10 py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] hover:shadow-primary/40 active:scale-95 flex items-center gap-3">
                        <Plus className="w-4 h-4" strokeWidth={3} />
                        Adicionar Endereço
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
