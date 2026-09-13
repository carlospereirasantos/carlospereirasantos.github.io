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
| index.html | uploads/CV_CS_en_2026-07-29-Full.pdf, uploads/CV_CS_2026-06-01_Biographical_Sketch.pdf |
| publications.html | src/cv-data.json, src/cv.ts |
| projects.html | src/cv-data.json, src/cv.ts |

## 2026-09-13 — rename + cleanup
- Pages renamed to plain lowercase `.html`; `Home.dc.html` is now `index.html`
  so static hosts serve it as the site root. Internal links updated.
- Added Google Analytics 4 (`G-FTNCFJS3SE`) to the `<helmet>` of every page.
- Removed `Projects-standalone.dc.html` and the single-file bundle it produced,
  along with the three loose root images only that variant referenced
  (`2026_vpgathering-*.jpg`, `vpsn2-1-*.png`, `avenue_logo_rgb-*.png`, ~7 MB).
  The live Projects page sources its images from `.image-slots.state.json`.
- `.gitignore` replaced with a version relevant to a static site.
