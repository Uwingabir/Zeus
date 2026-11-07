# ZEUS — Enterprise Operations & Intelligence Platform

**ZEUS** is a clean, modern enterprise operations suite designed for centralized management of strategic projects, clients, workforce directories, corporate documentation, templates, internship pipelines, and security-restricted secrets.

---

## ⚡ Highlights & Key Features (Aligned with Specifications)

### 1. Clean, Modern Aesthetic
- Built with a sleek executive dark theme (`#0B0F17`), subtle ambient glassmorphism, crisp badges, and responsive layouts.
- Powered by Tailwind CSS, Plus Jakarta Sans typography, and Lucide icons.

### 2. Strict Company Account Authentication
- **Company Domain Restriction**: Logins require an authorized company email account (e.g., `@domari`, `@ikirezi`, `@fraudshield`, or configured enterprise partner domains).
- Non-company email domains (e.g., public mail providers) are cleanly rejected with an informative restriction alert.
- **One-Click Quick Login**: Instant demo buttons for `@domari` (Alexandre), `@ikirezi` (Sarah), and `@fraudshield` (David).

### 3. Comprehensive Dashboard Overview
When a user signs in, the executive dashboard immediately presents:
- **Stats**: Total active projects, enterprise clients, team capacity, and security clearance status.
- **Products & Stages**: Lifecycle progress visualization across *Ideation*, *Planning*, *Development*, *QA & Testing*, and *Live Production*.
- **Clients Overview**: Active enterprise contracts, industry sectors, primary contacts, and deal sizes.
- **Applications & Talent**: Internship candidate applications with review stages (*Pending*, *Reviewing*, *Interviewing*, *Accepted*).
- **Important Documents**: Pinned compliance filings, ISO audits, blueprints, and MSAs.
- **Employee We Worked With (Security Restriction)**: Historical contractors, alumni, clearance levels, performance scores, and notes. Gated behind a security challenge.
- **Credentials Vault (Security Restriction)**: Production AWS KMS keys, master database credentials, and HMAC webhook secrets. Gated behind a security challenge.

### 4. Dedicated Data Tables & Operations
- **Projects**: Search, filter by stage, create new projects, and export to CSV.
- **Clients**: Client directory, contact details, contract values, and location tracking.
- **Employees**: Active team members across Engineering, Product, Design, Infrastructure, and Security.
- **Employee We Worked With**: Confidential archival roster of former staff, alumni, and contractors with clearance levels and exit evaluations.
- **Important Documents**: Centralized document register with classification badges (Confidential, Restricted, Internal), file size indicators, and a secure preview modal.
- **Templates**: Ready-to-use business & engineering templates (Mutual NDA, SOW, Sprint RFC, Internship Evaluation, Commercial Invoice) with one-click copy and download.
- **Internship**: Talent pipeline tracking with university affiliations, GPA, assigned mentors, and projects.
- **Users**: User access governance with company domain whitelisting.
- **Credentials Vault**: Secret key management with masked passwords (`••••••••`), reveal/hide toggles, and instant clipboard copying with audit toasts.

### 5. Dual-Layer Security Restriction
Sensitive sections (*Employee We Worked With* and *Credentials Vault*) are protected by an interactive security challenge:
- **Default Demo PIN**: `7799` (or `zeus2026`)
- Auto-locks on logout and inactivity.
- Header indicator provides quick one-click locking at any time.

### 6. Seamless Logout
- Prominent sign-out controls in both the top header and sidebar footer with a confirmation dialog.

---

## 🚀 Quick Start Guide

### Option 1: Direct Browser Launch (Fastest)
Double-click `start-zeus.bat` or open `index.html` directly in any web browser (Google Chrome, Microsoft Edge, Firefox, Brave, Safari).

### Option 2: Local PowerShell Server
Run the included PowerShell server script:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Then visit: `http://localhost:8080`

---

## 🔑 Demo Credentials

| Organization | Email | Default Password | Clearance PIN |
|---|---|---|---|
| **Domari Technologies** | `alex@domari.com` | `Zeus@2026` | `7799` |
| **Ikirezi Ventures** | `sarah@ikirezi.com` | `Zeus@2026` | `7799` |
| **FraudShield AI** | `david@fraudshield.com` | `Zeus@2026` | `7799` |

---

## 📁 Repository Structure

```
zeus/
├── index.html          # Main application interface and modal containers
├── css/
│   └── style.css       # Custom styles, glassmorphism, and animations
├── js/
│   ├── store.js        # State management, initial mock seed, localStorage persistence
│   ├── security.js     # Clearance challenge, PIN verification, vault locking
│   ├── auth.js         # Company domain validation, session management, logout
│   ├── ui.js           # Dynamic renderers for dashboard, tables, and modals
│   └── app.js          # App lifecycle, routing, keyboard listeners, event dispatch
├── start-zeus.bat      # One-click Windows launch script
├── server.ps1          # Optional lightweight local HTTP server
└── README.md           # Documentation and operations guide
```

---
*Built with precision for ZEUS Enterprise.*
