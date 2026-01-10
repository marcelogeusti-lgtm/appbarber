'use client';
import { useState, useEffect, useRef } from 'react';
import api from '../../../lib/api';
import { useSocket } from '../../../contexts/SocketContext';
import { Search, Send, MessageSquare, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CRMPage() {
    const socket = useSocket();
    const [conversations, setConversations] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Initial Load
    useEffect(() => {
        fetchConversations();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Socket Listener
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (msg) => {
            console.log('Received message:', msg);

            // 1. Update conversations list (move to top or add)
            setConversations(prev => {
                const existingIndex = prev.findIndex(c => c.phone && msg.from.includes(c.phone)); // msg.from has @s.whatsapp.net usually
                const newConv = {
                    id: existingIndex >= 0 ? prev[existingIndex].id : 'temp-' + Date.now(),
                    name: msg.name,
                    phone: msg.from.split('@')[0],
                    lastMessage: msg.text,
                    lastMessageDate: msg.timestamp,
                    unread: 1 // TODO: Logic for unread
                };

                const others = prev.filter((_, idx) => idx !== existingIndex);
                return [newConv, ...others];
            });

            // 2. If chat is open, append
            if (selectedClient) {
                // Check if msg is from this client
                if (msg.from.includes(selectedClient.phone)) {
                    setMessages(prev => [...prev, {
                        id: msg.id,
                        direction: 'INBOUND',
                        content: msg.text,
                        createdAt: msg.timestamp,
                        status: 'RECEIVED'
                    }]);
                }
            }
        };

        socket.on('whatsapp_message', handleNewMessage);

        return () => {
            socket.off('whatsapp_message', handleNewMessage);
        };
    }, [socket, selectedClient]);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/communication/conversations');
            setConversations(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching conversations', err);
            setLoading(false);
        }
    };

    const handleSelectClient = async (client) => {
        setSelectedClient(client);
        try {
            const res = await api.get(`/communication/messages/${client.id}`);
            setMessages(res.data);
        } catch (err) {
            console.error('Error fetching messages', err);
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || !selectedClient) return;

        const tempMsg = {
            id: 'temp-' + Date.now(),
            direction: 'OUTBOUND',
            content: inputText,
            createdAt: new Date(),
            status: 'SENDING'
        };

        // Optimistic UI
        setMessages(prev => [...prev, tempMsg]);
        setInputText('');

        try {
            await api.post('/communication/send', {
                clientId: selectedClient.id,
                content: tempMsg.content
            });
            // Update status to SENT? Usually we just re-fetch or wait for socket loopback if we implemented outgoing socket events (not yet)
            // For now, assume success
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...m, status: 'SENT' } : m));
        } catch (err) {
            console.error('Error sending message', err);
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...m, status: 'FAILED' } : m));
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50">
            {/* Sidebar List */}
            <div className={`w-full md:w-96 bg-white border-r border-slate-200 flex flex-col ${selectedClient ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-slate-100 bg-white">
                    <h2 className="font-bold text-slate-800 text-xl tracking-tight mb-6 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-emerald-500 fill-emerald-500/20" />
                        Mensagens
                    </h2>
                    <div className="relative group">
                        <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar conversa..."
                            className="w-full bg-slate-50 text-sm font-medium rounded-2xl pl-10 pr-4 py-3 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400 animate-pulse text-xs font-bold uppercase tracking-wider">Carregando conversas...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-4">
                            <MessageSquare className="w-12 h-12 opacity-10" />
                            <p className="text-sm font-medium">Nenhuma conversa recente.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {conversations.map(conv => (
                                <div
                                    key={conv.id}
                                    onClick={() => handleSelectClient(conv)}
                                    className={`p-5 cursor-pointer hover:bg-slate-50 transition-all flex items-center gap-4 group ${selectedClient?.id === conv.id ? 'bg-emerald-50 border-l-4 border-emerald-500 pl-4' : 'pl-5 border-l-4 border-transparent'}`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg overflow-hidden shadow-sm">
                                            {conv.avatar ? (
                                                <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                                            ) : (
                                                conv.name?.[0] || '?'
                                            )}
                                        </div>
                                        {/* Status Indicator (Optional) */}
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={`font-bold text-sm truncate ${selectedClient?.id === conv.id ? 'text-emerald-900' : 'text-slate-700'}`}>{conv.name || conv.phone}</h3>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ">
                                                {conv.lastMessageDate && format(new Date(conv.lastMessageDate), 'HH:mm')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate font-medium group-hover:text-slate-600">
                                            {conv.lastMessage || 'Nova conversa'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-[#e5ddd5]/30 ${!selectedClient ? 'hidden md:flex' : 'flex'}`}>
                {selectedClient ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-4">
                                <button
                                    className="md:hidden p-2 -ml-2 text-slate-600"
                                    onClick={() => setSelectedClient(null)}
                                >
                                    ←
                                </button>
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                                    {selectedClient.avatar ? (
                                        <img src={selectedClient.avatar} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                                            {selectedClient.name[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 leading-tight">{selectedClient.name}</h3>
                                    <p className="text-xs text-emerald-600 font-medium">WhatsApp Conectado</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 bg-repeat" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: 'overlay', backgroundColor: 'rgba(229, 221, 213, 0.9)' }}>
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] md:max-w-[65%] rounded-2xl px-4 py-2 shadow-sm relative text-sm ${msg.direction === 'OUTBOUND'
                                                ? 'bg-[#d9fdd3] text-slate-800 rounded-tr-none'
                                                : 'bg-white text-slate-800 rounded-tl-none'
                                            }`}
                                    >
                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
                                            <span className="text-[10px] font-bold">
                                                {format(new Date(msg.createdAt), 'HH:mm')}
                                            </span>
                                            {msg.direction === 'OUTBOUND' && (
                                                msg.status === 'SENT' ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-[#f0f2f5] border-t border-slate-300">
                            <div className="flex items-center gap-3 max-w-4xl mx-auto">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Digite uma mensagem"
                                    className="flex-1 bg-white rounded-2xl px-6 py-4 outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm text-slate-700 placeholder:text-slate-400"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputText.trim()}
                                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-full shadow-lg transition-all active:scale-95"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-[#f0f2f5]">
                        <div className="bg-white p-12 rounded-full shadow-sm mb-6">
                            <MessageSquare className="w-16 h-16 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-600 mb-2">CRM WhatsApp</h3>
                        <p className="max-w-xs text-center text-slate-500 text-sm">Selecione uma conversa para visualizar o histórico e enviar mensagens.</p>
                        <div className="mt-8 border-t border-slate-300 w-24"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
