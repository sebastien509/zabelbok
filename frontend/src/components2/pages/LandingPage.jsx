import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Lottie from 'lottie-react';
import bgAnimation from '@/assets/bgAnimation.json';

/**
 * E‑stratèji — Landing Page (Enhanced to rival Kajabi)
 * Typography: Rubik One (headlines), Nouvel'r (body)
 * Markets: Jamaica 🇯🇲 & Haiti 🇭🇹 | Emphasis: Creators first; Tech; Mobile apps; AI assistants; Media
 * Adds (this pass):
 *  - Scrollable, auto‑scrolling Logos bar (infinite loop)
 *  - Auto‑scrolling Creators headshots (10 placeholders)
 *  - Hover effects on cards/images/buttons (colorful shadows)
 *  - Light glassmorphism + refined bento borders
 */

// Brand Palette
const palette = {
  absoluteBlack: "#000000",
  appleGreen: "#8DB600",
  heritageRed: "#C1272D",
  warmRootBrown: "#5D3721",
  burntOrange: "#EE964B",
  ivoryNeutral: "#FAF9F6",
  blackOlive: "#3B3C36",
};

// Font stacks
const headlineFont = `'Rubik One', 'Nouvelr', 'Rubik', 'Inter', system-ui, -apple-system, sans-serif`;
const bodyFont = `'Nouvelr', 'Rubik', 'Inter', system-ui, -apple-system, sans-serif`;

function FontImports() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Rubik+One&family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    </>
  );
}

// ====== Helpers ======
const glass = (tint = 0.6) => ({
  background: `rgba(250, 249, 246, ${tint})`, // IvoryNeutral w/ alpha
  backdropFilter: "saturate(140%) blur(8px)",
  WebkitBackdropFilter: "saturate(140%) blur(8px)",
});

const softBorder = (color = "#e7e5df") => ({ borderColor: color });

// Closer, tighter shadow by default (same direction)
const shadowColor = (hex, alpha = 0.22, opts) => {
  // parse hex → rgb
  const c = hex.replace('#','');
  const bigint = parseInt(c.length === 3 ? c.split('').map(x=>x+x).join('') : c, 16);
  const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;

  // shorter distance & blur; same downward direction
  const {
    x = 0,       // horizontal offset
    y = 6,       // vertical offset (↓)
    blur = 16,   // softer but closer
    spread = 0   // keep tight edges
  } = opts || {};

  return `${x}px ${y}px ${blur}px ${spread}px rgba(${r}, ${g}, ${b}, ${alpha})`;
};


/// ====== Nav (hide on scroll) ======
function NavBar() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const delta = y - lastY.current;

      // track top for border/shadow tweaks
      setAtTop(y < 4);

      // if mobile menu is open, don't hide
      if (open) {
        setHidden(false);
        lastY.current = y;
        return;
      }

      // small threshold to avoid jitter
      const goingDown = delta > 6 && y > 72;
      const goingUp = delta < -6;

      if (goingDown) setHidden(true);
      else if (goingUp) setHidden(false);

      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  return (
    <nav
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-transform duration-300",
        hidden ? "-translate-y-full" : "translate-y-0",
        // soft border/shadow only when scrolled
        atTop ? "border-b border-transparent" : "border-b",
      ].join(" ")}
      style={{
        borderColor: atTop ? "transparent" : "#e9e7e2",
        background:
          "linear-gradient(135deg,rgba(141,182,0,0.4) 0%,rgba(141,182,0,0.4) 46%,rgba(193,39,45,0.4) 100%)",
        backdropFilter: "saturate(140%) blur(8px)",
        WebkitBackdropFilter: "saturate(140%) blur(8px)",
        boxShadow: atTop ? "none" : shadowColor(palette.blackOlive, 0.12, { y: 4, blur: 14 }),
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="#" className="flex items-center gap-3 group/logo">
  {/* Symbol over gradient */}
  <div
    className="relative h-9 w-9 rounded-2xl overflow-hidden ring-1 ring-white/20 transition-transform group-hover/logo:-translate-y-0.5"
    style={{ background: "linear-gradient(135deg, #8DB600, #C1272D)" }}
    aria-hidden="true"
  >
    <img
      src="https://res.cloudinary.com/dyeomcmin/image/upload/v1752340909/Estrateji-Symbol-white_ndemtl.png"
      alt=""
      className="absolute inset-0 m-auto h-8 w-8 object-contain pointer-events-none select-none"
      draggable="false"
    />
  </div>

  {/* Text logo */}
  <img
    src="https://res.cloudinary.com/dyeomcmin/image/upload/v1759381743/Estrateji_symbol_Text_Black_ycv3mv.png"
    alt="E-stratèji"
    className="h-7 -ml-3 w-auto object-contain transition-transform group-hover/logo:-translate-y-0.5"
    draggable="false"
  />

  {/* Phonetic chip (Kreyòl + English) */}
  <div className="hidden sm:flex items-center gap-2 pl-3 ml-1 rounded-full border bg-white/60 backdrop-blur-md
                  ring-1 ring-black/5 transition-colors hover:bg-white/70"
       style={{ borderColor: "#e7e5df", color: "#3B3C36" }}
       aria-label="Pronunciation: Kreyòl and English">
    {/* Divider dot */}
    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "#8DB600" }} />
    {/* Kreyòl */}
    <span className="text-[11px] leading-none">
      <span className="font-medium">Kreyòl:</span> <span className="opacity-90">/is-tra-té-ji/</span>
    </span>
    {/* Separator */}
    <span className="text-black/20">|</span>
    {/* English */}
    <span className="text-[11px] leading-none">
      <span className="font-medium">English:</span> <span className="opacity-90">/ee-strat-uh-jee/</span>
    </span>

    {/* Hover info tooltip */}
    <div className="relative">
      <span
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold
                   bg-black/5 text-black/60 hover:bg-black/10"
        aria-hidden="true"
      >
        i
      </span>
      <div className="pointer-events-none absolute left-0 top-[125%] z-50 w-[220px] rounded-xl border bg-white/95 p-3 text-[11px]
                      opacity-0 shadow-lg transition-opacity duration-200 group-hover/logo:opacity-100"
           style={{ borderColor: "#e7e5df", color: "#3B3C36", boxShadow: "0 6px 16px rgba(59,60,54,0.12)" }}
           role="tooltip"
      >
        <div className="font-medium mb-1">How to say “E-stratèji”</div>
        <div><span className="font-medium">Kreyòl:</span> “is-tra-té-ji”</div>
        <div><span className="font-medium">English:</span> “ee-strat-uh-jee”</div>
      </div>
    </div>
  </div>
</a>


        <div
          className="hidden lg:flex items-center gap-8 text-sm"
          style={{ color: palette.blackOlive, fontFamily: bodyFont }}
        >
          <a href="#features" className="hover:opacity-80">Features</a>
          <a href="#ai" className="hover:opacity-80">AI Assistants</a>
          <a href="#mobile" className="hover:opacity-80">Tech & Mobile</a>
          <a href="#media" className="hover:opacity-80">Media Packages</a>
          <a href="#pricing" className="hover:opacity-80">Pricing</a>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login"
          
            className="px-4 py-2 rounded-2xl border transition hover:-translate-y-0.5"
            style={{
              ...softBorder(palette.blackOlive),
              color: palette.blackOlive,
              fontFamily: bodyFont,
              boxShadow: shadowColor(palette.blackOlive, 0.12, { y: 4, blur: 12 }),
            }}
          >
            Sign in
          </Link>
          <Link to="/signup/creator"
          
            className="px-4 py-2 rounded-2xl text-white transition hover:-translate-y-0.5"
            style={{
              background: palette.absoluteBlack,
              fontFamily: bodyFont,
              boxShadow: shadowColor(palette.appleGreen, 0.22, { y: 4, blur: 14 }),
            }}
          >
            Get started
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border"
          style={{ borderColor: "#e9e7e2", color: palette.blackOlive }}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {open && (
        <div
          className="lg:hidden px-4 pb-4 space-y-2"
          style={{ color: palette.blackOlive, fontFamily: bodyFont }}
        >
          <a href="#features" className="block">Features</a>
          <a href="#ai" className="block">AI Assistants</a>
          <a href="#mobile" className="block">Tech & Mobile</a>
          <a href="#media" className="block">Media Packages</a>
          <a href="#pricing" className="block">Pricing</a>
          <div className="pt-2 flex gap-2">

          <Link to="/login"

          
              className="flex-1 px-4 py-2 rounded-2xl border text-center"
              style={{ borderColor: palette.blackOlive }}
            >
              Sign in
            
            </Link>

            <Link to="/signup/creator"

          
              className="flex-1 px-4 py-2 rounded-2xl text-center text-white"
              style={{ background: palette.absoluteBlack }}
            >
              Get started
            
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}


// ====== Hero (Rotating) ======
function RotatingHero() {
  const banners = useMemo(() => ([
    { id: 1, kicker: "Creators First • Payouts in Stripe", title: "Own your classroom. Keep your culture.", copy: "From Kingston to Kafou—publish, price, and get paid. We handle the rails; you teach the world.", img: "https://i.imgur.com/3QdKKXG.jpeg", accent: palette.appleGreen, label: "Start creating" },
    { id: 2, kicker: "Tech that travels • Low‑internet native", title: "Learning that reaches every corner.", copy: "Offline modules, captions in Kreyòl & Patwa, and mobile apps built for spotty networks.", img: "https://i.imgur.com/pQYoqDg.jpeg", accent: palette.burntOrange, label: "See the tech" },
    { id: 3, kicker: "AI Assistants • Media Packages up to 1M impressions", title: "Teach boldly. We amplify your reach.", copy: "Creator copilots, learner tutors, and promo bundles that put your course in the spotlight.", img: "https://i.imgur.com/M6Xk8QY.jpeg", accent: palette.heritageRed, label: "Meet your copilots" },
  ]), []);

  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5500);
    return () => clearInterval(id);
  }, [banners.length]);

  const active = banners[index];

  return (
    <section className="relative my-2 overflow-hidden" style={{ background: palette.ivoryNeutral }}>
      <div className="absolute inset-0 -z-10" style={{ background: `radial-gradient(1200px 600px at 20% -10%, ${active.accent}12%, transparent 50%)` }} />
      <div className="max-w-7xl mx-auto px-4 py-20 lg:py-28 grid lg:grid-cols-2 gap-10 items-center">
        <div>
        <motion.div
    className="absolute inset-0 flex items-center justify-center pointer-events-none  my-10 z-0"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1.5 }}
  >
    <div className="w-full max-w-xl h-auto mt-40 opacity-20">
      <Lottie animationData={bgAnimation} loop autoplay />
    </div>
  </motion.div>
          <motion.div key={active.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="text-xs tracking-wide px-3 mx-2 w-fit uppercase py-1 rounded-full border" style={{ color: active.accent, fontFamily: bodyFont, ...softBorder(active.accent), ...glass(0.55) }}>{active.kicker}</div>
            <h1 className="mt-3 text-4xl lg:text-5xl leading-tight" style={{ color: palette.blackOlive, fontFamily: headlineFont }}>{active.title}</h1>
            <p className="mt-4 text-lg max-w-xl" style={{ color: palette.blackOlive, fontFamily: bodyFont }}>{active.copy}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/signup/creator"
                 className="px-6 py-3 rounded-2xl text-white transition-transform hover:-translate-y-0.5" style={{ background: palette.absoluteBlack, fontFamily: bodyFont, boxShadow: shadowColor(palette.appleGreen) }}>Get started
             </Link>
              <a href="#features" className="px-6 py-3 rounded-2xl border transition-transform hover:-translate-y-0.5" style={{ ...softBorder(palette.blackOlive), color: palette.blackOlive, fontFamily: bodyFont, boxShadow: shadowColor(palette.burntOrange, 0.18) }}>{active.label}</a>
              <span className="text-xs opacity-70 ml-2" style={{ color: palette.blackOlive }}>Powered by Stripe</span>
            </div>
          </motion.div>
        </div>
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div key={active.img} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.5 }} className="rounded-3xl overflow-hidden border shadow-xl" style={{ ...softBorder("#e9e7e2"), ...glass(0.4), boxShadow: shadowColor(active.accent, 0.25) }}>
              <img src={active.img} alt="hero" className="w-full h-80 object-cover transition-transform duration-300 hover:scale-[1.02]" />
            </motion.div>
          </AnimatePresence>
          <div className="mt-4 flex gap-2">
            {banners.map((b, i) => (
              <button key={b.id} onClick={() => setIndex(i)} className={`h-2.5 rounded-full transition-all ${i === index ? 'w-8' : 'w-3'} `} style={{ background: i === index ? active.accent : '#d6d3ce' }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ====== Auto‑scroll (Logos & Headshots) ======
function AutoScrollRow({ items, speed = 30, itemRender }) {
  const trackRef = useRef(null);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const animation = el.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }],
      { duration: speed * 1000, iterations: Infinity, easing: "linear" }
    );
    return () => animation.cancel();
  }, [speed]);

  // Duplicate items to fake an infinite marquee
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <div ref={trackRef} className="flex items-center gap-8 whitespace-nowrap will-change-transform">
        {doubled.map((it, idx) => (
          <div key={idx} className="shrink-0">
            {itemRender(it, idx)}
          </div>
        ))}
      </div>
    </div>
  );
}

function LogosBar() {
  const logos = Array.from({ length: 8 }).map((_, i) => i);
  return (
    <section className="py-10 border-y" style={{ background: palette.ivoryNeutral, borderColor: "#e9e7e2" }}>
      <div className="max-w-7xl mx-auto px-4">
        <AutoScrollRow
          items={logos}
          speed={35}
          itemRender={(i) => (
            <div className="h-12 w-32 rounded-2xl border bg-white/70" style={{ ...softBorder("#eceae5"), ...glass(0.5), boxShadow: shadowColor(palette.blackOlive, 0.08) }} />
          )}
        />
      </div>
    </section>
  );
}
function CreatorsStrip() {
  const heads = [
    "https://res.cloudinary.com/dyeomcmin/image/upload/v1752393508/business-man-banner-concept-with-copy-space_quyz6d.jpg",
    "https://res.cloudinary.com/dyeomcmin/image/upload/v1752393315/23214_arjlmd.jpg",
    "https://media.istockphoto.com/id/1394347360/photo/confident-young-black-businesswoman-standing-at-a-window-in-an-office-alone.jpg?s=612x612&w=0&k=20&c=tOFptpFTIaBZ8LjQ1NiPrjKXku9AtERuWHOElfBMBvY=",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=600&auto=format&fit=crop",
    "https://media.istockphoto.com/id/1140949330/photo/businesswoman-studio-head-shot.jpg?s=612x612&w=0&k=20&c=Mga3Qj6Ru1OT0qNNPXgqM4-Ff-GZsO-OJ-HJa2Pu7lk=",
    "https://res.cloudinary.com/dyeomcmin/image/upload/v1745786404/aZJ6cPc_copy_mb4shf.jpg",
    "https://media.istockphoto.com/id/2158069590/photo/black-lesbian-wearing-a-rainbow-print-t-shirt.jpg?s=612x612&w=0&k=20&c=0pO39lyBrh2-4M0R8b1tDCPArkF5j0gQ0DCYr-c1Va8=",
    "https://res.cloudinary.com/dyeomcmin/image/upload/v1752392936/portrait-handsome-bearded-male_xln9em.jpg",
    "https://res.cloudinary.com/dyeomcmin/image/upload/v1752393507/happy-young-african-man-writing-notes_cax09x.jpg",
    "https://media.istockphoto.com/id/1448284028/photo/close-up-portrait-of-an-african-woman-with-piercings.jpg?s=612x612&w=0&k=20&c=iCvnBGvcIAS7cLozpK4rmUtr2Ga4HezVjSej8yl7QFE=",
  ];
  const names = ["Amara","Jamal","Nadine","Kendrick","Solange","Sebastien","Yara","Dante","Imani","Keisha"];
  const accents = [palette.appleGreen, palette.burntOrange, palette.heritageRed, palette.warmRootBrown];

  const Row = ({ items, speed = 48, reverse = false, size = "md" }) => {
    const trackRef = useRef(null);

    // Responsive fixed size via CSS clamp (prevents shrinking)
    const SIZE_SM = "clamp(72px, 26vw, 112px)";
    const SIZE_MD = "clamp(96px, 16vw, 176px)";
    const sizeVar = size === "sm" ? SIZE_SM : SIZE_MD;

    useEffect(() => {
      const el = trackRef.current;
      if (!el) return;
      const keyframes = reverse
        ? [{ transform: "translateX(0)" }, { transform: "translateX(50%)" }]
        : [{ transform: "translateX(0)" }, { transform: "translateX(-50%)" }];
      const anim = el.animate(keyframes, { duration: speed * 1000, iterations: Infinity, easing: "linear" });
      return () => anim.cancel();
    }, [speed, reverse]);

    const doubled = [...items, ...items];

    return (
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className={`flex w-full items-center gap-6 whitespace-nowrap will-change-transform ${reverse ? "flex-row-reverse" : ""}`}
          style={{ minWidth: "100%" }}
        >
          {doubled.map((src, i) => {
            const accent = accents[i % accents.length];
            const name = names[i % names.length];
            return (
              <div key={`${src}-${i}`} className="group relative mx-2  flex flex-col items-center shrink-0">
                <div className="relative shrink-0" style={{ width: sizeVar, height: sizeVar }}>
                  <img
                    src={src}
                    alt={`Creator ${i + 1}`}
                    className="w-full h-full rounded-2xl object-cover border transition-transform duration-300 group-hover:scale-[1.05]"
                    style={{ ...softBorder("#eceae5"), boxShadow: shadowColor(accent, 0.24, { y: 6, blur: 14 }) }}
                  />
                  <span
                    className="pointer-events-none absolute inset-0 rounded-2xl ring-2 transition-all"
                    style={{
                      boxShadow: shadowColor(accent, 0.16, { y: 6, blur: 12 }),
                      borderRadius: "1rem",
                      borderColor: "transparent",
                    }}
                  />
                </div>
                <div
                  className="mt-2 px-2.5 py-1 rounded-full text-[11px] opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition shrink-0"
                  style={{ color: palette.blackOlive, ...softBorder(accent + "55"), ...glass(0.85) }}
                >
                  {name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const rowA = heads.filter((_, idx) => idx % 2 === 0);
  const rowB = heads.filter((_, idx) => idx % 2 === 1);

  return (
    <section className="py-4 w-full" style={{ background: palette.ivoryNeutral }}>
      <div className="w-full  mx-0 px-4">
        {/* Mobile: two rows, opposite directions */}
        <div className="md:hidden space-y-3">
          <Row items={rowA} speed={50} reverse={false} size="sm" />
          <Row items={rowB} speed={52} reverse={true} size="sm" />
        </div>
        {/* md+: one larger row */}
        <div className="hidden md:block">
          <Row items={heads} speed={45} reverse={false} size="md" />
        </div>
      </div>
    </section>
  );
}


// ====== Features ======
function Features() {
  const cards = [
    { title: "Creators keep up to 88%", desc: "Connect payouts in minutes with Stripe Express. We handle fees, access, refunds, and transfers.", color: palette.appleGreen, img: "https://i.imgur.com/6Y0tzKF.jpeg" },
    { title: "Low‑internet by design", desc: "Optimized modules, transcripts, captions in Kreyòl Ayisyen & Jamaican Patwa, and offline logs.", color: palette.burntOrange, img: "https://i.imgur.com/08c7i5y.jpeg" },
    { title: "All your course pieces", desc: "Lectures, books, quizzes, progress—integrated with a simple, modern CMS.", color: palette.heritageRed, img: "https://i.imgur.com/Hq9UOVt.jpeg" },
  ];
  return (
    <section id="features" className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-semibold" style={{ color: palette.blackOlive, fontFamily: headlineFont }}>What you get</h2>
        <p className="mt-2 text-gray-600 max-w-2xl" style={{ fontFamily: bodyFont }}>Everything you need to sell and deliver courses—nothing you don’t.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {cards.map((c) => (
            <div key={c.title} className="group rounded-3xl overflow-hidden border bg-white shadow-sm transition-transform hover:-translate-y-1" style={{ ...softBorder("#eae7e1"), ...glass(0.7), boxShadow: shadowColor(c.color, 0.2) }}>
              <div className="relative">
                <img src={c.img} alt="feature" className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,.04))" }} />
              </div>
              <div className="p-5">
                <h3 className="font-medium" style={{ color: c.color, fontFamily: bodyFont }}>{c.title}</h3>
                <p className="mt-2 text-sm" style={{ color: palette.blackOlive, fontFamily: bodyFont }}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ====== AI Assistants ======
function AIAssistants() {
  const items = [
    { title: "Creator Copilot", desc: "Plan curricula, price smartly, draft pages, and ship faster—with multilingual prompts tuned for Jamaica & Haiti.", color: palette.appleGreen },
    { title: "Learner Tutor", desc: "On‑demand help in Kreyòl & Patwa. Summaries, checkpoints, and gentle nudges to keep momentum.", color: palette.burntOrange },
    { title: "Support Concierge", desc: "Automate FAQs, refunds, and course access fixes—so you can focus on teaching.", color: palette.heritageRed },
  ];
  return (
    <section id="ai" className="py-20" style={{ background: palette.ivoryNeutral }}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-semibold" style={{ color: palette.blackOlive, fontFamily: headlineFont }}>AI assistants that speak your world</h2>
        <p className="mt-2 text-gray-700 max-w-2xl" style={{ fontFamily: bodyFont }}>Guided creation for you. Warm, culturally authentic help for learners.</p>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {items.map(i => (
            <div key={i.title} className="rounded-3xl p-6 border bg-white transition-transform hover:-translate-y-1" style={{ ...softBorder("#e7e5df"), ...glass(0.7), boxShadow: shadowColor(i.color, 0.18) }}>
              <div className="text-sm font-medium" style={{ color: i.color, fontFamily: bodyFont }}>{i.title}</div>
              <p className="mt-2 text-sm text-gray-700" style={{ fontFamily: bodyFont }}>{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ====== Tech & Mobile ======
function TechMobile() {
  const bullets = [
    { h: "Android & iOS apps", p: "Fast, light, and cache‑savvy for spotty connections.", c: palette.appleGreen },
    { h: "Offline‑ready modules", p: "Transcript, captions, and progress logs that survive low bandwidth.", c: palette.burntOrange },
    { h: "Secure payments", p: "Stripe Checkout + Express payouts. Strong, simple, trusted.", c: palette.heritageRed },
  ];
  return (
    <section id="mobile" className="py-20">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
        <div className="rounded-3xl overflow-hidden border bg-white transition-transform hover:-translate-y-1" style={{ ...softBorder("#eceae5"), ...glass(0.6), boxShadow: shadowColor(palette.appleGreen, 0.18) }}>
          <img src="https://i.imgur.com/dYgj0NJ.jpeg" alt="Mobile preview" className="w-full h-96 object-cover" />
        </div>
        <div>
          <h2 className="text-3xl font-semibold" style={{ color: palette.blackOlive, fontFamily: headlineFont }}>Tech that moves with the Caribbean</h2>
          <p className="mt-3 text-gray-700" style={{ fontFamily: bodyFont }}>Built for Jamaica & Haiti. Lightweight, resilient, and ready for real conditions.</p>
          <div className="mt-6 space-y-4">
            {bullets.map(b => (
              <div key={b.h} className="flex gap-3">
                <span className="mt-1 h-3 w-3 rounded-full" style={{ background: b.c }} />
                <div>
                  <div className="font-medium" style={{ color: palette.blackOlive, fontFamily: bodyFont }}>{b.h}</div>
                  <div className="text-sm text-gray-700" style={{ fontFamily: bodyFont }}>{b.p}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ====== Media Packages ======
function MediaPackages() {
  const packs = [
    { name: "Starter Boost", impressions: "100k", accent: palette.appleGreen, points: ["Promo kit", "Email spotlight", "Creator interview snippet"] },
    { name: "Island Reach", impressions: "500k", accent: palette.burntOrange, points: ["Regional ads", "Influencer collab", "Radio/Podcast mention"] },
    { name: "Caribbean Wave", impressions: "1M", accent: palette.heritageRed, points: ["Multi‑channel push", "Press bundle", "Launch webinar + clips"] },
  ];
  return (
    <section id="media" className="py-20" style={{ background: palette.ivoryNeutral }}>
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-semibold" style={{ color: palette.blackOlive, fontFamily: headlineFont }}>Media packages to amplify your voice</h2>
        <p className="mt-2 text-gray-700 max-w-2xl" style={{ fontFamily: bodyFont }}>From yard to diaspora—pick a package and we’ll push the wave.</p>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {packs.map(p => (
            <div key={p.name} className="rounded-3xl border bg-white p-6 flex flex-col transition-transform hover:-translate-y-1" style={{ ...softBorder("#eee"), ...glass(0.7), boxShadow: shadowColor(p.accent, 0.2) }}>
              <div className="text-sm font-medium" style={{ color: p.accent, fontFamily: bodyFont }}>{p.name}</div>
              <div className="text-3xl font-semibold mt-1" style={{ color: palette.blackOlive, fontFamily: headlineFont }}>{p.impressions} impressions</div>
              <ul className="mt-4 space-y-2 text-sm text-gray-700" style={{ fontFamily: bodyFont }}>
                {p.points.map(pt => <li key={pt}>• {pt}</li>)}
              </ul>
              <a href="#get-started" className="mt-6 inline-block text-center px-4 py-2 rounded-2xl text-white transition hover:-translate-y-0.5" style={{ background: p.accent, fontFamily: bodyFont, boxShadow: shadowColor(p.accent, 0.28) }}>Request details</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ====== Creator Benefits ======
function CreatorBenefits() {
  const perks = [
    { h: "Keep more of your earnings", p: "Transparent fees and revenue share. No hidden cuts.", c: palette.appleGreen },
    { h: "Publish fast", p: "Price, sync to Stripe, ship. We handle the rails.", c: palette.burntOrange },
    { h: "Own your brand", p: "Custom styling, media kits, and a public creator page.", c: palette.heritageRed },
    { h: "Support in your language", p: "Kreyòl & Patwa assistance for creators and learners.", c: palette.warmRootBrown },
  ];
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-semibold" style={{ color: palette.blackOlive, fontFamily: headlineFont }}>Creators first, always</h2>
          <p className="mt-3 text-gray-700" style={{ fontFamily: bodyFont }}>Your voice carries the island. We make sure it carries far.</p>
          <div className="mt-6 space-y-4">
            {perks.map(b => (
              <div key={b.h} className="flex gap-3">
                <span className="mt-1 h-3 w-3 rounded-full" style={{ background: b.c }} />
                <div>
                  <div className="font-medium" style={{ color: palette.blackOlive, fontFamily: bodyFont }}>{b.h}</div>
                  <div className="text-sm text-gray-700" style={{ fontFamily: bodyFont }}>{b.p}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden border bg-white transition-transform hover:-translate-y-1" style={{ ...softBorder("#eceae5"), ...glass(0.6), boxShadow: shadowColor(palette.heritageRed, 0.18) }}>
          <img src="https://i.imgur.com/43TRxfF.jpeg" alt="Creators" className="w-full h-96 object-cover" />
        </div>
      </div>
    </section>
  );
}

// ====== Learners ======
function Learners() {
  const points = [
    "Learn on low data with offline‑friendly modules",
    "Get help in Kreyòl Ayisyen or Jamaican Patwa",
    "Own your progress across web and mobile",
  ];
  return (
    <section className="py-20" style={{ background: palette.absoluteBlack }}>
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-semibold" style={{ color: palette.ivoryNeutral, fontFamily: headlineFont }}>For learners, too</h2>
          <p className="mt-3" style={{ color: "#CFCFCB", fontFamily: bodyFont }}>From Port‑au‑Prince to Portmore—learning that meets you where you are.</p>
          <ul className="mt-6 space-y-2 text-sm" style={{ color: "#DAD9D3", fontFamily: bodyFont }}>
            {points.map(p => <li key={p}>• {p}</li>)}
          </ul>
        </div>
        <div className="rounded-3xl overflow-hidden border border-gray-700">
          <img src="https://i.imgur.com/Kc8zn7q.jpeg" alt="Learners" className="w-full h-96 object-cover" />
        </div>
      </div>
    </section>
  );
}

// ====== Pricing ======
function Pricing() {
  const tiers = [
    { name: "Starter", price: "$0/mo", accent: palette.appleGreen, bullets: ["Unlimited free courses", "Stripe Express onboarding", "5% platform fee on paid sales"], cta: "Get started" },
    { name: "Growth", price: "$29/mo", accent: palette.burntOrange, bullets: ["Paid courses", "Analytics & AI assistants", "Lower platform fee (12%)"], cta: "Try Growth" },
    { name: "Pro", price: "$99/mo", accent: palette.heritageRed, bullets: ["Priority support", "Media pack discounts", "Volume pricing"], cta: "Contact sales" },
  ];

  return (
    <section id="pricing" className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-semibold" style={{ color: palette.blackOlive, fontFamily: headlineFont }}>Simple pricing</h2>
        <p className="mt-2 text-gray-600 max-w-2xl" style={{ fontFamily: bodyFont }}>Creator‑friendly revenue share. Scale when you’re ready.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div key={t.name} className="rounded-3xl border bg-white p-6 flex flex-col transition-transform hover:-translate-y-1" style={{ ...softBorder("#eee"), ...glass(0.7), boxShadow: shadowColor(t.accent, 0.22) }}>
              <div className="text-sm font-medium" style={{ color: t.accent, fontFamily: bodyFont }}>{t.name}</div>
              <div className="text-3xl font-semibold mt-2" style={{ color: palette.blackOlive, fontFamily: headlineFont }}>{t.price}</div>
              <ul className="mt-4 space-y-2 text-sm text-gray-700" style={{ fontFamily: bodyFont }}>
                {t.bullets.map((b) => <li key={b}>• {b}</li>)}
              </ul>
              <a href="#get-started" className="mt-6 inline-block text-center px-4 py-2 rounded-2xl text-white transition hover:-translate-y-0.5" style={{ background: t.accent, fontFamily: bodyFont, boxShadow: shadowColor(t.accent, 0.3) }}>{t.cta}</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ====== FAQ ======
function FAQ() {
  const faqs = [
    { q: "How do payouts work?", a: "Creators connect Stripe Express. After a sale, funds flow to your connected account; standard Stripe payout schedules apply." },
    { q: "Can I change prices later?", a: "Yes. Update your course price and we auto‑sync the Stripe Price behind the scenes." },
    { q: "Do you support Kreyòl & Patwa?", a: "Yes. The platform UI supports multilingual content and our AI assistants can help in Kreyòl Ayisyen and Jamaican Patwa." },
    { q: "Is this offline‑friendly?", a: "Yes. Modules, captions, and logs are optimized for low‑bandwidth environments." },
  ];
  return (
    <section id="faq" className="py-20" style={{ background: palette.ivoryNeutral }}>
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-semibold" style={{ color: palette.blackOlive, fontFamily: headlineFont }}>FAQ</h2>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl p-5 border bg-white transition-transform hover:-translate-y-0.5" style={{ ...softBorder("#e7e5df"), ...glass(0.7), boxShadow: shadowColor(palette.blackOlive, 0.12) }}>
              <div className="font-medium" style={{ color: palette.blackOlive, fontFamily: bodyFont }}>{f.q}</div>
              <div className="text-sm mt-2 text-gray-700" style={{ fontFamily: bodyFont }}>{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ====== Testimonial ======
function Testimonial() {
  return (
    <section className="py-20 bg-[linear-gradient(135deg,#8DB600_0%,#8DB600_46%,#C1272D_100%)]">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <blockquote className="text-xl md:text-2xl leading-relaxed" style={{ color: palette.ivoryNeutral, fontFamily: bodyFont }}>
          “Wid di right tools, di whole island become a classroom. Mèsi E‑stratèji.”
        </blockquote>
        <div className="mt-6 text-sm" style={{ color: "#E9E5E0", fontFamily: bodyFont }}>— Aïda M., Education Entrepreneur</div>
      </div>
    </section>
  );
}

// ====== Footer & CTA ======
export function Footer() {
  return (
    <footer className="py-12" style={{ background: palette.warmRootBrown }}>
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8 text-sm" style={{ color: "#d9d8d5", fontFamily: bodyFont }}>
        <div>
          <div className="flex items-center gap-3">
          <div
    className="relative h-9 w-9 rounded-2xl overflow-hidden ring-1 ring-white/20 transition-transform group-hover:-translate-y-0.5"
    style={{ background: "linear-gradient(135deg, #8DB600, #C1272D)" }}
  >
    <img
      src="https://res.cloudinary.com/dyeomcmin/image/upload/v1752340909/Estrateji-Symbol-white_ndemtl.png"
      alt="E-stratèji symbol"
      className="absolute inset-0 m-auto h-8 w-8 object-contain pointer-events-none select-none"
      draggable="false"
    />
  </div>

  {/* Text logo image replaces the text span */}
  <img
    src="https://res.cloudinary.com/dyeomcmin/image/upload/v1759382275/Estrateji_symbol_Text_White_emf9nn.png"
    alt="E-stratèji"
    className="h-6 -mx-3 w-auto object-contain transition-transform group-hover:-translate-y-0.5"
    draggable="false"
  />
            </div>
          <p className="mt-3 opacity-80">Learning that goes everywhere. Payments that just work.</p>
        </div>
        <div>
          <div className="font-medium">Product</div>
          <ul className="mt-2 space-y-1 opacity-90">
            <li><a href="#features">Features</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium">Company</div>
          <ul className="mt-2 space-y-1 opacity-90">
            <li><a href="#">About</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium">Legal</div>
          <ul className="mt-2 space-y-1 opacity-90">
            <li><a href="#">Terms</a></li>
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Refunds</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 text-center text-xs" style={{ color: "#bdbcb8" }}>
        © {new Date().getFullYear()} E‑stratèji. All rights reserved.
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: palette.ivoryNeutral }}>
      <FontImports />
      <NavBar />
      <RotatingHero />
      {/* <LogosBar /> */}
      <CreatorsStrip />
      <Features />
      <AIAssistants />
      <TechMobile />
      <CreatorBenefits />
      <MediaPackages />
      <Learners />
      {/* <Pricing /> */}
      <Testimonial />
      <CTA />
      <FAQ />
      <Footer />
    </div>
  );
}

function CTA() {
  return (
    <section id="get-started" className="py-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="rounded-3xl p-8 md:p-12 border relative overflow-hidden transition-transform hover:-translate-y-0.5" style={{ ...softBorder("#e9e7e2"), ...glass(0.7), boxShadow: shadowColor(palette.appleGreen, 0.22) }}>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20" style={{ background: palette.appleGreen }} />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full opacity-20" style={{ background: palette.heritageRed }} />
          <div className="relative">
            <h3 className="text-2xl font-semibold" style={{ color: palette.blackOlive, fontFamily: headlineFont }}>Launch your first paid course this weekend</h3>
            <p className="mt-2 text-gray-700" style={{ fontFamily: bodyFont }}>Connect payouts, set your price, share your link. We’ll handle the rest.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#" className="px-6 py-3 rounded-2xl text-white transition hover:-translate-y-0.5" style={{ background: palette.absoluteBlack, fontFamily: bodyFont, boxShadow: shadowColor(palette.appleGreen) }}>Get started free</a>
              <a href="#features" className="px-6 py-3 rounded-2xl border transition hover:-translate-y-0.5" style={{ ...softBorder(palette.blackOlive), color: palette.blackOlive, fontFamily: bodyFont, boxShadow: shadowColor(palette.burntOrange, 0.18) }}>Explore features</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
/** ========================================================================================================================================================= */
/** ========================================================================================================================================================= */


// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";

/**
 * E‑strateji Landing Page (Creator‑First) — Tailwind + DaisyUI
 * Emphasis: Creators first, while showcasing platform tech, mobile apps, AI assistants, and media packages.
 * Adds: Rotating hero (3 banners), AI Assistants section, Tech & Mobile, Media Packages (up to 1M impressions),
 *       Creator Benefits, Learner section (secondary emphasis), and polished pricing/FAQ.
 */

// export  function EstratejiLanding() {
//   return (
//     <div className="min-h-screen bg-base-100 text-base-content">
//       <Navbar />
//       <HeroRotator />
//       <CreatorPrimer />
//       <LogoStrip />
//       <CreatorBenefits />
//       <AIHelpers />
//       <TechAndMobile />
//       <MediaPackages />
//       <SplitMediaA />
//       <StatsBand />
//       <LearnerSection />
//       <Testimonials />
//       <Pricing />
//       <FAQ />
//       <FinalCTA />
//       <Footer />
//     </div>
//   );
// }

// function Navbar() {
//   return (
//     <div className="navbar sticky top-0 z-50 bg-base-100/80 backdrop-blur border-b border-base-300">
//       <div className="container mx-auto px-4">
//         <div className="flex-1">
//           <a href="#" className="btn btn-ghost text-xl font-extrabold">E‑strateji</a>
//         </div>
//         <div className="flex-none hidden md:flex gap-1">
//           <a href="#creator" className="btn btn-ghost">Creators</a>
//           <a href="#tech" className="btn btn-ghost">Tech</a>
//           <a href="#pricing" className="btn btn-ghost">Pricing</a>
//           <a href="#faq" className="btn btn-ghost">FAQ</a>
//         </div>
//         <div className="flex-none gap-2">
//           <a className="btn btn-ghost">Sign in</a>
//           <a className="btn btn-primary">Become a Creator</a>
//         </div>
//       </div>
//     </div>
//   );
// }

// /** HERO — Rotating 3 banners */
// function HeroRotator() {
//   const slides = [
//     {
//       title: "Launch your creator brand in minutes",
//       sub: "Pick a theme, upload your banner, and publish a premium page—no code.",
//       cta1: "Start free",
//       cta2: "See creator pages",
//       img: "https://images.unsplash.com/photo-1542744095-291d1f67b221?q=80&w=1400&auto=format&fit=crop",
//     },
//     {
//       title: "AI assistants that help you ship",
//       sub: "From transcript cleanup to quiz generation and course outlines—done in clicks.",
//       cta1: "Try AI helpers",
//       cta2: "How it works",
//       img: "https://images.unsplash.com/photo-1555255707-c07966088b7a?q=80&w=1400&auto=format&fit=crop",
//     },
//     {
//       title: "Reach 1M+ impressions with media packages",
//       sub: "Podcasts, papers, and blog features to amplify your course launches.",
//       cta1: "View packages",
//       cta2: "Talk to us",
//       img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1400&auto=format&fit=crop",
//     },
//   ];

//   const [idx, setIdx] = useState(0);
//   useEffect(() => {
//     const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4500);
//     return () => clearInterval(t);
//   }, []);

//   const s = slides[idx];

//   return (
//     <section className="relative overflow-hidden">
//       <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
//       <div className="container mx-auto px-4 py-20 grid lg:grid-cols-2 gap-10 items-center">
//         <div>
//           <motion.h1
//             key={`title-${idx}`}
//             initial={{ opacity: 0, y: 16 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className="text-4xl md:text-6xl font-black leading-tight"
//           >
//             {s.title}
//           </motion.h1>
//           <motion.p
//             key={`sub-${idx}`}
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.35 }}
//             className="mt-4 text-lg opacity-80"
//           >
//             {s.sub}
//           </motion.p>
//           <div className="mt-8 flex flex-wrap gap-3">
//             <a className="btn btn-primary">{s.cta1}</a>
//             <a className="btn btn-outline">{s.cta2}</a>
//           </div>
//           <ul className="mt-6 text-sm opacity-70 list-disc pl-5 space-y-1">
//             <li>Creator‑first onboarding</li>
//             <li>Offline‑ready modules</li>
//             <li>Integrated payments & analytics</li>
//           </ul>
//         </div>
//         <motion.div
//           key={`img-${idx}`}
//           initial={{ opacity: 0, scale: 0.98 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.4 }}
//         >
//           <div className="mockup-window border border-base-300 bg-base-200">
//             <div className="p-4 md:p-8">
//               <img className="rounded-box" src={s.img} alt="Hero preview" />
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       {/* Dots */}
//       <div className="flex gap-2 justify-center pb-6">
//         {slides.map((_, i) => (
//           <button
//             key={i}
//             onClick={() => setIdx(i)}
//             className={`btn btn-xs ${i === idx ? 'btn-primary' : 'btn-outline'}`}
//           >
//             {i + 1}
//           </button>
//         ))}
//       </div>
//     </section>
//   );
// }

// /** CREATOR FIRST PRIMER */
// function CreatorPrimer() {
//   return (
//     <section id="creator" className="py-10">
//       <div className="container mx-auto px-4 text-center">
//         <div className="badge badge-primary">Creator‑first</div>
//         <h2 className="mt-3 text-3xl md:text-4xl font-extrabold">
//           Create once. Publish everywhere. <span className="text-primary">Own your brand.</span>
//         </h2>
//         <p className="max-w-3xl mx-auto mt-3 opacity-80">
//           E‑strateji gives you a premium, customizable landing page, AI assistants that speed up production,
//           and distribution packages to grow your audience.
//         </p>
//         <div className="mt-6 flex justify-center gap-3">
//           <a className="btn btn-primary">Become a Creator</a>
//           <a className="btn btn-outline">See how it works</a>
//         </div>
//       </div>
//     </section>
//   );
// }

// function LogoStrip() {
//   return (
//     <section className="py-10">
//       <div className="container mx-auto px-4">
//         <p className="text-center text-sm uppercase tracking-widest opacity-60">Trusted by creators & organizations</p>
//         <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-6 items-center opacity-70">
//           {Array.from({ length: 6 }).map((_, i) => (
//             <div key={i} className="h-10 bg-base-200 rounded animate-pulse" />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// /** CREATOR BENEFITS */
// function CreatorBenefits() {
//   const items = [
//     { icon: "🎨", title: "Polished, professional pages", body: "Three distinct themes + two colorways. Your brand, your layout." },
//     { icon: "🤖", title: "AI Assistants", body: "Auto‑outline courses, clean transcripts, generate quizzes, summarize lectures." },
//     { icon: "📱", title: "Mobile apps", body: "Learners watch, read, and quiz on the go—online or offline." },
//     { icon: "💳", title: "Payments & analytics", body: "Enrollments, revenue, and retention in one place." },
//   ];
//   return (
//     <section className="py-16">
//       <div className="container mx-auto px-4">
//         <h3 className="text-3xl md:text-4xl font-extrabold text-center">Built for serious creators</h3>
//         <p className="text-center opacity-70 mt-2">Premium theming, AI speed, and distribution that compounds.</p>
//         <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {items.map((f) => (
//             <div key={f.title} className="card bg-base-200 hover:shadow-lg transition">
//               <div className="card-body">
//                 <div className="text-3xl">{f.icon}</div>
//                 <h4 className="card-title">{f.title}</h4>
//                 <p className="opacity-80">{f.body}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// /** AI HELPERS */
// function AIHelpers() {
//   const helpers = [
//     { title: "Course Outliner", desc: "Turn ideas into a structured syllabus." },
//     { title: "Transcript Cleaner", desc: "Fix titles, sections, and remove filler words." },
//     { title: "Quiz Generator", desc: "Auto‑create MCQs from your content." },
//     { title: "Summary Bot", desc: "Readable abstracts for blogs and social." },
//   ];
//   return (
//     <section className="py-16">
//       <div className="container mx-auto px-4">
//         <div className="hero bg-base-200 rounded-2xl">
//           <div className="hero-content flex-col lg:flex-row gap-10">
//             <img className="max-w-md rounded-box border border-base-300"
//                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop"
//                  alt="AI helpers" />
//             <div>
//               <h3 className="text-3xl font-extrabold">Work faster with AI assistants</h3>
//               <p className="mt-2 opacity-80">Assistants integrate into your creator studio—optional, private‑aware, and designed to save time.</p>
//               <div className="mt-4 grid sm:grid-cols-2 gap-3">
//                 {helpers.map((h) => (
//                   <div key={h.title} className="p-4 rounded-xl border border-base-300 bg-base-100">
//                     <h4 className="font-bold">{h.title}</h4>
//                     <p className="opacity-80 text-sm">{h.desc}</p>
//                   </div>
//                 ))}
//               </div>
//               <div className="mt-6 join">
//                 <button className="btn btn-primary join-item">Try AI helpers</button>
//                 <button className="btn btn-outline join-item">Privacy & safety</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// /** TECH + MOBILE */
// function TechAndMobile() {
//   const tech = [
//     { k: "Offline‑first", v: "PWA + local storage of modules" },
//     { k: "Video + Docs", v: "Transcripts, captions, and blob playback" },
//     { k: "Mobile Apps", v: "iOS & Android experiences" },
//     { k: "APIs", v: "Clean REST for content & analytics" },
//   ];
//   return (
//     <section id="tech" className="py-16 bg-base-200">
//       <div className="container mx-auto px-4">
//         <div className="grid lg:grid-cols-2 gap-10 items-center">
//           <div>
//             <h3 className="text-3xl font-extrabold">Serious tech under the hood</h3>
//             <p className="mt-3 opacity-80">We combine offline‑ready delivery with secure APIs and a polished creator studio—optimized for low‑internet contexts.</p>
//             <ul className="mt-4 space-y-2">
//               {tech.map((t) => (
//                 <li key={t.k} className="flex items-center gap-2">
//                   <span className="badge badge-outline badge-sm">{t.k}</span>
//                   <span className="opacity-80">{t.v}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//           <div>
//             <div className="mockup-phone border-primary">
//               <div className="camera"></div>
//               <div className="display">
//                 <div className="artboard artboard-demo phone-1 bg-base-100">
//                   <div className="p-4">
//                     <p className="font-bold">E‑strateji Mobile</p>
//                     <p className="text-sm opacity-70">Offline playback · Quiz resume · Sync on reconnect</p>
//                     <div className="mt-4 h-40 bg-base-200 rounded-box" />
//                     <div className="mt-3 h-6 bg-base-200 rounded" />
//                     <div className="mt-2 h-6 bg-base-200 rounded" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// /** MEDIA PACKAGES */
// function MediaPackages() {
//   const packs = [
//     { name: "Starter Media", reach: "Up to 100k impressions", items: ["Blog feature", "Newsletter plug", "Social posts"] },
//     { name: "Growth Media", reach: "Up to 500k impressions", items: ["Podcast guest", "Blog + newsletter", "Shorts pack"] },
//     { name: "Launch Max", reach: "Up to 1M impressions", items: ["Podcast + panel", "Whitepaper excerpt", "Multi‑blog syndication"] },
//   ];
//   return (
//     <section className="py-16">
//       <div className="container mx-auto px-4">
//         <h3 className="text-3xl md:text-4xl font-extrabold text-center">Amplify with media packages</h3>
//         <p className="text-center opacity-70">Podcasts • Papers • Blogs • Shorts</p>
//         <div className="mt-10 grid md:grid-cols-3 gap-6">
//           {packs.map((p) => (
//             <div key={p.name} className="card bg-base-100 border border-base-300 shadow">
//               <div className="card-body">
//                 <div className="flex items-baseline justify-between">
//                   <h4 className="card-title">{p.name}</h4>
//                   <div className="badge badge-primary">{p.reach}</div>
//                 </div>
//                 <ul className="mt-3 space-y-2">
//                   {p.items.map((i) => (
//                     <li key={i} className="flex items-center gap-2"><span>✔️</span> {i}</li>
//                   ))}
//                 </ul>
//                 <div className="card-actions mt-6">
//                   <button className="btn btn-outline">Request details</button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// /** Creator Page explainer split (kept) */
// function SplitMediaA() {
//   return (
//     <section className="py-16">
//       <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
//         <div className="order-2 lg:order-1">
//           <h3 className="text-3xl font-extrabold">Themeable Creator Pages</h3>
//           <p className="mt-3 opacity-80">
//             Choose a layout, pick a colorway, add your banner and logo, and publish. We handle the rest.
//           </p>
//           <ul className="mt-4 space-y-2">
//             <li className="flex items-center gap-2"><span className="badge badge-outline badge-sm">AA</span> Accessible contrasts & keyboard nav</li>
//             <li className="flex items-center gap-2"><span className="badge badge-outline badge-sm">i18n</span> English • Kreyòl • Français</li>
//             <li className="flex items-center gap-2"><span className="badge badge-outline badge-sm">PWA</span> Offline‑friendly previews</li>
//           </ul>
//         </div>
//         <div className="order-1 lg:order-2">
//           <div className="rounded-box overflow-hidden border border-base-300">
//             <img
//               src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1400&auto=format&fit=crop"
//               alt="Theme preview"
//             />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// function StatsBand() {
//   const stats = [
//     { k: "Creators", v: "2,400+" },
//     { k: "Learners", v: "120k" },
//     { k: "Avg. completion", v: "86%" },
//     { k: "Countries", v: "35" },
//   ];
//   return (
//     <section className="py-14">
//       <div className="container mx-auto px-4">
//         <div className="stats stats-vertical md:stats-horizontal w-full shadow">
//           {stats.map((s) => (
//             <div key={s.k} className="stat">
//               <div className="stat-title">{s.k}</div>
//               <div className="stat-value text-primary">{s.v}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// /** LEARNER (secondary emphasis) */
// function LearnerSection() {
//   const items = [
//     { title: "Learn anywhere", body: "Offline modules keep you progressing without stable internet." },
//     { title: "Bilingual content", body: "English • Kreyòl • Français support from the start." },
//     { title: "Track progress", body: "Resume videos, complete quizzes, sync when online." },
//   ];
//   return (
//     <section className="py-16 bg-base-200">
//       <div className="container mx-auto px-4">
//         <div className="badge">For Learners</div>
//         <h3 className="text-3xl md:text-4xl font-extrabold mt-2">A better learning experience</h3>
//         <div className="mt-6 grid md:grid-cols-3 gap-4">
//           {items.map((i) => (
//             <div key={i.title} className="p-6 rounded-2xl border border-base-300 bg-base-100">
//               <h4 className="font-bold">{i.title}</h4>
//               <p className="opacity-80 mt-1">{i.body}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Testimonials() {
//   const items = [
//     {
//       quote: "E‑strateji let me teach without worrying about bandwidth. My students finally keep up.",
//       name: "Marsha S.",
//       role: "Business Coach",
//     },
//     {
//       quote: "Uploading videos and auto‑quizzes saved me hours.",
//       name: "Wilgens M.",
//       role: "Finance Educator",
//     },
//     {
//       quote: "The themeable page made my brand feel premium from day one.",
//       name: "Vanessa A.",
//       role: "Creator",
//     },
//   ];
//   return (
//     <section className="py-16">
//       <div className="container mx-auto px-4">
//         <h3 className="text-3xl font-extrabold text-center">Creators are winning with E‑strateji</h3>
//         <div className="mt-8 carousel w-full">
//           {items.map((t, idx) => (
//             <div key={idx} id={`slide-${idx}`} className="carousel-item w-full justify-center">
//               <div className="max-w-3xl text-center">
//                 <p className="text-xl md:text-2xl font-semibold">“{t.quote}”</p>
//                 <p className="mt-4 opacity-70">{t.name} • {t.role}</p>
//                 <div className="mt-6 join">
//                   {items.map((_, i) => (
//                     <a key={i} href={`#slide-${i}`} className={`btn btn-sm join-item ${i===idx? 'btn-primary':'btn-outline'}`}>{i+1}</a>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function Pricing() {
//   const tiers = [
//     {
//       name: "Starter",
//       price: "$0",
//       desc: "Launch your first course",
//       features: ["1 course", "Theme pages", "Email support"],
//       cta: "Start free",
//       popular: false,
//     },
//     {
//       name: "Creator",
//       price: "$29/mo",
//       desc: "Grow your audience",
//       features: ["Unlimited courses", "Quizzes & transcripts", "Analytics"],
//       cta: "Choose Creator",
//       popular: true,
//     },
//     {
//       name: "Studio",
//       price: "$99/mo",
//       desc: "Scale with teams",
//       features: ["Team seats", "Advanced offline", "Priority support"],
//       cta: "Go Studio",
//       popular: false,
//     },
//   ];
//   return (
//     <section id="pricing" className="py-16 bg-base-200">
//       <div className="container mx-auto px-4">
//         <h3 className="text-3xl md:text-4xl font-extrabold text-center">Simple, creator‑friendly pricing</h3>
//         <div className="mt-10 grid md:grid-cols-3 gap-6">
//           {tiers.map((t) => (
//             <div key={t.name} className={`card bg-base-100 border ${t.popular ? 'border-primary' : 'border-base-300'} shadow-lg`}>
//               <div className="card-body">
//                 <div className="flex items-baseline justify-between">
//                   <h4 className="card-title">{t.name}</h4>
//                   {t.popular && <div className="badge badge-primary">Popular</div>}
//                 </div>
//                 <p className="text-4xl font-black">{t.price}</p>
//                 <p className="opacity-70">{t.desc}</p>
//                 <ul className="mt-4 space-y-2">
//                   {t.features.map((f) => (
//                     <li key={f} className="flex items-center gap-2"><span className="i">✔️</span> {f}</li>
//                   ))}
//                 </ul>
//                 <div className="card-actions mt-6">
//                   <button className={`btn ${t.popular ? 'btn-primary' : 'btn-outline'}`}>{t.cta}</button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function FAQ() {
//   const faqs = [
//     {
//       q: "Can learners access content offline?",
//       a: "Yes. Modules are cached with transcripts and quizzes. Progress syncs when back online.",
//     },
//     {
//       q: "Do I need a website to start?",
//       a: "No. Your themeable Creator Page is your branded hub with courses and media.",
//     },
//     {
//       q: "How do media packages work?",
//       a: "Pick a tier and we coordinate podcasts, papers/blogs, and social distribution around your launch.",
//     },
//   ];
//   return (
//     <section id="faq" className="py-16">
//       <div className="container mx-auto px-4">
//         <h3 className="text-3xl font-extrabold text-center">Frequently asked questions</h3>
//         <div className="mt-8 join join-vertical w-full">
//           {faqs.map((f, i) => (
//             <div key={i} className="collapse collapse-arrow join-item border border-base-300 bg-base-100">
//               <input type="checkbox" />
//               <div className="collapse-title text-lg font-medium">{f.q}</div>
//               <div className="collapse-content opacity-80">
//                 <p>{f.a}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// function FinalCTA() {
//   return (
//     <section className="py-16">
//       <div className="container mx-auto px-4">
//         <div className="hero bg-gradient-to-br from-primary to-secondary text-primary-content rounded-2xl">
//           <div className="hero-content text-center">
//             <div className="max-w-xl">
//               <h2 className="text-3xl md:text-4xl font-black">Ready to launch your creator brand?</h2>
//               <p className="mt-2 opacity-90">Premium pages. AI speed. Distribution that scales.</p>
//               <div className="mt-6 flex flex-wrap justify-center gap-3">
//                 <a className="btn">Become a Creator</a>
//                 <a className="btn btn-outline">Talk to our team</a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// function Footer() {
//   return (
//     <footer className="footer p-10 bg-base-100 border-t border-base-300">
//       <nav>
//         <h6 className="footer-title">Product</h6>
//         <a className="link link-hover">Features</a>
//         <a className="link link-hover">Pricing</a>
//         <a className="link link-hover">Changelog</a>
//       </nav>
//       <nav>
//         <h6 className="footer-title">Company</h6>
//         <a className="link link-hover">About</a>
//         <a className="link link-hover">Careers</a>
//         <a className="link link-hover">Press</a>
//       </nav>
//       <nav>
//         <h6 className="footer-title">Support</h6>
//         <a className="link link-hover">Help center</a>
//         <a className="link link-hover">Contact</a>
//         <a className="link link-hover">Status</a>
//       </nav>
//       <div>
//         <h6 className="footer-title">E‑strateji</h6>
//         <p className="opacity-70">Ship knowledge. Anywhere.</p>
//         <form className="form-control w-80 mt-3">
//           <label className="label">
//             <span className="label-text">Get updates</span>
//           </label>
//           <div className="join">
//             <input type="email" placeholder="you@example.com" className="input input-bordered join-item" />
//             <button className="btn btn-primary join-item">Subscribe</button>
//           </div>
//         </form>v
//       </div>
//     </footer>
//   );
// }
