import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Loader2, Plus, Trash2, Edit, CheckCircle, Image as ImageIcon } from 'lucide-react';

export default function BannersTab({ barbershop }) {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        linkUrl: '',
        ctaText: '',
        startDate: '',
        endDate: '',
        location: 'DASHBOARD_TOP',
        active: true
    });

    useEffect(() => {
        if (barbershop?.id) {
            fetchBanners();
        }
    }, [barbershop]);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/barbershops/${barbershop.id}/banners`);
            setBanners(res.data);
        } catch (error) {
            console.error('Error fetching banners', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (!payload.startDate) payload.startDate = null;
            if (!payload.endDate) payload.endDate = null;

            if (editingBanner) {
                await api.put(`/barbershops/${barbershop.id}/banners/${editingBanner.id}`, payload);
            } else {
                await api.post(`/barbershops/${barbershop.id}/banners`, payload);
            }
            setShowModal(false);
            fetchBanners();
        } catch (error) {
            console.error('Error saving banner', error);
            alert('Erro ao salvar banner');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Deseja realmente excluir este banner?')) return;
        try {
            await api.delete(`/barbershops/${barbershop.id}/banners/${id}`);
            fetchBanners();
        } catch (error) {
            console.error('Error deleting banner', error);
            alert('Erro ao excluir banner');
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                setFormData({ ...formData, imageUrl: event.target.result });
            };
        }
    };

    const openModal = (banner = null) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                title: banner.title || '',
                imageUrl: banner.imageUrl || '',
                linkUrl: banner.linkUrl || '',
                ctaText: banner.ctaText || '',
                startDate: banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : '',
                endDate: banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : '',
                location: banner.location || 'DASHBOARD_TOP',
                active: banner.active
            });
        } else {
            setEditingBanner(null);
            setFormData({
                title: '',
                imageUrl: '',
                linkUrl: '',
                ctaText: '',
                startDate: '',
                endDate: '',
                location: 'DASHBOARD_TOP',
                active: true
            });
        }
        setShowModal(true);
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
    }

    return (
        <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-soft space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-primary" /> Banners Promocionais
                    </h2>
                    <p className="text-muted-foreground text-xs font-medium">Gerencie os banners exibidos no aplicativo do cliente.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-primary text-white h-10 px-4 rounded-lg font-bold text-xs uppercase hover:bg-primary/90 transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Novo Banner
                </button>
            </div>

            {banners.length === 0 ? (
                <div className="text-center p-12 bg-muted/50 rounded-xl border border-dashed border-border">
                    <p className="text-muted-foreground text-sm font-medium">Nenhum banner cadastrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banners.map(b => (
                        <div key={b.id} className="relative bg-muted p-4 rounded-xl border border-border group overflow-hidden shadow-sm flex gap-4">
                            <div className="w-24 h-24 bg-card rounded-lg flex-shrink-0 border border-border overflow-hidden flex items-center justify-center">
                                {b.imageUrl ? (
                                    <img src={b.imageUrl} className="w-full h-full object-cover" alt="Banner" />
                                ) : (
                                    <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <h3 className="font-bold text-sm text-foreground line-clamp-1">{b.title}</h3>
                                <p className="text-[10px] text-muted-foreground mb-2 mt-1">Status: {b.active ? 'Ativo' : 'Inativo'}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => openModal(b)} className="px-3 py-1.5 bg-card border border-border hover:bg-muted text-xs font-bold rounded-lg transition-colors">
                                        Editar
                                    </button>
                                    <button onClick={() => handleDelete(b.id)} className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold rounded-lg transition-colors">
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
                        <h3 className="text-lg font-bold text-foreground mb-4">{editingBanner ? 'Editar Banner' : 'Novo Banner'}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground">Título</label>
                                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm" />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground">Imagem do Banner</label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-20 h-20 bg-muted border border-dashed rounded-lg flex items-center justify-center overflow-hidden">
                                        {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-muted-foreground/30" />}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleUpload} className="text-xs" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground">Link de Destino (Opcional)</label>
                                <input value={formData.linkUrl} onChange={e => setFormData({ ...formData, linkUrl: e.target.value })} className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm" placeholder="https://" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground">Data Início</label>
                                    <input type="datetime-local" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground">Data Fim</label>
                                    <input type="datetime-local" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm" />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" id="activeBanner" checked={formData.active} onChange={e => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4 rounded border-border" />
                                <label htmlFor="activeBanner" className="text-sm font-bold text-foreground">Banner Ativo</label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-lg text-xs font-bold">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
