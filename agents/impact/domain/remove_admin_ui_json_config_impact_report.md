# Impact Report: Remove Bundled Admin UI And Use JSON Site Config

## Change Level

architecture_change

## Approval

User approved on 2026-06-12.

## Scope

- Remove bundled frontend login and admin management UI.
- Add `src/app/site-config.json` as the simple global site identity file.
- Make public settings read from the JSON file.
- Relax password validation to require more than 6 characters only.

## Impact

- Components: old visual pages and shared UI components are removed from the base.
- API: `public_settings_get` now returns the JSON config fields.
- DB: `site_settings` remains as legacy admin API storage only; it is no longer the public settings source.
- QA: full E2E remains blocked until MySQL is available.

## Risk

Critical, because login UI and architecture behavior changed. The user approved the change.

## Safer Path Used

Backend auth, media, and legacy admin APIs remain in place for compatibility. Only bundled UI and public config source were changed.
