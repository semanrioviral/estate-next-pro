export const dynamic = 'force-dynamic';

export default function AdminSolicitudes() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Asesoría</h1>
                <p className="text-gray-500 mt-2">Gestiona los contactos de potenciales clientes.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Cliente</th>
                            <th className="px-6 py-4 font-medium">Contacto</th>
                            <th className="px-6 py-4 font-medium">Propiedad Interés</th>
                            <th className="px-6 py-4 font-medium">Estado</th>
                            <th className="px-6 py-4 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-8 text-center text-gray-400" colSpan={5}>
                                No hay solicitudes pendientes.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
