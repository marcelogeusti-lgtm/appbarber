'use client';
import { MessageSquare, Zap, Smartphone, Check } from 'lucide-react';
import Link from 'next/link'; // Assuming Link is needed for the new button
import { ArrowRight } from 'lucide-react'; // Assuming ArrowRight is needed for the new button

export default function WhatsAppHighlight() {
    return (
        <section className="py-32 bg-gray-50/50 overflow-hidden relative">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-20 items-center">

                    {/* Phone Mockup Side (LEFT) */}
                    <div className="relative flex justify-center lg:justify-start order-2 lg:order-1">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

                        {/* Mockup Container */}
                        <div className="relative w-[300px] h-[600px] bg-white rounded-xl border-[4px] border-gray-900 shadow-2xl overflow-hidden ring-8 ring-gray-100">
                            {/* Status Bar */}
                            <div className="h-6 bg-gray-900 flex justify-center items-end pb-1">
                                <div className="w-16 h-3.5 bg-black rounded-full" />
                            </div>

                            {/* WhatsApp UI Mock */}
                            <div className="h-full bg-[#efeae2]">
                                {/* Chat Header */}
                                <div className="bg-[#075e54] p-4 pt-8 flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gray-200 rounded-full" />
                                    <div>
                                        <p className="text-white font-bold text-xs leading-none">Minha Barbearia</p>
                                        <p className="text-white/70 text-[10px] mt-1">online</p>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="p-4 space-y-4">
                                    <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm max-w-[85%] border border-gray-100">
                                        <p className="text-[11px] text-gray-800">Corte + Barba hoje ├ás 15h?</p>
                                        <p className="text-[9px] text-gray-400 text-right mt-1">10:45</p>
                                    </div>

                                    <div className="bg-[#dcf8c6] p-3 rounded-xl rounded-tr-none shadow-sm max-w-[85%] ml-auto">
                                        <p className="text-[11px] text-gray-800 font-bold">Hor├írio reservado! Ô£à</p>
                                        <p className="text-[11px] text-gray-800">Seu agendamento foi confirmado automaticamente.</p>
                                        <p className="text-[9px] text-gray-400 text-right mt-1">10:46</p>
                                    </div>

                                    <div className="bg-white p-3 rounded-xl border-l-4 border-primary shadow-sm space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-primary uppercase">Confirma├º├úo NEXT</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-gray-900">Hoje ├ás 15:00</p>
                                        <p className="text-[10px] text-gray-500">Com Profissional Marcelo</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Content Side (RIGHT) */}
                    <div className="max-w-xl order-1 lg:order-2">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/5 rounded-full mb-8 border border-primary/10">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-widest text-primary italic">Sincroniza├º├úo Instant├ónea</span>
                        </div>

                        <h2 className="text-4xl lg:text-6xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tighter">
                            Onde seu cliente est├í, <br />
                            <span className="text-primary italic">o NEXT tamb├®m est├í.</span>
                        </h2>

                        <p className="text-lg text-gray-500 mb-10 leading-relaxed font-medium">
                            Acabe com as interrup├º├Áes para responder mensagens. O NEXT automatiza seu agendamento via WhatsApp, garantindo zero atrito e agenda lotada.
                        </p>

                        <div className="space-y-6 mb-12">
                            {[
                                { title: 'Notifica├º├Áes Autom├íticas', desc: 'Lembretes autom├íticos para reduzir faltas em at├® 80%.' },
                                { title: 'Link de Agendamento Pro', desc: 'Seu cliente agenda em segundos, direto do WhatsApp ou Instagram.' },
                                { title: 'Confirma├º├úo via Chat', desc: 'O sistema valida a disponibilidade e reserva o hor├írio instantaneamente.' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-primary/20 transition-all hover:shadow-sm group">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <Zap className="w-5 h-5 fill-current" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight italic">{item.title}</h4>
                                        <p className="text-gray-500 text-xs mt-1 font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link href="/register">
                            <button className="px-10 py-5 bg-gray-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-black transition-all shadow-xl flex items-center gap-3 italic">
                                Come├ºar Agora <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>

                </div>
            </div>
        </section>
    );
}
