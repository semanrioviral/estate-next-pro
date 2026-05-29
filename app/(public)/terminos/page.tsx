import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/supabase/constants';

export const metadata: Metadata = {
    title: 'Términos y Condiciones',
    description: 'Términos y condiciones de uso del sitio web de Inmobiliaria Tucasa Los Patios.',
    robots: { index: false, follow: true },
    alternates: {
        canonical: `${SITE_URL}/terminos`,
    },
    openGraph: {
        title: 'Términos y Condiciones | Inmobiliaria Tucasa Los Patios',
        description: 'Términos y condiciones de uso del sitio web de Inmobiliaria Tucasa Los Patios.',
        url: `${SITE_URL}/terminos`,
        siteName: 'Inmobiliaria Tucasa Los Patios',
        locale: 'es_CO',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Términos y Condiciones | Inmobiliaria Tucasa Los Patios',
        description: 'Términos y condiciones de uso del sitio web de Inmobiliaria Tucasa Los Patios.',
    },
};

export default function TerminosPage() {
    return (
        <div className="mx-auto max-w-7xl px-6 py-24">
            <h1 className="text-3xl font-bold mb-6">Términos y Condiciones</h1>
            <p>Al usar este sitio, usted acepta los términos y condiciones de Inmobiliaria Tucasa Los Patios.</p>
        </div>
    );
}
