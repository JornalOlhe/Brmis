import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { AutoCarousel, type Slide } from "@/components/AutoCarousel";

// Every photo is 1920×1200 (16:10) with a 400×250 thumbnail of the same name under thumbs/.
const glob = {
  obras: import.meta.glob("../assets/projetos/obra-*.webp", {
    eager: true,
    query: "?url",
    import: "default",
  }) as Record<string, string>,
  obrasThumbs: import.meta.glob("../assets/projetos/thumbs/obra-*.webp", {
    eager: true,
    query: "?url",
    import: "default",
  }) as Record<string, string>,
  casa: import.meta.glob("../assets/casa-horizonte/ch-*.webp", {
    eager: true,
    query: "?url",
    import: "default",
  }) as Record<string, string>,
  casaThumbs: import.meta.glob("../assets/casa-horizonte/thumbs/ch-*.webp", {
    eager: true,
    query: "?url",
    import: "default",
  }) as Record<string, string>,
};
const obra = (n: string) => ({
  src: glob.obras[`../assets/projetos/obra-${n}.webp`] ?? "",
  thumb: glob.obrasThumbs[`../assets/projetos/thumbs/obra-${n}.webp`] ?? "",
});
const ch = (n: string) => ({
  src: glob.casa[`../assets/casa-horizonte/ch-${n}.webp`] ?? "",
  thumb: glob.casaThumbs[`../assets/casa-horizonte/thumbs/ch-${n}.webp`] ?? "",
});

const projetoSlides: Slide[] = [
  {
    ...obra("02"),
    area: "Fachada",
    title: "Residência com cobertura em madeira",
  },
  {
    ...obra("04"),
    area: "Fachada noturna",
    title: "Iluminação que valoriza a arquitetura",
  },
  {
    ...obra("08"),
    area: "Fachada",
    title: "Linhas retas e paisagismo",
  },
  { ...obra("18"), area: "Fachada", title: "Madeira, vidro e jardim" },
  { ...obra("09"), area: "Lazer", title: "Piscina e deck" },
  {
    ...obra("16"),
    area: "Lazer",
    title: "Área gourmet e piscina ao entardecer",
  },
  { ...obra("24"), area: "Lazer", title: "Fachada posterior" },
  {
    ...obra("10"),
    area: "Interiores",
    title: "Living integrado",
  },
  {
    ...obra("13"),
    area: "Interiores",
    title: "Cozinha com ilha",
  },
  {
    ...obra("12"),
    area: "Interiores",
    title: "Escada e circulação",
  },
];

const emObraSlides: Slide[] = [
  { ...obra("27"), area: "Em obra", title: "Fachada em fase final" },
  {
    ...obra("29"),
    area: "Em obra",
    title: "Balanço, pedra e pórtico de entrada",
  },
  {
    ...obra("30"),
    area: "Em obra",
    title: "Pé-direito duplo e parede em pedra",
  },
  { ...obra("31"), area: "Em obra", title: "Living e escada em execução" },
  {
    ...obra("32"),
    area: "Em obra",
    title: "Área de lazer com deck e piscina",
  },
  {
    ...obra("35"),
    area: "Em obra",
    title: "Lavabo em porcelanato",
  },
  {
    ...obra("36"),
    area: "Em obra",
    title: "Banho com luz natural",
  },
  {
    ...obra("39"),
    area: "Em obra",
    title: "Lavabo com cuba de apoio",
  },
];

const casaSlides: Slide[] = [
  {
    ...ch("01"),
    area: "Estar",
    title: "Sala de estar",
    text: "Revestimento texturizado, escada escultural e iluminação que valoriza cada plano.",
  },
  {
    ...ch("02"),
    area: "Estar",
    title: "Sofá orgânico",
    text: "Formas curvas e tons claros criam um ambiente acolhedor e atemporal.",
  },
  {
    ...ch("03"),
    area: "Integração",
    title: "Estar e jantar integrados",
    text: "Vãos amplos conectam a casa ao exterior com continuidade visual.",
  },
  {
    ...ch("04"),
    area: "Jantar",
    title: "Mesa de jantar",
    text: "Madeira, vidro e pé-direito generoso em um único eixo de convivência.",
  },
  {
    ...ch("05"),
    area: "Cozinha",
    title: "Cozinha e ilha",
    text: "Bancada em pedra natural e marcenaria precisa, pensadas para o uso diário.",
  },
  {
    ...ch("06"),
    area: "Cozinha",
    title: "Bancada e varanda",
    text: "Luz natural em toda a extensão, com vista direta para a área externa.",
  },
  {
    ...ch("07"),
    area: "Gourmet",
    title: "Área gourmet",
    text: "Varanda, piscina e mesa longa para receber com conforto o ano todo.",
  },
  {
    ...ch("08"),
    area: "Cozinha",
    title: "Cozinha integrada",
    text: "Fluxo contínuo entre preparo, refeição e convivência.",
  },
  {
    ...ch("09"),
    area: "Íntimo",
    title: "Sala íntima",
    text: "Um canto reservado, com tons terrosos e acabamento limpo.",
  },
  {
    ...ch("10"),
    area: "Suítes",
    title: "Suíte",
    text: "Cabeceira iluminada, painéis em madeira e bancada de trabalho integrada.",
  },
  {
    ...ch("11"),
    area: "Suítes",
    title: "Suíte com closet",
    text: "Marcenaria até o teto e circulação organizada.",
  },
  {
    ...ch("12"),
    area: "Suítes",
    title: "Closet",
    text: "Armários com linhas contínuas e espaço dedicado de apoio.",
  },
  {
    ...ch("13"),
    area: "Suítes",
    title: "Suíte com vista",
    text: "Cortinas leves e janela ampla enquadrando a paisagem.",
  },
  {
    ...ch("14"),
    area: "Banhos",
    title: "Banheiro",
    text: "Pedra clara, vidro e metais discretos para um banho sereno.",
  },
  {
    ...ch("15"),
    area: "Banhos",
    title: "Banheiro da suíte",
    text: "Cuba suspensa, nicho iluminado e acabamentos de alto padrão.",
  },
];

type CategoriaId = "projetos" | "em-obra" | "casa-horizonte";

type Categoria = {
  id: CategoriaId;
  label: string;
  carousel: string;
  slides: Slide[];
  altSuffix: string;
  texto: string;
};

const categorias: Categoria[] = [
  {
    id: "projetos",
    label: "Projetos",
    carousel: "Projetos da BRMIS",
    slides: projetoSlides,
    altSuffix: "",
    texto:
      "Residências de alto padrão em projeto: fachadas, áreas de lazer e interiores.",
  },
  {
    id: "em-obra",
    label: "Em obra",
    carousel: "Obra em andamento da BRMIS",
    slides: emObraSlides,
    altSuffix: "",
    texto: "Fotos reais do canteiro de uma residência em fase final de obra.",
  },
  {
    id: "casa-horizonte",
    label: "Casa Horizonte",
    carousel: "Ambientes da Casa Horizonte",
    slides: casaSlides,
    altSuffix: " — Casa Horizonte",
    texto:
      "Residência de alto padrão com interiores em madeira, pedra natural e luz difusa. Conheça os ambientes do projeto que a BRMIS está construindo agora.",
  },
];

export function ProjetosCarousel() {
  const [cat, setCat] = useState<CategoriaId>("projetos");
  const [pill, setPill] = useState({ x: 0, w: 0, ready: false });
  const listRef = useRef<HTMLDivElement>(null);

  // The highlight slides to whichever category is selected.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const tab = list.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!tab) return;
      setPill({ x: tab.offsetLeft, w: tab.offsetWidth, ready: true });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [cat]);

  const onKeyDown = (e: KeyboardEvent) => {
    const index = categorias.findIndex((c) => c.id === cat);
    const last = categorias.length - 1;
    const target =
      e.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : e.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : -1;
    const destino = categorias[target];
    if (!destino) return;
    e.preventDefault();
    setCat(destino.id);
    requestAnimationFrame(() =>
      document.getElementById(`tab-${destino.id}`)?.focus(),
    );
  };

  const atual = categorias.find((c) => c.id === cat);
  if (!atual) return null;
  const casa = atual.id === "casa-horizonte";

  return (
    <div id="obras" className="mt-14 md:mt-20">
      <div className="reveal">
        <div
          ref={listRef}
          role="tablist"
          aria-label="Categoria de obras"
          onKeyDown={onKeyDown}
          className="relative flex border border-paper/20 p-1 sm:inline-flex"
        >
          <span
            aria-hidden
            className={`absolute inset-y-1 left-0 bg-signal transition-[transform,width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${pill.ready ? "opacity-100" : "opacity-0"}`}
            style={{ width: pill.w, transform: `translate3d(${pill.x}px,0,0)` }}
          />
          {categorias.map((c) => {
            const on = c.id === cat;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                id={`tab-${c.id}`}
                aria-selected={on}
                aria-controls="painel-obras"
                tabIndex={on ? 0 : -1}
                onClick={() => setCat(c.id)}
                className={`technical-label relative inline-flex min-h-11 flex-auto items-center justify-center gap-2.5 whitespace-nowrap px-2 text-[0.625rem] tracking-[0.12em] transition-colors duration-300 sm:px-4 sm:text-[0.6875rem] sm:tracking-[0.16em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal md:px-6 ${on ? "text-primary-foreground" : "text-paper/60 hover:text-paper"}`}
              >
                {c.label}
                <span className="hidden tabular-nums opacity-60 sm:inline">
                  {String(c.slides.length).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        role="tabpanel"
        id="painel-obras"
        aria-labelledby={`tab-${atual.id}`}
        className="mt-8"
      >
        <div key={atual.id} className="panel-in">
          <div className="mb-8 grid gap-6 md:grid-cols-12 md:items-end">
            <p className="max-w-xl text-sm leading-relaxed text-paper/65 md:col-span-7 md:text-base">
              {atual.texto}
            </p>
            {casa && (
              <dl className="grid grid-cols-3 border-t border-paper/15 pt-4 text-xs md:col-span-4 md:col-start-9">
                <div>
                  <dt className="technical-label text-paper/40">Tipo</dt>
                  <dd className="mt-2 text-paper/85">Residencial</dd>
                </div>
                <div>
                  <dt className="technical-label text-paper/40">Ano</dt>
                  <dd className="mt-2 text-paper/85">2026</dd>
                </div>
                <div>
                  <dt className="technical-label text-paper/40">Status</dt>
                  <dd className="mt-2 text-signal">Em obra</dd>
                </div>
              </dl>
            )}
          </div>
          <AutoCarousel
            label={atual.carousel}
            slides={atual.slides}
            altSuffix={atual.altSuffix}
            duration={5000}
          />
          <div className="mt-10 flex flex-col gap-6 border-t border-paper/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {casa && (
              <p className="max-w-md text-xs leading-relaxed text-paper/40">
                Imagens ilustrativas do projeto de interiores Casa Horizonte,
                por Mawé Arquitetura.
              </p>
            )}
            <a
              href="#contato"
              className="group inline-flex items-center gap-3 border-b border-signal pb-2 text-sm font-semibold sm:ml-auto"
            >
              Quero um projeto assim
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
