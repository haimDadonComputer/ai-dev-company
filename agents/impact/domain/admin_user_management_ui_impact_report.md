# Impact Report: ממשק ניהול משתמשים

תאריך: 2026-06-09  
סיווג שינוי: feature  
רמת סיכון: High

## מה משתנה

נוסף עמוד SPA חדש למנהל בנתיב `/admin/users`.

העמוד מאפשר:

- צפייה ברשימת משתמשים וסינון לפי תפקיד וסטטוס.
- יצירת משתמש מסוג תלמיד, מדריך או מנהל.
- עריכת פרטי זהות ופרופיל עסקי לתלמיד או מדריך.
- איפוס סיסמה למשתמש קיים.
- שינוי סטטוס משתמש ללא מחיקה פיזית.

## השפעה לפי תחום

Components:

- נוסף `admin-users-page`.
- `router`, `sidebar`, `navbar`, `form`, `button`, `notification` משתמשים בו או תומכים בו.

API:

- אין API חדש.
- העמוד משתמש בחוזים הקיימים:
  - `admin_users_list`
  - `admin_users_create`
  - `admin_users_get`
  - `admin_users_update`
  - `admin_users_reset_password`
  - `admin_users_update_status`

Permissions:

- role `admin` קיבל הרשאת רכיב מפורשת ל־`admin-users-page`.
- אין שינוי הרשאות ל־guest, student או instructor.

Database:

- אין שינוי טבלה, שדה או טיפוס.
- כל הפעולות עוברות דרך API קיים ו־repo קיים.

QA:

- נוסף תרחיש QA-033 לעמוד ניהול משתמשים ב־SPA.
- נוסף REG-022 לשמירה על route, build ואי־אחסון JWT בדפדפן.

## סיכונים

- חשיפת ממשק ניהול רגיש אם route אינו מוגן על ידי session ו־admin API.
- חוסר התאמה בין שמות שדות ה־frontend לחוזה API.
- שבירת build או ניווט SPA לאחר הוספת route חדש.

## הפחתת סיכונים

- ה־router משתמש ב־protected route וב־auth_me.
- כל קריאות API נשלחות עם `credentials: "same-origin"` דרך `apiRequest`.
- אין שימוש ב־localStorage או sessionStorage.
- `context:check`, `npm test` ו־build מאמתים את מקורות האמת והאריזה.

## סטטוס

מיושם וממתין לאימות build/test ו־Visual QA עתידי.
