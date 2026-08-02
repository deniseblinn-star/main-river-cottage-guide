# Main River Cottage Planner v3.3.0 — Phase 4 Dynamic Groceries

## Added
- Date-specific Meal Slot recipe assignments now generate the Trip Grocery List.
- Meal attendance and recipe yield calculate the scale factor for every assignment.
- The same recipe can be assigned to several Meal Slots and contributes separately each time.
- Compatible ingredients merge into one grocery item while preserving all recipe/meal sources.
- Removing a recipe from a Meal Slot removes its grocery contribution.
- Editing an assigned recipe recalculates its grocery contribution.
- Recipe Catalogue Assigned/Unassigned badges now reflect the active Overall Event.
- Assigned recipe deletion is blocked using the active event assignments.

## Changed
- Removed the old static planned-recipe grocery list from the Trip Grocery List.
- Base Cottage items and manually added items remain unchanged.
- Grocery assignee choices now come from the active event attendee list.
- Built-in recipes can be opened in the editor; legacy ingredient lines are converted into editable ingredient rows.

## Legacy ingredient warning
Some older catalogue recipes contain ingredient names without structured quantities. Those items are included with an `amount` unit and a warning. Edit those recipe ingredients before final shopping so scaling is accurate.
- Recipe detail pages now show active-event meal assignments and scale factors.
- All catalogue recipes, including built-ins, open in the same editor.
