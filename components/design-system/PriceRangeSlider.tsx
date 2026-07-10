'use client';

import { useState, useEffect, useRef } from 'react';

interface PriceRangeSliderProps {
    min?: number;
    max?: number;
    valueMin: number;
    valueMax: number;
    onChange: (min: number, max: number) => void;
    step?: number;
}

export default function PriceRangeSlider({
    min = 0,
    max = 2000000000,
    valueMin,
    valueMax,
    onChange,
    step = 10000000,
}: PriceRangeSliderProps) {
    const [localMin, setLocalMin] = useState(valueMin || min);
    const [localMax, setLocalMax] = useState(valueMax || max);
    const rangeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalMin(valueMin || min);
    }, [valueMin, min]);

    useEffect(() => {
        setLocalMax(valueMax || max);
    }, [valueMax, max]);

    const minPercent = ((localMin - min) / (max - min)) * 100;
    const maxPercent = ((localMax - min) / (max - min)) * 100;

    const formatCurrency = (value: number): string => {
        if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
        if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
        return `$${value.toLocaleString('es-CO')}`;
    };

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = Math.min(Number(e.target.value), localMax - step);
        setLocalMin(newMin);
        onChange(newMin, localMax);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Math.max(Number(e.target.value), localMin + step);
        setLocalMax(newMax);
        onChange(localMin, newMax);
    };

    return (
        <div className="w-full select-none">
            {/* Display values */}
            <div className="flex items-center justify-between mb-3 text-sm">
                <div>
                    <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Mínimo</span>
                    <span className="text-slate-900 font-black text-base">{formatCurrency(localMin)}</span>
                </div>
                <div className="text-right">
                    <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">Máximo</span>
                    <span className="text-slate-900 font-black text-base">{localMax === max ? `${formatCurrency(localMax)}+` : formatCurrency(localMax)}</span>
                </div>
            </div>

            {/* Slider Track */}
            <div className="relative h-2 bg-slate-200 rounded-full" ref={rangeRef}>
                {/* Active range */}
                <div
                    className="absolute h-2 bg-brand-600 rounded-full"
                    style={{
                        left: `${minPercent}%`,
                        right: `${100 - maxPercent}%`,
                    }}
                />
                {/* Min handle */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localMin}
                    onChange={handleMinChange}
                    aria-label="Precio mínimo"
                    className="absolute inset-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-600 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab"
                />
                {/* Max handle */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localMax}
                    onChange={handleMaxChange}
                    aria-label="Precio máximo"
                    className="absolute inset-0 w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-600 [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab"
                />
            </div>

            {/* Scale labels */}
            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase">
                <span>{formatCurrency(min)}</span>
                <span>{formatCurrency(max)}+</span>
            </div>
        </div>
    );
}
