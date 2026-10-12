# Week 3 Journal — Shaurya Ranjan

**Name:** Shaurya Ranjan  
**Role:** Sessions, Points & Leaderboard  
**Week:** 3  
**Project:** UniVerse — Campus Community & Skill-Exchange Platform

---

## 1. What was my task?

In Week 3, I moved from working mainly on the workflow assignment to looking at the actual **JavaScript backend implementation** of the project.

For this week, I worked with my friend **Sahejbir Singh** on the Community Channels backend.

We divided the JavaScript work between us:

```text
Shaurya
   ↓
Comment Model
Comment Controller

Sahejbir
   ↓
Post Model
Post Controller
Post Routes
```

My main focus was understanding and working on how **comments are stored, created, displayed and deleted** within a post.

---

## 2. Working on the Comment Model

I worked on `comment.model.js`, which defines how comments are stored in the database.

The basic relationship is:

```text
User
  |
  v
Comment
  |
  v
Post
```

A comment contains information such as:

```text
Comment
 ├── Post
 ├── Author
 ├── Body
 ├── Parent
 └── Depth
```

The `post` and `author` fields connect the comment to the relevant post and user.

I also worked with the `parent` and `depth` fields to support replies.

```text
Comment
   |
   └── Reply
        |
        └── Reply
```

The depth is limited to two levels so that comments do not continue nesting indefinitely.

The comment body is also validated and limited to 2000 characters.

---

## 3. Working on the Comment Controller

After understanding the model, I worked on `comment.controllers.js`.

The controller handles the actual operations on comments.

The basic workflow became:

```text
Request
   ↓
Check Post
   ↓
Validate Comment
   ↓
Database Operation
   ↓
API Response
```

I worked on three main operations:

```text
GET
 ↓
Fetch Comments

POST
 ↓
Create Comment / Reply

DELETE
 ↓
Delete Comment
```

The controller uses the post ID to determine which post the comments belong to.

---

## 4. Fetching Comments

For fetching comments, I worked on retrieving the top-level comments first.

```text
Post
 |
 +-- Comment 1
 |     +-- Reply
 |     +-- Reply
 |
 +-- Comment 2
 |     +-- Reply
 |
 +-- Comment 3
```

The comments are sorted with the newest comments first.

The controller then finds replies belonging to those comments and places them underneath their parent comment.

This creates a more useful structure for the frontend instead of returning all comments as one flat list.

---

## 5. Creating Comments and Replies

I also worked on the process of creating comments.

The workflow is:

```text
User writes comment
        ↓
Check comment body
        ↓
Check post exists
        ↓
Check post is open
        ↓
Check parent comment
        ↓
Create comment
```

If the user is replying to another comment, the controller checks whether the parent comment exists and belongs to the same post.

It also calculates the depth of the reply.

```text
Top-level Comment
       ↓
Depth 0

Reply
       ↓
Depth 1

Reply to Reply
       ↓
Depth 2
```

Anything beyond the allowed depth is rejected.

---

## 6. Handling Closed Posts

One of the important conditions I worked on was what happens when a post is closed.

The workflow is:

```text
Post Open
   ↓
Comments Allowed

Post Closed
   ↓
New Comments Rejected
```

This connects the comment system with the post lifecycle.

If a post is closed, users should not be able to create new comments on it.

This helped me understand how one feature can depend on the state of another feature.

---

## 7. Deleting Comments

I also worked on the delete comment functionality.

The system checks:

```text
User wants to delete comment
          ↓
Is comment present?
          ↓
Does comment belong to post?
          ↓
Is user the author?
       /       \
     Yes        No
      ↓          ↓
   Delete     Check Admin
                 ↓
              Delete / Reject
```

Only the comment author or an admin can delete a comment.

If a comment has replies, those replies are deleted as well.

---

## 8. Working with Sahejbir

While I worked on the comment functionality, **Sahejbir worked on the post functionality**.

His three files were:

```text
post.model.js
post.controllers.js
post.routes.js
```

His work handled the main Community Channel post functionality.

The post model supports:

```text
General
Borrow / Lend
Lost & Found
```

and contains information such as the author, title, body, tags, images, votes and status.

---

## 9. Connecting Comments with Posts

The main part of our collaboration was making sure my comment functionality worked with Sahejbir's post functionality.

The relationship is:

```text
Post
 |
 +----------------+
 |                |
 v                v
Post Data      Comments
                  |
                  +-- Reply
                  |
                  +-- Reply
```

The comment routes are placed under the post routes:

```text
/api/v1/posts/:postId/comments
```

This means that the `postId` is used to identify the post for which comments are being accessed or created.

This was important because we were working on separate files but our features still had to work together.

---

## 10. What did I learn?

This week helped me understand how the workflow I had previously designed can be converted into actual backend code.

Previously, I mainly thought about:

```text
What should happen?
```

This week I focused more on:

```text
How will the backend make it happen?
```

For the comment system, the flow became:

```text
User
 ↓
Route
 ↓
Controller
 ↓
Validation
 ↓
Model
 ↓
Database
 ↓
Response
```

This helped me understand the relationship between different backend components.

---

## 11. Difficulties faced

The main difficulty was understanding how the **post and comment systems depend on each other**.

Comments cannot exist independently because every comment needs a post.

The relationship can be represented as:

```text
Post
 ↓
Comment
 ↓
Reply
```

I also had to consider different cases such as:

```text
Invalid Post
       ↓
Reject

Closed Post
       ↓
Reject New Comment

Invalid Parent
       ↓
Reject Reply

Too Much Nesting
       ↓
Reject Reply
```

Thinking about these cases helped me understand why validation is important in backend development.

---

## 12. My contribution during Week 3

During this week, I focused on:

- Working on `comment.model.js`.
- Working on `comment.controllers.js`.
- Creating the comment and reply workflow.
- Implementing nested comments with a depth limit.
- Fetching comments and their replies.
- Validating comments and parent comments.
- Preventing comments on closed posts.
- Implementing comment deletion.
- Connecting the comment functionality with Sahejbir's post functionality.
- Understanding how the JavaScript backend implements the workflow.

---

## 13. Reflection

Week 3 helped me move from **workflow design to actual implementation**.

In the previous week, I was mainly focused on understanding the system as a workflow.

This week, I started seeing how that workflow becomes actual backend functionality:

```text
Workflow
   ↓
Routes
   ↓
Controllers
   ↓
Models
   ↓
Database
```

Working with Sahejbir also helped me understand how two developers can work on separate modules and then integrate them.

For our Community Channels feature, the relationship is:

```text
             POST
               |
               v
           COMMENTS
               |
               v
             REPLIES
```

The main lesson I learned this week is that implementing a feature is not only about writing the main functionality. It also requires handling validation, permissions, edge cases and the relationship between different modules.

This gave me a better understanding of how the backend of UniVerse is being developed and how my assigned work fits into the larger project.
