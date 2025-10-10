# ✅ VALIDATION SYSTEM - Complete Guide

## 🎯 VALIDATION IMPLEMENTED

Users **cannot proceed to next step** unless all required fields are valid!

---

## 📋 HOW IT WORKS

### Simple Flow:
```
1. User fills fields in Step 1
2. User clicks "Next"
3. ✅ Validation runs
4. If errors found:
   - ❌ Cannot go to next step
   - 🔴 Red borders appear on invalid fields
   - 📝 Error messages show under fields
   - ⚠️ Alert shows list of all errors
5. If no errors:
   - ✅ Proceed to next step
```

---

## 📁 FILES CREATED

### 1. formValidation.js (NEW)
**Location:** `src/pages/authenticated/trainee/my-account/formValidation.js`

**Contains:**
- `validateStep1()` - Basic info validation
- `validateStep2()` - Contact info validation
- `validateStep3()` - Contact person validation
- `validateStep4()` - Education validation
- `validateStep5()` - Shipboard validation (no required fields)
- `validateStep6()` - Documents validation
- Helper functions for email and phone validation

**Purpose:** Centralized validation logic matching backend requirements

---

## 🎨 MUI VALIDATION STYLING

### Text Fields
```javascript
<TextField
    label="First Name"
    value={logic.firstName}
    onChange={(e) => logic.setFirstName(e.target.value)}
    onBlur={() => onFieldTouch('firstName')}
    error={!!errors.firstName}           // Red border if error
    helperText={errors.firstName}         // Error message below field
    required
/>
```

**Visual States:**
- ⚪ Normal: Gray border
- 🔴 Error: Red border + error message
- ✅ Filled: Normal border

---

### Phone Number Fields
```javascript
<PhoneInput 
    value={logic.mobileNumber1}
    onChange={logic.setMobileNumber1}
    onBlur={() => onFieldTouch('mobileNumber1')}
    // Error styling via parent Box
/>
{errors.mobileNumber1 && (
    <Typography sx={{ color: '#d32f2f', fontSize: '12px' }}>
        {errors.mobileNumber1}
    </Typography>
)}
```

**Visual States:**
- ⚪ Normal: Default border
- 🔴 Error: Red border + error text below

---

### File Upload Fields
```javascript
<DragDropFileInput
    label="Signature *"
    onChange={(e) => {
        logic.CheckUploadedAvatar(e, 'signature');
        onFieldTouch('signatureFile');
    }}
    fileName={logic.signatureFileName}
    error={errors.signatureFile}  // Shows red box with error icon
/>
```

**Visual States:**
- ⚪ Empty: Gray dashed border, upload icon
- 🔴 Error: Red solid border, exclamation icon, error message
- ✅ Uploaded: Green solid border, check icon, filename

---

## 📊 VALIDATION RULES PER STEP

### STEP 1: Basic Information
**Required Fields: 8**
| Field | Validation | Error Message |
|-------|------------|---------------|
| First Name | Required, not empty | "First Name is required" |
| Last Name | Required, not empty | "Last Name is required" |
| Email | Required, valid format | "Email is required" or "Please enter a valid email" |
| SRN Number | Required, numeric only | "SRN Number is required" or "Must contain only numbers" |
| User Type | Required (NEW/RETURNEE) | "User Type is required" |
| Sex | Required (MALE/FEMALE) | "Sex is required" |
| Civil Status | Required (5 options) | "Civil Status is required" |
| Nationality | Required | "Nationality is required" |

**Conditional:**
- If Nationality = "Others" → Must specify nationality

---

### STEP 2: Contact Information
**Required Fields: 13**

**Contact Numbers:**
| Field | Validation | Error Message |
|-------|------------|---------------|
| Mobile Number 1 | Required, valid phone | "Mobile Number 1 is required" |
| Mobile Number 2 | Required, valid phone | "Mobile Number 2 is required" |
| Facebook Account | Required | "Facebook Account is required" |

**Current Address:**
| Field | Validation | Error Message |
|-------|------------|---------------|
| Region | Required | "Region is required" |
| Province | Required | "Province is required" |
| Municipality | Required | "Municipality is required" |
| Barangay | Required | "Barangay is required" |
| House No | Required | "House No./Street is required" |
| Postal Code | Required, 4 digits | "Postal Code is required" or "Must be 4 digits" |

**Birthplace:**
| Field | Validation | Error Message |
|-------|------------|---------------|
| Region | Required | "Birthplace Region is required" |
| Province | Required | "Birthplace Province is required" |
| Municipality | Required | "Birthplace Municipality is required" |
| Barangay | Required | "Birthplace Barangay is required" |

---

### STEP 3: Contact Person
**Required Fields: 6**
| Field | Validation | Error Message |
|-------|------------|---------------|
| Name | Required | "Contact Person Name is required" |
| Relationship | Required | "Relationship is required" |
| Address | Required | "Contact Person Address is required" |
| Mobile Number 1 | Required, valid phone | "Mobile Number 1 is required" |
| Mobile Number 2 | Required, valid phone | "Mobile Number 2 is required" |
| Email | Required, valid format | "Email is required" or "Please enter a valid email" |

---

### STEP 4: Educational Attainment
**Required Fields: 3**
| Field | Validation | Error Message |
|-------|------------|---------------|
| Course Taken | Required | "Course Taken is required" |
| School Name | Required | "School Name is required" |
| School Address | Required | "School Address is required" |

---

### STEP 5: Shipboard Experience
**Required Fields: 0**
- All fields optional
- Can proceed immediately

---

### STEP 6: Documents
**Required Files: 4**
| File | Validation | Error Message |
|------|------------|---------------|
| E-Signature | Required | "E-Signature file is required" |
| ID Picture | Required | "ID Picture is required" |
| SRN Screenshot | Required | "SRN Screenshot is required" |
| Sea Service Book | Required | "Sea Service Book is required" |

**Optional Files: 2**
- Last Disembarkation
- Marina License

---

## 🧪 TESTING VALIDATION

### Test Scenario 1: Try Next Without Filling
```
Step 1: Leave all fields empty
Click "Next"

Expected:
❌ Cannot proceed
🔴 All required fields show red border
📝 Error messages under each field
⚠️ Alert shows: "Please fix the following errors: 1. First Name is required, 2. Last Name is required..."
```

---

### Test Scenario 2: Fill Fields Correctly
```
Step 1: Fill all required fields correctly
Click "Next"

Expected:
✅ Can proceed to Step 2
⚪ No errors shown
✅ Data preserved
```

---

### Test Scenario 3: Invalid Email Format
```
Step 1: Enter invalid email "test@test"
Click "Next"

Expected:
❌ Cannot proceed
🔴 Email field shows red border
📝 "Please enter a valid email address"
```

---

### Test Scenario 4: Address Validation
```
Step 2: Fill contact info but leave address incomplete
Click "Next"

Expected:
❌ Cannot proceed
🔴 Red alert box above address section
🔴 Missing dropdown fields show red border
📝 Error messages for each missing field
```

---

### Test Scenario 5: File Upload Validation
```
Step 6: Upload only 2 of 4 required files
Click "Save Changes"

Expected:
❌ Cannot submit
🔴 Red alert box at top
🔴 Missing file boxes show red with exclamation icon
📝 Error message in red box
```

---

## 🎯 USER EXPERIENCE

### Good Validation (What We Built)
```
User fills Step 1:
- First Name: ✅ "John"
- Last Name: ❌ (empty)
- Email: ✅ "john@test.com"

Clicks "Next":
❌ Blocked
🔴 Last Name field shows red border
📝 "Last Name is required" appears under field
⚠️ Alert: "Please fix the following errors: 1. Last Name is required"

User types: "Doe"
✅ Red border disappears
Clicks "Next":
✅ Proceeds to Step 2
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### Validation Flow:
```javascript
// 1. User clicks "Next"
handleNext() {
    // 2. Run validation for current step
    const stepErrors = validateStep(activeStep, logic);
    
    // 3. Check if errors exist
    if (Object.keys(stepErrors).length > 0) {
        // 4. Set errors in state
        setErrors(stepErrors);
        
        // 5. Show alert
        showValidationAlert(stepErrors);
        
        // 6. Prevent navigation
        return;
    }
    
    // 7. Clear errors
    setErrors({});
    
    // 8. Proceed to next step
    setActiveStep(prev => prev + 1);
}
```

---

### Error Display:
```javascript
// Text Field with Error
<TextField
    error={!!errors.firstName}     // Boolean: true if error exists
    helperText={errors.firstName}   // String: error message
/>

// Phone Input with Error
<Box sx={{ 
    '& .react-tel-input .form-control': {
        borderColor: errors.mobileNumber1 ? '#d32f2f' : undefined
    }
}}>
    <PhoneInput ... />
    {errors.mobileNumber1 && (
        <Typography sx={{ color: '#d32f2f' }}>
            {errors.mobileNumber1}
        </Typography>
    )}
</Box>

// File Upload with Error
<DragDropFileInput
    error={errors.signatureFile}  // Shows red box with exclamation
/>
```

---

## ✅ VALIDATION CHECKLIST

Implementation Complete:

- [x] formValidation.js created with all validation rules
- [x] Validation matches backend requirements
- [x] Step 1: 8 required fields validated
- [x] Step 2: 13 required fields validated
- [x] Step 3: 6 required fields validated
- [x] Step 4: 3 required fields validated
- [x] Step 5: 0 required fields (all optional)
- [x] Step 6: 4 required files validated
- [x] MUI error styling on all fields
- [x] Helper text error messages
- [x] Alert on validation failure
- [x] Prevents navigation on error
- [x] Clears errors on successful navigation
- [x] Error states persist across re-renders
- [x] Type="button" on Next/Back buttons

---

## 🚀 READY FOR TESTING

### Test Each Step:

**Step 1:**
- [ ] Try Next with empty fields
- [ ] Try with invalid email
- [ ] Try with non-numeric SRN
- [ ] Verify all errors show red borders

**Step 2:**
- [ ] Try Next without phone numbers
- [ ] Try with incomplete address
- [ ] Try with incomplete birthplace
- [ ] Verify cascade errors work

**Step 3:**
- [ ] Try Next with empty contact person
- [ ] Try with invalid email
- [ ] Try without phone numbers

**Step 4:**
- [ ] Try Next with empty education fields

**Step 5:**
- [ ] Should proceed immediately (no required fields)

**Step 6:**
- [ ] Try Save without all 4 required files
- [ ] Upload files and verify submission works

---

## 📖 FOR DEVELOPERS

### Adding New Validation:
1. Open `formValidation.js`
2. Find the appropriate step function
3. Add validation logic:
```javascript
if (!logic.newField) {
    errors.newField = 'This field is required';
}
```
4. Add error props to field in PersonalInfoStepper.js:
```javascript
<TextField
    error={!!errors.newField}
    helperText={errors.newField}
    onBlur={() => onFieldTouch('newField')}
/>
```

---

## 🎉 CONCLUSION

**Validation System: 100% Complete** ✅

Features:
- ✅ Step-by-step validation
- ✅ Cannot proceed with errors
- ✅ MUI error styling
- ✅ Clear error messages
- ✅ User-friendly alerts
- ✅ Matches backend validation
- ✅ Separate validation file
- ✅ Easy to maintain

**Users now have excellent form guidance!** 🚀

