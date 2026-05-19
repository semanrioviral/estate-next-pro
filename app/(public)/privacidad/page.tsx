import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/supabase/constants';

export const metadata: Metadata = {
    title: 'Política de Privacidad',
    description: 'Política de privacidad y tratamiento de datos personales de Inmobiliaria Tucasa Los Patios.',
    robots: { index: false, follow: true },
    alternates: {
        canonical: `${SITE_URL}/privacidad`,
    },
};

export default function PrivacidadPage() {
    return (
        <div className="mx-auto max-w-7xl px-6 py-24">
            <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>
            <p>Sus datos están protegidos bajo la ley de tratamiento de datos personales vigente en Colombia.</p>
        </div>
    );
}
