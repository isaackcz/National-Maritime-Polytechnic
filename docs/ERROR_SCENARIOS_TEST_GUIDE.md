# Error Scenarios Test Guide - Data Retention

## 🧪 HOW TO TEST DATA RETENTION

### Test Setup
1. Open browser DevTools (F12)
2. Go to Network tab
3. Have form ready with test data

---

## TEST SCENARIO 1: Validation Error (422)

### Simulate Backend Validation Error
**Using DevTools:**
1. Fill out entire form (all 6 steps)
2. In Network tab, right-click on POST request
3. Select "Block request URL" or use offline mode
4. Submit form

**Expected Result:**
```
✅ Error message shows
✅ All text fields retain values
✅ All dropdowns retain selections
✅ Address dropdowns still show full address
✅ Dates still selected
✅ Phone numbers still filled
✅ Can navigate between stepper steps
✅ All data intact when returning to any step
```

---

## TEST SCENARIO 2: Network Error

### Simulate Network Failure
**Steps:**
1. Fill form completely:
   - Step 1: Name, Email, SRN
   - Step 2: Addresses, Phone numbers
   - Step 3: Contact person details
   - Step 4: Education details
   - Step 5: Shipboard experience
   - Step 6: Upload files
2. Disconnect internet OR use DevTools offline mode
3. Click "Save Changes"

**Expected Result:**
```
✅ Alert: "Cannot connect to server. Your data has been retained..."
✅ ALL fields still have values
✅ Address dropdowns:
   - ✅ Region selected
   - ✅ Province selected  
   - ✅ Municipality selected
   - ✅ Barangay selected
   - ✅ House number filled
   - ✅ Postal code filled
✅ Birthplace dropdowns:
   - ✅ Region selected
   - ✅ Province selected
   - ✅ Municipality selected
   - ✅ Barangay selected
✅ Date fields:
   - ✅ Birthday still selected
   - ✅ Disembarkation date still selected
✅ File uploads still in state (may need to check console)
```

---

## TEST SCENARIO 3: Address Cascade Retention

### Test Specific: Address Dropdown Behavior
**Steps:**
1. **Current Address:**
   ```
   Region: NCR - National Capital Region
   Province: Metro Manila
   Municipality: Quezon City
   Barangay: Bagong Lipunan
   House No: 123 Main Street
   Postal: 1100
   ```

2. **Birthplace Address:**
   ```
   Region: Region III - Central Luzon
   Province: Bulacan
   Municipality: Malolos
   Barangay: Barasoain
   ```

3. Disconnect internet
4. Submit form
5. See error message

**Verify:**
```
✅ Current Address dropdown shows:
   - ✅ NCR still selected
   - ✅ Metro Manila still available and selected
   - ✅ Quezon City still available and selected
   - ✅ Bagong Lipunan still available and selected
   - ✅ House number: "123 Main Street"
   - ✅ Postal code: "1100"
   - ✅ Complete address preview visible

✅ Birthplace Address dropdown shows:
   - ✅ Region III still selected
   - ✅ Bulacan still available and selected
   - ✅ Malolos still available and selected
   - ✅ Barasoain still available and selected
   - ✅ Complete address preview visible
```

---

## TEST SCENARIO 4: Date Field Retention

### Test Specific: Date Input Behavior
**Steps:**
1. Fill birthday: `1990-05-15`
2. Go to Shipboard Experience step
3. Fill disembarkation date: `2023-12-31`
4. Simulate error (disconnect internet)
5. Submit form
6. Navigate back to Basic Info step
7. Navigate forward to Shipboard step

**Verify:**
```
✅ Birthday field shows: 1990-05-15
✅ After error, still shows: 1990-05-15
✅ Navigate away and back, still shows: 1990-05-15
✅ Disembarkation field shows: 2023-12-31
✅ After error, still shows: 2023-12-31
```

---

## TEST SCENARIO 5: File Upload Retention

### Test Specific: File Upload Behavior
**Steps:**
1. Upload Signature file: `signature.png`
2. Upload ID Picture: `id-photo.jpg`
3. Upload SRN file: `srn-screenshot.png`
4. Upload Sea Service: `seabook.pdf`
5. Simulate error
6. Submit form
7. Open browser console
8. Check state

**Verify in Console:**
```javascript
// Check if files are in state (run in console)
// These should NOT be null after error:
✅ signatureFile: File object present
✅ IDPicture: File object present
✅ SRNFile: File object present
✅ seamansBook: File object present
```

**Note:** File input fields may APPEAR empty (browser behavior), but state still has files!

---

## TEST SCENARIO 6: Phone Number Retention

### Test Specific: PhoneInput Component
**Steps:**
1. Fill Mobile Number 1: `+639171234567`
2. Fill Mobile Number 2: `+639187654321`
3. Fill Contact Person Mobile 1: `+639191112222`
4. Fill Contact Person Mobile 2: `+639193334444`
5. Simulate error
6. Submit form

**Verify:**
```
✅ Mobile Number 1: +639171234567
✅ Mobile Number 2: +639187654321
✅ Contact Person Mobile 1: +639191112222
✅ Contact Person Mobile 2: +639193334444
✅ All phone numbers remain with country code
✅ All phone inputs still formatted correctly
```

---

## TEST SCENARIO 7: Navigation After Error

### Test: Stepper Navigation with Retained Data
**Steps:**
1. Fill Step 1 completely
2. Move to Step 2, fill completely
3. Move to Step 3, fill completely
4. Move to Step 4, fill completely
5. Move to Step 5, fill completely
6. Move to Step 6, upload files
7. Simulate error, submit
8. Navigate: Step 6 → 5 → 4 → 3 → 2 → 1
9. Navigate: Step 1 → 2 → 3 → 4 → 5 → 6

**Verify Each Step:**
```
Step 1 - Basic Info:
✅ First Name filled
✅ Middle Name filled
✅ Last Name filled
✅ Email filled
✅ SRN filled
✅ User Type selected
✅ Sex selected
✅ Birthday selected
✅ Civil Status selected
✅ Nationality selected

Step 2 - Contact Info:
✅ Mobile 1 filled
✅ Mobile 2 filled
✅ Landline filled
✅ Facebook filled
✅ Current address complete
✅ Birthplace address complete

Step 3 - Contact Person:
✅ Name filled
✅ Relationship filled
✅ Address filled
✅ Phone numbers filled
✅ Email filled

Step 4 - Education:
✅ Course filled
✅ School name filled
✅ School address filled

Step 5 - Shipboard:
✅ Status selected
✅ All fields filled (if applicable)

Step 6 - Documents:
✅ Files in state (console check)
```

---

## TEST SCENARIO 8: Multiple Errors in Sequence

### Test: Retry After Error
**Steps:**
1. Fill form completely
2. Disconnect internet
3. Submit → Error 1
4. Verify data retained
5. Keep internet off
6. Submit again → Error 2
7. Verify data still retained
8. Connect internet
9. Submit → Success

**Verify:**
```
After Error 1:
✅ All data intact

After Error 2:
✅ All data still intact
✅ Can still edit fields
✅ Can still navigate steps

After Success:
✅ Success message shown
✅ Data refreshed from server
✅ Form shows saved data
```

---

## TEST SCENARIO 9: Partial Form Fill + Error

### Test: Incomplete Form Error
**Steps:**
1. Fill only Step 1 and Step 2
2. Leave Steps 3-6 empty
3. Submit form
4. Get validation error (missing required fields)

**Verify:**
```
✅ Error message about missing fields
✅ Step 1 data retained
✅ Step 2 data retained
✅ Steps 3-6 remain empty (as they were)
✅ User can navigate to empty steps
✅ User can fill missing data
✅ Can resubmit after filling
```

---

## TEST SCENARIO 10: Special Characters in Input

### Test: Complex Data Retention
**Steps:**
1. Fill fields with special characters:
   ```
   Name: José María O'Brien-García
   Email: test+user@example.com
   Facebook: @user_name-123
   Address: Unit 5-A, Bldg #3, St. Peter's Village
   ```
2. Simulate error
3. Submit form

**Verify:**
```
✅ Name: José María O'Brien-García (accents, apostrophe, hyphen)
✅ Email: test+user@example.com (plus sign)
✅ Facebook: @user_name-123 (special chars)
✅ Address: Full text with all special characters
✅ No data corruption
✅ No trimming of special characters
```

---

## 🎯 QUICK TEST CHECKLIST

When testing, verify these key points:

- [ ] Text fields retain exact values
- [ ] Address region selected
- [ ] Address province selected and available
- [ ] Address municipality selected and available
- [ ] Address barangay selected and available
- [ ] Address house number text preserved
- [ ] Address postal code preserved
- [ ] Birthplace region selected
- [ ] Birthplace province selected and available
- [ ] Birthplace municipality selected and available
- [ ] Birthplace barangay selected and available
- [ ] Birthday date selected
- [ ] Disembarkation date selected (if filled)
- [ ] Phone numbers formatted correctly
- [ ] File objects in state (console check)
- [ ] Can navigate between all steps
- [ ] Data visible in all steps after navigation
- [ ] No fields reset to empty
- [ ] Error message mentions data retention
- [ ] Can successfully resubmit after fixing error

---

## 💻 BROWSER CONSOLE DEBUGGING

### Check State After Error
```javascript
// Open console, run after error:

// Check if state has data (React DevTools)
// 1. Install React Developer Tools extension
// 2. Go to Components tab
// 3. Find useMyAccountLogic hook
// 4. Inspect state values

// Should see:
// firstName: "John"
// lastName: "Doe"
// addressData: { region: "NCR", province: "Metro Manila", ... }
// birthday: "1990-05-15"
// etc.
```

---

## ✅ SUCCESS CRITERIA

### All Tests Pass If:
1. ✅ NO data is lost on any error
2. ✅ ALL fields retain exact values
3. ✅ Address dropdowns maintain cascade
4. ✅ Dates remain selected
5. ✅ Files remain in state
6. ✅ Can navigate between steps freely
7. ✅ Error messages are user-friendly
8. ✅ Can successfully retry after error

---

## 🚨 FAILURE INDICATORS

### Test FAILS If:
- ❌ Any field becomes empty after error
- ❌ Address dropdowns reset
- ❌ Dates are cleared
- ❌ Phone numbers disappear
- ❌ Cannot navigate between steps
- ❌ Data different after navigation
- ❌ User has to re-enter any information

---

## 📊 TEST RESULTS TEMPLATE

```
TEST RUN: [Date]
TESTER: [Name]

Scenario 1 - Validation Error:     ✅ PASS / ❌ FAIL
Scenario 2 - Network Error:        ✅ PASS / ❌ FAIL
Scenario 3 - Address Retention:    ✅ PASS / ❌ FAIL
Scenario 4 - Date Retention:       ✅ PASS / ❌ FAIL
Scenario 5 - File Retention:       ✅ PASS / ❌ FAIL
Scenario 6 - Phone Retention:      ✅ PASS / ❌ FAIL
Scenario 7 - Navigation:           ✅ PASS / ❌ FAIL
Scenario 8 - Multiple Errors:      ✅ PASS / ❌ FAIL
Scenario 9 - Partial Fill:         ✅ PASS / ❌ FAIL
Scenario 10 - Special Chars:       ✅ PASS / ❌ FAIL

OVERALL: ✅ ALL PASS / ❌ SOME FAILED

Notes:
[Any observations or issues]
```

---

**With current implementation, ALL scenarios should PASS!** ✅

