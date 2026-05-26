export default function PropiedadesLoading() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
                <p className="text-sm text-zinc-500 font-medium">Cargando...</p>
            </div>
        </div>
    );
}
