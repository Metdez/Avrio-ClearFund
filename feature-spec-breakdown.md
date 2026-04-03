# FEATURE SPEC BREAKDOWN — MULTI-CHANNEL DEAL & RELATIONSHIP MANAGEMENT PLATFORM

**Source Document:** Software Blueprint v0.1 — Draft from Transcript
**Breakdown Version:** v1.0
**Date Created:** April 2, 2026
**Created By:** Prompt Engineering / Product Spec
**Status:** Ready for Engineering Review

---

## PART 1: EPIC SUMMARY TABLE

| Epic ID | Epic Name | Source Feature ID | Priority | Total Stories | Blocked By | Blocks | Open Questions Count |
|---------|-----------|-------------------|----------|---------------|------------|--------|----------------------|
| E-001 | Dual-Sided Relationship Management (Borrowers + Capital Providers) | F-001 | P0 | 6 | None | E-002, E-003, E-004, E-006, E-007 | 1 |
| E-002 | Multi-Thread Relationship Tracking per Capital Provider | F-002 | P0 | 5 | E-001 | E-004, E-006 | 1 |
| E-003 | Capital Provider Type Classification | F-003 | P0 | 4 | E-001 | E-004 | 2 |
| E-004 | Deal Pipeline & Status Tracking | F-004 | P0 | 6 | E-001, E-002 | E-005 | 1 |
| E-005 | Deal Execution / Post-Agreement Task Management | F-005 | P0 | 7 | E-004 | E-010 | 2 |
| E-006 | Email Integration & Conversation Capture | F-006 | P1 | 6 | E-001, E-002 | E-008 | 3 |
| E-007 | Centralized Document & Communication Hub | F-007 | P1 | 5 | E-001, E-004 | None | 1 |
| E-008 | AI-Powered Follow-Up & Outreach Automation | F-008 | P2 | 5 | E-006 | None | 2 |
| E-009 | Zoho CRM Integration | F-009 | P1 | 5 | E-001, E-004 | None | 3 |
| E-010 | Standardized Process Templates | F-010 | P1 | 4 | E-005 | None | 1 |

---

## PART 2: DEPENDENCY MAP

### Build Order Logic

**Tier 1 — Can be built immediately with no dependencies on other epics:**
- E-001 (Dual-Sided Relationship Management)

**Tier 2 — Requires at least one Tier 1 epic to be complete:**
- E-002 (Multi-Thread Relationship Tracking) → depends on E-001
- E-003 (Capital Provider Type Classification) → depends on E-001
- E-007 (Centralized Document & Communication Hub) → depends on E-001
- E-009 (Zoho CRM Integration) → depends on E-001

**Tier 3 — Requires at least one Tier 2 epic to be complete:**
- E-004 (Deal Pipeline & Status Tracking) → depends on E-001, E-002
- E-006 (Email Integration & Conversation Capture) → depends on E-001, E-002

**Tier 4 — Requires at least one Tier 3 epic to be complete:**
- E-005 (Deal Execution / Post-Agreement Task Management) → depends on E-004
- E-008 (AI-Powered Follow-Up & Outreach Automation) → depends on E-006

**Tier 5 — Requires at least one Tier 4 epic to be complete:**
- E-010 (Standardized Process Templates) → depends on E-005

### Critical Path

E-001 → E-002 → E-004 → E-005 → E-010

This is the longest dependency chain and determines the earliest possible completion date for the full build. Every delay in this chain delays the entire project.

### Parallel Tracks

The following epics have no dependency relationship with each other and can be built simultaneously:

- **Track A (after E-001):** E-002, E-003, E-007, E-009 — all four can be built in parallel once E-001 is complete
- **Track B (after E-002):** E-004 and E-006 can be built in parallel once E-002 is complete
- **Track C (after E-004):** E-005 can proceed; E-007 (document hub linking to deals) can finalize
- **Track D (after E-006):** E-008 can proceed independently of E-005/E-010

---

## PART 3: INFRASTRUCTURE AND FOUNDATIONAL STORIES

---

**INFRA-001: User Authentication and Session Management**
- **Type:** Infrastructure / Foundation
- **Priority:** P0
- **Complexity:** Medium
- **Description:** The platform must have a user authentication system supporting email/password login with multi-factor authentication (MFA). Sessions must be managed securely with token expiration, refresh, and forced logout capabilities. This is foundational — no feature can be used without authenticated access.
- **Required By:** All Epics (E-001 through E-010)
- **Acceptance Criteria:**
  - [ ] A user can register with an email address and password
  - [ ] A user can log in with valid credentials and receive an authenticated session
  - [ ] A user can enable and use MFA (TOTP-based at minimum)
  - [ ] Sessions expire after a configurable inactivity period (default 30 minutes)
  - [ ] A user can log out, which invalidates their session immediately
  - [ ] Passwords are stored using a modern hashing algorithm (bcrypt, argon2, or equivalent)
  - [ ] Failed login attempts are rate-limited (max 5 attempts per 15 minutes per account)
  - [ ] Account lockout occurs after 10 consecutive failed attempts and requires admin unlock or email reset
- **Edge Cases and Error Handling:**
  - User enters incorrect password → clear error message ("Invalid email or password"), no indication of which field is wrong
  - Session token is tampered with → session is invalidated, user is redirected to login
  - MFA code expires → user must request a new code; clear messaging about expiry
  - Browser cookies are disabled → graceful degradation with clear messaging
- **Dependencies:** None — can start immediately
- **Open Questions:** Does the team use an identity provider (Google Workspace, Microsoft 365) that would support SSO? (Related to OQ-001 — email provider may indicate identity provider)

---

**INFRA-002: Role-Based Access Control (RBAC)**
- **Type:** Infrastructure / Foundation
- **Priority:** P0
- **Complexity:** Medium
- **Description:** The platform must enforce role-based permissions. At minimum three roles are required: Admin (full access to all records, settings, and user management), Deal Team (full read/write on deals, relationships, and vendor management), and Read-Only (view-only access to all records). Role assignments must be manageable by Admin users.
- **Required By:** All Epics (E-001 through E-010)
- **Acceptance Criteria:**
  - [ ] The system supports at least three roles: Admin, Deal Team, Read-Only
  - [ ] An Admin can create, edit, and deactivate user accounts
  - [ ] An Admin can assign and change roles for any user
  - [ ] A Deal Team user can create, read, and update Borrower, Capital Provider, Deal, Task, and Vendor records
  - [ ] A Read-Only user can view all records but cannot create, update, or delete any record
  - [ ] Attempting an unauthorized action returns a clear "Permission denied" message and logs the attempt
  - [ ] Role changes take effect immediately without requiring the affected user to log out and back in
- **Edge Cases and Error Handling:**
  - Admin attempts to remove Admin role from the last remaining Admin → system prevents this action with a clear error message
  - User's role is changed while they are mid-session → permissions update in real time; any in-progress unauthorized action is blocked on submission
  - Deactivated user attempts to log in → login fails with a generic "Invalid credentials" message (do not reveal account status)
- **Dependencies:** INFRA-001 (Authentication)
- **Open Questions:** OQ-006 — How many people are on the team, and what are their specific roles? (Determines whether additional roles beyond Admin/Deal Team/Read-Only are needed)

---

**INFRA-003: Core Database Schema and Data Model**
- **Type:** Infrastructure / Foundation
- **Priority:** P0
- **Complexity:** Large
- **Description:** The foundational data model must be established, including the core entity tables (Borrower, Capital Provider, Deal, Credit Facility, Task, Third-Party Vendor, Communication Record, User) and their relationships as defined in blueprint Section 8. All entities must support soft deletion (archiving) rather than hard deletion. Every table must include audit fields (created_by, created_at, updated_by, updated_at).
- **Required By:** All Epics (E-001 through E-010)
- **Acceptance Criteria:**
  - [ ] Database tables exist for: User, Borrower, Capital Provider, Deal, Credit Facility, Task, Third-Party Vendor, Communication Record
  - [ ] All foreign key relationships match the blueprint: Borrower has many Deals; Deal belongs to one Borrower; Deal has many Capital Provider engagement threads; Capital Provider has many engagement threads; Credit Facility belongs to one Capital Provider; Credit Facility has many Deals; Task belongs to one Deal; Communication belongs to one or more entities
  - [ ] Every record has created_by, created_at, updated_by, updated_at fields that are auto-populated
  - [ ] Soft deletion is implemented via an is_archived boolean and archived_at timestamp — no records are ever hard-deleted
  - [ ] All text fields support UTF-8 encoding
  - [ ] Primary keys use UUIDs, not auto-incrementing integers
- **Edge Cases and Error Handling:**
  - Attempt to create a record with a required field missing → database-level constraint rejects the insert; application returns a specific validation error
  - Attempt to create a duplicate record (same name + same type) → system warns of potential duplicate but allows creation (not a hard constraint — real-world entities may share names)
  - Foreign key violation (e.g., linking a deal to a non-existent borrower) → rejected at the database level; application returns a clear error
- **Dependencies:** None — can start immediately (in parallel with INFRA-001)
- **Open Questions:** OQ-007 — What specific fields are tracked in credit facility agreements? (Affects Credit Facility table schema)

---

**INFRA-004: Audit Logging System**
- **Type:** Infrastructure / Foundation
- **Priority:** P0
- **Complexity:** Medium
- **Description:** Every create, update, delete (archive), and access action on any record must be logged to an immutable audit trail. Given that "data security in private credit is priority number one," the audit log is a non-negotiable foundational component. Logs must capture who performed the action, what changed, when, and from what IP address.
- **Required By:** All Epics, NFR-001, NFR-003
- **Acceptance Criteria:**
  - [ ] Every create, update, and archive action on any entity generates an audit log entry
  - [ ] Each audit log entry includes: user_id, action_type (create/update/archive/access), entity_type, entity_id, timestamp, IP address, and a diff of changed fields (for updates)
  - [ ] Audit logs are append-only — no log entry can be modified or deleted by any user, including admins
  - [ ] Audit logs can be queried by entity, user, action type, and date range
  - [ ] Audit log queries return results within 5 seconds for up to 100,000 log entries
- **Edge Cases and Error Handling:**
  - Audit logging fails (e.g., log storage is full) → the triggering action must still succeed, but an alert must be sent to the system administrator immediately
  - Bulk operations (e.g., archiving multiple records) → each individual record change generates its own audit log entry
- **Dependencies:** INFRA-003 (Database Schema), INFRA-001 (User Authentication — to capture user_id)
- **Open Questions:** OQ-005 — Are there regulatory compliance requirements (SOC2, FINRA) that dictate audit log retention periods?

---

**INFRA-005: Base API Structure and Error Handling**
- **Type:** Infrastructure / Foundation
- **Priority:** P0
- **Complexity:** Medium
- **Description:** The platform must have a consistent, well-structured API layer that all frontend features interact with. This includes standardized request/response formats, error codes, pagination, and rate limiting. All API endpoints must require authentication (except login/register).
- **Required By:** All Epics
- **Acceptance Criteria:**
  - [ ] All API responses follow a consistent JSON envelope format: `{ "data": ..., "meta": { "page", "per_page", "total" }, "errors": [...] }`
  - [ ] All API endpoints (except auth endpoints) require a valid authentication token
  - [ ] API errors return appropriate HTTP status codes (400 for validation, 401 for auth, 403 for permissions, 404 for not found, 500 for server errors) with a human-readable error message
  - [ ] List endpoints support pagination with configurable page size (default 25, max 100)
  - [ ] List endpoints support sorting by at least created_at, updated_at, and name
  - [ ] API rate limiting is enforced at 100 requests per minute per user
  - [ ] Rate limit exceeded returns HTTP 429 with a Retry-After header
- **Edge Cases and Error Handling:**
  - Malformed JSON in request body → HTTP 400 with message "Invalid request format"
  - Request body exceeds size limit (10MB) → HTTP 413 with message "Request body too large"
  - Unsupported HTTP method on an endpoint → HTTP 405 with message "Method not allowed"
- **Dependencies:** INFRA-001 (Authentication)
- **Open Questions:** None

---

**INFRA-006: Frontend Application Shell and Navigation**
- **Type:** Infrastructure / Foundation
- **Priority:** P0
- **Complexity:** Medium
- **Description:** The browser-based application must have a responsive shell with navigation, page routing, and a consistent layout. The navigation must provide access to: Dashboard, Borrowers, Capital Providers, Deals, Vendors, Settings. The interface must be intuitive for non-technical users — the team comes from leveraged finance and investment backgrounds with almost no AI or technology knowledge.
- **Required By:** All Epics
- **Acceptance Criteria:**
  - [ ] The application loads in a browser at a configurable URL
  - [ ] Navigation includes links to: Dashboard, Borrowers, Capital Providers, Deals, Vendors, Settings
  - [ ] Navigation highlights the currently active section
  - [ ] Pages load within 2 seconds on a standard broadband connection
  - [ ] The layout is responsive and usable on screens from 1024px wide to 2560px wide
  - [ ] A loading indicator is displayed when data is being fetched
  - [ ] A global error boundary catches unhandled errors and displays a user-friendly error message rather than a blank screen
- **Edge Cases and Error Handling:**
  - User navigates to a non-existent URL path → displays a "Page not found" message with a link to the Dashboard
  - Session expires while user is on a page → on the next action, user is redirected to the login page with a message "Your session has expired. Please log in again."
  - Network connectivity is lost → a persistent banner appears: "You are offline. Changes will not be saved until connectivity is restored."
- **Dependencies:** INFRA-001 (Authentication), INFRA-002 (RBAC — navigation items may vary by role)
- **Open Questions:** None

---

**INFRA-007: Data Encryption at Rest and in Transit**
- **Type:** Infrastructure / Foundation
- **Priority:** P0
- **Complexity:** Small
- **Description:** All data must be encrypted at rest (database, file storage) and in transit (HTTPS/TLS). This is non-negotiable per the client's explicit statement: "Data security in private credit is priority number one."
- **Required By:** All Epics
- **Acceptance Criteria:**
  - [ ] All API traffic is served over HTTPS with TLS 1.2 or higher
  - [ ] HTTP requests are redirected to HTTPS automatically
  - [ ] Database storage is encrypted at rest using AES-256 or equivalent
  - [ ] File/document storage is encrypted at rest
  - [ ] Encryption keys are managed through a dedicated key management service, not stored in application code
- **Edge Cases and Error Handling:**
  - TLS certificate expires → automated renewal must be in place; if renewal fails, an alert is sent to the system administrator 7 days before expiry
- **Dependencies:** None — can start immediately
- **Open Questions:** OQ-005 — Compliance requirements may dictate specific encryption standards

---

## PART 4: FEATURE-LEVEL STORY BREAKDOWN

---

### EPIC E-001: Dual-Sided Relationship Management (Borrowers + Capital Providers)
**Source:** Blueprint Feature F-001
**Priority:** P0
**Epic Description:** The system must maintain two distinct entity types — Borrowers and Capital Providers — each with their own profiles, relationship histories, and pipeline stages. These two sides must be linkable through Deals. This is the foundational data model that every other feature builds on. Without this, the platform has no core entities to manage.
**Epic Acceptance Criteria (Definition of Done):**
- [ ] A user can create, view, edit, and archive both Borrower and Capital Provider records as distinct entity types
- [ ] A Deal record can be linked to one Borrower and one or more Capital Providers
- [ ] Viewing a Borrower shows all associated deals; viewing a Capital Provider shows all associated deals
- [ ] The two entity types have distinct profile layouts and field sets

---

**Story E-001-S001: Create Borrower Record**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a Deal Team Member
- **Action:** I want to create a new Borrower record with basic profile information
- **Outcome:** So that the borrower exists in the system and can be linked to deals
- **Detailed Description:** The user navigates to the Borrowers section and clicks a "New Borrower" button. A form is displayed with fields for the borrower's information. Upon saving, the borrower record is created and the user is taken to the borrower's profile page.
- **Acceptance Criteria:**
  - [ ] Given a user is on the Borrowers list page, When they click "New Borrower," Then a creation form is displayed
  - [ ] Given the creation form is displayed, When the user fills in at least the required fields (company/individual name) and clicks Save, Then a new Borrower record is created and the user is redirected to the new borrower's profile page
  - [ ] Given the form is displayed, When the user clicks Save without filling in the required field (name), Then a validation error is displayed inline next to the missing field: "Borrower name is required"
  - [ ] Given a Borrower is created, Then an audit log entry is generated with the creator's user ID, timestamp, and all field values
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** User creates a Borrower with the same name as an existing Borrower → system displays a warning "A borrower with this name already exists. Do you want to continue?" with options to view the existing record or proceed with creation
  - **Error State 1:** Server error during save → form data is preserved in the browser, error message displayed: "Unable to save. Please try again." with a retry button
  - **Error State 2:** Session expires during form entry → upon clicking Save, user is redirected to login; after login, user is returned to the form with data preserved if possible
- **Input Validation Rules:**
  - Company/Individual Name: required, max 255 characters, must not be only whitespace
  - Contact Info (email): optional, must be valid email format if provided
  - Contact Info (phone): optional, must be valid phone format if provided
  - Project Type: optional, selected from a configurable dropdown
  - Location: optional, free text, max 500 characters
- **Dependencies:**
  - **Blocked By:** INFRA-001, INFRA-002, INFRA-003, INFRA-005, INFRA-006
  - **Blocks:** E-001-S003, E-001-S005
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Creates: Borrower entity
- **Open Questions:** What specific fields are needed on Borrower profiles beyond name, contact info, project type, and location? (OQ from F-001)

---

**Story E-001-S002: Create Capital Provider Record**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a Capital Raising Team Member
- **Action:** I want to create a new Capital Provider record with basic profile information
- **Outcome:** So that the capital provider exists in the system and can be linked to deals and engagement threads
- **Detailed Description:** The user navigates to the Capital Providers section and clicks a "New Capital Provider" button. A form is displayed with fields for the capital provider's information, including firm name, contact person(s), and type (bank, asset manager, family office, life insurance company). Upon saving, the record is created and the user is taken to the capital provider's profile page.
- **Acceptance Criteria:**
  - [ ] Given a user is on the Capital Providers list page, When they click "New Capital Provider," Then a creation form is displayed
  - [ ] Given the creation form is displayed, When the user fills in at least the required fields (firm name) and clicks Save, Then a new Capital Provider record is created and the user is redirected to the new record's profile page
  - [ ] Given the form is displayed, When the user clicks Save without filling in the required field (firm name), Then a validation error is displayed: "Firm name is required"
  - [ ] Given a Capital Provider is created, Then the record includes a type field with options: Bank, Asset Manager, Family Office, Life Insurance Company, Other
  - [ ] Given a Capital Provider is created, Then an audit log entry is generated
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** User creates a Capital Provider with the same firm name as an existing record → system displays a duplicate warning with option to view existing or proceed
  - **Error State 1:** Server error during save → form data preserved, error message displayed with retry option
- **Input Validation Rules:**
  - Firm Name: required, max 255 characters, must not be only whitespace
  - Contact Person Name: optional, max 255 characters
  - Contact Email: optional, valid email format
  - Contact Phone: optional, valid phone format
  - Type: required, selected from predefined options (Bank, Asset Manager, Family Office, Life Insurance Company, Other)
- **Dependencies:**
  - **Blocked By:** INFRA-001, INFRA-002, INFRA-003, INFRA-005, INFRA-006
  - **Blocks:** E-001-S004, E-001-S005, E-002-S001, E-003-S001
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Creates: Capital Provider entity
- **Open Questions:** None

---

**Story E-001-S003: View and Edit Borrower Profile**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a Deal Team Member
- **Action:** I want to view a Borrower's full profile and edit their information
- **Outcome:** So that I can review the borrower's details, see all associated deals, and keep their information current
- **Detailed Description:** The borrower profile page displays all stored information about the borrower, a list of all associated deals (with current status), and any notes. The user can click an "Edit" button to modify any field. Changes are saved and an audit log entry is generated.
- **Acceptance Criteria:**
  - [ ] Given a Borrower record exists, When the user navigates to the Borrower's profile, Then all stored fields are displayed including name, contact info, project type, location, and creation date
  - [ ] Given a Borrower has associated Deals, When viewing the profile, Then a "Deals" section lists all linked deals with deal name, status, and capital provider(s) — ordered by most recent first
  - [ ] Given a Borrower has no associated Deals, When viewing the profile, Then the Deals section displays "No deals yet" with a "Create Deal" button
  - [ ] Given the user clicks "Edit," When they modify fields and click Save, Then the changes are persisted and an audit log entry records the old and new values
  - [ ] Given the user clicks "Edit" and then "Cancel," Then no changes are saved and the profile reverts to its previous state
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Two users edit the same Borrower simultaneously → the second user to save receives a conflict warning: "This record has been modified by another user. Please refresh and try again."
  - **Error State 1:** Borrower record is archived → profile displays with a banner "This borrower has been archived" and edit is disabled unless user is Admin
- **Input Validation Rules:** Same as E-001-S001
- **Dependencies:**
  - **Blocked By:** E-001-S001
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads and Updates: Borrower entity; Reads: Deal entity
- **Open Questions:** None

---

**Story E-001-S004: View and Edit Capital Provider Profile**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a Capital Raising Team Member
- **Action:** I want to view a Capital Provider's full profile and edit their information
- **Outcome:** So that I can review the capital provider's details, see all associated deals and engagement threads, and keep their information current
- **Detailed Description:** The Capital Provider profile page displays all stored information, a list of all associated deals, engagement threads, credit facility status (if applicable), and relationship type. The user can edit any field. The profile serves as the single source of truth for the relationship.
- **Acceptance Criteria:**
  - [ ] Given a Capital Provider record exists, When the user navigates to the profile, Then all stored fields are displayed including firm name, contact person(s), type, relationship type, and creation date
  - [ ] Given a Capital Provider has associated Deals, When viewing the profile, Then a "Deals" section lists all linked deals with deal name, status, and role
  - [ ] Given the user clicks "Edit," When they modify fields and click Save, Then changes are persisted with an audit log entry
  - [ ] Given the user clicks "Edit" and then "Cancel," Then no changes are saved
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Concurrent edit conflict → same handling as E-001-S003
  - **Error State 1:** Archived record → same handling as E-001-S003
- **Input Validation Rules:** Same as E-001-S002
- **Dependencies:**
  - **Blocked By:** E-001-S002
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads and Updates: Capital Provider entity; Reads: Deal entity, Engagement Thread entity
- **Open Questions:** None

---

**Story E-001-S005: Borrower and Capital Provider List Views with Search and Filtering**
- **Priority:** P0
- **Complexity:** Medium
- **User:** As any user
- **Action:** I want to view a list of all Borrowers or all Capital Providers with search and filter capabilities
- **Outcome:** So that I can quickly find any entity without scrolling through the entire list
- **Detailed Description:** The Borrowers list page and Capital Providers list page each display a paginated table of records. Each list includes a search bar (searches by name) and filters (by type for Capital Providers, by project type for Borrowers). The list shows key summary fields and links to the full profile.
- **Acceptance Criteria:**
  - [ ] Given the user navigates to the Borrowers list, Then a paginated table displays all non-archived Borrowers sorted by name (ascending) by default
  - [ ] Given the user navigates to the Capital Providers list, Then a paginated table displays all non-archived Capital Providers sorted by name (ascending) by default
  - [ ] Given the user types in the search bar, When they enter 2 or more characters, Then the list filters to records whose name contains the search term (case-insensitive)
  - [ ] Given the Capital Providers list, When the user selects a Type filter (e.g., "Bank"), Then only Capital Providers of that type are shown
  - [ ] Given the Borrowers list, When the user selects a Project Type filter, Then only Borrowers of that project type are shown
  - [ ] Given search and filters are applied, When the user clears them, Then the full unfiltered list is restored
  - [ ] Given more than 25 records exist, Then pagination controls are displayed (Previous / Next / page numbers)
  - [ ] Given the user clicks a row in the list, Then they are navigated to that entity's profile page
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** No records match the search/filter → display "No results found. Try adjusting your search or filters." instead of an empty table
  - **Edge Case 2:** Search term contains special characters → treat as literal characters, do not break the query
  - **Error State 1:** API call to load list fails → display "Unable to load data. Please try again." with a retry button
- **Input Validation Rules:**
  - Search bar: max 255 characters
- **Dependencies:**
  - **Blocked By:** E-001-S001, E-001-S002
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads: Borrower entity, Capital Provider entity
- **Open Questions:** None

---

**Story E-001-S006: Archive (Soft Delete) Borrower and Capital Provider Records**
- **Priority:** P0
- **Complexity:** Small
- **User:** As an Admin
- **Action:** I want to archive a Borrower or Capital Provider record that is no longer active
- **Outcome:** So that inactive records do not clutter active lists but remain accessible for historical reference
- **Detailed Description:** Admins can archive a Borrower or Capital Provider from their profile page. Archived records are hidden from default list views but can be revealed with an "Include archived" toggle. Archived records cannot be edited by non-Admin users.
- **Acceptance Criteria:**
  - [ ] Given an Admin is on an entity's profile page, When they click "Archive," Then a confirmation dialog is displayed: "Are you sure you want to archive [Name]? This will hide the record from default views."
  - [ ] Given the Admin confirms archival, Then the record is soft-deleted (is_archived = true, archived_at = current timestamp) and the user is returned to the list view
  - [ ] Given a non-Admin user views an entity profile, Then no "Archive" button is displayed
  - [ ] Given the list view, When the user enables "Show archived," Then archived records appear with a visual indicator (e.g., greyed out or labeled "Archived")
  - [ ] Given an archived record has associated active Deals, When the user attempts to archive it, Then the system displays a warning: "This record has [X] active deals. Archiving will not affect those deals, but the record will be hidden from default views."
  - [ ] Given an entity is archived, Then an audit log entry is generated
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** An Admin archives and then wants to restore → provide an "Unarchive" button on archived records (Admin only)
  - **Error State 1:** Archive fails due to server error → record remains active, error message displayed
- **Dependencies:**
  - **Blocked By:** E-001-S001, E-001-S002, INFRA-002
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Updates: Borrower entity or Capital Provider entity (is_archived, archived_at fields)
- **Open Questions:** None

---

### EPIC E-002: Multi-Thread Relationship Tracking per Capital Provider
**Source:** Blueprint Feature F-002
**Priority:** P0
**Epic Description:** The system must allow multiple concurrent "engagement threads" per Capital Provider. Each thread represents a distinct business context: a specific deal evaluation, a credit facility negotiation, or a JV partnership discussion. Each thread has its own status, conversation history, and timeline — while all threads roll up to a single Capital Provider profile. This is the feature that directly addresses the core CRM limitation the client described.
**Epic Acceptance Criteria (Definition of Done):**
- [ ] A Capital Provider can have multiple simultaneous engagement threads
- [ ] Each thread has its own type, status, notes, and conversation history
- [ ] A unified timeline view shows all interactions across threads in chronological order
- [ ] Users can filter threads by type (deal-specific, credit facility, JV partnership)

---

**Story E-002-S001: Create Engagement Thread on Capital Provider**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a Capital Raising Team Member
- **Action:** I want to create a new engagement thread on a Capital Provider's profile
- **Outcome:** So that I can track a distinct business context (deal pitch, credit facility negotiation, JV discussion) separately from other conversations with the same provider
- **Detailed Description:** From a Capital Provider's profile page, the user clicks "New Thread." They select a thread type (Deal Evaluation, Credit Facility Negotiation, JV Partnership, Other) and provide a title and optional description. If the thread type is "Deal Evaluation," the user must link it to an existing Deal record. The thread is created and appears on the Capital Provider's profile.
- **Acceptance Criteria:**
  - [ ] Given a user is on a Capital Provider's profile, When they click "New Thread," Then a form is displayed with fields for thread type, title, and description
  - [ ] Given the thread type "Deal Evaluation" is selected, Then a required field appears to link an existing Deal record (searchable dropdown)
  - [ ] Given the user fills in required fields and clicks Save, Then the thread is created and appears in the Engagement Threads section of the Capital Provider's profile
  - [ ] Given a thread is created, Then it has a default status of "Active" and a creation timestamp
  - [ ] Given a thread is created, Then an audit log entry is generated
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** User tries to create a Deal Evaluation thread for a deal that already has a thread with this Capital Provider → system warns: "A thread for this deal already exists with this capital provider. View existing thread?" with option to proceed anyway
  - **Error State 1:** Linked Deal record does not exist (deleted between selection and save) → validation error: "The selected deal no longer exists. Please choose another."
- **Input Validation Rules:**
  - Thread Type: required, selected from predefined options
  - Title: required, max 255 characters
  - Description: optional, max 2000 characters
  - Linked Deal: required if thread type is "Deal Evaluation"
- **Dependencies:**
  - **Blocked By:** E-001-S002 (Capital Provider must exist)
  - **Blocks:** E-002-S002, E-002-S003, E-002-S004
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Creates: Engagement Thread entity; Reads: Capital Provider, Deal
- **Open Questions:** OQ — How many concurrent threads does a typical capital provider have?

---

**Story E-002-S002: View and Update Engagement Thread**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a Capital Raising Team Member
- **Action:** I want to view and update an engagement thread's status, notes, and details
- **Outcome:** So that the thread reflects the current state of the engagement and all team members can see the latest status
- **Detailed Description:** Clicking on a thread from the Capital Provider's profile opens the thread detail view showing type, status, linked deal (if applicable), description, notes, and conversation history. The user can update the status (Active, On Hold, Won, Lost, Closed) and add notes.
- **Acceptance Criteria:**
  - [ ] Given a thread exists, When the user clicks on it, Then the thread detail view is displayed with all stored information
  - [ ] Given the thread detail view, When the user changes the status dropdown, Then the status is updated immediately and an audit log entry records the change
  - [ ] Given the thread detail view, When the user adds a note and clicks Save, Then the note is appended to the thread's notes section with the user's name and timestamp
  - [ ] Given multiple notes exist on a thread, Then notes are displayed in reverse chronological order (newest first)
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** User changes status to "Won" on a Deal Evaluation thread → system prompts: "Mark the associated deal as committed?" (optional linkage to deal pipeline update)
  - **Error State 1:** Save fails → note content is preserved in the browser, error message displayed
- **Dependencies:**
  - **Blocked By:** E-002-S001
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads and Updates: Engagement Thread entity
- **Open Questions:** What are the status stages for credit facility negotiations vs. deal evaluations? (OQ from F-002)

---

**Story E-002-S003: Unified Timeline View Across All Threads**
- **Priority:** P0
- **Complexity:** Medium
- **User:** As a Capital Raising Team Member
- **Action:** I want to see a unified chronological timeline of all interactions with a Capital Provider across all their engagement threads
- **Outcome:** So that I can get a complete picture of the relationship without switching between individual threads
- **Detailed Description:** On the Capital Provider's profile page, a "Timeline" tab displays all events across all threads in a single chronological feed. Events include: thread creation, status changes, notes added, and (in Phase 2) emails. Each event shows which thread it belongs to. The user can filter the timeline by thread.
- **Acceptance Criteria:**
  - [ ] Given a Capital Provider has multiple threads with activity, When the user clicks the "Timeline" tab on the profile, Then all events across all threads are displayed in reverse chronological order
  - [ ] Given a timeline event, Then it displays: event type (note, status change, thread created), timestamp, user who performed the action, thread title, and content preview
  - [ ] Given the timeline, When the user selects a thread filter, Then only events from the selected thread are displayed
  - [ ] Given the timeline has many events, Then it paginates (25 events per page) with "Load more" functionality
  - [ ] Given a timeline event, When the user clicks on it, Then they are navigated to the corresponding thread detail view
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Capital Provider has no activity → timeline displays "No activity yet. Create a thread to get started."
  - **Edge Case 2:** A thread is archived → its events still appear in the timeline but are visually muted with an "Archived thread" label
- **Dependencies:**
  - **Blocked By:** E-002-S001, E-002-S002
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads: Engagement Thread, Notes, Audit Log entries related to threads
- **Open Questions:** None

---

**Story E-002-S004: Filter Engagement Threads by Type**
- **Priority:** P0
- **Complexity:** Small
- **User:** As any user
- **Action:** I want to filter a Capital Provider's engagement threads by type
- **Outcome:** So that I can quickly focus on, for example, only credit facility negotiations or only deal evaluations
- **Detailed Description:** The Engagement Threads section on the Capital Provider's profile includes a filter dropdown that allows the user to show All, Deal Evaluations only, Credit Facility Negotiations only, JV Partnerships only, or Other. A secondary filter allows filtering by thread status (Active, On Hold, Won, Lost, Closed).
- **Acceptance Criteria:**
  - [ ] Given a Capital Provider has threads of multiple types, When the user selects "Deal Evaluations" from the type filter, Then only Deal Evaluation threads are displayed
  - [ ] Given the user selects "Active" from the status filter, Then only Active threads are displayed
  - [ ] Given both filters are applied, Then threads must match both filters (AND logic)
  - [ ] Given filters are active, Then a "Clear filters" link is visible and resets the view to show all threads
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** No threads match the applied filters → display "No threads match your filters."
- **Dependencies:**
  - **Blocked By:** E-002-S001
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads: Engagement Thread
- **Open Questions:** None

---

**Story E-002-S005: Archive Engagement Thread**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a Deal Team Member or Capital Raising Team Member
- **Action:** I want to archive an engagement thread that is no longer active
- **Outcome:** So that completed or abandoned threads do not clutter the active view but remain accessible for historical reference
- **Detailed Description:** Users can archive a thread from the thread detail view. Archived threads are hidden from the default view but visible when the "Show archived" toggle is enabled on the Capital Provider's profile. Thread events remain in the unified timeline.
- **Acceptance Criteria:**
  - [ ] Given a user is on a thread detail view, When they click "Archive," Then a confirmation dialog is displayed
  - [ ] Given the user confirms, Then the thread is soft-deleted and hidden from the default Engagement Threads list
  - [ ] Given a thread is archived, Then its events still appear in the unified timeline but with a visual indicator
  - [ ] Given the "Show archived" toggle is enabled, Then archived threads reappear in the list with an "Archived" label
  - [ ] Given a thread is archived, Then an audit log entry is generated
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Thread has a linked active Deal → warning: "This thread is linked to an active deal. Archiving the thread will not affect the deal."
- **Dependencies:**
  - **Blocked By:** E-002-S001
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Updates: Engagement Thread (is_archived)
- **Open Questions:** None

---

### EPIC E-003: Capital Provider Type Classification
**Source:** Blueprint Feature F-003
**Priority:** P0
**Epic Description:** The system must classify Capital Providers into relationship types (Transactional, Credit Facility Partner, Prospective Partner) and store credit facility terms for Credit Facility Partners. This classification determines how the system displays and manages the relationship.
**Epic Acceptance Criteria (Definition of Done):**
- [ ] Every Capital Provider record has a relationship type field
- [ ] Credit Facility Partner records include fields for facility terms
- [ ] The system can display how much of a credit facility has been utilized

---

**Story E-003-S001: Set and Update Capital Provider Relationship Type**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a Capital Raising Team Member
- **Action:** I want to set and update the relationship type for a Capital Provider
- **Outcome:** So that the system correctly classifies each provider and I can filter by relationship type
- **Detailed Description:** The Capital Provider profile includes a "Relationship Type" field with options: Prospective, Transactional, Credit Facility Partner. This can be set during creation or updated at any time. Changing to "Credit Facility Partner" prompts the user to enter facility terms (handled in E-003-S002).
- **Acceptance Criteria:**
  - [ ] Given a Capital Provider record, Then a "Relationship Type" field is displayed with options: Prospective, Transactional, Credit Facility Partner
  - [ ] Given a new Capital Provider is created, Then the default relationship type is "Prospective"
  - [ ] Given a user changes the relationship type, Then the change is saved immediately and an audit log entry is generated
  - [ ] Given a user changes the type to "Credit Facility Partner," Then the system prompts: "Would you like to enter credit facility terms now?" with Yes/Later options
  - [ ] Given the Capital Providers list view, Then users can filter by relationship type
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** User changes from "Credit Facility Partner" back to "Transactional" → warning: "This will not delete existing credit facility records. The facility data will be preserved but the provider will no longer be classified as a Credit Facility Partner."
- **Dependencies:**
  - **Blocked By:** E-001-S002
  - **Blocks:** E-003-S002
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Updates: Capital Provider entity (relationship_type field)
- **Open Questions:** Are there other relationship types beyond Prospective, Transactional, and Credit Facility Partner (e.g., JV Partner, Co-Lender)? (OQ from F-003)

---

**Story E-003-S002: Record Credit Facility Terms**
- **Priority:** P0
- **Complexity:** Medium
- **User:** As a Capital Raising Team Member
- **Action:** I want to record the terms of a credit facility agreement with a Capital Provider
- **Outcome:** So that all team members can see the facility size, terms, and how much has been utilized
- **Detailed Description:** For Capital Providers classified as "Credit Facility Partner," a Credit Facility section is available on their profile. The user can create a credit facility record with fields for facility size (dollar amount), annual allocation, spread split, term length, refinancing provisions, and status (Negotiating, Active, Expired, Terminated). Multiple facilities can exist per Capital Provider (e.g., if terms are renegotiated over time).
- **Acceptance Criteria:**
  - [ ] Given a Capital Provider is classified as "Credit Facility Partner," Then a "Credit Facilities" section appears on their profile
  - [ ] Given the user clicks "Add Credit Facility," Then a form is displayed with fields: Facility Name, Facility Size ($), Annual Allocation ($), Spread Split (%), Term Length, Refinancing Provisions (text), Status, Start Date, End Date
  - [ ] Given the user fills in required fields (Facility Name, Facility Size, Status) and clicks Save, Then the credit facility record is created
  - [ ] Given a credit facility exists, Then it is displayed on the Capital Provider's profile with all terms visible
  - [ ] Given multiple credit facilities exist for one Capital Provider, Then they are listed in reverse chronological order by start date
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** User enters a facility size of $0 → validation error: "Facility size must be greater than zero"
  - **Edge Case 2:** User sets an end date before the start date → validation error: "End date must be after start date"
  - **Error State 1:** Facility is created for a Capital Provider whose type is not "Credit Facility Partner" → system automatically updates the relationship type to "Credit Facility Partner" with an audit log entry
- **Input Validation Rules:**
  - Facility Name: required, max 255 characters
  - Facility Size: required, positive number, max 15 digits
  - Annual Allocation: optional, positive number
  - Spread Split: optional, numeric percentage (0-100)
  - Term Length: optional, free text (e.g., "5 years," "Evergreen")
  - Refinancing Provisions: optional, max 5000 characters
  - Status: required, from predefined options (Negotiating, Active, Expired, Terminated)
  - Start Date: optional, valid date
  - End Date: optional, valid date, must be after Start Date if both are provided
- **Dependencies:**
  - **Blocked By:** E-003-S001
  - **Blocks:** E-003-S003
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Creates: Credit Facility entity; Reads: Capital Provider entity
- **Open Questions:** OQ-007 — What specific fields and terms are tracked in a credit facility agreement?

---

**Story E-003-S003: Credit Facility Utilization Tracking**
- **Priority:** P0
- **Complexity:** Medium
- **User:** As a Capital Raising Team Member
- **Action:** I want to see how much of a credit facility has been utilized across deals
- **Outcome:** So that I know how much capacity remains before we need to source additional capital
- **Detailed Description:** When deals are funded under a credit facility (linked during deal creation or deal execution), the system calculates total utilization (sum of deal amounts funded under this facility) and displays it as a utilization bar and percentage on the credit facility record. This is a read-only calculated field based on linked deals.
- **Acceptance Criteria:**
  - [ ] Given a credit facility exists and has deals linked to it, Then the facility record displays: Total Utilized ($), Remaining Capacity ($), Utilization Percentage
  - [ ] Given a deal funded under this facility is marked as "Funded," Then the utilization figures update automatically
  - [ ] Given utilization exceeds 80% of facility size, Then a visual warning indicator is displayed (e.g., amber bar)
  - [ ] Given utilization reaches 100%, Then a visual alert is displayed (e.g., red bar) with message "Facility fully utilized"
  - [ ] Given a deal linked to this facility is cancelled or terminated, Then its amount is removed from the utilization calculation
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** No deals are linked to the facility → utilization shows $0 / 0%
  - **Edge Case 2:** Facility size is updated after deals are already linked → utilization recalculates based on new facility size
- **Dependencies:**
  - **Blocked By:** E-003-S002, E-004-S001 (Deals must exist to be linked)
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads: Credit Facility, Deal (amounts funded under facility)
- **Open Questions:** None

---

**Story E-003-S004: View and Edit Credit Facility Record**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a Capital Raising Team Member
- **Action:** I want to view and edit the terms of an existing credit facility
- **Outcome:** So that I can update terms when they change (renegotiation, amendment) while preserving the audit trail
- **Detailed Description:** Users can view all fields of a credit facility record and edit any field. All changes are logged in the audit trail with before/after values.
- **Acceptance Criteria:**
  - [ ] Given a credit facility exists, When the user views it, Then all fields are displayed
  - [ ] Given the user clicks "Edit," Then all editable fields become modifiable
  - [ ] Given the user saves changes, Then changes are persisted and an audit log entry records old and new values for every changed field
  - [ ] Given the user changes the status to "Terminated," Then a confirmation dialog is displayed: "Are you sure you want to terminate this facility? This will affect utilization calculations."
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Concurrent edit conflict → same handling as E-001-S003
- **Dependencies:**
  - **Blocked By:** E-003-S002
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads and Updates: Credit Facility entity
- **Open Questions:** None

---

### EPIC E-004: Deal Pipeline & Status Tracking
**Source:** Blueprint Feature F-004
**Priority:** P0
**Epic Description:** The system must provide deal pipeline views tracking deals through defined stages from origination through funding. A single deal connects a Borrower to one or more Capital Providers. Each deal-to-Capital-Provider relationship has its own status. Dashboard views must show aggregate pipeline value and deal counts by stage.
**Epic Acceptance Criteria (Definition of Done):**
- [ ] Deals can be created and linked to a Borrower and one or more Capital Providers
- [ ] Deals move through defined pipeline stages
- [ ] A pipeline dashboard shows deals by stage with aggregate values
- [ ] Each Capital Provider pitch per deal has its own status

---

**Story E-004-S001: Create Deal Record**
- **Priority:** P0
- **Complexity:** Medium
- **User:** As a Deal Team Member
- **Action:** I want to create a new Deal record linked to a Borrower
- **Outcome:** So that the deal is tracked in the system from origination forward
- **Detailed Description:** The user creates a deal by selecting a Borrower (existing or new), entering deal details (project type, location, estimated deal size, financing structure breakdown), and saving. The deal is placed in the first pipeline stage automatically.
- **Acceptance Criteria:**
  - [ ] Given the user clicks "New Deal," Then a creation form is displayed
  - [ ] Given the form is displayed, Then the user must select or create a Borrower (required)
  - [ ] Given the form includes fields for: Deal Name, Project Type, Location, Estimated Deal Size ($), Traditional Financing (%), PACE/Public Financing (%), and Notes
  - [ ] Given the user fills in required fields (Deal Name, Borrower) and clicks Save, Then the deal is created with a default status of the first pipeline stage
  - [ ] Given a deal is created, Then it appears on the linked Borrower's profile under "Deals"
  - [ ] Given a deal is created, Then an audit log entry is generated
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Traditional Financing % + PACE Financing % does not equal 100% → warning (not an error): "Financing percentages do not total 100%. This may be intentional for partial structures."
  - **Edge Case 2:** Deal size is $0 or negative → validation error: "Deal size must be a positive number"
  - **Error State 1:** Selected Borrower was archived between selection and save → error: "The selected borrower has been archived. Please select an active borrower or restore the archived record."
- **Input Validation Rules:**
  - Deal Name: required, max 255 characters
  - Borrower: required, must be an existing non-archived Borrower record
  - Project Type: optional, from configurable dropdown
  - Location: optional, max 500 characters
  - Estimated Deal Size: optional, positive number, max 15 digits
  - Traditional Financing %: optional, 0-100
  - PACE Financing %: optional, 0-100
  - Notes: optional, max 5000 characters
- **Dependencies:**
  - **Blocked By:** E-001-S001 (Borrowers must exist)
  - **Blocks:** E-004-S002, E-004-S003, E-004-S004, E-005-S001
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Creates: Deal entity; Reads: Borrower entity
- **Open Questions:** OQ-002 — What are the exact pipeline stages?

---

**Story E-004-S002: Link Capital Providers to a Deal**
- **Priority:** P0
- **Complexity:** Medium
- **User:** As a Deal Team Member
- **Action:** I want to link one or more Capital Providers to a Deal and track the pitch status for each
- **Outcome:** So that I can manage which providers have been pitched, who is evaluating, and who has committed
- **Detailed Description:** From a Deal's detail page, the user can add Capital Providers to the deal. Each link creates a deal-level engagement entry with its own status (Pitched, Evaluating, Terms Negotiating, Committed, Declined, Withdrawn). Adding a Capital Provider to a deal also creates an engagement thread on the Capital Provider's profile (from E-002).
- **Acceptance Criteria:**
  - [ ] Given a Deal exists, When the user clicks "Add Capital Provider" on the deal detail page, Then a searchable dropdown of existing Capital Providers is displayed
  - [ ] Given the user selects a Capital Provider and clicks Add, Then a deal-capital-provider linkage is created with a default status of "Pitched"
  - [ ] Given a linkage is created, Then an engagement thread of type "Deal Evaluation" is automatically created on the Capital Provider's profile for this deal
  - [ ] Given multiple Capital Providers are linked to a deal, Then the deal detail page shows all linked providers with their individual statuses
  - [ ] Given the user changes a Capital Provider's status on the deal, Then the status updates and an audit log entry is generated
  - [ ] Given a Capital Provider's status is changed to "Committed," Then a notification is triggered (NOTIF-004: Deal Stage Change)
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** User tries to link a Capital Provider that is already linked to this deal → system prevents the duplicate: "This capital provider is already linked to this deal."
  - **Edge Case 2:** Capital Provider is archived → system prevents linking: "This capital provider has been archived. Restore it first to link it to a deal."
  - **Edge Case 3:** An engagement thread already exists for this Capital Provider and Deal → system links to the existing thread rather than creating a duplicate
- **Dependencies:**
  - **Blocked By:** E-004-S001, E-001-S002, E-002-S001
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** NOTIF-004 (when status changes to key stages)
- **Data Involved:** Creates: Deal-Capital Provider linkage, Engagement Thread; Reads: Deal, Capital Provider
- **Open Questions:** None

---

**Story E-004-S003: Update Deal Pipeline Stage**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a Deal Team Member
- **Action:** I want to move a deal to a different pipeline stage
- **Outcome:** So that the pipeline view reflects the current state of every deal
- **Detailed Description:** The deal detail page includes a pipeline stage indicator. The user can advance or regress the deal's stage. Certain stage transitions trigger special behavior (e.g., moving to "Execution" triggers E-005 task generation).
- **Acceptance Criteria:**
  - [ ] Given a Deal exists, Then the current pipeline stage is prominently displayed on the deal detail page
  - [ ] Given the user clicks on the stage indicator, Then all available stages are displayed and the user can select a new stage
  - [ ] Given the user selects a new stage and confirms, Then the deal's stage is updated and an audit log entry is generated
  - [ ] Given a deal is moved to "Execution" stage (or equivalent), Then the deal execution task checklist is triggered (see E-005)
  - [ ] Given a deal is moved to a new stage, Then a notification is triggered (NOTIF-004)
  - [ ] Given the user selects the current stage again, Then no change occurs
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Deal is moved backward in the pipeline (e.g., from "Execution" back to "Structuring") → system allows it with a confirmation: "Are you sure you want to move this deal back to [Stage]?"
  - **Edge Case 2:** Deal is moved to "Funded" but has incomplete execution tasks → warning: "This deal has [X] incomplete execution tasks. Are you sure you want to mark it as Funded?"
- **Dependencies:**
  - **Blocked By:** E-004-S001
  - **Blocks:** E-005-S001 (stage transition triggers task generation)
- **Integration Touchpoints:** None
- **Notification Triggers:** NOTIF-004
- **Data Involved:** Updates: Deal entity (pipeline_stage field)
- **Open Questions:** OQ-002 — What are the exact pipeline stages?

---

**Story E-004-S004: Deal Pipeline Dashboard View**
- **Priority:** P0
- **Complexity:** Medium
- **User:** As a CEO / Senior Leadership
- **Action:** I want to see a visual overview of all deals by pipeline stage
- **Outcome:** So that I can understand the health of our deal pipeline at a glance without opening individual deal records
- **Detailed Description:** The Dashboard page includes a Deal Pipeline view showing all active deals grouped by pipeline stage. Each stage shows the count of deals and the total estimated value. Users can click into any stage to see the list of deals in that stage, and click on a deal to go to its detail page.
- **Acceptance Criteria:**
  - [ ] Given the user navigates to the Dashboard, Then a pipeline visualization is displayed showing all pipeline stages as columns or sections
  - [ ] Given each stage, Then the count of active deals and the sum of estimated deal sizes are displayed
  - [ ] Given deals exist in a stage, Then each deal is shown as a card/row with Deal Name, Borrower Name, Estimated Size, and days in current stage
  - [ ] Given the user clicks on a deal card, Then they are navigated to the deal's detail page
  - [ ] Given the pipeline is empty (no deals), Then a message is displayed: "No deals in the pipeline. Create a deal to get started."
  - [ ] Given filters for Project Type and Location are available, When the user applies a filter, Then the pipeline updates to show only matching deals
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** A deal has no estimated size → it contributes $0 to the stage total and displays "TBD" for deal size
  - **Edge Case 2:** 50+ deals in a single stage → the stage view paginates or scrolls without breaking the layout
- **Dependencies:**
  - **Blocked By:** E-004-S001, E-004-S003
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads: Deal entity (aggregations)
- **Open Questions:** None

---

**Story E-004-S005: View and Edit Deal Detail Page**
- **Priority:** P0
- **Complexity:** Medium
- **User:** As a Deal Team Member
- **Action:** I want to view all details about a deal and edit any field
- **Outcome:** So that I have a single page with the complete picture of any deal — borrower, capital providers, pipeline stage, financing structure, and notes
- **Detailed Description:** The deal detail page is the central hub for a deal. It displays all deal fields, the linked borrower, all linked capital providers with their statuses, pipeline stage, key dates, notes, and (when available) execution tasks. All fields are editable by Deal Team members.
- **Acceptance Criteria:**
  - [ ] Given a Deal record exists, When the user navigates to the deal detail page, Then all fields are displayed: Deal Name, Borrower (linked), Project Type, Location, Estimated Deal Size, Financing Structure, Pipeline Stage, Notes, Created Date, Last Updated Date
  - [ ] Given the deal has linked Capital Providers, Then a "Capital Providers" section lists each linked provider with status
  - [ ] Given the deal is in "Execution" stage, Then an "Execution Tasks" section is displayed (see E-005)
  - [ ] Given the user clicks "Edit," Then fields become modifiable and a Save/Cancel button pair appears
  - [ ] Given the user saves changes, Then changes persist with an audit log entry
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Deal is linked to an archived Borrower → Borrower name is displayed with an "(Archived)" label; link still works
  - **Edge Case 2:** Concurrent edit conflict → standard handling
- **Dependencies:**
  - **Blocked By:** E-004-S001, E-004-S002
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads and Updates: Deal entity; Reads: Borrower, Capital Provider, Engagement Thread, Task
- **Open Questions:** None

---

**Story E-004-S006: Deal List View with Search, Filtering, and Sorting**
- **Priority:** P0
- **Complexity:** Medium
- **User:** As any user
- **Action:** I want to view a list of all deals with search, filter, and sort capabilities
- **Outcome:** So that I can find any deal quickly by name, stage, borrower, or other criteria
- **Detailed Description:** The Deals list page displays a paginated table of all active deals. The user can search by deal name or borrower name, filter by pipeline stage, project type, and geography, and sort by deal name, estimated size, date created, or last updated.
- **Acceptance Criteria:**
  - [ ] Given the user navigates to the Deals list, Then a paginated table displays all non-archived Deals with columns: Deal Name, Borrower, Pipeline Stage, Estimated Size, Last Updated
  - [ ] Given the user types in the search bar, When they enter 2+ characters, Then the list filters to deals whose name or linked borrower name contains the term
  - [ ] Given the user selects a Pipeline Stage filter, Then only deals in that stage are shown
  - [ ] Given the user clicks a column header, Then the list sorts by that column (toggles ascending/descending)
  - [ ] Given the user clicks a row, Then they navigate to the deal's detail page
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** No deals match filters → "No deals match your criteria"
  - **Error State 1:** API failure → "Unable to load deals. Please try again."
- **Dependencies:**
  - **Blocked By:** E-004-S001
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads: Deal, Borrower
- **Open Questions:** None

---

### EPIC E-005: Deal Execution / Post-Agreement Task Management
**Source:** Blueprint Feature F-005
**Priority:** P0
**Epic Description:** Once a deal moves to the execution phase, the system must provide a task-based execution workspace. Tasks are generated from templates (or manually), assigned to internal team members or third-party vendor names, and tracked through to completion. This replaces the current chaos of untracked, unstandardized execution processes.
**Epic Acceptance Criteria (Definition of Done):**
- [ ] A deal in execution phase displays a configurable task checklist
- [ ] Each task has an assignee, status, and due date
- [ ] All team members can see real-time task status
- [ ] Overdue tasks are flagged automatically

---

**Story E-005-S001: Auto-Generate Execution Task Checklist When Deal Enters Execution**
- **Priority:** P0
- **Complexity:** Medium
- **User:** As a Deal Team Member
- **Action:** I want the system to automatically create a checklist of execution tasks when a deal moves to the "Execution" pipeline stage
- **Outcome:** So that I have a complete list of everything that needs to happen without manually creating each task from memory
- **Detailed Description:** When a deal's pipeline stage changes to "Execution" (triggered from E-004-S003), the system auto-generates a set of tasks from a default template. Each task has a name, description, default assignee (if configured), and a relative due date (e.g., "7 days from execution start"). The user is taken to the deal's Execution tab to review and customize the generated tasks.
- **Acceptance Criteria:**
  - [ ] Given a deal is moved to the "Execution" pipeline stage, Then the system auto-generates execution tasks from the current default template
  - [ ] Given tasks are generated, Then each task has: Name, Description, Status ("Not Started"), Assignee (default from template or unassigned), Due Date (calculated from execution start date + relative offset)
  - [ ] Given tasks are generated, Then the user is notified and can view the task list on the deal's Execution tab
  - [ ] Given the deal was already in Execution and is moved back and then to Execution again, Then the system does not regenerate tasks — it preserves the existing task list and displays a message: "Execution tasks already exist for this deal."
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** No default template exists → system creates the deal in Execution with an empty task list and displays: "No task template is configured. Add tasks manually or configure a template in Settings."
  - **Edge Case 2:** Template has 0 tasks → same as no template
  - **Error State 1:** Task generation fails mid-process → rollback all generated tasks for this deal, display error, allow manual trigger to retry
- **Dependencies:**
  - **Blocked By:** E-004-S003 (pipeline stage transition)
  - **Blocks:** E-005-S002, E-005-S003
- **Integration Touchpoints:** None
- **Notification Triggers:** NOTIF-004 (deal stage change to Execution)
- **Data Involved:** Creates: Task entities (multiple); Reads: Deal, Process Template
- **Open Questions:** OQ-003 — What is the standard deal execution checklist? OQ-010 — What are the different deal types and do they have different checklists?

---

**Story E-005-S002: Manually Create, Edit, and Delete Execution Tasks**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a Deal Team Member
- **Action:** I want to manually add, edit, or remove execution tasks on a deal
- **Outcome:** So that I can customize the task list for each deal's unique requirements beyond the default template
- **Detailed Description:** From the deal's Execution tab, users can add new tasks, edit existing tasks (name, description, assignee, due date), and delete tasks that are not applicable to this deal. Deleted tasks are soft-deleted and can be restored.
- **Acceptance Criteria:**
  - [ ] Given the user is on the deal's Execution tab, When they click "Add Task," Then a form appears with fields: Task Name, Description, Assignee, Due Date
  - [ ] Given the user fills in required fields (Task Name) and saves, Then the task is added to the list
  - [ ] Given an existing task, When the user clicks "Edit," Then all fields become editable
  - [ ] Given the user saves edits, Then changes persist with an audit log entry
  - [ ] Given the user clicks "Delete" on a task, Then a confirmation is displayed and the task is soft-deleted
  - [ ] Given a task is soft-deleted, Then it can be restored via a "Show deleted tasks" toggle
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** User adds a task with a due date in the past → warning: "Due date is in the past. Are you sure?"
  - **Edge Case 2:** User tries to delete a task that is "Complete" → warning: "This task is marked as complete. Are you sure you want to delete it?"
- **Input Validation Rules:**
  - Task Name: required, max 255 characters
  - Description: optional, max 2000 characters
  - Assignee: optional, free text (can be internal team member name or third-party vendor name)
  - Due Date: optional, valid date
- **Dependencies:**
  - **Blocked By:** E-005-S001 (execution tab must exist)
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Creates, Updates, Soft-Deletes: Task entity
- **Open Questions:** None

---

**Story E-005-S003: Update Task Status**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a Deal Team Member
- **Action:** I want to update the status of an execution task
- **Outcome:** So that all team members can see the real-time progress of deal execution
- **Detailed Description:** Each task has a status that can be changed by clicking a dropdown or status toggle. Available statuses: Not Started, In Progress, Blocked, Complete. Changing status to "Blocked" requires the user to enter a reason. Status changes are timestamped and logged.
- **Acceptance Criteria:**
  - [ ] Given a task exists, Then its current status is displayed with a dropdown to change it
  - [ ] Given the user changes the status, Then the change is saved immediately with a timestamp and audit log entry
  - [ ] Given the user changes status to "Blocked," Then a required text field appears for "Reason Blocked" (max 1000 characters)
  - [ ] Given the user changes status to "Complete," Then the completion date is auto-recorded
  - [ ] Given a task status changes, Then the deal's overall execution progress indicator updates (e.g., "8 of 12 tasks complete — 67%")
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** User changes from "Complete" back to "In Progress" → allowed; completion date is cleared; audit log records the reversal
  - **Edge Case 2:** User changes from "Blocked" to another status → "Reason Blocked" is preserved in the task history but the block indicator is removed
- **Dependencies:**
  - **Blocked By:** E-005-S001
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None (overdue flagging is E-005-S005)
- **Data Involved:** Updates: Task entity (status, completion_date, blocked_reason)
- **Open Questions:** None

---

**Story E-005-S004: Assign Tasks to Internal Team Members or Third-Party Vendors**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a Deal Team Member
- **Action:** I want to assign each execution task to a responsible party — either an internal team member or a third-party vendor
- **Outcome:** So that every task has clear ownership and nothing falls through the cracks
- **Detailed Description:** The assignee field on each task supports two types of assignment: (1) Internal User — selected from a dropdown of system users, or (2) External Vendor — selected from the Vendor entity list or entered as free text. The assignee is displayed on the task card and can be filtered in the execution view.
- **Acceptance Criteria:**
  - [ ] Given the user assigns a task, Then they can choose between "Internal Team" and "External Vendor" assignment types
  - [ ] Given "Internal Team" is selected, Then a dropdown of active system users is displayed
  - [ ] Given "External Vendor" is selected, Then a searchable dropdown of existing Vendor records is displayed, plus a "New Vendor" option
  - [ ] Given the user selects "New Vendor," Then a quick-create form appears for vendor name and contact info
  - [ ] Given a task has an assignee, Then the assignee name is displayed on the task card
  - [ ] Given the Execution tab, When the user filters by assignee, Then only tasks assigned to the selected person/vendor are shown
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Assigned internal user is deactivated → task remains assigned but shows "(Deactivated)" next to the name; a banner recommends reassignment
  - **Edge Case 2:** Task is unassigned → displayed with "Unassigned" label in a visually distinct way (e.g., orange indicator)
- **Dependencies:**
  - **Blocked By:** E-005-S001, INFRA-002 (user list)
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Updates: Task entity (assignee fields); Reads: User entity, Vendor entity; May Create: Vendor entity
- **Open Questions:** OQ-009 — What third-party vendor types are involved?

---

**Story E-005-S005: Overdue Task Flagging and Alerts**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a Deal Team Member
- **Action:** I want the system to automatically flag overdue tasks and alert the assignee and deal lead
- **Outcome:** So that overdue items are visible immediately and responsible parties are prompted to act
- **Detailed Description:** A task becomes "overdue" when its due date passes and its status is not "Complete." Overdue tasks are visually flagged (red indicator, sorted to the top of the execution list) and trigger a notification.
- **Acceptance Criteria:**
  - [ ] Given a task has a due date and that date has passed and the task status is not "Complete," Then the task is visually flagged as overdue (red indicator, text showing "X days overdue")
  - [ ] Given a task becomes overdue, Then a notification is sent to the task assignee and the deal's creator (as deal lead proxy)
  - [ ] Given the Execution tab, When the user sorts by "Overdue first," Then overdue tasks appear at the top
  - [ ] Given a task has no due date, Then it is never flagged as overdue
  - [ ] Given an overdue task is completed, Then the overdue flag is removed immediately
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Task is overdue and assignee is a third-party vendor (not a system user) → notification is sent only to the deal lead
  - **Edge Case 2:** Task due date is today → it is not yet overdue; it becomes overdue at midnight (server time zone)
- **Dependencies:**
  - **Blocked By:** E-005-S001, E-005-S003
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** NOTIF-001 (Overdue Task Alert)
- **Data Involved:** Reads: Task entity (due_date, status)
- **Open Questions:** None

---

**Story E-005-S006: Deal Execution Progress Indicator**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a CEO / Senior Leadership
- **Action:** I want to see an at-a-glance progress indicator for deal execution
- **Outcome:** So that I can quickly assess how close any deal is to being ready for funding without reviewing individual tasks
- **Detailed Description:** The deal detail page and the deal pipeline dashboard card display a progress bar showing the percentage of execution tasks completed. The progress bar is color-coded: green (>75% complete, no overdue), amber (50-75% or has overdue tasks), red (<50% complete).
- **Acceptance Criteria:**
  - [ ] Given a deal is in execution with tasks, Then a progress bar shows "X of Y tasks complete (Z%)"
  - [ ] Given all tasks are complete, Then the progress bar is 100% and green with a label "Ready for funding"
  - [ ] Given any task is overdue, Then the progress bar turns amber regardless of completion percentage
  - [ ] Given the deal is in execution with no tasks, Then the progress indicator shows "No tasks defined"
  - [ ] Given the deal detail page and the pipeline dashboard both show this indicator
- **Dependencies:**
  - **Blocked By:** E-005-S003, E-004-S004
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads: Task entity (status aggregation per deal)
- **Open Questions:** None

---

**Story E-005-S007: Deal Termination / Kill Workflow**
- **Priority:** P0
- **Complexity:** Small
- **User:** As a Deal Team Member
- **Action:** I want to mark a deal as terminated/killed with a reason
- **Outcome:** So that dead deals are removed from active pipeline views but preserved for historical analysis
- **Detailed Description:** From the deal detail page, the user can change the pipeline stage to "Terminated." This requires entering a termination reason. Terminated deals are archived from the active pipeline but remain searchable and accessible.
- **Acceptance Criteria:**
  - [ ] Given the user changes a deal's stage to "Terminated," Then a required text field appears for "Termination Reason"
  - [ ] Given the user enters a reason and confirms, Then the deal is moved to "Terminated" status and removed from the active pipeline dashboard
  - [ ] Given a deal is terminated, Then all associated engagement threads are updated with a note: "Deal terminated: [reason]"
  - [ ] Given a terminated deal, Then it is visible in the Deals list when "Include terminated" filter is enabled
  - [ ] Given a terminated deal, Then the detail page displays a "Terminated" banner with the reason and date
  - [ ] Given a terminated deal, Then it can be reactivated by an Admin (moves back to a selected pipeline stage)
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Deal has active execution tasks → all tasks are automatically set to status "Cancelled" (a sub-type of complete) with a note referencing the deal termination
  - **Edge Case 2:** Deal has committed Capital Providers → a warning lists the committed providers: "The following capital providers have committed status: [list]. Terminating this deal will update their engagement threads."
- **Dependencies:**
  - **Blocked By:** E-004-S003
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** NOTIF-004 (deal stage change — termination)
- **Data Involved:** Updates: Deal entity, Task entities, Engagement Thread entities
- **Open Questions:** None

---

### EPIC E-006: Email Integration & Conversation Capture
**Source:** Blueprint Feature F-006
**Priority:** P1
**Epic Description:** The system must integrate with the team's email provider to capture and associate email conversations with entity records and engagement threads. At minimum, the system must pull in email metadata and content and allow users to associate emails with records. This is the feature that transforms the platform from manual data entry to automatic conversation capture.
**Epic Acceptance Criteria (Definition of Done):**
- [ ] The system connects to the team's email provider and ingests email conversations
- [ ] Emails can be associated with Borrower/Capital Provider records
- [ ] Emails can be tagged to specific engagement threads
- [ ] A conversation timeline per entity shows emails and notes chronologically

---

**Story E-006-S001: Email Provider Connection Setup**
- **Priority:** P1
- **Complexity:** Medium
- **User:** As an Admin
- **Action:** I want to connect the platform to our team's email provider
- **Outcome:** So that the system can begin ingesting and associating email conversations
- **Detailed Description:** An Admin navigates to Settings > Integrations and configures the email provider connection. The system supports Gmail (Google Workspace) and Outlook (Microsoft 365) via OAuth 2.0. The Admin authenticates with the email provider and grants read access. The connection status is displayed with a health indicator.
- **Acceptance Criteria:**
  - [ ] Given the Admin navigates to Settings > Integrations, Then an "Email" section is displayed with options for Gmail and Outlook
  - [ ] Given the Admin clicks "Connect Gmail," Then an OAuth flow redirects to Google and back upon approval
  - [ ] Given the OAuth flow completes successfully, Then the connection status shows "Connected" with the connected email address
  - [ ] Given the Admin clicks "Connect Outlook," Then an equivalent OAuth flow for Microsoft is initiated
  - [ ] Given the connection is established, Then the system begins ingesting emails (see E-006-S002)
  - [ ] Given a connection fails, Then a clear error message is displayed with troubleshooting steps
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** OAuth token expires → system automatically attempts token refresh; if refresh fails, status changes to "Disconnected" and Admin is notified
  - **Edge Case 2:** Admin connects a personal email instead of the organization email → system accepts it (no way to validate) but displays the connected email address clearly
  - **Error State 1:** Email provider API is down → system queues ingestion and retries with exponential backoff; status shows "Temporarily unable to sync" with last successful sync time
- **Dependencies:**
  - **Blocked By:** INFRA-001, INFRA-002 (Admin access required)
  - **Blocks:** E-006-S002, E-006-S003, E-006-S004
- **Integration Touchpoints:** Gmail API / Microsoft Graph API
- **Notification Triggers:** None
- **Data Involved:** Creates/Updates: Integration Configuration record
- **Open Questions:** OQ-001 — What email provider does the team use?

---

**Story E-006-S002: Email Ingestion and Storage**
- **Priority:** P1
- **Complexity:** Large
- **User:** As a system process (background)
- **Action:** The system will periodically pull new emails from connected email accounts
- **Outcome:** So that email conversations are available for association with entity records
- **Detailed Description:** After an email connection is established, the system runs a background process that polls for new emails at a configurable interval (default: every 5 minutes). Emails are stored with metadata (sender, recipients, subject, date, body text, attachments list) and made available for manual or automated association.
- **Acceptance Criteria:**
  - [ ] Given a connected email account, Then the system polls for new emails every 5 minutes (configurable)
  - [ ] Given new emails are found, Then they are stored with: sender address, recipient addresses, CC addresses, subject line, date, body text (plain and/or HTML), and attachment filenames
  - [ ] Given emails are ingested, Then they appear in a "Recent Emails" queue accessible to Deal Team and Capital Raising Team users
  - [ ] Given an email is already ingested (duplicate check by message ID), Then it is not ingested again
  - [ ] Given email ingestion runs, Then it processes only emails from the last 24 hours on first run, and only new emails (since last poll) on subsequent runs
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Email body is extremely large (>1MB) → truncate body to 1MB and store a note: "Email body truncated due to size"
  - **Edge Case 2:** Email has no subject line → store with subject "(No subject)"
  - **Edge Case 3:** Email is in a non-English language → store as-is, no translation
  - **Error State 1:** Rate limit from email provider → pause ingestion, retry after the provider's specified cooldown period
  - **Error State 2:** Network failure during ingestion → retry the batch; do not mark partially processed emails as complete
- **Dependencies:**
  - **Blocked By:** E-006-S001
  - **Blocks:** E-006-S003, E-006-S004
- **Integration Touchpoints:** Gmail API / Microsoft Graph API — reads email messages
- **Notification Triggers:** None
- **Data Involved:** Creates: Communication Record entities
- **Open Questions:** Is two-way sync needed (send emails from the platform) or read-only ingestion for v1?

---

**Story E-006-S003: Manual Email Association with Entity Records**
- **Priority:** P1
- **Complexity:** Medium
- **User:** As a Deal Team Member
- **Action:** I want to associate an ingested email with a Borrower, Capital Provider, or Deal record
- **Outcome:** So that the email appears in the conversation history of the correct entity and engagement thread
- **Detailed Description:** From the "Recent Emails" queue or from an entity's profile page, the user can link an email to one or more entities and optionally to a specific engagement thread or deal. Once linked, the email appears in the entity's conversation timeline.
- **Acceptance Criteria:**
  - [ ] Given the user views the "Recent Emails" queue, Then each email shows sender, subject, date, and a "Link" button
  - [ ] Given the user clicks "Link," Then a form appears with searchable dropdowns for: Borrower, Capital Provider, Deal, and Engagement Thread
  - [ ] Given the user selects one or more entities and clicks Save, Then the email is linked and appears on those entities' timelines
  - [ ] Given an email is linked to an entity, Then it is removed from the "Recent Emails" queue (or marked as "Linked")
  - [ ] Given the user views an entity's timeline, Then linked emails show sender, subject, date, and a preview of the body
  - [ ] Given the user clicks on an email in the timeline, Then the full email content is displayed
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** User links an email to an entity and later wants to change the association → provide an "Unlink" option and the ability to re-link to a different entity
  - **Edge Case 2:** Email sender/recipient matches a known entity's email address → system pre-suggests the matching entity for linking
- **Dependencies:**
  - **Blocked By:** E-006-S002, E-001-S001, E-001-S002
  - **Blocks:** None
- **Integration Touchpoints:** None (uses stored email data)
- **Notification Triggers:** NOTIF-002 (Capital Provider Response Received — if auto-matched)
- **Data Involved:** Updates: Communication Record (adds entity linkages); Reads: Borrower, Capital Provider, Deal, Engagement Thread
- **Open Questions:** None

---

**Story E-006-S004: Auto-Suggest Email Association Based on Contact Matching**
- **Priority:** P1
- **Complexity:** Medium
- **User:** As a system process (suggestion engine)
- **Action:** The system will suggest entity associations for ingested emails based on sender/recipient email address matching
- **Outcome:** So that the team spends less time manually linking emails and conversations are captured with minimal effort
- **Detailed Description:** When an email is ingested, the system checks sender and recipient email addresses against stored contact information on Borrower and Capital Provider records. If a match is found, the system auto-suggests the association. If exactly one match is found and confidence is high, the system can auto-link (configurable: auto-link or suggest-only).
- **Acceptance Criteria:**
  - [ ] Given an ingested email, Then the system checks sender and all recipient addresses against all stored contact emails on Borrower and Capital Provider records
  - [ ] Given a match is found, Then the email in the "Recent Emails" queue shows a suggested association with the matched entity name
  - [ ] Given the suggestion, Then the user can accept (one click to link) or dismiss the suggestion
  - [ ] Given the auto-link setting is enabled (Admin configurable), Then exact single-entity matches are automatically linked without user intervention
  - [ ] Given multiple entities match the same email address, Then the system does not auto-link but presents all options for the user to choose
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Email address belongs to a generic domain (gmail.com, yahoo.com) and could match multiple entities → system does not auto-link; presents all matches
  - **Edge Case 2:** Email is from a team member to another team member (internal only) → system does not suggest associations unless a Borrower/Capital Provider is CC'd
  - **Edge Case 3:** No contacts match → email sits in the "Recent Emails" queue with no suggestion; user can still link manually
- **Dependencies:**
  - **Blocked By:** E-006-S002, E-001-S001, E-001-S002
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads: Communication Record, Borrower (contact email), Capital Provider (contact email)
- **Open Questions:** Does the team want AI to auto-classify emails to the correct entity/thread, or is manual tagging acceptable for v1?

---

**Story E-006-S005: Entity Conversation Timeline Including Emails**
- **Priority:** P1
- **Complexity:** Medium
- **User:** As any user
- **Action:** I want to see all communications (emails + internal notes) with a Borrower or Capital Provider in one chronological timeline
- **Outcome:** So that I can reconstruct the full relationship history without switching between the platform and my email inbox
- **Detailed Description:** The existing timeline view (from E-002-S003 for Capital Providers, and a new equivalent for Borrowers) is extended to include linked emails alongside internal notes, thread events, and status changes. All items appear in a single chronological feed with type indicators.
- **Acceptance Criteria:**
  - [ ] Given an entity has linked emails and internal notes, Then both appear interleaved chronologically in the timeline
  - [ ] Given an email entry in the timeline, Then it shows: email icon, sender, subject, date, and body preview (first 200 characters)
  - [ ] Given an internal note in the timeline, Then it shows: note icon, author, content, date
  - [ ] Given the timeline, When the user filters by "Emails only" or "Notes only," Then only the selected type is shown
  - [ ] Given the user clicks on an email in the timeline, Then the full email content is displayed in a side panel or modal
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** An email is linked to both a Borrower and a Capital Provider → it appears in both entity timelines
  - **Edge Case 2:** Timeline has 500+ entries → lazy-loading / "Load more" pagination
- **Dependencies:**
  - **Blocked By:** E-006-S003, E-002-S003 (unified timeline infrastructure)
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads: Communication Record, Notes, Engagement Thread events
- **Open Questions:** None

---

**Story E-006-S006: Email Privacy and Access Controls**
- **Priority:** P1
- **Complexity:** Small
- **User:** As an Admin
- **Action:** I want to control which team members can view email content within the platform
- **Outcome:** So that confidential communications are only visible to authorized users, maintaining data security standards
- **Detailed Description:** Email content visibility is governed by the existing RBAC system. All users with Deal Team or Capital Raising Team roles can view emails linked to entities they have access to. Read-Only users can view email metadata (sender, subject, date) but not full email body content. Admins can see everything.
- **Acceptance Criteria:**
  - [ ] Given a Deal Team user views a linked email, Then full content is visible
  - [ ] Given a Read-Only user views a linked email, Then only sender, subject, and date are visible; body is replaced with "You do not have permission to view email content"
  - [ ] Given an Admin, Then all email content is visible
  - [ ] Given the audit log, Then every email view action is logged (who viewed what email, when)
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** A user's role changes from Deal Team to Read-Only while viewing an email → on next page load, content is restricted
- **Dependencies:**
  - **Blocked By:** INFRA-002, E-006-S002
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads: Communication Record, User Role
- **Open Questions:** Are there compliance concerns with storing email content in the platform? (Related to OQ-005)

---

### EPIC E-007: Centralized Document & Communication Hub
**Source:** Blueprint Feature F-007
**Priority:** P1
**Epic Description:** The system serves as a centralized repository where all deal-related documents, communications, and notes are stored and accessible by entity and by deal. Users can upload, organize, and retrieve documents without searching through email or local file systems.
**Epic Acceptance Criteria (Definition of Done):**
- [ ] Documents can be uploaded and tagged to a deal, borrower, or capital provider
- [ ] Users can search documents by name, type, entity, or deal
- [ ] Internal notes can be added to any entity or deal record
- [ ] Document history shows who uploaded what and when

---

**Story E-007-S001: Upload Documents to Entity or Deal Records**
- **Priority:** P1
- **Complexity:** Medium
- **User:** As a Deal Team Member
- **Action:** I want to upload documents and tag them to a specific deal, borrower, or capital provider
- **Outcome:** So that all deal-related documents are stored centrally and accessible to the entire team
- **Detailed Description:** From any entity or deal profile page, the user can upload files via drag-and-drop or file picker. Each uploaded document is tagged to the entity/deal, assigned a document type (from a configurable list: Term Sheet, Appraisal, Legal Opinion, Energy Study, Contract, Other), and stored with metadata.
- **Acceptance Criteria:**
  - [ ] Given the user is on an entity or deal profile, Then a "Documents" section displays existing documents and an "Upload" button
  - [ ] Given the user clicks "Upload" or drags a file, Then the file is uploaded with a progress indicator
  - [ ] Given the upload completes, Then the user is prompted to select a document type from a dropdown
  - [ ] Given the document is saved, Then it appears in the entity/deal's document list with: file name, type, uploaded by, uploaded date, file size
  - [ ] Given a document is uploaded, Then an audit log entry is generated
  - [ ] Given multiple documents exist, Then they are displayed sorted by upload date (newest first) with the ability to sort by name or type
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** File exceeds size limit (50MB default) → upload is rejected with message: "File exceeds the maximum upload size of 50MB."
  - **Edge Case 2:** File type is not supported → warn: "This file type may not be previewable in the platform, but it can still be stored and downloaded."
  - **Edge Case 3:** Upload is interrupted (network loss) → partial upload is discarded; user sees "Upload failed. Please try again."
  - **Error State 1:** Storage is unavailable → "Unable to upload at this time. Please try again later."
- **Input Validation Rules:**
  - File Name: displayed as-is from the uploaded file
  - Document Type: required, from configurable dropdown
  - File Size: max 50MB per file
  - Supported upload formats: all common document types (PDF, DOCX, XLSX, PNG, JPG, etc.)
- **Dependencies:**
  - **Blocked By:** E-001-S001, E-001-S002, E-004-S001
  - **Blocks:** E-007-S002, E-007-S003
- **Integration Touchpoints:** Cloud file storage service (S3, GCS, or equivalent)
- **Notification Triggers:** None
- **Data Involved:** Creates: Document metadata record; Stores: File binary in cloud storage
- **Open Questions:** What types of documents are most common? What is the expected volume per deal?

---

**Story E-007-S002: View, Download, and Preview Documents**
- **Priority:** P1
- **Complexity:** Small
- **User:** As any user
- **Action:** I want to view, preview, and download documents attached to a record
- **Outcome:** So that I can access deal documents without asking a colleague or searching through email
- **Detailed Description:** From the Documents section on any entity or deal, the user can click on a document to preview it (for supported types: PDF, images) or download it. A download button is always available.
- **Acceptance Criteria:**
  - [ ] Given a document list, When the user clicks on a PDF document, Then a preview is displayed in-browser
  - [ ] Given a document list, When the user clicks on an image (PNG, JPG), Then a preview is displayed
  - [ ] Given a document list, When the user clicks "Download," Then the file is downloaded to the user's device
  - [ ] Given a non-previewable file type (DOCX, XLSX), When the user clicks on it, Then the file is downloaded (no preview)
  - [ ] Given the document list, Then each entry shows the file name, document type, uploader, and upload date
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Document file is missing from storage (deleted externally) → display "This document is no longer available" and log an error
  - **Error State 1:** Download fails → retry automatically once; if still failing, show "Download failed. Please try again."
- **Dependencies:**
  - **Blocked By:** E-007-S001
  - **Blocks:** None
- **Integration Touchpoints:** Cloud file storage service
- **Notification Triggers:** None
- **Data Involved:** Reads: Document metadata, File binary
- **Open Questions:** None

---

**Story E-007-S003: Document Search Across All Records**
- **Priority:** P1
- **Complexity:** Medium
- **User:** As any user
- **Action:** I want to search for documents across all deals, borrowers, and capital providers
- **Outcome:** So that I can find any document quickly without knowing which entity or deal it is attached to
- **Detailed Description:** A global document search is accessible from the navigation. The user can search by document name, document type, entity name, or deal name. Results show the document, its type, and which entity/deal it is attached to.
- **Acceptance Criteria:**
  - [ ] Given the user navigates to a Document Search page (or uses a global search bar), Then they can enter a search term
  - [ ] Given a search term, Then results include documents whose file name, document type, linked entity name, or linked deal name contains the term
  - [ ] Given search results, Then each result displays: file name, document type, linked entity/deal, uploaded by, upload date
  - [ ] Given the user clicks a result, Then they are navigated to the document's context (the entity or deal page, scrolled to the Documents section)
  - [ ] Given no results match, Then "No documents found. Try a different search term." is displayed
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Search term is less than 2 characters → "Please enter at least 2 characters to search."
  - **Edge Case 2:** Hundreds of results → paginated (25 per page)
- **Dependencies:**
  - **Blocked By:** E-007-S001
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads: Document metadata, Borrower, Capital Provider, Deal
- **Open Questions:** None

---

**Story E-007-S004: Internal Notes on Entity and Deal Records**
- **Priority:** P1
- **Complexity:** Small
- **User:** As a Deal Team Member
- **Action:** I want to add internal notes to any entity or deal record
- **Outcome:** So that relationship context, observations, and internal decisions are captured in the system rather than living in individual inboxes or memories
- **Detailed Description:** Every entity (Borrower, Capital Provider) and Deal profile has a "Notes" section where users can add timestamped, attributed notes. Notes are displayed in reverse chronological order. Notes are visible to all team members with access to that record.
- **Acceptance Criteria:**
  - [ ] Given any entity or deal profile, Then a "Notes" section is displayed with a text input and "Add Note" button
  - [ ] Given the user enters text and clicks "Add Note," Then the note is saved with the user's name and current timestamp
  - [ ] Given multiple notes exist, Then they are displayed in reverse chronological order
  - [ ] Given a note is added, Then it also appears in the entity's conversation timeline (see E-002-S003, E-006-S005)
  - [ ] Given a user wants to edit a note they authored, Then they can click "Edit" (within 24 hours of creation)
  - [ ] Given a user did not author a note, Then no "Edit" button is available to them
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Note text is empty → "Add Note" button is disabled
  - **Edge Case 2:** Note text exceeds 10,000 characters → truncated with a warning
- **Input Validation Rules:**
  - Note text: required (to submit), max 10,000 characters
- **Dependencies:**
  - **Blocked By:** E-001-S001, E-001-S002, E-004-S001
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Creates: Note entity; Reads: User, Borrower/Capital Provider/Deal
- **Open Questions:** None

---

**Story E-007-S005: Delete (Archive) Documents**
- **Priority:** P1
- **Complexity:** Small
- **User:** As a Deal Team Member
- **Action:** I want to remove a document that was uploaded incorrectly
- **Outcome:** So that incorrect or outdated documents do not confuse the team
- **Detailed Description:** Users can archive (soft-delete) documents. Archived documents are hidden from the default view but can be revealed by an Admin. The file is not deleted from storage.
- **Acceptance Criteria:**
  - [ ] Given a document exists, When the uploader or an Admin clicks "Delete," Then a confirmation is displayed
  - [ ] Given the user confirms, Then the document is soft-deleted and hidden from the default document list
  - [ ] Given an Admin toggles "Show archived documents," Then archived documents reappear with an "Archived" label
  - [ ] Given a document is archived, Then the file remains in storage (not permanently deleted)
  - [ ] Given a document is archived, Then an audit log entry is generated
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** A non-Admin user who did not upload the document attempts to delete it → "You do not have permission to delete this document"
- **Dependencies:**
  - **Blocked By:** E-007-S001, INFRA-002
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Updates: Document metadata (is_archived)
- **Open Questions:** None

---

### EPIC E-008: AI-Powered Follow-Up & Outreach Automation
**Source:** Blueprint Feature F-008
**Priority:** P2
**Epic Description:** The system supports automated follow-up sequences for unresponsive contacts — capital providers, vendors, or municipal contacts. Follow-up cadences are configurable with AI-generated personalized messages and human-in-the-loop approval (or configurable auto-send).
**Epic Acceptance Criteria (Definition of Done):**
- [ ] Users can configure follow-up sequences with timing and messaging
- [ ] The system auto-generates contextual follow-up messages
- [ ] Users can review/approve or auto-send follow-ups
- [ ] Contacts can opt out

---

**Story E-008-S001: Configure Follow-Up Sequence**
- **Priority:** P2
- **Complexity:** Medium
- **User:** As a Deal Team Member
- **Action:** I want to configure a follow-up sequence for a contact who hasn't responded
- **Outcome:** So that unresponsive contacts are systematically nudged without me having to remember to check back
- **Detailed Description:** From an engagement thread or a task, the user can set up a follow-up sequence specifying: number of follow-ups, time between each (e.g., 3 days, 7 days, 14 days), and whether follow-ups are auto-sent or require approval. Each follow-up uses an AI-generated message based on the context.
- **Acceptance Criteria:**
  - [ ] Given an engagement thread or overdue task, Then the user can click "Set up follow-up sequence"
  - [ ] Given the setup form, Then the user specifies: number of follow-ups (1-10), time interval between each, and mode (auto-send or approval required)
  - [ ] Given the sequence is saved, Then the system schedules the first follow-up based on the interval from the last communication date
  - [ ] Given a sequence is active, Then a "Follow-up active" indicator appears on the thread/task
  - [ ] Given the user wants to cancel an active sequence, Then a "Cancel sequence" option is available
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Contact responds before the next follow-up is due → sequence is automatically paused; user is notified: "[Contact] responded. Follow-up sequence paused. Resume or cancel?"
  - **Edge Case 2:** User sets interval to 0 days → validation error: "Interval must be at least 1 day"
- **Dependencies:**
  - **Blocked By:** E-006-S001 (email integration for sending)
  - **Blocks:** E-008-S002
- **Integration Touchpoints:** Email sending (outbound)
- **Notification Triggers:** NOTIF-003 (Follow-Up Reminder)
- **Data Involved:** Creates: Follow-Up Sequence entity; Reads: Engagement Thread, Task, Communication Record
- **Open Questions:** Does the team want fully automated sending or human-in-the-loop approval? What channels (email only, or also SMS)?

---

**Story E-008-S002: AI-Generated Follow-Up Message Content**
- **Priority:** P2
- **Complexity:** Medium
- **User:** As a system process
- **Action:** The system will generate personalized follow-up messages based on deal context and communication history
- **Outcome:** So that follow-ups are relevant and contextual rather than generic templates
- **Detailed Description:** When a follow-up is due, the system generates a draft message using the deal details, last communication, and relationship context. The draft is presented to the user for review (in approval mode) or sent automatically (in auto-send mode).
- **Acceptance Criteria:**
  - [ ] Given a follow-up is due, Then the system generates a draft email referencing the specific deal/task and last communication
  - [ ] Given "approval required" mode, Then the draft appears in the user's "Pending Follow-Ups" queue for review and editing before sending
  - [ ] Given "auto-send" mode, Then the message is sent without user review but is logged in the entity's timeline
  - [ ] Given the generated message, Then it includes: recipient name, deal/task reference, time since last communication, and a polite request for update
  - [ ] Given the user edits a draft, Then the edited version is sent and stored (not the original draft)
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** AI generation fails → the system falls back to a simple template: "Following up on [Deal/Task]. Please provide an update at your earliest convenience."
  - **Edge Case 2:** Recipient email is not on file → follow-up cannot be sent; user is notified: "No email address on file for [contact]. Follow-up skipped."
- **Dependencies:**
  - **Blocked By:** E-008-S001
  - **Blocks:** None
- **Integration Touchpoints:** AI/LLM API for message generation; Email sending API
- **Notification Triggers:** None
- **Data Involved:** Reads: Deal, Task, Engagement Thread, Communication Record; Creates: Communication Record (outbound email)
- **Open Questions:** None

---

**Story E-008-S003: Follow-Up Approval Queue**
- **Priority:** P2
- **Complexity:** Small
- **User:** As a Deal Team Member
- **Action:** I want to review pending follow-up messages before they are sent
- **Outcome:** So that I maintain control over outbound communications and can customize messages before sending
- **Detailed Description:** A "Pending Follow-Ups" view shows all follow-up messages waiting for approval. For each, the user can approve (send), edit and approve, skip this follow-up, or cancel the entire sequence.
- **Acceptance Criteria:**
  - [ ] Given follow-up sequences exist in "approval required" mode, Then a "Pending Follow-Ups" section appears in the user's dashboard or navigation
  - [ ] Given a pending follow-up, Then the user sees: recipient, deal/task context, draft message, and scheduled send time
  - [ ] Given the user clicks "Approve & Send," Then the message is sent immediately
  - [ ] Given the user clicks "Edit," Then they can modify the message before sending
  - [ ] Given the user clicks "Skip," Then this follow-up is skipped and the next one in the sequence is scheduled
  - [ ] Given the user clicks "Cancel Sequence," Then the entire sequence is deactivated
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Follow-up scheduled time has passed while awaiting approval → message is held until approved (not auto-sent; not expired)
  - **Error State 1:** Send fails after approval → message is queued for retry; user is notified: "Follow-up to [Contact] failed to send. Retrying..."
- **Dependencies:**
  - **Blocked By:** E-008-S001, E-008-S002
  - **Blocks:** None
- **Integration Touchpoints:** Email sending API
- **Notification Triggers:** None
- **Data Involved:** Reads and Updates: Follow-Up Sequence, Communication Record
- **Open Questions:** None

---

**Story E-008-S004: Contact Opt-Out / Unsubscribe**
- **Priority:** P2
- **Complexity:** Small
- **User:** As a contact (external recipient)
- **Action:** A recipient of automated follow-ups can opt out of further messages
- **Outcome:** So that the team respects contact preferences and avoids harassment
- **Detailed Description:** Every automated follow-up email includes an unsubscribe link. Clicking it marks the contact as opted-out in the system. No further automated follow-ups will be sent to that contact. Manual emails are not affected.
- **Acceptance Criteria:**
  - [ ] Given an automated follow-up email, Then it includes an "Unsubscribe from automated follow-ups" link at the bottom
  - [ ] Given a recipient clicks the link, Then they see a confirmation page: "You have been unsubscribed from automated follow-ups from [Company]."
  - [ ] Given a contact has opted out, Then no further automated follow-ups are sent to their email address
  - [ ] Given a contact has opted out, Then their entity record shows an "Opted out of automated follow-ups" indicator
  - [ ] Given a contact has opted out, Then an Admin can manually clear the opt-out (with audit log)
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Contact opts out and then a team member tries to set up a new follow-up sequence → system prevents it: "This contact has opted out of automated follow-ups."
  - **Edge Case 2:** Contact has multiple email addresses; opts out of one → only the specific email address is opted out
- **Dependencies:**
  - **Blocked By:** E-008-S001
  - **Blocks:** None
- **Integration Touchpoints:** Landing page for unsubscribe confirmation
- **Notification Triggers:** None
- **Data Involved:** Updates: Contact opt-out status on Capital Provider, Borrower, or Vendor record
- **Open Questions:** Are there compliance restrictions on automated outreach in the private credit space?

---

**Story E-008-S005: Follow-Up Sequence Reporting**
- **Priority:** P2
- **Complexity:** Small
- **User:** As a CEO / Senior Leadership
- **Action:** I want to see aggregate data on follow-up sequences — how many are active, how many responses received, response rates
- **Outcome:** So that I can assess whether automated follow-ups are effective
- **Detailed Description:** A follow-up analytics section shows total active sequences, total follow-ups sent, total responses received (contact replied), response rate, and opt-out count. Filterable by date range and user.
- **Acceptance Criteria:**
  - [ ] Given the Analytics / Reporting section, Then a "Follow-Up Automation" subsection displays: Active Sequences, Total Sent, Total Responses, Response Rate (%), Opt-Outs
  - [ ] Given filters for date range and team member, Then metrics update accordingly
  - [ ] Given no follow-up data exists, Then the section displays zeros with a message: "No automated follow-ups have been sent yet."
- **Dependencies:**
  - **Blocked By:** E-008-S001, E-008-S002
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads: Follow-Up Sequence, Communication Record
- **Open Questions:** None

---

### EPIC E-009: Zoho CRM Integration
**Source:** Blueprint Feature F-009
**Priority:** P1
**Epic Description:** The system must integrate with the team's existing Zoho CRM instance. Contact records and deal data must sync bidirectionally (or at minimum one-way from Zoho into the new platform) to avoid duplicate data entry and allow the team to continue using Zoho during the transition.
**Epic Acceptance Criteria (Definition of Done):**
- [ ] Contact records sync between Zoho and the new platform
- [ ] Deal records created in either system are reflected in both
- [ ] No duplicate records are created by the sync process
- [ ] Sync errors are logged and surfaced to an admin

---

**Story E-009-S001: Zoho API Connection Setup**
- **Priority:** P1
- **Complexity:** Medium
- **User:** As an Admin
- **Action:** I want to connect the platform to our Zoho CRM instance
- **Outcome:** So that data can flow between Zoho and this platform
- **Detailed Description:** An Admin navigates to Settings > Integrations > Zoho CRM and configures the connection using Zoho's OAuth 2.0 flow. The Admin authenticates with Zoho and grants API access. The connection status is displayed.
- **Acceptance Criteria:**
  - [ ] Given the Admin navigates to Settings > Integrations, Then a "Zoho CRM" section is displayed with a "Connect" button
  - [ ] Given the Admin clicks "Connect," Then an OAuth flow redirects to Zoho and back upon approval
  - [ ] Given the OAuth flow completes successfully, Then the connection status shows "Connected" with the connected Zoho organization name
  - [ ] Given the connection fails (invalid credentials, insufficient permissions), Then a clear error is displayed
  - [ ] Given a successful connection, Then a "Test Connection" button verifies API access and displays success or failure
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Zoho plan does not include API access → connection fails with message: "Zoho API access is not available on your plan. Please upgrade or contact Zoho support."
  - **Edge Case 2:** OAuth token expires → automatic refresh; if refresh fails, status changes to "Disconnected" and Admin is notified
- **Dependencies:**
  - **Blocked By:** INFRA-001, INFRA-002
  - **Blocks:** E-009-S002, E-009-S003
- **Integration Touchpoints:** Zoho CRM API
- **Notification Triggers:** None
- **Data Involved:** Creates/Updates: Integration Configuration
- **Open Questions:** OQ-004 — What Zoho plan is the team on? Does it have API access?

---

**Story E-009-S002: Import Existing Zoho Contacts and Deals (Initial Sync)**
- **Priority:** P1
- **Complexity:** Large
- **User:** As an Admin
- **Action:** I want to import existing contact and deal records from Zoho into the new platform
- **Outcome:** So that historical data is available in the new system without manual re-entry
- **Detailed Description:** After the Zoho connection is established, the Admin can trigger an initial data import. The system pulls contact records from Zoho and maps them to Borrower or Capital Provider records based on a user-defined mapping. Deal records are imported and linked to the appropriate entities. Duplicates are detected by matching on name + email.
- **Acceptance Criteria:**
  - [ ] Given a connected Zoho instance, When the Admin clicks "Start Initial Import," Then the system begins pulling contacts and deals from Zoho
  - [ ] Given contacts are imported, Then the Admin is presented with a mapping screen: for each Zoho contact, they can classify it as Borrower, Capital Provider, or Skip
  - [ ] Given deals are imported, Then each deal is linked to the corresponding Borrower entity (matched by name)
  - [ ] Given a Zoho contact's name and email match an existing record in the new platform, Then the system flags it as a potential duplicate and asks the Admin to merge or skip
  - [ ] Given the import completes, Then a summary is displayed: X contacts imported, Y deals imported, Z duplicates detected
  - [ ] Given the import, Then all imported records have a "Source: Zoho" tag and a Zoho record ID stored for future sync
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Zoho has thousands of records → import runs asynchronously with a progress indicator; Admin can navigate away and check back
  - **Edge Case 2:** A Zoho record has no name → skipped with a note in the import log: "Skipped record [Zoho ID] — no name field"
  - **Edge Case 3:** Zoho API rate limit is hit during import → import pauses, waits for cooldown, and resumes automatically
  - **Error State 1:** Import fails mid-process → already-imported records are preserved; Admin can resume from where it stopped
- **Dependencies:**
  - **Blocked By:** E-009-S001, E-001-S001, E-001-S002, E-004-S001
  - **Blocks:** E-009-S003
- **Integration Touchpoints:** Zoho CRM API — reads contacts and deals
- **Notification Triggers:** None
- **Data Involved:** Creates: Borrower, Capital Provider, Deal entities (from Zoho data)
- **Open Questions:** What data currently lives in Zoho? What field mappings are needed?

---

**Story E-009-S003: Ongoing Bidirectional Sync**
- **Priority:** P1
- **Complexity:** Large
- **User:** As a system process (background)
- **Action:** The system will continuously sync changes between Zoho CRM and the new platform
- **Outcome:** So that data stays consistent across both systems during the transition period
- **Detailed Description:** After initial import, a background process syncs changes bidirectionally on a configurable interval (default: every 15 minutes). Changes in either system are detected and propagated. Conflicts (same record modified in both systems since last sync) are flagged for manual resolution.
- **Acceptance Criteria:**
  - [ ] Given a contact is updated in Zoho, Then the corresponding record in the new platform is updated within 15 minutes
  - [ ] Given a contact is updated in the new platform, Then the corresponding Zoho record is updated within 15 minutes
  - [ ] Given a new contact is created in Zoho, Then it is imported into the new platform (using the same classification logic as initial import, or a default classification)
  - [ ] Given a new contact is created in the new platform, Then it is created in Zoho with mapped fields
  - [ ] Given both systems modify the same record between syncs, Then the conflict is flagged for Admin resolution (both versions displayed, Admin chooses which to keep)
  - [ ] Given sync errors occur, Then they are logged and a summary is visible in Settings > Integrations > Zoho > Sync Log
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Zoho API is down → sync pauses and retries with exponential backoff; status shows "Sync paused — Zoho unavailable"
  - **Edge Case 2:** A record is deleted in Zoho → the corresponding record in the new platform is NOT deleted; it is flagged: "Deleted in Zoho — review"
  - **Edge Case 3:** Zoho rate limit is exceeded → sync throttles to stay within limits
- **Dependencies:**
  - **Blocked By:** E-009-S002
  - **Blocks:** None
- **Integration Touchpoints:** Zoho CRM API — reads and writes contacts and deals
- **Notification Triggers:** None (errors surface in sync log)
- **Data Involved:** Reads and Updates: Borrower, Capital Provider, Deal entities + Zoho mirror records
- **Open Questions:** OQ-008 — Does the team want the new system to eventually replace Zoho or permanently coexist?

---

**Story E-009-S004: Zoho Sync Monitoring Dashboard**
- **Priority:** P1
- **Complexity:** Small
- **User:** As an Admin
- **Action:** I want to see the status of the Zoho integration — last sync time, errors, conflict queue
- **Outcome:** So that I can ensure data is flowing correctly and resolve any issues quickly
- **Detailed Description:** Settings > Integrations > Zoho includes a monitoring section showing: connection status, last successful sync time, number of records synced in the last 24 hours, number of errors, number of unresolved conflicts. Each can be drilled into for details.
- **Acceptance Criteria:**
  - [ ] Given the Admin views the Zoho integration page, Then they see: Connection Status, Last Sync Time, Records Synced (24h), Errors (24h), Unresolved Conflicts
  - [ ] Given errors exist, When the Admin clicks on the error count, Then a detailed error log is displayed
  - [ ] Given conflicts exist, When the Admin clicks on the conflict count, Then a conflict resolution interface is displayed showing both versions side-by-side
  - [ ] Given the Admin resolves a conflict (chooses one version), Then the selected version is propagated to both systems
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** No syncs have occurred yet → display "No sync data yet. Initial import must be completed first."
- **Dependencies:**
  - **Blocked By:** E-009-S003
  - **Blocks:** None
- **Integration Touchpoints:** None (reads sync metadata)
- **Notification Triggers:** None
- **Data Involved:** Reads: Sync Log, Conflict Queue
- **Open Questions:** None

---

**Story E-009-S005: Disconnect Zoho Integration**
- **Priority:** P1
- **Complexity:** Small
- **User:** As an Admin
- **Action:** I want to disconnect the Zoho integration
- **Outcome:** So that if we decide to stop using Zoho, the sync stops cleanly without data loss
- **Detailed Description:** The Admin can disconnect the Zoho integration from Settings. Disconnecting stops all sync processes. All data already imported remains in the platform. The Zoho record ID linkages are preserved for potential reconnection.
- **Acceptance Criteria:**
  - [ ] Given the Admin clicks "Disconnect Zoho," Then a confirmation dialog is displayed: "Disconnecting will stop all data sync with Zoho. Data already in the platform will not be affected. Reconnecting later may require re-mapping."
  - [ ] Given the Admin confirms, Then the OAuth token is revoked, sync processes are stopped, and the status changes to "Not Connected"
  - [ ] Given Zoho is disconnected, Then all existing records remain in the platform unchanged
  - [ ] Given Zoho is disconnected, Then the Zoho record IDs are preserved on records for potential future reconnection
- **Dependencies:**
  - **Blocked By:** E-009-S001
  - **Blocks:** None
- **Integration Touchpoints:** Zoho OAuth token revocation
- **Notification Triggers:** None
- **Data Involved:** Updates: Integration Configuration
- **Open Questions:** None

---

### EPIC E-010: Standardized Process Templates
**Source:** Blueprint Feature F-010
**Priority:** P1
**Epic Description:** The system supports configurable process templates that define standard sequences of tasks for recurring workflows (primarily deal execution). When a deal enters a phase, the template auto-generates the required tasks. Templates are versioned — old deals keep their original template, new deals get the current version.
**Epic Acceptance Criteria (Definition of Done):**
- [ ] Admins can create and edit process templates
- [ ] Templates auto-populate tasks when applied to a deal
- [ ] Templates are versioned

---

**Story E-010-S001: Create and Edit Process Templates**
- **Priority:** P1
- **Complexity:** Medium
- **User:** As an Admin or CEO
- **Action:** I want to create and edit process templates that define the standard set of tasks for deal execution
- **Outcome:** So that every deal follows a consistent process and new team members know exactly what needs to happen
- **Detailed Description:** In Settings > Process Templates, Admins can create templates with a name, description, and an ordered list of task definitions. Each task definition includes: task name, description, default assignee role (e.g., "Deal Lead," "Legal Counsel"), and relative due date offset (e.g., "+7 days from execution start"). Templates can be edited at any time; edits create a new version.
- **Acceptance Criteria:**
  - [ ] Given the Admin navigates to Settings > Process Templates, Then a list of existing templates is displayed with a "Create Template" button
  - [ ] Given the Admin clicks "Create Template," Then a form appears with: Template Name, Description, and a task list builder
  - [ ] Given the task list builder, Then the Admin can add tasks with: Task Name, Description, Default Assignee Role, Relative Due Date Offset (days)
  - [ ] Given the Admin saves the template, Then it is created with version 1
  - [ ] Given the Admin edits an existing template, Then a new version is created; the old version is preserved
  - [ ] Given a template has multiple versions, Then the most recent version is used for new deals; old deals retain their original version
  - [ ] Given the Admin reorders tasks in the template, Then the order is preserved and reflected when tasks are generated
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** Template with 0 tasks is saved → allowed but warning: "This template has no tasks. It will not generate any tasks when applied."
  - **Edge Case 2:** Admin deletes a template that is in use by active deals → template is soft-deleted; active deals retain their generated tasks; template cannot be applied to new deals
- **Input Validation Rules:**
  - Template Name: required, max 255 characters, unique across active templates
  - Description: optional, max 2000 characters
  - Task Name: required per task, max 255 characters
  - Relative Due Date Offset: optional, positive integer (days)
- **Dependencies:**
  - **Blocked By:** E-005-S001 (task generation mechanism must exist)
  - **Blocks:** E-010-S002
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Creates: Process Template entity, Template Task Definition entities
- **Open Questions:** OQ-003 — What is the standard deal execution checklist? (Template content depends on this)

---

**Story E-010-S002: Apply Template to Deal (Automatic and Manual)**
- **Priority:** P1
- **Complexity:** Small
- **User:** As a Deal Team Member
- **Action:** I want to apply a process template to a deal to generate execution tasks
- **Outcome:** So that the deal has a complete task checklist without manual creation
- **Detailed Description:** When a deal enters Execution (already handled in E-005-S001), the system applies the default template. Additionally, users can manually apply a template to any deal from the deal's Execution tab (e.g., to apply a different template or re-apply).
- **Acceptance Criteria:**
  - [ ] Given a deal is in Execution and has no tasks, When the user clicks "Apply Template," Then a dropdown of available templates is displayed
  - [ ] Given the user selects a template and confirms, Then the template's tasks are generated on the deal with calculated due dates
  - [ ] Given a deal already has tasks, When the user applies a template, Then a warning is displayed: "This deal already has [X] tasks. Applying a template will add [Y] more tasks. Existing tasks will not be affected."
  - [ ] Given the template is applied, Then the template name and version are recorded on the deal for reference
- **Edge Cases and Error Handling:**
  - **Edge Case 1:** No templates exist → "No templates configured. Contact your admin to create one in Settings."
  - **Edge Case 2:** Template has tasks with relative due dates but the deal has no execution start date → tasks are created with no due dates and a warning: "Due dates could not be calculated. Set an execution start date on the deal."
- **Dependencies:**
  - **Blocked By:** E-010-S001, E-005-S001
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads: Process Template, Template Task Definitions; Creates: Task entities
- **Open Questions:** None

---

**Story E-010-S003: Set Default Template for Automatic Application**
- **Priority:** P1
- **Complexity:** Small
- **User:** As an Admin
- **Action:** I want to designate one template as the default so it auto-applies when deals enter Execution
- **Outcome:** So that deals automatically get the standard checklist without manual intervention
- **Detailed Description:** In Settings > Process Templates, the Admin can mark one template as the "Default." This template is automatically applied when any deal transitions to the Execution pipeline stage (via E-005-S001). Only one template can be default at a time.
- **Acceptance Criteria:**
  - [ ] Given the template list, Then each template has a "Set as Default" option
  - [ ] Given the Admin clicks "Set as Default" on a template, Then it is marked as default and any previously default template loses its default status
  - [ ] Given a deal transitions to Execution (E-005-S001), Then the system applies the current default template's latest version
  - [ ] Given no template is marked as default, Then no tasks are auto-generated when a deal enters Execution (with a message per E-005-S001 edge case)
- **Dependencies:**
  - **Blocked By:** E-010-S001
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Updates: Process Template (is_default flag)
- **Open Questions:** None

---

**Story E-010-S004: View Template Version History**
- **Priority:** P1
- **Complexity:** Small
- **User:** As an Admin
- **Action:** I want to view the version history of a process template
- **Outcome:** So that I can see what changed between versions and understand why a deal's tasks differ from the current template
- **Detailed Description:** Each template displays a "Version History" section listing all versions with: version number, date created, created by, and a summary of changes (tasks added, removed, or modified).
- **Acceptance Criteria:**
  - [ ] Given a template with multiple versions, When the Admin clicks "Version History," Then all versions are listed in reverse chronological order
  - [ ] Given a version entry, Then it shows: version number, creation date, creator, and a diff of changes from the prior version
  - [ ] Given the Admin clicks on a version, Then the full template as it existed at that version is displayed (read-only)
  - [ ] Given a deal references a specific template version, Then the deal's Execution tab shows: "Based on [Template Name] v[X]"
- **Dependencies:**
  - **Blocked By:** E-010-S001
  - **Blocks:** None
- **Integration Touchpoints:** None
- **Notification Triggers:** None
- **Data Involved:** Reads: Process Template versions
- **Open Questions:** None

---

## PART 5: INTEGRATION-SPECIFIC STORIES

---

**Story INTG-001: Zoho CRM Connection and Authentication**
- **Priority:** P1
- **Complexity:** Medium
- **Description:** Implement OAuth 2.0 integration with Zoho CRM including token management, automatic refresh, and secure storage.
- **Acceptance Criteria:**
  - [ ] OAuth 2.0 flow completes successfully with Zoho
  - [ ] Access and refresh tokens are stored encrypted
  - [ ] Tokens auto-refresh before expiry
  - [ ] Connection failures are logged and surfaced to Admin
  - [ ] Zoho API rate limits are respected (tracked and throttled)
- **Error Handling:**
  - Zoho API is down → queue requests, retry with exponential backoff (max 5 retries), alert Admin after 3 consecutive failures
  - Authentication expires and refresh fails → status changes to "Disconnected," Admin notified
  - Rate limit hit → pause sync, retry after Zoho-specified cooldown
  - Unexpected response format → log full response body, skip the record, continue with remaining records, include in error report
- **Data Mapping:** Zoho Contacts → Borrower/Capital Provider (based on admin classification); Zoho Deals → Deal entity; Zoho fields to be mapped during initial setup (OQ)
- **Direction:** Bidirectional
- **Required By:** E-009
- **Open Questions:** OQ-004 — Zoho plan and API availability

---

**Story INTG-002: Email Provider Connection (Gmail / Outlook)**
- **Priority:** P1
- **Complexity:** Medium
- **Description:** Implement OAuth 2.0 integration with Gmail (Google Workspace API) and/or Microsoft Outlook (Microsoft Graph API) for email ingestion.
- **Acceptance Criteria:**
  - [ ] OAuth 2.0 flow completes successfully with Gmail and/or Outlook
  - [ ] Read-only access to email is granted (not full account access)
  - [ ] Tokens are stored encrypted and auto-refreshed
  - [ ] Connection failures logged and surfaced to Admin
  - [ ] Email provider rate limits are respected
- **Error Handling:**
  - Email API is down → queue ingestion, retry with backoff
  - Authentication expires → auto-refresh; if fails, notify Admin
  - Rate limit hit → pause polling, resume after cooldown
  - Malformed email data → skip the message, log the error, continue
- **Data Mapping:** Email messages → Communication Record entity (sender, recipients, subject, date, body, attachment references)
- **Direction:** Inbound (read-only for v1)
- **Required By:** E-006
- **Open Questions:** OQ-001 — What email provider does the team use?

---

## PART 6: NOTIFICATION AND COMMUNICATION STORIES

---

**Story NOTIF-001: Overdue Task Alert**
- **Priority:** P0
- **Complexity:** Small
- **Trigger:** A deal execution task's due date passes without the task being marked complete
- **Recipient:** Task assignee (if internal user) and deal creator (as deal lead proxy)
- **Channel:** In-app notification + email
- **Content Requirements:** Task name, deal name, assignee name, number of days overdue, link to the task
- **Acceptance Criteria:**
  - [ ] Notification fires within 1 hour of a task becoming overdue (checked via scheduled job)
  - [ ] Notification contains all required data fields
  - [ ] Notification links directly to the deal's Execution tab with the overdue task highlighted
  - [ ] If task remains overdue, a daily reminder is sent until the task is completed or its due date is extended
  - [ ] If the task is completed, the overdue alert stops immediately
- **Edge Cases:**
  - Assignee is an external vendor (no system account) → notification sent only to the deal lead
  - Multiple tasks become overdue simultaneously → each task generates its own notification (not batched)
  - Task has no due date → this notification never triggers
- **Dependencies:** E-005-S005

---

**Story NOTIF-002: Capital Provider Response Received**
- **Priority:** P1
- **Complexity:** Small
- **Trigger:** An email from a capital provider is captured and associated (manually or automatically) with a deal/thread
- **Recipient:** The deal team member who created the engagement thread (or the thread owner)
- **Channel:** In-app notification
- **Content Requirements:** Capital provider name, deal name (if applicable), email subject, first 100 characters of email body
- **Acceptance Criteria:**
  - [ ] Notification fires immediately upon email association
  - [ ] Notification contains all required data fields
  - [ ] Clicking the notification navigates to the Capital Provider's timeline with the email highlighted
  - [ ] If the email is associated with a deal, the deal name is included in the notification
- **Edge Cases:**
  - Email is associated with multiple Capital Providers → notification sent for each
  - Email association happens via auto-suggest acceptance → notification still fires
- **Dependencies:** E-006-S003, E-006-S004

---

**Story NOTIF-003: Follow-Up Reminder**
- **Priority:** P1
- **Complexity:** Small
- **Trigger:** No response from a contact within a configurable time window
- **Recipient:** The team member managing the engagement thread or task
- **Channel:** In-app notification
- **Content Requirements:** Contact name, entity name, days since last communication, suggested action ("Send follow-up" or "View thread")
- **Acceptance Criteria:**
  - [ ] Notification fires at the configured interval (default: 3 days, 7 days after last outreach)
  - [ ] Notification contains all required data fields
  - [ ] Notification includes a "Send follow-up" button that navigates to the follow-up sequence setup (E-008)
  - [ ] If the contact responds before the reminder fires, the reminder is cancelled
- **Edge Cases:**
  - Contact has no last communication date → reminder fires 3 days after the engagement thread was created
  - Multiple threads with the same contact have different reminder schedules → each fires independently
- **Dependencies:** E-002-S001, E-006-S003 (to detect last communication)

---

**Story NOTIF-004: Deal Stage Change**
- **Priority:** P1
- **Complexity:** Small
- **Trigger:** A deal moves to a new pipeline stage
- **Recipient:** All team members linked to the deal (creator + Capital Provider engagement thread owners) + CEO (Admin role)
- **Channel:** In-app notification + email
- **Content Requirements:** Deal name, old stage, new stage, changed by (user name), timestamp
- **Acceptance Criteria:**
  - [ ] Notification fires immediately upon stage change
  - [ ] Notification contains all required data fields
  - [ ] Clicking the notification navigates to the deal's detail page
  - [ ] Special emphasis for critical transitions: "Agreed → Execution" and "Execution → Funded" and "Any → Terminated"
- **Edge Cases:**
  - User changes stage and then immediately changes again → two notifications are sent (one per change)
  - The person who changed the stage also receives the notification → they are excluded from the notification (they already know)
- **Dependencies:** E-004-S003

---

## PART 7: REPORTING AND ANALYTICS STORIES

---

**Story RPT-001: Active Deal Pipeline Dashboard**
- **Priority:** P1
- **Complexity:** Medium
- **User:** CEO, Deal Team
- **Description:** A visual dashboard showing all active deals grouped by pipeline stage with aggregate metrics.
- **Data Sources:** Deal entity
- **Metrics and Data Points:**
  - Total number of active deals
  - Number of deals per pipeline stage
  - Total estimated pipeline value (sum of all deal sizes)
  - Pipeline value per stage
  - Average days in current stage per deal
- **Filters and Parameters:** Pipeline stage, project type, location, date range (deal created date)
- **Acceptance Criteria:**
  - [ ] Dashboard displays accurately based on current deal data
  - [ ] Filters work correctly and can be combined
  - [ ] Dashboard loads within 3 seconds
  - [ ] Empty state shows "No active deals" with a "Create Deal" button
- **Edge Cases:**
  - No deals in a given stage → stage column/section still appears with count = 0
  - Deal with no estimated size → excluded from value calculations but counted in deal counts
- **Dependencies:** E-004-S001, E-004-S003

---

**Story RPT-002: Capital Provider Relationship Summary**
- **Priority:** P1
- **Complexity:** Medium
- **User:** Capital Raising Team, CEO
- **Description:** A dashboard showing the landscape of all capital provider relationships — by type, engagement status, and deal involvement.
- **Data Sources:** Capital Provider, Engagement Thread, Credit Facility, Deal
- **Metrics and Data Points:**
  - Total capital providers by type (Bank, Asset Manager, Family Office, Life Insurance, Other)
  - Total capital providers by relationship type (Prospective, Transactional, Credit Facility Partner)
  - Active engagement threads count
  - Credit facility total capacity vs. utilization
  - Deals pitched vs. committed per capital provider (win rate)
- **Filters and Parameters:** Capital provider type, relationship type, date range
- **Acceptance Criteria:**
  - [ ] Dashboard displays accurate counts and calculations
  - [ ] Filters work correctly
  - [ ] Dashboard loads within 3 seconds
  - [ ] Clicking on a metric drills into the underlying list of records
- **Edge Cases:**
  - Capital provider with no engagement threads → counted in totals but shows 0 for engagement metrics
- **Dependencies:** E-001-S002, E-002-S001, E-003-S001, E-003-S003

---

**Story RPT-003: Deal Execution Tracker Dashboard**
- **Priority:** P1
- **Complexity:** Medium
- **User:** Deal Team, CEO
- **Description:** A dashboard showing execution progress across all deals currently in the Execution phase.
- **Data Sources:** Deal, Task
- **Metrics and Data Points:**
  - Number of deals in Execution
  - Per deal: completion percentage, overdue task count, days in execution
  - Aggregate: total tasks complete vs. outstanding, average days to close
  - Top overdue tasks (sorted by days overdue)
- **Filters and Parameters:** Deal name, assignee, task status
- **Acceptance Criteria:**
  - [ ] Dashboard shows one row per deal in Execution with a progress bar, overdue count, and days in execution
  - [ ] Clicking a deal row navigates to the deal's Execution tab
  - [ ] "Top Overdue Tasks" section lists the 10 most overdue tasks across all deals
  - [ ] Dashboard loads within 3 seconds
- **Edge Cases:**
  - No deals in Execution → "No deals currently in execution."
  - Deal in Execution with no tasks → shows with "No tasks defined" instead of a progress bar
- **Dependencies:** E-005-S001, E-005-S003, E-005-S005

---

## PART 8: NON-FUNCTIONAL REQUIREMENT STORIES

---

**Story NFR-001: Audit Trail and Activity Logging**
- **Source:** Blueprint Section 9 — Security
- **Priority:** P0
- **Description:** Covered by INFRA-004. Every data mutation is logged with user, action, timestamp, and field-level diffs. Logs are immutable and queryable.
- **Acceptance Criteria:**
  - [ ] All CRUD operations on all entities generate audit log entries
  - [ ] Logs include user_id, action, entity_type, entity_id, timestamp, IP, and changed_fields
  - [ ] Logs are immutable (append-only)
  - [ ] Admins can query logs by entity, user, action type, and date range
  - [ ] Log query results are returned within 5 seconds
- **Error Handling:** Audit logging failure does not block the triggering action but generates an immediate admin alert

---

**Story NFR-002: Page Load Performance**
- **Source:** Blueprint Section 9 — Performance
- **Priority:** P0
- **Description:** All pages must load within 2 seconds. Search results must return within 3 seconds. These targets apply under normal load (up to 20 concurrent users).
- **Acceptance Criteria:**
  - [ ] All primary pages (Dashboard, Lists, Profiles) load within 2 seconds under 20 concurrent users
  - [ ] Search endpoints return results within 3 seconds for datasets up to 10,000 records
  - [ ] If a page takes longer than 4 seconds to load, a loading indicator is displayed
  - [ ] Performance is measurable via a monitoring tool
- **Error Handling:** If a page fails to load within 10 seconds, display: "This is taking longer than expected. Please refresh."

---

**Story NFR-003: Data Encryption**
- **Source:** Blueprint Section 9 — Security
- **Priority:** P0
- **Description:** Covered by INFRA-007. All data encrypted at rest (AES-256) and in transit (TLS 1.2+).
- **Acceptance Criteria:**
  - [ ] All traffic is HTTPS with TLS 1.2+
  - [ ] Database is encrypted at rest
  - [ ] File storage is encrypted at rest
  - [ ] No sensitive data (passwords, tokens) is stored in plaintext anywhere (code, logs, database)
- **Error Handling:** If encryption subsystem fails, operations that would store unencrypted data must fail rather than proceed

---

**Story NFR-004: Session Security and Timeout**
- **Source:** Blueprint Section 9 — Security
- **Priority:** P0
- **Description:** User sessions must have configurable timeout, secure cookie handling, and forced logout capability.
- **Acceptance Criteria:**
  - [ ] Sessions time out after 30 minutes of inactivity (configurable by Admin: 15-120 minutes)
  - [ ] Session cookies are HttpOnly, Secure, and SameSite=Strict
  - [ ] An Admin can force-logout any user's active sessions
  - [ ] After session timeout, all in-memory data is cleared from the browser
- **Error Handling:** If a user continues working after session timeout, their next server request returns 401 and redirects to login

---

## PART 9: CONSOLIDATED OPEN QUESTIONS REGISTER

### BLOCKER-LEVEL (stories cannot be started until these are answered)

| Question ID | Question | Affected Stories | Owner | Deadline | Default If Unanswered |
|-------------|----------|------------------|-------|----------|-----------------------|
| OQ-001 | What email provider does the team use (Gmail, Outlook, other)? | E-006-S001, E-006-S002, INTG-002 | Client (John) | Before Phase 2 | Build Gmail integration first |
| OQ-002 | What are the exact pipeline stages for (a) deal origination and (b) capital provider outreach? | E-004-S001, E-004-S003, E-004-S004 | Client (John + CEO) | Before Phase 1 | Use generic stages: Prospect → Qualifying → Structuring → Pitched → Committed → Execution → Funded → Closed |
| OQ-003 | What is the standard deal execution checklist? | E-005-S001, E-010-S001 | Client (John) | Before Phase 1 | Build configurable framework and populate collaboratively |
| OQ-004 | What Zoho plan is the team on, and does it have API access? | E-009-S001, E-009-S002, E-009-S003, INTG-001 | Client (Zoho admin) | Before Phase 2 | Build standalone first, add Zoho integration in Phase 2 |
| OQ-005 | Are there regulatory compliance requirements (SOC2, FINRA, state-level)? | INFRA-004, INFRA-007, NFR-001, NFR-003 | Client (CEO / legal) | Before architecture finalization | Build with SOC2-ready practices as precaution |

### IMPORTANT BUT NOT BLOCKING (stories can start but may need revision)

| Question ID | Question | Affected Stories | Owner | Deadline | Default If Unanswered |
|-------------|----------|------------------|-------|----------|-----------------------|
| OQ-006 | How many people are on the team, and what are their specific roles? | INFRA-002 | Client (John) | Before Phase 1 | Design for <20 users with 3 roles |
| OQ-007 | What specific fields are tracked in a credit facility agreement? | E-003-S002, INFRA-003 | Client (deal team) | Before E-003 development | Start with facility size, annual allocation, spread split, term length |
| OQ-008 | Does the team want the new system to eventually replace Zoho or permanently coexist? | E-009-S003 | Client (CEO) | Before Phase 2 planning | Build as if Zoho will be replaced; maintain integration until told otherwise |
| OQ-009 | What third-party vendor types are involved in deal execution? | E-005-S004 | Client (deal team) | Before Phase 1 | Deal team updates vendor task status manually |
| OQ-010 | What are the different deal types, and do they have different workflows? | E-005-S001, E-010-S001 | Client (deal team) | Before template design | Build one flexible template, customize later |

---

## PART 10: RELEASE PLAN ALIGNMENT

### Phase 1 — MVP Release

- **Infrastructure Stories:** INFRA-001, INFRA-002, INFRA-003, INFRA-004, INFRA-005, INFRA-006, INFRA-007
- **Feature Stories:**
  - E-001: S001, S002, S003, S004, S005, S006
  - E-002: S001, S002, S003, S004, S005
  - E-003: S001, S002, S003, S004
  - E-004: S001, S002, S003, S004, S005, S006
  - E-005: S001, S002, S003, S004, S005, S006, S007
- **Integration Stories:** None in Phase 1
- **Notification Stories:** NOTIF-001, NOTIF-004
- **Reporting Stories:** RPT-001
- **Non-Functional Stories:** NFR-001, NFR-002, NFR-003, NFR-004
- **Total Story Count:** 48
- **Estimated Complexity Mix:** 25 Small, 17 Medium, 6 Large
- **Blocking Open Questions:** OQ-002, OQ-003
- **Definition of Done for Phase 1:** The team can create Borrower and Capital Provider records, track multi-threaded relationships with Capital Providers including credit facility terms, manage deals through a defined pipeline, use a checklist-based execution tracker with overdue alerts, and view an aggregate pipeline dashboard — all through a secure, browser-based application with audit logging and role-based access control.

### Phase 2 — Core Enhancement

- **Infrastructure Stories:** None (all covered in Phase 1)
- **Feature Stories:**
  - E-006: S001, S002, S003, S004, S005, S006
  - E-007: S001, S002, S003, S004, S005
  - E-009: S001, S002, S003, S004, S005
  - E-010: S001, S002, S003, S004
- **Integration Stories:** INTG-001, INTG-002
- **Notification Stories:** NOTIF-002, NOTIF-003
- **Reporting Stories:** RPT-002, RPT-003
- **Non-Functional Stories:** None additional
- **Total Story Count:** 28
- **Estimated Complexity Mix:** 11 Small, 11 Medium, 6 Large
- **Blocking Open Questions:** OQ-001, OQ-004
- **Definition of Done for Phase 2:** The system captures email conversations and associates them with entity records, stores documents centrally, syncs data bidirectionally with Zoho, and auto-generates execution task checklists from versioned templates. Team workflow shifts from manual data entry to system-assisted tracking.

### Phase 3 — Full Feature Set

- **Feature Stories:**
  - E-008: S001, S002, S003, S004, S005
- **Integration Stories:** None additional
- **Notification Stories:** None additional
- **Reporting Stories:** None additional (E-008-S005 covers follow-up reporting)
- **Total Story Count:** 5
- **Estimated Complexity Mix:** 2 Small, 2 Medium, 1 Large
- **Blocking Open Questions:** None
- **Definition of Done for Phase 3:** Automated follow-up sequences with AI-generated personalized messages, human-in-the-loop approval, and contact opt-out. Full vision realized.

---

## PART 11: STORY READINESS CHECKLIST

Before any story is handed to an engineer, run it through this checklist. If any item is "No," the story goes back to the PM for revision.

1. Does the story have a clear user, action, and outcome? ☐
2. Are all acceptance criteria written as testable Given/When/Then conditions? ☐
3. Are all edge cases identified with expected behavior? ☐
4. Are all error states identified with expected behavior? ☐
5. Are all input validation rules defined (if applicable)? ☐
6. Are all dependencies listed — what blocks it and what it blocks? ☐
7. Are all integration touchpoints identified with failure handling? ☐
8. Are all data entities referenced with CRUD operations specified? ☐
9. Is the story small enough for one engineer to complete in 1-5 days? ☐
10. Are all open questions either answered or documented with defaults? ☐
11. Can a QA engineer write test cases directly from the acceptance criteria without asking a single clarifying question? ☐

---

**END OF FEATURE SPEC BREAKDOWN**

**Total Stories Across All Phases: 81**
- Phase 1 (MVP): 48 stories
- Phase 2 (Core Enhancement): 28 stories
- Phase 3 (Full Feature Set): 5 stories

**Critical Path:** INFRA-001/003 → E-001 → E-002 → E-004 → E-005 → E-010
**Parallel Tracks Available:** Up to 4 engineers can work simultaneously after E-001 is complete.
