import { useEffect, useRef, useState, type CSSProperties } from "react";

import { clamp, onScrollFrame } from "@/lib/motion";

const steps = [
  {
    n: "01",
    title: "Entender",
    text: "Escutamos necessidades, prioridades e limites para definir o caminho certo antes de avançar.",
  },
  {
    n: "02",
    title: "Planejar",
    text: "Compatibilizamos escopo, etapas, recursos e decisões para reduzir desvios durante a obra.",
  },
  {
    n: "03",
    title: "Executar",
    text: "Coordenamos equipes, materiais e cronograma com presença técnica e controle contínuo.",
  },
  {
    n: "04",
    title: "Entregar",
    text: "Revisamos cada detalhe e concluímos a obra com organização, transparência e responsabilidade.",
  },
];

/** The four stages of a build. The rail fills and each stage lights up as the reader scrolls through. */
export function MethodSteps() {
  const listRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    return onScrollFrame(() => {
      const line = window.innerHeight * 0.62;
      const rect = list.getBoundingClientRect();
      list.style.setProperty(
        "--p",
        clamp((line - rect.top) / rect.height).toFixed(3),
      );
      let reached = 0;
      Array.from(list.querySelectorAll("li")).forEach((item, i) => {
        if (item.getBoundingClientRect().top < line) reached = i;
      });
      setActive(reached);
    });
  }, []);

  return (
    <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12">
      <div className="hidden md:col-span-4 md:block">
        <div className="sticky top-32">
          <p className="technical-label text-muted-foreground">Etapa</p>
          <div className="mt-5 flex items-baseline gap-4 font-display font-medium">
            <div
              aria-hidden
              className="method-roller text-[clamp(7rem,13vw,12rem)] tabular-nums tracking-[-0.04em]"
              style={{ "--step": active } as CSSProperties}
            >
              <span>
                {steps.map((step) => (
                  <span key={step.n}>{step.n}</span>
                ))}
              </span>
            </div>
            <span className="text-2xl text-muted-foreground">/ 04</span>
          </div>
        </div>
      </div>

      <div ref={listRef} className="relative md:col-span-7 md:col-start-6">
        <span aria-hidden className="method-rail" />
        <ol>
          {steps.map((step, i) => (
            <li
              key={step.n}
              data-on={i <= active}
              className="method-step relative py-9 pl-8 md:py-14 md:pl-14"
            >
              <span aria-hidden className="method-dot top-9 md:top-14" />
              <p className="technical-label text-signal">{step.n}</p>
              <h3 className="mt-4 font-display text-3xl font-medium md:text-5xl">
                {step.title}
              </h3>
              <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground md:text-lg">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
