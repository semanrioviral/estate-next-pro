'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
    q: string;
    a: string;
}

interface FAQAccordionProps {
    items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="border border-zinc-100 rounded-[2rem] overflow-hidden bg-white hover:border-[#fb2c36]/30 transition-all duration-300 shadow-sm"
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full px-8 py-7 flex justify-between items-center text-left hover:bg-zinc-50 transition-colors group"
                    >
                        <span className="text-lg font-black text-zinc-900 pr-8 leading-tight">
                            {item.q}
                        </span>
                        <ChevronDown
                            className={`w-6 h-6 text-[#fb2c36] transition-transform duration-500 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''
                                }`}
                        />
                    </button>
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className="px-8 pb-8 text-zinc-600 font-medium leading-relaxed">
                            {item.a}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
