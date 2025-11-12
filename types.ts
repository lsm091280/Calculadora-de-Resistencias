export interface ColorCode {
  name: string;
  hex: string;
  value: number | null;
  multiplier: number | null;
  tolerance: number | null;
  tcr: number | null;
}

export type BandColor = 'Black' | 'Brown' | 'Red' | 'Orange' | 'Yellow' | 'Green' | 'Blue' | 'Violet' | 'Grey' | 'White' | 'Gold' | 'Silver' | 'None';