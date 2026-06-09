# דוח השפעה: Design Profiles

## סיווג

- Change Level: `architecture_change`
- רמת סיכון: High
- אישור משתמש: התקבל ב־2026-06-09

## מטרה

למנוע מצב שבו פרויקטים המבוססים על התשתית נראים זהים, תוך שמירה על
התנהגות, נגישות וחוזי רכיבים משותפים.

## השפעה

- Design System: מקור אמת חדש לזהות חזותית של פרויקט.
- Components: מעבר מערכים חזותיים קשיחים לטוקנים סמנטיים.
- Layout: תמיכה ב־sidebar, topbar ו־rail.
- Build: בדיקת Design Profile לפני build.
- QA: בדיקות brief, tokens, production guard ו־Visual QA.

## ללא השפעה

- Database
- Authentication
- Permissions
- API contracts
- File upload

## סיכונים

- פרופיל לא שלם עלול לייצר ממשק לא עקבי.
- שינוי layout עלול לפגוע ברספונסיביות.
- טוקנים לא נגישים עלולים לפגוע ב־contrast וב־focus.
- מפתח עלול לעקוף את הטוקנים עם ערכי CSS קשיחים.

## בקרות

- validator אוטומטי לפני build.
- חסימת reference profile בפרודקשן.
- איסור צבעי מותג בקובצי רכיבים.
- checklist מחייב לפרויקט חדש.
- בדיקות QA לכל navigation pattern.
