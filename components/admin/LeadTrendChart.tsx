'use client';

import { useState } from 'react';
import { TrendingUp, Calendar, CalendarDays } from 'lucide-react';

interface TrendDataPoint {
    label: string;
    count: number;
}

interface Props {
    weekly: TrendDataPoint[];
    monthly: TrendDataPoint[];
    total: number;
}

export default function LeadTrendChart({ weekly, monthly, total }: Props) {
    const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

    const data = period === 'weekly' ? weekly : monthly;
    const maxCount = Math.max(...data.map(d => d.count), 1);

    if (data.length === 0 || data.every(d => d.count === 0)) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-red-500" />
                    <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                        Tendencia de leads
                    </h2>
                </div>
                <div className="flex items-center justify-center h-32 text-sm text-zinc-400 font-medium">
                    Sin datos suficientes aún
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 p-5">
            <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-red-500" />
                <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50">
                    Tendencia de leads
                </h2>

                {/* Toggle weekly / monthly */}
                <div className="ml-auto flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 gap-0.5">
                    <button
                        onClick={() => setPeriod('weekly')}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                            period === 'weekly'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                    >
                        <CalendarDays size={11} />
                        Semanal
                    </button>
                    <button
                        onClick={() => setPeriod('monthly')}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                            period === 'monthly'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                    >
                        <Calendar size={11} />
                        Mensual
                    </button>
                </div>
            </div>

            <p className="text-[11px] text-zinc-400 font-medium mb-4">
                {total} leads &middot; {period === 'weekly' ? 'Últimas 12 semanas' : 'Últimos 12 meses'}
            </p>

            {/* Bar chart */}
            <div className="flex items-end gap-1.5 h-36">
                {data.map((item) => {
                    const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    return (
                        <div key={item.label} className="flex-1 flex flex-col items-center gap-1.5 group">
                            <span className="text-[10px] font-bold text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.count}
                            </span>
                            <div className="w-full flex-1 flex items-end">
                                <div
                                    className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t-md transition-all duration-200 hover:from-red-600 hover:to-red-500 min-h-[3px]"
                                    style={{ height: `${Math.max(pct, 2)}%` }}
                                    title={`${item.label}: ${item.count} leads`}
                                />
                            </div>
                            <span className="text-[8px] text-zinc-400 font-medium truncate w-full text-center leading-tight">
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Mini summary */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                    <span className="text-lg font-black text-zinc-900 dark:text-zinc-50">
                        {data.reduce((s, d) => s + d.count, 0)}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 ml-1">total período</span>
                </div>
                {data.length >= 2 && (() => {
                    const half = Math.floor(data.length / 2);
                    const firstHalf = data.slice(0, half).reduce((s, d) => s + d.count, 0);
                    const secondHalf = data.slice(half).reduce((s, d) => s + d.count, 0);
                    const trend = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;
                    return (
                        <div>
                            <span className={`text-lg font-black ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {trend >= 0 ? '+' : ''}{Math.round(trend)}%
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400 ml-1">
                                {period === 'weekly' ? 'últimas semanas vs anteriores' : 'últimos meses vs anteriores'}
                            </span>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
