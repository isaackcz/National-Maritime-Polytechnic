# Dormitory System - Backend Requirements & Missing Implementation

This document lists all missing database columns, tables, and API routes required for the dormitory management system frontend.

---

## 📋 **Missing Database Tables**

### 1. **`dormitory_requests` Table** (CRITICAL - NEW TABLE NEEDED)
This table is needed to track trainee accommodation requests before they become tenants.

```php
Schema::create('dormitory_requests', function (Blueprint $table) {
    $table->id();
    $table->foreignIdFor(User::class)->ondelete('cascade'); // Trainee making request
    $table->foreignIdFor(DormitoryRoom::class)->ondelete('cascade');
    $table->date('check_in_date');
    $table->date('check_out_date');
    $table->enum('payment_method', ['online', 'onhand'])->default('online');
    $table->enum('status', ['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'CANCELLED'])->default('PENDING');
    $table->timestamps();
});
```

**Purpose:** Stores accommodation requests from trainees before admin approval and payment.

---

## 📊 **Missing Columns in Existing Tables**

### 1. **`dormitory_rooms` Table**

#### Missing Columns:
```php
$table->text('description')->nullable(); // Room description/amenities
$table->integer('tenants_count')->default(0); // Current number of tenants (can be calculated)
$table->integer('available_slots')->default(0); // Available slots (can be calculated)
$table->integer('overdue_count')->default(0); // Number of overdue tenants (can be calculated)
```

**Notes:**
- `tenants_count`, `available_slots`, and `overdue_count` can be **calculated values** (not stored) if you prefer to compute them on-the-fly
- `room_status` should be changed from `['ACTIVE', 'INACTIVE']` to `['AVAILABLE', 'UNAVAILABLE']` to match frontend

#### Recommended Update:
```php
// Change enum values
$table->enum('room_status', ['AVAILABLE', 'UNAVAILABLE'])->default('AVAILABLE');
```

---

### 2. **`dormitory_invoices` Table**

#### Missing Columns:
```php
$table->decimal('total_amount', 10, 2)->default(0.00); // Total payment amount
$table->decimal('due_amount', 10, 2)->default(0.00); // Overdue penalty amount
$table->integer('days_booked')->default(0); // Number of days booked
$table->integer('days_overdue')->default(0); // Number of days overdue
$table->decimal('daily_rate', 10, 2)->default(0.00); // Daily rate at time of booking
```

**Purpose:** Track payment amounts and overdue penalties for better financial tracking.

---

## 🔗 **Missing API Routes**

### **Trainee Routes** (Missing Entirely)

```php
Route::middleware('trainee')->prefix('/trainee/')->group(function() {
    Route::prefix('/dormitory/')->group(function() {
        // Get all available rooms
        Route::get('rooms', [DormitoryController::class, 'get_available_rooms']);
        
        // Get trainee's current request status
        Route::get('my-request', [DormitoryController::class, 'get_my_request']);
        
        // Submit dormitory request
        Route::post('request', [DormitoryController::class, 'submit_request']);
    });
});
```

---

### **Admin Routes** (Missing Request Management)

```php
Route::middleware('admin-dormitory')->prefix('/dormitory-admin/')->group(function() {
    
    // Request Management Routes (MISSING)
    Route::prefix('/requests/')->group(function() {
        // Get all dormitory requests
        Route::get('/', [DormitoryRequestController::class, 'get_all_requests']);
        
        // Send payment link for online payment
        Route::post('{id}/send-payment-link', [DormitoryRequestController::class, 'send_payment_link']);
        
        // Send counter payment notification
        Route::post('{id}/send-counter-notification', [DormitoryRequestController::class, 'send_counter_notification']);
        
        // Confirm on-hand payment received
        Route::post('{id}/confirm-onhand-payment', [DormitoryRequestController::class, 'confirm_onhand_payment']);
        
        // Reject request
        Route::post('{id}/reject', [DormitoryRequestController::class, 'reject_request']);
    });
    
    // Room Management Routes (MISSING)
    Route::prefix('/rooms/')->group(function() {
        // Toggle room status (AVAILABLE/UNAVAILABLE)
        Route::post('{id}/toggle-status', [DormitoryController::class, 'toggle_room_status']);
    });
});
```

---

## 📤 **Expected API Response Formats**

### 1. **GET `/trainee/dormitory/rooms`**
```json
{
    "rooms": [
        {
            "id": 1,
            "room_name": "Room 101",
            "room_cost": 500,
            "room_slot": 10,
            "tenants_count": 3,
            "available_slots": 7,
            "room_status": "AVAILABLE",
            "description": "Spacious room with air conditioning and WiFi"
        }
    ]
}
```

### 2. **GET `/trainee/dormitory/my-request`**
```json
{
    "request": {
        "id": 1,
        "room_id": 1,
        "check_in_date": "2024-10-15",
        "check_out_date": "2024-12-15",
        "payment_method": "online",
        "status": "PENDING",
        "room": {
            "room_name": "Room 101",
            "room_cost": 500
        }
    }
}
```

### 3. **POST `/trainee/dormitory/request`**
**Request Body:**
```json
{
    "room_id": 1,
    "check_in_date": "2024-10-15",
    "check_out_date": "2024-12-15",
    "payment_method": "online"
}
```

**Response:**
```json
{
    "message": "Request submitted successfully!",
    "request": {
        "id": 1,
        "status": "PENDING"
    }
}
```

### 4. **GET `/dormitory-admin/requests`**
```json
{
    "requests": [
        {
            "id": 1,
            "user": {
                "fname": "John",
                "lname": "Doe",
                "email": "john.doe@example.com"
            },
            "room": {
                "room_name": "Room 101",
                "room_cost": 500,
                "room_status": "AVAILABLE",
                "room_slot": 10,
                "tenants_count": 3
            },
            "check_in_date": "2024-10-15",
            "check_out_date": "2024-12-15",
            "payment_method": "online",
            "status": "PENDING",
            "created_at": "2024-10-01"
        }
    ]
}
```

### 5. **GET `/dormitory-admin/dormitory/get`**
**Should Include Computed/Joined Data:**
```json
{
    "dormitories": [
        {
            "id": 1,
            "room_name": "Room 101",
            "room_cost": 500,
            "room_slot": 10,
            "room_status": "AVAILABLE",
            "description": "...",
            "tenants_count": 3,
            "available_slots": 7,
            "overdue_count": 1,
            "created_at": "2024-01-01",
            "updated_at": "2024-01-01"
        }
    ]
}
```

### 6. **GET `/dormitory-admin/dormitory/get/tenants/{dormitory_id}`**
**Should Include User and Invoice Relations:**
```json
{
    "tenants": [
        {
            "id": 1,
            "dormitory_room_id": 1,
            "user_id": 1,
            "user": {
                "id": 1,
                "fname": "John",
                "lname": "Doe",
                "email": "john.doe@example.com"
            },
            "tenant_from_date": "2024-01-01",
            "tenant_to_date": "2024-09-01",
            "tenant_status": "APPROVED",
            "invoice": {
                "id": 1,
                "dormitory_tenant_id": 1,
                "dormitory_room_id": 1,
                "invoice_status": "PENDING",
                "invoice_receipt": "",
                "invoice_date": "2024-09-01"
            }
        }
    ]
}
```

---

## 🔄 **Business Logic Requirements**

### 1. **Room Availability Calculation**
```php
// Calculate available slots
$available_slots = $room->room_slot - $room->tenants()->where('tenant_status', 'APPROVED')->count();

// Calculate overdue tenants
$overdue_count = $room->tenants()
    ->where('tenant_status', 'APPROVED')
    ->where('tenant_to_date', '<', now())
    ->count();
```

### 2. **Request Approval Flow**

**Online Payment:**
1. Admin clicks "Send Payment Link"
2. Status changes to `PROCESSING`
3. Email sent with payment gateway link
4. User completes payment
5. Webhook/callback updates status to `APPROVED`
6. Create `dormitory_tenant` record
7. Create `dormitory_invoice` record
8. Update `tenants_count`

**On-hand Payment:**
1. Admin clicks "Send Counter Notification" → Status: `PROCESSING`
2. Email sent to user to pay at counter
3. User pays at counter
4. Admin clicks "Confirm Payment Received" → Status: `APPROVED`
5. Create `dormitory_tenant` record
6. Create `dormitory_invoice` record
7. Update `tenants_count`

### 3. **Overdue Penalty Calculation**
```php
// Calculate days overdue
$daysOverdue = max(0, now()->diffInDays($tenant->tenant_to_date, false));

// Calculate due amount (penalty)
$dueAmount = $daysOverdue * $room->room_cost;

// Calculate total amount
$totalAmount = $regularPayment + $dueAmount;
```

---

## ✅ **Action Items for Backend Developer**

### Priority 1 (Critical):
- [ ] Create `dormitory_requests` table
- [ ] Add trainee routes for room browsing and request submission
- [ ] Add admin request management routes
- [ ] Update `room_status` enum to `['AVAILABLE', 'UNAVAILABLE']`

### Priority 2 (High):
- [ ] Add `description` column to `dormitory_rooms`
- [ ] Add computed/joined fields to API responses:
  - `tenants_count`
  - `available_slots`
  - `overdue_count`
- [ ] Add invoice amount columns for better tracking
- [ ] Include user and invoice relations in tenant API response

### Priority 3 (Medium):
- [ ] Implement payment gateway integration
- [ ] Setup email notification system
- [ ] Add room toggle status endpoint
- [ ] Implement webhook for online payment verification

---

## 📧 **Email Templates Needed**

1. **Payment Link Email** (Online Payment)
2. **Counter Payment Notification Email** (On-hand Payment)
3. **Request Rejection Email**
4. **Booking Confirmation Email** (After Payment)
5. **Overdue Payment Reminder Email**

---

## 🔐 **Middleware Requirements**

Ensure these middleware are set up:
- `trainee` - For trainee-only routes
- `admin-dormitory` - For dormitory admin routes

---

## 📝 **Notes**

- All date fields should be returned in `YYYY-MM-DD` format
- All monetary values should be decimal with 2 decimal places
- Status enums must match exactly (case-sensitive)
- User relationships should be eager-loaded to avoid N+1 queries
- API responses should follow consistent structure with proper error handling

---

**Last Updated:** October 8, 2024  
**Frontend Developer:** [Your Name]  
**Pending Backend Implementation**

