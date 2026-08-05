# Main River Cottage Planner v3.8.0 — Shared Planner Data

## Purpose
This release replaces device-specific published viewing with one shared planner stored in Netlify Blobs.

## Behaviour
- The first authenticated publisher becomes the permanent planner owner.
- The owner edits a local draft and presses **Publish Current Draft** when ready.
- Every other browser loads the same published Blob revision.
- Existing browser-local planner data is ignored for family viewing once a shared revision exists.
- Family viewers are placed in a guarded view-only mode. Editing controls and form changes are blocked where detected and display a message to send changes to Denise.
- Viewer browsers reload the published snapshot on every full page load, so temporary local changes cannot replace the shared planner.
- The owner device preserves unpublished draft changes until a newer shared revision exists.

## Storage
Netlify Blob store: `main-river-planner`

Keys:
- `published/current`
- `metadata/current`
- `master/initial`
- `history/revision-*`

## Security
- Public visitors can read only `published/current`.
- Publishing requires a valid Netlify Identity session.
- The first publisher's email becomes the owner email.
- Later invited users remain viewers unless a future release explicitly adds editor permissions.
- Every publish saves the previous revision to history.

## Safety
The existing browser backup remains the rollback source. Settings also includes **Download Safety Backup**.
