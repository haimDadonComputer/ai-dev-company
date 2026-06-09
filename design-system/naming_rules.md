# Naming Rules

## CSS Classes

שמות CSS יהיו באנגלית, באותיות קטנות, עם מקף:

customer-list
primary-button
main-sidebar

אסור:

customerList
CustomerList
btnPrimary

## Components

שם קומפוננטה:

component-name

דוגמאות:

navbar
sidebar
customer-table
confirm-modal

## Pages

שם עמוד:

page-name

דוגמאות:

home
customers
settings
lesson-calendar

## Files

כל עמוד חייב להכיל:

index.html
script.ts
style.css

## Rule

אסור ליצור שם חדש אם קיימת מוסכמה קיימת.

## Design Profiles

מזהה פרופיל יהיה באנגלית וב־kebab-case:

```txt
clinic-calm-organic
legal-editorial-dark
education-playful-modular
```

אסור להשתמש בשם כללי כגון:

```txt
default
theme-one
blue-theme
new-design
```

טוקן חזותי מתחיל ב־`--design-`.

טוקן סמנטי פנימי של התשתית מתחיל ב־`--ui-`.

אסור להגדיר צבעי מותג, font family, shadow או radius ישירות בקובץ CSS
של page או component.
