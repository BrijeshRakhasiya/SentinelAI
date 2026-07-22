# SentinelAI AI Metrics and Product Strategy

Audience: AI Product Manager, judges, investors, and demo reviewers.

SentinelAI is an AI-powered SOC alert triage platform. It sits above existing security tools, explains alert risk, auto-resolves safe low-risk alerts, and escalates risky or unclear alerts to human analysts with a clear audit trail.

Core product message:

> Existing tools generate alerts and scores. SentinelAI turns them into decisions.

---

## 1. North Star Metric

### Trusted Triage Decisions Per Analyst Hour

The North Star metric is:

> Number of security alerts correctly triaged by SentinelAI per analyst hour, with audit-ready reasoning and no unsafe auto-resolutions.

Why this is the right North Star:

- It measures the real user outcome: analysts handle more alerts without losing control.
- It balances automation with trust, not just alert volume.
- It connects product value to SOC productivity, security quality, and business ROI.
- It discourages unsafe automation because incorrect or risky auto-resolutions reduce trust.

Target demo framing:

> SentinelAI helps a SOC analyst move from reviewing every alert manually to supervising AI-assisted decisions with clear reasoning, escalation, and audit logs.

---

## 2. Product Metrics

These metrics show whether the product is solving the core workflow problem.

| Metric | What It Measures | Why It Matters |
|---|---|---|
| Alerts triaged per day | Total alerts processed by SentinelAI | Shows throughput and scale |
| Auto-resolution rate | Percentage of alerts safely closed by the system | Shows reduction in manual workload |
| Escalation rate | Percentage of alerts sent to human analysts | Shows how much work still needs expert review |
| Analyst review time per alert | Average time spent validating a SentinelAI decision | Shows productivity improvement |
| Decision acceptance rate | Percentage of AI decisions accepted by analysts | Shows product trust |
| Manual override rate | Percentage of decisions changed by analysts | Shows where rules or AI reasoning need improvement |
| Time to decision | Time from alert received to auto-resolve or escalate | Shows operational speed |
| Audit completeness rate | Percentage of decisions with full reasoning, confidence, action, and timestamp | Shows compliance readiness |

Practical targets for MVP:

- Reduce low-risk alert review time by 40-60%.
- Keep all high-severity alerts escalated by default.
- Maintain audit completeness above 95%.
- Keep analyst override rate under 15% during controlled pilots.

---

## 3. SOC and Security Effectiveness Metrics

These metrics prove that SentinelAI is not only faster, but also safer and more useful for security teams.

| Metric | Definition | Desired Direction |
|---|---|---|
| Mean Time to Triage (MTTT) | Average time to classify an alert as auto-resolve or escalate | Down |
| Mean Time to Escalate (MTTE) | Average time to send risky alerts to humans | Down |
| False positive reduction | Drop in noisy alerts reaching analysts | Up |
| False negative rate | Risky alerts incorrectly treated as safe | Near zero |
| High-severity escalation coverage | Percentage of high-severity alerts escalated | 100% |
| Repeat alert suppression | Duplicate/noisy alerts identified and grouped | Up |
| Analyst backlog reduction | Reduction in unreviewed alerts | Up |
| Incident handoff quality | Completeness of context passed to analyst or ticket | Up |

Key PM principle:

> SentinelAI should automate low-risk confidence, not automate uncertainty.

For security buyers, the most important proof is not that AI can close alerts. It is that the system knows when not to close them.

---

## 4. AI and Model Metrics

These metrics track Gemini reasoning quality and AI behavior inside the product.

| Metric | What It Measures | Notes |
|---|---|---|
| Classification accuracy | Correctness of low/medium/high risk judgment | Compare against analyst labels |
| Confidence calibration | Whether confidence matches actual correctness | High confidence must mean high reliability |
| Reasoning usefulness score | Analyst rating of explanation quality | Use 1-5 review score |
| Action agreement rate | AI recommendation matches final backend action | Helps detect policy mismatch |
| Hallucination rate | AI includes unsupported facts or actions | Must be very low |
| Uncertainty detection rate | AI correctly identifies incomplete or ambiguous evidence | Important for escalation safety |
| Prompt regression rate | Quality drop after prompt/model changes | Track before launches |
| Model latency | Time taken for AI analysis | Impacts live SOC workflow |
| Cost per triaged alert | Model/API cost divided by processed alerts | Needed for business viability |

Model evaluation dataset:

- Low-risk benign alerts that should be auto-resolved.
- Medium-risk alerts that require context and explanation.
- High-risk alerts that must always escalate.
- Ambiguous alerts with missing details.
- Adversarial or malformed alert text.
- Realistic Wazuh, GuardDuty, Microsoft Sentinel, Splunk, CrowdStrike, and Okta examples.

AI acceptance rule for production:

> AI can recommend, but backend safety rules make the final decision.

Current safety rule:

```text
IF confidence >= 75 AND severity != high
  -> auto_resolve
ELSE
  -> escalate
```

This gives judges and buyers confidence that SentinelAI is not a black-box auto-remediation tool.

---

## 5. Business Metrics

These metrics connect the product to revenue, customer value, and investor interest.

| Metric | What It Shows |
|---|---|
| Cost saved per analyst per month | Productivity ROI from reduced manual triage |
| Alerts automated per customer | Expansion potential and usage depth |
| Paid pilot conversion rate | Whether demo interest becomes real demand |
| Time to first value | How quickly a customer connects alerts and sees decisions |
| Gross margin per alert | API/model cost efficiency |
| Customer acquisition cost | Sales and marketing efficiency |
| Expansion revenue | Additional connectors, seats, or alert volume tiers |
| Retention / renewal intent | Whether SentinelAI becomes part of SOC workflow |

Simple ROI story:

> If a SOC analyst spends hours reviewing repetitive low-risk alerts, SentinelAI reduces that manual workload while preserving escalation and auditability for risky cases.

Potential pricing signals:

- Per alert volume tier.
- Per connected security source.
- Per SOC analyst seat.
- Enterprise plan for on-prem, private model, compliance, and custom rules.

---

## 6. Reliability Metrics

Reliability matters because SOC workflows cannot depend on fragile AI behavior.

| Metric | Target Direction |
|---|---|
| Backend uptime | Up |
| Alert ingestion success rate | Up |
| MCP connector success rate | Up |
| Dashboard stream availability | Up |
| AI analysis timeout rate | Down |
| Failed triage jobs | Down |
| Duplicate alert processing | Down |
| Audit log write success rate | Near 100% |
| Safe fallback rate | Measured and explainable |

Reliability principle:

> If SentinelAI cannot safely analyze an alert, it should fail closed and escalate or pause automation.

For the Wazuh live demo phase, reliability should focus on:

- Wazuh MCP connector status visible in the dashboard after the connector is implemented.
- Last sync time.
- Alerts fetched.
- Clear degraded/offline state.
- No auto-resolution if the source or AI analysis is uncertain.

---

## 7. Adoption Metrics

These metrics show whether users understand and trust the workflow.

| Metric | What It Indicates |
|---|---|
| Weekly active analysts | Regular usage by SOC users |
| Alerts reviewed in dashboard | Engagement with the core workflow |
| Decision details opened | Analysts are inspecting reasoning |
| Overrides submitted | Users are giving product feedback |
| Escalations created | Product is driving real action |
| Connectors configured | Movement from demo to real deployment |
| Repeat usage after first demo | Product stickiness |
| Time from signup to first triage | Onboarding quality |

Adoption goal:

> Move users from curiosity about AI to confidence in AI-assisted SOC decisions.

---

## 8. PM Operating Methods

### Weekly Product Review

Review:

- Alerts processed.
- Auto-resolve vs escalate split.
- Analyst overrides.
- False positives and false negatives.
- Demo reliability.
- Top customer objections.
- Connector progress.

Decision rule:

> If trust metrics worsen, slow automation and improve reasoning, rules, and evaluation before adding more features.

### Evaluation Loop

1. Collect realistic alerts.
2. Label expected decision with security reasoning.
3. Run through Gemini analysis.
4. Apply backend safety rules.
5. Compare AI recommendation, backend action, and analyst label.
6. Track failures by category.
7. Improve prompt, schema, rule, or connector normalization.

### Customer Discovery Questions

Ask SOC leads:

- Which alerts waste the most analyst time?
- Which alert types are safe to auto-close?
- Which alerts must always escalate?
- What evidence do analysts need before trusting a decision?
- What audit trail is required for compliance?
- Which SIEM/EDR tools must SentinelAI connect to first?

### Roadmap Prioritization

Prioritize work using:

- Security risk reduction.
- Analyst time saved.
- Demo credibility.
- Connector demand.
- Compliance value.
- Engineering complexity.

Near-term roadmap:

1. Keep Render stable on `ALERT_SOURCE=real_world_json`.
2. Build the Wazuh MCP connector for live alerts.
3. Add backend live-ingestion logic and connector status/error handling.
4. Analyst feedback and override capture.
5. Evaluation dataset and AI quality dashboard.
6. AWS GuardDuty connector.
7. Jira/Slack/ServiceNow escalation.

---

## 9. Launch and Demo Strategy

### Demo Goal

Show that SentinelAI can take real SOC-style alerts, reason over them, apply safety rules, and produce clear decisions faster than manual triage.

### Demo Narrative

1. Security tools create too many alerts.
2. Analysts need decisions, not just scores.
3. SentinelAI ingests alerts from the current real-world JSON feed, then from Wazuh after the MCP connector and backend live-ingestion logic are implemented.
4. Gemini explains risk.
5. Backend safety rules decide auto-resolve or escalate.
6. Dashboard shows decision, confidence, reasoning, and audit trail.
7. High-risk or unclear alerts go to humans.

### Demo Moments That Matter

- A low-risk alert is auto-resolved with clear reasoning.
- A high-severity alert is escalated even if AI confidence is high.
- An ambiguous alert is not auto-closed.
- The audit log proves what happened and why.
- Connector roadmap shows how the demo becomes production.

### Launch Positioning

Short version:

> SentinelAI is the AI decision layer for SOC alert triage.

Longer version:

> SentinelAI connects to security alert sources, explains risk with AI, applies backend safety rules, auto-resolves only safe low-risk alerts, and escalates risky or unclear cases with an audit trail.

### Launch Channels

- Hackathon or university demo.
- LinkedIn product demo video.
- Security founder communities.
- SOC analyst interviews.
- Open-source Wazuh demo walkthrough.
- Investor pitch deck with workflow screenshots.

### Launch Risks

| Risk | Mitigation |
|---|---|
| AI makes unsafe decision | Backend safety rules control final action |
| Demo data looks unrealistic | Use Wazuh as first live source |
| Judges think it is only a dashboard | Emphasize decision layer and audit trail |
| Buyers worry about compliance | Show audit log and on-prem/private model path |
| Model cost grows too high | Track cost per triaged alert |
| Connectors slow down roadmap | Start with Wazuh, then add high-demand sources |

---

## 10. Judge and Investor Talking Points

### One-Liner

SentinelAI turns noisy SOC alerts into explainable decisions.

### Problem

Security tools generate alerts, but human analysts still decide what is real, what is noise, what should be escalated, and how to justify the decision later.

### Solution

SentinelAI adds an AI-powered decision layer above existing tools. It analyzes alerts, explains risk, applies backend safety rules, auto-resolves safe low-risk cases, escalates risky cases, and records every decision.

### Why Now

SOC teams face increasing alert volume, limited analyst capacity, and pressure to adopt AI safely. The market needs AI that improves workflow without removing human control from critical security decisions.

### Differentiation

- Decision layer, not another alert generator.
- AI reasoning plus deterministic backend safety rules.
- Audit trail built into every decision.
- Designed to sit above existing tools instead of replacing them.
- MCP connector roadmap for real SIEM/EDR integration.
- Clear path from demo data to Wazuh, GuardDuty, Sentinel, Splunk, CrowdStrike, and Okta.

### Defensibility

- Labeled alert evaluation dataset.
- Customer-specific decision policies.
- Audit history and feedback loops.
- Connector ecosystem.
- Domain-specific workflows for finance, healthcare, legal, government, manufacturing, telecom, retail, and SaaS.

### Business Case

SentinelAI saves analyst time by reducing repetitive low-risk triage, improves escalation speed for risky alerts, and gives managers an audit-ready view of AI-assisted SOC decisions.

### Safety Message

SentinelAI does not blindly let AI close security incidents. AI provides reasoning, but backend safety rules decide the action. High-severity, risky, or unclear alerts are escalated.

### Investor Closing Line

> SOC teams do not need more alerts. They need faster, safer, explainable decisions. SentinelAI is building the AI decision layer for security operations.

---

## 11. Presentation-Ready Metric Summary

Use this slide summary:

| Category | Key Metrics |
|---|---|
| North Star | Trusted triage decisions per analyst hour |
| Product | Auto-resolution rate, escalation rate, decision acceptance, review time |
| Security | MTTT, false positive reduction, false negative rate, high-severity escalation |
| AI | Accuracy, calibration, hallucination rate, reasoning usefulness, latency |
| Business | Cost saved per analyst, paid pilot conversion, gross margin per alert |
| Reliability | Uptime, ingestion success, audit log success, AI timeout rate |
| Adoption | Weekly active analysts, connectors configured, repeat dashboard usage |

Final PM principle:

> Build trust before increasing automation.
