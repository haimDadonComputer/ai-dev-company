# מודל הרשאות לתשתית הניהול

## תפקידים

### guest

משתמש שאינו מחובר. התפקיד רשאי לצפות רק בהגדרות האתר ובקובצי מדיה
שמיועדים לציבור, ולהשתמש ברכיבים הנדרשים למסך ההתחברות ולתצוגה הציבורית.

API מותרים:

- `public_settings_get`
- `media_get`

רכיבים מותרים:

- `login-page`
- `navbar`
- `form`
- `button`
- `notification`

### admin

מנהל המערכת. כל הרשאה מפורטת במפורש, ללא הרשאה גורפת.

API מותרים:

- `auth_login`
- `auth_logout`
- `auth_me`
- `auth_change_password`
- `admin_general_get`
- `admin_general_update`
- `admin_media_upload`
- `admin_media_list`
- `admin_media_delete`
- `public_settings_get`
- `media_get`

רכיבים מותרים:

- `login-page`
- `change-password-page`
- `admin-general-page`
- `admin-media-page`
- `navbar`
- `sidebar`
- `form`
- `button`
- `notification`
- `modal`

## כללי גישה

- פעולות `admin_*` מחייבות משתמש מחובר בעל תפקיד `admin`.
- פעולות `auth_me`, `auth_logout` ו-`auth_change_password` מחייבות התחברות.
- `auth_login`, `public_settings_get` ו-`media_get` נגישות ללא התחברות בהתאם
  לזרימת המערכת, אך `auth_login` אינו חלק מהרשאות התפקיד `guest`.
- העלאה, רשימה ומחיקה של מדיה הן פעולות ניהול בלבד.
- שינוי ההגדרות הכלליות הוא פעולת ניהול בלבד.
- הרשאות `admin` מסווגות `risk_level=High` ו-`needs_review=yes`.

## תלות במקורות אמת אחרים

בעת עדכון מסמך זה, `agents/api/info/api_list.csv` ו-
`agents/components/info/components_list.csv` הכילו כותרות בלבד. לפני מימוש,
AI API ו-AI Components חייבים לרשום במקורות האמת שלהם בדיוק את שמות ה-API
והרכיבים המפורטים במסמך זה. הפער דורש בדיקת AI Contradictions.
