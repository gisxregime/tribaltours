# Tour Listing Feature Implementation

## Overview
Implementation of comprehensive tour creation, listing, viewing, and booking workflow across Guide and Tourist workspaces.

## Philippine Regions (18 total)
1. Region I – Ilocos Region
2. Region II – Cagayan Valley
3. Region III – Central Luzon
4. CAR – Cordillera Administrative Region
5. Region IV-A – CALABARZON
6. MIMAROPA – Mindoro, Marinduque, Romblon, Palawan
7. Region V – Bicol Region
8. Region VI – Western Visayas
9. Region VII – Central Visayas
10. Region VIII – Eastern Visayas
11. Region IX – Zamboanga Peninsula
12. Region X – Northern Mindanao
13. Region XI – Davao Region
14. Region XII – SOCCSKSARGEN
15. Region XIII – Caraga
16. ARMM – Autonomous Region in Muslim Mindanao
17. NCR – National Capital Region
18. BARMM – Bangsamoro Autonomous Region in Muslim Mindanao

## Key Fields to Include
- Tour Title (required)
- Short Description (required)
- Tour Category (dropdown)
- Tour Duration (text field)
- Region (dropdown - 18 provinces)
- City / Municipality (text field)
- Specific Meeting Area (text field)
- Meeting Point (text field)
- Base Price (number)
- Per person or Per group (dropdown)
- Minimum Guests (number)
- Maximum Guests (number)
- Available Time Slots (comma separated)
- Reservation Type (instant or manual approval)
- Languages Spoken (comma separated)
- Tour Includes (textarea/list)
- Tour Excludes (textarea/list)
- Requirements / Reminders (textarea)
- Safety Information (textarea)
- Images (3-5 with drag & drop)

## Fields to Remove
- Guest Type Support
- Difficulty Level
- Activity Tags
- Weather Suitability
- Best Season
- Child Friendly
- Pet Friendly
- Cancellation settings
- Guide photo fields
- Provider/Guide info fields
- Status field
- Reserve Now Pay Later

## Reservation Type Logic
- **Instant Booking**: Booking confirmed immediately after payment/reservation
  - Shows status: Confirmed in My Bookings
  - Guide notified instantly
- **Manual Approval**: Booking requires guide approval
  - Shows status: Pending Approval in Tourist's My Bookings
  - Guide receives booking request in Guide Workspace
  - Guide can approve or reject
  - Status updates reflected in Tourist's My Bookings

## Database Fields Used
From existing TourListing table:
- guide_id
- title
- short_description
- category
- province (Regions)
- city
- meeting_area
- meeting_point
- duration_label
- min_guests, max_guests
- price, price_type
- reservation_type
- languages
- includes (JSON array)
- excludes (text)
- requirements
- safety_info
- cover_image_path
- gallery_paths (JSON array)
- status
- is_active
- published_at

## API Endpoints Needed
### Guide Workspace
- POST /guide/tours - Create listing
- GET /guide/tours - List user's tours
- PUT /guide/tours/{id} - Update listing
- DELETE /guide/tours/{id} - Delete listing

### Tourist Workspace
- GET /tourist/tours/explore - Browse all active tours
- GET /tourist/tours/{id} - View tour details
- POST /tourist/bookings/create-from-listing - Create booking from tour

### Shared
- GET /tour-preview/{id} - Public tour preview (no auth required)

## Frontend Changes
### Guide Workspace (guide.js)
- Update form field mapping to exclude removed fields
- Add 18 region dropdown
- Update validation to match new required fields
- Update buildPayload() function
- Update applyPayloadToForm() function

### Tourist Workspace (app.js)
- Create Explore Tours page rendering
- Create View Tour detail page
- Update My Bookings logic:
  - If reservation_type = instant: Show as Confirmed after payment
  - If reservation_type = manual: Show as Pending Approval, waiting for guide approval

## Implementation Steps
1. ✅ Document all fields and requirements
2. Update form HTML to include new fields and remove old ones
3. Add Philippine regions data to constants or database seed
4. Update guide.js form logic
5. Update TourListingController API methods
6. Create Explore Tours page component
7. Create View Tour detail page component
8. Update My Bookings booking creation logic
9. Test complete workflow

## Validation Rules
- Title: Required, max 255 chars
- Short Description: Required, min 20 chars
- Category: Required
- Duration: Required
- Region: Required (must be one of 18)
- City: Required
- Meeting Area: Required
- Meeting Point: Required
- Price: Required, >= 1
- Min Guests: >= 1
- Max Guests: >= Min Guests
- Time Slots: At least 1 required
- Images: 3-5 required
- Languages: Required
