"use client";

import { useState } from "react";
import { Upload, FileJson, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Info, X } from "lucide-react";
import { handleBulkImport } from "@/app/admin/actions";

export default function BulkImporter() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<{
        inserted: number;
        omitted: number;
        errors: { item: string, error: string }[];
    } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setReport(null);
        }
    };

    const processImport = async () => {
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                let data: any[] = [];

                if (file.name.endsWith('.json')) {
                    data = JSON.parse(content);
                } else if (file.name.endsWith('.csv')) {
                    // Simple CSV parsing (could be improved with a lib)
                    const lines = content.split('\n');
                    const headers = lines[0].split(',').map(h => h.trim());
                    data = lines.slice(1).filter(l => l.trim()).map(line => {
                        const values = line.split(',');
                        const obj: any = {};
                        headers.forEach((h, i) => {
                            obj[h] = values[i]?.trim();
                        });
                        return obj;
                    });
                } else {
                    alert('Formato no soportado. Usa JSON o CSV.');
                    setLoading(false);
                    return;
                }

                const result = await handleBulkImport(data);
                if (result.error) {
                    alert(result.error);
                } else if (result.report) {
                    setReport(result.report);
                }
            } catch (err: any) {
                console.error('Import error:', err);
                alert('Error al procesar el archivo: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 p-10 shadow-xl space-y-8">
            <div className="flex items-center gap-4 text-red-600 border-b border-zinc-50 dark:border-zinc-800/50 pb-6 uppercase font-black tracking-widest text-lg">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                    <Upload size={24} />
                </div>
                <h2>Importación Masiva</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-8 rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center group hover:border-red-500 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept=".json,.csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="mb-4 p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                            {file ? <CheckCircle2 className="text-emerald-500" size={32} /> : <FileJson className="text-zinc-400" size={32} />}
                        </div>
                        <p className="font-black text-sm uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                            {file ? file.name : "Selecciona JSON o CSV"}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-2 font-medium uppercase tracking-widest">
                            Arrastra o haz clic para subir tus datos
                        </p>
                    </div>

                    <button
                        onClick={processImport}
                        disabled={!file || loading}
                        className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-[2rem] transition-all shadow-xl shadow-red-600/20 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Shield size={18} />}
                        {loading ? "Procesando..." : "Iniciar Migración"}
                    </button>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 p-8 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-3 text-zinc-400 font-black uppercase tracking-widest text-[10px]">
                        <Info size={14} />
                        <h3>Reglas de Importación</h3>
                    </div>
                    <ul className="space-y-3 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-loose">
                        <li className="flex gap-3"><span className="text-red-600">•</span> Duplicados omitidos por slug/dirección</li>
                        <li className="flex gap-3"><span className="text-red-600">•</span> Campos requeridos: titulo, precio, descripcion</li>
                        <li className="flex gap-3"><span className="text-red-600">•</span> Formato JSON: Array de objetos</li>
                        <li className="flex gap-3"><span className="text-red-600">•</span> Formato CSV: Primera fila con encabezados</li>
                    </ul>
                </div>
            </div>

            {report && (
                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 text-center">
                            <p className="text-2xl font-black text-emerald-600">{report.inserted}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-500">Insertadas</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-800/50 text-center">
                            <p className="text-2xl font-black text-amber-600">{report.omitted}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 dark:text-amber-500">Omitidas</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-800/50 text-center">
                            <p className="text-2xl font-black text-red-600">{report.errors.length}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-800 dark:text-red-500">Errores</p>
                        </div>
                    </div>

                    {report.errors.length > 0 && (
                        <div className="bg-white dark:bg-zinc-800/50 rounded-3xl border border-red-100 dark:border-red-900/30 overflow-hidden">
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 border-b border-red-100 dark:border-red-900/30">
                                <h4 className="font-black uppercase tracking-widest text-[10px] text-red-800 dark:text-red-400">Detalle de Errores</h4>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {report.errors.map((err, i) => (
                                    <div key={i} className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 flex justify-between items-center gap-4">
                                        <p className="font-black text-[11px] uppercase tracking-widest text-zinc-700 dark:text-zinc-300 truncate">{err.item}</p>
                                        <p className="font-medium text-[10px] text-red-600 dark:text-red-400 text-right">{err.error}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function Shield({ size }: { size: number }) {
    return <CheckCircle2 size={size} />;
}
