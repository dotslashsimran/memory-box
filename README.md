# memory box 🎀
A tiny pixel-art keepsake box. `npm install && npm run dev`.

## Module ownership (CONTRIBUTING)
| Module | Owner |
|---|---|
| `src/main.ts`, `src/style.css`, `src/ui/viewer.ts` (scene, animations, viewer) | lead |
| `src/sprites/*`, `src/palette.ts` (all pixel art) | sprites/art |
| `src/audio.ts`, `src/storage.ts`, `src/ui/form.ts`, `src/ui/settings.ts` | audio+storage+settings |
| `scripts/shots.mjs`, tests | QA |
| `src/types.ts` | shared contract; lead only |

Keep exported signatures stable; stubs return placeholder values.
