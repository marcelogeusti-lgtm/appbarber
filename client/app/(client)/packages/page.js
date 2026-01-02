'use client';
import { useState, useEffect } from 'react';
import { Package, Check, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import api from '../../../lib/api';

export default function PackagesPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Placeholder: Fetch plans from API
        // For now, we might not have a public 'plans' endpoint that is global, 
        // usually plans are per barbershop. 
        // But for a "Client App", maybe we show plans from their favorite shop?
        // Or we show a generic "Explore Plans" if no context.
        // For MVP, let's assume we show "No plans available" or mock data until backend is ready.
        // Actually, better to fetch from the "last visited" shop if possible, similar to booking.
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            // Attempt to get plans from user's context or last shop
            // Since we don't have a direct "Global Plans" endpoint, we'll verify if we can get it via appointments
            const res = await api.get('/appointments/me');
            const appointments = res.data || [];

            if (appointments.length > 0) {
                // Get plans from the last barbershop?
                // Currently we don't have a specific endpoint for "plans of barbershop X" that is public/client-accessible 
                // without context. 
                // We will leave this as a placeholder UI for now.
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f1a] text-white font-sans pb-24">
            <header className="p-6 sticky top-0 bg-[#0a0f1a]/80 backdrop-blur-md z-10 flex items-center gap-4">
                <Link href="/home" className="p-2 bg-slate-900 rounded-xl hover:bg-slate-800 transition">
                    <ArrowLeft className="w-5 h-5 text-slate-400" />
                </Link>
                <h1 className="text-lg font-black uppercase tracking-wider">Meus Pacotes</h1>
            </header>

            <div className="px-6 space-y-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] p-8 shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="relative z-10 text-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Package className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Clube de Vantagens</h2>
                        <p className="text-blue-100 text-sm font-medium mb-8">Assine e economize até 40% nos seus cortes mensais.</p>

                        <button className="bg-white text-blue-600 w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition shadow-lg">
                            Ver Planos Disponíveis
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Suas Assinaturas Ativas</h3>
                    {/* Empty State */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center dashed">
                        <p className="text-slate-500 text-sm font-medium">Você ainda não possui assinaturas ativas.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
