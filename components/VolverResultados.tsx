'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface VolverResultadosProps {
    /**
     * For mobile: fallback href when no catalog context exists.
     * Typically `/${property.operacion}`.
     */
    mobileFallbackHref?: string;
    /**
     * For mobile: fallback label when no catalog context exists.
     * Typically `← Volver a Venta` or `← Volver a Arriendo`.
     */
    mobileFallbackLabel?: string;
}

/**
 * VolverResultados
 * 
 * Context-aware "← Volver a resultados" link for the Property Detail Page.
 * 
 * Behavior:
 * - When catalog context exists in sessionStorage → Shows "← Volver a resultados"
 *   linking to the exact catalog page with all filters, page, and sort preserved.
 * - When no context exists and mobileFallbackProps are provided → Shows the fallback
 *   generic link (e.g., "← Volver a Venta").
 * - When no context exists and NO mobileFallbackProps (desktop) → Returns null.
 * 
 * Usage:
 *   Mobile:  <VolverResultados mobileFallbackHref="/venta" mobileFallbackLabel="← Volver a Venta" />
 *   Desktop: <VolverResultados />
 */
export default function VolverResultados({
    mobileFallbackHref,
    mobileFallbackLabel,
}: VolverResultadosProps) {
    const [contextUrl, setContextUrl] = useState<string | null>(null);

    useEffect(() => {
        try {
            const saved = sessionStorage.getItem('catalog_context');
            if (saved) {
                const ctx = JSON.parse(saved);
                const url = ctx.pathname + (ctx.searchParams ? '?' + ctx.searchParams : '');
                setContextUrl(url);
            }
        } catch {
            // sessionStorage unavailable — silently degrade
        }
    }, []);

    // ── Desktop: only render when context exists ────────────────────
    if (!mobileFallbackHref && !contextUrl) return null;

    // ── Mobile: show contextual or fallback ──────────────────────────
    const href = contextUrl || mobileFallbackHref || '/';
    const label = contextUrl
        ? 'Volver a resultados'
        : (mobileFallbackLabel || 'Volver');

    return (
        <Link
            href={href}
            className="inline-flex items-center gap-2 text-[14px] font-bold text-slate-700
                       bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5
                       shadow-xs border border-slate-200/60
                       hover:text-brand hover:border-brand/30 hover:shadow-sm
                       transition-all duration-200"
        >
            <ArrowLeft className="w-5 h-5 shrink-0" />
            {label}
        </Link>
    );
}
