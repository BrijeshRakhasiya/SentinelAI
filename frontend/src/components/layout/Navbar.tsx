import { NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { LayoutDashboard, LogOut, Plug, ShieldHalf } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useHealthCheck } from "../../hooks/useHealthCheck";
import { StatusPill } from "../StatusPill";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/integration", label: "Integration", icon: Plug },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const health = useHealthCheck();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-sentinel-border/80 bg-sentinel-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sentinel-cyan/30 bg-sentinel-cyan/10 shadow-glow">
            <ShieldHalf className="h-5 w-5 text-sentinel-cyan" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-wide text-slate-100">SentinelAI</p>
            <p className="text-[11px] uppercase tracking-widest text-slate-500">SOC Console</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-sentinel-border bg-sentinel-panel/60 p-1 sm:flex">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sentinel-cyan/15 text-sentinel-cyan"
                    : "text-slate-400 hover:text-slate-200"
                )
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <StatusPill
            label={health === "online" ? "API Online" : health === "offline" ? "API Offline" : "Checking…"}
            tone={health === "online" ? "safe" : health === "offline" ? "danger" : "idle"}
            pulse={health === "online"}
            className="hidden md:inline-flex"
          />
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-slate-300">{user?.username}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Analyst</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-sentinel-border px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:border-red-500/40 hover:text-red-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <nav className="flex items-center gap-1 border-t border-sentinel-border/60 px-4 py-2 sm:hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
                isActive ? "bg-sentinel-cyan/15 text-sentinel-cyan" : "text-slate-400"
              )
            }
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
