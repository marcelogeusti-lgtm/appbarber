'use client';
import { MessageSquare, Zap, Check, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import LEDCardWrapper from './LEDCardWrapper';
import { motion } from 'framer-motion';

export default function WhatsAppHighlight() {
    return (
        <section className="py-32 bg-[#050505] overflow-hidden relative border-y border-white/[0.06]">
            {/* Background elements */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-[#25D366]/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-20 items-center">

                    {/* Phone Mockup Side (LEFT) */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="relative flex justify-center lg:justify-start order-2 lg:order-1"
                    >
                        <LEDCardWrapper className="rounded-[3.5rem] w-full max-w-[340px]">
                            <div className="relative w-full h-[680px] bg-[#0B1014] rounded-[3.5rem] p-3 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-[10px] border-[#1A1A1A] group">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-[#25D366]/20 via-transparent to-primary/20 rounded-[4rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                {/* Inner Screen */}
                                <div className="w-full h-full bg-[#0B141A] rounded-[2.8rem] overflow-hidden relative flex flex-col border border-white/5">

                                    {/* Status Bar Mock */}
                                    <div className="h-10 bg-[#0B141A]/90 backdrop-blur-md flex justify-between items-center px-10 pt-4">
                                        <span className="text-[10px] font-bold text-white/90">14:20</span>
                                        <div className="flex gap-1.5 items-center">
                                            <div className="w-3.5 h-2 bg-white/20 rounded-[1px] relative">
                                                <div className="absolute inset-y-0 left-0 bg-white w-2/3 rounded-[1px]" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Custom Chat Header */}
                                    <div className="bg-[#202C33] p-5 flex items-center justify-between shadow-lg border-b border-white/5 relative z-20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center overflow-hidden border border-white/10 shadow-lg">
                                                <img src="/logos/logo_icon.svg" alt="Logo NEXT" className="w-full h-full object-cover p-2" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1">
                                                    <p className="font-body text-white font-bold text-[13px] tracking-tight">@barbeariaNext</p>
                                                    <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(59,130,246,0.4)]">
                                                        <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
                                                    </div>
                                                </div>
                                                <p className="font-body text-[#25D366] text-[8px] uppercase tracking-[0.2em] font-black">Sincronizado</p>
                                            </div>
                                        </div>
                                        <Zap className="w-5 h-5 text-yellow-400 fill-current animate-pulse" />
                                    </div>

                                    {/* Chat Canvas */}
                                    <div className="flex-1 p-5 space-y-6 overflow-y-auto bg-[#0B141A] relative">
                                        <div className="absolute inset-0 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] opacity-[0.04] grayscale invert pointer-events-none" />

                                        <div className="flex justify-center relative z-10">
                                            <div className="bg-[#182229]/80 backdrop-blur-sm px-4 py-1.5 rounded-xl text-[8px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2 border border-white/5">
                                                <Lock className="w-3 h-3" /> Criptografia Maestro
                                            </div>
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="bg-[#202C33] p-4 rounded-2xl rounded-tl-none shadow-xl max-w-[85%] border border-white/5 flex flex-col relative z-10"
                                        >
                                            <p className="font-body text-[12px] text-slate-200 font-medium">Bom dia! Quero cortar cabelo às 17h.</p>
                                            <span className="text-[9px] text-slate-500 self-end mt-1">10:45</span>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1.2 }}
                                            className="bg-[#005C4B] p-4 rounded-2xl rounded-tr-none shadow-xl max-w-[90%] ml-auto border border-white/10 flex flex-col relative overflow-hidden group/msg z-10"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/msg:translate-x-full transition-transform duration-1000" />
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md">
                                                    <Zap className="w-3 h-3 fill-current" />
                                                </div>
                                                <p className="font-body text-[10px] font-black text-white uppercase tracking-tighter">Reserva Automática ✅</p>
                                            </div>
                                            <p className="font-body text-[12px] text-white font-bold mb-3">Horário das 17:00 confirmado!</p>

                                            <div className="bg-black/20 backdrop-blur-md p-3 rounded-xl border-l-4 border-primary shadow-inner space-y-1 mb-2">
                                                <p className="font-body text-[9px] font-black text-primary uppercase tracking-[0.2em]">Confirmação NEXT</p>
                                                <p className="font-body text-sm font-black text-white leading-tight">Hoje às 17:00</p>
                                                <p className="font-body text-[9px] text-white/60 font-medium">Com Barbeiro Júnior</p>
                                            </div>

                                            <p className="font-body text-[11px] text-white/90">Te enviamos o link para pagamento antecipado. 🚀</p>
                                            <span className="text-[9px] text-white/40 self-end mt-2">10:46</span>
                                        </motion.div>
                                    </div>

                                    {/* Dynamic Input Mock */}
                                    <div className="p-4 bg-[#202C33] border-t border-white/5 flex gap-2">
                                        <div className="flex-1 h-10 bg-[#2A3942] rounded-full border border-white/5 px-4 flex items-center">
                                            <span className="text-slate-500 text-[12px]">Escreva aqui...</span>
                                        </div>
                                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                            <MessageSquare className="w-4.5 h-4.5 fill-current" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </LEDCardWrapper>
                    </motion.div>

                    {/* Text Content Side (RIGHT) */}
                    <div className="max-w-xl order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/[0.04] rounded-full mb-10 border border-white/[0.08] backdrop-blur-md">
                                <MessageSquare className="w-4 h-4 text-[#25D366]" />
                                <span className="font-body text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Automação Nativa</span>
                            </div>

                            <h2 className="font-display text-4xl lg:text-[4.5rem] font-extrabold text-white leading-[1] mb-10 tracking-[-0.05em] text-balance">
                                Onde seu cliente está, <br />
                                <span className="bg-gradient-to-r from-primary via-[#25D366] to-[#25D366] bg-clip-text text-transparent italic">o NEXT também está.</span>
                            </h2>

                            <p className="font-body text-xl text-slate-400 mb-14 leading-relaxed font-medium">
                                Acabe com as interrupções para responder mensagens. O NEXT automatiza seu agendamento via WhatsApp, garantindo zero atrito e agenda lotada.
                            </p>

                            <div className="space-y-6 mb-16">
                                {[
                                    { title: 'Lembretes Anti-Falta', desc: 'Alertas proativos que reduzem o no-show em até 80%.' },
                                    { title: 'Link de Agendamento Elite', desc: 'Seu cliente agenda em segundos, direto do WhatsApp ou Instagram.' },
                                    { title: 'Confirmação via Chatbot', desc: 'O sistema valida a disponibilidade e reserva o horário instantaneamente.' }
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.2 }}
                                        className="flex gap-6 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.05] transition-all duration-500 group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(77,114,228,0.2)] border border-primary/20">
                                            <Zap className="w-6 h-6 fill-current" />
                                        </div>
                                        <div>
                                            <h4 className="font-display font-black text-white text-base uppercase tracking-tight mb-1">{item.title}</h4>
                                            <p className="font-body text-slate-400 text-sm font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <Link href="/register">
                                <button className="px-10 py-5 bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-xl hover:scale-105 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)] flex items-center gap-4 group font-body">
                                    Lotar Minha Agenda Agora <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
