# Tribaltours Laravel 12 Architecture

## Project Structure

- `app/Http/Controllers/Admin/*`
- `app/Http/Controllers/Guide/*`
- `app/Http/Controllers/Tourist/*`
- `app/Http/Controllers/Auth/*`
- `app/Http/Middleware/RoleMiddleware.php`
- `app/Models/*`
- `database/migrations/*`
- `database/seeders/DatabaseSeeder.php`
- `public/assets/*`
- `public/images/*`
- `resources/views/layouts/*`
- `resources/views/components/*`
- `resources/views/partials/*`
- `resources/views/legacy/*` (converted static pages to Blade)
- `routes/web.php`, `routes/legacy.php`, `routes/tourist.php`, `routes/guide.php`, `routes/admin.php`

## Route Structure

- Public/Legacy UI routes:
  - `/index.html`, `/explore.html`, `/sign-in.html`, etc.
  - `/pages/dashboard.html`, `/pages/tours.html`, etc.
- Authentication:
  - Breeze auth routes in `routes/auth.php`
  - Multi-step registration: `/register/step/{step}`
  - OTP structure: `/otp/issue`, `/otp/verify`
- Tourist module (`role:tourist`):
  - `/tourist/requests`
  - `/tourist/bookings`
  - `/tourist/favorites`
  - `/tourist/messages`
- Guide module (`role:guide`):
  - `/guide/dashboard`
  - `/guide/earnings`
  - `/guide/tours`
  - `/guide/booking-requests`
  - `/guide/availabilities`
- Admin module (`role:admin`):
  - `/admin/dashboard`
  - `/admin/guide-verifications`
  - `/admin/reports`
  - `/admin/users`

## Database Schema (Implemented)

- `users` (role-aware: tourist/guide/admin + profile + verification metadata)
- `tour_listings`
- `tour_requests`
- `bookings`
- `conversations`
- `messages`
- `notifications` (database notifications table)
- `reviews`
- `verification_documents`
- `favorites`
- `availabilities`
- `reports`
- `otp_verifications`

## Relationship Summary

- User (guide) `hasMany` TourListing
- User (tourist) `hasMany` TourRequest
- Booking `belongsTo` tourist, guide, listing, request
- Conversation `belongsTo` tourist, guide, listing, request
- Message `belongsTo` conversation, sender
- Review `belongsTo` booking, listing, tourist, guide
- VerificationDocument `belongsTo` user, reviewer
- Favorite `belongsTo` tourist, listing
- Availability `belongsTo` guide, listing
- Report `belongsTo` reporter, target user, listing, booking, message, resolver
- OtpVerification `belongsTo` user

## Middleware

- `auth`
- `verified`
- `role:tourist|guide|admin` (custom alias in `bootstrap/app.php`)

## Naming Conventions

- Models: singular PascalCase (`TourListing`, `VerificationDocument`)
- Controllers: role-segmented namespaces (`Guide/TourListingController`)
- Route names: role-prefixed (`guide.tours.index`, `admin.users.index`)
- DB tables: snake_case plural (`tour_listings`, `verification_documents`)
- Foreign keys: `<model>_id` (`tour_listing_id`, `reported_by`)

## API-Ready Notes

- Controllers already use REST resource signatures.
- You can add `api.php` routes with same controllers or dedicated API controllers.
- Existing validation can be moved to Form Requests for cleaner API contracts.
