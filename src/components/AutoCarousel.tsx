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
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0, 1, total - 1]));
  const rootRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const pointerX = useRef<number | null>(null);
  const go = useCallback((i: number) => setActive(wrap(i)), [wrap]);

  useEffect(() => {
    setLoaded((prev) => {
      const next = new Set(prev);
      [active, wrap(active + 1), wrap(active - 1)].forEach((i) => next.add(i));
      return next.size === prev.size ? prev : next;
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
    if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
  };
  const onPointerDown = (e: PointerEvent) => { pointerX.current = e.clientX; };
  const onPointerUp = (e: PointerEvent) => {
    if (pointerX.current === null) return;
    const dx = e.clientX - pointerX.current;
    pointerX.current = null;
    if (Math.abs(dx) > 45) go(active + (dx < 0 ? 1 : -1));
  };

  const current = slides[active] ?? slides[0];
  if (!current) return null;
  const playState = inView ? "running" : "paused";

  return (
    <div ref={rootRef} id={id}>
      <div
        role="region"
        aria-roledescription="carrossel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { pointerX.current = null; }}
        className="reveal relative aspect-[4/5] touch-pan-y select-none overflow-hidden bg-night outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal sm:aspect-[16/10] lg:aspect-[2/1]"
      >
        {slides.map((s, i) => {
          const isActive = i === active;
          return (
            <div key={s.src} aria-hidden={!isActive} className={`absolute inset-0 transition-opacity duration-[1100ms] ease-out ${isActive ? "z-[1] opacity-100" : "z-0 opacity-0"}`}>
              {loaded.has(i) && (s.portrait ? (
                <>
                  <img src={s.src} alt="" aria-hidden decoding="async" draggable={false} className="absolute inset-0 size-full scale-110 object-cover opacity-60 blur-2xl" />
                  <img src={s.src} alt={isActive ? `${s.title}${altSuffix}` : ""} decoding="async" draggable={false} className={`relative mx-auto h-full w-auto max-w-full object-contain ${isActive ? "ch-kenburns" : ""}`} style={{ animationPlayState: playState }} />
                </>
              ) : (
                <img src={s.src} alt={isActive ? `${s.title}${altSuffix}` : ""} decoding="async" draggable={false} className={`size-full object-cover ${isActive ? "ch-kenburns" : ""}`} style={{ animationPlayState: playState }} />
              ))}
            </div>
          );
        })}

        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-night/85 via-night/5 to-transparent" />

        <div className="absolute inset-x-0 top-0 z-[3] h-[2px] bg-paper/15">
          <div key={active} className="ch-progress h-full origin-left bg-signal" style={{ animationDuration: `${duration}ms`, animationPlayState: playState }} onAnimationEnd={() => go(active + 1)} />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-[3] flex flex-col gap-5 p-5 md:flex-row md:items-end md:justify-between md:p-10">
          <div key={active} className="max-w-xl duration-700 animate-in fade-in slide-in-from-bottom-3">
            <p className="technical-label flex items-center gap-3 text-paper/75"><span className="h-px w-8 bg-signal" />{current.area}</p>
            <h3 className="mt-3 font-display text-2xl font-medium leading-tight sm:text-3xl md:text-5xl">{current.title}</h3>
            {current.text && <p className="mt-3 hidden max-w-md text-sm leading-relaxed text-paper/70 sm:block md:text-base">{current.text}</p>}
          </div>
          <div className="flex items-center justify-between gap-5 md:justify-end">
            <p className="font-display text-lg tabular-nums text-paper/60" aria-live="polite"><span className="text-paper">{pad(active + 1)}</span> / {pad(total)}</p>
            <div className="flex gap-2">
              <button type="button" aria-label="Imagem anterior" onClick={() => go(active - 1)} className="grid size-11 place-items-center border border-paper/30 bg-night/30 backdrop-blur-sm transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-signal"><ArrowLeft className="size-5" /></button>
              <button type="button" aria-label="Próxima imagem" onClick={() => go(active + 1)} className="grid size-11 place-items-center border border-signal bg-signal text-primary-foreground transition-colors hover:bg-transparent hover:text-signal focus-visible:outline-2 focus-visible:outline-signal"><ArrowRight className="size-5" /></button>
            </div>
          </div>
        </div>
      </div>

      <div ref={thumbsRef} className="reveal mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {slides.map((s, i) => (
          <button key={s.src} type="button" aria-label={`Ver ${s.title}`} aria-current={i === active} onClick={() => go(i)} className={`group relative aspect-[16/10] w-24 shrink-0 overflow-hidden bg-concrete transition-all duration-500 md:w-32 ${i === active ? "opacity-100 ring-1 ring-signal ring-offset-2 ring-offset-night" : "opacity-45 hover:opacity-80"}`}>
            <img src={s.src} alt="" loading="lazy" decoding="async" draggable={false} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </button>
        ))}
      </div>
    </div>
  );
}
