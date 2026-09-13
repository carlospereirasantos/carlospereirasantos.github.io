# carlospereirasantos.com

Personal site — academic profile, publications and research projects.
Static HTML; no build step, no dependencies. Open `index.html` in a browser
or serve the folder with any static file server.

## Pages

| File | Content |
| --- | --- |
| `index.html` | Home — biography, focus areas, highlights |
| `publications.html` | Publication list, filterable by year and topic |
| `projects.html` | Research projects |

## Supporting files

| Path | Purpose |
| --- | --- |
| `src/cv-data.json` | Publications and projects data, rendered by every page |
| `src/cv.ts` / `cv.js` | Data loading and client-side filtering (`.js` is what ships) |
| `src/reveal.ts` / `reveal.js` | Scroll reveal animations |
| `src/theme-marigold.css` | Colour and type theme layered over the design system |
| `_ds/modernist-*/` | Modernist design system — stylesheet and bundle |
| `support.js`, `image-slot.js` | Design-canvas runtime and editable image slots |
| `.image-slots.state.json` | Project images, base64 — required, keep tracked |
| `notes/`, `uploads/` | Source CVs the site content was written from |

Google Analytics (GA4, `G-FTNCFJS3SE`) is loaded from the `<helmet>` block of
each page, which the runtime injects into the document head.
