'use client';
import { MapPin, Phone, Clock, Wifi, Car, Accessibility, Baby } from 'lucide-react';

export default function DetailsTab({ barbershop }) {
    return (
        <div className="space-y-8 text-slate-300 pb-24">
            {/* Map */}
            <div className="h-48 rounded-3xl bg-slate-800 overflow-hidden relative border border-white/10">
                {/* Placeholder Map Image or actual Embed */}
                <div className="absolute inset-0 flex items-center justify-center bg-[#1e293b]">
                    <MapPin className="w-8 h-8 text-emerald-500 mb-2" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest absolute bottom-4">Ver no Mapa</span>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs border-b border-white/10 pb-2">Sobre</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                    {barbershop.description || 'Nenhuma descrição informada.'}
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs border-b border-white/10 pb-2">Comodidades</h3>
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { icon: Wifi, label: 'Wi-Fi' },
                        { icon: Car, label: 'Estacionamento' },
                        { icon: Accessibility, label: 'Acessível' },
                        { icon: Baby, label: 'Kids' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-[#111] aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/5 text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 transition">
                            <item.icon className="w-6 h-6" />
                            {/* <span className="text-[10px] uppercase font-bold">{item.label}</span> */}
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs border-b border-white/10 pb-2">Horário de Atendimento</h3>
                <div className="space-y-3">
                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day, i) => (
                        <div key={day} className="flex justify-between text-sm">
                            <span className="font-medium text-slate-400">{day}-feira</span>
                            <div className="text-right">
                                <span className="block font-bold text-white">09:00 - 12:00</span>
                                <span className="block font-bold text-white">13:00 - 19:00</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-white font-bold uppercase tracking-widest text-xs border-b border-white/10 pb-2">Contato</h3>
                <div className="flex items-center gap-3 bg-[#111] p-4 rounded-2xl border border-white/5">
                    <Phone className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold text-white text-sm">{barbershop.phone || '(00) 00000-0000'}</span>
                </div>
            </div>
        </div>
    );
}
