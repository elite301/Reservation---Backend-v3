# Appointment Scheduler API

This is a simple Express.js API for scheduling appointments. It allows providers to set their schedules, and users to reserve and confirm slots.

## Endpoints

### POST /providers/:providerId/schedule

This endpoint allows a provider to set their schedule. The schedule is set by providing a start and end time. The API will automatically create 15-minute slots within this range.

#### Request Parameters:

- `providerId`: The ID of the provider.

#### Request Body:

- `start`: The start time of the schedule in ISO 8601 format.
- `end`: The end time of the schedule in ISO 8601 format.

#### Response:

A message indicating that the schedule was saved.

### GET /slots

This endpoint retrieves all available appointment slots.

#### Response:

An array of available slots. Each slot includes the provider ID, the time of the slot, and a reserved flag.

### POST /slots/:slotId/reserve

This endpoint allows a user to reserve a slot. Once a slot is reserved, it will be held for 30 minutes. If it is not confirmed within this time, it will become available again.

#### Request Parameters:

- `slotId`: The ID of the slot to reserve.

#### Response:

A message indicating that the slot was reserved and the reservation ID.

### POST /reservations/:reservationId/confirm

This endpoint allows a user to confirm a reservation. Once a reservation is confirmed, it will be held for 1 year.

#### Request Parameters:

- `reservationId`: The ID of the reservation to confirm.

#### Response:

A message indicating that the reservation was confirmed.