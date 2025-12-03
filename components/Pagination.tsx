'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const handlePageChange = (pageNumber: number) => {
        router.push(createPageURL(pageNumber));
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-2 mt-12">
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
                Önceki
            </button>

            <div className="flex items-center gap-1">
                {/* Always show first page */}
                <button
                    onClick={() => handlePageChange(1)}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${currentPage === 1
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                >
                    1
                </button>

                {/* Ellipsis if current page is far from start */}
                {currentPage > 3 && <span className="text-muted-foreground px-1">...</span>}

                {/* Pages around current */}
                {Array.from({ length: 3 }, (_, i) => currentPage - 1 + i)
                    .filter((page) => page > 1 && page < totalPages)
                    .map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${currentPage === page
                                    ? 'bg-primary border-primary text-white'
                                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                {/* Ellipsis if current page is far from end */}
                {currentPage < totalPages - 2 && <span className="text-muted-foreground px-1">...</span>}

                {/* Always show last page */}
                <button
                    onClick={() => handlePageChange(totalPages)}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${currentPage === totalPages
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                        }`}
                >
                    {totalPages}
                </button>
            </div>

            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
                Sonraki
            </button>
        </div>
    );
}
