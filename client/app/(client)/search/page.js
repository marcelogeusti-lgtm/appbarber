'use client';
import { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Star, ChevronRight, Filter, LocateFixed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

export default function SearchPage() {
    const [term, setTerm] = useState('');
    const [filter, setFilter] = useState('NAME'); // NAME, CITY, NEARBY
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null); // { lat, lng }
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Load user name for "Welcome" message if desired, or skip
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));

        // Initial fetch or suggestions could go here
    }, []);

    const requestLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(position => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setFilter('NEARBY');
                // Auto-search if nearby selected
                doSearch('', 'NEARBY', position.coords.latitude, position.coords.longitude);
            }, (err) => {
                console.error("Geo Error", err);
                alert("Não foi possível obter sua localização. Verifique as permissões do navegador.");
            });
        } else {
            alert("Geolocalização não suportada neste navegador.");
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        doSearch(term, filter, location?.lat, location?.lng);
    };

    const doSearch = async (searchTerm, searchFilter, lat, lng) => {
        setLoading(true);
        try {
            let query = `/barbershops/search?term=${searchTerm}&type=${searchFilter}`;
            if (lat && lng) query += `&lat=${lat}&lng=${lng}`;

            const res = await api.get(query);
            setResults(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Button Component
    const FilterBtn = ({ type, label, icon: Icon }) => (
        <button
            type="button"
            onClick={() => {
                if (type === 'NEARBY' && !location) {
                    requestLocation();
                } else {
                    setFilter(type);
                    // trigger search immediately if term exists or if it's nearby
                    if (term || type === 'NEARBY') doSearch(term, type, location?.lat, location?.lng);
                }
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all border ${filter === type
                    ? 'bg-white text-slate-950 border-white'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'
                }`}
        >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#0F111A] text-white font-sans p-6 md:p-12 max-w-7xl mx-auto">

            {/* Header / Greeting */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-black mb-1">Seja bem vindo(a)</h1>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="space-y-6 mb-12">
                <div className="bg-[#151821] rounded-2xl p-2 flex items-center border border-white/5 focus-within:border-emerald-500/50 transition-all shadow-lg shadow-black/20">
                    <div className="p-3 text-emerald-500">
                        <SearchIcon className="w-6 h-6" />
                    </div>
                    <input
                        value={term}
                        onChange={e => setTerm(e.target.value)}
                        placeholder="Pesquisar pelo nome..."
                        className="bg-transparent border-none outline-none text-white placeholder-slate-500 text-base font-medium w-full px-2 py-3"
                    />
                    {/* Optional: Add clear button if term exists */}
                </div>

                {/* Filters */}
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    <FilterBtn type="NAME" label="Nome" icon={Filter} />
                    <FilterBtn type="CITY" label="Cidade" icon={MapPin} />
                    <FilterBtn type="NEARBY" label="Próximas" icon={LocateFixed} />
                </div>
            </form>

            {/* Results Section */}
            <div>
                {results.length > 0 && <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Empresas próximas</h2>}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-[#151821] h-24 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {results.length > 0 ? (
                            results.map(shop => (
                                <div
                                    key={shop.id}
                                    onClick={() => router.push(`/${shop.slug}`)}
                                    className="bg-[#151821] p-4 rounded-3xl border border-white/5 hover:border-emerald-500/30 hover:bg-[#1A1D27] transition-all cursor-pointer group flex items-center gap-4"
                                >
                                    {/* Logo / Avatar */}
                                    <div className="w-16 h-16 rounded-full bg-slate-800 flex-shrink-0 relative overflow-hidden flex items-center justify-center border-2 border-slate-700/50 group-hover:border-emerald-500/50 transition">
                                        {shop.logoUrl ? (
                                            <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-bold text-slate-500">{shop.name[0]}</span>
                                        )}

                                        {/* Status Dot */}
                                        <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-[#151821] rounded-full"></div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-white text-base truncate pr-2 group-hover:text-emerald-400 transition">{shop.name}</h3>
                                            <div className="bg-slate-800 rounded-full px-2 py-0.5 flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                <span className="text-[10px] font-bold text-white">5.0</span>
                                            </div>
                                        </div>

                                        <p className="text-slate-500 text-xs truncate mt-1">{shop.address || 'Endereço não informado'}</p>

                                        {shop.distance !== undefined && shop.distance !== null && (
                                            <p className="text-emerald-500 text-[10px] font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {shop.distance} km
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-slate-600 group-hover:text-white transition-transform group-hover:translate-x-1">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Empty State
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-32 h-32 bg-[#151821] rounded-full flex items-center justify-center mb-6 relative">
                                    <SearchIcon className="w-12 h-12 text-slate-600" />
                                    <div className="absolute -bottom-2 -right-2 bg-slate-800 p-2 rounded-full border-4 border-[#0F111A]">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Encontre um estabelecimento</h3>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto">Pesquise pelo nome ou cidade do estabelecimento para começar seu agendamento.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
