'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

export default function SortSelect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get('sort') || 'newest';

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', e.target.value);
        params.set('page', '1'); // Reset to first page when sorting changes
        router.push('?' + params.toString());
    };

    return (
        <div className="flex items-center gap-2">
            <div className="relative group">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-primary transition-colors pointer-events-none" />
                <select
                    value={currentSort}
                    onChange={handleSortChange}
                    className="h-10 pl-10 pr-8 bg-slate-950 border border-white/10 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-primary/50 hover:border-white/20 transition-colors appearance-none cursor-pointer min-w-[180px]"
                >
                    <option value="newest">En Yeniler</option>
                    <option value="price-asc">Fiyat: Artan</option>
                    <option value="price-desc">Fiyat: Azalan</option>
                    <option value="name-asc">İsim: A-Z</option>
                    <option value="name-desc">İsim: Z-A</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
