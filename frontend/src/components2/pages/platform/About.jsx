// src/pages/about/EstratejiAboutPage.jsx
import React from "react";
import { Link } from "react-router-dom";

/* =========================================================
   Brand tokens (keep in sync with team pages)
   ======================================================= */
const brand = {
  apple: "#8DB600",
  heritage: "#C1272D",
  burnt: "#EE964B",
  ivory: "#FAF9F6",
  olive: "#3B3C36",
};

const waveMask =
  "M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,181.3C672,181,768,139,864,112C960,85,1056,75,1152,106.7C1248,139,1344,213,1392,250.7L1440,288L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z";

/* =========================================================
   Shared UI (same look/feel as Team pages)
   ======================================================= */
const Tile = ({ className = "", children }) => (
  <div
    className={
      "rounded-2xl border border-white/20 bg-white/50 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] " +
      className
    }
  >
    {children}
  </div>
);

const Pill = ({ children, color = brand.apple }) => (
  <span
    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs border border-gray-700/60 font-medium text-white"
    style={{ background: color }}
  >
    {children}
  </span>
);

const Tag = ({ children }) => (
  <span className="text-[11px] px-2 py-1 rounded bg-white/60 border border-gray-300/70">
    {children}
  </span>
);

const SectionTitle = ({ children, hint }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl sm:text-2xl font-bold">{children}</h2>
    {hint && <Pill color={hint.color}>{hint.label}</Pill>}
  </div>
);

/* =========================================================
   Data (content you supplied)
   ======================================================= */
const HERO = {
  title: "About E-strateji",
  subtitle:
    "E-strateji is the Caribbean’s home for creators and learners to create, learn, and connect.",
  cover:
    "https://res.cloudinary.com/dyeomcmin/image/upload/v1760137912/Screenshot_2025-10-10_at_7.11.08_PM_r27pok.png",
  pattern:
    "https://res.cloudinary.com/dyeomcmin/image/upload/v1760150338/Estrateji_Pattern_vsamr2.png",
};

const ABOUT_TEXT = `E-strateji is a Caribbean-born e-learning platform that empowers creators to build, sell, and scale courses, and helps learners gain practical, real-world skills that fit their reality.

Creators can easily design and publish courses, accept payments globally, and use our AI assistant to turn videos into transcripts and quizzes. With built-in analytics and automation, growing your audience becomes simple.

Learners access multilingual, culturally relevant content that even works offline — built for those in small regions who need real tools to Create, Learn, and Connect.

We turn local knowledge into income, visibility, and lasting opportunity.`;

const STORY = `In places like Haiti, Jamaica, or Dominica, opportunity doesn’t flow the same way it does elsewhere.
Platforms don’t recognize our documents. Tools don’t fit our realities. Sometimes, we need five different apps just to do what others can do with one.

Here, resilience isn’t a choice — it’s a way of life. Every dream comes with extra steps, extra costs, and extra doubt. But what was meant to break us ended up building us.

E-strateji was born from that spirit, turning our challenges into innovation. We’re creating tools made for us — creators, teachers, artists, and dreamers — that work offline, speak our languages, and understand our struggles.

A mobile-first platform where Caribbean creators can turn knowledge into income, visibility, and opportunity. Because we’re not waiting for access anymore — we’re building it.`;

const MISSION = `Empowering Caribbean creators to share what they know and help learners develop real, market-ready skills.
We’re closing the gap between talent and online opportunities, turning the Caribbean into a hub of innovation and growth.`;

const VISION = `A Caribbean where knowledge knows no borders, powered by our culture, tech, and community.
Where creators teach the world our languages, flavors, and stories — and no one has to leave home to find opportunity.
E-strateji is building that future, turning our knowledge into power, and the Caribbean into a global voice of creativity and unity.`;

const VALUES = [
  {
    name: "Community",
    blurb:
      "We grow together as one Caribbean, sharing knowledge across islands and generations.",
  },
  {
    name: "Accessibility",
    blurb:
      "Education should reach everyone — online, offline, and in every language.",
  },
  {
    name: "Authenticity",
    blurb:
      "Content that reflects our culture, realities, and lived experience.",
  },
  {
    name: "Innovation",
    blurb:
      "World-class, offline-first tools for creators and learners to do more.",
  },
  {
    name: "Impact",
    blurb:
      "Every course, story, and skill should open a door to real opportunity.",
  },
];

const FOUNDERS = [
  {
    name: "Jeffrey Jodarson Simin “Zaida”",
    role: "CEO & Co-Founder",
    quote:
      "“Born and raised in the Caribbean, I’m determined to build the next unicorn — right from our islands.”",
    headshot:
      "https://res.cloudinary.com/dyeomcmin/image/upload/v1760145224/1662682907647_kmcpgk.jpg",
    line:
      "Vision-driven builder focused on shaping E-strateji’s product, storytelling, and partnerships.",
  },
  {
    name: "Sébastien Fenelon",
    role: "CTO & Co-Founder",
    quote:
      "“It’s time to build technology that understands our struggles as Caribbean people and brings opportunities to our community.”",
    headshot:
      "https://res.cloudinary.com/dyeomcmin/image/upload/v1754422502/lehkzz3ra2vsyuxwc270.jpg",
    line:
      "Engineer & systems architect designing E-strateji’s offline-first, multilingual stack with integrated AI tools (quizzes, transcripts, smarter learning).",
  },
];

const TEAM = [
  {
    name: "Kalifa Facey",
    role: "Community & Social Media Manager",
    desc: "Connecting the heart of the people to the mission of the brand.",
    headshot:
      "https://res.cloudinary.com/dyeomcmin/image/upload/v1760461671/photo-output_vrz3cg.jpg",
  },
  {
    name: "Dormenyo Mawulorm Kwadzo",
    role: "Developer",
    desc: "Building the platform’s backbone and ensuring smooth, reliable performance.",
    headshot:
      "https://res.cloudinary.com/dyeomcmin/image/upload/v1759384367/estratejilab_logo_nbytcx.jpg",
  },
  {
    name: "Blessings Owusu Yeboah",
    role: "Developer",
    desc: "Crafting features that empower creators and learners alike.",
    headshot:
      "https://res.cloudinary.com/dyeomcmin/image/upload/v1759384367/estratejilab_logo_nbytcx.jpg",
  },
];

const FAQ = [
  {
    q: "What is E-strateji?",
    a: "E-strateji is a digital learning platform built by Caribbean creators, for Caribbean creators and learners. It helps creators monetize knowledge and learners access practical skills that match their reality.",
  },
  {
    q: "Who can become a creator on E-strateji?",
    a: "Any professional, artist, educator, or skilled individual in the Caribbean or diaspora can create courses and share expertise with a global audience.",
  },
  {
    q: "How do creators earn on E-strateji?",
    a: "Creators can sell courses directly, receive payments seamlessly, and track earnings using the platform’s analytics and automation tools.",
  },
  {
    q: "What tools help creators build courses?",
    a: "AI-powered tools to generate quizzes and transcripts, landing pages to showcase creators and courses, and analytics to monitor performance.",
  },
  {
    q: "Is E-strateji multilingual?",
    a: "Yes — we support Kreyòl, English, French, Spanish, and more.",
  },
  {
    q: "Can I use E-strateji offline?",
    a: "Yes — it’s offline-first, so learners can continue courses with limited connectivity.",
  },
  {
    q: "How do learners access courses?",
    a: "Browse, enroll, and complete courses on desktop or mobile, in your preferred language, at your own pace.",
  },
  {
    q: "Why was E-strateji created?",
    a: "To deliver accessible, culturally relevant learning and give creators a platform to monetize knowledge locally and globally.",
  },
  {
    q: "How does E-strateji support the Caribbean community?",
    a: "By providing tools, education, and exposure that help creators and learners grow, retain talent locally, and showcase Caribbean innovation worldwide.",
  },
  {
    q: "How can press or media contact E-strateji?",
    a: "Use the “Contact Press Team” link below or email our media team listed on the site.",
  },
];

/* =========================================================
   Local Components
   ======================================================= */

const PersonCard = ({ p }) => (
  <div className="rounded-2xl border border-white/30 bg-white/60 p-5">
    <div className="flex items-start gap-4">
      <img
        src={p.headshot}
        alt={`${p.name} headshot`}
        className="h-16 w-16 rounded-xl object-cover border border-white/50 flex-shrink-0"
        loading="lazy"
      />
      <div className="min-w-0">
        <div className="font-semibold">{p.name}</div>
        <div className="text-xs text-black/60">{p.role}</div>
        <p className="text-sm text-black/80 mt-2">{p.desc || p.line}</p>
        {p.quote && (
          <blockquote className="mt-3 text-sm italic text-black/70 border-l-2 pl-3 border-black/20">
            {p.quote}
          </blockquote>
        )}
      </div>
    </div>
  </div>
);

const FaqItem = ({ item, idx }) => (
  <details className="group rounded-xl border border-white/30 bg-white/60 px-4 py-3">
    <summary className="cursor-pointer list-none select-none flex items-center justify-between">
      <span className="font-medium text-sm sm:text-base">{idx + 1}. {item.q}</span>
      <span className="ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-black/20 text-xs">
        +
      </span>
    </summary>
    <p className="mt-3 text-sm text-black/80">{item.a}</p>
  </details>
);

/* =========================================================
   Page
   ======================================================= */
export default function EstratejiAboutPage() {
  return (
    <main className="min-h-screen pb-20 text-[#0b1220]">
      {/* Subtle background pattern */}
      <div
        aria-hidden
        className="pt-40 pointer-events-none fixed inset-0 -z-10 opacity-5 bg-repeat bg-center"
        style={{
          backgroundImage: `url('${HERO.pattern}')`,
          backgroundSize: "520px 520px",
          backgroundColor: brand.ivory,
        }}
      />

      {/* HERO */}
      <section className="relative h-[42svh] min-h-[320px] w-full pb-24 overflow-visible">
        <img
          src={HERO.cover}
          alt="E-strateji cover"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.25)_0%,rgba(0,0,0,.45)_100%)] mix-blend-multiply" />

        <svg
          className="absolute bottom-[-1px] rotate-180 left-0 w-full h-[120px] text-[color:var(--ivory)] z-0 pointer-events-none"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ color: brand.ivory }}
        >
          <path d={waveMask} fill="currentColor" />
        </svg>

{/* HERO HEADER — Simplified */}
<div className="relative max-w-5xl mx-auto px-4 z-20 pt-40 -translate-y-[clamp(6rem,9vw,14rem)]">
  <Tile className="p-0 shadow-lg overflow-hidden">
    {/* White content card */}
    <div className="rounded-xl bg-white/40 border border-gray-200 p-6 lg:p-8">

      {/* Logo on the right */}
      <div className="flex flex-col lg:flex-row items-center gap-6">
      <div className="flex-shrink-0">
          <img 
            src="https://res.cloudinary.com/dyeomcmin/image/upload/v1759369857/Estrateji-Symbol-Green_rmgvbp.png" 
            alt="Estrateji Logo"
            className="w-24 h-24 lg:w-32 lg:h-32"
          />
        </div>
        {/* Text content - centered */}
        <div className="flex-1 text-center lg:text-left">
          {/* tiny kicker */}
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border border-gray-300 bg-gray-100 mb-4">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: brand.apple }}
            />
            About E-STRATEJI
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {HERO.title}
          </h1>

          {/* Subtitle */}
          <p className="text-base text-gray-700 leading-relaxed mb-4">
            {HERO.subtitle}
          </p>

          {/* Capability pills */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
            <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-gray-100 border border-gray-300 text-gray-800">
              Offline-First
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-gray-100 border border-gray-300 text-gray-800">
              Multilingual
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-gray-100 border border-gray-300 text-gray-800">
              Creator-Led
            </span>
          </div>
        </div>

      
      </div>
    </div>
  </Tile>
</div>
      </section>

      <svg
        className="bottom-[-1px] left-0 w-full h-[80px] md:h-[100px] text-[#FAF9F6] z-0 pointer-events-none"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path d={waveMask} fill="currentColor" />
      </svg>

      {/* CONTENT */}
      <section className="max-w-6xl mx-auto px-4">
        {/* Intro / About */}
        <div className="grid gap-6 md:grid-cols-3">
          <Tile className="md:col-span-2 p-6 lg:p-7">
            <SectionTitle hint={{ label: "Overview", color: brand.burnt }}>
              About Us
            </SectionTitle>
            <p className="text-[15px] leading-relaxed text-black/80 whitespace-pre-wrap">
              {ABOUT_TEXT}
            </p>
          </Tile>

          <Tile className="p-6 lg:p-7">
            <SectionTitle hint={{ label: "Why now", color: brand.apple }}>
              At a glance
            </SectionTitle>
            <ul className="space-y-2 text-sm text-black/80">
              <li className="flex items-center gap-2">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: brand.apple }}
                />
                Built for the Caribbean & diaspora
              </li>
              <li className="flex items-center gap-2">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: brand.apple }}
                />
                Offline-first modules & low-data delivery
              </li>
              <li className="flex items-center gap-2">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: brand.apple }}
                />
                AI tools: transcripts & quizzes
              </li>
              <li className="flex items-center gap-2">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: brand.apple }}
                />
                Global payments & creator analytics
              </li>
            </ul>
          </Tile>
        </div>

        {/* Story / Mission / Vision / Values */}
        <div className="grid gap-6 md:grid-cols-3 mt-6">
          <Tile className="md:col-span-2 p-6 lg:p-7">
            <SectionTitle hint={{ label: "Origins", color: brand.heritage }}>
              Our Story
            </SectionTitle>
            <p className="text-[15px] leading-relaxed text-black/80 whitespace-pre-wrap">
              {STORY}
            </p>
          </Tile>

          <Tile className="p-6 lg:p-7">
            <SectionTitle hint={{ label: "Purpose", color: brand.apple }}>
              Our Mission
            </SectionTitle>
            <p className="text-sm text-black/80 whitespace-pre-wrap">{MISSION}</p>
          </Tile>

          <Tile className="p-6 lg:p-7">
            <SectionTitle hint={{ label: "Future", color: brand.burnt }}>
              Our Vision
            </SectionTitle>
            <p className="text-sm text-black/80 whitespace-pre-wrap">{VISION}</p>
          </Tile>

          <Tile className="md:col-span-1 p-6 lg:p-7">
            <SectionTitle hint={{ label: "Principles", color: brand.heritage }}>
              Our Values
            </SectionTitle>
            <ul className="space-y-3">
              {VALUES.map((v) => (
                <li key={v.name} className="text-sm">
                  <div className="font-semibold">{v.name}</div>
                  <div className="text-black/80">{v.blurb}</div>
                </li>
              ))}
            </ul>
          </Tile>
        </div>

        {/* Founders */}
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Tile className="md:col-span-2 p-6 lg:p-7">
            <SectionTitle hint={{ label: "Leaders", color: brand.apple }}>
              Meet the Founders
            </SectionTitle>
            <div className="grid gap-5 md:grid-cols-2">
              {FOUNDERS.map((p) => (
                <PersonCard key={p.name} p={p} />
              ))}
            </div>
          </Tile>
        </div>

        {/* Team */}
        <div className="grid gap-6 md:grid-cols-3 mt-6">
          <Tile className="md:col-span-3 p-6 lg:p-7">
            <SectionTitle hint={{ label: "E-strateji Lab", color: brand.burnt }}>
              The Team
            </SectionTitle>
            <p className="text-sm text-black/80 mb-5">
              E-strateji Lab is a growing collective of creators, developers, writers, and dreamers across the Caribbean and Africa.
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TEAM.map((p) => (
                <PersonCard key={p.name} p={p} />
              ))}
            </div>
          </Tile>
        </div>

        {/* CTA */}
        <Tile className="mt-8 p-6 md:p-8 text-center">
          <h3 className="text-lg md:text-xl lg:text-2xl font-bold">
            Be part of building Caribbean technology that works for us.
          </h3>
          <p className="text-black/80 mt-2 text-sm md:text-base">
            Whether you create, learn, or tell our story — there’s a place for you here.
          </p>
          <div className="mt-5 flex flex-col md:flex-row gap-3 justify-center">
            <Link
              to="/creator/signup"
              className="px-5 py-3 rounded-lg text-white font-semibold text-sm md:text-base"
              style={{ background: brand.apple }}
            >
              Join as a Creator
            </Link>
            <Link
              to="/courses"
              className="px-5 py-3 rounded-lg bg-white/70 border border-black/40 hover:bg-white text-sm md:text-base"
            >
              Start Learning
            </Link>
            <Link
              to="/press"
              className="px-5 py-3 rounded-lg bg-white/70 border border-black/40 hover:bg-white text-sm md:text-base"
            >
              Contact Press Team
            </Link>
          </div>
        </Tile>

        {/* FAQ */}
        <div className="grid gap-6 md:grid-cols-3 mt-8">
          <Tile className="md:col-span-3 p-6 lg:p-7">
            <SectionTitle hint={{ label: "Help", color: brand.heritage }}>
              Frequently Asked Questions
            </SectionTitle>
            <div className="grid gap-3">
              {FAQ.map((item, i) => (
                <FaqItem key={i} item={item} idx={i} />
              ))}
            </div>
          </Tile>
        </div>
      </section>
    </main>
  );
}
