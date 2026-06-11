# דוח השפעה: תשתית בסיס לאפליקציות ניהול

## סיווג

- Change Level: `major_feature`
- רמת סיכון כוללת: High
- סטטוס: ממתין להשלמת דרישה ולאישור משתמש

## מטרת השינוי

יצירת תשתית רב-שימושית הכוללת מנהל מערכת, Authentication, הגדרות אתר
והעלאת קבצים מאובטחת.

## מודולים מושפעים

- Product
- Permissions
- Database
- API
- Components
- QA
- Contracts
- Contradictions

## Roles מושפעים

- `admin`: הרשאות התחברות, שינוי סיסמה, ניהול הגדרות והעלאת קבצים.
- `guest`: קריאה מצומצמת של הגדרות ציבוריות.

## טבלאות מוצעות

- `users`: פרטי התחברות, גיבוב סיסמה, סטטוס ודגל החלפת סיסמה שאינו נאכף בכניסה ראשונה.
- `site_settings`: רשומת הגדרות כלליות יחידה.
- `media_assets`: מטא-דאטה של קבצים, סוג, גודל, שם אחסון ומעלה הקובץ.

## APIs מוצעים

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `GET /api/admin/settings/general`
- `PUT /api/admin/settings/general`
- `POST /api/admin/media`
- `GET /api/admin/media`
- `DELETE /api/admin/media/:id` כמחיקה רכה
- `GET /api/public/settings`
- `GET /api/media/:id`

## Components ועמודים מוצעים

- `login` page
- `change-password` page
- `admin-general` page
- `admin-media` page
- `sidebar`
- `navbar`
- `form`
- `button`
- `notification`
- `modal`

## סיכונים

### High

- יצירת טבלאות מרכזיות חדשות.
- יצירה ושינוי של הרשאות `admin`.
- יצירת Authentication flow ו־JWT.
- APIs חדשים המוגנים בהרשאת `admin`.
- אחסון והגשת קבצים מהשרת.

### Medium

- שמירת נתוני קשר בפורמט שאינו עקבי.
- קבצים יתומים לאחר החלפת לוגו או תמונה.
- תלות באחסון מקומי של השרת בפריסה מרובת מופעים.

### אבטחה

- הסיסמה `123123` חלשה; נדרש מנגנון `must_change_password`.
- יש להגביל ניסיונות התחברות ולהחזיר שגיאה כללית.
- יש לבדוק גודל תוך כדי stream ולא להסתמך רק על `Content-Length`.
- יש לזהות סוג קובץ לפי חתימת הקובץ ולא רק לפי סיומת או MIME מהלקוח.
- SVG וקבצים פעילים לא ייכללו ב־allowlist הראשוני.
- קבצים לא יישמרו בשם המקורי ולא ייחשפו בנתיב מערכת ישיר.
- Cookie יוגדר `HttpOnly`, `SameSite=Strict` ו־`Secure` בפרודקשן.

## סתירות ואי-ודאות

- בקשת המשתמש נקטעה במילה `קובץ`; ייתכן שחסרה דרישה מהותית.
- קובץ `AGENTS.md` הראשי מגדיר עד 10MB, והבקשה הנוכחית 5MB.
  המגבלה המחמירה 5MB תואמת את שתי הדרישות.
- רק `ag-grid-community` מאושרת כספרייה חיצונית. התכנון נמנע מספריות
  hashing, JWT ו־multipart ומשתמש ביכולות מובנות של Node.

## חלופה בטוחה

- להשאיר את חשבון `admin` מושבת עד להרצת פקודת bootstrap חד-פעמית.
- אם נדרש `admin/123123`, לתעד שמדובר בסיסמת פיתוח חלשה שאינה מחייבת החלפה אוטומטית לפי אישור המשתמש.
- להתחיל ב־allowlist של PNG, JPEG ו־WebP בלבד.

## קבצים צפויים במימוש

- קובצי Product, Permissions, DB, API, Components, QA ו־Shared Info.
- קוד Backend חדש לפי routes/controllers/repo/middlewares/validators/types.
- קוד Frontend חדש לפי מבנה SPA המחייב.
- `.env.example`, ללא סודות אמיתיים.

## החלטה נדרשת

אין להתחיל מימוש לפני:

1. השלמת המשפט שנקטע בבקשת המשתמש.
2. אישור מפורש ל־High Risk.
3. אישור שהסיסמה הראשונית אינה מחייבת החלפה בהתחברות הראשונה.
4. אישור allowlist ראשוני: PNG, JPEG ו־WebP.
