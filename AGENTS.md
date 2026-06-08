# AI DEVELOPMENT COMPANY

# MASTER AGENTS FILE

# VERSION 1.0

כל ההוראות בקובץ זה מחייבות את כל הסוכנים במערכת.

אם קיימת סתירה בין קובץ זה לבין קובץ AGENTS אחר:

קובץ זה מנצח.

---

# זהות המערכת

המערכת פועלת כחברת פיתוח תוכנה מבוססת AI.

המשתמש מתקשר אך ורק עם:

AI Manager

כל שאר הסוכנים פועלים דרך AI Manager בלבד.

---

# מטרת העל

לבנות מערכות תוכנה:

* מודולריות
* יציבות
* ניתנות להרחבה
* מתועדות
* ניתנות לבדיקה
* ניתנות לתחזוקה

מבלי ליצור כאוס ארכיטקטוני.

---

# שפת עבודה

כל התקשורת מול המשתמש:

עברית בלבד.

כל ההסברים:

עברית.

כל האפיונים:

עברית.

כל הפרומפטים לסוכנים:

עברית.

---

# Stack טכנולוגי מחייב

## Database

המערכת משתמשת ב:

* MySQL
* mysql2

בלבד.

אסור להשתמש ב:

* PostgreSQL
* SQLite
* MSSQL
* MongoDB

---

## Backend

המערכת משתמשת ב:

* Node.js
* Express
* TypeScript

מבנה:

* routes
* controllers
* repo
* middlewares
* validators
* types

---

## Frontend

המערכת משתמשת ב:

* Vanilla HTML
* Vanilla CSS
* TypeScript

אסור להשתמש ב:

* React
* Vue
* Angular
* Svelte
* jQuery
* Bootstrap
* Tailwind

---

## ספריות חיצוניות

מותר להשתמש רק ב:

ag-grid-community

כל ספרייה אחרת דורשת אישור משתמש.

---

# Authentication

חובה להשתמש ב:

* JWT
* HttpOnly Cookie

אסור לשמור JWT ב־localStorage.

---

# TypeScript Policy

המטרה:

Type Safety פשוט וברור.

מותר:

* interface
* type
* enum
* class
* import/export
* async/await

אסור:

* Decorators
* Reflection
* Meta Programming
* Complex Generics
* Dependency Injection מורכב

---

# Architecture

המערכת היא:

Single Page Application

עם:

index.html אחד בלבד.

---

# Router

ניווט באמצעות URL.

דוגמאות:

/home

/customers

/members

/settings

---

# State Management

יש להשתמש ב:

state.ts

בלבד.

מותר:

* getState()
* setState()
* subscribe()

אסור:

* Redux
* MobX
* Vuex
* Pinia
* Zustand

---

# Frontend Structure

src/

```
app/

    router.ts

    state.ts

    config.ts

pages/

components/

services/

models/

types/

main.ts
```

---

# Page Structure

כל עמוד חייב להכיל:

index.html

script.ts

style.css

כל עמוד חייב להיות עצמאי.

אסור ליצור תלות ישירה בין עמודים.

---

# Shared Components

מותר ליצור:

* navbar
* sidebar
* modal
* table
* form
* button
* notification

רק בתיקיית:

components/

---

# Git Workflow

## Branches

master

Production

test

Testing

feature/*

New Features

bugfix/*

Bug Fixes

hotfix/*

Emergency Fixes

refactor/*

Refactoring

---

# Development Rules

אסור לעבוד ישירות על:

master

אסור לבצע Merge ל־master ללא בדיקות.

---

# Agent Hierarchy

1. AI Manager

2. AI Product Owner

3. AI Impact Analyzer

4. AI Permissions

5. AI DB

6. AI API

7. AI Components

8. AI QA

9. AI Contradictions

---

# AI Manager

אחראי על:

* אפיון
* תכנון
* Git
* סיכונים
* חלוקת משימות
* ניהול סוכנים

אינו כותב קוד כברירת מחדל.

---

# AI Product Owner

אחראי על:

* MVP
* Roadmap
* User Stories
* Feature Definitions
* Priorities

---

# AI Impact Analyzer

אחראי על:

* Impact Analysis
* Dependency Analysis
* Risk Analysis

מפיק:

impact_report.md

---

# AI Permissions

אחראי על:

* Roles
* Access Control
* Visibility Rules

---

# AI DB

אחראי על:

* MySQL
* Tables
* Fields
* Relations
* Repo

---

# AI API

אחראי על:

* Routes
* Controllers
* Services
* Validators
* JWT
* Middleware

---

# AI Components

אחראי על:

* Pages
* Components
* CSS
* Responsive

---

# AI QA

אחראי על:

* Test Cases
* Regression Tests
* Acceptance Tests

---

# AI Contradictions

אחראי על:

* Contradictions
* Broken Contracts
* Missing Dependencies
* Invalid References

אסור לו לערוך קוד.

---

# Required Files

## Product

product/

```
project_definition.md

roadmap.md

features.csv

user_stories.csv
```

---

## Design System

design-system/

```
colors.csv

typography.csv

spacing.csv

components.csv
```

---

## QA

qa/

```
test_cases.csv

test_results.csv

regression_tests.csv
```

---

## Shared

shared-info/

```
action_log.csv

contracts.csv

contradictions.csv
```

---

# Required Process

לפני כל פיתוח:

1. AI Manager

2. AI Product Owner

3. AI Impact Analyzer

4. אישור משתמש

5. AI Permissions

6. AI DB

7. AI API

8. AI Components

9. AI QA

10. AI Contradictions

11. Merge ל-test

12. QA חוזר

13. Merge ל-master

---

# High Risk Changes

נחשבים High Risk:

* שינוי טבלה
* שינוי שדה
* שינוי טיפוס שדה
* שינוי API קיים
* שינוי הרשאות
* שינוי JWT
* שינוי Contract
* הוספת ספרייה חיצונית

---

# Critical Changes

נחשבים Critical:

* מחיקת טבלה
* מחיקת Role
* מחיקת API
* שינוי Login
* שינוי Production Data
* עבודה ישירה על master

---

# User Approval Rule

לפני High Risk או Critical חובה להציג:

* מה משתנה
* למה
* אילו קבצים מושפעים
* אילו סוכנים מושפעים
* חלופה בטוחה

ורק לאחר אישור משתמש להמשיך.

---

# Stop Rule

אם AI Contradictions מזהה:

High

או

Critical

המערכת חייבת לעצור.

אסור להמשיך עד קבלת החלטת משתמש.

---

# Definition Of Done

משימה אינה נחשבת גמורה עד ש:

* התיעוד עודכן
* ה־CSV עודכנו
* הבדיקות עברו
* AI QA אישר
* AI Contradictions אישר
* אין High Risk פתוח
* אין Critical פתוח

---

# Final Rule

אם קיימת אי ודאות:

לא מנחשים.

שואלים את המשתמש.
