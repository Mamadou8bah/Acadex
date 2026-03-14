import { useEffect, useMemo, useState } from "react";
import { AuthPanel } from "./components/auth/AuthPanel";
import { DashboardApp } from "./components/dashboard/DashboardApp";
import { PublicContactPage } from "./components/public/PublicContactPage";
import { LandingPage } from "./components/public/LandingPage";
import { PlanOnboardingPage } from "./components/public/PlanOnboardingPage";
import { PublicDetailPage } from "./components/public/PublicDetailPage";
import { planPages, detailPages, type DetailSlug, type PlanSlug } from "./components/public/publicContent";
import { useAuthStore } from "./store/auth";

type AppRoute =
  | { kind: "landing"; path: "/" }
  | { kind: "login"; path: "/login" }
  | { kind: "contact"; path: string; email?: string }
  | { kind: "dashboard"; path: "/dashboard" }
  | { kind: "detail"; path: string; slug: DetailSlug }
  | { kind: "onboarding"; path: string; plan: PlanSlug };

function parseRoute(pathname: string): AppRoute {
  if (pathname === "/login") return { kind: "login", path: "/login" };
  if (pathname === "/contact-sales") return { kind: "contact", path: "/contact-sales" };
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(194,65,12,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(17,24,39,0.12),transparent_22%),linear-gradient(180deg,#f8f5ef_0%,#efe3cf_100%)] p-4 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl items-center justify-center">
        <div className="flex justify-center">
          <AuthPanel onBack={onBack} />
        </div>
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

    const goContactSales = (email?: string) => {
      navigate("/contact-sales", false);
      setRoute({ kind: "contact", path: "/contact-sales", email });
    };

    if (route.kind === "login") {
      return <SignInPage onBack={goHome} />;
    }

    if (route.kind === "contact") {
      return <PublicContactPage initialEmail={route.email} onBack={goHome} onLogin={goLogin} onSubmitComplete={goHome} />;
    }

    if (route.kind === "detail") {
      return (
        <PublicDetailPage
          onBack={goHome}
          onContactSales={goContactSales}
          onLogin={goLogin}
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
          onContactSales={goContactSales}
          onComplete={goLogin}
          plan={route.plan}
        />
      );
    }

    return (
      <LandingPage
        onContactSales={() => goContactSales()}
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
