import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

const modules = import.meta.glob("../assets/casa-horizonte/ch-*.jpg", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const src = (n: string) => modules[`../assets/casa-horizonte/ch-${n}.jpg`] ?? "";

const slides = [
  { id: "01", area: "Estar", title: "Sala de estar", text: "Revestimento texturizado, escada escultural e iluminação que valoriza cada plano." },
  { id: "02", area: "Estar", title: "Sofá orgânico", text: "Formas curvas e tons claros criam um ambiente acolhedor e atemporal." },
  { id: "03", area: "Integração", title: "Estar e jantar integrados", text: "Vãos amplos conectam a casa ao exterior com continuidade visual." },
  { id: "04", area: "Jantar", title: "Mesa de jantar", text: "Madeira, vidro e pé-direito generoso em um único eixo de convivência." },
  { id: "05", area: "Cozinha", title: "Cozinha e ilha", text: "Bancada em pedra natural e marcenaria precisa, pensadas para o uso diário." },
  { id: "06", area: "Cozinha", title: "Bancada e varanda", text: "Luz natural em toda a extensão, com vista direta para a área externa." },
  { id: "07", area: "Gourmet", title: "Área gourmet", text: "Varanda, piscina e mesa longa para receber com conforto o ano todo." },
  { id: "08", area: "Cozinha", title: "Cozinha integrada", text: "Fluxo contínuo entre preparo, refeição e convivência." },
  { id: "09", area: "Íntimo", title: "Sala íntima", text: "Um canto reservado, com tons terrosos e acabamento limpo." },
  { id: "10", area: "Suítes", title: "Suíte", text: "Cabeceira iluminada, painéis em madeira e bancada de trabalho integrada." },
  { id: "11", area: "Suítes", title: "Suíte com closet", text: "Marcenaria até o teto e circulação organizada." },
  { id: "12", area: "Suítes", title: "Closet", text: "Armários com linhas contínuas e espaço dedicado de apoio." },
  { id: "13", area: "Suítes", title: "Suíte com vista", text: "Cortinas leves e janela ampla enquadrando a paisagem." },
  { id: "14", area: "Banhos", title: "Banheiro", text: "Pedra clara, vidro e metais discretos para um banho sereno." },
  { id: "15", area: "Banhos", title: "Banheiro da suíte", text: "Cuba suspensa, nicho iluminado e acabamentos de alto padrão." },
] as const;

const DURATION = 5500;
const total = slides.length;
const pad = (n: number) => String(n).padStart(2, "0");
const wrap = (i: number) => (i + total) % total;

export function CasaHorizonteCarousel() {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0, 1, total - 1]));
  const sectionRef = useRef<HTMLElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const pointerX = useRef<number | null>(null);

  const go = useCallback((i: number) => setActive(wrap(i)), []);
  const running = inView;

  useEffect(() => {
    setLoaded((prev) => {
      const next = new Set(prev);
      [active, wrap(active + 1), wrap(active - 1)].forEach((i) => next.add(i));
      return next.size === prev.size ? prev : next;
    });
    const thumbs = thumbsRef.current;
    const thumb = thumbs?.children[active] as HTMLElement | undefined;
    if (thumbs && thumb) thumbs.scrollTo({ left: thumb.offsetLeft - thumbs.clientWidth / 2 + thumb.offsetWidth / 2, behavior: "smooth" });
  }, [active]);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), { threshold: 0.2 });
    observer.observe(node);
    const onVisibility = () => setInView(document.visibilityState === "visible" && node.getBoundingClientRect().top < window.innerHeight);
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

  return (
    <section ref={sectionRef} id="casa-horizonte" aria-labelledby="casa-horizonte-title" className="bg-night pb-24 text-paper md:pb-36">
      <div className="section-shell">
        <div className="reveal grid gap-8 border-t border-paper/20 pt-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="technical-label text-signal">Projeto em destaque</p>
            <h2 id="casa-horizonte-title" className="mt-6 font-display text-4xl font-medium leading-[1.02] md:text-6xl">Conheça um de nossos projetos.</h2>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <p className="font-display text-2xl font-medium">Casa Horizonte</p>
            <p className="mt-2 text-sm leading-relaxed text-paper/60">Residência de alto padrão com interiores em madeira, pedra natural e luz difusa. Percorra os ambientes do projeto.</p>
          </div>
        </div>

        <div
          role="region"
          aria-roledescription="carrossel"
          aria-label="Ambientes da Casa Horizonte"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { pointerX.current = null; }}
          className="reveal relative mt-12 aspect-[4/5] touch-pan-y select-none overflow-hidden bg-concrete outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal sm:aspect-[16/10] md:mt-16 lg:aspect-[2/1]"
        >
          {slides.map((s, i) => {
            const isActive = i === active;
            return (
              <div key={s.id} aria-hidden={!isActive} className={`absolute inset-0 transition-opacity duration-[1100ms] ease-out ${isActive ? "z-[1] opacity-100" : "z-0 opacity-0"}`}>
                {loaded.has(i) && <img src={src(s.id)} alt={isActive ? `${s.title} — Casa Horizonte` : ""} width={1800} height={900} decoding="async" draggable={false} className={`size-full object-cover ${isActive ? "ch-kenburns" : ""}`} style={{ animationPlayState: running ? "running" : "paused" }} />}
              </div>
            );
          })}

          <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-night/85 via-night/10 to-night/30" />

          <div className="absolute inset-x-0 top-0 z-[3] flex gap-1.5 p-4 md:p-6">
            {slides.map((s, i) => (
              <button key={s.id} type="button" aria-label={`Ir para ${s.title}`} onClick={() => go(i)} className="group h-6 flex-1 cursor-pointer py-2.5">
                <span className="block h-[2px] overflow-hidden bg-paper/25 transition-colors group-hover:bg-paper/45">
                  {i < active && <span className="block h-full w-full bg-paper" />}
                  {i === active && <span key={active} className="ch-progress block h-full w-full origin-left bg-signal" style={{ animationDuration: `${DURATION}ms`, animationPlayState: running ? "running" : "paused" }} onAnimationEnd={() => go(active + 1)} />}
                </span>
              </button>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-[3] flex flex-col gap-6 p-5 md:flex-row md:items-end md:justify-between md:p-10">
            <div key={current.id} className="max-w-xl duration-700 animate-in fade-in slide-in-from-bottom-3">
              <p className="technical-label flex items-center gap-3 text-paper/75"><span className="h-px w-8 bg-signal" />{current.area}</p>
              <h3 className="mt-4 font-display text-3xl font-medium leading-tight md:text-5xl">{current.title}</h3>
              <p className="mt-3 hidden max-w-md text-sm leading-relaxed text-paper/70 sm:block md:text-base">{current.text}</p>
            </div>
            <div className="flex items-center justify-between gap-5 md:justify-end">
              <p className="font-display text-lg tabular-nums text-paper/60" aria-live="polite"><span className="text-paper">{pad(active + 1)}</span> / {pad(total)}</p>
              <div className="flex gap-2">
                <button type="button" aria-label="Ambiente anterior" onClick={() => go(active - 1)} className="grid size-11 place-items-center border border-paper/30 bg-night/30 backdrop-blur-sm transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-signal"><ArrowLeft className="size-5" /></button>
                <button type="button" aria-label="Próximo ambiente" onClick={() => go(active + 1)} className="grid size-11 place-items-center border border-signal bg-signal text-primary-foreground transition-colors hover:bg-transparent hover:text-signal focus-visible:outline-2 focus-visible:outline-signal"><ArrowRight className="size-5" /></button>
              </div>
            </div>
          </div>
        </div>

        <div ref={thumbsRef} className="reveal mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {slides.map((s, i) => (
            <button key={s.id} type="button" aria-label={`Ver ${s.title}`} aria-current={i === active} onClick={() => go(i)} className={`group relative aspect-[16/10] w-28 shrink-0 overflow-hidden bg-concrete transition-all duration-500 md:w-36 ${i === active ? "opacity-100 ring-1 ring-signal ring-offset-2 ring-offset-night" : "opacity-45 hover:opacity-80"}`}>
              <img src={src(s.id)} alt="" loading="lazy" decoding="async" draggable={false} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="technical-label absolute bottom-1.5 left-2 text-[0.6rem] text-paper drop-shadow">{s.id}</span>
            </button>
          ))}
        </div>

        <div className="reveal mt-10 flex flex-col gap-6 border-t border-paper/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs leading-relaxed text-paper/40">Imagens ilustrativas do projeto de interiores Casa Horizonte, por Mawé Arquitetura.</p>
          <a href="#contato" className="group inline-flex items-center gap-3 border-b border-signal pb-2 text-sm font-semibold">Quero um projeto assim <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></a>
        </div>
      </div>
    </section>
  );
}
