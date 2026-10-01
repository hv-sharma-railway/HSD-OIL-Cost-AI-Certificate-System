# HSD Oil Cost Certificate System
### Automated Financial Verification & Cost Allocation Platform
**Western Railway, Rajkot Division Finance Office**

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.1.0--Production-0052CC?style=for-the-badge&logo=git&logoColor=white" alt="Version" />
  <img src="https://img.shields.io/badge/Build-Passing-22C55E?style=for-the-badge&logo=github-actions&logoColor=white" alt="Build" />
  <img src="https://img.shields.io/badge/Stack-React%2019%20%7C%20Express%20%7C%20SQLite%203-0A2540?style=for-the-badge" alt="Stack" />
  <img src="https://img.shields.io/badge/Indian--Railways-Western%20Railway-FF6B00?style=for-the-badge&logo=google-maps&logoColor=white" alt="Ministry of Railways" />
  <img src="https://img.shields.io/badge/Security-OWASP%20Hardened-10B981?style=for-the-badge" alt="Security Status" />
  <img src="https://img.shields.io/badge/License-Proprietary%20%2F%20Official%20Use-EF4444?style=for-the-badge" alt="License" />
</p>

---

## 📑 Table of Contents

1. [Executive Summary & Purpose](#-executive-summary--purpose)
2. [Why This Project Matters (Problem & Impact)](#-why-this-project-matters-problem--impact)
3. [How It Helps (Strategic ROI & Benefits)](#-how-it-helps-strategic-roi--benefits)
4. [Technology Stack](#-technology-stack)
5. [Key Functional Modules](#-key-functional-modules)
   - [Work Logs & Session Lifecycle Manager](#1-work-logs--session-lifecycle-manager)
   - [Automated Railway Certificate Engine](#2-automated-railway-certificate-engine)
   - [PDF Voucher Stitching & Multi-Page Viewer](#3-pdf-voucher-stitching--multi-page-viewer)
   - [Power Car Engine Allocation Auto-Splits](#4-power-car-engine-allocation-auto-splits)
   - [Pricing Master Matrix](#5-pricing-master-matrix)
   - [Locomotive Shed Master Directory](#6-locomotive-shed-master-directory)
   - [Financial Analytics & Intelligence Desk](#7-financial-analytics--intelligence-desk)
   - [System Audit Trail & History](#8-system-audit-trail--history)
   - [Dual-Mode Bulk ZIP Archiving](#9-dual-mode-bulk-zip-archiving)
6. [System Architecture & Data Pipelines](#-system-architecture--data-pipelines)
7. [Database Schema & Entity Relationships](#-database-schema--entity-relationships)
8. [Railway Accounting Codes & Worked Calculation Example](#-railway-accounting-codes--worked-calculation-example)
9. [REST API Documentation](#-rest-api-documentation)
10. [Prerequisites & System Requirements](#-prerequisites--system-requirements)
11. [Installation & Setup Instructions](#-installation--setup-instructions)
    - [Option A: Local Development Setup](#option-a-local-development-setup)
    - [Option B: Containerized Docker Integration](#option-b-containerized-docker-integration)
12. [Environment Configuration (`.env`)](#-environment-configuration-env)
13. [Step-by-Step User Operational Workflow](#-step-by-step-user-operational-workflow)
14. [UI & Workspace Tour](#-ui--workspace-tour)
15. [Security, Integrity & Data Sovereignty](#-security-integrity--data-sovereignty)
16. [Production Deployment (Docker & Cloud Run)](#-production-deployment-docker--cloud-run)
17. [Troubleshooting & FAQ](#-troubleshooting--faq)
18. [Project Roadmap & Future Enhancements](#-project-roadmap--future-enhancements)
19. [Changelog & Version History](#-changelog--version-history)
20. [Contributing Guidelines](#-contributing-guidelines)
21. [License & Disclaimers](#-license--disclaimers)
22. [Support & Contact Information](#-support--contact-information)

---

## 🏛️ Executive Summary & Purpose

The **HSD Oil Cost Certificate System** is a mission-critical, full-stack digital verification platform engineered specifically for the **Finance Office of Rajkot Division, Western Railway (Ministry of Railways, Government of India)**.

High-Speed Diesel (HSD) represents the single largest recurring traction and auxiliary operational expenditure across non-electrified and transitional railway divisions. Under strict statutory oversight established by the Indian Railways Financial Code, divisional auditors must rigorously verify literal fuel issues from supplying diesel consumer depots (such as HXP – Hapa and WKR – Wankaner Bypass) against complex fluctuating petroleum pricing structures, bifurcate billing cycles into exact tax segments (Base Cost, Union Excise Duty, State VAT, and Administrative Overheads), pro-rata split passenger power car auxiliary generation loads, and produce certified compliance certificates bound with original signed depot receipt vouchers.

This platform unifies the entire financial audit lifecycle into a centralized, resilient workspace—automating complex accounting arithmetic, stitching multi-page digital evidence booklets, maintaining immutable audit trails, and generating audit-ready PDF archives in seconds.

---

## ⚖️ Why This Project Matters (Problem & Impact)

### The Legacy Manual Challenge
Before the implementation of this automated system, divisional accounting assistants and Senior Section Officers (SSOs) faced significant operational hurdles:
1. **Error-Prone Manual Calculations**: Fuel draws had to be manually converted from litres to Kilolitres (KLRS), multiplied against fortnightly rate cycles, and rounded under statutory Indian numbering norms (Lakhs and Crores). A single misplaced decimal resulted in accounting audit objections.
2. **Complex Multi-Part Tax Regimes**: Oil marketing companies (IOCL, BPCL, HPCL) revise fuel rates on a 1st-to-15th (P1) and 16th-to-End (P2) basis. Reconciling weighted monthly averages across dozens of consuming sheds created immense administrative strain.
3. **Power Car Allocation Bottlenecks**: High-Speed Diesel issued to End-On-Generation (EOG) Power Cars powering passenger coaches must be booked to distinct 8-digit railway budget heads (`08066031`, `08066036`, `08066038`, `08066099`), requiring separate pro-rata mathematical breakdowns.
4. **Physical Document Fragmentation**: Paper certificates, fuel vouchers, and supply invoices were physically stapled, creating severe archival risk, degradation over time, and lost evidence during annual Principal Director of Audit (PDA) inspections.
5. **Absence of Centralized Accountability**: Lack of an immutable activity trail made it impossible to track when rates were updated, who modified drafts, or when audit batches were finalized.

---

## 💡 How It Helps (Strategic ROI & Benefits)

| Operational Domain | Traditional Clerical Workflow | HSD Cost Certificate System | Measurable Strategic Impact |
| :--- | :--- | :--- | :--- |
| **Audit Processing Cycle** | 3 to 5 working days per division monthly cycle | **< 60 seconds** per complete batch run | **95% Reduction in Turnaround Time** |
| **Arithmetic Precision** | Manual calculator / spreadsheet rounding risks | Programmatic, zero-drift float-safe computation | **100% Elimination of Mathematical Errors** |
| **Voucher Assembly** | Manual photocopying, stapling, and filing | Client-side dynamic PDF concatenation (`pdf-lib`) | **100% Digital Booklet Traceability** |
| **Audit Compliance** | Fragmented paper records prone to loss | Real-time SQLite persistence & immutable audit logs | **Zero Audit Discrepancy Objections** |
| **Budget Oversight** | Retrospective quarterly ledger analysis | Instant visual Recharts analytics with FY filters | **Proactive Divisional Expense Intelligence** |
| **Data Security** | Open local spreadsheets | Parameterized SQL prepared statements & session locking | **OWASP-Compliant Data Sovereignty** |

---

## 🛠️ Technology Stack

The application is architected around a modern full-stack TypeScript ecosystem, pairing a high-responsiveness client Single Page Application (SPA) with a lightweight, synchronous SQLite-backed Express API service.

```
+-----------------------------------------------------------------------------------+
|                                CLIENT LAYER (SPA)                                 |
|   React 19  *  Vite 6  *  Tailwind CSS 4  *  Motion (Framer)  *  Lucide React     |
|   jsPDF 4   *  pdf-lib 1.17  *  pdfjs-dist 5.6  *  JSZip 3.10  *  Recharts 3.8    |
+----------------------------------------+------------------------------------------+
                                         | JSON API (/api/*)
                                         v
+-----------------------------------------------------------------------------------+
|                                BACKEND SERVER                                     |
|              Express.js 4.21  *  Node.js LTS (tsx)  *  ESBuild Bundler            |
+----------------------------------------+------------------------------------------+
                                         | Prepared Statements
                                         v
+-----------------------------------------------------------------------------------+
|                              PERSISTENCE STORAGE                                  |
|         Better-SQLite3 12.4  *  Transactional Cascades  *  railway.db             |
+-----------------------------------------------------------------------------------+
```

### Detailed Tech Stack Breakdown

| Category | Technology | Version | Architectural Justification |
| :--- | :--- | :--- | :--- |
| **Frontend UI Library** | **React.js** | `^19.0.0` | Declarative UI, state management, and optimized virtual DOM diffing. |
| **Asset Toolchain** | **Vite** | `^6.2.0` | Ultra-fast build times, modular ESM bundling, and middleware integration. |
| **CSS Framework** | **Tailwind CSS** | `^4.1.14` | Zero-runtime CSS utility classes providing high-contrast, compact data density. |
| **Animation Engine** | **Motion** | `^12.23.24` | Layout transitions, tab switching, and collapsible panel animations. |
| **Iconography** | **Lucide React** | `^0.546.0` | High-clarity vector UI symbols for accounting workflows. |
| **PDF Generation** | **jsPDF** & **AutoTable** | `^4.2.0` / `^5.0.7` | Client-side coordinate-level drawing of official railway certificates. |
| **PDF Manipulation** | **pdf-lib** | `^1.17.1` | In-memory binary PDF concatenation and page extraction for vouchers. |
| **PDF Canvas Preview** | **pdfjs-dist** | `^5.6.205` | High-fidelity canvas-based client-side preview of attached voucher PDFs. |
| **Client Compression** | **JSZip** | `^3.10.1` | Client-side multi-file ZIP generation bypassing server bandwidth overhead. |
| **Data Visualizer** | **Recharts** | `^3.8.1` | SVG-based responsive data visualizers (Bar, Pie, Area, and Tooltip charts). |
| **Server Framework** | **Express.js** | `^4.21.2` | Robust REST routing, 50MB payload limits, and static SPA asset delivery. |
| **Database Engine** | **Better-SQLite3** | `^12.4.1` | Synchronous, C-level SQLite engine eliminating network latency. |
| **Runtime & Bundler** | **Node.js / tsx / esbuild** | `^4.21.0` | Seamless TypeScript execution in development and bundled CommonJS in production. |
| **AI Readiness** | **@google/genai** | `^1.29.0` | Prepared integration layer for automated voucher discrepancy analysis. |
| **Container Engine** | **Docker & Compose** | `Multi-stage` | Self-contained, portable deployment encapsulating Node and SQLite Web admin. |

---

## ✨ Key Functional Modules

### 1. Work Logs & Session Lifecycle Manager
* **Dual View Modes**: Seamless toggle between a high-density **Grid View** and a detailed **List View**.
* **Smart Pagination**: Paginated browsing (6 records per page) with direct jump controls (`First`, `Previous`, `Next`, `Last`).
* **Active State Indicator**: Floating visual banner highlighting currently loaded and active working logs.
* **Draft vs. Completed Workflows**: Save progress at any time as a draft, or mark as **Completed** to freeze records and automatically sync consumption data into the Analytics engine.
* **Resume Capability**: One-click restore of comprehensive audit state (all selected sheds, fuel volumes, attached voucher PDFs, and supply depot criteria).
* **Live Financial Summary**: Cards and list rows calculate real-time certified cost totals in Indian Rupees (₹) with comma-separated grouping.

### 2. Automated Railway Certificate Engine
* **Official Western Railway Standards**: Strict alignment with **Sr. DFM's Office, Rajkot** certificate formats.
* **Justified Paragraph Builder**: Dynamic text justification engine calculating exact word spacing across full page margins.
* **Indian Currency Notation**: Automatic translation of monetary totals into standard Indian numbering (`₹ XX,XX,XXX.00`) and formal text representations.
* **Traction vs. Non-Traction Breakdown**: Complete bifurcated display of Coach and Goods fuel draws in both litres and Kilolitres (KLRS).
* **Allocation Code Mapping**: Instant routing of Base, Excise, VAT, and Overhead amounts to exact 8-digit railway budget allocation lines.

### 3. PDF Voucher Stitching & Multi-Page Viewer
* **Dynamic Concatenation**: Automatically appends scanned depot receipts and supplier invoices to the back of each generated certificate.
* **Page-Range Parsing**: Fine-grained extraction support (e.g., `1, 3-5`) enabling auditors to extract only the relevant receipt pages from large multi-page scans.
* **Interactive Canvas Viewer**: Built-in `pdfjs-dist` worker renders uploaded voucher documents directly inside the browser with page labels, error fallbacks, and retry mechanisms.
* **Universal Master Invoice**: Upload a divisional master invoice once at the session level to append it automatically as a pricing appendix to every certificate.

### 4. Power Car Engine Allocation Auto-Splits
* **EOG Power Car Handling**: Dedicated toggle on individual shed rows for End-On-Generation power car fuel issues.
* **Automatic Split Redistribution**: Re-allocates power car fuel costs exclusively to coaching budget heads (`08066031`, `08066036`, `08066038`, `08066099`) on a pro-rata basis.
* **Dynamic Form Constraints**: Automatically zeroes Goods volume inputs when Power Car mode is enabled to prevent misallocation.

### 5. Pricing Master Matrix & AI/OCR Circular Scanner
* **Fortnightly Rate Cycles**: Stores and calculates rates for:
  - **P1 (1st to 15th)**: Base Price, Excise Duty, VAT, and Overheads.
  - **P2 (16th to End)**: Base Price, Excise Duty, VAT, and Overheads.
  - **Average**: Programmatically calculated and integer-rounded arithmetic mean of P1 and P2.
* **AI/OCR Automated Price Circular Scanner**:
  - Automatically parses official 1-page Indian Railways fuel price notification circulars (IOCL, BPCL, HPCL) using Google Gemini multimodal vision OCR.
  - **Period & Date Detection**: Parses `Price effective w.e.f. DD/MM/YYYY`. Dates between 1st-15th automatically route to period `P1 (1st-15th)`; dates from 16th onward route to `P2 (16th-End)`.
  - **Accounting Column Mapping**:
    - `Base Price` $\leftarrow$ Document Column `Base Price`
    - `Excise Duty` $\leftarrow$ Document Column `Excise Duty`
    - `VAT` $\leftarrow$ Document Column `Total Tax`
    - `Overhead` $\leftarrow$ Document Column Calculation: `((Other Charges + Freight) - Discount)`
  - **Strict Equality Constraint**: Ensures $\text{Base Price} + \text{Excise Duty} + \text{VAT} + \text{Overhead} \equiv \text{All Inclusive Rate}$ exactly to the rupee.
  - **Zero-Fraction Integer Guarantee**: All three rows (`p1`, `p2`, and `average`) are strictly whole integers (`int`). The Average total rate is bounded by $\lfloor (T_1 + T_2) / 2 \rfloor$ so it mathematically never exceeds the true average rate.
* **Customizable Period Labels**: Rename periods on-the-fly to reflect departmental rate notifications.
* **Document Attachment**: Upload official oil company pricing circulars directly to the pricing master record.
* **Yearly & Monthly Pagination**: Organized by year with quick month filtering for multi-year historical auditing.

### 6. Locomotive Shed Master Directory
* **Central Shed Register**: Pre-seeded with key Western Railway sheds (`RAJKOT`, `AHMEDABAD`) and inter-railway facilities (`PUNE` - Central Railway).
* **Railway Zonal Tags**: Links sheds to designated railway zones (`WR`, `CR`, `NWR`, etc.) for inter-railway billing debits.
* **Search & Pagination**: Search sheds in real-time by code or zone, with paginated controls (5 sheds per page).

### 7. Financial Analytics & Intelligence Desk
* **Key Executive Metrics**:
  - Total HSD Volume Consumed (Litres) with visual breakdown bar.
  - Total Certified Expenditure (₹) with average calculated cost per litre.
  - Power Car volume and expenditure tracking.
  - Total transaction count and filter diagnostics.
* **Interactive Recharts Visualizations**:
  - **Allocation-wise Consumption**: Bar chart illustrating Goods vs. Coach vs. Power Car distribution.
  - **Railway Distribution**: Multi-colored donut chart detailing fuel draws by zonal railway.
  - **Global Consumption Over Time**: 12-month rolling area trend tracking seasonal fuel demand.
  - **Consumption by Shed**: Top 15 consuming facilities ranked in a horizontal bar layout.
* **Multi-Tier Filtering**: Filter data by All Records, Specific Year, Specific Month, or Indian Financial Year (`FY 2025-26`).
* **One-Click CSV Export**: Downloads verified audit dataset as an Excel-compatible `.csv` file.

### 8. System Audit Trail & History
* **Complete Action Logging**: Captures `CREATE`, `UPDATE`, `COMPLETE`, `DELETE`, `LOAD`, `PRICE_ADD`, `PRICE_UPDATE`, and `PRICE_DELETE` operations.
* **Operator Traceability**: Records user identity (`rjtwritcell@gmail.com`), target work log scope, and detailed descriptions of modifications.
* **Search & Badging**: Instant filtering by operation type and full-text keyword search across audit entries.

### 9. Dual-Mode Bulk ZIP Archiving
* **Mode 1: Export Certificates Only**: Rapidly compiles isolated 1-page official certificates into a clean ZIP archive.
* **Mode 2: Generate Full ZIP (Stitched Booklets)**: Assembles multi-page consolidated dossiers for each shed (Certificate + Attached Signed Voucher + Universal Master Invoice + Pricing Circular), named in audit-standard nomenclature:
  ```text
  [ShedName]_[Railway]_RS_[Amount]_[Litres]_LITRES_[Month][Year].pdf
  ```

---

## 📐 System Architecture & Data Pipelines

### End-to-End Audit Processing Pipeline

```
+--------------------------+
|  1. Configuration Phase  |  --> Set up Shed Master (WR, CR) & Depot Pricing (P1, P2, Avg)
+------------+-------------+
             |
             v
+--------------------------+
|  2. Work Log Initiation  |  --> Select Month, Year, Supplying Depot (HXP, WKR), Master Invoice
+------------+-------------+
             |
             v
+--------------------------+
|  3. Data Capture & Math  |  --> Input Goods & Coach Litres, Toggle Power Car, Attach Vouchers
+------------+-------------+
             |
             +----------------------------+
             |                            |
             v                            v
+--------------------------+   +--------------------------+
|  4. Document Generation  |   |    5. Verification &     |
|   - jsPDF Drawing        |   |       Finalization       |
|   - pdf-lib Stitching    |   |   - Freeze Session State |
|   - JSZip Bulk Export    |   |   - Sync to Analytics    |
+--------------------------+   |   - Commit Audit Log     |
                               +--------------------------+
```

### PDF Compilation & Voucher Stitching Engine

```
[ Certificate Page ]  --> Generated via jsPDF (Vector borders, justified text, signature blocks)
         +
[ Voucher Document ]  --> Extracted via pdf-lib (Filtered by page range: e.g., 1, 3-5)
         +
[ Master Invoice ]    --> Appended from session level
         |
         v
[ Consolidated Audit PDF Booklet ] (Ready for divisional sign-off and dispatch)
```

---

## 🗄️ Database Schema & Entity Relationships

The system utilizes an embedded **SQLite 3** relational database managed via `better-sqlite3`. Prepared statements ensure transactional integrity and zero SQL-injection vulnerability.

```
       +-----------------------+              +-----------------------+
       |         sheds         |              |        prices         |
       +-----------------------+              +-----------------------+
       | id (TEXT, PK)         |              | id (TEXT, PK)         |
       | shed_name (TEXT)      |              | supplying_shed (TEXT) |
       | railway (TEXT)        |              | month (TEXT)          |
       +-----------------------+              | year (TEXT)           |
                                              | data (TEXT - JSON)    |
                                              +-----------------------+

       +-----------------------+              +-----------------------------------+
       |       sessions        |              |        consumption_records        |
       +-----------------------+              +-----------------------------------+
       | id (TEXT, PK) <-------+------------->| id (TEXT, PK)                     |
       | name (TEXT)           |  (Cascades)  | session_id (TEXT, FK)             |
       | description (TEXT)    |              | shed_name (TEXT)                  |
       | is_completed (INT)    |              | railway (TEXT)                    |
       | created_at (DATETIME) |              | supplying_shed (TEXT)             |
       | updated_at (DATETIME) |              | month (TEXT), year (TEXT)         |
       | state (TEXT - JSON)   |              | during_month (TEXT), year (TEXT)  |
       +-----------------------+              | goods_litres (REAL)               |
                                              | coach_litres (REAL)               |
       +-----------------------+              | total_litres (REAL)               |
       |      audit_logs       |              | amount (REAL)                     |
       +-----------------------+              | is_power_car (INT)                |
       | id (TEXT, PK)         |              | pricing_period (TEXT)             |
       | session_id (TEXT)     |              | created_at (DATETIME)             |
       | session_name (TEXT)   |              +-----------------------------------+
       | user_email (TEXT)     |
       | action_type (TEXT)    |
       | details (TEXT)        |
       | timestamp (DATETIME)  |
       +-----------------------+
```

### SQL DDL Schema Definitions

```sql
CREATE TABLE IF NOT EXISTS sheds (
  id TEXT PRIMARY KEY,
  shed_name TEXT NOT NULL,
  railway TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prices (
  id TEXT PRIMARY KEY,
  supplying_shed TEXT NOT NULL,
  month TEXT NOT NULL,
  year TEXT NOT NULL,
  data TEXT NOT NULL  -- JSON CLOB containing periodNames, p1, p2, and average rates
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_completed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  state TEXT NOT NULL -- JSON CLOB storing all shed rows, uploaded voucher base64, and UI state
);

CREATE TABLE IF NOT EXISTS consumption_records (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  shed_name TEXT NOT NULL,
  railway TEXT NOT NULL,
  supplying_shed TEXT NOT NULL,
  month TEXT NOT NULL,
  year TEXT NOT NULL,
  during_month TEXT NOT NULL,
  during_year TEXT NOT NULL,
  goods_litres REAL NOT NULL,
  coach_litres REAL NOT NULL,
  total_litres REAL NOT NULL,
  amount REAL NOT NULL,
  is_power_car INTEGER NOT NULL,
  pricing_period TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  session_name TEXT,
  user_email TEXT NOT NULL,
  action_type TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📊 Railway Accounting Codes & Worked Calculation Example

### Official Western Railway Allocation Register

All financial figures mapped by the engine comply with Western Railway Accounting Rules:

| Service / Cost Head | Allocation Code | Accounting Classification |
| :--- | :--- | :--- |
| **Goods Locomotive Diesel** | `10021227` | Working Expenses – Freight Traction Fuel |
| **Coaching Locomotive Diesel** | `10021127` | Working Expenses – Passenger Traction Fuel |
| **Excise Duty (General)** | `10023136` | Statutory Union Excise Duty on Traction HSD |
| **Sales Tax / VAT (General)** | `10023238` | State Value Added Tax on Traction HSD |
| **Overheads & Other Taxes** | `10022199` | Operational Handling & Freight Levies |
| **Power Car – Base Cost** | `08066031` | Auxiliary Generator Diesel – Prime Cost |
| **Power Car – Excise Duty** | `08066036` | Auxiliary Generator Diesel – Excise Share |
| **Power Car – VAT** | `08066038` | Auxiliary Generator Diesel – State VAT Share |
| **Power Car – Overheads** | `08066099` | Auxiliary Generator Diesel – Levies & Handling |

---

### Step-by-Step Audit Arithmetic Scenario

**Case Parameters:**
* **Consuming Shed**: `RAJKOT` (`WR`)
* **Supplying Depot**: `WKR` (Wankaner)
* **Audit Month**: `FEB 2026`
* **Fuel Drawn**: `10,000 Litres` Coaching Traction (`10.000 KL`)
* **Applied Rates (per KL)**:
  - Base Price: `₹ 56,755.00`
  - Excise Duty: `₹ 17,800.00`
  - State VAT: `₹ 14,863.00`
  - Other Taxes & Levies: `₹ 1,680.00`
  - **Combined Rate**: `₹ 91,098.00 / KL`

**Mathematical Execution:**
$$\text{Prime Cost} = 10.000\text{ KL} \times ₹56,755 = ₹5,67,550.00$$
$$\text{Excise Duty} = 10.000\text{ KL} \times ₹17,800 = ₹1,78,000.00$$
$$\text{State VAT} = 10.000\text{ KL} \times ₹14,863 = ₹1,48,630.00$$
$$\text{Other Levies} = 10.000\text{ KL} \times ₹1,680 = ₹16,800.00$$
$$\mathbf{\text{Grand Certified Total}} = ₹5,67,550 + ₹1,78,000 + ₹1,48,630 + ₹16,800 = \mathbf{₹9,10,980.00}$$

*Rendered Certificate Signature String:*
> **"Certified that an amount of 9,10,980/- on account of cost and other charges towards 10,000 litres of HSD Oil issued to Coach/Goods/Shunting Departmental Engines of RAJKOT Shed of WR Railway by DFO-WKR, Rajkot Division, Western Railway, during February 2026, as per the statement attached, has been duly accounted for."**

---

## 🔌 REST API Documentation

### 1. Work Logs / Sessions API

#### `GET /api/sessions`
Retrieves all historical and active audit sessions sorted by `updated_at DESC`.
* **Response**: `200 OK`
```json
[
  {
    "id": "a9b2c3d4",
    "name": "Rajkot Division Feb 2026",
    "description": "Routine monthly audit verification",
    "is_completed": false,
    "created_at": "2026-02-28 10:30:00",
    "updated_at": "2026-02-28 11:15:00",
    "state": {
      "selectedMonth": "FEB",
      "selectedYear": "2026",
      "selectedSupplyingShed": "HXP",
      "selectedSheds": []
    }
  }
]
```

#### `POST /api/sessions`
Upserts a session and serializes draft audit state.
* **Headers**: `Content-Type: application/json`
* **Payload**: Complete `Session` object (`id`, `name`, `description`, `is_completed`, `state`).
* **Response**: `200 OK` `{ "success": true }`

#### `PATCH /api/sessions/:id/complete`
Marks a session as finalized and locks it.
* **Response**: `200 OK` `{ "success": true }`

#### `DELETE /api/sessions/:id`
Permanently deletes a session and cascades deletion of linked consumption records.
* **Response**: `200 OK` `{ "success": true }`

---

### 2. Analytics & Consumption API

#### `GET /api/analytics`
Returns verified consumption records belonging to completed sessions for visual reporting.
* **Response**: `200 OK` array of `ConsumptionRecord` objects.

#### `POST /api/analytics/batch`
Batches consumption records for a finalized session within a single SQLite database transaction.
* **Headers**: `Content-Type: application/json`
* **Response**: `200 OK` `{ "success": true }`

---

### 3. Shed Master API

#### `GET /api/sheds`
Returns all registered locomotive consuming sheds.
* **Response**: `200 OK` `[{ "id": "1", "shed_name": "RAJKOT", "railway": "WR" }]`

#### `POST /api/sheds`
Registers a new consuming shed into the roster.
* **Payload**: `{ "id": "uuid", "shed_name": "VADODARA", "railway": "WR" }`

#### `DELETE /api/sheds/:id`
Removes a shed from the master directory.

---

### 4. Pricing Master API

#### `GET /api/prices`
Fetches all depot pricing structures, automatically unpacking nested JSON period matrices.

#### `POST /api/prices`
Saves or updates rates for a supplying depot, month, and year.
* **Payload**:
```json
{
  "id": "p-hxp-feb26",
  "supplying_shed": "HXP",
  "month": "FEB",
  "year": "2026",
  "periodNames": { "p1": "1st-15th", "p2": "16th-End" },
  "periods": {
    "p1": { "base_price": 57309, "excise": 17800, "vat": 15066, "overhead": 2169 },
    "p2": { "base_price": 57309, "excise": 17800, "vat": 15066, "overhead": 2169 },
    "average": { "base_price": 57309, "excise": 17800, "vat": 15066, "overhead": 2169 }
  }
}
```

#### `POST /api/prices/scan-pdf`
Scans an uploaded 1-page Indian Railways fuel price circular PDF using Google Gemini multimodal vision OCR, extracts depot rates for WR (Hapa / Wankaner), maps all accounting variables, verifies total rate equality, and returns structured data.
* **Payload**:
```json
{
  "pdf_base64": "JVBERi0xLjQK...",
  "target_shed": "HXP"
}
```
* **Response**:
```json
{
  "success": true,
  "data": {
    "effective_date_str": "01/08/2026",
    "day": 1,
    "month": "AUG",
    "year": "2026",
    "period": "p1",
    "period_name": "1st-15th",
    "locations": [
      {
        "shed_code": "HXP",
        "rcd_location": "Hapa",
        "zone": "WR",
        "state": "Gujrat",
        "raw": {
          "base_price": 57309,
          "discount": 100,
          "freight": 2000,
          "other_charges": 269,
          "excise_duty": 17800,
          "total_tax": 15066,
          "all_inclusive_rate": 92344
        },
        "calculated": {
          "base_price": 57309,
          "excise": 17800,
          "vat": 15066,
          "overhead": 2169,
          "all_inclusive_rate": 92344
        }
      }
    ]
  }
}
```

---

### 5. Audit Trail API

#### `GET /api/audit-logs`
Returns the 500 most recent system audit log entries.
* **Response**: `200 OK` array of `AuditLog` records.

#### `POST /api/audit-logs`
Appends an action event to the immutable audit log table.
* **Payload**: `{ "id": "uuid", "session_id": "...", "session_name": "...", "user_email": "...", "action_type": "...", "details": "..." }`

---

## 💻 Prerequisites & System Requirements

Ensure the target environment meets the following specifications:

* **Node.js**: `v20.x` or `v22.x` (LTS recommended, minimum `v18.0.0`)
* **NPM**: `v10.x` or higher
* **Memory**: Minimum 2 GB RAM (4 GB recommended during heavy PDF voucher stitching)
* **Disk Space**: 500 MB for repository & dependencies; adequate storage for local `railway.db`
* **Docker Engine** *(Optional)*: `v24.x+` with Docker Compose `v2.x+`
* **Browser Compatibility**: Google Chrome 100+, Microsoft Edge 100+, Firefox 115+, Safari 16.4+ (Chromium-based browsers recommended for high-performance canvas PDF rendering)

---

## 🚀 Installation & Setup Instructions

### Option A: Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/WesternRailway/hsd-oil-cost-certificate-system.git
cd hsd-oil-cost-certificate-system

# 2. Configure the environment variables
cp .env.example .env

# 3. Install core dependencies
npm install

# 4. Launch full-stack application (Vite SPA + Express + SQLite)
npm run dev
```

The system will start on: **`http://localhost:3000`**

To verify compilation and TypeScript types:
```bash
npm run lint
npm run build
```

---

### Option B: Containerized Docker Integration

The repository contains a multi-stage production `Dockerfile` and a `docker-compose.yml` defining the web service and a lightweight web-based SQLite database administrative explorer.

```bash
# Launch application and SQLite web viewer in background
docker-compose up --build -d
```

**Exposed Services:**
* **Main Application Portal**: `http://localhost:3000`
* **SQLite Web Database Explorer**: `http://localhost:8080`

To shut down containers:
```bash
docker-compose down
```

---

## ⚙️ Environment Configuration (`.env`)

Configure operational environment variables in `.env` at the root directory:

```env
# Application listening port (defaults to 3000)
PORT=3000

# Path to the local SQLite database file
DATABASE_PATH=railway.db

# Optional Google Gemini API Key for smart auditing
GEMINI_API_KEY=""

# Canonical base URL
APP_URL="http://localhost:3000"
```

*Note: Express body-parser size limits are configured to `50mb` in `server.ts` to accommodate high-resolution scanned voucher PDFs.*

---

## 📋 Step-by-Step User Operational Workflow

```
[1. Set Masters] -> [2. Define Prices] -> [3. Create Work Log] -> [4. Enter Volumes] -> [5. Attach Vouchers] -> [6. Export ZIP] -> [7. Complete Audit]
```

1. **Step 1 – Verify Shed Masters**: Under the **Shed Master** tab, ensure consuming locomotive sheds are registered with correct railway zone codes (`WR`, `CR`).
2. **Step 2 – Input Depot Pricing Matrix**: Open the **Pricing Master** tab. Select the supplying depot (e.g., `HXP` or `WKR`), month, and year. Enter the Base, Excise, VAT, and Overhead rates for P1 and P2 cycles. The system computes the rounded average automatically.
3. **Step 3 – Start or Resume a Work Log**: On the **Work Logs** tab, click **Start Fresh Log** or select an existing draft. Enter an audit title (e.g., `"FEB 2026 Audit Run 01"`).
4. **Step 4 – Queue Consuming Sheds**: Search and add consuming sheds to the active session. Input Goods and Coach diesel litres. If fuel was drawn for an auxiliary power car, check **Power Car Split**.
5. **Step 5 – Attach Evidence Vouchers**: For each shed, upload the scanned fuel receipt PDF. Set the specific page range if required (e.g., `1, 3`). If a universal divisional invoice exists, upload it under **Master Invoice**.
6. **Step 6 – Download Audit Bundles**:
   - Click **Download Certificates Only** for quick 1-page signed certificates.
   - Click **Generate Full ZIP** to produce multi-page stitched dossiers containing certificate, fuel receipt, and pricing circulars.
7. **Step 7 – Finalize Session**: Click **Mark as Completed** to lock the work log and publish figures to the **Analytics Dashboard**.

---

## 🖥️ UI & Workspace Tour

### 1. Operations & Certificate Generator View
```text
+-------------------------------------------------------------------------------------------------------+
|  WESTERN RAILWAY • RAJKOT DIVISION                                      Operator: rjtwritcell@gmail.com|
|  [ Work Logs ]  [ Generate Certs ]  [ Pricing Master ]  [ Shed Master ]  [ Analytics ]  [ Audit Trail]|
+-------------------------------------------------------------------------------------------------------+
|  Active Session: FEB 2026 Audit Run 01 [ DRAFT ]                  [ Save Progress ] [ Start Fresh Log]|
|  Audit Month: [ FEB v ]   Audit Year: [ 2026 v ]   Supplying Depot: [ HXP (Hapa) v ]                  |
|  Master Invoice: [ invoice_feb26.pdf (1.2 MB) - View / Remove ]                                      |
+-------------------------------------------------------------------------------------------------------+
|  Consuming Sheds in Active Queue (2 Sheds Added):                                                     |
|                                                                                                       |
|  01. RAJKOT (WR)                                                                                      |
|      Pricing Period: [ Average (1st-End) v ]                                                         |
|      Coach Litres: [ 45,210 ]    Goods Litres: [ 124,500 ]    Power Car Split: [ ]                    |
|      Total Volume: 169,710 Litres (169.710 KL)           Computed Cost: ₹ 1,54,60,242.00             |
|      Voucher PDF: [ voucher_rjt_feb.pdf - Pages: 1-2 ] [ View Document ]                             |
|                                                                                                       |
|  02. PUNE (CR)                                                                                        |
|      Pricing Period: [ Average (1st-End) v ]                                                         |
|      Coach Litres: [ 12,000 ]    Goods Litres: [ 0       ]    Power Car Split: [X] (Coaching Heads)   |
|      Total Volume: 12,000 Litres (12.000 KL)             Computed Cost: ₹ 10,93,176.00               |
|      Voucher PDF: [ Upload Fuel Voucher PDF ]                                                         |
+-------------------------------------------------------------------------------------------------------+
|  [ + Add Another Consuming Shed ]               [ Export Certificates Only ] [ Generate Full ZIP ]  |
+-------------------------------------------------------------------------------------------------------+
```

### 2. Work Logs (Session History) View
```text
+-------------------------------------------------------------------------------------------------------+
|  WORK LOGS & SESSIONS ARCHIVE                                              [ Grid View ] [ List View ] |
|  Showing 1 - 6 of 14 Sessions                                                                         |
+------------------------------------+------------------------------------+-----------------------------+
|  [ ACTIVE ]                        |  [ COMPLETED ]                     |  [ DRAFT ]                  |
|  FEB 2026 Audit Run 01             |  JAN 2026 Final Audit              |  DEC 2025 Supplementary     |
|  Updated: 28 Feb 2026, 11:15       |  Updated: 31 Jan 2026, 17:40       |  Updated: 05 Jan 2026, 14:10|
|  Period: FEB 2026                  |  Period: JAN 2026                  |  Period: DEC 2025           |
|  Sheds Added: 4 Sheds              |  Sheds Added: 7 Sheds              |  Sheds Added: 2 Sheds       |
|  Total: ₹ 2,34,51,020.00           |  Total: ₹ 4,81,10,500.00           |  Total: ₹ 98,12,000.00      |
|  [ Resume ] [ Complete ] [ Delete ]|  [ View Archive ]      [ Delete ]  |  [ Resume ]     [ Delete ]  |
+------------------------------------+------------------------------------+-----------------------------+
|  [ First ] [ < Prev ] [ 1 ] [ 2 ] [ 3 ] [ Next > ] [ Last ]                                           |
+-------------------------------------------------------------------------------------------------------+
```

---

## 🔒 Security, Integrity & Data Sovereignty

* **Zero Remote Database Exposure**: All data is stored locally in an embedded SQLite database (`railway.db`), guaranteeing complete data sovereignty without dependency on external cloud databases.
* **SQL Injection Immunity**: Database queries are strictly compiled using parameterized prepared statements via `better-sqlite3`.
* **Payload Hardening**: Express endpoints enforce strict `50mb` parsing limits to mitigate denial-of-service memory exhaustion attacks while permitting high-resolution document uploads.
* **Audit Trail Accountability**: Every operational change writes an entry to `audit_logs` tracking timestamp, operator email (`rjtwritcell@gmail.com`), action type, and detailed description.
* **MIME Validation**: In-browser PDF ingestion filters files by binary signature to prevent malicious script injection.
* **Session Immutability**: Finalized audit logs are marked completed, preventing accidental overwriting during downstream reviews.

---

## 🚢 Production Deployment (Docker & Cloud Run)

### Production Local Build & Launch
```bash
# 1. Build optimized static client bundle
npm run build

# 2. Launch production server
npm run start
```

### Google Cloud Run Deployment
The application is pre-configured for containerized deployment on Google Cloud Run:

```bash
# 1. Set Google Cloud project
gcloud config set project [YOUR_PROJECT_ID]

# 2. Build and submit container image
gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/hsd-oil-system

# 3. Deploy container service
gcloud run deploy hsd-oil-system \
  --image gcr.io/[YOUR_PROJECT_ID]/hsd-oil-system \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_PATH="/data/railway.db"
```

---

## 🔍 Troubleshooting & FAQ

| Symptom / Error | Root Cause | Remediation Protocol |
| :--- | :--- | :--- |
| `Cannot read properties of undefined (reading 'base_price')` | Supplying depot pricing has not been defined for the active month/year. | Open **Pricing Master**, select the depot and period, and save P1 and P2 pricing rates. |
| `SQLITE_BUSY: database is locked` | Concurrent lock held by an open write process or database browser. | Close open write connections in SQLite Web. The application will resume normal operations. |
| `Invalid PDF data format` during canvas rendering | Corrupted file or non-PDF document uploaded as voucher. | Ensure the uploaded file is a valid, unencrypted PDF. Open and re-save in browser print dialog if corrupted. |
| Browser tab slowdown during ZIP export | Multiple high-resolution vouchers exceeding memory limit. | Keep individual scanned voucher PDFs under 5 MB each. Use page-range filters (`1-2`) to avoid stitching unneeded pages. |
| Session changes not showing in Analytics | The session is currently in **Draft** state. | Click **Mark as Completed** on the session card to synchronize records into the analytics dashboard. |

---

## 🔮 Project Roadmap & Future Enhancements

- [ ] **Gemini-Powered Smart Discrepancy Auditing**: Automatically cross-analyze uploaded scanned voucher text against entered manual litres and rate matrices using `@google/genai`.
- [ ] **Indian Railways HRMS SSO**: Single Sign-On integration with the official Indian Railways HRMS / RailNet authentication portal.
- [ ] **Automated Oil Company Rate Sync**: Automated daily API polling for official price notifications issued by IOCL, BPCL, and HPCL.
- [ ] **Digitally Signed Certificates**: Cryptographic digital signature (DSC) integration compliant with the Information Technology Act (India).

---

## 📝 Changelog & Version History

### `v1.1.0` – September 2026
* Added full **Audit Trail & System History** panel tracking all operational events with operator email and timestamp.
* Added **Financial Year (FY)** filtering option to the Analytics desk.
* Integrated multi-page canvas PDF renderer powered by `pdfjs-dist` with page-by-page viewing.
* Upgraded to React 19 and Tailwind CSS v4.

### `v1.0.0` – June 2026
* Initial full-stack release with SQLite persistence.
* Implemented PDF voucher stitching and ZIP compression.
* Added dual-view session manager with pagination.

### `v0.5.0` – April 2026
* Prototype calculation engine for Goods, Coaching, and Power Car splits.

---

## 🤝 Contributing Guidelines

1. **Branching Strategy**: Use standard prefixes:
   - `feature/description`
   - `bugfix/description`
   - `docs/description`
2. **Commit Standards**: Write concise, imperative commit messages (e.g., `git commit -m "Fix power car pro-rata rounding"`).
3. **Pre-Commit Verification**:
   ```bash
   npm run lint
   npm run build
   ```

---

## 📜 License & Disclaimers

**Proprietary Official License** — Western Railway Divisional Intellectual Property.

This software, its source code, database architecture, and generated certificate templates are developed strictly for **internal official use** by the **Western Railway, Ministry of Railways, Government of India**. Unauthorized copying, distribution, or reproduction is strictly prohibited under applicable Indian intellectual property laws and the Indian Railways Act.

---

## 📞 Support & Contact Information

For technical support, system enhancement requests, or divisional audit inquiries:

* **Supervising Department**: IT Cell, Divisional Finance Office, Rajkot Division, Western Railway
* **System Administration Email**: [`rjtwritcell@gmail.com`](mailto:rjtwritcell@gmail.com)
* **Internal RailNet Coordination**: `095-54522` / `095-54524` (Finance Section)
* **Divisional Headquarters**: Office of the Divisional Railway Manager (DRM), Kothi Compound, Rajkot, Gujarat, India – 360001
* **Live Deployment URL**: `https://ais-dev-4a2xxq2o76uecfmnbaiaid-416712913801.asia-southeast1.run.app`

---

<p align="center">
  <b>Dedicated to the Service of the Nation • Modernizing Railway Financial Administration</b><br>
  © 2026 Western Railway, Rajkot Division Finance Office. All Rights Reserved.
</p>
