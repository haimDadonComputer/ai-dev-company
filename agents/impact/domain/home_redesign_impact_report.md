# דוח השפעה: רידיזיין דף הבית

## סיווג

architecture_change עיצובי ממוקד.

## מטרת השינוי

להחליף את דף הבית הפונקציונלי במראה אתר תדמית מרשים עבור "המרכז הדיגיטלי", בהשראת האתר הישן שאושר על ידי המשתמש.

## מה משתנה

- דף הבית מקבל Hero גדול עם שכבת רקע חזותית.
- פרטי האתר, הסלוגן, תמונות, פרטי קשר ופעילויות נשארים דינמיים ומגיעים מה־APIs הקיימים.
- נוסף מבנה שכבות ברור: ניווט עליון, Hero, יתרונות, תהליך הצטרפות, פעילויות, טופס קשר ופוטר.
- פרופיל העיצוב הוחלף מ־reference ל־custom עבור מותג "המרכז הדיגיטלי".
- בדיקות Design Profile עודכנו כך שתרחישי reference נבדקים מול קבצים זמניים ולא מול הפרופיל הפעיל.

## קבצים מושפעים

- `design-system/project-profile.json`
- `src/design/active-profile.css`
- `src/pages/home/index.html`
- `src/pages/home/style.css`
- `src/pages/home/script.ts`
- `tests/design-profile.test.ts`
- `agents/qa/info/test_cases.csv`
- `agents/qa/info/test_results.csv`
- `agents/qa/info/regression_tests.csv`
- `shared-info/action_log.csv`
- `shared-info/decisions.csv`
- `shared-info/project_status.json`

## מודולים מושפעים

- Design System
- public-site
- home-page
- QA
- context-bootstrap

## סיכונים

- שינוי פרופיל עיצוב עלול להשפיע על רכיבי SPA נוספים המשתמשים בטוקני העיצוב.
- Hero ופריסה חדשה עלולים ליצור גלישה אופקית במסכים צרים.
- שינוי בדיקות Design Profile עלול להחליש את בדיקות reference אם לא משתמשים בקבצים זמניים מבודדים.

## צמצום סיכון

- לא בוצע שינוי DB, API, הרשאות או JWT.
- נשמר שימוש ב־Vanilla HTML/CSS/TypeScript בלבד.
- צבעי מותג הוגדרו רק ב־`src/design/active-profile.css`.
- בוצעו `design:check`, `build`, `npm test` ו־Visual QA ב־Chrome.
- בוצעה בדיקת DOM לגלישה אופקית ברוחבים 484, 768 ו־1440.

## תוצאת QA

PASS.

- `npm run design:check`: PASS.
- `npm run build`: PASS.
- `npm test`: PASS 14/14.
- Visual QA: צילומים נשמרו תחת `qa/visual-screenshots/home-redesign-2026-06-11`.
- DOM overflow: אין גלישה אופקית ברוחבים שנבדקו.
