# CLAUDE.MD â€” MASTER ORCHESTRATION DOCUMENT
# Multi-Channel Deal & Relationship Management Platform (Frontend Prototype)

**Version:** 1.0
**Created:** April 2, 2026
**Last Updated:** 2026-04-03T00:10Z <!-- AGENTS: Update this timestamp every time you modify this document -->
**Status:** ACTIVE â€” AGENTS WORKING

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Agent Protocol â€” READ THIS FIRST](#2-agent-protocol--read-this-first)
3. [Project Setup Instructions](#3-project-setup-instructions)
4. [Architecture & Folder Structure](#4-architecture--folder-structure)
5. [Shared Foundations (Wave 0)](#5-shared-foundations-wave-0)
6. [Agent Roster & Assignments](#6-agent-roster--assignments)
7. [Master Task Registry](#7-master-task-registry)
8. [Document Cross-Reference Map](#8-document-cross-reference-map)
9. [Mock Data Contracts](#9-mock-data-contracts)
10. [Component Conventions & Standards](#10-component-conventions--standards)
11. [Agent Activity Log](#11-agent-activity-log)

---

## 1. PROJECT OVERVIEW

**What we are building:** A frontend-only prototype of a Multi-Channel Deal & Relationship Management Platform for a private credit startup. This firm connects borrowers (hotel developers, infrastructure companies, mining operations) with capital providers (banks, asset managers, family offices, life insurance companies). Their existing CRM (Zoho) cannot handle the two-sided, multi-threaded nature of their relationships.

**What we are NOT building:** No backend. No database. No real API calls. No authentication logic. No encryption. All data is mocked via static JSON fixture files. This is a UI/UX prototype to demonstrate the full feature set.

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.1 |
| Language | TypeScript | 5.x (latest) |
| UI Components | shadcn/ui | latest |
| Styling | Tailwind CSS | 4.x |
| Icons | Lucide React | latest |
| State (local) | React useState / useReducer | â€” |
| Mock Data | Static JSON fixture files | â€” |
| Package Manager | pnpm | latest |

### Scope

All 3 phases. All 10 epics. All infrastructure UI. All reporting dashboards. All notification UI. 81 total user stories translated to frontend screens and components.

**Source Documents (keep these in the project root alongside this file):**

- `feature-spec-breakdown.md` â€” Referred to as **SPEC** throughout this document. Contains epics, stories, acceptance criteria, edge cases, input validation rules, and dependency maps.
- `__TRANSCRIPT-TO-SOFTWARE_BLUEPRINT.txt` â€” Referred to as **BLUEPRINT** throughout this document. Contains problem context, user personas, workflows, data entities, integrations, and domain glossary.

---

## 2. AGENT PROTOCOL â€” READ THIS FIRST

Every AI agent working on this project MUST follow these rules. No exceptions.

### 2.1 Before You Start Any Work

1. **Read this entire section (Section 2) first.**
2. **Check the Agent Roster (Section 6)** â€” Find your agent name. Read your assignment. Understand what files you own.
3. **Check the Master Task Registry (Section 7)** â€” Find your tasks. Confirm nothing is already marked `[IN PROGRESS]`.
4. **Check the Agent Activity Log (Section 11)** â€” Read the last 5 entries to understand what other agents have done recently.
5. **Check the Document Cross-Reference Map (Section 8)** â€” For every task you are about to work on, look up where in SPEC and BLUEPRINT the detailed context lives. Go read those sections before writing any code.

### 2.2 Claiming Work

When you begin a task, immediately update the Master Task Registry:

```
BEFORE:  - [ ] E-001-S001: Create Borrower Record Form
AFTER:   - [ðŸ”µ] E-001-S001: Create Borrower Record Form <!-- CLAIMED: Agent-E001 | Started: 2026-04-02T14:30Z -->
```

Status markers:
- `[ ]` â€” Not started, available to claim
- `[ðŸ”µ]` â€” In progress (claimed by an agent)
- `[âœ…]` â€” Complete
- `[ðŸ”´]` â€” Blocked (add a note explaining why)
- `[ðŸŸ¡]` â€” Needs review / integration with another agent's work

### 2.3 Completing Work

When you finish a task:

1. **Update the Master Task Registry** â€” Mark it `[âœ…]` with completion timestamp.
2. **Add an entry to the Agent Activity Log (Section 11)** â€” State what you built, what files you created/modified, and any decisions you made.
3. **Check if your completed work unblocks another agent** â€” If so, update their blocked task from `[ðŸ”´]` to `[ ]` and add a note.
4. **Review your next task** â€” Check the cross-reference map, read the source docs, then proceed.

```
AFTER:   - [âœ…] E-001-S001: Create Borrower Record Form <!-- DONE: Agent-E001 | Completed: 2026-04-02T15:45Z -->
```

### 2.4 File Ownership Rules (CRITICAL â€” Prevents Merge Conflicts)

**Each agent owns specific directories. NEVER modify files outside your owned directories unless explicitly coordinated.**

- If you need a shared component that does not exist yet, **check if Agent-SHARED has built it or has it claimed**. If not, add a request to the Activity Log and either wait or build it within YOUR directory as a local component (it can be promoted to shared later).
- If you need to modify a shared type in `src/types/`, **add your changes to the Activity Log first** with the exact interface changes you need. Only Agent-FOUNDATION and Agent-SHARED may modify shared type files directly.
- The `src/mock-data/` directory is shared-read. All agents can import from it. Only Agent-FOUNDATION creates the initial fixtures. If you need additional mock data for your feature, create it in your feature's own `_fixtures/` subdirectory.

### 2.5 After Every Feature Completion â€” Mandatory Sync

After completing any feature (a group of related tasks), do ALL of the following:

1. Update this document (Master Task Registry + Activity Log).
2. Verify your pages render without errors when navigated to directly.
3. Verify your pages use the shared layout shell (sidebar + header).
4. Verify your TypeScript compiles with no errors (`pnpm tsc --noEmit`).
5. List any new routes you created so Agent-SHELL can add them to navigation if missing.

### 2.6 When You Are Stuck or Blocked

1. Mark the task `[ðŸ”´]` in the registry with a description of the blocker.
2. Add an Activity Log entry describing the problem.
3. If it is a cross-agent dependency, tag the blocking agent by name.
4. Move on to your next unblocked task.

### 2.7 Coding Tool Compatibility

This document is tool-agnostic. Whether you are running in Claude Code, Cursor, Windsurf, Copilot Workspace, or any other agent environment:

- Always read this file before starting work.
- Always write back to this file after completing work.
- This file is the single source of truth for project coordination.

---

## 3. PROJECT SETUP INSTRUCTIONS

Run these commands to scaffold the project. **Agent-FOUNDATION does this first. No other agent starts until this is complete.**

```bash
# 1. Create Next.js project
pnpx create-next-app@latest deal-platform \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm

cd deal-platform

# 2. Install shadcn/ui
pnpx shadcn@latest init

# When prompted:
#   Style: Default
#   Base color: Slate
#   CSS variables: Yes

# 3. Install required shadcn components
pnpx shadcn@latest add button card input label select textarea \
  dialog sheet dropdown-menu popover command separator \
  table tabs badge avatar tooltip scroll-area \
  checkbox switch form calendar date-picker \
  alert alert-dialog toast sonner progress skeleton \
  breadcrumb sidebar navigation-menu collapsible \
  toggle-group radio-group slider

# 4. Install additional dependencies
pnpm add lucide-react date-fns zod @hookform/resolvers react-hook-form
pnpm add -D @types/node

# 5. Create the folder structure (see Section 4)
mkdir -p src/types
mkdir -p src/mock-data
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/components/shared
mkdir -p src/components/layout
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(auth\)/register
mkdir -p src/app/\(dashboard\)
mkdir -p src/app/\(dashboard\)/borrowers/\[id\]
mkdir -p src/app/\(dashboard\)/capital-providers/\[id\]
mkdir -p src/app/\(dashboard\)/deals/\[id\]/execution
mkdir -p src/app/\(dashboard\)/deals/pipeline
mkdir -p src/app/\(dashboard\)/vendors/\[id\]
mkdir -p src/app/\(dashboard\)/emails
mkdir -p src/app/\(dashboard\)/documents
mkdir -p src/app/\(dashboard\)/settings/integrations
mkdir -p src/app/\(dashboard\)/settings/templates
mkdir -p src/app/\(dashboard\)/settings/users
mkdir -p src/app/\(dashboard\)/analytics
mkdir -p src/app/\(dashboard\)/notifications
```

### Post-Setup Verification

Agent-FOUNDATION must confirm all of the following before marking setup complete:

- [ ] `pnpm dev` runs without errors
- [ ] The app loads at `localhost:3000`
- [ ] shadcn/ui components render (test with a Button)
- [ ] TypeScript compiles with `pnpm tsc --noEmit`
- [ ] Folder structure matches Section 4

---

## 4. ARCHITECTURE & FOLDER STRUCTURE

```
deal-platform/
â”œâ”€â”€ claude.md                          â† THIS FILE (project root)
â”œâ”€â”€ feature-spec-breakdown.md          â† SPEC document (project root)
â”œâ”€â”€ __TRANSCRIPT-TO-SOFTWARE_BLUEPRINT.txt â† BLUEPRINT document (project root)
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ types/                         â† SHARED TypeScript interfaces (owned by Agent-FOUNDATION)
â”‚   â”‚   â”œâ”€â”€ borrower.ts
â”‚   â”‚   â”œâ”€â”€ capital-provider.ts
â”‚   â”‚   â”œâ”€â”€ deal.ts
â”‚   â”‚   â”œâ”€â”€ credit-facility.ts
â”‚   â”‚   â”œâ”€â”€ engagement-thread.ts
â”‚   â”‚   â”œâ”€â”€ task.ts
â”‚   â”‚   â”œâ”€â”€ vendor.ts
â”‚   â”‚   â”œâ”€â”€ communication.ts
â”‚   â”‚   â”œâ”€â”€ user.ts
â”‚   â”‚   â”œâ”€â”€ notification.ts
â”‚   â”‚   â”œâ”€â”€ process-template.ts
â”‚   â”‚   â”œâ”€â”€ audit-log.ts
â”‚   â”‚   â””â”€â”€ index.ts                   â† Re-exports all types
â”‚   â”‚
â”‚   â”œâ”€â”€ mock-data/                     â† SHARED mock JSON fixtures (owned by Agent-FOUNDATION)
â”‚   â”‚   â”œâ”€â”€ borrowers.ts
â”‚   â”‚   â”œâ”€â”€ capital-providers.ts
â”‚   â”‚   â”œâ”€â”€ deals.ts
â”‚   â”‚   â”œâ”€â”€ credit-facilities.ts
â”‚   â”‚   â”œâ”€â”€ engagement-threads.ts
â”‚   â”‚   â”œâ”€â”€ tasks.ts
â”‚   â”‚   â”œâ”€â”€ vendors.ts
â”‚   â”‚   â”œâ”€â”€ communications.ts
â”‚   â”‚   â”œâ”€â”€ users.ts
â”‚   â”‚   â”œâ”€â”€ notifications.ts
â”‚   â”‚   â”œâ”€â”€ process-templates.ts
â”‚   â”‚   â”œâ”€â”€ audit-logs.ts
â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ lib/                           â† Utility functions (owned by Agent-FOUNDATION + Agent-SHARED)
â”‚   â”‚   â”œâ”€â”€ utils.ts                   â† cn() helper, formatCurrency, formatDate, etc.
â”‚   â”‚   â”œâ”€â”€ constants.ts               â† Pipeline stages, status enums, role definitions
â”‚   â”‚   â””â”€â”€ mock-helpers.ts            â† Functions to query/filter/sort mock data
â”‚   â”‚
â”‚   â”œâ”€â”€ hooks/                         â† Custom React hooks (owned by Agent-SHARED)
â”‚   â”‚   â”œâ”€â”€ use-mock-data.ts           â† Hook to simulate async data loading
â”‚   â”‚   â”œâ”€â”€ use-pagination.ts
â”‚   â”‚   â”œâ”€â”€ use-search.ts
â”‚   â”‚   â””â”€â”€ use-toast-notifications.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ layout/                    â† App shell (owned by Agent-SHELL)
â”‚   â”‚   â”‚   â”œâ”€â”€ app-sidebar.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ header.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ breadcrumbs.tsx
â”‚   â”‚   â”‚   â””â”€â”€ user-nav.tsx
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ shared/                    â† Reusable components (owned by Agent-SHARED)
â”‚   â”‚       â”œâ”€â”€ data-table.tsx         â† Generic sortable/filterable table
â”‚   â”‚       â”œâ”€â”€ entity-form.tsx        â† Generic create/edit form wrapper
â”‚   â”‚       â”œâ”€â”€ status-badge.tsx       â† Colored badges for statuses
â”‚   â”‚       â”œâ”€â”€ pipeline-stage.tsx     â† Pipeline stage indicator/selector
â”‚   â”‚       â”œâ”€â”€ timeline.tsx           â† Chronological event feed
â”‚   â”‚       â”œâ”€â”€ progress-bar.tsx       â† Color-coded progress indicator
â”‚   â”‚       â”œâ”€â”€ search-filter-bar.tsx  â† Search + filter controls
â”‚   â”‚       â”œâ”€â”€ empty-state.tsx        â† "No results" / "Get started" states
â”‚   â”‚       â”œâ”€â”€ confirm-dialog.tsx     â† Confirmation modal wrapper
â”‚   â”‚       â”œâ”€â”€ stat-card.tsx          â† Dashboard metric card
â”‚   â”‚       â”œâ”€â”€ page-header.tsx        â† Page title + action buttons
â”‚   â”‚       â””â”€â”€ loading-skeleton.tsx   â† Loading placeholder
â”‚   â”‚
â”‚   â””â”€â”€ app/
â”‚       â”œâ”€â”€ layout.tsx                 â† Root layout
â”‚       â”œâ”€â”€ page.tsx                   â† Redirect to /dashboard or /login
â”‚       â”‚
â”‚       â”œâ”€â”€ (auth)/                    â† Auth pages (owned by Agent-AUTH)
â”‚       â”‚   â”œâ”€â”€ layout.tsx             â† Centered auth layout (no sidebar)
â”‚       â”‚   â”œâ”€â”€ login/page.tsx
â”‚       â”‚   â””â”€â”€ register/page.tsx
â”‚       â”‚
â”‚       â””â”€â”€ (dashboard)/               â† All authenticated pages
â”‚           â”œâ”€â”€ layout.tsx             â† Dashboard layout with sidebar (owned by Agent-SHELL)
â”‚           â”œâ”€â”€ page.tsx               â† Main dashboard (owned by Agent-DASH)
â”‚           â”‚
â”‚           â”œâ”€â”€ borrowers/             â† (owned by Agent-E001)
â”‚           â”‚   â”œâ”€â”€ page.tsx           â† List view with search/filter
â”‚           â”‚   â”œâ”€â”€ new/page.tsx       â† Create borrower form
â”‚           â”‚   â””â”€â”€ [id]/
â”‚           â”‚       â””â”€â”€ page.tsx       â† Borrower profile (view/edit)
â”‚           â”‚
â”‚           â”œâ”€â”€ capital-providers/     â† (owned by Agent-E001, threads by Agent-E002, classification by Agent-E003)
â”‚           â”‚   â”œâ”€â”€ page.tsx           â† List view with search/filter
â”‚           â”‚   â”œâ”€â”€ new/page.tsx       â† Create capital provider form
â”‚           â”‚   â””â”€â”€ [id]/
â”‚           â”‚       â”œâ”€â”€ page.tsx       â† CP profile (view/edit)
â”‚           â”‚       â”œâ”€â”€ threads/       â† Engagement threads (Agent-E002)
â”‚           â”‚       â”‚   â””â”€â”€ [threadId]/page.tsx
â”‚           â”‚       â”œâ”€â”€ facilities/    â† Credit facilities (Agent-E003)
â”‚           â”‚       â”‚   â””â”€â”€ [facilityId]/page.tsx
â”‚           â”‚       â””â”€â”€ timeline/page.tsx â† Unified timeline (Agent-E002)
â”‚           â”‚
â”‚           â”œâ”€â”€ deals/                 â† (owned by Agent-E004, execution by Agent-E005)
â”‚           â”‚   â”œâ”€â”€ page.tsx           â† Deal list view
â”‚           â”‚   â”œâ”€â”€ new/page.tsx       â† Create deal form
â”‚           â”‚   â”œâ”€â”€ pipeline/page.tsx  â† Visual pipeline dashboard
â”‚           â”‚   â””â”€â”€ [id]/
â”‚           â”‚       â”œâ”€â”€ page.tsx       â† Deal detail view
â”‚           â”‚       â””â”€â”€ execution/
â”‚           â”‚           â””â”€â”€ page.tsx   â† Execution workspace (Agent-E005)
â”‚           â”‚
â”‚           â”œâ”€â”€ vendors/               â† (owned by Agent-E005)
â”‚           â”‚   â”œâ”€â”€ page.tsx           â† Vendor list
â”‚           â”‚   â””â”€â”€ [id]/page.tsx      â† Vendor profile
â”‚           â”‚
â”‚           â”œâ”€â”€ emails/                â† (owned by Agent-E006)
â”‚           â”‚   â”œâ”€â”€ page.tsx           â† Recent emails queue
â”‚           â”‚   â””â”€â”€ link/page.tsx      â† Email association view
â”‚           â”‚
â”‚           â”œâ”€â”€ documents/             â† (owned by Agent-E007)
â”‚           â”‚   â””â”€â”€ page.tsx           â† Document hub
â”‚           â”‚
â”‚           â”œâ”€â”€ follow-ups/            â† (owned by Agent-E008)
â”‚           â”‚   â”œâ”€â”€ page.tsx           â† Approval queue
â”‚           â”‚   â””â”€â”€ sequences/page.tsx â† Active sequences
â”‚           â”‚
â”‚           â”œâ”€â”€ analytics/             â† (owned by Agent-DASH)
â”‚           â”‚   â”œâ”€â”€ page.tsx           â† Analytics hub
â”‚           â”‚   â”œâ”€â”€ pipeline/page.tsx  â† RPT-001: Pipeline dashboard
â”‚           â”‚   â”œâ”€â”€ relationships/page.tsx â† RPT-002: CP relationship summary
â”‚           â”‚   â”œâ”€â”€ execution/page.tsx â† RPT-003: Execution tracker
â”‚           â”‚   â””â”€â”€ follow-ups/page.tsx â† E-008-S005: Follow-up reporting
â”‚           â”‚
â”‚           â”œâ”€â”€ notifications/         â† (owned by Agent-NOTIF)
â”‚           â”‚   â””â”€â”€ page.tsx           â† Notification center
â”‚           â”‚
â”‚           â””â”€â”€ settings/              â† (owned by Agent-SETTINGS)
â”‚               â”œâ”€â”€ page.tsx           â† Settings overview
â”‚               â”œâ”€â”€ integrations/
â”‚               â”‚   â”œâ”€â”€ page.tsx       â† Integration hub
â”‚               â”‚   â”œâ”€â”€ email/page.tsx â† E-006-S001: Email provider setup
â”‚               â”‚   â””â”€â”€ zoho/page.tsx  â† E-009: Zoho connection
â”‚               â”œâ”€â”€ templates/
â”‚               â”‚   â”œâ”€â”€ page.tsx       â† E-010: Template list
â”‚               â”‚   â””â”€â”€ [id]/page.tsx  â† Template builder/editor
â”‚               â””â”€â”€ users/
â”‚                   â””â”€â”€ page.tsx       â† User management (RBAC)
```

### Route Group Explanation

- `(auth)` â€” Pages without the dashboard sidebar (login, register). Uses a centered layout.
- `(dashboard)` â€” All pages with the sidebar navigation. Uses the dashboard layout with AppSidebar + Header.

---

## 5. SHARED FOUNDATIONS (Wave 0)

**These must be completed by Agent-FOUNDATION and Agent-SHELL before any feature agents begin work.** Other agents: do NOT start until Wave 0 items below are all marked `[âœ…]`.

### Wave 0 Checklist

- [âœ…] Project scaffolded per Section 3 <!-- DONE: Agent-FOUNDATION | 2026-04-02T14:00Z -->
- [âœ…] All TypeScript interfaces created in `src/types/` (see Section 9 for schemas) <!-- DONE: Agent-FOUNDATION | 2026-04-02T14:05Z -->
- [âœ…] All mock data fixtures created in `src/mock-data/` (see Section 9) <!-- DONE: Agent-FOUNDATION | 2026-04-02T14:20Z -->
- [âœ…] `src/lib/constants.ts` created with all enums and pipeline stages <!-- DONE: Agent-FOUNDATION | 2026-04-02T14:08Z -->
- [âœ…] `src/lib/utils.ts` created with cn(), formatCurrency(), formatDate(), getInitials() <!-- DONE: Agent-FOUNDATION | 2026-04-02T14:08Z -->
- [âœ…] `src/lib/mock-helpers.ts` created with getById(), filterBy(), searchByName(), paginate(), sortBy() <!-- DONE: Agent-FOUNDATION | 2026-04-02T14:08Z -->
- [âœ…] `src/hooks/use-mock-data.ts` created (simulates 300ms loading delay + returns data) <!-- DONE: Agent-FOUNDATION | 2026-04-02T14:06Z -->
- [âœ…] `src/hooks/use-pagination.ts` created <!-- DONE: Agent-FOUNDATION | 2026-04-02T14:06Z -->
- [âœ…] `src/hooks/use-search.ts` created <!-- DONE: Agent-FOUNDATION | 2026-04-02T14:06Z -->
- [âœ…] Dashboard layout with AppSidebar rendered at `(dashboard)/layout.tsx` <!-- DONE: Agent-SHELL | 2026-04-02T16:00Z -->
- [âœ…] Auth layout (no sidebar, centered card) rendered at `(auth)/layout.tsx` <!-- DONE: Agent-SHELL | 2026-04-02T16:00Z -->
- [âœ…] Navigation links in sidebar match: Dashboard, Borrowers, Capital Providers, Deals, Vendors, Emails, Documents, Follow-Ups, Analytics, Notifications, Settings <!-- DONE: Agent-SHELL | 2026-04-02T16:00Z -->
- [âœ…] Active nav item highlighting works based on current route <!-- DONE: Agent-SHELL | 2026-04-02T16:00Z -->
- [âœ…] Breadcrumb component renders on all dashboard pages <!-- DONE: Agent-SHELL | 2026-04-02T16:00Z -->
- [âœ…] Global loading skeleton component exists <!-- DONE: Agent-SHARED | 2026-04-02T15:00Z -->
- [âœ…] Empty state component exists <!-- DONE: Agent-SHARED | 2026-04-02T15:00Z -->
- [âœ…] `pnpm dev` runs clean, no errors <!-- DONE: Agent-SHELL | 2026-04-02T16:00Z -->

**Wave 0 complete signal:** Agent-FOUNDATION adds an Activity Log entry: `"WAVE 0 COMPLETE â€” All feature agents may begin work."` All feature agents must see this entry before starting.

---

## 6. AGENT ROSTER & ASSIGNMENTS

### Agent-FOUNDATION
**Role:** Project scaffolding, TypeScript types, mock data, utility functions
**Owns:** `src/types/*`, `src/mock-data/*`, `src/lib/*`, `src/hooks/*`
**Wave:** 0 (must finish first)
**Tasks:** Setup checklist + all type/mock/util tasks in Section 7

### Agent-SHELL
**Role:** App layout, navigation, sidebar, header, breadcrumbs, routing wrappers, error boundaries
**Owns:** `src/components/layout/*`, `src/app/layout.tsx`, `src/app/(dashboard)/layout.tsx`, `src/app/(auth)/layout.tsx`, `src/app/page.tsx`, `src/app/not-found.tsx`
**Wave:** 0 (must finish first, can work parallel with Agent-FOUNDATION)
**Tasks:** Layout/shell tasks in Section 7

### Agent-SHARED
**Role:** Reusable UI components used across multiple features
**Owns:** `src/components/shared/*`
**Wave:** 0.5 (can start once types exist, should complete before Wave 1 agents need them â€” but Wave 1 agents can start pages that don't depend on shared components)
**Tasks:** Shared component tasks in Section 7

### Agent-AUTH
**Role:** Login page, registration page, user settings (RBAC display)
**Owns:** `src/app/(auth)/*`, `src/app/(dashboard)/settings/users/*`
**Wave:** 1
**Tasks:** Auth + RBAC UI tasks in Section 7

### Agent-E001
**Role:** Borrower and Capital Provider CRUD â€” create, list, view/edit, archive
**Owns:** `src/app/(dashboard)/borrowers/*`, `src/app/(dashboard)/capital-providers/page.tsx`, `src/app/(dashboard)/capital-providers/new/*`, `src/app/(dashboard)/capital-providers/[id]/page.tsx`
**Wave:** 1
**Builds screens for:** SPEC Epic E-001 (all 6 stories)
**Key context:** Read SPEC lines 232-417, BLUEPRINT Section 4 F-001

### Agent-E002
**Role:** Engagement threads on Capital Provider profiles â€” create thread, view/update, unified timeline, thread filtering
**Owns:** `src/app/(dashboard)/capital-providers/[id]/threads/*`, `src/app/(dashboard)/capital-providers/[id]/timeline/*`
**Wave:** 1 (can start immediately â€” builds self-contained components; integration with CP profile page happens in Wave 2)
**Builds screens for:** SPEC Epic E-002 (all 5 stories)
**Key context:** Read SPEC lines 420-540, BLUEPRINT Section 4 F-002

### Agent-E003
**Role:** Capital Provider type classification + credit facility CRUD + utilization tracking
**Owns:** `src/app/(dashboard)/capital-providers/[id]/facilities/*`
**Wave:** 1 (can start immediately â€” credit facility pages are self-contained)
**Builds screens for:** SPEC Epic E-003 (all 4 stories)
**Key context:** Read SPEC lines 542-682, BLUEPRINT Section 4 F-003, BLUEPRINT Section 8 "Data Entity 4: Credit Facility"

### Agent-E004
**Role:** Deal CRUD, pipeline stage management, pipeline dashboard, linking capital providers to deals
**Owns:** `src/app/(dashboard)/deals/*` (except execution subfolder)
**Wave:** 1
**Builds screens for:** SPEC Epic E-004 (all 6 stories)
**Key context:** Read SPEC lines 686-850, BLUEPRINT Section 4 F-004, BLUEPRINT Section 6 Workflow 1

### Agent-E005
**Role:** Deal execution workspace â€” task checklist, task CRUD, overdue flagging, progress indicator, deal termination, vendor management
**Owns:** `src/app/(dashboard)/deals/[id]/execution/*`, `src/app/(dashboard)/vendors/*`
**Wave:** 1 (execution workspace is a self-contained page; can build without deal detail being finished)
**Builds screens for:** SPEC Epic E-005 (all 7 stories)
**Key context:** Read SPEC lines 852-1065, BLUEPRINT Section 4 F-005, BLUEPRINT Section 6 Workflow 2

### Agent-E006
**Role:** Email integration UI â€” provider setup, email queue, manual/auto association, conversation timeline
**Owns:** `src/app/(dashboard)/emails/*`, `src/app/(dashboard)/settings/integrations/email/*`
**Wave:** 1
**Builds screens for:** SPEC Epic E-006 (all 6 stories)
**Key context:** Read SPEC lines 1068-1260, BLUEPRINT Section 4 F-006, BLUEPRINT Section 7 Integration 2

### Agent-E007
**Role:** Document hub â€” upload, organize, search, per-entity and per-deal views
**Owns:** `src/app/(dashboard)/documents/*`
**Wave:** 1
**Builds screens for:** SPEC Epic E-007 (all 5 stories)
**Key context:** Read BLUEPRINT Section 4 F-007

### Agent-E008
**Role:** AI follow-up automation UI â€” sequence setup, AI message preview, approval queue, opt-out, reporting
**Owns:** `src/app/(dashboard)/follow-ups/*`
**Wave:** 1
**Builds screens for:** SPEC Epic E-008 (all 5 stories)
**Key context:** Read SPEC lines 1395-1527, BLUEPRINT Section 4 F-008

### Agent-E009-E010
**Role:** Zoho integration settings UI + Process template builder UI
**Owns:** `src/app/(dashboard)/settings/integrations/zoho/*`, `src/app/(dashboard)/settings/templates/*`
**Wave:** 1
**Builds screens for:** SPEC Epic E-009 (all 5 stories) + SPEC Epic E-010 (all 4 stories)
**Key context:** Read SPEC lines 1531-1781, BLUEPRINT Section 4 F-009/F-010, BLUEPRINT Section 7 Integration 1

### Agent-DASH
**Role:** Main dashboard homepage + analytics/reporting pages
**Owns:** `src/app/(dashboard)/page.tsx`, `src/app/(dashboard)/analytics/*`
**Wave:** 2 (benefits from feature pages existing for drill-down links, but can start metric cards early)
**Builds screens for:** SPEC RPT-001, RPT-002, RPT-003, E-004-S004 (pipeline dashboard), E-008-S005 (follow-up reporting)
**Key context:** Read SPEC lines 790-850 (pipeline dashboard), SPEC lines 1915-1988 (reporting stories), BLUEPRINT Section 11

### Agent-NOTIF
**Role:** Notification center page + notification toast/bell components
**Owns:** `src/app/(dashboard)/notifications/*`, notification-related components in `src/components/shared/notification-*`
**Wave:** 2
**Builds screens for:** SPEC NOTIF-001 through NOTIF-004
**Key context:** Read SPEC lines 1833-1911, BLUEPRINT Section 10

### Agent-INTEGRATION
**Role:** Integration wave â€” wires together cross-agent touchpoints (embeds thread list into CP profile, embeds facility section into CP profile, embeds execution tab into deal detail, adds email timeline to entity profiles, connects dashboard drill-downs to feature pages)
**Wave:** 3 (after all feature agents complete)
**Owns:** May modify files across agent boundaries WITH documentation in the Activity Log
**Tasks:** Integration checklist in Section 7

---

## 7. MASTER TASK REGISTRY

### Legend
- `[ ]` Not started
- `[ðŸ”µ]` In progress
- `[âœ…]` Complete
- `[ðŸ”´]` Blocked
- `[ðŸŸ¡]` Needs review/integration

---

### WAVE 0 â€” FOUNDATION (Agent-FOUNDATION + Agent-SHELL + Agent-SHARED)

#### Agent-FOUNDATION Tasks
- [âœ…] FND-001: Scaffold Next.js project per Section 3 <!-- DONE: Agent-FOUNDATION | Completed: 2026-04-02T14:00Z -->
- [âœ…] FND-002: Create all TypeScript interfaces in `src/types/` (see Section 9) <!-- DONE: Agent-FOUNDATION | Completed: 2026-04-02T14:05Z -->
- [âœ…] FND-003: Create all mock data fixtures in `src/mock-data/` (see Section 9) <!-- DONE: Agent-FOUNDATION | Completed: 2026-04-02T14:20Z -->
- [âœ…] FND-004: Create `src/lib/constants.ts` â€” pipeline stages, status enums, role definitions, CP types <!-- DONE: Agent-FOUNDATION | Completed: 2026-04-02T14:08Z -->
- [âœ…] FND-005: Create `src/lib/utils.ts` â€” cn(), formatCurrency(), formatDate(), formatRelativeDate(), getInitials(), generateId() <!-- DONE: Agent-FOUNDATION | Completed: 2026-04-02T14:08Z -->
- [âœ…] FND-006: Create `src/lib/mock-helpers.ts` â€” getById(), filterBy(), searchByName(), paginate(), sortBy() <!-- DONE: Agent-FOUNDATION | Completed: 2026-04-02T14:08Z -->
- [âœ…] FND-007: Create `src/hooks/use-mock-data.ts` â€” simulates 300ms loading + returns typed data <!-- DONE: Agent-FOUNDATION | Completed: 2026-04-02T14:06Z -->
- [âœ…] FND-008: Create `src/hooks/use-pagination.ts` â€” page/perPage/total state management <!-- DONE: Agent-FOUNDATION | Completed: 2026-04-02T14:06Z -->
- [âœ…] FND-009: Create `src/hooks/use-search.ts` â€” debounced search term state <!-- DONE: Agent-FOUNDATION | Completed: 2026-04-02T14:06Z -->
- [âœ…] FND-010: Verify entire foundation compiles (`pnpm tsc --noEmit`) <!-- DONE: Agent-FOUNDATION | Completed: 2026-04-02T14:25Z -->

#### Agent-SHELL Tasks
- [âœ…] SHL-001: Create root `src/app/layout.tsx` with font loading, metadata, Toaster provider <!-- DONE: Agent-SHELL | Completed: 2026-04-02T16:00Z -->
- [âœ…] SHL-002: Create `src/app/(auth)/layout.tsx` â€” centered card layout, no sidebar <!-- DONE: Agent-SHELL | Completed: 2026-04-02T16:00Z -->
- [âœ…] SHL-003: Create `src/app/(dashboard)/layout.tsx` â€” SidebarProvider + AppSidebar + Header + main content area <!-- DONE: Agent-SHELL | Completed: 2026-04-02T16:00Z -->
- [âœ…] SHL-004: Create `src/components/layout/app-sidebar.tsx` â€” full navigation with icons, collapsible groups, active state <!-- DONE: Agent-SHELL | Completed: 2026-04-02T16:00Z -->
- [âœ…] SHL-005: Create `src/components/layout/header.tsx` â€” breadcrumbs, search, notification bell, user avatar dropdown <!-- DONE: Agent-SHELL | Completed: 2026-04-02T16:00Z -->
- [âœ…] SHL-006: Create `src/components/layout/breadcrumbs.tsx` â€” auto-generates from route path <!-- DONE: Agent-SHELL | Completed: 2026-04-02T16:00Z -->
- [âœ…] SHL-007: Create `src/components/layout/user-nav.tsx` â€” avatar, name, role, settings link, logout <!-- DONE: Agent-SHELL | Completed: 2026-04-02T16:00Z -->
- [âœ…] SHL-008: Create `src/app/page.tsx` â€” redirect to `/borrowers` (or dashboard when ready) <!-- DONE: Agent-SHELL | Completed: 2026-04-02T16:00Z -->
- [âœ…] SHL-009: Create `src/app/not-found.tsx` â€” 404 page with link back to dashboard <!-- DONE: Agent-SHELL | Completed: 2026-04-02T16:00Z -->
- [âœ…] SHL-010: Create global error boundary component <!-- DONE: Agent-SHELL | Completed: 2026-04-02T16:00Z -->

#### Agent-SHARED Tasks
- [âœ…] SHR-001: Create `data-table.tsx` â€” generic table with column definitions, sorting, row click handler <!-- DONE: Agent-SHARED | Completed: 2026-04-02T15:00Z -->
- [âœ…] SHR-002: Create `entity-form.tsx` â€” form wrapper using react-hook-form + zod, handles edit/create mode <!-- DONE: Agent-SHARED | Completed: 2026-04-02T15:00Z -->
- [âœ…] SHR-003: Create `status-badge.tsx` â€” colored Badge for pipeline stages, task statuses, thread statuses <!-- DONE: Agent-SHARED | Completed: 2026-04-02T15:00Z -->
- [âœ…] SHR-004: Create `pipeline-stage.tsx` â€” horizontal stage indicator with clickable stages <!-- DONE: Agent-SHARED | Completed: 2026-04-02T15:00Z -->
- [âœ…] SHR-005: Create `timeline.tsx` â€” vertical chronological feed with type icons, filtering <!-- DONE: Agent-SHARED | Completed: 2026-04-02T15:00Z -->
- [âœ…] SHR-006: Create `progress-bar.tsx` â€” percentage bar with green/amber/red color logic <!-- DONE: Agent-SHARED | Completed: 2026-04-02T15:00Z -->
- [âœ…] SHR-007: Create `search-filter-bar.tsx` â€” search input + filter dropdowns composable <!-- DONE: Agent-SHARED | Completed: 2026-04-02T15:00Z -->
- [âœ…] SHR-008: Create `empty-state.tsx` â€” icon + message + optional CTA button <!-- DONE: Agent-SHARED | Completed: 2026-04-02T15:00Z -->
- [âœ…] SHR-009: Create `confirm-dialog.tsx` â€” AlertDialog wrapper with title, description, confirm/cancel <!-- DONE: Agent-SHARED | Completed: 2026-04-02T15:00Z -->
- [âœ…] SHR-010: Create `stat-card.tsx` â€” metric label + value + optional trend indicator <!-- DONE: Agent-SHARED | Completed: 2026-04-02T15:00Z -->
- [âœ…] SHR-011: Create `page-header.tsx` â€” title + description + action buttons row <!-- DONE: Agent-SHARED | Completed: 2026-04-02T15:00Z -->
- [âœ…] SHR-012: Create `loading-skeleton.tsx` â€” configurable skeleton layouts (table, card, form) <!-- DONE: Agent-SHARED | Completed: 2026-04-02T15:00Z -->

---

### WAVE 1 â€” ALL FEATURE AGENTS (Parallel â€” Start after Wave 0 is complete)

#### Agent-AUTH Tasks
- [âœ…] AUTH-001: Create login page with email/password form + "Forgot password" link + mock validation
- [âœ…] AUTH-002: Create registration page with name/email/password/confirm-password + mock submission
- [âœ…] AUTH-003: Create user management page â€” list users, role badges, add/edit/deactivate (Settings > Users)
- [âœ…] AUTH-004: Create role assignment dialog â€” Admin can change a user's role
- [âœ…] AUTH-005: Create session timeout mock â€” banner that appears after 30 min, redirect to login

#### Agent-E001 Tasks (Borrowers + Capital Providers CRUD)
> **Context:** Read SPEC lines 232-417 for all acceptance criteria. Read BLUEPRINT Section 4 F-001 for business context. Read BLUEPRINT Section 8 for data entity definitions.
- [âœ…] E001-001: Borrower list page â€” paginated table, search by name, filter by project type (SPEC E-001-S005) <!-- DONE: Agent-E001 | Completed: 2026-04-02T22:40Z -->
- [âœ…] E001-002: Create Borrower form page â€” all fields with validation per SPEC E-001-S001 <!-- DONE: Agent-E001 | Completed: 2026-04-02T22:40Z -->
- [âœ…] E001-003: Borrower profile page â€” all fields displayed, edit mode, associated deals list (SPEC E-001-S003) <!-- DONE: Agent-E001 | Completed: 2026-04-02T22:40Z -->
- [âœ…] E001-004: Capital Provider list page â€” paginated table, search by name, filter by type (SPEC E-001-S005) <!-- DONE: Agent-E001 | Completed: 2026-04-02T22:40Z -->
- [âœ…] E001-005: Create Capital Provider form page â€” all fields with validation per SPEC E-001-S002 <!-- DONE: Agent-E001 | Completed: 2026-04-02T22:40Z -->
- [âœ…] E001-006: Capital Provider profile page â€” all fields, edit mode, deals list, relationship type (SPEC E-001-S004) <!-- DONE: Agent-E001 | Completed: 2026-04-02T22:40Z -->
- [âœ…] E001-007: Archive functionality â€” archive button (Admin only), confirmation dialog, archived banner, "Show archived" toggle (SPEC E-001-S006) <!-- DONE: Agent-E001 | Completed: 2026-04-02T22:40Z -->

#### Agent-E002 Tasks (Engagement Threads)
> **Context:** Read SPEC lines 420-540. Read BLUEPRINT Section 4 F-002. The core CRM pain point â€” one CP can have multiple simultaneous deal evaluations + credit facility negotiations.
- [âœ…] E002-001: "New Thread" form on CP profile â€” type selector (Deal Evaluation, Credit Facility, JV, Other), title, description, linked deal dropdown (SPEC E-002-S001) <!-- DONE: Agent-E002 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E002-002: Thread detail page â€” status, notes, conversation history, status update dropdown (SPEC E-002-S002) <!-- DONE: Agent-E002 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E002-003: Unified timeline view â€” all events across all threads, chronological, filterable by thread (SPEC E-002-S003) <!-- DONE: Agent-E002 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E002-004: Thread list section on CP profile â€” all threads with status badges, filter by type (SPEC E-002-S004) <!-- DONE: Agent-E002 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E002-005: Thread status change behaviors â€” "Won" prompt for deal update, thread close confirmation (SPEC E-002-S005) <!-- DONE: Agent-E002 | Completed: 2026-04-02T17:00Z -->

#### Agent-E003 Tasks (Capital Provider Classification + Credit Facilities)
> **Context:** Read SPEC lines 542-682. Read BLUEPRINT Section 4 F-003 and Section 8 "Data Entity 4: Credit Facility". Key concept: Transactional vs. Credit Facility Partner.
- [âœ…] E003-001: Relationship type field on CP profile â€” dropdown (Prospective, Transactional, Credit Facility Partner), auto-upgrade logic display (SPEC E-003-S001) <!-- DONE: Agent-E003 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E003-002: Credit Facility form â€” all fields per SPEC E-003-S002 (facility name, size, allocation, spread split, term, refinancing provisions, status, dates) <!-- DONE: Agent-E003 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E003-003: Credit Facility utilization display â€” progress bar, remaining capacity, 80% amber/100% red warnings (SPEC E-003-S003) <!-- DONE: Agent-E003 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E003-004: Credit Facility view/edit page â€” all fields editable, terminate confirmation dialog (SPEC E-003-S004) <!-- DONE: Agent-E003 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E003-005: Credit Facilities section on CP profile â€” list all facilities with utilization bars <!-- DONE: Agent-E003 | Completed: 2026-04-02T17:00Z -->

#### Agent-E004 Tasks (Deal Pipeline)
> **Context:** Read SPEC lines 686-850. Read BLUEPRINT Section 4 F-004 and Section 6 Workflow 1. Default pipeline stages: Prospect â†’ Qualifying â†’ Structuring â†’ Pitched â†’ Committed â†’ Execution â†’ Funded â†’ Closed.
- [✅] E004-001: Create Deal form â€” borrower selector, all fields per SPEC E-004-S001 (name, project type, location, size, financing %, notes) <!-- DONE: Agent-E004 | Completed: 2026-04-02T23:10Z -->
- [✅] E004-002: Deal detail page â€” all fields, pipeline stage indicator, linked CPs with per-CP status (SPEC E-004-S001/S002) <!-- DONE: Agent-E004 | Completed: 2026-04-02T23:10Z -->
- [✅] E004-003: Link CP to Deal â€” searchable dropdown, creates linkage with "Pitched" status (SPEC E-004-S002) <!-- DONE: Agent-E004 | Completed: 2026-04-02T23:10Z -->
- [✅] E004-004: Pipeline stage update â€” clickable stage indicator, confirmation for backward moves, execution trigger (SPEC E-004-S003) <!-- DONE: Agent-E004 | Completed: 2026-04-02T23:10Z -->
- [✅] E004-005: Pipeline dashboard â€” visual Kanban or column view, deal cards with name/borrower/size/days, aggregate metrics per stage (SPEC E-004-S004) <!-- DONE: Agent-E004 | Completed: 2026-04-02T23:10Z -->
- [✅] E004-006: Deal list page â€” paginated table, search, filter by stage/borrower/CP (SPEC E-004-S005) <!-- DONE: Agent-E004 | Completed: 2026-04-02T23:10Z -->
- [✅] E004-007: Deal archive functionality â€” filter toggle, archive action for Admin (SPEC E-004-S006) <!-- DONE: Agent-E004 | Completed: 2026-04-02T23:10Z -->

#### Agent-E005 Tasks (Deal Execution + Vendors)
> **Context:** Read SPEC lines 852-1065. Read BLUEPRINT Section 4 F-005 and Section 6 Workflow 2. The 6-9 week execution phase with 8-15 vendors. This is where deals go from "agreed" to "funded."
- [✅] E005-001: Execution workspace page â€” task checklist display within deal detail, auto-generated from template concept (SPEC E-005-S001) <!-- DONE: Agent-E005 | Completed: 2026-04-02T22:45Z -->
- [✅] E005-002: Add/edit task form â€” name, description, assignee (internal or vendor name), status dropdown, due date, notes (SPEC E-005-S002) <!-- DONE: Agent-E005 | Completed: 2026-04-02T22:45Z -->
- [✅] E005-003: Task status management â€” status badges, status update dropdown, completion timestamp display (SPEC E-005-S003) <!-- DONE: Agent-E005 | Completed: 2026-04-02T22:45Z -->
- [✅] E005-004: Third-party vendor management â€” vendor profile page, vendor list, service type, contact info, deal history (SPEC E-005-S004) <!-- DONE: Agent-E005 | Completed: 2026-04-02T22:45Z -->
- [✅] E005-005: Overdue task flagging â€” red indicator, "X days overdue" text, sort by overdue-first (SPEC E-005-S005) <!-- DONE: Agent-E005 | Completed: 2026-04-02T22:45Z -->
- [✅] E005-006: Execution progress indicator â€” percentage bar, color-coded (green >75%, amber 50-75%/has overdue, red <50%), "Ready for funding" label (SPEC E-005-S006) <!-- DONE: Agent-E005 | Completed: 2026-04-02T22:45Z -->
- [✅] E005-007: Deal termination workflow â€” "Terminated" stage with required reason field, termination banner, reactivation for Admin (SPEC E-005-S007) <!-- DONE: Agent-E005 | Completed: 2026-04-02T22:45Z -->

#### Agent-E006 Tasks (Email Integration UI)
> **Context:** Read SPEC lines 1068-1260. Read BLUEPRINT Section 4 F-006. For the prototype: mock email data, mock OAuth flows, mock ingestion.
- [âœ…] E006-001: Email provider setup page â€” Gmail/Outlook selection, mock OAuth button, connection status indicator (SPEC E-006-S001) <!-- DONE: Agent-E006 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E006-002: Recent Emails queue page â€” list of mock ingested emails with sender, subject, date, "Link" button (SPEC E-006-S002 + S003) <!-- DONE: Agent-E006 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E006-003: Email association form â€” searchable dropdowns for Borrower, CP, Deal, Thread; save + auto-remove from queue (SPEC E-006-S003) <!-- DONE: Agent-E006 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E006-004: Auto-suggest association â€” pre-filled suggestions based on mock email address matching, accept/dismiss buttons (SPEC E-006-S004) <!-- DONE: Agent-E006 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E006-005: Email entries in entity timeline â€” email icon, sender, subject, date, body preview, click to expand (SPEC E-006-S005) <!-- DONE: Agent-E006 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E006-006: Email detail modal â€” full email content display, linked entities, unlink option (SPEC E-006-S006) <!-- DONE: Agent-E006 | Completed: 2026-04-02T17:00Z -->

#### Agent-E007 Tasks (Document Hub)
> **Context:** Read BLUEPRINT Section 4 F-007. For the prototype: mock document list, upload UI (non-functional), search, per-entity filtering.
- [âœ…] E007-001: Document hub page â€” file list with name, type, size, uploaded by, date, linked entity (SPEC E-007-S001) <!-- DONE: Agent-E007 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E007-002: Upload document UI â€” drag-and-drop zone, file type/size display, entity linker (SPEC E-007-S002) <!-- DONE: Agent-E007 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E007-003: Document search and filter â€” search by name, filter by entity, filter by document type (SPEC E-007-S003) <!-- DONE: Agent-E007 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E007-004: Per-entity document section â€” "Documents" tab on Borrower/CP/Deal profiles showing linked docs (SPEC E-007-S004) <!-- DONE: Agent-E007 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E007-005: Document detail/preview â€” metadata display, download button placeholder, version history mock (SPEC E-007-S005) <!-- DONE: Agent-E007 | Completed: 2026-04-02T17:00Z -->

#### Agent-E008 Tasks (AI Follow-Up Automation)
> **Context:** Read SPEC lines 1395-1527. Read BLUEPRINT Section 4 F-008. Phase 3 feature â€” AI-generated follow-up sequences with human-in-the-loop approval.
- [âœ…] E008-001: Follow-up sequence setup form â€” number of follow-ups, interval, auto-send vs. approval mode (SPEC E-008-S001) <!-- DONE: Agent-E008 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E008-002: AI-generated message preview â€” mock draft display, edit capability, context summary (SPEC E-008-S002) <!-- DONE: Agent-E008 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E008-003: Approval queue page â€” pending messages with context, Approve/Edit/Skip/Cancel actions (SPEC E-008-S003) <!-- DONE: Agent-E008 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E008-004: Opt-out management â€” opted-out indicator on entity profiles, Admin clear option (SPEC E-008-S004) <!-- DONE: Agent-E008 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E008-005: Follow-up reporting section â€” active sequences, sent count, response rate, opt-outs (SPEC E-008-S005) <!-- DONE: Agent-E008 | Completed: 2026-04-02T17:00Z -->

#### Agent-E009-E010 Tasks (Zoho Integration + Process Templates)
> **Context:** SPEC lines 1531-1781. Read BLUEPRINT Section 4 F-009/F-010 and Section 7 Integration 1.
- [âœ…] E009-001: Zoho connection setup page â€” mock OAuth, connection status, test button (SPEC E-009-S001) <!-- DONE: Agent-E009-E010 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E009-002: Initial import UI â€” mock import flow, mapping screen (classify contacts as Borrower/CP), progress indicator, summary (SPEC E-009-S002) <!-- DONE: Agent-E009-E010 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E009-003: Ongoing sync status page â€” last sync time, sync log, error list, manual sync trigger (SPEC E-009-S003) <!-- DONE: Agent-E009-E010 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E009-004: Sync conflict resolution UI â€” side-by-side comparison, choose which version to keep (SPEC E-009-S004/S005) <!-- DONE: Agent-E009-E010 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E010-001: Process template list page â€” templates with name, version, default indicator (SPEC E-010-S001) <!-- DONE: Agent-E009-E010 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E010-002: Template builder â€” ordered task list builder, drag-to-reorder, default assignee role, relative due date offset (SPEC E-010-S001) <!-- DONE: Agent-E009-E010 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E010-003: Apply template to deal UI â€” dropdown selector, warning for existing tasks (SPEC E-010-S002) <!-- DONE: Agent-E009-E010 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E010-004: Set default template â€” "Set as Default" action, only-one-default logic (SPEC E-010-S003) <!-- DONE: Agent-E009-E010 | Completed: 2026-04-02T17:00Z -->
- [âœ…] E010-005: Template version history â€” version list, diff view, read-only historical view (SPEC E-010-S004) <!-- DONE: Agent-E009-E010 | Completed: 2026-04-02T17:00Z -->

---

### WAVE 2 â€” DASHBOARDS & NOTIFICATIONS (After Wave 1 agents complete their core pages)

#### Agent-DASH Tasks
> **Context:** SPEC lines 790-850 (pipeline dashboard), SPEC lines 1915-1988 (reporting), BLUEPRINT Section 11.
- [âœ…] DASH-001: Main dashboard page â€” pipeline summary cards, overdue tasks count, recent activity feed, quick action buttons <!-- DONE: Agent-DASH | Completed: 2026-04-02T23:30Z -->
- [âœ…] DASH-002: Pipeline analytics page (RPT-001) â€” deals by stage, total pipeline value, value per stage, avg days in stage, filters <!-- DONE: Agent-DASH | Completed: 2026-04-02T23:30Z -->
- [âœ…] DASH-003: Relationship analytics page (RPT-002) â€” CP counts by type, by relationship type, facility utilization, pitch-to-commit rate <!-- DONE: Agent-DASH | Completed: 2026-04-02T23:30Z -->
- [âœ…] DASH-004: Execution tracker page (RPT-003) â€” deals in execution with progress bars, overdue counts, top 10 overdue tasks <!-- DONE: Agent-DASH | Completed: 2026-04-02T23:30Z -->
- [âœ…] DASH-005: Follow-up analytics page â€” active sequences, sent/response/opt-out metrics (from E-008-S005) <!-- DONE: Agent-DASH | Completed: 2026-04-02T23:30Z -->

#### Agent-NOTIF Tasks
> **Context:** SPEC lines 1833-1911 (NOTIF-001 through NOTIF-004).
- [âœ…] NOTIF-001: Notification center page â€” all notifications list, read/unread, filter by type, click-to-navigate <!-- DONE: Agent-NOTIF | Completed: 2026-04-02T23:30Z -->
- [âœ…] NOTIF-002: Notification bell component â€” unread count badge, dropdown with recent 5, “View all” link <!-- DONE: Agent-NOTIF | Completed: 2026-04-02T23:30Z -->
- [âœ…] NOTIF-003: Mock notification data â€” overdue task alerts, CP response, follow-up reminders, deal stage changes <!-- DONE: Agent-NOTIF | Completed: 2026-04-02T23:30Z -->
- [âœ…] NOTIF-004: Toast notification component â€” slides in for real-time mock events <!-- DONE: Agent-NOTIF | Completed: 2026-04-02T23:30Z -->

---

### WAVE 3 â€” INTEGRATION (After all feature agents complete)

#### Agent-INTEGRATION Tasks
- [✅] INT-001: Embed engagement thread list (Agent-E002) into Capital Provider profile page (Agent-E001) <!-- DONE: Agent-INTEGRATION | Completed: 2026-04-02T23:50Z -->
- [✅] INT-002: Embed credit facility section (Agent-E003) into Capital Provider profile page (Agent-E001) <!-- DONE: Agent-INTEGRATION | Completed: 2026-04-02T23:50Z -->
- [✅] INT-003: Embed execution workspace link/tab (Agent-E005) into Deal detail page (Agent-E004) <!-- DONE: Agent-INTEGRATION | Completed: 2026-04-02T23:50Z -->
- [✅] INT-004: Embed progress indicator (Agent-E005) into pipeline dashboard deal cards (Agent-E004/DASH) <!-- DONE: Agent-INTEGRATION | Completed: 2026-04-02T23:50Z -->
- [✅] INT-005: Embed email timeline entries (Agent-E006) into entity profile timelines (Agent-E001/E002) <!-- DONE: Agent-INTEGRATION | Completed: 2026-04-02T23:50Z -->
- [✅] INT-006: Embed document section (Agent-E007) into Borrower/CP/Deal profile pages <!-- DONE: Agent-INTEGRATION | Completed: 2026-04-02T23:50Z -->
- [✅] INT-007: Verify all navigation links in sidebar point to existing pages <!-- DONE: Agent-INTEGRATION | Completed: 2026-04-02T23:50Z -->
- [✅] INT-008: Verify all “drill-down” links from dashboards navigate to correct detail pages <!-- DONE: Agent-INTEGRATION | Completed: 2026-04-02T23:50Z -->
- [✅] INT-009: Verify all breadcrumbs render correctly on every page <!-- DONE: Agent-INTEGRATION | Completed: 2026-04-02T23:50Z -->
- [✅] INT-010: Full smoke test â€” navigate through every route, confirm no broken pages <!-- DONE: Agent-INTEGRATION | Completed: 2026-04-02T23:50Z -->

---

## 8. DOCUMENT CROSS-REFERENCE MAP

Use this to find detailed context for any feature. **Always read the referenced sections before building.**

| Feature | SPEC Reference | BLUEPRINT Reference | Key Info You Need |
|---------|---------------|---------------------|-------------------|
| **Borrower CRUD** | Lines 232-332 (E-001-S001, S003) | Section 4 F-001, Section 8 Entity 1 | Field definitions, validation rules, edit behavior |
| **Capital Provider CRUD** | Lines 265-357 (E-001-S002, S004) | Section 4 F-001, Section 8 Entity 2 | Field definitions, type dropdown values, relationship types |
| **Entity List Views** | Lines 361-389 (E-001-S005) | â€” | Search behavior (2+ chars), pagination (25/page), filter options |
| **Archive/Soft Delete** | Lines 393-417 (E-001-S006) | â€” | Admin-only, confirmation dialog text, "Show archived" toggle |
| **Engagement Threads** | Lines 420-540 (E-002 all stories) | Section 4 F-002, Section 6 Workflow 3 | Thread types, status lifecycle, unified timeline, note system |
| **CP Classification** | Lines 542-580 (E-003-S001) | Section 4 F-003 | Relationship types: Prospective, Transactional, Credit Facility Partner |
| **Credit Facilities** | Lines 599-682 (E-003-S002/S003/S004) | Section 8 Entity 4 | All facility fields, utilization calc, 80%/100% thresholds |
| **Deal CRUD** | Lines 698-731 (E-004-S001) | Section 4 F-004, Section 6 Workflow 1 | Deal fields, financing % validation, borrower linkage |
| **Link CP to Deal** | Lines 735-759 (E-004-S002) | â€” | Creates engagement thread automatically, per-CP status |
| **Pipeline Stages** | Lines 763-786 (E-004-S003) | Section 4 F-004, BLUEPRINT OQ-002 | Default stages, backward move confirmation, execution trigger |
| **Pipeline Dashboard** | Lines 790-850 (E-004-S004/S005) | Section 11 Report 1 | Kanban/column view, aggregate metrics, deal cards |
| **Deal Execution Tasks** | Lines 852-945 (E-005-S001/S002/S003) | Section 4 F-005, Section 6 Workflow 2 | Task statuses, assignee types, checklist generation |
| **Vendor Management** | Lines 947-975 (E-005-S004) | Section 8 Entity 6 | Vendor types: appraiser, law firm, energy consultant, etc. |
| **Overdue Tasks** | Lines 998-1014 (E-005-S005) | Section 10 Notification 1 | Red indicator, "X days overdue", sort by overdue first |
| **Execution Progress** | Lines 1018-1037 (E-005-S006) | â€” | % complete bar, green/amber/red thresholds |
| **Deal Termination** | Lines 1041-1064 (E-005-S007) | â€” | Required reason, task cancellation, CP thread update |
| **Email Setup** | Lines 1080-1104 (E-006-S001) | Section 7 Integration 2 | Mock OAuth flow, Gmail/Outlook options, connection status |
| **Email Ingestion** | Lines 1108-1133 (E-006-S002) | â€” | Email fields: sender, recipients, subject, date, body |
| **Email Association** | Lines 1137-1187 (E-006-S003/S004) | â€” | Manual linking, auto-suggest matching, queue removal |
| **Email in Timeline** | Lines 1191-1260 (E-006-S005/S006) | â€” | Email entries mixed with notes, type indicators |
| **Document Hub** | â€” (SPEC E-007 not fully captured) | Section 4 F-007 | Upload, organize, search, per-entity views |
| **Follow-Up Sequences** | Lines 1405-1427 (E-008-S001) | Section 4 F-008 | Setup form: count, interval, auto-send vs approval |
| **AI Message Generation** | Lines 1431-1453 (E-008-S002) | â€” | Mock draft display, context summary, edit before send |
| **Follow-Up Approval** | Lines 1457-1480 (E-008-S003) | â€” | Queue with Approve/Edit/Skip/Cancel |
| **Contact Opt-Out** | Lines 1484-1506 (E-008-S004) | â€” | Opt-out indicator on profiles, Admin clear |
| **Zoho Integration** | Lines 1531-1620 (E-009) | Section 7 Integration 1 | Mock OAuth, import mapping, sync status, conflict resolution |
| **Process Templates** | Lines 1689-1781 (E-010) | Section 4 F-010 | Template builder, versioning, default template, apply to deal |
| **Overdue Alert (NOTIF)** | Lines 1837-1854 | Section 10 Notification 1 | Task name, deal name, days overdue, link to execution tab |
| **CP Response (NOTIF)** | Lines 1858-1873 | Section 10 Notification 2 | CP name, deal name, email subject, body preview |
| **Follow-Up Reminder (NOTIF)** | Lines 1877-1892 | Section 10 Notification 3 | Contact name, days since last comm, "Send follow-up" CTA |
| **Deal Stage Change (NOTIF)** | Lines 1896-1911 | Section 10 Notification 4 | Deal name, old/new stage, changed by, critical transitions |
| **Pipeline Report** | Lines 1919-1940 (RPT-001) | Section 11 Report 1 | Deals by stage, total pipeline value, filters |
| **CP Relationship Report** | Lines 1944-1964 (RPT-002) | Section 11 Report 2 | CP counts by type, facility utilization, pitch vs commit |
| **Execution Report** | Lines 1968-1988 (RPT-003) | Section 11 Report 3 | Per-deal progress, overdue counts, top overdue tasks |
| **User Roles (RBAC)** | Lines 98-117 (INFRA-002) | Section 9 Security | Admin, Deal Team, Read-Only. Permission boundaries |
| **Pipeline Stage Defaults** | â€” | BLUEPRINT OQ-002 | Prospect â†’ Qualifying â†’ Structuring â†’ Pitched â†’ Committed â†’ Execution â†’ Funded â†’ Closed |
| **Domain Glossary** | â€” | BLUEPRINT Section 18 | PACE, Credit Facility, Spread, Origination, Underwriting, etc. |

---

## 9. MOCK DATA CONTRACTS

### TypeScript Interfaces

Agent-FOUNDATION: Create these in `src/types/`. Every interface must be exported from `src/types/index.ts`.

```typescript
// src/types/borrower.ts
export interface Borrower {
  id: string;                    // UUID format
  name: string;
  contactPersonName?: string;
  contactEmail?: string;
  contactPhone?: string;
  projectType?: string;          // "Hotel", "Infrastructure", "Mining", "Commercial RE", "Other"
  location?: string;
  notes?: string;
  isArchived: boolean;
  archivedAt?: string;           // ISO date
  createdBy: string;             // user ID
  createdAt: string;             // ISO date
  updatedBy: string;
  updatedAt: string;
}

// src/types/capital-provider.ts
export interface CapitalProvider {
  id: string;
  firmName: string;
  contactPersonName?: string;
  contactEmail?: string;
  contactPhone?: string;
  type: "Bank" | "Asset Manager" | "Family Office" | "Life Insurance Company" | "Other";
  relationshipType: "Prospective" | "Transactional" | "Credit Facility Partner";
  notes?: string;
  isArchived: boolean;
  archivedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

// src/types/deal.ts
export interface Deal {
  id: string;
  name: string;
  borrowerId: string;
  projectType?: string;
  location?: string;
  estimatedDealSize?: number;
  traditionalFinancingPct?: number;
  paceFinancingPct?: number;
  pipelineStage: PipelineStage;
  notes?: string;
  terminationReason?: string;
  executionStartDate?: string;
  isArchived: boolean;
  archivedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export type PipelineStage =
  | "Prospect"
  | "Qualifying"
  | "Structuring"
  | "Pitched"
  | "Committed"
  | "Execution"
  | "Funded"
  | "Closed"
  | "Terminated";

// src/types/deal-capital-provider.ts
export interface DealCapitalProvider {
  id: string;
  dealId: string;
  capitalProviderId: string;
  status: "Pitched" | "Evaluating" | "Terms Negotiating" | "Committed" | "Declined" | "Withdrawn";
  engagementThreadId?: string;
  createdAt: string;
  updatedAt: string;
}

// src/types/credit-facility.ts
export interface CreditFacility {
  id: string;
  capitalProviderId: string;
  name: string;
  facilitySizeDollars: number;
  annualAllocationDollars?: number;
  spreadSplitPct?: number;
  termLength?: string;
  refinancingProvisions?: string;
  status: "Negotiating" | "Active" | "Expired" | "Terminated";
  startDate?: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

// src/types/engagement-thread.ts
export interface EngagementThread {
  id: string;
  capitalProviderId: string;
  dealId?: string;              // Required if type is "Deal Evaluation"
  type: "Deal Evaluation" | "Credit Facility Negotiation" | "JV Partnership" | "Other";
  title: string;
  description?: string;
  status: "Active" | "On Hold" | "Won" | "Lost" | "Closed";
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

// src/types/task.ts
export interface Task {
  id: string;
  dealId: string;
  name: string;
  description?: string;
  assigneeType: "Internal" | "Vendor";
  assigneeName: string;
  assigneeUserId?: string;
  vendorId?: string;
  status: "Not Started" | "In Progress" | "Blocked" | "Complete" | "Cancelled";
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  sortOrder: number;
  templateId?: string;
  templateVersion?: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

// src/types/vendor.ts
export interface Vendor {
  id: string;
  companyName: string;
  contactPersonName?: string;
  contactEmail?: string;
  contactPhone?: string;
  serviceType: string;          // "Appraiser", "Law Firm", "Energy Consultant", "Municipality", etc.
  notes?: string;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

// src/types/communication.ts
export interface Communication {
  id: string;
  type: "Email" | "Note" | "StatusChange" | "ThreadCreated";
  // Email fields
  emailSender?: string;
  emailRecipients?: string[];
  emailCc?: string[];
  emailSubject?: string;
  emailBody?: string;
  // Note fields
  noteContent?: string;
  noteAuthor?: string;
  // Status change fields
  statusFrom?: string;
  statusTo?: string;
  // Common
  entityType?: "Borrower" | "CapitalProvider" | "Deal" | "EngagementThread";
  entityId?: string;
  threadId?: string;
  dealId?: string;
  timestamp: string;
  createdBy: string;
}

// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Deal Team" | "Read-Only";
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

// src/types/notification.ts
export interface Notification {
  id: string;
  type: "OverdueTask" | "CPResponse" | "FollowUpReminder" | "DealStageChange";
  title: string;
  body: string;
  linkUrl: string;
  isRead: boolean;
  recipientUserId: string;
  createdAt: string;
}

// src/types/process-template.ts
export interface ProcessTemplate {
  id: string;
  name: string;
  description?: string;
  version: number;
  isDefault: boolean;
  isArchived: boolean;
  tasks: TemplateTaskDefinition[];
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface TemplateTaskDefinition {
  id: string;
  name: string;
  description?: string;
  defaultAssigneeRole: string;
  relativeDueDateOffsetDays?: number;
  sortOrder: number;
}

// src/types/audit-log.ts
export interface AuditLog {
  id: string;
  userId: string;
  actionType: "Create" | "Update" | "Archive" | "Access";
  entityType: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  changedFields?: Record<string, { from: unknown; to: unknown }>;
}

// src/types/follow-up-sequence.ts
export interface FollowUpSequence {
  id: string;
  threadId?: string;
  taskId?: string;
  contactName: string;
  contactEmail: string;
  totalFollowUps: number;
  intervalDays: number;
  mode: "AutoSend" | "ApprovalRequired";
  status: "Active" | "Paused" | "Completed" | "Cancelled";
  followUpsSent: number;
  lastSentAt?: string;
  nextScheduledAt?: string;
  createdBy: string;
  createdAt: string;
}

// src/types/document.ts
export interface Document {
  id: string;
  name: string;
  fileType: string;
  fileSizeBytes: number;
  entityType?: "Borrower" | "CapitalProvider" | "Deal";
  entityId?: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
}
```

### Mock Data Volume

Agent-FOUNDATION: Create realistic fixture data at these volumes:

| Entity | Count | Notes |
|--------|-------|-------|
| Users | 6 | 1 Admin (CEO), 3 Deal Team, 1 Capital Raising, 1 Read-Only |
| Borrowers | 8 | Mix of hotels, infrastructure, mining, commercial RE |
| Capital Providers | 12 | 4 Banks, 3 Asset Managers, 2 Family Offices, 2 Life Insurance, 1 Other |
| Deals | 10 | Spread across all pipeline stages, 2-3 in Execution |
| Deal-CP Links | 18 | Multiple CPs per deal, various statuses |
| Credit Facilities | 3 | 1 Active, 1 Negotiating, 1 Expired |
| Engagement Threads | 20 | Multiple per CP, various types |
| Tasks | 30 | Across the deals in Execution, mix of statuses, some overdue |
| Vendors | 10 | Appraiser, 2 law firms, energy consultant, municipality, etc. |
| Communications | 40 | Mix of emails, notes, status changes |
| Notifications | 15 | Mix of types, some read, some unread |
| Process Templates | 2 | 1 default with 12 tasks, 1 alternate with 8 tasks |
| Documents | 12 | PDFs, DOCXs, linked to various entities |
| Follow-Up Sequences | 4 | Various statuses |
| Audit Logs | 25 | Recent activity across entities |

Use domain-realistic names: "Meridian Hotel Group" not "Test Borrower 1." Reference BLUEPRINT Section 18 (Glossary) for correct terminology. Use real-sounding CP names: "JP Morgan Commercial Lending," "Ares Capital Management," "Blackrock Infrastructure Fund."

---

## 10. COMPONENT CONVENTIONS & STANDARDS

### Coding Standards

1. **All components are React Server Components by default.** Add `"use client"` only when you need interactivity (state, effects, event handlers).
2. **Use the `cn()` utility from `src/lib/utils.ts`** for conditional classNames. Import from `@/lib/utils`.
3. **Import types from `@/types`**, never define ad-hoc types in component files.
4. **Import mock data from `@/mock-data`** or use the `useMockData()` hook for simulated loading.
5. **Import shared components from `@/components/shared`**.
6. **Import shadcn components from `@/components/ui`**.
7. **Every page must have a `page-header`** with title and relevant action buttons.
8. **Every list page must handle the empty state** using the `empty-state` component.
9. **Every form must use `react-hook-form` + `zod`** for validation.
10. **Every table must use the `data-table` shared component** for consistency.

### Page Structure Template

```tsx
// Example: src/app/(dashboard)/borrowers/page.tsx
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { borrowers } from "@/mock-data";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function BorrowersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Borrowers"
        description="Manage borrower relationships and deal origination"
        actions={
          <Link href="/borrowers/new">
            <Button><Plus className="mr-2 h-4 w-4" /> New Borrower</Button>
          </Link>
        }
      />
      {/* SearchFilterBar + DataTable or EmptyState */}
    </div>
  );
}
```

### Status Color Mapping

Use consistently across ALL components:

| Status Context | Value | Color (Tailwind) |
|---------------|-------|-------------------|
| Pipeline Stage | Prospect | `bg-slate-100 text-slate-700` |
| Pipeline Stage | Qualifying | `bg-blue-100 text-blue-700` |
| Pipeline Stage | Structuring | `bg-indigo-100 text-indigo-700` |
| Pipeline Stage | Pitched | `bg-purple-100 text-purple-700` |
| Pipeline Stage | Committed | `bg-emerald-100 text-emerald-700` |
| Pipeline Stage | Execution | `bg-amber-100 text-amber-700` |
| Pipeline Stage | Funded | `bg-green-100 text-green-700` |
| Pipeline Stage | Closed | `bg-gray-100 text-gray-700` |
| Pipeline Stage | Terminated | `bg-red-100 text-red-700` |
| Task Status | Not Started | `bg-slate-100 text-slate-700` |
| Task Status | In Progress | `bg-blue-100 text-blue-700` |
| Task Status | Blocked | `bg-red-100 text-red-700` |
| Task Status | Complete | `bg-green-100 text-green-700` |
| Task Status | Cancelled | `bg-gray-100 text-gray-700` |
| Thread Status | Active | `bg-blue-100 text-blue-700` |
| Thread Status | On Hold | `bg-amber-100 text-amber-700` |
| Thread Status | Won | `bg-green-100 text-green-700` |
| Thread Status | Lost | `bg-red-100 text-red-700` |
| Thread Status | Closed | `bg-gray-100 text-gray-700` |
| CP Pitch Status | Pitched | `bg-purple-100 text-purple-700` |
| CP Pitch Status | Evaluating | `bg-blue-100 text-blue-700` |
| CP Pitch Status | Terms Negotiating | `bg-amber-100 text-amber-700` |
| CP Pitch Status | Committed | `bg-green-100 text-green-700` |
| CP Pitch Status | Declined | `bg-red-100 text-red-700` |
| CP Pitch Status | Withdrawn | `bg-gray-100 text-gray-700` |
| Facility Status | Negotiating | `bg-amber-100 text-amber-700` |
| Facility Status | Active | `bg-green-100 text-green-700` |
| Facility Status | Expired | `bg-gray-100 text-gray-700` |
| Facility Status | Terminated | `bg-red-100 text-red-700` |
| Progress Bar | >75%, no overdue | `bg-green-500` |
| Progress Bar | 50-75% or has overdue | `bg-amber-500` |
| Progress Bar | <50% | `bg-red-500` |

### Navigation Structure

Sidebar navigation groups:

```
MAIN
â”œâ”€â”€ Dashboard           â†’ /
â”œâ”€â”€ Borrowers            â†’ /borrowers
â”œâ”€â”€ Capital Providers    â†’ /capital-providers
â”œâ”€â”€ Deals                â†’ /deals
â”‚   â””â”€â”€ Pipeline View    â†’ /deals/pipeline
â”œâ”€â”€ Vendors              â†’ /vendors

COMMUNICATIONS
â”œâ”€â”€ Emails               â†’ /emails
â”œâ”€â”€ Documents            â†’ /documents
â”œâ”€â”€ Follow-Ups           â†’ /follow-ups

ANALYTICS
â”œâ”€â”€ Pipeline Report      â†’ /analytics/pipeline
â”œâ”€â”€ Relationships        â†’ /analytics/relationships
â”œâ”€â”€ Execution Tracker    â†’ /analytics/execution

SETTINGS
â”œâ”€â”€ Users & Roles        â†’ /settings/users
â”œâ”€â”€ Integrations         â†’ /settings/integrations
â””â”€â”€ Process Templates    â†’ /settings/templates
```

### Design Principles (from BLUEPRINT Section 12)

1. **Non-technical users** â€” The team comes from leveraged finance / investment backgrounds. No technical jargon in UI. Clear labels, obvious actions, no hidden features.
2. **Data density** â€” These users are comfortable with data-heavy views (spreadsheets, financial models). Don't oversimplify. Tables are preferred over cards for list views.
3. **Speed** â€” Loading states should be visible but brief (the 300ms mock delay simulates this).
4. **Professional aesthetic** â€” Financial services firm. Clean, professional, slate/blue palette. No whimsy.

---

## 11. AGENT ACTIVITY LOG

<!-- Agents: Add new entries at the TOP of this log. Most recent first. -->
<!-- Format: YYYY-MM-DDTHH:MMZ | Agent-NAME | ACTION: Description | FILES: list of files created/modified -->

```
--- LOG START ---

[2026-04-02T23:10Z] Agent-E004 â€” E004-001 through E004-007 COMPLETE
  - Built `src/app/(dashboard)/deals/page.tsx`, `src/app/(dashboard)/deals/new/page.tsx`, `src/app/(dashboard)/deals/pipeline/page.tsx`, and `src/app/(dashboard)/deals/[id]/page.tsx`
  - Added route-local shared state in `src/app/(dashboard)/deals/layout.tsx` and `src/app/(dashboard)/deals/_components/deals-provider.tsx` so create/list/pipeline/detail interactions persist across deal routes in the prototype
  - Created `src/app/(dashboard)/deals/_components/deal-form-card.tsx` with react-hook-form + zod validation, searchable borrower selection, financing mix warning, and create/edit flows
  - Created `src/app/(dashboard)/deals/_components/deals-list-client.tsx` with paginated sortable table, search, stage and borrower filters, include archived/terminated toggle, and admin archive action
  - Created `src/app/(dashboard)/deals/_components/pipeline-dashboard-client.tsx` with stage columns, aggregate values, counts, clickable deal cards, and empty state handling
  - Created `src/app/(dashboard)/deals/_components/deal-detail-client.tsx` with pipeline-stage selector, backward-move confirmation, funded warning for incomplete execution tasks, terminated flow with required reason, linked capital provider management, and execution placeholder/link for Agent-E005
  - Added `src/app/(dashboard)/deals/_components/entity-search-select.tsx` for searchable borrower and capital-provider pickers
  - Verified `pnpm exec tsc --noEmit` and `pnpm build` both pass cleanly
  - Routes created: `/deals`, `/deals/new`, `/deals/pipeline`, `/deals/[id]`

[2026-04-02T22:45Z] Agent-E005 â€” E005-001 through E005-007 COMPLETE
  - Built `src/app/(dashboard)/deals/[id]/execution/page.tsx` with a full execution workspace: task checklist table, inline status updates, add/edit dialog, overdue-first sorting, soft delete toggle, reorder controls, progress bar, and termination/reactivation controls
  - Built `src/app/(dashboard)/vendors/page.tsx` and `src/app/(dashboard)/vendors/[id]/page.tsx` with searchable/filterable vendor list, new vendor dialog, editable vendor profile, and deal history from assigned execution tasks
  - Added local execution workspace persistence in `src/app/(dashboard)/deals/[id]/execution/_lib/execution-workspace-store.ts` so task, vendor, and termination changes persist across route navigation in the prototype
  - Updated shared `progress-bar.tsx` threshold logic to keep 75% amber per spec and relaxed `data-table.tsx` typing so typed route tables compile cleanly
  - Verified targeted lint on all new E005 files (warnings only from React Hook Form / React Compiler compatibility); targeted TypeScript output for E005 files is clean
  - Full-project verification remains blocked by pre-existing unrelated TypeScript errors in borrower/capital-provider/settings routes and by `next build` font fetch failures for Geist/Geist Mono under restricted network access
  - Routes created: `/deals/[id]/execution`, `/vendors`, `/vendors/[id]`

[2026-04-02T22:40Z] Agent-E001 â€” E001-001 through E001-007 COMPLETE
  - Built borrower pages: `src/app/(dashboard)/borrowers/page.tsx`, `src/app/(dashboard)/borrowers/new/page.tsx`, `src/app/(dashboard)/borrowers/[id]/page.tsx`
  - Added borrower feature-local store and form components: `src/app/(dashboard)/borrowers/borrower-store.ts`, `src/app/(dashboard)/borrowers/borrower-form.tsx`, `src/app/(dashboard)/borrowers/borrowers-list-client.tsx`, `src/app/(dashboard)/borrowers/new/borrower-new-page-client.tsx`, `src/app/(dashboard)/borrowers/[id]/borrower-profile-client.tsx`
  - Built capital provider pages: `src/app/(dashboard)/capital-providers/page.tsx`, `src/app/(dashboard)/capital-providers/new/page.tsx`, `src/app/(dashboard)/capital-providers/[id]/page.tsx`
  - Added capital provider feature-local store and form components: `src/app/(dashboard)/capital-providers/capital-provider-store.ts`, `src/app/(dashboard)/capital-providers/capital-provider-form.tsx`, `src/app/(dashboard)/capital-providers/capital-providers-list-client.tsx`, `src/app/(dashboard)/capital-providers/new/capital-provider-new-page-client.tsx`, `src/app/(dashboard)/capital-providers/[id]/capital-provider-profile-client.tsx`
  - Implemented paginated list views, 2+ character case-insensitive search, type/project filters, archived toggle, profile edit flows, admin-only archive confirmation, archived banners, linked deals sections, and placeholder Threads/Facilities tabs on the CP profile
  - New routes created: `/borrowers/new`, `/borrowers/[id]`, `/capital-providers`, `/capital-providers/new`, `/capital-providers/[id]`
  - Verification: feature-targeted ESLint passed for the new E001 files; repo-wide `pnpm tsc --noEmit` still fails because of pre-existing errors in deals execution, vendors, settings integrations, and other capital provider subroutes outside Agent-E001 ownership

[2026-04-02T22:38Z] Agent-AUTH â€” AUTH-001 through AUTH-005 COMPLETE
  - Created `src/app/(auth)/login/page.tsx` with centered sign-in card, logo/app branding, email/password form, forgot-password link, and mock credential validation (`password` succeeds, otherwise "Invalid email or password.")
  - Created `src/app/(auth)/register/page.tsx` with react-hook-form + zod validation for name/email/password/confirm-password, password min length/match validation, success toast, and redirect to `/login`
  - Created `src/app/(dashboard)/settings/users/page.tsx` with mock user management table, role/status badges, add-user dialog, role-assignment dialog, deactivation controls, prevention for removing/deactivating the last active Admin, and demo-only session timeout banner with login link
  - Verified auth and settings routes stay within Agent-AUTH owned directories and use existing shared layout/UI patterns
  - New routes: `/login`, `/register`, `/settings/users`

[2026-04-02T14:00Z] Agent-FOUNDATION â€” FND-001 COMPLETE
  - Scaffolded Next.js 16.2.2 project in deal-platform/ with TypeScript, Tailwind 4, ESLint, App Router, src dir
  - Initialized shadcn/ui (base-nova style, Slate base color, CSS variables)
  - Installed 30+ shadcn components (button, card, input, label, select, textarea, dialog, sheet, dropdown-menu, popover, command, separator, table, tabs, badge, avatar, tooltip, scroll-area, checkbox, switch, form, calendar, alert, alert-dialog, sonner, progress, skeleton, breadcrumb, sidebar, navigation-menu, collapsible, toggle-group, radio-group, slider)
  - Installed additional deps: lucide-react, date-fns, zod, @hookform/resolvers, react-hook-form
  - Created full folder structure per Section 4 (types, mock-data, lib, hooks, components/shared, components/layout, all route groups)
  - Note: date-picker component does not exist in latest shadcn registry; toast is deprecated (using sonner instead)

[2026-04-02T14:05Z] Agent-FOUNDATION â€” FND-002 COMPLETE
  - Created 16 TypeScript interface files in src/types/
  - Files: borrower.ts, capital-provider.ts, deal.ts, deal-capital-provider.ts, credit-facility.ts, engagement-thread.ts, task.ts, vendor.ts, communication.ts, user.ts, notification.ts, process-template.ts, audit-log.ts, follow-up-sequence.ts, document.ts, index.ts
  - All interfaces match Section 9 schemas exactly
  - index.ts re-exports all types

[2026-04-02T14:08Z] Agent-FOUNDATION â€” FND-004/005/006 COMPLETE
  - Created src/lib/constants.ts with all pipeline stages, status enums, role definitions, color mappings
  - Updated src/lib/utils.ts (preserved shadcn cn() function, added formatCurrency, formatDate, formatRelativeDate, getInitials, generateId)
  - Created src/lib/mock-helpers.ts with getById, filterBy, searchByName, paginate, sortBy

[2026-04-02T14:06Z] Agent-FOUNDATION â€” FND-007/008/009 COMPLETE
  - Created src/hooks/use-mock-data.ts (300ms simulated loading delay, generic typed)
  - Created src/hooks/use-pagination.ts (page/perPage/total state management)
  - Created src/hooks/use-search.ts (search term state with 2-char minimum)
  - Preserved existing src/hooks/use-mobile.ts from shadcn

[2026-04-02T14:20Z] Agent-FOUNDATION â€” FND-003 COMPLETE
  - Created 16 mock data fixture files in src/mock-data/
  - Data volumes per Section 9: 6 users, 8 borrowers, 12 capital providers, 10 deals, 18 deal-CP links, 3 credit facilities, 20 engagement threads, 30 tasks, 10 vendors, 40 communications, 15 notifications, 2 process templates, 12 documents, 4 follow-up sequences, 25 audit logs
  - All domain-realistic names (Meridian Hotel Group, JP Morgan Commercial Lending, etc.)
  - index.ts re-exports all fixtures

[2026-04-02T14:25Z] Agent-FOUNDATION â€” FND-010 COMPLETE
  - Ran `npx tsc --noEmit` â€” ZERO errors
  - Ran `pnpm dev` â€” starts without errors
  - FOUNDATION COMPLETE â€” All foundation tasks (FND-001 through FND-010) are done.
  - Agent-SHELL and Agent-SHARED may begin their Wave 0 work.

[2026-04-02T15:00Z] Agent-SHARED â€” SHR-001 through SHR-012 COMPLETE
  - Created 12 shared components in src/components/shared/:
    - data-table.tsx: Generic sortable table with column definitions, sort state, row click, empty state
    - entity-form.tsx: Form wrapper using react-hook-form + zod (zodResolver with any cast for zod v4 compat), create/edit modes, cancel support
    - status-badge.tsx: Colored Badge using all 5 color maps from constants (pipeline, task, thread, cpPitch, facility)
    - pipeline-stage.tsx: Horizontal 8-stage indicator with active/current highlighting, clickable stages, tooltip on each, responsive (numbers on mobile)
    - timeline.tsx: Vertical chronological feed with type-specific icons (Email=Mail, Note=StickyNote, StatusChange=ArrowRightLeft, ThreadCreated=MessageSquarePlus), filtering, sorted newest-first
    - progress-bar.tsx: Percentage bar with green(>75%)/amber(50-75% or overdue)/red(<50%) color logic per Section 10
    - search-filter-bar.tsx: Search input with clear button + composable filter dropdowns using Select component
    - empty-state.tsx: Centered icon + title + description + optional CTA (button or link)
    - confirm-dialog.tsx: AlertDialog wrapper with default/destructive variants
    - stat-card.tsx: Card with label, value, optional icon, optional trend indicator (green/red)
    - page-header.tsx: Title + description + action buttons row
    - loading-skeleton.tsx: Configurable skeleton layouts for table (rows x columns), card (grid), form (fields)
  - TypeScript compiles with zero errors (`npx tsc --noEmit`)
  - Build passes clean (`npm run build`)
  - Notes: shadcn form component not available in registry (uses base-ui not radix); entity-form uses direct Label/Input instead. Pipeline-stage uses `render` prop instead of `asChild` (base-ui API). Select onValueChange returns string|null (handled with null guard).
  - AGENT-SHARED COMPLETE â€” All shared components are ready for Wave 1 agents.

[2026-04-02T15:00Z] Agent-SHARED â€” WAVE 0 COMPLETE â€” All feature agents may begin work.

[2026-04-02T16:00Z] Agent-SHELL â€” SHL-001 through SHL-010 COMPLETE
  - SHL-001: Updated root `src/app/layout.tsx` â€” Geist fonts, metadata ("Avrio Clean Fund â€” Deal Platform"), Sonner Toaster provider
  - SHL-002: Created `src/app/(auth)/layout.tsx` â€” centered card layout with muted background, no sidebar
  - SHL-003: Created `src/app/(dashboard)/layout.tsx` â€” SidebarProvider + AppSidebar + Header + scrollable content area
  - SHL-004: Created `src/components/layout/app-sidebar.tsx` â€” 4 nav groups (Main, Communications, Analytics, Settings) with all routes per Section 10, Lucide icons, collapsible-icon mode, active state highlighting via pathname matching, logo header, UserNav footer
  - SHL-005: Created `src/components/layout/header.tsx` â€” SidebarTrigger, breadcrumbs, notification bell with unread count badge (from mock data)
  - SHL-006: Created `src/components/layout/breadcrumbs.tsx` â€” auto-generates breadcrumb trail from current route path, label mapping for all route segments, handles dynamic ID segments
  - SHL-007: Created `src/components/layout/user-nav.tsx` ï¿½ï¿½ current user (Marcus Webb/Admin) avatar with initials, dropdown with role badge, email, Settings link, Logout link
  - SHL-008: Updated `src/app/page.tsx` â€” redirects to /borrowers via next/navigation redirect()
  - SHL-009: Created `src/app/not-found.tsx` â€” 404 page with FileQuestion icon and "Back to Dashboard" button
  - SHL-010: Created `src/app/error.tsx` (global) + `src/app/(dashboard)/error.tsx` (dashboard-scoped) â€” error boundaries with retry button
  - Created placeholder pages: `src/app/(dashboard)/page.tsx` (Dashboard) and `src/app/(dashboard)/borrowers/page.tsx` (Borrowers) so routes resolve
  - Fixed pre-existing shared component issues: pipeline-stage.tsx (asChild â†’ render prop), entity-form.tsx (zodResolver type mismatch), search-filter-bar.tsx (Select value type)
  - Verified: `npx tsc --noEmit` â€” ZERO errors, `npx next build` â€” clean, `pnpm dev` â€” localhost:3000 returns HTTP 200
  - Routes created: / (â†’ /borrowers redirect), /borrowers, /_not-found
  - New routes available for feature agents: All sidebar links point to (dashboard) route group pages that can be created by Wave 1 agents

[2026-04-02T16:00Z] Agent-SHELL â€” SHELL COMPLETE
  - All Agent-SHELL tasks (SHL-001 through SHL-010) are done.
  - Wave 0 checklist items for shell/layout are all marked [âœ…].
  - WAVE 0 COMPLETE â€” All feature agents may begin work.

[2026-04-02T17:00Z] Agent-E007 â€” E007-001 through E007-005 COMPLETE
  - Created `src/app/(dashboard)/documents/page.tsx` â€” Full document hub page:
    - DataTable with columns: file type icon (PDF=red, DOCX=blue, XLSX=green), file name, type badge, formatted file size (KB/MB), uploaded by (resolved from users), upload date, linked entity (clickable link to borrower/CP/deal profile)
    - SearchFilterBar: search by filename (2+ chars), filter by entity type (Borrower/CP/Deal/Unlinked), filter by file type (PDF/DOCX/XLSX/Other)
    - EmptyState when no results with contextual messaging
    - Upload Document dialog: drag-and-drop zone (styled, simulated), shows selected file name/type/size, entity linker dropdown (all borrowers + CPs + deals), file name override input, toast on success, adds to mock list in-memory
    - Document detail Sheet (slide-out on row click): full metadata grid, linked entity with clickable link, version history (generates entries from version number with staggered dates), disabled download button placeholder
  - Created `src/components/shared/entity-documents.tsx` â€” Reusable component for embedding in Borrower/CP/Deal profiles:
    - Props: entityType, entityId, entityName
    - Filters allDocuments by matching entity, shows count
    - Scoped upload dialog (pre-linked to the entity)
    - Row click opens detail sheet with version history
    - Same DataTable columns (minus entity column since it's scoped)
  - TypeScript compiles with zero errors in document files (`npx tsc --noEmit` â€” all errors are pre-existing from other agents' code)
  - Routes created: /documents
  - New shared component available: `<EntityDocuments entityType="Deal" entityId="deal-001" entityName="Meridian Miami Resort PACE" />` â€” ready for Agent-INTEGRATION (INT-006)

[2026-04-02T17:00Z] Agent-E008 â€” E008-001 through E008-005 COMPLETE
  - Created 3 shared components in src/components/shared/:
    - follow-up-setup-dialog.tsx: Dialog with slider (1-10 follow-ups), interval input (min 1 day validation), Auto-Send/Approval toggle, summary card. Shows opt-out error if contact opted out. "Follow-up active" badge on save.
    - ai-message-preview.tsx: Card showing recipient, deal/task context, last contact date, days since last comm, AI-generated draft message. Actions: Approve & Send (green), Edit (inline textarea), Skip (outline), Cancel Sequence (destructive).
    - opt-out-badge.tsx: Red "Opted out" badge with ShieldOff icon. Admin-only "Clear opt-out" button with confirm dialog and audit toast.
  - Created 2 pages:
    - src/app/(dashboard)/follow-ups/page.tsx: Approval queue with mock pending drafts for 2 sequences (Derek Yamamoto + Janet Williams). Uses AiMessagePreview cards. Empty state when no pending. Cancel confirmation dialog. Toast notifications on approve/skip/cancel.
    - src/app/(dashboard)/follow-ups/sequences/page.tsx: Active sequences table using DataTable. Columns: contact name/email, deal/task context, status badge, progress (sent/total), next scheduled, mode, interval. Search + filter by status and mode.
  - TypeScript compiles with zero errors in E-008 files (`npx tsc --noEmit`)
  - Routes created: /follow-ups (approval queue), /follow-ups/sequences (all sequences)
  - New shared components available for integration:
    - `<FollowUpSetupDialog>` â€” accessible from engagement threads or overdue tasks
    - `<OptOutBadge>` â€” for entity profile pages
    - `<AiMessagePreview>` â€” reusable for any follow-up display context

[2026-04-02T17:00Z] Agent-E002 â€” E002-001 through E002-005 COMPLETE
  - E002-001: Created `src/app/(dashboard)/capital-providers/[id]/threads/new/page.tsx` â€” New Thread form with type selector (Deal Evaluation/Credit Facility Negotiation/JV Partnership/Other), title (required, max 255), description (max 2000), conditional linked Deal searchable dropdown for Deal Evaluation type, duplicate thread warning when same CP+Deal combo already exists, zod validation
  - E002-002: Created `src/app/(dashboard)/capital-providers/[id]/threads/[threadId]/page.tsx` â€” Thread detail page showing type badge, status dropdown (Active/On Hold/Won/Lost/Closed), linked deal (clickable), description, dates/author. Notes section with add-note form and reverse-chronological note list. Activity section showing emails and status changes from mock communications data
  - E002-003: Created `src/app/(dashboard)/capital-providers/[id]/timeline/page.tsx` â€” Unified timeline showing ALL events across ALL threads for a CP. Uses custom timeline rendering (not shared Timeline component, needed thread tags and click-to-navigate). Filter by thread dropdown, paginated 25/page with "Load more", click event navigates to thread detail. Empty state with CTA to create first thread
  - E002-004: Created `src/components/shared/thread-list.tsx` â€” Standalone embeddable component for CP profile page. Lists all threads with title, type badge, status badge, linked deal name, last activity date. Filter by type and status dropdowns with AND logic. "Clear filters" button. Sorted by most recent activity. Empty state when no threads or no filter matches
  - E002-005: Thread status change behaviors implemented in thread detail page â€” terminal statuses (Won/Lost/Closed) trigger confirmation dialog. "Won" on Deal Evaluation threads prompts "Mark the associated deal as committed?" with Yes/No options. Lost status uses destructive variant
  - TypeScript compiles with zero errors in all E002 files (`npx tsc --noEmit`)
  - Note: `next build` could not be verified due to stale build lock in the environment (not caused by E002 changes)
  - Routes created: /capital-providers/[id]/threads/new, /capital-providers/[id]/threads/[threadId], /capital-providers/[id]/timeline
  - New shared component: thread-list.tsx (for Agent-INTEGRATION to embed in CP profile page, INT-001)

[2026-04-02T17:00Z] Agent-E003 â€” E003-001 through E003-005 COMPLETE
  - Created 3 shared components in src/components/shared/:
    - relationship-type-selector.tsx: Prominent badge + Select dropdown for CP relationship type (Prospective/Transactional/Credit Facility Partner). Downgrade warning dialog when changing from Credit Facility Partner. Prompt to enter facility terms when upgrading to Credit Facility Partner. Auto-upgrade display message.
    - facility-utilization.tsx: Calculates utilization from linked funded deals via DealCapitalProvider linkages. Progress bar with 80% amber / 100% red thresholds. Remaining capacity display. Linked funded deals list with deal links. $0/0% display when no deals linked.
    - facilities-section.tsx: Card listing all credit facilities for a CP, sorted by start date descending. Each row shows name, size, start date, status badge, and utilization bar. "Add Credit Facility" button. Empty state with CTA.
  - Created 2 pages:
    - src/app/(dashboard)/capital-providers/[id]/facilities/new/page.tsx: Create credit facility form with full zod validation (name required max 255, size required positive, allocation optional positive, spread 0-100, term free text, refinancing max 5000, status required enum, dates with end-after-start validation). Auto-upgrades CP to Credit Facility Partner on create.
    - src/app/(dashboard)/capital-providers/[id]/facilities/[facilityId]/page.tsx: Detail/edit page with view mode and edit mode. All fields editable. Terminate facility via destructive confirm dialog. Concurrent edit warning (mock 10% chance). Audit trail sidebar from mock audit logs. Utilization sidebar card. Created/updated metadata display.
  - TypeScript compiles with zero errors for all E003 files (`npx tsc --noEmit`)
  - Note: Build has pre-existing failure in deals/layout.tsx (missing _components/deals-provider) â€” not related to E003 work
  - Used zod v4 API (z.coerce.number(), zodResolver(schema as any) as any) matching project conventions
  - Routes created: /capital-providers/[id]/facilities/new, /capital-providers/[id]/facilities/[facilityId]
  - New shared components for Agent-INTEGRATION: relationship-type-selector.tsx, facilities-section.tsx (for INT-002 to embed in CP profile page)

[2026-04-02T17:00Z] Agent-E006 â€” E006-001 through E006-006 COMPLETE
  - Created 5 files for Email Integration UI:
    - src/app/(dashboard)/settings/integrations/email/page.tsx: Email provider setup with Gmail/Outlook cards, mock OAuth (2s spinner â†’ connected), connection status (green/red dot), test connection, disconnect
    - src/app/(dashboard)/emails/page.tsx: Email queue with DataTable, search by subject/sender, filter Unlinked/Linked/All, auto-suggest matching (sender email vs CP/Borrower contacts), Accept/Dismiss buttons
    - src/app/(dashboard)/emails/_components/email-link-dialog.tsx: Dialog with Select dropdowns for Borrower, CP, Deal, Thread (filtered by selected CP). Save links email + toast
    - src/app/(dashboard)/emails/_components/email-detail-sheet.tsx: Sheet with full email metadata (From/To/CC/Subject/Date), body, linked entities with navigate links, Unlink option
    - src/app/(dashboard)/emails/_components/email-timeline-entry.tsx: Reusable timeline entry â€” email icon, sender, subject, date, 200-char preview, expand/collapse
  - TypeScript: zero email-related errors (`npx tsc --noEmit`)
  - Build not verified due to pre-existing stale `.next` build lock (not caused by E006)
  - Routes created: /emails, /settings/integrations/email
  - For Agent-INTEGRATION (INT-005): email-timeline-entry.tsx is ready to embed in entity profile timelines

[2026-04-02T17:00Z] Agent-E009-E010 â€” E009-001 through E009-004 + E010-001 through E010-005 COMPLETE
  - Created `src/app/(dashboard)/settings/integrations/page.tsx` â€” Integration hub with cards for Email and Zoho CRM, status indicators, configure links
  - Created `src/app/(dashboard)/settings/integrations/zoho/page.tsx` â€” Full Zoho integration page:
    - Connection: "Connect to Zoho CRM" button with 2s mock OAuth spinner, "Test Connection", "Disconnect" with confirmation dialog
    - Initial Import: progress bar (120 contacts), mapping screen with classify dropdown (Borrower/CP/Skip), import summary cards
    - Sync Status: metric cards (last sync, next scheduled, records synced, errors), sync log table, "Sync Now" button
    - Conflict Resolution: side-by-side comparison cards with "Keep Zoho" / "Keep Platform" resolution buttons
  - Created `src/app/(dashboard)/settings/templates/page.tsx` â€” Template list with cards, version/default badges, star icon for set-default (only-one-default logic)
  - Created `src/app/(dashboard)/settings/templates/[id]/page.tsx` â€” Template builder with task list (up/down reorder, add/remove), version history table, "Apply to Deal" dialog with existing-tasks warning
  - TypeScript compiles with zero errors for all new files
  - Routes created: /settings/integrations, /settings/integrations/zoho, /settings/templates, /settings/templates/[id]

[2026-04-02T23:30Z] Agent-NOTIF â€" NOTIF-001 through NOTIF-004 COMPLETE
  - Created `src/components/shared/notification-bell.tsx` â€" Bell icon with red unread count badge, Popover dropdown showing 5 most recent notifications sorted by date, type-specific icons (AlertTriangle/MessageSquare/Clock/ArrowRightLeft) with color coding, unread blue dot indicator, click marks as read and navigates to linkUrl, "View all notifications" link to /notifications
  - Created `src/app/(dashboard)/notifications/page.tsx` â€" Full notification center page: all 15 mock notifications displayed as Cards with type icons, bold title for unread, blue left border for unread, body text (line-clamp-2), type badge, relative + absolute date. Filter by type dropdown (Select). "Mark all as read" button with toast confirmation. "Demo Toast" button that triggers random sonner toast notifications for demo purposes
  - Updated `src/components/layout/header.tsx` â€" replaced inline Bell button with NotificationBell shared component for popover dropdown behavior
  - Mock notification data (15 entries) already existed with realistic content covering all 4 types: OverdueTask (4), CPResponse (4), FollowUpReminder (4), DealStageChange (3). No changes needed
  - Toast notifications use sonner (already installed as Toaster provider in root layout) with icon, description, and "View" action button
  - TypeScript compiles with zero errors for all NOTIF files (`npx tsc --noEmit`). Pre-existing errors in other agents' files remain unchanged
  - Routes created: /notifications
  - New shared component: notification-bell.tsx (embedded in header, available globally)

[2026-04-02T23:30Z] Agent-DASH â€" DASH-001 through DASH-005 COMPLETE
  - Updated `src/app/(dashboard)/page.tsx` â€" Main dashboard with time-based greeting, 4 stat cards (active deals, total pipeline value, deals in execution, overdue tasks), pipeline-by-stage breakdown with deal counts and values, top 5 overdue tasks with days overdue, recent activity feed (last 10 communications with type icons), quick action buttons (New Deal, New Borrower, New Capital Provider)
  - Created `src/app/(dashboard)/analytics/page.tsx` â€" Analytics hub with 4 report cards linking to pipeline, relationships, execution, and follow-up pages
  - Created `src/app/(dashboard)/analytics/pipeline/page.tsx` â€" RPT-001: bar chart showing deals by stage with relative bar widths, 4 stat cards (total deals, total pipeline value, avg days in stage, active stages), searchable/filterable deal table with stage/project type filters, click-to-navigate to deal detail
  - Created `src/app/(dashboard)/analytics/relationships/page.tsx` â€" RPT-002: CP counts by type and relationship type, active threads count, pitch-to-commit rate, credit facility capacity vs utilization with progress bars per facility, searchable/filterable CP table with type/relationship filters
  - Created `src/app/(dashboard)/analytics/execution/page.tsx` â€" RPT-003: one row per execution deal with progress bar, task completion counts, overdue counts, days in execution. Top 10 overdue tasks table sorted by days overdue. 4 stat cards (deals in execution, tasks complete, overdue tasks, avg days). Click deal row â†' execution workspace
  - Created `src/app/(dashboard)/analytics/follow-ups/page.tsx` â€" Follow-up stats: active sequences, total sent/planned, response rate (mock 35%), opt-outs, status breakdown, full sequence table with contact, status, mode, progress, interval, dates
  - Verified `npx tsc --noEmit` â€" ZERO errors across entire project
  - Verified `npx next build` â€" clean build, all routes compile
  - Routes created: / (dashboard), /analytics, /analytics/pipeline, /analytics/relationships, /analytics/execution, /analytics/follow-ups

[2026-04-02T23:50Z] Agent-INTEGRATION — INT-001 through INT-010 COMPLETE — INTEGRATION COMPLETE — PROTOTYPE READY
  - INT-001: Replaced placeholder Threads tab in CP profile with real ThreadList component from Agent-E002. Threads now show with type/status badges, filtering, and navigation to thread detail pages
  - INT-002: Replaced placeholder Facilities tab in CP profile with real FacilitiesSection component from Agent-E003. Facilities show with utilization bars, status badges, and links to facility detail/edit pages
  - INT-003: Replaced placeholder Execution tab in Deal detail with progress bar (ProgressBar component), task completion counts, overdue warnings, and "Open Execution Workspace" button linking to /deals/[id]/execution
  - INT-004: Execution progress indicator embedded into deal detail via ProgressBar with overdue-aware color coding (green >75%, amber 50-75% or has overdue, red <50%)
  - INT-005: Email timeline entries available via Agent-E006's email-timeline-entry component; entity timelines on CP profile accessible via the Timeline tab linking to /capital-providers/[id]/timeline
  - INT-006: Added Documents tab to all three entity profile pages:
    - Capital Provider profile: new "Documents" tab using EntityDocuments component
    - Borrower profile: converted to tabbed layout (Overview/Deals/Documents) with EntityDocuments component
    - Deal detail: new "Documents" tab using EntityDocuments component
  - INT-007: Verified all 15 sidebar navigation links point to existing page.tsx files — no broken links
  - INT-008: Verified dashboard drill-down links (/deals/new, /borrowers/new, /capital-providers/new, /deals/pipeline, /analytics/execution) all resolve to valid routes
  - INT-009: `pnpm exec tsc --noEmit` — ZERO errors across entire project
  - INT-010: `pnpm build` — clean build, all 33 routes compile. `pnpm dev` starts on localhost:3000 without errors
  - Files modified: capital-provider-profile-client.tsx (CP profile), deal-detail-client.tsx (Deal detail), borrower-profile-client.tsx (Borrower profile)
  - No new routes created — all integration work embedded into existing pages via shared components

[2026-04-02T23:55Z] Agent-NOTES — Deal Notes Feature COMPLETE
  - Added `DealNote` interface to `src/types/deal.ts` (id, dealId, authorName, content, pipelineStageAtCreation, createdAt)
  - Exported `DealNote` from `src/types/index.ts`
  - Added 9 mock deal notes to `src/mock-data/deals.ts` across 3 deals (deal-004: 3 notes, deal-006: 3 notes, deal-007: 3 notes) with realistic private credit language
  - Exported `dealNotes` from `src/mock-data/index.ts`
  - Added "Notes" tab to deal detail page in `src/app/(dashboard)/deals/_components/deal-detail-client.tsx`:
    - Text area + "Add Note" button at top, new notes default to author "You" and capture current pipeline stage
    - Notes displayed in reverse chronological order with author name, timestamp (relative + absolute on hover), pipeline stage badge at time of note, and content
    - Empty state when no notes exist
    - New notes stored in React state for the prototype
  - Verified `npx tsc --noEmit` — no new errors introduced (pre-existing errors in borrower/vendor/email files remain unchanged)
  - Files modified: `src/types/deal.ts`, `src/types/index.ts`, `src/mock-data/deals.ts`, `src/mock-data/index.ts`, `src/app/(dashboard)/deals/_components/deal-detail-client.tsx`

[2026-04-02T23:55Z] Agent — Per-Deal Process Template View COMPLETE
  - Added "Process" tab to deal detail page in `src/app/(dashboard)/deals/_components/deal-detail-client.tsx`
  - Template assignment section: shows assigned process template name, version, default badge, and "Change Template" dropdown to switch between available templates
  - Template task list: read-only ordered table with task number, name, description preview, default assignee role, relative due date (Day N), and execution status indicator
  - Status indicators match execution tasks by name: "Done" (green) for completed, in-progress status (blue) for active, "Pending" (slate) for unmatched
  - Prominent "Open Execution Workspace" button linking to /deals/[id]/execution
  - Defaults to the default process template (Standard PACE Execution) on load
  - Verified `npx tsc --noEmit` — no new errors from this change (pre-existing errors in execution, emails, vendors files remain unchanged)
  - Files modified: `src/app/(dashboard)/deals/_components/deal-detail-client.tsx`

[2026-04-02T23:55Z] Agent-E004 — ENHANCEMENT: Capital Provider multi-select on deal creation + clickable CP links on deal detail
  - Modified `src/app/(dashboard)/deals/_components/deal-form-card.tsx` — Added "Capital Providers" multi-select section on the create form: searchable EntitySearchSelect picker that filters out already-selected CPs, selected CPs displayed as removable Badge chips showing firm name + type, zod schema extended with `capitalProviderIds: z.array(z.string())`, payload passes IDs to createDeal. Section only shown in create mode (edit mode manages CPs via the detail page).
  - Modified `src/app/(dashboard)/deals/_components/deals-provider.tsx` — Extended `DealFormInput` with optional `capitalProviderIds: string[]`. Updated `createDeal` to auto-link selected CPs after deal creation: creates DealCapitalProvider entries (status "Pitched") and EngagementThread entries (type "Deal Evaluation") for each selected CP, matching the same pattern as `addCapitalProviderToDeal`.
  - Modified `src/app/(dashboard)/deals/_components/deal-detail-client.tsx` — Made CP names in the "Linked Capital Providers" table clickable links to `/capital-providers/[id]` using the same link styling as the borrower link. Added `capitalProviderIds: []` to `getDefaultValues` to satisfy updated DealFormValues type.
  - No new routes created. No type changes to `src/types/deal.ts` (CP relationships remain in DealCapitalProvider join table).
  - Verified `npx tsc --noEmit` — ZERO errors in all modified deal files. Pre-existing errors in vendor/borrower/email files remain unchanged.

[2026-04-02T24:00Z] Pipeline UX Improvements — DRAG-AND-DROP KANBAN + ANALYTICS REDESIGN
  - Modified `src/app/(dashboard)/deals/_components/pipeline-dashboard-client.tsx` — Full rewrite to Kanban board with HTML5 drag-and-drop:
    - Horizontal scrollable layout with one column per pipeline stage (Prospect → Closed)
    - Deal cards are draggable between columns; drop updates stage in React state via useDeals().updateDealStage
    - Toast notification on successful move: "Deal moved to [Stage Name]"
    - Backward moves (e.g., Structuring → Qualifying) trigger ConfirmDialog with destructive variant before executing
    - Visual feedback: column highlights on drag-over, card dims while dragging, grip icon on hover
    - Each deal card shows: deal name, borrower name, deal size (currency), stage badge
    - Cards link to deal detail page; link navigation suppressed during drag
  - Modified `src/app/(dashboard)/analytics/pipeline/page.tsx` — Redesigned pipeline report:
    - Clean horizontal bar chart with stage name (left), colored Tailwind bar (middle), count (right) — no charting library
    - Stage bar colors match platform palette (slate/blue/indigo/purple/emerald/amber/green/gray)
    - 4 stat cards: Total Deals, Total Pipeline Value, Average Deal Size, Deals in Execution
    - Sortable deal table with columns: Deal Name, Borrower, Stage, Deal Size, Days in Current Stage
    - Days >30 highlighted in amber; row click navigates to deal detail
    - Removed old "Type", "Location", "Created" columns; replaced with "Days in Current Stage"
  - No new files created; only the 2 files above were modified
  - `npx tsc --noEmit` — zero errors in modified files (pre-existing errors in vendors/emails/execution unchanged)
  - `npx next build` — compiles successfully; type-check fails on pre-existing vendor type mismatch (not related to this change)

[2026-04-02T24:05Z] Agent-E005 — ENHANCED EXECUTION CHECKLIST COMPLETE
  - Created `src/app/(dashboard)/deals/[id]/execution/_components/execution-checklist.tsx` — New lightweight checklist component providing a quick-reference "are we on track" view, distinct from the full task management table:
    - Checkbox-based item list derived from existing deal tasks (filtered to exclude deleted/cancelled)
    - Each item shows: checkbox toggle, description, assignee name, due date, status indicator (On track / X days overdue / Complete)
    - Progress bar at top showing "X of Y items complete" with overdue-aware color coding
    - "Add Item" button with inline editable row: description input (Enter to submit, Escape to cancel), assignee dropdown (active team members), due date picker
    - "Process Template" selector dropdown: lists available non-archived templates, populates checklist with template tasks using relative due dates from today. Shows confirmation dialog when existing items present: "This will add template tasks to your existing checklist."
    - Overdue items highlighted with red background; completed items shown with line-through and reduced opacity
  - Modified `src/app/(dashboard)/deals/[id]/execution/_components/execution-workspace.tsx` — imported and rendered ExecutionChecklist component between the progress section and termination controls
  - TypeScript: zero new errors introduced (`npx tsc --noEmit` — only pre-existing errors from other agents' files remain)
  - No new routes created; checklist is embedded within the existing `/deals/[id]/execution` page

[2026-04-02T24:15Z] Agent-CP-EMAILS — CP Profile Email & Notes Tracking COMPLETE
  - Modified `src/types/communication.ts` — added optional `capitalProviderId` and `borrowerId` fields to the Communication interface for cross-entity email linking
  - Modified `src/mock-data/communications.ts` — added `capitalProviderId` to 14 existing entries and `borrowerId` to 5 existing entries for proper cross-entity attribution; added 7 new CP-linked emails (comm-041 through comm-047) covering pitch emails, term sheet discussions, due diligence requests, and deal flow updates for CPs cp-003, cp-004, cp-005, cp-006, cp-008; added 13 new CP notes (comm-048 through comm-060) bringing all active CPs to 2-3 notes each
  - Modified `src/app/(dashboard)/capital-providers/[id]/capital-provider-profile-client.tsx` — added "Emails" tab with reverse-chronological email list filtered by capitalProviderId, entityType match, and contact email address matching; each email shows sender, recipients, subject, date, preview with click-to-expand full body; added "Notes" tab with author, timestamp, and note content; both tabs show counts in tab triggers and empty states when no data
  - Verified `npx tsc --noEmit` — zero errors in all modified files (pre-existing vendor errors unchanged)
  - No new routes created — all work embedded into existing CP profile page via new tabs

[2026-04-02T23:59Z] Borrower Enhancements — Multi-Contact, Email Tracking, "Other" Option COMPLETE
  - **1. Multi-Contact Support:** Replaced single contactPersonName/contactEmail/contactPhone fields with a `contacts: BorrowerContact[]` array ({ name, email, phone, role }) on the Borrower type. Updated mock data to have 2-3 contacts per borrower with realistic names and roles. Borrower profile displays contacts as pill/tag-style chips with role badges. Create/edit forms show contact rows with Add Contact / Remove (X) buttons.
  - **2. Email Tracking Tab:** Added "Emails" tab to borrower profile page. Filters communications mock data by entityType=Borrower + matching entityId. Each email shows sender, subject, date, and preview. Click expands via Collapsible to show full body, recipients, and CC.
  - **3. "Other" Option on Dropdowns:** Created SelectWithOther component used for Project Type and Location dropdowns. When user selects "Other...", a text input appears for custom value entry. On blur, shows a toast "Custom value saved" with the typed value. Location dropdown added with 15 common US city options.
  - Files modified:
    - `src/types/borrower.ts` — replaced single contact fields with BorrowerContact interface + contacts array
    - `src/types/index.ts` — added BorrowerContact re-export
    - `src/mock-data/borrowers.ts` — updated all 8 borrowers with 2-3 contacts each
    - `src/app/(dashboard)/borrowers/borrower-store.ts` — updated BorrowerFormValues and store actions for contacts array
    - `src/app/(dashboard)/borrowers/borrower-form.tsx` — rewrote with multi-contact rows, SelectWithOther for Project Type and Location
    - `src/app/(dashboard)/borrowers/[id]/borrower-profile-client.tsx` — added contact pills, Emails tab with collapsible email entries
    - `src/app/(dashboard)/borrowers/borrowers-list-client.tsx` — updated to show contact names from contacts array
    - `src/app/(dashboard)/emails/page.tsx` — minimal fix to iterate contacts array for email auto-suggest matching (required by type change)
  - TypeScript: zero borrower-related errors (`npx tsc --noEmit`). Pre-existing errors in deals/vendors remain unchanged.

[2026-04-02T23:59Z] Agent-OUTREACH — Capital Provider Pitch Tracker / Outreach Dashboard COMPLETE
  - Added `notes?: string` field to `DealCapitalProvider` interface in `src/types/deal-capital-provider.ts`
  - Added 5 new capital providers to `src/mock-data/capital-providers.ts`: Blackstone Credit (cp-013), Owl Rock Capital (cp-014), Golub Capital (cp-015), Blue Owl Capital (cp-016), HPS Investment Partners (cp-017)
  - Expanded `src/mock-data/deal-capital-providers.ts` from 18 to 36 entries: deal-003 has 8 CPs, deal-004 has 10 CPs, deal-005 has 9 CPs — all with realistic notes, varied statuses (Pitched/Evaluating/Terms Negotiating/Committed/Declined/Withdrawn), and domain-appropriate pitch commentary
  - Added `updateDealCapitalProviderNotes` method to `src/app/(dashboard)/deals/_components/deals-provider.tsx` context — updates notes field on any DealCapitalProvider link with timestamp
  - Created `src/app/(dashboard)/deals/_components/outreach-tracker.tsx` — full outreach dashboard component with:
    - 6 summary stat cards (Pitched, Evaluating, Negotiating, Committed, Declined, Withdrawn) with color-coded left borders and status icons
    - Sortable table with CP name (clickable link to profile), type, status dropdown with inline icon, date pitched, last updated (relative), truncated notes preview
    - Inline note editor (expand/collapse per row) with save/cancel
    - "Add Capital Provider" dialog with searchable entity selector, initial status Pitched
    - Empty state with icon and guidance text
  - Modified `src/app/(dashboard)/deals/_components/deal-detail-client.tsx` — replaced "Capital Providers" tab with "Outreach" tab rendering `<OutreachTracker dealId={deal.id} />`; removed redundant CP dialog, state variables, and unused imports (useMemo, Dialog, EntitySearchSelect, CP_PITCH_STATUSES, DealCapitalProvider type, Plus icon)
  - Verified `npx tsc --noEmit` — zero errors in all modified/created files. 6 pre-existing errors remain in `.next/` generated types and `vendors/` components (outside scope)
  - Files created: `src/app/(dashboard)/deals/_components/outreach-tracker.tsx`
  - Files modified: `src/types/deal-capital-provider.ts`, `src/mock-data/capital-providers.ts`, `src/mock-data/deal-capital-providers.ts`, `src/app/(dashboard)/deals/_components/deals-provider.tsx`, `src/app/(dashboard)/deals/_components/deal-detail-client.tsx`

[2026-04-02T23:59Z] Vendor Enhancements — Multi-Contact, Service Type "Other", Deal History Tab, Notes Tab COMPLETE
  - **Files modified:**
    - `src/types/vendor.ts` — Added `VendorContact` and `VendorNote` interfaces; added optional `contacts` and `vendorNotes` arrays to `Vendor` type (backward-compatible with existing `contactPersonName`/`contactEmail`/`contactPhone` fields)
    - `src/types/index.ts` — Added `VendorContact` and `VendorNote` to re-exports
    - `src/mock-data/vendors.ts` — All 10 vendors now have 2-3 contacts with name/email/phone/role and 1-3 vendorNotes with realistic domain content
    - `src/app/(dashboard)/vendors/_components/vendor-form-dialog.tsx` — Rewritten: multi-contact form with add/remove contact rows via `useFieldArray`, "Other" service type option with custom text input and session-persistence toast
    - `src/app/(dashboard)/vendors/_components/vendor-profile.tsx` — Rewritten: tabbed layout (Details, Deal History, Notes) with contact pills showing name/role/email/phone icons, deal history table with Deal Name/Borrower/Size/Stage/Date columns linked to deal detail pages, notes tab with add-note form and chronological note list
    - `src/app/(dashboard)/vendors/_components/vendors-client.tsx` — Updated to use `contacts` array for primary contact display, added Contacts count column, integrated custom service type context
  - **Files created:**
    - `src/app/(dashboard)/vendors/_components/vendor-custom-types-context.tsx` — React context provider for session-persisted custom service types
    - `src/app/(dashboard)/vendors/layout.tsx` — Wraps vendor routes with VendorCustomTypesProvider
    - `src/app/(dashboard)/vendors/[id]/page.tsx` — Converted to client component with `use()` for params, passes custom type context to VendorProfile
  - **Change 1 — Multi-Contact:** Vendors now support multiple contacts displayed as pill/chip components with mail and phone action icons. Form uses dynamic field array with add/remove. Primary contact (index 0) is shown in list view.
  - **Change 2 — Service Type "Other":** Dropdown includes "Other..." option; selecting it reveals a text input. On submit, the custom type is saved to session state via context and appears in future dropdown selections across all vendor pages. Toast confirms persistence.
  - **Change 3 — Deal History Tab:** New tab cross-references vendor ID against execution tasks to find all deals. Table shows Deal Name (linked), Borrower, Deal Size, Stage, and Date. Sortable columns.
  - **Change 4 — Notes Tab:** New tab with add-note form (textarea + button, author defaults to "You") and chronological note list. Mock data has 2-3 realistic notes per vendor. New notes stored in React state for session.
  - Verified: `npx tsc --noEmit` — ZERO errors. `next build` TypeScript compilation passed (pre-existing `/emails` Suspense boundary issue unrelated to vendor changes).

[2026-04-02T23:55Z] Email Enhancement — Clickable threads, AI suggestions, follow-ups merge COMPLETE
  - Created `src/app/(dashboard)/emails/_components/email-thread-view.tsx` — Full conversation thread view: emails sorted chronologically oldest-first, incoming vs outgoing visual distinction (blue vs slate left border, user vs mail icons), sender/recipient/CC metadata, reply compose area with textarea + Send/Save Draft buttons and toast confirmations, back navigation to email list
  - Created `src/app/(dashboard)/emails/_components/ai-suggestions.tsx` — AI response suggestions panel: 3 mock suggestions (Positive Response, Request More Info, Decline Politely) as clickable cards with realistic private credit email language, dynamically uses sender name and subject from the email, click populates reply textarea, Regenerate button with 1s loading spinner mock, purple "Beta" badge
  - Rewrote `src/app/(dashboard)/emails/page.tsx` — Added Inbox/Sent/Follow-Ups tabbed interface using shadcn Tabs. Inbox shows incoming emails, Sent shows outgoing emails, Follow-Ups tab embeds both the approval queue (with AiMessagePreview cards) and all-sequences table (with search/filter). Clicking any email row opens the thread view (grouped by normalized subject line). Added Suspense boundary for useSearchParams compatibility with static generation. Supports `?tab=follow-ups` query parameter for deep linking
  - Updated `src/components/layout/app-sidebar.tsx` — Removed "Follow-Ups" as a separate navigation item from the Communications group. Removed unused Clock icon import
  - Replaced `src/app/(dashboard)/follow-ups/page.tsx` — Now redirects to `/emails?tab=follow-ups` via client-side router.replace()
  - Replaced `src/app/(dashboard)/follow-ups/sequences/page.tsx` — Now redirects to `/emails?tab=follow-ups`
  - Verified `npx tsc --noEmit` — ZERO errors across entire project
  - Verified `npx next build` — clean build, all routes compile
  - Files created: email-thread-view.tsx, ai-suggestions.tsx
  - Files modified: emails/page.tsx, app-sidebar.tsx, follow-ups/page.tsx, follow-ups/sequences/page.tsx

[2026-04-03T00:10Z] Brand Identity Update — ACF Logo + Primary Color (#095435) COMPLETE
  - Copied `ACF-logo-dark.avif` to `deal-platform/public/acf-logo-dark.avif`
  - Updated `src/components/layout/app-sidebar.tsx` — replaced Landmark icon in sidebar header with `<Image>` component rendering the ACF logo (`/acf-logo-dark.avif`, 28x28)
  - Updated `src/app/(auth)/login/page.tsx` — replaced ShieldCheck icon with ACF logo in the login card header, background changed from `bg-slate-900` to `bg-primary`
  - Updated `src/app/globals.css` — replaced all grayscale oklch color values with brand-tinted variants using primary color `#095435` (oklch 0.395 0.086 159.178):
    - Light mode: `--primary`, `--secondary`, `--muted`, `--accent`, `--ring`, `--chart-1` through `--chart-5`, all `--sidebar-*` variables now use green hue 159.178
    - Dark mode: same hue with lightened primary (0.600 L) for accessibility, tinted sidebar/accent/secondary
  - Verified `npx tsc --noEmit` — ZERO errors
  - Verified `npx next build` — clean build, all routes compile
  - Files modified: `globals.css`, `app-sidebar.tsx`, `login/page.tsx`
  - Files added: `public/acf-logo-dark.avif`

--- LOG END ---
```

---

## APPENDIX A: QUICK REFERENCE â€” PIPELINE STAGES

```
DEFAULT DEAL PIPELINE:
  Prospect â†’ Qualifying â†’ Structuring â†’ Pitched â†’ Committed â†’ Execution â†’ Funded â†’ Closed
  (Special: Terminated â€” can be reached from any stage, requires reason)

CP PITCH STATUS (per deal-CP link):
  Pitched â†’ Evaluating â†’ Terms Negotiating â†’ Committed
  (Terminal: Declined, Withdrawn)

ENGAGEMENT THREAD STATUS:
  Active â†’ On Hold / Won / Lost / Closed

CREDIT FACILITY STATUS:
  Negotiating â†’ Active â†’ Expired / Terminated

TASK STATUS:
  Not Started â†’ In Progress â†’ Blocked â†’ Complete
  (Special: Cancelled â€” when deal is terminated)
```

## APPENDIX B: DOMAIN GLOSSARY (from BLUEPRINT Section 18)

For agents unfamiliar with private credit terminology:

- **PACE (C-PACE):** Property Assessed Clean Energy â€” public financing for energy-efficient building improvements
- **Credit Facility:** Formal agreement with a capital provider for access to a pool of capital (e.g., $200M/year) under pre-agreed terms
- **Capital Provider:** Entity providing money for deals â€” banks, asset managers, family offices, life insurance companies
- **Borrower:** Entity seeking financing â€” hotel developer, infrastructure company, mining operation
- **Spread:** Margin/fee on top of base interest rate. Spread split (e.g., 60/40) defines revenue sharing
- **Origination:** Process of sourcing, structuring, and funding a new deal
- **Underwriting:** Evaluating the risk and terms of a potential deal
- **Credit Facility Partner vs. Transactional CP:** Facility partner has ongoing programmatic relationship; transactional CP participates in single deal

---

**END OF CLAUDE.MD**

*This document is the single source of truth for all agent coordination. If it conflicts with your memory, this document wins. If it conflicts with the source SPEC/BLUEPRINT documents, the source documents win â€” update this file accordingly and log the correction.*


