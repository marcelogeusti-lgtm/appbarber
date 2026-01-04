'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    MapPin, Search, Star, Heart, Share2,
    ChevronLeft, ShoppingBag, Clock, CalendarCheck,
    Banknote, CreditCard, ArrowLeft
} from 'lucide-react';
import api from '../../lib/api';

// Sub-components
import ServicesTab from '../../components/client-view/ServicesTab';
import DetailsTab from '../../components/client-view/DetailsTab';
import ProfessionalsTab from '../../components/client-view/ProfessionalsTab';
import ProductsTab from '../../components/client-view/ProductsTab';
import LoyaltyTab from '../../components/client-view/LoyaltyTab';
import PackagesTab from '../../components/client-view/PackagesTab';
import SubscriptionsTab from '../../components/client-view/SubscriptionsTab';
import ReviewsTab from '../../components/client-view/ReviewsTab';

export default function BarbershopPage() {
    const params = useParams();
    const router = useRouter();
    const { slug } = params;

    const [barbershop, setBarbershop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('servicos');
    const [products, setProducts] = useState([]);
    const [mySubscription, setMySubscription] = useState(null);
    const [points, setPoints] = useState(0);

    // Booking Logic State
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState(''); // 'LOCAL', 'ONLINE', 'SUBSCRIPTION'

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        birthday: '',
        date: '',
        time: '',
        createAccount: false,
        password: ''
    });

    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        if (!slug) return;
        async function loadData() {
            try {
                const res = await api.get(`/barbershops/${slug}`);
                setBarbershop(res.data);

                // Load Products
                const prodRes = await api.get(`/products?barbershopId=${res.data.id}`);
                setProducts(prodRes.data);

                // Check User Data (if logged in)
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setFormData(prev => ({
                        ...prev,
                        name: user.name || prev.name,
                        phone: user.phone || prev.phone,
                        email: user.email || prev.email
                    }));

                    // Fetch Active Sub
                    try {
                        const subRes = await api.get('/subscription/my-active');
                        if (subRes.data) setMySubscription(subRes.data);
                    } catch (e) { /* No sub */ }

                    // Fetch Points (derived from completed appointments for now)
                    try {
                        const appRes = await api.get('/appointments/me');
                        const completed = appRes.data.filter(a => a.status === 'COMPLETED').length;
                        setPoints(completed * 10); // 10 points per cut
                    } catch (e) { /* No history */ }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();

        const saved = localStorage.getItem('guestData');
        if (saved) {
            setFormData(prev => ({ ...prev, ...JSON.parse(saved) }));
        }
    }, [slug]);

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
        const servicePrice = selectedService?.price ? Number(selectedService.price) : 0;
        const productsPrice = selectedProducts.reduce((sum, p) => sum + Number(p.price), 0);
        return servicePrice + productsPrice;
    }, [selectedService, selectedProducts]);

    const handleBook = async () => {
        try {
            if (!formData.name || !formData.phone || !formData.date || !formData.time) {
                return alert('Preencha os dados obrigatórios (Nome, Telefone, Data e Hora)');
            }
            if (!paymentMethod) return alert('Selecione uma forma de pagamento');

            const res = await api.post('/appointments', {
                professionalId: selectedProfessional.id,
                serviceId: selectedService.id,
                products: selectedProducts.map(p => p.id),
                paymentMethod,
                date: formData.date,
                time: formData.time,
                guestName: formData.name,
                guestPhone: formData.phone,
                guestEmail: formData.email,
                guestBirthday: formData.birthday,
                barbershopId: barbershop.id,
                createAccount: formData.createAccount,
                password: formData.password
            });

            if (formData.createAccount && res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
            }

            setStep(5); // Success State
        } catch (err) {
            alert(err.response?.data?.message || 'Erro ao agendar');
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
        { id: 'pacotes', label: 'PACOTES' },
        { id: 'assinaturas', label: 'ASSINATURAS' },
        { id: 'avaliacoes', label: 'AVALIAÇÕES' },
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
            {/* Header / Cover */}
            <header className="relative h-64 w-full">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10"></div>
                <button onClick={() => window.history.back()} className="absolute top-6 left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0 z-20 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-black/70 transition">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="absolute top-6 right-6 z-20 flex gap-3">
                    <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:text-red-500 transition"><Heart className="w-5 h-5" /></button>
                    <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:text-emerald-500 transition"><Share2 className="w-5 h-5" /></button>
                </div>

                <div className="absolute -bottom-12 left-0 right-0 z-20 px-6 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-[#111] border-4 border-black shadow-2xl flex items-center justify-center overflow-hidden mb-3">
                        <span className="font-black text-3xl text-emerald-500 tracking-tighter">{barbershop.name.charAt(0)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold mb-1">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-yellow-500" />)}
                        <span className="text-white ml-2">5.0</span>
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-1 leading-none">{barbershop.name}</h1>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest max-w-[80%]">
                        <MapPin className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{barbershop.address || 'Endereço não informado'}</span>
                    </div>
                </div>
            </header>

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
                {activeTab === 'pacotes' && <PackagesTab plans={barbershop.subscriptionPlans || []} />}
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
                                        {step === 5 ? 'Confirmado' : `Passo ${step} de 4`}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => { setSelectedService(null); setStep(1); }} className="text-slate-500 hover:text-white transition font-bold text-xs uppercase tracking-widest bg-slate-900 px-4 py-2 rounded-xl">
                                Fechar
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">

                            {/* Step 5: Success */}
                            {step === 5 && (
                                <div className="text-center py-10 space-y-6 animate-in zoom-in">
                                    <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <CalendarCheck className="w-10 h-10 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase">Tudo Certo!</h2>
                                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3 text-left">
                                        <div className="flex justify-between text-sm"><span className="text-slate-500 uppercase font-bold text-[10px]">Serviço</span><span className="font-bold">{selectedService.name}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-slate-500 uppercase font-bold text-[10px]">Barbeiro</span><span className="font-bold">{selectedProfessional.name}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-slate-500 uppercase font-bold text-[10px]">Horário</span><span className="font-bold">{new Date(formData.date + 'T00:00:00').toLocaleDateString()} às {formData.time}</span></div>
                                    </div>
                                    <button onClick={() => router.push('/home')} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase hover:bg-slate-700 transition">Ver Meus Agendamentos</button>
                                </div>
                            )}

                            {step < 5 && (
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
                                                {barbershop.staff?.filter(s => s.role === 'BARBER').map(pro => (
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
                                            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Estimado</span>
                                                <span className="text-xl font-black text-white">{formatCurrency(totalValue)}</span>
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
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {availableSlots.map(slot => (
                                                                <button key={slot} onClick={() => { setFormData({ ...formData, time: slot }); nextStep(); }} className={`py-3 rounded-xl text-xs font-black transition ${formData.time === slot ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>{slot}</button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* STEP 4: Guest Info & Finalize */}
                                    {step === 4 && (
                                        <div className="space-y-6 animate-in slide-in-from-right">
                                            <div className="space-y-4">
                                                <input placeholder="Seu Nome" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white font-bold text-sm outline-none" />
                                                <input placeholder="Seu Telefone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white font-bold text-sm outline-none" />
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pagamento</h3>

                                                {mySubscription && mySubscription.remainingCuts > 0 && selectedProducts.length === 0 && (
                                                    <div onClick={() => setPaymentMethod('SUBSCRIPTION')} className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${paymentMethod === 'SUBSCRIPTION' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <Star className="w-5 h-5" />
                                                            <div><p className="font-bold text-xs uppercase">Usar Assinatura</p><p className="text-[10px] opacity-70">Plano Ativo ({mySubscription.remainingCuts} créditos)</p></div>
                                                        </div>
                                                        {paymentMethod === 'SUBSCRIPTION' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                                                    </div>
                                                )}

                                                <div onClick={() => setPaymentMethod('LOCAL')} className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${paymentMethod === 'LOCAL' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <Banknote className="w-5 h-5" />
                                                        <div><p className="font-bold text-xs uppercase">Pagar no Local</p><p className="text-[10px] opacity-70">Dinheiro ou Cartão</p></div>
                                                    </div>
                                                    {paymentMethod === 'LOCAL' && <div className="w-3 h-3 bg-white rounded-full"></div>}
                                                </div>
                                            </div>

                                            <button onClick={handleBook} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition shadow-xl shadow-emerald-500/20">Finalizar Agendamento</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
