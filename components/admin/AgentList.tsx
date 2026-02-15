"use client";

import { useEffect, useState } from "react";
import { User, Mail, Calendar, Trash2, Shield, UserCheck, Search, Filter, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import InviteAgentModal from "./InviteAgentModal";

interface Agent {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
    invited_at?: string;
    confirmed_at?: string | null;
    is_pending?: boolean;
    has_profile?: boolean;
}

interface AgentListProps {
    initialAgents: Agent[];
}

import { handleDeleteInvitation, handleSyncProfile } from "@/app/admin/actions";

export default function AgentList({ initialAgents }: AgentListProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [agents, setAgents] = useState(initialAgents);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    // Sincronizar perfiles faltantes (solo para el usuario actual o si un administrador lo ve)
    useEffect(() => {
        const syncMissingProfiles = async () => {
            for (const agent of initialAgents) {
                if (!agent.has_profile && agent.confirmed_at) {
                    console.log('Sincronizando perfil faltante para:', agent.email);
                    await handleSyncProfile(agent.id, agent.email, agent.full_name);
                }
            }
        };
        syncMissingProfiles();
    }, [initialAgents]);

    useEffect(() => {
        setAgents(initialAgents);
    }, [initialAgents]);

    const filteredAgents = agents.filter(agent =>
        agent.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteAction = async (agent: Agent) => {
        if (!agent.is_pending) return;

        if (!confirm(`¿Estás seguro de que deseas eliminar la invitación para ${agent.email}?`)) {
            return;
        }

        setIsProcessing(agent.id);
        try {
            const res = await handleDeleteInvitation(agent.id);
            if (res.error) {
                alert(`Error: ${res.error}`);
            } else {
                setAgents(prev => prev.filter(a => a.id !== agent.id));
            }
        } catch (err) {
            alert("Error al eliminar la invitación.");
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Equipo de Agentes</h1>
                    <p className="text-gray-500 text-sm mt-1">Gestiona los accesos y perfiles de tus colaboradores.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-red-200 font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    <UserCheck size={20} />
                    Invitar Agente
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                        <UsersIcon size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Usuarios</p>
                        <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                        <RefreshCw size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pendientes</p>
                        <p className="text-2xl font-bold text-gray-900">{agents.filter(a => a.is_pending).length}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                {filteredAgents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 text-left border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Agente</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Rol / Estado</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Registrado</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredAgents.map((agent) => (
                                    <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border border-white shadow-sm ${agent.is_pending ? 'bg-amber-100 text-amber-600' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500'
                                                    }`}>
                                                    {agent.full_name?.charAt(0) || <User size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 leading-tight">{agent.full_name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                        <Mail size={10} />
                                                        {agent.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5 items-start">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${agent.role === 'admin'
                                                        ? 'bg-red-50 text-red-700 border-red-100'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    }`}>
                                                    <Shield size={10} />
                                                    {agent.role === 'admin' ? 'Administrador' : 'Agente'}
                                                </span>
                                                {agent.is_pending && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
                                                        <AlertCircle size={10} />
                                                        Invitación Pendiente
                                                    </span>
                                                )}
                                                {!agent.has_profile && agent.confirmed_at && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                                                        <RefreshCw size={10} className="animate-spin-slow" />
                                                        Sincronizando...
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(agent.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {agent.is_pending ? (
                                                <button
                                                    onClick={() => handleDeleteAction(agent)}
                                                    disabled={isProcessing === agent.id}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all title='Eliminar invitación'"
                                                >
                                                    {isProcessing === agent.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 font-medium italic">Activo</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No se encontraron agentes</h3>
                        <p className="text-gray-500 mt-1 max-w-xs mx-auto">Prueba con otro término de búsqueda o invita a un nuevo integrante.</p>
                    </div>
                )}
            </div>

            <InviteAgentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

function UsersIcon({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    )
}
