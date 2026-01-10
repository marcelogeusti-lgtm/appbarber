'use client';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X, Search, Calendar, Clock, User, Scissors, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SqueezeInModal({ isOpen, onClose, services, barbershopId, onConfirm }) {
    const [step, setStep] = useState(0); // 0: Client, 1: Service, 2: Date, 3: Results
    const [selectedService, setSelectedService] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [targetDate, setTargetDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setSelectedService(null);
            setSelectedClient(null);
            setAvailability([]);
            setSelectedSlot(null);
            setTargetDate(format(new Date(), 'yyyy-MM-dd'));
            fetchClients();
            setSearchTerm('');
        }
    }, [isOpen]);

    const fetchClients = async () => {
        if (!barbershopId) return;
        try {
            const res = await api.get(`/clients?barbershopId=${barbershopId}`);
            setClients(res.data);
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

    const handleDateConfirm = async () => {
        setStep(3);
        setLoading(true);
        try {
            const res = await api.get(`/availability/${barbershopId}/${targetDate}`, {
                params: { serviceIds: selectedService.id }
            });
            setAvailability(res.data);
        } catch (error) {
            console.error(error);
            alert('Erro ao buscar disponibilidade.');
        } finally {
            setLoading(false);
        }
    };

    const handleSlotSelect = (pro, time) => {
        setSelectedSlot({
            professional: pro,
            time,
            date: targetDate,
            service: selectedService
        });
    };

    const confirmBooking = () => {
        if (!selectedSlot || !selectedClient) return;
        onConfirm({
            professionalId: selectedSlot.professional.proId,
            serviceId: selectedSlot.service.id,
            clientId: selectedClient.id, // ID do cliente selecionado
            date: selectedSlot.date,
            time: selectedSlot.time,
            isSqueezeIn: true
        });
        onClose();
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111827] w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                            <Scissors className="text-emerald-500 w-5 h-5" /> Novo Agendamento
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                            {step === 0 ? 'Selecione o Cliente' :
                                step === 1 ? 'Selecione o Serviço' :
                                    step === 2 ? 'Escolha a Data' : 'Horários Disponíveis'}
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
                                    placeholder="Buscar cliente por nome ou telefone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-emerald-500 transition"
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
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                            {client.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{client.name}</p>
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
                                <User className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm font-bold text-white">{selectedClient?.name}</span>
                            </div>

                            <p className="text-sm text-slate-400 font-medium">Selecione o serviço:</p>
                            <div className="grid gap-3">
                                {services.map(srv => (
                                    <button
                                        key={srv.id}
                                        onClick={() => handleServiceSelect(srv)}
                                        className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition group text-left"
                                    >
                                        <div>
                                            <p className="font-black text-white uppercase tracking-tight group-hover:text-emerald-500 transition-colors">{srv.name}</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{srv.duration} min • R$ {Number(srv.price).toFixed(2)}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all">
                                            <Calendar className="w-4 h-4 text-slate-500 group-hover:text-white" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Date */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex gap-2">
                                <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                                    <span className="block text-slate-500 uppercase font-bold text-[10px]">Cliente</span>
                                    <span className="font-bold text-white">{selectedClient?.name}</span>
                                </div>
                                <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                                    <span className="block text-slate-500 uppercase font-bold text-[10px]">Serviço</span>
                                    <span className="font-bold text-emerald-500">{selectedService?.name}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data do Agendamento</label>
                                <input
                                    type="date"
                                    value={targetDate}
                                    onChange={(e) => setTargetDate(e.target.value)}
                                    className="w-full bg-[#0B1121] text-white p-4 rounded-xl border border-slate-800 focus:border-emerald-500 outline-none font-bold uppercase tracking-widest text-sm"
                                />
                            </div>

                            <button
                                onClick={handleDateConfirm}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-xl font-black uppercase tracking-widest transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                            >
                                <Search className="w-4 h-4" /> Buscar Disponibilidade
                            </button>
                            <button
                                onClick={() => setStep(1)}
                                className="w-full text-slate-500 hover:text-slate-300 p-2 text-xs font-bold uppercase tracking-widest"
                            >
                                Voltar
                            </button>
                        </div>
                    )}

                    {/* Step 3: Results */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                <span className="whitespace-nowrap bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-400 uppercase">{selectedClient?.name}</span>
                                <span className="whitespace-nowrap bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-400 uppercase">{selectedService?.name}</span>
                                <span className="whitespace-nowrap bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-400 uppercase">{format(new Date(targetDate), 'dd/MM/yyyy')}</span>
                            </div>

                            {loading ? (
                                <div className="py-20 text-center text-slate-500 animate-pulse font-bold uppercase text-xs">Calculando horários...</div>
                            ) : (
                                <div className="space-y-6">
                                    {availability.length === 0 ? (
                                        <div className="text-center py-10">
                                            <AlertCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                            <p className="text-slate-500 font-bold text-xs uppercase">Nenhum profissional encontrado para esta data.</p>
                                        </div>
                                    ) : (
                                        availability.map(pro => (
                                            <div key={pro.proId} className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <User className={`w-4 h-4 ${pro.slots.length > 0 ? 'text-emerald-500' : 'text-slate-600'}`} />
                                                    <h3 className={`text-sm font-black uppercase tracking-tight ${pro.slots.length > 0 ? 'text-white' : 'text-slate-600'}`}>{pro.proName}</h3>
                                                    {pro.slots.length === 0 && (
                                                        <span className="text-[9px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">Indisponível</span>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {pro.slots.length > 0 ? (
                                                        pro.slots.map(time => (
                                                            <button
                                                                key={time}
                                                                onClick={() => handleSlotSelect(pro, time)}
                                                                className={`p-2 rounded-lg text-xs font-bold transition border ${selectedSlot?.time === time && selectedSlot?.professional.proId === pro.proId ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'}`}
                                                            >
                                                                {time}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="col-span-4 text-[10px] text-slate-600 font-medium italic">
                                                            Nenhum horário livre ou escala não definida.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 3 && selectedSlot && (
                    <div className="p-6 border-t border-slate-800 bg-slate-950/50">
                        <button
                            onClick={confirmBooking}
                            className="w-full bg-white text-[#111827] hover:bg-slate-200 p-4 rounded-xl font-black uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" /> Confirmar ({selectedSlot.time})
                        </button>
                        <button
                            onClick={() => { setSelectedSlot(null); setStep(2); }}
                            className="w-full mt-2 text-slate-500 hover:text-slate-300 p-2 text-xs font-bold uppercase tracking-widest"
                        >
                            Alterar Data
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
