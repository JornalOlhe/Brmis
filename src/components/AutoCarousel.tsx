import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

export type Slide = { src: string; title: string; area: string; text?: string; portrait?: boolean };

type Props = {
  id?: string;
  label: string;
  slides: Slide[];
  duration?: number;
  altSuffix?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

export function AutoCarousel({ id, label, slides, duration = 5500, altSuffix = "" }: Props) {
  const total = slides.length;
  const wrap = useCallback((i: number) => (i + total) % total, [total]);
  const [{ active, prev, dir }, setState] = useState({ active: 0, prev: -1, dir: 0 });
  const [inView, setInView] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0, 1, total - 1]));
  const rootRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; id: number } | null>(null);

  const go = useCallback(
    (i: number, forced?: 1 | -1) =>
      setState((s) => {
        const next = wrap(i);
        if (next === s.active) return s;
        const d = forced ?? (i > s.active ? 1 : -1);
        return { active: next, prev: s.active, dir: d };
      }),
    [wrap],
  );
  const next = useCallback(() => go(active + 1, 1), [go, active]);
  const back = useCallback(() => go(active - 1, -1), [go, active]);

  useEffect(() => {
    setLoaded((p) => {
      const n = new Set(p);
      [active, wrap(active + 1), wrap(active - 1)].forEach((i) => n.add(i));
      return n.size === p.size ? p : n;
    });
    const thumbs = thumbsRef.current;
    const thumb = thumbs?.children[active] as HTMLElement | undefined;
    if (thumbs && thumb) thumbs.scrollTo({ left: thumb.offsetLeft - thumbs.clientWidth / 2 + thumb.offsetWidth / 2, behavior: "smooth" });
  }, [active, wrap]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), { threshold: 0.2 });
    observer.observe(node);
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return setInView(false);
      const r = node.getBoundingClientRect();
      setInView(r.top < window.innerHeight && r.bottom > 0);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
  };
  const onPointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    pointer.current = { x: e.clientX, id: e.pointerId };
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!pointer.current) return;
    const dx = e.clientX - pointer.current.x;
    if (Math.abs(dx) > 6) setDragX(Math.max(-140, Math.min(140, dx)));
  };
  const endDrag = (e: PointerEvent) => {
    if (!pointer.current) return;
    const dx = e.clientX - pointer.current.x;
    pointer.current = null;
    setDragX(0);
    if (dx < -50) next();
    else if (dx > 50) back();
  };

  const current = slides[active] ?? slides[0];
  if (!current) return null;
  const playState = inView && dragX === 0 ? "running" : "paused";

  return (
    <div ref={rootRef} id={id}>
      <div
        role="region"
        aria-roledescription="carrossel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={() => { pointer.current = null; setDragX(0); }}
        className="group/stage reveal relative aspect-[4/5] cursor-grab touch-pan-y select-none overflow-hidden bg-night outline-none active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal sm:aspect-[16/10] lg:aspect-[2/1]"
      >
        <div className="absolute inset-0 transition-transform duration-500 ease-out" style={{ transform: `translate3d(${dragX * 0.35}px,0,0)`, transitionDuration: dragX ? "0ms" : "500ms" }}>
          {slides.map((s, i) => {
            const isActive = i === active;
            const isPrev = i === prev;
            if (!loaded.has(i) || (!isActive && !isPrev)) return null;
            const layer = isActive ? (dir === 0 ? "z-[2]" : `z-[2] ${dir > 0 ? "ch-in-next" : "ch-in-prev"}`) : "z-[1] ch-out";
            const imgAnim = isActive ? (dir === 0 ? "ch-kenburns" : "ch-settle") : "";
            return (
              <div key={`${s.src}-${isActive ? active : "prev"}`} aria-hidden={!isActive} className={`absolute inset-0 overflow-hidden ${layer}`} style={{ ["--ch-dir" as string]: dir }}>
                {s.portrait ? (
                  <>
                    <img src={s.src} alt="" aria-hidden decoding="async" draggable={false} className="absolute inset-0 size-full scale-110 object-cover opacity-60 blur-2xl" />
                    <img src={s.src} alt={isActive ? `${s.title}${altSuffix}` : ""} decoding="async" draggable={false} className={`relative mx-auto h-full w-auto max-w-full object-contain ${imgAnim}`} style={{ animationPlayState: isActive ? playState : undefined }} />
                  </>
                ) : (
                  <img src={s.src} alt={isActive ? `${s.title}${altSuffix}` : ""} decoding="async" draggable={false} className={`size-full object-cover ${imgAnim}`} style={{ animationPlayState: isActive ? playState : undefined }} />
                )}
              </div>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-night/90 via-night/10 to-night/20" />

        <div className="absolute inset-x-0 top-0 z-[4] h-[2px] bg-paper/15">
          <div key={active} className="ch-progress h-full origin-left bg-signal" style={{ animationDuration: `${duration}ms`, animationPlayState: playState }} onAnimationEnd={next} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] flex flex-col gap-5 p-5 md:flex-row md:items-end md:justify-between md:p-10">
          <div key={active} className="max-w-xl">
            <p className="technical-label ch-fade-up flex items-center gap-3 text-paper/75" style={{ animationDelay: "250ms" }}><span className="ch-line h-px w-8 origin-left bg-signal" />{current.area}</p>
            <div className="mt-3 overflow-hidden pb-1">
              <h3 className="ch-rise font-display text-2xl font-medium leading-tight sm:text-3xl md:text-5xl" style={{ animationDelay: "380ms" }}>{current.title}</h3>
            </div>
            {current.text && <p className="ch-fade-up mt-2 hidden max-w-md text-sm leading-relaxed text-paper/70 sm:block md:text-base" style={{ animationDelay: "560ms" }}>{current.text}</p>}
          </div>
          <div className="pointer-events-auto flex items-center justify-between gap-5 md:justify-end">
            <p className="flex items-baseline font-display text-lg tabular-nums text-paper/60" aria-live="polite">
              <span className="inline-block overflow-hidden"><span key={active} className="ch-rise inline-block text-2xl text-paper md:text-3xl">{pad(active + 1)}</span></span>
              <span className="ml-1">/ {pad(total)}</span>
            </p>
            <div className="flex gap-2">
              <button type="button" aria-label="Imagem anterior" onClick={back} className="group/btn grid size-12 place-items-center border border-paper/30 bg-night/40 backdrop-blur-md transition-all duration-300 hover:border-signal hover:text-signal active:scale-95 focus-visible:outline-2 focus-visible:outline-signal"><ArrowLeft className="size-5 transition-transform duration-300 group-hover/btn:-translate-x-0.5" /></button>
              <button type="button" aria-label="Próxima imagem" onClick={next} className="group/btn grid size-12 place-items-center border border-signal bg-signal text-primary-foreground transition-all duration-300 hover:bg-transparent hover:text-signal active:scale-95 focus-visible:outline-2 focus-visible:outline-signal"><ArrowRight className="size-5 transition-transform duration-300 group-hover/btn:translate-x-0.5" /></button>
            </div>
          </div>
        </div>
      </div>

      <div ref={thumbsRef} className="reveal mt-4 flex gap-3 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {slides.map((s, i) => {
          const on = i === active;
          return (
            <button key={s.src} type="button" aria-label={`Ver ${s.title}`} aria-current={on} onClick={() => go(i)} className={`group relative aspect-[16/10] w-24 shrink-0 overflow-hidden bg-concrete transition-all duration-500 ease-out md:w-32 ${on ? "opacity-100" : "opacity-40 hover:opacity-80"}`}>
              <img src={s.src} alt="" loading="lazy" decoding="async" draggable={false} className={`size-full object-cover transition-transform duration-700 ${on ? "scale-105" : "group-hover:scale-105"}`} />
              <span className={`absolute inset-x-0 bottom-0 h-[2px] origin-left bg-signal transition-transform duration-500 ${on ? "scale-x-100" : "scale-x-0"}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
