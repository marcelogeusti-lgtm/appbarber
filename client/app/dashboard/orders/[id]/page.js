'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { Plus, Trash2, ArrowLeft, DollarSign, CreditCard, Banknote, User, Calendar, Scissors, Package } from 'lucide-react';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // Add Item Modal
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);
    const [itemType, setItemType] = useState('SERVICE'); // SERVICE, PRODUCT
    const [selectedItem, setSelectedItem] = useState('');
    const [quantity, setQuantity] = useState(1);

    // Payment Modal
    const [isPaying, setIsPaying] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, CARD, PIX

    useEffect(() => {
        if (id) {
            fetchOrder();
            fetchCatalog();
        }
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/orders/${id}`);
            setOrder(res.data);
            setLoading(false);
        } catch (err) {
            alert('Erro ao carregar comanda');
            router.push('/dashboard/orders');
        }
    };

    const fetchCatalog = async () => {
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const barbershopId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            const sRes = await api.get(`/services?barbershopId=${barbershopId}`);
            setServices(sRes.data);

            // Try fetching products if endpoint exists, otherwise empty
            try {
                // Assuming products endpoint might exist or we use a temporary one
                // If not found, ignore
                // const pRes = await api.get(`/products?barbershopId=${barbershopId}`);
                // setProducts(pRes.data);
                // Since I'm not sure if Product routes exist, I'll comment out for now or try-catch
            } catch (e) { }

        } catch (err) {
            console.error(err);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            let itemData = {};
            let price = 0;

            if (itemType === 'SERVICE') {
                const service = services.find(s => s.id === selectedItem);
                if (!service) return;
                itemData = { type: 'SERVICE', serviceId: service.id, unitPrice: parseFloat(service.price) };
            } else {
                // Product logic
                // const product = products.find(p => p.id === selectedItem);
                // itemData = { type: 'PRODUCT', productId: product.id, unitPrice: parseFloat(product.price) };
                alert('Produtos ainda não implementados.');
                return;
            }

            await api.post(`/orders/${id}/items`, { ...itemData, quantity: parseInt(quantity) });

            setIsAddingItem(false);
            setSelectedItem('');
            setQuantity(1);
            fetchOrder();
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

    const handleCloseOrder = async () => {
        if (!confirm('Deseja fechar e receber o pagamento desta comanda?')) return;
        try {
            await api.post(`/orders/${id}/pay`, { paymentMethod });
            alert('Comanda fechada com sucesso!');
            fetchOrder();
            setIsPaying(false);
        } catch (err) {
            alert('Erro ao fechar comanda');
        }
    };

    if (loading) return <div className="p-8">Carregando...</div>;
    if (!order) return <div className="p-8">Comanda não encontrada.</div>;

    return (
        <div className="space-y-6 text-slate-900 dark:text-white pb-20">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition">
                <ArrowLeft className="w-4 h-4" /> Voltar
            </button>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 right-0 p-4 ${order.status === 'OPEN' ? 'bg-orange-500' : 'bg-green-500'} text-white rounded-bl-3xl font-black text-sm uppercase tracking-widest`}>
                    {order.status === 'OPEN' ? 'EM ABERTO' : 'PAGO'}
                </div>

                <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Comanda #{order.id.slice(0, 8)}</h1>
                <div className="flex flex-col md:flex-row gap-6 text-slate-500">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" /> Cliente: <span className="font-bold text-slate-900 dark:text-white">{order.client?.name || 'Cliente'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4" /> Profissional: <span className="font-bold text-slate-900 dark:text-white">{order.professional?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Data: <span className="font-bold text-slate-900 dark:text-white">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h2 className="font-black uppercase tracking-wider text-sm flex items-center gap-2">Itens do Consumo</h2>
                    {order.status === 'OPEN' && (
                        <button
                            onClick={() => setIsAddingItem(true)}
                            className="text-orange-500 font-bold text-xs uppercase hover:bg-orange-50 dark:hover:bg-orange-900/20 px-3 py-1 rounded-lg transition"
                        >
                            + Adicionar Item
                        </button>
                    )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {order.items?.length === 0 && <div className="p-8 text-center text-slate-400">Nenhum item adicionado.</div>}
                    {order.items?.map(item => (
                        <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500">
                                    {item.type === 'SERVICE' ? <Scissors className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-bold text-sm uppercase">{item.service?.name || item.product?.name || 'Item desconhecido'}</p>
                                    <p className="text-xs text-slate-500">{item.quantity}x R$ {item.unitPrice}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-black text-lg">R$ {item.total}</span>
                                {order.status === 'OPEN' && (
                                    <button onClick={() => handleRemoveItem(item.id)} className="text-slate-300 hover:text-red-500 transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-900 flex flex-col items-end gap-2">
                    <div className="flex justify-between w-full md:w-1/3 text-slate-500">
                        <span>Subtotal</span>
                        <span>R$ {order.subtotal}</span>
                    </div>
                    {/* Discount logic could be added here */}
                    <div className="flex justify-between w-full md:w-1/3 text-2xl font-black text-slate-900 dark:text-white mt-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <span>TOTAL</span>
                        <span>R$ {parseFloat(order.total).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {order.status === 'OPEN' && (
                <div className="flex justify-end sticky bottom-6">
                    <button
                        onClick={() => setIsPaying(true)}
                        className="bg-green-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-green-500/30 hover:bg-green-600 transition hover:scale-105 active:scale-95"
                    >
                        <DollarSign className="w-6 h-6" /> Fechar & Receber
                    </button>
                </div>
            )}

            {/* Add Item Modal */}
            {isAddingItem && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-6">
                        <h2 className="text-xl font-black uppercase mb-4">Adicionar Item</h2>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div className="flex gap-2 mb-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                <button type="button" onClick={() => setItemType('SERVICE')} className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase ${itemType === 'SERVICE' ? 'bg-white shadow-sm dark:bg-slate-700 text-orange-500' : 'text-slate-400'}`}>Serviço</button>
                                <button type="button" onClick={() => setItemType('PRODUCT')} className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase ${itemType === 'PRODUCT' ? 'bg-white shadow-sm dark:bg-slate-700 text-orange-500' : 'text-slate-400'}`}>Produto</button>
                            </div>

                            {itemType === 'SERVICE' ? (
                                <select
                                    className="w-full p-3 border rounded-xl dark:bg-slate-800"
                                    value={selectedItem}
                                    onChange={e => setSelectedItem(e.target.value)}
                                    required
                                >
                                    <option value="">Selecione o Serviço...</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
                                </select>
                            ) : (
                                <p className="text-center text-slate-500 py-4">Módulo de produtos em breve.</p>
                            )}

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Quantidade</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                    className="w-full p-3 border rounded-xl dark:bg-slate-800"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setIsAddingItem(false)} className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 p-3 bg-orange-500 text-white rounded-xl font-bold">Adicionar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pay Modal */}
            {isPaying && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-6">
                        <h2 className="text-xl font-black uppercase mb-4">Finalizar Pagamento</h2>
                        <div className="mb-6 text-center">
                            <p className="text-slate-500 text-sm">Valor Total</p>
                            <p className="text-4xl font-black">R$ {parseFloat(order.total).toFixed(2)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button
                                onClick={() => setPaymentMethod('CASH')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 font-bold transition ${paymentMethod === 'CASH' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-500' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
                            >
                                <Banknote /> Dinheiro
                            </button>
                            <button
                                onClick={() => setPaymentMethod('CARD')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 font-bold transition ${paymentMethod === 'CARD' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-500' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
                            >
                                <CreditCard /> Cartão
                            </button>
                            <button
                                onClick={() => setPaymentMethod('PIX')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 font-bold transition ${paymentMethod === 'PIX' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-500' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
                            >
                                <img src="/pix-icon.svg" /* Placeholder */ className="w-6 h-6" alt="PIX" /> PIX
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsPaying(false)} className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">Cancelar</button>
                            <button onClick={handleCloseOrder} className="flex-1 p-3 bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/20">Confirmar Pagamento</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
