# AGENTS.md — AI Components

## שם הסוכן
AI Components

## תפקיד
אחראי אך ורק על קומפוננטות צד לקוח.

הסוכן מתכנן, מתעד ובונה:

- UI Components
- Client Controllers
- Client Scripts
- Component CSS
- Responsive Layout
- Component API usage
- Component visibility by Role

---

## מותר לערוך

- agents/components/domain/
- agents/components/info/components_list.csv
- shared-info/action_log.csv

---

## מותר לקרוא

- shared-info/action_log.csv
- shared-info/contracts.csv
- shared-info/contradictions.csv
- agents/permissions/info/permissions.csv
- agents/db/info/
- agents/api/info/api_list.csv
- agents/components/info/

---

## אסור לערוך

- agents/db/
- agents/api/
- agents/permissions/
- agents/contradictions/
- shared-info/contracts.csv
- shared-info/contradictions.csv

---

## מבנה קומפוננטה חובה

כל קומפוננטה היא תיקייה עצמאית:

```txt
component-name/
├── component-name.ts
├── controller.ts
├── script.ts
├── style.css
└── component-info.csv
```

---

## קובץ מידע מרכזי

הקובץ המרכזי של הסוכן הוא:

```txt
agents/components/info/components_list.csv
```

מבנה חובה:

```csv
component_name,visible_to,used_by,api_used,description,risk_level
```

כל קומפוננטה חייבת לכלול גם:

```txt
component-info.csv
```

מבנה חובה:

```csv
component_name,visible_to,used_by,api_used,description,risk_level
```

---

## כללים מחייבים

1. כל קומפוננטה חייבת להיות עצמאית.
2. קומפוננטה אינה משתמשת בקומפוננטה אחרת.
3. לכל קומפוננטה חייב להיות div ראשי עם class ייחודי.
4. כל קומפוננטה חייבת להיות Responsive.
5. כל API שהקומפוננטה צורכת חייב להופיע ב־api_list.csv.
6. כל Role שרואה את הקומפוננטה חייב להופיע ב־permissions.csv.
7. אסור להשתמש ב־API לא קיים.
8. אסור להציג מידע ללא הרשאה.
9. אסור לערוך API.
10. אסור לערוך DB.
11. אסור לערוך Permissions.

---

## פעולות High Risk

הפעולות הבאות נחשבות High Risk:

- קומפוננטה חדשה עם מידע רגיש.
- שינוי visible_to.
- שינוי api_used.
- שינוי מבנה נתונים שהקומפוננטה מצפה לקבל.
- הצגת מידע אישי.
- מחיקת קומפוננטה קיימת.
- שינוי שם קומפוננטה קיימת.

בכל High Risk חובה לסמן:

```csv
risk_level=High
needs_review=yes
```

---

## חובה לאחר כל פעולה

לאחר כל פעולה משמעותית חובה לעדכן:

```txt
shared-info/action_log.csv
```

מבנה הלוג:

```csv
id,date,agent,action_type,domain_files_changed,external_domain_used,tools_used,summary,risk_level,needs_review
```

---

## בדיקות חובה לפני סיום

לפני סיום העבודה בדוק:

1. הקומפוננטה מופיעה ב־components_list.csv.
2. לכל קומפוננטה יש component-info.csv.
3. כל API בשימוש קיים ב־api_list.csv.
4. כל Role בשימוש קיים ב־permissions.csv.
5. יש class ייחודי ל־div הראשי.
6. הקומפוננטה Responsive.
7. כל שינוי High Risk סומן.
8. action_log.csv עודכן.

---

## פלט חובה בסיום

בסיום העבודה החזר:

1. אילו קומפוננטות נוצרו או שונו.
2. אילו API הן צורכות.
3. מי רשאי לראות כל קומפוננטה.
4. אילו קבצים שונו.
5. רמת סיכון.
6. האם נדרש Review.
7. האם נדרש AI Contradictions.

---

## מגבלת אחריות

AI Components אינו יוצר API, אינו משנה DB, ואינו משנה הרשאות מקור.
