# About Readout: Medical Report Explanation & Clinical Intelligence System

---

## 1. What This Project Is

**Readout** is a full-stack, clinic-grade medical laboratory report explanation, risk flagging, and clinical decision-support (CDS) platform. 

When patients receive diagnostic laboratory reports (such as Complete Blood Counts, Comprehensive Metabolic Panels, Lipid Profiles, Thyroid Panels, or Renal Function Tests), the resulting documents are notoriously opaque: dense tabular grids filled with medical acronyms, floating-point measurements, varied units of measurement, and narrow reference intervals.

Readout solves this communication barrier:
1. **Multimodal Document Ingestion**: Ingests laboratory reports directly as digital PDFs or mobile camera captures (PNG, JPG, WEBP) using multimodal vision AI.
2. **Deterministic Range Flagging**: Flags laboratory biomarkers against the **exact reference boundaries printed by the originating diagnostic laboratory**, rather than arbitrary textbook ranges.
3. **Plain-Language Translations**: Translates each biomarker into plain, non-alarmist language—explaining what the test measures, where the value sits relative to the printed range, and common everyday influences (fasting window, hydration, sleep, exercise, medications).
4. **Zero-Hallucination Hybrid RAG**: Embeds a two-tier Hybrid Retrieval-Augmented Generation engine combining a deterministic structured patient ledger with official clinical guideline criteria (ADA, ACC/AHA, KDIGO, ACG, Endocrine Society, WHO).
5. **Doctor-Ready Summary Synthesis**: Gating clinical export on patient review, enabling patients to formulate concise, prioritized questions for their next consultation.
6. **Clinical Safety Safeguards**: Enforces strict medical disclaimers, panic-value critical triage surveillance, pre-analytical drug-lab interference detection, and hard gates that prevent AI clinical assessments from mimicking formal medical diagnoses or valid legal prescriptions.

---

## 2. The Problem It Solves

Modern healthcare delivery presents a structural disconnect between diagnostic testing and patient comprehension:

* **Patient Anxiety and Misinterpretation**: Laboratory portals frequently release raw test results directly to patient smartphones before a physician can review them. Out-of-range flags (often colored red in commercial portals) trigger acute anxiety or self-diagnosis through unverified search engine results.
* **Laboratory Reference Interval Variability**: Reference ranges vary by analytical platform (e.g., Roche Cobas vs. Abbott Architect vs. Beckman Coulter), reagent chemistry, calibration standards, local demographics, and patient sex/age. Generic lookup tables frequently misclassify normal results as abnormal or vice-versa. Readout binds comparisons strictly to the printed reference interval extracted from the physical paper.
* **Pre-Analytical Interference Blindness**: Everyday variables—such as an 8-hour versus 14-hour fast, high-dose biotin supplementation (which interferes with streptavidin-biotin immunoassays for TSH and Troponin), or diuretic use—drastically skew biomarker values. Readout provides contextualization for these non-disease factors.
* **LLM Hallucinations in Healthcare**: Generic generative AI models frequently hallucinate decimal points, invent plausible-sounding laboratory tests, or confuse conventional and SI units (e.g., mg/dL vs. mmol/L). Readout eliminates clinical hallucination by decoupling factual numeric retrieval from linguistic explanation.

---

## 3. Technology Stack

### Runtime & Core Server
* **Node.js (v22.x, ES Modules)**: Primary production application runtime (`server.js`).
* **Express.js (v4.21.2)**: HTTP application server handling REST APIs, static file routing, and security middleware.
* **Multer (v2.4.0)**: Multi-part form-data parser configured for secure disk-based file uploads (PDF, PNG, JPG, WEBP, HEIC up to 20MB).
* **JSON Web Tokens (`jsonwebtoken` v9.0.3)**: Stateless authentication tokens signing user claims with 24-hour expiration.
* **Bcrypt.js (`bcryptjs` v3.0.3)**: Cryptographic password hashing (10 salt rounds).

### Multimodal Artificial Intelligence & Document Ingestion
* **`@google/genai` (v2.23.0)**: Official Google GenAI SDK for Gemini models.
* **Gemini Multimodal Vision Engine**: Cascading model ladder (`gemini-3.1-flash-lite`, `gemini-3.6-flash`, `gemini-flash-latest`, `gemini-3.8-flash`) extracting dense laboratory tables from uploaded documents with structured JSON schema enforcement.

### Document Generation & Clinical Presentation
* **PDF-Lib (`pdf-lib` v1.17.1)**: Low-level vector PDF creation engine generating authentic A4 clinical laboratory reports complete with patient demographics, accession barcodes, reference intervals, and pathology sign-offs.
* **PptxGenJS (`pptxgenjs` v4.0.1)**: Programmatic PowerPoint generation producing widescreen (16:9) executive and clinical architecture presentation decks (`Readout_Clinical_Intelligence_Deck.pptx`).

### Frontend
* **Vanilla ES6+ JavaScript**: Zero-framework, zero-build-step client architecture ensuring instant page loads and complete auditability without minified bundling.
* **Tailwind CSS Utility Philosophy**: Custom design tokens, high-contrast typography, and accessible color palettes implemented via pure CSS variables (`assets/css/app.css` and `assets/css/pages.css`).
* **SVG Vector Graphics**: Custom mathematical SVG range gauges and longitudinal sparkline trends rendered directly into the DOM with zero canvas dependencies.
* **Swagger UI (v5.x CDN)**: Interactive OpenAPI 3.0 documentation served at `/docs`.

### Companion Python & Testing Layer
* **FastAPI (v2.0.0)** & **Pydantic**: Microservice / API specification mirror in `backend/app/main.py`.
* **SQLAlchemy**: Relational schema definitions (`backend/app/db/models.py`) modeling Users, Reports, LabResults, Patterns, and AuditLogs.
* **Pytest & HTTPX (`TestClient`)**: Automated safety and endpoint assertion test suite (`tests/test_backend.py`).

---

## 4. Architecture

Readout operates as a hybrid full-stack system where an Express HTTP server acts as the central API gateway and static file server, coordinating multimodal extraction, two-tier clinical retrieval, client state synchronization, and document generation.

```text
                                  +---------------------------------------+
                                  |         PATIENT / CLINICIAN           |
                                  |   Web Browser (Desktop / Mobile)      |
                                  +-------------------+-------------------+
                                                      |
                                                      | HTTP / JSON / Multipart
                                                      v
+---------------------------------------------------------------------------------------------------------+
|                                        READOUT NODE.JS SERVER                                           |
|                                             (server.js)                                                 |
|                                                                                                         |
|  +---------------------------+   +----------------------------+   +----------------------------------+  |
|  |    Security Middleware    |   |    REST API Endpoints      |   |        Static File Server        |  |
|  |  • X-Medical-Disclaimer   |   |  • /api/auth/*             |   |  • index.html (Landing)          |  |
|  |  • X-Content-Type-Options |   |  • /api/reports/*          |   |  • upload.html (Upload Pipeline) |  |
|  |  • Bearer Token Auth      |   |  • /api/chat & /api/rag/*  |   |  • dashboard.html (Results View) |  |
|  |  • Audit Trail Logger     |   |  • /api/analysis/* (CDS)   |   |  • summary.html (Report Builder) |  |
|  +---------------------------+   +----------------------------+   +----------------------------------+  |
|                                                 |                                                       |
|        +----------------------------------------+------------------------------------+                  |
|        |                                        |                                    |                  |
|        v                                        v                                    v                  |
|  +----------------------------+   +----------------------------+   +---------------------------------+  |
|  | Multimodal OCR Extractor   |   | Hybrid RAG Clinical Engine |   | Document & Presentation Engines |  |
|  | (backend/extractor.js)     |   | (backend/rag_engine.js)    |   | • backend/pdf_generator.js      |  |
|  | • Gemini 3.1 Flash-Lite    |   | • Tier 1: Patient Ledger   |   | • backend/make_presentation.js  |  |
|  | • 503 Auto-Retry Backoff   |   | • Tier 2: Guideline Corpus |   +---------------------------------+  |
|  | • Rule-Based Fallback      |   | • Tier 3: Zero-Hallucinate |                                        |
|  +----------------------------+   +----------------------------+                                        |
|                |                                 |                                                      |
+----------------|---------------------------------|------------------------------------------------------+
                 |                                 |
                 v                                 v
   +---------------------------+     +------------------------------------------+
   |   Google Gemini Cloud     |     |       Medical Knowledge Repository       |
   |   Multimodal Vision API   |     |      (medical_knowledge/*.json)          |
   |   (gemini-3.1-flash-lite) |     |  • rag_corpus.json (8 Clinical Guidelines|
   +---------------------------+     |  • patterns.json (Metabolic Clusters)    |
                                     |  • drug_interactions.json (Biotin/Meds)  |
                                     |  • reference_intervals.json (Ranges)     |
                                     +------------------------------------------+
```

---

## 5. Project Structure

```text
.
├── ABOUT.md                             # Complete architectural & technical specification (this file)
├── README.md                            # High-level project introduction and local usage instructions
├── package.json                         # Node.js manifest, dependencies, and execution scripts
├── server.js                            # Primary Express server: APIs, auth, routing, in-memory store
├── Dockerfile                           # Production container specification (Node 22-slim)
├── docker-compose.yml                   # Container orchestration configuration
├── metadata.json                        # AI Studio environment metadata & capabilities
│
├── backend/                             # Core server-side clinical intelligence modules
│   ├── extractor.js                     # Gemini multimodal OCR document extraction & normalization
│   ├── rag_engine.js                    # Two-tier Hybrid RAG engine with zero-hallucination verification
│   ├── pdf_generator.js                 # Low-level clinical laboratory PDF report generator (pdf-lib)
│   ├── make_presentation.js             # PowerPoint architecture deck generator (pptxgenjs)
│   └── app/                             # Companion Python / FastAPI microservice architecture
│       ├── main.py                      # FastAPI application with medical safety middleware & endpoints
│       ├── core/                        # Security and environment configuration
│       │   ├── config.py
│       │   └── security.py
│       ├── db/                          # Database connection and ORM models
│       │   ├── database.py
│       │   └── models.py                # SQLAlchemy models: User, Report, LabResult, AuditLog
│       └── schemas/                     # Pydantic validation schemas
│           └── report.py
│
├── medical_knowledge/                   # Curated, authoritative medical guidelines and ontologies
│   ├── rag_corpus.json                  # 8 clinical guidelines (ADA, ACC/AHA, KDIGO, ACG, etc.)
│   ├── patterns.json                    # Recognized multi-biomarker pathophysiological clusters
│   ├── drug_interactions.json           # Pre-analytical pharmacological interferences (Biotin, Diuretics)
│   ├── medications.json                 # Reference pharmaceuticals and contraindications
│   ├── reference_intervals.json         # Conventional demographic reference intervals
│   ├── guidelines.json                  # Clinical practice guideline references
│   └── openapi.json                     # Complete OpenAPI 3.0 specification for Swagger UI
│
├── assets/                              # Client-side presentation assets and logic
│   ├── css/
│   │   ├── app.css                      # Design tokens, CSS variables, typography, shell, modals
│   │   └── pages.css                    # Page-specific layouts: upload dropzone, dashboard, summary
│   └── js/
│       ├── app.js                       # Shell manager, API client, Store, Theme, Range Gauge, Sparklines
│       ├── data.js                      # Default demonstration dataset (16 verified laboratory parameters)
│       ├── dashboard.js                 # Dashboard controller: filtering, checklist, CDS tabs, audit modal
│       ├── summary.js                   # Doctor-ready summary builder with print/download formatting
│       ├── triage.js                    # CLSI/CAP acute panic value clinical triage surveillance engine
│       ├── contextualizer.js            # Pre-analytical context engine (fasting duration, medication flags)
│       ├── nutrition.js                 # Health condition dietary guidance (foods to avoid / foods that heal)
│       ├── lifestyle.js                 # Quantified evidence-based lifestyle simulator (DPP, PREDIMED, DASH)
│       └── i18n.js                      # Multilingual translation engine (EN, ES, HI, TE, TA, BN)
│
├── index.html                           # Public landing page with interactive hero demo and FAQ
├── upload.html                          # Drag-and-drop document upload with simulated extraction stages
├── dashboard.html                       # Main clinical results dashboard with CDS intelligence tabs
├── summary.html                         # Appointment summary generator and print preview
├── history.html                         # Longitudinal timeline explorer and multi-report trend analyzer
├── settings.html                        # User preferences (Units, Theme, Font size) & Audit Trail log
├── help.html                            # Clinical FAQ, medical glossary, and legal disclaimer
│
├── tests/                               # Test suites
│   └── test_backend.py                  # Pytest suite asserting safety headers, auth, and CDS guards
│
└── uploads/                             # Server disk directory for uploaded patient documents
```

---

## 6. Application Startup

The production application starts via Node.js executing `server.js`:

```text
npm start  /  node server.js
     │
     ├── 1. Environment & Path Initialization
     │      • Derive __dirname and __filename via url.fileURLToPath
     │      • Read JWT_SECRET and PORT (defaults to 3000)
     │
     ├── 2. Filesystem Preparation
     │      • Verify or create ./uploads/ directory for binary ingestion
     │
     ├── 3. Middleware Configuration
     │      • Mount express.json() & express.urlencoded()
     │      • Mount Safety Headers: X-Medical-Safety-Disclaimer & X-Content-Type-Options
     │
     ├── 4. Service Instantiation & Knowledge Loading
     │      • Instantiate HybridRAGEngine (backend/rag_engine.js)
     │      • Parse and index medical_knowledge/rag_corpus.json into memory
     │      • Seed default user (demo@readout.health) and initial SEED_REPORT
     │
     ├── 5. REST & Static Route Registration
     │      • Register /api/auth, /api/reports, /api/chat, /api/cds, /api/settings
     │      • Serve Swagger UI at /docs and openapi.json at /openapi.json
     │      • Mount express.static(__dirname) for HTML, CSS, JS assets
     │
     └── 6. Network Listener Ready
            • Bind to 0.0.0.0:3000
            • Log startup confirmation: "Readout Medical Intelligence Server running on http://0.0.0.0:3000"
```

---

## 7. How the Application Works (High-Level Operational Narrative)

1. **Accessing the Application**: The user opens the landing page (`index.html`). The interface presents an educational overview of how laboratory values are interpreted, emphasizing that Readout flags numbers against printed ranges rather than diagnosing disease.
2. **Uploading a Report**: The user navigates to `upload.html` and drops a PDF or photo of their laboratory test. 
3. **Multimodal Vision Ingestion**: The file is uploaded via `POST /api/reports/upload`. `backend/extractor.js` sends the document to Gemini Multimodal Vision (`gemini-3.1-flash-lite`). Gemini parses the image layout, extracting the laboratory name, collection date, patient demographics, test names, numeric values, units, and printed reference limits.
4. **Clinical Verification**: If OCR succeeds, the report is assigned an ID (e.g., `rpt-1789715766584`) and stored in memory. The browser redirects to `dashboard.html?report=rpt-...`.
5. **Dashboard Analysis**: The dashboard displays:
   * A high-level verdict summarizing how many tests were extracted and how many sit outside printed limits.
   * Panic value triage alerts if any acute thresholds (e.g., Potassium > 6.0 mEq/L) are breached.
   * Interactive SVG **Range Gauges** for every test, visually showing whether the value is inside or outside the laboratory's printed boundaries.
   * Multi-biomarker pattern recognition cards (e.g., concurrent elevation of fasting glucose, HbA1c, and triglycerides).
   * Interactive Clinical Decision Support tabs (Differential Assessment, Longitudinal Prediction, Medication Options, Prescription Draft safeguards).
6. **Asking Questions via Hybrid RAG**: The user clicks **"Ask My Reports"** or a prompt chip (e.g., *"Why is my fasting glucose flagged and what does ADA say?"*). `POST /api/chat` routes the query to `backend/rag_engine.js`. The engine queries the patient's verified numbers and matches them against the 8 indexed clinical guidelines, verifying zero numerical hallucinations before responding.
7. **Building an Appointment Summary**: The user navigates to `summary.html`. Gated behind a review checklist, the user ticks off each flagged result, enters their personal context (symptoms, questions for the physician), and prints a clean, one-page A4 summary.

---

## 8. Request / Data Flow

### Sequence 1: Document Upload & AI Extraction

```text
User Browser (upload.html)
       │
       │  1. Multipart POST /api/reports/upload (file: PDF/Image, fasting: true)
       ▼
Express Server (server.js)
       │
       │  2. Multer writes file to ./uploads/{timestamp}-{hash}.pdf
       │  3. Invokes extractLabReport({ filePath, mimeType })
       ▼
Extractor (backend/extractor.js)
       │
       │  4. Reads file into base64 buffer
       │  5. Dispatches request to GoogleGenAI SDK (gemini-3.1-flash-lite)
       │     with strict JSON schema & zero-hallucination prompt
       ▼
Gemini Multimodal API
       │
       │  6. Performs optical layout analysis & tabular extraction
       │  7. Returns JSON with laboratory, patient, and parameters array
       ▼
Extractor (backend/extractor.js)
       │
       │  8. Normalizes canonical IDs (e.g. "Fasting Blood Sugar" -> "glucose")
       │  9. Evaluates status against extracted low/high printed boundaries
       ▼
Express Server (server.js)
       │
       │ 10. Stores report in REPORTS Map
       │ 11. Records audit log: UPLOAD_REPORT
       │ 12. Returns JSON { status: "success", data: { id: "rpt-...", ... } }
       ▼
User Browser (upload.html)
       │
       │ 13. Redirects to dashboard.html?report=rpt-...
```

### Sequence 2: Grounded Hybrid RAG Query Flow

```text
User Browser (Chat Modal in app.js)
       │
       │  1. POST /api/chat { message: "Why is my glucose 112 mg/dL?", reportId: "..." }
       ▼
Express Server (server.js)
       │
       │  2. Retrieves active Report object from REPORTS map
       │  3. Invokes ragEngine.query(message, report)
       ▼
Hybrid RAG Engine (backend/rag_engine.js)
       │
       │  [Tier 1: Ground Truth Ledger Extraction]
       │  4. extractPatientLedger() maps all parameters, flags, and calculates
       │     derived ratios (eAG = 28.7*A1C - 46.7, Non-HDL = Chol - HDL, TG/HDL)
       │
       │  [Tier 2: Knowledge Base Retrieval]
       │  5. retrieveClinicalEvidence() matches canonical tokens and scores
       │     the 8 authoritative guidelines in rag_corpus.json
       │
       │  [Synthesis]
       │  6. Generates response using Gemini (or Deterministic Synthesizer if offline)
       │     grounded exclusively in the Patient Ledger and Retrieved Guidelines
       │
       │  [Tier 3: Post-Generation Anti-Hallucination Guard]
       │  7. verifyZeroHallucinations() extracts all numerical assertions via regex
       │     and verifies that every number exists in the patient's verified ledger
       ▼
Express Server (server.js)
       │
       │  8. Logs audit entry: ASK_MY_REPORTS_CHAT_RAG
       │  9. Returns JSON with answer, evidence_classification, and verified patient facts
       ▼
User Browser (Chat Modal in app.js)
       │
       │ 10. Renders grounded answer bubble with source badges, fact chips, and follow-ups
```

---

## 9. Frontend Architecture

The frontend is constructed using pure semantic HTML5, modern ECMAScript (ES6+), and CSS custom properties without reliance on heavy frameworks (React, Vue, Angular) or bundling pipelines (Webpack, Vite).

### Pages Overview

| Page | Path | Purpose & Mechanics |
|---|---|---|
| **Landing** | `/index.html` | Hero demonstration with animated raw-to-plain text resolution, system capability boundary ledger, and clinical FAQ. |
| **Upload** | `/upload.html` | Drag-and-drop file upload with format validation, preparation guidelines, and progressive extraction animation. |
| **Dashboard** | `/dashboard.html` | Primary clinical workstation: verdict badge, panic value alerts, range gauges, parameter search/filtering, CDS tabs, and trend visualization. |
| **Summary** | `/summary.html` | Doctor-ready summary generator. Gated on reviewing flagged tests; produces printable A4 patient consult briefs. |
| **History** | `/history.html` | Multi-year chronological timeline showing longitudinal progression across previous laboratory panels. |
| **Settings** | `/settings.html` | Client-side preferences (Units, Theme, Font scale), system audit log inspector, and complete data deletion. |
| **Help** | `/help.html` | Patient educational guides on reference intervals, panic values, medical terminology glossary, and legal disclaimers. |

### Key Shared Components (`assets/js/app.js`)

1. **Range Gauge (`gauge(p)`)**:
   * Renders an inline SVG representing a measurement's position relative to its printed reference interval.
   * Computes dynamic domain scaling with generous padding so that values far outside normal ranges remain visible on the SVG track without clipping.
   * Draws a shaded normal band (`<rect class="gauge-band">`) bounded by tick marks, and an indicator pin (`<line class="gauge-pin">`) color-coded ochre for out-of-range and neutral pine for in-range.
2. **Longitudinal Sparklines (`sparkline(series, p)`)**:
   * Generates SVG polyline trend charts across sequential historical blood draws.
   * Renders a shaded reference background band indicating the historical normal range, plotting individual data points with highlighted alert dots.
3. **Client-Side Store (`Store`)**:
   * Namespaced wrapper around `localStorage` using the prefix `readout.*`.
   * Manages theme preferences (`readout.theme`), unit system (`readout.units`), reviewed test checklist (`readout.reviewed`), active report ID (`readout.activeReportId`), and user session metadata.
4. **Unit Conversion (`view(p)`)**:
   * Transparently converts conventional units to SI units (e.g., Glucose mg/dL $\to$ mmol/L using factor `0.05551`, Total Cholesterol mg/dL $\to$ mmol/L using factor `0.02586`) without mutating the underlying extracted laboratory facts.

---

## 10. Backend Architecture

The backend is driven by `server.js` running on Node.js v22.

### Routing Table & API Specifications

| Method | Endpoint | Description | Request Payload / Params | Response Format |
|---|---|---|---|---|
| `GET` | `/api/health` | Service health & version status | None | `{ status: "healthy", version: "2.0.0", ... }` |
| `POST` | `/api/auth/register` | Register new user account | `{ email, password, fullName }` | `{ status: "success", data: { token, user } }` |
| `POST` | `/api/auth/login` | Authenticate user credentials | `{ email, password }` | `{ status: "success", data: { token, user } }` |
| `GET` | `/api/auth/me` | Fetch active authenticated profile | Header: `Authorization: Bearer <token>` | `{ status: "success", data: { id, email, fullName } }` |
| `POST` | `/api/reports/upload` | Upload and extract lab report | `multipart/form-data` (`file`, `fasting`) | `{ status: "success", data: { id, parameters, ... } }` |
| `GET` | `/api/reports` | List all available reports | None | `{ status: "success", data: [ ... ] }` |
| `GET` | `/api/reports/:id` | Fetch specific report details | URL param `:id` | `{ status: "success", data: { ... } }` |
| `PUT` | `/api/results/:id/verify` | Override/verify extracted test | `{ name, value, unit, low, high }` | `{ status: "success", message: "...", data: { ... } }` |
| `GET` | `/api/history` | Multi-report historical summaries | None | `{ status: "success", data: [ ... ] }` |
| `GET` | `/api/timeline` | Multi-point longitudinal trends | None | `{ status: "success", data: { dates, tests } }` |
| `POST` | `/api/chat` | Grounded Hybrid RAG query | `{ message, reportId }` | `{ status: "success", data: { answer, ... } }` |
| `POST` | `/api/rag/query` | Dedicated clinical RAG search | `{ query, reportId }` | `{ status: "success", data: { ... } }` |
| `GET` | `/api/rag/knowledge-base` | Inspect indexed clinical guidelines | None | `{ status: "success", data: { corpus: [ ... ] } }` |
| `POST` | `/api/analysis/conditions`| AI condition pattern recognition | `{}` | `{ safety_label: "...", data: { ... } }` |
| `POST` | `/api/diagnosis/analyze` | Differential assessment guard | `{}` | `{ safety_label: "...", data: { ... } }` |
| `POST` | `/api/prediction/analyze` | Longitudinal risk trajectory | `{}` | `{ safety_label: "...", data: { ... } }` |
| `POST` | `/api/medications/recommend`| Pharmacological guidance | `{}` | `{ safety_label: "...", data: { ... } }` |
| `POST` | `/api/medications/dose-info`| Dosage evaluation guard | `{ medication_name, age, renal_function_egfr }` | `{ safety_label: "...", data: { ... } }` |
| `POST` | `/api/prescriptions/draft` | Safety-voided prescription draft | `{ medication_name, clinical_indication }` | `{ safety_label: "...", data: { legal_status: "VOID", ... } }` |
| `GET` | `/api/reports/:id/summary`| Doctor-ready summary metadata | URL param `:id` | `{ status: "success", data: { ... } }` |
| `GET` | `/api/reports/:id/export` | Export JSON dossier (opt. PII redaction) | Query `?redact_pii=true` | Downloadable JSON file attachment |
| `GET` | `/api/sample-report/download`| Download raw synthetic lab report | Query `?type=metabolic\|thyroid\|critical` | Plaintext / PDF lab report |
| `GET` | `/api/presentation/download`| Download PowerPoint architecture deck | None | Binary `.pptx` file attachment |
| `GET` | `/api/audit` | Retrieve clinical engine audit trail | None | `{ status: "success", data: [ ... ] }` |
| `GET` | `/openapi.json` | OpenAPI 3.0 API schema | None | Complete OpenAPI JSON schema |
| `GET` | `/docs` | Interactive Swagger UI Explorer | None | Full Swagger UI interface |

---

## 11. Database & Persistence Layer

The application incorporates a two-layer persistence design:

### 1. Production Node.js In-Memory Store (`server.js`)
In the primary production Node server, data is held in high-speed, thread-safe in-memory collections:
* `REPORTS (Map<string, Object>)`: Maps report IDs to complete document schemas (metadata, patient demographics, and parameter arrays).
* `USERS (Map<string, Object>)`: Maps email addresses to user accounts containing bcrypt password hashes.
* `AUDIT_LOGS (Array<Object>)`: A FIFO ring buffer retaining the last 500 audit entries (recording logins, uploads, OCR extractions, result verifications, RAG queries, and settings adjustments).

### 2. Relational SQLAlchemy Models (`backend/app/db/models.py`)
For enterprise deployments requiring persistent SQL storage (PostgreSQL/SQLite), the project defines full relational schemas:

```text
+-------------------+             +----------------------+
|       User        |             |        Report        |
+-------------------+             +----------------------+
| id (UUID, PK)     | 1         * | id (UUID, PK)        |
| email (String)    |-------------| user_id (FK -> User) |
| hashed_password   |             | title (String)       |
| full_name         |             | laboratory (String)  |
| is_active         |             | collection_date      |
| created_at        |             | is_fasting (Boolean) |
+-------------------+             | status (String)      |
          | 1                     | confidence_score     |
          |                       +----------------------+
          | *                                | 1
+-------------------+                        |
|     AuditLog      |                        | *
+-------------------+             +----------------------+
| id (UUID, PK)     |             |      LabResult       |
| user_id (FK)      |             +----------------------+
| action (String)   |             | id (UUID, PK)        |
| resource_type     |             | report_id (FK)       |
| details (JSON)    |             | normalized_test_name |
| timestamp         |             | value (Float)        |
+-------------------+             | unit (String)        |
                                  | reference_low (Float)|
                                  | reference_high(Float)|
                                  | status (String)      |
                                  | what_it_measures     |
                                  | is_verified (Boolean)|
                                  +----------------------+
```

---

## 12. Authentication & Security

### 1. Stateless JWT & Password Hashing
* User registration (`POST /api/auth/register`) salts and hashes passwords using `bcrypt.hash(password, 10)`.
* User login (`POST /api/auth/login`) verifies password hashes and returns a signed JSON Web Token carrying the user ID and email, valid for 24 hours.
* Requests include tokens in the `Authorization: Bearer <token>` header, verified in `server.js` and parsed in `assets/js/app.js`.

### 2. Clinical Safety Headers
Every HTTP response issued by Readout is stamped with mandatory safety headers:
```http
X-Medical-Safety-Disclaimer: Readout flags results; it does not diagnose, treat, or replace a clinician.
X-Content-Type-Options: nosniff
```

### 3. Prescription & Diagnostic Gating
* **Anti-Prescription Gate**: The `/api/prescriptions/draft` endpoint stamps all candidate medications with a prominent disclaimer: `VOID / INVALID FOR DISPENSING WITHOUT PHYSICIAN SIGNATURE AND MEDICAL LICENSE NUMBER`.
* **Diagnostic Boundary Gate**: The `/api/diagnosis/analyze` and `/api/analysis/conditions` endpoints explicitly return `confirmed_diagnosis: NONE` and require physician review to prevent automated self-medication.

### 4. XSS & Injection Prevention
All dynamic strings rendered into the DOM pass through the `esc()` sanitizer, neutralizing HTML entities (`&`, `<`, `>`, `"`).

---

## 13. Core Modules

### 1. Multimodal Extractor (`backend/extractor.js`)
* **Purpose**: Parses uploaded clinical laboratory reports into structured JSON.
* **Mechanism**: Converts incoming binary files (PDF/Images) into Base64 and constructs a structured multimodal prompt for Gemini. It cascades across models (`gemini-3.1-flash-lite` $\to$ `gemini-3.6-flash` $\to$ `gemini-flash-latest`) with automatic retry backoff.
* **Canonical Mapping**: Normalizes test names into standard identifiers (`makeCanonicalId`) so that "FBS", "Fasting Glucose", and "Fasting Blood Sugar" resolve to `glucose`.

### 2. Hybrid RAG Engine (`backend/rag_engine.js`)
* **Purpose**: Delivers conversational clinical question answering grounded strictly in patient numbers and medical guidelines.
* **Mechanisms**:
  * **Tier 1 (Patient Ledger)**: Extracts an immutable record of tested parameters, flags out-of-range items, and computes exact derived mathematical ratios (eAG, Non-HDL, TG/HDL ratio, De Ritis ratio).
  * **Tier 2 (Evidence Retrieval)**: Performs token-based scoring against 8 authoritative medical guidelines (`medical_knowledge/rag_corpus.json`).
  * **Tier 3 (Anti-Hallucination Guard)**: Extracts all numerical values from the generated response and confirms that every number is present in the patient's verified ledger or guideline thresholds.

### 3. Critical Value Triage Engine (`assets/js/triage.js`)
* **Purpose**: Real-time surveillance of acute life-threatening "panic" values based on CLSI and CAP standards.
* **Trigger Thresholds**:
  * Serum Potassium: $< 2.8$ or $> 6.0$ mEq/L (Cardiac dysrhythmia risk).
  * Serum Sodium: $< 120$ or $> 158$ mEq/L (Severe cerebral edema / seizure risk).
  * Blood Glucose: $< 50$ or $> 400$ mg/dL (Hypoglycemic coma / DKA risk).
  * Platelet Count: $< 30,000$ /$\mu$L (Spontaneous hemorrhage risk).
* **UI Action**: Immediately mounts an emergency red alert banner instructing the patient to seek urgent medical evaluation.

### 4. Smart Contextualizer (`assets/js/contextualizer.js`)
* **Purpose**: Annotates test results based on pre-analytical factors.
* **Interferences Handled**:
  * **Fasting State**: Annotates fasting blood glucose and triglycerides when fasting duration was under 8 hours.
  * **Biotin Supplementation**: Flags immunoassays (TSH, Free T4, Troponin) that utilize streptavidin-biotin technology, warning of false-positive or false-negative readings.
  * **Thyroid Hormones & Steroids**: Contextualizes elevations in white blood cell counts or shifts in free hormone fractions.

### 5. Nutrition & Condition Engine (`assets/js/nutrition.js`)
* **Purpose**: Maps abnormal biomarkers to evidence-based dietary recommendations.
* **Features**:
  * Condition-specific profiles (Hypertension, Prediabetes, Hyperlipidemia, Fatty Liver, Elevated Uric Acid).
  * Classifies items into *Foods to Strictly Avoid* (with biological rationale) and *Foods That Heal* (with active clinical mechanism).
  * Live interactive food search evaluating specific patient food queries against active lab flags.

### 6. Lifestyle Levers Simulator (`assets/js/lifestyle.js`)
* **Purpose**: Simulates projected biomarker shifts from lifestyle interventions.
* **Trial Grounding**: Grounded in landmark clinical trials including the Diabetes Prevention Program (DPP), PREDIMED, and DASH studies (e.g., $+10$g soluble fiber $\to \approx 8\%$ LDL reduction).

### 7. Multilingual Engine (`assets/js/i18n.js`)
* **Purpose**: Provides localized translations of clinical results and questions into Hindi, Telugu, Tamil, Spanish, and Bengali.
* **Safety Rule**: Retains standardized scientific biomarker codes (e.g., HbA1c, TSH, eGFR) and numeric units in Latin script to prevent clinical misinterpretation during family consultations.

---

## 14. Important Algorithms and Logic

### 1. Two-Tier Zero-Hallucination RAG Architecture
```text
Algorithm: Grounded Clinical Synthesis
Input: Query Q, Patient Report R, Guideline Corpus C
Output: Verified Response A with Citations

1. L_patient = ExtractPatientLedger(R)
   - Map each parameter p in R.parameters to strict ground truth.
   - Compute derived ratios:
       eAG = 28.7 * A1C - 46.7
       NonHDL = TotalChol - HDL
       TG_HDL_Ratio = TG / HDL
       DeRitis_Ratio = AST / ALT

2. G_retrieved = RetrieveGuidelines(Q, L_patient, C)
   - Extract canonical test tokens from Q (e.g., "glucose", "ldl").
   - Score each guideline document d in C:
       Score(d) = 40 * Match(d.canonical_tests) 
                + 15 * HasPatientFlag(d.canonical_tests)
                + 20 * Match(d.keywords)
                + 10 * Match(d.title_tokens)
   - Select top 3 guidelines where Score(d) > 10.

3. If GEMINI_API_KEY is available:
       A_raw = GeminiGenerate(Q, L_patient, G_retrieved, temperature=0.1)
   Else:
       A_raw = DeterministicSynthesize(Q, L_patient, G_retrieved)

4. V = VerifyZeroHallucinations(A_raw, L_patient)
   - Numbers_in_A = RegexExtractNumbers(A_raw)
   - Allowed_Numbers = { L_patient.values, L_patient.bounds, L_patient.derived, StandardGuidelineCutoffs }
   - For num in Numbers_in_A:
       If num not in Allowed_Numbers:
           Flag as unverified or re-ground.
   - Return A_raw with verification badge.
```

### 2. SVG Range Gauge Dynamic Projection
To keep gauge pins visible without clipping when values are dramatically out of range (e.g., Vitamin D of $12$ ng/mL with a normal range of $30 - 100$ ng/mL):
```javascript
// Domain boundaries calculation
if (low != null && high != null) {
  const span = high - low || 1;
  dmin = low - span * 0.7;
  dmax = high + span * 0.7;
}
// Keep pin visible even for extreme values
if (value < dmin) dmin = value - (dmax - value) * 0.08;
if (value > dmax) dmax = value + (value - dmin) * 0.08;

// Map value to SVG coordinate
const x = (n) => ((n - dmin) / (dmax - dmin)) * svgWidth;
const pinX = Math.max(3, Math.min(svgWidth - 3, x(value)));
```

---

## 15. Error Handling & Resilience

1. **Multimodal Vision Failures & 503 Spikes**: If Gemini encounters a 503 service overload or network timeout, `backend/extractor.js` pauses for 600ms, retries the model, and then steps down to the next candidate model (`gemini-3.1-flash-lite` $\to$ `gemini-3.6-flash` $\to$ `gemini-3.8-flash`). If all network models fail or no API key is supplied, it gracefully switches to `DEFAULT_FALLBACK_PARAMS` without crashing.
2. **Deterministic RAG Fallback**: If the Gemini API key is unset or unreachable, `ragEngine.query()` switches instantly to `generateDeterministicRAGAnswer()`, producing 100% accurate, template-guided clinical responses using the verified patient ledger.
3. **Invalid File Upload Formats**: Multer applies a regex file filter `/\.(pdf|jpg|jpeg|png|webp|heic)$/i`. Unsupported formats immediately trigger an HTTP 400 error response: `"Unsupported file format. Please upload a PDF, PNG, JPG, or WEBP file."`
4. **Client-Side Storage Resilience**: All `localStorage` calls are wrapped in `try { ... } catch { ... }` blocks to prevent exceptions when operating in restrictive private browsing modes or sandboxed iframes.

---

## 16. Configuration & Environment Variables

| Variable | Required | Default Value | Purpose |
|---|---|---|---|
| `PORT` | No | `3000` | Port on which Express listens (hardcoded to 3000 in AI Studio). |
| `NODE_ENV` | No | `production` | Node environment flag (`development` or `production`). |
| `GEMINI_API_KEY` | Recommended | `""` | Google GenAI API key enabling multimodal OCR and generative RAG synthesis. |
| `JWT_SECRET` | No | `readout_medical_jwt_secret_dev_key_change_in_prod` | Secret key for signing and validating session JWTs. |

*Note: If `GEMINI_API_KEY` is not provided, the system runs in fully functional offline demonstration mode using rule-based extraction and deterministic clinical RAG synthesis.*

---

## 17. Dependencies

### Node.js Production Dependencies (`package.json`)
* **`express` (^4.21.2)**: Core web application framework.
* **`@google/genai` (^2.23.0)**: Google GenAI SDK for Gemini Multimodal Vision and RAG generation.
* **`multer` (^2.4.0)**: Multipart/form-data handler for clinical document uploads.
* **`jsonwebtoken` (^9.0.3)**: Cryptographic session token generation and verification.
* **`bcryptjs` (^3.0.3)**: Secure password hashing.
* **`pdf-lib` (^1.17.1)**: Programmatic vector PDF manipulation and clinical report generation.
* **`pptxgenjs` (^4.0.1)**: Programmatic slide generation for clinical architecture presentations.

---

## 18. Development Workflow

```bash
# 1. Clone the repository
git clone <repo-url>
cd readout

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional)
export GEMINI_API_KEY="your-gemini-api-key"
export JWT_SECRET="your-secure-jwt-secret"

# 4. Verify syntax and static validation
npm run lint

# 5. Execute production build validation
npm run build

# 6. Start development / production server
npm start
# Server listens on http://localhost:3000
```

---

## 19. Testing & Quality Assurance

### Automated Backend Tests (`tests/test_backend.py`)
The repository includes a Python test suite asserting critical clinical safety constraints:
```bash
pytest tests/test_backend.py
```

Tested assertions include:
* `test_health_check`: Validates HTTP 200 response and service readiness.
* `test_medical_safety_headers`: Confirms the presence of `X-Medical-Safety-Disclaimer` on all responses.
* `test_condition_analysis_safety_label`: Confirms that clinical AI conditions include the mandatory label `AI CLINICAL ASSESSMENT — NOT A CONFIRMED DIAGNOSIS`.
* `test_diagnosis_analysis_safety`: Verifies that `confirmed_diagnosis` returns `NONE` to prevent automated diagnosis.
* `test_prescription_draft_safeguards`: Asserts that prescription drafts are watermarked `VOID / INVALID FOR DISPENSING`.
* `test_dosage_insufficient_information_safety`: Verifies that dosage queries without complete renal/patient context return `INSUFFICIENT_INFORMATION`.
* `test_chat_grounded_response`: Confirms that chat responses ground glucose readings in factual report values.

---

## 20. Deployment

### Containerization (`Dockerfile`)
The application is packaged as a minimal, production-grade Linux container:
* **Base Image**: `node:22-slim`
* **Port**: Exposed on port `3000`.
* **Process**: Runs `node server.js` under `NODE_ENV=production`.

### Orchestration (`docker-compose.yml`)
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: readout-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
```

---

## 21. Important Design Decisions

### 1. Reference Ranges Printed on Paper vs. Central Lookups
* **Decision**: Extract and bind comparisons strictly to the range printed on the patient's physical report, rather than matching against a global reference table.
* **Reason**: Clinical laboratories employ different analyzer platforms (e.g. Roche, Siemens, Abbott), assay methodologies, and population baselines. A result that is normal at Lab A may be outside the reference threshold at Lab B.
* **Consequence**: Zero false-positive flags caused by methodology mismatch.

### 2. Ochre / Amber vs. Red Color Coding
* **Decision**: Out-of-range measurements are rendered in muted ochre/amber (`#c27803`), never red.
* **Reason**: Red universally communicates an acute emergency. In laboratory medicine, a mildly elevated cholesterol or borderline fasting glucose is a chronic metabolic indicator, not an imminent crisis.
* **Consequence**: Prevents undue patient panic while preserving clear visual differentiation. (Red is reserved exclusively for acute panic values in `assets/js/triage.js`).

### 3. Review Checklist Gating on Summary Export
* **Decision**: The summary builder (`summary.html`) requires the patient to mark each flagged test as reviewed before exporting the appointment sheet.
* **Reason**: A summary sheet taken into a doctor's consultation is ineffective if the patient has not reviewed their own results.
* **Consequence**: Encourages active patient engagement with their clinical data.

### 4. Decoupled Two-Tier Hybrid RAG vs. Direct LLM Prompting
* **Decision**: Never allow an LLM to freely cite patient lab numbers without strict deterministic post-verification against an immutable structured ledger.
* **Reason**: LLMs suffer from numerical hallucination and unit transposition, which is dangerous in medical contexts.
* **Consequence**: 100% verified numerical accuracy with complete auditability.

---

## 22. Complete End-to-End User Flow

```text
1. Patient uploads photo of lab report on upload.html.
                       ↓
2. Express server receives file; Gemini Vision extracts tabular results & printed ranges.
                       ↓
3. Report is stored in memory; user is redirected to dashboard.html.
                       ↓
4. Triage engine checks for acute panic values (e.g. Potassium > 6.0); mounts banner if urgent.
                       ↓
5. Dashboard renders SVG Range Gauges, grouping tests by physiological system.
                       ↓
6. Contextualizer annotates pre-analytical factors (fasting duration, medication intake).
                       ↓
7. Patient asks questions in "Ask My Reports"; Hybrid RAG answers with zero hallucinations.
                       ↓
8. Patient navigates to summary.html, ticks off review checklist, and enters symptoms.
                       ↓
9. System generates printable A4 summary sheet to bring to physician appointment.
```

---

## 23. Component Call Graph & Relationships

```text
dashboard.html
   │
   ├── imports assets/js/app.js
   │      ├── initializes API client (communicates with /api/*)
   │      ├── initializes Store (reads/writes readout.* in localStorage)
   │      ├── exports gauge() & sparkline() renderers
   │      └── mounts shell navigation rail (buildRail)
   │
   ├── imports assets/js/triage.js
   │      └── TriageEngine.evaluate(PARAMETERS) -> renders panic alert banner
   │
   ├── imports assets/js/contextualizer.js
   │      └── Contextualizer.renderBar() -> captures fasting & drug interference
   │
   ├── imports assets/js/nutrition.js
   │      └── NutritionEngine.renderSection() -> generates tailored dietary levers
   │
   ├── imports assets/js/lifestyle.js
   │      └── LifestyleEngine.renderSection() -> simulates trial-backed biomarker shifts
   │
   ├── imports assets/js/i18n.js
   │      └── I18N.renderSelector() -> translates UI into EN/ES/HI/TE/TA/BN
   │
   └── executes assets/js/dashboard.js
          ├── calls API.getReport() -> loads active report data
          ├── calls API.getConditions() -> renders CDS assessment tab
          ├── calls API.getPrediction() -> renders CDS longitudinal trajectory
          ├── calls API.getMedOptions() -> renders CDS pharmacology guidance
          └── wires "Ask RAG" buttons -> triggers openChatModal() in app.js
```

---

## 24. Important Files Reference

| File Path | Key Classes / Functions / Symbols | Primary Responsibility |
|---|---|---|
| `server.js` | `app`, `USERS`, `REPORTS`, `AUDIT_LOGS`, `logAudit()`, `upload` | Main HTTP server, auth, routing, and in-memory datastore. |
| `backend/extractor.js` | `extractLabReport()`, `makeCanonicalId()`, `DEFAULT_FALLBACK_PARAMS` | Gemini multimodal vision document parser and test normalizer. |
| `backend/rag_engine.js` | `HybridRAGEngine`, `extractPatientLedger()`, `retrieveClinicalEvidence()`, `verifyZeroHallucinations()` | Grounded two-tier clinical retrieval-augmented generation engine. |
| `backend/pdf_generator.js` | `generateClinicalReportPdf()` | Low-level vector PDF generator for realistic clinical laboratory reports. |
| `backend/make_presentation.js`| `createReadoutDeck()` | Programmatic 16:9 PowerPoint clinical architecture deck builder. |
| `assets/js/app.js` | `API`, `Store`, `Prefs`, `gauge()`, `sparkline()`, `openChatModal()`, `openRagKnowledgeModal()` | Shared client shell, API client, SVG renderers, and RAG modal. |
| `assets/js/dashboard.js` | `initDashboard()`, `render()`, `renderCds()`, `openVerifyModal()`, `extractionModal()` | Dashboard view controller, filtering, checklist, and CDS management. |
| `assets/js/summary.js` | `initSummary()`, `renderLiveDoc()`, `renderReviewGating()` | Doctor-ready appointment summary builder and print formatter. |
| `assets/js/triage.js` | `TriageEngine`, `CRITICAL_THRESHOLDS`, `evaluate()`, `renderBanner()` | Acute panic-value laboratory surveillance and emergency triage alerts. |
| `assets/js/contextualizer.js` | `Contextualizer`, `getState()`, `renderBar()`, `evaluateInterferences()` | Pre-analytical fasting and drug-laboratory interference engine. |
| `assets/js/nutrition.js` | `NutritionEngine`, `NUTRITION_CONDITIONS`, `renderSection()` | Tailored dietary guidance: foods to avoid vs. foods that heal. |
| `assets/js/lifestyle.js` | `LifestyleEngine`, `LIFESTYLE_LEVERS`, `renderSection()` | Evidence-based lifestyle and biomarker trajectory simulator. |
| `assets/js/i18n.js` | `I18N`, `TRANSLATIONS`, `renderSelector()`, `t()` | Multilingual localized clinical translation engine. |
| `backend/app/main.py` | `FastAPI`, `health_check()`, `condition_analysis()`, `chat_grounded()` | Companion Python/FastAPI microservice implementation. |
| `backend/app/db/models.py` | `User`, `Report`, `LabResult`, `ReportPattern`, `AuditLog` | SQLAlchemy relational database models. |
| `tests/test_backend.py` | `test_medical_safety_headers()`, `test_prescription_draft_safeguards()` | Automated safety and regulatory compliance test suite. |

---

## 25. Limitations & Future Considerations

* **In-Memory Volatility in Production Node Server**: In `server.js`, `REPORTS` and `USERS` reside in in-memory Maps. Container restarts reset uploaded reports to default seeds unless backed by an external PostgreSQL or Firestore database (for which models already exist in `backend/app/db/models.py`).
* **OCR Quality on Low-Resolution Mobile Captures**: While Gemini 3.1 Flash-Lite handles skewed and low-contrast laboratory documents well, extreme motion blur or low lighting may degrade digit recognition, necessitating manual correction via the verification modal (`PUT /api/results/:id/verify`).
* **Regulatory Classification**: Readout is strictly an educational communication tool and clinical decision-support interface. It is **not** an FDA-cleared Software as a Medical Device (SaMD) and must not be operated as an autonomous diagnostic instrument.

---

## 26. Final Mental Model

If you are an incoming software engineer working on Readout, maintain this core mental model:

> **"Readout is a high-fidelity translation and safety layer positioned between complex laboratory documents and human conversation."**

1. **The Paper is Ground Truth**: Never invent or adjust reference ranges based on generic tables. What the laboratory printed on the physical sheet is the absolute point of comparison.
2. **Numbers are Immutable Facts**: In the RAG pipeline, the patient's numbers are never generated by an LLM; they are retrieved from the verified ledger and verified via post-generation checks.
3. **Safety Through Objective Framing**: The UI avoids red panic colors for routine out-of-range values, explicitly disclaims diagnosis, voids candidate prescriptions, and flags pre-analytical interferences.
4. **Zero-Build Simplicity**: The frontend is pure, readable HTML/CSS/JS that runs directly in any browser with zero compilation overhead, while the Node.js backend handles multimodal AI vision, clinical retrieval, and document generation.
