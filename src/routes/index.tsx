import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowRight, Check, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type ButtonHTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import heroImage from "@/assets/brmis-hero.jpg";
import projectResidential from "@/assets/brmis-project-residencial.jpg";
import projectInteriors from "@/assets/brmis-project-interiores.jpg";
import projectExecution from "@/assets/brmis-project-execucao.jpg";

const description = "Há mais de 15 anos, a BRMIS transforma projetos em obras de alto padrão com planejamento, gestão técnica e excelência de execução.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BRMIS Construtora — Construímos o que permanece" },
      { name: "description", content: description },
      { property: "og:title", content: "BRMIS Construtora — Construímos o que permanece" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const navigation = [
  ["Sobre", "#sobre"], ["Projetos", "#projetos"], ["Método", "#metodo"], ["Contato", "#contato"],
] as const;

const projectData = [
  { number: "01", title: "Arquitetura residencial", category: "Construção de alto padrão", image: projectResidential, width: 1408, height: 1760, className: "md:col-span-5" },
  { number: "02", title: "Interiores e acabamento", category: "Precisão em cada encontro", image: projectInteriors, width: 1600, height: 1200, className: "md:col-span-7 md:mt-32" },
  { number: "03", title: "Execução e gestão", category: "Canteiro organizado, obra controlada", image: projectExecution, width: 1408, height: 1760, className: "md:col-span-5 md:col-start-7 md:-mt-8" },
] as const;

const formSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(100, "Use até 100 caracteres."),
  phone: z.string().trim().min(8, "Informe um telefone válido.").max(20, "Use até 20 caracteres.").regex(/^[0-9+()\-\s]+$/, "Use apenas números e símbolos de telefone."),
  email: z.string().trim().email("Informe um e-mail válido.").max(255, "Use até 255 caracteres."),
  projectType: z.string().min(1, "Selecione o tipo de projeto."),
  message: z.string().trim().min(10, "Conte um pouco mais sobre o projeto.").max(1200, "Use até 1.200 caracteres."),
});
type FormData = z.infer<typeof formSchema>;

function ActionButton({ className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`group inline-flex min-h-12 items-center justify-center gap-3 border border-signal bg-signal px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-transparent hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal disabled:cursor-not-allowed disabled:opacity-60 ${className}`} {...props}>{children}</button>;
}

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <a href="#inicio" aria-label="BRMIS Construtora — início" className={`relative z-50 font-display text-xl font-bold tracking-[0.12em] ${light ? "text-paper" : "text-foreground"}`}>
      <span className="mr-1 text-signal">B</span>RMIS <span className="hidden text-[0.55rem] font-medium uppercase tracking-[0.18em] opacity-60 sm:inline">Construtora</span>
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${scrolled || open ? "border-border/30 bg-night/95 backdrop-blur-md" : "border-paper/20 bg-transparent"}`}>
      <div className="section-shell flex h-20 items-center justify-between md:h-24">
        <BrandMark light />
        <nav aria-label="Navegação principal" className="hidden items-center gap-9 md:flex">
          {navigation.map(([label, href], index) => <a key={href} href={href} className="technical-label group flex items-center gap-2 text-paper/75 transition-colors hover:text-paper"><span className="text-signal">0{index + 1}</span>{label}</a>)}
        </nav>
        <button type="button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} onClick={() => setOpen(!open)} className="relative z-50 grid size-11 place-items-center text-paper md:hidden">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav aria-label="Navegação móvel" className="absolute inset-x-0 top-20 flex min-h-[calc(100vh-5rem)] flex-col bg-night px-6 pb-12 pt-14 md:hidden">{navigation.map(([label, href], index) => <a key={href} href={href} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-paper/15 py-5 font-display text-3xl font-medium text-paper"><span>{label}</span><span className="technical-label text-signal">0{index + 1}</span></a>)}</nav>}
    </header>
  );
}

function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal, .line-reveal");
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: 0.12 });
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setCount(value); return; }
      const start = performance.now();
      const tick = (now: number) => { const progress = Math.min((now - start) / 1200, 1); setCount(Math.round(value * (1 - Math.pow(1 - progress, 3)))); if (progress < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick); observer.disconnect();
    }, { threshold: 0.5 });
    observer.observe(node); return () => observer.disconnect();
  }, [value]);
  return <span ref={ref}>{suffix}{count}</span>;
}

function SectionHeading({ number, eyebrow, title, light = false }: { number: string; eyebrow: string; title: string; light?: boolean }) {
  return <div className={`reveal grid gap-6 border-t pt-6 md:grid-cols-12 ${light ? "border-paper/20" : "border-foreground/20"}`}><div className="technical-label text-signal md:col-span-2">{number} / {eyebrow}</div><h2 className={`max-w-4xl font-display text-4xl font-medium leading-[1.02] md:col-span-9 md:text-6xl lg:text-7xl ${light ? "text-paper" : "text-foreground"}`}>{title}</h2></div>;
}

function Index() {
  useReveal();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues: { name: "", phone: "", email: "", projectType: "", message: "" } });
  const onSubmit = async () => { await new Promise((resolve) => setTimeout(resolve, 500)); setSubmitted(true); reset(); };

  return <main className="overflow-hidden bg-background">
    <Header />
    <section id="inicio" aria-labelledby="hero-title" className="relative min-h-[92svh] bg-night text-paper">
      <img src={heroImage} alt="Residência contemporânea em concreto, pedra e vidro ao entardecer" width={1920} height={1280} fetchPriority="high" className="hero-drift absolute inset-0 size-full object-cover object-[65%_center]" />
      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/60 to-night/5" />
      <div className="absolute inset-0 architectural-grid opacity-25" />
      <div className="section-shell relative flex min-h-[92svh] flex-col justify-end pb-10 pt-40 md:pb-14">
        <div className="mb-auto flex items-start justify-end pt-4"><div className="hidden w-44 border-l border-paper/30 pl-5 text-xs leading-relaxed text-paper/65 lg:block">Engenharia e gestão para obras que atravessam o tempo.</div></div>
        <div className="max-w-5xl animate-fade-in">
          <div className="technical-label mb-6 flex items-center gap-4 text-paper/70"><span className="h-px w-12 bg-signal" /> Construção civil de alto padrão</div>
          <h1 id="hero-title" className="font-display text-[clamp(3.2rem,8vw,8rem)] font-medium leading-[0.92]">Construímos<br/><span className="text-paper/78">o que permanece.</span></h1>
        </div>
        <div className="mt-10 grid items-end gap-8 border-t border-paper/25 pt-6 md:grid-cols-12">
          <p className="max-w-md text-base leading-relaxed text-paper/75 md:col-span-5 md:text-lg">Há mais de 15 anos, transformamos projetos em obras executadas com método, precisão e responsabilidade.</p>
          <div className="flex gap-9 md:col-span-4"><div><strong className="font-display text-2xl text-paper">+15</strong><span className="block text-xs text-paper/55">anos de mercado</span></div><div><strong className="font-display text-2xl text-paper">+45</strong><span className="block text-xs text-paper/55">obras realizadas</span></div></div>
          <a href="#projetos" className="group flex items-center justify-between border-b border-signal pb-3 text-sm font-semibold md:col-span-3">Conheça nossa atuação <ArrowDown className="size-4 transition-transform group-hover:translate-y-1" /></a>
        </div>
      </div>
    </section>

    <section id="sobre" className="architectural-grid py-24 md:py-36">
      <div className="section-shell">
        <SectionHeading number="01" eyebrow="Nossa história" title="Cinco trajetórias. Uma mesma forma de construir." />
        <div className="mt-16 grid gap-14 md:grid-cols-12 md:mt-24">
          <div className="reveal md:col-span-5 md:col-start-3"><p className="font-display text-2xl leading-snug md:text-3xl">A BRMIS nasceu da amizade e da parceria entre Bruno, Roberto, Marcos, Ilenildo e Silvio.</p></div>
          <div className="reveal md:col-span-4"><p className="leading-relaxed text-muted-foreground">O que começou pela confiança entre cinco fundadores tornou-se uma construtora preparada para assumir cada etapa da obra. Unimos visão de projeto, controle técnico e presença constante no canteiro para entregar com clareza, qualidade e compromisso.</p></div>
        </div>
        <div className="mt-20 grid grid-cols-5 border-y border-foreground/20 md:mt-28">
          {[["B","Bruno"],["R","Roberto"],["M","Marcos"],["I","Ilenildo"],["S","Silvio"]].map(([letter,name], i) => <div key={letter} className="group reveal border-r border-foreground/20 py-7 text-center last:border-r-0 md:py-12" style={{ transitionDelay: `${i * 70}ms` }}><span className="block font-display text-4xl font-medium transition-colors group-hover:text-signal md:text-7xl">{letter}</span><span className="mt-3 hidden text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground sm:block">{name}</span></div>)}
        </div>
      </div>
    </section>

    <section aria-label="Números da BRMIS" className="bg-signal py-12 text-primary-foreground md:py-16">
      <div className="section-shell grid gap-10 md:grid-cols-3 md:gap-0">
        {[[15,"+","anos de experiência"],[45,"+","obras construídas ou administradas"],[5,"","fundadores, uma só visão"]].map(([value,suffix,label], i) => <div key={String(label)} className={`reveal ${i ? "md:border-l md:border-primary-foreground/30 md:pl-10" : ""}`}><strong className="font-display text-6xl font-medium md:text-8xl"><Counter value={Number(value)} suffix={String(suffix)} /></strong><p className="mt-2 max-w-52 text-sm font-medium">{label}</p></div>)}
      </div>
    </section>

    <section id="projetos" className="bg-night py-24 text-paper md:py-36">
      <div className="section-shell">
        <SectionHeading number="02" eyebrow="Projetos" title="Arquitetura bem resolvida. Execução à altura." light />
        <div className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-12 md:mt-24">
          {projectData.map((project) => <article key={project.number} className={`group reveal ${project.className}`}>
            <div className={`overflow-hidden bg-concrete ${project.number === "02" ? "aspect-[4/3]" : "aspect-[4/5]"}`}><img src={project.image} alt={`${project.title} — imagem conceitual de referência`} width={project.width} height={project.height} loading="lazy" className="image-cinematic size-full object-cover group-hover:scale-[1.025] group-hover:saturate-100" /></div>
            <div className="mt-5 flex items-start justify-between gap-4 border-t border-paper/25 pt-4"><div><p className="technical-label mb-2 text-signal">{project.number} / Atuação</p><h3 className="font-display text-xl font-medium md:text-2xl">{project.title}</h3><p className="mt-1 text-sm text-paper/55">{project.category}</p></div><ArrowRight className="mt-1 size-5 text-paper/50 transition-transform group-hover:translate-x-1 group-hover:text-signal" /></div>
          </article>)}
        </div>
        <p className="mt-16 border-l border-signal pl-4 text-xs leading-relaxed text-paper/45">Residencial, interiores, execução e gestão integram as principais frentes de atuação da BRMIS.</p>
      </div>
    </section>

    <section id="metodo" className="py-24 md:py-36">
      <div className="section-shell">
        <SectionHeading number="03" eyebrow="Método" title="Controle do primeiro traço à última entrega." />
        <div className="mt-16 border-t border-foreground/25 md:mt-24">
          {[["01","Entender","Escutamos necessidades, prioridades e limites para definir o caminho certo antes de avançar."],["02","Planejar","Compatibilizamos escopo, etapas, recursos e decisões para reduzir desvios durante a obra."],["03","Executar","Coordenamos equipes, materiais e cronograma com presença técnica e controle contínuo."],["04","Entregar","Revisamos cada detalhe e concluímos a obra com organização, transparência e responsabilidade."]].map(([n,title,text]) => <div key={n} className="group reveal grid gap-4 border-b border-foreground/25 py-8 md:grid-cols-12 md:items-start md:py-10"><span className="technical-label text-signal md:col-span-2">{n}</span><h3 className="font-display text-3xl font-medium md:col-span-4 md:text-4xl">{title}</h3><p className="max-w-lg leading-relaxed text-muted-foreground md:col-span-5">{text}</p><ArrowRight className="hidden size-5 transition-transform group-hover:translate-x-1 md:block" /></div>)}
        </div>
      </div>
    </section>

    <section className="bg-secondary py-24 text-secondary-foreground md:py-32">
      <div className="section-shell grid gap-16 md:grid-cols-12">
        <div className="reveal md:col-span-5"><p className="technical-label text-signal">O que sustenta uma boa obra</p><h2 className="mt-7 font-display text-4xl font-medium leading-tight md:text-6xl">Excelência não acontece por acaso.</h2><p className="mt-8 max-w-md leading-relaxed text-secondary-foreground/60">Ela é consequência de decisões bem tomadas, acompanhamento próximo e respeito pelo projeto em cada fase.</p></div>
        <div className="grid gap-0 md:col-span-6 md:col-start-7">
          {[["Planejamento","Antecipar interferências, organizar recursos e tornar o avanço da obra previsível."],["Execução","Transformar intenção arquitetônica em construção precisa, segura e tecnicamente coerente."],["Acabamento","Cuidar dos encontros, alinhamentos e materiais que definem a percepção final da obra."],["Gestão","Acompanhar prazos, fornecedores e decisões com comunicação clara do início ao fim."]].map(([title,text], i) => <div key={title} className="reveal border-t border-secondary-foreground/20 py-7 last:border-b"><div className="flex gap-5"><span className="technical-label mt-1 text-signal">0{i+1}</span><div><h3 className="font-display text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-secondary-foreground/60">{text}</p></div></div></div>)}
        </div>
      </div>
    </section>

    <section id="contato" className="bg-paper py-24 md:py-36">
      <div className="section-shell">
        <SectionHeading number="04" eyebrow="Contato" title="Vamos construir algo que permaneça?" />
        <div className="mt-16 grid gap-16 md:grid-cols-12 md:mt-24">
          <div className="reveal md:col-span-4"><p className="max-w-sm text-lg leading-relaxed">Conte o que você pretende construir. A BRMIS entra em contato para entender o momento, o escopo e os próximos passos.</p><div className="mt-12 border-t border-foreground/20 pt-5"><p className="technical-label text-muted-foreground">Contato direto</p><p className="mt-4 text-sm text-muted-foreground">Projetos residenciais, comerciais, execução e gestão de obra.</p></div></div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="reveal grid gap-7 md:col-span-7 md:col-start-6" aria-label="Formulário para solicitar projeto">
            {submitted && <div role="status" className="flex items-start gap-3 border border-signal bg-signal/10 p-4 text-sm"><Check className="mt-0.5 size-5 shrink-0 text-signal" /><span><strong className="block">Dados conferidos.</strong>Para concluir o atendimento, utilize os canais oficiais da BRMIS.</span></div>}
            <div className="grid gap-7 sm:grid-cols-2"><Field label="Nome" error={errors.name?.message}><input {...register("name")} autoComplete="name" placeholder="Seu nome" /></Field><Field label="Telefone / WhatsApp" error={errors.phone?.message}><input {...register("phone")} autoComplete="tel" inputMode="tel" placeholder="(00) 00000-0000" /></Field></div>
            <div className="grid gap-7 sm:grid-cols-2"><Field label="E-mail" error={errors.email?.message}><input {...register("email")} autoComplete="email" inputMode="email" placeholder="voce@exemplo.com.br" /></Field><Field label="Tipo de projeto" error={errors.projectType?.message}><select {...register("projectType")} defaultValue=""><option value="" disabled>Selecione</option><option value="residencial">Residencial</option><option value="comercial">Comercial</option><option value="gestao">Gestão de obra</option><option value="outro">Outro</option></select></Field></div>
            <Field label="Mensagem" error={errors.message?.message}><textarea {...register("message")} rows={4} placeholder="Conte brevemente sobre o projeto, localização e momento atual." /></Field>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center"><ActionButton type="submit" disabled={isSubmitting}>Solicitar projeto <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></ActionButton><span className="text-xs text-muted-foreground">Atendimento a projetos residenciais, comerciais e gestão de obra.</span></div>
          </form>
        </div>
      </div>
    </section>

    <footer className="bg-night py-14 text-paper">
      <div className="section-shell"><div className="flex flex-col gap-10 border-b border-paper/20 pb-12 md:flex-row md:items-end md:justify-between"><div><BrandMark light /><p className="mt-5 font-display text-xl text-paper/55">Ideias. Projetos. Realizações.</p></div><a href="#inicio" className="group flex items-center gap-3 text-sm">Voltar ao início <ArrowDown className="size-4 rotate-180 transition-transform group-hover:-translate-y-1" /></a></div><div className="grid gap-8 pt-7 text-xs text-paper/45 md:grid-cols-2"><p>Bruno · Roberto · Marcos · Ilenildo · Silvio</p><p className="md:text-right">© 2026 BRMIS Construtora. Todos os direitos reservados.</p></div></div>
    </footer>
  </main>;
}

function Field({ label, error, children }: { label: string; error: string | undefined; children: React.ReactElement<{ className?: string; "aria-invalid"?: boolean }> }) {
  const input = { ...children.props, className: `w-full border-0 border-b border-input bg-transparent px-0 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-signal focus:ring-0 ${children.props.className ?? ""}`, "aria-invalid": Boolean(error) };
  return <label className="block"><span className="technical-label text-muted-foreground">{label}</span>{<children.type {...input} />}{error && <span className="mt-2 block text-xs text-destructive" role="alert">{error}</span>}</label>;
}