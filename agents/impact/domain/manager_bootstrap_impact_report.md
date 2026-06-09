# דוח השפעה: Manager Bootstrap ו־System Manifest

## סיווג

- Change Level: `architecture_change`
- Risk Level: High
- אישור משתמש: התקבל ב־2026-06-09

## מטרה

לאפשר ל־AI Manager להבין את המערכת, החוזים, מקורות האמת, החסמים ומצב
הפרויקט ללא צורך בהוראה מפורשת מהמשתמש.

## רכיבים

- manifest קריא־מכונה לכל מקורות האמת.
- bootstrap מחייב לפני כל משימה.
- snapshot מאוחד עם hashes.
- validator לתקינות ול־freshness.
- מפת מודולים.
- חוזה משתני סביבה.
- מצב פרויקט וחסמים.
- mirrors מבוקרים לקובצי QA הנדרשים.

## השפעה

- AI Manager: סדר קריאה מחייב.
- כל הסוכנים: מקבלים context מאוחד אך ממשיכים לכבד תחומי עריכה.
- Build: נכשל כאשר context מיושן או חוזה מרכזי שבור.
- QA: mirrors מסונכרנים אוטומטית.
- Product Owner: עובד ישירות מול מקור האמת `product/`.

## סיכונים

- snapshot מיושן עלול להטעות סוכן.
- manifest חסר עלול להסתיר מקור אמת.
- קובץ כפול עלול להפוך למקור מידע מתחרה.
- build יכול להיחסם עד להרצת context:build.

## בקרות

- hashes לכל מקור.
- בדיקת הפניות בין Roles, APIs, Tables ו־Components.
- בדיקת environment contract.
- רשימת duplicate sources אסורים.
- context:check כחלק מ־build.
- בדיקות אוטומטיות ל־manifest ול־snapshot.
