# Badge Asset Design – Designer Hand‑Off

**Purpose:** This is the **only document a graphic designer needs** to create all badge assets for the app. It defines **what to design, how many, visual rules, colors, sizes, and delivery requirements**. No product, backend, or UX context is required.

---

## 1. Deliverables Overview

**Total badges:** 60 (1 badge per achievement)

**Tiers & Counts**

- Bronze: 19
- Silver: 20
- Gold: 15
- Platinum: 6

Each badge must clearly communicate its **tier value** visually, without text.

---

## 2. Badge Categories & Visual Themes

Badges should subtly reflect their category through **iconography/symbols**.

| Category         | Count | Visual Motifs                     |
| ---------------- | ----: | --------------------------------- |
| Notes            |    11 | Notebook, pen, paper, links, tags |
| Tasks            |     7 | Checkmarks, lists, clocks         |
| Flashcards       |     7 | Cards, brain, lightning           |
| Exams            |     7 | Clipboard, test sheet, medal      |
| Study Sessions   |     5 | Timer, focus ring, flame          |
| Streaks          |     6 | Fire, calendar, chain             |
| Mastery (Levels) |     4 | Star, crown, laurel               |
| Profile          |     3 | Avatar, ID badge                  |
| Social           |     2 | Bug, wrench                       |
| Special          |     8 | Celebratory / unique visuals      |

**Rules:**

- Symbols only (no text)
- Must remain readable at **32×32px**

---

## 3. Tier System & Color Direction

### Bronze (19)

- Color: Bronze / Copper (e.g. `#CD7F32`)
- Feel: Friendly, beginner
- Detail: Low
- Effects: Flat or subtle gradient

### Silver (20)

- Color: Silver / Cool gray (e.g. `#C0C0C0`)
- Feel: Clean, progress-oriented
- Detail: Medium
- Effects: Soft highlights

### Gold (15)

- Color: Gold (e.g. `#FFD700`)
- Feel: Prestigious
- Detail: Medium–High
- Effects: Glow, shine, layering

### Platinum (6)

- Color: Platinum / Pearl (e.g. `#E5E4E2`)
- Accents: Cool blue / violet
- Feel: Elite, rare
- Detail: High
- Effects: Sparkles, shimmer

---

## 4. Brand Accent Colors (Optional Overlays)

These **do not replace tier metals**—they may be used sparingly as accents.

- Primary: `#7ADAA5` (earned / success)
- Secondary: `#239BA7` (focus / streaks)
- Tertiary: `#ECECBB` (muted fills)
- Quaternary: `#E1AA36` (milestones)

**Rules:**

- Max **2 brand colors per badge**
- Slightly muted tones preferred

---

## 5. Global Design Rules

**Must**

- Transparent background
- Consistent art style across all 60
- Center-weighted composition
- Clear silhouette at 32×32px

**Must Not**

- No text or numbers
- No photos or realistic textures
- No pure black (`#000000`) or white (`#FFFFFF`)
- No more than **4–5 colors per badge**

---

## 6. Canvas & Safe Zones

- Base canvas: **512×512px**
- Decorative area: 480×480px
- Safe zone: 448×448px
- Core focus: **384×384px** (critical details must stay here)

---

## 7. Export Specifications

**Preferred:** PNG

- PNG‑24 or PNG‑32
- RGBA, transparent
- sRGB color profile

**Optional:** SVG

- Proper `viewBox`
- Inline fills only
- Must work on light & dark backgrounds

---

## 8. Size & Performance Targets

- Export size: 512×512px
- Target file size: 15–30 KB
- Max file size: 50 KB
- DPI: 72

Must scale cleanly to:
16, 32, 48, 64, 96, 128px

---

## 9. Naming & Delivery

**Filename = Achievement key (exact match)**

Rules:

- Lowercase
- Hyphen‑separated
- No spaces

**Delivery path:**

```
/public/badges/
```

Flat structure (60 total files).

---

## 10. Visual Progression Expectation

A user should instantly recognize tier value:

- Bronze → simple
- Silver → polished
- Gold → glowing
- Platinum → ornate & rare

---

## 11. Achievement Index (Authoritative)

Use this list for **naming, counting, and verification**.

### Notes (11)

first-note
notes-10
notes-50
notes-100
notes-500
first-folder
folder-master
first-link
knowledge-connector
first-tag
tag-master

### Tasks (7)

first-task
tasks-completed-10
tasks-completed-50
tasks-completed-100
tasks-completed-500
early-bird
priority-master

### Flashcards (7)

first-deck
deck-collector
cards-reviewed-100
cards-reviewed-500
cards-reviewed-1000
cards-reviewed-5000
perfect-recall

### Exams (7)

exam-creator
first-exam
exams-completed-10
exams-completed-50
perfect-exam
question-master
variety-expert

### Study Sessions (5)

first-study-session
study-hours-10
study-hours-50
study-hours-100
study-hours-500

### Streaks (6)

streak-3
streak-7
streak-30
streak-100
streak-200
streak-365

### Mastery (4)

level-10
level-25
level-50
level-100

### Profile (3)

welcome
avatar-upload
complete-profile

### Social (2)

bug-reporter
quality-contributor

### Special (8)

first-day
well-rounded
power-user
productivity-sprint
speed-learner
exam-daily-challenge
night-owl
early-riser

---

## 12. Pre‑Delivery Checklist

- Transparent background
- Clear at 32×32px
- Under 50 KB
- Correct tier colors
- Correct filename
- Style consistent across set

This document fully defines the badge asset work. No additional guidance is required.
