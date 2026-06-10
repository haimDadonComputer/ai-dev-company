# Impact Report: בסיס אתר ציבורי ופעילויות

תאריך: 2026-06-10  
סיווג שינוי: feature  
רמת סיכון: High

## מה משתנה

נוסף בסיס מדורג להצגת אתר ציבורי ופעילויות:

- טבלאות `activities` ו-`groups`.
- API ציבורי לקריאת פעילויות וקבוצות מפורסמות בלבד.
- עמודי SPA ציבוריים `/home` ו-`/activities`.
- שירותי frontend לצריכת הגדרות האתר, פעילויות וקבוצות.

## השפעה לפי תחום

Database:

- נוספו טבלאות `activities` ו-`groups` עם `CREATE TABLE IF NOT EXISTS`.
- נתונים קיימים אינם נמחקים ואינם נדרסים.
- פרסום ציבורי מוגבל ל-`publish_on_site=true` ו-`status=active`.

API:

- נוספו `public_activities_list`, `public_activity_get`, `public_group_get`.
- הנתיבים ציבוריים ו-read-only.
- הנתיבים מחזירים רק שדות תצוגה ללא נתיבי אחסון פנימיים או פרטי משתמש רגישים.

Permissions:

- `guest`, `student`, `instructor`, `admin` יכולים לצפות בתוכן ציבורי.
- אין הרשאות כתיבה חדשות.

Components:

- נוספו `home-page` ו-`activities-page`.
- העמודים עצמאיים תחת מבנה SPA קיים ומותאמים ל-RTL ולמובייל.

QA:

- נוספו בדיקות QA לתוכן ציבורי, סינון פרסום ואריזת SPA.
- נוספו רגרסיות לשמירת read-only public APIs ולניתוב public SPA.

## סיכונים

- חשיפת פעילות או קבוצה שלא סומנה לפרסום.
- שבירת build עקב route או import חדש.
- חוסר התאמה בין חוזה API למודלי frontend.
- יצירת מקור אמת כפול במקום שימוש ב-CSV הקיימים.

## הפחתת סיכונים

- ה-repo מסנן לפי `publish_on_site` ו-`status`.
- הרשאות הציבור הן read-only בלבד.
- כל APIs ורכיבים נרשמו במקורות האמת.
- `context:check` ו-`npm test` נדרשים לפני סגירת המשימה.

## סטטוס

מיושם ואומת באמצעות `context:check`, `npm test`, `db:init` ובדיקת INFORMATION_SCHEMA לטבלאות החדשות.
