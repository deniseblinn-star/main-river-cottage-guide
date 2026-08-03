MAIN RIVER PLANNER 0.9.7 — MODULE 2A

Copy every included file into the matching project location.

GitKraken:
1. Confirm src/utils/groceryLibrary.js appears as a new file.
2. Stage all.
3. Commit: Add grocery library aliases and unit merging
4. Push.
5. Confirm Netlify publishes.

TEST
1. Open Groceries → Grocery Library.
2. Find Apple Cider Vinegar and review its aliases.
3. Open a recipe containing apple cider vinegar.
4. Re-save the recipe or leave it unchanged; dynamic alias matching works either way.
5. Assign the recipe to a Meal Slot.
6. Confirm duplicate Apple Cider Vinegar lines merge on the Trip Grocery List.
7. Confirm compatible g/kg or mL/L values merge.
8. Confirm incompatible count and weight measurements remain separate.
9. Assign a pasta recipe and confirm a package-size suggestion appears.
10. Add a new Grocery Library item and use its standard name in a recipe.

NOTE
The local build command could not run in the packaging environment because Vite dependencies were not installed. All relative source imports were verified; Netlify is the compile check.
