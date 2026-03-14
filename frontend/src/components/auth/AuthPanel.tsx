import { FormEvent, useState } from "react";
import { forgotPassword, login } from "../../features/auth/api";
import { useAuthStore } from "../../store/auth";

type Mode = "login" | "forgot";

interface AuthPanelProps {
  onBack?: () => void;
}

function Field(props: { name: string; placeholder: string; type?: string }) {
  return (
    <input
      className="w-full rounded-[1.4rem] border border-black/10 bg-white px-4 py-4 text-sm text-ink outline-none transition placeholder:text-black/35 focus:border-ember/40 focus:ring-4 focus:ring-ember/10"
      name={props.name}
      placeholder={props.placeholder}
      type={props.type ?? "text"}
    />
  );
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

  async function onForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await forgotPassword(String(form.get("email")));
      setMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset message.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="w-full max-w-[480px] rounded-[2.1rem] border border-black/10 bg-white/88 p-6 shadow-2xl shadow-black/10 backdrop-blur md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-ember/65">Secure Access</p>
          <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">
            {mode === "login" ? "Sign in" : "Forgot password"}
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-7 text-black/60">
            {mode === "login"
              ? "Use your school or platform account to enter the dashboard."
              : "Enter your email and we will send password reset instructions."}
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

      <div className="mt-6 inline-flex rounded-full bg-black/5 p-1.5">
        <button
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${mode === "login" ? "bg-ink text-white" : "text-black/55"}`}
          onClick={() => {
            setMode("login");
            setMessage(null);
            setError(null);
          }}
          type="button"
        >
          Login
        </button>
        <button
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${mode === "forgot" ? "bg-ink text-white" : "text-black/55"}`}
          onClick={() => {
            setMode("forgot");
            setMessage(null);
            setError(null);
          }}
          type="button"
        >
          Forgot Password
        </button>
      </div>

      <div className="mt-8">
        {mode === "login" ? (
          <form className="space-y-4" onSubmit={onLogin}>
            <Field name="email" placeholder="Email" />
            <Field name="password" placeholder="Password" type="password" />
            <button className="w-full rounded-full bg-ink px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-black/10" disabled={busy} type="submit">
              {busy ? "Signing in..." : "Sign in to dashboard"}
            </button>
            <button
              className="text-sm font-semibold text-ember"
              onClick={() => {
                setMode("forgot");
                setMessage(null);
                setError(null);
              }}
              type="button"
            >
              Forgot your password?
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={onForgot}>
            <Field name="email" placeholder="Email" />
            <button className="w-full rounded-full bg-ink px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-black/10" disabled={busy} type="submit">
              {busy ? "Sending..." : "Send reset instructions"}
            </button>
          </form>
        )}
      </div>

      {message ? <p className="mt-5 rounded-2xl bg-moss/10 p-4 text-sm text-moss">{message}</p> : null}
      {error ? <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
