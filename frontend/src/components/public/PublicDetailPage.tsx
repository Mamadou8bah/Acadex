import { detailPages, type DetailSlug } from "./publicContent";
import { PublicShell } from "./PublicShell";

interface PublicDetailPageProps {
  slug: DetailSlug;
  onBack: () => void;
  onContactSales: () => void;
  onLogin: () => void;
  onStartPlan: () => void;
}

export function PublicDetailPage({ slug, onBack, onContactSales, onLogin, onStartPlan }: PublicDetailPageProps) {
  const page = detailPages[slug];

  return (
    <PublicShell
      navItems={[
        { label: "Back to landing", onClick: onBack },
        { label: "Request rollout", onClick: onStartPlan },
        { label: "Sign in", onClick: onLogin }
      ]}
      onContactSales={onContactSales}
      onHome={onBack}
      onLogin={onLogin}
    >
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="rounded-[2.4rem] bg-white/80 p-6 shadow-2xl shadow-black/10 backdrop-blur md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-ember/70">{page.eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl text-ink md:text-6xl">{page.title}</h1>
          </div>
          <button className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-black/65" onClick={onBack} type="button">
            Back to landing
          </button>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] bg-[linear-gradient(135deg,#fff0e4_0%,#f8f5ef_100%)] p-6">
            <p className="text-lg leading-8 text-black/70">{page.summary}</p>
            <div className="mt-8 space-y-4">
              {page.points.map((point) => (
                <div key={point} className="rounded-2xl bg-white p-4 text-sm leading-7 text-black/65 shadow-sm">
                  {point}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-ink p-6 text-sand shadow-xl shadow-black/15">
            <p className="text-xs uppercase tracking-[0.35em] text-sand/55">What it unlocks</p>
            <div className="mt-6 space-y-4">
              {page.outcomes.map((outcome) => (
                <div key={outcome} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                  {outcome}
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[1.6rem] bg-white/8 p-5">
              <p className="text-sm text-sand/75">
                Want this for your school? Request a rollout and share your school, plan, and contact details in stages.
              </p>
              <button className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink" onClick={onStartPlan} type="button">
                Request rollout
              </button>
            </div>
          </section>
        </div>
      </div>
      </div>
    </PublicShell>
  );
}
