

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid, false if invalid
 */
const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number (basic check)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid, false if invalid
 */
const isValidPhone = (phone) => {
    if (!phone) return false;
    // Phone should have at least 10 digits
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
};

/**
 * STEP 1 VALIDATION: Basic Information
 * 
 * Required Fields:
 * - First Name
 * - Last Name
 * - Email (valid format)
 * - SRN Number (numeric)
 * - User Type (NEW or RETURNEE)
 * - Sex (MALE or FEMALE)
 * - Civil Status
 * - Nationality
 */
export const validateStep1 = (logic) => {
    const errors = {};
    
    // First Name - required
    if (!logic.firstName || logic.firstName.trim() === '') {
        errors.firstName = 'First Name is required';
    }
    
    // Last Name - required
    if (!logic.lastName || logic.lastName.trim() === '') {
        errors.lastName = 'Last Name is required';
    }
    
    // Email - required and must be valid format
    if (!logic.email || logic.email.trim() === '') {
        errors.email = 'Email is required';
    } else if (!isValidEmail(logic.email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    // SRN Number - required and must be numeric
    if (!logic.srn || logic.srn.trim() === '') {
        errors.srn = 'SRN Number is required';
    } else if (!/^\d+$/.test(logic.srn)) {
        errors.srn = 'SRN Number must contain only numbers';
    }
    
    // User Type - required
    if (!logic.userType) {
        errors.userType = 'User Type is required';
    }
    
    // Sex - required
    if (!logic.sex) {
        errors.sex = 'Sex is required';
    }
    
    // Civil Status - required
    if (!logic.civilStatus) {
        errors.civilStatus = 'Civil Status is required';
    }
    
    // Birthday - required
    if (!logic.birthday || logic.birthday.trim() === '') {
        errors.birthday = 'Birthday is required';
    }
    
    // Nationality - required
    if (!logic.nationality) {
        errors.nationality = 'Nationality is required';
    }
    
    // If nationality is Others, must specify
    if (logic.nationality === 'Others' && (!logic.nationalityOther || logic.nationalityOther.trim() === '')) {
        errors.nationalityOther = 'Please specify your nationality';
    }
    
    return errors;
};

/**
 * STEP 2 VALIDATION: Contact Information
 * 
 * Required Fields:
 * - Mobile Number 1
 * - Mobile Number 2
 * - Facebook Account
 * - Current Address (Region, Province, Municipality, Barangay, House No, Postal Code)
 * - Birthplace (Region, Province, Municipality, Barangay)
 */
export const validateStep2 = (logic) => {
    const errors = {};
    
    // Mobile Number 1 - required
    if (!logic.mobileNumber1 || logic.mobileNumber1.trim() === '') {
        errors.mobileNumber1 = 'Mobile Number 1 is required';
    } else if (!isValidPhone(logic.mobileNumber1)) {
        errors.mobileNumber1 = 'Please enter a valid phone number';
    }
    
    // Mobile Number 2 - required
    if (!logic.mobileNumber2 || logic.mobileNumber2.trim() === '') {
        errors.mobileNumber2 = 'Mobile Number 2 is required';
    } else if (!isValidPhone(logic.mobileNumber2)) {
        errors.mobileNumber2 = 'Please enter a valid phone number';
    }
    
    // Facebook Account - required
    if (!logic.facebookAccount || logic.facebookAccount.trim() === '') {
        errors.facebookAccount = 'Facebook Account is required';
    }
    
    // Current Address - Region
    if (!logic.addressData?.region || logic.addressData.region.trim() === '') {
        errors.region = 'Region is required';
    }
    
    // Current Address - Province
    if (!logic.addressData?.province || logic.addressData.province.trim() === '') {
        errors.province = 'Province is required';
    }
    
    // Current Address - Municipality
    if (!logic.addressData?.municipality || logic.addressData.municipality.trim() === '') {
        errors.municipality = 'Municipality is required';
    }
    
    // Current Address - Barangay
    if (!logic.addressData?.barangay || logic.addressData.barangay.trim() === '') {
        errors.barangay = 'Barangay is required';
    }
    
    // Current Address - House No
    if (!logic.addressData?.houseNo || logic.addressData.houseNo.trim() === '') {
        errors.houseNo = 'House No./Street is required';
    }
    
    // Current Address - Postal Code
    if (!logic.addressData?.postalCode || logic.addressData.postalCode.trim() === '') {
        errors.postalCode = 'Postal Code is required';
    } else if (!/^\d{4}$/.test(logic.addressData.postalCode)) {
        errors.postalCode = 'Postal Code must be 4 digits';
    }
    
    // Birthplace - Region
    if (!logic.birthplaceAddress?.region || logic.birthplaceAddress.region.trim() === '') {
        errors.birthplaceRegion = 'Birthplace Region is required';
    }
    
    // Birthplace - Province
    if (!logic.birthplaceAddress?.province || logic.birthplaceAddress.province.trim() === '') {
        errors.birthplaceProvince = 'Birthplace Province is required';
    }
    
    // Birthplace - Municipality
    if (!logic.birthplaceAddress?.municipality || logic.birthplaceAddress.municipality.trim() === '') {
        errors.birthplaceMunicipality = 'Birthplace Municipality is required';
    }
    
    // Birthplace - Barangay
    if (!logic.birthplaceAddress?.barangay || logic.birthplaceAddress.barangay.trim() === '') {
        errors.birthplaceBarangay = 'Birthplace Barangay is required';
    }
    
    return errors;
};

/**
 * STEP 3 VALIDATION: Contact Person
 * 
 * Required Fields:
 * - Contact Person Name
 * - Relationship
 * - Address
 * - Mobile Number 1
 * - Mobile Number 2
 * - Email (valid format)
 */
export const validateStep3 = (logic) => {
    const errors = {};
    
    // Contact Person Name - required
    if (!logic.CPname || logic.CPname.trim() === '') {
        errors.CPname = 'Contact Person Name is required';
    }
    
    // Relationship - required
    if (!logic.CPrelationship || logic.CPrelationship.trim() === '') {
        errors.CPrelationship = 'Relationship is required';
    }
    
    // Address - required
    if (!logic.CPaddress || logic.CPaddress.trim() === '') {
        errors.CPaddress = 'Contact Person Address is required';
    }
    
    // Mobile Number 1 - required
    if (!logic.CPmobileNumber1 || logic.CPmobileNumber1.trim() === '') {
        errors.CPmobileNumber1 = 'Mobile Number 1 is required';
    } else if (!isValidPhone(logic.CPmobileNumber1)) {
        errors.CPmobileNumber1 = 'Please enter a valid phone number';
    }
    
    // Mobile Number 2 - required
    if (!logic.CPmobileNumber2 || logic.CPmobileNumber2.trim() === '') {
        errors.CPmobileNumber2 = 'Mobile Number 2 is required';
    } else if (!isValidPhone(logic.CPmobileNumber2)) {
        errors.CPmobileNumber2 = 'Please enter a valid phone number';
    }
    
    // Email - required and must be valid format
    if (!logic.CPemail || logic.CPemail.trim() === '') {
        errors.CPemail = 'Email is required';
    } else if (!isValidEmail(logic.CPemail)) {
        errors.CPemail = 'Please enter a valid email address';
    }
    
    return errors;
};

/**
 * STEP 4 VALIDATION: Educational Attainment
 * 
 * Required Fields:
 * - Course Taken
 * - School Name
 * - School Address
 */
export const validateStep4 = (logic) => {
    const errors = {};
    
    // Course Taken - required
    if (!logic.CourseTaken || logic.CourseTaken.trim() === '') {
        errors.CourseTaken = 'Course Taken is required';
    }
    
    // School Name - required
    if (!logic.SchoolName || logic.SchoolName.trim() === '') {
        errors.SchoolName = 'School Name is required';
    }
    
    // School Address - required
    if (!logic.SchoolAddress || logic.SchoolAddress.trim() === '') {
        errors.SchoolAddress = 'School Address is required';
    }
    
    return errors;
};

/**
 * STEP 5 VALIDATION: Shipboard Experience
 * 
 * If user selects "With Shipboard Experience", validate latest shipboard details
 * If user selects "No Shipboard Experience", skip validation
 */
export const validateStep5 = (logic) => {
    const errors = {};
    
    // Only validate if user has shipboard experience
    if (logic.shipboardExperience === 'With Shipboard Experience') {
        // License - required when with experience
        if (!logic.license || logic.license.trim() === '') {
            errors.license = 'License is required for shipboard experience';
        }
        
        // Rank - required when with experience
        if (!logic.rank || logic.rank.trim() === '') {
            errors.rank = 'Rank is required for shipboard experience';
        }
        
        // Date of Disembarkation - required when with experience
        if (!logic.disembarkation || logic.disembarkation.trim() === '') {
            errors.disembarkation = 'Date of Disembarkation is required';
        }
        
        // Shipping Principal - required when with experience
        if (!logic.ShippingPrincipal || logic.ShippingPrincipal.trim() === '') {
            errors.ShippingPrincipal = 'Shipping Principal is required';
        }
        
        // Manning Company - required when with experience
        if (!logic.ManningCompany || logic.ManningCompany.trim() === '') {
            errors.ManningCompany = 'Manning Company is required';
        }
    }
    
    // If "No Shipboard Experience", no validation needed
    return errors;
};

/**
 * STEP 6 VALIDATION: Documents
 * 
 * Required Files:
 * - E-Signature
 * - ID Picture
 * - SRN Screenshot
 * - Sea Service Book
 * 
 * Optional Files:
 * - Last Disembarkation
 * - Marina License
 */
export const validateStep6 = (logic) => {
    const errors = {};
    
    // Signature - required
    if (!logic.signatureFile) {
        errors.signatureFile = 'E-Signature file is required';
    }
    
    // ID Picture - required
    if (!logic.IDPicture) {
        errors.IDPicture = 'ID Picture is required';
    }
    
    // SRN Screenshot - required
    if (!logic.SRNFile) {
        errors.SRNFile = 'SRN Screenshot is required';
    }
    
    // Sea Service Book - required
    if (!logic.seamansBook) {
        errors.seamansBook = 'Sea Service Book is required';
    }
    
    return errors;
};

/**
 * Validate specific step based on step number
 * @param {number} stepIndex - Step index (0-5)
 * @param {object} logic - Logic object with all form data
 * @returns {object} - Object with field errors
 */
export const validateStep = (stepIndex, logic) => {
    switch(stepIndex) {
        case 0:
            return validateStep1(logic);
        case 1:
            return validateStep2(logic);
        case 2:
            return validateStep3(logic);
        case 3:
            return validateStep4(logic);
        case 4:
            return validateStep5(logic);
        case 5:
            return validateStep6(logic);
        default:
            return {};
    }
};

/**
 * Get error count for a step
 * @param {number} stepIndex - Step index (0-5)
 * @param {object} logic - Logic object with all form data
 * @returns {number} - Number of errors in the step
 */
export const getStepErrorCount = (stepIndex, logic) => {
    const errors = validateStep(stepIndex, logic);
    return Object.keys(errors).length;
};

/**
 * Check if step is valid (no errors)
 * @param {number} stepIndex - Step index (0-5)
 * @param {object} logic - Logic object with all form data
 * @returns {boolean} - True if valid, false if has errors
 */
export const isStepValid = (stepIndex, logic) => {
    return getStepErrorCount(stepIndex, logic) === 0;
};

/**
 * Show error alert with list of issues
 * DISABLED: Using MUI inline validation instead of alert popups
 * 
 * @param {object} errors - Object containing field errors
 */
// export const showValidationAlert = (errors) => {
//     const errorMessages = Object.values(errors);
//     
//     if (errorMessages.length === 0) return;
//     
//     const message = `Please fix the following errors:\n\n${errorMessages.map((err, i) => `${i + 1}. ${err}`).join('\n')}`;
//     alert(message);
// };

