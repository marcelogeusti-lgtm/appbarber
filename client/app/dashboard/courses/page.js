'use client';
import { useQuery } from '@tanstack/react-query';
import { PlayCircle, GraduationCap, Clock, ExternalLink, Zap, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';
import Skeleton from '../../../components/ui/Skeleton';

export default function CoursesPage() {
    const { data: courses = [], isLoading, isError } = useQuery({
        queryKey: ['courses'],
        queryFn: async () => {
            const res = await api.get('/content/courses');
            return Array.isArray(res.data) ? res.data : [];
        },
    });

    if (isLoading) return <CoursesSkeleton />;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-card rounded-xl border border-border shadow-sm">
                <div className="p-6 bg-destructive/10 rounded-xl mb-6 shadow-inner">
                    <AlertCircle className="w-12 h-12 text-destructive" />
                </div>
                <h2 className="text-2xl font-black text-foreground mb-3 uppercase tracking-tighter">Sincronização Falhou</h2>
                <p className="text-muted-foreground text-sm font-medium italic mb-8 max-w-sm">Não foi possível conectar com a Academia NEXT no momento.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-10 py-4 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-10 rounded-xl border border-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] -mr-40 -mt-40" />
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <GraduationCap className="w-10 h-10 text-primary" />
                        <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">Academia NEXT</h1>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium italic uppercase tracking-widest ml-1 opacity-80">
                        Evolua suas técnicas e gestão com nossos conteúdos exclusivos para parceiros.
                    </p>
                </div>
                <div className="bg-primary/5 border border-primary/20 px-6 py-3 rounded-xl relative z-10">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Acesso Premium Liberado
                    </span>
                </div>
            </header>

            {/* Content Grid */}
            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] border-2 border-dashed border-border rounded-xl bg-card/30 p-12 text-center shadow-inner">
                    <div className="p-6 bg-muted rounded-full mb-6">
                        <GraduationCap className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-foreground font-black text-xl mb-2 uppercase tracking-tight">Novos Conteúdos em Breve</h3>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest max-w-xs mx-auto leading-relaxed opacity-60">
                        Estamos preparando uma nova trilha de conhecimento para impulsionar sua carreira. Fique ligado!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <div className="group bg-card border border-border rounded-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 hover:border-primary/30 flex flex-col shadow-sm">
            <div className="relative h-56 bg-muted overflow-hidden">
                {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-background">
                        <PlayCircle className="w-16 h-16 text-muted-foreground/20 group-hover:text-primary transition-colors duration-500" />
                    </div>
                )}
                <div className="absolute top-5 left-5">
                    {course.duration && (
                        <div className="bg-background/80 backdrop-blur-xl text-foreground text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 border border-border shadow-xl">
                            <Clock className="w-3 h-3 text-primary" />
                            {course.duration}
                        </div>
                    )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>

            <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--primary)]"></span>
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">{course.category || 'Módulo Exclusivo'}</span>
                </div>
                <h3 className="text-xl font-black text-foreground mb-3 leading-tight uppercase tracking-tight group-hover:text-primary transition-colors duration-300">{course.title}</h3>
                <p className="text-xs text-muted-foreground font-medium italic mb-8 leading-relaxed flex-1 line-clamp-3">{course.description || 'Este conteúdo faz parte da trilha de especialização para barbeiros de alta performance.'}</p>

                <a
                    href={course.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 bg-secondary text-secondary-foreground border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary py-5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:shadow-primary/20"
                >
                    <span>Assistir Agora</span>
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
}

function CoursesSkeleton() {
    return (
        <div className="p-10 space-y-10">
            <div className="space-y-4">
                <Skeleton className="w-64 h-10 rounded-xl" />
                <Skeleton className="w-96 h-4 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 rounded-xl" />)}
            </div>
        </div>
    );
}
