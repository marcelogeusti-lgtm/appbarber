'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock, Scissors, CalendarCheck, MapPin, Phone, MessageCircle, User, ChevronRight, ArrowLeft, Star, Calendar } from 'lucide-react';
import api from '../../lib/api';

export default function BarbershopPage() {
    const params = useParams();
    const { slug } = params;
    const [barbershop, setBarbershop] = useState(null);
    const [loading, setLoading] = useState(true);

    // Booking State
    const [step, setStep] = useState(1); // 1: Service, 2: Professional, 3: Date/Time & Guest Form, 4: Success
    const [selectedService, setSelectedService] = useState(null);
    const [selectedProfessional, setSelectedProfessional] = useState(null);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        birthday: '',
        date: '',
        time: ''
    });

    useEffect(() => {
        if (!slug) return;
        api.get(`/barbershops/${slug}`)
            .then(res => setBarbershop(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));

        const saved = localStorage.getItem('guestData');
        if (saved) {
            const parsed = JSON.parse(saved);
            setFormData(prev => ({ ...prev, ...parsed }));
        }
    }, [slug]);

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setStep(2);
    };

    const handleProfessionalSelect = (pro) => {
        setSelectedProfessional(pro);
        setStep(3);
    };

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            if (!selectedProfessional) return alert('Selecione um profissional');

            // Save guest data
            localStorage.setItem('guestData', JSON.stringify({
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                birthday: formData.birthday
            }));

            await api.post('/appointments', {
                professionalId: selectedProfessional.id, // Correct ID now!
                serviceId: selectedService.id,
                date: formData.date,
                time: formData.time,
                guestName: formData.name,
                guestPhone: formData.phone,
                guestEmail: formData.email,
                guestBirthday: formData.birthday,
                barbershopId: barbershop.id // Explicitly sending current barbershop ID
            });

            // Success State
            setStep(4);
        } catch (err) {
            alert(err.response?.data?.message || 'Erro ao agendar');
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Carregando experiência...</p>
            </div>
        </div>
    );

    if (!barbershop) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6 text-center">
            <div>
                <h1 className="text-6xl font-black mb-4 tracking-tighter">404</h1>
                <p className="text-slate-400 mb-8 uppercase text-xs font-bold tracking-widest">Barbearia não encontrada</p>
                <a href="/" className="bg-orange-500 text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Retornar</a>
            </div>
        </div>
    );

    // Success Screen
    if (step === 4) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="bg-[#111827] w-full max-w-md p-10 rounded-[3rem] border border-slate-800 text-center space-y-8 animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                    <CalendarCheck className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white uppercase mb-2">Agendado!</h2>
                    <p className="text-slate-400 font-medium">Te esperamos em breve.</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 text-left space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Dia</span>
                        <span className="text-white font-bold">{new Date(formData.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Horário</span>
                        <span className="text-white font-bold">{formData.time}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Profissional</span>
                        <span className="text-white font-bold">{selectedProfessional?.name}</span>
                    </div>
                </div>
                <button onClick={() => window.location.reload()} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition">
                    Novo Agendamento
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-32">
            {/* Dynamic Header */}
            <header className="bg-[#0f172a] text-white pt-10 pb-20 px-6 text-center rounded-b-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8 max-w-3xl mx-auto">
                        {step > 1 && (
                            <button onClick={prevStep} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition backdrop-blur-md">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 bg-orange-500/10 px-4 py-2 rounded-full backdrop-blur-md border border-orange-500/20">
                            Passo {step} de 3
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase mb-2">{barbershop.name}</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <MapPin className="w-3 h-3 text-orange-500" /> {barbershop.address}
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-6 -mt-10 relative z-20 max-w-2xl">
                {/* Step 1: Select Service */}
                {step === 1 && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-8 duration-500">
                        {barbershop.services?.map(service => (
                            <div key={service.id}
                                onClick={() => handleServiceSelect(service)}
                                className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 cursor-pointer transition-all flex items-center justify-between group"
                            >
                                <div>
                                    <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight mb-1 group-hover:text-orange-500 transition-colors">
                                        {service.name}
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {service.duration} Min
                                    </p>
                                </div>
                                <div className="text-xl font-black text-slate-900 dark:text-white">
                                    R$ {Number(service.price).toFixed(2)}
                                </div>
                            </div>
                        ))}
                        {barbershop.services?.length === 0 && (
                            <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 border-dashed">
                                <p className="text-slate-500 font-bold uppercase text-xs">Sem serviços disponíveis.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Select Professional */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                        <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 mb-8 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Serviço Selecionado</p>
                                <h3 className="text-xl font-black text-white uppercase">{selectedService?.name}</h3>
                            </div>
                            <div className="text-orange-500 font-black text-xl">R$ {Number(selectedService?.price).toFixed(2)}</div>
                        </div>

                        <h3 className="text-center text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Escolha o Profissional</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Any Professional Option (Optional to implement later, for now just existing list) */}
                            {barbershop.staff?.filter(s => s.role === 'BARBER').map(pro => (
                                <div key={pro.id}
                                    onClick={() => handleProfessionalSelect(pro)}
                                    className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 cursor-pointer transition-all flex flex-col items-center gap-4 group text-center"
                                >
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
                                        {/* If avatarUrl exists use it, else initial */}
                                        <span className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
                                            {pro.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1 text-sm">{pro.name}</h3>
                                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest leading-none">
                                            {pro.professionalProfile?.position || 'Barbeiro'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {barbershop.staff?.filter(s => s.role === 'BARBER').length === 0 && (
                            <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 border-dashed">
                                <User className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold uppercase text-xs">Nenhum profissional disponível.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Date, Time & Form */}
                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                        {/* Summary Card */}
                        <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-orange-500">
                                <Scissors className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-black text-white uppercase">{selectedService?.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <User className="w-3 h-3" /> {selectedProfessional?.name}
                                </p>
                            </div>
                            <div className="text-white font-black">R$ {Number(selectedService?.price).toFixed(2)}</div>
                        </div>

                        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
                            <form onSubmit={handleBook} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                                            <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 ring-orange-500 transition text-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                                            <input required type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 ring-orange-500 transition text-sm" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mb-4">Seus Dados</h4>
                                    <input required placeholder="Seu Nome Completo" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 ring-orange-500 transition text-sm" />
                                    <input required placeholder="Seu WhatsApp" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 ring-orange-500 transition text-sm" />
                                    <div className="flex gap-4">
                                        <input type="email" placeholder="Email (Opcional)" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 ring-orange-500 transition text-sm" />
                                        <input required type="date" placeholder="Aniversário" value={formData.birthday} onChange={e => setFormData({ ...formData, birthday: e.target.value })} className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl font-bold outline-none focus:ring-2 ring-orange-500 transition text-sm" />
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition shadow-xl shadow-orange-500/20 mt-4 flex items-center justify-center gap-2">
                                    Confirmar Agendamento <ChevronRight className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer Button for Questions */}
            <div className="fixed bottom-6 right-6 z-50">
                <a href={`https://wa.me/55${barbershop.phone?.replace(/\D/g, '')}`} target="_blank" className="bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                </a>
            </div>
        </div>
    );
}
