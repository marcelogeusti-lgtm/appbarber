'use client';
import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { ShoppingBag, Plus, Trash2, Search, Package, AlertCircle, Edit } from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', costPrice: '', stock: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(null); // id of product being edited
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            const res = await api.get(`/products?barbershopId=${bId}`);
            setProducts(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            await api.post('/products', { ...newProduct, barbershopId: bId });
            setNewProduct({ name: '', price: '', costPrice: '', stock: '' });
            setIsAdding(false);
            fetchProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao criar produto');
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.put(`/products/${isEditing}`, newProduct);
            setIsEditing(null);
            setNewProduct({ name: '', price: '', costPrice: '', stock: '' });
            fetchProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao atualizar produto');
        }
    };

    const startEditing = (prod) => {
        setIsEditing(prod.id);
        setNewProduct({
            name: prod.name,
            price: prod.price,
            costPrice: prod.costPrice || '',
            stock: prod.stock
        });
        setIsAdding(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Deseja excluir este produto?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (err) {
            alert('Erro ao excluir');
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const formatCurrency = (value) => {
        const num = Number(value);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-black uppercase text-xs">Carregando produtos...</div>;

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-3xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Gestão de Produtos</h1>
                        <p className="text-muted-foreground text-sm font-medium italic">Gerencie o estoque e preços de vendas</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setIsAdding(!isAdding);
                        setIsEditing(null);
                        setNewProduct({ name: '', price: '', costPrice: '', stock: '' });
                    }}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition"
                >
                    {isAdding ? 'CANCELAR' : <><Plus className="w-4 h-4" /> NOVO PRODUTO</>}
                </button>
            </header>

            {isAdding && (
                <form onSubmit={isEditing ? handleUpdateProduct : handleCreateProduct} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-2xl">
                    <h3 className="text-foreground font-bold uppercase mb-6 flex items-center gap-2">
                        {isEditing ? <Edit className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
                        {isEditing ? 'Editar Produto' : 'Novo Produto'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nome do Produto</label>
                            <input
                                required placeholder="Ex: Pomada Modeladora"
                                value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Preço Venda (R$)</label>
                            <input
                                type="number" step="0.01" required placeholder="50.00"
                                value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Preço Custo (R$)</label>
                            <input
                                type="number" step="0.01" placeholder="Optional"
                                value={newProduct.costPrice} onChange={e => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Estoque</label>
                            <input
                                type="number" required placeholder="10"
                                value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                className="w-full p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground"
                            />
                        </div>

                        {/* New Fields: Image & Featured */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Imagem do Produto (URL ou Upload)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text" placeholder="URL da imagem (https://...)"
                                    value={newProduct.imageUrl || ''}
                                    onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                                    className="flex-1 p-4 bg-background border border-border rounded-xl focus:ring-2 ring-primary outline-none font-bold text-foreground text-xs"
                                />
                                <label className="cursor-pointer bg-muted border border-border hover:bg-muted/80 text-muted-foreground px-4 py-4 rounded-xl flex items-center justify-center transition">
                                    <span className="text-[10px] font-black uppercase">Upload</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            if (file.size > 500000) return alert('Imagem muito grande! Máx 500kb');
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setNewProduct({ ...newProduct, imageUrl: reader.result });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }} />
                                </label>
                            </div>
                            {newProduct.imageUrl && (
                                <div className="mt-2 h-20 w-20 rounded-xl bg-muted overflow-hidden border border-border relative group">
                                    <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setNewProduct({ ...newProduct, imageUrl: '' })} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 md:col-span-2 bg-muted/30 p-4 rounded-xl border border-border/50">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                checked={newProduct.isFeatured || false}
                                onChange={e => setNewProduct({ ...newProduct, isFeatured: e.target.checked })}
                                className="w-5 h-5 rounded border-border bg-background text-primary accent-primary cursor-pointer"
                            />
                            <div>
                                <label htmlFor="isFeatured" className="text-xs font-black text-foreground uppercase tracking-widest cursor-pointer select-none">Destaque / Sugestão</label>
                                <p className="text-[10px] text-muted-foreground font-medium">Aparecerá no topo da lista de agendamento</p>
                            </div>
                        </div>

                    </div>
                    {error && <p className="mt-4 text-xs font-bold text-destructive uppercase">{error}</p>}
                    <button type="submit" className="mt-6 w-full bg-secondary text-secondary-foreground py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-secondary/80 transition">
                        {isEditing ? 'ATUALIZAR PRODUTO' : 'SALVAR PRODUTO'}
                    </button>
                </form>
            )}

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/70 font-medium"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-card p-6 rounded-[2rem] border border-border hover:border-primary/50 transition-all group relative overflow-hidden">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditing(product)} className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="p-2 bg-muted rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-muted rounded-2xl border border-border">
                                <Package className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-foreground uppercase tracking-tight leading-none mb-2">{product.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-primary">R$ {formatCurrency(product.price)}</span>
                                    {product.costPrice && (
                                        <span className="text-xs font-bold text-muted-foreground">Custo: {formatCurrency(product.costPrice)}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-black uppercase tracking-widest ${product.stock < 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    {product.stock} em Estoque
                                </span>
                                {product.stock < 5 && <AlertCircle className="w-4 h-4 text-destructive animate-pulse" />}
                            </div>
                            <span className="px-3 py-1 bg-muted rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border">
                                Produto
                            </span>
                        </div>
                    </div>
                ))}

                {filteredProducts.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 text-center space-y-4 bg-card rounded-[3rem] border-2 border-dashed border-border">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Nenhum produto encontrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
