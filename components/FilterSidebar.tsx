'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

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
        <aside className="sidebar">
            <div className="filter-group">
                <h3 className="filter-title">Oyunlar & Diller</h3>
                {FILTERS.map((filter) => (
                    <label key={filter.id} className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={searchParams.has(filter.id)}
                            onChange={() => handleChange(filter.id)}
                        />
                        {filter.label}
                    </label>
                ))}
            </div>
        </aside>
    );
}
