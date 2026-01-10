'use client';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { X, Search, Calendar, Clock, User, Scissors, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SqueezeInModal({ isOpen, onClose, services, barbershopId, onConfirm }) {
    const [step, setStep] = useState(1); // 1: Service, 2: Date, 3: Results/Selection
    const [selectedService, setSelectedService] = useState(null);
    const [targetDate, setTargetDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null); // { proId, time }

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedService(null);
            setAvailability([]);
            setSelectedSlot(null);
            setTargetDate(format(new Date(), 'yyyy-MM-dd'));
        }
    }, [isOpen]);

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setStep(2);
    };

    const handleDateConfirm = async () => {
        setStep(3);
        setLoading(true);
        try {
            // Fetch availability for the specific service duration
            // availability.controller expects serviceIds query param
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
        if (!selectedSlot) return;
        onConfirm({
            professionalId: selectedSlot.professional.proId,
            serviceId: selectedSlot.service.id,
            date: selectedSlot.date,
            time: selectedSlot.time,
            isSqueezeIn: true
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111827] w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                            <Scissors className="text-emerald-500 w-5 h-5" /> Encaixe Inteligente
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                            Encontre horários compatíveis automaticamente
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Step 1: Services */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-400 font-medium">Selecione o serviço para calcular a duração:</p>
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
                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                                <span className="text-xs font-black text-white uppercase tracking-widest">Serviço Selecionado:</span>
                                <span className="text-xs text-emerald-500 font-bold uppercase">{selectedService?.name} ({selectedService?.duration} min)</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data do Encaixe</label>
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
                                <span className="whitespace-nowrap bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-400 uppercase">{selectedService?.name}</span>
                                <span className="whitespace-nowrap bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-400 uppercase">{format(new Date(targetDate), 'dd/MM/yyyy')}</span>
                            </div>

                            {loading ? (
                                <div className="py-20 text-center text-slate-500 animate-pulse font-bold uppercase text-xs">Calculando encaixes possíveis...</div>
                            ) : (
                                <div className="space-y-6">
                                    {availability.filter(p => p.slots.length > 0).length === 0 ? (
                                        <div className="text-center py-10">
                                            <AlertCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                            <p className="text-slate-500 font-bold text-xs uppercase">Nenhum horário disponível para este serviço nesta data.</p>
                                        </div>
                                    ) : (
                                        availability.filter(p => p.slots.length > 0).map(pro => (
                                            <div key={pro.proId} className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-emerald-500" />
                                                    <h3 className="text-sm font-black text-white uppercase tracking-tight">{pro.proName}</h3>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {pro.slots.map(time => (
                                                        <button
                                                            key={time}
                                                            onClick={() => handleSlotSelect(pro, time)}
                                                            className={`p-2 rounded-lg text-xs font-bold transition border ${selectedSlot?.time === time && selectedSlot?.professional.proId === pro.proId ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'}`}
                                                        >
                                                            {time}
                                                        </button>
                                                    ))}
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
                            <CheckCircle className="w-4 h-4" /> Confirmar Agendamento ({selectedSlot.time})
                        </button>
                        <button
                            onClick={() => { setSelectedSlot(null); setStep(2); }}
                            className="w-full mt-2 text-slate-500 hover:text-slate-300 p-2 text-xs font-bold uppercase tracking-widest"
                        >
                            Alterar Filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
