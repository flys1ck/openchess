---
name: create-issue
description: Managing Linear issues and projects. Use when working with Linear tasks, creating issues, updating status, or querying projects.
allowed-tools:
  - mcp__linear
---

# Linear

Tools and workflows for managing issues and projects in Linear.

---

## Issue Creation Checklist (Required)

**When creating a Linear issue, always complete these steps — even if the user doesn't mention them.**

1. **Detailed description.** Include what the change is, why it's needed, and scope. If the user provides only a title, infer and write the description yourself. The description should always end with acceptance criteria, which are a checklist of conditions that must be met for the issue to be considered complete. If the user doesn't provide acceptance criteria, create them based on the issue description.

2. **Project assignment.** Assign to the appropriate project using the latest available project, which is not completed (or user instruction). If no project is obvious, ask the user.
