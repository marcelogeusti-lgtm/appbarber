import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ 
    currentPage, 
    totalPages, 
    totalItems, 
    limit, 
    onPageChange, 
    onLimitChange,
    label = "registros" 
}) => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalItems);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 bg-card/50 border-t border-border">
            <div className="text-sm text-muted-foreground font-medium order-2 md:order-1">
                {totalItems > 0 ? (
                    <>Mostrando <span className="text-foreground font-bold">{startItem}–{endItem}</span> de <span className="text-foreground font-bold">{totalItems}</span> {label}</>
                ) : (
                    <>Nenhum {label} encontrado</>
                )}
            </div>

            <div className="flex items-center gap-2 order-1 md:order-2">
                <div className="flex items-center gap-1 bg-background/50 p-1 rounded-xl border border-border">
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        className="p-2 hover:bg-accent rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        title="Primeira página"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 hover:bg-accent rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        title="Anterior"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1 px-2">
                        {pages.map(page => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                    currentPage === page 
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 hover:bg-accent rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        title="Próxima"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 hover:bg-accent rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        title="Última página"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 ml-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Exibir</span>
                    <select
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        className="bg-background border border-border rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 ring-primary/20 outline-none transition-all cursor-pointer"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
