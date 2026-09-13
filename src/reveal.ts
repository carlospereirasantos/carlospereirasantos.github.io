/**
 * Scroll-driven reveal + counter animation.
 * Authored source; compiled (types stripped) to `reveal.js` — keep both in step.
 *
 * Deliberately does NOT use IntersectionObserver: in some embedded/preview
 * frames its callbacks never fire, which silently broke both features. A
 * rect-measured visibility check polled on requestAnimationFrame works in
 * every container (scroll events do not fire there either), and every target
 * has a failsafe settle.
 */

type Teardown = () => void;

const NOOP: Teardown = () => {};

function isVisible(el: HTMLElement, bottomMargin = 0.08): boolean {
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return false;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return r.top < vh * (1 - bottomMargin) && r.bottom > 0;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Watches `targets` and calls `onEnter(el)` once each becomes visible.
 * Returns a teardown. Fires immediately for anything already on screen.
 */
function watch(targets: HTMLElement[], onEnter: (el: HTMLElement, order: number) => void): Teardown {
  let pending = targets.slice();
  let frame = 0;
  let tick = 0;
  let stopped = false;

  // Polled on rAF rather than driven by scroll events or IntersectionObserver:
  // neither fires reliably inside embedded preview frames. Self-cancels as soon
  // as every target has entered.
  const loop = () => {
    frame = 0;
    if (stopped) return;
    if (++tick % 3 === 0) {
      let order = 0;
      const still: HTMLElement[] = [];
      for (const el of pending) {
        if (isVisible(el)) onEnter(el, order++);
        else still.push(el);
      }
      pending = still;
    }
    if (pending.length > 0) frame = requestAnimationFrame(loop);
  };

  // First pass runs synchronously so above-the-fold targets never flash.
  tick = 2;
  loop();

  return () => {
    stopped = true;
    if (frame) cancelAnimationFrame(frame);
  };
}

export interface RevealOptions {
  /** Stagger between siblings entering in the same frame, in ms */
  stagger?: number;
  /** Safety net: reveal everything after this long regardless, in ms */
  failsafe?: number;
}

export function observeReveals(root: HTMLElement | null, options: RevealOptions = {}): Teardown {
  if (!root) return NOOP;

  const { stagger = 70, failsafe = 3000 } = options;
  const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (targets.length === 0) return NOOP;

  const revealAll = () => targets.forEach((el) => el.classList.add('is-in'));

  if (prefersReducedMotion()) {
    revealAll();
    return NOOP;
  }

  root.setAttribute('data-reveal-ready', '');

  const stop = watch(targets, (el, order) => {
    window.setTimeout(() => el.classList.add('is-in'), order * stagger);
  });

  const timer = window.setTimeout(revealAll, failsafe);

  return () => {
    stop();
    window.clearTimeout(timer);
  };
}

/**
 * Tweens any `[data-count-to]` element from 0 to its target integer the first
 * time it becomes visible. The element's text is only zeroed at the moment the
 * tween starts, so a target that never animates still shows its real number.
 */
export function animateCounters(root: HTMLElement | null, duration = 1100): Teardown {
  if (!root) return NOOP;

  const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-count-to]'));
  if (targets.length === 0) return NOOP;

  const settle = (el: HTMLElement) => {
    const to = el.getAttribute('data-count-to');
    if (to !== null) el.textContent = to;
  };

  if (prefersReducedMotion()) {
    targets.forEach(settle);
    return NOOP;
  }

  const run = (el: HTMLElement) => {
    const target = Number(el.getAttribute('data-count-to'));
    if (!Number.isFinite(target)) return settle(el);
    const start = performance.now();
    el.textContent = '0';
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(step);
      else settle(el);
    };
    requestAnimationFrame(step);
  };

  const stop = watch(targets, run);
  const timer = window.setTimeout(() => targets.forEach(settle), 4000);

  return () => {
    stop();
    window.clearTimeout(timer);
  };
}
