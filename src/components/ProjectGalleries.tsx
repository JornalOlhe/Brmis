import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AutoCarousel, type Slide } from "@/components/AutoCarousel";

const obras = import.meta.glob("../assets/projetos/obra-*.webp", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const casa = import.meta.glob("../assets/casa-horizonte/ch-*.webp", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const obra = (n: string) => obras[`../assets/projetos/obra-${n}.webp`] ?? "";
const ch = (n: string) => casa[`../assets/casa-horizonte/ch-${n}.webp`] ?? "";

const projetoSlides: Slide[] = [
  { src: obra("02"), area: "Fachada", title: "Residência com cobertura em madeira" },
  { src: obra("04"), area: "Fachada noturna", title: "Iluminação que valoriza a arquitetura" },
  { src: obra("08"), area: "Fachada", title: "Linhas retas e paisagismo", portrait: true },
  { src: obra("18"), area: "Fachada", title: "Madeira, vidro e jardim" },
  { src: obra("09"), area: "Lazer", title: "Piscina e deck", portrait: true },
  { src: obra("16"), area: "Lazer", title: "Área gourmet e piscina ao entardecer" },
  { src: obra("24"), area: "Lazer", title: "Fachada posterior" },
  { src: obra("10"), area: "Interiores", title: "Living integrado", portrait: true },
  { src: obra("13"), area: "Interiores", title: "Cozinha com ilha", portrait: true },
  { src: obra("12"), area: "Interiores", title: "Escada e circulação", portrait: true },
];

const emObraSlides: Slide[] = [
  { src: obra("27"), area: "Em obra", title: "Fachada em fase final" },
  { src: obra("29"), area: "Em obra", title: "Balanço, pedra e pórtico de entrada" },
  { src: obra("30"), area: "Em obra", title: "Pé-direito duplo e parede em pedra" },
  { src: obra("31"), area: "Em obra", title: "Living e escada em execução" },
  { src: obra("32"), area: "Em obra", title: "Área de lazer com deck e piscina" },
  { src: obra("35"), area: "Em obra", title: "Lavabo em porcelanato", portrait: true },
  { src: obra("36"), area: "Em obra", title: "Banho com luz natural", portrait: true },
  { src: obra("39"), area: "Em obra", title: "Lavabo com cuba de apoio", portrait: true },
];

const casaSlides: Slide[] = [
  { src: ch("01"), area: "Estar", title: "Sala de estar", text: "Revestimento texturizado, escada escultural e iluminação que valoriza cada plano." },
  { src: ch("02"), area: "Estar", title: "Sofá orgânico", text: "Formas curvas e tons claros criam um ambiente acolhedor e atemporal." },
  { src: ch("03"), area: "Integração", title: "Estar e jantar integrados", text: "Vãos amplos conectam a casa ao exterior com continuidade visual." },
  { src: ch("04"), area: "Jantar", title: "Mesa de jantar", text: "Madeira, vidro e pé-direito generoso em um único eixo de convivência." },
  { src: ch("05"), area: "Cozinha", title: "Cozinha e ilha", text: "Bancada em pedra natural e marcenaria precisa, pensadas para o uso diário." },
  { src: ch("06"), area: "Cozinha", title: "Bancada e varanda", text: "Luz natural em toda a extensão, com vista direta para a área externa." },
  { src: ch("07"), area: "Gourmet", title: "Área gourmet", text: "Varanda, piscina e mesa longa para receber com conforto o ano todo." },
  { src: ch("08"), area: "Cozinha", title: "Cozinha integrada", text: "Fluxo contínuo entre preparo, refeição e convivência." },
  { src: ch("09"), area: "Íntimo", title: "Sala íntima", text: "Um canto reservado, com tons terrosos e acabamento limpo." },
  { src: ch("10"), area: "Suítes", title: "Suíte", text: "Cabeceira iluminada, painéis em madeira e bancada de trabalho integrada." },
  { src: ch("11"), area: "Suítes", title: "Suíte com closet", text: "Marcenaria até o teto e circulação organizada." },
  { src: ch("12"), area: "Suítes", title: "Closet", text: "Armários com linhas contínuas e espaço dedicado de apoio." },
  { src: ch("13"), area: "Suítes", title: "Suíte com vista", text: "Cortinas leves e janela ampla enquadrando a paisagem." },
  { src: ch("14"), area: "Banhos", title: "Banheiro", text: "Pedra clara, vidro e metais discretos para um banho sereno." },
  { src: ch("15"), area: "Banhos", title: "Banheiro da suíte", text: "Cuba suspensa, nicho iluminado e acabamentos de alto padrão." },
];

type CategoriaId = "projetos" | "em-obra" | "casa-horizonte";

const categorias: { id: CategoriaId; label: string; carousel: string; slides: Slide[]; altSuffix: string; texto: string }[] = [
  { id: "projetos", label: "Projetos", carousel: "Projetos da BRMIS", slides: projetoSlides, altSuffix: "", texto: "Residências de alto padrão em projeto: fachadas, áreas de lazer e interiores." },
  { id: "em-obra", label: "Em obra", carousel: "Obra em andamento da BRMIS", slides: emObraSlides, altSuffix: "", texto: "Fotos reais do canteiro de uma residência em fase final de obra." },
  { id: "casa-horizonte", label: "Casa Horizonte", carousel: "Ambientes da Casa Horizonte", slides: casaSlides, altSuffix: " — Casa Horizonte", texto: "Residência de alto padrão com interiores em madeira, pedra natural e luz difusa. Conheça os ambientes do projeto que a BRMIS está construindo agora." },
];

export function ProjetosCarousel() {
  const [cat, setCat] = useState<CategoriaId>("projetos");
  const painel = useRef<HTMLDivElement>(null);
  const primeira = useRef(true);
  // O carrossel é remontado a cada categoria: marca os elementos novos como visíveis, já que a seção está na tela.
  useEffect(() => {
    if (primeira.current) { primeira.current = false; return; }
    painel.current?.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }, [cat]);
  const atual = categorias.find((c) => c.id === cat);
  if (!atual) return null;
  const casa = atual.id === "casa-horizonte";

  return (
    <div id="obras" className="mt-16 md:mt-24">
      <div role="tablist" aria-label="Categoria de obras" className="mb-8 flex flex-wrap gap-3">
        {categorias.map((c) => {
          const on = c.id === cat;
          return (
            <button key={c.id} type="button" role="tab" id={`tab-${c.id}`} aria-selected={on} aria-controls="painel-obras" tabIndex={on ? 0 : -1} onClick={() => setCat(c.id)} className={`technical-label inline-flex min-h-11 items-center gap-3 border px-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal ${on ? "border-signal bg-signal text-primary-foreground" : "border-paper/25 text-paper/65 hover:border-paper/60 hover:text-paper"}`}>
              {c.label}<span className="tabular-nums opacity-70">{String(c.slides.length).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>
      <div ref={painel} role="tabpanel" id="painel-obras" aria-labelledby={`tab-${atual.id}`}>
        <div className="mb-8 grid gap-6 md:grid-cols-12 md:items-end">
          <p className="max-w-xl text-sm leading-relaxed text-paper/65 md:col-span-7 md:text-base">{atual.texto}</p>
          {casa && (
            <dl className="grid grid-cols-3 border-t border-paper/15 pt-4 text-xs md:col-span-4 md:col-start-9">
              <div><dt className="technical-label text-paper/40">Tipo</dt><dd className="mt-2 text-paper/85">Residencial</dd></div>
              <div><dt className="technical-label text-paper/40">Ano</dt><dd className="mt-2 text-paper/85">2026</dd></div>
              <div><dt className="technical-label text-paper/40">Status</dt><dd className="mt-2 text-signal">Em obra</dd></div>
            </dl>
          )}
        </div>
        <AutoCarousel key={atual.id} label={atual.carousel} slides={atual.slides} altSuffix={atual.altSuffix} duration={5000} />
        <div className="mt-10 flex flex-col gap-6 border-t border-paper/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {casa && <p className="max-w-md text-xs leading-relaxed text-paper/40">Imagens ilustrativas do projeto de interiores Casa Horizonte, por Mawé Arquitetura.</p>}
          <a href="#contato" className="group inline-flex items-center gap-3 border-b border-signal pb-2 text-sm font-semibold sm:ml-auto">Quero um projeto assim <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></a>
        </div>
      </div>
    </div>
  );
}
