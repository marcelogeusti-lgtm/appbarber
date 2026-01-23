'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlayCircle, GraduationCap, Clock, Award, ChevronRight, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import api from '../../../lib/clientApi';
import Skeleton from '../../../components/ui/Skeleton';
import CourseFormModal from './CourseFormModal';

export default function CoursesPage() {
    const queryClient = useQueryClient();
    const [isMaster, setIsMaster] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    // Initial Role Check
    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                // Strict check: email must be master OR role SUPER_ADMIN (as backup)
                const isMasterUser = user.email === 'marcelogeusti@gmail.com' || user.role === 'SUPER_ADMIN';
                setIsMaster(isMasterUser);
            }
        } catch (e) {
            console.error("Error parsing user for RBAC", e);
        }
    }, []);

    // React Query to fetch courses
    const { data: courses = [], isLoading, isError } = useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            // Master typically wants to manage ALL courses. 
            // The content endpoint returns only ACTIVE ones.
            //Ideally Master should call /admin/courses but let's stick to content for now to avoid 403 if token role logic misses
            // Actually, let's try to be smart.
            const userStr = localStorage.getItem('user');
            let isAdminRoute = false;

            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.email === 'marcelogeusti@gmail.com' || user.role === 'SUPER_ADMIN') {
                    isAdminRoute = true;
                }
            }

            const endpoint = isAdminRoute ? '/admin/courses' : '/content/courses';
            try {
                const res = await api.get(endpoint);
                return res.data;
            } catch (err) {
                // Fallback if admin route fails for some reason
                if (isAdminRoute) {
                    const res = await api.get('/content/courses');
                    return res.data;
                }
                throw err;
            }
        },
    });

    const handleEdit = (course) => {
        setEditingCourse(course);
        setIsCreateOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir este curso?")) return;
        try {
            await api.delete(`/admin/courses/${id}`);
            queryClient.invalidateQueries(['courses']);
        } catch (error) {
            alert("Erro ao excluir curso");
        }
    };

    if (isLoading) return <CoursesSkeleton />;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
                <div className="p-4 bg-red-500/10 rounded-full mb-4">
                    <GraduationCap className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Ops! Algo deu errado.</h2>
                <p className="text-slate-400 text-sm mb-4">Não conseguimos carregar os cursos no momento.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-[#151821] border border-white/10 hover:border-emerald-500 rounded-lg text-xs font-bold uppercase tracking-widest text-white transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#0F111A] min-h-screen p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-emerald-500" />
                        ACADEMIA BARBE-ON
                    </h1>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-2 ml-1">
                        {isMaster ? 'Painel de Gestão de Cursos e Conteúdos.' : 'Evolua suas técnicas e gestão com nossos conteúdos exclusivos.'}
                    </p>
                </div>

                {isMaster && (
                    <button
                        onClick={() => { setEditingCourse(null); setIsCreateOpen(true); }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Novo Curso
                    </button>
                )}
            </div>

            {/* Content Grid */}
            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] border border-dashed border-white/10 rounded-3xl bg-[#151821]/50 p-8 text-center">
                    <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                        <GraduationCap className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">
                        {isMaster ? 'Nenhum curso cadastrado' : 'Ainda não há cursos disponíveis'}
                    </h3>
                    <p className="text-slate-500 text-xs max-w-xs mx-auto mb-6">
                        {isMaster ? 'Comece a adicionar conteúdo para sua vitrine agora mesmo.' : 'Fique ligado! Em breve teremos novos conteúdos para impulsionar sua carreira.'}
                    </p>
                    {isMaster && (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="text-emerald-500 font-bold uppercase text-xs hover:underline"
                        >
                            Cadastrar Primeiro Curso
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            isMaster={isMaster}
                            onEdit={() => handleEdit(course)}
                            onDelete={() => handleDelete(course.id)}
                        />
                    ))}
                </div>
            )}

            <CourseFormModal
                isOpen={isCreateOpen}
                onClose={() => { setIsCreateOpen(false); setEditingCourse(null); }}
                course={editingCourse}
                onSuccess={() => queryClient.invalidateQueries(['courses'])}
            />
        </div>
    );
}

function CourseCard({ course, isMaster, onEdit, onDelete }) {
    return (
        <div className={`group bg-[#151821] border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 flex flex-col ${!course.active && isMaster ? 'border-red-500/30 opacity-75' : 'border-white/5 hover:border-emerald-500/30'}`}>
            {/* Thumbnail / Cover */}
            <div className="relative h-48 bg-slate-800 overflow-hidden">
                {course.thumbnailUrl ? (
                    <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1F2937] to-[#111827]">
                        <PlayCircle className="w-12 h-12 text-white/20 group-hover:text-emerald-500/80 transition-colors" />
                    </div>
                )}

                {/* Badge (Duration/Type) */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {course.duration && (
                        <div className="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-500" />
                            {course.duration}
                        </div>
                    )}

                    {/* Status Badge for Master */}
                    {isMaster && (
                        <div className={`backdrop-blur-md text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1 ${course.active ? 'bg-emerald-500/80 text-black' : 'bg-red-500/80 text-white'}`}>
                            {course.active ? 'Online' : 'Offline'}
                        </div>
                    )}
                </div>

                {/* Master Actions Overlay */}
                {isMaster && (
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="p-2 bg-white text-slate-900 rounded-lg hover:bg-emerald-400 transition"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            title="Excluir"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                    <span className={`w-1.5 h-1.5 rounded-full ${isMaster && !course.active ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                    <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">
                        {course.category || 'Curso'}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-emerald-400 transition-colors">
                    {course.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 mb-6 leading-relaxed flex-1">
                    {course.description || 'Sem descrição disponível.'}
                </p>

                {isMaster ? (
                    <div className="w-full bg-[#0F111A] border border-dashed border-white/10 text-slate-500 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center">
                        Visão do Administrador
                    </div>
                ) : (
                    <a
                        href={course.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-[#0F111A] border border-white/10 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                        <span>Comprar Agora</span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>
        </div>
    );
}

function CoursesSkeleton() {
    return (
        <div className="p-8 space-y-8">
            <div className="space-y-4">
                <Skeleton className="w-48 h-8 rounded-lg" />
                <Skeleton className="w-64 h-4 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-80 rounded-2xl" />
                ))}
            </div>
        </div>
    )
}
