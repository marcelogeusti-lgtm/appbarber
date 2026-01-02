'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock, Scissors, CalendarCheck, MapPin, Phone, MessageCircle, User, ChevronRight, ArrowLeft, Star, Calendar, ShoppingBag, CreditCard, Banknote } from 'lucide-react';
import api from '../../lib/api';

export default function BarbershopPage() {
    const params = useParams();
    const { slug } = params;
    const [barbershop, setBarbershop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [mySubscription, setMySubscription] = useState(null);

    // Booking State
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState(''); // 'LOCAL', 'ONLINE', 'SUBSCRIPTION'

    // Form Data
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

                // Check Subscription (if logged in)
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    // Minimal check if user.name matches form default
                    setFormData(prev => ({
                        ...prev,
                        name: user.name || prev.name,
                        phone: user.phone || prev.phone,
                        email: user.email || prev.email
                    }));

                    try {
                        const subRes = await api.get('/subscription/my-active');
                        setMySubscription(subRes.data);
                    } catch (e) { /* No sub */ }
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
        if (!formData.date || !selectedProfessional || !barbershop) return;

        async function fetchSlots() {
            setLoadingSlots(true);
            try {
                // Pass selected service ID. In the future, we could pass multiple.
                const res = await api.get(`/availability/${barbershop.id}/${formData.date}?serviceIds=${selectedService.id}`);

                // The API returns an array of pros. We find our selected pro.
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
        setStep(2);
    };

    const handleProfessionalSelect = (pro) => {
        setSelectedProfessional(pro);
        setStep(3);
    };

    const handleProductToggle = (product) => {
        if (selectedProducts.find(p => p.id === product.id)) {
            setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
        } else {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    const handleBook = async () => {
        try {
            if (!formData.name || !formData.phone || !formData.date || !formData.time) {
                return alert('Preencha todos os dados obrigatórios');
            }
            if (formData.createAccount) {
                if (!formData.email || !formData.password) {
                    return alert('Email e Senha são obrigatórios para criar sua conta.');
                }
            }
            if (!paymentMethod) return alert('Selecione uma forma de pagamento');

            localStorage.setItem('guestData', JSON.stringify({
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                birthday: formData.birthday
            }));

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

            setStep(5); // Success
        } catch (err) {
            alert(err.response?.data?.message || 'Erro ao agendar');
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const formatCurrency = (val) => Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const totalValue = (selectedService?.price ? Number(selectedService.price) : 0) +
        selectedProducts.reduce((sum, p) => sum + Number(p.price), 0);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
    );

    if (!barbershop) return <div className="text-white text-center pt-20">Barbearia não encontrada</div>;

    // Success Screen
    if (step === 5) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center animate-in zoom-in">
            <div className="bg-[#111827] w-full max-w-md p-10 rounded-[3rem] border border-slate-800 space-y-6">
                <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <CalendarCheck className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase">Agendado!</h2>
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3 text-left">
                    <p className="text-white text-sm flex justify-between">
                        <span className="text-slate-500 uppercase font-bold text-[10px] tracking-widest">Serviço</span>
                        <span className="font-bold">{selectedService?.name}</span>
                    </p>
                    <p className="text-white text-sm flex justify-between">
                        <span className="text-slate-500 uppercase font-bold text-[10px] tracking-widest">Profissional</span>
                        <span className="font-bold">{selectedProfessional?.name}</span>
                    </p>
                    <p className="text-white text-sm flex justify-between">
                        <span className="text-slate-500 uppercase font-bold text-[10px] tracking-widest">Data</span>
                        <span className="font-bold">{new Date(formData.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {formData.time}</span>
                    </p>
                    {selectedProducts.length > 0 && (
                        <p className="text-white text-sm flex justify-between">
                            <span className="text-slate-500 uppercase font-bold text-[10px] tracking-widest">Adicionais</span>
                            <span className="font-bold">{selectedProducts.length} itens</span>
                        </p>
                    )}
                </div>
                <button onClick={() => window.location.href = '/home'} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition">
                    Voltar ao Início
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pb-32">
            <header className="px-6 py-6 flex items-center justify-between border-b border-slate-900 bg-[#111827]">
                {step > 1 ? (
                    <button onClick={prevStep} className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition"><ArrowLeft className="w-5 h-5" /></button>
                ) : <div className="w-9"></div>}
                <div className="text-center">
                    <h1 className="font-black uppercase tracking-tight text-lg">{barbershop.name}</h1>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Passo {step} de 4</p>
                </div>
                <div className="w-9"></div>
            </header>

            <main className="container mx-auto px-6 py-8 max-w-2xl">
                {/* 1. Services */}
                {step === 1 && (
                    <div className="space-y-4 animate-in slide-in-from-right">
                        <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Selecione o Serviço</h2>
                        {barbershop.services?.map(service => (
                            <div key={service.id} onClick={() => handleServiceSelect(service)} className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 hover:border-emerald-500 cursor-pointer flex justify-between items-center group">
                                <div>
                                    <h3 className="font-black text-white uppercase text-lg group-hover:text-emerald-500 transition">{service.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{service.duration} min</p>
                                </div>
                                <span className="font-black text-white text-lg">{formatCurrency(service.price)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. Professionals */}
                {step === 2 && (
                    <div className="space-y-4 animate-in slide-in-from-right">
                        <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Quem vai te atender?</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {barbershop.staff?.filter(s => s.role === 'BARBER').map(pro => (
                                <div key={pro.id} onClick={() => handleProfessionalSelect(pro)} className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 hover:border-emerald-500 cursor-pointer text-center group">
                                    <div className="w-16 h-16 bg-slate-900 rounded-full mx-auto mb-3 flex items-center justify-center font-black text-2xl text-white group-hover:text-emerald-500 transition border border-slate-800">
                                        {pro.name.charAt(0)}
                                    </div>
                                    <h3 className="font-black text-white uppercase text-sm">{pro.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Upsell (Adicionais) */}
                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        <div className="text-center">
                            <h2 className="text-xl font-black text-white uppercase mb-1">Turbine seu visual</h2>
                            <p className="text-slate-500 text-xs font-medium">Produtos recomendados para levar agora</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {products.map(product => {
                                const selected = selectedProducts.find(p => p.id === product.id);
                                return (
                                    <div key={product.id} onClick={() => handleProductToggle(product)}
                                        className={`bg-[#1e293b] p-4 rounded-3xl border cursor-pointer transition flex items-center gap-4 ${selected ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800'}`}>
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${selected ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-600'}`}>
                                            <ShoppingBag className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white text-sm uppercase">{product.name}</h3>
                                            <p className="text-emerald-500 font-black text-sm">{formatCurrency(product.price)}</p>
                                        </div>
                                        {selected && <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>}
                                    </div>
                                );
                            })}
                            {products.length === 0 && <p className="text-center text-slate-500 text-sm col-span-2">Nenhum produto disponível.</p>}
                        </div>

                        <div className="bg-[#111827] p-6 rounded-3xl border border-slate-800 flex justify-between items-center">
                            <span className="text-slate-500 uppercase font-black text-xs tracking-widest">Total Estimado</span>
                            <span className="text-2xl font-black text-white">{formatCurrency(totalValue)}</span>
                        </div>

                        <button onClick={nextStep} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition">
                            Continuar para Agendamento
                        </button>
                    </div>
                )}

                {/* 4. Form & Payment */}
                {step === 4 && (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 space-y-4">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Data e Horário</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="bg-slate-900 border-none rounded-xl p-3 text-white font-bold text-sm outline-none focus:ring-1 ring-emerald-500 w-full"
                                />

                                {formData.date && (
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Horários Disponíveis</p>
                                        {loadingSlots ? (
                                            <div className="flex items-center gap-2 text-slate-500 text-xs animate-pulse">
                                                <Clock className="w-3 h-3" /> Calculando disponibilidade...
                                            </div>
                                        ) : availableSlots.length > 0 ? (
                                            <div className="grid grid-cols-4 gap-2 h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                                                {availableSlots.map(slot => (
                                                    <button
                                                        key={slot}
                                                        onClick={() => setFormData({ ...formData, time: slot })}
                                                        className={`py-2 rounded-lg text-xs font-black transition ${formData.time === slot ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl text-orange-500 text-[10px] font-bold uppercase">
                                                Nenhum horário disponível para esta data.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 space-y-4">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Seus Dados</h3>
                            <input placeholder="Nome" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-900 border-none rounded-xl p-3 text-white font-bold text-sm outline-none" />
                            <input placeholder="Telefone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-900 border-none rounded-xl p-3 text-white font-bold text-sm outline-none" />
                            <input type="email" placeholder="Email (Opcional)" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-900 border-none rounded-xl p-3 text-white font-bold text-sm outline-none" />

                            {/* Auto Registration UX */}
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-dashed border-slate-700 space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${formData.createAccount ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 bg-slate-800'}`}>
                                        {formData.createAccount && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={formData.createAccount} onChange={e => setFormData({ ...formData, createAccount: e.target.checked })} />
                                    <div>
                                        <span className="text-white text-sm font-bold block">Criar minha conta</span>
                                        <span className="text-[10px] text-slate-500 font-medium block">Facilite seus próximos agendamentos</span>
                                    </div>
                                </label>

                                {formData.createAccount && (
                                    <div className="animate-in slide-in-from-top-1 fade-in">
                                        <input type="password" placeholder="Crie uma senha" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold text-sm outline-none focus:border-emerald-500 transition" />
                                    </div>
                                )}
                            </div>

                            <div className="text-center">
                                <div className="text-xs text-slate-500 font-medium">Já tem conta? <a href="/login" className="text-emerald-500 font-bold hover:underline">Entrar</a></div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Pagamento</h3>

                            {mySubscription && mySubscription.remainingCuts > 0 && selectedProducts.length === 0 && (
                                <div onClick={() => setPaymentMethod('SUBSCRIPTION')} className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between ${paymentMethod === 'SUBSCRIPTION' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-[#1e293b] border-slate-800 hover:border-slate-600'}`}>
                                    <div className="flex items-center gap-3">
                                        <Star className="w-5 h-5" />
                                        <div>
                                            <p className="font-bold text-sm uppercase">Usar Assinatura</p>
                                            <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Restam {mySubscription.remainingCuts} cortes</p>
                                        </div>
                                    </div>
                                    {paymentMethod === 'SUBSCRIPTION' && <div className="w-4 h-4 bg-white rounded-full"></div>}
                                </div>
                            )}

                            <div onClick={() => setPaymentMethod('LOCAL')} className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between ${paymentMethod === 'LOCAL' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-[#1e293b] border-slate-800 hover:border-slate-600'}`}>
                                <div className="flex items-center gap-3">
                                    <Banknote className="w-5 h-5" />
                                    <div>
                                        <p className="font-bold text-sm uppercase">Pagar no Local</p>
                                        <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Dinheiro, Cartão ou Pix</p>
                                    </div>
                                </div>
                                {paymentMethod === 'LOCAL' && <div className="w-4 h-4 bg-white rounded-full"></div>}
                            </div>

                            <div className="opacity-50 pointer-events-none p-4 rounded-2xl border border-slate-800 bg-[#1e293b] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-slate-500" />
                                    <div>
                                        <p className="font-bold text-sm uppercase text-slate-400">Pagar Online</p>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Em breve</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleBook} className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition shadow-xl shadow-emerald-500/20">
                            Confirmar Agendamento
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
