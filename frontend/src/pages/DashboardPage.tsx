import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAlertStream } from "../hooks/useAlertStream";
import { ExplainerBanner } from "../components/ExplainerBanner";
import { StatCards } from "../components/StatCards";
import { AnalystDashboard } from "../components/AnalystDashboard";
import { AlertFeed } from "../components/AlertFeed";

export function DashboardPage() {
  const { alerts, status, restart } = useAlertStream(true);
  const [lifetimeTotal, setLifetimeTotal] = useState<number | null>(null);

  const autoResolved = alerts.filter((a) => a.decision === "auto_resolve").length;
  const escalated = alerts.filter((a) => a.decision === "escalate").length;

  useEffect(() => {
    let mounted = true;
    api
      .stats()
      .then((s) => {
        if (mounted) setLifetimeTotal(s.total);
      })
      .catch(() => {
        if (mounted) setLifetimeTotal(null);
      });
    return () => {
      mounted = false;
    };
  }, [status]);

  return (
    <div>
      <ExplainerBanner />
      <StatCards
        total={alerts.length}
        autoResolved={autoResolved}
        escalated={escalated}
        lifetimeTotal={lifetimeTotal}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AnalystDashboard autoResolved={autoResolved} escalated={escalated} />
        </div>
        <div className="lg:col-span-2">
          <AlertFeed alerts={alerts} status={status} onRestart={restart} />
        </div>
      </div>
    </div>
  );
}
