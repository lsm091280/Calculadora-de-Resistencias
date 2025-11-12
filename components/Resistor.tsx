import React from 'react';
import { COLORS } from '../constants';
import { BandColor } from '../types';

interface ResistorProps {
  colors: BandColor[];
  onBandClick: (bandIndex: number) => void;
  editingBand: number | null;
}

const Resistor: React.FC<ResistorProps> = ({ colors, onBandClick, editingBand }) => {
  const getBandColorHex = (colorName: BandColor) => {
    return COLORS[colorName]?.hex || '#FFFFFF';
  };

  const bandCount = colors.length;

  const renderBand = (color: BandColor, index: number, key: string | number) => {
    const isActive = editingBand === index;
    
    let classes = "h-[90%] w-3 rounded-sm transition-all duration-300 ease-in-out transform z-10 focus:outline-none";
    
    if (isActive) {
        // Classes for the band being edited - makes it pop
        classes += " scale-125 ring-4 ring-offset-2 ring-offset-amber-300 ring-sky-400 shadow-lg shadow-sky-400/50";
    } else {
        // Standard hover and focus for inactive bands
        classes += " hover:scale-125 focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-300 focus:ring-blue-400";
    }

    return (
       <button
          type="button"
          onClick={() => onBandClick(index)}
          aria-label={`Change color for band ${index + 1}: ${color}`}
          key={key}
          className={classes}
          style={{ backgroundColor: getBandColorHex(color) }}
      ></button>
    );
  };

  const valueBandsCount = bandCount === 4 ? 2 : 3;
  const multiplierIndex = bandCount === 4 ? 2 : 3;
  const toleranceBandIndex = bandCount - (bandCount === 6 ? 2 : 1);
  const tcrBandIndex = bandCount === 6 ? 5 : -1;
  const fourBandToleranceIndex = bandCount === 4 ? 3 : -1;


  return (
    <div className="flex items-center justify-center my-8 h-24">
      <div className="h-1 bg-gradient-to-r from-gray-500 to-gray-400 w-1/4 rounded-l-full"></div>
      {/* Enhanced resistor body for a more realistic 3D look */}
      <div className="relative flex items-center justify-center bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 h-16 w-1/2 rounded-full border border-amber-500/30 shadow-xl shadow-black/40">
        <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_6px_rgba(255,255,255,0.6),inset_0_-4px_6px_rgba(0,0,0,0.2)]"></div>
        <div className="absolute flex items-center justify-between w-full h-full px-4 sm:px-6">
          {/* Value and Multiplier Bands */}
          <div className="flex h-full items-center space-x-2">
            {colors.slice(0, valueBandsCount).map((color, index) => renderBand(color, index, `val-${index}`))}
            {renderBand(colors[multiplierIndex], multiplierIndex, 'multiplier')}
          </div>

          {/* Tolerance and TCR Bands */}
          <div className="flex h-full items-center space-x-4">
             {bandCount > 4 && renderBand(colors[toleranceBandIndex], toleranceBandIndex, 'tolerance')}
             {bandCount === 6 && renderBand(colors[tcrBandIndex], tcrBandIndex, 'tcr')}
             {/* For 4 bands, tolerance is the last one */}
             {bandCount === 4 && renderBand(colors[fourBandToleranceIndex], fourBandToleranceIndex, 'tolerance-4')}
          </div>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-l from-gray-500 to-gray-400 w-1/4 rounded-r-full"></div>
    </div>
  );
};

export default Resistor;
