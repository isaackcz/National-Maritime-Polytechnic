# My Account - Simple Testing Guide

## How to Test the My Account Page

### Before You Start
1. Make sure backend is running (Laravel API)
2. Make sure frontend is running (npm run dev)
3. Have a trainee account to login

---

## Test 1: Load Saved Data

**What to do:**
1. Login as a trainee
2. Go to "My Account" page
3. Wait for page to load

**What should happen:**
- Page loads without errors
- Saved data appears in form fields
- Address dropdowns show saved addresses
- No error messages in browser console

**If it fails:**
- Check browser console (F12) for errors
- Check if backend is running
- Check if API endpoint is correct

---

## Test 2: Fill New Data

**What to do:**
1. On My Account page
2. Click through the 6 steps:
   - Basic Info
   - Contact Info
   - Contact Person
   - Education
   - Shipboard Experience
   - Documents
3. Fill in the fields

**What should happen:**
- Can type in all fields
- Dropdowns show options
- Address cascades properly (region → province → municipality → barangay)
- Next/Back buttons work
- Form remembers data when going back

**If it fails:**
- Check which step has the issue
- Look at browser console for errors
- Verify field names match backend

---

## Test 3: Save Data

**What to do:**
1. Fill all required fields (marked with *)
2. Go to last step (Documents)
3. Click "Save Changes"

**What should happen:**
- Loading indicator appears
- Success message shows: "Information saved successfully!"
- Page reloads data
- Saved data appears in form

**If it fails:**
- Check browser console for error
- Check Network tab (F12) to see API response
- Verify all required fields are filled
- Check backend logs

---

## Test 4: Update Existing Data

**What to do:**
1. Change some fields
2. Click "Save Changes"

**What should happen:**
- Success message shows
- Updated data appears when page reloads

---

## Test 5: Change Password

**What to do:**
1. Go to "Security & Password" tab
2. Enter current password
3. Enter new password (must meet requirements):
   - At least 6 characters
   - Has uppercase letter
   - Has lowercase letter
   - Has number
   - Has special character (@$!%*#?&)
4. Enter same password in "Confirm Password"
5. Click "Update Password"

**What should happen:**
- Success message shows
- You are logged out
- Can login with new password

**If it fails:**
- Check if current password is correct
- Check if new password meets requirements
- Check password checklist (green checks)

---

## Test 6: View Activities

**What to do:**
1. Go to "Activity History" tab

**What should happen:**
- See list of your activities
- Shows dates and descriptions
- Shows actions like "You have updated your information"

**If it fails:**
- Check browser console
- Check if backend is running

---

## Browser Console Checks

Open browser console (F12) and check:

### When page loads:
```
✅ GET request to: /my-account/get_trainee_general_info
✅ Status: 200 OK
✅ Response has data
```

### When saving data:
```
✅ POST request to: /my-account/create_or_update_additional_info
✅ Status: 200 or 201
✅ Success message shown
```

### When changing password:
```
✅ POST request to: /my-account/update_password
✅ Status: 200
✅ User logged out
```

### When viewing activities:
```
✅ GET request to: /my-account/get_activities
✅ Status: 200 OK
✅ Response has activities array
```

---

## Common Errors & What They Mean

### "Session expired. Please login again."
- Your login token expired
- Just login again
- Normal security behavior

### "Failed to save information. Please try again."
- Some fields might be invalid
- Check which fields are required
- Check browser console for details

### "Cannot connect to server."
- Backend is not running
- Check your internet
- Verify backend URL is correct

### "Current password is incorrect"
- You entered wrong current password
- Try again with correct password

---

## Network Tab Inspection

1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Perform action (save, load, etc.)
4. Look for API calls
5. Check:
   - Request URL is correct
   - Request has Authorization header
   - Response status is 200/201
   - Response has data

---

## What Each API Call Does

### 1. Load Data (GET)
```
URL: /my-account/get_trainee_general_info
Purpose: Get saved personal information
When: Page loads
```

### 2. Save Data (POST)
```
URL: /my-account/create_or_update_additional_info
Purpose: Save personal information
When: Click "Save Changes"
```

### 3. Change Password (POST)
```
URL: /my-account/update_password
Purpose: Update password
When: Click "Update Password"
```

### 4. Get Activities (GET)
```
URL: /my-account/get_activities
Purpose: Get activity history
When: Click "Activity History" tab
```

---

## Files to Check if Something Breaks

1. **useMyAccountLogic.js** - All API calls and data management
2. **PhilippinesAddressDropdown.js** - Address dropdown logic
3. **PersonalInfoStepper.js** - Form fields and steps
4. **MyAccount.js** - Main page layout

---

## Quick Debug Checklist

- [ ] Backend is running
- [ ] Frontend is running
- [ ] User is logged in
- [ ] Token is valid (not expired)
- [ ] No console errors
- [ ] Network requests show 200/201 status
- [ ] All required fields are filled
- [ ] Internet connection is working

---

## Success Indicators

✅ Page loads without errors  
✅ Data appears in form fields  
✅ Can save data successfully  
✅ Can change password successfully  
✅ Can view activities  
✅ No console errors  
✅ Success messages show when saving  
✅ Address dropdowns work properly  

---

## If Everything Works

Congratulations! Your My Account page is working correctly. You can now:
- Add more features
- Customize the design
- Add more validation
- Add file preview for uploads
- Add progress indicators
- Improve error messages

---

## Need Help?

1. Check browser console first
2. Check network tab for API responses
3. Read API documentation: MY_ACCOUNT_API_DOCUMENTATION.md
4. Read fixes summary: MY_ACCOUNT_FIXES_SUMMARY.md
5. Look at code comments - they explain everything

