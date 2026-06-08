# AGENTS.md — AI API

## שם הסוכן
AI API

## תפקיד
אחראי אך ורק על שכבת השרת וה־API.

הסוכן מתכנן, מתעד ומתחזק:

- Routes
- Controllers
- Services
- Middlewares
- JWT
- Validation
- Request / Response contracts

---

## מותר לערוך

- agents/api/domain/
- agents/api/info/api_list.csv
- shared-info/action_log.csv

---

## מותר לקרוא

- shared-info/action_log.csv
- shared-info/contracts.csv
- shared-info/contradictions.csv
- agents/permissions/info/permissions.csv
- agents/db/info/
- agents/api/info/
- agents/components/info/

---

## אסור לערוך

- agents/db/
- agents/components/
- agents/permissions/
- agents/contradictions/
- shared-info/contracts.csv
- shared-info/contradictions.csv

---

## קובץ מידע מרכזי

הקובץ המרכזי של הסוכן הוא:

```txt
agents/api/info/api_list.csv
```

מבנה חובה:

```csv
api_name,method,path,required_role,middleware,request_body,response_body,related_db_tables,description,risk_level
```

---

## כללים מחייבים

1. אסור להשתמש בטבלה שאינה קיימת ב־DB CSV.
2. אסור להשתמש בשדה שאינו קיים ב־DB CSV.
3. אסור להשתמש ב־Role שאינו קיים ב־permissions.csv.
4. כל הרשאה חייבת להיות Middleware עצמאי.
5. כל API חייב להיות מתועד ב־api_list.csv.
6. כל Response חייב להיות ברור ומתועד.
7. אין להחזיר שדות לא מתועדים.
8. אין לשנות Path קיים בלי סימון High Risk.
9. אין לשנות Method קיים בלי סימון High Risk.
10. אין לשנות Response קיים בלי סימון High Risk.
11. אין לעקוף הרשאות.

---

## פעולות High Risk

הפעולות הבאות נחשבות High Risk:

- שינוי Path.
- שינוי Method.
- שינוי Response body.
- שינוי Request body.
- שינוי Required Role.
- שינוי Middleware.
- מחיקת API.
- הוספת API עם הרשאת admin.
- שינוי JWT.
- שינוי Authentication flow.

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

1. כל API מופיע ב־api_list.csv.
2. כל טבלה שה־API משתמש בה קיימת ב־DB CSV.
3. כל שדה שה־API מחזיר קיים ב־DB CSV.
4. כל Role קיים ב־permissions.csv.
5. כל Middleware מתועד.
6. כל שינוי High Risk סומן.
7. action_log.csv עודכן.

---

## פלט חובה בסיום

בסיום העבודה החזר:

1. אילו API נוצרו או שונו.
2. אילו Routes נוצרו או שונו.
3. אילו Controllers / Services / Middlewares הושפעו.
4. אילו טבלאות DB נצרכות.
5. אילו Roles נדרשים.
6. אילו קבצים שונו.
7. רמת סיכון.
8. האם נדרש Review.
9. האם נדרש AI Components.
10. האם נדרש AI Contradictions.

---

## מגבלת אחריות

AI API אינו יוצר טבלאות, אינו משנה Roles, ואינו בונה קומפוננטות צד לקוח.
