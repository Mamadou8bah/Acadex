import { FormEvent, useState } from "react";
import { PublicShell } from "./PublicShell";

interface PublicContactPageProps {
  initialEmail?: string;
  onBack: () => void;
  onLogin: () => void;
  onSubmitComplete: () => void;
}

export function PublicContactPage({ initialEmail, onBack, onLogin, onSubmitComplete }: PublicContactPageProps) {
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Your request has been sent. The Acadex team can follow up with pricing, rollout details, and next steps.");
  }

  return (
    <PublicShell
      footerMessage={message}
      navItems={[
        { label: "Back to landing", onClick: onBack },
        { label: "School sign in", onClick: onLogin }
      ]}
      onContactSales={onSubmitComplete}
      onHome={onBack}
      onLogin={onLogin}
    >
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <div className="grid gap-8 rounded-[2.4rem] bg-white/84 p-6 shadow-2xl shadow-black/10 backdrop-blur md:p-10 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-[2rem] bg-[linear-gradient(160deg,#111827_0%,#182133_65%,#29344a_100%)] p-6 text-sand md:p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-sand/60">Contact sales</p>
            <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">Talk to the Acadex rollout team.</h1>
            <p className="mt-5 max-w-md text-base leading-8 text-sand/80">
              Share your school details and goals. We can guide you on pricing, setup, rollout stages, and which plan
              fits best.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Pricing guidance based on student population",
                "Plan and feature recommendations for your school",
                "Rollout support for admins, staff, and core modules"
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-sand/85">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-[linear-gradient(135deg,#fff0e4_0%,#f8f5ef_100%)] p-6 md:p-8">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <h2 className="font-display text-3xl text-ink">Request a sales follow-up</h2>
              <p className="text-sm leading-7 text-black/70">We will use these details to contact you and shape the rollout.</p>

              <input className="w-full rounded-2xl border border-black/10 p-4" name="schoolName" placeholder="School name" required />
              <input className="w-full rounded-2xl border border-black/10 p-4" name="contactName" placeholder="Your full name" required />
              <input
                className="w-full rounded-2xl border border-black/10 p-4"
                defaultValue={initialEmail ?? ""}
                name="email"
                placeholder="Work email"
                required
                type="email"
              />
              <input className="w-full rounded-2xl border border-black/10 p-4" name="phone" placeholder="Phone number" />
              <input className="w-full rounded-2xl border border-black/10 p-4" defaultValue="The Gambia" name="country" placeholder="Country" required />
              <input className="w-full rounded-2xl border border-black/10 p-4" name="studentCount" placeholder="Estimated student population" required />
              <textarea className="w-full rounded-2xl border border-black/10 p-4" name="needs" placeholder="What do you want Acadex to help your school with first?" rows={5} required />

              {message ? <p className="rounded-2xl bg-moss/10 p-4 text-sm text-moss">{message}</p> : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white" type="submit">
                  Send request
                </button>
                <button className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-black/70" onClick={onBack} type="button">
                  Back to landing
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
