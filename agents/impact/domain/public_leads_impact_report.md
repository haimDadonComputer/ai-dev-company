# Impact Report: פניות ציבוריות מהאתר

תאריך: 2026-06-10  
סיווג שינוי: feature  
רמת סיכון: High

## מה משתנה

נוסף בסיס פניות ציבוריות:

- טבלת `public_leads`.
- API ציבורי `POST /api/public/leads`.
- API ניהול `GET /api/admin/public-leads`.
- טופס פנייה בעמוד `/home` ובעמוד `/activities`.
- עמוד ניהול `/admin/leads` לצפייה בפניות.

## השפעה לפי תחום

Database:

- נוספה טבלה חדשה בלבד, באמצעות `CREATE TABLE IF NOT EXISTS`.
- לא מתבצעת מחיקת נתונים או שינוי נתוני production.

API:

- יצירת פנייה ציבורית זמינה ללא JWT, אך רק דרך same-origin ועם JSON מוגבל.
- צפייה בפניות זמינה רק למנהל לאחר החלפת סיסמה.

Permissions:

- אורח יכול ליצור פנייה ציבורית.
- רק admin יכול לצפות ברשימת פניות.

Components:

- `home-page` ו-`activities-page` שולחים פניות.
- `admin-leads-page` מציג פניות למנהל.

## סיכונים

- שמירת פנייה עם שיוך לפעילות או קבוצה שאינה מפורסמת.
- חשיפת פניות לאדמין בלבד חייבת להישמר.
- שבירת ניווט SPA עקב route חדש.

## הפחתת סיכונים

- service מאמת פעילות/קבוצה באמצעות פונקציות public קיימות לפני יצירת הפנייה.
- נתיב הניהול נמצא תחת `/api/admin` ומשתמש ב-`requireAdmin` ו-`requirePasswordChanged`.
- `context:check`, `npm test`, `db:init` ובדיקת schema הורצו.

## סטטוס

מיושם ואומת ללא יצירת נתוני פנייה מלאכותיים במסד.
