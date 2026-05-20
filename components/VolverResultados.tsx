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
            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-600 hover:text-brand transition-colors"
        >
            <ArrowLeft className="w-4 h-4" />
            {label}
        </Link>
    );
}
