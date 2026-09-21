/**
 * Loading, filtering and grouping for the publication and project data.
 *
 * Types live here as JSDoc rather than in a separate .ts source: the editor
 * type-checks and autocompletes from these annotations with no build step, so
 * there is one file to maintain instead of a .ts and a stripped .js copy of it.
 */

/** @typedef {'journal'|'conference'|'chapter'|'report'|'thesis'} PublicationKind */

/**
 * @typedef {'Applied AI'|'Game Technology'|'XR & Virtual Production'
 *   |'Maritime Spatial Planning'|'Digital Humans'|'Player Modelling'
 *   |'Augmented Reality'} Topic
 */

/**
 * One entry in `data/publications.json`. The keys are terse because the file is
 * long and hand-edited — this is the only place they are spelled out.
 *
 * @typedef {object} Publication
 * @property {number} y Publication year
 * @property {string} a Author list, verbatim from the CV
 * @property {string} t Title
 * @property {string} v Venue / journal
 * @property {PublicationKind} k Output kind
 * @property {string} [st] Status note, e.g. "accepted"
 * @property {string} [doi] DOI or permanent link
 * @property {Topic[]} tp Research topics
 */

/**
 * One entry in `data/projects.json`.
 *
 * @typedef {object} Project
 * @property {string} name Short name, used as the card heading
 * @property {string} full Full project title
 * @property {string} years e.g. "2025–2029"
 * @property {string} role Carlos's role on the project
 * @property {string} funder Funding programme
 * @property {string} [url] Project site
 * @property {string} desc Description paragraph
 * @property {Topic[]} tp Research topics
 * @property {string} [logo] Logo path; omit it and the logo block is hidden
 * @property {string} [image] Photo path; omit it and the image column is dropped
 * @property {string} slot Naming key for the files under `images/projects/`
 * @property {string} [media] Where the source asset lives on the Cradle drive
 */

/**
 * @typedef {object} Highlight
 * @property {string} index Display ordinal, e.g. "01"
 * @property {string} name
 * @property {string} years
 * @property {string} desc
 * @property {string} published Where the work appeared
 */

/**
 * @typedef {object} Position
 * @property {string} years
 * @property {string} title
 * @property {string} org
 */

/**
 * @typedef {object} Degree
 * @property {string} year
 * @property {string} title
 * @property {string} detail
 */

/**
 * @typedef {object} Stat
 * @property {string} prefix
 * @property {number} num
 * @property {string} suffix
 * @property {string} label
 * @property {boolean} [fromPubCount] Use the live publication count in place of `num`
 */

/**
 * Contents of `data/cv.json` — the profile content that is neither a
 * publication nor a project.
 *
 * @typedef {object} Cv
 * @property {Highlight[]} highlights
 * @property {Position[]} positions
 * @property {Degree[]} education
 * @property {string[]} labs
 * @property {Stat[]} stats
 */

/**
 * @typedef {object} CvData
 * @property {Publication[]} publications
 * @property {Project[]} projects
 * @property {Cv} cv
 */

/**
 * @typedef {object} Filters
 * @property {number|null} year Year, or null for all years
 * @property {PublicationKind|null} kind Publication kind, or null for all kinds
 * @property {Topic|null} topic Topic, or null for all topics
 */

/** @type {Record<PublicationKind, string>} */
export const KIND_LABELS = {
  journal: 'Journal article',
  conference: 'Conference paper',
  chapter: 'Book chapter',
  report: 'Report / whitepaper',
  thesis: 'Thesis',
};

/** @type {Filters} */
export const EMPTY_FILTERS = { year: null, kind: null, topic: null };

/**
 * @param {string} url
 * @returns {Promise<any>}
 */
async function loadJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return await res.json();
}

/**
 * The publication list.
 * @param {string} [url]
 * @returns {Promise<Publication[]>}
 */
export function loadPublications(url = 'data/publications.json') {
  return loadJson(url);
}

/**
 * The project list.
 * @param {string} [url]
 * @returns {Promise<Project[]>}
 */
export function loadProjects(url = 'data/projects.json') {
  return loadJson(url);
}

/**
 * Positions, education, labs and the rest of the profile.
 * @param {string} [url]
 * @returns {Promise<Cv>}
 */
export function loadCv(url = 'data/cv.json') {
  return loadJson(url);
}

/**
 * All three data files, fetched in parallel. A page that needs only one list
 * should call the single loader for it instead.
 *
 * @param {string} [base] Directory holding the three JSON files
 * @returns {Promise<CvData>}
 */
export async function loadCvData(base = 'data') {
  const [publications, projects, cv] = await Promise.all([
    loadPublications(`${base}/publications.json`),
    loadProjects(`${base}/projects.json`),
    loadCv(`${base}/cv.json`),
  ]);
  return { publications, projects, cv };
}

/**
 * Descending list of every year that has at least one publication.
 * @param {Publication[]} pubs
 * @returns {number[]}
 */
export function years(pubs) {
  return [...new Set(pubs.map((p) => p.y))].sort((a, b) => b - a);
}

/**
 * Kinds present in the data, in the canonical display order.
 * @param {Publication[]} pubs
 * @returns {PublicationKind[]}
 */
export function kinds(pubs) {
  /** @type {PublicationKind[]} */
  const order = ['journal', 'conference', 'chapter', 'report', 'thesis'];
  const present = new Set(pubs.map((p) => p.k));
  return order.filter((k) => present.has(k));
}

/**
 * Topics present in the data, alphabetically.
 * @param {{ tp: Topic[] }[]} items Publications or projects
 * @returns {Topic[]}
 */
export function topics(items) {
  return [...new Set(items.flatMap((i) => i.tp))].sort();
}

/**
 * @param {Publication[]} pubs
 * @param {Filters} f
 * @returns {Publication[]}
 */
export function filterPublications(pubs, f) {
  return pubs.filter(
    (p) =>
      (f.year === null || p.y === f.year) &&
      (f.kind === null || p.k === f.kind) &&
      (f.topic === null || p.tp.includes(f.topic)),
  );
}

/**
 * Group publications by year, newest first, preserving in-year CV order.
 * @param {Publication[]} pubs
 * @returns {{ year: number, items: Publication[] }[]}
 */
export function groupByYear(pubs) {
  const buckets = new Map();
  for (const p of pubs) {
    const bucket = buckets.get(p.y);
    if (bucket) bucket.push(p);
    else buckets.set(p.y, [p]);
  }
  return [...buckets.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, items }));
}

/**
 * @param {Publication[]} pubs
 * @returns {Record<string, number>}
 */
export function countsByKind(pubs) {
  /** @type {Record<string, number>} */
  const out = {};
  for (const p of pubs) out[p.k] = (out[p.k] ?? 0) + 1;
  return out;
}

/**
 * @param {Project[]} projects
 * @param {Topic|null} topic
 * @returns {Project[]}
 */
export function filterProjects(projects, topic) {
  return topic === null ? projects : projects.filter((p) => p.tp.includes(topic));
}
