/**
 * Authored source for the client-side publication/project logic.
 * Compiled (types stripped) to `cv.js`, which is what the pages load.
 * Keep the two in step.
 */

export type PublicationKind =
  | 'journal'
  | 'conference'
  | 'chapter'
  | 'report'
  | 'thesis';

export type Topic =
  | 'Applied AI'
  | 'Game Technology'
  | 'XR & Virtual Production'
  | 'Maritime Spatial Planning'
  | 'Digital Humans'
  | 'Player Modelling'
  | 'Augmented Reality';

export interface Publication {
  /** Publication year */
  y: number;
  /** Author list, verbatim from the CV */
  a: string;
  /** Title */
  t: string;
  /** Venue / journal */
  v: string;
  /** Output kind */
  k: PublicationKind;
  /** Status note, e.g. "accepted" */
  st?: string;
  /** DOI or permanent link */
  doi?: string;
  /** Research topics */
  tp: Topic[];
}

export interface Project {
  name: string;
  full: string;
  years: string;
  role: string;
  funder: string;
  url?: string;
  desc: string;
  tp: Topic[];
  /** Logo path, omitted when the project has no logo file */
  logo?: string;
  /** Project photo path, omitted when the project has no photo file */
  image?: string;
  /** Image-slot id, kept as the naming key for files under images/projects/ */
  slot: string;
  /** Where the source asset lives on the Cradle marketing drive */
  media?: string;
}

export interface Highlight {
  /** Display ordinal, e.g. "01" */
  index: string;
  name: string;
  years: string;
  desc: string;
  /** Where the work appeared */
  published: string;
}

export interface Position {
  years: string;
  title: string;
  org: string;
}

export interface Degree {
  year: string;
  title: string;
  detail: string;
}

export interface Stat {
  prefix: string;
  num: number;
  suffix: string;
  label: string;
  /** Use the live publication count in place of `num` */
  fromPubCount?: boolean;
}

/** Contents of `cv.json` — the profile content that is neither a publication nor a project. */
export interface Cv {
  highlights: Highlight[];
  positions: Position[];
  education: Degree[];
  labs: string[];
  stats: Stat[];
}

export interface CvData {
  publications: Publication[];
  projects: Project[];
  cv: Cv;
}

export interface Filters {
  /** Year, or null for all years */
  year: number | null;
  /** Publication kind, or null for all kinds */
  kind: PublicationKind | null;
  /** Topic, or null for all topics */
  topic: Topic | null;
}

export const KIND_LABELS: Record<PublicationKind, string> = {
  journal: 'Journal article',
  conference: 'Conference paper',
  chapter: 'Book chapter',
  report: 'Report / whitepaper',
  thesis: 'Thesis',
};

export const EMPTY_FILTERS: Filters = { year: null, kind: null, topic: null };

async function loadJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return (await res.json()) as T;
}

/** The publication list. */
export function loadPublications(url = 'src/publications.json'): Promise<Publication[]> {
  return loadJson<Publication[]>(url);
}

/** The project list. */
export function loadProjects(url = 'src/projects.json'): Promise<Project[]> {
  return loadJson<Project[]>(url);
}

/** Positions, education, labs and the rest of the profile. */
export function loadCv(url = 'src/cv.json'): Promise<Cv> {
  return loadJson<Cv>(url);
}

/**
 * All three data files, fetched in parallel. A page that needs only one list
 * should call the single loader for it instead.
 */
export async function loadCvData(base = 'src'): Promise<CvData> {
  const [publications, projects, cv] = await Promise.all([
    loadPublications(`${base}/publications.json`),
    loadProjects(`${base}/projects.json`),
    loadCv(`${base}/cv.json`),
  ]);
  return { publications, projects, cv };
}

/** Descending list of every year that has at least one publication. */
export function years(pubs: Publication[]): number[] {
  return [...new Set(pubs.map((p) => p.y))].sort((a, b) => b - a);
}

/** Kinds present in the data, in the canonical display order. */
export function kinds(pubs: Publication[]): PublicationKind[] {
  const order: PublicationKind[] = ['journal', 'conference', 'chapter', 'report', 'thesis'];
  const present = new Set(pubs.map((p) => p.k));
  return order.filter((k) => present.has(k));
}

/** Topics present in the data, alphabetically. */
export function topics(items: { tp: Topic[] }[]): Topic[] {
  return [...new Set(items.flatMap((i) => i.tp))].sort();
}

export function filterPublications(pubs: Publication[], f: Filters): Publication[] {
  return pubs.filter(
    (p) =>
      (f.year === null || p.y === f.year) &&
      (f.kind === null || p.k === f.kind) &&
      (f.topic === null || p.tp.includes(f.topic)),
  );
}

/** Group publications by year, newest first, preserving in-year CV order. */
export function groupByYear(pubs: Publication[]): { year: number; items: Publication[] }[] {
  const buckets = new Map<number, Publication[]>();
  for (const p of pubs) {
    const bucket = buckets.get(p.y);
    if (bucket) bucket.push(p);
    else buckets.set(p.y, [p]);
  }
  return [...buckets.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, items }));
}

export function countsByKind(pubs: Publication[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of pubs) out[p.k] = (out[p.k] ?? 0) + 1;
  return out;
}

export function filterProjects(projects: Project[], topic: Topic | null): Project[] {
  return topic === null ? projects : projects.filter((p) => p.tp.includes(topic));
}
