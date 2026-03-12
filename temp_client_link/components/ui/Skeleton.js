export default function Skeleton({ className }) {
    return (
        <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
    );
}

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-[#0F111A] text-white p-4 md:p-8 space-y-6">
            {/* Header Skeleton */}
            <div className="bg-[#151821] rounded-3xl p-6 h-32 border border-white/5 flex items-center gap-4">
                <Skeleton className="w-12 h-12" />
                <div className="space-y-2">
                    <Skeleton className="w-48 h-8" />
                    <Skeleton className="w-24 h-4" />
                </div>
            </div>

            {/* Top Cards Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-48 rounded-[2rem]" />
                <Skeleton className="h-48 rounded-[2rem]" />
            </div>

            {/* Metrics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-48 rounded-[2rem]" />
                <Skeleton className="h-48 rounded-[2rem]" />
            </div>
        </div>
    );
}
