'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * CatalogContextTracker
 * 
 * Client component that preserves catalog browsing context in sessionStorage.
 * 
 * What it does:
 * 1. RESTORE: On mount, checks if there's a saved context matching the current URL.
 *    If found, restores scroll position exactly (one-time) and removes the context.
 * 2. SAVE: Uses event delegation (capture phase) to detect clicks on links going
 *    to /propiedades/* from the catalog. Before navigation, saves the full context:
 *    pathname, searchParams (page, filters, sort, etc.), and scrollY.
 * 
 * This enables "Volver a resultados" from PDP to land on the exact same catalog
 * page, with the same filters, at the same scroll position the user left from.
 * 
 * No visible UI — returns null.
 */
export default function CatalogContextTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const restored = useRef(false);

    // Refs to always have the latest values in the click handler closure
    const pathnameRef = useRef(pathname);
    const searchParamsRef = useRef(searchParams);

    // Keep refs in sync with the latest values
    useEffect(() => {
        pathnameRef.current = pathname;
        searchParamsRef.current = searchParams;
    }, [pathname, searchParams]);

    // ── Restore scroll position on mount ─────────────────────────────
    useEffect(() => {
        if (restored.current) return;
        restored.current = true;

        try {
            const saved = sessionStorage.getItem('catalog_context');
            if (!saved) return;

            const ctx = JSON.parse(saved);
            const currentQuery = searchParams.toString();
            const savedQuery = ctx.searchParams || '';

            // Only restore if we're on the exact same URL (pathname + query params)
            // that was saved — this prevents restoring on unrelated navigations
            if (ctx.pathname === pathname && currentQuery === savedQuery) {
                sessionStorage.removeItem('catalog_context');

                // Double rAF ensures the DOM has fully painted with all fetched data
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        window.scrollTo({
                            top: ctx.scrollY,
                            behavior: 'instant' as ScrollBehavior,
                        });
                    });
                });
            }
        } catch {
            // Silently fail — context preservation is progressive enhancement
        }
    }, [pathname, searchParams]);

    // ── Save context when leaving for a property detail ──────────────
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // Walk up the DOM to find the closest <a> element
            let target = e.target as HTMLElement | null;
            while (target && target.tagName !== 'A') {
                target = target.parentElement;
            }
            if (!target) return;

            const href = (target as HTMLAnchorElement).getAttribute('href');

            // Only save context when navigating to a property detail page
            // Matches: /propiedades/any-slug
            if (href && href.startsWith('/propiedades/')) {
                try {
                    sessionStorage.setItem('catalog_context', JSON.stringify({
                        pathname: pathnameRef.current,
                        searchParams: searchParamsRef.current.toString(),
                        scrollY: window.scrollY,
                        timestamp: Date.now(),
                    }));
                } catch {
                    // sessionStorage might be full or unavailable
                }
            }
        };

        // Use capture phase to intercept the click BEFORE Next.js Link processes it
        document.addEventListener('click', handleClick, { capture: true });
        return () => document.removeEventListener('click', handleClick, { capture: true });
    }, []); // Empty deps — refs keep values current without re-creating the listener

    return null;
}
