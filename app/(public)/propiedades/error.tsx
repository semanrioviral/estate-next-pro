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
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">
                Error al cargar la propiedad
            </h2>
            <p className="text-zinc-500 mb-6 max-w-md">
                Ocurrió un problema al cargar esta página. Por favor, intenta de nuevo.
            </p>
            <button
                onClick={() => reset()}
                className="px-6 py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors"
            >
                Intentar de nuevo
            </button>
        </div>
    );
}
