import React, { Suspense } from 'react';
import Link from 'next/link';
import { Home, ChevronRight, Building2, Clock } from 'lucide-react';
import SearchBarV3 from './SearchBarV3';
import SortingControls from './SortingControls';

interface Breadcrumb {
    label: string;
    href?: string;
}

interface CatalogHeaderProps {
    title: string | React.ReactNode;
    description?: string | React.ReactNode;
    totalCount: number;
    breadcrumbs: Breadcrumb[];
    badge?: {
        icon: React.ElementType;
        text: string;
    };
}

export default function CatalogHeader({
    title,
    description,
    totalCount,
    breadcrumbs,
    badge
}: CatalogHeaderProps) {
    return (
        <section className="bg-white pt-16 md:pt-24 pb-6 md:pb-12 relative border-b border-border-clean">
            <div className="container-wide px-4">
                {/* Breadcrumbs & Badge */}
                <div className="flex flex-col items-start md:items-center mb-4 md:mb-8">
                    <nav className="flex items-center text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3 md:mb-6">
                        <Link href="/" className="hover:text-brand transition-colors flex items-center gap-1.5">
                            <Home className="w-3 h-3" />
                            Inicio
                        </Link>
                        {breadcrumbs.map((bc, index) => (
                            <React.Fragment key={index}>
                                <ChevronRight className="w-3 h-3 mx-1.5 text-text-muted" />
                                {bc.href ? (
                                    <Link href={bc.href} className="hover:text-brand transition-colors">
                                        {bc.label}
                                    </Link>
                                ) : (
                                    <span className="text-brand">{bc.label}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>

                    {badge && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-bg-alt border border-border-clean rounded-full mb-3 md:mb-6">
                            <badge.icon className="w-3.5 h-3.5 text-brand" />
                            <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">{badge.text}</span>
                        </div>
                    )}
                </div>

                {/* Title & Description */}
                <div className="max-w-4xl mx-auto text-center mb-6 md:mb-12">
                    <h1 className="mb-3 md:mb-4 leading-tight text-slate-900 tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <div className="text-sm md:text-lg text-text-secondary font-medium max-w-2xl mx-auto leading-relaxed">
                            {description}
                        </div>
                    )}
                </div>

                {/* Search Bar Container */}
                <div className="w-full max-w-6xl mx-auto relative z-20 mb-5 md:mb-12">
                    <div className="py-1 md:py-2">
                        <Suspense fallback={<div className="h-16 bg-slate-50 animate-pulse rounded-xl border border-slate-100" />}>
                            <SearchBarV3 variant="compact" />
                        </Suspense>
                    </div>
                </div>

                {/* Results Count & Sorting */}
                <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-3 md:gap-8 pt-4 md:pt-8 border-t border-slate-100">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="flex items-center gap-2 text-slate-900 mb-1">
                            <Building2 className="w-5 h-5 text-brand" />
                            <span className="text-lg md:text-xl font-medium tracking-tight">
                                {totalCount} propiedades disponibles
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Actualizado hoy</span>
                        </div>
                    </div>

                    <div className="w-full md:w-auto">
                        <SortingControls />
                    </div>
                </div>
            </div>
        </section>
    );
}
