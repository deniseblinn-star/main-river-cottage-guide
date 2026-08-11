# Main River Cottage Planner v3.7.1
## Final Planner QA & Week at a Glance

### Dashboard
- Replaced stale hard-coded Dashboard cards with a live Week at a Glance.
- Each event day now reads directly from current Meal Slots, Attendance and Activities.
- Lunch, Early Snack and Dinner display the current plan and recipe names.
- Each day links directly to its Daily Meals page.
- Added a live Shopping snapshot using current generated/manual trip groceries.
- Added an Upcoming Activities snapshot.
- Added a Needs Attention panel for missing lunch/dinner plans and grocery warnings.
- Removed hard-coded Saturday guest counts, static GF warning and legacy week.json meal summaries.

### Weather
- Added live Main River-area weather using Open-Meteo's forecast API.
- Weather uses the Richibucto River/Main River cottage area forecast point (46.7, -64.85) and America/Moncton timezone.
- Dashboard shows daily high/low, precipitation probability and maximum wind speed when the event date is within the forecast horizon.
- Dates beyond the forecast horizon show `Forecast available soon`.
- Weather failure never blocks the planner; it falls back to `Weather temporarily unavailable`.

### Grocery integrity
- Generated groceries continue to rebuild exclusively from active recipe-planned Meal Slots.
- Added stale generic Grocery Library link repair: a specific current ingredient name/alias takes precedence over a legacy generic `Cheese` link.
- This prevents older browser recipe data such as Gruyère Cheese -> generic Cheese from recreating phantom Cheese groceries.

### Grocery Library UX
- Replaced large Grocery Library cards with a categorized list view.
- Categories show item counts.
- Desktop rows show standard name, subcategory and package information.
- Mobile rows remain compact.
- Search covers names, aliases, categories and subcategories.
- Edit and Delete remain available directly from each row.

### Data safety
- No planner data migration or reset is included.
- Existing browser recipes, package sizes, Grocery Library edits, attendance, activities and trip groceries remain untouched.
