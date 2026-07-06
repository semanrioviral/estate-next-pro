'use client';

export default function PropiedadesError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Error al cargar el catálogo
            </h2>
            <p className="text-slate-500 mb-6 max-w-md">
                Ocurrió un problema al cargar las propiedades. Por favor, intenta de nuevo.
            </p>
            <button
                onClick={() => reset()}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
            >
                Intentar de nuevo
            </button>
        </div>
    );
}
