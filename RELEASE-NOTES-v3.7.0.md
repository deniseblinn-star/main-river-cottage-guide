# Main River Cottage Planner v3.7.0 — Recipe and Grocery Cleanup

## Meal assignment repair

- Meal Slots are now the only source of recipe assignments.
- Changing a meal to Unplanned, Simple Plan or Restaurant clears its recipe IDs.
- Legacy recipe links are removed while saved event data is normalized.
- Recipe badges, detail pages and grocery generation count only active recipe-planned meals.

## Recipe migration

- Converted all 25 legacy catalogue recipes to structured numeric ingredients.
- Added nine recipes referenced by the current meal plan but missing from the catalogue.
- The catalogue now contains 34 structured recipes and 263 numeric ingredient rows.
- Removed every legacy `amount` ingredient and final-shopping warning from built-in recipes.

## Grocery Library backfill

- Backfilled Grocery Library records for every ingredient used by a current recipe.
- The Grocery Library now seeds 133 standardized items.
- Recipe ingredients link to Grocery Library IDs for merging and future package calculations.

## Simpler Trip Grocery List

- Retired the Base Cottage List screen and workflow.
- On first launch, active Base List entries are moved once into manually added trip groceries so existing needs are preserved.
- The Trip Grocery List now combines active recipe-generated groceries with manually added items.
- Add Grocery Item now searches the Grocery Library first.
- A Create New Item option creates a reusable Grocery Library record and adds it to the current trip.

## Validation

- Added `scripts/audit-release.mjs` to check recipe quantities, Grocery Library links, meal assignments and removal of the Base List UI.
- Added repeatable recipe migration scripts under `scripts/`.
- Production build verified with Vite.
