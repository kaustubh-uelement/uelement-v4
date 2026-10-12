# Vyuh / Vyu PQC & CBOM Scanner — Agent Handoff Specification

## 1. Executive Summary
This document provides complete architectural, operational, and deployment specifications for the **Vyuh / Vyu Quantum Readiness & Cryptographic Bill of Materials (CBOM) Scanner**. 

* **Frontend**: Next.js App Router (Static Export `output: 'export'`) deployed on Cloudflare Pages (`/vyu` and `/vyuh`).
* **Backend**: Node.js 22 containerized microservice deployed on **Google Cloud Run**.
* **Current Deployment Mode**: **Manual CLI Deploy** (Frontend auto-deploys via Cloudflare Git integration; backend does NOT auto-deploy on git push unless Cloud Build triggers are configured).

---

## 2. Infrastructure & Live Endpoints

| Resource | Value / URI | Notes |
| :--- | :--- | :--- |
| **GCP Project ID** | `uelement-mainstay-deployment` | Hosting project for Cloud Run |
| **GCP Region** | `asia-south1` (Mumbai) | Microservice location |
| **Cloud Run Service** | `pqc-scanner` | Name of the active Cloud Run service |
| **Live Backend URL** | `https://pqc-scanner-445288556278.asia-south1.run.app` | Target for frontend API calls |
| **Health Endpoint** | `https://pqc-scanner-445288556278.asia-south1.run.app/health` | Returns `{"status":"ok","service":"vyuh-pqc-scanner"}` |
| **Production Frontend** | `https://uelement.in/vyu` & `https://uelement.co/vyu` | Canonical production route is `/vyu` |

---

## 3. Environment Variables & Secrets

### Backend (Google Cloud Run)
Set on the Cloud Run service container:
```env
PORT=8080
NODE_ENV=production
RESEND_API_KEY=re_YOUR_ACTUAL_KEY
RESEND_FROM_EMAIL="Vyuh Security <contact@uelement.in>"
```
* **`RESEND_API_KEY`**: Production API key from Resend (domain `uelement.in` verified in Cloudflare DNS).
* **`RESEND_FROM_EMAIL`**: Default outgoing email address for OTP verifications.

### Frontend (Next.js / Cloudflare Pages)
Configured in Cloudflare Pages environment variables / `.env`:
```env
NEXT_PUBLIC_SCANNER_API_URL="https://pqc-scanner-445288556278.asia-south1.run.app"
NEXT_PUBLIC_FORM_SUBMIT_EMAIL="kaustubh@uelement.in"
NEXT_PUBLIC_WEB3FORMS_KEY="5f0b55f8-1ed0-46cd-a518-c13ca9686c6f"
NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"
```

---

## 4. Backend Deployment Guide

### A. Manual Deployment (Current Active Method)
From the directory containing the scanner backend (`services/scanner/` or equivalent):

```bash
cd services/scanner

gcloud run deploy pqc-scanner \
  --source . \
  --region asia-south1 \
  --project uelement-mainstay-deployment \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 60s \
  --set-env-vars RESEND_FROM_EMAIL="Vyuh Security <contact@uelement.in>"
```
*(If `RESEND_API_KEY` is already set in Cloud Run revision settings, you do not need to pass it again; Cloud Run preserves existing secrets unless overwritten).*

### B. Setting Up Automatic Deployment (CI/CD via Git Push)
To configure GCP to auto-deploy whenever you push to GitHub:
1. Open **Google Cloud Console** &rarr; **Cloud Run** &rarr; select **`pqc-scanner`**.
2. Click **"SET UP CONTINUOUS DEPLOYMENT"** at the top.
3. Authenticate GitHub and select the new repository: **`uelement-site 2`**.
4. Configure Build:
   * **Branch**: `^main$`
   * **Build Type**: `Dockerfile`
   * **Source location**: Path to the `Dockerfile` in the repo (e.g. `services/scanner/Dockerfile` or `/Dockerfile`).
5. Save. Google Cloud Build will automatically build and deploy new revisions on every `git push`.

---

## 5. Backend API Endpoints & Contracts

### 1. `GET /health`
* **Response**: `200 OK`
* **Body**: `{"status": "ok", "service": "vyuh-pqc-scanner", "version": "0.1.0"}`

### 2. `POST /api/otp/send-email`
Dispatches a cryptographically secure 6-digit verification code to the corporate email.
* **Payload**: `{"email": "user@corporate.com", "name": "Jane Doe"}`
* **Response**: `200 OK`
  ```json
  {
    "success": true,
    "message": "Verification code sent to user@corporate.com",
    "expiresAt": 1789802695504
  }
  ```
* **Security & Limits**: 5-minute TTL, 30-second cooldown between resends, salted SHA-256 in-memory hash.

### 3. `POST /api/otp/verify-email`
Validates the user's submitted 6-digit code.
* **Payload**: `{"email": "user@corporate.com", "code": "123456"}`
* **Success**: `200 OK` &rarr; `{"success": true, "verified": true, "email": "..."}`
* **Failure**: `400 Bad Request` &rarr; `{"error": "Incorrect verification code. 4 attempts remaining.", "attemptsRemaining": 4}` (Locks out after 5 failures).

### 4. `POST /api/scan`
Executes real cryptographic inspection for website endpoints or GitHub repositories.
* **Payload**:
  ```json
  {
    "target": "https://google.com",
    "type": "url",
    "depth": "standard",
    "retention": 12,
    "token": "ghp_..." // optional: only needed for private GitHub repositories
  }
  ```
* **Output Schema**:
  ```typescript
  {
    target: string;
    type: "url" | "repo";
    when: string; // ISO date
    score: number; // 0–100 Quantum Readiness Score
    band: string; // e.g. "Hybrid Transitional (ML-KEM Active, Classical Auth)"
    stats: { total: number; broken: number; weak: number; safe: number };
    cbom: Array<{
      asset: string;
      primitive: string;
      purpose: string;
      verdict: "safe" | "weak" | "broken";
      replacement: string;
    }>;
    findings: Array<{
      sev: "critical" | "high" | "medium" | "low";
      title: string;
      detail: string;
      fix: string;
      std: string;
    }>;
    plan: Array<{ phase: string; title: string; desc: string }>;
  }
  ```

---

## 6. Frontend Stepper Flow & Business Logic (`VyuhScanner.tsx`)

1. **Step 1: Corporate Profile Gate**
   * Inputs: Full Name, Job Title, Company, Work Email (free mailboxes like `@gmail.com` rejected), Mobile Number, LinkedIn URL.
   * On Submit: Dispatches lead telemetry and triggers `/api/otp/send-email`.
2. **Step 2: Corporate Email Verification**
   * Prompts for the 6-digit OTP code sent from `Vyuh Security <contact@uelement.in>`.
   * Has an option to bypass for Public URL scans, but corporate email verification is **mandatory** for GitHub repository analysis.
3. **Step 3: Target Configuration**
   * Target input supports websites (`domain.com`, `https://...`) or GitHub repos (`owner/repo`, `https://github.com/owner/repo`).
   * Scan Depth: Standard, Deep, Single.
   * Data Retention Horizon: 5, 8, 12, 20 years.
   * **Mandatory authorization checkbox** (`targetConfig.authorized`).
4. **Step 4: Scan Progress Animation**
   * Simulates real-time multi-stage diagnostic progress (2.5s min elapsed time for natural UX).
5. **Step 5: Interactive Diagnostic Dashboard**
   * Post-quantum readiness score circle.
   * 4 tabs: Cryptographic BOM (CycloneDX 1.6), Quantum Threat Findings, NIST Migration Roadmap, Technical Details.
   * Actions: Export CycloneDX 1.6 JSON, Download Formal Assessment PDF (with lead capture gate).

---

## 7. Critical Gotchas & Bug Fix History (Must Keep)

1. **Repository Verification Gate**:
   * *Past Bug*: Step 3 previously checked `if (!verified.email || !verified.phone)`. Because phone verification is not active, this caused an infinite loop where repository scans were permanently blocked.
   * *Current Rule*: Keep the gate strictly checked to `if (!verified.email)`.
2. **GitHub URL Normalization**:
   * *Past Bug*: `handleStartScan` prepended `https://` to inputs, turning `owner/repo` into `https://owner/repo` which failed GitHub regex.
   * *Current Rule*: Check if input is `owner/repo` shorthand and resolve to `https://github.com/${target}`.
3. **Private GitHub Repositories**:
   * GitHub returns `404 Not Found` for private repos unless a Personal Access Token (PAT) is supplied. If scanning private enterprise repos, the PAT must be passed via the optional token input.
4. **Google Sheets Sync**:
   * Lead data is posted to `NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL` using `mode: 'no-cors'` with `text/plain;charset=utf-8` to avoid CORS preflight failures on Google Apps Script redirects.
