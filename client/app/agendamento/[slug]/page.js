'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Clock, Scissors, CalendarCheck, MapPin, Phone, MessageCircle } from 'lucide-react';
import api from '../../../lib/api';

export default function BarbershopPage() {
    const params = useParams();
    const { slug } = params;
    const [barbershop, setBarbershop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);
    const [step, setStep] = useState(1); // 1: Services, 2: Guest Form

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        birthday: '', // YYYY-MM-DD
        date: '',
        time: '' // HH:mm
    });

    useEffect(() => {
        if (!slug) return;
        api.get(`/barbershops/${slug}`)
            .then(res => setBarbershop(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));

        // Load saved guest data
        const saved = localStorage.getItem('guestData');
        if (saved) {
            const parsed = JSON.parse(saved);
            setFormData(prev => ({
                ...prev,
                name: parsed.name || '',
                phone: parsed.phone || '',
                email: parsed.email || '',
                birthday: parsed.birthday || ''
            }));
        }
    }, [slug]);

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setStep(2);
    };

    const handleBook = async (e) => {
        e.preventDefault();
        try {
            // Save guest data for next time
            localStorage.setItem('guestData', JSON.stringify({
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                birthday: formData.birthday
            }));

            await api.post('/appointments', {
                professionalId: barbershop.ownerId, // Simplified: assume owner is the pro for now
                serviceId: selectedService.id,
                date: formData.date,
                time: formData.time,
                guestName: formData.name,
                guestPhone: formData.phone,
                guestEmail: formData.email,
                guestBirthday: formData.birthday
            });

            alert('Agendamento realizado com sucesso!');
            setStep(1);
            setFormData(prev => ({ ...prev, date: '', time: '' }));
        } catch (err) {
            alert(err.response?.data?.message || 'Erro ao agendar');
        }
    };

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
                <p className="text-slate-400 mb-8 uppercase text-xs font-bold tracking-widest">Barbearia não catalogada</p>
                <a href="/" className="bg-orange-500 text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Retornar</a>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-32">
            {/* Header / Brand */}
            <header className="bg-slate-900 text-white pt-20 pb-32 px-8 text-center rounded-b-[4rem] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/20 to-transparent"></div>
                <div className="relative z-10 space-y-4">
                    <div className="w-20 h-20 bg-orange-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-orange-500/20 mb-6 border-4 border-slate-900">
                        <Scissors className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{barbershop.name}</h1>
                    <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /> {barbershop.address || 'Check-in Social'}</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 -mt-16 relative z-20">
                {step === 1 && (
                    <div className="max-w-3xl mx-auto space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {barbershop.services?.length > 0 ? (
                                barbershop.services.map(service => (
                                    <div key={service.id}
                                        onClick={() => handleServiceSelect(service)}
                                        className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer transition-all group min-h-[220px]">
                                        <div>
                                            <h3 className="font-black text-2xl mb-2 group-hover:text-orange-500 transition-colors uppercase tracking-tight leading-none">{service.name}</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5" /> {service.duration} Minutos
                                            </p>
                                        </div>
                                        <div className="mt-8 flex items-center justify-between">
                                            <div className="text-2xl font-black text-slate-900 dark:text-white">R$ {service.price}</div>
                                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                                                <CalendarCheck className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum serviço disponível no momento</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-orange-500 mb-10 transition-colors uppercase tracking-widest">
                            &larr; Voltar para Serviços
                        </button>

                        <div className="mb-10 p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex justify-between items-center group">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Você selecionou</p>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{selectedService?.name}</h3>
                            </div>
                            <div className="text-3xl font-black text-orange-500 italic">R$ {selectedService?.price}</div>
                        </div>

                        <form onSubmit={handleBook} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Seu Nome</label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition font-bold" placeholder="Digite seu nome" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Seu WhatsApp</label>
                                    <input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition font-bold" placeholder="(00) 00000-0000" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Aniversário</label>
                                    <input type="date" required value={formData.birthday} onChange={e => setFormData({ ...formData, birthday: e.target.value })} className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition font-bold" />
                                </div>
                                <div className="space-y-2 flex flex-col justify-end">
                                    <p className="text-[10px] text-orange-500 font-bold uppercase tracking-tighter leading-tight italic ml-1">Ganhe presentes exclusivos no mês do seu aniversário! 🎂</p>
                                </div>
                            </div>

                            <div className="border-t border-slate-50 dark:border-slate-800 pt-8 mt-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-8">Escolha sua Agenda</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition font-bold" />
                                    <input type="time" required value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 ring-orange-500 outline-none transition font-bold" />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-black hover:scale-[1.01] active:scale-95 transition-all mt-6">
                                Confirmar Agendamento ✂️
                            </button>
                        </form>
                    </div>
                )}
            </main>

            {/* Direct WhatsApp Call to Action */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 p-6 border-t border-slate-100 dark:border-slate-800 md:hidden z-50">
                <a
                    href={`https://wa.me/55${barbershop.phone?.replace(/\D/g, '')}?text=Olá,%20gostaria%20de%20agendar%20um%20serviço.`}
                    target="_blank"
                    className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20"
                >
                    <MessageCircle className="w-5 h-5" /> Falar no WhatsApp
                </a>
            </div>

            {/* Floating WhatsApp Button for Desktop */}
            <div className="hidden md:block">
                <a
                    href={`https://wa.me/55${barbershop.phone?.replace(/\D/g, '')}?text=Olá,%20gostaria%20de%20tirar%20uma%20dúvida.`}
                    target="_blank"
                    className="fixed bottom-12 right-12 bg-white dark:bg-slate-900 text-emerald-500 p-6 rounded-[2rem] shadow-2xl hover:scale-110 transition-all z-50 flex items-center gap-4 group border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Dúvidas?</p>
                        <p className="font-black text-slate-900 dark:text-white uppercase text-xs">Chamar no Whats</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                </a>
            </div>
        </div>
    );
}
