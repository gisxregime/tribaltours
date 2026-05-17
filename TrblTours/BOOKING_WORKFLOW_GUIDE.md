# Booking Workflow Restructure - Complete Implementation Guide

## Overview
This document describes the complete booking workflow fix implemented for the TrblTours application. The workflow separates payment status from scheduling and implements a proper state machine.

## State Machine Diagram

```
PENDING
├─> ACCEPTED (Guide accepts booking)
│   └─> SCHEDULE_CONFIRMED (Tourist confirms date/time in Messages)
│       └─> WAITING_PAYMENT (Awaiting payment from tourist)
│           └─> PAID (Payment received)
│               └─> COMPLETED (After tour date passes)
├─> DECLINED (Guide or Tourist declines)
└─> CANCELLED (Either party cancels)
```

## Database Schema Changes

### New Columns Added to `bookings` table:
- `conversation_id` (FK) - Link to conversation thread
- `tour_date` (DATE) - Tour scheduled date
- `tour_time` (VARCHAR) - Tour scheduled time (HH:MM format)
- `schedule_confirmed_at` (TIMESTAMP) - When schedule was confirmed
- `booking_status` (ENUM) - Primary state tracker

### Enum Values:
```sql
booking_status: pending, accepted, schedule_confirmed, waiting_payment, paid, completed, declined, cancelled
payment_status: unpaid, paid (simplified from unpaid, partial, paid, refunded)
```

### Migration File:
Location: `/database/migrations/2026_05_17_160000_restructure_booking_workflow.php`

Run migration with:
```bash
php artisan migrate
```

## Backend Implementation

### 1. Core Models

#### Booking Model (`app/Models/Booking.php`)
**New Methods:**
```php
canAccept(): bool          // Can only accept if pending
canDecline(): bool         // Can only decline if pending
canConfirmSchedule(): bool // Must be accepted + have date/time
canPay(): bool             // Must have schedule + date/time
canMarkCompleted(): bool   // Must be paid + have date/time
getTourDateFormatted(): string  // Returns "Date not set" for null
getTourTimeFormatted(): string  // Returns "Time not set" for null
```

**New Relationship:**
```php
public function conversation(): BelongsTo
```

### 2. Service Layer

#### BookingStateManager (`app/Services/BookingStateManager.php`)
Centralized state machine logic:
```php
getValidNextStates(string $currentState): array
transitionTo(Booking $booking, string $newState): bool
syncStateFromPaymentAndSchedule(Booking $booking): void
notifyStateChange(Booking $booking, string $previousState): void
```

### 3. API Endpoints

#### Tourist Workspace (`/tourist` routes):

| Method | Endpoint | Action |
|--------|----------|--------|
| PATCH | `/bookings/{booking}/accept` | Accept booking |
| PATCH | `/bookings/{booking}/decline` | Decline booking |
| POST | `/bookings/{booking}/set-date` | Confirm schedule (from Messages) |
| POST | `/payment/success` | Mark payment as received |
| PATCH | `/bookings/{booking}/transition` | Generic transition handler |

**Example Request - Accept Booking:**
```json
PATCH /tourist/bookings/{id}/accept
{
  // No body required
}

Response:
{
  "ok": true,
  "booking": { ... with updated bookingStatus: "accepted" ... }
}
```

**Example Request - Confirm Schedule:**
```json
POST /tourist/bookings/{id}/set-date
{
  "tour_date": "2026-06-15",
  "tour_time": "09:00"
}

Response:
{
  "ok": true,
  "booking": { 
    "bookingStatus": "schedule_confirmed",
    "tourDate": "Jun 15, 2026",
    "tourTime": "9:00 AM"
  }
}
```

#### Guide Workspace (`/guide` routes):

| Method | Endpoint | Action |
|--------|----------|--------|
| PATCH | `/booking-requests/{booking}/accept` | Accept booking |
| PATCH | `/booking-requests/{booking}/decline` | Decline booking |

### 4. Booking Payload Structure

Both Tourist and Guide endpoints return standardized booking payloads:

```json
{
  "id": "123",
  "bookingStatus": "accepted",           // NEW: Primary state
  "tourDate": "Jun 15, 2026",            // NEW: Formatted date
  "tourTime": "9:00 AM",                 // NEW: Formatted time
  "tourDateRaw": "2026-06-15",           // NEW: Raw date for inputs
  "tourTimeRaw": "09:00",                // NEW: Raw time for inputs
  "hasBookingSchedule": true,            // NEW: Boolean check
  "canAccept": false,                    // NEW: Action flag
  "canDecline": false,                   // NEW: Action flag
  "canConfirmSchedule": true,            // NEW: Action flag
  "canPay": true,                        // NEW: Action flag
  "canMarkCompleted": false,             // NEW: Action flag
  "paymentStatus": "unpaid",
  "status": "accepted",
  "total": 2500,
  "reference": "TRBL-XXXXXXXXXXX"
}
```

## Frontend Implementation

### 1. Tourist Workspace (`public/assets/app.js`)

#### Changes Made:

**a) Date Display Fix:**
```javascript
// OLD: formatBookingScheduleLabel() returned "To be confirmed" for null dates
// NEW: Uses tourDate/tourTime fields, returns "Date not set" for null
```

**b) Removed Date Picker:**
- Removed `<form data-booking-date-form>` with date/time inputs
- Removed corresponding event listeners
- Date/time confirmation now ONLY in Messages

**c) Button Visibility:**
```
Pending Bookings:
  - Show: Receipt, Cancel buttons
  
Booked (Accepted):
  - Show: Receipt, Mark Completed (disabled if no payment/schedule)
  - Status: "Awaiting Payment" or "Waiting for confirmation"
  
Completed:
  - Show: Rate & Review button
```

#### Still TODO (Frontend):

**d) Messages Integration:**
Need to add in Messages UI:
```html
<!-- Inside conversation thread -->
<div class="booking-schedule-confirmation" data-booking-id="123">
  <button class="btn-primary" data-confirm-schedule>
    [Confirm Tour Schedule]
  </button>
</div>

<!-- Modal for date/time input -->
<div class="modal" data-booking-schedule-modal>
  <input type="date" name="tour_date" />
  <input type="time" name="tour_time" />
  <button type="submit">Confirm Schedule</button>
</div>
```

When submitted, call:
```javascript
POST /tourist/booking/set-date {
  "booking_id": "123",
  "tour_date": "2026-06-15",
  "tour_time": "09:00"
}
```

### 2. Guide Workspace (`public/assets/guide.js`)

#### Changes Completed:
- Removed all date/time input forms
- Removed "Reschedule Date" and "Confirm Date" buttons
- Read-only display of tour schedule

#### Still TODO:

**a) Button Visibility by Status:**
```javascript
if (booking.bookingStatus === 'pending') {
  // Show: Accept, Decline buttons
}
else if (booking.bookingStatus === 'accepted') {
  // Show: "Accepted" status, no action buttons
}
else if (booking.bookingStatus === 'schedule_confirmed') {
  // Show: "Awaiting Payment" status
}
else if (booking.bookingStatus === 'paid') {
  // Show: Mark Completed button
}
else if (booking.bookingStatus === 'completed') {
  // Show: Complete badge
}
```

**b) Event Handlers:**
```javascript
// Accept booking
document.on('click', '[data-accept-booking]', function(e) {
  const bookingId = e.target.dataset.acceptBooking;
  apiRequest(`/guide/booking-requests/${bookingId}/accept`, {
    method: 'PATCH'
  }).then(syncBookings);
});

// Decline booking
document.on('click', '[data-decline-booking]', function(e) {
  const bookingId = e.target.dataset.declineBooking;
  apiRequest(`/guide/booking-requests/${bookingId}/decline`, {
    method: 'PATCH'
  }).then(syncBookings);
});
```

## Validation Rules Implemented

✅ **In Booking Model:**
- Can't accept a booking that's not pending
- Can't decline a booking that's not pending
- Can't confirm schedule without date/time
- Can't mark completed without payment + date/time

✅ **In Controllers:**
- Check payment_status = 'paid' for completion
- Validate date/time format before saving
- Prevent duplicate bookings via client token
- Auto-create booking from tour_request if missing

✅ **In Database:**
- Timestamp fields track when states were reached
- Foreign keys ensure referential integrity
- Index on (guide_id, status) for queries

## Sync Requirements

Every booking update triggers:
1. `BookingStatusUpdated` event emitted
2. Event broadcasts via Pusher to:
   - Tourist workspace (My Bookings)
   - Guide workspace (Booking Requests)
   - Messages thread (display updated status)
3. DomainNotification sent to both parties

```php
event(new BookingStatusUpdated($booking->fresh(['guide', 'tourListing'])));
```

## Common Workflows

### Happy Path: Complete Booking

1. **Tourist creates booking** (POST /bookings)
   - Status: pending
   - Notification sent to guide

2. **Guide accepts booking** (PATCH /bookings/{id}/accept)
   - Status: accepted
   - Notification sent to tourist

3. **Tourist confirms schedule** (POST /bookings/{id}/set-date via Messages)
   - Status: schedule_confirmed
   - tour_date and tour_time populated
   - Notification sent to guide

4. **Tourist pays** (POST /payment/success)
   - payment_status: paid
   - Status auto-transitions to paid
   - Notification sent to guide

5. **After tour date** (Tourist marks completed)
   - Status: completed
   - tour completion recorded

### Alternative: Guide Declines

1. **Guide declines booking** (PATCH /booking-requests/{id}/decline)
   - Status: declined
   - Card moves to "Cancelled" section
   - Notification sent to tourist

## Error Handling

### Common Errors Handled:

| Error | HTTP Status | Cause |
|-------|-------------|-------|
| "Cannot accept non-pending booking" | 422 | Invalid state transition |
| "Date and time are required" | 422 | Missing schedule fields |
| "Cannot complete without payment" | 422 | Missing paid status |
| "No booking found for this request" | 404 | Booking doesn't exist |
| "This booking cannot be accessed" | 403 | Authorization check failed |

## Testing Checklist

- [ ] Create booking → Status = pending
- [ ] Guide accepts → Status = accepted
- [ ] Tourist sets date/time → Status = schedule_confirmed
- [ ] Tourist pays → Status = paid
- [ ] Date passes → Can mark completed
- [ ] Payment sync works → Both workspaces update
- [ ] Declining works → Card moves to cancelled
- [ ] Date display shows "Date not set" for null dates
- [ ] Button visibility matches status
- [ ] All notifications deliver

## Deployment Steps

1. Backup database
2. Run migration: `php artisan migrate`
3. Clear cache: `php artisan cache:clear`
4. Update frontend code (guide.js, app.js messages section)
5. Publish events: `php artisan queue:work` (if using queues)
6. Monitor logs for issues
7. Test complete workflow in staging

## Future Enhancements

- [ ] Add booking status history/audit trail
- [ ] Implement automatic completion after tour date
- [ ] Add rescheduling workflow (decline + create new)
- [ ] Booking cancellation with refund logic
- [ ] Rating/review system integration
- [ ] SMS/Email notifications for state changes
