# Journal 3: Skill Swap Backend Implementation

## Part 3 — Skill Discovery & Matching

### Objective

The primary objective for this week was to move the Skill Swap module from its earlier frontend and architectural planning stage toward backend implementation.

The work focused on implementing the core backend functionality required for the Skill Swap skill catalog, personal skill management, and discovery flows. The implementation follows the existing UniVerse backend architecture and uses Express routes, Mongoose models, JWT authentication middleware, and the project's existing error and response utilities.

---

## Work Completed

This week's Skill Swap backend work covers the following feature areas:

1. Skill catalog listing and retrieval.
2. Skill creation with validation and duplicate handling.
3. Retrieval of the authenticated user's teaching and learning skills.
4. Adding and removing skills from the **Can Teach** list.
5. Adding and removing skills from the **Want to Learn** list.
6. Teach Discovery for finding learners interested in skills.
7. Learn Discovery for finding mentors offering skills.

The Skill Swap router applies `verifyJWT` to the complete route group, making the Skill Swap operations available only within an authenticated user context.

---

# 1. Skill Catalog

## List Skills

The `GET /api/v1/skills` endpoint provides the global Skill Swap catalog.

It supports:

- Keyword search using the `q` query parameter.
- Category filtering using `category`.
- Sorting using `demandToLearn`, `demandToTeach`, or `name`.
- Pagination using `page` and `limit`.

The search is case-insensitive and the results are returned together with the total number of matching skills, current page, and total pages.

This creates the backend foundation for the Explore Skills interface developed during the frontend prototyping phase.

## Get Skill by ID

The `GET /api/v1/skills/:id` endpoint retrieves a single skill document by its ID.

If the requested skill does not exist, the controller returns a `404` error using the existing `ApiError` utility.

---

# 2. Skill Creation

The `POST /api/v1/skills` endpoint allows an authenticated user to create a new catalog skill.

The implementation performs several validations:

- A skill name must be supplied.
- The category must be either `Tech` or `Non-tech`.
- Extra whitespace in the skill name is normalized.
- Skill names are converted to lowercase for consistency.
- An existing skill with the same normalized name is returned instead of creating a duplicate.

A newly created skill returns HTTP `201`, while an already existing skill returns the existing catalog entry.

This prevents unnecessary duplicates and keeps the global skill catalog consistent.

---

# 3. My Skills Management

## Get My Skills

The `GET /api/v1/skills/my` endpoint retrieves both personal skill lists for the authenticated user:

- `skillsToTeach`
- `skillsToLearn`

Both lists are populated with relevant Skill information such as the skill name, category, and demand counters.

This provides the frontend with a single endpoint for displaying the student's current Skill Swap preferences.

## Add Teaching Skill

The `POST /api/v1/skills/my/teach` endpoint adds a skill to the authenticated user's `skillsToTeach` list.

The controller:

1. Validates the supplied `skillId`.
2. Confirms that the referenced skill exists.
3. Checks whether the skill is already present in the user's teaching list.
4. Adds the skill to the teaching list.
5. Increments the skill's `demandToTeach` counter.
6. Returns the updated user information.

Duplicate entries are rejected with a `409` conflict response.

## Remove Teaching Skill

The `DELETE /api/v1/skills/my/teach/:skillId` endpoint removes a skill from the user's teaching list.

The implementation checks that the skill is actually present before removing it. It then decreases `demandToTeach` and prevents that counter from becoming negative.

## Add Learning Skill

The `POST /api/v1/skills/my/learn` endpoint adds a skill to `skillsToLearn`.

It validates the skill, prevents duplicate entries, updates the authenticated user's learning list, and increments `demandToLearn`.

## Remove Learning Skill

The `DELETE /api/v1/skills/my/learn/:skillId` endpoint removes a skill from `skillsToLearn`.

The controller verifies that the skill exists in the user's list, removes it, decreases `demandToLearn`, and ensures that the counter cannot fall below zero.

---

# 4. Teach Discovery

The `GET /api/v1/skills/teach-discovery` endpoint supports the **I Want to Teach** flow.

The discovery logic prioritizes skills with higher `demandToLearn`, meaning skills that more users are currently interested in learning.

The endpoint supports:

- Skill search.
- Category filtering.
- Branch filtering.
- Year filtering.
- Pagination.

After retrieving the matching skills, the controller finds authenticated user records whose `skillsToLearn` list contains those skills. Relevant learner profile information is included with the corresponding skill.

This provides the backend foundation for a student who wants to teach by showing which skills are in demand and which learners are interested in them.

---

# 5. Learn Discovery

The `GET /api/v1/skills/learn-discovery` endpoint supports the **I Want to Learn** flow.

Skills are ordered using `demandToTeach`, prioritizing skills that are being offered by more mentors.

The endpoint supports:

- Skill search.
- Category filtering.
- Branch filtering.
- Year filtering.
- Pagination.

The controller then retrieves users whose `skillsToTeach` list contains the matching skills. Mentor profile information such as name, username, avatar, branch, year, rating, teaching skills, and credits is included in the response.

Mentors are ordered by average rating to provide a relevance signal for the learner-facing discovery experience.

---

# API Route Structure

The Skill Swap router groups the functionality into three main areas.

### Catalog

```text
GET    /api/v1/skills
POST   /api/v1/skills
GET    /api/v1/skills/:id
```

### Discovery

```text
GET    /api/v1/skills/teach-discovery
GET    /api/v1/skills/learn-discovery
```

### Personal Skill Lists

```text
GET    /api/v1/skills/my

POST   /api/v1/skills/my/teach
DELETE /api/v1/skills/my/teach/:skillId

POST   /api/v1/skills/my/learn
DELETE /api/v1/skills/my/learn/:skillId
```

All routes are protected by the existing JWT verification middleware.

---

# Technical Design Decisions

The implementation follows the existing UniVerse backend conventions instead of introducing a separate architecture.

The controllers use:

- `Skill` and `User` Mongoose models.
- `verifyJWT` authentication middleware.
- `asyncHandler` for asynchronous request handling.
- `ApiError` for centralized error handling.
- `ApiResponse` for consistent API responses.

The discovery design uses two complementary demand counters:

- `demandToLearn` — represents the number of users interested in learning a skill.
- `demandToTeach` — represents the number of users offering a skill.

These counters are updated when users add or remove skills from their personal lists. They are then used to prioritize discovery results.

This creates a direct relationship between student skill preferences and the discovery experience.

---

# Validation and Error Handling

The controllers include validation for common invalid requests, including:

- Missing skill name.
- Invalid skill category.
- Missing `skillId`.
- Skill not found.
- Duplicate skill in a teaching list.
- Duplicate skill in a learning list.
- Attempting to remove a skill that is not present in the relevant list.

The implementation uses appropriate HTTP status codes such as:

- `400` for invalid input.
- `404` for resources that do not exist.
- `409` for duplicate entries.

These errors are passed through the project's existing `ApiError` handling system.

---

# Relationship to the Skill Swap Frontend

The backend functionality was designed to support the Skill Swap frontend prototype developed earlier.

The mapping is:

| Frontend Requirement | Backend Support |
|---|---|
| Explore Skills | Skill catalog listing, search, filtering, pagination |
| Skill Details | Individual skill retrieval |
| Add Skill | Skill creation endpoint |
| My Skills | Personal teach/learn retrieval |
| Can Teach | Add/remove teaching skills |
| Want to Learn | Add/remove learning skills |
| I Want to Teach | Teach Discovery |
| I Want to Learn | Learn Discovery |
| Mentor Discovery | Learn Discovery mentor results |
| Learner Discovery | Teach Discovery learner results |

This keeps the backend structure aligned with the previously designed Skill Swap user flows.

---

# Current Status

The Skill Swap backend now contains the core functionality for:

- Global skill catalog management.
- Skill search and category filtering.
- Individual skill retrieval.
- Personal Can Teach management.
- Personal Want to Learn management.
- Demand counter maintenance.
- Teach-oriented discovery.
- Learn-oriented discovery.
- Learner and mentor retrieval.
- Pagination for catalog and discovery results.
- JWT-protected Skill Swap routes.

The implementation currently establishes the core discovery and personal skill-management layer. The downstream session/request lifecycle is not covered by these routes and remains outside this portion of the module.

---

# Verification Focus

The main verification areas for this implementation are:

1. Skill catalog search and filtering.
2. Skill creation and duplicate handling.
3. Retrieving the authenticated user's teaching and learning lists.
4. Adding and removing teaching skills.
5. Adding and removing learning skills.
6. Teach Discovery results and learner filtering.
7. Learn Discovery results and mentor filtering.
8. Correct pagination and demand-based ordering.
9. Authentication protection across all Skill Swap routes.
10. Correct validation and error responses for invalid requests.

---

# Next Steps

The next development phase can focus on:

1. Connecting these Skill Swap endpoints with the existing frontend prototype.
2. Testing the discovery filters and pagination against realistic database data.
3. Validating the mentor and learner response structures against the UI requirements.
4. Implementing the Skill Swap request-creation stage.
5. Coordinating the Skill Request hand-off with the downstream session-management module.

---

# Reflection

This week's work moved the Skill Swap module beyond its initial UI and architectural planning into a concrete backend implementation.

The key outcome was establishing a structured system for managing what students can teach, what they want to learn, and how those preferences influence discovery. Separating the Teach Discovery and Learn Discovery flows also provides a clear backend foundation for the two main Skill Swap journeys represented in the frontend prototype.

The use of authenticated routes, validation, centralized error handling, demand counters, filtering, and pagination provides a scalable starting point for connecting the module to the rest of UniVerse.
