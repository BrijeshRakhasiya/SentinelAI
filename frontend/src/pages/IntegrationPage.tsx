import type { ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  Cloud,
  ClipboardCheck,
  Info,
  MessagesSquare,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Webhook,
} from "lucide-react";

const ingestionSources = ["Splunk", "IBM QRadar", "Microsoft Sentinel", "CrowdStrike"];
const mcpSources = ["AWS GuardDuty", "Microsoft Sentinel", "Splunk", "CrowdStrike", "Okta", "Proofpoint"];
const mcpTools = ["get_alerts", "get_alert_by_id", "acknowledge_alert", "create_escalation"];
const escalationTargets = ["Slack", "Microsoft Teams", "Jira", "ServiceNow"];

const limitations = [
  "Role-based analyst/admin permissions are roadmap work.",
  "Current demo can run realistic sample alerts; MCP connector mode is the path to live SIEM/EDR data.",
  "Free-tier hosting can cold-start after inactivity.",
  "SQLite audit log is fine at demo scale; production would move to Postgres.",
];

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Webhook;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-sentinel-border bg-sentinel-panel/50 p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sentinel-cyan/30 bg-sentinel-cyan/10">
          <Icon className="h-4 w-4 text-sentinel-cyan" />
        </div>
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      </div>
      <div className="text-sm leading-relaxed text-slate-400">{children}</div>
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-sentinel-border bg-black/20 px-2.5 py-1 text-xs font-medium text-slate-300">
      {children}
    </span>
  );
}

export function IntegrationPage() {
  return (
    <div className="mx-auto max-w-4xl pb-12">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-slate-100 sm:text-2xl">Real-World Integration Path</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-slate-400">
          SentinelAI is designed as a triage layer that sits between your existing detection tools and your
          analysts — not a replacement for either. MCP connectors are the bridge that lets SentinelAI receive
          live alerts from real security platforms.
        </p>
      </div>

      <div className="mb-8 overflow-x-auto rounded-2xl border border-sentinel-border bg-sentinel-panel/40 p-5">
        <div className="flex min-w-[640px] items-center justify-between gap-2 text-center">
          <div className="flex-1">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-sentinel-border bg-black/20">
              <Webhook className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-xs font-medium text-slate-300">AWS / SIEM / EDR fires alert</p>
          </div>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-600" />
          <div className="flex-1">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-sentinel-cyan/30 bg-sentinel-cyan/10">
              <ShieldCheck className="h-5 w-5 text-sentinel-cyan" />
            </div>
            <p className="text-xs font-medium text-slate-300">MCP connector normalizes alert</p>
          </div>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-600" />
          <div className="flex-1">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-xs font-medium text-slate-300">SentinelAI triages with AI + rules</p>
          </div>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-600" />
          <div className="flex-1">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
            </div>
            <p className="text-xs font-medium text-slate-300">Auto-resolve or escalate + audit</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoCard icon={Webhook} title="MCP Connector Layer">
          <p className="mb-3">
            MCP acts as the adapter between SentinelAI and real security products. It fetches alerts from external
            tools, normalizes them into one alert schema, then sends them into the same AI triage pipeline.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {mcpTools.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
        </InfoCard>

        <InfoCard icon={Cloud} title="Realtime Alert Sources">
          <p className="mb-3">
            After MCP integration, SentinelAI can use live feeds instead of demo data. Each source becomes a
            connector, but the dashboard and triage logic stay the same.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {mcpSources.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
        </InfoCard>

        <InfoCard icon={Webhook} title="Alert Ingestion">
          <p className="mb-3">
            Connects to your existing SIEM/EDR stack through MCP tools, webhook, or API. SentinelAI is a triage
            layer, not a replacement for detection tooling you already trust.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ingestionSources.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
        </InfoCard>

        <InfoCard icon={MessagesSquare} title="Escalation Delivery">
          <p className="mb-3">
            Escalations can post directly into the tools your team already lives in. In MCP mode, a
            `create_escalation` tool can open Jira, ServiceNow, Slack, or Teams workflows.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {escalationTargets.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
        </InfoCard>

        <InfoCard icon={ClipboardCheck} title="Normalized Alert Schema">
          <p>
            Every platform has different alert formats. MCP converts them into SentinelAI's standard fields:
            source, severity, category, title, description, timestamp, and external alert reference.
          </p>
        </InfoCard>

        <InfoCard icon={ShieldCheck} title="Safe Decision Layer">
          <p>
            MCP only brings data in. Gemini analyzes the alert, but the FastAPI backend still applies safety rules:
            high-severity alerts always escalate and every decision is logged.
          </p>
        </InfoCard>

        <InfoCard icon={Building2} title="On-Premises Deployment">
          <p>
            For regulated or defense clients that cannot send alert data externally — runs entirely inside your
            network boundary.
          </p>
        </InfoCard>

        <InfoCard icon={Cloud} title="Managed Cloud Deployment">
          <p>Lower-friction option for teams that want triage running in minutes without standing up infrastructure.</p>
        </InfoCard>

        <InfoCard icon={ClipboardCheck} title="Compliance & Audit Trail">
          <p>
            Every automated decision — confidence score, reasoning, and outcome — is logged for review. Nothing is
            auto-resolved silently.
          </p>
        </InfoCard>

        <InfoCard icon={Rocket} title="Roadmap: iDEX / DISC (India)">
          <p>
            India's Ministry of Defence funds cybersecurity innovation through iDEX Defence India Startup
            Challenges. This prototype is a proof-of-concept for a matching open challenge — startups retain full
            IP, iDEX provides grant funding.
          </p>
        </InfoCard>
      </div>

      <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
        <div className="mb-2 flex items-center gap-2">
          <Info className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-100">Known limitations — we're upfront about these</h3>
        </div>
        <ul className="space-y-1.5 text-sm text-slate-400">
          {limitations.map((l) => (
            <li key={l} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-slate-500" />
              {l}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
