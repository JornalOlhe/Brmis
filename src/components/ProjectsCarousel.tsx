import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import projectResidential from "@/assets/brmis-project-residencial.jpg";
import projectInteriors from "@/assets/brmis-project-interiores.jpg";
import projectExecution from "@/assets/brmis-project-execucao.jpg";

const items = [
  { number: "01", title: "Arquitetura residencial", category: "Construção de alto padrão", text: "Residências executadas com rigor técnico, do canteiro ao último acabamento, respeitando a intenção do projeto.", image: projectResidential, width: 1408, height: 1760 },
  { number: "02", title: "Interiores e acabamento", category: "Precisão em cada encontro", text: "Marcenaria, revestimentos e detalhes resolvidos com cuidado para que cada ambiente funcione e permaneça.", image: projectInteriors, width: 1600, height: 1200 },
  { number: "03", title: "Execução e gestão", category: "Canteiro organizado, obra controlada", text: "Cronograma, fornecedores e equipes coordenados com presença técnica e comunicação clara do início ao fim.", image: projectExecution, width: 1408, height: 1760 },
] as const;

const pad = (n: number) => String(n).padStart(2, "0");
const DURATION = 5000;

export function ProjectsCarousel() {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerX = useRef<number | null>(null);
  const go = (i: number) => setActive((i + items.length) % items.length);
  const running = inView;

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), { threshold: 0.3 });
    observer.observe(node);
    const onVisibility = () => { if (document.visibilityState !== "visible") setInView(false); else { const r = node.getBoundingClientRect(); setInView(r.top < window.innerHeight && r.bottom > 0); } };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);
  const current = items[active] ?? items[0];

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

  return (
    <div ref={rootRef} className="reveal mt-16 grid gap-8 md:mt-24 lg:grid-cols-12 lg:gap-12">
      <div
        role="region"
        aria-roledescription="carrossel"
        aria-label="Frentes de atuação da BRMIS"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { pointerX.current = null; }}
        className="relative aspect-[4/5] touch-pan-y select-none overflow-hidden bg-concrete outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal sm:aspect-[4/3] lg:col-span-8"
      >
        {items.map((item, i) => (
          <img key={item.number} src={item.image} alt={i === active ? `${item.title} — imagem conceitual de referência` : ""} aria-hidden={i !== active} width={item.width} height={item.height} loading={i === 0 ? "eager" : "lazy"} decoding="async" draggable={false} className={`image-cinematic absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[900ms] ease-out ${i === active ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"}`} />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-[2] h-[2px] bg-paper/20"><div key={active} className="ch-progress h-full origin-left bg-signal" style={{ animationDuration: `${DURATION}ms`, animationPlayState: running ? "running" : "paused" }} onAnimationEnd={() => go(active + 1)} /></div>
        <div key={current.number} className="absolute inset-x-0 bottom-0 p-5 duration-700 animate-in fade-in slide-in-from-bottom-3 md:p-8">
          <p className="technical-label text-signal">{current.number} / Atuação</p>
          <h3 className="mt-3 font-display text-3xl font-medium md:text-4xl">{current.title}</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-paper/70 md:text-base">{current.text}</p>
        </div>
      </div>

      <div className="flex flex-col lg:col-span-4">
        <ol className="border-t border-paper/20">
          {items.map((item, i) => (
            <li key={item.number}>
              <button type="button" aria-current={i === active} onClick={() => go(i)} className={`group relative flex w-full items-start gap-5 border-b border-paper/20 py-6 text-left transition-colors ${i === active ? "text-paper" : "text-paper/45 hover:text-paper/80"}`}>
                <span className={`absolute left-0 top-0 h-full w-[2px] origin-top bg-signal transition-transform duration-500 ${i === active ? "scale-y-100" : "scale-y-0"}`} />
                <span className="technical-label mt-1.5 pl-4 text-signal">{item.number}</span>
                <span className="flex-1">
                  <span className="block font-display text-xl font-medium md:text-2xl">{item.title}</span>
                  <span className="mt-1 block text-sm text-paper/50">{item.category}</span>
                </span>
                <ArrowRight className={`mt-1.5 size-5 shrink-0 transition-all duration-300 ${i === active ? "translate-x-0 text-signal opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"}`} />
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex items-center justify-between lg:mt-auto lg:pt-8">
          <p className="font-display text-lg tabular-nums text-paper/50" aria-live="polite"><span className="text-paper">{pad(active + 1)}</span> / {pad(items.length)}</p>
          <div className="flex gap-2">
            <button type="button" aria-label="Frente anterior" onClick={() => go(active - 1)} className="grid size-11 place-items-center border border-paper/30 transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-signal"><ArrowLeft className="size-5" /></button>
            <button type="button" aria-label="Próxima frente" onClick={() => go(active + 1)} className="grid size-11 place-items-center border border-signal bg-signal text-primary-foreground transition-colors hover:bg-transparent hover:text-signal focus-visible:outline-2 focus-visible:outline-signal"><ArrowRight className="size-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
