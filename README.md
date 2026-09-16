# ⚖️ Nyaya — AI-Powered Legal Assistance Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Node](https://img.shields.io/badge/Node.js-24-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791.svg)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-0.31-C5F74F.svg)](https://orm.drizzle.team/)
[![Express](https://img.shields.io/badge/Express-5.0-000000.svg)](https://expressjs.com/)

An integrated, enterprise-grade legal assistance platform designed for the Indian legal ecosystem. **Nyaya** streamlines legal consultations, statutory research, case management, and administrative governance across three dedicated, interconnected portals: **Client Portal**, **Lawyer Portal**, and **Admin Portal**.

---

## 📑 Table of Contents

- [Overview & Key Portals](#-overview--key-portals)
- [System Architecture & Pipelines](#-system-architecture--pipelines)
- [Monorepo Project Tree](#-monorepo-project-tree)
- [Database Schema](#-database-schema-postgresql--drizzle-orm)
- [Technology Stack](#-technology-stack)
- [Security & Authentication](#-security--authentication)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Demo Credentials](#-demo-credentials-for-evaluation)
- [Git Repository Tracking](#-git-repository-tracking)

---

## 🏛️ Overview & Key Portals

Nyaya provides a unified platform connecting citizens with verified advocates, governed by platform administrators:

### 1. 👤 Client Portal
- **Legal Intelligence Desk:** AI-guided initial case structuring, statute lookup, and landmark judgment citations (Consumer Protection Act, IT Act, Transfer of Property Act, etc.).
- **Advocate Discovery:** Search and filter verified advocates by specialization, jurisdiction, experience, and fee structure.
- **Matter Management:** Track active cases through lifecycle stages (Created $\rightarrow$ Lawyer Review $\rightarrow$ Notice $\rightarrow$ Hearing $\rightarrow$ Resolved).
- **Document Vault:** Securely upload and organize case evidence, sale deeds, and identity proofs.
- **Consultation Scheduler:** Book video or in-person consultations with integrated Google Meet links.

### 2. 👨‍⚖️ Lawyer Portal
- **Case Request Desk:** Review client briefs, analyze conflict of interest, accept or decline matters, or request additional documents.
- **Case Workspace:** Track active court matters with stage progression, chronological activity history, case timeline, and private advocate work notes.
- **Client Communication:** Case-scoped, real-time message exchange between advocate and client.
- **Calendar & Availability:** Configure weekly working days, office hours, and consultation time slots.
- **Financial Desk:** View consultation earnings, transaction history, receipts, and disbursement metrics.
- **Profile & Credential Management:** Manage bar registration details, court admissions, and verification status.

### 3. 🛡️ Admin Portal (Governance Desk)
- **Executive Command Dashboard:** Real-time KPI analytics for registered citizens, advocate network, case throughput, and compliance.
- **Advocate Verification Queue:** Authenticate Bar Council registration numbers, state enrollment certificates, and approve/reject credentials.
- **User Governance:** Inspect account statuses, apply policy suspensions, or restore accounts with audit trails.
- **Cross-Platform Audit Trail:** Comprehensive event logging tracking every administrative action, status change, and security event.
- **Platform Configuration:** Emergency maintenance toggles, upload size restrictions, and specialization taxonomy management.

---

## 🔄 System Architecture & Pipelines

The platform connects all three portals through a unified PostgreSQL backend and event-driven notification pipeline:

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT PORTAL                                    |
|   Creates Case  -->  Discovers Lawyer  -->  Books Consultation  -->  Uploads Docs |
+-----------------------------------------------------------------------------------+
                                         │
                         Real-Time Event │ Pipeline
                                         ▼
+-----------------------------------------------------------------------------------+
|                                  LAWYER PORTAL                                    |
|   Receives Case Request  -->  Conflict Check  -->  Accepts Case  -->  Updates Stage|
+-----------------------------------------------------------------------------------+
                                         ▲
                         Admin Oversight │ Audit & Verification
                                         ▼
+-----------------------------------------------------------------------------------+
|                                   ADMIN PORTAL                                    |
|   Verifies Advocate Credentials  -->  Supervises Platform  -->  Monitors Audits   |
+-----------------------------------------------------------------------------------+
```

---

## 📁 Monorepo Project Tree

```text
Legal-AI-Assistant/
├── artifacts/
│   ├── api-server/                       # Express.js REST API Server
│   │   ├── src/
│   │   │   ├── app.ts                    # Express application configuration & middleware
│   │   │   ├── index.ts                  # Server entrypoint & port initialization
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts               # JWT signing, verification, scrypt password hashing
│   │   │   │   ├── logger.ts             # Pino logging infrastructure
│   │   │   │   ├── mailer.ts             # Nodemailer Gmail SMTP dispatch service
│   │   │   │   ├── notifications.ts      # Automated cross-portal notification pipeline
│   │   │   │   └── otp.ts                # OTP generation, storage, and validation service
│   │   │   ├── middlewares/
│   │   │   │   └── auth.ts               # Bearer JWT verification & session validation
│   │   │   └── routes/
│   │   │       ├── admin.ts              # Admin portal governance API endpoints
│   │   │       ├── auth.ts               # Two-step login, signup, and OTP verification routes
│   │   │       ├── health.ts             # Healthcheck endpoint
│   │   │       ├── index.ts              # Master API route aggregator
│   │   │       ├── lawyer.ts             # Lawyer portal case management & appointment endpoints
│   │   │       └── legal.ts              # Client legal library, cases, and AI assistant routes
│   │   ├── .env.example                  # Environment configuration template
│   │   ├── build.mjs                     # esbuild production bundler script
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── legal-assistance/                 # React + Vite Single-Page Application
│       ├── src/
│       │   ├── App.tsx                   # Role-based shell router & two-step OTP auth screen
│       │   ├── main.tsx                  # React DOM mount point
│       │   ├── index.css                 # Platform design system styling
│       │   ├── admin/                    # Admin Portal Subsystem
│       │   │   ├── AdminRouteGuard.tsx   # Role guard for administrator access
│       │   │   ├── AdminShell.tsx        # Administrator layout shell & route switch
│       │   │   ├── admin.css             # Specialized administrative UI styles
│       │   │   ├── types.ts              # Admin TypeScript domain types
│       │   │   ├── mockData.ts           # Clean showcase data fallback
│       │   │   ├── components/           # KPI cards, data tables, modals, badges, topbar
│       │   │   ├── context/
│       │   │   │   └── AdminContext.tsx  # Centralized admin state & database hydration
│       │   │   ├── pages/                # Dashboard, Lawyers, Users, Audit, Reports, Settings
│       │   │   └── services/             # Admin domain operational services
│       │   ├── lawyer/                   # Lawyer Portal Subsystem
│       │   │   ├── LawyerShell.tsx       # Lawyer sidebar navigation & tab state router
│       │   │   ├── lawyer.css            # Specialized advocate workspace styles
│       │   │   ├── types.ts              # Lawyer domain model interfaces
│       │   │   ├── mockData.ts           # Clean showcase advocate dataset
│       │   │   ├── context/
│       │   │   │   └── LawyerContext.tsx # Centralized lawyer state & database synchronization
│       │   │   └── pages/                # MyCases, CaseDetail, Requests, Appointments, Calendar, Payments
│       │   ├── components/               # Shared UI atoms (Buttons, Cards, Dialogs, Modals)
│       │   └── lib/                      # UI utility helpers
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts                # Vite config with API proxy to port 3000
│       └── tsconfig.json
│
├── lib/
│   ├── db/                               # Database Layer (Drizzle ORM)
│   │   ├── src/
│   │   │   ├── index.ts                  # Database client pool connection & schema export
│   │   │   └── schema/                   # Relational Database Schema Definitions
│   │   │       ├── appointments.ts       # Consultation bookings & Google Meet links
│   │   │       ├── audit_logs.ts         # Security & administrative event audit logs
│   │   │       ├── availability_slots.ts # Advocate weekly working hours
│   │   │       ├── case_documents.ts     # Case-attached files & evidence records
│   │   │       ├── case_messages.ts      # Secure client-advocate chat messages
│   │   │       ├── case_notes.ts         # Confidential advocate matter notes
│   │   │       ├── case_requests.ts      # Client representation request queue
│   │   │       ├── cases.ts              # Master legal cases table
│   │   │       ├── lawyer_profiles.ts    # Advocate credentials, bar numbers, practice areas
│   │   │       ├── notifications.ts      # Cross-portal notification store
│   │   │       ├── otp_codes.ts          # One-Time Password tokens & expiry tracking
│   │   │       ├── payments.ts           # Fee ledger & payment transaction records
│   │   │       ├── user_profiles.ts      # Extended user profiles & identity details
│   │   │       ├── users.ts              # Core accounts, roles, & password hashes
│   │   │       └── index.ts              # Schema aggregator
│   │   ├── drizzle.config.ts             # Drizzle Kit migration configuration
│   │   ├── init_db.cjs                   # Automated PostgreSQL database initialization
│   │   ├── seed.cjs                      # Showcase environment database seeder
│   │   └── package.json
│   │
│   ├── api-spec/                         # OpenAPI 3.0 Contract Definitions
│   ├── api-zod/                          # Auto-generated Zod request/response validation schemas
│   └── api-client-react/                 # Auto-generated TanStack React Query API hooks
│
├── attached_assets/                      # Project Design Specs & UML Diagrams
├── .gitignore                            # Git exclusion rules (credentials, caches, node_modules)
├── pnpm-lock.yaml                        # Strict dependency lockfile
├── pnpm-workspace.yaml                   # Monorepo package workspace configuration
└── README.md                             # Project Documentation
```

---

## 🗄️ Database Schema (PostgreSQL + Drizzle ORM)

The relational schema is configured in PostgreSQL under database `nyaya_db` with 13 synchronized tables:

| Table | Purpose | Primary Keys / Foreign Keys |
|---|---|---|
| `users` | Primary credentials, email, password hash, role (`admin`, `lawyer`, `client`) | `id` PK |
| `user_profiles` | Contact info, identity verification status | `userId` $\rightarrow$ `users.id` |
| `lawyer_profiles` | Bar registration, practice areas, court admissions, verification status | `userId` $\rightarrow$ `users.id` |
| `cases` | Unified matter records, progress tracking, category, opposite party | `clientId`, `lawyerId` $\rightarrow$ `users.id` |
| `case_requests` | Consultation representation requests from clients to advocates | `caseId` $\rightarrow$ `cases.id`, `clientId`, `lawyerId` |
| `case_documents` | Case files, evidence, and legal notices | `caseId` $\rightarrow$ `cases.id`, `uploadedByUserId` |
| `case_notes` | Confidential advocate matter notes | `caseId` $\rightarrow$ `cases.id`, `lawyerUserId` |
| `case_messages` | Scoped communication thread for each case | `caseId` $\rightarrow$ `cases.id`, `senderUserId` |
| `appointments` | Scheduled video consultations and office meetings | `caseId`, `clientId`, `lawyerId` |
| `payments` | Fee disbursements and receipts | `caseId`, `appointmentId`, `clientId`, `lawyerId` |
| `notifications` | Cross-portal notification alerts | `userId`, `senderUserId` |
| `availability_slots` | Advocate weekly consultation slots | `lawyerUserId` $\rightarrow$ `users.id` |
| `audit_logs` | Platform-wide administrative activity trail | `actorUserId` $\rightarrow$ `users.id` |
| `otp_codes` | Secure 6-digit authentication codes with 10-minute expiry | `userId` $\rightarrow$ `users.id` |

---

## 💻 Technology Stack

- **Frontend:** React 19, TypeScript 5.9, Vite 7, Lucide Icons, Wouter Router, TanStack Query
- **Backend:** Node.js 24, Express 5, Drizzle ORM, Zod, Pino Logger, Multer
- **Database:** PostgreSQL 17 (Relational Database)
- **Authentication:** JWT (JSON Web Tokens), `node:crypto` scrypt password hashing, Nodemailer Gmail SMTP OTP service
- **Build Tooling:** pnpm monorepo workspaces, esbuild

---

## 🔒 Security & Authentication

- **Two-Step Authentication Flow:**
  1. Standard email + password validation against scrypt-hashed credentials.
  2. Automated 6-digit security code generation with 10-minute expiration.
  3. Direct dispatch to the user's Gmail inbox via TLS-secured SMTP.
  4. Code verification against the PostgreSQL database before issuing signed JWT tokens.
- **Role-Based Access Control (RBAC):** Strict middleware guards restricting routes by role (`admin`, `lawyer`, `client`).
- **Credential Protection:** Secrets, database connection strings, and email passwords are stored in `.env` and strictly excluded from version control via `.gitignore`.

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- Node.js 20+ (Node.js 24 recommended)
- pnpm package manager (`npm install -g pnpm`)
- PostgreSQL 16+ running locally on port `5432`

### 1. Clone the Repository
```bash
git clone https://github.com/Bharath-kumar-7/Legal-AI-Assistant.git
cd Legal-AI-Assistant
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment Variables
Create `.env` in `artifacts/api-server/.env`:
```ini
PORT=3000
NODE_ENV=development
SESSION_SECRET=nyaya-dev-secret-key-local-only
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/nyaya_db
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-google-app-password
NYAYA_ADMIN_EMAIL=admin@nyaya.in
NYAYA_ADMIN_PASSWORD=Bharath@2006
```

### 4. Initialize Database & Push Schema
```bash
# Create database
node lib/db/init_db.cjs

# Apply Drizzle ORM migrations
cd lib/db
pnpm push
cd ../..

# Seed showcase accounts & initial demo data
node lib/db/seed.cjs
```

### 5. Start Application Servers
In two separate terminals:

```bash
# Terminal 1: Start Backend API (port 3000)
cd artifacts/api-server
node --enable-source-maps ./dist/index.mjs
```

```bash
# Terminal 2: Start Frontend Dev Server (port 5173)
cd artifacts/legal-assistance
npm run dev
```

The application will be accessible at:
- **Web Application:** `http://localhost:5173`
- **Backend API:** `http://localhost:3000/api`

---

## 🔑 Demo Credentials for Evaluation

The database is pre-seeded with dedicated showcase accounts to demonstrate all platform functionalities:

| Role | Email | Password | Access Highlights |
|---|---|---|---|
| 🛡️ **Administrator** | `admin@nyaya.in` | `Bharath@2006` | Governance dashboard, pending advocate approvals, audit trail |
| 👨‍⚖️ **Verified Advocate** | `rohan.iyer@iyerassociates.in` | `Bharath@2006` | Active case (Boundary dispute), client requests, calendar, payments |
| 👤 **Client** | `rahul.sharma@email.com` | `Bharath@2006` | Client desk, active case with Adv. Rohan Iyer, video appointment |

*Note: For local development testing, entering `123456` in the verification code box serves as an instant master bypass code.*

---

## 📦 Git Repository Tracking

All project subsystems, database schemas, frontend portals, and API route controllers are version-controlled and synchronized:

- **Official Repository:** [https://github.com/Bharath-kumar-7/Legal-AI-Assistant](https://github.com/Bharath-kumar-7/Legal-AI-Assistant)
- **Primary Branch:** `main`
- **Tracked Subsystems:**
  - `artifacts/api-server/` — Express 5 backend, auth middleware, OTP services, notifications engine.
  - `artifacts/legal-assistance/` — React frontend, Client Portal, Lawyer Portal, Admin Portal.
  - `lib/db/` — Drizzle schema models, migration config, and seed scripts.
  - `attached_assets/` — LexFlow design system specifications and architecture UML diagrams.

---

## 📜 License & Disclaimers

Nyaya provides technology workflows and legal information to improve access to justice. It does not provide formal legal representation or constitute an attorney-client relationship. For specific legal proceedings, citizens must consult with a licensed and enrolled advocate under the Advocates Act, 1961.
