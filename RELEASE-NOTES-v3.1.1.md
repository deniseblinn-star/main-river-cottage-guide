# Main River Cottage Planner v3.1.1 — Phase 2 Build Fix

## Fixed
- Added the missing `src/utils/recipeCatalogue.js` module required by `src/pages/Recipes.jsx`.
- Restored catalogue loading, recipe copying, and recipe deletion support.
- Verified that all relative imports in `src` now resolve to files included in the package.

## Deployment
Commit and push this release, then Netlify should move past the previous:
`Could not resolve "../utils/recipeCatalogue"` build error.
