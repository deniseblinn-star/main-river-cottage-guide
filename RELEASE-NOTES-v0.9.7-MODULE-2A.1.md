# Main River Cottage Planner 0.9.7 — Module 2A.1 Patch

## Grocery Library editor
- Replaced the unexplained save icon on Grocery Library cards with a labelled Edit button.
- Existing and newly created Grocery Library records can be reopened and edited.
- The editor no longer closes when the shaded background is clicked.
- Added explicit Cancel, Save and Close controls.
- Added an unsaved-changes warning before closing the editor.

## Recipe assignment status
- Recipe Catalogue assignment badges now count only Meal Slots whose active plan type is Recipes.
- Changing a Meal Slot to Not Planned, Simple Meal or Restaurant immediately makes its former recipes Unassigned.
- Inactive recipe IDs no longer contribute to the generated grocery list.

## Recipe ingredient linking
- Replaced the browser-dependent datalist with a visible searchable Grocery Library selector.
- Search results show standard name, category, subcategory and aliases.
- Selecting a result stores the Grocery Library item ID.
- Added Create Grocery Library Item directly from an ingredient row.
- A newly created item is immediately linked to that recipe ingredient.
- Added optional Also add to Base List at quantity zero.

## Search
- Added search to the Trip Grocery List.
- Added search to the Base List.
- Trip search includes item names, aliases, recipe sources, meal names and notes.
- Base search includes item names, units, sections and notes.

## Clarification
- Recipe instructions remain ordinary instructions.
- Structured timeline offsets and Smoker HQ task scheduling are deferred to the Smart Timeline release.
