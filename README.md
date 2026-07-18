# SentinelAI

SentinelAI is an AI security teammate for alert fatigue: it watches incoming security alerts, resolves the obvious ones on its own, and escalates the uncertain ones to a human with a clear explanation of what it saw and why it is unsure.

## What We're Building & Why

### The Problem
Security teams get thousands of alerts a day. Most are false alarms. Analysts get exhausted, tune out, and real threats slip through. Existing "AI security tools" usually go in one of two directions:

- auto-block everything, which is risky and can break trust
- dump even more alerts on already overloaded humans, which does not solve the problem

### What We're Building
An AI agent that watches security alerts and does two things:

- If it's confident, it handles the threat itself and logs why.
- If it's not confident, it asks a human and explains clearly what it saw and why it's unsure.

In short: an AI teammate that takes the boring, repetitive 80% off analysts' plates, so humans only handle the hard 20% that actually needs judgment.

### Why This Idea
- It solves a real problem: alert fatigue and analyst burnout are well-known pain points in cybersecurity.
- It stands out from other AI security tools: most compete on "automate everything." SentinelAI competes on knowing when to trust itself versus when to ask for help.
- It is easier to trust and easier to pitch: it reduces grunt work instead of replacing analysts.
- It has a real path after the hackathon: India's iDEX / Ministry of Defence ecosystem actively funds cybersecurity startups like this, so the idea can extend beyond a demo.

## What the Demo Looks Like
1. Alerts stream in live.
2. The agent auto-resolves easy or obvious alerts and shows its reasoning.
3. The agent hits a tricky alert, says "not confident, here's why, need your call," and escalates it instead of guessing.
4. The dashboard shows how many alerts were handled automatically, freeing up analyst time.

## What We Need to Build
- A backend that feeds alerts to Claude and gets back a decision: auto-resolve or escalate.
- A simple UI showing the alert feed live.
- A small dashboard chart showing autonomous versus escalated alerts.

## Scope
That is the whole scope. No real network integration is needed for the demo. We use fake sample alerts to make the experience realistic without depending on live infrastructure.

## Core Message
SentinelAI is not about replacing analysts. It is about reducing noise, preserving trust, and helping teams focus on the alerts that actually need human judgment.

## Local Development

### Demo login

These credentials are for local development only: 

- Username: `admin`
- Password: `SentinelAI2026!`

Do not reuse or deploy these credentials in production. The backend stores the
password as a bcrypt hash in the git-ignored `backend/.env` file.

### Run the backend

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

FastAPI is available at http://127.0.0.1:8000 and Swagger UI at
http://127.0.0.1:8000/docs.

### Run the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm start
```

Open http://localhost:3000 and sign in with the local demo credentials above.
