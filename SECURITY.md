# Security Policy

SentinelAI is an AI security teammate for alert triage. We take the security of this project and its users seriously. If you discover a vulnerability, please report it responsibly.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| main    | Yes       |

Security fixes are applied to the latest code on the `main` branch. Older or forked deployments may not receive updates.

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, report issues privately using one of these channels:

1. **GitHub Security Advisories** (preferred):  
   [https://github.com/BrijeshRakhasiya/SentinelAI/security/advisories/new](https://github.com/BrijeshRakhasiya/SentinelAI/security/advisories/new)

2. **Email**: Contact the repository maintainers through the email listed on the GitHub profile or organization page associated with this repo.

### What to Include

To help us investigate quickly, please include:

- A clear description of the vulnerability and its potential impact
- Steps to reproduce the issue (proof of concept if available)
- Affected components (backend API, frontend, auth, deployment, etc.)
- Your environment details (browser, OS, deployment URL if relevant)
- Any suggested remediation, if you have one

### Response Timeline

We aim to:

- Acknowledge your report within **3 business days**
- Provide an initial assessment within **7 business days**
- Share remediation plans or fixes as soon as a patch is available

We will keep you informed of progress and credit reporters when appropriate, unless you prefer to remain anonymous.

## Scope

### In Scope

- Authentication and authorization flaws (JWT handling, session management, access control)
- Injection, XSS, CSRF, SSRF, and similar web application vulnerabilities
- Insecure API design or data exposure in backend endpoints
- Sensitive data leakage (credentials, tokens, audit logs, alert payloads)
- Misconfigurations in Docker, deployment, or environment handling
- Issues in how alert data or AI responses are processed, stored, or displayed

### Out of Scope

- Social engineering or phishing against maintainers or users
- Denial-of-service attacks against production or demo infrastructure
- Issues in third-party services (Render, Google Gemini, etc.) — report those to the respective vendor
- Vulnerabilities in dependencies with no practical exploit path in SentinelAI
- Missing security headers or best-practice hardening with no demonstrated exploit
- The use of synthetic demo data and single admin credentials, which are known limitations of the hackathon prototype

## Security Considerations for Deployments

If you deploy SentinelAI yourself:

- **Change default credentials** — do not use hardcoded or demo admin passwords in production.
- **Protect secrets** — store API keys, JWT secrets, and database credentials in environment variables or a secrets manager, not in source code.
- **Use HTTPS** — terminate TLS in production; never send auth cookies or tokens over plain HTTP.
- **Restrict network access** — limit who can reach the backend API and audit log database.
- **Review AI decisions** — automated triage should be monitored; high-severity actions should require human approval in production environments.
- **Upgrade dependencies** — keep Python, Node.js, and package dependencies up to date.

## Known Limitations (Demo / Hackathon Build)

This project is a working prototype. The following are intentional simplifications, not undisclosed vulnerabilities:

- Single admin account without role-based access control
- Synthetic alert data, not connected to live SIEM/EDR systems
- SQLite audit logging suitable for demo scale, not multi-tenant production load
- Demo mode may use cached AI responses to avoid API rate limits

These limitations are documented in [context.md](./context.md). Production deployments should address them before handling real security data.

## Disclosure Policy

We follow coordinated disclosure. Please give us reasonable time to investigate and patch before public disclosure. We appreciate researchers who act in good faith and avoid accessing, modifying, or deleting data that does not belong to them.

Thank you for helping keep SentinelAI and its users safe.
