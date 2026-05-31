'use client';

import { Search, LocateFixed, Check, SlidersHorizontal, X, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SearchFilters({ 
    searchTerm, 
    setSearchTerm, 
    onLocationSearch, 
    activeFilters, 
    toggleFilter,
    isLocating 
}) {
    const [inputValue, setInputValue] = useState(searchTerm || '');
    const [savedSearches, setSavedSearches] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('@appbarber_saved_searches');
        if (saved) {
            try {
                setSavedSearches(JSON.parse(saved));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    // Sync external prop back to input value if it changes externally
    useEffect(() => {
        setInputValue(searchTerm || '');
    }, [searchTerm]);

    // Debounce internal input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (setSearchTerm) {
                setSearchTerm(inputValue);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [inputValue, setSearchTerm]);

    const handleSaveSearch = () => {
        if (!inputValue || inputValue.trim() === '') return;
        const currentSearch = inputValue.trim();
        let newSearches = [...savedSearches];
        
        // Prevent exact duplicates
        if (!newSearches.includes(currentSearch)) {
            newSearches.unshift(currentSearch);
            // Keep only last 5 saved searches
            if (newSearches.length > 5) {
                newSearches = newSearches.slice(0, 5);
            }
            setSavedSearches(newSearches);
            localStorage.setItem('@appbarber_saved_searches', JSON.stringify(newSearches));
        }
    };

    const handleRemoveSavedSearch = (searchToRemove) => {
        const newSearches = savedSearches.filter(s => s !== searchToRemove);
        setSavedSearches(newSearches);
        localStorage.setItem('@appbarber_saved_searches', JSON.stringify(newSearches));
    };

    const applySavedSearch = (search) => {
        setInputValue(search);
        if (setSearchTerm) setSearchTerm(search);
    };

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
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all text-sm"
                    />
                    {inputValue && inputValue.trim() !== '' && (
                        <button 
                            onClick={handleSaveSearch}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors flex items-center justify-center p-1 bg-white/5 rounded-md border border-white/10"
                            title="Salvar esta busca"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <button
                    onClick={onLocationSearch}
                    disabled={isLocating}
                    className={`flex items-center justify-center aspect-square h-[54px] rounded-xl border transition-all ${
                        isLocating 
                        ? 'bg-primary/20 border-primary/40 animate-pulse' 
                        : 'bg-white/5 border-white/10 hover:border-white/20 active:scale-95'
                    }`}
                >
                    <LocateFixed className={`w-5 h-5 ${isLocating ? 'text-primary' : 'text-white/60'}`} />
                </button>
            </div>

            {savedSearches.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest flex-shrink-0 mr-1">Salvos:</span>
                    
                    {savedSearches.map((search, idx) => {
                        const isActive = inputValue === search;
                        return (
                            <div key={idx} className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                isActive
                                ? 'bg-primary text-black border-primary'
                                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                            }`}>
                                <button
                                    onClick={() => applySavedSearch(search)}
                                    className="flex items-center gap-1.5"
                                >
                                    {isActive && <Check className="w-3 h-3" />}
                                    {search}
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleRemoveSavedSearch(search); }}
                                    className={`ml-1 p-0.5 rounded-full transition-colors ${isActive ? 'hover:bg-black/20 text-black/70' : 'hover:bg-white/10 text-white/40 hover:text-white'}`}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
