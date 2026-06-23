'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ChevronLeft, 
    Map as MapIcon, 
    List as ListIcon, 
    History, 
    Heart, 
    TrendingUp,
    SearchX 
} from 'lucide-react';
import api from '../../../lib/clientApi';

// Sub-components
import SearchFilters from '../../../components/search/SearchFilters';
import BarberCard from '../../../components/search/BarberCard';
import dynamic from 'next/dynamic';

// Dynamic import for Map to avoid SSR issues with Leaflet
const MapResults = dynamic(() => import('../../../components/search/MapResults'), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-white/20">Carregando mapa...</div>
});

export default function SearchPage() {
    const router = useRouter();
    
    // UI State
    const [viewMode, setViewMode] = useState('LIST'); // LIST, MAP
    const [loading, setLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [searchTab, setSearchTab] = useState('NAME'); // NAME, CITY, NEARBY
    
    // Data State
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [recent, setRecent] = useState([]);
    const [userLocation, setUserLocation] = useState(null); // GPS Real
    const [searchLocation, setSearchLocation] = useState(null); // Coordenadas usadas na busca
    const [gpsError, setGpsError] = useState('');
    const [user, setUser] = useState(null);

    // Initial Load: User & Recommendations
    const handleLocationSearch = () => {
        setIsLocating(true);
        setGpsError('');
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setUserLocation(newLoc);
                    setSearchLocation(newLoc); // Update search to match GPS
                    setSearchTab('NEARBY'); // Force GPS tab active
                    setIsLocating(false);
                    fetchRecommendations(newLoc.lat, newLoc.lng);
                },
                (err) => {
                    console.error(err);
                    setIsLocating(false);
                    setGpsError('Erro ao obter localização. Verifique as permissões de GPS.');
                    setTimeout(() => setGpsError(''), 4000);
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } else {
            setIsLocating(false);
            setGpsError('Geolocalização não suportada neste navegador.');
            setTimeout(() => setGpsError(''), 4000);
        }
    };

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) {
            const parsedUser = JSON.parse(u);
            setUser(parsedUser);
            fetchPersonalizedData();
        }
        fetchRecommendations();
        
        // Restore from session storage
        const cached = sessionStorage.getItem('last_search_results');
        if (cached && !searchTerm) {
            setResults(JSON.parse(cached));
        }

        // Forçar carregamento do GPS imediato
        if ('geolocation' in navigator) {
            // Option to check permissions first, but task asks to force it
            handleLocationSearch();
        }
    }, []);

    // Effect: Search Trigger
    useEffect(() => {
        if (searchTerm || searchLocation) {
            doSearch();
        } else {
            setResults([]);
        }
    }, [searchTerm, searchLocation]);

    const fetchRecommendations = async (lat, lng) => {
        try {
            let url = '/barbershops/recommended';
            if (lat && lng) url += `?lat=${lat}&lng=${lng}`;
            const res = await api.get(url);
            setRecommended(res.data);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    const fetchPersonalizedData = async () => {
        try {
            const [favRes, recentRes] = await Promise.all([
                api.get('/barbershops/my/favorites'),
                api.get('/appointments/my/history?limit=5') // Assuming this endpoint gives recent shops indirectly
            ]);
            setFavorites(favRes.data);
            // Extract unique shops from appointments
            if (recentRes.data) {
                const uniqueShops = [];
                const seen = new Set();
                recentRes.data.forEach(app => {
                    if (app.barbershop && !seen.has(app.barbershop.id)) {
                        uniqueShops.push(app.barbershop);
                        seen.add(app.barbershop.id);
                    }
                });
                setRecent(uniqueShops);
            }
        } catch (error) {
            console.warn('Personalized data error (likely not logged in):', error);
        }
    };

    const doSearch = async () => {
        setLoading(true);
        try {
            let query = `/barbershops/search?term=${searchTerm}`;
            if (searchLocation) {
                query += `&lat=${searchLocation.lat}&lng=${searchLocation.lng}&type=${searchTab}`;
                if (searchLocation.radius) query += `&radius=${searchLocation.radius}`;
            }
            
            const res = await api.get(query);
            
            setResults(res.data);
            sessionStorage.setItem('last_search_results', JSON.stringify(res.data));
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };



    const handleSearchArea = (newLoc) => {
        setSearchLocation(newLoc);
        setSearchTab('NEARBY');
    };

    const isSearching = searchTerm.length > 0 || searchLocation;

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white pb-24 selection:bg-primary/30">
            {/* Meta Tags simulation for client side */}
            <title>Buscar Barbearias | AppBarber</title>

            <div className="max-w-2xl mx-auto px-5">
                {/* Header */}
                <header className="py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => router.back()}
                            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all text-white/60"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-black tracking-tight uppercase italic text-white flex items-center gap-2">
                            Explorar
                        </h1>
                    </div>
                    
                    <button
                        onClick={() => setViewMode(v => v === 'LIST' ? 'MAP' : 'LIST')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold hover:bg-white/10 transition-all text-white/80"
                    >
                        {viewMode === 'LIST' ? (
                            <><MapIcon className="w-3.5 h-3.5" /> Ver Mapa</>
                        ) : (
                            <><ListIcon className="w-3.5 h-3.5" /> Ver Lista</>
                        )}
                    </button>
                </header>

                {/* Error Banner */}
                {gpsError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-xl mb-4 text-center">
                        {gpsError}
                    </div>
                )}

                {/* Filters Section */}
                <SearchFilters 
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm}
                    onLocationSearch={handleLocationSearch}
                    isLocating={isLocating}
                />

                {/* Main Tabs */}
                <div className="flex items-center gap-8 mt-4 border-b border-white/5 relative">
                    {[
                        { id: 'NAME', label: 'Nome' },
                        { id: 'CITY', label: 'Cidade' },
                        { id: 'NEARBY', label: 'Próximas', badge: 'GPS' }
                    ].map((tab) => {
                        const isActive = searchTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setSearchTab(tab.id)}
                                className={`relative pb-4 text-sm font-bold transition-all flex items-center gap-2 ${
                                    isActive ? 'text-white' : 'text-white/40 hover:text-white/60'
                                }`}
                            >
                                {tab.label}
                                {tab.badge && (
                                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase tracking-tighter">
                                        {tab.badge}
                                    </span>
                                )}
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(37,99,235,0.5)] animate-in fade-in duration-300" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <main className="mt-8">
                    {loading ? (
                        <div className="grid grid-cols-1 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-[280px] w-full bg-white/5 rounded-2xl animate-pulse flex flex-col p-4 gap-4">
                                    <div className="h-40 bg-white/5 rounded-xl"></div>
                                    <div className="h-4 w-2/3 bg-white/5 rounded"></div>
                                    <div className="h-4 w-1/2 bg-white/5 rounded"></div>
                                </div>
                            ))}
                        </div>
                    ) : viewMode === 'MAP' ? (
                        <div className="h-[calc(100vh-280px)] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                            <MapResults 
                                shops={isSearching ? results : recommended} 
                                center={searchLocation ? [searchLocation.lat, searchLocation.lng] : null}
                                userLocation={userLocation}
                                onSearchArea={handleSearchArea}
                            />
                        </div>
                    ) : isSearching ? (
                        /* SEARCH RESULTS */
                        <div className="space-y-6">
                            {results.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {results.map(shop => (
                                        <BarberCard key={shop.id} shop={shop} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 text-white/20">
                                        <SearchX className="w-8 h-8" strokeWidth={1.5} />
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-2">Nenhuma barbearia correspondente</h2>
                                    <p className="text-white/40 text-sm max-w-xs mx-auto mb-8">
                                        Como removemos os limites de distância, realmente não encontramos nada com o termo ou região buscada. Tente explorar outra área no mapa ou altere o termo de busca!
                                    </p>
                                    <button 
                                        onClick={() => { setSearchTerm(''); setSearchLocation(null); setUserLocation(null); }}
                                        className="px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-white/90 active:scale-95 transition-all text-sm"
                                    >
                                        Limpar Busca
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* EMPTY STATE / HOME */
                        <div className="space-y-10">
                            {/* Recent */}
                            {recent.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-4 text-white/40 uppercase tracking-widest text-[10px] font-bold">
                                        <History className="w-3 h-3" /> Visitados Recentemente
                                    </div>
                                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                        {recent.map(shop => (
                                            <Link key={shop.id} href={`/${shop.slug}`} className="flex-shrink-0 w-14 group">
                                                <div className="w-14 h-14 rounded-full border-2 border-white/5 group-hover:border-primary transition-all p-0.5 mb-2 overflow-hidden">
                                                    <img src={shop.logoUrl || '/default-barber.png'} className="w-full h-full rounded-full object-cover" />
                                                </div>
                                                <p className="text-[10px] text-center font-bold text-white/60 truncate group-hover:text-white">{shop.name}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Favorites */}
                            {favorites.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-2 mb-4 text-white/40 uppercase tracking-widest text-[10px] font-bold">
                                        <Heart className="w-3 h-3 text-red-500" /> Seus Favoritos
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {favorites.map(shop => (
                                            <BarberCard key={shop.id} shop={shop} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Popular */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-white/40 uppercase tracking-widest text-[10px] font-bold">
                                        <TrendingUp className="w-3 h-3 text-primary" /> Barbearias Populares
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {recommended.map(shop => (
                                        <BarberCard key={shop.id} shop={shop} />
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

// Internal Link helper for the home context
function Link({ href, children, className }) {
    return (
        <a href={href} className={className}>{children}</a>
    );
}
