'use client';
import { useState, useEffect } from 'react';
import { PlayCircle, Video, BookOpen, Star, Clock, ChevronRight, Search } from 'lucide-react';
import api from '../../../lib/api';

// Helper to extract YouTube ID and thumbnail
const getYoutubeInfo = (url) => {
    if (!url) return { id: null, thumbnail: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&h=400' };

    let videoId = null;
    const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(youtubeRegExp);

    if (match && match[2].length === 11) {
        videoId = match[2];
    }

    return {
        id: videoId,
        thumbnail: videoId
            ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            : 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&h=400'
    };
};

const TUTORIAL_CATEGORIES = [
    { id: 'all', name: 'Todos os Vídeos' },
    { id: 'getting-started', name: 'Primeiros Passos' },
    { id: 'agenda', name: 'Gestão de Agenda' },
    { id: 'financial', name: 'Financeiro & Pagamentos' },
    { id: 'marketing', name: 'Marketing & Vendas' }
];

export default function TutorialsPage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [playingVideo, setPlayingVideo] = useState(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                const response = await api.get('/tutorials', {
                    params: {
                        category: activeCategory,
                        search: searchQuery
                    }
                });
                setVideos(response.data);
            } catch (error) {
                console.error('Error fetching tutorials:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [activeCategory, searchQuery]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Area: Experiência Premium Banner */}
            <div className="bg-[#0A0A0B] border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[120px] -mr-[300px] -mt-[300px] rounded-full" />
                
                <div className="relative z-10 space-y-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight mb-4">
                            A EXPERIÊNCIA <span className="text-primary">PREMIUM</span> <br className="hidden md:block" /> DE AGENDAMENTO.
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
                            O NEXT foi desenhado para eliminar fricção. Seu cliente não precisa de <br className="hidden md:block" />
                            apps pesados ou cadastros complexos.
                        </p>
                    </div>

                    {/* Value Pillars Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Simplicidade</p>
                            <p className="text-lg font-bold text-white uppercase tracking-tight">Acesso via <br className="hidden md:block" /> QR Code ou Link</p>
                        </div>
                        <div className="space-y-1 md:border-l md:border-white/5 md:pl-8">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Agilidade</p>
                            <p className="text-lg font-bold text-white uppercase tracking-tight">Agendamento <br className="hidden md:block" /> em 3 toques</p>
                        </div>
                        <div className="space-y-1 md:border-l md:border-white/5 md:pl-8">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Retenção</p>
                            <p className="text-lg font-bold text-white uppercase tracking-tight">Fidelização <br className="hidden md:block" /> automática</p>
                        </div>
                    </div>
                </div>

                {/* Search Bar (Repositioned) */}
                <div className="absolute top-10 right-10 hidden lg:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar tutorial..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Categories Filter */}
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                {TUTORIAL_CATEGORIES.map(category => (
                    <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === category.id
                            ? 'bg-primary text-black shadow-[0_0_20px_rgba(77,114,228,0.3)]'
                            : 'bg-[#0A0A0B] text-gray-400 border border-white/5 hover:border-white/20 hover:text-white'
                            }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Video Player Modal */}
            {playingVideo && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-5xl bg-[#0A0A0B] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
                        <button
                            onClick={() => setPlayingVideo(null)}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-10 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        <div className="aspect-video w-full bg-black">
                            {getYoutubeInfo(playingVideo.url).id ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${getYoutubeInfo(playingVideo.url).id}?autoplay=1`}
                                    title={playingVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gray-900">
                                    <Video className="w-16 h-16 text-gray-600 mb-4" />
                                    <p className="text-white font-bold">Link de vídeo não compatível para embed direto.</p>
                                    <a href={playingVideo.url} target="_blank" className="mt-4 text-primary underline">Assistir no site original</a>
                                </div>
                            )}
                        </div>

                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                                    {TUTORIAL_CATEGORIES.find(c => c.id === playingVideo.category)?.name}
                                </span>
                                <span className="text-gray-500 text-xs font-medium flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> {playingVideo.duration || '00:00'}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{playingVideo.title}</h2>
                            <p className="text-gray-400">{playingVideo.description}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="aspect-video bg-white/5 animate-pulse rounded-[2rem]" />
                    ))}
                </div>
            ) : videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <div
                            key={video.id}
                            className="bg-[#0A0A0B] border border-white/5 rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all cursor-pointer shadow-xl flex flex-col"
                            onClick={() => setPlayingVideo(video)}
                        >
                            <div className="relative aspect-video overflow-hidden">
                                <img
                                    src={getYoutubeInfo(video.url).thumbnail}
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur border border-white/10 text-white text-[10px] font-black px-2 py-1 rounded">
                                    {video.duration || '00:00'}
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/50 flex items-center justify-center">
                                        <PlayCircle className="w-8 h-8 text-white fill-primary" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-2">
                                    {TUTORIAL_CATEGORIES.find(c => c.id === video.category)?.name || video.category}
                                </p>
                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                    {video.title}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mt-auto">
                                    {video.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center border border-white/5 border-dashed rounded-[2rem] bg-[#0A0A0B]">
                    <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Nenhum tutorial encontrado</h3>
                    <p className="text-gray-500 text-sm">Tente buscar por termos diferentes ou selecione outra categoria.</p>
                </div>
            )}

            {/* Help / Support CTA */}
            <div className="mt-12 bg-gradient-to-r from-blue-900/40 to-primary/20 border border-primary/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Ainda precisa de ajuda?</h3>
                    <p className="text-blue-200/70 text-sm">Nossa equipe de suporte Mestre VIP está online para te auxiliar.</p>
                </div>
                <button className="px-6 py-3 bg-white text-blue-900 font-bold rounded-xl text-sm shadow-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                    Falar com Suporte
                </button>
            </div>

        </div>
    );
}

