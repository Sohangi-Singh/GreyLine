# GREYLINE
### *Read before you sign. Understand before you agree.*

> An adversarial multi-agent AI system that deploys 6 specialized AI agents to analyze legal documents — detecting exploitative clauses, hidden liabilities, contradictions, and contractual risks before you sign anything.

---

## The Problem

Every day, millions of people sign employment contracts, rental agreements, app terms of service, and vendor agreements without truly understanding what they're agreeing to. Legal language is deliberately complex. Exploitative clauses hide in plain sight. Most people simply don't have access to a lawyer every time they need to sign something.

**The result:** People unknowingly sign away their IP rights, agree to one-sided arbitration, accept illegal working conditions, and lock themselves into contracts that were designed against them.

---

## What Greyline Does

Greyline deploys **6 adversarial AI agents** that genuinely argue about your contract before you sign it — mirroring how real legal proceedings work.

```
Document Upload
      │
      ▼
┌─────────────┐
│  EXTRACTOR  │  Parses every clause with legal meaning
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│  PROSECUTOR         DEFENDER       CONTRADICTION      │
│  Finds every    ◄──────────►   Detects internal      │
│  possible risk   Argues why     conflicts within      │
│  aggressively    it's standard  the same document     │
└──────────────────────────┬───────────────────────────┘
                           │ (all three run in parallel)
                           ▼
                    ┌─────────────┐
                    │    JUDGE    │  Weighs arguments, scores 0–100
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ NEGOTIATOR  │  Rewrites risky clauses + scripts
                    └─────────────┘
                           │
                           ▼
                    Risk Dashboard
```

---

## Key Features

### Adversarial Reasoning
Not a summarizer. Not a keyword detector. Two agents with opposing mandates analyze every clause simultaneously — a Prosecutor who assumes the worst and a Defender who argues reasonableness. A neutral Judge weighs both and delivers a verdict with a risk score from 0 to 100.

### Contradiction Detection
Finds clauses within the same document that contradict each other — a capability no comparable consumer tool exposes. Example: Section 4 says "30 days notice required" while Section 19 says "immediate termination permitted."

### Risk Heatmap
Every clause is color-coded in the document view — red for critical, orange for high, amber for medium, green for safe. Click any clause to open the full debate transcript.

### Three Reading Levels
- **Legal** — technical language preserved
- **Simple** — plain English, short sentences
- **ELI5** — analogies anyone can understand, regardless of age or legal background

### Negotiation Engine
For every high-risk clause, Greyline rewrites it to be fair and provides the exact words you can say to the other party to request the change.

### Compliance Flags
Automatically detects GDPR, CCPA, and Labor Law violations tied to specific clauses — not blanket warnings, but precise clause-level compliance analysis.

### Industry Benchmark Comparison
Compares clauses against typical industry standards — "This non-compete is more restrictive than 88% of similar employment agreements."

### Export
Full PDF report with executive summary, clause-by-clause breakdown, contradiction report, and negotiation recommendations.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| AI Engine | Google Gemini 1.5 Flash |
| Multi-Agent Orchestration | Custom pipeline in TypeScript |
| PDF Extraction | pdfjs-dist |
| DOCX Extraction | mammoth |
| OCR (scanned docs) | tesseract.js |
| PDF Export | jsPDF |
| Deployment | GCP Cloud Run (Docker) |
| Streaming | Server-Sent Events (SSE) |

---

## Supported Document Types

- PDF documents
- DOCX / Word files
- Images and photos of physical contracts (OCR)
- Pasted text
- URLs (online Terms of Service, Privacy Policies)

---

## Getting Started

### Prerequisites
- Node.js 18+
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com/apikey))

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/greyline.git
cd greyline

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Add your Gemini API key to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Deploying to GCP Cloud Run

```bash
# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Store API key as secret
echo -n "your_api_key" | gcloud secrets create GEMINI_API_KEY --data-file=-

# Deploy
gcloud run deploy greyline \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --memory 1Gi \
  --timeout 300
```

---

## Sample Documents

Greyline ships with three pre-loaded demo documents designed to showcase the platform:

| Document | Risk Level | Key Issues |
|---|---|---|
| NovaTech Employment Agreement | CRITICAL (95/100) | Overbroad non-compete, IP ownership of personal projects, 54-hour work week, company-appointed arbitrator |
| App Terms of Service | HIGH (81/100) | Data selling to undefined "partners", perpetual content license, binding arbitration waiver |
| Residential Rental Agreement | HIGH (78/100) | Compounding late fees, unreturnable security deposit, 12-hour landlord entry notice |

---

## Architecture

### Agent Design Philosophy

Each agent has a single, focused mandate with no awareness of the final verdict — this prevents anchoring bias and ensures genuine adversarial tension.

The **Prosecutor** is instructed to assume malicious intent. The **Defender** is instructed to assume standard practice. Neither knows what the other will say. The **Judge** receives both outputs cold and must reason through the conflict.

This architecture produces significantly more nuanced risk assessments than single-prompt approaches because it forces the model to steelman both sides before concluding.

### Contradiction Detection

The Contradiction Detector runs in parallel with the Prosecutor and Defender, receiving all extracted clauses simultaneously. It looks for logical conflicts, circular obligations, and inconsistent definitions — issues that are invisible when analyzing clauses individually but apparent when reading the document as a whole.

### Streaming Pipeline

Analysis results stream to the frontend via Server-Sent Events. Each agent completion triggers a UI update in real time, so users see the analysis build progressively rather than waiting for a single large response.

---

## Evaluation Against Problem Statement

| Criterion | Greyline's Approach |
|---|---|
| Legal Reasoning Quality | Adversarial multi-agent debate produces reasoned verdicts, not keyword matching |
| Risk Identification Accuracy | Prosecutor agent with explicit mandate to find every possible harm |
| Explainability | Three reading levels, debate transcript, worst-case scenario simulation |
| Practical Applicability | Works on any document type, outputs actionable negotiation scripts |
| Technical Architecture | 6-agent pipeline with parallel execution, SSE streaming, GCP Cloud Run |
| Adaptability | Supports employment, rental, ToS, privacy policies, vendor agreements |
| Innovation | Contradiction detection, adversarial debate view, negotiation script generation |
| User Experience | Designed for ages 10–60, ELI5 mode, one-click sample analysis |

---

## What Makes Greyline Different

Most legal AI tools are document summarizers with a risk label appended. Greyline is architecturally different in three ways:

**1. Genuine adversarial tension.** The Prosecutor and Defender have opposing mandates. The Judge must resolve a real conflict, not just restate what a single model thought.

**2. Contradiction detection.** No comparable consumer tool finds internal conflicts within the same document. This is where real legal harm hides — in the gap between what Section 4 says and what Section 19 quietly overrides.

**3. Actionable output.** Greyline tells you what to do, not just what's wrong. The Negotiator rewrites the clause and gives you the exact script to use with the other party.

---

## Built At

**Promptors Hackathon** — organized by Scaler x Ascent, May 2026

*Built in under 4 hours as a live coding demonstration.*

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Disclaimer

Greyline is an AI-powered legal awareness tool. It does not constitute legal advice and is not a substitute for a qualified legal professional. Analysis is AI-estimated and should be used to identify areas requiring professional review, not as a final legal determination.

---

<p align="center">
  <strong>Greyline — Because the grey areas in contracts are where you get hurt.</strong>
</p>