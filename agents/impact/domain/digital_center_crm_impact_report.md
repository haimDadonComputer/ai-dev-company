# דוח השפעה: CRM ואתר תדמית עבור המרכז הדיגיטלי

## סיווג

- Change Level: `major_feature`
- רמת סיכון כוללת: High
- סטטוס: אפיון מוצרי מוכן לאישור, ללא מימוש קוד

## מטרת השינוי

להפוך את תשתית הניהול הכללית למערכת עסקית מלאה עבור "המרכז הדיגיטלי":

- אתר תדמית ציבורי.
- CRM פנימי.
- אזורי תלמיד, מדריך ומנהל.
- ניהול פעילויות, קבוצות, שיעורים, נוכחות, פניות, קבצים, סקרים ותעודות.

## מודולים מושפעים

- Product
- Permissions
- Database
- API
- Components
- Design System
- QA
- Contracts
- Contradictions

## Roles מושפעים

- `guest`: צפייה באתר ציבורי והשארת פרטים.
- `student`: אזור אישי מוגבל לנתוני התלמיד.
- `instructor`: ניהול קבוצות, שיעורים ונוכחות לפי שיוך.
- `admin`: ניהול מלא.

## טבלאות עתידיות מושפעות

- users
- students
- instructors
- activities
- groups
- group_students
- payment_statuses
- lessons
- attendance_statuses
- attendance_records
- surveys
- survey_questions
- survey_options
- survey_responses
- survey_answers
- public_leads
- internal_tickets
- internal_ticket_comments
- certificates
- files
- lesson_files
- notifications
- lookup_values

## APIs עתידיים

ה־API הקיים יצטרך להתרחב לתחומים:

- auth
- users
- students
- instructors
- activities
- groups
- enrollments
- lessons
- attendance
- surveys
- public leads
- internal tickets
- certificates
- files
- notifications
- calendar
- search
- archive
- lookups

## Components ועמודים עתידיים

- public home
- public activity list
- public activity details
- public lead form
- student dashboard
- instructor dashboard
- admin dashboard
- advanced table
- entity form
- modal
- file picker
- notification center
- calendar
- survey builder
- survey response form

## סיכוני High

- הרחבת מודל המשתמשים מתפקיד admin בלבד לשלושה תפקידים.
- שינוי הרשאות מהותי.
- הוספת טבלאות רבות וקשרים מרובים.
- הוספת APIs רבים.
- הרשאות מדריך תלויות בשיוך לקבוצה, לא רק בתפקיד.
- קבצי PDF נדרשים לתעודות, בעוד התשתית הנוכחית מאפשרת תמונות בלבד.
- סקרים דינמיים יוצרים מודל נתונים מורכב.
- יצירת שיעורים אוטומטית יכולה ליצור כפילויות או תאריכים שגויים אם לא תוגדר בקפידה.

## סיכוני Medium

- Visual QA עדיין פתוח ברמת Medium.
- חוויית טבלאות מתקדמות תלויה ב־ag-grid-community או במימוש ידני.
- סטטוס תשלום ללא סליקה עלול ליצור אי התאמה מול גבייה בפועל.
- אין עדיין החלטה לגבי דוחות, רשימת המתנה והודעות חיצוניות.

## חוזים שיידרשו בהמשך

- Role to API permissions.
- Role to Component visibility.
- Group scoped instructor permissions.
- Public visibility rules for activities and groups.
- File category and MIME allowlist.
- Survey answer validation.
- Archive behavior for every business entity.
- Search visibility per role.

## חלופה בטוחה

לבצע את המימוש בשלבים:

1. Product ו־Design Profile.
2. Roles והרשאות.
3. DB בסיסי לפעילויות, קבוצות, תלמידים ופניות.
4. API בסיסי.
5. Components ומסכים.
6. QA ו־Contradictions לכל שלב בנפרד.

## החלטה נדרשת לפני מימוש

- אישור שה־MVP המוצע הוא סדר העבודה.
- אישור הרחבת קבצים ל־PDF עבור תעודות וסילבוסים.
- אישור שימוש ב־ag-grid-community לטבלאות מתקדמות אם נדרש.
- החלטה אם Visual QA ייסגר לפני תחילת מימוש או לפני סיום ה־MVP.
