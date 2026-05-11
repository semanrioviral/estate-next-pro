import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Términos y Condiciones | Inmobiliaria Tucasa Los Patios',
    description: 'Términos y condiciones de uso del sitio web de Inmobiliaria Tucasa Los Patios.',
    robots: { index: false, follow: true },
    alternates: {
        canonical: 'https://tucasalospatios.com/terminos',
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
