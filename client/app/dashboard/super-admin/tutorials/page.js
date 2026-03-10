'use client';
import { useState } from 'react';
import { PlayCircle, Plus, Edit, Trash2, Search, Video, Save, X } from 'lucide-react';
import { toast } from 'sonner';

// Mock data (matches the consumer page for now)
const INITIAL_VIDEOS = [
    {
        id: 1,
        title: 'Como configurar seus primeiros serviços',
        description: 'Aprenda a cadastrar serviços, definir preços, duração e comissões para sua equipe.',
        duration: '04:15',
        category: 'getting-started',
        status: 'published'
    },
    {
        id: 2,
        title: 'Dominando a Agenda Automática',
        description: 'Veja como bloquear horários, aprovar agendamentos e lidar com encaixes.',
        duration: '06:30',
        category: 'agenda',
        status: 'published'
    }
];

export default function SuperAdminTutorials() {
    const [videos, setVideos] = useState(INITIAL_VIDEOS);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        url: '',
        category: 'getting-started',
        duration: ''
    });

    const handleOpenModal = (video = null) => {
        if (video) {
            setEditingVideo(video);
            setFormData(video);
        } else {
            setEditingVideo(null);
            setFormData({ title: '', description: '', url: '', category: 'getting-started', duration: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1000)),
            {
                loading: 'Salvando tutorial...',
                success: () => {
                    setIsModalOpen(false);
                    return editingVideo ? 'Tutorial atualizado com sucesso!' : 'Tutorial adicionado com sucesso!';
                },
                error: 'Erro ao salvar tutorial'
            }
        );
    };

    const handleDelete = (id) => {
        if (confirm('Tem certeza que deseja apagar este vídeo? Ele sairá imediatamente do ar para todos os clientes.')) {
            setVideos(videos.filter(v => v.id !== id));
            toast.success('Tutorial removido.');
        }
    };

    const filteredVideos = videos.filter(v =>
        v.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <PlayCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">Gestão de Tutoriais</h1>
                        <p className="text-sm text-muted-foreground">Cadastre e gerencie os vídeos de ajuda para os clientes do SaaS.</p>
                    </div>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-4 h-4" />
                    Novo Tutorial
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between bg-muted/20">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar tutorial..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Vídeo</th>
                                <th className="px-6 py-4 font-semibold">Categoria</th>
                                <th className="px-6 py-4 font-semibold">Duração</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredVideos.map((video) => (
                                <tr key={video.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-6 py-4 text-foreground">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                                <Video className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-bold">{video.title}</p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{video.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-accent text-accent-foreground px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                                            {video.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {video.duration}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1.5 text-green-500 text-xs font-semibold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Publicado
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(video)}
                                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(video.id)}
                                                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredVideos.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                        Nenhum vídeo encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Create/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-border">
                            <h2 className="text-xl font-bold text-foreground">
                                {editingVideo ? 'Editar Tutorial' : 'Novo Tutorial'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Título do Vídeo</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                                    placeholder="Ex: Como configurar sua agenda..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">URL do Vídeo (YouTube/Vimeo/Cloudflare)</label>
                                <input
                                    required
                                    type="url"
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Categoria</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                                    >
                                        <option value="getting-started">Primeiros Passos</option>
                                        <option value="agenda">Agenda</option>
                                        <option value="financial">Financeiro</option>
                                        <option value="marketing">Marketing</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Duração</label>
                                    <input
                                        type="text"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                                        placeholder="Ex: 05:30"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Descrição (Breve resumo)</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                                    placeholder="O que o cliente vai aprender neste vídeo?"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 text-sm">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl font-semibold text-muted-foreground hover:bg-accent transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
                                >
                                    <Save className="w-4 h-4" />
                                    Salvar Tutorial
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
