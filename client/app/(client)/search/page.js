'use client';
import { useState } from 'react';
import { Search as SearchIcon, MapPin, Star, ChevronRight, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

export default function SearchPage() {
    const [term, setTerm] = useState('');
    const [filter, setFilter] = useState('NAME'); // NAME, CITY, NEARBY
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mock integration - to be replaced with real backend call
            const res = await api.get(`/barbershops/search?term=${term}&type=${filter}`);
            setResults(res.data);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans p-6">
            <h1 className="text-xl font-black uppercase tracking-tight mb-6">Buscar</h1>

            <form onSubmit={handleSearch} className="space-y-4 mb-8">
                <div className="bg-slate-900 rounded-2xl p-4 flex items-center gap-3 border border-slate-800 focus-within:border-emerald-500/50 transition">
                    <SearchIcon className="w-5 h-5 text-slate-500" />
                    <input
                        autoFocus
                        value={term}
                        onChange={e => setTerm(e.target.value)}
                        placeholder="Nome do estabelecimento ou cidade..."
                        className="bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm font-medium w-full"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button
                        type="button"
                        onClick={() => setFilter('NAME')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide whitespace-nowrap transition ${filter === 'NAME' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}
                    >
                        Por Nome
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('CITY')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide whitespace-nowrap transition ${filter === 'CITY' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}
                    >
                        Por Cidade
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('NEARBY')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide whitespace-nowrap transition ${filter === 'NEARBY' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}
                    >
                        <MapPin className="w-3 h-3 inline mr-1" /> Próximos
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                {results.map(barbershop => (
                    <div key={barbershop.id} onClick={() => router.push(`/${barbershop.slug}`)} className="bg-slate-900 p-4 rounded-3xl border border-slate-800 hover:border-slate-700 active:scale-98 transition flex items-center gap-4 cursor-pointer">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600">
                            {/* Placeholder for Image */}
                            <Star className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white text-sm">{barbershop.name}</h3>
                            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {barbershop.address}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-yellow-500" />
                            <span className="text-xs font-black">{barbershop.rating}</span>
                        </div>
                    </div>
                ))}

                {loading && <div className="text-center text-slate-500 py-10"><div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"></div></div>}
                {!loading && results.length === 0 && term && (
                    <div className="text-center py-10 opacity-50">
                        <p className="text-sm text-slate-400 font-medium">Nenhum resultado encontrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
