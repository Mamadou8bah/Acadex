import type { ReactNode } from "react";

export function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-black/5 bg-white/88 p-6 shadow-sm backdrop-blur">
      <p className="text-xs uppercase tracking-[0.2em] text-black/55">{subtitle}</p>
      <h3 className="mt-2 font-display text-3xl">{title}</h3>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function Items({ values }: { values: string[] }) {
  return values.length ? (
    <div className="space-y-2">
      {values.map((value) => (
        <div key={value} className="rounded-2xl bg-sand/60 p-3 text-sm text-black/80">
          {value}
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-black/50">No records yet.</p>
  );
}
