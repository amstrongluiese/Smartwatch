# Xiaomi HealthKit Cloud Integration Prototype
### Capstone Project: Third-Party Health Data Monitoring Web Application

A full-stack web application prototype demonstrating secure, authorized health data retrieval from a **Xiaomi Smart Band 9 Active** through official **Xiaomi OAuth 2.0** and **Xiaomi HealthKit Cloud APIs**.

---

## 🏛️ System Architecture

```
[ Xiaomi Smart Band 9 Active ]
              ↓ (Factory BLE sync)
[ Official Mi Fitness App ]
              ↓ (Encrypted Cloud Sync)
[ Xiaomi Cloud / HealthKit ]
              ↓ (OAuth 2.0 Authorization Code Flow)
[ Our Backend API (Node.js/Express) ]
              ↓ (AES-256 Encrypted Tokens & Normalized SQL)
[ Database (PostgreSQL / MySQL / SQLite) ]
              ↓ (Sanitized REST API)
[ Our Web Dashboard (React / Vite) ]
```

### 🔒 Non-Invasive Scope
- **NO Direct Bluetooth:** The web app does not connect directly to the Smart Band via Bluetooth.
- **NO Scraping / Modifying:** The private database and binaries of the Mi Fitness app are untouched.
- **Official Open Platform APIs Only:** Telemetry flows through Xiaomi's official OAuth authorization and HealthKit Cloud endpoints.
- **Primary Data Scope:**
  - ❤️ Heart Rate: `com.xiaomi.heart_rate.delta` (`bpm`)
  - 🫁 Blood Oxygen / SpO₂: `com.xiaomi.spo2.instantaneous` (`%`)

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, Vanilla CSS (Clinical Light Theme) |
| **Backend** | Node.js, Express, TypeScript (`tsx` watch mode) |
| **Database** | PostgreSQL or MySQL (with built-in zero-config SQLite local option) |
| **Security** | AES-256-GCM token encryption, server-side log sanitization |
| **Package Manager** | `npm` (Windows 11 / VS Code environment) |

---

## 🚀 Quick Start (Running Locally)

### 1. Prerequisites
- Node.js (v18+) and npm installed
- Windows 11 / macOS / Linux

### 2. Install Dependencies
Run the install command from the root directory:
```bash
# In c:\projects\SmartWatch
npm run install:all
```
*Or install separately:*
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
copy .env.example server\.env
```

Review and adjust `server/.env`:
```ini
PORT=5000
CLIENT_URL=http://localhost:5173

# Xiaomi Developer Platform Credentials
XIAOMI_CLIENT_ID=your_xiaomi_client_id
XIAOMI_CLIENT_SECRET=your_xiaomi_client_secret
XIAOMI_REDIRECT_URI=http://localhost:5000/api/xiaomi/callback
XIAOMI_API_BASE_URL=https://open-api.aiot.xiaomi.com

# Target Wearable
TARGET_DEVICE_NAME=Xiaomi Smart Band 9 Active
XIAOMI_HEALTH_SCOPES=com.xiaomi.heart_rate.delta.read com.xiaomi.spo2.instantaneous.read

# Database Dialect: 'sqlite' (default), 'postgres', or 'mysql'
DB_TYPE=sqlite
DB_FILE=./data/healthkit.sqlite

# AES-256 Token Encryption Key (64 hex characters)
ENCRYPTION_KEY=c3694f4a3e75e9b814a0f4886612d33451b689bc6a917a26f633e08c87ab42f1

# Capstone Simulation Mode (true for reliable defense presentation)
ENABLE_SIMULATION_FALLBACK=true
```

### 4. Start the Application
To run both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 🗄️ Database Configuration (PostgreSQL / MySQL / SQLite)

The database abstraction layer supports **PostgreSQL**, **MySQL**, and **SQLite** out of the box.

### Option A: SQLite (Default Zero-Configuration)
Set in `server/.env`:
```ini
DB_TYPE=sqlite
DB_FILE=./data/healthkit.sqlite
```
*Creates the database file and synchronized tables automatically with zero setup.*

### Option B: PostgreSQL
1. Create a database in PostgreSQL: `CREATE DATABASE xiaomi_healthkit;`
2. Update `server/.env`:
   ```ini
   DB_TYPE=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_NAME=xiaomi_healthkit
   ```
3. Schema file: `server/src/db/schema.postgres.sql`

### Option C: MySQL
1. Create a database in MySQL: `CREATE DATABASE xiaomi_healthkit;`
2. Update `server/.env`:
   ```ini
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=xiaomi_healthkit
   ```
3. Schema file: `server/src/db/schema.mysql.sql`

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/xiaomi/connect` | Initiates Xiaomi OAuth 2.0 authorization URL |
| `GET` | `/api/xiaomi/callback` | OAuth callback, exchanges code for access/refresh tokens |
| `GET` | `/api/xiaomi/status` | Returns connection status, active user, and device |
| `POST` | `/api/xiaomi/sync` | Requests & synchronizes health data through Xiaomi Cloud |
| `POST` | `/api/xiaomi/disconnect` | Revokes/clears stored tokens |
| `GET` | `/api/devices` | Returns connected wearable (Xiaomi Smart Band 9 Active) |
| `GET` | `/api/health/latest` | Returns latest Heart Rate and SpO₂ points |
| `GET` | `/api/health/history` | Returns historical readings with query filters |
| `GET` | `/api/logs` | Returns sanitized Xiaomi API response audit logs |
| `DELETE` | `/api/logs` | Clears recorded transaction logs |

---

## 🖥️ Web Dashboard Features

### 1. Health Monitor (Dashboard)
- **❤️ Heart Rate Card:** Displays latest pulse (e.g. `82 BPM`), clinical range status (Normal 60-100 BPM), pulse animation, and exact Xiaomi data type: `com.xiaomi.heart_rate.delta`.
- **🫁 SpO₂ Card:** Displays instantaneous blood oxygen saturation (e.g. `98 %`), clinical classification badge (≥95% Optimal), and Xiaomi data type: `com.xiaomi.spo2.instantaneous`.
- **Target Device Banner:** Shows **Xiaomi Smart Band 9 Active**, **Mi Fitness Cloud Sync (Cloud-to-Cloud)** pipeline, and timestamp.
- **Sync Now Button:** Triggers real-time synchronization from Xiaomi Cloud.

### 2. Data Monitor (Raw Ingestion View)
*Designed specifically for capstone research advisers and defense committees:*
- Displays the exact ingested table:
  `Timestamp` | `Data Type` | `Value` | `Unit` | `Source` | `Device` | `Status`
- Filterable by `com.xiaomi.heart_rate.delta` and `com.xiaomi.spo2.instantaneous`.
- **Inspect Modal:** Compares the raw incoming Xiaomi HealthKit JSON packet side-by-side with the normalized SQL database record.

### 3. API Response Log
- Displays sanitized HTTP transactions with Xiaomi Cloud:
  `Request Time` | `Endpoint` | `HTTP Status` | `Response Time` | `Data Type` | `Payload`
- Expandable JSON viewer with copy functionality.
- Confirms zero token exposure in frontend.

### 4. Architecture & Pipeline View
- Visual breakdown of the 6-stage telemetry journey from Smart Band 9 Active hardware to the web dashboard.
- Complete relational database ERD documentation.
- Non-invasive compliance notes.

---

## 🔐 Security & Capstone Defense Notes
Refer to [SECURITY_CAPSTONE.md](file:///c:/projects/SmartWatch/SECURITY_CAPSTONE.md) for full documentation on:
- RFC 6749 OAuth 2.0 authorization code flow
- AES-256-GCM token encryption at rest
- Server-side log sanitization and Zero-Token policy
- Scope isolation strictly limited to Heart Rate and SpO₂
