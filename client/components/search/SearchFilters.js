'use client';

import { Search, LocateFixed, Check, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';

const FILTER_CHIPS = [
    { id: 'aberto', label: 'Aberto Agora' },
    { id: 'barba', label: 'Barba' },
    { id: 'kids', label: 'Kids' },
    { id: 'premium', label: 'Avaliação 4.5+' },
];

export default function SearchFilters({ 
    searchTerm, 
    setSearchTerm, 
    onLocationSearch, 
    activeFilters, 
    toggleFilter,
    isLocating 
}) {
    const [inputValue, setInputValue] = useState(searchTerm);

    // Debounce internal input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(inputValue);
        }, 400);
        return () => clearTimeout(timer);
    }, [inputValue, setSearchTerm]);

    return (
        <div className="flex flex-col gap-4 sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-xl z-30 pt-4 pb-2 border-b border-white/5">
            <div className="flex gap-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, cidade ou serviço..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm"
                    />
                </div>
                <button
                    onClick={onLocationSearch}
                    disabled={isLocating}
                    className={`flex items-center justify-center aspect-square h-[54px] rounded-2xl border transition-all ${
                        isLocating 
                        ? 'bg-primary/20 border-primary/40 animate-pulse' 
                        : 'bg-white/5 border-white/10 hover:border-white/20 active:scale-95'
                    }`}
                >
                    <LocateFixed className={`w-5 h-5 ${isLocating ? 'text-primary' : 'text-white/60'}`} />
                </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                <button className="flex-shrink-0 flex items-center justify-center aspect-square w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/60">
                    <SlidersHorizontal className="w-4 h-4" />
                </button>
                
                {FILTER_CHIPS.map((chip) => {
                    const isActive = activeFilters.includes(chip.id);
                    return (
                        <button
                            key={chip.id}
                            onClick={() => toggleFilter(chip.id)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                isActive
                                ? 'bg-primary text-black border-primary'
                                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                            }`}
                        >
                            {isActive && <Check className="w-3 h-3" />}
                            {chip.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
