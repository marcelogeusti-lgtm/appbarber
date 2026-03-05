'use client';
import { ShieldCheck, Key, Smartphone, Lock, ChevronRight, X, Loader2, CheckCircle2, QrCode, MonitorSmartphone, Trash2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '../../../../lib/clientApi';
import { toast } from 'sonner';

export default function SecurityPage() {
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [showSessionsModal, setShowSessionsModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [changing, setChanging] = useState(false);

    const [authStatus, setAuthStatus] = useState({ twoFactorEnabled: false });

    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // 2FA state
    const [twoFactorData, setTwoFactorData] = useState(null);
    const [twoFactorCode, setTwoFactorCode] = useState('');

    // Sessions state
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        fetchAuthStatus();
    }, []);

    const fetchAuthStatus = async () => {
        try {
            const res = await api.get('/auth/status');
            setAuthStatus(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // --- Password Change ---
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

    // --- 2FA Functions ---
    const open2FAModal = async () => {
        setShow2FAModal(true);
        if (!authStatus.twoFactorEnabled && !twoFactorData) {
            try {
                const res = await api.get('/auth/2fa/generate');
                setTwoFactorData(res.data);
            } catch (error) {
                toast.error('Erro ao gerar código 2FA.');
            }
        }
    };

    const handleEnable2FA = async (e) => {
        e.preventDefault();
        setChanging(true);
        try {
            await api.post('/auth/2fa/enable', {
                token: twoFactorCode,
                secret: twoFactorData.secret
            });
            toast.success('2FA ativado com sucesso!');
            setAuthStatus({ twoFactorEnabled: true });
            setShow2FAModal(false);
            setTwoFactorCode('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Código inválido.');
        } finally {
            setChanging(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!confirm('Deseja realmente desativar a verificação em duas etapas?')) return;
        setChanging(true);
        try {
            await api.post('/auth/2fa/disable');
            toast.success('2FA desativado com sucesso.');
            setAuthStatus({ twoFactorEnabled: false });
            setTwoFactorData(null);
            setShow2FAModal(false);
        } catch (error) {
            toast.error('Erro ao desativar 2FA.');
        } finally {
            setChanging(false);
        }
    };

    // --- Sessions Functions ---
    const openSessionsModal = async () => {
        setShowSessionsModal(true);
        fetchSessions();
    };

    const fetchSessions = async () => {
        try {
            const res = await api.get('/auth/sessions');
            setSessions(res.data);
        } catch (error) {
            toast.error('Erro ao carregar sessões.');
        }
    };

    const handleRevokeSession = async (sessionId) => {
        try {
            await api.delete(`/auth/sessions/${sessionId}`);
            toast.success('Sessão desconectada.');
            fetchSessions();
        } catch (error) {
            toast.error('Erro ao desconectar sessão.');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1, y: 0,
            transition: { staggerChildren: 0.1, duration: 0.5 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

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
            action: authStatus.twoFactorEnabled ? 'Gerenciar' : 'Configurar',
            active: authStatus.twoFactorEnabled,
            onClick: open2FAModal
        },
        {
            icon: Lock, title: 'Dispositivos Conectados',
            desc: 'Gerencie os aparelhos onde sua conta está ativa no momento.',
            action: 'Gerenciar',
            onClick: openSessionsModal
        },
    ];

    return (
        <motion.div
            initial="hidden" animate="visible" variants={containerVariants}
            className="space-y-12 animate-in fade-in duration-500 relative"
        >
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
                <h1 className="text-4xl font-black text-white tracking-tight">Segurança</h1>
                <p className="text-slate-500 text-sm font-medium max-w-md leading-relaxed">
                    Proteja sua conta e controle seus acessos com ferramentas de segurança avançadas.
                </p>
            </motion.div>

            <div className="grid gap-6 relative z-0">
                {securityItems.map((item, idx) => (
                    <motion.div
                        key={idx} variants={itemVariants} whileHover={{ y: -5 }}
                        className="group relative overflow-hidden bg-[#0A0A0B]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:border-white/10 shadow-xl"
                    >
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 rounded-[1.8rem] bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:bg-primary/5 transition-all duration-500 flex-shrink-0">
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
                                    {item.active && (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-500/20">
                                            <CheckCircle2 className="w-3 h-3" /> Ativo
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 max-w-[320px] leading-relaxed italic">{item.desc}</p>
                            </div>
                        </div>

                        <div className="relative z-10 w-full md:w-auto">
                            <button
                                onClick={item.onClick}
                                className="w-full md:w-auto px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-95 whitespace-nowrap"
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
                    <span className="text-[10px] text-emerald-500/80 font-black uppercase tracking-[0.2em] text-center">
                        Sua conta está protegida com criptografia de ponta a ponta
                    </span>
                </div>
            </motion.div>

            <AnimatePresence>
                {/* --- Password Modal --- */}
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
                                    className="w-full bg-primary text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.3em] transition-all hover:bg-primary/90 disabled:opacity-50 mt-4 flex items-center justify-center gap-2 h-16"
                                >
                                    {changing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Alteração'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* --- 2FA Modal --- */}
                {show2FAModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto pt-24 pb-24">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShow2FAModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0A0A0B] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg relative z-10 shadow-2xl my-auto"
                        >
                            <button onClick={() => setShow2FAModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-2xl font-black text-white mb-2">Verificação em Duas Etapas</h2>

                            {authStatus.twoFactorEnabled ? (
                                <div className="space-y-8 mt-8 text-center pb-4">
                                    <div className="w-24 h-24 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-lg mb-2">2FA Ativado com sucesso</p>
                                        <p className="text-slate-500 text-sm max-w-[280px] mx-auto leading-relaxed text-balance">Sua conta está mais segura com a camada de verificação extra gerada pelo seu aplicativo autenticador.</p>
                                    </div>
                                    <button
                                        onClick={handleDisable2FA} disabled={changing}
                                        className="px-8 py-4 bg-white/5 border border-white/10 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto mt-4"
                                    >
                                        {changing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Desativar 2FA'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-8 mt-8">
                                    <p className="text-slate-500 text-sm leading-relaxed text-balance">Escaneie o QRCode abaixo com um aplicativo de autenticação (ex: Google Authenticator, Authy, 1Password).</p>

                                    {twoFactorData ? (
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="p-4 bg-white rounded-3xl w-max mx-auto shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                                                <img src={twoFactorData.qrcode} alt="QR Code" className="w-48 h-48" />
                                            </div>

                                            <div className="space-y-4 w-full">
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Se preferir, insira o código manual</p>
                                                    <code className="text-primary font-mono bg-primary/10 px-6 py-3 rounded-2xl text-sm border border-primary/20 block tracking-widest">
                                                        {twoFactorData.secret}
                                                    </code>
                                                </div>

                                                <form onSubmit={handleEnable2FA} className="space-y-6 pt-6 mt-4 border-t border-white/5">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Código do Autenticador</label>
                                                        <input
                                                            type="text" required maxLength="6" placeholder="000 000"
                                                            value={twoFactorCode}
                                                            onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-6 px-6 text-center text-3xl font-mono tracking-[0.5em] text-white focus:border-primary/50 outline-none placeholder:text-slate-800 focus:bg-primary/5 transition-all"
                                                        />
                                                    </div>
                                                    <button
                                                        type="submit" disabled={changing || twoFactorCode.length !== 6}
                                                        className="w-full bg-primary text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.3em] transition-all hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 h-16"
                                                    >
                                                        {changing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar e Ativar 2FA'}
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center p-10">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}

                {/* --- Sessions Modal --- */}
                {showSessionsModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pt-24 pb-24">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowSessionsModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0A0A0B] border border-white/10 rounded-[2.5rem] p-8 md:p-10 w-full max-w-2xl relative z-10 shadow-2xl my-auto flex flex-col max-h-full"
                        >
                            <button onClick={() => setShowSessionsModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>

                            <h2 className="text-2xl font-black text-white mb-2">Dispositivos Conectados</h2>
                            <p className="text-slate-500 text-sm mb-8 leading-relaxed">Revise e gerencie onde sua conta está conectada. Desconecte dispositivos suspeitos ou que você não usa mais.</p>

                            <div className="space-y-4 overflow-y-auto pr-2 flex-shrink min-h-[100px]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>
                                {sessions.length === 0 ? (
                                    <div className="text-center py-10">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                                    </div>
                                ) : (
                                    sessions.map((session) => (
                                        <div key={session.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-white/10 transition-colors group">
                                            <div className="flex items-center gap-5 w-full">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${session.isCurrent ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-white/5 text-slate-500 border border-white/10 group-hover:bg-white/10'}`}>
                                                    <MonitorSmartphone className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1.5">
                                                        <p className="text-white font-bold text-sm truncate" title={session.deviceInfo}>
                                                            {session.deviceInfo?.split(' ')?.slice(0, 3)?.join(' ') || 'Dispositivo Desconhecido'}
                                                        </p>
                                                        {session.isCurrent && (
                                                            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-500/20 w-max">
                                                                Sessão Atual
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 font-medium">
                                                        <span>{session.ipAddress || 'IP Desconhecido'}</span>
                                                        <span className="text-slate-700">•</span>
                                                        <span>{new Date(session.lastActive).toLocaleDateString('pt-BR')} às {new Date(session.lastActive).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {!session.isCurrent && (
                                                <button
                                                    onClick={() => handleRevokeSession(session.id)}
                                                    className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-red-500 border border-white/5 hover:border-red-500 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 flex-shrink-0"
                                                >
                                                    <LogOut className="w-3.5 h-3.5" /> Sair
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

