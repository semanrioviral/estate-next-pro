'use client';

import { useState } from 'react';

interface ExpandableTextProps {
    preview: string;
    rest: string;
}

export default function ExpandableText({ preview, rest }: ExpandableTextProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div>
            <div className="text-zinc-600 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line font-medium">
                {preview}
                {expanded && (
                    <>
                        {"\n"}
                        {rest}
                    </>
                )}
            </div>
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-zinc-700 cursor-pointer hover:bg-slate-50 transition-colors mt-3"
            >
                {expanded ? 'Leer menos' : 'Leer más'}
            </button>
        </div>
    );
}
