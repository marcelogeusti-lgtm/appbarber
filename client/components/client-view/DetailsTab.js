'use client';
import { MapPin, Phone, Clock, Wifi, Car, Accessibility, Baby } from 'lucide-react';

export default function DetailsTab({ barbershop }) {
    return (
        <div className="space-y-8 text-slate-300 pb-24">
            {/* Map */}
            <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(barbershop.address + ', ' + barbershop.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-48 rounded-3xl bg-slate-800 overflow-hidden relative border border-white/10 hover:border-emerald-500/50 transition-all group"
            >
                {/* Background Pattern / Static Map Placeholder */}
                <div className="absolute inset-0 bg-[#1e293b] flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    <div className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform">
                        <MapPin className="w-10 h-10 text-emerald-500" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{barbershop.city || 'Ver no Mapa'}</span>
                    </div>
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Endereço</p>
                        <p className="text-xs text-white truncate font-medium">{barbershop.address || 'Endereço não informado'}</p>
                    </div>
                </div>
            </a>

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
