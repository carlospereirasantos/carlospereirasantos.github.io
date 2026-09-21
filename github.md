repo: carlospereirasantos/carlospereirasantos.com
branch: main

## Last sync
date: 2026-09-13T00:00:00Z

### Updated in this project
- Repository contained only a README, so the site was built from scratch.
- Content sourced from two uploaded CV PDFs (full CV + biographical sketch).
- Built three pages on the Modernist design system: Home, Publications, Projects.
- Client-side filtering authored in TypeScript (`src/cv.ts`) with a compiled `src/cv.js`.

## Screen map
| Screen | Built from |
| --- | --- |
| index.html | data/cv.json, data/publications.json |
| publications.html | data/publications.json, src/cv.ts |
| projects.html | data/projects.json, src/cv.ts |

## 2026-09-13 — rename + cleanup
- Pages renamed to plain lowercase `.html`; `Home.dc.html` is now `index.html`
  so static hosts serve it as the site root. Internal links updated.
- Added Google Analytics 4 (`G-FTNCFJS3SE`) to the `<helmet>` of every page.
- Removed `Projects-standalone.dc.html` and the single-file bundle it produced,
  along with the three loose root images only that variant referenced
  (`2026_vpgathering-*.jpg`, `vpsn2-1-*.png`, `avenue_logo_rgb-*.png`, ~7 MB).
  The live Projects page sources its images from `.image-slots.state.json`.
- `.gitignore` replaced with a version relevant to a static site.

## 2026-09-20 — data split
- `src/cv-data.json` split into `src/publications.json` (46), `src/projects.json` (14)
  and `src/cv.json`, so each content type is maintained on its own.
- `src/cv.json` also absorbs the profile content that was hardcoded in `index.html`'s
  `renderVals()`: highlights, positions, education, labs and stats.
- `src/cv.ts` / `cv.js` gained `loadPublications()`, `loadProjects()` and `loadCv()`;
  each page now fetches only the file it needs. `loadCvData()` still loads all three
  in parallel and now returns `{ publications, projects, cv }`.

## 2026-09-21 — folder restructure and cleanup
- JSON data moved to `data/`; loader defaults in `src/cv.ts` / `cv.js` updated.
- `uploads/` replaced by `downloads/`, with the PDFs given readable names:
  `carlos-pereira-santos-cv.pdf` (the full CV) and
  `carlos-pereira-santos-biographical-sketch.pdf`.
- Image slots retired: the leftover `<image-slot>` on `index.html` (and a stray
  unmatched `</image-slot>` beside it) removed, `image-slot.js` and the 683 KB
  `.image-slots.state.json` deleted. The portrait renders from
  `images/portrait.webp`, project images from `data/projects.json`.

## 2026-09-21 — TypeScript sources dropped
- `src/cv.ts` and `src/reveal.ts` deleted; `src/*.js` is now the only source.
- Everything that existed only in the `.ts` was carried over first: the type
  definitions became JSDoc (including the data dictionary for the terse
  publication keys), and `reveal.js` regained the comments explaining why it
  polls on rAF rather than using IntersectionObserver, which does not fire in
  embedded preview frames.
- `jsconfig.json` added so the JSDoc is actually type-checked in the editor;
  `"type": "module"` added to package.json. Type check passes clean.

## 2026-09-21 — F5 launch fixed
- `launch.json` could never start the site: the task's `beginsPattern` was
  `^.*$`, which matched the ready line too, so the background task never
  signalled ready and the `preLaunchTask` waited forever.
- Replaced the task + problem-matcher approach with `serverReadyAction` on a
  node launch config — VS Code runs the server, watches its output for the URL
  and opens the browser when it is actually up.
- The old `stop serving` task only echoed text, leaving the server running and
  the next F5 hitting EADDRINUSE; removed, since VS Code now owns the process.
- `serve.mjs` reports a port clash in one clear line instead of a stack trace.
