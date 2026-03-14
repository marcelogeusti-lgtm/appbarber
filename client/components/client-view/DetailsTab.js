'use client';
import { MapPin, Phone, Clock, Wifi, Car, Accessibility, Baby, Instagram, Facebook, Youtube } from 'lucide-react';

export default function DetailsTab({ barbershop }) {
    return (
        <div className="space-y-8 text-slate-300 pb-24">
            {/* Address & Map Block */}
            <div className="bg-[#111] rounded-3xl border border-white/5 overflow-hidden flex flex-col sm:flex-row shadow-2xl">
                {/* Text Section */}
                <div className="p-6 flex-1 flex flex-col justify-center bg-gradient-to-br from-[#151a23] to-[#0c0f14]">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Endereço
                    </p>
                    <h3 className="text-[15px] font-bold text-white mb-1 leading-snug">
                        {barbershop.address || 'Localização não informada'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                        {barbershop.city || 'Atendimento Local'}
                    </p>
                </div>

                {/* Map Button Section */}
                <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((barbershop.address || '') + ', ' + (barbershop.city || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative bg-slate-900 sm:w-48 overflow-hidden flex flex-col items-center justify-center p-6 border-t sm:border-t-0 sm:border-l border-white/5 hover:bg-slate-800 transition-colors group"
                >
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                    <div className="relative z-10 flex flex-col items-center gap-2 group-hover:scale-110 transition-transform duration-300">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                            <MapPin className="w-6 h-6 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest text-center shadow-black drop-shadow-md">
                            Abrir no Mapa
                        </span>
                    </div>
                </a>
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
                <h3 className="text-white font-bold uppercase tracking-widest text-xs border-b border-white/10 pb-2">Contato & Redes Sociais</h3>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 bg-[#111] p-4 rounded-2xl border border-white/5">
                        <Phone className="w-5 h-5 text-emerald-500" />
                        <span className="font-bold text-white text-sm">{barbershop.phone || '(00) 00000-0000'}</span>
                    </div>
                    
                    {(barbershop.instagramUrl || barbershop.facebookUrl || barbershop.youtubeUrl) && (
                        <div className="flex gap-3">
                            {barbershop.instagramUrl && (
                                <a 
                                    href={barbershop.instagramUrl.startsWith('http') ? barbershop.instagramUrl : `https://instagram.com/${barbershop.instagramUrl.replace('@', '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#111] p-4 rounded-2xl border border-white/5 hover:border-pink-500/30 hover:text-pink-500 transition group"
                                >
                                    <Instagram className="w-5 h-5 group-hover:scale-110 transition" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Instagram</span>
                                </a>
                            )}
                            {barbershop.facebookUrl && (
                                <a 
                                    href={barbershop.facebookUrl.startsWith('http') ? barbershop.facebookUrl : `https://facebook.com/${barbershop.facebookUrl}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#111] p-4 rounded-2xl border border-white/5 hover:border-blue-500/30 hover:text-blue-500 transition group"
                                >
                                    <Facebook className="w-5 h-5 group-hover:scale-110 transition" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
                                </a>
                            )}
                            {barbershop.youtubeUrl && (
                                <a 
                                    href={barbershop.youtubeUrl.startsWith('http') ? barbershop.youtubeUrl : `https://youtube.com/${barbershop.youtubeUrl}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#111] p-4 rounded-2xl border border-white/5 hover:border-red-500/30 hover:text-red-500 transition group"
                                >
                                    <Youtube className="w-5 h-5 group-hover:scale-110 transition" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">YouTube</span>
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
