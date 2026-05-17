# Tour Listing Feature - Complete Implementation Checklist

## Phase 1: Database & Model Updates

### ✅ Step 1.1: Verify TourListing Model Fields
**Status:** Review Required
- [x] Model at `app/Models/TourListing.php` exists
- [ ] Verify all required fields in `$fillable` array:
  - title, short_description, category, province (as region), city, meeting_area, meeting_point, duration_label
  - min_guests, max_guests, price, price_type, reservation_type (NEW)
  - languages, includes, excludes, requirements, safety_info
  - cover_image_path, gallery_paths, status, is_active
- [ ] Add `$casts` for JSON columns: `includes => array, gallery_paths => array`
- [ ] Add `$casts` for enum columns if using Laravel 11+ enums

### ✅ Step 1.2: Create Database Migration for time_slots
**File:** `database/migrations/2026_XX_XX_XXXXXX_add_time_slots_to_tour_listings.php`
```php
Schema::table('tour_listings', function (Blueprint $table) {
    $table->json('time_slots_json')->nullable()->after('duration_label');
    // or for text field: $table->text('time_slots_text')->nullable();
});
```

## Phase 2: Update Form HTML (Guide Workspace)

### [ ] Step 2.1: Update tours.blade.php (lines 85-243)
**File:** `resources/views/legacy/pages/tours.blade.php`
- [ ] Replace entire form with NEW form from `UPDATED_TOUR_FORM.html`
- [ ] Remove fields: Guest Type checkboxes, Difficulty, Tags, Weather, Best Season, Child/Pet Friendly
- [ ] Add field: Region dropdown (18 Philippine regions)
- [ ] Rename field: "Tour Description" → "Short Description" + adjust field ID
- [ ] Update field ID: "tourProvince" → "tourRegion" with proper options
- [ ] Update input IDs for all fields to match guide.js mapping
- [ ] Verify all field labels match specification

### [ ] Step 2.2: Verify Form Field IDs Match guide.js
**File:** `public/assets/guide.js`
- [ ] tourTitle ✓
- [ ] tourShortDescription ✓ (renamed from tourDescription)
- [ ] tourCategory ✓
- [ ] tourDuration ✓
- [ ] tourRegion ✓ (NEW - replaces tourProvince)
- [ ] tourCity ✓
- [ ] tourMeetingArea ✓
- [ ] tourMeetingPoint ✓
- [ ] tourPrice ✓
- [ ] tourPriceType ✓
- [ ] tourMinGuests ✓
- [ ] tourMaxGuests ✓
- [ ] tourTimeSlots ✓
- [ ] tourReservationType ✓ (NEW)
- [ ] tourLanguages ✓
- [ ] tourIncludes ✓
- [ ] tourExcludes ✓
- [ ] tourRequirements ✓
- [ ] tourSafetyInfo ✓
- [ ] tourImages ✓
- [ ] tourImagePreview ✓
- [ ] tourImageMeta ✓
- [ ] tourClearImages ✓

## Phase 3: Update guide.js Form Logic

### [ ] Step 3.1: Update fields object in initToursPage()
**File:** `public/assets/guide.js` (around line 2367)
- [ ] Replace fields object with code from `GUIDE_JS_FORM_UPDATES.js`
- [ ] Remove guest type checkboxes from fields mapping
- [ ] Add tourRegion field

### [ ] Step 3.2: Remove guest type functions
**File:** `public/assets/guide.js`
- [ ] Delete `selectedGuestTypes()` function
- [ ] Delete `setGuestTypes()` function
- [ ] Remove any references to guest types in form initialization

### [ ] Step 3.3: Update buildPayload() function
**File:** `public/assets/guide.js`
- [ ] Use code from `GUIDE_JS_FORM_UPDATES.js`
- [ ] Add region → province mapping
- [ ] Remove difficulty, tags, weather, bestSeason, childFriendly, petFriendly fields
- [ ] Ensure time_slots parsed as array

### [ ] Step 3.4: Update validatePayload() function
**File:** `public/assets/guide.js`
- [ ] Use validation rules from `GUIDE_JS_FORM_UPDATES.js`
- [ ] Add region validation (required, one of 18 regions)
- [ ] Add time slots validation (min 1 slot)
- [ ] Add image count validation (3-5 required)
- [ ] Update min guest/max guest validation logic

### [ ] Step 3.5: Update applyPayloadToForm() function
**File:** `public/assets/guide.js`
- [ ] Use updated mapping from `GUIDE_JS_FORM_UPDATES.js`
- [ ] Map region field from tour.region or tour.province
- [ ] Parse time_slots array to comma-separated string

### [ ] Step 3.6: Update clearForm() function
**File:** `public/assets/guide.js`
- [ ] Remove any guest type field resets
- [ ] Ensure all new fields are cleared properly

## Phase 4: Update TourListingController

### [ ] Step 4.1: Update validateListingPayload() method
**File:** `app/Http/Controllers/Guide/TourListingController.php`
- [ ] Use validation rules from `TOUR_CONTROLLER_METHODS.php`
- [ ] Add region & reservation_type validation
- [ ] Remove difficulty, tags, weather, etc. validation
- [ ] Add time_slots as required field

### [ ] Step 4.2: Update mapListingPayload() method
**File:** `app/Http/Controllers/Guide/TourListingController.php`
- [ ] Use mapping logic from `TOUR_CONTROLLER_METHODS.php`
- [ ] Map region → province for database storage
- [ ] Add reservation_type mapping
- [ ] Store time_slots as JSON

### [ ] Step 4.3: Update presentListing() method
**File:** `app/Http/Controllers/Guide/TourListingController.php`
- [ ] Use response format from `TOUR_CONTROLLER_METHODS.php`
- [ ] Return region (from province)
- [ ] Return reservation_type
- [ ] Parse time_slots as array in response
- [ ] Remove difficulty, tags, weather from response

## Phase 5: Tourist-Facing API Endpoints

### [ ] Step 5.1: Create TouristTourController
**File:** `app/Http/Controllers/Tourist/TourController.php` (NEW)
```php
namespace App\Http\Controllers\Tourist;

class TourController extends Controller
{
    // GET /tourist/tours/explore - List all published tours
    public function explore(Request $request): JsonResponse
    {
        $limit = $request->integer('limit', 50);
        $skip = $request->integer('skip', 0);
        
        $tours = TourListing::query()
            ->where('status', 'published')
            ->where('is_active', true)
            ->with('guide')
            ->latest()
            ->skip($skip)
            ->limit($limit)
            ->get();
        
        return response()->json(['tours' => $tours->map(...)]);
    }
    
    // GET /tourist/tours/{id} - Get single tour details
    public function show(TourListing $tourListing): JsonResponse
    {
        abort_unless($tourListing->status === 'published' && $tourListing->is_active, 404);
        
        return response()->json(['tour' => $this->presentTour($tourListing)]);
    }
}
```

### [ ] Step 5.2: Define Routes
**File:** `routes/tourist.php`
```php
Route::middleware('auth')->group(function () {
    // ... existing routes ...
    
    Route::prefix('tours')->group(function () {
        Route::get('/explore', 'TourController@explore');  // Browse tours (no auth required)
        Route::get('/{tourListing}', 'TourController@show');  // View tour details
    });
});
```

**File:** `routes/web.php`
```php
// Public tour preview (no auth required)
Route::get('/tour-preview/{tourListing}', 'TourController@preview');
```

## Phase 6: Update Booking Controller

### [ ] Step 6.1: Add createFromListing() endpoint
**File:** `app/Http/Controllers/Tourist/BookingController.php`
- [ ] Use code from `BOOKING_RESERVATION_TYPE_LOGIC.php`
- [ ] Validate tour listing exists and is active
- [ ] Check guest count against min/max
- [ ] Create booking with appropriate initial status based on reservation_type
- [ ] Send notifications to guide
- [ ] Broadcast BookingStatusUpdated event

### [ ] Step 6.2: Update store() method
**File:** `app/Http/Controllers/Tourist/BookingController.php`
- [ ] Add logic to check reservation_type from tour listing
- [ ] Set initial status to 'pending' if manual, 'accepted' if instant
- [ ] Send appropriate notification to guide

### [ ] Step 6.3: Add Guide Approval Endpoints
**File:** `app/Http/Controllers/Guide/BookingRequestController.php`
- [ ] Add `acceptBooking()` method for manual approval bookings
- [ ] Add `declineBooking()` method for manual rejection
- [ ] Check reservation_type before allowing approval/rejection
- [ ] Send notifications to tourist on status change

## Phase 7: Create Tourist Frontend Pages

### [ ] Step 7.1: Create Explore Tours Page
**File:** `resources/views/legacy/pages/explore-tours.blade.php`
- [ ] Use HTML from `EXPLORE_TOURS_BLADE.html`
- [ ] Include filters: search, category, region, sort
- [ ] Display tour cards with: image, title, short description, price, location, duration
- [ ] Add "View Tour" button to each card

### [ ] Step 7.2: Create Tour Detail Page
**File:** `resources/views/legacy/pages/tour-detail.blade.php` (NEW)
- [ ] Display full tour information in organized sections
- [ ] Show gallery images with lightbox/click-to-enlarge
- [ ] Display all fields: title, category, duration, location, pricing, availability
- [ ] Show "Book Now" button that opens booking form
- [ ] Display guide information and reviews

### [ ] Step 7.3: Update app.js with new page handlers
**File:** `public/assets/app.js`
- [ ] Add `initExploreTours()` function (from `TOURIST_EXPLORE_IMPLEMENTATION.js`)
- [ ] Add `initTourDetail()` function (from `TOURIST_EXPLORE_IMPLEMENTATION.js`)
- [ ] Call these functions in document initialization
- [ ] Add event listeners for filtering and sorting

## Phase 8: Update My Bookings Display

### [ ] Step 8.1: Update booking status display logic
**File:** `public/assets/app.js` - `renderDbBookings()` function
- [ ] Check reservation_type from booking.tourListing
- [ ] If manual and status is 'pending': Show "Awaiting Guide Approval" badge
- [ ] If instant and status is 'accepted': Show "Confirmed" badge
- [ ] Show guide approval/rejection buttons in Guide workspace for pending bookings

### [ ] Step 8.2: Update booking state machine
**File:** `app/Models/Booking.php`
- [ ] Update state validation methods to account for reservation_type
- [ ] Add logic: Manual approval bookings can only transition from 'pending' → 'accepted'/'declined'
- [ ] Ensure instant booking bypasses manual approval step

## Phase 9: Create Navigation & Routes

### [ ] Step 9.1: Add routes
**File:** `routes/tourist.php`
```php
Route::get('/explore-tours', function () {
    return view('legacy.pages.explore-tours');
})->name('tourist.explore-tours');

Route::get('/tour/{tourListing}', function ($tourListing) {
    return view('legacy.pages.tour-detail');
})->name('tourist.tour-detail');
```

**File:** `routes/guide.php`
```php
// Update booking approval routes
Route::post('/bookings/{booking}/approve', 'BookingRequestController@approve')->name('bookings.approve');
Route::post('/bookings/{booking}/reject', 'BookingRequestController@reject')->name('bookings.reject');
```

### [ ] Step 9.2: Update navigation links
**File:** `resources/views/legacy/pages/*.blade.php`
- [ ] Add "Explore Tours" link in tourist navbar
- [ ] Add "My Bookings" link in tourist navbar
- [ ] Add "Booking Requests" section in guide dashboard for pending approvals

## Phase 10: Testing & Validation

### [ ] Step 10.1: Test Tour Creation (Guide Workspace)
- [ ] Create new tour with all 20 required fields
- [ ] Upload 3-5 images
- [ ] Select region from dropdown
- [ ] Set reservation type to "instant"
- [ ] Publish and verify in database
- [ ] Edit tour and verify all fields save correctly

### [ ] Step 10.2: Test Tour Display (Tourist Workspace)
- [ ] Navigate to Explore Tours page
- [ ] Verify all published tours display with correct information
- [ ] Test filtering by category, region, search
- [ ] Test sorting (price, rating, latest)
- [ ] Click on tour to view details
- [ ] Verify all fields display correctly on detail page

### [ ] Step 10.3: Test Instant Booking Flow
- [ ] Book tour with instant reservation type
- [ ] Verify booking status is "confirmed" immediately
- [ ] Verify guide receives notification
- [ ] Verify booking appears in both tourist and guide "My Bookings"
- [ ] Test complete payment flow

### [ ] Step 10.4: Test Manual Approval Flow
- [ ] Create new tour with "Manual Approval" reservation type
- [ ] Book tour as tourist
- [ ] Verify booking status is "pending approval"
- [ ] Verify guide sees booking in "Pending Approvals" section
- [ ] Guide approves booking
- [ ] Verify tourist sees status update to "confirmed"
- [ ] Guide rejects booking
- [ ] Verify tourist sees status update to "rejected"

### [ ] Step 10.5: Test Data Persistence
- [ ] Verify all tour fields persist in database
- [ ] Verify images are properly stored and retrieved
- [ ] Verify time slots stored and displayed correctly
- [ ] Verify reservation type drives booking behavior correctly

### [ ] Step 10.6: Test Earnings Logic
- [ ] Verify paid instant bookings count toward guide earnings
- [ ] Verify pending/unpaid bookings don't count
- [ ] Verify declined manual bookings don't count
- [ ] Verify cancelled bookings are excluded from earnings

## Phase 11: Migration & Deployment

### [ ] Step 11.1: Run Database Migration
```bash
php artisan migrate
```

### [ ] Step 11.2: Seed Initial Data (Optional)
```bash
php artisan db:seed --class=RegionSeeder
```

### [ ] Step 11.3: Clear Caches
```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

### [ ] Step 11.4: Verify Application
- [ ] Check no errors in Laravel logs
- [ ] Verify Pusher events still broadcast correctly
- [ ] Test cross-workspace synchronization

## Critical Implementation Notes

1. **Reservation Type Flows:**
   - INSTANT: Booking confirmed immediately → payment → schedule confirmation
   - MANUAL: Booking pending → guide approval → payment → schedule confirmation

2. **Database Consistency:**
   - Store region value in `province` column for backward compatibility
   - Return `region` key in JSON responses
   - Time slots stored as JSON array in database

3. **State Machine:**
   - Pending approval bookings can only transition from 'pending' → 'accepted'/'declined'
   - Don't skip manual approval step even if guide tries to set schedule

4. **Validation:**
   - Min/max guests must be validated
   - At least 1 time slot required
   - 3-5 images required for publication
   - Region must be one of 18 valid Philippine regions

5. **Notifications:**
   - Send 'booking.pending_approval' for manual bookings
   - Send 'booking.submitted' for instant bookings
   - Update tourist when guide approves/rejects

## Related Files Already Created
- ✅ UPDATED_TOUR_FORM.html - Form HTML replacement
- ✅ GUIDE_JS_FORM_UPDATES.js - guide.js field and function updates
- ✅ TOUR_CONTROLLER_METHODS.php - TourListingController method updates
- ✅ BOOKING_RESERVATION_TYPE_LOGIC.php - Booking creation with reservation type
- ✅ TOURIST_EXPLORE_IMPLEMENTATION.js - Explore tours and tour detail pages
- ✅ EXPLORE_TOURS_BLADE.html - Explore tours Blade template
- ✅ TOUR_LISTING_IMPLEMENTATION.md - Overview documentation

## Next Steps
1. Follow this checklist in order
2. Reference provided code examples for each section
3. Test each phase before moving to next
4. Verify cross-workspace synchronization works
5. Complete end-to-end workflow testing
