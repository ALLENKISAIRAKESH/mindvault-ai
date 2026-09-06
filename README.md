# 🧠 MindVault AI — Cognitive Operating System

> **Think privately. Understand deeply. Execute with clarity.**

MindVault AI is a state-of-the-art, privacy-first personal AI cognitive operating system and thinking companion powered by **Google Gemini 2.0 Flash**, **Firebase Authentication**, and **Google Cloud Firestore**.

Built for the **Google Cloud Run Gen AI Academy Challenge**.

---

## ✨ Full Capability Matrix

| Feature | Description |
|---|---|
| 🤖 **Gemini Multi-Turn Journaling** | Deep reflection space with auto-scrolling, optimistic UI, and token management |
| 🧠 **5 AI Thought Partner Personas** | Switch on the fly: *First-Principles*, *Socratic*, *Execution Coach*, *Devil's Advocate*, *Mindfulness* |
| 🎙️ **Real-Time Voice Journaling** | Web Speech API speech-to-text dictation with live audio waveforms |
| 🔊 **Gemini Audio Narration (TTS)** | High-fidelity speech synthesis engine reads reflections, briefs, and insights out loud |
| 🕸️ **Interactive Mind Graph** | HTML5 Canvas force-directed graph linking Sessions, Goals, Decisions, Actions, and Memories |
| 📋 **Action Execution Matrix** | Interactive Eisenhower / Kanban Board organizing tasks into Critical, Strategic, Quick Wins, and Done |
| 🌅 **Daily Cognitive Digest** | 1-click morning & evening executive audio synthesis of current trajectory and open loops |
| 🔥 **Autonomous Thought Sparks** | Contextual daily reflection prompts derived automatically from memories and past decisions |
| 🔐 **Zero-Knowledge Encryption Locker** | Client-side AES-256-GCM + PBKDF2 vault protection for ultra-confidential sessions |
| 🎯 **Structured Insight Engine** | Automatic extraction of Goals, Decisions, Action Queues, and Behavioral Patterns |
| 🗂️ **Private AI Memory Vault** | Categories, importance levels, active/inactive controls, and non-instructional prompt injection |
| 📄 **Executive Brief & Multi-Format Export** | Download Markdown (`.md`) or generate printable / formatted executive PDF reports |
| 🛡️ **Live Security Center** | 12 live security monitors, zero-trust token verification, and data isolation audit |

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│            MindVault React 19 Client (Vite)            │
│  Tailwind CSS • Canvas Mind Graph • Web Speech Engine  │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / Authorization: Bearer <ID_TOKEN>
                           ▼
┌────────────────────────────────────────────────────────┐
│         Express.js API Gateway on Node 20              │
│  Firebase Admin SDK Auth • Helmet CSP • Rate Limiting  │
└────────────┬─────────────────────────────┬─────────────┘
             │ Verified UID                │ Secret Manager / Gemini Key
             ▼                             ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│ Google Cloud Firestore   │  │ Google AI Studio Gemini  │
│ User Path-Level Scoping  │  │ Structured Insight Extr. │
│ users/{uid}/sessions/... │  │ Zod Runtime Validation   │
└──────────────────────────┘  └──────────────────────────┘
```

Single container deployment: Multi-stage Alpine Dockerfile serves both the Express API Gateway and the optimized React static build under an unprivileged `mindvault` user.

---

## 🔐 Security Architecture & Directives

| Layer | Implementation & Guarantee |
|---|---|
| **Zero-Trust Identity** | Cryptographically verified Firebase ID token on every API call |
| **Path-Level Data Scoping** | All Firestore reads/writes enforced under `/users/{verified_uid}/...` |
| **API Key Custody** | Stored server-side only in GCP Secret Manager (never exposed to client) |
| **Prompt Injection Armor** | Strict structural delimitation separating system prompt from untrusted memory context |
| **Runtime Zod Validation** | Strict schema validation on all inputs and AI JSON extraction outputs |
| **Client Zero-Knowledge Lock** | Optional AES-256-GCM browser encryption before network transmission |
| **Defense-in-Depth HTTP** | Helmet CSP headers, HSTS, CORS origin whitelisting, IP rate limiters |
| **Non-Root Container** | Unprivileged `mindvault` user (UID 1001) on Alpine Linux |

---

## 🚀 Quick Start (Local Development)

### 1. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Firebase web credentials and `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/).

### 2. Start Full-Stack Dev Server
```bash
npm run dev
```
* **Client**: `http://localhost:5173`
* **API Gateway**: `http://localhost:8080`

### 3. Run Automated Tests
```bash
npm test
```
* **27 / 27 unit & integration tests passing** (Schemas, Security Delimiters, Auth Rejections).

---

## ☁️ Google Cloud Run Deployment

Deploy with a single command:

**On Windows (PowerShell):**
```powershell
.\deploy.ps1 -ProjectId YOUR_GCP_PROJECT_ID
```

**On Linux / macOS / Google Cloud Shell:**
```bash
./deploy.sh YOUR_GCP_PROJECT_ID
```

---

## 📖 Complete Documentation Suite

- 🏛️ [**Architecture & Data Flow**](docs/architecture.md)
- 🎬 [**5-Minute Demo Script for Judges**](docs/demo-walkthrough.md)
- 🛡️ [**Threat Model & Mitigation Strategy**](docs/threat-model.md)
- 🔒 [**Security Architecture Documentation**](docs/security.md)
- ⚖️ [**AI Studio Security Constitution**](docs/ai-studio-security-constitution.md)
- 🧪 [**Cross-User Isolation Test Results**](docs/security-test-results.md)
- 📋 [**Build Status Document**](docs/BUILD_STATUS.md)
