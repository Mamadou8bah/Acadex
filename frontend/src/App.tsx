import { useEffect, useMemo, useState } from "react";
import { AuthPanel } from "./components/auth/AuthPanel";
import { DashboardApp } from "./components/dashboard/DashboardApp";
import { LandingPage } from "./components/public/LandingPage";
import { PlanOnboardingPage } from "./components/public/PlanOnboardingPage";
import { PublicDetailPage } from "./components/public/PublicDetailPage";
import { planPages, detailPages, type DetailSlug, type PlanSlug } from "./components/public/publicContent";
import { useAuthStore } from "./store/auth";

type AppRoute =
  | { kind: "landing"; path: "/" }
  | { kind: "login"; path: "/login" }
  | { kind: "dashboard"; path: "/dashboard" }
  | { kind: "detail"; path: string; slug: DetailSlug }
  | { kind: "onboarding"; path: string; plan: PlanSlug };

function parseRoute(pathname: string): AppRoute {
  if (pathname === "/login") return { kind: "login", path: "/login" };
  if (pathname === "/dashboard") return { kind: "dashboard", path: "/dashboard" };

  const detailMatch = pathname.match(/^\/details\/([a-z-]+)$/);
  if (detailMatch) {
    const slug = detailMatch[1] as DetailSlug;
    if (slug in detailPages) return { kind: "detail", path: pathname, slug };
  }

  const onboardingMatch = pathname.match(/^\/onboarding\/([a-z-]+)$/);
  if (onboardingMatch) {
    const plan = onboardingMatch[1] as PlanSlug;
    if (plan in planPages) return { kind: "onboarding", path: pathname, plan };
  }

  return { kind: "landing", path: "/" };
}

function navigate(path: string, replace = false) {
  const method = replace ? "replaceState" : "pushState";
  window.history[method](null, "", path);
}

function SignInPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(194,65,12,0.18),transparent_26%),linear-gradient(180deg,#f7efe3_0%,#f2e3ca_100%)] p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2.5rem] bg-ink px-8 py-10 text-sand shadow-2xl shadow-black/20 md:px-10">
          <p className="text-xs uppercase tracking-[0.45em] text-sand/55">Private access</p>
          <h1 className="mt-5 font-display text-5xl leading-tight md:text-6xl">School operations belong behind the dashboard.</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-sand/75">
            Super admins create schools. School admins invite staff, students, and parents from inside their tenant.
            Public self-registration is intentionally disabled.
          </p>
        </section>
        <AuthPanel onBack={onBack} />
      </div>
    </div>
  );
}

export default function App() {
  const user = useAuthStore((s) => s.user);
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (user && route.kind !== "dashboard") {
      navigate("/dashboard", true);
      setRoute({ kind: "dashboard", path: "/dashboard" });
      return;
    }

    if (!user && route.kind === "dashboard") {
      navigate("/login", true);
      setRoute({ kind: "login", path: "/login" });
    }
  }, [route.kind, user]);

  const publicPage = useMemo(() => {
    const goHome = () => {
      navigate("/", false);
      setRoute({ kind: "landing", path: "/" });
    };

    const goLogin = () => {
      navigate("/login", false);
      setRoute({ kind: "login", path: "/login" });
    };

    if (route.kind === "login") {
      return <SignInPage onBack={goHome} />;
    }

    if (route.kind === "detail") {
      return (
        <PublicDetailPage
          onBack={goHome}
          onStartPlan={() => {
            navigate("/onboarding/growth", false);
            setRoute({ kind: "onboarding", path: "/onboarding/growth", plan: "growth" });
          }}
          slug={route.slug}
        />
      );
    }

    if (route.kind === "onboarding") {
      return (
        <PlanOnboardingPage
          onBack={goHome}
          onComplete={goLogin}
          plan={route.plan}
        />
      );
    }

    return (
      <LandingPage
        onLogin={goLogin}
        onOpenDetail={(slug) => {
          const path = `/details/${slug}`;
          navigate(path, false);
          setRoute({ kind: "detail", path, slug });
        }}
        onStartPlan={(plan) => {
          const path = `/onboarding/${plan}`;
          navigate(path, false);
          setRoute({ kind: "onboarding", path, plan });
        }}
      />
    );
  }, [route]);

  if (!user) {
    return publicPage;
  }

  return <DashboardApp />;
}
