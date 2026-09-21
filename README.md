# carlospereirasantos.com

Personal site — academic profile, publications and research projects.
Static HTML; no build step, no dependencies.

## Running locally

The pages fetch their JSON over HTTP and import ES modules, so opening
`index.html` from disk (`file://`) fails on CORS — it has to be served.

* **In VS Code:** press <kbd>F5</kbd> ("Serve site (Edge)" or "(Chrome)").
  VS Code runs the server, waits for it to print its URL, then opens the site.
  It owns the process, so stopping the debug session stops the server — no
  stale one left holding the port. The "serve site" task runs it standalone.
* **From a terminal:** `npm start` (or `node .vscode/serve.mjs -p 3000`).

`.vscode/serve.mjs` is a static server written against Node's standard
library — nothing to install — with the two things testing needs: correct
MIME types for the `.webp` images and the ES modules, and
`Cache-Control: no-store` so a reload always picks up the latest edit.

## Pages

| File | Content |
| --- | --- |
| `index.html` | Home — biography, focus areas, highlights |
| `publications.html` | Publication list, filterable by year and topic |
| `projects.html` | Research projects |

## Supporting files

| Path | Purpose |
| --- | --- |
| `data/publications.json` | Publication list — edit this to add a paper |
| `data/projects.json` | Project list — edit this to add a project |
| `data/cv.json` | Profile content: highlights, positions, education, labs, stats |
| `downloads/` | CV and biographical sketch as PDFs, ready to link |
| `src/cv.js` | Data loading and client-side filtering; JSDoc types for the JSON |
| `src/reveal.js` | Scroll reveal animations |
| `src/theme-marigold.css` | Colour and type theme layered over the design system |
| `src/styles.css`, `src/ds_bundle.js` | Modernist design system — stylesheet and bundle |
| `src/readme.md` | The design system's own guide — tokens, classes, rules |
| `src/_ds_manifest.json`, `src/_adherence.oxlintrc.json` | Design-canvas authoring metadata; nothing loads them at runtime |
| `images/projects/` | Project photos and logos, named `<slot>.webp` / `logo-<slot>.webp` |
| `support.js` | Design-canvas runtime that renders the pages |
| `CNAME` | Custom domain for GitHub Pages |
| `.vscode/`, `package.json` | Local test server config (see Running locally) |
| `jsconfig.json` | Editor-only type checking for `src/*.js`; no runtime effect |
| `notes/` | Text extracted from the CVs, used when writing the content |

## Editing content

All page content lives in the three JSON files under `data/` — no HTML editing needed
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

## Types

There is no build step and no TypeScript source — `src/*.js` is what the browser
loads and the only thing to edit. Types are declared as JSDoc at the top of
`src/cv.js`, which is also the data dictionary for the JSON files: it is the one
place that records what the terse publication keys (`y`, `a`, `t`, `v`, `k`,
`st`, `tp`) mean, and which topics and publication kinds are valid.

`jsconfig.json` turns those annotations into real editor type-checking, the way
the old `.ts` files did. It affects the editor only — delete it and the site is
unchanged. To check from a terminal:

```
npx -p typescript tsc -p jsconfig.json --noEmit
```

## Deploying

GitHub Pages serves the repository root. Two things to know:

* **Never give a file the site loads a name starting with `_` or `.`.** Pages
  runs the repo through Jekyll, which silently drops those — that is why
  `_ds_bundle.js` was renamed to `ds_bundle.js`. (Adding a `.nojekyll` file at
  the root is the alternative fix.) The two `_`-prefixed files left under `src/`
  are authoring metadata that nothing fetches, so their being dropped is
  harmless.
* **Pages caches aggressively.** It sends `Cache-Control: max-age=604800`, so a
  browser can hold a week-old copy of `cv.js` or a page. After a deploy, reload
  with <kbd>Ctrl</kbd>+<kbd>F5</kbd> before concluding something is broken — the
  local test server sends `no-store`, so this never shows up locally.
