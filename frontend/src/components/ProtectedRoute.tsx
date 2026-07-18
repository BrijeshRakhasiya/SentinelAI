import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function FullscreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sentinel-bg">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <ShieldCheck className="h-8 w-8 animate-pulse-dot text-sentinel-cyan" />
        <p className="text-sm tracking-wide">Verifying session…</p>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullscreenLoader />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
