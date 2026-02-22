'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback } from 'react';

interface PaginationProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
}

export default function Pagination({ totalItems, itemsPerPage, currentPage }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const createPageUrl = useCallback(
        (pageNumber: number) => {
            const params = new URLSearchParams(searchParams.toString());
            if (pageNumber === 1) {
                params.delete('page');
            } else {
                params.set('page', pageNumber.toString());
            }
            return `${pathname}?${params.toString()}`;
        },
        [searchParams, pathname]
    );

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) return;
        router.push(createPageUrl(pageNumber), { scroll: true });
    };

    if (totalItems <= itemsPerPage) return null;

    // Lógica para mostrar las páginas (ej: 1, 2, 3 ... 10)
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Siempre mostrar la primera página
            pages.push(1);

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 2) {
                end = 4;
            } else if (currentPage >= totalPages - 1) {
                start = totalPages - 3;
            }

            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            if (end < totalPages - 1) pages.push('...');

            // Siempre mostrar la última página
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16 border-t border-slate-100 pt-12">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-xl border transition-all ${currentPage === 1
                        ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600 shadow-sm hover:shadow-md'
                        }`}
                    aria-label="Anterior"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1.5">
                    {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                            <span key={`dots-${index}`} className="px-3 py-1 text-slate-400 font-medium">
                                ...
                            </span>
                        ) : (
                            <button
                                key={`page-${page}`}
                                onClick={() => handlePageChange(Number(page))}
                                className={`min-w-[40px] h-10 px-3 rounded-xl border font-bold text-sm transition-all ${currentPage === Number(page)
                                    ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-100 translate-y-[-2px]'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600'
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-xl border transition-all ${currentPage === totalPages
                        ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600 shadow-sm hover:shadow-md'
                        }`}
                    aria-label="Siguiente"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Página <span className="text-slate-600">{currentPage}</span> de <span className="text-slate-600">{totalPages}</span>
            </div>
        </div>
    );
}
