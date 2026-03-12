'use client';
import { MessageSquare, Zap, Check, Lock } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function WhatsAppHighlight() {
    return (
        <section className="py-32 bg-white overflow-hidden relative">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-20 items-center">

                    {/* Phone Mockup Side (LEFT) */}
                    <div className="relative flex justify-center lg:justify-start order-2 lg:order-1">
                        {/* Decorative Background Glows */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />

                        {/* High-Quality Phone Frame */}
                        <div className="relative w-[320px] h-[660px] bg-gray-900 rounded-[3.5rem] p-4 shadow-[0_50px_100px_rgba(0,0,0,0.15)] border-[8px] border-gray-800">
                            {/* Inner Screen */}
                            <div className="w-full h-full bg-[#f0f2f5] rounded-[2.5rem] overflow-hidden relative flex flex-col">

                                {/* Status Bar Mock */}
                                <div className="h-10 bg-white/80 backdrop-blur-md flex justify-between items-center px-8 pt-2">
                                    <span className="text-[10px] font-bold text-gray-900">14:20</span>
                                    <div className="flex gap-1.5 items-center">
                                        <div className="w-3 h-2 bg-gray-900 rounded-sm" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                                    </div>
                                </div>

                                {/* Custom Chat Header */}
                                <div className="bg-[#008069] p-4 pt-6 flex items-center justify-between shadow-md">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                            <img src="/logos/logo_icon.png" alt="Logo NEXT" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <p className="text-white font-black text-xs lowercase">@barbeariaNext</p>
                                                <div className="w-3 h-3 bg-blue-400 rounded-full flex items-center justify-center">
                                                    <Check className="w-2 h-2 text-white stroke-[4]" />
                                                </div>
                                            </div>
                                            <p className="text-white/60 text-[8px] uppercase tracking-widest font-black">Sistema de Agendamento</p>
                                        </div>
                                    </div>
                                    <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
                                </div>

                                {/* Chat Canvas */}
                                <div className="flex-1 p-5 space-y-6 overflow-y-auto bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">

                                    <div className="flex justify-center">
                                        <div className="bg-yellow-100/80 backdrop-blur-sm px-3 py-1 rounded-lg text-[8px] font-bold text-yellow-800 uppercase tracking-widest flex items-center gap-2">
                                            <Lock className="w-2.5 h-2.5" /> Criptografia Maestro ponta-a-ponta
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] border border-gray-200 flex flex-col">
                                        <p className="text-[12px] text-gray-800 font-medium">Corte + Barba hoje às 15h?</p>
                                        <span className="text-[9px] text-gray-400 self-end mt-1">10:45</span>
                                    </div>

                                    <div className="bg-[#dcf8c6] p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[90%] ml-auto border border-green-200/50 flex flex-col relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 bg-[#008069] rounded-full flex items-center justify-center text-white">
                                                <Zap className="w-3 h-3 fill-current" />
                                            </div>
                                            <p className="text-[10px] font-black text-[#128c7e] uppercase tracking-tighter">Horário reservado! ✅</p>
                                        </div>
                                        <p className="text-[12px] text-gray-800 font-bold mb-2">Seu agendamento foi confirmado automaticamente.</p>

                                        <div className="bg-gray-50/90 backdrop-blur-sm p-3 rounded-xl border-l-4 border-[#008069] shadow-sm space-y-1 mb-2">
                                            <p className="text-[10px] font-black text-[#008069] uppercase tracking-wider">Confirmação NEXT</p>
                                            <p className="text-[11px] font-bold text-gray-900">Hoje às 15:00</p>
                                            <p className="text-[9px] text-gray-500">Com Profissional Marcelo</p>
                                        </div>

                                        <p className="text-[11px] text-gray-700 leading-tight">Nos vemos em breve! 🚀</p>
                                        <span className="text-[9px] text-gray-400 self-end mt-2">10:46</span>
                                    </div>
                                </div>

                                {/* Dynamic Input Mock */}
                                <div className="p-4 bg-gray-50/90 backdrop-blur-md border-t border-gray-200 flex gap-2">
                                    <div className="flex-1 h-10 bg-white rounded-full border border-gray-200 px-4 flex items-center">
                                        <span className="text-gray-300 text-xs">Escreva aqui...</span>
                                    </div>
                                    <div className="w-10 h-10 bg-[#008069] rounded-full flex items-center justify-center text-white">
                                        <MessageSquare className="w-4 h-4 fill-current" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Content Side (RIGHT) */}
                    <div className="max-w-xl order-1 lg:order-2">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/5 rounded-full mb-8 border border-primary/10">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest text-primary italic">Sincronização Instantânea</span>
                        </div>

                        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                            Onde seu cliente está, <br />
                            <span className="text-primary italic">o NEXT também está.</span>
                        </h2>

                        <p className="text-lg text-gray-500 mb-10 leading-relaxed font-medium">
                            Acabe com as interrupções para responder mensagens. O NEXT automatiza seu agendamento via WhatsApp, garantindo zero atrito e agenda lotada.
                        </p>

                        <div className="space-y-4 mb-12">
                            {[
                                { title: 'Notificações Automáticas', desc: 'Lembretes automáticos para reduzir faltas em até 80%.' },
                                { title: 'Link de Agendamento Pro', desc: 'Seu cliente agenda em segundos, direto do WhatsApp ou Instagram.' },
                                { title: 'Confirmação via Chat', desc: 'O sistema valida a disponibilidade e reserva o horário instantaneamente.' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-5 rounded-2xl border border-gray-200 bg-gray-50 hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-gray-100 group">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <Zap className="w-5 h-5 fill-current" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">{item.title}</h4>
                                        <p className="text-gray-500 text-xs mt-1 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link href="/register">
                            <button className="px-8 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center gap-3">
                                Começar Agora <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
