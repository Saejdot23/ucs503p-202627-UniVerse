# Week 1 Journal — Shaurya Ranjan

**Role:** Sessions, Points & Leaderboard

## 1. Week 1 Focus

My focus in Week 1 was understanding the workflow connecting **Sessions, Points and the Leaderboard**.

The basic relationship I worked with was:

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

## 2. Session Workflow

I broke the session process into different states:

```text
                 +------------+
                 |  Requested |
                 +-----+------+
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
 +-----------+  +-----------+
 | Completed |  | Cancelled |
 +-----------+  +-----------+
       |
       v
     Points
```

This helped me understand that the backend needs to control which actions are valid at each stage.

For example, a session should not become completed before it has been accepted.

## 3. Points

I then looked at how completed sessions could affect points.

```text
+------------------+
| Completed Session|
+--------+---------+
         |
         v
+------------------+
|   Points Rule    |
+--------+---------+
         |
         v
+------------------+
| Points Transaction|
+--------+---------+
         |
         v
+------------------+
|   User Points    |
+------------------+
```

I learned that points should have a clear reason behind every change. Keeping transaction records makes the system easier to understand and verify.

## 4. Leaderboard

The points then contribute to the user's ranking:

```text
Sessions
   |
   v
Points
   |
   v
User Ranking
   |
   v
Leaderboard
```

Initially I thought this would simply involve sorting users by points. I learned that ranking also requires defined rules such as eligibility and handling ties.

## 5. Key Learning

| Area | Learning |
|---|---|
| Sessions | Modelling workflows using states |
| Business Logic | Enforcing valid transitions |
| Points | Recording meaningful transactions |
| Leaderboard | Defining ranking rules |
| Integration | Understanding feature dependencies |

## 6. Reflection

My main learning from Week 1 was understanding how several features can form one connected workflow.

A completed session affects points, and points affect the leaderboard. This made me pay more attention to state transitions, validation and consistency.

At the end of Week 1, the team ideated the major workflows and assigned individual responsibilities. I was assigned **Sessions, Points and Leaderboard**, giving me a clear direction for the following weeks.
