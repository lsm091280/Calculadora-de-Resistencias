import { ColorCode, BandColor } from './types';

export const COLORS: Record<BandColor, ColorCode> = {
  Black: { name: 'Black', hex: '#000000', value: 0, multiplier: 1, tolerance: null, tcr: null },
  Brown: { name: 'Brown', hex: '#A52A2A', value: 1, multiplier: 10, tolerance: 1, tcr: 100 },
  Red: { name: 'Red', hex: '#FF0000', value: 2, multiplier: 100, tolerance: 2, tcr: 50 },
  Orange: { name: 'Orange', hex: '#FFA500', value: 3, multiplier: 1000, tolerance: null, tcr: 15 },
  Yellow: { name: 'Yellow', hex: '#FFFF00', value: 4, multiplier: 10000, tolerance: null, tcr: 25 },
  Green: { name: 'Green', hex: '#008000', value: 5, multiplier: 100000, tolerance: 0.5, tcr: 20 },
  Blue: { name: 'Blue', hex: '#0000FF', value: 6, multiplier: 1000000, tolerance: 0.25, tcr: 10 },
  Violet: { name: 'Violet', hex: '#EE82EE', value: 7, multiplier: 10000000, tolerance: 0.1, tcr: 5 },
  Grey: { name: 'Grey', hex: '#808080', value: 8, multiplier: 100000000, tolerance: 0.05, tcr: 1 },
  White: { name: 'White', hex: '#FFFFFF', value: 9, multiplier: 1000000000, tolerance: null, tcr: null },
  Gold: { name: 'Gold', hex: '#FFD700', value: null, multiplier: 0.1, tolerance: 5, tcr: null },
  Silver: { name: 'Silver', hex: '#C0C0C0', value: null, multiplier: 0.01, tolerance: 10, tcr: null },
  None: { name: 'None', hex: '#f0f0f0', value: null, multiplier: null, tolerance: 20, tcr: null },
};

export const BAND_OPTIONS = {
  digit1: ['Brown', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet', 'Grey', 'White'],
  digit: ['Black', 'Brown', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet', 'Grey', 'White'],
  multiplier: ['Black', 'Brown', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet', 'Grey', 'White', 'Gold', 'Silver'],
  tolerance: ['Brown', 'Red', 'Green', 'Blue', 'Violet', 'Grey', 'Gold', 'Silver', 'None'],
  tcr: ['Brown', 'Red', 'Orange', 'Yellow', 'Blue', 'Violet', 'Grey'],
};