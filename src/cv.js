/** Compiled from cv.ts — types stripped. Do not edit directly; edit cv.ts. */

export const KIND_LABELS = {
  journal: 'Journal article',
  conference: 'Conference paper',
  chapter: 'Book chapter',
  report: 'Report / whitepaper',
  thesis: 'Thesis',
};

export const EMPTY_FILTERS = { year: null, kind: null, topic: null };

async function loadJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return await res.json();
}

export function loadPublications(url = 'src/publications.json') {
  return loadJson(url);
}

export function loadProjects(url = 'src/projects.json') {
  return loadJson(url);
}

export function loadCv(url = 'src/cv.json') {
  return loadJson(url);
}

export async function loadCvData(base = 'src') {
  const [publications, projects, cv] = await Promise.all([
    loadPublications(`${base}/publications.json`),
    loadProjects(`${base}/projects.json`),
    loadCv(`${base}/cv.json`),
  ]);
  return { publications, projects, cv };
}

export function years(pubs) {
  return [...new Set(pubs.map((p) => p.y))].sort((a, b) => b - a);
}

export function kinds(pubs) {
  const order = ['journal', 'conference', 'chapter', 'report', 'thesis'];
  const present = new Set(pubs.map((p) => p.k));
  return order.filter((k) => present.has(k));
}

export function topics(items) {
  return [...new Set(items.flatMap((i) => i.tp))].sort();
}

export function filterPublications(pubs, f) {
  return pubs.filter(
    (p) =>
      (f.year === null || p.y === f.year) &&
      (f.kind === null || p.k === f.kind) &&
      (f.topic === null || p.tp.includes(f.topic)),
  );
}

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

export function countsByKind(pubs) {
  const out = {};
  for (const p of pubs) out[p.k] = (out[p.k] ?? 0) + 1;
  return out;
}

export function filterProjects(projects, topic) {
  return topic === null ? projects : projects.filter((p) => p.tp.includes(topic));
}
