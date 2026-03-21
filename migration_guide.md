# Migration & Retrofit Guide: Three-Layer SDLC

This guide helps you adopt the **Three-Layer SDLC** (Ticket -> Epic -> PI) for existing projects or older framework versions.

---

## Scenario 1: Retrofitting an Existing Project

_You have a project in `web-applications/` that was built outside this framework._

### 1. The "Laws of the Land"

- **Step 1**: Analyze the codebase and create a `PRD.md` that reflects current reality.
- **Step 2**: Create `epic_backlogs.md` mapping existing features to Epics (e.g., Epic 0: Auth, Epic 1: Dashboard).
- **Step 3**: Document existing UI patterns in `project-management/design/`.

### 2. Establishing the Baseline

- **Step 4**: Run the **Epic Hardening Protocol** for each legacy epic.
  - _Why?_ This forces the creation of `threat_model.md` and `api_contract.md`, establishing a security baseline for legacy code.
- **Step 5**: Create **PI-0 Manifest**.
  - `start PI-0 with epics 0-X`
  - This marks the "known good" production state before any new framework-driven work begins.

---

## Scenario 2: Upgrading from Ticket-Only Workflow

_You have started projects with the framework but only used ad-hoc tickets._

### 1. Structural Realignment

- **Step 1**: Create the Epic folder structure (`web-applications/project-management/epics/[EPIC-NAME]/`).
- **Step 2**: Move existing ticket folders into their respective Epic containers.
- **Step 3**: Update links in `backlog.md` to reflect the new paths.

### 2. Metadata Catch-up

- **Step 4**: Ask the agent: _"Analyze existing tickets and generate `epic_metadata.json` for all new Epics."_
- **Step 5**: Perform a **Retroactive Gap Analysis**.
  - `Audit Epic [X] against PRD`
  - Identify if old tickets missed any "Must-Haves" requirements from your foundation docs.

### 3. Production Readiness

- **Step 6**: Initialize your first **Project Initiative (PI)**.
  - This groups your previously ad-hoc features into a formal release cycle with 100% coverage and Zero-Mock enforcement.

---

## Key Commands for Migration

| Goal                            | Command                                          |
| :------------------------------ | :----------------------------------------------- |
| **Audit Legacy Code**           | `Audit Epic [X] against PRD`                     |
| **Establish Security Baseline** | `Start the Epic Hardening protocol for Epic [X]` |
| **Initialize Baseline Release** | `start PI-0 with epics 0-X`                      |
| **Final Production Release**    | `Hardening Protocol for Project Initiative [X]`  |
