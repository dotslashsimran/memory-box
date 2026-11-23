/** OWNER: audio+storage+settings. Small settings menu (gear) with "clear sample memories" and sound toggle. */
export interface SettingsHooks { onClearSamples(): void | Promise<void>; }
export function mountSettings(_root: HTMLElement, _hooks: SettingsHooks): void {}
