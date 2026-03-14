import { FormEvent, useMemo, useState } from "react";
import { type DetailSlug, type PlanSlug } from "./publicContent";

interface LandingPageProps {
  onLogin: () => void;
  onOpenDetail: (slug: DetailSlug) => void;
  onStartPlan: (plan: PlanSlug) => void;
}

type AudienceMode = "platform" | "school";

interface FeatureCard {
  title: string;
  body: string;
  accent: string;
  icon: "shield" | "users" | "chart" | "spark";
}

const navItems = [
  { label: "Platform", target: "hero" },
  { label: "Plans", target: "plans" },
  { label: "Why Acadex?", target: "benefits" },
  { label: "Resources", target: "footer" }
];

const featureSets: Record<AudienceMode, FeatureCard[]> = {
  platform: [
    {
      title: "Strict school isolation",
      body: "Every school runs inside its own tenant boundary with platform oversight and tenant-aware access.",
      accent: "bg-[#eefc9c]",
      icon: "shield"
    },
    {
      title: "Central provisioning",
      body: "Super admins create schools, assign plans, and launch the first school admin from one control layer.",
      accent: "bg-white",
      icon: "users"
    },
    {
      title: "Finance and analytics",
      body: "Track invoices, collections, and cross-tenant performance without jumping between tools.",
      accent: "bg-white",
      icon: "chart"
    },
    {
      title: "Feature controls",
      body: "Switch feature flags on or off by plan and scale from one school to many on the same platform.",
      accent: "bg-white",
      icon: "spark"
    }
  ],
  school: [
    {
      title: "Academic operations",
      body: "Attendance, grading, classes, subjects, and report workflows stay connected in one workspace.",
      accent: "bg-[#eefc9c]",
      icon: "shield"
    },
    {
      title: "Role-based team setup",
      body: "School admins can add teachers, students, parents, and other staff from inside their tenant dashboard.",
      accent: "bg-white",
      icon: "users"
    },
    {
      title: "Daily insight",
      body: "See attendance, fee collection, announcements, and academic activity in one operational picture.",
      accent: "bg-white",
      icon: "chart"
    },
    {
      title: "Built to grow",
      body: "Move from manual work to a full school operating system without changing your institutional structure.",
      accent: "bg-white",
      icon: "spark"
    }
  ]
};

const planCards = [
  {
    name: "Starter",
    price: "D100 per student",
    tone: "bg-[#f5d8dd]",
    features: [
      "Student records and class management",
      "Attendance tracking and announcements",
      "School admin access for daily operations"
    ]
  },
  {
    name: "Growth",
    price: "D150 per personnel",
    tone: "bg-[#dfe8ff]",
    features: [
      "Teacher and staff management",
      "Finance module and payment tracking",
      "Advanced dashboards and reporting"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom blended",
    tone: "bg-[#ffe3a3]",
    features: [
      "Multi-school rollout and central oversight",
      "Custom feature enablement and analytics",
      "Priority onboarding and implementation support"
    ]
  }
];

const testimonials = [
  {
    stars: "5 of 5",
    quote: "Acadex gave us one operating layer for academics, finance, and communication without losing tenant boundaries.",
    name: "Janet Ceesay",
    role: "Operations Director"
  },
  {
    stars: "5 of 5",
    quote: "The structure is what sold it for us. Platform owners stay in control and school admins still own daily work.",
    name: "Musa Sowe",
    role: "School Administrator"
  },
  {
    stars: "5 of 5",
    quote: "Attendance, exams, fee tracking, and messaging finally feel like one product instead of a stack of disconnected tools.",
    name: "Fatou Bojang",
    role: "Academic Lead"
  }
];

const footerGroups = [
  {
    title: "Platform",
    links: ["Multi-tenant schools", "Role management", "Finance and billing", "Analytics"]
  },
  {
    title: "Resources",
    links: ["Deployment guide", "Product updates", "Support center", "Engineering notes"]
  },
  {
    title: "Use cases",
    links: ["Private schools", "Campus groups", "Growing institutions", "Platform operators"]
  }
];

const heroImages = {
  admin:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  students:
    "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=900&q=80"
};

const heroAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=240&q=80"
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function IconArrow() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 6.5v11l9-5.5-9-5.5Z" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M6.8 3.5h2.6l1.2 4-1.7 1.7a15 15 0 0 0 6 6l1.7-1.7 4 1.2v2.6c0 .7-.6 1.3-1.3 1.3C10 20.6 3.5 14 3.5 5a1.5 1.5 0 0 1 1.3-1.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M4 6.5h16v11H4z" stroke="currentColor" strokeWidth="1.7" />
      <path d="m5 8 7 5 7-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="m5 12 4.2 4.2L19 6.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function FeatureIcon({ name }: { name: FeatureCard["icon"] }) {
  if (name === "shield") {
    return (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path d="M12 3 5.5 5.5v5.8c0 4 2.7 7.6 6.5 9.2 3.8-1.6 6.5-5.2 6.5-9.2V5.5L12 3Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 19a4.5 4.5 0 0 1 9 0M13 19a3.5 3.5 0 0 1 7 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "chart") {
    return (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path d="M5 19V9m7 10V5m7 14v-7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M12 3v6m0 6v6M3 12h6m6 0h6m-3.5-6.5 1.5-1.5M5 19l1.5-1.5m0-11L5 5m14 14-1.5-1.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function SocialIcon({ label }: { label: string }) {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-xs font-semibold text-ink">
      {label}
    </span>
  );
}

function Avatar({ src, label }: { src: string; label: string }) {
  return (
    <span className="inline-flex h-14 w-14 overflow-hidden rounded-full border-[3px] border-white bg-ink shadow-sm">
      <img alt={label} className="h-full w-full object-cover" loading="lazy" src={src} />
    </span>
  );
}

function detailSlugFromTitle(title: string): DetailSlug {
  switch (title) {
    case "Strict school isolation":
      return "strict-school-isolation";
    case "Central provisioning":
      return "central-provisioning";
    case "Finance and analytics":
      return "finance-and-analytics";
    case "Feature controls":
      return "feature-controls";
    case "Academic operations":
      return "academic-operations";
    case "Role-based team setup":
      return "role-based-team-setup";
    case "Daily insight":
      return "daily-insight";
    default:
      return "built-to-grow";
  }
}

export function LandingPage({ onLogin, onOpenDetail, onStartPlan }: LandingPageProps) {
  const [audienceMode, setAudienceMode] = useState<AudienceMode>("platform");
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const featureCards = useMemo(() => featureSets[audienceMode], [audienceMode]);

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setEmailMessage("Enter a work email to continue.");
      return;
    }

    setEmailMessage(`Thanks. We will use ${email.trim()} for your platform onboarding request.`);
    onLogin();
  }

  function handleNavClick(target: string) {
    setMobileMenuOpen(false);
    scrollToId(target);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(194,65,12,0.18),transparent_26%),radial-gradient(circle_at_85%_15%,rgba(17,24,39,0.12),transparent_24%),linear-gradient(180deg,#f8f5ef_0%,#efe3cf_52%,#ecddc8_100%)] text-ink">
      <div className="w-full bg-[linear-gradient(135deg,#fbf2ea_0%,#f8f5ef_48%,#f3eee7_100%)]">
        <header className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-5 px-6 py-6 md:px-10">
          <button className="text-left" onClick={() => scrollToId("hero")} type="button">
            <p className="text-xs uppercase tracking-[0.45em] text-ember/60">Acadex</p>
            <h1 className="mt-2 hidden font-display text-3xl sm:block">School Management Cloud</h1>
          </button>

          <nav className="hidden items-center gap-8 text-sm text-black/65 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.label}
                className="transition hover:text-black"
                onClick={() => scrollToId(item.target)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              aria-expanded={mobileMenuOpen}
              aria-label="Open menu"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-ink lg:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              type="button"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
              </svg>
            </button>
            <button
              className="hidden rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 sm:inline-flex"
              onClick={onLogin}
              type="button"
            >
              School sign in
            </button>
          </div>
        </header>

        {mobileMenuOpen ? (
          <div className="mx-6 rounded-[1.8rem] bg-white/90 p-4 shadow-lg shadow-black/5 backdrop-blur lg:hidden md:mx-10">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-black/70 transition hover:bg-black/5 hover:text-black"
                  onClick={() => handleNavClick(item.target)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
              <button
                className="mt-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogin();
                }}
                type="button"
              >
                School sign in
              </button>
            </div>
          </div>
        ) : null}

        <section className="border-t border-white/50" id="hero">
          <div className="mx-auto grid max-w-[1440px] gap-8 overflow-hidden px-6 py-8 md:px-10 lg:grid-cols-[0.98fr_1.02fr] lg:py-12">
            <div className="relative min-h-[420px] rounded-[2.1rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.16))] p-4 sm:min-h-[520px] sm:p-6 lg:min-h-[620px]">
              <div className="absolute left-1 top-16 hidden -rotate-90 text-xs uppercase tracking-[0.35em] text-black/30 md:block">
                Scroll down
              </div>

              <div className="absolute left-4 top-4 z-10 h-32 w-32 overflow-hidden rounded-[1.4rem] shadow-xl shadow-black/10 sm:left-8 sm:top-10 sm:h-44 sm:w-44 md:h-56 md:w-56">
                <img
                  alt="School administrators collaborating around a laptop"
                  className="h-full w-full object-cover"
                  loading="eager"
                  src={heroImages.admin}
                />
              </div>

              <div className="absolute right-4 top-16 z-10 h-40 w-40 overflow-hidden rounded-[1.5rem] shadow-2xl shadow-black/10 sm:right-auto sm:left-28 sm:top-[9.5rem] sm:h-[240px] sm:w-[220px] md:left-36 md:top-[12rem] md:h-[320px] md:w-[290px]">
                <img
                  alt="Students smiling and studying together in a classroom"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  src={heroImages.students}
                />
              </div>

              <div className="absolute left-4 top-[10.5rem] z-20 w-[160px] rounded-[1.2rem] bg-white/92 p-4 shadow-xl shadow-black/10 backdrop-blur sm:left-4 sm:top-[17rem] sm:w-[210px] sm:rounded-[1.6rem] sm:p-5 md:left-6 md:top-[18rem] md:w-[220px]">
                <p className="text-xs uppercase tracking-[0.2em] text-black/40">Attendance</p>
                <p className="mt-3 text-3xl font-semibold text-ember sm:mt-4 sm:text-4xl">96%</p>
                <p className="mt-2 text-sm text-black/55">Daily presence across active classes</p>
              </div>

              <div className="absolute bottom-24 left-4 right-4 hidden rounded-[1.5rem] bg-[linear-gradient(180deg,#ffffff_0%,#f8ede4_100%)] p-4 shadow-2xl shadow-black/10 sm:block sm:bottom-8 sm:left-[11rem] sm:right-auto sm:w-[300px] sm:rounded-[2rem] sm:p-5 md:left-[18.5rem] md:top-[22rem] md:bottom-auto md:w-[320px]">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.25em] text-black/45">Operator view</p>
                  <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">Live</span>
                </div>
                <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
                  <div className="rounded-2xl bg-[#fff3ea] p-4">
                    <p className="text-sm font-semibold">New school onboarding</p>
                    <p className="mt-1 text-sm text-black/60">Gainako Academy added with Growth plan and first school admin provisioned.</p>
                  </div>
                  <div className="rounded-2xl bg-[#f2f3f6] p-4">
                    <p className="text-sm font-semibold">Finance pulse</p>
                    <p className="mt-1 text-sm text-black/60">$101,500 collected this term across active school tenants.</p>
                  </div>
                  <div className="rounded-2xl bg-[#edf7ea] p-4">
                    <p className="text-sm font-semibold">Teacher coverage</p>
                    <p className="mt-1 text-sm text-black/60">36 assignments mapped to classes and subjects this week.</p>
                  </div>
                </div>
              </div>

              <div className="absolute left-[23rem] top-16 hidden h-24 w-24 items-center justify-center rounded-[1.5rem] border-4 border-ember bg-white/90 lg:flex">
                <svg aria-hidden="true" className="h-10 w-10 text-ember" fill="none" viewBox="0 0 24 24">
                  <path d="M4 17h16M7 17V7l5-3 5 3v10M10 10h4M10 13h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
              </div>

              <div className="absolute bottom-4 left-4 right-4 z-20 rounded-[1.8rem] border border-black/10 bg-white/88 px-4 py-4 shadow-lg shadow-black/5 backdrop-blur sm:bottom-8 sm:left-10 sm:right-auto sm:rounded-[2.4rem] sm:px-5">
                <div className="flex -space-x-3">
                  {heroAvatars.map((avatar, index) => (
                    <Avatar key={avatar} label={`Acadex reviewer ${index + 1}`} src={avatar} />
                  ))}
                </div>
                <p className="mt-4 text-sm font-semibold md:text-base">8.9 platform score</p>
                <p className="text-sm text-black/55 md:text-base">320 pilot feedback reviews</p>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.35em] text-ember/70">Multi-tenant school SaaS</p>
              <h2 className="mt-4 max-w-2xl font-display text-5xl leading-[0.98] md:text-7xl">
                Experience school operations you can
                <span className="text-ember"> truly control.</span>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-black/65 md:text-lg">
                Acadex helps platform owners onboard schools, lets school admins build their teams, and keeps academics,
                attendance, grading, finance, and communication running from one secure system.
              </p>

              <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  className="inline-flex items-center gap-3 rounded-full bg-ink px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-black/10"
                  onClick={onLogin}
                  type="button"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                    <IconArrow />
                  </span>
                  Open dashboard
                </button>
                <button
                  className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-4 text-sm font-semibold text-black shadow-lg shadow-black/5"
                  onClick={() => scrollToId("benefits")}
                  type="button"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ember/10 text-ember">
                    <IconPlay />
                  </span>
                  View platform walkthrough
                </button>
              </div>

              <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-center">
                <div className="flex flex-col">
                  <span className="text-sm uppercase tracking-[0.2em] text-black/45">Built for</span>
                  <span className="mt-2 text-lg font-semibold">Private schools, academies, and campus groups in The Gambia</span>
                </div>
                <div className="hidden h-12 w-px bg-black/10 md:block" />
                <div className="space-y-1 text-sm text-black/60">
                  <p>Super admins add schools and assign plans</p>
                  <p>School admins add teachers, students, parents, and staff</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-12 md:px-10" id="benefits">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-black/40">Why Acadex</p>
              <h3 className="mt-3 font-display text-4xl md:text-5xl">Why schools choose Acadex?</h3>
            </div>
            <div className="inline-flex rounded-full bg-white p-2 shadow-lg shadow-black/5">
              <button
                className={`rounded-full px-6 py-3 text-sm font-semibold ${audienceMode === "platform" ? "bg-ink text-white" : "text-black/55"}`}
                onClick={() => setAudienceMode("platform")}
                type="button"
              >
                Platform
              </button>
              <button
                className={`rounded-full px-6 py-3 text-sm font-semibold ${audienceMode === "school" ? "bg-ink text-white" : "text-black/55"}`}
                onClick={() => setAudienceMode("school")}
                type="button"
              >
                School
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((card) => (
              <article key={card.title} className={`rounded-[1.8rem] p-5 shadow-lg shadow-black/5 ${card.accent}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink shadow-sm">
                  <FeatureIcon name={card.icon} />
                </div>
                <h4 className="mt-5 text-2xl font-semibold leading-tight">{card.title}</h4>
                <p className="mt-3 text-sm leading-7 text-black/60">{card.body}</p>
                <button
                  className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black/70"
                  onClick={() => onOpenDetail(detailSlugFromTitle(card.title))}
                  type="button"
                >
                  Learn more
                </button>
              </article>
            ))}
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="relative min-h-[280px] rounded-[2.2rem] bg-[linear-gradient(135deg,#fff0e4_0%,#f5f0e8_100%)] p-6 shadow-lg shadow-black/5 sm:min-h-[340px] sm:p-8 md:min-h-[380px]">
              <div className="absolute left-6 top-8 rounded-full border-[10px] border-ink px-5 py-4 text-center text-sm font-semibold uppercase tracking-[0.2em] text-ink">
                Best fit
                <div>for scaling schools</div>
              </div>
              <div className="absolute bottom-8 left-6 h-36 w-36 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ffffff_0%,#f7d9c7_45%,#eca57a_100%)] sm:left-10 sm:h-56 sm:w-56" />
              <div className="absolute bottom-10 left-24 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_30%_30%,#f7f2e8_0%,#d9dfd0_45%,#adc49b_100%)] sm:bottom-14 sm:left-36 sm:h-48 sm:w-48" />
              <div className="absolute right-4 top-4 max-w-[210px] rounded-3xl bg-white/85 px-4 py-3 shadow-lg shadow-black/5 sm:right-10 sm:top-10 sm:max-w-[260px] sm:px-5 sm:py-4">
                <p className="text-xs uppercase tracking-[0.25em] text-black/45">Plan-enabled features</p>
                <p className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">Analytics, finance, parent portal</p>
              </div>
              <div className="absolute bottom-10 right-8 space-y-3">
                <div className="h-3 w-3 rounded-full bg-ink" />
                <div className="h-3 w-3 rounded-full bg-ember/50" />
                <div className="h-3 w-3 rounded-full bg-moss/50" />
              </div>
            </div>

            <div>
              <h3 className="font-display text-4xl leading-tight md:text-5xl">
                Designed for platform owners and school admins working side by side.
              </h3>
              <p className="mt-5 max-w-xl text-base leading-7 text-black/65">
                Public signup is not the model here. Platform owners create school tenants, assign plans, and enable
                features. Each school admin then builds out the rest of the school team from within their isolated dashboard.
              </p>
              <div className="mt-6 space-y-4">
                {[
                  "Tenant-aware school onboarding from the platform dashboard",
                  "Role-based team creation for school admins",
                  "Analytics, attendance, exams, and finance in one operating layer"
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-base">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white">
                      <IconCheck />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <button className="rounded-full bg-ink px-6 py-4 text-sm font-semibold text-white" onClick={() => onOpenDetail("central-provisioning")} type="button">
                  Read more
                </button>
                <button
                  className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 shadow-lg shadow-black/5"
                  onClick={onLogin}
                  type="button"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-ink">
                    <IconPhone />
                  </span>
                  <span className="text-left">
                    <span className="block text-sm text-black/45">Contact sales</span>
                    <span className="block text-sm font-semibold">Platform onboarding team</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-8 md:px-10" id="plans">
          <div className="grid gap-5 lg:grid-cols-3">
            {planCards.map((plan) => (
              <article key={plan.name} className={`rounded-[2rem] p-5 shadow-lg shadow-black/5 ${plan.tone}`}>
                <div className="rounded-[1.6rem] bg-white p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-semibold">{plan.name}</p>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-black/55">Plan</span>
                  </div>
                  <p className="mt-4 font-display text-5xl">{plan.price}</p>
                  <p className="mt-1 text-sm text-black/50">priced in Gambian dalasi by school size and billing basis</p>
                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="rounded-2xl bg-sand/60 px-4 py-3 text-sm">
                        {feature}
                      </div>
                    ))}
                  </div>
                  <button
                    className="mt-6 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black/75 shadow-sm"
                    onClick={() => onStartPlan(plan.name.toLowerCase() as PlanSlug)}
                    type="button"
                  >
                    Choose {plan.name}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-14 md:px-10" id="resources">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-black/40">Testimonials</p>
            <h3 className="mt-3 font-display text-4xl md:text-5xl">What do school teams say?</h3>
            <p className="mt-4 text-base leading-7 text-black/60">
              Real feedback from teams that want school operations, analytics, and tenant control to feel like one
              product instead of several disconnected systems.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-[2rem] bg-white p-6 shadow-lg shadow-black/5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ember">{item.stars}</p>
                <p className="mt-5 text-base leading-8 text-black/70">{item.quote}</p>
                <div className="mt-6 flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                    {item.name.split(" ").map((part) => part[0]).join("")}
                  </span>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-black/50">{item.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="bg-[linear-gradient(90deg,#eef0eb_0%,#f9ede3_100%)]" id="footer">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-6 py-8 md:px-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-ember/60">Acadex</p>
              <h4 className="mt-3 font-display text-3xl">Built for modern school operators.</h4>
              <p className="mt-4 max-w-sm text-sm leading-7 text-black/60">
                Multi-tenant school management with subscription plans, feature flags, auditability, async workflows, and operational dashboards.
              </p>
              <form className="mt-6 flex max-w-sm overflow-hidden rounded-full bg-white shadow-lg shadow-black/5" onSubmit={handleEmailSubmit}>
                <label className="sr-only" htmlFor="landing-email">
                  Work email
                </label>
                <input
                  className="flex-1 bg-transparent px-5 py-4 text-sm outline-none"
                  id="landing-email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter work email"
                  value={email}
                />
                <button className="inline-flex min-w-[68px] items-center justify-center bg-ink px-5 text-white" type="submit">
                  <IconMail />
                </button>
              </form>
              {emailMessage ? <p className="mt-3 text-sm text-black/60">{emailMessage}</p> : null}
            </div>

            {footerGroups.map((group) => (
              <div key={group.title}>
                <h5 className="text-lg font-semibold">{group.title}</h5>
                <div className="mt-4 space-y-3 text-sm text-black/60">
                  {group.links.map((link) => (
                    <button key={link} className="block text-left transition hover:text-black" onClick={() => scrollToId("hero")} type="button">
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-8 flex max-w-[1440px] flex-wrap items-center justify-between gap-4 border-t border-black/10 px-6 pb-8 pt-6 text-sm text-black/50 md:px-10">
            <p>Copyright 2026 Acadex. Multi-tenant school management SaaS.</p>
            <div className="flex gap-3">
              {["X", "IG", "FB", "IN"].map((item) => (
                <SocialIcon key={item} label={item} />
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
