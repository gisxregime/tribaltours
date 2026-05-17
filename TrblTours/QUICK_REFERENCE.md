# Quick Reference - Booking Workflow

## State Machine

```
pending --[Accept]--> accepted --[Confirm Date]--> schedule_confirmed --[Pay]--> paid --[Complete]--> completed
   |
   +--[Decline]--> declined
```

## Button Visibility by State

| State | Tourist | Guide |
|-------|---------|-------|
| **pending** | View | Accept • Decline |
| **accepted** | View | "Awaiting schedule confirmation" |
| **schedule_confirmed** | View | "Awaiting payment" |
| **paid** | View • Mark Completed | "Ready to complete" |
| **completed** | View • Rate | "Completed ✓" |
| **declined** | View | "Cancelled" |

## Key Endpoints

### Tourist Workspace
- `PATCH /tourist/bookings/{id}/accept` - Accept booking
- `PATCH /tourist/bookings/{id}/decline` - Decline booking
- `POST /tourist/bookings/{id}/set-date` - Confirm schedule with date/time
- `POST /tourist/payment/success` - Mark payment received
- `PATCH /tourist/bookings/{id}/complete` - Mark tour completed

### Guide Workspace
- `PATCH /guide/booking-requests/{id}/accept` - Accept booking
- `PATCH /guide/booking-requests/{id}/decline` - Decline booking

## Date/Time Fields in Booking Payload

```json
{
  "tourDate": "Jun 15, 2026",        // Formatted for display
  "tourTime": "9:00 AM",              // Formatted for display
  "tourDateRaw": "2026-06-15",        // For form inputs (YYYY-MM-DD)
  "tourTimeRaw": "09:00",             // For form inputs (HH:MM)
  "hasBookingSchedule": true,         // Boolean: has both date and time
  "tourDateFormatted": "Jun 15, 2026" // Alternative formatted field
}
```

## Validation Rules

✅ Can only accept if booking_status = 'pending'
✅ Can only decline if booking_status = 'pending'
✅ Can only confirm schedule if booking_status = 'accepted' AND has date/time
✅ Can only mark completed if payment_status = 'paid' AND tour_date AND tour_time

## Action Flags in Payload

```json
{
  "canAccept": false,              // Should show Accept button
  "canDecline": false,             // Should show Decline button
  "canConfirmSchedule": true,      // Should show Confirm Schedule button
  "canPay": false,                 // Can proceed to payment
  "canMarkCompleted": false        // Can mark as completed
}
```

## Code Locations

### Models
- `app/Models/Booking.php` - Core booking with state methods
- `app/Models/Conversation.php` - Booking relationship added

### Controllers
- `app/Http/Controllers/Tourist/BookingController.php` - Tourist actions
- `app/Http/Controllers/Guide/BookingRequestController.php` - Guide actions

### Services
- `app/Services/BookingStateManager.php` - Centralized state logic

### Frontend
- `public/assets/app.js` - Tourist workspace UI
- `public/assets/guide.js` - Guide workspace UI

### Database
- `database/migrations/2026_05_17_160000_restructure_booking_workflow.php` - Migration

## Critical: Run Migration First

```bash
php artisan migrate
```

This adds columns: conversation_id, tour_date, tour_time, schedule_confirmed_at

## Event Broadcasting

On every booking_status change:
1. Event emitted: `BookingStatusUpdated`
2. Broadcast via Pusher to both workspaces
3. Notification sent to both parties

## Real-time Sync

Both workspaces listen for:
- `booking.updated` events
- Automatically refresh booking lists when events received
- Push notifications to users

## "Date not set" Display

- Appears when `tour_date` is null
- Replaces old "Jan 1, 1970" bug
- Methods: `getTourDateFormatted()`, `getTourTimeFormatted()`

## Testing Workflow

1. Create booking → pending
2. Guide accepts → accepted  
3. Tourist sets date in Messages → schedule_confirmed
4. Tourist pays → paid
5. Click Mark Completed → completed

## Backward Compatibility

Old fields still work:
- `booked_for_date` / `booked_for_time` → Mapped to `tour_date` / `tour_time`
- `status` field → Falls back to if `booking_status` not set
- Schema guards prevent errors for old code

## Messages Integration (TODO)

Add [Confirm Schedule] button in conversation:
- Opens modal with date/time pickers
- Calls: `POST /tourist/bookings/{id}/set-date` with tour_date, tour_time
- Updates booking_status to schedule_confirmed
- Syncs to guide workspace
