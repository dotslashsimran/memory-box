/** SHARED CONTRACT — change only via the lead. */
export type MemoryType = 'photo' | 'note' | 'ticket' | 'flower';

export interface Memory {
  id: string;
  type: MemoryType;
  caption: string;
  /** ISO date string yyyy-mm-dd */
  date: string;
  /** note body (type === 'note') */
  text?: string;
  /** photo: data URL (user upload, already downscaled) OR `seed:<name>` referencing a drawn seed photo */
  photo?: string;
  /** ticket seat label, e.g. "ROW 4 · SEAT 12" */
  seat?: string;
  /** true for built-in samples */
  seed?: boolean;
  createdAt: number;
}
