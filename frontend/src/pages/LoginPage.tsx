import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Clock3,
  Loader2,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const features = [
  {
    icon: ShieldCheck,
    title: "Auto-resolves the obvious",
    description: "Handles alerts it's confident about on its own, and logs exactly why.",
  },
  {
    icon: ShieldAlert,
    title: "Escalates only when unsure",
    description: "Uncertain alerts go to a human with a clear explanation of what it saw.",
  },
  {
    icon: Clock3,
    title: "Gives analysts their time back",
    description: "Cuts the repetitive 80% off analysts' plates so they focus on real threats.",
  },
];

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("admin@yopmail.com");
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
    <div className="relative flex min-h-screen overflow-hidden bg-sentinel-bg">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sentinel-cyan/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-sentinel-blue/10 blur-3xl" />

      {/* Left: what SentinelAI is / why it exists -- hidden below lg so the
          login form stays front and center on small screens. */}
      <div className="relative z-10 hidden w-1/2 flex-col justify-center px-16 lg:flex">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sentinel-cyan/30 bg-sentinel-cyan/10 shadow-glow">
            <ShieldHalf className="h-6 w-6 text-sentinel-cyan" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-wide text-slate-100">SentinelAI</p>
            <p className="text-[11px] uppercase tracking-widest text-slate-500">AI Security Teammate</p>
          </div>
        </div>

        <h1 className="max-w-md text-3xl font-bold leading-tight text-slate-100">
          An AI teammate for alert fatigue — not another siren.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
          Security teams get thousands of alerts a day, and most are noise. SentinelAI watches
          incoming alerts, resolves the obvious ones itself, and escalates only the ones it's
          genuinely unsure about — always with a clear reason attached.
        </p>

        <div className="mt-8 max-w-md space-y-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-sentinel-border bg-sentinel-panel/60">
                <Icon className="h-4 w-4 text-sentinel-cyan" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{title}</p>
                <p className="text-xs text-slate-500">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-md text-xs text-slate-500">
          Not about replacing analysts — about reducing noise, preserving trust, and freeing
          teams to focus on the alerts that actually need human judgment.
        </p>
      </div>

      {/* Right: login form */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
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
                placeholder="admin@yopmail.com"
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
    </div>
  );
}
