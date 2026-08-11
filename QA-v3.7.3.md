# v3.7.3 QA

1. Sign in as owner.
2. Open Groceries and refresh.
3. Confirm Baked Mac & Cheese no longer generates generic Cheese when its visible ingredient is Gruyere/Gruyère Cheese.
4. Confirm Garlic Powder in Brisket/Pulled Pork no longer creates a fresh Garlic row measured in mL.
5. Confirm legitimate fresh Garlic remains as its own row from active recipes.
6. Open Admin > Data Health and run Repair Legacy Recipe Links.
7. Refresh and verify the repaired grocery rows stay repaired.
8. Edit a Grocery Library item and save; refresh and confirm the edit persists.
9. Dashboard: confirm Week at a Glance shows weather beside each day that is currently within the next 7 forecast days.
10. Confirm later cottage dates say `7-day forecast available soon` until they enter the rolling window.
11. Confirm Admin replaced Settings in navigation.
12. Run `node scripts/audit-release.mjs`.
