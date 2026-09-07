# Week 1 Journal — Shaurya Ranjan

**Role:** Sessions, Points & Leaderboard

## 1. What was my task?

My assigned area was **Sessions, Points and Leaderboard**.

The purpose was to create a complete workflow around the skill-exchange system.

```text
Session Request
      |
      v
Accept / Decline
      |
      v
   Session
      |
      v
 Completion
      |
      v
   Points
      |
      v
Leaderboard
```

---

## 2. What did I start with?

Initially, I thought a session would be simple:

> Student A wants to learn → Student B teaches → Session happens.

When I started breaking this down, I realised there are several possible situations.

For example:

- A request can be accepted.
- A request can be declined.
- An accepted session can be cancelled.
- A completed session needs confirmation.
- Points should only be awarded at the correct stage.

This led me to the idea of **states**.

---

## 3. What are states?

A state represents the current stage of an object or process.

For a session, I understood it roughly as:

```text
                 +------------+
                 | Requested  |
                 +------+-----+
                        |
              +---------+---------+
              |                   |
              v                   v
        +-----------+       +-----------+
        | Accepted  |       | Declined  |
        +-----+-----+       +-----------+
              |
        +-----+------+
        |            |
        v            v
   +----------+  +-----------+
   | Completed|  | Cancelled |
   +----------+  +-----------+
```

### Why do we need states?

Suppose a user tries to complete a session immediately after creating it.

That should not be allowed.

The system therefore needs rules such as:

```text
Requested → Accepted     ✓
Requested → Completed    ✗
Accepted  → Completed    ✓
```

This helped me understand why **backend validation and state transitions** are important.

---

## 4. How do points fit into this?

After understanding sessions, I looked at what should happen when a session is completed.

```text
Completed Session
       |
       v
   Points Rule
       |
       v
Points Transaction
       |
       v
 User's Points
```

### Why not simply change the user's points?

If the system only stores:

```text
User Points = 150
```

we cannot easily tell why the user has 150 points.

Instead, a transaction record can explain changes:

```text
Transaction
 |
 +-- User
 +-- Amount
 +-- Reason
 +-- Related action
 +-- Time
```

### What did I learn?

I learned that keeping a record of changes makes important data easier to understand and verify.

This introduced me to the idea of a **ledger/transaction-based approach**.

---

## 5. How should the leaderboard work?

My first thought was:

> "Sort users by points."

That is the basic idea, but I realised that ranking requires rules.

For example:

```text
User A → 150 points
User B → 120 points
User C → 150 points
```

### What happens when points are equal?

The system needs a consistent way to break ties or decide ranking.

It also needs to decide things such as:

- Which users are eligible?
- What statistics matter?
- How should ties be handled?

This taught me that a leaderboard is not just a UI list. It depends on **defined business rules**.

---

## 6. How are my three features connected?

This became the most important relationship I understood:

```text
+-------------------+
| Session Completed |
+---------+---------+
          |
          v
+-------------------+
| Points Transaction|
+---------+---------+
          |
          v
+-------------------+
|   User's Points   |
+---------+---------+
          |
          v
+-------------------+
| Leaderboard Rank  |
+-------------------+
```

A mistake in one stage could therefore affect the stages after it.

For example, awarding points before a session is genuinely completed could give an incorrect leaderboard result.

---

## 7. What was difficult?

The difficult part for me was thinking about the **complete lifecycle** instead of only the successful case.

Initially:

```text
Request → Session → Points
```

After thinking about actual users:

```text
Request
  |
  +--> Accept
  |      |
  |      +--> Complete → Points
  |      |
  |      +--> Cancel
  |
  +--> Decline
```

This made me understand why edge cases and validation are important in software development.

---

## 8. What did I actually learn?

| Question | My understanding |
|---|---|
| What is a session state? | The current stage of a session |
| Why states? | To control which actions are allowed |
| What is a points transaction? | A record explaining a points change |
| Why a ledger? | To make changes traceable |
| What is a leaderboard? | A ranking generated from defined rules |
| Why validation? | To prevent incorrect state changes and rewards |

---

## 9. My reflection

Week 1 helped me understand that Sessions, Points and Leaderboard are not three completely separate features.

They form a chain:

**Session → Completion → Points → Ranking**

The biggest thing I learned was to think about the complete lifecycle of an action and the rules that control it, rather than only thinking about the final screen.

At the end of Week 1, the team ideated the major workflows and assigned individual responsibilities. I was assigned **Sessions, Points and Leaderboard**.
