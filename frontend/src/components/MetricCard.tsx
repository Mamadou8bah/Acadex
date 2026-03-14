interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
}

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur">
      <p className="text-sm uppercase tracking-[0.2em] text-black/50">{label}</p>
      <p className="mt-4 font-display text-4xl text-ink">{value}</p>
      <p className="mt-3 text-sm text-black/65">{detail}</p>
    </div>
  );
}
