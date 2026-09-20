# carlospereirasantos.com

Personal site — academic profile, publications and research projects.
Static HTML; no build step, no dependencies.

## Running locally

The pages fetch their JSON over HTTP and import ES modules, so opening
`index.html` from disk (`file://`) fails on CORS — it has to be served.

* **In VS Code:** press <kbd>F5</kbd> ("Serve site"). The server starts and a
  browser opens on <http://localhost:8080/>; stopping the debug session stops
  the server. Or run the "serve site" task on its own.
* **From a terminal:** `npm start` (or `node .vscode/serve.mjs -p 3000`).

`.vscode/serve.mjs` is a static server written against Node's standard
library — nothing to install — with the two things testing needs: correct
MIME types for the `.webp` images and the ES modules, and
`Cache-Control: no-store` so a reload always picks up the latest edit.

Note that dropping a new image onto an `<image-slot>` will not persist when
served this way — slots read their state over `fetch()` but write through the
design-canvas host, which is not running. Only `index.html` still uses a slot
(the portrait); project images are plain files (see below).

## Pages

| File | Content |
| --- | --- |
| `index.html` | Home — biography, focus areas, highlights |
| `publications.html` | Publication list, filterable by year and topic |
| `projects.html` | Research projects |

## Supporting files

| Path | Purpose |
| --- | --- |
| `src/publications.json` | Publication list — edit this to add a paper |
| `src/projects.json` | Project list — edit this to add a project |
| `src/cv.json` | Profile content: highlights, positions, education, labs, stats |
| `src/cv.ts` / `cv.js` | Data loading and client-side filtering (`.js` is what ships) |
| `src/reveal.ts` / `reveal.js` | Scroll reveal animations |
| `src/theme-marigold.css` | Colour and type theme layered over the design system |
| `src/styles.css`, `src/_ds_bundle.js` | Modernist design system — stylesheet and bundle |
| `images/projects/` | Project photos and logos, named `<slot>.webp` / `logo-<slot>.webp` |
| `support.js`, `image-slot.js` | Design-canvas runtime and editable image slots |
| `.image-slots.state.json` | Images held as base64 by the image slots — keep tracked |
| `CNAME` | Custom domain for GitHub Pages |
| `.vscode/`, `package.json` | Local test server config (see Running locally) |
| `notes/`, `uploads/` | Source CVs the site content was written from |

## Editing content

All page content lives in the three JSON files under `src/` — no HTML editing needed
to add a publication, a project, or a job. Each page loads only the file it needs:

| Page | Loads |
| --- | --- |
| `index.html` | `publications.json` (for the topic list and count) + `cv.json` |
| `publications.html` | `publications.json` |
| `projects.html` | `projects.json` |

The file paths are defaults inside `src/cv.js` (`loadPublications`, `loadProjects`,
`loadCv`), so they are declared in one place. `loadCvData()` still exists and fetches
all three in parallel for anything that needs everything at once.

A `stats` entry in `cv.json` marked `"fromPubCount": true` has its number replaced
at runtime by the live publication count, so it never goes stale.

Project images come from the `logo` and `image` paths in `projects.json`. Leave a
key out and that block is hidden rather than rendered empty — a project with no
photo drops the image column and gives the space to its description. To add one,
drop the file in `images/projects/` and add the path.

Google Analytics (GA4, `G-FTNCFJS3SE`) is loaded from the `<helmet>` block of
each page, which the runtime injects into the document head.
