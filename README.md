# Greyline — Adversarial AI Contract Intelligence

> Read before you sign. Understand before you agree.

Greyline uses 6 sequential AI agents powered by Google Gemini to analyze legal contracts with prosecutor vs. defender adversarial debate, contradiction detection, risk scoring, and negotiation scripts.

## Quick Start

```bash
# 1. Copy env file
cp .env.local.example .env.local
# 2. Add your Gemini API key (free at https://aistudio.google.com/apikey)
# 3. Install and run
npm install
npm run dev
```

Open http://localhost:3000

## 6-Agent Architecture

| Agent | Role | Execution |
|-------|------|-----------|
| Extractor | Parses all clauses from document | Sequential (first) |
| Prosecutor | Finds every risk & compliance issue | Parallel |
| Defender | Counters each risk with industry context | Parallel |
| Contradiction Detector | Finds internal document conflicts | Parallel |
| Judge | Scores each clause 0–100, delivers verdict | Sequential |
| Negotiator | Rewrites high-risk clauses with scripts | Sequential (last) |

## Features

- **Prosecutor vs Defender debate** — adversarial AI arguments on every clause
- **Contradiction detection** — flags when a document contradicts itself
- **Risk gauge** — animated 0–100 score with DANGER/WARNING/CAUTION/SAFE verdicts
- **Scenario simulations** — what could actually happen with each risky clause
- **Negotiation scripts** — exact words to say when requesting changes
- **ELI5 mode** — explains clauses with memorable analogies
- **PDF export** — full branded analysis report
- **5 input types** — PDF, DOCX, image/photo (OCR), paste text, URL

## Supported Documents

- Employment contracts
- Terms of service / privacy policies
- Rental agreements
- Any legal document in PDF, DOCX, image, or text format

## Cloud Run Deployment

```bash
docker build -t greyline .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key greyline
```

For GCP Cloud Run:
```bash
gcloud run deploy greyline \
  --source . \
  --set-env-vars GEMINI_API_KEY=your_key \
  --region us-central1 \
  --allow-unauthenticated
```

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **AI**: Google Gemini 2.0 Flash via @google/generative-ai
- **UI**: Tailwind CSS + shadcn/ui + Framer Motion
- **Parsing**: pdf-parse, mammoth, tesseract.js, cheerio
- **Export**: jsPDF
- **Upload**: react-dropzone

---

*Not legal advice. For educational and negotiation assistance only.*
