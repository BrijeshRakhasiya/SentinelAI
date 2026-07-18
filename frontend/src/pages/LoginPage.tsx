import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Loader2, Lock, Mail, ShieldHalf } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("admin@sentinelai.io");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    const state = location.state as { from?: { pathname?: string } } | null;
    const redirectTo = state?.from?.pathname ?? "/";
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sentinel-bg px-4">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sentinel-cyan/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-sentinel-blue/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sentinel-cyan/30 bg-sentinel-cyan/10 shadow-glow">
            <ShieldHalf className="h-7 w-7 text-sentinel-cyan" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-slate-100">SentinelAI</h1>
            <p className="text-xs uppercase tracking-widest text-slate-500">SOC Console Access</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-sentinel-border bg-sentinel-panel/80 p-6 shadow-2xl backdrop-blur-sm"
        >
          <p className="mb-5 text-sm text-slate-400">
            Sign in to view the live alert triage feed and audit trail.
          </p>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Email
          </label>
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-sentinel-border bg-black/30 px-3 py-2.5 focus-within:border-sentinel-cyan/50">
            <Mail className="h-4 w-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
              placeholder="admin@sentinelai.io"
              required
            />
          </div>

          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Password
          </label>
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-sentinel-border bg-black/30 px-3 py-2.5 focus-within:border-sentinel-cyan/50">
            <Lock className="h-4 w-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-sentinel-cyan px-4 py-2.5 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Secured by Supabase Auth — see <code className="text-slate-400">/integration</code>{" "}
          for the real-world access model.
        </p>
      </div>
    </div>
  );
}
