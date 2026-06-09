# תשתית בסיס לאפליקציות ניהול

תשתית Node.js, Express, TypeScript ו־MySQL הכוללת:

- התחברות מנהל באמצעות JWT ב־HttpOnly Cookie.
- משתמש bootstrap בשם `admin` עם חובת החלפת סיסמה ראשונית.
- עמוד ניהול הגדרות כלליות.
- העלאת PNG, JPEG ו־WebP עד 5MB.
- SPA בעברית, RTL ורספונסיבי.

## דרישות

- Node.js 24 ומעלה.
- MySQL 8 ומעלה.
- משתמש MySQL בעל הרשאה ליצור את מסד הנתונים המוגדר ב־`.env`.

## הפעלה

1. מעדכנים את ערכי הפיתוח בקובץ `.env`.
2. מתקינים תלויות באמצעות `npm install`.
3. מריצים `npm run build`.
4. מריצים `npm run db:init`.
5. מריצים `npm start`.
6. פותחים `http://localhost:3000`.

פרטי הפיתוח הראשוניים הם `admin` והסיסמה `123123`. המערכת מחייבת
החלפת סיסמה לפני שניתן לבצע פעולות ניהול.

## תצורת פרודקשן

בפרודקשן יש להגדיר את אותם משתנים כמשתני סביבה אמיתיים, ובפרט להחליף:

- `JWT_SECRET`
- `DB_PASSWORD`
- `ADMIN_INITIAL_PASSWORD`
- `APP_ORIGIN`

אין להעלות את `.env` או את תיקיית `storage/uploads` למאגר קוד.

## עיצוב פרויקט חדש

התשתית אינה מיועדת לשימוש עם עיצוב reference בפרודקשן.

לפני בניית המסכים:

1. עוברים על `design-system/project_design_checklist.md`.
2. מאתחלים brief באמצעות `npm run design:init --` עם כל הפרמטרים
   המתועדים ב־`design-system/profile_schema.md`.
3. מחליפים את הטוקנים ב־`src/design/active-profile.css`.
4. משנים לפחות ארבעה ממדים חזותיים מהותיים.
5. מריצים `npm run design:check`.

Build לפרודקשן נכשל אם נשאר פרופיל reference או אם ה־CSS הפעיל עדיין
זהה לעיצוב התשתית.

## הקשר אוטומטי ל־AI Manager

לפני כל משימה AI Manager קורא את:

- `shared-info/manager_bootstrap.md`
- `shared-info/system_manifest.json`
- `shared-info/system_context.json`
- `shared-info/project_status.json`

לאחר שינוי במוצר, חוזה, הרשאה, DB, API, Component, Design או QA:

```powershell
npm run context:build
npm run context:check
```

`npm run build` מפעיל `context:check` אוטומטית ונכשל אם תמונת המערכת
מיושנת או אם קיימת הפניה למקור שאינו קיים.
