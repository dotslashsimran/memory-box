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

## Run
```
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## Adding memories
Click the box to open it, then press the pink **add memory** sticker. Pick a type (photo, note, ticket or flower), add a caption and date (plus a photo, note text, or seat), and press **tuck in ♥**. The memory drops into the box and pops out with the others. Memories (photos included) are kept in your browser's IndexedDB, so they survive a refresh. Photos are downscaled and given a light pixelation/dither look. The gear menu has **clear samples** to remove the 8 starter memories, and the speaker toggles chiptune sounds (off by default).

Keys in the close-up viewer: ←/→ next/previous (or swipe), Esc or click outside to put it back.
