import { ReactNode, useState } from "react";

interface NavItem {
  label: string;
  onClick: () => void;
}

interface PublicShellProps {
  children: ReactNode;
  footerMessage?: string | null;
  onContactSales: (prefillEmail?: string) => void;
  onHome: () => void;
  onLogin: () => void;
  navItems: NavItem[];
}

function IconMail() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M4 6.5h16v11H4z" stroke="currentColor" strokeWidth="1.7" />
      <path d="m5 8 7 5 7-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
    </svg>
  );
}

function SocialIcon({ label }: { label: string }) {
  const icon =
    label === "X" ? (
      <svg aria-hidden="true" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.901 2H21l-4.588 5.244L21.8 22h-4.218l-3.304-4.314L10.5 22H8.402l4.909-5.609L2.2 2H6.42l2.979 3.889L12.902 2H15l-4.703 5.375 7.204 9.406h-1.658L8.021 6.566 18.901 2Z" />
      </svg>
    ) : label === "Instagram" ? (
      <svg aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]" viewBox="0 0 24 24">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" />
      </svg>
    ) : label === "Facebook" ? (
      <svg aria-hidden="true" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
        <path d="M13.615 21v-7.158h2.404l.36-2.789h-2.764V9.273c0-.808.225-1.359 1.383-1.359h1.478V5.42c-.255-.035-1.13-.11-2.15-.11-2.127 0-3.583 1.298-3.583 3.68v2.063H8.333v2.789h2.41V21h2.872Z" />
      </svg>
    ) : (
      <svg aria-hidden="true" className="h-4 w-4 fill-current" viewBox="0 0 24 24">
        <path d="M6.94 8.5A1.72 1.72 0 1 1 6.93 5a1.72 1.72 0 0 1 0 3.5ZM5.5 9.8h2.86V19H5.5V9.8Zm4.65 0h2.74v1.25h.04c.38-.72 1.32-1.48 2.72-1.48 2.91 0 3.45 1.91 3.45 4.4V19h-2.85v-4.47c0-1.07-.02-2.45-1.5-2.45-1.5 0-1.73 1.17-1.73 2.37V19h-2.87V9.8Z" />
      </svg>
    );

  return (
    <span
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-ink transition hover:-translate-y-0.5 hover:border-black/20"
    >
      {icon}
    </span>
  );
}

export function PublicShell({ children, footerMessage, onContactSales, onHome, onLogin, navItems }: PublicShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [footerEmail, setFooterEmail] = useState("");

  function closeMenu(action: () => void) {
    setMobileMenuOpen(false);
    action();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(194,65,12,0.18),transparent_26%),radial-gradient(circle_at_85%_15%,rgba(17,24,39,0.12),transparent_24%),linear-gradient(180deg,#f8f5ef_0%,#efe3cf_52%,#ecddc8_100%)] pt-24 text-ink">
      <div className="fixed inset-x-0 top-0 z-50 bg-[linear-gradient(135deg,rgba(251,242,234,0.97)_0%,rgba(248,245,239,0.97)_48%,rgba(243,238,231,0.97)_100%)] backdrop-blur">
        <header className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-5 px-6 py-5 md:px-10">
          <button className="text-left" onClick={onHome} type="button">
            <p className="text-xs uppercase tracking-[0.45em] text-ember/60">Acadex</p>
            <h1 className="mt-2 hidden font-display text-3xl sm:block">School Management Cloud</h1>
          </button>

          <nav className="hidden items-center gap-8 text-sm text-black/65 lg:flex">
            {navItems.map((item) => (
              <button key={item.label} className="transition hover:text-black" onClick={item.onClick} type="button">
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
            <button className="hidden rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 sm:inline-flex" onClick={onLogin} type="button">
              School sign in
            </button>
          </div>
        </header>

        {mobileMenuOpen ? (
          <div className="mx-6 mb-4 rounded-[1.8rem] bg-white/90 p-4 shadow-lg shadow-black/5 backdrop-blur lg:hidden md:mx-10">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-black/70 transition hover:bg-black/5 hover:text-black"
                  onClick={() => closeMenu(item.onClick)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
              <button className="mt-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" onClick={() => closeMenu(onLogin)} type="button">
                School sign in
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="w-full bg-[linear-gradient(135deg,#fbf2ea_0%,#f8f5ef_48%,#f3eee7_100%)]">
        {children}

        <footer className="bg-[linear-gradient(90deg,#eef0eb_0%,#f9ede3_100%)]" id="footer">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-6 py-8 md:px-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-ember/60">Acadex</p>
              <h4 className="mt-3 font-display text-3xl">Built for modern school operators.</h4>
              <p className="mt-4 max-w-sm text-sm leading-7 text-black/60">
                School management software with subscription plans, feature controls, auditability, async workflows, and operational dashboards.
              </p>
              <div className="mt-6 flex max-w-sm overflow-hidden rounded-full bg-white shadow-lg shadow-black/5">
                <input
                  className="flex-1 bg-transparent px-5 py-4 text-sm outline-none"
                  onChange={(event) => setFooterEmail(event.target.value)}
                  placeholder="Enter work email"
                  type="email"
                  value={footerEmail}
                />
                <button className="inline-flex min-w-[68px] items-center justify-center bg-ink px-5 text-white" onClick={() => onContactSales(footerEmail)} type="button">
                  <IconMail />
                </button>
              </div>
              {footerMessage ? <p className="mt-3 text-sm text-black/60">{footerMessage}</p> : null}
            </div>

            {[
              { title: "Platform", links: ["School setup", "Role management", "Finance and billing", "Analytics"] },
              { title: "Resources", links: ["Deployment guide", "Product updates", "Support center", "Engineering notes"] },
              { title: "Use cases", links: ["Private schools", "Campus groups", "Growing institutions", "School operators"] }
            ].map((group) => (
              <div key={group.title}>
                <h5 className="text-lg font-semibold">{group.title}</h5>
                <div className="mt-4 space-y-3 text-sm text-black/60">
                  {group.links.map((link) => (
                    <button key={link} className="block text-left transition hover:text-black" onClick={onHome} type="button">
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-8 flex max-w-[1440px] flex-wrap items-center justify-between gap-4 border-t border-black/10 px-6 pb-8 pt-6 text-sm text-black/50 md:px-10">
            <p>Copyright 2026 Acadex. School management SaaS for modern institutions.</p>
            <div className="flex gap-3">
              {["X", "Instagram", "Facebook", "LinkedIn"].map((item) => (
                <SocialIcon key={item} label={item} />
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
