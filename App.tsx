import React, { useState, useEffect, useCallback } from 'react';
import Resistor from './components/Resistor';
import ColorSelector from './components/ColorSelector';
import CameraInput from './components/CameraInput';
import InverseCalculator from './components/InverseCalculator';
import LearnMore from './components/LearnMore';
import { COLORS } from './constants';
import { BandColor } from './types';

const defaultColors: Record<4 | 5 | 6, BandColor[]> = {
    4: ['Brown', 'Black', 'Orange', 'Gold'], // 10 kΩ ±5%
    5: ['Brown', 'Black', 'Black', 'Red', 'Brown'], // 10 kΩ ±1%
    6: ['Brown', 'Black', 'Black', 'Red', 'Brown', 'Red'], // 10 kΩ ±1%, 50 ppm/K
};

// Main App Component
const App: React.FC = () => {
    const [mode, setMode] = useState<'manual' | 'camera' | 'inverse'>('manual');
    const [bandCount, setBandCount] = useState<4 | 5 | 6>(5);
    const [selectedColors, setSelectedColors] = useState<BandColor[]>(defaultColors[5]);
    const [result, setResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [editingBand, setEditingBand] = useState<number | null>(null);
    const [showLearnMore, setShowLearnMore] = useState<boolean>(false);


    useEffect(() => {
        // Only reset to default colors if not in inverse mode, to preserve calculation result
        if (mode !== 'inverse') {
            setSelectedColors(defaultColors[bandCount]);
        }
    }, [bandCount, mode]);

    const handleColorChange = (bandIndex: number, color: BandColor) => {
        const newColors = [...selectedColors];
        newColors[bandIndex] = color;
        setSelectedColors(newColors);
    };

    const handleAnalysisComplete = useCallback((colors: BandColor[]) => {
        const count = colors.length;
        if (count >= 4 && count <= 6) {
            const validCount = count as 4 | 5 | 6;
            setBandCount(validCount);
            setSelectedColors(colors.slice(0, validCount));
        } else {
            setError("La cámara detectó un número inusual de bandas. Se esperaba 4, 5, o 6.");
            setBandCount(5); // Reset to default
            setSelectedColors(defaultColors[5]);
        }
        setMode('manual');
    }, []);

    const handleInverseCalculation = useCallback((colors: BandColor[], calculatedBandCount: 4 | 5, error?: string) => {
        if (error) {
            setError(error);
            setResult('');
        } else {
            setError(null);
            setBandCount(calculatedBandCount);
            setSelectedColors(colors);
        }
    }, []);

    const setExampleResistor = useCallback(() => {
        setBandCount(5);
        setSelectedColors(defaultColors[5]);
        setError(null);
    }, []);
    
    const calculateResistorValue = useCallback(() => {
        if (selectedColors.length !== bandCount) {
            setResult('');
            return;
        }

        const formatValue = (value: number) => {
            if (value >= 1000000) return `${(value / 1000000).toPrecision(3)} MΩ`;
            if (value >= 1000) return `${(value / 1000).toPrecision(3)} kΩ`;
            return `${value.toPrecision(3)} Ω`;
        };

        let baseValue = 0;
        let tolerance: number | null = null;
        let tcr: number | null = null;

        const firstDigit = COLORS[selectedColors[0]]?.value;
        if (firstDigit === 0 && bandCount < 6) { // 6-band resistors can start with black
            setResult('Primera banda no puede ser negra.'); return;
        }

        try {
            if (bandCount === 4) {
                const [c1, c2, c3, c4] = selectedColors.map(c => COLORS[c]);
                if ([c1,c2,c3,c4].some(c => c === undefined)) throw new Error();
                baseValue = (c1.value! * 10 + c2.value!) * c3.multiplier!;
                tolerance = c4.tolerance;
            } else if (bandCount === 5) {
                const [c1, c2, c3, c4, c5] = selectedColors.map(c => COLORS[c]);
                 if ([c1,c2,c3,c4,c5].some(c => c === undefined)) throw new Error();
                baseValue = (c1.value! * 100 + c2.value! * 10 + c3.value!) * c4.multiplier!;
                tolerance = c5.tolerance;
            } else if (bandCount === 6) {
                const [c1, c2, c3, c4, c5, c6] = selectedColors.map(c => COLORS[c]);
                 if ([c1,c2,c3,c4,c5, c6].some(c => c === undefined)) throw new Error();
                baseValue = (c1.value! * 100 + c2.value! * 10 + c3.value!) * c4.multiplier!;
                tolerance = c5.tolerance;
                tcr = c6.tcr;
            }

            if (tolerance === null) throw new Error();

            let resultString = `${formatValue(baseValue)} ±${tolerance}%`;
            if (tcr !== null) {
                resultString += ` (${tcr} ppm/K)`;
            }
            setResult(resultString);
            if (!error) setError(null); // Do not clear inverse calculation errors

        } catch (e) {
            setResult('Selección de color inválida.');
        }
    }, [selectedColors, bandCount, error]);
    
    useEffect(() => {
        calculateResistorValue();
    }, [selectedColors, calculateResistorValue]);

    return (
        <div className="min-h-screen text-gray-200 p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 [text-shadow:0_0_10px_rgba(192,132,252,0.2)]">
                        Calculadora de Resistencias
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Calcula el valor, los colores o analiza una resistencia con tu cámara.
                    </p>
                </header>

                <main className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/10">
                    <div className="flex justify-center mb-6 p-1 bg-gray-900/50 rounded-xl">
                        {(['manual', 'cámara', 'inversa'] as const).map(m => {
                             const modeName = m === 'cámara' ? 'camera' : m === 'inversa' ? 'inverse' : 'manual';
                             return (
                                <button 
                                    key={modeName}
                                    onClick={() => { setMode(modeName); setError(null); }} 
                                    className={`capitalize w-full px-4 py-2 text-lg font-medium transition-colors duration-300 rounded-lg ${mode === modeName ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-400 hover:bg-white/5'}`}>
                                    {m}
                                </button>
                             )
                        })}
                    </div>

                    <Resistor colors={selectedColors} onBandClick={mode === 'manual' ? setEditingBand : () => {}} editingBand={mode === 'manual' ? editingBand : null} />

                    <div className="text-center my-6 p-4 bg-black/50 rounded-lg border border-gray-700 shadow-inner">
                        <h2 className="text-lg text-gray-400">Valor de la Resistencia</h2>
                        <div className="text-2xl md:text-3xl font-mono font-bold text-green-300 tracking-wider h-10 flex items-center justify-center"
                             style={{textShadow: '0 0 8px rgba(110, 231, 183, 0.5)'}}>
                            {isLoading ? 'Analizando...' : (error ? <span className="text-red-400 text-base font-sans" style={{textShadow: 'none'}}>{error}</span> : result)}
                        </div>
                    </div>

                    {mode === 'manual' && (
                        <div>
                             <div className="flex justify-center items-center flex-wrap gap-4 mb-6">
                                <span className="text-sm font-medium text-gray-400">Número de bandas:</span>
                                <div className="inline-flex rounded-lg shadow-sm bg-gray-900/50 p-1" role="group">
                                    {[4, 5, 6].map(count => (
                                        <button
                                            key={count}
                                            type="button"
                                            onClick={() => setBandCount(count as 4 | 5 | 6)}
                                            className={`py-2 px-4 text-sm font-medium transition-colors duration-200 rounded-md ${bandCount === count ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-white/5'}`}
                                        >
                                            {count} Bandas
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="text-center my-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                                <p className="text-gray-300">
                                    Haz clic en una banda del resistor para cambiar su color.
                                </p>
                            </div>
                            <div className="text-center mt-6">
                                <button
                                    onClick={setExampleResistor}
                                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/20"
                                    aria-label="Cargar ejemplo de resistencia de 10kΩ con 1% de tolerancia"
                                >
                                    Cargar Ejemplo (10kΩ ±1%)
                                </button>
                            </div>
                        </div>
                    )}
                    {mode === 'camera' && (
                        <CameraInput 
                            onAnalysisComplete={handleAnalysisComplete}
                            setLoading={setIsLoading}
                            setError={setError}
                        />
                    )}
                    {mode === 'inverse' && (
                        <InverseCalculator onCalculationComplete={handleInverseCalculation} />
                    )}
                </main>
                 <footer className="text-center mt-8 text-gray-500 text-sm">
                    <p>Creado con React, Tailwind CSS y la API de Gemini.</p>
                    <button 
                        onClick={() => setShowLearnMore(true)}
                        className="mt-2 text-blue-400 hover:text-blue-300 underline transition-colors"
                    >
                        Aprende a leer los códigos de color
                    </button>
                    <p className="mt-4">
                      <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline transition-colors">
                        Calculadora de Resistencias
                      </a>
                      {' © 2025 by '}
                      <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline transition-colors">
                        Luis Solá Mantilla
                      </a>
                      {' is licensed under '}
                      <a 
                        href="https://creativecommons.org/licenses/by-nc-sa/4.0/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-400 hover:text-blue-300 underline transition-colors inline-flex items-center"
                      >
                        CC BY-NC-SA 4.0
                        <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="Creative Commons" style={{maxHeight: '1em', maxWidth: '1em', marginLeft: '0.2em'}}/>
                        <img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="Attribution" style={{maxHeight: '1em', maxWidth: '1em', marginLeft: '0.2em'}}/>
                        <img src="https://mirrors.creativecommons.org/presskit/icons/nc.svg" alt="Non-Commercial" style={{maxHeight: '1em', maxWidth: '1em', marginLeft: '0.2em'}}/>
                        <img src="https://mirrors.creativecommons.org/presskit/icons/sa.svg" alt="Share Alike" style={{maxHeight: '1em', maxWidth: '1em', marginLeft: '0.2em'}}/>
                      </a>
                    </p>
                </footer>
            </div>
            {mode === 'manual' && editingBand !== null && (
                <ColorSelector
                    bandIndex={editingBand}
                    bandCount={bandCount}
                    onColorSelect={(color) => {
                        handleColorChange(editingBand, color);
                        setEditingBand(null);
                    }}
                    onClose={() => setEditingBand(null)}
                />
            )}
            {showLearnMore && (
                <LearnMore onClose={() => setShowLearnMore(false)} />
            )}
        </div>
    );
};

export default App;