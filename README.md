# Samskartha — AI-Powered Prompt & Context Engineering Platform

A complete, production-ready full-stack web application that transforms user requests and uploaded context documents into platform-specific optimized prompts and intelligently engineered context packages for **ChatGPT**, **Claude**, **Gemini**, **Perplexity**, **Lovable**, and **NotebookLM**.

> **Scope & Boundary:** Samskartha prepares and optimizes prompt-and-context packages. It does **not** automatically execute tasks or submit queries to ChatGPT, Claude, Gemini, Perplexity, Lovable, or NotebookLM. The user copies the package and chooses when to paste and submit it on the destination platform.

---

## Architecture: Three Core Modules

```text
User Request & Context
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ MODULE 1 — Input and Requirement Analysis              │
│ • Intent & task classification                         │
│ • Structured extraction (objective, audience, role,    │
│   constraints, must-haves, expected output)            │
│ • Deterministic local analysis + Gemini API pass       │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ MODULE 2 — Prompt and Context Engineering              │
│                                                        │
│   [Engine A: IR-Based Prompt Compiler]                 │
│   • Intermediate Representation (IR)                   │
│   • 6 Platform Adapters (ChatGPT, Claude, Gemini,      │
│     Perplexity, Lovable, NotebookLM)                   │
│   • Task Template Matrix (8 Categories)                │
│   • Verified Platform Rules & Constraints              │
│                                                        │
│   [Engine B: Context Engineering Engine]               │
│   • Structure-aware chunking (paragraph & heading)     │
│   • Exact hash (SHA-256) & Jaccard near-deduplication  │
│   • BM25 Lexical Keyword Ranking                       │
│   • Maximal Marginal Relevance (MMR, λ=0.7)            │
│   • Evidence-preserving context compression            │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ MODULE 3 — Package Generation & Output                 │
│ • Deterministic quality validation (intent, rules)     │
│ • Export Formats (Markdown, Plain Text, JSON)          │
│ • One-Click Platform Handoff (Copy & Open)             │
│ • Multi-stage realistic processing stepper             │
└────────────────────────────────────────────────────────┘
```

---

## What is Included

1. **Module 1 — Input & Requirement Analysis:**
   - Multi-field decomposition: `objective`, `task_type`, `intended_audience`, `role`, `functional_requirements`, `constraints`, `must_have_requirements`, `expected_output`, `quality_expectations`, `success_criteria`, `assumptions`.
   - 8 canonical task categories + auto-detection:
     * Research & Fact-Finding
     * Coding & Debugging
     * Web & Application Development
     * Writing & Content Creation
     * Document Analysis & Summarization
     * Planning & Problem-Solving
     * Learning & Educational Assistance
     * Data Analysis
   - Document upload for PDF, DOCX, TXT, and Markdown files with in-memory untrusted text sanitization (neutralizing prompt-injection patterns).

2. **Module 2 — Engine A: Platform-Specific Prompt Engineering:**
   - **IR-Based Prompt Compiler:** Converts structured requirements into platform-native representations.
   - **ChatGPT Adapter:** Ordered steps, role framing, explicit constraints, and defined output formatting.
   - **Claude Adapter:** XML delimiters (`<role>`, `<task_objective>`, `<instructions>`, `<context>`, `<constraints>`, `<output_format>`), step-by-step reasoning guidance.
   - **Gemini Adapter:** Direct actionable instructions, multimodal input references, and clear acceptance criteria.
   - **Perplexity Adapter:** Core research question, search recency window, authoritative source filters, and in-text citation expectations.
   - **Lovable Adapter:** Full application PRD specification with UI/UX tokens, Tailwind CSS/Lucide components, relational schema guidelines, and immutable boundaries.
   - **NotebookLM Adapter:** Source-grounding directives, inquiry questions, evidence attribution, and prominent user upload advisory.

3. **Module 2 — Engine B: Context Engineering:**
   - Structure-aware chunking preserving paragraph boundaries and headings.
   - SHA-256 exact content hashing + Jaccard token near-duplicate filtering.
   - Robertson-Spärck Jones BM25 keyword ranking.
   - Maximal Marginal Relevance (MMR) diversity selection ($\lambda = 0.7$).
   - Dual context output: Compact Context Summary (embedded in prompt) and Detailed Chunk Excerpts with citations.

4. **Module 3 — Package Generation & Quality Evaluation:**
   - Deterministic validation suite checking intent preservation, must-have coverage, platform-specific compliance, and output structure.
   - Quality score rating (0–100) with pass/review criteria.
   - One-click platform handoff (`Copy Package & Open [Platform]`).
   - Export options: `.md`, `.txt`, and `.json`.
   - Modals for Platform Profiles explorer, Benchmark evaluation suite (15 pre-built test cases), and About & Privacy.

---

## Requirements

- **Node.js:** 20 or newer (Node 22 recommended).
- **npm:** 10 or newer.
- **Gemini API Key (Optional):** When no key is configured, Samskartha runs in deterministic local demo mode with verified platform rules. With a key, it enables AI-assisted requirement extraction and refinement.

---

## Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```powershell
   Copy-Item server/.env.example server/.env
   ```

3. **(Optional) Add your Gemini API key in `server/.env`:**
   ```env
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemini-3.8-flash
   ```

4. **Run development mode (starts both frontend on :5173 and backend on :8787):**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:5173
   ```

---

## Testing & Production Build

Run the automated test suite (23 unit & integration tests):
```bash
npm test
```

Build the production React SPA bundle:
```bash
npm run build
```

Run the production server (serves the built frontend and API on port 8787):
```bash
npm start
```

---

## REST API Endpoints

- `GET /api/health` — Service status and Gemini / Firestore configuration.
- `GET /api/platforms` — All 6 platform profiles, rules, and destination URLs.
- `GET /api/platforms/:platformId` — Detailed profile and verified rules for a specific platform.
- `GET /api/tasks` — Supported task categories and structured prompt templates.
- `POST /api/analyze` — Requirement extraction and structured decomposition.
- `POST /api/generate` — Full end-to-end prompt & context engineering pipeline with multipart file upload.
- `GET /api/knowledge/sources` — Verified public documentation references.
- `GET /api/benchmarks` — Benchmark test suite for evaluating platform adapters.

---

## Privacy & Free-Tier Guarantees

- **No Third-Party Paid Services:** Samskartha uses local BM25 + MMR search and does not require paid vector databases or external embeddings.
- **Server-Side API Secrets:** `GEMINI_API_KEY` is never sent to or visible in client code.
- **Zero Permanent Storage:** Uploaded files are processed in-memory for the duration of the request and are immediately discarded.
- **Untrusted Context Treatment:** Uploaded document contents are sanitized to neutralize prompt-injection instructions and cannot override system behavior.
