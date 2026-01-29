'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    MapPin, Search, Star, Heart, Share2,
    ChevronLeft, ShoppingBag, Clock, CalendarCheck,
    Banknote, CreditCard, ArrowLeft, Users, Bell, Zap
} from 'lucide-react';
import dynamic from 'next/dynamic';
import api from '../../lib/clientApi';
import CardForm from '../../components/payment/CardForm';

// Dynamic Sub-components (Lazy Loaded)
const ServicesTab = dynamic(() => import('../../components/client-view/ServicesTab'), {
    loading: () => <TabSkeleton />,
    ssr: false // Optimization: These are interactive tabs, mostly client-side
});
const DetailsTab = dynamic(() => import('../../components/client-view/DetailsTab'), { loading: () => <TabSkeleton /> });
const ProfessionalsTab = dynamic(() => import('../../components/client-view/ProfessionalsTab'), { loading: () => <TabSkeleton /> });
const ProductsTab = dynamic(() => import('../../components/client-view/ProductsTab'), { loading: () => <TabSkeleton /> });
const LoyaltyTab = dynamic(() => import('../../components/client-view/LoyaltyTab'), { loading: () => <TabSkeleton /> });
const PackagesTab = dynamic(() => import('../../components/client-view/PackagesTab'), { loading: () => <TabSkeleton /> });
const SubscriptionsTab = dynamic(() => import('../../components/client-view/SubscriptionsTab'), { loading: () => <TabSkeleton /> });
const ReviewsTab = dynamic(() => import('../../components/client-view/ReviewsTab'), { loading: () => <TabSkeleton /> });

function TabSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-10 bg-white/5 rounded-xl w-3/4"></div>
            <div className="h-32 bg-white/5 rounded-xl"></div>
            <div className="h-32 bg-white/5 rounded-xl"></div>
        </div>
    )
}

export default function BarbershopPage() {
    const params = useParams();
    const router = useRouter();
    const { slug } = params;
    // Ensure slug is decoded properly (e.g. dealing with failed automations that result in encoded URLs)
    const effectiveSlug = slug ? decodeURIComponent(slug) : null;

    const [barbershop, setBarbershop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('servicos');
    // Cards State
    const [savedCards, setSavedCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState('');
    const [cvv, setCvv] = useState('');
    const [saveCardForFuture, setSaveCardForFuture] = useState(false);

    useEffect(() => {
        if (barbershop?.id) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                api.get(`/payments/cards?barbershopId=${barbershop.id}`)
                    .then(res => {
                        setSavedCards(res.data);
                        if (res.data.length > 0) setSelectedCardId(res.data[0].id);
                        else setSelectedCardId('new');
                    })
                    .catch(err => console.error("Failed to load cards", err));
            }
        }
    }, [barbershop]);
    const [products, setProducts] = useState([]);
    const [mySubscription, setMySubscription] = useState(null);
    const [points, setPoints] = useState(0);
    const [logoLightboxOpen, setLogoLightboxOpen] = useState(false);

    // Booking Logic State
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [paymentType, setPaymentType] = useState('local'); // 'local' | 'online'
    const [paymentMethod, setPaymentMethod] = useState('PIX'); // 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD'
    const [checkoutData, setCheckoutData] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        birthday: '',
        date: '',
        time: '',
        createAccount: false,
        password: '',
        reminderMinutes: '60'
    });

    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [pendingFees, setPendingFees] = useState([]);

    async function processCardPayment(token, issuerId, paymentMethodId, installments) {
        try {
            // If this is a "saved card" flow, token should be generated via CVV
            // If New Card, token comes from form

            const payload = {
                appointmentId: checkoutData.appointmentId,
                token,
                issuerId,
                paymentMethodId,
                installments,
                payer: {
                    email: formData.email,
                    name: formData.name
                }
            };

            await api.post('/payments/card', payload);
            setCheckoutData(prev => ({ ...prev, status: 'paid' })); // Optimistic update or wait for poll
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Erro ao processar pagamento.');
        }
    }

    // Waitlist State
    const [waitlistOpen, setWaitlistOpen] = useState(false);
    const [waitlistNote, setWaitlistNote] = useState('');
    const [waitlistLoading, setWaitlistLoading] = useState(false);

    useEffect(() => {
        if (!effectiveSlug) return;

        // 1. Critical Data: Barbershop Info (Header + Services + Staff)
        async function loadBarbershop() {
            try {
                const res = await api.get(`/barbershops/${effectiveSlug}`);
                setBarbershop(res.data);
                setLoading(false); // <--- SHOW UI NOW!

                // 2. Secondary Data: Products (Background)
                loadProducts(res.data.id);

                // 3. User Data (Background)
                loadUserData(res.data.id);

            } catch (err) {
                console.error(err);
                setLoading(false); // Stop loading even on error
            }
        }

        async function loadProducts(id) {
            try {
                const prodRes = await api.get(`/products?barbershopId=${id}`);
                setProducts(prodRes.data);
            } catch (e) { console.error('Error loading products', e); }
        }

        async function loadUserData(barbershopId) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setFormData(prev => ({
                    ...prev,
                    name: user.name || prev.name,
                    phone: user.phone || prev.phone,
                    email: user.email || prev.email
                }));

                // Parallel fetches for user specific info
                Promise.allSettled([
                    api.get('/subscription/my-active').then(res => setMySubscription(res.data || null)),
                    api.get(`/appointments/pending-fees?barbershopId=${barbershopId}`).then(res => setPendingFees(res.data || [])),
                    api.get('/appointments/me').then(res => {
                        const completed = res.data.filter(a => a.status === 'COMPLETED').length;
                        setPoints(completed * 10);
                    })
                ]).catch(console.error);
            }
        }

        loadBarbershop();

        const saved = localStorage.getItem('guestData');
        if (saved) {
            setFormData(prev => ({ ...prev, ...JSON.parse(saved) }));
        }
    }, [effectiveSlug]);

    useEffect(() => {
        if (step === 6 && checkoutData?.status === 'pending' && checkoutData?.paymentId) {
            const interval = setInterval(async () => {
                try {
                    const res = await api.get(`/payments/${checkoutData.paymentId}`);
                    if (res.data.status === 'paid') {
                        setCheckoutData(prev => ({ ...prev, status: 'paid' }));
                        clearInterval(interval);
                    }
                } catch (e) { console.error('Polling error', e); }
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [step, checkoutData]);

    useEffect(() => {
        if (!formData.date || !selectedProfessional || !barbershop || !selectedService) return;

        async function fetchSlots() {
            setLoadingSlots(true);
            try {
                const res = await api.get(`/availability/${barbershop.id}/${formData.date}?serviceIds=${selectedService.id}`);
                const proData = res.data.find(p => p.proId === selectedProfessional.id);
                setAvailableSlots(proData?.slots || []);
            } catch (err) {
                console.error('Error fetching slots:', err);
                setAvailableSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        }
        fetchSlots();
    }, [formData.date, selectedProfessional, barbershop, selectedService]);

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setStep(1); // Reset step when new service selected
    };

    const handleProfessionalSelect = (pro) => {
        setSelectedProfessional(pro);
        setStep(2);
    };

    const handleProductToggle = (product) => {
        if (selectedProducts.find(p => p.id === product.id)) {
            setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
        } else {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const totalValue = useMemo(() => {
        const servicePrice = Number(selectedService?.price || 0);
        const productsPrice = selectedProducts?.reduce((sum, p) => sum + Number(p.price || 0), 0) || 0;
        const feesTotal = pendingFees?.reduce((sum, f) => sum + Number(f.feeValue || 0), 0) || 0;
        return servicePrice + productsPrice + feesTotal;
    }, [selectedService, selectedProducts, pendingFees]);

    const handleBook = async () => {
        try {
            if (!formData.name || !formData.phone || !formData.date || !formData.time) {
                return alert('Preencha os dados obrigatórios (Nome, Telefone, Data e Hora)');
            }

            const payload = {
                cliente_nome: formData.name,
                cliente_telefone: formData.phone,
                barbearia_id: barbershop?.id,
                barbeiro_id: selectedProfessional?.id,
                servicos: [{
                    servico_id: selectedService?.id,
                    nome: selectedService?.name,
                    valor: Number(selectedService?.price || 0),
                    duracao_minutos: selectedService?.duration
                }],
                produtos: selectedProducts?.map(p => ({
                    produto_id: p.id,
                    nome: p.name,
                    valor: Number(p.price || 0)
                })) || [],
                data: formData.date,
                horario: formData.time,
                valor_total: Number(totalValue || 0),
                forma_pagamento: paymentType === 'online' ? paymentMethod : 'local',
                status: paymentType === 'online' ? "pendente" : "confirmado",
                email: formData.email,
                data_nascimento: formData.birthday,
                criar_conta: formData.createAccount,
                senha: formData.password,
                lembrete_minutos: formData.reminderMinutes ? parseInt(formData.reminderMinutes) : null
            };

            const res = await api.post('/appointments', payload);
            const appointmentId = res.data.appointment_id;

            if (paymentType === 'online' && paymentMethod === 'PIX') {
                // SEPARATE REQUEST FOR PIX as per architecture rule
                try {
                    const pixRes = await api.post('/payments/pix', { appointmentId });
                    setCheckoutData(pixRes.data);
                    setStep(6); // Success / Checkout State ONLY if Pix generated
                } catch (pixErr) {
                    console.error('Erro ao gerar Pix:', pixErr);
                    const msg = pixErr.response?.data?.error || 'Erro ao gerar Pix. Tente novamente ou pague no local.';
                    alert(msg);
                    return; // STOP execution, do not show success screen
                }
            } else if (paymentType === 'online' && (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD')) {
                // Card Payment Flow - We moved to Step 6 to collect card details
                // The Appointment is created, now we need to capture payment
                setCheckoutData({
                    status: 'pending_card',
                    appointmentId,
                    amount: totalValue,
                    method: paymentMethod
                });
                setStep(6);
            } else {
                // Local Payment
                setStep(6);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Erro ao agendar');
        }
    };

    const handleJoinWaitlist = async () => {
        if (!formData.name || !formData.phone) {
            return alert('Por favor, preencha Nome e Telefone na etapa anterior ou no formulário.');
        }

        setWaitlistLoading(true);
        try {
            await api.post('/waitlist', {
                barbershopId: barbershop.id,
                serviceId: selectedService.id,
                professionalId: selectedProfessional.id,
                clientName: formData.name,
                clientPhone: formData.phone,
                date: formData.date,
                notes: waitlistNote
            });
            alert('Você foi adicionado à lista de espera! Avisaremos se surgir uma vaga.');
            setWaitlistOpen(false);
            setWaitlistNote('');
        } catch (err) {
            console.error(err);
            alert('Erro ao entrar na lista de espera.');
        } finally {
            setWaitlistLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
    );

    if (!barbershop) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-black">BARBEARIA NÃO ENCONTRADA</div>;

    const tabs = [
        { id: 'servicos', label: 'SERVIÇOS' },
        { id: 'detalhes', label: 'DETALHES' },
        { id: 'profissionais', label: 'PROFISSIONAIS' },
        { id: 'produtos', label: 'PRODUTOS' },
        { id: 'fidelidade', label: 'FIDELIDADE' },
        { id: 'assinaturas', label: 'ASSINATURAS' },
        { id: 'avaliacoes', label: 'AVALIAÇÕES' },
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
            {/* Header / Cover */}
            <header className="relative h-64 w-full overflow-hidden group">
                {barbershop.bannerUrls && barbershop.bannerUrls.length > 0 ? (
                    <BannerCarousel images={barbershop.bannerUrls} />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-black z-0"></div>
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10 pointer-events-none"></div>

                <div className="absolute top-6 left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0 z-20 flex items-center gap-4 w-full justify-between sm:justify-start px-4 sm:px-0">
                    <button onClick={() => window.history.back()} className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/70 transition">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex gap-3 sm:hidden">
                        <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:text-red-500 transition"><Heart className="w-5 h-5" /></button>
                        <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:text-emerald-500 transition"><Share2 className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="absolute top-6 right-6 z-20 gap-3 hidden sm:flex">
                    <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:text-red-500 transition"><Heart className="w-5 h-5" /></button>
                    <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:text-emerald-500 transition"><Share2 className="w-5 h-5" /></button>
                </div>

                <div className="absolute -bottom-12 left-0 right-0 z-20 px-6 flex flex-col items-center text-center pointer-events-none">
                    <div className="pointer-events-auto cursor-zoom-in" onClick={() => setLogoLightboxOpen(true)}>
                        <div className="w-24 h-24 rounded-full bg-[#111] border-4 border-black shadow-2xl flex items-center justify-center overflow-hidden mb-3 hover:scale-105 transition-transform">
                            {barbershop.logoUrl ? (
                                <img src={barbershop.logoUrl} alt={barbershop.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-black text-3xl text-emerald-500 tracking-tighter">{barbershop.name.charAt(0)}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold mb-1">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-yellow-500" />)}
                        <span className="text-white ml-2">5.0</span>
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-1 leading-none drop-shadow-lg">{barbershop.name}</h1>
                    <div className="flex items-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-widest max-w-[80%] drop-shadow-md">
                        <MapPin className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{barbershop.address || 'Endereço não informado'}</span>
                    </div>
                </div>
            </header>

            {/* LOGO LIGHTBOX */}
            {logoLightboxOpen && (
                <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setLogoLightboxOpen(false)}>
                    <div className="relative max-w-lg w-full aspect-square bg-[#111] rounded-full border-4 border-slate-800 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        {barbershop.logoUrl ? (
                            <img src={barbershop.logoUrl} alt={barbershop.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="font-black text-9xl text-emerald-500 tracking-tighter">{barbershop.name.charAt(0)}</span>
                            </div>
                        )}
                        <button className="absolute top-8 right-8 bg-black/50 text-white rounded-full p-2 hover:bg-red-500/20 hover:text-red-500 transition" onClick={() => setLogoLightboxOpen(false)}>
                            X
                        </button>
                    </div>
                </div>
            )}

            <div className="h-20"></div>

            {/* Navigation Tabs */}
            <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-xl border-b border-white/10 px-6 pt-4">
                <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide snap-x">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 text-xs font-black uppercase tracking-widest transition-colors relative snap-start ${activeTab === tab.id ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute -bottom-4 left-0 right-0 h-1 bg-blue-500 rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <main className="px-6 py-8 min-h-[50vh]">
                {activeTab === 'servicos' && <ServicesTab services={barbershop.services || []} onSelect={handleServiceSelect} />}
                {activeTab === 'detalhes' && <DetailsTab barbershop={barbershop} />}
                {activeTab === 'profissionais' && <ProfessionalsTab professionals={barbershop.staff || []} />}
                {activeTab === 'produtos' && <ProductsTab products={products} />}
                {activeTab === 'fidelidade' && <LoyaltyTab points={points} />}
                {activeTab === 'pacotes' && <PackagesTab plans={barbershop.packages || []} />}
                {activeTab === 'assinaturas' && <SubscriptionsTab plans={barbershop.subscriptionPlans || []} />}
                {activeTab === 'avaliacoes' && <ReviewsTab />}
            </main>

            {/* BOOKING MODAL */}
            {selectedService && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-[#111827] w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#0b0f19]">
                            <div className="flex items-center gap-4">
                                {step > 1 && step < 5 && (
                                    <button onClick={prevStep} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition">
                                        <ChevronLeft className="w-5 h-5 text-white" />
                                    </button>
                                )}
                                <div>
                                    <h2 className="text-lg font-black uppercase text-white tracking-tight leading-none">Agendamento</h2>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                        {step === 6 ? 'Confirmado' : `Passo ${step} de 5`}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => { setSelectedService(null); setStep(1); setCheckoutData(null); }} className="text-slate-500 hover:text-white transition font-bold text-xs uppercase tracking-widest bg-slate-900 px-4 py-2 rounded-xl">
                                Fechar
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">

                            {/* Step 6: Success / Checkout */}
                            {step === 6 && (
                                <div className="text-center py-6 space-y-6 animate-in zoom-in">
                                    {checkoutData?.status === 'paid' ? (
                                        <>
                                            <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                                <CalendarCheck className="w-10 h-10 text-white" />
                                            </div>
                                            <h2 className="text-3xl font-black text-white uppercase">Pagamento Confirmado!</h2>
                                            <p className="text-slate-400 text-xs">Seu horário já está garantido e aguardamos você!</p>
                                        </>
                                    ) : checkoutData?.qrCode ? (
                                        <>
                                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full mx-auto flex items-center justify-center">
                                                <Zap className="w-10 h-10 text-emerald-500" />
                                            </div>
                                            <h2 className="text-2xl font-black text-white uppercase">Pague via PIX</h2>
                                            <div className="bg-white p-4 rounded-3xl inline-block mx-auto mb-4">
                                                {checkoutData.qrCodeBase64 ? (
                                                    <img src={`data:image/png;base64,${checkoutData.qrCodeBase64}`} alt="PIX" className="w-48 h-48" />
                                                ) : (
                                                    <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-black text-[8px] font-mono break-all p-4">
                                                        {checkoutData.qrCode}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => { if (checkoutData?.qrCode) { navigator.clipboard.writeText(checkoutData.qrCode); alert('Copiado!'); } }}
                                                className="w-full py-4 bg-slate-900 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition truncate px-4"
                                            >
                                                Copiar Código PIX
                                            </button>
                                        </>
                                    ) : checkoutData?.status === 'pending_card' ? (
                                        <>
                                            <div className="text-left w-full max-w-md mx-auto">
                                                <h2 className="text-xl font-black text-white uppercase text-center mb-6">Pagamento com Cartão</h2>

                                                <CardForm
                                                    publicKey={barbershop.gatewayConfigs?.find(g => g.gateway === 'MERCADOPAGO')?.publicKey}
                                                    amount={totalValue}
                                                    onSubmit={async (cardData) => {
                                                        try {
                                                            await api.post('/payments/card', {
                                                                appointmentId: checkoutData.appointmentId,
                                                                token: cardData.token,
                                                                issuerId: cardData.issuer_id,
                                                                paymentMethodId: cardData.payment_method_id,
                                                                installments: cardData.installments,
                                                                payer: {
                                                                    email: formData.email,
                                                                    identification: cardData.payer.identification
                                                                }
                                                            });
                                                            setCheckoutData(prev => ({ ...prev, status: 'paid' }));
                                                        } catch (err) {
                                                            alert('Erro ao processar cartão: ' + (err.response?.data?.error || err.message));
                                                        }
                                                    }}
                                                    onCancel={() => {
                                                        setStep(5); // Go back to payment method selection
                                                        setCheckoutData(null);
                                                    }}
                                                    barbershopId={barbershop.id}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                                <CalendarCheck className="w-10 h-10 text-white" />
                                            </div>
                                            <h2 className="text-3xl font-black text-white uppercase">Tudo Certo!</h2>
                                        </>
                                    )}

                                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3 text-left">
                                        <div className="flex justify-between text-sm"><span className="text-slate-500 uppercase font-bold text-[10px]">Serviço</span><span className="font-bold">{selectedService?.name || 'Agendamento'}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-slate-500 uppercase font-bold text-[10px]">Total</span><span className="font-bold text-emerald-500">{formatCurrency(totalValue || 0)}</span></div>
                                    </div>
                                    <button onClick={() => router.push('/home')} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs uppercase hover:bg-emerald-600 transition tracking-widest">Ver Meus Agendamentos</button>
                                </div>
                            )}

                            {step < 6 && (
                                <div className="space-y-6">
                                    {/* Selected Service Info */}
                                    <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Serviço Selecionado</p>
                                            <h3 className="font-black text-white">{selectedService.name}</h3>
                                        </div>
                                        <span className="font-black text-white">{formatCurrency(selectedService.price)}</span>
                                    </div>

                                    {/* STEP 1: Professional */}
                                    {step === 1 && (
                                        <div className="space-y-4 animate-in slide-in-from-right">
                                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Escolha o Profissional</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {barbershop.staff?.filter(s => ['BARBER', 'ADMIN', 'SUPER_ADMIN'].includes(s.role.toUpperCase())).map(pro => (
                                                    <div key={pro.id} onClick={() => handleProfessionalSelect(pro)} className={`bg-slate-900/50 p-4 rounded-3xl border transition-all text-center group cursor-pointer ${selectedProfessional?.id === pro.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 hover:border-slate-600'}`}>
                                                        <div className="w-14 h-14 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center font-black text-lg text-white group-hover:scale-105 transition">
                                                            {pro.name.charAt(0)}
                                                        </div>
                                                        <p className="font-bold text-white text-[11px] uppercase truncate">{pro.name}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2: Upsell & Total */}
                                    {step === 2 && (
                                        <div className="space-y-6 animate-in slide-in-from-right">
                                            <div className="text-center">
                                                <h3 className="text-lg font-black text-white uppercase">Deseja adicionar algo?</h3>
                                                <p className="text-slate-500 text-xs">Aproveite para garantir seus produtos favoritos</p>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto pr-1">
                                                {products.map(p => {
                                                    const isSel = selectedProducts.find(sp => sp.id === p.id);
                                                    return (
                                                        <div key={p.id} onClick={() => handleProductToggle(p)} className={`p-3 rounded-2xl border flex items-center gap-4 cursor-pointer transition ${isSel ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-900 border-slate-800'}`}>
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSel ? 'bg-emerald-500' : 'bg-slate-800'}`}><ShoppingBag className="w-4 h-4" /></div>
                                                            <div className="flex-1">
                                                                <p className="font-bold text-white text-xs uppercase">{p.name}</p>
                                                                <p className="text-emerald-500 font-bold text-xs">{formatCurrency(p.price)}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex flex-col gap-2">
                                                <div className="flex justify-between items-center text-slate-400">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                                                    <span className="text-xs font-bold">{formatCurrency((selectedService?.price ? Number(selectedService.price) : 0) + selectedProducts.reduce((sum, p) => sum + Number(p.price), 0))}</span>
                                                </div>
                                                {pendingFees.length > 0 && (
                                                    <div className="flex justify-between items-center text-red-400">
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Taxa de No-show ({pendingFees.length}x)</span>
                                                        <span className="text-xs font-bold">{formatCurrency(pendingFees.reduce((s, f) => s + Number(f.feeValue), 0))}</span>
                                                    </div>
                                                )}
                                                <div className="h-px bg-slate-800 my-1"></div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Estimado</span>
                                                    <span className="text-xl font-black text-white">{formatCurrency(totalValue)}</span>
                                                </div>
                                            </div>
                                            <button onClick={nextStep} className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition">Continuar para Data e Hora</button>
                                        </div>
                                    )}

                                    {/* STEP 3: Scheduling */}
                                    {step === 3 && (
                                        <div className="space-y-6 animate-in slide-in-from-right">
                                            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
                                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selecione a Data</h3>
                                                <input
                                                    type="date"
                                                    min={new Date().toISOString().split('T')[0]}
                                                    value={formData.date}
                                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                    className="w-full bg-slate-800 border-none rounded-xl p-3 text-white font-bold text-sm outline-none focus:ring-1 ring-emerald-500"
                                                />
                                            </div>
                                            {formData.date && (
                                                <div className="animate-in fade-in space-y-4">
                                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Horários para {selectedProfessional.name}</h3>
                                                    {loadingSlots ? <p className="text-center text-xs text-slate-500 italic">Buscando disponibilidade...</p> : (
                                                        availableSlots.length > 0 ? (
                                                            <div className="grid grid-cols-4 gap-2">
                                                                {availableSlots.map(slot => (
                                                                    <button key={slot} onClick={() => { setFormData({ ...formData, time: slot }); nextStep(); }} className={`py-3 rounded-xl text-xs font-black transition ${formData.time === slot ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>{slot}</button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center space-y-4 py-4 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed animate-in fade-in">
                                                                <div className="w-12 h-12 bg-slate-800 rounded-full mx-auto flex items-center justify-center">
                                                                    <Bell className="w-6 h-6 text-slate-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-white uppercase">Dia Lotado</p>
                                                                    <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto">Não há horários disponíveis para este profissional nesta data.</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => setWaitlistOpen(true)}
                                                                    className="px-6 py-3 bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase rounded-xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition flex items-center gap-2 mx-auto"
                                                                >
                                                                    <Clock className="w-4 h-4" />
                                                                    Entrar na Lista de Espera
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* STEP 4: Guest Info & Finalize */}
                                    {step === 4 && (
                                        <div className="space-y-6 animate-in slide-in-from-right">
                                            <div className="space-y-4">
                                                <input placeholder="Seu Nome" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white font-bold text-sm outline-none focus:ring-1 ring-emerald-500 transition" />
                                                <input placeholder="Seu Telefone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white font-bold text-sm outline-none focus:ring-1 ring-emerald-500 transition" />
                                            </div>

                                            {/* Reminder Selection - New UI */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Bell className="w-3 h-3 text-emerald-500" />
                                                    Lembretes
                                                </label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, showReminderOptions: !formData.showReminderOptions })}
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-white font-bold text-sm outline-none focus:ring-1 ring-emerald-500 transition"
                                                    >
                                                        <span>
                                                            {formData.reminderMinutes === '' ? 'Não lembrar' :
                                                                formData.reminderMinutes === '30' ? '30 minutos antes' :
                                                                    formData.reminderMinutes === '60' ? '1 hora antes' :
                                                                        formData.reminderMinutes === '120' ? '2 horas antes' : '1 hora antes'}
                                                        </span>
                                                        <ChevronLeft className={`w-5 h-5 text-slate-500 transition-transform ${formData.showReminderOptions ? '-rotate-90' : 'rotate-270'}`} />
                                                    </button>

                                                    {/* Dropdown Options */}
                                                    {formData.showReminderOptions && (
                                                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a202e] border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95">
                                                            {[
                                                                { label: '30 minutos antes', value: '30' },
                                                                { label: '1 hora antes', value: '60' },
                                                                { label: '2 horas antes', value: '120' },
                                                                { label: 'Não lembrar', value: '' }
                                                            ].map(opt => (
                                                                <button
                                                                    key={opt.value}
                                                                    onClick={() => setFormData({ ...formData, reminderMinutes: opt.value, showReminderOptions: false })}
                                                                    className={`w-full text-left p-4 text-sm font-bold transition hover:bg-slate-800 ${formData.reminderMinutes === opt.value ? 'text-emerald-500 bg-emerald-500/5' : 'text-slate-300'}`}
                                                                >
                                                                    {opt.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Payment Selection - Integrated */}
                                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Banknote className="w-3 h-3 text-emerald-500" />
                                                    Pagamento
                                                </h3>

                                                <div className="grid grid-cols-1 gap-3">
                                                    <div onClick={() => setPaymentType('local')} className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition ${paymentType === 'local' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 group hover:border-slate-700'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentType === 'local' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                                <Banknote className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className={`font-bold text-xs uppercase ${paymentType === 'local' ? 'text-emerald-500' : 'text-slate-300'}`}>Pagar no Local</p>
                                                            </div>
                                                        </div>
                                                        {paymentType === 'local' && <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                                                    </div>

                                                    {/* ALWAYS SHOW ONLINE OPTION (User Request) */}
                                                    <div onClick={() => setPaymentType('online')} className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition ${paymentType === 'online' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 group hover:border-slate-700'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentType === 'online' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                                <Zap className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className={`font-bold text-xs uppercase ${paymentType === 'online' ? 'text-emerald-500' : 'text-slate-300'}`}>Pagar Online</p>
                                                            </div>
                                                        </div>
                                                        {paymentType === 'online' && <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                                                    </div>
                                                </div>

                                                {/* Online Methods Sub-selection */}
                                                {paymentType === 'online' && (
                                                    <div className="space-y-2 animate-in slide-in-from-top-2 pt-2">
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase ml-1">Escolha o método:</p>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <button
                                                                onClick={() => setPaymentMethod('PIX')}
                                                                className={`p-3 rounded-xl border text-[10px] font-black uppercase transition flex flex-col items-center justify-center gap-1 ${paymentMethod === 'PIX' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/80'}`}
                                                            >
                                                                <span className="text-sm">💠</span> PIX
                                                            </button>
                                                            <button
                                                                onClick={() => setPaymentMethod('CREDIT_CARD')}
                                                                className={`p-3 rounded-xl border text-[10px] font-black uppercase transition flex flex-col items-center justify-center gap-1 ${paymentMethod === 'CREDIT_CARD' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/80'}`}
                                                            >
                                                                <span className="text-sm">💳</span> CRÉDITO
                                                            </button>
                                                            <button
                                                                onClick={() => setPaymentMethod('DEBIT_CARD')}
                                                                className={`p-3 rounded-xl border text-[10px] font-black uppercase transition flex flex-col items-center justify-center gap-1 ${paymentMethod === 'DEBIT_CARD' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/80'}`}
                                                            >
                                                                <span className="text-sm">🏧</span> DÉBITO
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Final Summary */}
                                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 text-xs space-y-2">
                                                <div className="flex justify-between text-slate-400">
                                                    <span>Serviço + Produtos</span>
                                                    <span>{formatCurrency((Number(selectedService?.price || 0)) + selectedProducts.reduce((sum, p) => sum + Number(p.price || 0), 0))}</span>
                                                </div>
                                                {pendingFees?.length > 0 && (
                                                    <div className="flex justify-between text-red-400 font-bold">
                                                        <span>Taxa No-show ({pendingFees.length}x)</span>
                                                        <span>{formatCurrency(pendingFees.reduce((s, f) => s + Number(f.feeValue || 0), 0))}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-white font-black text-sm pt-2 border-t border-slate-800">
                                                    <span>TOTAL</span>
                                                    <span>{formatCurrency(totalValue || 0)}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleBook}
                                                className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                                            >
                                                {paymentType === 'online' ? (
                                                    <><Zap className="w-4 h-4" /> Pagar e Agendar</>
                                                ) : (
                                                    <><CalendarCheck className="w-4 h-4" /> Finalizar Agendamento</>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                    {/* STEP 6: Checkout & Success */}
                                    {step === 6 && (
                                        <div className="space-y-6 animate-in slide-in-from-right">
                                            {checkoutData?.status === 'paid' ? (
                                                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                                                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                                                        <CalendarCheck className="w-10 h-10" />
                                                    </div>
                                                    <h2 className="text-2xl font-black text-white uppercase text-center">Agendamento Confirmado!</h2>
                                                    <p className="text-slate-400 text-center text-sm max-w-xs">
                                                        Seu horário foi reservado com sucesso.
                                                    </p>
                                                    <button onClick={() => window.location.reload()} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase hover:bg-slate-700 transition">
                                                        Voltar ao Início
                                                    </button>
                                                </div>
                                            ) : checkoutData?.status === 'pending_card' ? (
                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                                                        <CreditCard className="w-4 h-4 text-emerald-500" /> Finalizar Pagamento
                                                    </h3>

                                                    {/* Saved Cards Selection */}
                                                    {savedCards.length > 0 && (
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase">Seus Cartões</p>
                                                            {savedCards.map(card => (
                                                                <div key={card.id} onClick={() => setSelectedCardId(card.id)} className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${selectedCardId === card.id ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-lg">💳</span>
                                                                        <div>
                                                                            <p className="font-bold text-xs uppercase">{card.brand} •••• {card.last4}</p>
                                                                            <p className="text-[10px] text-slate-500">Expira em {card.expiry}</p>
                                                                        </div>
                                                                    </div>
                                                                    {selectedCardId === card.id && <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>}
                                                                </div>
                                                            ))}
                                                            <div onClick={() => setSelectedCardId('new')} className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 ${selectedCardId === 'new' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500"><Zap className="w-4 h-4" /></div>
                                                                <p className="font-bold text-xs uppercase">Usar Outro Cartão</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selectedCardId === 'new' ? (
                                                        <CardForm
                                                            onSubmit={processCardPayment}
                                                            amount={totalValue}
                                                            prefs={{
                                                                paymentMethodId: paymentMethod === 'DEBIT_CARD' ? 'debit_card' : 'credit_card'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-bold text-slate-500 uppercase">CVV (Código de Segurança)</label>
                                                                <input
                                                                    type="text"
                                                                    maxLength={4}
                                                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white font-bold tracking-widest text-center focus:border-emerald-500 outline-none"
                                                                    placeholder="•••"
                                                                    value={cvv}
                                                                    onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                                                                />
                                                            </div>
                                                            <button
                                                                className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black text-xs uppercase"
                                                                onClick={() => {
                                                                    // Placeholder: In real app, use SDK to create token from CVV + CardID
                                                                    alert("Integração CVV pendente: " + selectedCardId);
                                                                }}
                                                            >
                                                                Pagar Agora
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center space-y-6 pt-4">
                                                    <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                                                        <Zap className="w-4 h-4 text-emerald-500" /> Pagamento via PIX
                                                    </h3>
                                                    {checkoutData?.qrCodeBase64 ? (
                                                        <div className="bg-white p-4 rounded-xl">
                                                            <img src={`data:image/png;base64,${checkoutData.qrCodeBase64}`} alt="PIX QR Code" className="w-48 h-48 mix-blend-multiply" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-48 h-48 bg-slate-800 rounded-xl animate-pulse"></div>
                                                    )}

                                                    <div className="w-full">
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 text-center">Copia e Cola</p>
                                                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3 relative overflow-hidden group">
                                                            <p className="text-xs text-slate-400 font-mono truncate">{checkoutData?.pixCopiaECola || 'Carregando...'}</p>
                                                            <button onClick={() => navigator.clipboard.writeText(checkoutData?.pixCopiaECola)} className="bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600 transition">
                                                                <Share2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-slate-500 text-center animate-pulse">Aguardando confirmação do pagamento...</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                    </div>
                </div>
            )}

            {/* WAITLIST MODAL */}
            {waitlistOpen && (
                <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-[#111827] w-full max-w-sm rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 bg-[#0b0f19] border-b border-slate-800 flex justify-between items-center">
                            <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-500" /> Lista de Espera
                            </h3>
                            <button onClick={() => setWaitlistOpen(false)} className="text-slate-500 hover:text-white font-bold text-xs">FECHAR</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Se surgir uma vaga para <strong>{new Date(formData.date + 'T00:00:00').toLocaleDateString()}</strong> com <strong>{selectedProfessional?.name}</strong>, avisaremos você.
                            </p>

                            {!formData.name && (
                                <input
                                    placeholder="Seu Nome"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-emerald-500 transition"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            )}
                            {!formData.phone && (
                                <input
                                    placeholder="Seu WhatsApp"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-emerald-500 transition"
                                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            )}

                            <textarea
                                placeholder="Alguma observação? (Ex: Posso chegar 18h30)"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white outline-none focus:border-emerald-500 transition h-24 resize-none"
                                value={waitlistNote}
                                onChange={e => setWaitlistNote(e.target.value)}
                            />

                            <button
                                onClick={handleJoinWaitlist}
                                disabled={waitlistLoading}
                                className="w-full bg-white text-black py-4 rounded-xl font-black text-xs uppercase hover:bg-slate-200 transition disabled:opacity-50"
                            >
                                {waitlistLoading ? 'Salvando...' : 'Confirmar Interesse'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function BannerCarousel({ images }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Auto-slide
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % images.length);
        }, 5000); // 5s slide
        return () => clearInterval(interval);
    }, [images.length]);

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            setCurrentIndex(prev => (prev + 1) % images.length);
        } else if (isRightSwipe) {
            setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
        }
    };

    return (
        <div
            className="absolute inset-0 z-0 bg-black"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {images.map((img, idx) => (
                <div
                    key={idx}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-60' : 'opacity-0'}`}
                >
                    <img src={img} alt={`Banner ${idx}`} className="w-full h-full object-cover" />
                </div>
            ))}

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {images.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-3' : 'bg-white/30'}`}
                    />
                ))}
            </div>
        </div>
    );
}
