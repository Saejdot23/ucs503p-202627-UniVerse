# Week 1 Journal — Sahejbir Singh

**Role:** Community Channels

## 1. What was my task?

My assigned area was **Community Channels**.

The idea was to give students separate spaces for different campus-related posts:

```text
                    COMMUNITY
                        |
       +----------------+----------------+
       |        |        |        |       |
    Lending Borrowing  Lost     Found  General
```

### Why do we need different channels?

If every post is placed in one feed, it becomes difficult to find relevant information. For example, someone looking for a borrowed item should not have to search through general discussions and lost-item posts.

So I understood the purpose of channels as **organising posts according to their purpose**.

---

## 2. What did I start with?

At the beginning, I mainly thought:

> "We need different pages for different types of posts."

While thinking about how this would actually work, I realised that each channel needs to store and retrieve actual data.

A post would need things such as:

```text
Post
 |
 +-- Author
 +-- Channel
 +-- Content
 +-- Timestamp
 +-- State
```

### Why do we need this information?

- **Author** → to know who created the post.
- **Channel** → to know where the post belongs.
- **Content** → the actual information.
- **Timestamp** → when it was created.
- **State** → whether something has changed, for example a Lost/Found post being resolved.

This was my first understanding that a UI feature also needs a proper **data model** behind it.

---

## 3. How does the frontend get the data?

I came across the basic client-server flow:

```text
+----------+       HTTP/API       +----------+       Database
| Frontend | -------------------> | Backend  | ---------------->
|  (React) | <------------------- | (Node)   | <----------------
+----------+       Response       +----------+       
```

### What is an API here?

An API is the interface through which the frontend asks the backend to perform an operation or provide data.

For example:

```text
User opens a channel
       |
       v
Frontend requests posts
       |
       v
Backend receives request
       |
       v
Backend gets data from database
       |
       v
Frontend displays posts
```

### What did I learn from this?

I realised that React does not directly need to know how the database works. The backend acts as the layer between the frontend and the stored data.

This introduced me to the idea of **separation of concerns**.

---

## 4. What happens when data is invalid?

While thinking about the feature, I realised that the application cannot assume every request is correct.

For example:

```text
Create Post
    |
    +--> Valid channel? ---- No ---> Reject
    |
   Yes
    |
    v
Store Post
```

### Why is validation necessary?

Without validation, users could send incomplete or invalid information directly to the backend.

This taught me that validation should be part of the application's logic and not only something handled by the interface.

---

## 5. How would real-time communication help?

For normal operations, an HTTP request is enough:

```text
User → Request → Server → Response
```

But for something like live communication, repeatedly asking the server:

> "Did anything new happen?"

would be inefficient.

This is where I encountered **Socket.IO**.

```text
User A
   |
   | message/event
   v
Socket.IO Server
   |
   | real-time event
   v
User B
```

### What did I understand?

Socket.IO allows the server to push events to connected users, so information can appear without the user manually refreshing the page.

I learned that this is different from the normal request-response pattern I was initially thinking about.

---

## 6. What was the main difficulty?

My main difficulty was moving from thinking about the **screen** to thinking about the **system behind the screen**.

Initially:

```text
"Make a Community page."
```

After breaking it down:

```text
Channel
  ↓
Post
  ↓
User
  ↓
API
  ↓
Backend
  ↓
Database
  ↓
Validation
  ↓
Possible state changes
  ↓
Real-time updates
```

This was the biggest change in how I approached the feature.

---

## 7. What did I actually learn?

| Question | My understanding |
|---|---|
| What is a channel? | A way to organise posts by purpose |
| Why a data model? | To represent users, posts, channels and their properties |
| What is an API? | The communication interface between frontend and backend |
| Why validation? | To prevent invalid data/actions |
| Why Socket.IO? | To support real-time events |
| What is separation of concerns? | Keeping UI, server logic and data responsibilities separate |

---

## 8. My reflection

Week 1 was mainly about understanding what is required to turn the idea of Community Channels into an actual software feature.

I started with a simple idea of having different sections and gradually began understanding the data, API, validation and real-time communication behind them.

The important thing I learned was that I should not think only about **what the user sees**, but also about **what happens after the user performs an action**.

At the end of Week 1, the team ideated the major workflows and assigned individual responsibilities. I was assigned **Community Channels**.
