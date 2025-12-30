'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Plus, User, Phone, Mail, Clock, Shield, X, Check, Calendar } from 'lucide-react';

export default function ProfessionalsPage() {
    const [pros, setPros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingScheduleId, setEditingScheduleId] = useState(null);
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
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const barbershopId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            await api.post('/professionals', {
                ...formData,
                barbershopId
            });

            setFormData({ name: '', email: '', password: '', phone: '', position: '' });
            setIsAdding(false);
            fetchPros();
            alert('Profissional cadastrado com sucesso!');
        } catch (err) {
            alert('Erro ao cadastrar profissional: ' + (err.response?.data?.message || err.message));
        }
    };

    const openScheduleEditor = (pro) => {
        const existing = pro.professionalProfile?.schedules || [];
        const days = [0, 1, 2, 3, 4, 5, 6];
        const initial = days.map(d => {
            const match = existing.find(s => s.dayOfWeek === d);
            return match || { dayOfWeek: d, startTime: '09:00', endTime: '18:00', isOff: d === 0 };
        });
        setTempSchedules(initial);
        setEditingScheduleId(pro.id);
    };

    const saveSchedule = async () => {
        try {
            await api.put('/professionals/schedule', { userId: editingScheduleId, schedules: tempSchedules });
            setEditingScheduleId(null);
            fetchPros();
            alert('Jornada de trabalho atualizada!');
        } catch (err) {
            alert('Erro ao salvar horários');
        }
    };

    const toggleDayOff = (dayOfWeek) => {
        setTempSchedules(prev => prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, isOff: !s.isOff } : s));
    };

    const updateTime = (dayOfWeek, field, value) => {
        setTempSchedules(prev => prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s));
    };

    const dayName = (d) => ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d];

    if (loading) return <div className="p-8 text-center">Carregando equipe...</div>;

    return (
        <div className="space-y-6 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Gerenciar Equipe</h1>
                    <p className="text-slate-500 text-sm">Cadastre e gerencie os profissionais e suas jornadas.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
                    >
                        <Plus className="w-5 h-5" /> Adicionar Funcionário
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black uppercase tracking-wider">Novo Profissional</h2>
                        <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-red-500 transition"><X /></button>
                    </div>
                    <form onSubmit={handleAddPro} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nome Completo</label>
                            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-4 border rounded-2xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-orange-500/20 outline-none transition" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cargo / Função</label>
                            <input placeholder="Ex: Barbeiro Sênior" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className="w-full p-4 border rounded-2xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-orange-500/20 outline-none transition" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">E-mail de Acesso</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-4 border rounded-2xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-orange-500/20 outline-none transition" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telefone / WhatsApp</label>
                            <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-4 border rounded-2xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-orange-500/20 outline-none transition" required />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Senha Temporária</label>
                            <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-4 border rounded-2xl dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-orange-500/20 outline-none transition" required />
                        </div>

                        <div className="md:col-span-2 pt-4 flex gap-4">
                            <button type="submit" className="flex-1 bg-slate-900 text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">SALVAR CADASTRO</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pros.map(pro => (
                    <div key={pro.id} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl flex items-center justify-center font-black text-2xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                {pro.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-black text-xl uppercase tracking-tight">{pro.name}</h3>
                                <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> {pro.professionalProfile?.position || 'Barbeiro'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-3 text-slate-500 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><Phone className="w-4 h-4" /></div>
                                <span className="font-medium">{pro.phone || 'Sem telefone'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><Mail className="w-4 h-4" /></div>
                                <span className="font-medium">{pro.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-2xl">
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
                            className="w-full border-2 border-slate-50 dark:border-slate-700 p-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all flex items-center justify-center gap-2"
                        >
                            <Calendar className="w-4 h-4" /> DEFINIR JORNADA
                        </button>
                    </div>
                ))}
            </div>

            {/* Schedule Modal */}
            {editingScheduleId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-orange-500 text-white">
                            <h2 className="text-xl font-bold">Definir Jornada de Trabalho</h2>
                            <button onClick={() => setEditingScheduleId(null)}><X /></button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                            {tempSchedules.map((s, idx) => (
                                <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border ${s.isOff ? 'bg-slate-50 dark:bg-slate-800 border-slate-100 opacity-50' : 'bg-white dark:bg-slate-800 border-orange-100'}`}>
                                    <div className="w-32">
                                        <p className="font-bold">{dayName(s.dayOfWeek)}</p>
                                        <button
                                            onClick={() => toggleDayOff(s.dayOfWeek)}
                                            className={`text-[10px] font-black uppercase tracking-widest ${s.isOff ? 'text-red-500' : 'text-green-500'}`}
                                        >
                                            {s.isOff ? 'OFF (Folga)' : 'ON (Trabalha)'}
                                        </button>
                                    </div>
                                    {!s.isOff && (
                                        <div className="flex items-center gap-3">
                                            <input type="time" value={s.startTime} onChange={e => updateTime(s.dayOfWeek, 'startTime', e.target.value)} className="p-2 border rounded-lg bg-white dark:bg-slate-900" />
                                            <span>até</span>
                                            <input type="time" value={s.endTime} onChange={e => updateTime(s.dayOfWeek, 'endTime', e.target.value)} className="p-2 border rounded-lg bg-white dark:bg-slate-900" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800 flex justify-end gap-3">
                            <button onClick={saveSchedule} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20">SALVAR JORNADA</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
