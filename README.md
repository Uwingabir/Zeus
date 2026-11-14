# ZEUS — Enterprise Operations & Intelligence Platform

**ZEUS** is an enterprise operations suite designed for centralized management of strategic projects, clients, workforce and alumni directories, corporate documentation, templates, internship pipelines, and cryptographic security vaults.

---

## ⚡ What's New & Upgraded

### 1. Account Creation Prior to Sign In
- Before signing in, team members create an authorized corporate account.
- **Company Domain Enforcement**: Accounts must belong to an approved domain (`@domari`, `@ikirezi`, `@fraudshield`, or configured enterprise partner domains).
- **Strong Password Defense**: Enforces minimum 8 characters with required alphanumeric complexity.

### 2. Real Cloud Database (Supabase PostgreSQL Integration)
- Connects directly to **Supabase** for real-time cloud data storage:
  - All projects, clients, employees, documents, templates, internships, and users are stored in real PostgreSQL tables.
  - Automatic synchronization with offline-resilient local cache.
  - Complete SQL database schema provided in [`supabase-schema.sql`](file:///c:/Users/calin/OneDrive/Desktop/ZEUS/zeus/supabase-schema.sql) with Row Level Security (RLS) policies.
  - One-click configuration via the **"Database Cloud"** modal in the top header.

### 3. Unified Employees & Alumni Register
- Consolidated the previous separate "Employees we worked with" section directly into the **Employees & Alumni** register.
- Tracks:
  - **Status**: *Active*, *Former / Alumni*, *Contractor (Completed)*
  - **Time Worked Together**: Exact tenure (e.g. *Jan 2023 - Present*, *Jan 2024 - Dec 2024 (12 mos)*)
  - Quick filter pills: `[All Statuses] [Active] [Former / Alumni] [Contractor (Completed)]`

### 4. Enterprise-Grade Security Hardening
- **Anti-Brute Force Protection**: Automatic 60-second cooldown lockout after 5 failed login attempts or 3 failed PIN attempts.
- **AES-GCM 256-bit Vault Encryption**: Sensitive keys and credentials in the vault are encrypted using browser-native Web Crypto API derived with PBKDF2.
- **XSS Sanitization**: User inputs are sanitized prior to DOM insertion to prevent script injection.
- **Audit Logging**: All security-critical events (logins, vault access, secret copying) are recorded in security audit logs.
- **Inactivity Auto-Lock**: Credentials vault auto-locks after 15 minutes of inactivity.

### 5. Removed Demo Data Resets
- Cleaned up demo reset buttons from the interface for a genuine production operational feel.

---

## 🚀 Connecting Your Supabase Database

1. Create a free project at [https://supabase.com](https://supabase.com).
2. In the Supabase Dashboard, go to the **SQL Editor**, open [`supabase-schema.sql`](file:///c:/Users/calin/OneDrive/Desktop/ZEUS/zeus/supabase-schema.sql), and click **Run**.
3. Open ZEUS, click the **"Database Cloud"** button in the top header, and paste your:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **Anon Public API Key**
4. Click **Test & Save Connection** — all records will immediately synchronize live to your Supabase PostgreSQL cloud!

---

## 🔑 Quick Access Reference

| Entity | Email | Role |
|---|---|---|
| **Domari Technologies** | `alex@domari.com` | Super Admin |
| **Ikirezi Ventures** | `sarah@ikirezi.com` | Project Director |
| **FraudShield AI** | `david@fraudshield.com` | Security Engineer |

- **Security Clearance PIN (for Credentials Vault)**: **`7799`**
- **Command Palette Shortcut**: Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to search and navigate instantly.

---

## 📁 Repository Structure

```
zeus/
├── index.html            # Main application interface and modal containers
├── supabase-schema.sql   # Complete Supabase PostgreSQL schema with RLS
├── css/
│   └── style.css         # Custom styles, glassmorphism, animations, and keypad
├── js/
│   ├── supabase.js       # Real-time Supabase database adapter and audit logger
│   ├── store.js          # Unified store with cloud sync and localStorage cache
│   ├── security.js       # AES-256 vault encryption, rate limiting, and sanitization
│   ├── auth.js           # Account creation, domain checks, and login rate limiting
│   ├── ui.js             # Table renderers, consolidated employees, and charts
│   └── app.js            # Lifecycle controller, command palette, and auth tab routing
├── start-zeus.bat        # One-click Windows launch script
└── README.md             # Documentation and operations guide
```

---
*Built with precision for ZEUS Enterprise.*
