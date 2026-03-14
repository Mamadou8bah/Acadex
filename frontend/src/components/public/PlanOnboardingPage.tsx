import { FormEvent, useState } from "react";
import { planPages, type PlanSlug } from "./publicContent";

interface PlanOnboardingPageProps {
  plan: PlanSlug;
  onBack: () => void;
  onComplete: () => void;
}

type Step = 0 | 1 | 2;

export function PlanOnboardingPage({ plan, onBack, onComplete }: PlanOnboardingPageProps) {
  const page = planPages[plan];
  const [step, setStep] = useState<Step>(0);
  const [message, setMessage] = useState<string | null>(null);

  function nextStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setStep((current) => Math.min(2, current + 1) as Step);
  }

  function previousStep() {
    setMessage(null);
    setStep((current) => Math.max(0, current - 1) as Step);
  }

  function finishOnboarding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Onboarding details captured. Continue to secure sign-in to complete your rollout.");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(194,65,12,0.18),transparent_26%),linear-gradient(180deg,#f7efe3_0%,#f2e3ca_100%)] px-4 py-6 md:px-6">
      <div className="mx-auto max-w-6xl rounded-[2.4rem] bg-white/84 p-6 shadow-2xl shadow-black/10 backdrop-blur md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-ember/70">Plan onboarding</p>
            <h1 className="mt-3 font-display text-4xl text-ink md:text-6xl">{page.name}</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-black/65">{page.summary}</p>
          </div>
          <button className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-black/65" onClick={onBack} type="button">
            Back
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[2rem] bg-ink p-6 text-sand">
            <p className="text-xs uppercase tracking-[0.3em] text-sand/55">Selected plan</p>
            <p className="mt-4 font-display text-5xl">{page.price}</p>
            <p className="mt-2 text-sm text-sand/75">{page.billingBasis}</p>
            <p className="mt-2 text-sm text-sand/75">{page.recommendedFor}</p>
            <div className="mt-6 space-y-3">
              {page.included.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-3">
              {["1. Organization details", "2. Operational setup", "3. Contacts and launch"].map((label, index) => (
                <div key={label} className={`rounded-2xl px-4 py-3 text-sm ${step === index ? "bg-white text-ink" : "bg-white/8 text-sand/80"}`}>
                  {label}
                </div>
              ))}
            </div>
          </aside>

          <section className="rounded-[2rem] bg-[linear-gradient(135deg,#fff0e4_0%,#f8f5ef_100%)] p-6">
            {step === 0 ? (
              <form className="space-y-4" onSubmit={nextStep}>
                <h2 className="font-display text-3xl">Organization details</h2>
                <input className="w-full rounded-2xl border border-black/10 p-4" name="schoolName" placeholder="School or institution name" required />
                <input className="w-full rounded-2xl border border-black/10 p-4" name="schoolEmail" placeholder="Official school email" required />
                <input className="w-full rounded-2xl border border-black/10 p-4" defaultValue="The Gambia" name="country" placeholder="Country or region" required />
                <div className="flex justify-end">
                  <button className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white" type="submit">
                    Continue
                  </button>
                </div>
              </form>
            ) : null}

            {step === 1 ? (
              <form className="space-y-4" onSubmit={nextStep}>
                <h2 className="font-display text-3xl">Operational setup</h2>
                <input className="w-full rounded-2xl border border-black/10 p-4" name="schoolCount" placeholder="How many schools or campuses?" required />
                <input className="w-full rounded-2xl border border-black/10 p-4" name="studentSize" placeholder="Estimated student population" required />
                <input className="w-full rounded-2xl border border-black/10 p-4" name="personnelSize" placeholder="Estimated school personnel count" required />
                <select className="w-full rounded-2xl border border-black/10 p-4" defaultValue="student" name="billingBasis">
                  <option value="student">Price by student count</option>
                  <option value="personnel">Price by personnel count</option>
                  <option value="mixed">Use a blended pricing model</option>
                </select>
                <textarea className="w-full rounded-2xl border border-black/10 p-4" name="needs" placeholder="Which modules do you need first?" rows={5} required />
                <div className="flex justify-between gap-3">
                  <button className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-black/65" onClick={previousStep} type="button">
                    Back
                  </button>
                  <button className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white" type="submit">
                    Continue
                  </button>
                </div>
              </form>
            ) : null}

            {step === 2 ? (
              <form className="space-y-4" onSubmit={finishOnboarding}>
                <h2 className="font-display text-3xl">Contacts and launch</h2>
                <input className="w-full rounded-2xl border border-black/10 p-4" name="contactName" placeholder="Primary contact name" required />
                <input className="w-full rounded-2xl border border-black/10 p-4" name="contactEmail" placeholder="Primary contact email" required />
                <input className="w-full rounded-2xl border border-black/10 p-4" name="timeline" placeholder="Preferred launch timeline" required />
                <textarea className="w-full rounded-2xl border border-black/10 p-4" name="notes" placeholder="Anything the onboarding team should know?" rows={5} />
                {message ? <p className="rounded-2xl bg-moss/10 p-4 text-sm text-moss">{message}</p> : null}
                <div className="flex justify-between gap-3">
                  <button className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-black/65" onClick={previousStep} type="button">
                    Back
                  </button>
                  <button className="rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white" type="submit">
                    Save onboarding details
                  </button>
                </div>
                {message ? (
                  <button className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white" onClick={onComplete} type="button">
                    Continue to sign in
                  </button>
                ) : null}
              </form>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
