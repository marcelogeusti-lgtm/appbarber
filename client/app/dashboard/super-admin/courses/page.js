'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GraduationCap, Plus, Edit, Trash2, PlayCircle, Clock, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../../../lib/api';
import Skeleton from '../../../../components/ui/Skeleton';
import CourseFormModal from '../../courses/CourseFormModal';
import { useRouter } from 'next/navigation';

export default function SuperAdminCoursesPage() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    // Strict Role Check
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.email !== 'marcelogeusti@gmail.com' && user.role !== 'SUPER_ADMIN') {
                router.push('/dashboard');
            }
        } else {
            router.push('/login');
        }
    }, [router]);

    const { data: courses = [], isLoading, isError } = useQuery({
        queryKey: ['admin-courses'],
        queryFn: async () => {
            const res = await api.get('/admin/courses');
            return Array.isArray(res.data) ? res.data : [];
        },
    });

    const handleEdit = (course) => {
        setEditingCourse(course);
        setIsCreateOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("🔴 Governança: Deseja realmente remover este ativo de conhecimento permanentemente?")) return;
        try {
            await api.delete(`/admin/courses/${id}`);
            queryClient.invalidateQueries(['admin-courses']);
        } catch (error) {
            alert("Erro ao excluir curso");
        }
    };

    if (isLoading) return (
        <div className="p-10 space-y-10">
            <Skeleton className="h-40 rounded-[2.5rem]" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-3xl" />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-10 rounded-[2.5rem] border border-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] -mr-40 -mt-40" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-[1.8rem] border border-primary/20 flex items-center justify-center text-3xl shadow-inner">
                        <GraduationCap className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Academia Maestro</h1>
                        <p className="text-muted-foreground text-sm font-medium italic mt-1 leading-none uppercase tracking-widest text-[10px] opacity-80">Gestão de Ativos de Conhecimento Barbe-On Diamond</p>
                    </div>
                </div>
                <button
                    onClick={() => { setEditingCourse(null); setIsCreateOpen(true); }}
                    className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-3 relative z-10"
                >
                    <Plus className="w-5 h-5" /> Inserir Novo Conteúdo
                </button>
            </header>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                    <div key={course.id} className={`group bg-card border rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 flex flex-col ${!course.active ? 'border-destructive/30 grayscale-[0.5]' : 'border-border'}`}>
                        <div className="relative h-48 bg-muted overflow-hidden">
                            {course.thumbnailUrl ? (
                                <img src={course.thumbnailUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-background">
                                    <PlayCircle className="w-12 h-12 text-muted-foreground/30" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button onClick={() => handleEdit(course)} className="p-3 bg-background/80 backdrop-blur-xl text-foreground border border-border rounded-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-xl"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(course.id)} className="p-3 bg-destructive/10 backdrop-blur-xl text-destructive border border-destructive/20 rounded-xl hover:bg-destructive hover:text-destructive-foreground transition-all shadow-xl"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-xl ${course.active ? 'bg-primary/20 text-primary border-primary/30' : 'bg-destructive/20 text-destructive border-destructive/30'}`}>
                                    {course.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                    {course.active ? 'Publicado' : 'Privado'}
                                </span>
                            </div>
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-2 group-hover:text-primary transition-colors leading-tight">{course.title}</h3>
                            <p className="text-xs text-muted-foreground font-medium italic mt-2 line-clamp-2 opacity-70 leading-relaxed">{course.description || 'Nenhuma descrição técnica disponível para este ativo.'}</p>
                            <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{course.category || 'TÉCNICO'}</span>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-bold uppercase">{course.duration || '00:00'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {courses.length === 0 && (
                    <div className="md:col-span-3 py-32 bg-card rounded-[3rem] border-2 border-dashed border-border flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                            <GraduationCap className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <h4 className="text-foreground font-black uppercase tracking-widest text-sm mb-2">Vault Vazio</h4>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest italic">Nenhum curso cadastrado no ecossistema Diamond.</p>
                    </div>
                )}
            </div>

            <CourseFormModal
                isOpen={isCreateOpen}
                onClose={() => { setIsCreateOpen(false); setEditingCourse(null); }}
                course={editingCourse}
                onSuccess={() => queryClient.invalidateQueries(['admin-courses'])}
            />
        </div>
    );
}
