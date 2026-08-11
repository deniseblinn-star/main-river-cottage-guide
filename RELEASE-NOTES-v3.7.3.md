# Main River Cottage Planner v3.7.3

## Legacy Grocery Cleanup + Daily Weather + Admin

### Phantom grocery repair
- Repairs stale Grocery Library IDs inside saved recipe overrides by trusting exact current ingredient names/aliases.
- Known examples fixed:
  - Gruyere/Gruyère Cheese incorrectly linked to generic `Cheese`.
  - Garlic Powder incorrectly linked to fresh `Garlic`, which created a second Garlic row in mL.
- Grocery generation applies the same repair dynamically, so stale rows disappear on reload even before the saved override is rewritten.
- Adds Admin > Data Health > Repair Legacy Recipe Links to persist repaired links in localStorage.
- Does not change recipe quantities, recipe units, package sizes or Grocery Library records.

### Dashboard weather
- Week at a Glance now uses a rolling 7-day Main River forecast.
- Weather is attached to each cottage day when that date falls inside the 7-day forecast window.
- Days outside the window show `7-day forecast available soon`.
- Weather failures never prevent planner rendering.

### Admin
- Renames Settings to Admin in desktop, mobile and page titles.
- Admin now focuses on shared planner status, owner sign-in/publish, safety backup and data-health repair tools.

### Build carry-forward
- Removes top-level await from application startup.
- Declares the Netlify Blob/Identity dependencies used by the shared-planner code.
