# v3.8.0 Test Plan

## Deployment
- Netlify build succeeds.
- Functions `planner-read`, `planner-access`, and `planner-publish` deploy.
- The app opens without a blank page.

## First owner publish
- Sign in through Settings.
- Settings shows Owner.
- Publish First Shared Planner succeeds.
- Revision 1 and a timestamp appear.
- Netlify Blobs shows store `main-river-planner` with published/current, metadata/current and master/initial.

## Cross-device consistency
- Phone and work computer show the same Saturday and Sunday meals.
- Whole Grilled Beef Tenderloin appears everywhere where expected.
- Grocery Library and Trip Grocery List match.
- Activities and attendance match.

## View-only
- Unsigned family browser shows the green Published family planner banner.
- Add/Edit/Delete/Save actions are blocked.
- Search and normal navigation remain usable.
- Temporary browser edits are replaced after refresh.

## Owner draft and publish
- Owner changes a harmless meal note.
- Family does not see it before Publish.
- Owner publishes revision 2.
- Family refreshes and sees the change.
- History contains revision 1.

## Recovery
- Download Safety Backup produces JSON.
- Existing 2026-08-05 backup remains untouched.
