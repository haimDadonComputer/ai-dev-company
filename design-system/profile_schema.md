# Design Profile Contract

כל פרויקט שנוצר מהתשתית חייב להגדיר זהות חזותית עצמאית.

## מקור אמת

- `design-system/project-profile.json`: החלטות העיצוב וה־brief.
- `src/design/active-profile.css`: טוקנים חזותיים פעילים.

אין להגדיר צבעי מותג או טיפוגרפיית מותג בקובצי רכיבים.

## שדות חובה

- `profileId`: מזהה ייחודי לפרויקט, באנגלית וב־kebab-case.
- `projectName`: שם הפרויקט.
- `status`: הערך `custom` בפרויקט אמיתי.
- `audience`: קהל היעד.
- `visualConcept`: הרעיון החזותי המרכזי.
- `differentiation`: במה העיצוב שונה מפרויקטים אחרים.
- `navigationPattern`: אחד מהערכים `sidebar`, `topbar`, `rail`.
- `density`: אחד מהערכים `compact`, `comfortable`, `spacious`.
- `shapeLanguage`: שפת הצורות.
- `typographyStrategy`: אסטרטגיית הטיפוגרפיה.
- `colorStrategy`: אסטרטגיית הצבע.
- `motionStrategy`: אסטרטגיית התנועה.
- `changedDimensions`: לפחות ארבעה ממדים שונים מתוך הרשימה המאושרת.
- `referenceOnly`: חייב להיות `false` בפרויקט אמיתי.

ערכי `changedDimensions`:

- `typography`
- `navigation`
- `density`
- `shape-language`
- `surfaces`
- `auth-composition`
- `color-hierarchy`
- `motion`

## טוקנים חובה

`active-profile.css` חייב להגדיר:

- צבעי רקע, משטח, טקסט, גבול, פעולה, מצבים ו־focus.
- משפחות פונטים לגוף ולכותרות.
- סולם ריווח.
- רדיוסים או שפת צורה אחרת.
- צללים או חלופה חזותית.
- רוחב תוכן, גובה header ורוחב navigation.
- מראה כרטיס, שדה, כפתור, modal ועמוד authentication.

## כלל שונות

שינוי palette בלבד אינו נחשב Design Profile חדש.

לפחות ארבעה מהתחומים הבאים חייבים להשתנות לעומת פרופיל המקור:

1. טיפוגרפיה.
2. פריסת ניווט.
3. צפיפות וריווח.
4. שפת צורות ורדיוסים.
5. טיפול במשטחים, גבולות וצללים.
6. קומפוזיציית עמוד הכניסה.
7. היררכיית צבעים.
8. תנועה ומשוב.

## חסימת Build

`npm run design:check` נכשל כאשר:

- ה־brief חסר או משתמש בערכי placeholder.
- `profileId` נשאר `base-infrastructure-reference` ללא אישור פיתוח מפורש.
- פרופיל reference נבנה עם `NODE_ENV=production`.
- חסרים טוקנים נדרשים.
- ממד הוצהר כמשתנה אך ערכיו זהים ל־reference.
- פחות מארבעה ממדים השתנו בפועל.

## פקודת אתחול

```powershell
npm run design:init -- --id=project-identity --name="Project Name" --audience="Target audience" --concept="Visual concept" --differentiation="How it differs" --navigation=topbar --density=spacious --shape="Geometric" --typography="Editorial" --colors="High contrast" --motion="Subtle" --dimensions=typography,navigation,density,color-hierarchy
```

הפקודה מעדכנת את ה־brief בלבד. לאחר מכן חובה לשנות את
`src/design/active-profile.css`.
