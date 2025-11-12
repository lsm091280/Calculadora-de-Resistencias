import React from 'react';
import { BAND_OPTIONS, COLORS } from '../constants';
import { BandColor } from '../types';

// This configuration logic remains useful to determine which colors are valid for a given band.
const getBandConfiguration = (bandCount: 4 | 5 | 6) => {
  const baseConfig = [
    { label: '1ª Banda (Dígito)', key: 'digit1' },
    { label: '2ª Banda (Dígito)', key: 'digit' },
  ];

  if (bandCount === 4) {
    return [
      ...baseConfig,
      { label: 'Multiplicador', key: 'multiplier' },
      { label: 'Tolerancia', key: 'tolerance' },
    ];
  }

  const fiveBandConfig = [
    ...baseConfig,
    { label: '3ª Banda (Dígito)', key: 'digit' },
    { label: 'Multiplicador', key: 'multiplier' },
    { label: 'Tolerancia', key: 'tolerance' },
  ];

  if (bandCount === 6) {
    return [...fiveBandConfig, { label: 'TCR (ppm/K)', key: 'tcr' }];
  }
  
  return fiveBandConfig;
};


interface ColorPaletteProps {
  bandIndex: number;
  bandCount: 4 | 5 | 6;
  onColorSelect: (color: BandColor) => void;
  onClose: () => void;
}

const ColorSelector: React.FC<ColorPaletteProps> = ({ bandIndex, bandCount, onColorSelect, onClose }) => {
    const configuration = getBandConfiguration(bandCount);
    const bandConfig = configuration[bandIndex];
    const availableColors = BAND_OPTIONS[bandConfig.key as keyof typeof BAND_OPTIONS] as BandColor[];

    const getTooltipText = (color: BandColor, bandKey: string): string => {
        const colorData = COLORS[color];
        let details = `${color}`;

        const formatMultiplier = (multiplier: number | null) => {
            if (multiplier === null) return '';
            if (multiplier >= 1_000_000_000) return `x${multiplier / 1_000_000_000}G`;
            if (multiplier >= 1_000_000) return `x${multiplier / 1_000_000}M`;
            if (multiplier >= 1_000) return `x${multiplier / 1_000}k`;
            return `x${multiplier}`;
        };

        switch (bandKey) {
            case 'digit1':
            case 'digit':
                if (colorData.value !== null) {
                    details += `: ${colorData.value}`;
                }
                break;
            case 'multiplier':
                if (colorData.multiplier !== null) {
                    details += `: ${formatMultiplier(colorData.multiplier)}`;
                }
                break;
            case 'tolerance':
                if (colorData.tolerance !== null) {
                    details += `: ±${colorData.tolerance}%`;
                }
                break;
            case 'tcr':
                if (colorData.tcr !== null) {
                    details += `: ${colorData.tcr} ppm/K`;
                }
                break;
        }
        return details;
    };


    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn backdrop-blur-sm"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold text-white mb-4">Selecciona color: <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">{bandConfig.label}</span></h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {availableColors.map((color) => (
                        <button
                            key={color}
                            onClick={() => onColorSelect(color)}
                            className="flex flex-col items-center justify-center space-y-2 p-2 rounded-lg transition-all transform hover:scale-110 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label={`Seleccionar color ${color}`}
                            title={getTooltipText(color, bandConfig.key)}
                        >
                            <div 
                                className="w-10 h-10 rounded-full border-2 border-white/20"
                                style={{ backgroundColor: COLORS[color].hex }}
                            ></div>
                            <span className="text-xs text-gray-300">{color}</span>
                        </button>
                    ))}
                </div>
            </div>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
            `}</style>
        </div>
    );
};

export default ColorSelector;