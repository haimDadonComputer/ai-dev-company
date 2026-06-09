# AI Manager Bootstrap

קובץ זה הוא נקודת הכניסה המחייבת לכל משימה.

## לפני כל פעולה

1. קרא את `AGENTS.md`.
2. קרא את `shared-info/system_manifest.json`.
3. הרץ `npm run context:check`.
4. קרא את `shared-info/system_context.json`.
5. בדוק את `shared-info/project_status.json`.
6. סווג את המשימה לפי `shared-info/change_levels.csv`.
7. טען את התחומים הרלוונטיים לפי `taskRouting` שב־manifest.
8. בדוק סתירות פתוחות ברמת High או Critical.
9. קבע אילו סוכנים וקבצים רשאים להשתתף.
10. קבל אישור משתמש כאשר הסיווג או הסיכון דורשים זאת.

אסור להתחיל תכנון מפורט, להפעיל סוכן או לערוך קוד אם שלבים 1–8 לא
הושלמו.

## system_context.json

הקובץ הוא snapshot קריא־מכונה של:

- הגדרת המוצר.
- Features ו־User Stories.
- Roles והרשאות.
- טבלאות ושדות.
- APIs.
- Components.
- Design Profile.
- חוזים והחלטות.
- QA וסתירות.
- משתני סביבה.
- מצב הפרויקט.

הוא אינו מקור אמת עצמאי. הוא נוצר ממקורות האמת באמצעות:

```powershell
npm run context:build
```

`context:check` משווה hashes ומכשיל עבודה אם ה־snapshot מיושן, קובץ חסר,
מראת QA אינה מסונכרנת או הפניה בין מקורות האמת שבורה.

## כללי הכרעה

- מידע עסקי נלקח מ־Product.
- Role נלקח רק מ־Permissions.
- Table ו־Field נלקחים רק מ־DB info.
- API נלקח רק מ־API list.
- Component נלקח רק מ־Components list.
- זהות חזותית נלקחת רק מ־Design Profile.
- מצב בדיקות נלקח רק מ־`agents/qa/info/`.
- `qa/` הוא mirror לצורכי תאימות בלבד.
- סוד פעיל נלקח מ־environment בלבד; שמות המשתנים והחובה שלהם נלקחים
  מ־`environment_contract.csv`.

## כאשר context:check נכשל

מותר לבצע רק פעולות שמתקנות את ה־context:

1. תיקון מקור אמת חסר או סותר.
2. הרצת `npm run context:build`.
3. הרצת `npm run context:check` מחדש.

אין להמשיך לפיתוח פיצ'ר עד שהבדיקה עוברת.
