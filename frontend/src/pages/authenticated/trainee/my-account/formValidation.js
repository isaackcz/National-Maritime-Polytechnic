

/**
 * @param {string} email    
 * @returns {boolean}   
 */
const isValidEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * @param {string} phone    
 * @returns {boolean}   
 */
const isValidPhone = (phone) => {
    if (!phone) return false;
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
};

/**
 * @param {object} logic    
 * @returns {object}   
 */
export const validateStep1 = (logic) => {
    const errors = {};
    
    if (!logic.firstName || logic.firstName.trim() === '') {
        errors.firstName = 'First Name is required';
    }
    
    if (!logic.lastName || logic.lastName.trim() === '') {
        errors.lastName = 'Last Name is required';
    }
    
    if (!logic.email || logic.email.trim() === '') {
        errors.email = 'Email is required';
    } else if (!isValidEmail(logic.email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    if (!logic.srn) {
        errors.srn = 'SRN Number is required';
    } else if (!/^\d+$/.test(logic.srn)) {
        errors.srn = 'SRN Number must contain only numbers';
    }
    
    if (!logic.userType) {
        errors.userType = 'User Type is required';
    }
    
    if (!logic.sex) {
        errors.sex = 'Sex is required';
    }
    
    if (!logic.civilStatus) {
        errors.civilStatus = 'Civil Status is required';
    }
    
    if (!logic.birthdate || logic.birthdate.trim() === '') {
        errors.birthdate = 'birthdate is required';
    }
    
    if (!logic.nationality) {
        errors.nationality = 'Nationality is required';
    }
    
    if (logic.nationality === 'Others' && (!logic.nationalityOther || logic.nationalityOther.trim() === '')) {
        errors.nationalityOther = 'Please specify your nationality';
    }
    
    return errors;
};

/**
 * @param {object} logic    
 * @returns {object}   
 */
export const validateStep2 = (logic) => {
    const errors = {};
    
    if (!logic.mobileNumber1 || logic.mobileNumber1.trim() === '') {
        errors.mobileNumber1 = 'Mobile Number 1 is required';
    } else if (!isValidPhone(logic.mobileNumber1)) {
        errors.mobileNumber1 = 'Please enter a valid phone number';
    }
    
    if (!logic.mobileNumber2 || logic.mobileNumber2.trim() === '') {
        errors.mobileNumber2 = 'Mobile Number 2 is required';
    } else if (!isValidPhone(logic.mobileNumber2)) {
        errors.mobileNumber2 = 'Please enter a valid phone number';
    }
    
    if (!logic.facebookAccount || logic.facebookAccount.trim() === '') {
        errors.facebookAccount = 'Facebook Account is required';
    }
    
    if (!logic.addressData?.region || logic.addressData.region.trim() === '') {
        errors.region = 'Region is required';
    }
    
    if (!logic.addressData?.province || logic.addressData.province.trim() === '') {
        errors.province = 'Province is required';
    }
    
    if (!logic.addressData?.municipality || logic.addressData.municipality.trim() === '') {
        errors.municipality = 'Municipality is required';
    }
    
    if (!logic.addressData?.barangay || logic.addressData.barangay.trim() === '') {
        errors.barangay = 'Barangay is required';
    }
    
    if (!logic.addressData?.postalCode || logic.addressData.postalCode.trim() === '') {
        errors.postalCode = 'Postal Code is required';
    } else if (!/^\d{4}$/.test(logic.addressData.postalCode)) {
        errors.postalCode = 'Postal Code must be 4 digits';
    }
    
    // Only validate birthplace if not using same as current address
    if (!logic.useSameAsCurrentAddress) {
        if (!logic.birthplaceAddress?.region || logic.birthplaceAddress.region.trim() === '') {
            errors.birthplaceRegion = 'Birthplace Region is required';
        }
        
        if (!logic.birthplaceAddress?.province || logic.birthplaceAddress.province.trim() === '') {
            errors.birthplaceProvince = 'Birthplace Province is required';
        }
        
        if (!logic.birthplaceAddress?.municipality || logic.birthplaceAddress.municipality.trim() === '') {
            errors.birthplaceMunicipality = 'Birthplace Municipality is required';
        }
        
        if (!logic.birthplaceAddress?.barangay || logic.birthplaceAddress.barangay.trim() === '') {
            errors.birthplaceBarangay = 'Birthplace Barangay is required';
        }
    }
    
    return errors;
};

/**
 * STEP 3 VALIDATION: Contact Person
 * 
 * @param {object} logic    
 * @returns {object}   
 */


    
export const validateStep3 = (logic) => {
    const errors = {};
    
    if (!logic.CPname || logic.CPname.trim() === '') {
        errors.CPname = 'Contact Person Name is required';
    }
    
    if (!logic.CPrelationship || logic.CPrelationship.trim() === '') {
        errors.CPrelationship = 'Relationship is required';
    }
    
    if (!logic.CPaddress || logic.CPaddress.trim() === '') {
        errors.CPaddress = 'Contact Person Address is required';
    }
    
    if (!logic.CPmobileNumber1 || logic.CPmobileNumber1.trim() === '') {
        errors.CPmobileNumber1 = 'Mobile Number 1 is required';
    } else if (!isValidPhone(logic.CPmobileNumber1)) {
        errors.CPmobileNumber1 = 'Please enter a valid phone number';
    }
    
    if (!logic.CPmobileNumber2 || logic.CPmobileNumber2.trim() === '') {
        errors.CPmobileNumber2 = 'Mobile Number 2 is required';
    } else if (!isValidPhone(logic.CPmobileNumber2)) {
        errors.CPmobileNumber2 = 'Please enter a valid phone number';
    }
    
    if (!logic.CPemail || logic.CPemail.trim() === '') {
        errors.CPemail = 'Email is required';
    } else if (!isValidEmail(logic.CPemail)) {
        errors.CPemail = 'Please enter a valid email address';
    }
    
    return errors;
};

export const validateStep4 = (logic) => {
    const errors = {};
    
    if (!logic.CourseTaken ) {
        errors.CourseTaken = 'Course Taken is required';
    }
    
    if (!logic.SchoolName) {
        errors.SchoolName = 'School Name is required';
    }
    if (!logic.YearGraduated) {
        errors.YearGraduated = 'Year Graduated is required';
    }
    return errors;
};

export const validateStep5 = (logic) => {
    const errors = {};
    
    if (logic.shipboardExperience === 'With Shipboard Experience') {
        if (!logic.license || logic.license.trim() === '') {
            errors.license = 'License is required for shipboard experience';
        }
        
        if (!logic.rank || logic.rank.trim() === '') {
            errors.rank = 'Rank is required for shipboard experience';
        }
        
        if (!logic.disembarkation || logic.disembarkation.trim() === '') {
            errors.disembarkation = 'Date of Disembarkation is required';
        }
        
        if (!logic.ShippingPrincipal || logic.ShippingPrincipal.trim() === '') {
            errors.ShippingPrincipal = 'Shipping Principal is required';
        }
        
        if (!logic.ManningCompany || logic.ManningCompany.trim() === '') {
            errors.ManningCompany = 'Manning Company is required';
        }
    }
    
    return errors;
};


export const validateStep6 = (logic) => {
    const errors = {};
    
    // Check if files exist (either new uploads OR existing file names)
    // For new users: check actual file objects
    // For existing users: check if file names exist (indicating files were previously uploaded)
    console.log("=== FILE VALIDATION DEBUG ===");
    console.log("All file states:", {
        signatureFile: logic.signatureFile,
        signatureFileName: logic.signatureFileName,
        IDPicture: logic.IDPicture,
        IDPictureFileName: logic.IDPictureFileName,
        SRNFile: logic.SRNFile,
        SRNFileName: logic.SRNFileName,
        seamansBook: logic.seamansBook,
        seamansBookFileName: logic.seamansBookFileName,
        LastDisembarkation: logic.LastDisembarkation,
        lastDisembarkationFileName: logic.lastDisembarkationFileName,
        licenseFile: logic.licenseFile,
        licenseFileName: logic.licenseFileName
    });
    
    // Only validate required files - signature, ID picture, SRN, and sea service book
    if (!logic.signatureFile && !logic.signatureFileName) {
        errors.signatureFile = 'E-Signature file is required';
        console.log("❌ SIGNATURE VALIDATION FAILED - file:", logic.signatureFile, "filename:", logic.signatureFileName);
    } else {
        console.log("✅ SIGNATURE VALIDATION PASSED - file:", logic.signatureFile, "filename:", logic.signatureFileName);
    }
    
    if (!logic.IDPicture && !logic.IDPictureFileName) {
        errors.IDPicture = 'ID Picture is required';
        console.log("❌ ID PICTURE VALIDATION FAILED - file:", logic.IDPicture, "filename:", logic.IDPictureFileName);
    } else {
        console.log("✅ ID PICTURE VALIDATION PASSED - file:", logic.IDPicture, "filename:", logic.IDPictureFileName);
    }
    
    if (!logic.SRNFile && !logic.SRNFileName) {
        errors.SRNFile = 'SRN Screenshot is required';
        console.log("❌ SRN VALIDATION FAILED - file:", logic.SRNFile, "filename:", logic.SRNFileName);
    } else {
        console.log("✅ SRN VALIDATION PASSED - file:", logic.SRNFile, "filename:", logic.SRNFileName);
    }
    
    if (!logic.seamansBook && !logic.seamansBookFileName) {
        errors.seamansBook = 'Sea Service Book is required';
        console.log("❌ SEAMANS BOOK VALIDATION FAILED - file:", logic.seamansBook, "filename:", logic.seamansBookFileName);
    } else {
        console.log("✅ SEAMANS BOOK VALIDATION PASSED - file:", logic.seamansBook, "filename:", logic.seamansBookFileName);
    }
    
    // Optional files - only validate if user has shipboard experience
    if (logic.shipboardExperience === 'With Shipboard Experience') {
        if (!logic.LastDisembarkation && !logic.lastDisembarkationFileName) {
            errors.lastDisembarkation = 'Last Disembarkation is required for shipboard experience';
            console.log("Last Disembarkation validation - file:", logic.LastDisembarkation, "filename:", logic.lastDisembarkationFileName);
        }
        
        if (!logic.licenseFile && !logic.licenseFileName) {
            errors.licenseFile = 'Marina License is required for shipboard experience';
            console.log("License validation - file:", logic.licenseFile, "filename:", logic.licenseFileName);
        }
    }
    
    return errors;
};

/**
 * @param {number} stepIndex 
 * @param {object} logic 
 * @returns {object}
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
 * @param {number} stepIndex 
 * @param {object} logic 
 * @returns {number}
 */
export const getStepErrorCount = (stepIndex, logic) => {
    const errors = validateStep(stepIndex, logic);
    return Object.keys(errors).length;
};

/**
 * @param {number} stepIndex 
 * @param {object} logic 
 * @returns {boolean} 
 */
export const isStepValid = (stepIndex, logic) => {
    return getStepErrorCount(stepIndex, logic) === 0;
};

/**
 * @param {object} errors 
 */