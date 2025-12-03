'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { Filter, Store, Banknote } from 'lucide-react';
import { useDebounce } from 'use-debounce';

interface CardFilterSidebarProps {
    games: string[];
    sellers: string[];
}

export default function CardFilterSidebar({ games, sellers }: CardFilterSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state for price inputs to avoid excessive URL updates
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

    const [debouncedMinPrice] = useDebounce(minPrice, 500);
    const [debouncedMaxPrice] = useDebounce(maxPrice, 500);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value === '' || value === null) {
                params.delete(name);
            } else {
                params.set(name, value);
            }
            return params.toString();
        },
        [searchParams]
    );

    // Effect to update URL when debounced price changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedMinPrice) params.set('minPrice', debouncedMinPrice);
        else params.delete('minPrice');

        if (debouncedMaxPrice) params.set('maxPrice', debouncedMaxPrice);
        else params.delete('maxPrice');

        router.push('?' + params.toString());
    }, [debouncedMinPrice, debouncedMaxPrice, router, searchParams]);

    const isSelected = (key: string, value: string) => {
        return searchParams.get(key) === value;
    };

    const handleChange = (key: string, value: string) => {
        // Toggle logic
        if (isSelected(key, value)) {
            router.push('?' + createQueryString(key, ''));
        } else {
            router.push('?' + createQueryString(key, value));
        }
    };

    return (
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="rounded-xl border border-white/10 bg-card p-6">
                <div className="flex items-center gap-2 mb-6 text-primary">
                    <Filter className="w-5 h-5" />
                    <h3 className="font-bold">Filtrele</h3>
                </div>

                <div className="space-y-6">
                    {/* Game Filter */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Oyunlar
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {games.map((game) => (
                                <label key={game} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="peer h-4 w-4 appearance-none rounded border border-white/20 bg-slate-950 checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            checked={isSelected('game', game)}
                                            onChange={() => handleChange('game', game)}
                                        />
                                        <svg
                                            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        >
                                            <path d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className={`text-sm transition-colors ${isSelected('game', game) ? 'text-white font-medium' : 'text-slate-300 group-hover:text-white'}`}>
                                        {game}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Price Filter */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            <Banknote className="w-4 h-4" />
                            <h4>Fiyat Aralığı</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <span className="text-slate-500">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Seller Filter */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            <Store className="w-4 h-4" />
                            <h4>Satıcılar</h4>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {sellers.map((seller) => (
                                <label key={seller} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="peer h-4 w-4 appearance-none rounded border border-white/20 bg-slate-950 checked:border-secondary checked:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                                            checked={isSelected('seller', seller)}
                                            onChange={() => handleChange('seller', seller)}
                                        />
                                        <svg
                                            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        >
                                            <path d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className={`text-sm transition-colors ${isSelected('seller', seller) ? 'text-white font-medium' : 'text-slate-300 group-hover:text-white'}`}>
                                        {seller}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
