import { useEffect, useRef, type RefObject } from "react";

export const clamp = (n: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, n));

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Listener = () => void;
const listeners = new Set<Listener>();
let queued = false;
let bound = false;

const flush = () => {
  queued = false;
  listeners.forEach((listener) => listener());
};
const schedule = () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(flush);
};

/** Runs `listener` at most once per frame while the page scrolls or resizes. Returns an unsubscribe. */
export function onScrollFrame(listener: Listener) {
  listeners.add(listener);
  if (!bound) {
    bound = true;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  }
  schedule();
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Writes a 0–1 scroll progress into a CSS custom property on the element, so the motion itself lives in CSS.
 * `compute` receives the element's rect and the viewport height.
 */
export function useScrollVar<T extends HTMLElement>(
  ref: RefObject<T | null>,
  name: string,
  compute: (rect: DOMRect, viewport: number) => number,
) {
  const computeRef = useRef(compute);
  computeRef.current = compute;
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let last = "";
    return onScrollFrame(() => {
      const value = clamp(
        computeRef.current(node.getBoundingClientRect(), window.innerHeight),
      ).toFixed(3);
      if (value === last) return;
      last = value;
      node.style.setProperty(name, value);
    });
  }, [ref, name]);
}

/** Marks every `.reveal` element as visible when it enters the viewport, including ones rendered later. */
export function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    const watch = (root: ParentNode) =>
      root
        .querySelectorAll(".reveal:not(.is-visible)")
        .forEach((el) => observer.observe(el));
    watch(document);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches(".reveal:not(.is-visible)")) observer.observe(node);
          watch(node);
        });
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);
}
