# My Account - API Documentation

This document explains all the API calls used in the My Account section of the trainee portal.

## Overview
The My Account page allows trainees to:
1. View and update their personal information
2. Change their password
3. View their activity history

---

## API Endpoints

### 1. Get Trainee Information
**Purpose:** Fetch all saved personal information from database  
**Method:** GET  
**Endpoint:** `/my-account/get_trainee_general_info`  
**Authentication:** Required (Bearer Token)

**What it does:**
- Gets basic user info (name, email, etc.)
- Gets additional info (SRN, nationality, civil status)
- Gets current address and birthplace
- Gets contact person details
- Gets educational background
- Gets shipboard experience

**Response:**
```json
{
  "trainee_general_info": [
    {
      "fname": "John",
      "mname": "D",
      "lname": "Doe",
      "email": "john@example.com",
      "additional_trainee_info": {
        "general_info": {...},
        "contact_person": {...},
        "educational_attainment": {...},
        "latest_shipboard_attainment": {...}
      }
    }
  ]
}
```

---

### 2. Save/Update Personal Information
**Purpose:** Save or update trainee personal information  
**Method:** POST  
**Endpoint:** `/my-account/create_or_update_additional_info`  
**Authentication:** Required (Bearer Token)

**What it sends:**
- General information (SRN, status, gender, birthdate, civil status, citizenship)
- Current address (region, province, municipality, barangay, house no, postal code)
- Birthplace address
- Contact numbers (mobile 1, mobile 2, landline, facebook)
- Contact person details (name, relationship, address, contact numbers)
- Educational background (course, school name, school address)
- Shipboard experience (status, license, rank, etc.)
- File uploads (signature, ID picture, SRN file, etc.)

**Response:**
```json
{
  "message": "You've created/updated your information.",
  "reloggin": false
}
```

---

### 3. Update Password
**Purpose:** Change user password  
**Method:** POST  
**Endpoint:** `/my-account/update_password`  
**Authentication:** Required (Bearer Token)

**What it sends:**
- current_password
- password (new password)
- password_confirmation

**Response:**
```json
{
  "message": "Password changed successfully",
  "reloggin": true
}
```

**Note:** User will be logged out after password change and must login again.

---

### 4. Get Activity History
**Purpose:** Fetch user activity logs  
**Method:** GET  
**Endpoint:** `/my-account/get_activities`  
**Authentication:** Required (Bearer Token)

**What it gets:**
- All logged activities (login, updates, etc.)
- Date and time of each activity
- Description of each action

**Response:**
```json
{
  "activities": [
    {
      "id": 1,
      "user_id": 1,
      "actions": "You have updated your information.",
      "created_at": "2025-10-10 10:30:00"
    }
  ]
}
```

---

## External APIs Used

### Philippine Address API (PSGC)
**Purpose:** Get regions, provinces, municipalities, and barangays  
**Base URL:** `https://psgc.gitlab.io/api/`

**Endpoints:**
1. **Get Regions:** `GET /regions/`
2. **Get Provinces:** `GET /regions/{regionCode}/provinces/`
3. **Get Municipalities:** `GET /provinces/{provinceCode}/cities-municipalities/`
4. **Get Barangays:** `GET /cities-municipalities/{municipalityCode}/barangays/`

---

## How Data Flows

### Loading Data (When Page Opens)
1. User opens My Account page
2. System calls `get_trainee_general_info` API
3. API returns saved data from database
4. Form fields are filled with the returned data
5. User sees their current information

### Saving Data (When User Clicks Save)
1. User fills/updates form fields
2. User clicks "Save Changes" button
3. System collects all form data
4. System sends data to `create_or_update_additional_info` API
5. API saves data to database
6. System shows success message
7. System reloads data to show updated information

### Changing Password
1. User enters current password
2. User enters new password twice
3. User clicks "Update Password"
4. System sends data to `update_password` API
5. API validates current password
6. API saves new password
7. User is logged out
8. User must login with new password

---

## Error Handling

**Common Errors:**
- **401 Unauthorized:** Invalid or expired token → Logout user
- **422 Validation Error:** Invalid data format → Show error message
- **500 Server Error:** Server problem → Logout user and show error
- **Network Error:** No internet → Show connection error

---

## File Uploads

**Supported Files:**
- E-Signature (image)
- ID Picture (image)
- SRN Screenshot (image)
- Sea Service Book (any file)
- Last Disembarkation (optional)
- Marina License (optional)

**Upload Process:**
- Files are sent as FormData
- Backend saves files to `public/trainee-files/` folder
- Filename format: `timestamp_uniqueid.extension`

---

## Important Notes

1. **Authentication Required:** All API calls need a valid Bearer token
2. **Session Expiry:** If token expires, user is redirected to login
3. **Email Change:** Changing email generates new temporary password
4. **Password Change:** User must re-login after password change
5. **File Size:** Check maximum file size limits on upload
6. **Data Validation:** Backend validates all data before saving

---

## Testing Without Backend

If backend is offline, you can:
1. Check browser console for API call details
2. Verify data being sent is correct
3. Use mock data for testing frontend
4. Check network tab to see actual requests

---

## Frontend File Locations

- **Main Logic:** `src/pages/authenticated/trainee/my-account/useMyAccountLogic.js`
- **Main Page:** `src/pages/authenticated/trainee/my-account/MyAccount.js`
- **Form Steps:** `src/pages/authenticated/trainee/my-account/PersonalInfoStepper.js`
- **Address Dropdown:** `src/pages/authenticated/trainee/my-account/PhilippinesAddressDropdown.js`

---

## Backend File Locations

- **Main Controller:** `New_folder/app/Http/Controllers/Authenticated/Trainee/MyAccount.php`
- **Password Controller:** `New_folder/app/Http/Controllers/Authenticated/General/Account.php`
- **Routes:** `New_folder/routes/api.php`

