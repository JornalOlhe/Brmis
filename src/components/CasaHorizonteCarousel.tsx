import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const pad = (n: number) => String(n).padStart(2, "0");

export function CasaHorizonteCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [height, setHeight] = useState<number | undefined>();

  const geo = useRef({ travel: 0, top: 0, vw: 1, centers: [] as number[], widths: [] as number[] });
  const st = useRef({ target: 0, current: 0, raf: 0, reduced: false, active: 0 });

  const frame = useCallback(() => {
    const s = st.current;
    const g = geo.current;
    const diff = s.target - s.current;
    s.current = s.reduced || Math.abs(diff) < 0.00015 ? s.target : s.current + diff * 0.11;
    const x = s.current * g.travel;
    if (trackRef.current) trackRef.current.style.transform = `translate3d(${-x}px,0,0)`;
    if (barRef.current) barRef.current.style.transform = `scaleX(${s.current})`;
    if (ghostRef.current) ghostRef.current.style.transform = `translate3d(${-x * 0.35}px,0,0)`;

    let best = 0;
    let bestDist = Infinity;
    g.centers.forEach((c, i) => {
      const d = (c - x - g.vw / 2) / g.vw;
      const ad = Math.abs(d);
      if (ad < bestDist) { bestDist = ad; best = i; }
      const slide = slideRefs.current[i];
      const img = imgRefs.current[i];
      if (!slide || !img) return;
      if (s.reduced) { slide.style.transform = ""; slide.style.opacity = "1"; img.style.transform = ""; return; }
      const t = clamp(1 - ad / 0.75, 0, 1);
      slide.style.transform = `scale(${0.88 + 0.12 * t})`;
      slide.style.opacity = String(0.35 + 0.65 * t);
      const limit = (g.widths[i] ?? 800) * 0.11;
      img.style.transform = `translate3d(${clamp(-d * 140, -limit, limit)}px,0,0)`;
    });
    if (best !== s.active) { s.active = best; setActive(best); }
    s.raf = s.current === s.target ? 0 : requestAnimationFrame(frame);
  }, []);

  const kick = useCallback(() => { if (!st.current.raf) st.current.raf = requestAnimationFrame(frame); }, [frame]);

  const readTarget = useCallback(() => {
    const g = geo.current;
    st.current.target = g.travel > 0 ? clamp((window.scrollY - g.top) / g.travel, 0, 1) : 0;
    kick();
  }, [kick]);

  const measure = useCallback(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const g = geo.current;
    g.vw = window.innerWidth;
    g.travel = Math.max(0, track.scrollWidth - g.vw);
    g.top = section.getBoundingClientRect().top + window.scrollY;
    g.centers = slideRefs.current.map((el) => (el ? el.offsetLeft + el.offsetWidth / 2 : 0));
    g.widths = slideRefs.current.map((el) => el?.offsetWidth ?? 800);
    setHeight(window.innerHeight + g.travel);
    readTarget();
  }, [readTarget]);

  useEffect(() => {
    const state = st.current;
    state.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    measure();
    const t = window.setTimeout(measure, 400);
    const remeasure = () => measure();
    window.addEventListener("resize", remeasure);
    window.addEventListener("load", remeasure);
    window.addEventListener("scroll", readTarget, { passive: true });
    document.fonts?.ready.then(remeasure).catch(() => undefined);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("load", remeasure);
      window.removeEventListener("scroll", readTarget);
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    };
  }, [measure, readTarget]);

  const goTo = (index: number) => {
    const g = geo.current;
    const i = clamp(index, 0, slides.length - 1);
    const x = clamp((g.centers[i] ?? 0) - g.vw / 2, 0, g.travel);
    window.scrollTo({ top: g.top + x, behavior: st.current.reduced ? "auto" : "smooth" });
  };

  const current = slides[active] ?? slides[0];

  return (
    <section
      ref={sectionRef}
      id="casa-horizonte"
      aria-roledescription="carrossel"
      aria-label="Casa Horizonte — galeria do projeto"
      style={{ height: height ?? "420svh" }}
      className="relative bg-night text-paper"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="pointer-events-none absolute inset-0 architectural-grid opacity-[0.14]" />
        <div ref={ghostRef} aria-hidden className="pointer-events-none absolute left-[4vw] top-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[clamp(9rem,30vw,26rem)] font-bold leading-none tracking-tight text-paper/[0.045] will-change-transform">HORIZONTE</div>

        <div ref={trackRef} className="absolute left-0 top-0 flex h-full w-max items-center gap-[5vw] pb-28 pl-[6vw] pr-[6vw] pt-24 will-change-transform">
          <div className="w-[min(88vw,44rem)] shrink-0">
            <div className="technical-label mb-6 flex items-center gap-4 text-paper/70"><span className="h-px w-12 bg-signal" /> Projeto em destaque</div>
            <h2 className="font-display text-[clamp(2.6rem,7vw,6rem)] font-medium leading-[0.98]">Conheça um de <span className="text-signal">nossos projetos</span></h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-paper/70 md:text-lg"><strong className="font-semibold text-paper">Casa Horizonte</strong> — projeto de interiores, 2026. Role a página para percorrer os ambientes.</p>
            <div className="technical-label mt-10 flex items-center gap-3 text-paper/55">Role para explorar <ArrowRight className="size-4 animate-pulse text-signal" /></div>
          </div>

          {slides.map((s, i) => (
            <figure key={s.id} ref={(el) => { slideRefs.current[i] = el; }} className="flex h-[clamp(15rem,58svh,40rem)] w-[min(82vw,calc(58svh*1.6))] shrink-0 flex-col will-change-transform" style={{ transformOrigin: "center" }}>
              <div className="relative min-h-0 flex-1 overflow-hidden bg-concrete">
                <img ref={(el) => { imgRefs.current[i] = el; }} src={src(s.id)} alt={`${s.title} — Casa Horizonte`} width={1800} height={900} loading={i < 3 ? "eager" : "lazy"} decoding="async" draggable={false} className="absolute -left-[12%] top-0 h-full w-[124%] max-w-none object-cover will-change-transform" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/45 via-transparent to-transparent" />
                <span className="technical-label absolute left-4 top-4 bg-night/70 px-3 py-2 text-paper backdrop-blur-sm">{s.area}</span>
              </div>
              <figcaption className="flex items-start justify-between gap-6 border-t border-paper/25 pt-4">
                <div><h3 className="font-display text-lg font-medium md:text-2xl">{s.title}</h3><p className="mt-1 hidden max-w-md text-sm leading-relaxed text-paper/55 md:block">{s.text}</p></div>
                <span className="technical-label mt-1 text-signal">{s.id}</span>
              </figcaption>
            </figure>
          ))}

          <div className="w-[min(88vw,32rem)] shrink-0">
            <p className="technical-label text-signal">Próximo projeto</p>
            <h3 className="mt-5 font-display text-4xl font-medium leading-tight md:text-6xl">Seu projeto pode ser o próximo.</h3>
            <a href="#contato" className="group mt-9 inline-flex min-h-12 items-center gap-3 border border-signal bg-signal px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-transparent hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal">Solicitar projeto <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></a>
            <p className="mt-10 max-w-xs text-xs leading-relaxed text-paper/40">Imagens ilustrativas do projeto de interiores Casa Horizonte, por Mawé Arquitetura.</p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-night via-night/80 to-transparent pb-6 pt-12">
          <div className="section-shell flex items-end justify-between gap-6">
            <div className="flex items-end gap-5">
              <div className="font-display text-5xl font-medium leading-none tabular-nums md:text-7xl" aria-live="polite"><span className="text-signal">{pad(active + 1)}</span><span className="text-xl text-paper/35 md:text-2xl"> / {pad(slides.length)}</span></div>
              <div key={current.id} className="technical-label hidden pb-2 text-paper/70 duration-500 animate-in fade-in slide-in-from-bottom-2 sm:block">{current.area} · {current.title}</div>
            </div>
            <div className="flex gap-2">
              <button type="button" aria-label="Ambiente anterior" onClick={() => goTo(active - 1)} disabled={active === 0} className="grid size-12 place-items-center border border-paper/30 transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-signal disabled:opacity-30 disabled:hover:border-paper/30 disabled:hover:text-paper"><ArrowLeft className="size-5" /></button>
              <button type="button" aria-label="Próximo ambiente" onClick={() => goTo(active + 1)} disabled={active === slides.length - 1} className="grid size-12 place-items-center border border-paper/30 transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-signal disabled:opacity-30 disabled:hover:border-paper/30 disabled:hover:text-paper"><ArrowRight className="size-5" /></button>
            </div>
          </div>
          <div className="section-shell mt-5"><div className="h-px bg-paper/20"><div ref={barRef} className="h-full origin-left bg-signal" style={{ transform: "scaleX(0)" }} /></div></div>
        </div>
      </div>
    </section>
  );
}
