# Week 2 Journal — Shaurya Ranjan

**Name:** Shaurya Ranjan  
**Role:** Sessions, Points & Leaderboard  
**Week:** 2  
**Project:** UniVerse — Campus Community & Skill-Exchange Platform

## 1. Work Done

This week, I focused on converting my assigned **Sessions, Points and Leaderboard** features into a clear system workflow.

The main workflow I worked on was:

```text
Skill Request
     ↓
Accept / Decline
     ↓
Session
     ↓
Both Users Confirm
     ↓
Session Completed
     ↓
Points Awarded
     ↓
Leaderboard Updated
```

I focused on making sure that points are awarded only after a session is properly completed and confirmed by both participants.

## 2. Session Workflow

I worked on identifying valid and invalid session transitions.

```text
Requested → Accepted → Confirmed → Completed
     ↓
  Declined

Accepted → Cancelled
```

A session should not be directly marked as completed without going through the required confirmation process. This helps prevent incorrect completion and ensures that both participants agree that the session took place.

## 3. Points System

I worked on connecting session completion with the points system.

```text
Completed Session
       ↓
Calculate Points
       ↓
Create Transaction
       ↓
Update User Balance
```

Instead of only maintaining a points balance, the system uses a transaction/ledger approach so that points earned or spent can be tracked.

I also considered repeated sessions between the same users and the need for rules that prevent users from unnecessarily farming points.

## 4. Leaderboard

The leaderboard uses the points earned through valid activities.

```text
Session Completed
       ↓
Points Updated
       ↓
Leaderboard Ranking
```

Users with higher valid point balances appear higher on the leaderboard. This connects the leaderboard directly to actual participation in the Skill Swap system.

## 5. Edge Cases Considered

I also considered situations such as:

- A request being declined.
- A session being cancelled.
- Only one participant confirming completion.
- Invalid state transitions.
- Repeated sessions between the same users.

These cases helped me understand why validation is important before awarding points.

## 6. What I Learned

This week helped me understand that a feature is not just an individual screen or function. It is a complete workflow with different states and rules.

For my assigned features, the overall relationship is:

```text
SESSION
   ↓
COMPLETION
   ↓
POINTS
   ↓
LEADERBOARD
```

A mistake in the session workflow can affect the points system and eventually the leaderboard. Designing the workflow carefully therefore helps maintain the correctness of the complete system.

## 7. Reflection

During Week 2, I gained a better understanding of **state transitions, validation, business rules and how different modules of a software project depend on each other**. I also got a clearer idea of how the Session, Points and Leaderboard features will work together in the final system.
