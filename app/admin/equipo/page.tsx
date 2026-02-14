export const dynamic = 'force-dynamic';

export default function AdminEquipo() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Equipo de Agentes</h1>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    + Invitar Agente
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400">
                        <span className="text-2xl font-bold">?</span>
                    </div>
                    <h3 className="text-lg font-bold">Lista de Equipo</h3>
                    <p className="text-gray-500 text-sm mt-2">Los agentes se mostrarán aquí una vez configurados en Supabase.</p>
                </div>
            </div>
        </div>
    )
}
