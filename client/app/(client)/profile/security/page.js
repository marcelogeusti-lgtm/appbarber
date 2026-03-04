import { ShieldCheck, Key, Smartphone, Lock, ChevronRight, X, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import api from '../../../../lib/clientApi';
import { toast } from 'sonner';

export default function SecurityPage() {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [changing, setChanging] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('As senhas não coincidem.');
            return;
        }

        setChanging(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success('Senha alterada com sucesso!');
            setShowPasswordModal(false);
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erro ao alterar senha.');
        } finally {
            setChanging(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.1, duration: 0.5 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    const securityItems = [
        {
            icon: Key, title: 'Alterar Senha',
            desc: 'Recomendamos o uso de senhas fortes e únicas para sua proteção.',
            action: 'Alterar',
            onClick: () => setShowPasswordModal(true)
        },
        {
            icon: Smartphone, title: 'Verificação em Duas Etapas',
            desc: 'Adicione uma camada extra de segurança ao seu acesso.',
            action: 'Configurar', badge: 'Em breve'
        },
        {
            icon: Lock, title: 'Dispositivos Conectados',
            desc: 'Gerencie os aparelhos onde sua conta está ativa no momento.',
            action: 'Gerenciar', badge: 'Em breve'
        },
    ];

    return (
        <motion.div
            initial="hidden" animate="visible" variants={containerVariants}
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
                        key={idx} variants={itemVariants} whileHover={{ y: -5 }}
                        className="group relative overflow-hidden bg-[#0A0A0B]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:border-white/10 shadow-xl"
                    >
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
                            <button
                                onClick={item.onClick}
                                className="w-full md:w-auto px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                            >
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

            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0A0A0B] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg relative z-10 shadow-2xl"
                        >
                            <button onClick={() => setShowPasswordModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-2xl font-black text-white mb-2">Alterar Senha</h2>
                            <p className="text-slate-500 text-sm mb-10">Use pelo menos 8 caracteres com uma combinação de letras e números.</p>

                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Senha Atual</label>
                                    <input
                                        type="password" required
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-primary/50 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nova Senha</label>
                                    <input
                                        type="password" required
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-primary/50 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Confirmar Nova Senha</label>
                                    <input
                                        type="password" required
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 px-6 text-sm text-white focus:border-primary/50 outline-none"
                                    />
                                </div>

                                <button
                                    type="submit" disabled={changing}
                                    className="w-full bg-primary text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.3em] transition-all disabled:opacity-50 mt-4 h-16 flex items-center justify-center"
                                >
                                    {changing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Alteração'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
