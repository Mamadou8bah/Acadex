import { useMemo, useState } from "react";
import { type DetailSlug, type PlanSlug } from "./publicContent";
import { PublicShell } from "./PublicShell";

interface LandingPageProps {
  onContactSales: () => void;
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
      body: "Every school runs inside its own isolated workspace with platform oversight and school-aware access.",
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
      body: "Track invoices, collections, and cross-school performance without jumping between tools.",
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
      body: "School admins can add teachers, students, parents, and other staff from inside their school dashboard.",
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
    price: "D150 per student",
    tone: "bg-[#dfe8ff]",
    features: [
      "Teacher and staff management",
      "Finance module and payment tracking",
      "Advanced dashboards and reporting"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom per student",
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
    quote: "Acadex gave us one operating layer for academics, finance, and communication without losing school boundaries.",
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

export function LandingPage({ onContactSales, onLogin, onOpenDetail, onStartPlan }: LandingPageProps) {
  const [audienceMode, setAudienceMode] = useState<AudienceMode>("platform");

  const featureCards = useMemo(() => featureSets[audienceMode], [audienceMode]);

  function handleNavClick(target: string) {
    scrollToId(target);
  }

  return (
    <PublicShell
      navItems={navItems.map((item) => ({ label: item.label, onClick: () => handleNavClick(item.target) }))}
      onContactSales={onContactSales}
      onHome={() => scrollToId("hero")}
      onLogin={onLogin}
    >
        <section className="border-t border-white/50" id="hero">
          <div className="mx-auto grid max-w-[1440px] gap-8 overflow-hidden px-6 py-8 md:px-10 lg:grid-cols-[0.98fr_1.02fr] lg:py-12">
            <div className="relative min-h-[420px] rounded-[2.1rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.16))] p-4 sm:min-h-[520px] sm:p-6 lg:min-h-[620px]">
              <div className="absolute left-1 top-16 hidden -rotate-90 text-xs uppercase tracking-[0.35em] text-black/45 md:block">
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
                <p className="text-xs uppercase tracking-[0.2em] text-black/55">Attendance</p>
                <p className="mt-3 text-3xl font-semibold text-ember sm:mt-4 sm:text-4xl">96%</p>
                <p className="mt-2 text-sm text-black/75">Daily presence across active classes</p>
              </div>

              <div className="absolute bottom-8 left-[10.5rem] hidden w-[280px] rounded-[2rem] bg-[linear-gradient(180deg,#ffffff_0%,#f8ede4_100%)] p-5 shadow-2xl shadow-black/10 lg:block xl:left-[18.5rem] xl:top-[22rem] xl:bottom-auto xl:w-[320px]">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.25em] text-black/60">Operator view</p>
                  <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">Live</span>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-[#fff3ea] p-4">
                    <p className="text-sm font-semibold">New school rollout</p>
                    <p className="mt-1 text-sm text-black/75">Gainako Academy added with Growth plan and first school admin provisioned.</p>
                  </div>
                  <div className="rounded-2xl bg-[#f2f3f6] p-4">
                    <p className="text-sm font-semibold">Finance pulse</p>
                    <p className="mt-1 text-sm text-black/75">D101,500 collected this term across active schools.</p>
                  </div>
                  <div className="rounded-2xl bg-[#edf7ea] p-4">
                    <p className="text-sm font-semibold">Teacher coverage</p>
                    <p className="mt-1 text-sm text-black/75">36 assignments mapped to classes and subjects this week.</p>
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
                <p className="text-sm text-black/70 md:text-base">320 pilot feedback reviews</p>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.35em] text-ember/90">School management SaaS</p>
              <h2 className="mt-4 max-w-2xl font-display text-5xl leading-[0.98] md:text-7xl">
                Experience school operations you can
                <span className="text-ember"> truly control.</span>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-black/80 md:text-lg">
                Acadex helps your team roll out schools, lets school admins build their teams, and keeps academics,
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
                  <span className="text-sm uppercase tracking-[0.2em] text-black/60">Built for</span>
                  <span className="mt-2 text-lg font-semibold">Private schools, academies, and campus groups in The Gambia</span>
                </div>
                <div className="hidden h-12 w-px bg-black/10 md:block" />
                <div className="space-y-1 text-sm text-black/75">
                  <p>Acadex sets up schools and assigns plans</p>
                  <p>School admins add teachers, students, parents, and staff</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-12 md:px-10" id="benefits">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-black/55">Why Acadex</p>
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
                <div className="flex h-full min-h-[320px] flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink shadow-sm">
                  <FeatureIcon name={card.icon} />
                </div>
                <div className="mt-5 min-h-[68px]">
                  <h4 className="text-2xl font-semibold leading-tight">{card.title}</h4>
                </div>
                <p className="mt-3 flex-1 text-sm leading-7 text-black/78">{card.body}</p>
                <button
                  className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black/70"
                  onClick={() => onOpenDetail(detailSlugFromTitle(card.title))}
                  type="button"
                >
                  Learn more
                </button>
                </div>
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
                <p className="text-xs uppercase tracking-[0.25em] text-black/60">Plan-enabled features</p>
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
                Designed for the Acadex team and school admins working side by side.
              </h3>
              <p className="mt-5 max-w-xl text-base leading-8 text-black/80">
                Public signup is not the model here. The Acadex team sets up each school, assigns the right plan, and enables
                features. Each school admin then builds out the rest of the school team from within the school dashboard.
              </p>
              <div className="mt-6 space-y-4">
                {[
                  "Controlled school setup from the platform dashboard",
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
                  onClick={onContactSales}
                  type="button"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-ink">
                    <IconPhone />
                  </span>
                  <span className="text-left">
                    <span className="block text-sm text-black/60">Contact sales</span>
                    <span className="block text-sm font-semibold">Acadex rollout team</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-8 md:px-10" id="plans">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-black/55">Pricing</p>
            <h3 className="mt-3 font-display text-4xl md:text-5xl">Choose the plan that fits your school.</h3>
            <p className="mt-4 text-base leading-8 text-black/78">
              Acadex pricing is student-based across every tier. What changes from Starter to Growth to Enterprise is
              the depth of features, visibility, and rollout support available to each school.
            </p>
          </div>
          <div className="-mx-6 flex gap-5 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-2 md:px-0 lg:grid-cols-3">
            {planCards.map((plan) => (
              <article key={plan.name} className={`w-[min(88vw,22rem)] flex-none rounded-[2rem] p-5 shadow-lg shadow-black/5 md:w-auto md:flex-initial ${plan.tone}`}>
                <div className="flex h-full min-h-[420px] flex-col rounded-[1.6rem] bg-white p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-semibold">{plan.name}</p>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-black/55">Plan</span>
                  </div>
                  <p className="mt-4 font-display text-5xl">{plan.price}</p>
                  <p className="mt-1 text-sm text-black/68">priced in Gambian dalasi per student, with features expanding by plan</p>
                  <div className="mt-6 flex flex-1 flex-col gap-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex min-h-[68px] items-center rounded-2xl bg-sand/60 px-4 py-3 text-sm leading-6">
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="mt-6 w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black/75 shadow-sm"
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
            <p className="text-xs uppercase tracking-[0.35em] text-black/55">Testimonials</p>
            <h3 className="mt-3 font-display text-4xl md:text-5xl">What do school teams say?</h3>
            <p className="mt-4 text-base leading-8 text-black/78">
              Real feedback from teams that want school operations, analytics, and access control to feel like one
              product instead of several disconnected systems.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-[2rem] bg-white p-6 shadow-lg shadow-black/5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ember">{item.stars}</p>
                <p className="mt-5 text-base leading-8 text-black/82">{item.quote}</p>
                <div className="mt-6 flex items-center gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                    {item.name.split(" ").map((part) => part[0]).join("")}
                  </span>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-black/65">{item.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

    </PublicShell>
  );
}
