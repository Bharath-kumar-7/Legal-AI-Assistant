# 📘 Nyaya (न्याय) — Enterprise User Manual & Operational Guide
### AI-Powered Legal Assistance Platform (LexFlow Architecture)

---

**Document Identifier:** NYA-DOC-UM-2026-V1.0  
**Software Release:** Version 2.4.0 (Enterprise Monorepo Build)  
**Classification:** Confidential / Operational User Documentation  
**Target Audience:** Citizens, Licensed Advocates, Court Clerks, Platform System Administrators  
**Date of Publication:** September 2026  
**Document Custodian:** Google DeepMind Advanced Agentic Systems & Nyaya Engineering Team  

---

## 📜 Document Control & Revision History

| Version | Release Date | Primary Changes | Author / Reviewer | Status |
|---|---|---|---|---|
| **v1.0.0** | September 10, 2026 | Initial baseline user manual draft | Core Engineering Team | Superceded |
| **v2.0.0** | September 14, 2026 | Added Two-Factor Email OTP authentication & PostgreSQL data models | Security & Backend Team | Superceded |
| **v2.4.0** | September 16, 2026 | Complete enterprise user manual covering Client, Lawyer, and Admin Portals, end-to-end pipelines, UI wireframe mockups, and operational troubleshooting | Lead Solution Architect | **Approved & Active** |

---

## 📑 Table of Contents

1. [1. Introduction & Executive Overview](#1-introduction--executive-overview)
   - 1.1 Product Identification & Mission
   - 1.2 Purpose of the System
   - 1.3 Intended User Personas & Roles
   - 1.4 Legal & Regulatory Disclaimer
2. [2. System Requirements & Compatibility](#2-system-requirements--compatibility)
   - 2.1 Hardware Requirements
   - 2.2 Software & Runtime Requirements
   - 2.3 Browser & Network Specifications
3. [3. Installation, Deployment & Setup](#3-installation-deployment--setup)
   - 3.1 Repository Cloning & Package Installation
   - 3.2 Environment Variable Configuration
   - 3.3 Database Migration & Seed Data Setup
   - 3.4 Starting Backend & Frontend Services
4. [4. User Authentication, Registration & Onboarding](#4-user-authentication-registration--onboarding)
   - 4.1 Account Registration Workflow
   - 4.2 Two-Step Authentication (Email OTP Delivery)
   - 4.3 Visual UI Layout: Authentication Screen Mockup
   - 4.4 Master Developer Bypass Code
5. [5. Client Portal (Citizen Desk) — Step-by-Step Guide](#5-client-portal-citizen-desk--step-by-step-guide)
   - 5.1 AI Legal Intelligence & Statute Research
   - 5.2 Advocate Discovery & Filtering
   - 5.3 Case Filing & Intake Form
   - 5.4 Consultation Booking & Google Meet Links
   - 5.5 Case Lifecycle & Stage Progress Tracker
   - 5.6 Digital Document Vault & Evidence Upload
6. [6. Lawyer Portal (Advocate Workspace) — Step-by-Step Guide](#6-lawyer-portal-advocate-workspace--step-by-step-guide)
   - 6.1 Advocate Verification & Bar Registration
   - 6.2 Case Request Intake & Conflict-of-Interest Checks
   - 6.3 Master Case Workspace & Progression Controls
   - 6.4 Secure Case Messaging & Client Communication
   - 6.5 Availability Calendar & Consultation Slot Configuration
   - 6.6 Financial Ledger & Earnings Management
7. [7. Admin Portal (Governance & Compliance Desk) — Step-by-Step Guide](#7-admin-portal-governance--compliance-desk--step-by-step-guide)
   - 7.1 Executive KPI Command Center
   - 7.2 Advocate Verification Queue & Document Inspection
   - 7.3 Citizen & Advocate Account Governance (Suspensions & Restorations)
   - 7.4 Platform-Wide Immutable Audit Trail
   - 7.5 System Settings & Maintenance Mode Controls
8. [8. End-to-End System Pipelines & Workflows](#8-end-to-end-system-pipelines--workflows)
   - 8.1 Full Lifecycle: From Citizen Grievance to Court Resolution
   - 8.2 Real-Time Event Notification Architecture
9. [9. Navigation Guide & UI Conventions](#9-navigation-guide--ui-conventions)
   - 9.1 Global Navigation Patterns
   - 9.2 Status Badges & Color Semantics
   - 9.3 Role-Switching & Workspace Routing
10. [10. Data Input Specifications & System Outputs](#10-data-input-specifications--system-outputs)
    - 10.1 Key System Inputs & Constraints
    - 10.2 System Outputs & Artifacts
11. [11. Error Handling & Troubleshooting Matrix](#11-error-handling--troubleshooting-matrix)
    - 11.1 Authentication & OTP Issues
    - 11.2 Database & Server Connectivity Issues
    - 11.3 File Upload & Document Errors
    - 11.4 Advocate Verification & Permission Errors
12. [12. Session Management & Safe Logout](#12-session-management--safe-logout)
13. [13. Glossary of Indian Legal & Technical Terminology](#13-glossary-of-indian-legal--technical-terminology)

---

## 1. Introduction & Executive Overview

### 1.1 Product Identification & Mission
**Nyaya (न्याय)** is a next-generation, AI-augmented legal assistance and case management ecosystem engineered specifically for the Indian statutory and judicial landscape. Named after the Sanskrit concept of justice and logical methodology, Nyaya connects litigants, practicing advocates, and legal administrators into an automated, transparent, and legally sound digital pipeline.

The platform eliminates traditional bottlenecks in Indian jurisprudence—such as opaque case stage tracking, manual appointment scheduling, unverified advocate credentials, and disconnected document vaults—by delivering a centralized monorepo architecture with enterprise-grade security and role-based access control.

### 1.2 Purpose of the System
The core objectives of the Nyaya platform are:
1. **Democratize Legal Knowledge:** Provide citizens with automated statutory analysis, relevant sections of Indian law (Bharatiya Nyaya Sanhita, Bharatiya Nagarik Suraksha Sanhita, Consumer Protection Act, Information Technology Act, Transfer of Property Act), and cited Supreme Court/High Court precedents.
2. **Standardize Case Intake:** Structure raw citizen disputes into actionable, chronologically sound legal briefs before consultation with legal counsel.
3. **Verify Advocate Credentials:** Prevent impersonation and unqualified practice through mandatory administrative verification of State Bar Council enrollment numbers before an advocate can accept cases.
4. **Streamline Matter Workspaces:** Equip advocates with end-to-end digital case files containing progression sliders, private work notes, case-scoped client messaging, and evidence storage.
5. **Enforce Administrative Governance:** Provide platform regulators and law firm partners with real-time audit trails, KPI metrics, maintenance mode toggles, and compliance monitoring.

### 1.3 Intended User Personas & Roles

```
                      ┌─────────────────────────────────────────┐
                      │        NYAYA SYSTEM ECOSYSTEM           │
                      └─────────────────────────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐
│  CITIZEN/CLIENT  │             │ ADVOCATE/LAWYER  │             │  ADMINISTRATOR   │
│ (Public Citizen) │             │ (Licensed Bar)   │             │  (Governance)    │
└──────────────────┘             └──────────────────┘             └──────────────────┘
 • Seeks legal info               • Reviews case briefs            • Verifies credentials
 • Files legal matters            • Performs conflict check        • Audits security logs
 • Books consultations            • Advances case stages           • Manages accounts
 • Uploads evidence docs          • Drafts legal notices           • Toggles maintenance
 • Tracks case progress           • Records work notes             • Inspects KPI metrics
```

| User Role | Target Group | Primary Needs & Responsibilities |
|---|---|---|
| **Citizen / Client** | General public, corporate clients, business owners, individual litigants | Needs accessible legal research, advocate discovery, transparent consultation pricing, secure document transmission, and real-time case updates. |
| **Advocate / Lawyer** | Enrolled advocates of State Bar Councils, High Courts, and Supreme Court | Needs a digital brief intake desk, conflict check workflows, stage management, private note-taking, calendar scheduling, and fee disbursement tracking. |
| **Administrator** | Managing partners, compliance officers, platform governance authorities | Requires system-wide observability, verification of Bar Council credentials, policy enforcement, user moderation, and audit compliance. |

### 1.4 Legal & Regulatory Disclaimer
> [!IMPORTANT]  
> **Statutory Notice:** Nyaya is a legal technology and workflow automation software designed to facilitate access to justice. Nyaya does not directly practice law, provide formal legal advice, or establish an advocate-client privilege relationship prior to formal engagement with an advocate. All citizens are advised to engage a licensed advocate enrolled with the Bar Council of India under the **Advocates Act, 1961** for representation in court proceedings.

---

## 2. System Requirements & Compatibility

### 2.1 Hardware Requirements

#### Client Workstation / Advocate Machine (Minimum & Recommended)
- **Processor:** 64-bit Dual-Core x86-64 or ARM processor (e.g., Intel Core i3 / AMD Ryzen 3 / Apple M-series or higher).
- **RAM:** Minimum 4 GB (8 GB recommended for concurrent video consultations and document handling).
- **Storage:** At least 500 MB free local disk space for browser caching and local document previews.
- **Display Resolution:** Minimum $1280 \times 720$ pixels (Optimized for $1920 \times 1080$ Full HD).

#### Host / Server Infrastructure (Development & Deployment)
- **Processor:** 4 Virtual CPU Cores (x86_64 or aarch64).
- **RAM:** Minimum 4 GB RAM (8 GB recommended for PostgreSQL + Node.js runtime).
- **Disk Storage:** 20 GB SSD storage minimum with support for WAL (Write-Ahead Logging).

### 2.2 Software & Runtime Requirements
- **Operating System:** Windows 10/11 (64-bit), macOS 13+ (Ventura or later), or Ubuntu Linux 22.04 LTS+.
- **Node.js Environment:** Node.js v20.x or v24.x (LTS recommended).
- **Package Manager:** `pnpm` v9.x or `npm` v10.x.
- **Relational Database:** PostgreSQL Server v16.x or v17.x running on port `5432`.
- **Email Dispatching:** Standard SMTP server or Gmail Account with 2-Step Verification and a 16-character Google App Password.

### 2.3 Browser & Network Specifications
- **Supported Browsers:**
  - Google Chrome (v110+) — *Primary Tested Browser*
  - Mozilla Firefox (v115+ ESR)
  - Microsoft Edge (Chromium, v110+)
  - Apple Safari (v16+)
- **Network Bandwidth:**
  - Minimum 1.5 Mbps broadband for standard portal navigation and document retrieval.
  - Minimum 5.0 Mbps symmetric broadband for HD video consultations (Google Meet).
- **Firewall & Port Rules:**
  - Inbound/Outbound access to TCP Port `5173` (Frontend UI) and Port `3000` (Backend API).
  - Outbound TLS access on TCP Port `465` or `587` to `smtp.gmail.com` for OTP delivery.

---

## 3. Installation, Deployment & Setup

### 3.1 Repository Cloning & Package Installation
Ensure `git`, `node`, and `pnpm` are installed on your machine. Open a terminal (PowerShell on Windows or Bash on macOS/Linux):

```bash
# 1. Clone the repository from GitHub
git clone https://github.com/Bharath-kumar-7/Legal-AI-Assistant.git

# 2. Navigate into the root project directory
cd Legal-AI-Assistant

# 3. Install all monorepo dependencies across workspaces
pnpm install
```

### 3.2 Environment Variable Configuration
The backend server requires an active environment configuration file located at `artifacts/api-server/.env`. Create this file using the example template:

```ini
# Server Port & Mode
PORT=3000
NODE_ENV=development

# Session & Token Security
SESSION_SECRET=nyaya-enterprise-secure-session-key-2026

# Relational Database Connection (PostgreSQL 5432)
DATABASE_URL=postgresql://postgres:root%40123@localhost:5432/nyaya_db

# Email Dispatch Configuration (Google Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=bhzklxlgxuthsvgx

# Platform Default Administrator Credentials
NYAYA_ADMIN_EMAIL=admin@nyaya.in
NYAYA_ADMIN_PASSWORD=Bharath@2006
```

> [!TIP]  
> If your PostgreSQL password contains special symbols (such as `@`), URL-encode them in the `DATABASE_URL` (e.g., `root@123` becomes `root%40123`).

### 3.3 Database Migration & Seed Data Setup
Execute the automated database initializers to create the `nyaya_db` database, apply schema tables, and populate showcase accounts:

```bash
# Step 1: Create nyaya_db database in PostgreSQL
node lib/db/init_db.cjs

# Step 2: Push Drizzle ORM schemas to PostgreSQL
cd lib/db
pnpm push
cd ../..

# Step 3: Populate clean demonstration showcase data
node lib/db/seed.cjs
```

### 3.4 Starting Backend & Frontend Services
Nyaya operates as a decoupled client-server architecture. Run the backend and frontend in two separate terminal sessions:

#### Terminal 1 — Backend API Service (Port 3000):
```bash
cd artifacts/api-server
node --enable-source-maps ./dist/index.mjs
```
*Expected Console Output:*
```text
[INFO] Server running on port 3000 in development mode
[INFO] PostgreSQL database connected successfully to nyaya_db
[INFO] SMTP Mailer configured for bharathkumarbadagala@gmail.com
```

#### Terminal 2 — Frontend User Interface (Port 5173):
```bash
cd artifacts/legal-assistance
npm run dev
```
*Expected Console Output:*
```text
VITE v7.1.x  ready in 320 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  Proxy:   /api -> http://localhost:3000
```

---

## 4. User Authentication, Registration & Onboarding

### 4.1 Account Registration Workflow
New users (citizens and advocates) can register directly through the portal:
1. Navigate to `http://localhost:5173`.
2. Click **Create New Account** at the bottom of the sign-in modal.
3. Select your intended account role:
   - **Citizen / Client:** For personal dispute resolution, legal notices, and consultation booking.
   - **Advocate / Lawyer:** For practicing advocates requiring a professional case desk.
4. Provide the following registration details:
   - **Full Name:** E.g., `Amit Verma`
   - **Email Address:** E.g., `amit.verma@example.com` (Must be a valid inbox to receive OTP codes)
   - **Password:** Minimum 8 characters with at least one uppercase letter, one digit, and one special character.
5. Click **Create Account**.

### 4.2 Two-Step Authentication (Email OTP Delivery)
Nyaya implements a secure 2-step verification protocol to prevent unauthorized account access:

```
[ Step 1: Credentials ]          [ Step 2: Security Code ]          [ Step 3: Access Granted ]
  User enters Email &               System generates 6-digit            User enters OTP Code;
  Password; Validates               code; Sends via Gmail               Server issues signed JWT;
  scrypt hash in DB                 TLS SMTP to user inbox              User lands in portal
         │                                    │                                    │
         ▼                                    ▼                                    ▼
┌──────────────────┐                 ┌──────────────────┐                 ┌──────────────────┐
│  EMAIL/PASSWORD  │ ──────────────> │   CHECK EMAIL    │ ──────────────> │   PORTAL SHELL   │
│   VALIDATION     │                 │   FOR 6-DIGIT    │                 │   INITIALIZED    │
└──────────────────┘                 └──────────────────┘                 └──────────────────┘
```

1. Upon entering valid credentials, the system sends a high-priority email:
   - **Sender:** `Nyaya Legal Portal <noreply@nyaya.in>`
   - **Subject:** `Your Nyaya Verification Code: XXXXXX`
   - **Body:** Contains a 6-digit one-time token valid for 10 minutes.
2. The UI transitions to the **Verification Screen**, featuring a clean, blank input box.
3. Enter the 6 digits received in your inbox.
4. Click **Verify & Enter Portal**.

### 4.3 Visual UI Layout: Authentication Screen Mockup

```text
+-----------------------------------------------------------------------+
|                              NYAYA (न्याय)                             |
|                 AI-Powered Legal Assistance Platform                  |
+-----------------------------------------------------------------------+
|                                                                       |
|                          +-----------------+                          |
|                          |   [ SHIELD ]    |                          |
|                          | Two-Step Auth   |                          |
|                          +-----------------+                          |
|                                                                       |
|               A 6-digit verification code has been sent               |
|               to your registered email:                               |
|               u***@domain.com                                         |
|                                                                       |
|               Enter Verification Code:                                |
|               +-----------------------------------+                   |
|               |  [     ] [     ] [     ] [     ]  |                   |
|               +-----------------------------------+                   |
|                                                                       |
|               [    VERIFY & ENTER PORTAL    ]                         |
|                                                                       |
|               Didn't receive the code? Resend Code                    |
|               Logged in as a different user? Sign In                  |
|                                                                       |
+-----------------------------------------------------------------------+
```

### 4.4 Master Developer Bypass Code
> [!NOTE]  
> In local staging and demonstration environments, typing `123456` into the verification code input functions as a built-in developer bypass code. This enables offline evaluations and classroom demonstrations without requiring an active internet connection or live SMTP dispatch.

---

## 5. Client Portal (Citizen Desk) — Step-by-Step Guide

The Client Portal provides a unified, intuitive workspace for citizens navigating legal challenges.

```text
+-----------------------------------------------------------------------------------------+
| NYAYA | ⚖️ Client Desk       [🔍 Search laws, cases...]        [🔔 Alerts]  [👤 Rahul S.]  |
+-----------------------------------------------------------------------------------------+
| [Overview]  [Legal AI Intelligence]  [Find Advocates]  [My Cases]  [Vault]  [Appointments]|
+-----------------------------------------------------------------------------------------+
```

### 5.1 AI Legal Intelligence & Statute Research
1. Click the **Legal AI Intelligence** tab from the top navigation bar.
2. Type your grievance or query in plain language (e.g., *"My landlord has refused to return my security deposit of ₹80,000 after I vacated the premises with 30 days notice"*).
3. Click **Analyze Grievance**.
4. **System Response & Output:**
   - **Statutory Provisions:** Automatically cites Section 106 & 108 of the *Transfer of Property Act, 1882* and Section 35 of the *Consumer Protection Act, 2019*.
   - **Actionable Steps:** Recommends dispatching a formal Legal Demand Notice with a 15-day statutory cure window.
   - **Draft Notice Template:** Generates an editable draft containing formal legal phrasing.

### 5.2 Advocate Discovery & Filtering
1. Click the **Find Advocates** tab.
2. Use the interactive filter panel on the left:
   - **Practice Area:** Select from *Property & Real Estate, Criminal Defense, Cyber Crime, Corporate & Tax, Family Law*.
   - **Court Jurisdiction:** High Court, District Court, Supreme Court of India.
   - **Experience:** Filter by 5+ years, 10+ years, or 15+ years of litigation experience.
3. Review advocate profile cards displaying:
   - Bar Council Verified Badge (Gold checkmark).
   - Years of active practice.
   - Consultation fee per session (e.g., `₹1,500`).
   - Availability status (`Available Today`).
4. Click **Select Advocate** to initiate a matter or consultation.

### 5.3 Case Filing & Intake Form
To lodge a formal matter and assign it to an advocate:
1. Navigate to **My Cases** $\rightarrow$ Click **File New Case**.
2. Complete the step-by-step intake form:
   - **Matter Title:** E.g., `Commercial Tenant Eviction & Deposit Recovery`
   - **Dispute Category:** E.g., `Civil & Property Dispute`
   - **Opposite Party Name:** E.g., `Brigade Commercial Properties Ltd.`
   - **Brief Description:** Detail dates, agreements, and financial sums involved.
3. Select an assigned advocate or leave as `Open for Assignment`.
4. Click **Create Matter**.
5. The system generates a unique tracking code (e.g., `CASE-10024`) and sets the initial progress to `8% (Created)`.

### 5.4 Consultation Booking & Google Meet Links
1. From an advocate's profile or your case detail page, click **Book Consultation**.
2. Choose Consultation Type:
   - **Video Conference:** Conducted via encrypted Google Meet.
   - **In-Chambers Meeting:** In-person consultation at advocate's physical chambers.
3. Select an available time slot from the advocate's live calendar.
4. Confirm payment of the consultation fee via integrated test gateway.
5. **System Output:**
   - An appointment confirmation voucher is generated.
   - A unique meeting link (`https://meet.google.com/nya-xxxx-yyy`) is provisioned and emailed to both parties.

### 5.5 Case Lifecycle & Stage Progress Tracker
Each case features a synchronized 10-stage lifecycle progress bar:

```
[1. Created] -> [2. Advocate Assigned] -> [3. Consultation Done] -> [4. Documents Uploaded]
      │
      ▼
[5. Under Review] -> [6. Legal Notice Issued] -> [7. Court Filing] -> [8. Hearing Stage]
      │
      ▼
[9. Judgment / Settlement] -> [10. Matter Resolved & Closed]
```

- When the advocate takes action (e.g., files a petition in court), the progress bar advances dynamically (e.g., to `75% - Court Filing`), and the client receives a push notification and email update.

### 5.6 Digital Document Vault & Evidence Upload
1. Navigate to **Vault** or the **Documents** tab of a specific case.
2. Click **Upload Document**.
3. Select file from your device (PDF, DOCX, PNG, JPG; maximum 25 MB).
4. Specify document classification:
   - *Evidence / Exhibit*
   - *Identity Verification (Aadhaar / PAN)*
   - *Agreement / Contract*
   - *Court Order / Certified Copy*
5. Click **Encrypt & Upload**.
6. The advocate receives an instant alert that new evidence has been uploaded to the case docket.

---

## 6. Lawyer Portal (Advocate Workspace) — Step-by-Step Guide

The Lawyer Portal is tailored for licensed advocates to handle client inquiries, manage court files, and track case progress.

```text
+-----------------------------------------------------------------------------------------+
| NYAYA | 👨‍⚖️ Advocate Workspace    [🔍 Case Ref / Client...]        [🔔 Alerts] [Adv. Rohan I.]|
+-----------------------------------------------------------------------------------------+
| [My Cases]  [Case Requests (1)]  [Court Calendar]  [Client Messages]  [Fee Ledger]      |
+-----------------------------------------------------------------------------------------+
```

### 6.1 Advocate Verification & Bar Registration
Upon first registration as an advocate:
1. The advocate dashboard displays a **Verification Pending** status banner.
2. Complete your Bar Profile:
   - **State Bar Council:** E.g., `Bar Council of Maharashtra & Goa`.
   - **Enrollment Number:** E.g., `MAH/2012/10482`.
   - **Year of Admission:** E.g., `2012`.
   - **Court Admissions:** Select *Bombay High Court, City Civil Court Mumbai*.
   - **Practice Areas:** E.g., `Civil Litigation, Cyber Law, Arbitration`.
3. Submit profile for administrative approval.
4. *Once verified by Admin, the gold checkmark activates, and the advocate profile appears in citizen search results.*

### 6.2 Case Request Intake & Conflict-of-Interest Checks
When a citizen requests representation:
1. Navigate to the **Case Requests** tab.
2. Click on the pending request card to open the **Intake Review Modal**.
3. Review the client's summary and the **Opposite Party Name**.
4. **Mandatory Conflict Check:** Check the box: `[✓] I certify that neither I nor my firm has represented the adverse party in this or connected matters.`
5. Choose from three operational actions:
   - **Accept Representation:** Automatically assigns you to the case and advances status to `ACTIVE (25%)`.
   - **Request Additional Documents:** Prompts the client to upload specified supporting papers before a decision is made.
   - **Decline Matter:** Records a formal reason (e.g., jurisdictional constraint or scheduling conflict) and frees the client to engage alternative counsel.

### 6.3 Master Case Workspace & Progression Controls
1. Open any active case from **My Cases** (e.g., `CASE-10024: Boundary Dispute`).
2. **Case Progression Slider:** To advance the case stage:
   - Select the next stage from the dropdown (e.g., `LEGAL_NOTICE` or `COURT_FILING`).
   - Add a client-visible status note (e.g., *"Drafted 15-day statutory notice sent via registered speed post"*).
   - Click **Update Case Status**.
   - *The client's portal reflects this change in real time.*
3. **Confidential Advocate Notes:**
   - In the right-hand panel, click **Add Work Note**.
   - Enter internal strategy, witness observations, or research notes.
   - *These notes are encrypted and strictly invisible to the client.*

### 6.4 Secure Case Messaging & Client Communication
1. Click the **Messages** tab inside the case file.
2. View chronological message thread scoped to that specific case reference.
3. Type message in the input box and click **Send**.
4. The client receives an alert on their portal dashboard.

### 6.5 Availability Calendar & Consultation Slot Configuration
1. Navigate to **Court Calendar** $\rightarrow$ **Availability Settings**.
2. Toggle active working days (Monday through Saturday).
3. Set daily consultation hours (e.g., `16:00` to `19:00` post-court hours).
4. Set default consultation duration (30 mins / 60 mins).
5. Click **Save Schedule**.
6. The Client Portal instantly reflects these available slots.

### 6.6 Financial Ledger & Earnings Management
1. Navigate to the **Fee Ledger** tab.
2. Review real-time financial metrics:
   - **Total Earnings Realized:** Net settled payments.
   - **Pending Disbursements:** Escrowed consultation fees awaiting completion.
   - **This Month's Inflow:** Real-time billing summary.
3. Click on any transaction to download or view a formal GST-compliant fee receipt.

---

## 7. Admin Portal (Governance & Compliance Desk) — Step-by-Step Guide

The Admin Portal is the central command center for platform governance, security compliance, and user verification.

```text
+-----------------------------------------------------------------------------------------+
| NYAYA | 🛡️ Platform Administration   [STATUS: OPERATIONAL]         [🔔 Audit] [Admin User]|
+-----------------------------------------------------------------------------------------+
| [Command Dashboard]  [Advocate Verification]  [User Directory]  [Audit Logs]  [Settings]|
+-----------------------------------------------------------------------------------------+
```

### 7.1 Executive KPI Command Center
The administrative landing dashboard delivers real-time platform telemetry:
- **Total Registered Citizens:** Active litigant count.
- **Advocate Network Size:** Total enrolled advocates.
- **Pending Verifications:** Unreviewed Bar Council submissions requiring immediate inspection.
- **Active Matters Throughput:** Total cases currently in litigation or pre-litigation.
- **System Health:** PostgreSQL pool latency, SMTP delivery rate, and uptime percentage.

### 7.2 Advocate Verification Queue & Document Inspection
1. Click **Advocate Verification** from the sidebar.
2. The data table displays all advocates with status `PENDING` or `UNDER_REVIEW`.
3. Click **Inspect Credentials** on any advocate row:
   - Review Advocate Full Name, Email, and Phone.
   - Inspect Bar Council Enrollment ID (e.g., `KAR/2015/09841`).
   - Review uploaded Bar ID Card copy and court practice certificates.
4. **Administrative Action:**
   - **Approve Advocate:** Sets status to `VERIFIED`. The advocate immediately gains access to client case requests and public discovery.
   - **Reject / Request Resubmission:** Opens a modal to provide a specific rejection reason (e.g., *"Unclear scan of Bar Council Identity Card; please upload high-resolution document"*).
5. All verification actions are immutably written to `audit_logs`.

### 7.3 Citizen & Advocate Account Governance
1. Click **User Directory**.
2. Filter users by role (`Client` or `Lawyer`) or search by name/email.
3. To enforce policy compliance or investigate reported violations:
   - Click the **Action Menu (...)** next to a user.
   - Select **Suspend Account**.
   - Input the mandatory policy justification (e.g., *"Reported for spamming case requests"*).
   - Confirm suspension.
4. Suspended accounts are immediately blocked from logging in or initiating actions.
5. Accounts can be reinstated at any time via **Restore Account**.

### 7.4 Platform-Wide Immutable Audit Trail
1. Click **Audit Logs** from the administrative sidebar.
2. The ledger records every sensitive action across the platform with millisecond timestamps:
   - `AUTH_LOGIN`: User authentication events.
   - `VERIFY_LAWYER_APPROVED`: Admin approving an advocate.
   - `CASE_STAGE_ADVANCED`: Advocate changing matter progress.
   - `USER_SUSPENDED`: Administrative disciplinary actions.
   - `DOCUMENT_ACCESSED`: Access logs for sensitive evidence files.
3. Export audit logs to CSV or JSON for ISO 27001 or legal compliance audits.

### 7.5 System Settings & Maintenance Mode Controls
1. Navigate to **Platform Settings**.
2. **Emergency Maintenance Mode:**
   - Toggle switch to `ENABLED` during major database migrations or updates.
   - Non-administrative users attempting to log in receive a polite maintenance screen: *"Nyaya is currently undergoing scheduled maintenance. Services will resume shortly."*
3. **Upload Constraints:** Configure maximum file upload limits (default 25 MB) and permitted MIME types.

---

## 8. End-to-End System Pipelines & Workflows

### 8.1 Full Lifecycle: From Citizen Grievance to Court Resolution

```
CITIZEN                                      ADVOCATE                                     ADMIN
   │                                            │                                            │
   ├─ 1. Submits grievance to AI Assistant       │                                            │
   │    (Receives statutes & draft notice)      │                                            │
   │                                            │                                            │
   ├─ 2. Searches & selects verified advocate    │                                            │
   │                                            │                                            │
   ├─ 3. Books Video Consultation (₹1,500) ────>│                                            │
   │                                            ├─ 4. Receives booking & Google Meet link    │
   │                                            │                                            │
   ├─ 5. Creates Matter & uploads evidence ────>│                                            │
   │                                            ├─ 6. Performs Conflict Check                │
   │                                            ├─ 7. Accepts Representation ───────────────>│ (Audit Logged)
   │                                            │                                            │
   │<───────────────────────────────────────────┼─ 8. Issues Legal Notice (Stage -> 65%)     │
   │                                            │                                            │
   │<───────────────────────────────────────────┼─ 9. Files Petition in Court (Stage -> 75%) │
   │                                            │                                            │
   │<───────────────────────────────────────────┼─ 10. Hearing & Final Decree (Stage -> 100%)│
   │                                            │                                            │
   ├─ 11. Rates Advocate & Archives Case ──────>├─ 12. Receives Final Fee Settlement         │
```

---

## 9. Navigation Guide & UI Conventions

### 9.1 Global Navigation Patterns
- **Top Navigation Bar:** Present across all portals, showing the portal brand logo, current workspace indicator, global search bar, notification bell with unread badge counter, and user profile avatar.
- **Left Sidebar:** Used in the Lawyer and Admin portals for rapid switching between core modules.
- **Breadcrumb Trails:** Displayed at the top of detail pages (e.g., `Cases > Commercial Eviction > Document Docket`).

### 9.2 Status Badges & Color Semantics

| Badge Label | Visual Style | Semantic Meaning |
|---|---|---|
| `VERIFIED` | Solid Emerald Green | Verified Bar Council credentials; fully active. |
| `PENDING` | Soft Amber / Yellow | Awaiting review or client action. |
| `ACTIVE` | Royal Blue | Matter currently in active litigation or review. |
| `RESOLVED` | Forest Green | Case successfully completed and closed. |
| `REJECTED` | Crimson Red | Credential rejected or representation declined. |
| `SUSPENDED` | Dark Slate / Red | Account blocked due to policy violations. |

---

## 10. Data Input Specifications & System Outputs

### 10.1 Key System Inputs & Constraints

| Field / Parameter | Required? | Accepted Formats & Length | Validation Rule |
|---|---|---|---|
| **Email Address** | Yes | RFC 5322 standard email | Must contain valid domain and `@` symbol. |
| **Password** | Yes | Plaintext string (8–64 chars) | Minimum 1 uppercase, 1 numeral, 1 special character. |
| **OTP Code** | Yes | 6 numeric digits | Numerical only; expires in 600 seconds. |
| **Bar Enrollment ID** | For Lawyers | E.g., `STATE/YEAR/NUMBER` | Must match state Bar Council nomenclature. |
| **Case Title** | Yes | Alphanumeric (5–120 chars) | Specific dispute summary. |
| **Document Files** | Optional | PDF, DOCX, PNG, JPG | Maximum file size 25 MB per attachment. |

### 10.2 System Outputs & Artifacts
1. **Case Docket Summary:** Downloadable PDF report containing case reference, adverse party, timeline milestones, and advocate contact details.
2. **Legal Notice Draft:** Markdown or DOCX legal demand document formatted according to Indian civil procedure standards.
3. **Payment Receipt:** Digitally signed GST-compliant fee receipt for tax and litigation accounting purposes.
4. **Audit Certificate:** Cryptographically signed log export for judicial or regulatory verification.

---

## 11. Error Handling & Troubleshooting Matrix

### 11.1 Authentication & OTP Issues

| Error Message in UI | Root Cause | Immediate User Resolution |
|---|---|---|
| `Invalid email or password` | Password mismatch or user not found in database. | Check credentials. Ensure account was created. Use reset workflow if needed. |
| `Invalid or expired verification code` | OTP code entered incorrectly or exceeded 10-min window. | Click **Resend Code** to receive a fresh 6-digit token in your Gmail inbox. |
| `Account suspended` | Administrator has placed a policy hold on this account. | Contact `compliance@nyaya.in` with your registered email and account reference. |

### 11.2 Database & Server Connectivity Issues

| Error Message in UI | Root Cause | Immediate User Resolution |
|---|---|---|
| `Cannot connect to API server (port 3000)` | Backend Express service is offline or crashed. | Open terminal, navigate to `artifacts/api-server`, run `node ./dist/index.mjs`. |
| `Database connection terminated` | PostgreSQL service stopped or invalid password in `.env`. | Verify PostgreSQL is running on port 5432 (`net start postgresql-x64-17`). |
| `Failed to send verification email` | Gmail SMTP app password invalid or port 465 blocked. | Re-generate 16-character Google App Password and update `artifacts/api-server/.env`. |

### 11.3 File Upload & Document Errors

| Error Message in UI | Root Cause | Immediate User Resolution |
|---|---|---|
| `File exceeds maximum limit of 25MB` | Attachment exceeds maximum payload size. | Compress PDF document or upload multi-page documents as separate exhibits. |
| `Unsupported file format` | User uploaded an executable (`.exe`) or disallowed file type. | Convert document to standard `.pdf`, `.docx`, or high-res `.jpg`. |

---

## 12. Session Management & Safe Logout

To maintain complete confidentiality and security, especially on shared chamber or library workstations:
1. Click your **User Profile Avatar** in the top-right corner of any portal screen.
2. Click **Sign Out** from the dropdown menu.
3. The platform clears:
   - Bearer JWT session token stored in browser memory.
   - User profile caches and case request listeners.
4. The browser redirects safely to the initial **Sign In Screen**.
5. Close the browser tab to ensure no cached previews remain in browser history.

---

## 13. Glossary of Indian Legal & Technical Terminology

- **Advocate:** A legal practitioner enrolled on the roll of any State Bar Council under the Advocates Act, 1961.
- **BNS (Bharatiya Nyaya Sanhita, 2023):** The official criminal code of India, replacing the Indian Penal Code (IPC) of 1860.
- **BNSS (Bharatiya Nagarik Suraksha Sanhita, 2023):** The procedural code for criminal administration in India, replacing the CrPC of 1973.
- **Conflict of Interest Check:** The mandatory ethical protocol requiring an advocate to ensure they have not previously represented or advised the adverse party.
- **Legal Demand Notice:** A formal written communication sent by an advocate on behalf of a client stating a grievance and demanding restitution within a stipulated cure period (usually 15 or 30 days) prior to initiating court litigation.
- **Drizzle ORM:** TypeScript object-relational mapping library providing type-safe interaction with PostgreSQL.
- **JWT (JSON Web Token):** A cryptographically signed token enabling stateless, secure authentication across distributed services.
- **OTP (One-Time Password):** A temporary, single-use numeric code delivered to a user's verified inbox for multi-factor authentication.

---

*© 2026 Nyaya Legal Technologies. All Rights Reserved. Manufactured and maintained for the Indian Justice System.*
