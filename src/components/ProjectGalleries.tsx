import { ArrowRight } from "lucide-react";

import { AutoCarousel, type Slide } from "@/components/AutoCarousel";

const obras = import.meta.glob("../assets/projetos/obra-*.jpg", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const casa = import.meta.glob("../assets/casa-horizonte/ch-*.jpg", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const obra = (n: string) => obras[`../assets/projetos/obra-${n}.jpg`] ?? "";
const ch = (n: string) => casa[`../assets/casa-horizonte/ch-${n}.jpg`] ?? "";

const obraSlides: Slide[] = [
  { src: obra("02"), area: "Fachada", title: "Residência com cobertura em madeira" },
  { src: obra("03"), area: "Fachada", title: "Volumes leves e garagem integrada" },
  { src: obra("04"), area: "Fachada noturna", title: "Iluminação que valoriza a arquitetura" },
  { src: obra("08"), area: "Fachada", title: "Linhas retas e paisagismo", portrait: true },
  { src: obra("09"), area: "Lazer", title: "Piscina e deck", portrait: true },
  { src: obra("10"), area: "Interiores", title: "Living integrado", portrait: true },
  { src: obra("11"), area: "Interiores", title: "Cozinha em tons claros", portrait: true },
  { src: obra("12"), area: "Interiores", title: "Escada e circulação", portrait: true },
  { src: obra("13"), area: "Interiores", title: "Cozinha com ilha", portrait: true },
  { src: obra("14"), area: "Interiores", title: "Sala de estar", portrait: true },
  { src: obra("15"), area: "Interiores", title: "Cozinha e jantar", portrait: true },
  { src: obra("16"), area: "Lazer", title: "Área gourmet e piscina ao entardecer" },
  { src: obra("17"), area: "Fachada", title: "Residência contemporânea" },
  { src: obra("18"), area: "Fachada", title: "Madeira, vidro e jardim" },
  { src: obra("19"), area: "Fachada", title: "Acesso social" },
  { src: obra("20"), area: "Fachada", title: "Detalhe da fachada" },
  { src: obra("21"), area: "Fachada", title: "Garagem coberta" },
  { src: obra("22"), area: "Fachada", title: "Garagem e varanda" },
  { src: obra("23"), area: "Lazer", title: "Piscina e jardim" },
  { src: obra("24"), area: "Lazer", title: "Fachada posterior" },
  { src: obra("25"), area: "Lazer", title: "Área externa" },
  { src: obra("26"), area: "Fachada", title: "Vista lateral" },
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

export function ObrasCarousel() {
  return (
    <div className="mt-16 md:mt-24">
      <AutoCarousel id="obras" label="Projetos e obras da BRMIS" slides={obraSlides} duration={5000} />
    </div>
  );
}

export function CasaHorizonteSection() {
  return (
    <section id="casa-horizonte" aria-labelledby="casa-horizonte-title" className="bg-night pb-24 text-paper md:pb-36">
      <div className="section-shell">
        <div className="reveal grid gap-8 border-t border-paper/20 pt-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="technical-label text-signal">Projeto em destaque</p>
            <h2 id="casa-horizonte-title" className="mt-6 font-display text-4xl font-medium leading-[1.02] md:text-6xl">Conheça um de nossos projetos.</h2>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <p className="font-display text-2xl font-medium">Casa Horizonte</p>
            <p className="mt-2 text-sm leading-relaxed text-paper/60">Residência de alto padrão com interiores em madeira, pedra natural e luz difusa.</p>
          </div>
        </div>
        <div className="mt-10 md:mt-14">
          <AutoCarousel label="Ambientes da Casa Horizonte" slides={casaSlides} altSuffix=" — Casa Horizonte" />
        </div>
        <div className="reveal mt-10 flex flex-col gap-6 border-t border-paper/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs leading-relaxed text-paper/40">Imagens ilustrativas do projeto de interiores Casa Horizonte, por Mawé Arquitetura.</p>
          <a href="#contato" className="group inline-flex items-center gap-3 border-b border-signal pb-2 text-sm font-semibold">Quero um projeto assim <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></a>
        </div>
      </div>
    </section>
  );
}
