/**
 * Scroll-driven reveal + counter animation.
 *
 * Deliberately does NOT use IntersectionObserver: in some embedded/preview
 * frames its callbacks never fire, which silently broke both features. A
 * rect-measured visibility check polled on requestAnimationFrame works in
 * every container (scroll events do not fire there either), and every target
 * has a failsafe settle.
 *
 * @typedef {() => void} Teardown
 */

/** @type {Teardown} */
const NOOP = () => { };

/**
 * @param {HTMLElement} el
 * @param {number} [bottomMargin] Fraction of the viewport to ignore at the bottom
 * @returns {boolean}
 */
function isVisible(el, bottomMargin = 0.08) {
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return false;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return r.top < vh * (1 - bottomMargin) && r.bottom > 0;
}

/** @returns {boolean} */
function prefersReducedMotion() {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Watches `targets` and calls `onEnter(el)` once each becomes visible.
 * Returns a teardown. Fires immediately for anything already on screen.
 *
 * @param {HTMLElement[]} targets
 * @param {(el: HTMLElement, order: number) => void} onEnter
 * @returns {Teardown}
 */
function watch(targets, onEnter) {
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
      const still = [];
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

/**
 * Reveals every `[data-reveal]` element under `root` as it scrolls into view.
 *
 * @param {HTMLElement|null} root
 * @param {{ stagger?: number, failsafe?: number }} [options]
 *   `stagger` — gap between siblings entering in the same frame, in ms.
 *   `failsafe` — reveal everything after this long regardless, in ms.
 * @returns {Teardown}
 */
export function observeReveals(root, options = {}) {
  if (!root) return NOOP;

  const { stagger = 70, failsafe = 3000 } = options;
  const targets = /** @type {HTMLElement[]} */ (Array.from(root.querySelectorAll('[data-reveal]')));
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
 *
 * @param {HTMLElement|null} root
 * @param {number} [duration] Tween length in ms
 * @returns {Teardown}
 */
export function animateCounters(root, duration = 1100) {
  if (!root) return NOOP;

  const targets = /** @type {HTMLElement[]} */ (Array.from(root.querySelectorAll('[data-count-to]')));
  if (targets.length === 0) return NOOP;

  /** @param {HTMLElement} el */
  const settle = (el) => {
    const to = el.getAttribute('data-count-to');
    if (to !== null) el.textContent = to;
  };

  if (prefersReducedMotion()) {
    targets.forEach(settle);
    return NOOP;
  }

  /** @param {HTMLElement} el */
  const run = (el) => {
    const target = Number(el.getAttribute('data-count-to'));
    if (!Number.isFinite(target)) return settle(el);
    const start = performance.now();
    el.textContent = '0';
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
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
