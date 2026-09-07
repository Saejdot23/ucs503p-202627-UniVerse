# Journal 2 : Skill Swap Prototyping, Architecture & Authentication Frontend

## Part 3 — Skill Discovery & Matching

### Objective

The primary objective for this period was to transition from the initial planning documented in Journal 1 into **concrete frontend UX prototypes, architectural system designs, and repository inspection** for **Part 3: Skill Swap (Discovery & Matching)** of UniVerse.

Because team backend modules are being developed iteratively, this phase focused on:
1. Auditing the existing UniVerse repository and backend setup to confirm module boundaries.
2. Formulating a 7-diagram architecture and data design pack defining system boundaries, data relationships, and planned API contracts.
3. Constructing a standalone, interactive **Skill Swap Frontend Prototype** covering skill exploration, mentor profiles, the "My Skills" workspace, and session request interactions.
4. Developing a complementary **Authentication Frontend Prototype** matching the UniVerse visual system, demonstrating `@thapar.edu` domain restrictions, and modeling client-side user management to prepare for future integration with the authentication backend implemented by teammate Sehajneet.

---

# Repository Audit & Module Boundaries

The UniVerse repository (`C:\Users\LENOVO\ucs503p-202627-UniVerse`) was inspected on branch `feature/auth-frontend` (base commit `bff8974 journal-sehajneet`).

Inspection of `code/backend/` verified that initial project initialization and authentication backend infrastructure are present (`models/user.models.js`, `models/skill.model.js`, `controllers/auth.controllers.js`, `routes/auth.routes.js`). No backend controllers, routes, or business logic currently exist for Skill Swap.

To ensure clean development and avoid overlapping responsibilities across the team, system boundaries were clearly defined:

* **Part 1 — Authentication & User System (Sehajneet Kaur)**: Implemented the backend infrastructure for Google OAuth 2.0, JWT token handling (access and refresh), user profile storage, Cloudinary avatar uploads, base Mongoose models, and campus utilities.
* **Part 2 — Community Channels (Shaurya)**: Responsible for campus forum channels, discussions, lending/borrowing requests, and lost-and-found posts.
* **Part 3 — Skill Swap: Discovery & Matching (Raynee Jindal — My Scope)**:
  * Personal skills management: Can Teach (mentor mode) and Want to Learn (student mode).
  * Skill discovery engine: search by keyword, multi-attribute filtering (branch, year, proficiency, meeting format), and relevance sorting.
  * Mentor profile views: teaching portfolio, reviews, star ratings, and listing availability.
  * Session request creation via "Request Chat" / "Request Session".
  * **Module Hand-Off Boundary**: Part 3 responsibility concludes once a skill swap request document is created and submitted to the system.
* **Part 4 — Sessions, Points & Leaderboard (Sahejbir)**: Responsible for downstream request handling: mentor acceptance/rejection, scheduling, OTP exchange, Google Meet link generation, session completion confirmation, credit/points ledger, peer ratings, and leaderboard standings.

---

# Planned System Architecture & Design Artifacts

A Part 3 Architecture Design Pack consisting of 7 technical SVG diagrams was created in an external design directory (`universe-part3-design-artifacts/`) to document design specifications prior to backend implementation:

1. **Overall System Architecture & Team Module Mapping (`01_system_architecture.svg`)**: Visualizes the planned multi-tier system layout, mapping client interfaces to Express routers, Mongoose schemas, and MongoDB collections across all four team modules.
2. **Part 3 Skill Discovery & Matching Architecture (`02_part3_module_architecture.svg`)**: Outlines the planned internal structure of Part 3: Skill Directory, Search & Filter Subsystem, Mentor Profiler, and Request Dispatcher.
3. **Data Architecture & ER Relationships (`03_data_model_er.svg`)**: Documents the planned relational model connecting `User`, `Skill`, `SkillRequest`, `Session`, and `Rating` entities in MongoDB.
4. **Skill Swap User Journey & Hand-Off Boundary (`04_skill_swap_user_journey.svg`)**: Details the student journey from discovery to request submission, explicitly defining the hand-off boundary where Part 3 transfers control to Part 4.
5. **Technical Data Flow: My Skills → Add Skill (`05_backend_data_flow_add_skill.svg`)**: Outlines the planned sequence of client payload submission, JWT middleware verification, Mongoose validation, and database persistence when adding a skill.
6. **Engineering Development Pipeline (`06_development_pipeline.svg`)**: Defines the planned workflow from UI prototyping and schema finalization to API construction and integration.
7. **Feature → Planned API & Database Mapping Matrix (`07_feature_api_database_map.svg`)**: Maps planned REST endpoints (`/api/v1/skills`, `/api/v1/skills/my-skills`, `/api/v1/skills/search`, `/api/v1/skills/requests`) to HTTP methods and anticipated database operations.

*Note: All architecture diagrams represent design plans and specifications; backend endpoints and database collections have not yet been implemented.*

---

# Skill Swap Frontend Prototype

A standalone, interactive frontend prototype was constructed outside the repository (`universe-part3-design-artifacts/frontend-prototype/`) to evaluate user interactions and flows without modifying repository source code.

The prototype establishes a dark campus visual theme: deep space navy (`#090d16`), card containers (`#141d30`), violet and blue accent gradients (`#8b5cf6` → `#3b82f6`), gold indicators for ratings (`#f59e0b`), and green status tags (`#10b981`).

### 1. Skill Discovery & Exploration Interface
* **Search Interaction**: Search input filtering visible cards in real time by skill name, category tag, or mentor name.
* **Filter System**: Filter panel supporting filtering by Academic Branch (COE, ENC, MECH, CIVIL, ELEC), Academic Year (1 to 4), Proficiency Level (Beginner to Expert), and Meeting Format (Online, In-Person, Hybrid).
* **Sorting Mechanism**: Dropdown supporting sorting by Match %, Rating, and Year.
* **Mentor Information Cards**: Displays mentor identity, branch badge, rating, review count, credit rate, and verified skill tags.

### 2. My Skills Management Interface
* **Dual-Track Layout**: Separate views for **Can Teach** (skills the user offers as a mentor) and **Want to Learn** (skills the user seeks to acquire).
* **Skill Action Modals**: Interactive modals to **Add Skill** (with predefined selection or custom input, proficiency level, description), **Edit Skill**, and **Delete Skill** with confirmation prompts.

### 3. Mentor Profile View
* Modal profile view displaying academic credentials, verified skills list, student reviews, rating summary, and listing availability.

### 4. Session Request Flow ("Request Chat")
* Interactive request modal enabling students to specify learning topics, goals, preferred meeting format, and custom message notes.
* Represents the interaction flow up to the Part 3 / Part 4 hand-off boundary.

---

# Authentication Frontend Prototype

Teammate Sehajneet implemented the authentication backend (Google OAuth, JWT tokens, user profiles, and Cloudinary uploads). To model the client-side experience and prepare for future integration, a separate standalone frontend prototype was developed (`universe-part3-design-artifacts/auth-frontend/`).

This prototype was built using the same visual language as the Skill Swap prototype to maintain consistency across UniVerse:

### 1. Welcome & Login Screen
* Landing view featuring UniVerse branding and platform highlights.
* **"Continue with Google"** action button.
* **`@thapar.edu` Domain Notice**: Prominent banner explaining that access is strictly limited to Thapar University student/faculty Google Workspace accounts.

### 2. Simulated Google Sign-In & Domain Verification
* Interactive account selector dialog demonstrating two distinct paths:
  * **Invalid Domain Demo (`aarav.personal@gmail.com`)**: Selecting a non-Thapar email displays an explicit error alert: *"Only @thapar.edu Google accounts are allowed to access UniVerse"*.
  * **Valid Domain Demo (`aarav@thapar.edu`)**: Selecting the institutional email simulates token receipt, displays an authentication loading state, and transitions to the authenticated dashboard.

### 3. Authenticated Home & Dashboard
* Personalized welcome banner with academic standing.
* Navigation cards linking to Skill Swap Discovery, Academic Channels, and Campus Utilities.
* Active session status card displaying simulated session parameters.

### 4. Student Profile Management (Aarav Sharma)
* Populated with mock institutional data:
  * **Name**: Aarav Sharma (`@aarav`)
  * **Email**: `aarav@thapar.edu`
  * **Academic Details**: B.Tech, Computer Engineering, Year 3, Class of 2027, CGPA 8.70.
  * **Bio**: *"Computer engineering student interested in peer learning, technology and collaborative projects."*
  * **Platform Stats**: 245 Credits, 4.8 / 5.0 Average Rating across 24 peer reviews.
* **Edit Profile Modal**: Form enabling updates to academic details and bio with client-side range validation (CGPA 0.0–10.0).
* **Avatar Upload Modal**: File input with HTML5 `FileReader` local preview, avatar preset selection, and simulated Cloudinary upload progress indicator.
* **Logout Flow**: Session clearance returning the interface to the unauthenticated login state with toast notification.

---

# Technical Problems & Errors Encountered

During local repository inspection and backend runtime testing, two development issues were diagnosed:

### 1. Missing CLI Dependencies & Nodemon Failure
* **Symptom**: Executing `npm run dev` inside `code/backend` initially failed with:
  ```text
  Error: Cannot find module './lib/cli'
  code: 'MODULE_NOT_FOUND'
  ```
* **Cause**: Local package binaries in `node_modules` were incomplete or corrupted during environment setup.
* **Resolution**: Reinstalled local backend packages cleanly using `npm install` inside `code/backend`.

### 2. MongoDB URI Scheme Configuration Error
* **Symptom**: Following dependency reinstallation, backend startup halted during Mongoose connection initialization with:
  ```text
  MongoParseError: Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"
  ```
* **Cause**: The local environment configuration (`.env`) lacked a valid `MONGODB_URI` connection string.
* **Status**: In accordance with project safety guidelines, no database credentials or `.env` files were modified or committed. This error was **not** resolved during this period and remains pending until team database credentials are standardized.
* **Impact**: Backend integration was not completed; all prototyping work was intentionally maintained in local mock state to prevent dependency on an unverified database state.

---

# Current Foundation & Status

At the conclusion of this period, the following assets have been completed:

* **Part 3 Architecture Design Pack**: 7 detailed SVG diagrams establishing planned module boundaries, ER schemas, and endpoint specifications.
* **Skill Swap Prototype**: Standalone interactive prototype covering discovery, filtering, mentor browsing, "My Skills" management, and session request interactions.
* **Auth Frontend Prototype**: Standalone interactive prototype modeling the `@thapar.edu` Google sign-in flow, domain error alerts, authenticated home, profile editing, and avatar preview.
* **Repository State**: Verified clean git status on branch `feature/auth-frontend` (base commit `bff8974`). All prototypes and design packages are maintained in external design directories (`universe-part3-design-artifacts/`) without modifying the primary codebase.
* **Scope Summary**:
  * Skill Swap backend APIs (controllers, routes, matching algorithms) were **not** implemented in this phase.
  * MongoDB integration was **not** completed.
  * No external prototype code has been committed to the main branch.

---

# Next Steps

With UI flows, module boundaries, and architecture contracts designed, the priorities for the next phase are:

1. **Resolve MongoDB Configuration**: Configure a valid MongoDB development URI in `.env` to establish a stable backend runtime.
2. **Implement Skill Swap Backend Models**: Create Mongoose schemas for `Skill` and `SkillRequest` based on the Part 3 ER design (`03_data_model_er.svg`).
3. **Build Core Skill APIs**: Implement backend controllers and routes for:
   * `POST /api/v1/skills` (Add skill to user profile).
   * `GET /api/v1/skills/my-skills` (Fetch authenticated user's teaching/learning lists).
   * `GET /api/v1/skills/search` (Search and filter skills with pagination).
   * `POST /api/v1/skills/requests` (Create skill swap request for Person 4 hand-off).
4. **Connect Frontend to Auth Backend**: Integrate the auth frontend login and profile views with Sehajneet’s existing `/api/v1/auth` endpoints.
5. **Coordinate Request Hand-off with Person 4**: Align the `SkillRequest` data structure with Person 4 (Sahejbir) for session acceptance and scheduling.

---

## Reflection

This phase bridged the conceptual planning from Journal 1 into **concrete visual, architectural, and structural assets**.

Developing standalone frontend prototypes for both Skill Swap and Authentication allowed me to validate user flows, test UI states, and clarify data contracts before writing backend code. The 7-diagram design pack establishes a clear technical blueprint for Part 3 development while delineating my scope from the downstream session management and rewards modules handled by my teammates.
