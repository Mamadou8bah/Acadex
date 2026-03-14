interface SidebarItem {
  label: string;
  code: string;
  active: boolean;
  onClick: () => void;
}

interface SidebarProps {
  title: string;
  subtitle: string;
  items: SidebarItem[];
}

export function Sidebar({ title, subtitle, items }: SidebarProps) {
  return (
    <aside className="w-full max-w-xs rounded-[2rem] bg-ink px-6 py-8 text-sand shadow-2xl shadow-black/20">
      <p className="text-xs uppercase tracking-[0.4em] text-sand/60">Acadex</p>
      <h1 className="mt-3 font-display text-3xl">{title}</h1>
      <p className="mt-3 text-sm text-sand/70">{subtitle}</p>

      <nav className="mt-10 space-y-3">
        {items.map(({ label, code, active, onClick }) => (
          <button
            key={label}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
              active ? "bg-white/12 text-sand" : "text-sand/80 hover:bg-white/10 hover:text-sand"
            }`}
            onClick={onClick}
            type="button"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-[11px] font-semibold tracking-[0.18em]">
              {code}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
