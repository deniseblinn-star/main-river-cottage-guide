# Main River Planner — Current Phase Requirements

**Phase:** Version 3 Foundation  
**Status:** Approved for build  
**Last updated:** August 1, 2026

## 1. Purpose

Rebuild the application foundation while retaining the useful existing visual design and screens.

The current phase must establish the correct relationships between:

- Profiles
- Overall Events
- Event attendance
- Accommodations and sleeping spaces
- Date-specific meal slots
- Recipe catalogue
- Recipe assignments
- Grocery generation
- Activities
- Media

## 2. Core terminology

### 2.1 Profile

A permanent person record.

A Profile may participate in many Overall Events.

Profile fields include:

- Name
- Photo
- Dietary restrictions
- Allergies
- Favourite lunch
- Favourite dinner
- Notes
- Optional contact information

### 2.2 Overall Event

The full gathering or trip.

Examples:

- Main River Cottage Week 2026
- Christmas at Danielle's 2026

An Overall Event owns:

- Start date
- End date
- Location
- Event attendees
- Daily planner
- Meal slots
- Activities
- Accommodations used for the event
- Nightly bed assignments
- Trip grocery list
- Photos and videos
- Wrap-up and history

### 2.3 Activity

A scheduled activity inside an Overall Event.

Examples:

- Yacht Rock Party
- Main River Feast
- Golf Day
- Lazy River Float
- Christmas on the River
- Big Birthday Bash

An Activity may optionally link to a date-specific Meal Slot.

An Activity can have:

- Name
- Date
- Start time
- End time
- Description
- Attendees
- Location
- Contributions
- Optional linked Meal Slot
- Photos and videos

## 3. Event attendance

A Profile participates in an Overall Event through an Event Attendance record.

Required fields:

- Profile
- Overall Event
- Arrival date and time
- Departure date and time
- Needs accommodation
- Notes

A person must have a Profile before being added to an Overall Event.

## 4. Date-specific Meal Slots

Every date in an Overall Event contains these Meal Slots:

1. Breakfast
2. Brunch
3. Lunch
4. Early Snack
5. Dinner
6. Late Snack

A Meal Slot is uniquely defined by:

- Overall Event
- Date
- Meal type
- Configured time

Default times may be supplied, but each Meal Slot time must be editable for that date.

Suggested defaults:

- Breakfast — 9:00 AM
- Brunch — 11:00 AM
- Lunch — 1:00 PM
- Early Snack — 3:00 PM
- Dinner — 6:30 PM
- Late Snack — 8:00 PM

## 5. Meal attendance rules

### 5.1 Automatic attendance

If a Meal Slot time falls between a person's arrival and departure times, that person is automatically included in:

- Lunch
- Early Snack
- Dinner
- Late Snack

### 5.2 Breakfast and Brunch

Breakfast and Brunch are unassigned by default.

People must be manually selected for these Meal Slots.

### 5.3 Manual exceptions

Every Meal Slot supports:

- Manually added attendees
- Manually excluded attendees

Final Meal Slot attendance equals:

- Automatic attendees
- plus manual additions
- minus manual exclusions

Final attendance drives recipe scaling.

## 6. Meal plan types

A Meal Slot can use one of three planning approaches.

### 6.1 Recipes

One or more Recipe Catalogue recipes are assigned to the Meal Slot.

Assigned recipes scale to the Meal Slot's final attendance and generate grocery items.

### 6.2 Restaurant

Restaurant fields may include:

- Restaurant name
- Reservation time
- Address
- Confirmation number
- Notes
- Selected attendees

A Restaurant meal does not generate recipe groceries.

### 6.3 Simple food plan

Used when a formal recipe is unnecessary.

Examples:

- Cereal, bagels and fruit
- Sandwich buffet
- Leftovers
- Figure it out

A Simple food plan may rely on the Base Grocery List or have manually added grocery items.

## 7. Recipe Catalogue

Recipes are permanent and independent of Overall Events.

A recipe does not know its event, date or Meal Slot.

Recipe fields include:

- Name
- Description
- Recipe type
- Yield / serves
- Ingredients
- Ingredient quantities and units
- Grocery inclusion flag
- Instructions
- Prep time
- Cook time
- Equipment or method
- Source name
- Source URL
- Tradition or family note
- Optional photo

Recipe type describes what the recipe is, not when it is served.

Examples:

- Main
- Side
- Salad
- Dessert
- Sauce
- Appetizer
- Drink
- Bread

Do not use Breakfast, Brunch, Lunch or Dinner as recipe types.

### 7.1 Recipe actions

Every recipe supports:

- View
- Edit
- Copy
- Delete

Status labels:

- Assigned
- Unassigned

### 7.2 Delete safeguard

An assigned recipe cannot be deleted until it is removed from every Meal Slot assignment.

### 7.3 Copy

Copy creates an independent recipe that can be edited without changing the original.

### 7.4 URL import

A recipe may be:

- Created manually
- Initially prefilled from a source URL

The source URL is optional and is retained only for attribution and reference.

After import, every field must remain editable.

Imported content must be reviewed before saving.

## 8. Recipe Assignment

A Recipe Assignment connects a Recipe Catalogue recipe to one date-specific Meal Slot.

A Recipe Assignment stores:

- Meal Slot ID
- Recipe ID
- Recipe lead / responsible person
- Notes
- Display order

The same recipe may be assigned to multiple Meal Slots.

A recipe in the catalogue has no grocery impact until it has at least one Recipe Assignment.

## 9. Grocery generation

The Trip Grocery List has three sources:

1. Assigned recipe ingredients
2. Base Grocery List
3. Manually added grocery items

For an assigned recipe:

1. Read the Meal Slot's final attendance.
2. Read the recipe yield.
3. Calculate the scale factor.
4. Scale ingredient quantities.
5. Add grocery-enabled ingredients to the Trip Grocery List.
6. Merge compatible duplicate ingredients.
7. Preserve the source explanation.

If a Recipe Assignment is removed, its grocery contribution must disappear.

If a recipe is edited, any active grocery contribution from that recipe must recalculate.

### 9.1 Grocery item assignment

There is no authentication in this phase.

Do not use a Mine filter.

Any person can assign any grocery item to any Event attendee.

Filters:

- All
- Outstanding
- Purchased
- Unassigned
- By Person

Do not organize groceries by store or shopping run.

## 10. Accommodations

Accommodations are reusable records that can be activated for an Overall Event.

An Accommodation contains:

- Name
- Type
- Rooms
- Sleeping spaces
- Capacity
- Notes
- Active for current Overall Event

Sleeping assignments are made to individual sleeping spaces, not only to rooms.

### 10.1 Sleeping-space types

Examples:

- Queen bed
- Double bed
- Twin bed
- Couch
- Air mattress
- Cot

Each sleeping space has a capacity.

### 10.2 Nightly assignments

Bed assignments are nightly.

A person can sleep in different accommodations or beds on different nights.

Rules:

- Assign only people present that night.
- A person cannot occupy two sleeping spaces on the same night.
- A sleeping space cannot exceed capacity.
- Show unassigned people who need accommodation.
- Show over-capacity warnings.
- Default assignments may be applied and then overridden by night.

## 11. Seed accommodations

### 11.1 Denise & Steve's Cottage

**Capacity: 8**

- Master Bedroom
  - Queen bed — capacity 2
  - Default occupants: Denise and Steve
- Bedroom 2
  - Queen bed — capacity 2
- Bedroom 3
  - Double bed — capacity 2
  - Twin bed — capacity 1
- Living Room
  - Couch — capacity 1

### 11.2 Danielle & Kevin's Cottage

**Capacity: 7**

- Master Bedroom
  - Queen bed — capacity 2
  - Default occupants: Danielle and Kevin
- Bedroom 2
  - Double bed — capacity 2
- Bedroom 3
  - Double bed — capacity 2
- Living Room
  - Couch — capacity 1

### 11.3 Catherine's Cottage

**Capacity: 8**

- Bedroom 1
  - Double bed — capacity 2
- Bedroom 2
  - Double bed — capacity 2
- Bedroom 3
  - Double bed — capacity 2
- Bedroom 4
  - Double bed — capacity 2

No accommodation availability dates are required in this phase.

If an accommodation is not being used, leave it inactive or do not assign anyone to it.

### 11.4 Trailer 1

**Capacity: 6**

- Double bed 1 — capacity 2
- Double bed 2 — capacity 2
- Double bed 3 — capacity 2

### 11.5 Trailer 2

**Capacity: 6**

- Double bed 1 — capacity 2
- Double bed 2 — capacity 2
- Double bed 3 — capacity 2

## 12. Media

Photos and videos belong to an Overall Event.

Media may optionally be linked to:

- Date
- Activity
- Recipe
- Profile
- History chapter

For the current phase, media remains organizer-managed.

Shared family uploads and cloud media storage are deferred.

## 13. Primary relationship model

```text
Profile
  -> Event Attendance
      -> Overall Event
          -> Date
              -> Meal Slot
                  -> Recipe Assignment
                      -> Recipe Catalogue
                          -> Recipe Ingredients
                              -> Trip Grocery List

Event Attendance
  -> Nightly Bed Assignment
      -> Sleeping Space
          -> Room
              -> Accommodation

Overall Event
  -> Activities
  -> Media
  -> Contributions
  -> Wrap-Up / History
```

## 14. Initial end-to-end test

Use Greek Beef Skewers as the first controlled test.

1. Keep Greek Beef Skewers in the Recipe Catalogue.
2. Assign it to one date-specific Dinner Meal Slot.
3. Calculate final Meal Slot attendance.
4. Scale Greek Beef Skewers from its recipe yield.
5. Add its grocery-enabled ingredients to the Trip Grocery List.
6. Remove the Recipe Assignment.
7. Confirm its grocery contribution disappears.
8. Reassign the same recipe to another date or Meal Slot.
9. Confirm it scales independently for that assignment.

After this test passes, connect Caesar, filet and the remaining recipes using the same model.

## 15. User stories

### Profiles and attendance

- As an organizer, I can create a permanent Profile so the same person can attend multiple Overall Events.
- As an organizer, I can add a Profile to an Overall Event with arrival and departure date/time.
- As an organizer, I can see who is physically present at any Meal Slot time.

### Meals

- As an organizer, I can configure the time of each Meal Slot for each date.
- As an organizer, I can manually add or remove Meal Slot attendees.
- As an organizer, I can plan a Meal Slot using recipes, a restaurant or a simple food plan.

### Recipes

- As an organizer, I can create, import, edit, copy and delete recipes in a permanent catalogue.
- As an organizer, I can reuse the same recipe in multiple Meal Slots.
- As an organizer, I can see whether a recipe is Assigned or Unassigned.
- As an organizer, I cannot delete a recipe that is still assigned.

### Groceries

- As an organizer, I can see groceries generated only from recipes assigned to the current Overall Event.
- As an organizer, I can identify which Meal Slot and recipe generated each grocery item.
- As an organizer, I can assign grocery items to any Event attendee.
- As an attendee, I can view a grocery list filtered by a selected person.

### Accommodations

- As an organizer, I can activate accommodations for an Overall Event.
- As an organizer, I can assign people to individual sleeping spaces by night.
- As an organizer, I can see unassigned guests and capacity problems.
- As an organizer, I can override default host assignments for a particular night.

### Activities

- As an organizer, I can create an Activity inside an Overall Event.
- As an organizer, I can assign attendees to an Activity.
- As an organizer, I can optionally link an Activity to a Meal Slot.

## 16. Deferred from the current phase

- Authentication and user accounts
- Mine filter
- Shared cloud database
- Shared family media uploads
- Store-based grocery lists
- Shopping runs
- Receipt OCR
- Expenses
- Weather
- Chat
- Push notifications
- AI recommendations
