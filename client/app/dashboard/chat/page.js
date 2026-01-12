'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
    Send, Search, MoreVertical, Phone, Video,
    MapPin, Clock, ArrowLeft, Paperclip, Smile
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ChatPage() {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Responsive State
    const [showMobileList, setShowMobileList] = useState(true);

    const messagesEndRef = useRef(null);

    // 1. Fetch Conversations
    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/chat/conversations', {
                headers: { Authorization: `Bearer ${session?.accessToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchConversations();
        // Poll for list updates every 30s
        const interval = setInterval(() => {
            if (session) fetchConversations();
        }, 30000);
        return () => clearInterval(interval);
    }, [session]);

    // 2. Fetch Messages when Active
    useEffect(() => {
        if (!activeConversation) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/chat/conversations/${activeConversation.id}/messages`, {
                    headers: { Authorization: `Bearer ${session?.accessToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                    scrollToBottom();
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
        // Poll faster for active chat (e.g., 5s)
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [activeConversation, session]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 3. Send Message
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        setSending(true);
        try {
            const content = newMessage;
            setNewMessage(''); // Optimistic clear

            const res = await fetch(`/api/chat/conversations/${activeConversation.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({
                    content,
                    channel: 'APP' // Default, backend handles fallback or provider logic
                })
            });

            if (res.ok) {
                const savedMsg = await res.json();
                setMessages(prev => [...prev, savedMsg]);
                scrollToBottom();
                fetchConversations(); // Update last message in list
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Restore text if failed?
        } finally {
            setSending(false);
        }
    };

    const handleSelectConversation = (conv) => {
        setActiveConversation(conv);
        setShowMobileList(false); // On mobile, go to chat
    };

    // Helpers
    const getOtherParty = (conv) => {
        // Logic assumes User is viewing. If User is Barber(Owner), other is Client.
        // If User is Client, other is Barbershop (or Barber rep).
        // For now, let's treat the 'client' relation as the customer.
        // If current user === conv.clientId, then other is Barber/Shop.
        // But the backend `getConversations` should ideally format this or we deduce.

        // Simplification: Display Client Name always if I am Barber.
        // Display Shop Name if I am Client.

        // We need to know 'my' role.
        // Assuming Dashboard access implies Staff/Barber/Owner for now usually.
        // If session.user.role === 'CLIENT', show Shop.

        if (session?.user?.role === 'CLIENT') {
            return {
                name: conv.barbershop?.name || 'Barbearia',
                avatar: conv.barbershop?.logoUrl,
                subtitle: 'Barbearia'
            };
        } else {
            return {
                name: conv.client?.name || 'Cliente',
                avatar: conv.client?.avatarUrl,
                subtitle: conv.appointment ? `Agendamento: ${format(new Date(conv.appointment.date), 'dd/MM HH:mm')}` : 'Sem agendamento ativo'
            };
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] max-w-7xl mx-auto flex bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">

            {/* Sidebar / Conversation List */}
            <div className={`w-full md:w-80 bg-gray-900 border-r border-gray-800 flex flex-col ${!showMobileList ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="font-bold text-lg">Conversas</h2>
                    <button className="p-2 hover:bg-gray-800 rounded-full text-gray-400">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar conversa..."
                            className="w-full bg-gray-800 border-none rounded-lg pl-9 pr-4 py-2 text-sm text-gray-300 focus:ring-1 focus:ring-brand-primary"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500 text-sm">Carregando...</div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 text-sm px-4">
                            Nenhuma conversa iniciada. As conversas aparecem automaticamente quando há agendamentos.
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const other = getOtherParty(conv);
                            const active = activeConversation?.id === conv.id;
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-gray-800/50 ${active ? 'bg-gray-800 border-r-2 border-brand-primary' : ''}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                                        {other.avatar ? (
                                            <img src={other.avatar} alt={other.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{other.name?.charAt(0)}</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-medium text-sm text-white truncate">{other.name}</h3>
                                            <span className="text-[10px] text-gray-500">{conv.lastMessageAt ? format(new Date(conv.lastMessageAt), 'HH:mm') : ''}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 truncate">
                                            {/* Last message preview if available, backend usually sends this or we sort messages */}
                                            {/* For now keeping generic or specific if added to backend list DTO */}
                                            Clique para ver a conversa
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col bg-gray-950 ${showMobileList ? 'hidden md:flex' : 'flex'}`}>

                {/* Chat Header */}
                {activeConversation ? (
                    <>
                        <div className="p-3 border-b border-gray-800 flex items-center justify-between bg-gray-900/80 backdrop-blur-sm z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowMobileList(true)} className="md:hidden p-2 hover:bg-gray-800 rounded-full text-gray-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>

                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                    {getOtherParty(activeConversation).avatar ? (
                                        <img src={getOtherParty(activeConversation).avatar} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold">{getOtherParty(activeConversation).name.charAt(0)}</div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{getOtherParty(activeConversation).name}</h3>
                                    <p className="text-xs text-brand-primary flex items-center gap-1">
                                        {activeConversation.appointment && (
                                            <>
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(activeConversation.appointment.date), "d 'de' MMM, HH:mm", { locale: ptBR })}
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-gray-800 rounded-full text-gray-400">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="p-2 hover:bg-gray-800 rounded-full text-gray-400">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-900/20 to-gray-900/50">
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === session.user.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm relative group ${isMe
                                                ? 'bg-brand-primary text-white rounded-tr-sm'
                                                : 'bg-gray-800 text-gray-200 rounded-tl-sm'
                                            }`}>
                                            <p>{msg.content}</p>
                                            <span className={`text-[10px] block text-right mt-1 opacity-70 ${isMe ? 'text-white' : 'text-gray-400'}`}>
                                                {format(new Date(msg.createdAt), 'HH:mm')}
                                                {isMe && <span className="ml-1">✓</span>}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-gray-900 border-t border-gray-800">
                            <form onSubmit={handleSend} className="flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2 border border-gray-700 focus-within:border-brand-primary/50 transition-colors">
                                <button type="button" className="text-gray-400 hover:text-white transition-colors">
                                    <Smile className="w-5 h-5" />
                                </button>
                                <button type="button" className="text-gray-400 hover:text-white transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Digite uma mensagem..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="bg-brand-primary p-2 rounded-full text-white hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-300">Suas Conversas</h3>
                        <p className="text-sm">Selecione uma conversa para começar a enviar mensagens.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
