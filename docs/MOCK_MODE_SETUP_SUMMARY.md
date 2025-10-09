# Mock Mode Setup - Complete Summary

## ✅ What Was Created

### 1. **Mock Configuration File** (`src/config/mockConfig.js`)
- Central configuration for mock mode
- Complete trainee user data with realistic information
- Mock token for authentication
- Mock response functions for login and user data

### 2. **Modified Files**

#### **Login Component** (`src/pages/guest/login/Login.js`)
- Added mock mode support
- Shows visual indicator when mock mode is active
- Bypasses backend API when `MOCK_MODE = true`
- Uses credentials: `trainee@test.com` / `password123`

#### **User Hook** (`src/hooks/useGetCurrentUser.js`)
- Returns mock trainee data when in mock mode
- Validates mock token
- Maintains same structure as real API response

#### **Trainee Menu** (`src/pages/authenticated/trainee/components/TraineeMenu.js`)
- Shows "MOCK MODE ACTIVE" badge in navbar
- Logout works without backend API in mock mode

## 🎯 How to Use

### Quick Start
1. **Login credentials:**
   - Email: `trainee@test.com`
   - Password: `password123`

2. **Toggle Mock Mode:**
   ```javascript
   // In src/config/mockConfig.js
   export const MOCK_MODE = true;  // Enable mock mode
   export const MOCK_MODE = false; // Use real backend
   ```

### Visual Indicators
- **Login page**: Orange badge at top-right showing credentials
- **Authenticated pages**: Yellow badge in navbar showing "MOCK MODE ACTIVE"

## 📊 Mock Trainee Data Includes

- ✅ Personal Information (Name, DOB, Gender, etc.)
- ✅ Contact Details (Present & Provincial Address)
- ✅ Government IDs (TIN, SSS, PhilHealth, Pag-IBIG)
- ✅ Emergency Contact Person
- ✅ Educational Attainment
- ✅ Shipboard Experience
- ✅ Enrolled Courses (with course schedules)
- ✅ Registration Files (Birth cert, NBI, Medical, etc.)
- ✅ User Profile Picture

## 🔧 Technical Details

### Files Created:
1. `src/config/mockConfig.js` - Mock configuration and data
2. `MOCK_MODE_INSTRUCTIONS.md` - User guide
3. `MOCK_MODE_SETUP_SUMMARY.md` - This summary

### Files Modified:
1. `src/pages/guest/login/Login.js` - Login with mock support
2. `src/hooks/useGetCurrentUser.js` - User data with mock support
3. `src/pages/authenticated/trainee/components/TraineeMenu.js` - Visual indicators and logout

### How It Works:
1. **Login Flow:**
   - Checks if `MOCK_MODE = true`
   - If yes: Validates credentials against mock data
   - Returns mock token and user data
   - Redirects to trainee dashboard

2. **User Data Flow:**
   - Checks if `MOCK_MODE = true` and token matches
   - If yes: Returns mock user data
   - If no: Calls real backend API

3. **Logout Flow:**
   - Checks if `MOCK_MODE = true`
   - If yes: Just clears token and redirects
   - If no: Calls backend logout API

## 🎨 Mock User Details

**Name:** Juan Santos Dela Cruz  
**Email:** trainee@test.com  
**Role:** TRAINEE  
**Gender:** MALE  
**Civil Status:** SINGLE  
**Mobile:** 09171234567  

**Current Enrollment:**  
- Course: Basic Safety Training (BST-101)
- Batch: BATCH-2024-001
- Duration: 160 hours / 20 days
- Status: ENROLLED

## 🚀 Ready to Test!

Your frontend is now ready for testing without the backend. Simply:

1. Make sure `MOCK_MODE = true` in `src/config/mockConfig.js`
2. Start your frontend server
3. Navigate to login page
4. Use credentials: `trainee@test.com` / `password123`
5. Explore all trainee features with realistic data

## 📝 Notes

- **Data Persistence**: Mock data is NOT saved. Changes reset on page refresh.
- **Other Roles**: Only TRAINEE role is mocked. Add more roles in mockConfig.js if needed.
- **Production**: Remember to set `MOCK_MODE = false` when backend is available.

---

**Created:** October 9, 2025  
**Purpose:** Frontend development and testing without backend dependency

