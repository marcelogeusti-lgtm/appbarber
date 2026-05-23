'use client';
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader2, ExternalLink, HelpCircle } from 'lucide-react';
import api from '../lib/api';

export default function SupportChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Olá! Sou o assistente inteligente do AppBarber. Como posso te ajudar hoje?', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return;

        const userMsg = { id: Date.now(), type: 'user', text: inputValue, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Simular um atraso "humano" de interpretação
            const startTime = Date.now();

            const response = await api.post('/support/chat', { message: userMsg.text });

            // Garantir que o "digitando" apareça por pelo menos 1.5s para parecer natural
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(1500 - elapsed, 0);

            setTimeout(() => {
                const botMsg = {
                    id: Date.now() + 1,
                    type: 'bot',
                    text: response.data.response,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMsg]);
                setIsTyping(false);
            }, remaining);

        } catch (error) {
            console.error('Chat Error:', error);
            setIsTyping(false);
            const errorMsg = {
                id: Date.now() + 1,
                type: 'bot',
                text: 'Ops! Tive um problema de conexão. Pode tentar novamente?',
                isError: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100] group"
                >
                    <MessageCircle className="w-6 h-6" />
                    <span className="absolute right-full mr-4 bg-card border border-border px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                        Suporte Inteligente
                    </span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[380px] max-w-[90vw] h-[550px] max-h-[80vh] bg-card/80 backdrop-blur-xl border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300 z-[101]">
                    {/* Header */}
                    <div className="p-4 bg-primary flex items-center justify-between text-white shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider leading-none">Assistente Virtual</h3>
                                <p className="text-[10px] opacity-70 mt-1 uppercase tracking-widest font-bold">Online agora</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-card/30">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-top-1`}>
                                <div className={`max-w-[85%] p-4 rounded-xl text-sm shadow-sm ${msg.type === 'user'
                                        ? 'bg-primary text-white rounded-tr-none'
                                        : 'bg-muted border border-border text-foreground rounded-tl-none'
                                    }`}>
                                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                                    <p className={`text-[9px] mt-2 opacity-50 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                                        {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(msg.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-muted border border-border p-4 rounded-xl rounded-tl-none flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Analisando...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Fallback CTA */}
                    <div className="px-4 py-2 bg-muted/50 border-t border-border flex items-center justify-between gap-2">
                        <span className="text-[10px] text-muted-foreground font-medium">Ainda sem resposta?</span>
                        <a
                            href="https://wa.me/seu-numero-suporte"
                            target="_blank"
                            className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-wider hover:underline"
                        >
                            Falar com Humano <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-card border-t border-border">
                        <div className="relative group">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Digite sua dúvida..."
                                rows={1}
                                className="w-full bg-muted border border-border rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-primary/50 transition-all resize-none max-h-32"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isTyping}
                                className={`absolute right-2 bottom-2 p-2 rounded-xl transition-all ${inputValue.trim() && !isTyping
                                        ? 'bg-primary text-white scale-100 hover:scale-105 active:scale-95'
                                        : 'bg-muted text-muted-foreground scale-90'
                                    }`}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
