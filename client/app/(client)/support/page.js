'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ChevronLeft, Send, Loader2 } from 'lucide-react';
import api from '../../../lib/clientApi';

export default function SupportPage() {
    const router = useRouter();
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        // Simulate API call
        setTimeout(() => {
            setSending(false);
            setSent(true);
            setFormData({ subject: '', message: '' });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 bg-slate-900 rounded-full hover:bg-primary/20 transition">
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-xl font-bold">Ouvidoria</h1>
            </div>

            {sent ? (
                <div className="bg-primary/10 border border-primary/20 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                        <Send className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-black text-white mb-2">Mensagem Enviada!</h2>
                    <p className="text-slate-400 text-sm mb-6">Agradecemos seu contato. Responderemos em breve.</p>
                    <button
                        onClick={() => setSent(false)}
                        className="text-primary font-bold uppercase tracking-widest text-xs hover:text-primary/80 transition"
                    >
                        Enviar nova mensagem
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <p className="text-slate-500 text-sm">Tem alguma dúvida, sugestão ou reclamação? Envie uma mensagem para nossa equipe.</p>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Assunto</label>
                        <input
                            type="text"
                            required
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full bg-[#111111] border border-slate-800 rounded-xl py-4 px-4 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                            placeholder="Ex: Problema com agendamento"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Mensagem</label>
                        <textarea
                            required
                            rows={6}
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                            className="w-full bg-[#111111] border border-slate-800 rounded-xl py-4 px-4 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
                            placeholder="Descreva sua solicitação com detalhes..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={sending}
                        className="w-full bg-primary/90 hover:bg-primary text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest shadow-lg shadow-primary/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><MessageSquare className="w-5 h-5" /> Enviar Mensagem</>}
                    </button>
                </form>
            )}
        </div>
    );
}
