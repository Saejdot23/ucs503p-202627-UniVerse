# Week 3 Journal — Sahejbir Singh

**Role:** Community Channels

## 1. What did I work on this week?

This week, I started working on the actual **JavaScript backend implementation** of the Community Channels feature that I had previously worked on as a workflow.

I worked on three main files:

```text
post.model.js
post.controllers.js
post.routes.js
```

My friend **Shaurya** worked on the comment functionality, so we divided the backend work between us.

The overall workflow I worked on was:

```text
Create Post
     ↓
Validate Post
     ↓
Store in Database
     ↓
Display Post
     ↓
Update / Resolve / Delete
```

---

## 2. Working on the Post Model

I first worked on `post.model.js`.

The purpose of this file was to define what information a Community Channel post should contain in the database.

The basic structure became:

```text
Post
 ├── Author
 ├── Channel
 ├── Title
 ├── Body
 ├── Tag
 ├── Images
 ├── Location
 ├── Item Date
 ├── Votes
 └── Status
```

I also worked with the different channels:

```text
General
Borrow / Lend
Lost & Found
```

For example, Borrow/Lend posts can use:

```text
LEND
BORROW
```

while Lost & Found posts can use:

```text
LOST
FOUND
```

The model also validates these values so that incorrect combinations are not stored in the database.

---

## 3. Working on Post Controllers

After creating the model, I worked on `post.controllers.js`.

This is where I implemented the actual actions that can be performed on posts.

The main workflow was:

```text
Request
   ↓
Validate Input
   ↓
Perform Database Operation
   ↓
Send API Response
```

I worked on functions for:

* Listing posts
* Getting an individual post
* Creating a post
* Closing a post
* Deleting a post
* Voting on General posts

For listing posts, I also worked with filtering, sorting and pagination.

```text
Channel
   +
Status
   +
Tag
   +
Sorting
   ↓
Post List
```

This helped me understand how the backend can provide only the posts that the user needs instead of returning everything at once.

---

## 4. Creating Community Posts

I also worked on the logic for creating posts.

Before creating a post, the backend checks things such as:

```text
Is the channel valid?
        ↓
Is the title present?
        ↓
Is the body present?
        ↓
Is the required tag present?
        ↓
Are the images allowed?
        ↓
Create Post
```

For posts containing images, I also worked with the Cloudinary upload process.

A maximum of five images is allowed for a post. General channel posts do not support image uploads.

This showed me why validation needs to happen before data is stored.

---

## 5. Post Status and Resolving Posts

Another part I worked on was the lifecycle of a post.

For some Community Channels, a post may no longer be relevant after the problem has been solved.

The workflow is:

```text
Open Post
    ↓
Problem / Request Resolved
    ↓
Close Post
    ↓
No More Interactions
```

Only the post author or an admin can close a post.

I also learned that General posts have a different lifecycle and cannot be closed using the same process.

---

## 6. Voting System

I also implemented the voting functionality for the General channel.

The workflow is:

```text
User Votes
    ↓
Check Existing Vote
    ↓
     ┌───────────────┐
     ↓               ↓
No Existing      Existing
Vote             Vote
     ↓               ↓
Add Vote       Change / Remove
     ↓               ↓
Update Count
```

A user cannot simply keep increasing the vote count by voting repeatedly.

The system stores which users have voted and whether their vote was an upvote or downvote.

---

## 7. Working with Shaurya

While I was working on the post functionality, **Shaurya worked on the comment functionality**.

His work included:

```text
comment.model.js
comment.controllers.js
```

The comment system was designed to support both normal comments and replies.

```text
Post
 └── Comment
      └── Reply
           └── Reply
```

The comment model uses a parent comment and depth value to control the nesting.

We needed to make sure that our two parts could work together.

---

## 8. Connecting Posts and Comments

The main connection between our work was the post ID.

The structure became:

```text
Post
  |
  ├── Post Details
  |
  └── Comments
        |
        ├── Comment
        └── Replies
```

The routes were structured so that comments belong to a particular post:

```text
/api/v1/posts/:postId/comments
```

This allows the backend to identify which post the comments belong to.

This was important because our work was divided between two people, but the final feature still needed to behave as one system.

---

## 9. What did I learn?

This week helped me understand how the workflow from Week 2 translates into actual JavaScript code.

Previously, I had the workflow:

```text
Create
  ↓
Validate
  ↓
Store
  ↓
Display
  ↓
Update / Resolve
```

Now I could see how each stage is implemented through different backend components:

```text
Routes
   ↓
Controllers
   ↓
Models
   ↓
Database
```

I also understood that different files can have different responsibilities instead of putting all the logic in one file.

---

## 10. Difficulties faced

The main difficulty was connecting the different parts of the Community Channels feature.

I had to understand how:

```text
Post Model
     ↓
Post Controller
     ↓
Post Routes
     ↓
Comment Controller
     ↓
Comment Model
```

work together.

Another challenge was handling different channel rules, such as tags, images, voting and closing posts.

This made me realise that a simple Community Channel feature has many backend conditions behind it.

---

## 11. My contribution during Week 3

During this week, I focused on:

* Implementing the Post model.
* Working on Post controllers.
* Creating the Post API routes.
* Adding validation for different channels.
* Working on image upload handling.
* Implementing post closing and deletion.
* Implementing General channel voting.
* Connecting the post system with Shaurya's comment functionality.
* Understanding how the workflow assignment translates into actual backend code.

---

## 12. Reflection

Week 3 helped me move from **designing the Community Channels workflow to implementing it**.

In Week 2, I mainly thought about:

```text
What should happen?
```

In Week 3, I started working on:

```text
How will the system actually do it?
```

The complete flow now makes more sense to me:

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

Working with Shaurya also showed me how different developers can work on separate parts of the same feature and then connect them together.

Overall, this week gave me a better understanding of how a backend feature is built from a workflow into working JavaScript code.
