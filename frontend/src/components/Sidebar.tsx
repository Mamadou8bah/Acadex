import type { ReactNode } from "react";

interface SidebarItem {
  label: string;
  icon: ReactNode;
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
    <aside className="w-full border-r border-white/10 bg-ink px-6 py-8 text-sand shadow-2xl shadow-black/20 lg:sticky lg:top-0 lg:h-screen lg:max-w-[21rem] lg:overflow-y-auto">
      <p className="text-xs uppercase tracking-[0.4em] text-sand/60">Acadex</p>
      <h1 className="mt-3 font-display text-3xl">{title}</h1>
      <p className="mt-3 text-sm text-sand/70">{subtitle}</p>

      <nav className="mt-10 space-y-3">
        {items.map(({ label, icon, active, onClick }) => (
          <button
            key={label}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
              active ? "bg-white/12 text-sand" : "text-sand/80 hover:bg-white/10 hover:text-sand"
            }`}
            onClick={onClick}
            type="button"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-sand/90">
              {icon}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
