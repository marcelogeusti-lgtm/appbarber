'use client';
import { useState } from 'react';
import { Scissors, Clock, Banknote, ChevronRight, X } from 'lucide-react';

export default function ServicesTab({ services, onSelect }) {
    const [selectedService, setSelectedService] = useState(null);
    const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    if (!services || services.length === 0) {
        return (
            <div className="text-center py-10 opacity-50">
                <p className="text-sm font-bold uppercase tracking-widest">Nenhum serviço encontrado.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 pb-24 animate-in fade-in slide-in-from-bottom-4">
                {services.map(service => (
                    <div
                        key={service.id}
                        onClick={() => onSelect(service)}
                        className="group bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-[2px] rounded-xl cursor-pointer hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div className="bg-[#0b0f19] rounded-[22px] p-5 h-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">

                            {/* Subtle Background Glow */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>

                            <div className="flex gap-4 items-start w-full sm:w-auto relative z-10">
                                {/* Premium Icon/Image Container */}
                                <div
                                    className="relative w-20 h-20 rounded-xl overflow-hidden group/img cursor-pointer shrink-0 border border-primary/20"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedService(service);
                                    }}
                                >
                                    {service.imageUrl ? (
                                        <img
                                            src={service.imageUrl}
                                            alt={service.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                            <Scissors className="w-8 h-8 text-primary/40" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19]/80 via-transparent to-transparent opacity-60" />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-black text-white text-lg uppercase tracking-tight leading-tight mb-2 group-hover:text-primary/80 transition-colors">
                                        {service.name}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                                            <Banknote className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-xs font-bold text-white tracking-wider">{formatCurrency(service.price)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{service.duration} min</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="w-full sm:w-auto flex justify-end mt-2 sm:mt-0 relative z-10">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelect(service);
                                    }}
                                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-lg shadow-primary/10 active:scale-95"
                                >
                                    AGENDAR
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Service Details Modal */}
            {selectedService && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-[#111] w-full max-w-sm rounded-xl border border-slate-800 p-6 relative shadow-2xl animate-in zoom-in-95">
                        <button onClick={() => setSelectedService(null)} className="absolute top-4 right-4 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors z-20">
                            <X className="w-4 h-4" />
                        </button>

                        <div className="aspect-square bg-slate-900 rounded-xl mb-6 overflow-hidden flex items-center justify-center border border-white/5 relative group">
                            {selectedService.imageUrl ? (
                                <img src={selectedService.imageUrl} alt={selectedService.name} className="w-full h-full object-cover" />
                            ) : (
                                <Scissors className="w-16 h-16 text-slate-700" />
                            )}
                            <div className="absolute top-3 left-3 flex gap-2">
                                <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-primary" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedService.duration} min</span>
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-white uppercase leading-tight mb-1">{selectedService.name}</h2>
                        <p className="text-primary/80 font-black text-2xl mb-4">{formatCurrency(selectedService.price)}</p>

                        <div className="bg-slate-900/50 p-4 rounded-xl mb-6 border border-white/5 max-h-32 overflow-y-auto custom-scrollbar">
                            <p className="text-slate-400 text-sm leading-relaxed">{selectedService.description || 'Nenhuma descrição detalhada disponível para este serviço.'}</p>
                        </div>

                        <button
                            onClick={() => {
                                onSelect(selectedService);
                                setSelectedService(null);
                            }}
                            className="w-full bg-primary text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                        >
                            Agendar Agora
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
