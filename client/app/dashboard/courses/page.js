'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlayCircle, GraduationCap, Clock, Award, ChevronRight } from 'lucide-react';
import api from '../../lib/clientApi';
import Skeleton from '../../components/ui/Skeleton';

export default function CoursesPage() {
    // React Query to fetch courses
    const { data: courses = [], isLoading, isError } = useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            const res = await api.get('/content/courses');
            return res.data;
        },
    });

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
            <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                    <GraduationCap className="w-8 h-8 text-emerald-500" />
                    ACADEMIA BARBE-ON
                </h1>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-2 ml-1">
                    Evolua suas técnicas e gestão com nossos conteúdos exclusivos.
                </p>
            </div>

            {/* Content Grid */}
            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] border border-dashed border-white/10 rounded-3xl bg-[#151821]/50 p-8 text-center">
                    <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                        <GraduationCap className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">Ainda não há cursos disponíveis</h3>
                    <p className="text-slate-500 text-xs max-w-xs mx-auto">
                        Fique ligado! Em breve teremos novos conteúdos para impulsionar sua carreira.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
}

function CourseCard({ course }) {
    return (
        <div className="group bg-[#151821] border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1">
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
                    <div className="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-500" />
                        {course.duration || 'Curta Duração'}
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400">
                        {course.category || 'Técnica'}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-emerald-400 transition-colors">
                    {course.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {course.description || 'Sem descrição disponível.'}
                </p>

                <button className="w-full mt-auto flex items-center justify-center gap-2 bg-[#0F111A] border border-white/10 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                    <span>Assistir Agora</span>
                    <ChevronRight className="w-3 h-3" />
                </button>
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
