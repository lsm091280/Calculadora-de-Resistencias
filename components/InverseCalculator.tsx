import React, { useState, useCallback } from 'react';
import { COLORS, BAND_OPTIONS } from '../constants';
import { BandColor } from '../types';

interface InverseCalculatorProps {
    onCalculationComplete: (colors: BandColor[], bandCount: 4 | 5, error?: string) => void;
}

const valueToColors = (value: number, tolerance: number, bandCount: 4 | 5): { colors?: BandColor[], error?: string } => {
    if (value <= 0) {
        return { error: "El valor debe ser mayor que cero." };
    }

    const findColorBy = (prop: 'value' | 'multiplier' | 'tolerance', val: number | null): BandColor | undefined => {
        const entry = Object.entries(COLORS).find(([, colorData]) => {
            if (colorData[prop] === null || val === null) return false;
            // Use epsilon for floating point comparison for multipliers
            if (prop === 'multiplier') {
                return Math.abs(colorData[prop]! - val) < 1e-9;
            }
            return colorData[prop] === val;
        });
        return entry ? entry[0] as BandColor : undefined;
    };

    const toleranceColor = findColorBy('tolerance', tolerance);
    if (!toleranceColor) {
        return { error: `Tolerancia de ${tolerance}% no es estándar.` };
    }

    const numSignificantDigits = bandCount === 4 ? 2 : 3;

    // Iterate through all possible standard multipliers to find a match
    for (const multColorName of BAND_OPTIONS.multiplier) {
        const multiplier = COLORS[multColorName as BandColor].multiplier;
        if (multiplier === null || multiplier === 0) continue;

        // Calculate the significant digits part based on the current multiplier
        const significantDigitsValue = value / multiplier;
        
        // Check if it's a whole number with a very small tolerance for float issues
        if (Math.abs(significantDigitsValue - Math.round(significantDigitsValue)) > 1e-9) {
            continue;
        }

        const roundedDigitsValue = Math.round(significantDigitsValue);
        const digitsString = roundedDigitsValue.toString();
        
        if (digitsString.length === numSignificantDigits) {
            const digitColors = digitsString.split('').map(digitChar => {
                return findColorBy('value', parseInt(digitChar, 10));
            });
            
            // Check if all digits correspond to a valid color and first digit is not black
            if (digitColors.every(c => c !== undefined) && digitColors[0] !== 'Black') {
                const finalColors = [...digitColors as BandColor[], multColorName as BandColor, toleranceColor];
                return { colors: finalColors };
            }
        }
    }
    
    // If no match was found after checking all multipliers
    return { error: "Valor no representable con bandas estándar." };
};


const InverseCalculator: React.FC<InverseCalculatorProps> = ({ onCalculationComplete }) => {
    const [inputValue, setInputValue] = useState('10');
    const [unit, setUnit] = useState<'Ω' | 'kΩ' | 'MΩ'>('kΩ');
    const [tolerance, setTolerance] = useState<number>(1);
    const [bandCount, setBandCount] = useState<4 | 5>(5);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const numericValue = parseFloat(inputValue);
        if (isNaN(numericValue) || numericValue <= 0) {
            onCalculationComplete([], bandCount, "El valor debe ser un número positivo.");
            return;
        }

        let totalOhms = numericValue;
        if (unit === 'kΩ') totalOhms *= 1000;
        if (unit === 'MΩ') totalOhms *= 1000000;

        const result = valueToColors(totalOhms, tolerance, bandCount);
        if (result.error) {
            onCalculationComplete([], bandCount, result.error);
        } else if (result.colors) {
            onCalculationComplete(result.colors, bandCount);
        }

    }, [inputValue, unit, tolerance, bandCount, onCalculationComplete]);

    const selectClasses = "bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5";
    const buttonClasses = "font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                    <label htmlFor="resistor-value" className="block mb-2 text-sm font-medium text-gray-300">Valor de la Resistencia</label>
                    <div className="flex">
                        <input
                            type="number"
                            id="resistor-value"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            step="any"
                            min="0"
                            className="rounded-none rounded-l-lg bg-gray-700 border border-gray-600 text-white text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="Ej: 4.7"
                            required
                        />
                        <select
                            id="unit"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value as any)}
                            className={`${selectClasses} rounded-none rounded-r-lg border-l-0`}
                        >
                            <option value="Ω">Ω</option>
                            <option value="kΩ">kΩ</option>
                            <option value="MΩ">MΩ</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="band-count-inverse" className="block mb-2 text-sm font-medium text-gray-300">Número de Bandas</label>
                    <select
                        id="band-count-inverse"
                        value={bandCount}
                        onChange={(e) => setBandCount(parseInt(e.target.value) as 4 | 5)}
                        className={selectClasses}
                    >
                        <option value={4}>4 Bandas</option>
                        <option value={5}>5 Bandas</option>
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="tolerance" className="block mb-2 text-sm font-medium text-gray-300">Tolerancia</label>
                <select
                    id="tolerance"
                    value={tolerance}
                    onChange={(e) => setTolerance(parseFloat(e.target.value))}
                    className={selectClasses}
                >
                    {BAND_OPTIONS.tolerance.map(colorName => {
                        const colorData = COLORS[colorName as BandColor];
                        if (colorData.tolerance === null) return null;
                        return <option key={colorName} value={colorData.tolerance}>±{colorData.tolerance}% ({colorName})</option>
                    })}
                </select>
            </div>
            <div className="text-center">
                <button type="submit" className={`${buttonClasses} text-lg w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-purple-500/30`}>
                    Calcular Colores
                </button>
            </div>
        </form>
    );
};

export default InverseCalculator;