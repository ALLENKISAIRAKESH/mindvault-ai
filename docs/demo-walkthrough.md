# MindVault AI — Demo & Presentation Script (5-Minute Walkthrough)

This guide provides a structured 5-minute walkthrough script for judges, reviewers, and video demonstrations.

---

## ⏱️ Step 1: Landing Page & Privacy Hook (Minute 0:00 - 1:00)
1. Navigate to the root URL (`http://localhost:5173` or your Cloud Run URL).
2. Highlight the core value proposition:
   - *"MindVault AI is not another ephemeral chat wrapper. It's a secure, privacy-first personal thinking space where your reflections become long-term personal intelligence."*
3. Showcase the 5-step interactive architecture flow on the Landing page:
   - **Private AI Journaling** ➔ **Automatic Summarization** ➔ **Structured Insight Extraction** ➔ **Private Knowledge System** ➔ **Data Privacy & Control**.

---

## ⏱️ Step 2: Authentication & Multi-Turn Journaling (Minute 1:00 - 2:30)
1. Click **Sign In** and authenticate using Google Sign-In or email/password.
2. In the **AI Journal**, create a new session named `Q4 Technical Strategy`.
3. Type a multi-turn message such as:
   > *"I'm designing our multi-region cloud architecture for 2026. We need zero downtime and strict data isolation across user tenants. What trade-offs should I consider between Firestore subcollections versus per-tenant databases?"*
4. Observe:
   - Fast response streaming from Gemini.
   - Conversation history persistence in user-isolated Firestore collection.

---

## ⏱️ Step 3: Automated Structured Insight Engine (Minute 2:30 - 3:30)
1. In the journal header, click **Extract Insights & Summarize**.
2. Navigate to the **Session Summary** view:
   - **Executive Summary**: High-level synopsis of architectural decisions.
   - **Goals**: Target metrics and launch milestones with status chips.
   - **Decisions**: Explicit choices with recorded rationale.
   - **Action Items**: Prioritized next steps (`high`, `medium`, `low`).
   - **Patterns**: Behavioral and architectural patterns detected by Gemini.
3. Switch to the **Insights** tab to demonstrate aggregated analytics across multiple sessions.

---

## ⏱️ Step 4: Private Memory System (Minute 3:30 - 4:15)
1. Go to the **Memory** page.
2. Add a new memory:
   - **Category**: `Preference`
   - **Importance**: `High`
   - **Content**: *"I prefer architecture proposals with detailed threat models and low operational maintenance."*
3. Return to the **Journal** and ask:
   > *"How should we handle disaster recovery for our database?"*
4. Note how Gemini tailors its advice to emphasize low maintenance and threat modeling without the user explicitly repeating their preference.

---

## ⏱️ Step 5: Live Security Center & Audit (Minute 4:15 - 5:00)
1. Navigate to **Security Center** (`/security`).
2. Demonstrate the live posture check:
   - **12 Live Security Controls** verified.
   - Path-level data scoping (`/users/{uid}/...`).
   - Token validation & zero-trust auth guard.
   - Non-root container & minimal attack surface.
3. Highlight that all user data can be exported or completely wiped in **Settings**.
