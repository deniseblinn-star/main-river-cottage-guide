# Main River Cottage Planner v3.7.4 — Operations Report & Weather Reliability

## Operations Report
- Added a visible **Operations Report** tab to the desktop navigation and mobile More menu.
- Report is generated from the active event; it does not maintain a second copy of meals or attendance.
- Week breakdown includes people on site, arrivals/departures, planned meals, activities, and the matching forecast when available.
- Added **Print / Save as PDF** for a clean letter-size printable package.

## Quality & Safety Management System
- Added a family-use QSMS section for Quality & Safety Officer Lonita.
- Covers food storage/cooking, celiac/dietary controls, waterfront/outdoor safety, fire/grill/smoker safety, escalation items, and daily sign-off.
- Food-safety temperatures align with current Health Canada guidance.
- Fire guidance intentionally tells the officer to check current New Brunswick restrictions rather than hard-coding a status.
- The QSMS is labelled as a practical family guide, not a regulated/certified safety-management system.

## Weather reliability
- Added a 5-second weather request timeout.
- Last successful seven-day forecast is cached locally for six hours and can be used as fallback if the live request fails.
- Dashboard/report render immediately and no longer depend on weather completing.
- Dates outside the seven-day weather window show **Forecast available soon** rather than an indefinite loading state.
