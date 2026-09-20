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
| index.html | src/cv.json, src/publications.json (uploaded CV PDFs in uploads/) |
| publications.html | src/publications.json, src/cv.ts |
| projects.html | src/projects.json, src/cv.ts |

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
