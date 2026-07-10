# GrowEasy — AI-Powered CSV Importer

An intelligent full-stack application that uses **Google Gemini AI** to automatically map and extract CRM lead data from **any CSV format** into the GrowEasy CRM schema — regardless of column names, delimiters, or structure.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Express-5-brightgreen?logo=express)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5_Flash_Lite-4285F4?logo=google)](https://ai.google.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docs.docker.com/compose)

---

## The Challenge This Solves

Different teams export leads in wildly different formats:

| Source | Column names they use |
|---|---|
| Facebook Lead Ads | `full_name`, `phone_number`, `created_time` |
| Google Ads | `First Name`, `Last Name`, `Email Address`, `Phone` |
| Excel spreadsheets | `Name`, `Mobile`, `City`, `Lead Status` |
| Real Estate CRMs | `client_name`, `contact_no`, `property_interest`, `possession` |
| Marketing agencies | `LEAD_ID`, `CUSTOMER`, `CELL`, `DISPOSITION` |
| Manual spreadsheets | Anything at all |

This application accepts all of them and maps every row to a **single, consistent GrowEasy CRM format** — automatically, using AI.

---

## Features

- **Universal CSV Ingestion** — Auto-detects delimiters (`,` `\t` `;` `|`), strips BOM markers, handles quoted fields and jagged rows
- **AI Field Mapping** — Gemini AI analyzes both column names and data values to map arbitrary columns to CRM fields
- **4-Step Wizard** — Upload → Preview → AI Processing → Results, with a clear step indicator
- **CSV Preview** — Responsive virtualized table (handles 1,000+ rows efficiently) with sticky headers
- **Batch Processing** — Records are sent to Gemini in batches of 10 with 3× exponential-backoff retry
- **Structured JSON Output** — AI forced into `responseMimeType: "application/json"` mode — no free-text parsing
- **Post-AI Validation** — Every field sanitized and validated after AI extraction (email lowercased, phone digits-only, dates normalized, status values enum-checked)
- **Results Dashboard** — Stats cards (total / imported / skipped / success rate), tabbed imported/skipped views
- **CSV Download** — Export the mapped CRM data as a ready-to-import CSV file
- **Error Handling** — Global error boundary, per-batch retry fallback, user-facing error banners
- **Dark Mode** — System-aware theme toggle with smooth transitions
- **Docker Ready** — One-command containerized deployment

---

## Project Structure

```
GrowEasy/
├── backend/                        # Express 5 + TypeScript API
│   └── src/
│       ├── index.ts                # Server entry — CORS, JSON, routes
│       ├── routes/
│       │   └── csv.routes.ts       # POST /upload  &  POST /process
│       ├── services/
│       │   ├── csv.service.ts      # CSV parsing, delimiter detection, BOM handling
│       │   └── ai.service.ts       # Gemini AI batching, retry, aggregation
│       ├── middleware/
│       │   └── errorHandler.ts     # AppError class, global error handler, asyncHandler
│       ├── types/
│       │   └── index.ts            # CRMRecord, SkippedRecord, ProcessingResult types
│       └── utils/
│           ├── prompt.ts           # System prompt + batch prompt builder
│           └── validators.ts       # Post-AI field sanitization & validation
│
├── frontend/                       # Next.js 16 + React 19 + Tailwind CSS v4
│   ├── app/
│   │   ├── globals.css             # Design system tokens (CSS vars), animations
│   │   ├── layout.tsx              # Root layout — font, meta, ThemeProvider
│   │   └── page.tsx                # 4-step wizard orchestrator
│   ├── components/
│   │   ├── FileUpload.tsx          # Drag-and-drop zone with validation
│   │   ├── DataTable.tsx           # Virtualized scrollable table
│   │   ├── StepIndicator.tsx       # Animated step progress bar
│   │   ├── ProcessingOverlay.tsx   # Full-screen AI processing modal
│   │   ├── ResultsView.tsx         # Stats cards, tabs, download button
│   │   ├── ThemeProvider.tsx       # React context for light/dark mode
│   │   └── ThemeToggle.tsx         # Sun/moon toggle button
│   └── lib/
│       ├── api.ts                  # uploadCSV(), processRecords(), checkHealth()
│       └── types.ts                # Shared TypeScript interfaces (mirrors backend)
│
├── docker-compose.yml              # Backend (3001) + Frontend (3000)
├── .env.example                    # Environment variable template
└── package.json                    # Root: concurrently dev/build scripts
```

---

## Setup & Installation

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 18 or 20 (LTS) | [nodejs.org/download](https://nodejs.org/en/download) |
| npm | 9+ | Bundled with Node.js |
| Gemini API Key | — | Free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| Docker (optional) | 24+ | Only needed for containerized deployment |

---

### Option A — Local Development (Recommended)

#### Step 1 — Clone the repository

```bash
git clone <repository-url>
cd GrowEasy
```

#### Step 2 — Install all dependencies

```bash
# Install root dev tools (concurrently)
npm install

# Install backend and frontend dependencies
npm run install:all
```

#### Step 3 — Configure environment variables

```bash
# Copy the template
cp .env.example backend/.env
```

Open `backend/.env` and set your key:

```env
# Required
GEMINI_API_KEY=AIza...your_key_here

# Optional (these defaults work for local dev)
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

> **Get a free Gemini API key** at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).  
> The project uses **Gemini 2.5 Flash Lite** — well within the free tier limits for development.

#### Step 4 — Start both servers

```bash
# Starts backend on :3001 and frontend on :3000 simultaneously
npm run dev
```

Or run them in separate terminals:

```bash
# Terminal 1 — Backend (Express + tsx watch)
npm run dev:backend

# Terminal 2 — Frontend (Next.js dev server)
npm run dev:frontend
```

#### Step 5 — Open the app

```
http://localhost:3000
```

---

### Option B — Docker Compose

#### Step 1 — Configure environment

```bash
cp .env.example backend/.env
# Edit backend/.env and set GEMINI_API_KEY=your_key_here
```

#### Step 2 — Build and run

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |

To stop:

```bash
docker compose down
```

---

## How to Use

1. **Upload** — Drag and drop any CSV file (up to 10 MB), or click to browse. Supported formats: Facebook Leads, Google Ads, Excel, CRM exports, manually created sheets — any CSV works.

2. **Preview** — Inspect your raw data in the scrollable table. The original column names are shown exactly as-is. Click **Confirm & Import with AI** when ready.

3. **AI Processing** — Gemini AI reads every row, analyzes the column names and data values, and maps each field to the GrowEasy CRM schema. Records are processed in batches of 10.

4. **Results** — View the import summary:
   - **Imported** tab — all successfully mapped CRM records
   - **Skipped** tab — records that were dropped (e.g., no email or phone found), with reasons
   - **Download CRM CSV** — export the clean, mapped data as a CSV ready to import into GrowEasy

---

## API Reference

Base URL: `http://localhost:3001`

### `GET /api/health`

Confirms the API is running.

```bash
curl http://localhost:3001/api/health
```

```json
{
  "success": true,
  "message": "GrowEasy CSV Importer API is running",
  "timestamp": "2026-07-10T14:00:00.000Z"
}
```

---

### `POST /api/csv/upload`

Uploads a CSV file and returns parsed headers and rows for preview. **No AI processing at this stage.**

```bash
curl -X POST http://localhost:3001/api/csv/upload \
  -F "file=@./leads.csv"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "headers": ["Full Name", "Email", "Phone", "City", "Lead Status"],
    "rows": [
      { "Full Name": "Jane Doe", "Email": "jane@example.com", "Phone": "+919876543210", "City": "Bangalore", "Lead Status": "Interested" }
    ],
    "total_rows": 1
  },
  "message": "Successfully parsed 1 rows with 5 columns"
}
```

**Limits:** 10 MB max. Accepted MIME types: `text/csv`, `text/plain`, `application/csv`, `application/vnd.ms-excel`, `text/x-csv`, `text/comma-separated-values`.

---

### `POST /api/csv/process`

Sends parsed records through Gemini AI for CRM field extraction. Returns structured CRM records.

```bash
curl -X POST http://localhost:3001/api/csv/process \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {
        "Full Name": "Jane Doe",
        "Email": "jane@example.com",
        "Phone": "+919876543210",
        "City": "Bangalore",
        "Lead Status": "Interested"
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "successful": [
      {
        "created_at": "",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "country_code": "+91",
        "mobile_without_country_code": "9876543210",
        "company": "",
        "city": "Bangalore",
        "state": "",
        "country": "",
        "lead_owner": "",
        "crm_status": "GOOD_LEAD_FOLLOW_UP",
        "crm_note": "",
        "data_source": "",
        "possession_time": "",
        "description": ""
      }
    ],
    "skipped": [],
    "stats": {
      "total_records": 1,
      "successfully_parsed": 1,
      "skipped": 0,
      "batches_processed": 1,
      "processing_time_ms": 1842
    }
  },
  "message": "Processed 1 records: 1 successful, 0 skipped"
}
```

---

## CRM Schema

Every imported record is mapped to this fixed 15-field schema:

| Field | Type | Description |
|---|---|---|
| `created_at` | `string` | Lead creation date — `YYYY-MM-DD HH:mm:ss` format |
| `name` | `string` | Full name — combines `first_name`+`last_name` if split |
| `email` | `string` | Primary email, lowercased. Extra emails overflow to `crm_note` |
| `country_code` | `string` | Phone country code, e.g. `+91`, `+1`. Extracted from embedded numbers |
| `mobile_without_country_code` | `string` | Digits only, no country code prefix |
| `company` | `string` | Company or organization name |
| `city` | `string` | City |
| `state` | `string` | State or province |
| `country` | `string` | Country |
| `lead_owner` | `string` | Assigned salesperson or agent |
| `crm_status` | `enum` | `GOOD_LEAD_FOLLOW_UP` · `DID_NOT_CONNECT` · `BAD_LEAD` · `SALE_DONE` |
| `crm_note` | `string` | Notes, overflow emails/phones, any data that doesn't fit elsewhere |
| `data_source` | `enum` | `leads_on_demand` · `meridian_tower` · `eden_park` · `varah_swamy` · `sarjapur_plots` |
| `possession_time` | `string` | Property possession or delivery timeline |
| `description` | `string` | Additional description or property requirements |

**Skip rule:** Records with neither `email` nor `mobile_without_country_code` are placed in `skipped[]` with the reason `"No email or mobile number found"`.

---

## AI Architecture

### How field mapping works

The pipeline has four distinct stages:

```
CSV file
  │
  ▼
[csv.service.ts] — Strip BOM, auto-detect delimiter (,  ;  |  tab),
                   parse with relax_quotes + relax_column_count,
                   preserve original column names exactly
  │
  ▼
[Gemini 2.5 Flash Lite] — System prompt teaches the model the CRM schema
                           with mapping hints for every field.
                           responseMimeType: "application/json" (forced JSON mode)
                           temperature: 0.1 (near-deterministic extraction)
                           Processes records in batches of 10
  │
  ▼
[validators.ts] — Post-AI sanitization:
                  email → lowercase
                  phone → digits only
                  country_code → +XX format
                  created_at → parsed and re-formatted
                  crm_status → enum-checked, cleared if invalid
                  data_source → enum-checked, cleared if invalid
  │
  ▼
{ successful: CRMRecord[], skipped: SkippedRecord[], stats: ProcessingStats }
```

### Prompt engineering decisions

- **Dual analysis** — The AI is instructed to look at both the column name AND the data value when deciding a mapping. A column called `col_7` containing email-formatted strings is still mapped to `email`.
- **Mapping hints** — Every target field lists the common column name variations it may come from (e.g., `name` ← `full_name`, `contact_name`, `first_name`+`last_name`, `customer`, `lead_name`).
- **Overflow to `crm_note`** — Multiple emails or phones in one row: the first goes to the right field; the rest are appended to `crm_note` with a prefix label.
- **Status normalization** — Natural-language statuses (`"interested"`, `"callback requested"`, `"no answer"`) are mapped to the 4 allowed enum values. Unknown statuses default to `GOOD_LEAD_FOLLOW_UP`.
- **Strict data source matching** — `data_source` only accepts exact matches to the 5 allowed values; anything else is left empty.
- **Low temperature (0.1)** — Reduces hallucination and ensures consistent results across batches of the same dataset.

### Retry logic

Each batch of 10 records is retried up to 3 times with exponential backoff (1s → 2s → 4s) if Gemini returns an error. If all retries fail, every record in that batch is added to `skipped[]` with the error reason — no silent data loss.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend framework** | Next.js | 16 |
| **UI library** | React | 19 |
| **Language** | TypeScript | 5 |
| **Styling** | Tailwind CSS | 4 |
| **Backend framework** | Express | 5 |
| **Runtime** | Node.js | 18+ |
| **AI model** | Google Gemini 2.5 Flash Lite | — |
| **AI SDK** | `@google/generative-ai` | 0.24 |
| **CSV parser** | `csv-parse` | 5.6 |
| **File upload** | `multer` | 1.4 |
| **Dev runner** | `tsx` | 4.19 |
| **Containerization** | Docker + Compose | 24+ |

---

## Environment Variables

### `backend/.env`

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | — | Your Google AI Studio API key |
| `PORT` | No | `3001` | Port the Express server listens on |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `FRONTEND_URL` | No | `http://localhost:3000` | Allowed CORS origin |

### Frontend (Next.js)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:3001/api` | Backend API base URL used by the browser |

---

## Common Issues

**`GEMINI_API_KEY environment variable is not set`**  
→ Make sure `backend/.env` exists and contains a valid key. It is not enough to have the key in `.env.example`.

**`Failed to upload file` / CORS error in browser**  
→ Confirm the backend is running on port 3001 (`npm run dev:backend`) and `FRONTEND_URL` in `backend/.env` matches the frontend origin (default: `http://localhost:3000`).

**`Only CSV files are allowed`**  
→ The file must have a `.csv` extension or a CSV-compatible MIME type. Rename Excel `.xlsx` files to `.csv` after exporting from Excel (File → Save As → CSV UTF-8).

**AI returns empty or wrong mappings**  
→ This is usually a prompt issue with very unusual column names. Check the `crm_note` field of the result — the AI may have placed data there. Extremely sparse rows (single column, no recognizable data) may be skipped.

**Build fails with TypeScript errors**  
→ Make sure you are running Node.js 18 or 20. Run `npm run install:all` from the root to ensure all dependencies are installed before building.

---

## Scripts Reference

Run from the **project root** (`GrowEasy/`):

| Command | Description |
|---|---|
| `npm install` | Install root dev tools |
| `npm run install:all` | Install backend + frontend dependencies |
| `npm run dev` | Start both servers concurrently |
| `npm run dev:backend` | Start only the backend (port 3001) |
| `npm run dev:frontend` | Start only the frontend (port 3000) |
| `npm run build` | Build backend (tsc) + frontend (next build) |

Run from **`backend/`**:

| Command | Description |
|---|---|
| `npm run dev` | Start with `tsx watch` (hot-reload) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled `dist/index.js` |
| `npm test` | Run Vitest tests |

Run from **`frontend/`**:

| Command | Description |
|---|---|
| `npm run dev` | Next.js dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

---

## License

MIT
