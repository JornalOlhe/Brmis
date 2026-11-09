import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { prefersReducedMotion, useScrollVar } from "@/lib/motion";

/** Every slide is a 1920×1200 (16:10) photo plus a small thumbnail. */
export type Slide = {
  src: string;
  thumb: string;
  title: string;
  area: string;
  text?: string;
};

type Props = {
  label: string;
  slides: Slide[];
  duration?: number;
  altSuffix?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const SWIPE = 48;

const controlClass =
  "group/btn grid size-11 place-items-center border border-paper/30 bg-night/40 backdrop-blur-md transition-all duration-300 hover:border-signal hover:text-signal active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal md:size-12";

export function AutoCarousel({
  label,
  slides,
  duration = 5500,
  altSuffix = "",
}: Props) {
  const total = slides.length;
  const wrap = useCallback((i: number) => (i + total) % total, [total]);
  const [{ active, prev, dir }, setState] = useState({
    active: 0,
    prev: -1,
    dir: 0,
  });
  const [inView, setInView] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [auto, setAuto] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const [dragX, setDragX] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pointer = useRef<{ x: number; moved: boolean } | null>(null);

  const go = useCallback(
    (i: number, forced?: 1 | -1) =>
      setState((s) => {
        const target = wrap(i);
        if (target === s.active) return s;
        const d = forced ?? (i > s.active ? 1 : -1);
        return { active: target, prev: s.active, dir: d };
      }),
    [wrap],
  );
  const next = useCallback(() => go(active + 1, 1), [go, active]);
  const back = useCallback(() => go(active - 1, -1), [go, active]);
  const nav = useRef({ next, back });
  nav.current = { next, back };

  // The stage opens up as it scrolls into view.
  useScrollVar(
    stageRef,
    "--enter",
    (rect, viewport) => (viewport - rect.top) / (viewport * 0.55),
  );

  // People who asked for less motion change photos themselves.
  useEffect(() => {
    if (prefersReducedMotion()) setAuto(false);
  }, []);

  const updateRail = useCallback(() => {
    const rail = thumbsRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    rail.dataset["at"] =
      max <= 2
        ? "all"
        : rail.scrollLeft <= 2
          ? "start"
          : rail.scrollLeft >= max - 2
            ? "end"
            : "";
  }, []);

  useEffect(() => {
    // Fetch the neighbours ahead of time so the wipe never reveals an empty frame.
    [wrap(active + 1), wrap(active - 1)].forEach((i) => {
      const slide = slides[i];
      if (!slide) return;
      const img = new Image();
      img.decoding = "async";
      img.src = slide.src;
    });
    const rail = thumbsRef.current;
    const thumb = rail?.children[active] as HTMLElement | undefined;
    if (rail && thumb) {
      rail.scrollTo({
        left: thumb.offsetLeft - rail.clientWidth / 2 + thumb.offsetWidth / 2,
        behavior: "smooth",
      });
    }
    updateRail();
  }, [active, slides, wrap, updateRail]);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.2 },
    );
    observer.observe(node);
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return setInView(false);
      const r = node.getBoundingClientRect();
      setInView(r.top < window.innerHeight && r.bottom > 0);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Two-finger horizontal swipe on a trackpad moves between photos; vertical scrolling is left alone.
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    let travelled = 0;
    let lastEvent = 0;
    let lockedUntil = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const now = performance.now();
      if (now - lastEvent > 220) travelled = 0;
      lastEvent = now;
      if (now < lockedUntil) return;
      travelled += e.deltaX;
      if (Math.abs(travelled) < 60) return;
      if (travelled > 0) nav.current.next();
      else nav.current.back();
      travelled = 0;
      lockedUntil = now + 900;
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  // Fullscreen viewer.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!zoomed) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [zoomed]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      back();
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    pointer.current = { x: e.clientX, moved: false };
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!pointer.current) return;
    const dx = e.clientX - pointer.current.x;
    if (Math.abs(dx) > 6) {
      pointer.current.moved = true;
      setDragX(Math.max(-160, Math.min(160, dx)));
    }
  };
  const endDrag = (e: PointerEvent, open: boolean) => {
    const start = pointer.current;
    if (!start) return;
    pointer.current = null;
    setDragX(0);
    const dx = e.clientX - start.x;
    if (dx < -SWIPE) next();
    else if (dx > SWIPE) back();
    else if (open && !start.moved) setZoomed(true);
  };

  const current = slides[active] ?? slides[0];
  if (!current) return null;
  const running =
    auto && total > 1 && inView && !keyboard && !zoomed && dragX === 0;
  const playState = running ? "running" : "paused";

  return (
    <div>
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carrossel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onFocus={(e) =>
          setKeyboard((e.target as HTMLElement).matches(":focus-visible"))
        }
        onBlur={() => setKeyboard(false)}
        className="relative outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
      >
        {/* Every photo is 16:10, so the frame is too and nothing is cut off. */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e, true)}
          onPointerLeave={(e) => endDrag(e, false)}
          onPointerCancel={() => {
            pointer.current = null;
            setDragX(0);
          }}
          className="stage-enter relative aspect-[16/10] max-h-[82svh] w-full cursor-zoom-in touch-pan-y select-none overflow-hidden bg-night"
        >
          <div className="stage-zoom absolute inset-0">
            <div
              className="absolute inset-0 transition-transform ease-out"
              style={{
                transform: `translate3d(${dragX * 0.5}px,0,0)`,
                transitionDuration: dragX ? "0ms" : "500ms",
              }}
            >
              {slides.map((s, i) => {
                const isActive = i === active;
                if (!isActive && i !== prev) return null;
                // The new photo dissolves in over the previous one, drifting in from the side it came from.
                const layer = isActive
                  ? dir === 0
                    ? "z-[2]"
                    : "z-[2] ch-in"
                  : "z-[1] ch-out";
                const alt = isActive ? `${s.title}${altSuffix}` : "";
                return (
                  <div
                    key={`${s.src}-${isActive ? active : "prev"}`}
                    aria-hidden={!isActive}
                    className={`absolute inset-0 overflow-hidden ${layer}`}
                    style={{ ["--ch-dir" as string]: dir }}
                  >
                    <img
                      src={s.src}
                      alt={alt}
                      width={1920}
                      height={1200}
                      decoding="async"
                      draggable={false}
                      className={`size-full object-cover ${isActive ? "ch-kenburns" : ""}`}
                      style={{
                        animationPlayState: isActive ? playState : undefined,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-transparent to-night/25 sm:from-night/90 sm:via-night/10" />

          <div className="absolute inset-x-0 top-0 z-[4] h-[2px] bg-paper/15">
            <div
              key={active}
              className="ch-progress h-full origin-left bg-signal"
              style={{
                animationDuration: `${duration}ms`,
                animationPlayState: playState,
              }}
              onAnimationEnd={next}
            />
          </div>

          <button
            type="button"
            aria-label="Ampliar imagem"
            onClick={() => setZoomed(true)}
            className={`${controlClass} absolute right-4 top-5 z-[4] md:right-8 md:top-9`}
          >
            <Maximize2 className="size-4 transition-transform duration-300 group-hover/btn:scale-110" />
          </button>
        </div>

        {/* Caption and controls: under the photo on phones, over it from tablet up. */}
        <div className="mt-5 flex flex-col gap-5 sm:pointer-events-none sm:absolute sm:inset-x-0 sm:bottom-0 sm:z-[4] sm:mt-0 sm:p-5 md:flex-row md:items-end md:justify-between md:p-10">
          <div key={active} className="max-w-xl">
            <p
              className="technical-label ch-fade-up flex items-center gap-3 text-paper/75"
              style={{ animationDelay: "250ms" }}
            >
              <span className="ch-line h-px w-8 origin-left bg-signal" />
              {current.area}
            </p>
            <div className="mt-3 overflow-hidden pb-1">
              <h3
                className="ch-rise font-display text-2xl font-medium leading-tight sm:text-3xl md:text-5xl"
                style={{ animationDelay: "380ms" }}
              >
                {current.title}
              </h3>
            </div>
            {current.text && (
              <p
                className="ch-fade-up mt-2 hidden max-w-md text-sm leading-relaxed text-paper/70 sm:block md:text-base"
                style={{ animationDelay: "560ms" }}
              >
                {current.text}
              </p>
            )}
          </div>
          <div className="pointer-events-auto flex items-center justify-between gap-5 md:justify-end">
            <p
              className="flex items-baseline font-display text-lg tabular-nums text-paper/60"
              aria-live={running ? "off" : "polite"}
            >
              <span className="sr-only">Imagem </span>
              <span className="inline-block overflow-hidden">
                <span
                  key={active}
                  className="ch-rise inline-block text-2xl text-paper md:text-3xl"
                >
                  {pad(active + 1)}
                </span>
              </span>
              <span className="ml-1">
                <span aria-hidden>/ </span>
                <span className="sr-only">de </span>
                {pad(total)}
              </span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Imagem anterior"
                onClick={back}
                className={controlClass}
              >
                <ArrowLeft className="size-5 transition-transform duration-300 group-hover/btn:-translate-x-0.5" />
              </button>
              <button
                type="button"
                aria-label="Próxima imagem"
                onClick={next}
                className="group/btn grid size-11 place-items-center border border-signal bg-signal text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-signal active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal md:size-12"
              >
                <ArrowRight className="size-5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={thumbsRef}
        onScroll={updateRail}
        className="thumb-rail no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2 pt-1"
      >
        {slides.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={s.src}
              type="button"
              aria-label={`Ver ${s.title}`}
              aria-current={on}
              onClick={() => go(i)}
              className={`group relative aspect-[16/10] w-24 shrink-0 overflow-hidden bg-concrete transition-opacity duration-500 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal md:w-32 ${on ? "opacity-100" : "opacity-40 hover:opacity-80"}`}
            >
              <img
                src={s.thumb}
                width={400}
                height={250}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                className={`size-full object-cover transition-transform duration-700 ${on ? "scale-105" : "group-hover:scale-105"}`}
              />
              <span
                className={`absolute inset-x-0 bottom-0 h-[2px] origin-left bg-signal transition-transform duration-500 ${on ? "scale-x-100" : "scale-x-0"}`}
              />
            </button>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`${label}: imagem ampliada`}
        className="lightbox"
        onClose={() => setZoomed(false)}
        onKeyDown={onKeyDown}
      >
        {zoomed && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8 md:py-5">
              <p className="technical-label flex items-center gap-3 text-paper/60">
                <span className="tabular-nums text-paper">
                  {pad(active + 1)} / {pad(total)}
                </span>
                <span className="h-px w-6 bg-signal" />
                {current.area}
              </p>
              <button
                type="button"
                aria-label="Fechar imagem ampliada"
                onClick={() => setZoomed(false)}
                className={controlClass}
              >
                <X className="size-5" />
              </button>
            </div>
            <div
              className="relative min-h-0 flex-1 touch-pan-y px-2 md:px-8"
              onPointerDown={onPointerDown}
              onPointerUp={(e) => endDrag(e, false)}
              onPointerCancel={() => {
                pointer.current = null;
              }}
            >
              <img
                key={current.src}
                src={current.src}
                alt={`${current.title}${altSuffix}`}
                draggable={false}
                className="lightbox-image pointer-events-none mx-auto size-full select-none object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-5 px-4 py-4 md:px-8 md:py-6">
              <p className="font-display text-lg font-medium leading-tight md:text-2xl">
                {current.title}
              </p>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  aria-label="Imagem anterior"
                  onClick={back}
                  className={controlClass}
                >
                  <ArrowLeft className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="Próxima imagem"
                  onClick={next}
                  className={controlClass}
                >
                  <ArrowRight className="size-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
