"""25 synthetic security alerts for the demo.

Mix per plan.md section 6:
  ~8 obvious false positives  -> expect auto_resolve (high confidence)
  ~7 low-risk routine         -> expect auto_resolve
  ~5 ambiguous                -> expect escalate (agent explains uncertainty)
  ~5 high severity            -> expect escalate (never auto-resolved)

Ordering is intentional for the demo: a few easy auto-resolves first,
then the first "escalation moment" arrives early enough for judges to see it.
"""

from app.schemas.alert import Alert, Severity

SYNTHETIC_ALERTS: list[Alert] = [
    # --- Obvious false positives (8) ---
    Alert(
        id="ALT-001",
        title="Port scan detected from known security scanner",
        description="Sequential TCP connection attempts on ports 21-443 from 185.220.101.34, an IP registered to the org's contracted vulnerability scanning vendor (Qualys). Scan window matches the weekly scheduled assessment.",
        source="Network IDS",
        severity=Severity.LOW,
        category="reconnaissance",
    ),
    Alert(
        id="ALT-002",
        title="Duplicate login alert for same user session",
        description="User priya.sharma@corp triggered two 'new device login' alerts 400ms apart from the same IP and browser fingerprint. Session tokens are identical; this is a duplicate event from the SSO connector.",
        source="Identity Provider",
        severity=Severity.LOW,
        category="authentication",
    ),
    Alert(
        id="ALT-003",
        title="Antivirus flagged internal IT tool as suspicious",
        description="EDR quarantined 'AssetInventory.exe' on 3 machines. Binary is signed by the internal IT certificate and matches the hash whitelisted in last month's deployment ticket CHG-2214.",
        source="EDR",
        severity=Severity.MEDIUM,
        category="malware",
    ),
    Alert(
        id="ALT-004",
        title="Failed login burst from decommissioned service account",
        description="svc-legacy-backup failed authentication 14 times against the old backup server 10.2.8.40. The account was disabled in AD on schedule; the cron job on the retired server was never removed.",
        source="SIEM",
        severity=Severity.LOW,
        category="authentication",
    ),
    Alert(
        id="ALT-005",
        title="SSL certificate expiring on staging environment",
        description="Certificate for staging.internal.corp expires in 12 days. Host is not internet-facing and is behind VPN-only access. Renewal ticket OPS-8811 already exists.",
        source="Vulnerability Scanner",
        severity=Severity.LOW,
        category="configuration",
    ),
    Alert(
        id="ALT-006",
        title="Traffic spike to CDN endpoints flagged as beaconing",
        description="Workstation WS-2291 made 2,400 HTTPS requests to assets.cdn-fastly.net in 1 hour. Process is chrome.exe; the pattern matches a web app auto-refreshing dashboards, and the domain is a legitimate Fastly CDN range.",
        source="Network IDS",
        severity=Severity.LOW,
        category="command_and_control",
    ),
    Alert(
        id="ALT-007",
        title="Impossible travel alert for VPN user",
        description="User arun.mehta logged in from Mumbai at 09:02 and from Frankfurt at 09:15. The Frankfurt IP belongs to the corporate VPN egress node the user connected through; the geo-jump is the VPN itself.",
        source="Identity Provider",
        severity=Severity.MEDIUM,
        category="authentication",
    ),
    Alert(
        id="ALT-008",
        title="Mass file reads by backup agent",
        description="Account svc-veeam read 1.1M files on file server FS-03 between 01:00-03:00. Matches the nightly backup window and the agent's documented behavior profile for the last 90 days.",
        source="EDR",
        severity=Severity.LOW,
        category="data_access",
    ),
    # --- Low-risk routine (7) ---
    Alert(
        id="ALT-009",
        title="Three failed logins followed by success",
        description="User neha.gupta failed password authentication 3 times then succeeded from her registered laptop on the office network at 09:31 IST. No MFA anomaly; typical Monday-morning typo pattern.",
        source="SIEM",
        severity=Severity.LOW,
        category="authentication",
    ),
    Alert(
        id="ALT-010",
        title="Outdated TLS version on internal dev server",
        description="dev-api-02 (10.4.1.22) still accepts TLS 1.1. Host is on the isolated development VLAN with no production data and no internet exposure.",
        source="Vulnerability Scanner",
        severity=Severity.LOW,
        category="configuration",
    ),
    Alert(
        id="ALT-011",
        title="USB storage device connected to kiosk machine",
        description="A USB mass-storage device was mounted on the lobby check-in kiosk KIOSK-01. Device policy blocks execution and write access on kiosks; only read events for visitor-badge photos observed.",
        source="EDR",
        severity=Severity.LOW,
        category="policy_violation",
    ),
    Alert(
        id="ALT-012",
        title="Email flagged as phishing by single recipient",
        description="One user reported a marketing newsletter from vendor mailchimp.com as phishing. Link targets match the vendor's registered domains; SPF/DKIM/DMARC all pass; 240 other recipients, zero other reports.",
        source="Email Gateway",
        severity=Severity.LOW,
        category="phishing",
    ),
    Alert(
        id="ALT-013",
        title="Software installation outside change window",
        description="Developer rahul.verma installed VS Code extension pack on his assigned dev laptop at 20:40, outside the 09:00-18:00 change window. Software is on the approved list; install source is the official marketplace.",
        source="EDR",
        severity=Severity.LOW,
        category="policy_violation",
    ),
    Alert(
        id="ALT-014",
        title="DNS queries to newly registered domain",
        description="Workstation WS-1180 queried getting-started-notion.site, registered 20 days ago. Domain resolves to Notion's documented hosting range and was opened from a Slack link in the #onboarding channel.",
        source="DNS Monitor",
        severity=Severity.MEDIUM,
        category="command_and_control",
    ),
    Alert(
        id="ALT-015",
        title="Print job of large document after hours",
        description="User meera.iyer printed a 300-page PDF at 21:15 from the finance floor printer. Document title matches the quarterly board-report template; user is on the finance team with quarter-end this week.",
        source="DLP",
        severity=Severity.LOW,
        category="data_access",
    ),
    # --- Ambiguous (5) ---
    Alert(
        id="ALT-016",
        title="Unusual outbound traffic volume from engineering workstation",
        description="WS-3302 uploaded 4.2 GB to an AWS S3 endpoint over 40 minutes. The bucket is not in the org's known account list, but the user is a data engineer and the transfer began during working hours. No DLP content match available (traffic encrypted).",
        source="Network IDS",
        severity=Severity.MEDIUM,
        category="exfiltration",
    ),
    Alert(
        id="ALT-017",
        title="New local admin account created on file server",
        description="Account 'fsadmin2' was created on FS-01 at 22:47 by domain admin account da-ravi. No change ticket references FS-01 this week. The admin's normal working pattern ends around 19:00, but he has occasionally worked late.",
        source="SIEM",
        severity=Severity.MEDIUM,
        category="persistence",
    ),
    Alert(
        id="ALT-018",
        title="PowerShell execution with encoded command",
        description="powershell.exe ran with -EncodedCommand on HR workstation WS-2019. Decoded payload queries AD group membership -- consistent with both an IT inventory script and with reconnaissance. No matching scheduled task or ticket found.",
        source="EDR",
        severity=Severity.MEDIUM,
        category="execution",
    ),
    Alert(
        id="ALT-019",
        title="Login from new country for dormant account",
        description="Account k.thomas, inactive for 61 days, successfully authenticated from a Singapore residential IP with valid MFA. HR shows the employee on extended leave; travel status unknown.",
        source="Identity Provider",
        severity=Severity.MEDIUM,
        category="authentication",
    ),
    Alert(
        id="ALT-020",
        title="Spike in database reads from application service account",
        description="svc-webapp read 18x its baseline row count from the customers DB over 2 hours. A marketing batch-export job was scheduled this week, but the job's usual service account is svc-etl, not svc-webapp.",
        source="Database Monitor",
        severity=Severity.MEDIUM,
        category="data_access",
    ),
    # --- High severity (5) ---
    Alert(
        id="ALT-021",
        title="Possible data exfiltration to unknown external host",
        description="Server DB-PROD-02 initiated 11 GB of outbound transfer to 45.147.230.88 (bulletproof hosting ASN, no business relationship) over port 443 between 02:10-03:40. Transfer used a self-signed certificate.",
        source="Network IDS",
        severity=Severity.HIGH,
        category="exfiltration",
    ),
    Alert(
        id="ALT-022",
        title="Ransomware indicators: mass file rename with new extension",
        description="Host WS-4410 renamed 3,200 files to *.lockbit3 in 6 minutes and dropped 'RESTORE-FILES.txt' in 14 directories. Volume shadow copy deletion via vssadmin was attempted and blocked.",
        source="EDR",
        severity=Severity.HIGH,
        category="ransomware",
    ),
    Alert(
        id="ALT-023",
        title="Domain admin credentials used from non-admin workstation",
        description="Domain admin da-sunil authenticated interactively on marketing workstation WS-1523, which is outside the privileged-access workstation set. Followed within 4 minutes by DCSync-style replication requests from the same host.",
        source="SIEM",
        severity=Severity.HIGH,
        category="credential_theft",
    ),
    Alert(
        id="ALT-024",
        title="Web shell signature detected on public web server",
        description="File 'cache_helper.aspx' created in the upload directory of WEB-PROD-01 matches China Chopper web shell signatures. The IIS worker process spawned cmd.exe twice in the last hour.",
        source="EDR",
        severity=Severity.HIGH,
        category="intrusion",
    ),
    Alert(
        id="ALT-025",
        title="Mass mailbox export initiated by compromised-looking account",
        description="Account j.dsouza triggered an eDiscovery export of 40 executive mailboxes at 03:20. The account's MFA method was changed to a new phone number 6 hours earlier from a foreign IP.",
        source="Email Gateway",
        severity=Severity.HIGH,
        category="exfiltration",
    ),
]


def get_alerts() -> list[Alert]:
    return list(SYNTHETIC_ALERTS)


def get_alert_by_id(alert_id: str) -> Alert | None:
    return next((a for a in SYNTHETIC_ALERTS if a.id == alert_id), None)
