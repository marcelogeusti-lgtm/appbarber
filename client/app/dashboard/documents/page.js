'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderOpen, Plus, Trash2, ExternalLink, FileText, Image as ImageIcon } from 'lucide-react';
import api from '../../../lib/api';

const CATS = [
    { key: '', label: 'Todos' },
    { key: 'MARKETING', label: 'Divulgação' },
    { key: 'CONTRACT', label: 'Contratos' },
    { key: 'CLIENT', label: 'Clientes' },
    { key: 'PROFESSIONAL', label: 'Profissionais' },
    { key: 'GENERAL', label: 'Geral' },
];

export default function DocumentsPage() {
    const queryClient = useQueryClient();
    const [barbershopId, setBarbershopId] = useState(null);
    const [filter, setFilter] = useState('');
    const [form, setForm] = useState({ title: '', url: '', category: 'MARKETING' });

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) { try { const p = JSON.parse(u); setBarbershopId(p.barbershopId || p.barbershop?.id || p.ownedBarbershops?.[0]?.id); } catch (e) { } }
    }, []);

    const { data: docs = [], isLoading } = useQuery({
        queryKey: ['documents', barbershopId, filter],
        queryFn: async () => (await api.get(`/documents?barbershopId=${barbershopId}${filter ? `&category=${filter}` : ''}`)).data,
        enabled: !!barbershopId,
    });
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['documents', barbershopId] });

    const add = async () => {
        if (!form.title.trim() || !form.url.trim()) { alert('Preencha título e link.'); return; }
        try { await api.post('/documents', { ...form, barbershopId }); setForm({ title: '', url: '', category: form.category }); refresh(); }
        catch (e) { alert(e.response?.data?.message || 'Erro ao salvar.'); }
    };
    const remove = async (id) => { if (!confirm('Remover?')) return; try { await api.delete(`/documents/${id}`); refresh(); } catch (e) { alert('Erro.'); } };

    return (
        <div className="space-y-8 pb-20">
            <header className="flex items-center gap-4 bg-card p-8 rounded-xl border border-border shadow-sm">
                <div className="p-3 bg-primary/10 text-primary rounded-xl"><FolderOpen className="w-8 h-8" /></div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Documentos & Divulgação</h1>
                    <p className="text-muted-foreground text-sm font-medium italic">Guarde contratos, fichas e artes de divulgação (por link).</p>
                </div>
            </header>

            {/* Adicionar */}
            <div className="bg-card border border-border rounded-xl p-6 flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[160px]"><label className="doc-l">Título</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex.: Arte promoção de terça" className="doc-i" /></div>
                <div className="flex-1 min-w-[200px]"><label className="doc-l">Link (URL)</label><input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." className="doc-i" /></div>
                <div className="w-44"><label className="doc-l">Categoria</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="doc-i">
                        {CATS.filter(c => c.key).map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                </div>
                <button onClick={add} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2"><Plus className="w-4 h-4" /> Adicionar</button>
            </div>

            {/* Filtro */}
            <div className="flex flex-wrap gap-2">
                {CATS.map(c => (
                    <button key={c.key} onClick={() => setFilter(c.key)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === c.key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>{c.label}</button>
                ))}
            </div>

            {/* Grid */}
            {isLoading && <p className="text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest py-8">Carregando...</p>}
            {!isLoading && docs.length === 0 && <div className="bg-card border border-dashed border-border rounded-xl p-14 text-center text-muted-foreground italic">Nenhum item. Adicione um link acima.</div>}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {docs.map(d => (
                    <div key={d.id} className="bg-card border border-border rounded-xl overflow-hidden group">
                        {d.isImage ? (
                            <a href={d.url} target="_blank" rel="noreferrer" className="block aspect-video bg-muted overflow-hidden">
                                <img src={d.url} alt={d.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </a>
                        ) : (
                            <a href={d.url} target="_blank" rel="noreferrer" className="flex items-center justify-center aspect-video bg-muted/40"><FileText className="w-10 h-10 text-muted-foreground" /></a>
                        )}
                        <div className="p-3 flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground text-xs truncate">{d.title}</p>
                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest">{(CATS.find(c => c.key === d.category) || {}).label || d.category}</p>
                            </div>
                            <a href={d.url} target="_blank" rel="noreferrer" className="p-1.5 text-muted-foreground hover:text-primary"><ExternalLink className="w-4 h-4" /></a>
                            <button onClick={() => remove(d.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .doc-l { display:block; font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:0.15em; color:hsl(var(--muted-foreground)); margin-bottom:6px; margin-left:4px; }
                .doc-i { width:100%; background:hsl(var(--background)); border:1px solid hsl(var(--border)); border-radius:0.75rem; padding:0.7rem 0.9rem; font-size:0.85rem; font-weight:700; color:hsl(var(--foreground)); outline:none; }
                .doc-i:focus { box-shadow:0 0 0 2px hsl(var(--primary)); }
            `}</style>
        </div>
    );
}
