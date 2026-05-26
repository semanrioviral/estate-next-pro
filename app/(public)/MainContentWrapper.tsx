'use client';

import { usePathname } from 'next/navigation';

/**
 * Wrapper client mínimo que aplica padding condicional según la ruta.
 * Extraído del layout para que el resto del layout sea server component.
 * Único propósito: preservar el comportamiento visual de isHome ? "pt-0" : "pt-24"
 */
export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHome = pathname === '/';

    return (
        <main id="main-content" className={`min-h-screen ${isHome ? 'pt-0' : 'pt-24 md:pt-24'}`}>
            {children}
        </main>
    );
}
