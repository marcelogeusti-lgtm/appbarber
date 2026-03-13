'use client';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X, Search, Calendar, User, Scissors, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { normalizeString } from '../lib/utils/string';

export default function SqueezeInModal({ isOpen, onClose, services, professionals = [], barbershopId, onConfirm }) {
    const [step, setStep] = useState(0); // 0: Client, 1: Service, 2: Professional, 3: Date/Time
    const [selectedService, setSelectedService] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedPro, setSelectedPro] = useState(null);
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Default manual time
    const [targetDate, setTargetDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [targetTime, setTargetTime] = useState(format(new Date(), 'HH:mm'));

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setSelectedService(null);
            setSelectedClient(null);
            setSelectedPro(null);
            setTargetDate(format(new Date(), 'yyyy-MM-dd'));
            setTargetTime(format(new Date(), 'HH:mm'));
            fetchClients();
            setSearchTerm('');
        }
    }, [isOpen]);

    const fetchClients = async () => {
        if (!barbershopId) return;
        try {
            const res = await api.get(`/clients?barbershopId=${barbershopId}&limit=1000`);
            setClients(Array.isArray(res.data) ? res.data : (res.data.data || []));
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
        }
    };

    const handleClientSelect = (client) => {
        setSelectedClient(client);
        setStep(1);
    };

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setStep(2);
    };

    const handleProSelect = (pro) => {
        setSelectedPro(pro);
        setStep(3);
    };

    const confirmBooking = () => {
        if (!selectedClient || !selectedService || !selectedPro || !targetDate || !targetTime) return;

        onConfirm({
            professionalId: selectedPro.id,
            serviceId: selectedService.id,
            clientId: selectedClient.id,
            date: targetDate, // The backend usually expects "date" in ISO format or it parses string + time.
            time: targetTime,
            isSqueezeIn: true
        });
        onClose();
    };

    const filteredClients = clients.filter(c => {
        const query = normalizeString(searchTerm);
        const name = normalizeString(c.name);
        const phone = normalizeString(c.phone);
        return name.includes(query) || phone.includes(query);
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111827] w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                            <Clock className="text-orange-500 w-5 h-5" /> Encaixe Rápido
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                            {step === 0 ? 'Passo 1: Selecione o Cliente' :
                                step === 1 ? 'Passo 2: Selecione o Serviço' :
                                    step === 2 ? 'Passo 3: Selecione o Profissional' :
                                        'Passo 4: Forçar Data e Horário'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Step 0: Client Selection */}
                    {step === 0 && (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar cliente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-orange-500 transition"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {filteredClients.map(client => (
                                    <button
                                        key={client.id}
                                        onClick={() => handleClientSelect(client)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                            {client.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200 group-hover:text-orange-400 transition-colors">{client.name}</p>
                                            <p className="text-xs text-slate-500">{client.phone || 'Sem telefone'}</p>
                                        </div>
                                    </button>
                                ))}
                                {filteredClients.length === 0 && (
                                    <p className="text-center text-slate-500 text-xs py-4">Nenhum cliente encontrado.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 1: Services */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <button onClick={() => setStep(0)} className="text-xs text-slate-500 hover:text-white mb-2 flex items-center gap-1">← Voltar para Clientes</button>
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 flex items-center gap-3">
                                <User className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-bold text-white uppercase tracking-tight">{selectedClient?.name}</span>
                            </div>

                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Escolha a Especialidade:</p>
                            <div className="grid gap-3">
                                {(Array.isArray(services) ? services : (services?.data || [])).map(srv => (
                                    <button
                                        key={srv.id}
                                        onClick={() => handleServiceSelect(srv)}
                                        className="flex items-center gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-orange-500/50 hover:bg-orange-500/5 transition text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                            <Scissors className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white uppercase tracking-tight group-hover:text-orange-500">{srv.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{srv.duration} min • R$ {Number(srv.price).toFixed(2)}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Professional */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-white mb-2 flex items-center gap-1">← Voltar para Serviços</button>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                                    <span className="block text-slate-500 uppercase font-bold text-[10px]">Cliente</span>
                                    <span className="font-bold text-white uppercase truncate block leading-tight mt-1">{selectedClient?.name}</span>
                                </div>
                                <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                                    <span className="block text-slate-500 uppercase font-bold text-[10px]">Serviço</span>
                                    <span className="font-bold text-orange-500 uppercase truncate block leading-tight mt-1">{selectedService?.name}</span>
                                </div>
                            </div>

                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-4">Qual o Barbeiro?</p>
                            <div className="grid gap-3">
                                {professionals?.filter(s => ['BARBER', 'ADMIN', 'SUPER_ADMIN'].includes(s.role.toUpperCase())).map(pro => (
                                    <button
                                        key={pro.id}
                                        onClick={() => handleProSelect(pro)}
                                        className="flex items-center gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-orange-500/50 hover:bg-orange-500/5 transition text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-black text-white group-hover:bg-orange-500 transition-colors">
                                            {pro.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-white uppercase tracking-tight group-hover:text-orange-500">{pro.name}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Custom Date & Time Entry */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                <span className="whitespace-nowrap bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedClient?.name.split(' ')[0]}</span>
                                <span className="whitespace-nowrap bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedService?.name}</span>
                                <span className="whitespace-nowrap bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-[9px] font-black text-orange-500 uppercase tracking-widest">{selectedPro?.name}</span>
                            </div>

                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex gap-4 items-start">
                                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-orange-500/90 font-bold leading-relaxed">
                                    Esta função força a inserção de um agendamento na agenda do profissional ignorando choques de horário ou descansos.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</label>
                                    <input
                                        type="date"
                                        value={targetDate}
                                        onChange={(e) => setTargetDate(e.target.value)}
                                        className="w-full bg-[#0B1121] text-white p-4 rounded-xl border border-slate-800 focus:border-orange-500 outline-none font-bold uppercase tracking-widest text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora</label>
                                    <input
                                        type="time"
                                        value={targetTime}
                                        onChange={(e) => setTargetTime(e.target.value)}
                                        className="w-full bg-[#0B1121] text-white p-4 rounded-xl border border-slate-800 focus:border-orange-500 outline-none font-bold uppercase tracking-widest text-sm"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={confirmBooking}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-xl font-black uppercase tracking-widest transition shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Salvar Encaixe
                                </button>
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full mt-2 text-slate-500 hover:text-slate-300 p-2 text-xs font-bold uppercase tracking-widest"
                                >
                                    Voltar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
