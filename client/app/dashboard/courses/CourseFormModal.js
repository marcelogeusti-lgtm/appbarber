'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Check, Loader2, Image as ImageIcon, Link as LinkIcon, Type, AlignLeft, Clock, Tag } from 'lucide-react';
import api from '../../../lib/api';

const courseSchema = z.object({
    title: z.string().min(3, 'Título muito curto'),
    description: z.string().optional(),
    thumbnailUrl: z.string().url('URL da imagem inválida').optional().or(z.literal('')),
    link: z.string().url('Link de checkout inválido'),
    category: z.string().optional(),
    duration: z.string().optional(),
    active: z.boolean().default(true),
    order: z.number().default(0)
});

export default function CourseFormModal({ isOpen, onClose, course, onSuccess }) {
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            active: true,
            order: 0
        }
    });

    const isEdit = !!course;

    useEffect(() => {
        if (isOpen) {
            if (course) {
                reset({
                    title: course.title,
                    description: course.description || '',
                    thumbnailUrl: course.thumbnailUrl || '',
                    link: course.link,
                    category: course.category || '',
                    duration: course.duration || '',
                    active: course.active,
                    order: course.order || 0
                });
            } else {
                reset({
                    title: '',
                    description: '',
                    thumbnailUrl: '',
                    link: '',
                    category: '',
                    duration: '',
                    active: true,
                    order: 0
                });
            }
        }
    }, [isOpen, course, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Note: The backend requireMaster middleware will verify permissions
            // Token is automatically attached by clientApi

            if (isEdit) {
                await api.put(`/admin/courses/${course.id}`, data);
                alert('✅ Curso atualizado com sucesso!');
            } else {
                await api.post('/admin/courses', data);
                alert('✅ Curso criado com sucesso!');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Erro ao salvar curso.';
            alert(`❌ ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-[#0f172a] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800 flex flex-col my-auto">
                <header className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
                            {isEdit ? 'Editar Curso' : 'Novo Curso'}
                        </h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic leading-none mt-1">
                            {isEdit ? 'Atualize os dados da vitrine' : 'Adicione um novo produto à vitrine'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 text-slate-400 rounded-xl transition">
                        <X className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-8 bg-slate-950/30 overflow-y-auto max-h-[70vh]">
                    <form id="courseForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Title */}
                        <Input
                            label="Título do Curso"
                            name="title"
                            register={register}
                            error={errors.title}
                            icon={<Type className="w-4 h-4" />}
                            placeholder="Ex: Corte Degrade Avançado"
                            required
                        />

                        {/* Link Checkout */}
                        <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20 space-y-4">
                            <div className="flex items-center gap-2 text-emerald-500 mb-2">
                                <LinkIcon className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Link de Venda (Checkout)</span>
                            </div>
                            <Input
                                label="URL Externa"
                                name="link"
                                register={register}
                                error={errors.link}
                                placeholder="https://kiwify.com.br/..."
                                required
                                className="bg-emerald-950/20 border-emerald-500/30 focus:ring-emerald-500"
                            />
                            <p className="text-[9px] text-slate-500 font-medium">
                                * Este é o link para onde o barbeiro será redirecionado ao clicar em "Comprar".
                            </p>
                        </div>

                        {/* Image URL */}
                        <div className="space-y-4">
                            <Input
                                label="URL da Imagem (Thumbnail)"
                                name="thumbnailUrl"
                                register={register}
                                error={errors.thumbnailUrl}
                                icon={<ImageIcon className="w-4 h-4" />}
                                placeholder="https://..."
                            />
                            {watch('thumbnailUrl') && (
                                <div className="h-40 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 relative">
                                    <img
                                        src={watch('thumbnailUrl')}
                                        alt="Preview"
                                        className="w-full h-full object-cover opacity-70"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-2 py-1 rounded">Preview</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                <AlignLeft className="w-3 h-3" /> Descrição Curta
                            </label>
                            <textarea
                                {...register('description')}
                                rows={3}
                                className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 ring-emerald-500 transition resize-none"
                                placeholder="Resumo do que será ensinado..."
                            />
                        </div>

                        {/* Meta Data */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Categoria"
                                name="category"
                                register={register}
                                icon={<Tag className="w-4 h-4" />}
                                placeholder="Ex: Gestão"
                            />
                            <Input
                                label="Duração"
                                name="duration"
                                register={register}
                                icon={<Clock className="w-4 h-4" />}
                                placeholder="Ex: 4h 30m"
                            />
                        </div>

                        {/* Status Toggle */}
                        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between cursor-pointer" onClick={() => setValue('active', !watch('active'))}>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Curso Ativo / Visível?</span>
                            <div className={`w-12 h-6 rounded-full relative transition-all ${watch('active') ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                                <div className={`absolute top-1 bottom-1 w-4 rounded-full bg-white transition-all ${watch('active') ? 'right-1' : 'left-1'}`} />
                            </div>
                            <input type="checkbox" {...register('active')} className="hidden" />
                        </div>

                    </form>
                </div>

                <footer className="p-8 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-6 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="courseForm"
                        disabled={loading}
                        className={`flex items-center gap-2 bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {isEdit ? 'SALVAR ALTERAÇÕES' : 'CRIAR CURSO'}
                    </button>
                </footer>
            </div>
        </div>
    );
}

const Input = ({ label, name, register, error, required, icon, className, ...rest }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
            {icon} {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            {...register(name)}
            className={`w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white font-bold outline-none focus:ring-2 ring-emerald-500 transition ${error ? 'border-red-500/50 ring-red-500/10' : ''} ${className}`}
            {...rest}
        />
        {error && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest ml-1">{error.message}</p>}
    </div>
);
