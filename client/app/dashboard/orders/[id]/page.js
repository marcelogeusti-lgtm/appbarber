'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { ensureArray } from '../../../../lib/utils/arrays';
import {
    Receipt, User, Calendar, Clock, Plus, Trash2,
    CreditCard, CheckCircle, AlertCircle, Scissors, Package, Percent, X,
    Zap, DollarSign, Globe, Loader2, ScrollText, Download, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

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
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [discountValue, setDiscountValue] = useState(0);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [processing, setProcessing] = useState(false);


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
        }
    };

    const fetchResources = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const bId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            if (bId) {
                const [prodRes, servRes] = await Promise.all([
                    api.get(`/products?barbershopId=${bId}&limit=1000`),
                    api.get(`/services?barbershopId=${bId}&limit=1000`)
                ]);
                setProducts(ensureArray(prodRes));
                setServices(ensureArray(servRes));
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
            fetchOrder();
        } catch (err) {
            toast.error('Erro ao adicionar item');
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (!confirm('Remover este item?')) return;
        try {
            await api.delete(`/orders/items/${itemId}`);
            fetchOrder();
        } catch (err) {
            toast.error('Erro ao remover item');
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
            toast.error('Erro ao aplicar desconto');
        }
    };

    const handleOpenPayment = () => {
        setShowPaymentModal(true);
    };

    const handleConfirmPayment = async (isAutomatic = false) => {
        if (!selectedMethod && !isAutomatic) {
            toast.error('Selecione uma forma de pagamento.');
            return;
        }

        setProcessing(true);
        try {
            await api.post(`/orders/${id}/pay`, {
                discount: order.discount || 0
            });

            // Refresh order
            await fetchOrder();

            setShowPaymentModal(false);
            setSelectedMethod('');
            toast.success('Comanda finalizada com sucesso!');

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Erro ao processar pagamento.';
            toast.error(`Erro: ${msg}`);
        } finally {
            setProcessing(false);
        }
    };



    const formatBRL = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Sincronizando comanda...</div>;
    if (!order) return <div className="p-8 text-center text-destructive font-black uppercase text-xs tracking-widest">Comanda não encontrada</div>;

    const isClosed = order.status === 'CLOSED' || order.status === 'PAID';

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 md:p-8 rounded-xl border border-border shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32" />
                <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                    <div className={`p-4 rounded-xl border shadow-inner ${isClosed ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/10 text-secondary border-secondary/20'}`}>
                        <Receipt className="w-8 h-8 md:w-10 md:h-10" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-foreground">Comanda #{order.id.slice(0, 6)}</h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${isClosed
                                ? 'bg-primary/10 border-primary/30 text-primary'
                                : 'bg-secondary/10 border-secondary/30 text-secondary-foreground'
                                }`}>
                                {isClosed ? 'Finalizada' : 'Aberta'}
                            </span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-muted-foreground text-sm font-bold uppercase tracking-widest italic">
                            <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {order.client?.name || order.guestName || 'Venda Avulsa'}</span>
                            <span className="flex items-center gap-2 text-[10px]"><Calendar className="w-4 h-4" /> {new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                </div>

                {!isClosed && (
                    <button
                        onClick={handleOpenPayment}
                        className="w-full md:w-auto relative z-10 bg-primary text-primary-foreground px-8 py-4 md:px-10 md:py-5 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition active:scale-95 flex items-center justify-center gap-3"
                    >
                        <CheckCircle className="w-6 h-6" /> Finalizar Conta
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Items List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                        <div className="p-6 md:p-8 border-b border-border bg-muted/20 flex justify-between items-center">
                            <h3 className="text-foreground font-black uppercase text-sm tracking-widest flex items-center gap-3">
                                <Receipt className="w-5 h-5 text-primary" /> Itens do Pedido
                            </h3>
                        </div>
                        <div className="p-6 md:p-8 space-y-4">
                            {ensureArray(order.items).map(item => (
                                <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-background rounded-xl border border-border group hover:border-primary/30 transition-all gap-4">
                                    <div className="flex items-center gap-5">
                                        <div className="p-3 md:p-4 bg-muted rounded-xl text-muted-foreground border border-border group-hover:text-primary transition-colors">
                                            {item.type === 'SERVICE' ? <Scissors className="w-5 h-5 md:w-6 md:h-6" /> : <Package className="w-5 h-5 md:w-6 md:h-6" />}
                                        </div>
                                        <div>
                                            <p className="text-foreground font-black uppercase text-xs md:text-sm tracking-tight">{item.service?.name || item.product?.name || 'Item desconhecido'}</p>
                                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mt-1">{item.type === 'SERVICE' ? 'Serviço' : 'Produto'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto pl-16 md:pl-0">
                                        <div className="text-right">
                                            <p className="text-primary font-black text-lg md:text-xl uppercase tracking-tighter">{formatBRL(item.total)}</p>
                                            <p className="text-muted-foreground text-[10px] uppercase font-bold">{item.quantity}x R$ {formatBRL(item.unitPrice)}</p>
                                        </div>
                                        {!isClosed && (
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="p-3 text-destructive bg-destructive/5 rounded-xl border border-transparent hover:border-destructive/30 hover:bg-destructive/10 transition-all opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {order.items?.length === 0 && (
                                <div className="text-center py-24 text-muted-foreground font-black uppercase tracking-widest text-[10px] italic bg-muted/10 rounded-xl border-2 border-dashed border-border">
                                    Nenhum item adicionado à comanda.
                                </div>
                            )}
                        </div>

                        {!isClosed && (
                            <div className="p-6 md:p-8 bg-muted/30 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Add Service Dropdown */}
                                <div className="relative group">
                                    <button className="w-full p-4 md:p-5 bg-secondary text-secondary-foreground rounded-xl border border-border font-black text-[10px] uppercase tracking-widest hover:bg-secondary/80 transition flex items-center justify-center gap-3">
                                        <Scissors className="w-5 h-5" /> Add Serviço
                                    </button>
                                    <div className="absolute bottom-full left-0 w-full mb-4 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden hidden group-hover:block max-h-72 overflow-y-auto z-20">
                                        {ensureArray(services).length > 0 ? ensureArray(services).map(serv => (
                                            <button
                                                key={serv.id}
                                                onClick={() => handleAddItem('SERVICE', serv.id)}
                                                className="w-full text-left p-4 hover:bg-muted text-foreground text-xs font-black uppercase tracking-tight border-b border-border/50 last:border-0 transition"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span>{serv.name}</span>
                                                    <span className="text-primary">{formatBRL(serv.price)}</span>
                                                </div>
                                            </button>
                                        )) : (
                                            <div className="p-4 text-center text-muted-foreground text-[10px] font-black uppercase">Nenhum serviço disponível</div>
                                        )}
                                    </div>
                                </div>

                                {/* Add Product Dropdown */}
                                <div className="relative group">
                                    <button className="w-full p-4 md:p-5 bg-secondary text-secondary-foreground rounded-xl border border-border font-black text-[10px] uppercase tracking-widest hover:bg-secondary/80 transition flex items-center justify-center gap-3">
                                        <Package className="w-5 h-5" /> Add Produto
                                    </button>
                                    <div className="absolute bottom-full left-0 w-full mb-4 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden hidden group-hover:block max-h-72 overflow-y-auto z-20">
                                        {ensureArray(products).length > 0 ? ensureArray(products).map(prod => (
                                            <button
                                                key={prod.id}
                                                onClick={() => handleAddItem('PRODUCT', prod.id)}
                                                className="w-full text-left p-4 hover:bg-muted text-foreground text-xs font-black uppercase tracking-tight border-b border-border/50 last:border-0 transition"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span>{prod.name}</span>
                                                    <span className="text-primary">{formatBRL(prod.price)}</span>
                                                </div>
                                            </button>
                                        )) : (
                                            <div className="p-4 text-center text-muted-foreground text-[10px] font-black uppercase">Nenhum produto disponível</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card p-8 md:p-10 rounded-xl md:rounded-xl border border-border shadow-xl sticky top-8">
                        <h3 className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] mb-8">Resumo do Fechamento</h3>

                        <div className="space-y-5 mb-10 border-b border-border pb-10">
                            <div className="flex justify-between text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-foreground">{formatBRL(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                                <span>Desconto</span>
                                <span className="text-destructive">- {formatBRL(order.discount)}</span>
                            </div>
                            <div className="flex justify-between items-end text-foreground pt-6 border-t border-border/50">
                                <span className="text-xs font-black uppercase tracking-widest">Total da Comanda</span>
                                <span className="text-3xl md:text-4xl font-black text-primary uppercase tracking-tighter leading-none">{formatBRL(order.total)}</span>
                            </div>

                            {order.totalPaid > 0 && (
                                <>
                                    <div className="flex justify-between text-muted-foreground font-bold uppercase text-[10px] tracking-widest pt-4">
                                        <span>Total Já Pago</span>
                                        <span className="text-primary font-black">{formatBRL(order.totalPaid)}</span>
                                    </div>
                                    <div className="flex justify-between text-foreground font-black uppercase text-xs tracking-widest pt-4 mt-4 border-t-2 border-dashed border-border/50">
                                        <span>Saldo Devedor</span>
                                        <span className="text-2xl text-primary">{formatBRL(order.balance)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="space-y-4">
                            {isClosed && (
                                <div className="space-y-4">
                                    <div className="p-6 bg-primary/10 rounded-xl border border-primary/20 flex flex-col gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className="p-3 bg-primary text-primary-foreground rounded-xl">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-primary">Liquidado via {order.paymentMethod || 'Caixa'}</p>
                                                <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mt-1">{new Date(order.paidAt).toLocaleString('pt-BR')}</p>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            )}

                            {!isClosed && order.balance > 0 && (
                                <button
                                    onClick={handleOpenPayment}
                                    className="w-full relative z-10 bg-primary text-primary-foreground px-10 py-5 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition active:scale-95 flex items-center justify-center gap-3 mb-4"
                                >
                                    <DollarSign className="w-5 h-5" /> Pagar Saldo {formatBRL(order.balance)}
                                </button>
                            )}

                            {!isClosed && (
                                <button
                                    onClick={() => {
                                        setDiscountValue(order.discount || 0);
                                        setShowDiscountModal(true);
                                    }}
                                    className="w-full p-5 bg-background text-foreground rounded-xl border border-border font-black text-[10px] uppercase tracking-widest hover:bg-muted transition flex items-center justify-center gap-3 shadow-inner"
                                >
                                    <Percent className="w-5 h-5 text-primary" /> Aplicar Desconto
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Discount Modal */}
            {showDiscountModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 md:p-8 border-b border-border bg-muted/20 flex justify-between items-center">
                            <h3 className="text-foreground font-black text-lg uppercase tracking-widest flex items-center gap-3">
                                <Percent className="w-6 h-6 text-primary" />
                                Ajustar Desconto
                            </h3>
                            <button
                                onClick={() => setShowDiscountModal(false)}
                                className="p-2 hover:bg-muted rounded-xl transition text-muted-foreground"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 md:p-8 space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Valor do Desconto (R$)</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-xl">R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={order.subtotal}
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(e.target.value)}
                                        className="w-full p-6 pl-16 bg-background border border-border rounded-xl text-foreground font-black text-2xl focus:ring-4 ring-primary/10 outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="bg-muted/50 p-6 rounded-xl border border-border space-y-3 shadow-inner">
                                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    <span>Subtotal Original</span>
                                    <span>{formatBRL(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] font-black text-destructive uppercase tracking-widest">
                                    <span>Abatimento</span>
                                    <span>- {formatBRL(discountValue)}</span>
                                </div>
                                <div className="flex justify-between items-end text-foreground pt-4 border-t border-border">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Novo Total</span>
                                    <span className="text-2xl font-black text-primary uppercase tracking-tighter">{formatBRL(order.subtotal - (parseFloat(discountValue) || 0))}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDiscountModal(false)}
                                    className="flex-1 p-5 bg-background border border-border rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-muted transition text-foreground"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleApplyDiscount}
                                    className="flex-1 p-5 bg-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 transition text-primary-foreground shadow-2xl shadow-primary/20"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Selection Modal - RESPONSIVE FIX */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[60] flex items-center justify-center p-2 md:p-4 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-lg rounded-xl md:rounded-xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">

                        <div className="p-6 md:p-10 border-b border-border bg-muted/10 shrink-0">
                            <h3 className="text-foreground font-black text-2xl md:text-3xl uppercase tracking-tighter mb-2">Finalizar Comanda</h3>
                            <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest italic">Escolha o método para processamento.</p>
                        </div>

                        <div className="overflow-y-auto p-6 md:p-10">
                            <div className="grid grid-cols-2 gap-3 md:gap-5 mb-6 md:mb-8">
                                {[
                                    { id: 'PIX', label: 'Pix', icon: '⚡' },
                                    { id: 'CASH', label: 'Dinheiro', icon: '💵' },
                                    { id: 'CREDIT_CARD', label: 'Crédito', icon: '💳' },
                                    { id: 'DEBIT_CARD', label: 'Débito', icon: '🏧' },
                                ].map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedMethod(method.id)}
                                        className={`p-4 md:p-6 rounded-xl border-2 flex flex-col items-center gap-2 md:gap-3 transition-all duration-300 ${selectedMethod === method.id
                                            ? 'border-primary bg-primary/5 text-primary shadow-xl shadow-primary/10 scale-105'
                                            : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/50'
                                            }`}
                                    >
                                        <span className="text-2xl md:text-3xl">{method.icon}</span>
                                        <span className="font-black text-[10px] uppercase tracking-widest">{method.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mb-6 md:mb-8 px-2">
                                <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest italic">Valor Final</span>
                                <span className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tighter">{formatBRL(order.total)}</span>
                            </div>

                            {/* Informativo sobre Método Selecionado */}
                            {selectedMethod && (
                                <div className="mb-6 p-4 bg-muted/30 rounded-xl border border-border text-center">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Método Selecionado</p>
                                    <p className="text-sm font-black text-primary uppercase">
                                        {[
                                            { id: 'PIX', label: 'Pix (Registro Manual)' },
                                            { id: 'CASH', label: 'Dinheiro' },
                                            { id: 'CREDIT_CARD', label: 'Cartão de Crédito' },
                                            { id: 'DEBIT_CARD', label: 'Cartão de Débito' },
                                        ].find(m => m.id === selectedMethod)?.label}
                                    </p>
                                    {selectedMethod === 'PIX' && (
                                        <div className="mt-2 text-[10px] text-yellow-500 font-bold bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                                            ⚠️ Este sistema NÃO gera cobrança Pix. <br /> Receba na sua conta e apenas confirme aqui.
                                        </div>
                                    )}
                                </div>
                            )}



                            <button
                                onClick={() => handleConfirmPayment(false)}
                                disabled={processing || !selectedMethod}
                                className={`w-full py-5 md:py-6 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 scale-100 active:scale-95 ${processing || !selectedMethod
                                    ? 'bg-muted text-muted-foreground/30 border border-border cursor-not-allowed opacity-50'
                                    : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl shadow-primary/20 flex items-center justify-center gap-2'
                                    }`}
                            >
                                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CONFIRMAR BAIXA MANUAL'}
                            </button>

                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="w-full mt-4 md:mt-6 py-3 text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-foreground transition-colors"
                            >
                                Voltar para a comanda
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
