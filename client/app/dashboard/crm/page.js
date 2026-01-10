'use client';
import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import { Search, User, Send, MessageSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function CRMPage() {
    // Determine the user's view: 'list' (mobile/desktop) or 'chat' (mobile focused/desktop right)
    // For simplicity, standard 2-col layout.

    // Placeholder Data logic - Need to implement backend endpoints
    const [conversations, setConversations] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch conversations on load
    useEffect(() => {
        // fetchConversations(); 
        // Mocking for now as backend endpoint needs to be created in next step
        setLoading(false);
    }, []);

    // When client selected, fetch messages
    useEffect(() => {
        if (selectedClient) {
            // fetchMessages(selectedClient.id);
        }
    }, [selectedClient]);

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden">
            {/* Sidebar List */}
            <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-emerald-500" />
                        CRM / Mensagens
                    </h2>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar conversa..."
                            className="w-full bg-slate-100 text-sm rounded-lg pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Placeholder Empty State */}
                    {conversations.length === 0 && (
                        <div className="p-8 text-center text-slate-400">
                            <p className="text-sm">Nenhuma conversa recente.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-slate-50 flex flex-col">
                {selectedClient ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                                    {selectedClient.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{selectedClient.name}</h3>
                                    <p className="text-xs text-slate-500">
                                        WhatsApp • {selectedClient.phone}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {/* Messages map here */}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-slate-200">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    placeholder="Digite sua mensagem (envia pelo WhatsApp)..."
                                    className="flex-1 bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50"
                                />
                                <button className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl transition-colors">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 text-center">
                                Mensagens enviadas iniciam a janela de 24h do WhatsApp.
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p>Selecione uma conversa para iniciar o atendimento.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
