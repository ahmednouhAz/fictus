Exactly. **We should not give Claude one enormous “build everything” prompt.** That is how you end up with a codebase that technically runs but has inconsistent architecture, half-finished features, duplicated logic, and a UI that slowly turns into generic AI-generated SaaS.

We should treat this like an actual product development project:

**Product specification → architecture → foundation → UI system → editor → renderer → device engine → persistence → export → polish → future platforms.**

And importantly:

> **Claude is not allowed to move to the next milestone until the current milestone passes verification.**

You can bring Claude's result back to me after every milestone, and I'll act as **product architect + UI/UX reviewer + code reviewer + QA reviewer** before we proceed.

---

# How I want us to run this project

The workflow will be:

```text
MASTER SPECIFICATION
        ↓
MILESTONE 0
Architecture & environment
        ↓
VERIFY
        ↓
MILESTONE 1
Design system + application shell
        ↓
VERIFY
        ↓
MILESTONE 2
Project / workspace system
        ↓
VERIFY
        ↓
MILESTONE 3
Conversation editor
        ↓
VERIFY
        ↓
MILESTONE 4
Instagram renderer
        ↓
VERIFY
        ↓
MILESTONE 5
iPhone/device engine
        ↓
VERIFY
        ↓
MILESTONE 6
Recipient + asset system
        ↓
VERIFY
        ↓
MILESTONE 7
Persistence + autosave
        ↓
VERIFY
        ↓
MILESTONE 8
Export engine
        ↓
VERIFY
        ↓
MILESTONE 9
Polish + QA
        ↓
VERIFY
        ↓
V1 COMPLETE
```

Then we can start:

```text
V1.1
   ↓
iMessage
   ↓
WhatsApp
   ↓
Scene Builder
   ↓
Animation
   ↓
AI
```

---

# First: the actual product definition

This is the document I want Claude to understand **before touching the code**.

# Social UI Simulation Studio

## 1. Product Definition

Build a premium web-based social interface simulation and composition studio.

The first supported platform is Instagram-style direct messaging.

The application allows users to create editable social conversation mockups, customize the simulated recipient, messages, device environment and presentation, and export polished mockup images.

The application is NOT to be designed as a cheap "fake chat generator."

It is a professional creative tool.

The long-term product is a:

> Social UI Simulation Studio.

Instagram is simply the first renderer.

The architecture must eventually support:

* Instagram
* iMessage
* WhatsApp
* Messenger
* Snapchat
* Telegram
* Discord
* TikTok
* X
* LinkedIn
* additional social/mobile interfaces

---

# 2. Core Product Philosophy

The product should feel:

* premium
* minimal
* precise
* fast
* quiet
* intentional
* Apple-like
* professional

The user should never feel like they are filling out a giant form.

The application should feel like a creative editor.

The central UX principle is:

> Edit the thing you see.

If the user changes a message, the preview changes immediately.

If they change the recipient, the preview changes immediately.

If they change the device, the preview changes immediately.

If they change the status bar, the preview changes immediately.

The product should minimize friction between:

USER ACTION

and

VISIBLE RESULT.

---

# 3. Visual Direction

The supplied reference screenshot is the primary visual inspiration for the application shell.

Do not copy the screenshot.

Extract its visual language:

* dark blue-black background
* subtle borders
* restrained contrast
* sophisticated typography
* rounded surfaces
* compact navigation
* subtle glass/translucency
* soft ambient lighting
* minimal shadows
* generous spacing
* clean information hierarchy

The overall visual direction is:

Apple utility application
+
Linear
+
Raycast
+
premium creative software.

Avoid generic AI-generated SaaS aesthetics.

Avoid:

* excessive cards
* giant headings
* excessive gradients
* excessive glassmorphism
* neon UI
* excessive shadows
* unnecessary animations
* huge rounded containers
* rainbow accents
* visually noisy dashboards

The application should feel expensive because it is restrained.

---

# 4. Application Shell

Desktop-first.

The primary workspace consists of:

LEFT SIDEBAR
+
EDITOR
+
PREVIEW CANVAS

Approximate proportions:

Sidebar:
64px collapsed
220–240px expanded

Editor:
42–46%

Preview:
54–58%

The preview should have slightly more visual space than the editor.

The preview should feel like a creative canvas.

It should NOT feel like another dashboard card.

---

# 5. Sidebar

Collapsed:

* logo
* navigation icons
* tooltips

Expanded:

WORKSPACE

Overview
Projects
Recent

GENERATORS

Instagram
iMessage
WhatsApp
Messenger
More

ASSETS

Recipients
Media
Saved Assets

TOOLS

Scene Builder
Device Frames
Export Studio

SYSTEM

Settings
Account

Future platforms should be visually disabled or marked "Coming soon."

The sidebar should animate smoothly.

---

# 6. Main Navigation

The product should have these conceptual areas:

Dashboard

Projects

Generators

Recipients

Assets

Device Library

Scene Builder

Export Studio

Settings

Not all of these need full functionality in V1.

The navigation architecture should exist so future features have a natural place.

---

# 7. Dashboard

The dashboard should remain simple.

Primary area:

"Create something."

Primary generators:

Instagram

iMessage

WhatsApp

Only Instagram is enabled initially.

Below:

Recent Projects

Saved Recipients

Favorites

The dashboard must not become a metrics/analytics dashboard.

---

# 8. Project Concept

Everything revolves around projects.

A project contains:

* platform
* recipient
* messages
* device
* appearance
* status bar
* background
* export configuration
* future scene information

Projects should autosave.

Users should be able to:

* open
* rename
* duplicate
* favorite
* archive
* delete
* export

---

# 9. Recipient System

Recipients are reusable identities.

A recipient contains:

* avatar
* display name
* username
* verification state
* bio
* activity status
* additional platform metadata

Users should be able to save recipients and reuse them across projects.

Example:

Ana Cucoc
@anacucoc

Selecting Ana should populate a new conversation.

---

# 10. Conversation Model

The conversation must be platform-independent.

Do NOT create an Instagram-specific database structure.

Conceptually:

Conversation

recipient

messages[]

appearance

metadata

platform

Messages contain:

* id
* sender
* type
* content
* timestamp
* metadata
* ordering

Future message types:

* text
* image
* video
* audio
* GIF
* sticker
* link preview
* location
* shared content
* reaction

V1 should focus on text and the minimum necessary Instagram components.

---

# 11. Message Editor

The message editor must be extremely fast.

Primary action:

* Add message

Then:

Me
Recipient

Then immediately focus the text field.

Press Enter.

Message appears.

The editor should support:

* editing
* deleting
* duplicating
* reordering
* changing sender
* changing timestamp

Messages should be draggable.

Simple operations should happen inline.

Do not open unnecessary modals.

---

# 12. Undo / Redo

The editor must support:

Cmd/Ctrl + Z

Cmd/Ctrl + Shift + Z

Editor changes must be reversible.

This is a professional creative tool.

---

# 13. Instagram Renderer

The editor and renderer are separate systems.

The editor manipulates structured conversation data.

The Instagram renderer transforms that data into the simulated interface.

The renderer must be deterministic.

The preview and export must use the same rendering logic wherever possible.

Do not create a screenshot using arbitrary browser DOM hacks that produce different results across environments.

---

# 14. Device Engine

Devices must be configuration-driven.

Do NOT hardcode every iPhone as an independent React component.
Create DeviceDefinition objects containing:
* id
* family
* model
* width
* height
* aspect ratio
* screen radius
* frame radius
* safe areas
* status bar geometry
* camera configuration
* Dynamic Island configuration where applicable
* home indicator configuration
yeSupport iPhone generations 13 through 17.
Include appropriate:
* standard
* Plus
* Pro
* Pro Max
variants where applicable.
The architecture must later support Android.

---

# 15. Device Preview

Right side of workspace:

large device preview.

Controls:

* device selector
* zoom
* fit
* fullscreen
* appearance
* frame toggle
* background

Preview must update immediately.

---

# 16. Status Bar System

Users should be able to configure:

* time
* battery
* battery percentage
* charging state
* Wi-Fi
* cellular signal
* connectivity
* relevant indicators

There should be:

AUTO

and

MANUAL

modes.

Auto should provide sensible defaults.

Advanced users can manually configure the details.

---

# 17. Appearance

Support:

* Light
* Dark

The application shell itself remains dark-first.

The rendered platform UI controls its own appearance.

---

# 18. Background System

Preview/export backgrounds:

* solid
* gradient
* blurred
* ambient
* image

Controls:

* color
* opacity
* blur
* scale
* position

Provide tasteful default presets.

---

# 19. Export System

Export:

* PNG
* JPG

Support:

* screen only
* device frame
* scene

Support:

* 1x
* 2x
* 3x

Display output dimensions.

Future:

* WebP
* video
* animation

---

# 20. Provenance

Exports must support a visible mockup/demo indicator.

The product must not provide functionality specifically intended to conceal that a conversation is simulated.

The editor itself can remain extremely high-fidelity.

---

# 21. Asset Library

Users should eventually have a reusable asset library.

Assets include:

* avatars
* images
* backgrounds
* logos
* media

Object storage should be used for uploaded assets.

---

# 22. Command Palette

Global:

Cmd/Ctrl + K

Actions:

* new project
* open project
* search
* switch platform
* switch device
* export
* fullscreen
* toggle sidebar
* settings

The command palette should feel fast and polished.

---

# 23. Keyboard Shortcuts

Cmd/Ctrl + K
Command palette

Cmd/Ctrl + S
Save

Cmd/Ctrl + Z
Undo

Cmd/Ctrl + Shift + Z
Redo

Cmd/Ctrl + D
Duplicate

Delete
Delete selected message

Escape
Close overlay

F
Fullscreen preview

0
Fit preview

1
100% zoom

---

# 24. Scene Builder — Future Architecture

Eventually support multiple devices on one canvas.

Examples:

* one iPhone
* two iPhones
* stacked devices
* phone + laptop
* phone + tablet

Scene elements should eventually support:

* position
* scale
* rotation
* depth
* shadow
* reflection

Do not implement the full system in V1.

But do not architect the application in a way that prevents it.

---

# 25. Templates — Future

Eventually support:

* conversation templates
* scene templates
* export templates
* background presets

Users can save their own templates.

Later potentially:

* community templates
* creator marketplace
* premium templates

---

# 26. Notification / Lock Screen System — Future

Eventually support:

* notification banners
* lock screen
* notification center
* application launch sequence

This will eventually connect to animation/video.

---

# 27. Animation System — Future

Eventually support:

* message appearance
* typing indicator
* notification arrival
* device movement
* screen transitions

Potential video export.

Do not implement this in V1.

But keep the architecture extensible.

---

# 28. AI — Future

Eventually an AI assistant can generate structured conversations.

Example:

"Create a casual conversation between two friends planning dinner."

The AI should generate structured editor data.

The user must be able to edit every generated element.

AI must never create an uneditable blob.

Potential future AI features:

* conversation generation
* fictional recipient generation
* avatar generation
* scene generation
* template generation

---

# 29. Data Architecture

Use:

Next.js
React
TypeScript
Tailwind
shadcn/ui
Framer Motion
Zustand
React Hook Form
Zod
Prisma
PostgreSQL

Authentication:

Auth.js or Clerk.

Storage:

S3-compatible object storage / Cloudflare R2.

Deployment:

Vercel.

Monitoring:

Sentry.

Analytics:

PostHog.

Do not introduce unnecessary backend complexity in V1.

---

# 30. Component Architecture

Avoid giant components.

Suggested structure:

components/

shell/
sidebar/
dashboard/
projects/
editor/
recipients/
messages/
preview/
devices/
export/
assets/
command-palette/
ui/

platforms/

instagram/
renderer/
components/
schema/
capabilities/

devices/

iphone/
definitions/
renderer/

stores/

schemas/

lib/

---

# 31. State Architecture

Separate:

application state

editor state

project persistence

renderer state

UI state

Use Zustand for transient editor state.

Use database persistence for durable entities.

Use Zod validation.

---

# 32. Database

Initial models:

User

Recipient

Project

ProjectMessage

Asset

Future:

Template
Scene
SceneElement
Animation
Workspace
Team

Use appropriate indexes.

Do not store large binary files inside PostgreSQL.

---

# 33. Performance

The preview should feel immediate.

Avoid unnecessary rerenders.

Changing one message should not unnecessarily rerender the entire application.

Large images should be optimized.

Use memoization where appropriate.

Do not prematurely optimize everything.

Optimize after identifying real bottlenecks.

---

# 34. Accessibility

Support:

* keyboard navigation
* semantic buttons
* focus states
* aria labels
* contrast
* reduced motion

---

# 35. Responsive Behavior

Desktop-first.

At smaller widths:

replace the simultaneous editor/preview layout with:

EDITOR

PREVIEW

tabs.

Do not squeeze the desktop interface into a tiny screen.

---

# 36. Quality Standard

The product is not considered complete simply because functionality works.

Every milestone must be reviewed for:

* UX
* visual hierarchy
* consistency
* accessibility
* performance
* architecture
* edge cases
* responsive behavior
* code quality

The application should feel like a real commercial product.

---

# 37. Development Philosophy

Never build everything at once.

Work milestone by milestone.

Each milestone has:

1. scope
2. implementation
3. automated verification
4. manual verification
5. visual review
6. architecture review
7. acceptance criteria

Claude must stop after completing the milestone.

Claude must NOT silently implement future milestones.

If something required for a future milestone is discovered, document it instead of implementing it prematurely.

---

# 38. Golden Rule

Build the smallest complete version of each layer before adding the next layer.

Do not create fake placeholder functionality that pretends to work.

Do not build ten half-working features.

Build one excellent feature at a time.

---

# 39. Definition of V1

V1 is complete when:

A user can:

1. open the dashboard
2. create an Instagram project
3. choose/create a recipient
4. add messages
5. edit messages
6. reorder messages
7. change timestamps
8. change device
9. configure status bar
10. switch appearance
11. see a live device preview
12. save the project
13. reopen it
14. duplicate it
15. export it
16. find saved recipients
17. use keyboard shortcuts
18. undo/redo changes

And every part feels polished.

V1 does NOT require:

* WhatsApp
* iMessage
* animation
* AI
* marketplace
* collaboration
* scene builder

Those belong to later milestones.

---

# Now the important part: Claude's milestone system

I would divide it into **10 implementation milestones**.

The important thing is that every prompt tells Claude:

> **DO NOT CONTINUE AFTER THIS MILESTONE.**

And each one has its own verification.

---

## Milestone 0 — Reconnaissance & Architecture

Claude does **not build the product yet**.

It examines:

* existing repository
* installed dependencies
* environment
* architecture
* whether anything already exists
* potential technical problems

Then it proposes:

* folder structure
* state architecture
* database architecture
* rendering architecture
* device architecture
* implementation plan

### Verification

You bring Claude's output here.

I review whether its architecture makes sense **before it writes significant code**.

This is extremely important.

---

## Milestone 1 — Foundation & Design System

Claude builds only:

* Next.js foundation
* Tailwind
* fonts
* design tokens
* global background
* typography
* buttons
* inputs
* dropdowns
* popovers
* panels
* tooltips
* icons
* motion primitives
* sidebar

No Instagram editor.

No database-heavy features.

No fake conversation.

### Verification

We inspect:

* spacing
* typography
* colors
* borders
* radii
* sidebar animation
* responsive behavior
* overall visual quality.

**If the shell doesn't look premium here, we don't move forward.**

---

## Milestone 2 — Application Shell & Workspace

Build:

* dashboard
* projects page
* workspace
* editor/preview split
* navigation
* command palette
* empty states
* project creation flow

Still no complex Instagram renderer.

### Verification

We test:

```text
Dashboard
 ↓
Create Project
 ↓
Instagram
 ↓
Workspace
 ↓
Back
 ↓
Projects
```

Everything should feel coherent.

---

## Milestone 3 — Core Conversation Editor

Now build the actual editor:

* recipient
* message list
* add message
* edit
* delete
* duplicate
* reorder
* sender
* timestamp
* undo
* redo
* keyboard shortcuts

But the preview can initially be a **generic conversation preview**.

Don't spend this milestone perfecting Instagram yet.

### Verification

We aggressively test editing.

Examples:

* 1 message
* 10 messages
* 100 messages
* long message
* emoji
* empty message
* deleting middle message
* reordering
* undoing 10 operations
* duplicating.

This is where we make sure the editor architecture is solid.

---

# Milestone 4 — Instagram Renderer

Now the actual Instagram simulation starts.

Claude builds the renderer as a separate system.

The editor produces structured data.

The renderer consumes it.

Build:

* conversation header
* avatar
* username
* message bubbles/content
* timestamps
* bottom input/navigation area as appropriate
* Instagram visual language
* light/dark modes
* long-content handling
* scrolling behavior

### Verification

This milestone gets **very strict visual review**.

We test:

* short usernames
* long usernames
* long messages
* multiple messages
* emoji
* profile images
* dark mode
* light mode
* empty state
* many messages.

And importantly:

**The renderer should not depend on the editor's visual components.**

---

# Milestone 5 — iPhone Device Engine

Now wrap the renderer inside the actual device system.

Build the configuration-driven device engine.

Implement the required iPhone generations.

Add:

* screen geometry
* device frame
* Dynamic Island where applicable
* status bar
* home indicator
* safe areas
* device scaling
* zoom
* fit
* fullscreen

### Verification

We switch through every supported model.

We check:

```text
iPhone 13
iPhone 13 Pro
iPhone 13 Pro Max
...
iPhone 17
iPhone 17 Pro
iPhone 17 Pro Max
```

We look specifically for:

* incorrect proportions
* incorrect corner radii
* incorrect island positioning
* incorrect status bar positioning
* content clipping
* scaling issues.

---

# Milestone 6 — Recipient & Asset System

Build:

* recipient library
* create recipient
* edit recipient
* avatar upload
* avatar cropping
* search
* recent recipients
* favorites
* reusable assets

### Verification

Create:

```text
Ana
Mohamed
Sarah
John
```

Then:

* use Ana in Project A
* use Ana in Project B
* edit Ana
* verify project behavior
* duplicate recipient
* delete recipient
* search.

We verify that recipient data isn't accidentally duplicated into every project in a way that makes future editing impossible.

---

# Milestone 7 — Persistence & Project System

Now make the application a real product.

Implement:

* authentication
* PostgreSQL
* Prisma
* projects
* autosave
* load
* duplicate
* rename
* delete
* favorites
* recent projects
* recovery from errors

### Verification

We deliberately:

* reload browser
* close browser
* reopen project
* duplicate project
* edit project
* open another project
* return to first project
* disconnect network during save if possible.

No data should unexpectedly disappear.

---

# Milestone 8 — Export Studio

Now build export.

Support:

* PNG
* JPG
* 1x
* 2x
* 3x
* screen-only
* device frame
* background
* resolution
* mockup/demo indicator

### Verification

Compare:

**Live preview**

against

**Exported image**

They should be visually consistent.

This is where we do rendering regression tests.

---

# Milestone 9 — Product Polish & QA

This is NOT "fix some bugs."

This is a dedicated polish phase.

Review:

### UX

* onboarding
* empty states
* keyboard shortcuts
* command palette
* navigation
* editor workflow

### UI

* typography
* spacing
* borders
* radius
* hover
* focus
* shadows
* contrast

### Motion

* sidebar
* popovers
* editor
* device transitions

### Technical

* unnecessary rerenders
* console errors
* broken state
* memory leaks
* image loading
* export issues

### Edge cases

* enormous username
* enormous message
* no avatar
* huge avatar
* 100 messages
* emoji
* special characters
* deleted recipient
* deleted project
* failed save
* failed export

---

# Milestone 10 — V1 Release Candidate

Only now do we call it V1.

Claude produces:

* final architecture report
* dependency report
* known limitations
* test report
* performance report
* deployment instructions
* database migration instructions
* environment variable documentation
* future roadmap

And we perform one final product review.

---

# The prompt Claude should receive for EVERY milestone

Rather than writing ten completely different giant prompts, I recommend having a **master execution protocol**.

Then each milestone prompt becomes small and controlled.

# Claude Development Protocol

You are implementing the Social UI Simulation Studio according to the supplied Master Product Specification.

You are working as a senior product engineer, UI engineer and software architect.

This is a milestone-based project.

## NON-NEGOTIABLE RULE

You are currently working on ONE milestone only.

You must NOT implement future milestones.

Do not "prepare" future features by secretly implementing them.

If future architecture needs to be considered, document it.

Do not build placeholder versions of future functionality unless the current milestone explicitly requires the placeholder.

---

# Before Coding

First inspect the repository.

Understand:

* existing files
* framework
* package manager
* dependencies
* configuration
* environment
* existing components
* existing routes
* existing database
* existing styles

Do not blindly overwrite existing work.

Identify conflicts before modifying architecture.

---

# Before Implementation

Restate:

1. Current milestone
2. Objective
3. Scope
4. What you will NOT implement
5. Files/areas expected to change
6. Verification strategy

If the repository contains unexpected architecture, stop and explain the conflict before making destructive changes.

---

# Implementation Rules

Write production-quality TypeScript.

Avoid:

* giant components
* duplicated logic
* arbitrary hardcoded values
* unnecessary dependencies
* dead code
* temporary hacks
* fake functionality
* TODO-driven architecture

Prefer:

* composable components
* centralized design tokens
* typed data models
* clear boundaries
* reusable primitives
* deterministic rendering
* explicit state ownership

---

# UI Rules

Follow the supplied visual system.

The application should feel:

* premium
* minimal
* dark
* precise
* calm
* Apple-inspired
* professional

Use subtle borders.

Use restrained shadows.

Use controlled radii.

Use typography for hierarchy.

Avoid generic SaaS design.

Avoid excessive cards.

Avoid excessive gradients.

Avoid unnecessary animations.

---

# Verification

After implementation, verify the milestone.

Perform:

## 1. Type checking

Run the appropriate TypeScript validation.

## 2. Linting

Run linting.

## 3. Build

Run a production build.

## 4. Automated tests

Run all relevant tests.

## 5. Manual functional verification

Actually interact with the feature.

## 6. Visual verification

Inspect the relevant UI.

Check:

* spacing
* alignment
* typography
* borders
* radii
* contrast
* responsive behavior
* hover states
* focus states
* animation

## 7. Regression verification

Ensure previously completed milestones still work.

---

# If Something Fails

Do not hide the failure.

Report:

* what failed
* why it failed
* what was changed
* whether it is resolved
* remaining issue

Do not claim success if the build or tests fail.

---

# Completion Report

At the end of the milestone, provide:

## Implemented

List exactly what was implemented.

## Not Implemented

List anything intentionally left for later.

## Files Changed

List important files.

## Verification

Show:

* typecheck result
* lint result
* build result
* tests
* manual checks

## Known Issues

List remaining issues.

## Architecture Notes

Explain important architectural decisions.

## Next Milestone

Describe what the next milestone will build.

Then STOP.

Do not continue automatically.

---

# And each milestone gets its own execution prompt

For example, **the first prompt I would give Claude right now is NOT "build the app."**

It's this:

# Milestone 0 — Architecture Reconnaissance

You are beginning the Social UI Simulation Studio project.

Do NOT build the product yet.

Do NOT implement the UI yet.

Do NOT install large numbers of dependencies yet.

Your task is to perform a technical reconnaissance and produce an implementation architecture.

Read the complete Master Product Specification and Development Protocol.

## Objectives

Inspect the current repository and determine:

1. Existing framework
2. Package manager
3. Existing dependencies
4. Existing application structure
5. Existing routes
6. Existing component architecture
7. Existing styling system
8. Existing state management
9. Existing database configuration
10. Existing authentication
11. Existing asset/storage handling
12. Existing deployment configuration

Identify anything that conflicts with the Master Product Specification.

## Architecture Proposal

Create a concrete architecture for:

### Application

* routes
* layouts
* workspace structure

### UI

* design tokens
* component primitives
* shell
* sidebar
* editor
* preview

### State

* application state
* editor state
* project state
* UI state
* renderer state

### Data

* PostgreSQL
* Prisma
* models
* relationships

### Rendering

Explain exactly how:

Conversation Data

becomes:

Platform Renderer

becomes:

Device Renderer

becomes:

Export Renderer

### Devices

Explain how the iPhone device definition system should work.

Do not hardcode individual device components.

### Platforms

Explain how Instagram can be implemented first while allowing future:

iMessage
WhatsApp
Messenger

without rewriting the editor.

## Folder Structure

Propose the exact folder structure you recommend.

Explain why each major directory exists.

## Dependencies

Recommend only dependencies that are genuinely necessary.

Do not install everything yet.

## Risks

Identify technical risks, especially:

* deterministic rendering
* device geometry
* export consistency
* browser differences
* state synchronization
* autosave
* large images
* future platform support

## Output

Produce:

1. Repository assessment
2. Architecture proposal
3. Folder structure
4. Data model proposal
5. Rendering architecture
6. Device architecture
7. State architecture
8. Dependency proposal
9. Technical risks
10. Recommended implementation order

Do not implement the product.

Do not move to Milestone 1.

STOP after the architecture report.

### This is how I want us to work from now on

You run **Milestone 0 with Claude**.

Then **do not immediately ask Claude to continue**.

Bring me Claude's response.

I'll inspect it and tell you things like:

> Architecture is good, approve.

or:

> Stop. Claude made three mistakes: the renderer is coupled to the editor, the device model is wrong, and Prisma is being introduced too early. Give Claude this correction prompt.

Then we move to **Milestone 1**.

That gives us a proper feedback loop:

**Claude builds → Claude verifies → you bring result → I audit → correction if needed → next milestone.**

That is much safer than trusting a coding agent with a 100-page specification and hoping the final application is good.
