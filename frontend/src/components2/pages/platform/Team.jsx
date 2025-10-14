// src/pages/team/EstratejiTeamPages.jsx
import React from "react";
import { Link } from "react-router-dom";

/* =========================================================
   Design tokens (brand)
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
   Generic bento/glass helpers
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

const Tag = ({ children }) => (
  <span className="text-[11px] px-2 py-1 rounded bg-white/60 border border-gray-300/70">
    {children}
  </span>
);

const Pill = ({ children, color = brand.apple }) => (
  <span
    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs border border-gray-700/60 font-medium text-white"
    style={{ background: color }}
  >
    {children}
  </span>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-xl sm:text-2xl font-bold mb-4">{children}</h2>
);

/* =========================================================
   Reusable Team Member Page
   ======================================================= */
function TeamMemberPage({
  name,
  role,
  companyLine, // e.g., "Co-Founder & CTO, E-stratèji"
  headshot,
  coverImage,
  skills = [],
  about = "",
  milestones = [],
  articles = [],
  links = {},
  ventures = [], // founders only
}) {return (
  <main className="min-h-screen pb-20 text-[#0b1220]">
    <div
      aria-hidden
      className="pt-40 pointer-events-none fixed inset-0 -z-10 opacity-5 bg-repeat bg-center"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dyeomcmin/image/upload/v1760150338/Estrateji_Pattern_vsamr2.png')",
        backgroundSize: "520px 520px",
        backgroundColor: "#FAF9F6",
      }}
    />
    
    {/* MOBILE HERO SECTION */}
    <section className="block md:hidden">
      <div className="relative h-[35svh] w-full pb-60 overflow-visible">
        <img
          src={coverImage}
          alt={`${name} cover`}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* subtle gradient overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.25)_0%,rgba(0,0,0,.45)_100%)] mix-blend-multiply" />

        {/* bottom curve mask */}
        <svg
          className="absolute bottom-[-1px] rotate-180 left-0 w-full h-[100px] text-[#FAF9F6] z-0 pointer-events-none"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path d={waveMask} fill="currentColor" />
        </svg>

        {/* Mobile Card - positioned with less overlap */}
        <div className="relative max-w-6xl mx-auto px-4 z-20 pt-40 -translate-y-32">
          <Tile className="p-4 shadow-xl mx-2">
            <div className="flex flex-col items-center gap-4 text-center">
              <img
                src={headshot}
                alt={`${name} headshot`}
                className="h-20 w-20 rounded-2xl object-cover border border-white/40"
                loading="eager"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-extrabold leading-tight">
                  {name.split(' ').slice(0, -1).join(' ')}{' '}
                  <span style={{ color: brand.ivory }}>
                    {name.split(' ').slice(-1)}
                  </span>
                </h1>
                <p className="text-sm text-black/70 mt-1">{companyLine}</p>

                {/* Skills tags - limited to 3 on mobile for more space */}
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  {skills.slice(0, 3).map((k) => (
                    <Tag key={k} className="text-xs">{k}</Tag>
                  ))}
                  {skills.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs bg-black/10 rounded-lg text-black/60">
                      +{skills.length - 3} more
                    </span>
                  )}
                </div>

                {/* Action buttons - compact on mobile */}
                <div className="mt-4 flex flex-col gap-2">
                  {links.linkedin && (
                    <a
                      href={links.linkedin}
                      className="px-4 py-2 rounded-lg bg-white/70 border border-white/40 hover:bg-white text-sm text-center"
                    >
                      LinkedIn
                    </a>
                  )}
                  {links.twitter && (
                    <a
                      href={links.twitter}
                      className="px-4 py-2 rounded-lg bg-white/70 border border-white/40 hover:bg-white text-sm text-center"
                    >
                      X (Twitter)
                    </a>
                  )}
                  {links.email && (
                    <a
                      href={`mailto:${links.email}`}
                      className="px-4 py-2 rounded-lg border text-white border-b-gray-100/60 font-semibold text-sm text-center"
                      style={{
                        background: brand.apple,
                      }}
                    >
                      Contact
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Tile>
        </div>
      </div>
    </section>

    {/* DESKTOP/TABLET HERO SECTION */}
    <section className="hidden md:block">
      <div className="relative h-[48svh] min-h-[320px] w-full pb-20 overflow-visible">
        <img
          src={coverImage}
          alt={`${name} cover`}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* subtle gradient overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.25)_0%,rgba(0,0,0,.45)_100%)] mix-blend-multiply" />

        {/* bottom curve mask */}
        <svg
          className="absolute bottom-[-1px] rotate-180 left-0 w-full h-[140px] text-[#FAF9F6] z-0 pointer-events-none"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path d={waveMask} fill="currentColor" />
        </svg>

        {/* Desktop Card - original positioning */}
        <div className="relative max-w-6xl mx-auto px-4 z-20 pt-60 -translate-y-[clamp(8rem,12vw,18rem)] lg:-translate-y-[clamp(12rem,14vw,24rem)]">
          <Tile className="p-6 lg:p-8 shadow-xl">
            <div className="flex items-start gap-4">
              <img
                src={headshot}
                alt={`${name} headshot`}
                className="h-24 w-24 lg:h-28 lg:w-28 rounded-2xl object-cover border border-white/40"
                loading="eager"
              />
              <div className="min-w-0">
                <h1 className="text-2xl lg:text-3xl font-extrabold leading-tight">
                  {name.split(' ').slice(0, -1).join(' ')}{' '}
                  <span style={{ color: brand.ivory }}>
                    {name.split(' ').slice(-1)}
                  </span>
                </h1>
                <p className="text-[15px] text-black/70">{companyLine}</p>

                {/* Skills tags - full display on desktop */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.map((k) => (
                    <Tag key={k}>{k}</Tag>
                  ))}
                </div>

                {/* Action buttons - horizontal on desktop */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {links.linkedin && (
                    <a
                      href={links.linkedin}
                      className="px-4 py-2 rounded-lg bg-white/70 border border-white/40 hover:bg-white"
                    >
                      LinkedIn
                    </a>
                  )}
                  {links.twitter && (
                    <a
                      href={links.twitter}
                      className="px-4 py-2 rounded-lg bg-white/70 border border-white/40 hover:bg-white"
                    >
                      X (Twitter)
                    </a>
                  )}
                  {links.email && (
                    <a
                      href={`mailto:${links.email}`}
                      className="px-4 py-2 rounded-lg border text-white border-b-gray-100/60 font-semibold"
                      style={{
                        background: brand.apple,
                      }}
                    >
                      Contact
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Tile>
        </div>
      </div>
    </section>

    <svg
      className="bottom-[-1px] left-0 w-full h-[80px] md:h-[100px] text-[#FAF9F6] z-0 pointer-events-none"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
    >
      <path d={waveMask} fill="currentColor" />
    </svg>

    {/* CONTENT SECTION - Adjusted spacing for mobile */}
   {/* CONTENT SECTION - Adjusted spacing for mobile */}
<section className="pt-5 sm:pt-20 max-w-6xl md:pt-20 lg:pt-0 mx-auto px-4">
  {/* Bento grid */}
  {/* MOBILE GRID SECTION - Single column */}
<section className="block md:hidden">
  <div className="grid gap-4  pt-32">
    {/* ABOUT */}
    <Tile className="p-5">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>About</SectionTitle>
        <Pill color={brand.burnt}>Profile</Pill>
      </div>
      <p className="text-sm leading-relaxed text-black/80 whitespace-pre-wrap">
        {about}
      </p>
    </Tile>

    {/* QUICK INFO */}
    <Tile className="p-5">
      <h3 className="font-semibold text-amber-600 mb-4 text-lg">Quick facts</h3>
      <ul className="space-y-3 text-sm text-black/80">
        {skills.slice(0, 6).map((s) => (
          <li key={s} className="flex items-center gap-3">
            <span
              className="inline-block h-2 w-2 rounded-full flex-shrink-0"
              style={{ background: brand.apple }}
            />
            <span className="break-words flex-1">{s}</span>
          </li>
        ))}
      </ul>
    </Tile>

    {/* MILESTONES */}
    <Tile className="p-5">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>Milestones</SectionTitle>
        <Pill color={brand.apple}>Timeline</Pill>
      </div>
      {milestones.length === 0 ? (
        <p className="text-sm text-black/60">
          Coming soon.
        </p>
      ) : (
        <ol className="relative border-s border-white/40 ps-4 space-y-4">
          {milestones.map((m, idx) => (
            <li key={idx} className="pl-2">
              <div className="absolute -start-[6px] mt-1.5 h-3 w-3 rounded-full border border-white/70 bg-white" />
              <div className="text-xs text-black/60">{m.date}</div>
              <div className="font-semibold text-sm">{m.title}</div>
              <p className="text-xs text-black/80 mt-1">{m.desc}</p>
            </li>
          ))}
        </ol>
      )}
    </Tile>

    {/* ARTICLES */}
    <Tile className="p-5">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>Articles</SectionTitle>
        <Pill color={brand.heritage}>Writing</Pill>
      </div>
      {articles.length === 0 ? (
        <p className="text-sm text-black/60">
          No articles yet.
        </p>
      ) : (
        <div className="space-y-3">
          {articles.map((a, i) => (
            <a
              key={i}
              href={a.href}
              className="block rounded-xl border border-white/30 bg-lime-500/30 p-4 hover:bg-white"
            >
              <div className="text-xs text-black/60">{a.type}</div>
              <div className="font-medium text-sm mt-1">{a.title}</div>
              {a.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {a.tags.map((t) => (
                    <Tag key={t} className="text-xs">{t}</Tag>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </Tile>

    {/* FOUNDERS: OTHER VENTURES */}
    {ventures.length > 0 && (
      <Tile className="p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Other Ventures</SectionTitle>
          <Pill color={brand.apple}>Founder</Pill>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {ventures.map((v, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/30 bg-orange-500/30 p-4"
            >
              <div className="flex items-center gap-3">
                {v.logo && (
                  <img
                    src={v.logo}
                    alt={`${v.name} logo`}
                    className="h-8 w-8 rounded-lg border border-white/40 object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{v.name}</div>
                  <div className="text-xs text-black/60 truncate">{v.tagline}</div>
                </div>
              </div>
              <p className="text-xs text-black/80 mt-3 line-clamp-3">{v.desc}</p>
              {v.href && (
                <div className="mt-3">
                  <a
                    href={v.href}
                    className="text-sm underline"
                    style={{ color: brand.heritage }}
                  >
                    Visit →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </Tile>
    )}
  </div>
</section>

{/* DESKTOP/TABLET GRID SECTION - Multi-column with custom spacing */}
<section className="hidden md:block">
  <div className="grid gap-6 md:grid-cols-3 lg:pt-0 md:-pt-32 sm:pt-32">
    {/* ABOUT */}
    <Tile className="md:col-span-2 p-6 lg:p-7">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>About</SectionTitle>
        <Pill color={brand.burnt}>Profile</Pill>
      </div>
      <p className="text-[15px] leading-relaxed text-black/80 whitespace-pre-wrap">
        {about}
      </p>
    </Tile>

    {/* QUICK INFO */}
    <Tile className="p-6 lg:p-7">
      <h3 className="font-semibold text-amber-600 mb-4">Quick facts</h3>
      <ul className="space-y-2 text-sm text-black/80">
        {skills.slice(0, 6).map((s) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: brand.apple }}
            />
            {s}
          </li>
        ))}
      </ul>
    </Tile>

    {/* MILESTONES */}
    <Tile className="md:col-span-2 p-6 lg:p-7">
      <div className="flex items-center justify-between mb-2">
        <SectionTitle>Milestones</SectionTitle>
        <Pill color={brand.apple}>Timeline</Pill>
      </div>
      {milestones.length === 0 ? (
        <p className="text-sm text-black/60">
          Coming soon.
        </p>
      ) : (
        <ol className="relative border-s border-white/40 ps-5 space-y-5">
          {milestones.map((m, idx) => (
            <li key={idx}>
              <div className="absolute -start-[7px] mt-1.5 h-3 w-3 rounded-full border border-white/70 bg-white" />
              <div className="text-sm text-black/60">{m.date}</div>
              <div className="font-semibold">{m.title}</div>
              <p className="text-sm text-black/80">{m.desc}</p>
            </li>
          ))}
        </ol>
      )}
    </Tile>

    {/* ARTICLES */}
    <Tile className="p-6 lg:p-7">
      <div className="flex items-center justify-between mb-2">
        <SectionTitle>Articles</SectionTitle>
        <Pill color={brand.heritage}>Writing</Pill>
      </div>
      {articles.length === 0 ? (
        <p className="text-sm text-black/60">
          No articles yet.
        </p>
      ) : (
        <div className="space-y-3">
          {articles.map((a, i) => (
            <a
              key={i}
              href={a.href}
              className="block rounded-xl border border-white/30 bg-lime-500/30 px-4 py-3 hover:bg-white"
            >
              <div className="text-xs text-black/60">{a.type}</div>
              <div className="font-medium">{a.title}</div>
              {a.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {a.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </Tile>

    {/* FOUNDERS: OTHER VENTURES */}
    {ventures.length > 0 && (
      <Tile className="md:col-span-3 p-6 lg:p-7">
        <div className="flex items-center justify-between mb-2">
          <SectionTitle>Other Ventures</SectionTitle>
          <Pill color={brand.apple}>Founder</Pill>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ventures.map((v, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/30 bg-orange-500/30 p-5"
            >
              <div className="flex items-center gap-3">
                {v.logo && (
                  <img
                    src={v.logo}
                    alt={`${v.name} logo`}
                    className="h-10 w-10 rounded-lg border border-white/40 object-cover"
                  />
                )}
                <div>
                  <div className="font-semibold">{v.name}</div>
                  <div className="text-xs text-black/60">{v.tagline}</div>
                </div>
              </div>
              <p className="text-sm text-black/80 mt-3">{v.desc}</p>
              {v.href && (
                <div className="mt-3">
                  <a
                    href={v.href}
                    className="text-sm underline"
                    style={{ color: brand.heritage }}
                  >
                    Visit →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </Tile>
    )}
  </div>
</section>

{/* CTA SECTION - Shared for both mobile and desktop */}
<div className="mt-8 md:mt-10 rounded-2xl border border-white/30 bg-white/50 p-5 md:p-8 text-center backdrop-blur-xl mx-2 md:mx-0">
  <h3 className="text-lg md:text-xl lg:text-2xl font-bold">
    Want to collaborate with {name.split(" ")[0]}?
  </h3>
  <p className="text-black/80 mt-2 text-sm md:text-base">
    Reach out for partnerships, speaking, or media.
  </p>
  <div className="mt-4 flex flex-col md:flex-row gap-3 justify-center">
    {links.email && (
      <a
        href={`mailto:${links.email}`}
        className="px-5 py-3 rounded-lg text-white font-semibold text-sm md:text-base"
        style={{
          background: brand.apple,
        }}
      >
        Contact
      </a>
    )}
    <Link
      to="/"
      className="px-5 py-3 rounded-lg bg-white/70 border border-black/40 hover:bg-white text-sm md:text-base"
    >
      Back to Home
    </Link>
  </div>
</div>
</section>
  </main>
);
}

/* =========================================================
   DATA (fill from LinkedIn you control)
   ======================================================= */

// Common hero fallback
const DEFAULT_COVER =
  "https://res.cloudinary.com/dyeomcmin/image/upload/v1760137912/Screenshot_2025-10-10_at_7.11.08_PM_r27pok.png";

// --- Sebastien Fenelon — Co-Founder & CTO
// --- Sebastien Fenelon — Co-Founder & CTO @ E-STRATEJI
export function TeamSebastien() {
    const data = {
      name: "Sebastien Fenelon",
      role: "Co-Founder & CTO @ E-STRATEJI",
      companyLine: "Co-Founder & CTO — E-STRATEJI • NYC & Caribbean",
      headshot:
        "https://res.cloudinary.com/dyeomcmin/image/upload/v1754422502/lehkzz3ra2vsyuxwc270.jpg",
      coverImage:
        "https://res.cloudinary.com/dyeomcmin/image/upload/v1760137912/Screenshot_2025-10-10_at_7.11.08_PM_r27pok.png",
  
      tagline:
        "Building the creator stack for the Caribbean: offline-friendly learning, fair economics, and AI tools that help teachers ship real skills.",
  
      links: {
        linkedin: "https://www.linkedin.com/in/sebastien-fenelon-b83171254/",
        email: "sebastien@estrateji.co",
        website: "https://estrateji.co",
        // optional extras:
        // twitter: "https://x.com/sebastienBuilds",
        // github: "https://github.com/sebastien509",
      },
  
      skills: [
        "Product Architecture",
        "Full-Stack Engineering (React/TS, Python/Flask)",
        "PostgreSQL & SQLAlchemy",
        "Edge AI (LLM/SLM), Retrieval & Quantization",
        "Video processing (captions/transcripts)",
        "Payments & Payouts (Stripe Connect)",
        "Security & Compliance",
        "Mobile performance & offline UX",
        "Design Systems & UX",
      ],
  
      about: `At E-STRATEJI, I lead product and platform engineering to help Caribbean creators teach what they live. We’re building an accessible learning stack: low-bandwidth video, offline modules, auto-captions/transcripts, and fair, transparent payouts. 
  I care about durable systems—fast, reliable, and respectful of privacy—so teachers can earn and learners can grow without data frictions.
  
  Previously I’ve built edge-native AI and developer platforms (InthraOS, ECLOS). That same obsession with privacy, performance, and trust now powers Estrateji’s creator tools and student experience.`,
  
      focusAreas: [
        "Offline-first modules & low-data delivery",
        "Auto-captions, transcripts, and quizzes",
        "Creator payouts & course analytics",
        "Mobile-first UX for the Caribbean",
        "Trust, privacy, and transparent economics",
      ],
  
      milestones: [
        {
          date: "2025 – Present",
          title: "Co-Founder & CTO — E-STRATEJI",
          desc: "Launched creator platform MVP, module pipeline (process → publish), transcript/captions, quiz gen, and Stripe Express payouts.",
        },
        {
          date: "2025",
          title: "E-STRATEJI Lab (Founding Program)",
          desc: "Started Estrateji Lab—hands-on internships and founder-track learning building the platform in public.",
        },
        {
          date: "2025",
          title: "Brand & Launch Campaign",
          desc: "Defined the E-STRATEJI brand system—Caribbean-first identity, bento + glass UI, and creator storytelling.",
        },
        {
          date: "Prior",
          title: "Founder — InthraOS / ECLOS",
          desc: "Edge-privacy infrastructure & a modern portfolio platform—principles that now inform Estrateji’s engine.",
        },
      ],
  
      projects: [
        {
          name: "E-STRATEJI Creator Studio",
          blurb:
            "Upload once → auto-process: transcripts, captions (VTT), quiz scaffolding, review & publish. Built for low-bandwidth realities.",
          href: "/creator",
          tags: ["Creator Tools", "Transcripts", "Quizzes"],
        },
        {
          name: "Offline Module Player",
          blurb:
            "Resilient playback with graceful degradation; progress tracking and offline logging for intermittent connectivity.",
          href: "/learn",
          tags: ["Offline-First", "Mobile"],
        },
        {
          name: "Payouts & Analytics",
          blurb:
            "Stripe Express integration, earnings snapshots, course metrics, and creator-friendly transparency.",
          href: "/creator/earnings",
          tags: ["Stripe", "Analytics"],
        },
        {
          name: "Auto-Quiz & Caption Pipeline",
          blurb:
            "Lightweight ASR + prompt scaffolding to draft checks-for-understanding; human-in-the-loop editing.",
          href: "/docs/teach",
          tags: ["AI Assist", "Assessment"],
        },
      ],
  
      articles: [
        {
          type: "Article",
          title:
            "Why Estrateji Is Offline-First: Designing for the Caribbean, Not the Data Center",
          href: "/articles/offline-first-caribbean",
          tags: ["Product", "Infra", "Access"],
        },
        {
          type: "Article",
          title:
            "The Creator Income Stack: Transparent Payouts & Practical Analytics",
          href: "/articles/creator-economics",
          tags: ["Payouts", "Analytics"],
        },
        {
          type: "Article",
          title:
            "From Captions to Quizzes: A Practical Pipeline for Learning Outcomes",
          href: "/articles/captions-to-quizzes",
          tags: ["Learning Design", "AI Assist"],
        },
        // {
        //   type: "Post",
        //   title:
        //     "E-STRATEJI Lab: Build a Startup, Learn in Public, Ship for Real Users",
        //   href: "/lab",
        //   tags: ["Internships", "Builders"],
        // },
      ],
  
      ventures: [
        {
          name: "E-STRATEJI",
          tagline: "Teach what you live. Learn what matters.",
          desc: "Creator platform for the Caribbean: offline-friendly modules, fair payouts, and community learning.",
          logo: "https://res.cloudinary.com/dyeomcmin/image/upload/v1759698943/edu-platform/estrateji-logo.png",
          href: "https://estrateji.co",
        },
        {
          name: "InthraOS",
          tagline: "Privacy-first OS for edge AI",
          desc: "Local models, consent logging, and control plane for compliant AI deployments.",
          logo:
            "https://res.cloudinary.com/dyeomcmin/image/upload/c_crop,ar_1:1/v1758554431/Screenshot_2025-07-26_at_4.42.46_PM_n8rauv.png",
          href: "https://inthraos.com",
        },
        {
          name: "ECLOS.IO",
          tagline: "Launch your portfolio in minutes",
          desc: "AI resume enhancer, analytics, and modern templates for professionals.",
          logo:
            "https://images.unsplash.com/photo-1520975922131-c4ec6e613a58?q=80&w=300&auto=format&fit=crop",
          href: "https://www.linkedin.com/company/eclos.io",
        },
      ],
  
      cta: {
        primary: { label: "Teach with E-STRATEJI", href: "/creator/signup" },
        secondary: { label: "Explore Courses", href: "/courses" },
      },
    };
  
    // Render with your shared bento/glass page component
    return <TeamMemberPage {...data} />;
  }
  

// --- Simin (Jeffrey) Jodarson — Co-Founder & CEO
// --- Simin (Jeffrey) Jodarson — Co-Founder & CEO
export function TeamSimin() {
    const data = {
      name: "Simin Jeffrey Jodarson",
      role: "Co-Founder & CEO",
      companyLine: "Co-Founder & CEO, E-stratèji",
      headshot:
        // TODO: replace with Simin’s headshot
        "https://res.cloudinary.com/dyeomcmin/image/upload/v1760145224/1662682907647_kmcpgk.jpg",
      coverImage:
        "https://res.cloudinary.com/dyeomcmin/image/upload/v1760137912/Screenshot_2025-10-10_at_7.11.08_PM_r27pok.png",
      skills: [
        "Brand Marketing",
        "Product Marketing",
        "Digital Marketing",
        "Content Strategy",
        "Social Media Marketing",
        "Marketing Strategy",
        "Advertising",
        "New Business Development",
        "Copywriting",
        "Community",
        "UI/UX Collaboration",
        "Email Marketing",
        "Blogging",
      ],
      about:
        `Simin Jeffrey Jodarson is a multidisciplinary brand + product marketer (since 2013) who fell in love with design after discovering Photoshop. 
  From early days experimenting with Publisher and drawing, he grew into a creative who channels emotion and story into visual systems and go-to-market.
        
  By 2015, he committed to turning passion into profession—owning brand impact, campaigns, and the craft behind them. 
  He’s navigated roles across a magazine, a spice co-founder stint, photography & production for Radio/TV, fashion event marketing, social media for restaurants, NGO and agency design, and co-founding a web app services company that shipped apps in agriculture and ride-hailing.
  
  In 2020, he paused to reflect, re-center, and redefine the mission: build projects that carry purpose, contribute to growth, and create positive impact for his community and the Caribbean. 
  Today, as Co-Founder & CEO of E-stratèji, he focuses on empowering creators with practical, market-ready education and tools.`,
      milestones: [
        {
          date: "Jul 2025 – Present",
          title: "Co-Founder & CEO — E-stratèji (Caribbean • Remote)",
          desc: "Leading vision, partnerships, and creator-focused growth; building an e-learning platform by Haitians, for the Caribbean.",
        },
        {
          date: "Jan 2021 – Present",
          title: "Chief Executive Officer — Zabelbok (Dominican Republic)",
          desc: "Built a solutions-first creative firm (‘a very good cocktail of skills’) covering brand, content, social, ads, and web.",
        },
        {
          date: "Feb 2020 – Present",
          title: "Chief Executive Officer — Cayman Wood",
          desc: "Executive leadership; growth, partnerships, and market development.",
        },
        {
          date: "2015",
          title: "Professional Pivot to Brand/Design",
          desc: "Turned passion into profession; focused on brand impact and campaign execution.",
        },
        {
          date: "2013",
          title: "Design Origins",
          desc: "Discovered Photoshop, began self-training via YouTube; early love for drawing and layout tools.",
        },
      ],
      articles: [
        {
          type: "Post",
          title:
            "What if the next big tech company came from the Caribbean? (E-stratèji Lab)",
          href: "#",
          tags: ["Caribbean", "Education", "Internship", "E-stratèji"],
        },
        {
          type: "Post",
          title:
            "Being Caribbean: roots, resilience, and building with purpose",
          href: "#",
          tags: ["Identity", "Community", "Culture"],
        },
        {
          type: "Post",
          title:
            "Raw moments don’t disqualify you from building. They shape the blueprint.",
          href: "#",
          tags: ["Leadership", "Mental Health", "Founders"],
        },
        // {
        //   type: "Post",
        //   title:
        //     "We give creators the tools to turn real-world skills into community-driven courses.",
        //   href: "#",
        //   tags: ["Creator Economy", "E-learning", "Go-to-Market"],
        // },
        // {
        //   type: "Post",
        //   title:
        //     "This isn’t just a logo. It’s a statement. A declaration that Haitians build tech.",
        //   href: "#",
        //   tags: ["Brand", "Identity", "HaitianTech"],
        // },
      ],
      links: {
        linkedin:
          "https://www.linkedin.com/in/jeffrey-jodarson-simin-2735671b1/",
        email: "hello@estrateji.com",
        // twitter: "", // add if applicable
      },
      ventures: [
        {
          name: "Zabelbok",
          tagline: "A very good cocktail of skills",
          desc: "Solutions-first creative/marketing firm: brand, content, social, ads, web, and GTM execution.",
          logo:
            "https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?q=80&w=300&auto=format&fit=crop",
          href: "#",
        },
        {
          name: "Cayman Wood",
          tagline: "Executive leadership",
          desc: "Growth, partnerships, and operations across products and services.",
          logo:
            "https://images.unsplash.com/photo-1499933374294-4584851497cc?q=80&w=300&auto=format&fit=crop",
          href: "#",
        },
        {
          name: "E-stratèji",
          tagline: "Co-Founder & CEO",
          desc: "E-learning for the Caribbean: practical, creator-led, community-powered.",
          logo:
            "https://res.cloudinary.com/dyeomcmin/image/upload/v1758554431/Screenshot_2025-07-26_at_4.42.46_PM_n8rauv.png",
          href: "/",
        },
      ],
    };
  
    return <TeamMemberPage {...data} />;
  }
  
// --- Kalifa Facey — Social Media Manager & Communications
// --- Kalifa Facey — Social Media & Communications @ E-STRATEJI
export function TeamKalifa() {
    const data = {
      name: "Kalifa Facey",
      role: "Social Media & Communications @ E-STRATEJI",
      companyLine: "Kingston, Jamaica • E-STRATEJI",
      headshot:
        "https://res.cloudinary.com/dyeomcmin/image/upload/v1760461671/photo-output_vrz3cg.jpg", // swap to your asset
      coverImage:
        "https://res.cloudinary.com/dyeomcmin/image/upload/v1760137912/Screenshot_2025-10-10_at_7.11.08_PM_r27pok.png", // warm tropical/Caribbean vibe
  
      tagline:
        "Media & marketing strategist blending creative direction with data—telling the Caribbean’s stories with clarity, consistency, and heart.",
  
      links: {
        linkedin: "https://www.linkedin.com/in/kalifa-facey-210388249/",
        email: "press@estrateji.co",
        website: "https://estrateji.co",
        // instagram, x, portfolio etc. can be added here
      },
  
      skills: [
        "Brand Strategy",
        "Social Media Campaigns",
        "Content Design & Creative Direction",
        "Copywriting & Editorial Calendars",
        "Community Growth",
        "Analytics & Reporting",
        "Influencer/Partner Collabs",
        "Event & Program Communications",
      ],
  
      about: `Creative professional with a background in media and design, now focused on brand strategy and digital communications. At E-STRATEJI I help shape the voice of the platform—launching campaigns, building community momentum, and turning creator stories into growth. Currently pursuing a BSc in Economics & Statistics at UWI Mona, I bring both creative intuition and analytical rigor to help brands grow with purpose.`,
  
      focusAreas: [
        "Always-on social + creator storytelling",
        "Launch campaigns for new courses/features",
        "Community programs & internship comms",
        "Design systems for social (templates, motion)",
        "Channel analytics & growth experiments",
      ],
  
      milestones: [
        {
          date: "2025 – Present",
          title: "Social Media & Communications — E-STRATEJI",
          desc: "Built the editorial playbook; launched Caribbean identity campaign; increased engagement via story-first content and creator spotlights.",
        },
        {
          date: "2024 – 2025",
          title: "Hall Chairwoman — UWI Mona Guild",
          desc: "Led student initiatives and comms, coordinated events, and advocated for student needs; strengthened collaboration and participation.",
        },
        {
          date: "2023 – 2024",
          title: "Social Media Associate — Afrocents Podcast",
          desc: "Managed content calendar, creative assets, and growth strategies across channels.",
        },
        {
          date: "Awards",
          title: "Leadership & Service",
          desc: "Role Model of the Year • Alumnae Trophy for Community Service • Angela King Leadership Academy Trophy • Excellence in Volunteerism & Outreach.",
        },
      ],
  
      projects: [
        {
          name: "E-STRATEJI ‘Caribbean Rising’ Campaign",
          blurb:
            "Identity & launch series celebrating Caribbean creativity—shorts, reels, and creator quotes packaged with a consistent, glass-morphism visual system.",
          href: "/campaigns/caribbean-rising",
          tags: ["Brand", "Motion", "Community"],
        },
        {
          name: "Creator Stories: From Skill to Course",
          blurb:
            "Editorial mini-features that follow a creator’s journey from idea to published module, increasing course conversion and trust.",
          href: "/stories/creators",
          tags: ["Editorial", "Growth"],
        },
        {
          name: "Social Design Library",
          blurb:
            "Reusable templates for announcements, course drops, labs, and updates—keeping design fast, accessible, and on-brand.",
          href: "/brand/design-library",
          tags: ["DesignOps", "Templates"],
        },
        {
          name: "Community & Program Comms",
          blurb:
            "Messaging frameworks and content for E-STRATEJI Lab, partnerships, and in-person events.",
          href: "/lab",
          tags: ["Programs", "Comms"],
        },
      ],
  
      articles: [
        {
          type: "Article",
          title: "Story-First Social: Turning Missions into Momentum",
          href: "/articles/story-first-social",
          tags: ["Brand", "Community"],
        },
        {
          type: "Article",
          title: "Designing a Social System: Templates that Scale Creativity",
          href: "/articles/social-design-system",
          tags: ["DesignOps", "Templates"],
        },
        {
          type: "Article",
          title: "Caribbean Voice, Global Stage: Building a Cross-Border Brand",
          href: "/articles/caribbean-voice-global-stage",
          tags: ["Strategy", "Identity"],
        },
      ],
  
      // ventures: [
      //   {
      //     name: "E-STRATEJI",
      //     tagline: "Teach what you live. Learn what matters.",
      //     desc: "Creator platform for the Caribbean—offline-friendly learning, fair payouts, and community-driven growth.",
      //     logo:
      //       "https://res.cloudinary.com/dyeomcmin/image/upload/v1759698943/edu-platform/estrateji-logo.png",
      //     href: "https://estrateji.co",
      //   },
      // ],
  
      recognition: [
        "President — I’m Glad I’m a Girl Foundation (women’s rights & youth leadership)",
        "Leadership & service awards (Mary Seacole Hall)",
      ],
  
      education: [
        {
          school: "The University of the West Indies, Mona",
          program: "BSc — Economics & Statistics",
          years: "2022–2025",
        },
        {
          school: "deCarteret College",
          program: "High School Diploma — Foreign Languages & Literatures",
          highlights:
            "Deputy Head Girl • Debate Society (Events Planner & President) • Theatre Arts Collective",
        },
      ],
  
      cta: {
        primary: { label: "Follow E-STRATEJI", href: "https://estrateji.co" },
        secondary: { label: "Press & Partnerships", href: "mailto:press@estrateji.co" },
      },
    };
  
    return <TeamMemberPage {...data} />;
  }
  