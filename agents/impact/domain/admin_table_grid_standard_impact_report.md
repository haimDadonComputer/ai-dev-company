# דוח השפעה: סטנדרט טבלאות ניהול עם ag-grid-community

## סיווג שינוי

architecture_change / High Risk

## מה משתנה

כל טבלת נתונים בממשק הניהול תוצג דרך רכיב `data-grid` משותף המבוסס על `ag-grid-community`.

הסטנדרט המחייב:

- מיון, סינון והזזת עמודות פעילים כברירת מחדל.
- רוחב הטבלה הוא 100% מהאזור הזמין.
- תאי הטבלה מיושרים אנכית למרכז.
- גובה הטבלה קבוע ל־20 שורות, ומעבר לכך הגלילה היא בציר Y בתוך הטבלה.

## מודולים מושפעים

- Components
- Build
- QA
- Contracts
- Admin users page
- Admin leads page

## קבצים מושפעים

- `package.json`
- `package-lock.json`
- `scripts/copy-static.mjs`
- `src/index.html`
- `src/components/data-grid/script.ts`
- `src/components/data-grid/style.css`
- `src/app/styles.css`
- `src/pages/admin-users/index.html`
- `src/pages/admin-users/script.ts`
- `src/pages/admin-users/style.css`
- `src/pages/admin-leads/index.html`
- `src/pages/admin-leads/script.ts`
- `src/pages/admin-leads/style.css`
- `agents/components/info/components_list.csv`
- `shared-info/contracts.csv`
- `agents/qa/info/*`

## סיכונים

- טעינת נכסי vendor של ag-grid חייבת להיכלל ב־build.
- עמודי ניהול קיימים חייבים להמשיך לפעול ללא שמירת JWT בדפדפן.
- יש לוודא שלא נוצרה גלילה אופקית מיותרת במסכים צרים.

## בדיקות נדרשות

- `npm run build`
- `npm test`
- בדיקת טעינת עמודי `/admin/users` ו־`/admin/leads`
- בדיקת DOM/חזותית שאין overflow אופקי ושגובה הגריד מוגבל ל־20 שורות.

## סטטוס

אושר על ידי המשתמש ויושם.
