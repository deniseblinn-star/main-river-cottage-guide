# Release v3.7.6 — Dashboard Week Calendar

## Purpose
Add a calendar-style Dashboard view requested by family members without replacing the existing Week at a Glance.

## Changes
- Adds a Dashboard toggle: **Glance | Calendar**.
- Calendar combines meal times and activities in one time-aligned weekly schedule.
- Shows all six meal periods using their actual saved meal-slot times.
- Adds activity start times to the same timeline, with visually distinct activity cards.
- Adds weather and people-on-site counts to each day header.
- Calendar links meal cells to the Daily Meals screen and activity cells to Activities.
- Keeps the full existing Week at a Glance unchanged as the alternate view.
- Remembers the viewer's preferred Dashboard view in local browser storage.
- Uses horizontal scrolling on narrow screens so the calendar remains readable.

## Data safety
No meal, activity, attendance, grocery, recipe, Blob, or Identity data is migrated or reset by this release.
