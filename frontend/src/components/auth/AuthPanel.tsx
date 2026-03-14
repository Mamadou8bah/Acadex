import { FormEvent, useState } from "react";
import {
  forgotPassword,
  login,
  resetPassword,
  verifyEmail
} from "../../features/auth/api";
import { useAuthStore } from "../../store/auth";

type Mode = "login" | "verify" | "forgot" | "reset";

interface AuthPanelProps {
  onBack?: () => void;
}

export function AuthPanel({ onBack }: AuthPanelProps) {
  const setSession = useAuthStore((state) => state.setSession);
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await login(String(form.get("email")), String(form.get("password")));
      setSession(response.accessToken, response.refreshToken, response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in.");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await verifyEmail(String(form.get("token")));
      setMessage(response.message);
      setMode("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify email.");
    } finally {
      setBusy(false);
    }
  }

  async function onForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await forgotPassword(String(form.get("email")));
      setMessage(response.message);
      setMode("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset message.");
    } finally {
      setBusy(false);
    }
  }

  async function onReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await resetPassword(String(form.get("token")), String(form.get("newPassword")));
      setMessage(response.message);
      setMode("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="w-full max-w-md rounded-[2rem] border border-black/10 bg-white/88 p-6 shadow-2xl shadow-black/10 backdrop-blur md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-black/45">Secure Access</p>
          <h2 className="mt-2 font-display text-4xl text-ink">Sign in</h2>
          <p className="mt-2 text-sm text-black/60">
            School onboarding happens inside the admin dashboard. Public access is sign-in only.
          </p>
        </div>
        {onBack ? (
          <button
            className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/60"
            onClick={onBack}
            type="button"
          >
            Back
          </button>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-black/45">
        {(["login", "forgot", "reset", "verify"] as Mode[]).map((item) => (
          <button
            key={item}
            className={`rounded-full px-4 py-2 ${mode === item ? "bg-ember text-white" : "bg-black/5 text-black/60"}`}
            onClick={() => setMode(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {mode === "login" && (
          <form className="space-y-4" onSubmit={onLogin}>
            <input className="w-full rounded-2xl border border-black/10 p-4" name="email" placeholder="Email" />
            <input className="w-full rounded-2xl border border-black/10 p-4" name="password" placeholder="Password" type="password" />
            <button className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" disabled={busy} type="submit">
              {busy ? "Signing in..." : "Sign in to dashboard"}
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form className="space-y-4" onSubmit={onForgot}>
            <input className="w-full rounded-2xl border border-black/10 p-4" name="email" placeholder="Email" />
            <button className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" disabled={busy} type="submit">
              {busy ? "Sending..." : "Send reset token"}
            </button>
          </form>
        )}

        {mode === "reset" && (
          <form className="space-y-4" onSubmit={onReset}>
            <input className="w-full rounded-2xl border border-black/10 p-4" name="token" placeholder="Reset token" />
            <input className="w-full rounded-2xl border border-black/10 p-4" name="newPassword" placeholder="New password" type="password" />
            <button className="w-full rounded-full bg-ember px-5 py-3 text-sm font-semibold text-white" disabled={busy} type="submit">
              {busy ? "Updating..." : "Reset password"}
            </button>
          </form>
        )}

        {mode === "verify" && (
          <form className="space-y-4" onSubmit={onVerify}>
            <input className="w-full rounded-2xl border border-black/10 p-4" name="token" placeholder="Verification token" />
            <button className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" disabled={busy} type="submit">
              {busy ? "Verifying..." : "Verify email"}
            </button>
          </form>
        )}
      </div>

      {message && <p className="mt-4 rounded-2xl bg-moss/10 p-4 text-sm text-moss">{message}</p>}
      {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    </section>
  );
}
