# Main River Cottage Planner 0.9.7 — Module 2A: Grocery Library & Measurement Foundation

## Grocery Library
- Added a reusable Grocery Library inside the Groceries module.
- Standard items include name, aliases, category, subcategory, allowed recipe units, purchase unit and common package size.
- Added create, edit, search and delete controls.
- Seeded common items including Apple Cider Vinegar, pasta, cucumber, olive oil, milk, butter, eggs, cereal and crackers.

## Aliases and duplicate merging
- Recipe ingredients are matched against standard names and aliases.
- `ACV`, `apple cider vinegar`, and `apple cider vinegar + juice for spritz` resolve to Apple Cider Vinegar.
- The generated Trip Grocery List merges compatible entries under the standard name.
- Recipe-specific wording remains visible in source and merged-alias information.

## Units
- Added normalized weight units: g, kg, oz and lb.
- Added normalized volume units: tsp, tbsp, cup, mL and L.
- Added count and purchase units such as each, bottle, box, bag and package.
- Compatible units merge automatically; incompatible measurement families remain separate.
- Large totals display as kg or L.

## Package-size suggestions
- Standard Grocery Library records can include a common package size.
- Recipe-generated groceries show a rounded purchase suggestion where conversion is possible.
- Example: 1.6 kg pasta can suggest 4 × 454 g packages.

## Recipe integration
- Recipe ingredient entry now suggests Grocery Library items.
- Matched ingredients store a Grocery Library ID.
- Existing recipes continue working and are matched dynamically by name or alias.

## Intentional limitations
- Existing recipe ingredients are not silently rewritten.
- Density-based conversions such as cups of cheese to grams are not attempted.
- Count and weight forms such as `2 cucumbers` and `500 g cucumber` remain separate.
- Package sizes are editable defaults, not store inventory.
