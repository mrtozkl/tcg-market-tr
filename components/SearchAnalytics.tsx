'use client';

import { useSearchParams } from 'next/navigation';
import { track } from '@vercel/analytics/react';
import { useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function SearchAnalytics() {
    const searchParams = useSearchParams();
    const prevParamsRef = useRef<string>('');

    const trackSearch = useDebouncedCallback((params: URLSearchParams) => {
        const query = params.get('q');
        const game = params.get('game');
        const seller = params.get('seller');
        const sort = params.get('sort');
        const minPrice = params.get('minPrice');
        const maxPrice = params.get('maxPrice');
        const page = params.get('page');

        // Only track if meaningful filters exist
        if (query || game || seller || sort || minPrice || maxPrice) {
            track('Search', {
                term: query || undefined,
                game: game || undefined,
                seller: seller || undefined,
                sort: sort || undefined,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                page: page ? Number(page) : 1,
            });
        }
    }, 2000); // 2 seconds debounce to avoid tracking every keystroke if URL updates rapidly

    useEffect(() => {
        const currentParamsString = searchParams.toString();
        if (currentParamsString !== prevParamsRef.current) {
            trackSearch(new URLSearchParams(currentParamsString));
            prevParamsRef.current = currentParamsString;
        }
    }, [searchParams, trackSearch]);

    return null;
}
