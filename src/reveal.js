/** Compiled from reveal.ts — types stripped. Do not edit directly; edit reveal.ts. */

const NOOP = () => {};

function isVisible(el, bottomMargin = 0.08) {
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return false;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return r.top < vh * (1 - bottomMargin) && r.bottom > 0;
}

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function watch(targets, onEnter) {
  let pending = targets.slice();
  let frame = 0;
  let tick = 0;
  let stopped = false;

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

  tick = 2;
  loop();

  return () => {
    stopped = true;
    if (frame) cancelAnimationFrame(frame);
  };
}

export function observeReveals(root, options = {}) {
  if (!root) return NOOP;

  const { stagger = 70, failsafe = 3000 } = options;
  const targets = Array.from(root.querySelectorAll('[data-reveal]'));
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

export function animateCounters(root, duration = 1100) {
  if (!root) return NOOP;

  const targets = Array.from(root.querySelectorAll('[data-count-to]'));
  if (targets.length === 0) return NOOP;

  const settle = (el) => {
    const to = el.getAttribute('data-count-to');
    if (to !== null) el.textContent = to;
  };

  if (prefersReducedMotion()) {
    targets.forEach(settle);
    return NOOP;
  }

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
