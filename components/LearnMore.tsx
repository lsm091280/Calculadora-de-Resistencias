import React from 'react';
import { COLORS } from '../constants';
import { BandColor } from '../types';

interface LearnMoreProps {
  onClose: () => void;
}

const LearnMore: React.FC<LearnMoreProps> = ({ onClose }) => {
  const orderedColors: BandColor[] = [
    'Black', 'Brown', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet', 'Grey', 'White', 'Gold', 'Silver', 'None'
  ];

  const formatMultiplier = (multiplier: number | null) => {
    if (multiplier === null) return '—';
    if (multiplier >= 1_000_000_000) return `x${multiplier / 1_000_000_000}GΩ`;
    if (multiplier >= 1_000_000) return `x${multiplier / 1_000_000}MΩ`;
    if (multiplier >= 1_000) return `x${multiplier / 1_000}kΩ`;
    return `x${multiplier}Ω`;
  };

  const renderRow = (colorName: BandColor) => {
    const colorData = COLORS[colorName];
    if (!colorData) return null;

    return (
      <tr key={colorName} className="bg-gray-800/50 border-b border-gray-700 hover:bg-gray-700/50">
        <td className="px-4 py-3 font-medium text-gray-100 whitespace-nowrap">
          <div className="flex items-center space-x-3">
            <div
              className="w-5 h-5 rounded-full border border-white/20"
              style={{ backgroundColor: colorData.hex }}
            ></div>
            <span>{colorData.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center">{colorData.value ?? '—'}</td>
        <td className="px-4 py-3 text-center">{formatMultiplier(colorData.multiplier)}</td>
        <td className="px-4 py-3 text-center">{colorData.tolerance !== null ? `±${colorData.tolerance}%` : '—'}</td>
        <td className="px-4 py-3 text-center">{colorData.tcr !== null ? `${colorData.tcr}` : '—'}</td>
      </tr>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white">
            Tabla de Códigos de Color
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="overflow-y-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-900/50 sticky top-0">
              <tr>
                <th scope="col" className="px-4 py-3">Color</th>
                <th scope="col" className="px-4 py-3 text-center">Dígito</th>
                <th scope="col" className="px-4 py-3 text-center">Multiplicador</th>
                <th scope="col" className="px-4 py-3 text-center">Tolerancia</th>
                <th scope="col" className="px-4 py-3 text-center">TCR (ppm/K)</th>
              </tr>
            </thead>
            <tbody>
              {orderedColors.map(color => renderRow(color))}
            </tbody>
          </table>
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

export default LearnMore;
