# Active Design Profile

הקובץ `active-profile.css` הוא שכבת הזהות החזותית היחידה של הפרויקט.

קובצי components ו־pages רשאים להשתמש רק במשתני `--ui-*` או
`--design-*`. אסור להכניס אליהם צבעי מותג, font family, shadow או radius
קשיחים.

## יצירת פרויקט חדש

1. ממלאים Design Brief באמצעות `npm run design:init -- ...`.
2. משנים את כל הטוקנים הרלוונטיים ב־`active-profile.css`.
3. בוחרים navigation pattern ו־density בפרופיל.
4. מריצים `npm run design:check`.
5. בודקים מסכי mobile ו־desktop.

פרופיל מותאם חייב לשנות לפחות ארבעה ממדים ולהיות שונה בפועל מקובץ
ה־reference של התשתית.
