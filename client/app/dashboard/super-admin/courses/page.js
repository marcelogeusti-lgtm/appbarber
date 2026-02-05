'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GraduationCap, Plus, Edit, Trash2, PlayCircle, Clock } from 'lucide-react';
import api from '../../../../lib/api';
import Skeleton from '../../../../components/ui/Skeleton';
import CourseFormModal from '../../courses/CourseFormModal';
import { useRouter } from 'next/navigation';

export default function SuperAdminCoursesPage() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    // Strict Role Check for [marcelogeusti@gmail.com]
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
            return res.data;
        },
    });

    const handleEdit = (course) => {
        setEditingCourse(course);
        setIsCreateOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Deseja realmente excluir este curso?")) return;
        try {
            await api.delete(`/admin/courses/${id}`);
            queryClient.invalidateQueries(['admin-courses']);
        } catch (error) {
            alert("Erro ao excluir curso");
        }
    };

    if (isLoading) return <div className="p-10"><Skeleton className="h-40 rounded-3xl" /></div>;

    return (
        <div className="bg-[#0F111A] min-h-screen p-4 md:p-8 space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#151821] p-8 rounded-3xl border border-white/5 shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center text-3xl">
                        🎓
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Gestão de Cursos</h1>
                        <p className="text-slate-500 text-sm font-medium italic mt-1 leading-none">Controle administrativo da Academia Barbe-On</p>
                    </div>
                </div>
                <button
                    onClick={() => { setEditingCourse(null); setIsCreateOpen(true); }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Novo Curso
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div key={course.id} className={`bg-[#151821] border rounded-2xl overflow-hidden transition-all flex flex-col ${!course.active ? 'border-red-500/30' : 'border-white/5'}`}>
                        <div className="relative h-40 bg-slate-800">
                            {course.thumbnailUrl && <img src={course.thumbnailUrl} className="w-full h-full object-cover" />}
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button onClick={() => handleEdit(course)} className="p-2 bg-white text-slate-900 rounded-lg hover:bg-emerald-400 transition"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(course.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="p-5 flex-1">
                            <h3 className="text-white font-bold">{course.title}</h3>
                            <p className="text-xs text-slate-500 mt-2 line-clamp-2">{course.description}</p>
                            <div className="mt-4 flex items-center justify-between">
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${course.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {course.active ? 'Publicado' : 'Privado'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">{course.category}</span>
                            </div>
                        </div>
                    </div>
                ))}
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
