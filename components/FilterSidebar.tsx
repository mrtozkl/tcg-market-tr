'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Filter } from 'lucide-react';

const FILTERS = [
    { id: 'pokemon_en', label: 'Pokemon (English)' },
    { id: 'pokemon_jp', label: 'Pokemon (Japanese)' },
    { id: 'pokemon_kr', label: 'Pokemon (Korean)' },
    { id: 'pokemon_cn', label: 'Pokemon (Chinese)' },
    { id: 'onepiece_en', label: 'One Piece (English)' },
    { id: 'onepiece_jp', label: 'One Piece (Japanese)' },
    { id: 'mtg', label: 'Magic: The Gathering' },
    { id: 'yugioh', label: 'Yu-Gi-Oh!' },
    { id: 'lorcana', label: 'Lorcana' },
    { id: 'topps', label: 'TOPPS' },
    { id: 'riftbound_en', label: 'Riftbound (English)' },
    { id: 'riftbound_cn', label: 'Riftbound (Chinese)' },
];

export default function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (params.has(name)) {
                params.delete(name);
            } else {
                params.set(name, value);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleChange = (id: string) => {
        router.push('?' + createQueryString(id, 'true'));
    };

    return (
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="rounded-xl border border-white/10 bg-card p-6">
                <div className="flex items-center gap-2 mb-6 text-primary">
                    <Filter className="w-5 h-5" />
                    <h3 className="font-bold">Filtrele</h3>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Oyunlar & Diller
                    </h4>
                    <div className="space-y-3">
                        {FILTERS.map((filter) => (
                            <label key={filter.id} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="peer h-4 w-4 appearance-none rounded border border-white/20 bg-slate-950 checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        checked={searchParams.has(filter.id)}
                                        onChange={() => handleChange(filter.id)}
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
                                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                    {filter.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
