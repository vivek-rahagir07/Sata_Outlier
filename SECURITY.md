# 🛡️ Security Policy — SATA (Outlier)

SATA is engineered with security, data privacy, and robust execution as foundational tenets. This document details our threat model, defensive controls, vulnerability disclosure procedures, and compliance standards.

---

## 🔒 Supported Versions

The following versions of SATA are actively supported with security updates and vulnerability patches:

| Version | Supported | Security Maintenance Status |
| :--- | :--- | :--- |
| `2.4.x` | ✅ Yes | Current Stable Production |
| `2.0.x` | ✅ Yes | Security Patches Only |
| `< 2.0` | ❌ No | Deprecated |

---

## 🚨 Reporting a Vulnerability

We welcome responsible security disclosures from the community and security researchers.

- **Primary Contact:** [security@hack2skill.com](mailto:security@hack2skill.com) / Repository Maintainer
- **Response Timeline:** We acknowledge all security reports within **24 hours** and provide a patch or mitigation status within **72 hours**.
- **Responsible Disclosure:** Please do not publicly disclose security vulnerabilities until a patched release is published.

---

## 🏰 Security Architecture & Threat Model

### 1. 100% Local-First Data Privacy (Zero Cloud Exfiltration)
- All financial statements, transaction ledgers, uploaded CSV files, and user notes are processed **strictly inside the client-side browser runtime (in-memory)**.
- **Zero Remote Telemetry / Zero 3rd-Party Tracking:** No financial records, amounts, bank names, or account identifiers are transmitted over the public internet.

### 2. Anti-CSV Formula Injection (DDE Defense)
Financial CSV files frequently contain malicious formula prefixes intended to trigger remote command execution in Microsoft Excel, Apple Numbers, or Google Sheets (e.g. `=cmd|' /C calc'!A0` or `@SUM(...)`).
- All incoming string fields (`merchant`, `category`, `notes`) pass through `sanitizeCsvField()`.
- Any cell beginning with formula triggers (`=`, `+`, `-`, `@`, `\t`, `\r`) is automatically neutralized with a leading single quote (`'`), ensuring spreadsheet software parses it strictly as plain text.

### 3. Cross-Site Scripting (XSS) & DOM Safety
- SATA prohibits `dangerouslySetInnerHTML`, `eval()`, and `new Function()`.
- HTML tags in merchant strings or user inputs are stripped via strict regular expression and DOM parsing filters.
- All numbers undergo bounded parsing via `safeParseAmount()`, rejecting non-finite values (`NaN`, `Infinity`, negative anomalies).

### 4. Path Traversal & Sandbox Containment
- The background chore execution engines (`CodeLinter`, `FolderJanitor`, `EmailTriage`) are strictly bounded by `isSafePath()`.
- Directory paths are resolved using `path.resolve` and checked against an immutable list of whitelisted sandbox directories (`process.cwd()`, `chaos_sandbox`).
- Path traversals (`../`, `..\`, null-byte injections `\0`) are intercepted and rejected with HTTP `403 Forbidden`.

### 5. HTTP Security Headers & Rate Limiting
- **Helmet Middleware:** Configures HTTP security headers including `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-DNS-Prefetch-Control: off`.
- **API Rate Limiting:** Enforces an Express IP-based sliding window rate limiter (300 requests per 15-minute window) to prevent automated denial-of-service and brute-force scanning.
- **Strict Payload Limits:** Express body parser enforces a strict `512kb` payload cap to eliminate memory exhaustion attacks.

### 6. 100% Reversible Undo Journal
- Every physical file modification made by the chore engines generates a cryptographic record in `UndoManager`.
- Users can instantly rollback any file movement, content modification, or deletion with zero data loss risk.

---

## 🧪 Security & Compliance Testing Suite

Automated security regression tests run on every commit (`npm test`) to guarantee:
- Neutralization of CSV formula triggers (`=`, `+`, `-`, `@`)
- Neutralization of XSS payloads (`<script>`, `<img src=x onerror=...>`, `javascript:...`)
- Prevention of Prototype Pollution attacks
- Verification of Path Traversal sandbox boundaries
- Rejection of invalid record ID injection formats
- Bounded numeric validation without numeric overflow

---

## 📋 Security Checklist

- [x] Zero CVEs in dependencies (`npm audit` reports 0 vulnerabilities)
- [x] No credentials, private keys, or API secrets in git history
- [x] Content Security Policy (CSP) & `X-Content-Type-Options: nosniff` active
- [x] Local-first data processing model
- [x] Input sanitization against CSV Injection & XSS
- [x] Path traversal guards in file system engines
- [x] Express Helmet and Rate Limiting active

