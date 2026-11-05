import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowRight, ArrowUpRight, AtSign, Check, MapPin, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type ButtonHTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import heroImage from "@/assets/brmis-hero.jpg";
import { CasaHorizonteSection, ProjetosCarousel } from "@/components/ProjectGalleries";

const INSTAGRAM = "https://www.instagram.com/brmis_construtora/";
// Public address of the site. Set VITE_SITE_URL (e.g. https://brmis.com.br) when hosting on a custom domain.
const SITE_URL = (import.meta.env["VITE_SITE_URL"] || "https://jornalolhe.github.io/Brmis").replace(/\/$/, "");
const SITE_ORIGIN = new URL(SITE_URL).origin;
const projectTypes: Record<string, string> = { residencial: "Residencial", comercial: "Comercial", gestao: "Gestão de obra", outro: "Outro" };

const description = "Há mais de 15 anos, a BRMIS transforma projetos em obras de alto padrão com planejamento, gestão técnica e excelência de execução.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BRMIS Construtora — Construímos o que permanece" },
      { name: "description", content: description },
      { property: "og:title", content: "BRMIS Construtora — Construímos o que permanece" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: new URL(heroImage, SITE_ORIGIN).href },
      { property: "og:image:alt", content: "Residência contemporânea construída pela BRMIS" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: new URL(heroImage, SITE_ORIGIN).href },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "GeneralContractor", name: "BRMIS Construtora", slogan: "Ideias. Projetos. Realizações.", description, url: `${SITE_URL}/`, image: new URL(heroImage, SITE_ORIGIN).href, areaServed: "Indaiatuba e região, SP", address: { "@type": "PostalAddress", addressLocality: "Indaiatuba", addressRegion: "SP", addressCountry: "BR" }, sameAs: [INSTAGRAM], founder: ["Bruno", "Roberto", "Marcos", "Ilenildo", "Silvio"].map((name) => ({ "@type": "Person", name })) }) }],
  }),
  component: Index,
});

const navigation = [
  ["Sobre", "#sobre"], ["Projetos", "#projetos"], ["Método", "#metodo"], ["Contato", "#contato"],
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
  const [current, setCurrent] = useState("");
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      const mid = window.innerHeight * 0.4;
      let found = "";
      navigation.forEach(([, href]) => { const el = document.querySelector(href); if (el && el.getBoundingClientRect().top <= mid) found = href; });
      setCurrent(found);
    };
    update(); window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${scrolled || open ? "border-paper/10 bg-night/90 backdrop-blur-md" : "border-paper/20 bg-transparent"}`}>
      <div className={`section-shell flex items-center justify-between transition-[height] duration-500 ${scrolled ? "h-16 md:h-20" : "h-20 md:h-24"}`}>
        <BrandMark light />
        <nav aria-label="Navegação principal" className="hidden items-center gap-9 md:flex">
          {navigation.map(([label, href], index) => {
            const on = current === href;
            return <a key={href} href={href} aria-current={on ? "true" : undefined} className={`technical-label group relative flex items-center gap-2 py-2 transition-colors ${on ? "text-paper" : "text-paper/65 hover:text-paper"}`}><span className="text-signal">0{index + 1}</span>{label}<span className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-signal transition-transform duration-500 ${on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} /></a>;
          })}
          <a href="#contato" className="group inline-flex items-center gap-2 border border-signal px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-paper transition-colors hover:bg-signal">Orçamento <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" /></a>
        </nav>
        <button type="button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} onClick={() => setOpen(!open)} className="relative z-50 grid size-11 place-items-center text-paper md:hidden">{open ? <X /> : <Menu />}</button>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px"><div ref={barRef} className="h-full origin-left bg-signal" style={{ transform: "scaleX(0)" }} /></div>
      {open && <nav aria-label="Navegação móvel" className="absolute inset-x-0 top-full flex h-[calc(100svh-4rem)] flex-col overflow-y-auto bg-night px-6 pb-10 pt-10 duration-300 animate-in fade-in md:hidden">{navigation.map(([label, href], index) => <a key={href} href={href} onClick={() => setOpen(false)} className="ch-fade-up flex items-center justify-between border-b border-paper/15 py-5 font-display text-3xl font-medium text-paper" style={{ animationDelay: `${index * 70}ms` }}><span>{label}</span><span className="technical-label text-signal">0{index + 1}</span></a>)}<a href="#contato" onClick={() => setOpen(false)} className="mt-auto inline-flex min-h-14 items-center justify-center gap-3 bg-signal text-sm font-semibold text-primary-foreground">Solicitar orçamento <ArrowRight className="size-4" /></a></nav>}
    </header>
  );
}

function FloatingCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const update = () => {
      const contact = document.querySelector("#contato")?.getBoundingClientRect();
      const nearContact = contact ? contact.top < window.innerHeight : false;
      setShow(window.scrollY > window.innerHeight * 0.8 && !nearContact);
    };
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <a href="#contato" aria-hidden={!show} tabIndex={show ? 0 : -1} className={`fixed inset-x-4 bottom-4 z-40 inline-flex min-h-14 items-center justify-center gap-3 bg-signal text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] transition-all duration-500 md:hidden ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0"}`} style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
      Solicitar orçamento <ArrowRight className="size-4" />
    </a>
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
  const onSubmit = async (data: FormData) => {
    const text = `Olá, BRMIS! Meu nome é ${data.name}.\nTipo de projeto: ${projectTypes[data.projectType] ?? data.projectType}\nTelefone: ${data.phone}\nE-mail: ${data.email}\n\n${data.message}`;
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard indisponível */ }
    window.open(INSTAGRAM, "_blank", "noopener");
    setSubmitted(true);
    reset();
  };

  return <main id="conteudo" className="overflow-x-clip bg-background">
    <a href="#projetos" className="sr-only z-[60] bg-signal px-4 py-3 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Pular para os projetos</a>
    <Header />
    <FloatingCta />
    <section id="inicio" aria-labelledby="hero-title" className="relative min-h-[92svh] bg-night text-paper">
      <img src={heroImage} alt="Residência contemporânea em concreto, pedra e vidro ao entardecer" width={1920} height={1280} fetchPriority="high" className="hero-drift absolute inset-0 size-full object-cover object-[65%_center]" />
      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/60 to-night/5" />
      <div className="absolute inset-0 architectural-grid opacity-25" />
      <div className="section-shell relative flex min-h-[92svh] flex-col justify-end pb-10 pt-40 md:pb-14">
        <div className="mb-auto flex items-start justify-end pt-4"><div className="hidden w-44 border-l border-paper/30 pl-5 text-xs leading-relaxed text-paper/65 lg:block">Engenharia e gestão para obras que atravessam o tempo.</div></div>
        <div className="max-w-5xl">
          <div className="technical-label ch-fade-up mb-6 flex items-center gap-4 text-paper/70" style={{ animationDelay: "150ms" }}><span className="ch-line h-px w-12 origin-left bg-signal" /> Construção civil de alto padrão</div>
          <h1 id="hero-title" className="font-display text-[clamp(3.2rem,8vw,8rem)] font-medium leading-[0.92]"><span className="block overflow-hidden pb-[0.06em]"><span className="ch-rise block" style={{ animationDelay: "250ms" }}>Construímos</span></span><span className="block overflow-hidden pb-[0.08em]"><span className="ch-rise block text-paper/78" style={{ animationDelay: "400ms" }}>o que permanece.</span></span></h1>
        </div>
        <div className="ch-fade-up mt-10 grid items-end gap-8 border-t border-paper/25 pt-6 md:grid-cols-12" style={{ animationDelay: "650ms" }}>
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

    <section id="projetos" className="bg-night pb-20 pt-24 text-paper md:pb-28 md:pt-36">
      <div className="section-shell">
        <SectionHeading number="02" eyebrow="Projetos" title="Arquitetura bem resolvida. Execução à altura." light />
        <ProjetosCarousel />
      </div>
    </section>

    <CasaHorizonteSection />

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
        <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-12 lg:gap-16">
          <div className="reveal lg:col-span-5">
            <p className="max-w-md font-display text-2xl leading-snug md:text-3xl">Conte o que você pretende construir. A BRMIS retorna para entender o momento, o escopo e os próximos passos.</p>
            <ol className="mt-12 border-t border-foreground/15">
              {[["01","Você envia o projeto","Tipo de obra, localização e o que já está definido."],["02","Conversa inicial","Entendemos prioridades, prazos e expectativas."],["03","Proposta","Escopo, etapas e investimento apresentados com clareza."]].map(([n,t,d]) => <li key={n} className="flex gap-5 border-b border-foreground/15 py-5"><span className="technical-label mt-1 text-signal">{n}</span><div><p className="font-display text-lg font-semibold">{t}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d}</p></div></li>)}
            </ol>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 border border-foreground/15 bg-card p-5 transition-colors hover:border-signal"><span className="grid size-11 shrink-0 place-items-center bg-night text-paper transition-colors group-hover:bg-signal"><AtSign className="size-5" /></span><span className="min-w-0 flex-1"><span className="technical-label block text-muted-foreground">Instagram</span><span className="mt-1.5 block truncate font-semibold">@brmis_construtora</span></span><ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal" /></a>
              <div className="flex items-center gap-4 border border-foreground/15 bg-card p-5"><span className="grid size-11 shrink-0 place-items-center bg-night text-paper"><MapPin className="size-5" /></span><span><span className="technical-label block text-muted-foreground">Atuação</span><span className="mt-1.5 block font-semibold">Indaiatuba e região · SP</span></span></div>
            </div>
          </div>

          <div className="reveal lg:col-span-7">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-7 border border-foreground/15 bg-card p-6 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.35)] sm:p-10" aria-label="Formulário para solicitar projeto">
              <div className="flex flex-col gap-2 border-b border-foreground/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="technical-label text-signal">Solicitar orçamento</p><h3 className="mt-3 font-display text-2xl font-semibold md:text-3xl">Fale sobre a sua obra</h3></div>
                <p className="text-xs text-muted-foreground">Leva menos de 2 minutos.</p>
              </div>
              {submitted && <div role="status" className="flex items-start gap-3 border border-signal bg-signal/10 p-4 text-sm"><Check className="mt-0.5 size-5 shrink-0 text-signal" /><span><strong className="block">Mensagem pronta e copiada.</strong>Abrimos o Instagram da BRMIS: cole a mensagem no Direct para enviar.</span></div>}
              <div className="grid gap-7 sm:grid-cols-2"><Field label="Nome" error={errors.name?.message}><input {...register("name")} autoComplete="name" placeholder="Seu nome" /></Field><Field label="Telefone / WhatsApp" error={errors.phone?.message}><input {...register("phone")} autoComplete="tel" inputMode="tel" placeholder="(00) 00000-0000" /></Field></div>
              <div className="grid gap-7 sm:grid-cols-2"><Field label="E-mail" error={errors.email?.message}><input {...register("email")} autoComplete="email" inputMode="email" placeholder="voce@exemplo.com.br" /></Field><Field label="Tipo de projeto" error={errors.projectType?.message}><select {...register("projectType")} defaultValue=""><option value="" disabled>Selecione</option><option value="residencial">Residencial</option><option value="comercial">Comercial</option><option value="gestao">Gestão de obra</option><option value="outro">Outro</option></select></Field></div>
              <Field label="Mensagem" error={errors.message?.message}><textarea {...register("message")} rows={4} placeholder="Conte brevemente sobre o projeto, localização e momento atual." /></Field>
              <div className="flex flex-col items-stretch gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs leading-relaxed text-muted-foreground sm:max-w-xs">Residencial, comercial e gestão de obra. Seus dados são usados apenas para este atendimento.</span><ActionButton type="submit" disabled={isSubmitting}>Enviar solicitação <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></ActionButton></div>
            </form>
          </div>
        </div>
      </div>
    </section>

    <footer className="bg-night pt-16 pb-10 text-paper md:pt-24">
      <div className="section-shell">
        <div className="grid gap-12 border-b border-paper/15 pb-14 md:grid-cols-12">
          <div className="md:col-span-5"><BrandMark light /><p className="mt-6 max-w-sm font-display text-2xl leading-snug text-paper/70">Ideias. Projetos. Realizações.</p><a href="#contato" className="group mt-8 inline-flex items-center gap-3 border-b border-signal pb-2 text-sm font-semibold">Solicitar orçamento <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></a></div>
          <nav aria-label="Rodapé" className="md:col-span-3 md:col-start-7"><p className="technical-label text-paper/40">Navegação</p><ul className="mt-5 grid gap-3 text-sm">{navigation.map(([label, href]) => <li key={href}><a href={href} className="text-paper/70 transition-colors hover:text-signal">{label}</a></li>)}</ul></nav>
          <div className="md:col-span-3"><p className="technical-label text-paper/40">Contato</p><ul className="mt-5 grid gap-3 text-sm text-paper/70"><li><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-signal"><AtSign className="size-4" />@brmis_construtora</a></li><li className="inline-flex items-center gap-2"><MapPin className="size-4" />Indaiatuba e região · SP</li></ul></div>
        </div>
        <div className="flex flex-col gap-4 pt-7 text-xs text-paper/40 md:flex-row md:items-center md:justify-between"><p>© 2026 BRMIS Construtora · Bruno · Roberto · Marcos · Ilenildo · Silvio</p><a href="#inicio" className="group inline-flex items-center gap-2 text-paper/60 hover:text-paper">Voltar ao início <ArrowDown className="size-4 rotate-180 transition-transform group-hover:-translate-y-1" /></a></div>
      </div>
    </footer>
  </main>;
}

function Field({ label, error, children }: { label: string; error: string | undefined; children: React.ReactElement<{ className?: string; "aria-invalid"?: boolean }> }) {
  const input = { ...children.props, className: `w-full border-0 border-b border-input bg-transparent px-0 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-signal focus:ring-0 ${children.props.className ?? ""}`, "aria-invalid": Boolean(error) };
  return <label className="block"><span className="technical-label text-muted-foreground">{label}</span>{<children.type {...input} />}{error && <span className="mt-2 block text-xs text-destructive" role="alert">{error}</span>}</label>;
}