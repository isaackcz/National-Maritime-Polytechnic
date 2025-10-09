# Dormitory Payment Page - Integration Guide

## 📋 Overview

This document explains how to integrate the online payment pages for the dormitory booking system.

---

## 🎨 Created Pages

### 1. **DormitoryPayment.js** - Main Payment Page
**Path**: `src/pages/guest/DormitoryPayment.js`

**Purpose**: Displays booking details and allows trainee to select payment method and complete payment.

**Features**:
- ✅ Clean, Google Material-inspired design
- ✅ Displays booking summary (room, dates, duration, total cost)
- ✅ Multiple payment method options (GCash, PayMaya, Bank Transfer, Credit Card)
- ✅ Real-time calculation of total amount
- ✅ Loading states and error handling
- ✅ Secure payment processing
- ✅ Responsive design

### 2. **PaymentSuccess.js** - Confirmation Page
**Path**: `src/pages/guest/PaymentSuccess.js`

**Purpose**: Shows success confirmation after payment is completed.

**Features**:
- ✅ Animated success checkmark
- ✅ Booking summary display
- ✅ Print receipt functionality
- ✅ Redirect to login

### 3. **DormitoryPayment.css** - Styles
**Path**: `src/pages/guest/DormitoryPayment.css`

**Features**:
- ✅ Success checkmark animation
- ✅ Payment card hover effects
- ✅ Responsive design
- ✅ Print-friendly styles

---

## 🔌 Backend API Requirements

### 1. **GET /payment/dormitory/details**
Fetches booking details using payment token.

**Query Parameters**:
```
?token=UNIQUE_PAYMENT_TOKEN
```

**Response**:
```json
{
    "booking": {
        "id": 1,
        "dormitory_room_id": 5,
        "user_id": 12,
        "tenant_from_date": "2025-10-15",
        "tenant_to_date": "2025-11-15",
        "tenant_status": "APPROVED",
        "user": {
            "fname": "John",
            "lname": "Doe",
            "email": "john.doe@example.com"
        },
        "dormitory_room": {
            "id": 5,
            "room_name": "Room 101",
            "room_cost": 500.00
        }
    }
}
```

### 2. **POST /payment/dormitory/process**
Processes payment and redirects to payment gateway.

**Request Body**:
```json
{
    "token": "UNIQUE_PAYMENT_TOKEN",
    "payment_method": "gcash" // or "paymaya", "bank_transfer", "credit_card"
}
```

**Response (Success)**:
```json
{
    "success": true,
    "message": "Payment initiated successfully",
    "redirect_url": "https://payment-gateway.com/checkout/xyz123"
}
```

**Response (Direct Success - No Redirect)**:
```json
{
    "success": true,
    "message": "Payment completed successfully",
    "booking_id": 1
}
```

---

## 🛣️ Route Configuration

Add these routes to your React Router:

```javascript
// In your App.js or route configuration file

import DormitoryPayment from './pages/guest/DormitoryPayment';
import PaymentSuccess from './pages/guest/PaymentSuccess';

// Add to routes
<Route path="/payment/dormitory" element={<DormitoryPayment />} />
<Route path="/payment/success" element={<PaymentSuccess />} />
```

---

## 📧 Email Template with Payment Link

When admin approves a request, send this email:

**Subject**: Dormitory Request Approved - Complete Your Payment

**HTML Template**:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
        .total { font-size: 24px; color: #1a73e8; font-weight: bold; }
        .button { display: inline-block; background: #1a73e8; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Request Approved!</h1>
            <p>Your dormitory accommodation request has been approved</p>
        </div>
        
        <div class="content">
            <p>Dear <strong>[TRAINEE_NAME]</strong>,</p>
            
            <p>Great news! Your dormitory accommodation request has been approved. Please complete your payment to confirm your booking.</p>
            
            <div class="booking-details">
                <h3 style="margin-top: 0; color: #1a73e8;">Booking Details</h3>
                
                <div class="detail-row">
                    <span>Room:</span>
                    <strong>[ROOM_NAME]</strong>
                </div>
                
                <div class="detail-row">
                    <span>Check-in Date:</span>
                    <strong>[CHECK_IN_DATE]</strong>
                </div>
                
                <div class="detail-row">
                    <span>Check-out Date:</span>
                    <strong>[CHECK_OUT_DATE]</strong>
                </div>
                
                <div class="detail-row">
                    <span>Duration:</span>
                    <strong>[DURATION] days</strong>
                </div>
                
                <div class="detail-row" style="border-bottom: none; padding-top: 20px;">
                    <span>Total Amount:</span>
                    <span class="total">₱[TOTAL_AMOUNT]</span>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="[PAYMENT_LINK]" class="button">Complete Payment Now</a>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <strong>⏰ Important:</strong> This payment link is valid for 48 hours. Please complete your payment within this time to secure your booking.
            </div>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Thank you!</p>
        </div>
        
        <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>© 2025 Dormitory Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

**PHP Implementation (Laravel)**:
```php
// In DormitoryController.php - approve_request method

public function approve_request(Request $request, $tenant_id)
{
    $tenant = DormitoryTenant::with(['user', 'dormitory_room'])->findOrFail($tenant_id);
    
    // Generate unique payment token
    $paymentToken = Str::random(64);
    
    // Update tenant status
    $tenant->tenant_status = 'APPROVED';
    $tenant->payment_token = $paymentToken; // Add this column or use existing mechanism
    $tenant->payment_token_expires_at = now()->addHours(48);
    $tenant->save();
    
    // Generate payment link
    $paymentLink = url("/payment/dormitory?token={$paymentToken}");
    
    // Calculate total
    $duration = Carbon::parse($tenant->tenant_from_date)
        ->diffInDays(Carbon::parse($tenant->tenant_to_date));
    $totalAmount = $duration * $tenant->dormitory_room->room_cost;
    
    // Send email
    Mail::to($tenant->user->email)->send(new DormitoryPaymentLink([
        'trainee_name' => $tenant->user->fname . ' ' . $tenant->user->lname,
        'room_name' => $tenant->dormitory_room->room_name,
        'check_in_date' => Carbon::parse($tenant->tenant_from_date)->format('M d, Y'),
        'check_out_date' => Carbon::parse($tenant->tenant_to_date)->format('M d, Y'),
        'duration' => $duration,
        'total_amount' => number_format($totalAmount, 2),
        'payment_link' => $paymentLink
    ]));
    
    return response()->json([
        'success' => true,
        'message' => 'Request approved and payment link sent to trainee\'s email'
    ]);
}
```

---

## 🔐 Payment Token Security

### Token Generation:
```php
// Generate secure random token
$token = Str::random(64);

// Store in database with expiration
$tenant->payment_token = hash('sha256', $token);
$tenant->payment_token_expires_at = now()->addHours(48);
$tenant->save();

// Send plain token in email (will be hashed when validated)
$paymentLink = url("/payment/dormitory?token={$token}");
```

### Token Validation:
```php
// In payment/dormitory/details endpoint
public function getPaymentDetails(Request $request)
{
    $token = $request->query('token');
    
    if (!$token) {
        return response()->json(['error' => 'Invalid payment link'], 400);
    }
    
    $hashedToken = hash('sha256', $token);
    
    $tenant = DormitoryTenant::with(['user', 'dormitory_room'])
        ->where('payment_token', $hashedToken)
        ->where('payment_token_expires_at', '>', now())
        ->where('tenant_status', 'APPROVED')
        ->first();
    
    if (!$tenant) {
        return response()->json(['error' => 'Payment link expired or invalid'], 400);
    }
    
    return response()->json([
        'booking' => $tenant
    ]);
}
```

---

## 💳 Payment Gateway Integration

### GCash Integration Example:
```php
public function processPayment(Request $request)
{
    $validated = $request->validate([
        'token' => 'required|string',
        'payment_method' => 'required|in:gcash,paymaya,bank_transfer,credit_card'
    ]);
    
    $hashedToken = hash('sha256', $validated['token']);
    $tenant = DormitoryTenant::where('payment_token', $hashedToken)->firstOrFail();
    
    // Calculate amount
    $duration = Carbon::parse($tenant->tenant_from_date)
        ->diffInDays(Carbon::parse($tenant->tenant_to_date));
    $amount = $duration * $tenant->dormitory_room->room_cost;
    
    // Create invoice
    $invoice = DormitoryInvoice::create([
        'dormitory_tenant_id' => $tenant->id,
        'dormitory_room_id' => $tenant->dormitory_room_id,
        'invoice_status' => 'PENDING',
        'invoice_receipt' => '', // Will be updated after payment
        'invoice_date' => now(),
        'amount' => $amount,
        'payment_method' => $validated['payment_method']
    ]);
    
    // Integrate with payment gateway
    switch ($validated['payment_method']) {
        case 'gcash':
            // GCash API integration
            $gcashResponse = $this->initiateGCashPayment($tenant, $amount, $invoice->id);
            return response()->json([
                'success' => true,
                'redirect_url' => $gcashResponse['checkout_url']
            ]);
            
        case 'paymaya':
            // PayMaya API integration
            break;
            
        // ... other payment methods
    }
}

private function initiateGCashPayment($tenant, $amount, $invoiceId)
{
    // Example GCash API call
    $response = Http::post('https://api.gcash.com/checkout/create', [
        'amount' => $amount,
        'currency' => 'PHP',
        'description' => 'Dormitory Accommodation - ' . $tenant->dormitory_room->room_name,
        'callback_url' => url("/payment/callback/gcash/{$invoiceId}"),
        'success_url' => url("/payment/success"),
        'cancel_url' => url("/payment/dormitory?token={$tenant->payment_token}")
    ]);
    
    return $response->json();
}
```

---

## 🎨 UI Features

### Payment Methods Supported:
1. **GCash** - Mobile wallet payment
2. **PayMaya** - Digital payment platform
3. **Bank Transfer** - Direct bank transfer
4. **Credit/Debit Card** - Card payment

### Visual Elements:
- ✅ Animated success checkmark (CSS animation)
- ✅ Responsive card layouts
- ✅ Interactive payment method selection
- ✅ Real-time amount calculation
- ✅ Loading states during processing
- ✅ Error handling with user-friendly messages
- ✅ Print-friendly receipt format

### Color Scheme (Google Material):
- Primary: `#1a73e8` (Google Blue)
- Success: `#34a853` (Green)
- Warning: `#fbbc04` (Yellow)
- Danger: `#ea4335` (Red)
- Background: `#f8f9fa` (Light Gray)
- Text: `#202124` (Dark Gray)

---

## 📱 Responsive Design

The payment pages are fully responsive:
- **Desktop**: Full-width cards with side-by-side layout
- **Tablet**: Stacked cards with optimized spacing
- **Mobile**: Single column, touch-friendly buttons

---

## 🔄 Payment Flow

1. **Admin approves request** → System sends email with payment link
2. **Trainee clicks link** → Opens `/payment/dormitory?token=xxx`
3. **Page loads booking details** → Fetches from API using token
4. **Trainee selects payment method** → GCash/PayMaya/Bank/Card
5. **Trainee clicks "Pay"** → Redirects to payment gateway
6. **Payment completed** → Gateway redirects to `/payment/success`
7. **System receives webhook** → Updates invoice status to PAID
8. **Admin confirms payment** → Tenant status remains APPROVED (fully booked)

---

## 🧪 Testing

### Test Payment Link:
```
http://localhost:3000/payment/dormitory?token=test_token_12345
```

### Mock Response for Testing:
```javascript
// In mockConfig.js or for development
const mockBookingData = {
    id: 1,
    dormitory_room_id: 5,
    user_id: 12,
    tenant_from_date: "2025-10-15",
    tenant_to_date: "2025-11-15",
    tenant_status: "APPROVED",
    user: {
        fname: "John",
        lname: "Doe",
        email: "john.doe@example.com"
    },
    dormitory_room: {
        id: 5,
        room_name: "Room 101",
        room_cost: 500.00
    }
};
```

---

## 📝 Notes

- Payment links expire after 48 hours
- Only APPROVED tenants can access payment pages
- Payment token is hashed for security
- All amounts are calculated dynamically
- Supports multiple payment gateways
- Fully responsive and accessible
- Print-friendly receipt design

---

**Last Updated**: October 9, 2025  
**Version**: 1.0

