# 🚀 BOB Quick Installation Guide

This guide provides a streamlined path for initiating **New Projects** or continuing **Existing Projects** within the `/bob` AI Software Development Workflow Framework, from installation to the **User Acceptance Testing (UAT)** phase.

## 1. Prerequisites & Engine Setup

Ensure you have Node.js installed, then initialize the engine:

```bash
npm run bundle:install
```

## 2. Framework Initialization

Reset the framework to ensure a clean state, then start the orchestration:

```bash
# Reset state (only required once per migration)
cd engine

# Run orchestration
npm run start -- bob
```

OR

```bash
# prompt to AI
/bob

```

When prompted in the CLI or via `web-applications/bob/dashboard.md`, select your project type:

- **For Existing Projects:**
  - **Project Type**: `continue_project`
  - **Project Name**: `<Project Name>`

- **For New Projects:**
  - **Project Type**: `new_project`
  - **Project Name**: `<Project Name>`

## 3. Workflow Progression

### Project Initialization

#### For Existing Projects:

Put all the project folders into the `web-applications/` folder and run the following command:

```bash
# Run this after you put the project folder to web-applications/
# Index the repository -- this will help the ai to search around the codebase
npm run make:setup-index
npm run make:test
```

Then prompt the AI to continue the framework initialization:

```bash
# prompt to AI
/bob
```

#### For New Projects:

Simply prompt the AI to continue, and the Bob engine will guide you through generating the `vision.md`, `user_flow.md`, and technical architecture from scratch.

```bash
# prompt to AI
/bob
```

### Bug Tracking / Ticket Creation

Add bugs to the `## 🐛 UAT Bug Fixes` section in `web-applications/project-management/backlog.md`.

> [!TIP]
> Always check `framework/dashboard.md` for real-time status and specific human-in-the-loop requirements.
