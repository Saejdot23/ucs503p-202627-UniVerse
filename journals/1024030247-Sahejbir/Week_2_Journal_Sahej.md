# Week 2 Journal — Sahejbir Singh

**Role:** Community Channels

## 1. What did I work on this week?

This week, I focused on understanding how the **Community Channels** feature would work from the backend side.

I looked at the complete flow of a community post:

```text
Create Post → Validate → Store in Database → Display → Update/Resolve
```

I understood that different channels like **Lending, Borrowing, Lost, Found, and General** would use the same basic post structure.

---

## 2. What did I learn?

I worked on understanding the basic structure of a post, including:

- Post ID
- User/Author
- Channel
- Title
- Description
- Date
- Status

I also learned how APIs would handle different actions:

```text
GET    → View posts
POST   → Create a post
PATCH  → Update a post
DELETE → Remove a post
```

For example, when a student creates a Lost & Found post, the frontend sends the information to the backend, the backend validates it, and then it is stored in the database.

---

## 3. What was challenging?

The main challenge was understanding how the **frontend, backend, and database connect**.

I initially thought mostly about the page itself, but I realised that every action on the page needs backend logic behind it.

```text
Frontend → API → Backend → Database
```

This helped me understand how my Community Channels module fits into the overall UniVerse project.

---

## 4. Reflection

This week helped me move from thinking about Community Channels as just a UI feature to understanding them as a complete system.

My main learning was how **posts, users, APIs, validation, and database storage work together** to make the feature functional.
