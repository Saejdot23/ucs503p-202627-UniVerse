# Week 1 : Skill swap understanding and planning

## What I Worked On

My work focused on planning the structure and flow of my assigned Skill Swap module before development.

---

## Module Scope

My assigned part is **Skill Swap Discovery + Matching**.

The features included in my module are:

- Adding skills I can teach.
- Adding skills I want to learn.
- Editing or removing skills.
- Discovering students.
- Searching for skills.
- Filtering students.
- Viewing recommendations.
- Viewing mentor/student profiles.
- Creating and sending a Skill Swap request.

My work ends after a Skill Swap request is successfully created and sent.

---

## Frontend Structure Planning

I identified the main pages that will be needed for my Skill Swap frontend:

- Skill Swap Home.
- My Skills.
- Discover Students.
- Recommendations.
- Mentor/Student Profile.

These pages will form the main structure of my module.

---

## User Flow Planning

I planned how a student should move through the Skill Swap feature.

### Discovering a Mentor

```text
Discover Students
        ↓
Search for a Skill
        ↓
Find a Mentor
        ↓
Open Mentor Profile
        ↓
Request Session
        ↓
Send Request
```

### Managing Skills

```text
My Skills
        ↓
Add Skill
        ↓
Choose Teach / Learn
        ↓
Add Skill Details
        ↓
Save
```

This planning helps ensure that the different pages and features will connect properly when development begins.

---

## Modal Planning

A modal is a small temporary pop-up window that appears on top of the current page.

For example:

```text
My Skills Page
       ↓
Click "+ Add Skill"
       ↓
Add Skill Modal Opens
       ↓
Enter Details
       ↓
Save
       ↓
Modal Closes and Page Updates
```

I identified the main modals that may be required:

- Add Skill Modal.
- Create Custom Skill Modal.
- Edit Skill Modal.
- Filter Modal.
- Request Session Modal.
- Request Sent Success Modal.

Modals will be used for smaller actions and forms, while larger features such as Discover and Mentor Profile will be separate pages.

---

## Button and Page Connections

I also started planning how important buttons will connect different parts of the frontend.

Examples:

```text
Explore Skills
      ↓
Discover Page

Add Skill
      ↓
Add Skill Modal

View Profile
      ↓
Mentor Profile

Request Session
      ↓
Request Session Modal
```

---

## Reusable Components Identified

I identified some components that can be reused throughout the Skill Swap frontend:

- SkillCard.
- StudentCard.
- SearchBar.
- FilterPanel.
- SkillTag.
- ProficiencyBadge.

These reusable components will help maintain a consistent UI and avoid creating the same design multiple times.

---

## Summary

The main work completed this week was planning the structure and flow of the Skill Swap frontend before starting development.

I focused on understanding:

- What features I am responsible for.
- What pages are required.
- How users will move through the feature.
- Which actions should use modals.
- How buttons and pages should connect.
- Which components can be reused.

---

## Next Steps

- Create the main frontend page structure.
- Build reusable components.
- Create the required modals.
- Connect buttons, pages, and modals.

