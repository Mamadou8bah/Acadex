import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon?: ReactNode;
}

export function MetricCard({ label, value, detail, icon }: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm uppercase tracking-[0.2em] text-black/50">{label}</p>
        {icon ? <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink/5 text-ink">{icon}</span> : null}
      </div>
      <p className="mt-4 font-display text-4xl text-ink">{value}</p>
      <p className="mt-3 text-sm text-black/65">{detail}</p>
    </div>
  );
}
