# Source Of Truth

## Machine-readable Index

האינדקס המחייב של כל מקורות האמת:

`shared-info/system_manifest.json`

נקודת הכניסה המחייבת ל-AI Manager:

`shared-info/manager_bootstrap.md`

ה-snapshot המאוחד:

`shared-info/system_context.json`

ה-snapshot אינו מקור אמת. תקפותו נבדקת באמצעות `npm run context:check`.

## Roles

המקור היחיד:

`agents/permissions/info/permissions.csv`

## Tables

המקור היחיד:

`agents/db/info/`

## APIs

המקור היחיד:

`agents/api/info/api_list.csv`

## Components

המקור היחיד:

`agents/components/info/components_list.csv`

## Global Site Config

המקור היחיד לפרטי האתר הציבוריים:

`src/app/site-config.json`

## Design System

המקור היחיד:

`design-system/`

## Product Requirements

המקור היחיד:

`product/project_definition.md`
`product/features.csv`
`product/user_stories.csv`

## Decisions

המקור היחיד:

`shared-info/decisions.csv`

## QA

המקור היחיד:

`agents/qa/info/`

הקבצים תחת `qa/` הם mirrors שנוצרים באמצעות `npm run context:build`.

## Environment Contract

המקור היחיד לשמות משתני סביבה ולחובת הגדרתם:

`shared-info/environment_contract.csv`

הערכים הפעילים מגיעים מ-`.env` בפיתוח וממשתני הסביבה בפרודקשן.

## Modules

המקור היחיד למפת המודולים:

`shared-info/modules.csv`

## Project Status

המקור היחיד למצב הפרויקט ולחסמים:

`shared-info/project_status.json`

## Rule

אסור להגדיר Role, API, Table, Component או Global Site Config במקום אחר כמקור ראשי.
מותר רק להפנות למקור האמת.
