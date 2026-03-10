'use client';
import { useState } from 'react';
import { PlayCircle, Video, BookOpen, Star, Clock, ChevronRight, Search } from 'lucide-react';

// Fake Data for Tutorials
const TUTORIAL_CATEGORIES = [
    { id: 'all', name: 'Todos os Vídeos' },
    { id: 'getting-started', name: 'Primeiros Passos' },
    { id: 'agenda', name: 'Gestão de Agenda' },
    { id: 'financial', name: 'Financeiro & Pagamentos' },
    { id: 'marketing', name: 'Marketing & Vendas' }
];

const TUTORIAL_VIDEOS = [
    {
        id: 1,
        title: 'Como configurar seus primeiros serviços',
        description: 'Aprenda a cadastrar serviços, definir preços, duração e comissões para sua equipe.',
        duration: '04:15',
        thumbnail: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&h=400',
        category: 'getting-started',
        isNew: true,
    },
    {
        id: 2,
        title: 'Dominando a Agenda Automática',
        description: 'Veja como bloquear horários, aprovar agendamentos e lidar com encaixes.',
        duration: '06:30',
        thumbnail: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&h=400',
        category: 'agenda',
        isNew: false,
    },
    {
        id: 3,
        title: 'Configurando o Link de Pagamento (Pix/Cartão)',
        description: 'Ative os pagamentos online para acabar com as faltas (No-Show) na sua barbearia no automático.',
        duration: '05:45',
        thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&h=400',
        category: 'financial',
        isNew: true,
    },
    {
        id: 4,
        title: 'Como criar cupons de desconto',
        description: 'Descubra como criar campanhas para atrair clientes nos dias mais parados da semana.',
        duration: '03:20',
        thumbnail: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=600&h=400',
        category: 'marketing',
        isNew: false,
    },
    {
        id: 5,
        title: 'Fechamento de Caixa Diário',
        description: 'O passo a passo para fechar o caixa (Cash Shift) sem furos no final do dia.',
        duration: '07:10',
        thumbnail: 'https://images.unsplash.com/photo-1554461623-2895f87b3b3a?auto=format&fit=crop&w=600&h=400',
        category: 'financial',
        isNew: false,
    },
    {
        id: 6,
        title: 'Adicionando Profissionais e Comissões',
        description: 'Cadastre seus barbeiros e defina a regra de split automático de pagamentos.',
        duration: '08:05',
        thumbnail: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&h=400',
        category: 'getting-started',
        isNew: false,
    }
];

export default function TutorialsPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [playingVideo, setPlayingVideo] = useState(null);

    const filteredVideos = TUTORIAL_VIDEOS.filter(video => {
        const matchesCategory = activeCategory === 'all' || video.category === activeCategory;
        const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-[#0A0A0B] border border-white/5 p-8 rounded-[2rem] relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />

                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-4 border border-primary/20">
                        <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Central de Conhecimento</span>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                        Tutoriais & Ajuda
                    </h1>
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                        Aprenda a extrair o máximo do NEXT. Assista nossos tutoriais rápidos
                        e domine todas as ferramentas para escalar sua barbearia.
                    </p>
                </div>

                <div className="relative z-10 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar tutorial..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 bg-black border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
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

            {/* Video Player Modal (Simulated) */}
            {playingVideo && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-5xl bg-[#0A0A0B] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative">
                        <button
                            onClick={() => setPlayingVideo(null)}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white z-10 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        {/* Fake Video Area */}
                        <div className="aspect-video w-full bg-black relative flex items-center justify-center group overflow-hidden">
                            <img src={playingVideo.thumbnail} alt="Ref" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                            <div className="relative z-10 text-center">
                                <PlayCircle className="w-20 h-20 text-primary mx-auto mb-4 opacity-80" />
                                <p className="text-white font-bold tracking-widest uppercase text-xs">Simulação de Vídeo</p>
                                <p className="text-gray-500 text-[10px] uppercase mt-2">{playingVideo.title}</p>
                            </div>

                            {/* Fake progress bar */}
                            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10">
                                <div className="h-full bg-primary w-1/3" />
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                                    {TUTORIAL_CATEGORIES.find(c => c.id === playingVideo.category)?.name}
                                </span>
                                <span className="text-gray-500 text-xs font-medium flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> {playingVideo.duration}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{playingVideo.title}</h2>
                            <p className="text-gray-400">{playingVideo.description}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Grid */}
            {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map((video) => (
                        <div
                            key={video.id}
                            className="bg-[#0A0A0B] border border-white/5 rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all cursor-pointer shadow-xl flex flex-col"
                            onClick={() => setPlayingVideo(video)}
                        >
                            <div className="relative aspect-video overflow-hidden">
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                                {video.isNew && (
                                    <div className="absolute top-4 left-4 bg-primary text-black text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg">
                                        Novo
                                    </div>
                                )}

                                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur border border-white/10 text-white text-[10px] font-black px-2 py-1 rounded">
                                    {video.duration}
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/50 flex items-center justify-center">
                                        <PlayCircle className="w-8 h-8 text-white fill-primary" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-2">
                                    {TUTORIAL_CATEGORIES.find(c => c.id === video.category)?.name}
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
