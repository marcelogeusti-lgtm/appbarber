'use client';
import { useState, useEffect } from 'react';
import { Search as SearchIcon, MapPin, Star, ChevronRight, Filter, LocateFixed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/clientApi';

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
    }, []);

    // Live Search with Debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            doSearch(term, filter, location?.lat, location?.lng);
        }, 500); // 500ms delay after user stops typing

        return () => {
            clearTimeout(handler);
        };
    }, [term, filter, location]);

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
        <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] via-[#050505] to-black text-white px-5 pt-6 pb-24 font-sans no-scrollbar">

            {/* Header / Greeting */}
            <header className="flex items-center justify-between mb-8 px-1">
                <div>
                    <h1 className="text-xl font-black text-white uppercase italic tracking-tight">Buscar</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                </div>
                <button 
                    onClick={() => router.push('/home')}
                    className="w-10 h-10 rounded-xl glass-premium flex items-center justify-center text-slate-400 active:scale-95 transition-all"
                >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
            </header>

            {/* Search Bar & Filters */}
            <div className="space-y-6 mb-12 px-1">
                <div className="glass-premium rounded-[1.5rem] p-1 flex items-center shadow-lg border-white/5 focus-within:border-primary/30 transition-all">
                    <div className="p-3 text-primary">
                        <SearchIcon className="w-6 h-6" />
                    </div>
                    <input
                        value={term}
                        onChange={e => setTerm(e.target.value)}
                        placeholder="Pesquisar pelo nome..."
                        className="bg-transparent border-none outline-none text-white placeholder-slate-600 text-sm font-medium w-full px-2 py-3"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
                    <FilterBtn type="NAME" label="Nome" icon={Filter} />
                    <FilterBtn type="CITY" label="Cidade" icon={MapPin} />
                    <FilterBtn type="NEARBY" label="Próximas" icon={LocateFixed} />
                </div>
            </div>

            {/* Results Section */}
            <div className="px-1">
                {results.length > 0 && <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Resultados encontrados</h2>}

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass-premium h-24 rounded-[2rem] animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {results.length > 0 ? (
                            results.map(shop => (
                                <div
                                    key={shop.id || shop._id}
                                    onClick={() => router.push(`/${shop.slug}`)}
                                    className="glass-premium p-4 rounded-[2rem] border-white/5 hover:border-primary/20 transition-all cursor-pointer group flex items-center gap-4 active:scale-[0.98]"
                                >
                                    {/* Logo / Avatar */}
                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex-shrink-0 relative overflow-hidden flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition">
                                        {shop.logoUrl ? (
                                            <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-lg font-black text-slate-500 uppercase">{shop.name[0]}</span>
                                        )}

                                        {/* Status Dot */}
                                        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-primary border-2 border-[#0A0A0B] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-black text-white text-base truncate pr-2 group-hover:text-primary transition uppercase tracking-tight">{shop.name}</h3>
                                            <div className="flex items-center gap-1 glass-premium px-2 py-1 rounded-xl">
                                                <Star className="w-2.5 h-2.5 text-primary fill-current" />
                                                <span className="text-[10px] font-black text-white">
                                                    {shop.averageRating ? shop.averageRating : '5.0'}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest truncate mt-1">{shop.address || 'Endereço disponível'}</p>

                                        {shop.distance !== undefined && shop.distance !== null && (
                                            <p className="text-primary text-[10px] font-black mt-1 uppercase tracking-widest flex items-center gap-1 italic">
                                                <MapPin className="w-2.5 h-2.5" /> {shop.distance} km
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-slate-700 group-hover:text-primary transition-all group-hover:translate-x-0.5">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Empty State
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-24 h-24 glass-premium rounded-full flex items-center justify-center mb-6 relative">
                                    <SearchIcon className="w-8 h-8 text-slate-700" strokeWidth={1} />
                                    <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-20"></div>
                                </div>
                                <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-2">Busque sua barbearia</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] max-w-xs mx-auto">Toda rede de parceiros na palma da sua mão.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
