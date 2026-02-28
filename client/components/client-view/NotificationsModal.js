'use client';
import { useState } from 'react';
import { X, Search, Bell } from 'lucide-react';

export default function NotificationsModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('unread'); // unread, read
    const [search, setSearch] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-[#111] border border-white/5 rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Notícias</h2>

                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                        <input
                            type="text"
                            placeholder="Pesquisar"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary transition"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 p-1 bg-[#0A0A0A] rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('unread')}
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'unread' ? 'bg-[#1A1A1A] text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Não lidas
                        </button>
                        <button
                            onClick={() => setActiveTab('read')}
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'read' ? 'bg-[#1A1A1A] text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Lidas
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="py-24 flex flex-col items-center justify-center text-center opacity-50">
                    <div className="w-20 h-20 bg-[#0A0A0A] rounded-full flex items-center justify-center mb-6">
                        <Bell className="w-8 h-8 text-slate-800" />
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
                        Nenhuma notícia encontrada.
                    </p>
                </div>
            </div>
        </div>
    );
}
