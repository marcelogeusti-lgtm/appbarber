'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import {
    Receipt, User, Calendar, Clock, Plus, Trash2,
    CreditCard, CheckCircle, AlertCircle, Scissors, Package, Percent, X
} from 'lucide-react';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);

    // UI States
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [discountValue, setDiscountValue] = useState(0);

    useEffect(() => {
        if (id) {
            fetchOrder();
            fetchResources();
        }
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/orders/${id}`);
            setOrder(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            // alert('Erro ao carregar comanda');
        }
    };

    const fetchResources = async () => {
        // Fetch products and services for the add item dropdowns
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id; // Simplify getting ID

            if (bId) {
                const [prodRes, servRes] = await Promise.all([
                    api.get(`/products?barbershopId=${bId}`),
                    api.get(`/services?barbershopId=${bId}`) // Assuming this route exists
                ]);
                setProducts(prodRes.data);
                setServices(servRes.data);
            }
        } catch (err) {
            console.error("Error fetching resources", err);
        }
    }

    const handleAddItem = async (type, itemId) => {
        if (!itemId) return;
        try {
            const payload = {
                type,
                quantity: 1,
            };

            if (type === 'PRODUCT') {
                const prod = products.find(p => p.id === itemId);
                payload.productId = itemId;
                payload.unitPrice = Number(prod.price);
            } else {
                const serv = services.find(s => s.id === itemId);
                payload.serviceId = itemId;
                payload.unitPrice = Number(serv.price);
            }

            await api.post(`/orders/${id}/items`, payload);
            fetchOrder(); // Refresh
            setShowProductModal(false);
        } catch (err) {
            alert('Erro ao adicionar item');
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (!confirm('Remover este item?')) return;
        try {
            await api.delete(`/orders/items/${itemId}`);
            fetchOrder();
        } catch (err) {
            alert('Erro ao remover item');
        }
    };

    const handleApplyDiscount = async () => {
        try {
            await api.put(`/orders/${id}/discount`, {
                discount: parseFloat(discountValue) || 0
            });
            fetchOrder();
            setShowDiscountModal(false);
            setDiscountValue(0);
        } catch (err) {
            alert('Erro ao aplicar desconto');
        }
    };

    const handleCloseOrder = async () => {
        if (!confirm('Fechar e finalizar comanda?')) return;
        try {
            await api.post(`/orders/${id}/pay`, {
                paymentMethod: 'CASH',
                discount: order.discount || 0
            });
            fetchOrder();
        } catch (err) {
            alert('Erro ao fechar comanda');
        }
    };

    const formatCurrency = (value) => {
        const num = Number(value);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-black uppercase text-xs">Carregando comanda...</div>;
    if (!order) return <div className="p-8 text-center text-red-500 font-bold">Comanda não encontrada</div>;

    const isClosed = order.status === 'CLOSED' || order.status === 'PAID';

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
                <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-3xl ${isClosed ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'}`}>
                        <Receipt className="w-10 h-10" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Comanda #{order.id.slice(0, 6)}</h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isClosed
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
                                : 'bg-blue-500/10 border-blue-500/50 text-blue-500'
                                }`}>
                                {isClosed ? 'Finalizada' : 'Aberta'}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                            <span className="flex items-center gap-1"><User className="w-4 h-4" /> {order.client?.name || 'Cliente Recorrente'}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {!isClosed && (
                    <button
                        onClick={handleCloseOrder}
                        className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition flex items-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5" /> Finalizar Conta
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Items List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#111827] rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-lg">
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-white font-bold uppercase tracking-wide flex items-center gap-2">
                                <Receipt className="w-5 h-5 text-slate-500" /> Itens do Pedido
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {order.items?.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800 group hover:border-slate-700 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-800 rounded-xl text-slate-400">
                                            {item.type === 'SERVICE' ? <Scissors className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{item.service?.name || item.product?.name || 'Item desconhecido'}</p>
                                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{item.type === 'SERVICE' ? 'Serviço' : 'Produto'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-white font-bold">R$ {formatCurrency(item.total)}</p>
                                            <p className="text-slate-600 text-xs">{item.quantity}x R$ {formatCurrency(item.unitPrice)}</p>
                                        </div>
                                        {!isClosed && (
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="p-2 text-red-500 bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-500 hover:text-white"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {order.items?.length === 0 && (
                                <div className="text-center py-12 text-slate-500 font-medium italic">
                                    Nenhum item adicionado ainda.
                                </div>
                            )}
                        </div>

                        {!isClosed && (
                            <div className="p-6 bg-slate-900/30 border-t border-slate-800 grid grid-cols-2 gap-4">
                                {/* Add Service Dropdown */}
                                <div className="relative group">
                                    <button className="w-full p-4 bg-blue-500/10 rounded-2xl border border-blue-500/30 text-blue-400 font-bold text-xs uppercase tracking-wider hover:bg-blue-500/20 transition flex items-center justify-center gap-2">
                                        <Scissors className="w-4 h-4" /> Add Serviço
                                    </button>
                                    <div className="absolute bottom-full left-0 w-full mb-2 bg-[#111827] border border-blue-500/30 rounded-xl shadow-xl overflow-hidden hidden group-hover:block max-h-60 overflow-y-auto z-10">
                                        {services.length > 0 ? services.map(serv => (
                                            <button
                                                key={serv.id}
                                                onClick={() => handleAddItem('SERVICE', serv.id)}
                                                className="w-full text-left p-3 hover:bg-slate-800 text-slate-300 text-xs font-bold border-b border-slate-800 last:border-0 transition"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span>{serv.name}</span>
                                                    <span className="text-blue-400">R$ {formatCurrency(serv.price)}</span>
                                                </div>
                                            </button>
                                        )) : (
                                            <div className="p-3 text-center text-slate-500 text-xs">Nenhum serviço disponível</div>
                                        )}
                                    </div>
                                </div>

                                {/* Add Product Dropdown */}
                                <div className="relative group">
                                    <button className="w-full p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider hover:bg-emerald-500/20 transition flex items-center justify-center gap-2">
                                        <Package className="w-4 h-4" /> Add Produto
                                    </button>
                                    <div className="absolute bottom-full left-0 w-full mb-2 bg-[#111827] border border-emerald-500/30 rounded-xl shadow-xl overflow-hidden hidden group-hover:block max-h-60 overflow-y-auto z-10">
                                        {products.length > 0 ? products.map(prod => (
                                            <button
                                                key={prod.id}
                                                onClick={() => handleAddItem('PRODUCT', prod.id)}
                                                className="w-full text-left p-3 hover:bg-slate-800 text-slate-300 text-xs font-bold border-b border-slate-800 last:border-0 transition"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span>{prod.name}</span>
                                                    <span className="text-emerald-400">R$ {formatCurrency(prod.price)}</span>
                                                </div>
                                            </button>
                                        )) : (
                                            <div className="p-3 text-center text-slate-500 text-xs">Nenhum produto disponível</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#111827] p-8 rounded-[2.5rem] border border-slate-800 shadow-lg sticky top-6">
                        <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">Resumo do Pagamento</h3>

                        <div className="space-y-4 mb-8 border-b border-slate-800 pb-8">
                            <div className="flex justify-between text-slate-400 font-medium">
                                <span>Subtotal</span>
                                <span>R$ {formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400 font-medium">
                                <span>Desconto</span>
                                <span>R$ {formatCurrency(order.discount)}</span>
                            </div>
                            <div className="flex justify-between text-white font-black text-xl pt-4 border-t border-slate-800/50">
                                <span>Total</span>
                                <span className="text-emerald-500">R$ {formatCurrency(order.total)}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3 opacity-50 cursor-not-allowed">
                                <CreditCard className="w-5 h-5 text-slate-500" />
                                <span className="text-slate-400 font-bold text-xs uppercase">Pagamento Online (Em Breve)</span>
                            </div>
                            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                                </div>
                                <span className="text-emerald-500 font-bold text-xs uppercase">Dinheiro / Pix</span>
                            </div>

                            {!isClosed && (
                                <button
                                    onClick={() => {
                                        setDiscountValue(order.discount || 0);
                                        setShowDiscountModal(true);
                                    }}
                                    className="w-full p-4 bg-orange-500/10 rounded-2xl border border-orange-500/30 text-orange-400 font-bold text-xs uppercase tracking-wider hover:bg-orange-500/20 transition flex items-center justify-center gap-2"
                                >
                                    <Percent className="w-4 h-4" /> Aplicar Desconto
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Discount Modal */}
            {showDiscountModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-[#111827] w-full max-w-md rounded-3xl shadow-2xl border border-slate-800 overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-white font-black text-lg uppercase flex items-center gap-2">
                                <Percent className="w-5 h-5 text-orange-500" />
                                Aplicar Desconto
                            </h3>
                            <button
                                onClick={() => setShowDiscountModal(false)}
                                className="p-2 hover:bg-slate-800 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor do Desconto (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={order.subtotal}
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-lg focus:ring-2 ring-orange-500 outline-none"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-2">
                                <div className="flex justify-between text-sm text-slate-400">
                                    <span>Subtotal</span>
                                    <span>R$ {formatCurrency(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-orange-400 font-bold">
                                    <span>Desconto</span>
                                    <span>- R$ {formatCurrency(discountValue)}</span>
                                </div>
                                <div className="flex justify-between text-lg text-white font-black pt-2 border-t border-slate-800">
                                    <span>Novo Total</span>
                                    <span className="text-emerald-500">R$ {formatCurrency(order.subtotal - (parseFloat(discountValue) || 0))}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDiscountModal(false)}
                                    className="flex-1 p-3 bg-slate-800 rounded-xl font-bold text-sm hover:bg-slate-700 transition text-white"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleApplyDiscount}
                                    className="flex-1 p-3 bg-orange-500 rounded-xl font-bold text-sm hover:bg-orange-600 transition text-white shadow-lg shadow-orange-500/20"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
