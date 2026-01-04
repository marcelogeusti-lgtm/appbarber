'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Plus, User, Phone, Mail, Clock, Shield, X, Check, Calendar, Trash2, Edit } from 'lucide-react';

export default function ProfessionalsPage() {
    const [pros, setPros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingScheduleId, setEditingScheduleId] = useState(null);
    const [tempSchedules, setTempSchedules] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', position: '' });

    useEffect(() => {
        fetchPros();
    }, []);

    const fetchPros = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const res = await api.get(`/professionals?barbershopId=${user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id}`);
            setPros(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAddPro = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const barbershopId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            if (!barbershopId) {
                alert('Erro: ID da barbearia não encontrado. Faça login novamente.');
                setActionLoading(false);
                return;
            }

            await api.post('/professionals', {
                ...formData,
                barbershopId
            });

            setFormData({ name: '', email: '', password: '', phone: '', position: '' });
            setIsAdding(false);
            await fetchPros();
            alert('✅ Profissional cadastrado com sucesso!');
        } catch (err) {
            console.error(err);
            if (err.response?.status === 403 && err.response?.data?.message) {
                // SaaS Limit Reached
                alert(`⚠️ Atenção: ${err.response.data.message}`);
            } else {
                alert('❌ Erro ao cadastrar: ' + (err.response?.data?.message || err.message));
            }
        } finally {
            setActionLoading(false);
        }
    };

    const openScheduleEditor = (pro) => {
        const existing = pro.professionalProfile?.schedules || [];
        const days = [0, 1, 2, 3, 4, 5, 6];
        const initial = days.map(d => {
            const match = existing.find(s => s.dayOfWeek === d);
            return match || { dayOfWeek: d, startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00', isOff: d === 0 };
        });
        setTempSchedules(initial);
        setEditingScheduleId(pro.id);
    };

    const saveSchedule = async () => {
        setActionLoading(true);
        try {
            await api.put('/professionals/schedule', { userId: editingScheduleId, schedules: tempSchedules });
            setEditingScheduleId(null);
            await fetchPros();
            alert('✅ Jornada de trabalho atualizada!');
        } catch (err) {
            alert('❌ Erro ao salvar horários');
        } finally {
            setActionLoading(false);
        }
    };

    const toggleDayOff = (dayOfWeek) => {
        setTempSchedules(prev => prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, isOff: !s.isOff } : s));
    };

    const updateTime = (dayOfWeek, field, value) => {
        setTempSchedules(prev => prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s));
    };

    const dayName = (d) => ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d];

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-bold uppercase text-xs">Carregando equipe...</div>;

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-8 rounded-3xl border border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Gestão de Equipe</h1>
                        <p className="text-slate-500 text-sm font-medium italic">Cadastre e gerencie os profissionais e suas jornadas.</p>
                    </div>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition"
                    >
                        <Plus className="w-4 h-4" /> Adicionar Profissional
                    </button>
                )}
            </header>

            {isAdding && (
                <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold uppercase tracking-wider text-white">Novo Profissional</h2>
                        <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-red-500 transition"><X /></button>
                    </div>
                    <form onSubmit={handleAddPro} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white transition" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cargo / Função</label>
                            <input placeholder="Ex: Barbeiro Sênior" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white transition" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail de Acesso</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white transition" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Telefone / WhatsApp</label>
                            <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white transition" required />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Senha Temporária</label>
                            <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white transition" required />
                        </div>

                        <div className="md:col-span-2 pt-4 flex gap-4">
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className={`flex-1 bg-white text-slate-900 p-4 rounded-xl font-black uppercase tracking-widest transition hover:bg-slate-200 ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {actionLoading ? 'SALVANDO...' : 'SALVAR CADASTRO'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pros.map(pro => (
                    <div key={pro.id} className="bg-[#111827] p-8 rounded-[2rem] border border-slate-800 hover:border-emerald-500/50 transition-all group relative">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-2xl text-emerald-500 border border-slate-800 group-hover:scale-110 transition-transform">
                                {pro.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-white uppercase tracking-tight">{pro.name}</h3>
                                <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> {pro.professionalProfile?.position || 'Barbeiro'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-3 text-slate-400 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800"><Phone className="w-4 h-4" /></div>
                                <span className="font-medium">{pro.phone || 'Sem telefone'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800"><Mail className="w-4 h-4" /></div>
                                <span className="font-medium">{pro.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-emerald-500 text-xs font-bold bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                                <Clock className="w-4 h-4" />
                                <span>
                                    {pro.professionalProfile?.schedules?.length > 0
                                        ? pro.professionalProfile.schedules.filter(s => !s.isOff).length + ' DIAS DE ATENDIMENTO'
                                        : 'HORÁRIO NÃO DEFINIDO'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => openScheduleEditor(pro)}
                            className="w-full border border-slate-700 bg-slate-900 p-4 rounded-xl font-black text-xs text-slate-300 uppercase tracking-widest hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all flex items-center justify-center gap-2"
                        >
                            <Calendar className="w-4 h-4" /> DEFINIR JORNADA
                        </button>
                    </div>
                ))}
            </div>

            {/* Schedule Modal */}
            {editingScheduleId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#111827] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-emerald-500 text-white">
                            <h2 className="text-xl font-bold uppercase">Definir Jornada de Trabalho</h2>
                            <button onClick={() => setEditingScheduleId(null)} className="hover:text-slate-200"><X /></button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                            {tempSchedules.map((s, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border ${s.isOff ? 'bg-slate-900/50 border-slate-800 opacity-50' : 'bg-slate-900 border-emerald-500/30'}`}>
                                    <div className="w-32">
                                        <p className="font-bold text-white">{dayName(s.dayOfWeek)}</p>
                                        <button
                                            onClick={() => toggleDayOff(s.dayOfWeek)}
                                            className={`text-[10px] font-black uppercase tracking-widest ${s.isOff ? 'text-red-500' : 'text-emerald-500'}`}
                                        >
                                            {s.isOff ? 'OFF (Folga)' : 'ON (Trabalha)'}
                                        </button>
                                    </div>
                                    {!s.isOff && (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">Entrada</p>
                                                    <input type="time" value={s.startTime} onChange={e => updateTime(s.dayOfWeek, 'startTime', e.target.value)} className="p-2 border border-slate-700 rounded-lg bg-slate-950 text-white font-bold text-xs" />
                                                </div>
                                                <span className="text-slate-500 text-[10px] uppercase font-bold mt-4">até</span>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">Saída</p>
                                                    <input type="time" value={s.endTime} onChange={e => updateTime(s.dayOfWeek, 'endTime', e.target.value)} className="p-2 border border-slate-700 rounded-lg bg-slate-950 text-white font-bold text-xs" />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 border-t border-slate-800/50 pt-3">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest pl-1">Início Almoço</p>
                                                    <input type="time" value={s.breakStart || '12:00'} onChange={e => updateTime(s.dayOfWeek, 'breakStart', e.target.value)} className="p-2 border border-slate-700 rounded-lg bg-slate-950 text-white font-bold text-xs" />
                                                </div>
                                                <span className="text-slate-500 text-[10px] uppercase font-bold mt-4">até</span>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest pl-1">Fim Almoço</p>
                                                    <input type="time" value={s.breakEnd || '13:00'} onChange={e => updateTime(s.dayOfWeek, 'breakEnd', e.target.value)} className="p-2 border border-slate-700 rounded-lg bg-slate-950 text-white font-bold text-xs" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={saveSchedule}
                                disabled={actionLoading}
                                className={`bg-white text-slate-900 px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-slate-200 transition ${actionLoading ? 'opacity-50' : ''}`}
                            >
                                {actionLoading ? 'SALVANDO...' : 'SALVAR JORNADA'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
