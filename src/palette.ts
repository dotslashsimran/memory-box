/** OWNER: sprites/art. Tight palette — use only these (plus tints derived here). */
export const C = {
  cream: '#FFF4E6',
  milk: '#F7B6C8',   // strawberry milk
  rose: '#D9627F',   // deep rose
  butter: '#FFE29A',
  sage: '#B7D3A8',
  cocoa: '#5A3E36',  // outline, never pure black
} as const;
export type ColorKey = keyof typeof C;

/** Derived tints/shades (mixes of the six core colours only) for shading and dithering. */
export const T = {
  creamShade: '#F3DFC9',
  creamDeep: '#E6C9B0',
  milkLight: '#FBD6E1',
  milkDeep: '#EC9DB4',
  roseDark: '#B5486A',
  butterLight: '#FFF0C6',
  butterDeep: '#F0C76E',
  sageLight: '#D5E6CA',
  sageDeep: '#93B785',
  sky: '#DDEBD6',
  skyDeep: '#C9E0C0',
  cocoaLight: '#8C6A5E',
  wood: '#E7C48E',
  woodDeep: '#D2A674',
  woodDark: '#B98860',
} as const;
