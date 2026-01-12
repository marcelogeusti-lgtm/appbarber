'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ChevronLeft, Plus, Trash2 } from 'lucide-react';

export default function CardsPage() {
    const router = useRouter();
    // Start with empty or mock data
    const [cards, setCards] = useState([
        { id: 1, last4: '4242', brand: 'mastercard', expiry: '12/28' }
    ]);

    const handleDelete = (id) => {
        if (confirm('Remover este cartão?')) {
            setCards(cards.filter(c => c.id !== id));
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-6 pb-24">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 bg-slate-900 rounded-full hover:bg-emerald-500/20 transition">
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <h1 className="text-xl font-bold">Meus Cartões</h1>
            </div>

            <div className="space-y-4">
                {/* Add New Card Button */}
                <button className="w-full bg-[#111111] border border-dashed border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition group">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition">
                        <Plus className="w-6 h-6 text-slate-400 group-hover:text-white" />
                    </div>
                    <span className="text-sm font-bold text-slate-400 group-hover:text-emerald-500">Adicionar novo cartão</span>
                </button>

                {/* Card List */}
                {cards.map(card => (
                    <div key={card.id} className="bg-gradient-to-br from-[#1A1A1A] to-black border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-10 h-6 bg-white/20 rounded"></div>
                            <button onClick={() => handleDelete(card.id)} className="text-slate-600 hover:text-red-500 transition">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Número do Cartão</p>
                            <p className="text-xl font-mono text-white tracking-wider">•••• •••• •••• {card.last4}</p>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Validade</p>
                                <p className="text-sm font-mono text-white">{card.expiry}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-white uppercase">{card.brand}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
