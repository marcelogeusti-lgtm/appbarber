'use client';
import { MessageSquare, Zap, Check, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import LEDCardWrapper from './LEDCardWrapper';

export default function WhatsAppHighlight() {
    return (
        <section className="py-32 bg-[#050505] overflow-hidden relative border-y border-white/5">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-20 items-center">

                    {/* Phone Mockup Side (LEFT) */}
                    <div className="relative flex justify-center lg:justify-start order-2 lg:order-1">
                        {/* Decorative Background Glows */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />

                        {/* High-Quality Phone Frame */}
                        <LEDCardWrapper className="rounded-[4rem] w-full max-w-[340px]">
                            <div className="relative w-full h-[700px] bg-black rounded-[4rem] p-3 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-[12px] border-[#1A1A1A] group">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-primary/20 via-transparent to-blue-500/20 rounded-[4.5rem] blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                
                                {/* Inner Screen */}
                                <div className="w-full h-full bg-[#0B141A] rounded-[3.2rem] overflow-hidden relative flex flex-col border border-white/5">

                                    {/* Status Bar Mock */}
                                    <div className="h-12 bg-[#0B141A]/90 backdrop-blur-md flex justify-between items-center px-10 pt-4">
                                        <span className="text-[11px] font-black text-white/90">14:20</span>
                                        <div className="flex gap-2 items-center">
                                            <div className="w-4 h-2.5 bg-white/20 rounded-[2px] relative">
                                                <div className="absolute inset-y-0 left-0 bg-white w-2/3 rounded-[1px]" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Custom Chat Header */}
                                    <div className="bg-[#202C33] p-5 flex items-center justify-between shadow-2xl border-b border-white/5 relative z-20">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 bg-white/5 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-lg">
                                                <img src="/logos/logo_icon.svg" alt="Logo NEXT" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-white font-black text-[13px] lowercase tracking-tight">@barbeariaNext</p>
                                                    <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                                        <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
                                                    </div>
                                                </div>
                                                <p className="text-primary text-[9px] uppercase tracking-[0.2em] font-black">Online agora</p>
                                            </div>
                                        </div>
                                        <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
                                    </div>

                                    {/* Chat Canvas */}
                                    <div className="flex-1 p-6 space-y-8 overflow-y-auto bg-[#0B141A] relative">
                                        <div className="absolute inset-0 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] opacity-[0.03] grayscale invert pointer-events-none" />

                                        <div className="flex justify-center relative z-10">
                                            <div className="bg-[#182229]/80 backdrop-blur-sm px-4 py-1.5 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-3 border border-white/5">
                                                <Lock className="w-3 h-3" /> Criptografia Maestro
                                            </div>
                                        </div>

                                        <div className="bg-[#202C33] p-5 rounded-2xl rounded-tl-none shadow-2xl max-w-[85%] border border-white/5 flex flex-col relative z-10">
                                            <p className="text-[13px] text-slate-200 font-medium leading-relaxed">Corte + Barba hoje às 15h?</p>
                                            <span className="text-[10px] text-slate-500 self-end mt-2">10:45</span>
                                        </div>

                                        <div className="bg-[#005C4B] p-5 rounded-2xl rounded-tr-none shadow-2xl max-w-[90%] ml-auto border border-white/10 flex flex-col relative overflow-hidden group/msg z-10">
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/msg:translate-x-full transition-transform duration-1000" />
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md">
                                                    <Zap className="w-3.5 h-3.5 fill-current" />
                                                </div>
                                                <p className="text-[11px] font-black text-white uppercase tracking-tighter">Horário reservado! ✅</p>
                                            </div>
                                            <p className="text-[13px] text-white font-bold mb-3 leading-relaxed">Seu agendamento foi confirmado automaticamente.</p>

                                            <div className="bg-black/20 backdrop-blur-md p-4 rounded-2xl border-l-4 border-primary shadow-inner space-y-1.5 mb-3">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Confirmação NEXT</p>
                                                <p className="text-sm font-black text-white">Hoje às 15:00</p>
                                                <p className="text-[10px] text-white/60 font-medium">Com Profissional Marcelo</p>
                                            </div>

                                            <p className="text-[12px] text-white/90 leading-tight">Nos vemos em breve! 🚀</p>
                                            <span className="text-[10px] text-white/40 self-end mt-3">10:46</span>
                                        </div>
                                    </div>

                                    {/* Dynamic Input Mock */}
                                    <div className="p-6 bg-[#202C33] backdrop-blur-xl border-t border-white/5 flex gap-3">
                                        <div className="flex-1 h-12 bg-[#2A3942] rounded-full border border-white/5 px-6 flex items-center">
                                            <span className="text-slate-500 text-sm">Escreva aqui...</span>
                                        </div>
                                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                            <MessageSquare className="w-5 h-5 fill-current" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </LEDCardWrapper>
                    </div>

                    {/* Text Content Side (RIGHT) */}
                    <div className="max-w-xl order-1 lg:order-2">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full mb-10 border border-white/10 backdrop-blur-md">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 italic">Sincronização Maestro</span>
                        </div>

                        <h2 className="text-4xl lg:text-6xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
                            Onde seu cliente está, <br />
                            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent italic">o NEXT também está.</span>
                        </h2>

                        <p className="text-xl text-slate-400 mb-12 leading-relaxed font-medium">
                            Acabe com as interrupções para responder mensagens. O NEXT automatiza seu agendamento via WhatsApp, garantindo zero atrito e agenda lotada.
                        </p>

                        <div className="space-y-6 mb-16">
                            {[
                                { title: 'Notificações Inteligentes', desc: 'Lembretes proativos para reduzir faltas em até 80%.' },
                                { title: 'Link de Agendamento Elite', desc: 'Seu cliente agenda em segundos, direto do WhatsApp ou Instagram.' },
                                { title: 'Confirmação via Chatbot', desc: 'O sistema valida a disponibilidade e reserva o horário instantaneamente.' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6 p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.05] transition-all duration-500 group">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(77,114,228,0.2)] border border-primary/20">
                                        <Zap className="w-6 h-6 fill-current" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white text-base uppercase tracking-tight mb-1">{item.title}</h4>
                                        <p className="text-slate-400 text-sm font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link href="/register">
                            <button className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-105 transition-all shadow-2xl flex items-center gap-4">
                                Começar Agora <ArrowRight className="w-4 h-4 text-black" />
                            </button>
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
