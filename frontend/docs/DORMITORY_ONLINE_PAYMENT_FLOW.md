# Dormitory System - Online Payment Only Flow

## 📋 Overview

The dormitory system has been updated to support **online payments only**. This document outlines the complete workflow for trainee room requests, admin approval, and payment confirmation.

---

## 🔄 Complete Workflow

### **Step 1: Trainee Submits Room Request**
1. Trainee browses available rooms on the dormitory page
2. Trainee selects check-in and check-out dates
3. Trainee clicks "Send Request" button
4. Payment method modal appears (online payment only)
5. Trainee clicks "Submit Request"
6. Request is created with status: `PENDING`
7. **All other rooms are disabled** (trainee cannot make multiple requests)

### **Step 2: Admin Approves Request**
1. Admin views request in the dormitory requests page
2. Admin clicks "Approve" button
3. System updates request status to: `APPROVED`
4. **Payment link is automatically sent to trainee's email**

### **Step 3: Admin Confirms Payment**
1. After trainee pays via the link
2. Admin verifies payment received
3. Admin clicks "Confirm Payment"
4. System updates tenant status to: `APPROVED` (fully booked)
5. Trainee can now access the room

### **Step 4: Trainee Extends Stay (Optional)**
1. After successful booking, trainee can only request their **own room**
2. Trainee clicks "Extend Stay" on their booked room
3. Trainee selects new check-in/check-out dates
   - Check-in date is auto-set to current check-out date or later
4. Request status changes to: `EXTENDING`
5. Same approval process repeats

---

## 🗂️ Database Schema

### `dormitory_tenants` Table
```php
$table->id();
$table->foreignIdFor(DormitoryRoom::class)->ondelete('cascade');
$table->foreignIdFor(User::class)->ondelete('cascade');
$table->date('tenant_from_date')->nullable();
$table->date('tenant_to_date')->nullable();
$table->enum('tenant_status', ['PENDING', 'TERMINATED', 'APPROVED', 'CANCELLED', 'EXTENDING'])->default('PENDING');
$table->timestamps();
```

### Status Definitions
- **PENDING**: Initial request submitted by trainee, awaiting admin approval
- **APPROVED**: Admin approved and payment link sent, waiting for payment confirmation
- **EXTENDING**: Trainee requested to extend their current stay
- **TERMINATED**: Booking terminated by admin
- **CANCELLED**: Request cancelled

---

## 🔌 API Routes

### **Trainee Routes** (`/api/trainee/dormitory/`)
```php
Route::prefix('/dormitory/')->group(function() {
    Route::get('rooms', [TraineeDormitory::class, 'get_available_rooms']);
    Route::get('my-request', [TraineeDormitory::class, 'get_my_request']);
    Route::post('request', [TraineeDormitory::class, 'submit_request']);
    Route::post('cancel-request/{tenant_id}', [TraineeDormitory::class, 'cancel_request']);
});
```

### **Admin Routes** (`/api/dormitory-admin/requests/`)
```php
Route::prefix('/requests/')->group(function() {
    Route::get('/', [DormitoryController::class, 'get_all_requests']);
    Route::post('{tenant_id}/approve', [DormitoryController::class, 'approve_request']);
    Route::post('{tenant_id}/send-payment-link', [DormitoryController::class, 'send_payment_link']);
    Route::post('{tenant_id}/confirm-payment', [DormitoryController::class, 'confirm_payment']);
    Route::post('{tenant_id}/reject', [DormitoryController::class, 'reject_request']);
});
```

---

## 📊 Expected API Responses

### `GET /trainee/dormitory/rooms`
```json
{
    "rooms": [
        {
            "id": 1,
            "room_name": "Room 101",
            "room_cost": 500.00,
            "room_slot": 10,
            "available_slots": 7,
            "room_status": "ACTIVE"
        }
    ]
}
```

### `GET /trainee/dormitory/my-request`
```json
{
    "request": {
        "id": 1,
        "dormitory_room_id": 1,
        "user_id": 5,
        "tenant_from_date": "2025-10-15",
        "tenant_to_date": "2025-11-15",
        "tenant_status": "PENDING",
        "dormitory_room": {
            "id": 1,
            "room_name": "Room 101",
            "room_cost": 500.00
        }
    }
}
```

### `GET /dormitory-admin/requests`
```json
{
    "requests": [
        {
            "id": 1,
            "dormitory_room_id": 1,
            "user_id": 5,
            "tenant_from_date": "2025-10-15",
            "tenant_to_date": "2025-11-15",
            "tenant_status": "PENDING",
            "user": {
                "fname": "John",
                "lname": "Doe"
            },
            "dormitory_room": {
                "id": 1,
                "room_name": "Room 101",
                "room_cost": 500.00
            }
        }
    ]
}
```

---

## 🎨 Frontend Logic Changes

### **Trainee Dormitory Page** (`src/pages/authenticated/trainee/dormitory/Dormitory.js`)

#### Room Request Rules:
1. **No Active Request**: Trainee can request any available room
2. **PENDING Request**: All rooms disabled, shows "Request Pending" message
3. **EXTENDING Request**: All rooms disabled, shows "Extension Pending" message
4. **APPROVED Booking**: 
   - Only the booked room shows "Extend Stay" button
   - All other rooms are disabled
   - Check-in date auto-set to current check-out date

#### Helper Functions:
```javascript
const hasPendingRequest = () => {
    return userRequest && userRequest.tenant_status === 'PENDING';
};

const hasApprovedBooking = () => {
    return userRequest && userRequest.tenant_status === 'APPROVED';
};

const isExtending = () => {
    return userRequest && userRequest.tenant_status === 'EXTENDING';
};

const canRequestRoom = (room) => {
    if (!userRequest) return true;
    if (hasPendingRequest() || isExtending()) return false;
    if (hasApprovedBooking()) {
        return room.id === userRequest.dormitory_room_id;
    }
    return true;
};
```

### **Admin Request Management** (`src/pages/authenticated/dormitory/dormitory/Request.js`)

#### Action Buttons by Status:
1. **PENDING or EXTENDING**:
   - ✅ "Approve & Send Payment Link" button
   - ❌ "Reject" button

2. **APPROVED (Payment Link Sent)**:
   - 💳 "Confirm Payment" button

3. **Other Statuses**: No actions available

---

## 🚫 Removed Features

1. ❌ **On-hand Payment Option**: Completely removed from UI and flow
2. ❌ **Counter Payment Notification**: No longer needed
3. ❌ **Multiple Simultaneous Requests**: System prevents this at UI level

---

## ✅ Frontend Validation

### Date Validation:
- Check-in date cannot be in the past
- Check-out date must be after check-in date
- For extensions: Check-in must be on or after current check-out date

### Request Validation:
- Trainee can only have ONE active request at a time
- Trainee with approved booking can only extend their current room
- All date inputs are disabled when request is pending/extending

---

## 📧 Email Notifications (Backend Required)

### When Admin Approves Request:
**Subject**: Dormitory Request Approved - Payment Link

**Content**:
```
Dear [Trainee Name],

Your dormitory accommodation request has been approved!

Room: [Room Name]
Check-in: [Date]
Check-out: [Date]
Total Amount: ₱[Amount]

Please complete your payment using the link below:
[Payment Link]

Once payment is confirmed, you will receive your booking confirmation.

Thank you!
```

### When Payment is Confirmed:
**Subject**: Dormitory Booking Confirmed

**Content**:
```
Dear [Trainee Name],

Your dormitory booking has been confirmed!

Room: [Room Name]
Check-in: [Date]
Check-out: [Date]

You can now access your room on the check-in date.

Thank you!
```

---

## 🔧 Backend Implementation Requirements

The backend needs to implement the following controller methods:

### `TraineeDormitory` Controller:
```php
public function get_available_rooms(Request $request)
{
    // Return all active rooms with available slots calculation
    // Calculate: available_slots = room_slot - count(approved tenants)
}

public function get_my_request(Request $request)
{
    // Get authenticated user's latest dormitory tenant record
    // Include dormitory_room relationship
    // Return null if no active request/booking
}

public function submit_request(Request $request)
{
    // Validate: user doesn't have existing PENDING/EXTENDING request
    // Create dormitory_tenant with PENDING or EXTENDING status
    // If extending: check user has APPROVED booking for same room
}

public function cancel_request(Request $request, $tenant_id)
{
    // Update tenant_status to CANCELLED
}
```

### `DormitoryController` Controller:
```php
public function get_all_requests(Request $request)
{
    // Get all tenants with PENDING, APPROVED, EXTENDING status
    // Include user and dormitory_room relationships
}

public function approve_request(Request $request, $tenant_id)
{
    // Update tenant_status to APPROVED
    // Generate payment link
    // Send email with payment link
    // Create dormitory_invoice with PENDING status
}

public function confirm_payment(Request $request, $tenant_id)
{
    // Verify payment received (via payment gateway)
    // Keep tenant_status as APPROVED (this means fully booked)
    // Update dormitory_invoice status to PAID
    // Send confirmation email
}

public function reject_request(Request $request, $tenant_id)
{
    // Update tenant_status to CANCELLED
    // Send rejection email
}
```

---

## 🎯 Key Benefits

1. **Simplified Workflow**: Online-only payment reduces complexity
2. **Better Tracking**: Clear status progression
3. **Prevents Abuse**: One request at a time per trainee
4. **Easy Extensions**: Seamless extension process for existing tenants
5. **Frontend Calculations**: No need for extra database columns
6. **Audit Trail**: All status changes tracked with timestamps

---

## 📝 Notes

- All calculations (available slots, duration, total cost) are done in the **frontend**
- No additional database columns needed
- Status flow is linear and predictable
- Email sending should be handled by Laravel's Mail system
- Payment link generation should integrate with your payment gateway

---

## 🔐 Security Considerations

1. Validate tenant can only cancel/modify their own requests
2. Verify room availability before approval
3. Prevent double-booking via database constraints
4. Sanitize all user inputs
5. Secure payment link generation
6. Verify payment authenticity before confirmation

---

**Last Updated**: October 9, 2025
**Version**: 1.0

