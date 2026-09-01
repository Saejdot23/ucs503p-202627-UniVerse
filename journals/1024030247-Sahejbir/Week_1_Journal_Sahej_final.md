# Week 1 Journal — Sahejbir Singh

**Role:** Community Channels

## 1. Week 1 Focus

My focus in Week 1 was understanding and planning the **Community Channels** feature of UniVerse.

The idea was to separate different types of campus interaction into dedicated channels.

```text
                         COMMUNITY
                             |
        +--------------------+--------------------+
        |         |          |          |         |
     Lending  Borrowing    Lost       Found    General
```

## 2. Feature Flow

I broke the basic community interaction into the following flow:

```text
+--------+     +-------------+     +-------------+     +----------+
|  User  | --> | Select      | --> | Create/View | --> | Backend  |
|        |     | Channel     |     | Post        |     | API      |
+--------+     +-------------+     +-------------+     +----------+
                                                            |
                                                            v
                                                     +-------------+
                                                     |   Database  |
                                                     +-------------+
                                                            |
                                                            v
                                                     +-------------+
                                                     | Show Result |
                                                     +-------------+
```

This helped me understand that a frontend feature also requires backend logic and persistent data.

## 3. What I Learned

A community post is not just text. It needs information such as the author, channel, content, timestamp and state.

```text
User
 |
 +--> Author
 |
 +--> Community Post
          |
          +--> Channel
          +--> Content
          +--> Timestamp
          +--> State
```

I also started understanding the difference between normal API requests and real-time communication through Socket.IO.

## 4. Key Learning

| Area | Learning |
|---|---|
| Requirements | Turning an idea into specific behaviour |
| Database | Connecting posts, users and channels |
| API | Frontend ↔ Backend communication |
| Real-time | Understanding event-based updates |
| Validation | Considering invalid actions and edge cases |

## 5. Reflection

The main thing I learned in Week 1 was that designing a feature requires more than deciding what the interface should look like. I had to think about requirements, data, API behaviour and possible states.

At the end of Week 1, the team ideated the major workflows and assigned individual responsibilities. I was assigned **Community Channels**, giving me a clear direction for the following weeks.
