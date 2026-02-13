export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
                <p className="text-gray-500 mt-2">Bienvenido al panel administrativo de la inmobiliaria.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Propiedades</h3>
                    <p className="text-4xl font-bold mt-2">--</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Solicitudes</h3>
                    <p className="text-4xl font-bold mt-2">--</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Agentes</h3>
                    <p className="text-4xl font-bold mt-2">--</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Actividad Reciente</h2>
                <div className="text-gray-400 text-center py-12">
                    No hay actividad reciente para mostrar.
                </div>
            </div>
        </div>
    )
}
