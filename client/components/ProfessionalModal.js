'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    X, User, Camera, Smartphone, Phone, Mail, MapPin,
    Briefcase, Clock, Shield, Check, Loader2, Calendar,
    Plus, Trash2, Info, ChevronRight, ChevronLeft, Edit
} from 'lucide-react';
import api from '../lib/api';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const professionalSchema = z.object({
    name: z.string().min(3, 'Nome muito curto'),
    nickname: z.string().optional(),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
    phone: z.string().min(10, 'Telefone inválido'),
    landline: z.string().optional(),
    cpf: z.string().optional(),
    cnpj: z.string().optional(),
    rg: z.string().optional(),
    gender: z.string().optional(),
    birthday: z.string().optional(),
    notes: z.string().optional(),
    avatarUrl: z.string().optional(),
    position: z.string().min(2, 'Informe o cargo'),
    bio: z.string().optional(),
    showInApp: z.boolean().default(true),
    showPublicly: z.boolean().default(true),
    appointmentInterval: z.number().default(30),
    zipCode: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().default('Brasil'),
    role: z.enum(['BARBER', 'ADMIN', 'BARBER_CONSULTA']).default('BARBER'),
    active: z.boolean().default(true),
    commissionPercent: z.string().optional(),
    services: z.array(z.string()).optional(),
});

export default function ProfessionalModal({ isOpen, onClose, professional, onSuccess }) {
    const [tab, setTab] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [availableServices, setAvailableServices] = useState([]);
    const [schedules, setSchedules] = useState([]);

    const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        resolver: zodResolver(professionalSchema),
        defaultValues: {
            showInApp: true,
            showPublicly: true,
            appointmentInterval: 30,
            active: true,
            role: 'BARBER',
            country: 'Brasil'
        }
    });

    const isEdit = !!professional;

    useEffect(() => {
        if (isOpen) {
            fetchServices();
            if (professional) {
                // Pre-fill
                reset({
                    name: professional.name || '',
                    nickname: professional.nickname || '',
                    email: professional.email || '',
                    phone: professional.phone || '',
                    landline: professional.landline || '',
                    cpf: professional.cpf || '',
                    cnpj: professional.cnpj || '',
                    rg: professional.rg || '',
                    gender: professional.gender || '',
                    birthday: professional.birthday ? new Date(professional.birthday).toISOString().split('T')[0] : '',
                    notes: professional.notes || '',
                    avatarUrl: professional.avatarUrl || '',
                    position: professional.professionalProfile?.position || '',
                    bio: professional.professionalProfile?.bio || '',
                    showInApp: professional.professionalProfile?.showInApp ?? true,
                    showPublicly: professional.professionalProfile?.showPublicly ?? true,
                    appointmentInterval: professional.professionalProfile?.appointmentInterval || 30,
                    zipCode: professional.professionalProfile?.zipCode || '',
                    street: professional.professionalProfile?.street || '',
                    number: professional.professionalProfile?.number || '',
                    complement: professional.professionalProfile?.complement || '',
                    neighborhood: professional.professionalProfile?.neighborhood || '',
                    city: professional.professionalProfile?.city || '',
                    state: professional.professionalProfile?.state || '',
                    country: professional.professionalProfile?.country || 'Brasil',
                    role: professional.role || 'BARBER',
                    active: professional.active ?? true,
                    commissionPercent: professional.professionalProfile?.commissionPercent?.toString() || '',
                    services: professional.professionalProfile?.services?.map(s => s.id) || [],
                });

                // Set schedules
                const days = [0, 1, 2, 3, 4, 5, 6];
                const existing = professional.professionalProfile?.schedules || [];
                const initial = days.map(d => {
                    const match = existing.find(s => s.dayOfWeek === d);
                    return match ? { ...match } : { dayOfWeek: d, startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00', isOff: d === 0 };
                });
                setSchedules(initial);
            } else {
                setTab(1);
                reset({
                    name: '',
                    nickname: '',
                    email: '',
                    phone: '',
                    password: '',
                    showInApp: true,
                    showPublicly: true,
                    appointmentInterval: 30,
                    active: true,
                    role: 'BARBER',
                    country: 'Brasil',
                    services: []
                });
                const days = [0, 1, 2, 3, 4, 5, 6];
                setSchedules(days.map(d => ({ dayOfWeek: d, startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00', isOff: d === 0 })));
            }
        }
    }, [isOpen, professional, reset]);

    const fetchServices = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const barbershopId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;
            const res = await api.get(`/services?barbershopId=${barbershopId}`);
            setAvailableServices(res.data);
        } catch (err) {
            console.error('Error fetching services:', err);
        }
    };

    const handleZipCodeBlur = async (e) => {
        const zip = e.target.value.replace(/\D/g, '');
        if (zip.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setValue('street', data.logradouro);
                    setValue('neighborhood', data.bairro);
                    setValue('city', data.localidade);
                    setValue('state', data.uf);
                }
            } catch (err) {
                console.error('ZIP look up error:', err);
            }
        }
    };

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            // Early fail for invalid types
            if (!file.type.match('image.*')) {
                return reject(new Error('Arquivo não é uma imagem'));
            }

            const reader = new FileReader();

            reader.onerror = (error) => reject(error);

            reader.onload = (event) => {
                const img = new Image();
                img.onerror = (error) => reject(error);

                img.onload = () => {
                    // Force reasonable dimensions
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            // Preserve filename but change ext if needed or keep raw
                            const newFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(newFile);
                        } else {
                            reject(new Error('Canvas conversion failed'));
                        }
                    }, 'image/jpeg', 0.85); // slightly lower quality for better compression
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            console.log("Starting upload...", file.name, file.size);

            let fileToUpload = file;
            // Compress if > 500KB
            if (file.size > 500000) {
                console.log("Compressing image...");
                fileToUpload = await compressImage(file);
                console.log("Compressed size:", fileToUpload.size);
            }

            const storageRef = ref(storage, `professionals/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`);
            const snapshot = await uploadBytes(storageRef, fileToUpload);
            const url = await getDownloadURL(snapshot.ref);

            console.log("Upload successful:", url);
            setValue('avatarUrl', url);
        } catch (err) {
            console.error('Upload error:', err);
            alert('Erro ao enviar imagem: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setUploading(false);
            // Clear input
            e.target.value = '';
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);
            const barbershopId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;

            const payload = {
                ...data,
                barbershopId,
                schedules: schedules
            };

            if (isEdit) {
                await api.put(`/professionals/${professional.id}`, payload);
                alert('✅ Profissional atualizado com sucesso!');
            } else {
                await api.post('/professionals', payload);
                alert('✅ Profissional cadastrado com sucesso!');
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert('❌ Erro ao salvar: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 1, label: 'Dados Pessoais', icon: <User className="w-4 h-4" /> },
        { id: 2, label: 'Perfil & Visibilidade', icon: <Briefcase className="w-4 h-4" /> },
        { id: 3, label: 'Serviços', icon: <Shield className="w-4 h-4" /> },
        { id: 4, label: 'Jornada', icon: <Clock className="w-4 h-4" /> },
        { id: 5, label: 'Acesso', icon: <Calendar className="w-4 h-4" /> },
        { id: 6, label: 'Endereço', icon: <MapPin className="w-4 h-4" /> },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-[#0f172a] w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800 flex flex-col my-auto">

                {/* Header */}
                <header className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                            {isEdit ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                                {isEdit ? 'Editar Profissional' : 'Novo Profissional'}
                            </h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic leading-none mt-1">
                                {isEdit ? `Atualizando dados de ${professional.name}` : 'Cadastre um novo membro na sua equipe'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 text-slate-400 rounded-xl transition">
                        <X className="w-6 h-6" />
                    </button>
                </header>

                {/* Tabs Navigation */}
                <nav className="flex items-center gap-1 p-2 bg-slate-950 overflow-x-auto no-scrollbar border-b border-slate-800">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${tab === t.id
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                                }`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </nav>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950/30 max-h-[60vh]">
                    <form id="proForm" onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* Tab 1: Personal Data */}
                        {tab === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                                <Input label="Nome Completo" name="name" register={register} error={errors.name} required />
                                <Input label="Apelido / Nome de Exibição" name="nickname" register={register} error={errors.nickname} />
                                <Input label="E-mail" name="email" type="email" register={register} error={errors.email} required disabled={isEdit} />
                                <Input label="Telefone Móvel" name="phone" placeholder="(00) 00000-0000" register={register} error={errors.phone} required />
                                <Input label="Telefone Fixo" name="landline" register={register} error={errors.landline} />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="CPF" name="cpf" register={register} error={errors.cpf} />
                                    <Input label="CNPJ" name="cnpj" register={register} error={errors.cnpj} />
                                </div>
                                <Input label="RG" name="rg" register={register} error={errors.rg} />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Gênero</label>
                                    <select {...register('gender')} className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 ring-emerald-500 transition appearance-none">
                                        <option value="">Selecione</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Feminino">Feminino</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                                <Input label="Data de Nascimento" name="birthday" type="date" register={register} error={errors.birthday} />
                                <Input label="Comissão (%)" name="commissionPercent" type="number" step="0.1" placeholder="Ex: 50" register={register} error={errors.commissionPercent} />
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Observações</label>
                                    <textarea {...register('notes')} rows={3} className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 ring-emerald-500 transition" />
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Profile & Visibility */}
                        {tab === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800">
                                    <div className="relative group w-32 h-32">
                                        <input type="file" onChange={handleAvatarChange} className="absolute inset-0 opacity-0 z-10 cursor-pointer" />
                                        <div className="w-full h-full rounded-3xl bg-slate-950 border-2 border-slate-800 flex items-center justify-center overflow-hidden group-hover:border-emerald-500 transition">
                                            {watch('avatarUrl') ? (
                                                <img src={watch('avatarUrl')} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="w-10 h-10 text-slate-700" />
                                            )}
                                        </div>
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <h4 className="text-white font-bold uppercase tracking-tight">Foto de Perfil</h4>
                                        <p className="text-slate-500 text-xs">A foto será exibida no app para os clientes. Recomenda-se 512x512px.</p>
                                        <div className="flex gap-4">
                                            <label className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-700 transition">
                                                Escolher Foto
                                                <input type="file" onChange={handleAvatarChange} className="hidden" />
                                            </label>
                                            {watch('avatarUrl') && (
                                                <button type="button" onClick={() => setValue('avatarUrl', '')} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline">Remover</button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Função / Especialidade" name="position" placeholder="Ex: Barbeiro Master" register={register} error={errors.position} required />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Intervalo entre agendamentos (Min)</label>
                                        <select {...register('appointmentInterval', { valueAsNumber: true })} className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white font-bold outline-none appearance-none">
                                            <option value={15}>15 minutos</option>
                                            <option value={30}>30 minutos</option>
                                            <option value={45}>45 minutos</option>
                                            <option value={60}>60 minutos</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Biografia Curta</label>
                                        <textarea {...register('bio')} rows={4} className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 ring-emerald-500 transition" placeholder="Conte um pouco sobre a experiência do profissional..." />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Toggle label="Exibir no App de Clientes?" name="showInApp" register={register} watch={watch} />
                                    <Toggle label="Exibir na Página Pública?" name="showPublicly" register={register} watch={watch} />
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Services */}
                        {tab === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="flex items-center gap-3 bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 text-blue-500">
                                    <Info className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Selecione os serviços que este profissional realiza.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {availableServices.map(service => (
                                        <label key={service.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${watch('services')?.includes(service.id)
                                            ? 'bg-emerald-500/10 border-emerald-500'
                                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                            }`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${watch('services')?.includes(service.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-700'
                                                    }`}>
                                                    {watch('services')?.includes(service.id) && <Check className="w-3 h-3" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm uppercase">{service.name}</p>
                                                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">R$ {parseFloat(service.price).toFixed(2)} • {service.duration}min</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={watch('services')?.includes(service.id)}
                                                onChange={(e) => {
                                                    const current = watch('services') || [];
                                                    if (e.target.checked) {
                                                        setValue('services', [...current, service.id]);
                                                    } else {
                                                        setValue('services', current.filter(id => id !== service.id));
                                                    }
                                                }}
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tab 4: Schedules */}
                        {tab === 4 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                {schedules.map((s, idx) => (
                                    <div key={idx} className={`p-6 rounded-[2rem] border transition-all ${s.isOff ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-900 border-slate-700 shadow-xl shadow-black/20'}`}>
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                            <div>
                                                <h4 className="text-white font-black uppercase tracking-widest text-sm">{['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][s.dayOfWeek]}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => setSchedules(prev => prev.map(item => item.dayOfWeek === s.dayOfWeek ? { ...item, isOff: !item.isOff } : item))}
                                                    className={`text-[10px] font-black uppercase tracking-widest mt-1 ${s.isOff ? 'text-red-500' : 'text-emerald-500 underline'}`}
                                                >
                                                    {s.isOff ? 'Deseja Ativar?' : 'Deseja Marcar Folga?'}
                                                </button>
                                            </div>
                                            {!s.isOff && (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    <Clock className="w-3 h-3" /> Horário Ativo
                                                </div>
                                            )}
                                        </div>

                                        {!s.isOff && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-emerald-500 pl-2">Horário de Atendimento</p>
                                                    <div className="flex items-center gap-3">
                                                        <input type="time" value={s.startTime} onChange={e => setSchedules(prev => prev.map(item => item.dayOfWeek === s.dayOfWeek ? { ...item, startTime: e.target.value } : item))} className="flex-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold" />
                                                        <span className="text-slate-700 font-black text-xs">ATÉ</span>
                                                        <input type="time" value={s.endTime} onChange={e => setSchedules(prev => prev.map(item => item.dayOfWeek === s.dayOfWeek ? { ...item, endTime: e.target.value } : item))} className="flex-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold" />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-orange-500 pl-2">Horário de Pausa / Almoço</p>
                                                    <div className="flex items-center gap-3">
                                                        <input type="time" value={s.breakStart || ''} onChange={e => setSchedules(prev => prev.map(item => item.dayOfWeek === s.dayOfWeek ? { ...item, breakStart: e.target.value } : item))} className="flex-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold" />
                                                        <span className="text-slate-700 font-black text-xs">ATÉ</span>
                                                        <input type="time" value={s.breakEnd || ''} onChange={e => setSchedules(prev => prev.map(item => item.dayOfWeek === s.dayOfWeek ? { ...item, breakEnd: e.target.value } : item))} className="flex-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tab 5: Access */}
                        {tab === 5 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                <div className="bg-slate-900/40 p-8 rounded-[2rem] border border-slate-800 space-y-6">
                                    <h4 className="text-white font-bold uppercase tracking-tight flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-emerald-500" /> Nível de Acesso
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <label className={`p-6 rounded-2xl border transition-all cursor-pointer ${watch('role') === 'BARBER' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                                            <input type="radio" value="BARBER" {...register('role')} className="hidden" />
                                            <p className="font-black uppercase tracking-widest text-[10px]">Barbeiro</p>
                                            <p className="text-[9px] opacity-70 mt-1 uppercase font-bold">Acesso básico à agenda e seus agendamentos.</p>
                                        </label>
                                        <label className={`p-6 rounded-2xl border transition-all cursor-pointer ${watch('role') === 'BARBER_CONSULTA' ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                                            <input type="radio" value="BARBER_CONSULTA" {...register('role')} className="hidden" />
                                            <p className="font-black uppercase tracking-widest text-[10px]">Somente Consulta</p>
                                            <p className="text-[9px] opacity-70 mt-1 uppercase font-bold">Pode ver a agenda mas não pode realizar agendamentos.</p>
                                        </label>
                                        <label className={`p-6 rounded-2xl border transition-all cursor-pointer ${watch('role') === 'ADMIN' ? 'bg-blue-500 text-white border-blue-500' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                                            <input type="radio" value="ADMIN" {...register('role')} className="hidden" />
                                            <p className="font-black uppercase tracking-widest text-[10px]">Gerente / Admin</p>
                                            <p className="text-[9px] opacity-70 mt-1 uppercase font-bold">Acesso total às configurações e relatórios da unidade.</p>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                    <Input
                                        label={isEdit ? "Nova Senha (deixe em branco para manter)" : "Senha de Acesso"}
                                        name="password"
                                        type="password"
                                        register={register}
                                        error={errors.password}
                                        required={!isEdit}
                                    />
                                    <Toggle label="Profissional Ativo?" name="active" register={register} watch={watch} />
                                </div>
                            </div>
                        )}

                        {/* Tab 6: Address */}
                        {tab === 6 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">CEP</label>
                                    <input
                                        {...register('zipCode')}
                                        onBlur={handleZipCodeBlur}
                                        placeholder="00000-000"
                                        className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 ring-emerald-500 transition"
                                    />
                                </div>
                                <Input label="Rua / Logradouro" name="street" register={register} />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Número" name="number" register={register} />
                                    <Input label="Complemento" name="complement" register={register} />
                                </div>
                                <Input label="Bairro" name="neighborhood" register={register} />
                                <Input label="Cidade" name="city" register={register} />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Estado" name="state" register={register} />
                                    <Input label="País" name="country" register={register} />
                                </div>
                            </div>
                        )}

                    </form>
                </div>

                {/* Footer Controls */}
                <footer className="p-8 border-t border-slate-800 bg-slate-900/50 flex justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => tab > 1 && setTab(tab - 1)}
                        className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${tab === 1 ? 'opacity-30 cursor-not-allowed text-slate-600' : 'bg-slate-800 text-white hover:bg-slate-700'
                            }`}
                        disabled={tab === 1}
                    >
                        <ChevronLeft className="w-4 h-4" /> Anterior
                    </button>

                    <div className="flex gap-4">
                        {tab < 6 ? (
                            <button
                                type="button"
                                onClick={() => setTab(tab + 1)}
                                className="flex items-center gap-2 bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95"
                            >
                                Próximo Passo <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                form="proForm"
                                disabled={loading || uploading}
                                className={`flex items-center gap-2 bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 ${(loading || uploading) ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                {isEdit ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR CADASTRO'}
                            </button>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
}

// Helper Components
const Input = ({ label, name, type = 'text', register, error, required, ...rest }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            {...register(name)}
            className={`w-full p-4 bg-slate-900 border appearance-none rounded-2xl text-white font-bold outline-none focus:ring-2 ring-emerald-500 transition ${error ? 'border-red-500/50 ring-red-500/10' : 'border-slate-800'
                }`}
            {...rest}
        />
        {error && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest ml-1">{error.message}</p>}
    </div>
);

const Toggle = ({ label, name, register, watch }) => (
    <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${watch(name) ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-900 border-slate-800'
        }`}>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        <div className={`w-12 h-6 rounded-full relative transition-all ${watch(name) ? 'bg-emerald-500' : 'bg-slate-800'}`}>
            <div className={`absolute top-1 bottom-1 w-4 rounded-full bg-white transition-all ${watch(name) ? 'right-1' : 'left-1'}`} />
        </div>
        <input type="checkbox" {...register(name)} className="hidden" />
    </label>
);
