# v3.7.1 QA Checklist

1. Dashboard loads without errors and contains Week at a Glance.
2. Compare Saturday and Sunday against the Meal Planner; recipe names must match exactly.
3. Change one Meal Slot, return to Dashboard and confirm the Dashboard reflects the change.
4. Confirm day guest counts reflect current event attendance rather than old week.json values.
5. Confirm current Activities appear on the correct day.
6. Confirm weather loads for dates inside the current forecast horizon; later dates say Forecast available soon.
7. Temporarily go offline/reload if desired; weather failure must not break the Dashboard.
8. Open Trip Grocery List and verify generic Cheese is gone when no active recipe truly contains generic Cheese.
9. If Garlic remains, expand/read its recipe sources: it should only remain when an active recipe actually calls for Garlic.
10. Remove an assigned recipe from a Meal Slot and confirm its unique groceries disappear.
11. Open Grocery Library and confirm it is a categorized list, not large cards.
12. Search Grocery Library by standard name, alias, category and subcategory.
13. Edit a Grocery Library item and confirm your existing package values persist.
14. Refresh the app and confirm your current real planner data remains intact.
