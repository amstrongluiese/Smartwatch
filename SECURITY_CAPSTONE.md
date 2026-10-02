# Security & Architecture Documentation
## Xiaomi HealthKit Third-Party Integration Prototype (Capstone Project)

### 1. Architectural Scope & Boundary Enforcement

This application prototype operates under strict non-invasive, cloud-to-cloud parameters:
- **Target Wearable:** Xiaomi Smart Band 9 Active
- **Mobile Companion:** Official Mi Fitness App
- **Primary Data Scope:**
  - Heart Rate (`com.xiaomi.heart_rate.delta`, unit: `bpm`)
  - Blood Oxygen / SpO₂ (`com.xiaomi.spo2.instantaneous`, unit: `%`)

```
+-----------------------------+
| Xiaomi Smart Band 9 Active  |
+-----------------------------+
              | (Manufacturer BLE connection)
              v
+-----------------------------+
|   Official Mi Fitness App   |
+-----------------------------+
              | (Encrypted Cloud Sync)
              v
+-----------------------------+
| Xiaomi Cloud / HealthKit    |
+-----------------------------+
              | (OAuth 2.0 Authorization Code Flow)
              v
+-----------------------------+
|    Our Application Server   |  <--- Browser NEVER talks to Xiaomi directly
+-----------------------------+
              | (Parameterized SQL)
              v
+-----------------------------+
|   Database (AES-256 Tokens) |
+-----------------------------+
              | (Sanitized JSON REST API)
              v
+-----------------------------+
|   React Web Dashboard       |
+-----------------------------+
```

#### Non-Invasive Guarantees:
1. **No Direct Bluetooth Connection:** The web dashboard does not attempt to bind or connect to the Smart Band 9 Active hardware directly via Web Bluetooth or local radio protocols. The factory pairing between the band and Mi Fitness is untouched.
2. **No Reverse-Engineering or Local Database Scraping:** The application does not decompile APKs, scrape SQLite files from rooted devices, or intercept private Mi Fitness network traffic.
3. **Official Open Platform APIs Only:** All health telemetry is retrieved exclusively through user-consented OAuth 2.0 authorization codes and official Xiaomi HealthKit Cloud endpoints.

---

### 2. Authentication & Credential Security

#### A. OAuth 2.0 Authorization-Code Flow
- The application implements the standard RFC 6749 authorization code grant flow with cryptographic state parameters to prevent Cross-Site Request Forgery (CSRF).
- The user authenticates on official Xiaomi servers (`https://account.xiaomi.com/oauth2/authorize`).
- The user's Xiaomi password and account credentials are never seen, handled, or requested by our web application.

#### B. Seclusion of Secrets
- `XIAOMI_CLIENT_SECRET` is stored strictly in server-side environment variables and is never transmitted, bundled, or exposed to the React frontend.
- OAuth authorization codes received in callback are immediately exchanged by the backend server and never saved in client browser storage (`localStorage` or `sessionStorage`).

#### C. Encryption at Rest (AES-256-GCM)
- OAuth `access_token` and `refresh_token` stored in the database are encrypted using authenticated **AES-256-GCM** (Galois/Counter Mode).
- A 96-bit unique Initialization Vector (IV) and 128-bit authentication tag are computed per record, ensuring confidentiality and integrity against tampering.

---

### 3. Log Sanitization & Zero-Token Policy

- The application implements automated log sanitization before writing to stdout or the `api_logs` audit table.
- All occurrences of:
  - `client_secret`
  - `access_token`
  - `refresh_token`
  - `code` (OAuth authorization code)
  are replaced with masked placeholders (e.g. `[MASKED_ACCESS_TOKEN]`).
- The "API Response Log" view on the web dashboard provides full audit transparency for capstone advisers while strictly preserving the Zero-Token guarantee.

---

### 4. Database Security

- **Parameterized Queries:** All database interactions across PostgreSQL, MySQL, and SQLite use prepared statements and parameterized inputs (`?` / `$1`) to eliminate SQL injection vulnerabilities.
- **Scope Restriction:** The database schema is strictly scoped to store only authorized telemetry: `com.xiaomi.heart_rate.delta` and `com.xiaomi.spo2.instantaneous`. Extraneous biometric metrics (GPS locations, sleep staging, steps) are not collected.

---

### 5. Prototype vs. Production Security Limitations

For the purpose of this university capstone prototype, the following limitations are documented:
1. **Local HTTPS:** In local development, the prototype runs over HTTP on `localhost:5000` / `localhost:5173`. In production, HTTPS with TLS 1.3 certificates must be enforced, and OAuth redirect URIs must use secure endpoints.
2. **Key Management:** The prototype loads the encryption key from `.env`. A production deployment should utilize a hardware security module (HSM) or cloud KMS (e.g., AWS KMS, HashiCorp Vault, Google Cloud KMS).
3. **Session Cookies:** The prototype uses REST endpoints and local state for demonstration. Production systems should enforce secure, `HttpOnly`, `SameSite=Strict` session cookies for user session management.
4. **Xiaomi Developer Enterprise Scope Approval:** Live access to sensitive biometric scopes (`com.xiaomi.heart_rate.delta` and `com.xiaomi.spo2.instantaneous`) requires an enterprise-verified Xiaomi developer account. When keys are pending enterprise review, the built-in capstone simulation fallback enables flawless demonstration of the exact data schemas and normalization pipeline.
