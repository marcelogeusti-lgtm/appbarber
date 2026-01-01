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

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-black uppercase text-xs">Carregando produtos...</div>;

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-8 rounded-3xl border border-slate-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                        <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Gestão de Produtos</h1>
                        <p className="text-slate-500 text-sm font-medium italic">Gerencie o estoque e preços de vendas</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setIsAdding(!isAdding);
                        setIsEditing(null);
                        setNewProduct({ name: '', price: '', costPrice: '', stock: '' });
                    }}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition"
                >
                    {isAdding ? 'CANCELAR' : <><Plus className="w-4 h-4" /> NOVO PRODUTO</>}
                </button>
            </header>

            {isAdding && (
                <form onSubmit={isEditing ? handleUpdateProduct : handleCreateProduct} className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
                    <h3 className="text-white font-bold uppercase mb-6 flex items-center gap-2">
                        {isEditing ? <Edit className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4 text-emerald-500" />}
                        {isEditing ? 'Editar Produto' : 'Novo Produto'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Produto</label>
                            <input
                                required placeholder="Ex: Pomada Modeladora"
                                value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço Venda (R$)</label>
                            <input
                                type="number" step="0.01" required placeholder="50.00"
                                value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço Custo (R$)</label>
                            <input
                                type="number" step="0.01" placeholder="Optional"
                                value={newProduct.costPrice} onChange={e => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estoque</label>
                            <input
                                type="number" required placeholder="10"
                                value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 ring-emerald-500 outline-none font-bold text-white"
                            />
                        </div>
                    </div>
                    {error && <p className="mt-4 text-xs font-bold text-red-500 uppercase">{error}</p>}
                    <button type="submit" className="mt-6 w-full bg-white text-slate-900 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition">
                        {isEditing ? 'ATUALIZAR PRODUTO' : 'SALVAR PRODUTO'}
                    </button>
                </form>
            )}

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#111827] border border-slate-800 rounded-2xl text-white outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600 font-medium"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-[#111827] p-6 rounded-[2rem] border border-slate-800 hover:border-emerald-500/50 transition-all group relative overflow-hidden">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditing(product)} className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                                <Package className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none mb-2">{product.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-emerald-500">R$ {formatCurrency(product.price)}</span>
                                    {product.costPrice && (
                                        <span className="text-xs font-bold text-slate-600">Custo: {formatCurrency(product.costPrice)}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-black uppercase tracking-widest ${product.stock < 5 ? 'text-red-500' : 'text-slate-400'}`}>
                                    {product.stock} em Estoque
                                </span>
                                {product.stock < 5 && <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />}
                            </div>
                            <span className="px-3 py-1 bg-slate-900 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-800">
                                Produto
                            </span>
                        </div>
                    </div>
                ))}

                {filteredProducts.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 text-center space-y-4 bg-[#111827] rounded-[3rem] border-2 border-dashed border-slate-800">
                        <Package className="w-12 h-12 text-slate-700 mx-auto" />
                        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Nenhum produto encontrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
