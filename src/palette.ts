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
