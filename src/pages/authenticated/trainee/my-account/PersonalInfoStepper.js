import { useState } from 'react';
import { Stepper, Step, StepLabel, Box, Button, TextField, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Paper, Typography, Divider, Grid } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import '../components/stepperCustom.css';
import PhilippinesAddressDropdown from './PhilippinesAddressDropdown';
import DragDropFileInput from '../components/DragDropFileInput';
import { textFieldProps, dateFieldProps, menuItemProps, phoneInputWrapperProps, radioProps, radioLabelProps, radioGroupLabelProps, formLabelProps, sectionTitleProps } from '../components/inputStyles';
import { validateStep } from './formValidation';

const steps = ['Basic Info', 'Contact Info', 'Contact Person', 'Education', 'Shipboard Exp.', 'Documents'];

// Reusable Section Header Component
const SectionHeader = ({ icon, title, subtitle }) => (
    <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#323130', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <i className={`${icon} text-primary`} style={{ fontSize: '16px' }}></i>
            {title}
        </Typography>
        {subtitle && (
            <Typography sx={{ fontSize: '11px', color: '#605E5C', pl: 3 }}>
                {subtitle}
            </Typography>
        )}
        <Divider sx={{ mt: 1.5, borderColor: '#E1DFDD' }} />
    </Box>
);

// Info Card Wrapper
const InfoCard = ({ children, elevation = 0 }) => (
    <Paper elevation={elevation} className="info-card-transition" sx={{ p: { xs: 2, md: 2.5 }, mb: 2, border: '1px solid #E1DFDD', borderRadius: '8px', backgroundColor: '#FAFAFA' }}>
        {children}
    </Paper>
);

const PersonalInfoStepper = ({ logic, onSubmit }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [errors, setErrors] = useState({}); // Track validation errors
    const [touched, setTouched] = useState({}); // Track which fields user has interacted with
    
    /**
     * Handle form submission
     * Only allows submission when on the final step (step 5 - Documents)
     * Prevents accidental form submission during step navigation
     */
    const handleFormSubmit = (e) => {
        e.preventDefault(); // Always prevent default form behavior
        
        // SAFEGUARD: Only allow submission on final step
        if (activeStep !== steps.length - 1) {
            console.log(`⚠️ Blocked form submission - Currently on step ${activeStep + 1}, not on final step`);
            return; // Don't submit if not on final step
        }
        
        // Validate final step before submitting
        const stepErrors = validateStep(activeStep, logic);
        
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            console.log("❌ Form has validation errors - submission blocked");
            return;
        }
        
        // All checks passed - proceed with actual submission
        console.log("✅ Form validation passed - proceeding with submission");
        logic.SubmitFormPersonal(e);
    };

    /**
     * Handle Next button with validation
     * Validates current step before allowing navigation
     * Shows MUI validation errors (red borders + helper text) without alert popup
     */
    const handleNext = () => {
        // Validate current step
        const stepErrors = validateStep(activeStep, logic);
        
        // If there are errors, show them and prevent navigation
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            // No alert - user sees red borders and error messages on fields
            return;
        }
        
        // Clear errors and proceed to next step
        setErrors({});
        setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    /**
     * Handle Back button
     * Clears errors when going back
     */
    const handleBack = () => {
        setErrors({});
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    /**
     * Mark field as touched when user interacts with it
     */
    const handleFieldTouch = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
    };

    /**
     * Real-time validation: Clear error when field becomes valid
     * This removes the error display the moment validation is met
     */
    const clearErrorIfValid = (fieldName, value) => {
        // If there's currently an error for this field
        if (errors[fieldName]) {
            // Validate current step
            const stepErrors = validateStep(activeStep, logic);
            
            // If this field is now valid, remove its error
            if (!stepErrors[fieldName]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldName];
                    return newErrors;
                });
            }
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return <BasicInfoStep logic={logic} errors={errors} onFieldTouch={handleFieldTouch} clearErrorIfValid={clearErrorIfValid} />;
            case 1:
                return <ContactInfoStep logic={logic} errors={errors} onFieldTouch={handleFieldTouch} clearErrorIfValid={clearErrorIfValid} />;
            case 2:
                return <ContactPersonStep logic={logic} errors={errors} onFieldTouch={handleFieldTouch} clearErrorIfValid={clearErrorIfValid} />;
            case 3:
                return <EducationStep logic={logic} errors={errors} onFieldTouch={handleFieldTouch} clearErrorIfValid={clearErrorIfValid} />;
            case 4:
                return <ShipboardStep logic={logic} errors={errors} onFieldTouch={handleFieldTouch} clearErrorIfValid={clearErrorIfValid} />;
            case 5:
                return <DocumentsStep logic={logic} errors={errors} onFieldTouch={handleFieldTouch} clearErrorIfValid={clearErrorIfValid} />;
            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleFormSubmit} method="POST" encType="multipart/form-data">
            <Box>
                <Stepper 
                    activeStep={activeStep} 
                    alternativeLabel 
                    sx={{ 
                        mb: { xs: 2, md: 3 },
                        '& .MuiStepLabel-label': {
                            fontSize: { xs: '0.65rem', sm: '0.75rem' }
                        },
                        '& .MuiStepIcon-root': {
                            fontSize: { xs: '1.2rem', sm: '1.5rem' }
                        }
                    }}
                >
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box className="stepper-content-scroll" sx={{ minHeight: { xs: '300px', md: '450px' }, mb: 2, maxHeight: '75vh', overflowY: 'auto', overflowX: 'hidden', pr: 0.5 }}>
                    {renderStepContent(activeStep)}
                </Box>

            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                justifyContent: 'space-between', 
                gap: 2, 
                mt: 3,
                pt: 2,
                borderTop: '1px solid #E1DFDD'
            }}>
                <Button 
                    type="button"
                    disabled={activeStep === 0} 
                    onClick={handleBack}
                    variant="outlined"
                    size="medium"
                    startIcon={<i className="fas fa-arrow-left" style={{ fontSize: '12px' }}></i>}
                    sx={{ 
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { sm: '120px' },
                        fontSize: '13px', 
                        fontWeight: 500,
                        py: 1,
                        px: 3,
                        textTransform: 'none',
                        borderColor: '#D1D1D1',
                        color: '#323130',
                        '&:hover': {
                            borderColor: '#0078D4',
                            backgroundColor: '#F3F2F1'
                        },
                        '&.Mui-disabled': {
                            borderColor: '#E1DFDD',
                            color: '#A19F9D'
                        }
                    }}
                >
                    Back
                </Button>
                {activeStep === steps.length - 1 ? (
                    <Button 
                        variant="contained" 
                        color="primary" 
                        type="submit"
                        size="medium"
                        endIcon={<i className="fas fa-save" style={{ fontSize: '12px' }}></i>}
                        sx={{ 
                            width: { xs: '100%', sm: 'auto' },
                            minWidth: { sm: '140px' },
                            fontSize: '13px', 
                            fontWeight: 600,
                            py: 1,
                            px: 3,
                            textTransform: 'none',
                            backgroundColor: '#0078D4',
                            boxShadow: '0 2px 4px rgba(0,120,212,0.2)',
                            '&:hover': {
                                backgroundColor: '#106EBE',
                                boxShadow: '0 4px 8px rgba(0,120,212,0.3)'
                            }
                        }}
                    >
                        Save Changes
                    </Button>
                ) : (
                    <Button 
                        type="button"
                        variant="contained" 
                        onClick={handleNext}
                        size="medium"
                        endIcon={<i className="fas fa-arrow-right" style={{ fontSize: '12px' }}></i>}
                        sx={{ 
                            width: { xs: '100%', sm: 'auto' },
                            minWidth: { sm: '120px' },
                            fontSize: '13px', 
                            fontWeight: 600,
                            py: 1,
                            px: 3,
                            textTransform: 'none',
                            backgroundColor: '#0078D4',
                            boxShadow: '0 2px 4px rgba(0,120,212,0.2)',
                            '&:hover': {
                                backgroundColor: '#106EBE',
                                boxShadow: '0 4px 8px rgba(0,120,212,0.3)'
                            }
                        }}
                    >
                        Next
                    </Button>
                )}
            </Box>
            </Box>
        </form>
    );
};

// Step 1: Basic Information
const BasicInfoStep = ({ logic, errors, onFieldTouch, clearErrorIfValid }) => (
    <Box>
        <SectionHeader icon="fas fa-user-circle" title="Personal Information" subtitle="Provide your basic personal details" />
        
        <InfoCard>
            {/* Name Fields - Auto-fit with minimum 150px */}
            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 2,
                mb: 2
            }}>
                <TextField 
                    label="First Name" 
                    value={logic.firstName} 
                    onChange={(e) => {
                        logic.setFirstName(e.target.value);
                        clearErrorIfValid('firstName', e.target.value);
                    }} 
                    onBlur={() => onFieldTouch('firstName')}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    required 
                    fullWidth 
                    {...textFieldProps} 
                />
                <TextField 
                    label="Middle Name" 
                    value={logic.middlename} 
                    onChange={(e) => logic.setMiddlename(e.target.value)} 
                    fullWidth 
                    {...textFieldProps} 
                />
                <TextField 
                    label="Last Name" 
                    value={logic.lastName} 
                    onChange={(e) => {
                        logic.setLastName(e.target.value);
                        clearErrorIfValid('lastName', e.target.value);
                    }} 
                    onBlur={() => onFieldTouch('lastName')}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    required 
                    fullWidth 
                    {...textFieldProps} 
                />
                <TextField 
                    label="Suffix" 
                    value={logic.suffix} 
                    onChange={(e) => logic.setSuffix(e.target.value)} 
                    fullWidth 
                    {...textFieldProps} 
                />
            </Box>

            {/* Email and SRN - 2 columns */}
            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 2
            }}>
                <TextField 
                    label="Email" 
                    type="email" 
                    value={logic.email} 
                    onChange={(e) => {
                        logic.setEmail(e.target.value);
                        clearErrorIfValid('email', e.target.value);
                    }} 
                    onBlur={() => onFieldTouch('email')}
                    error={!!errors.email}
                    helperText={errors.email}
                    required 
                    fullWidth 
                    {...textFieldProps} 
                />
                <TextField 
                    label="SRN Number" 
                    value={logic.srn} 
                    onChange={(e) => {
                        // Only allow numbers - backend expects integer
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        logic.setsrn(value);
                        clearErrorIfValid('srn', value);
                    }} 
                    onBlur={() => onFieldTouch('srn')}
                    error={!!errors.srn}
                    helperText={errors.srn}
                    required
                    fullWidth 
                    {...textFieldProps}
                    inputProps={{ 
                        inputMode: 'numeric',
                        pattern: '[0-9]*'
                    }}
                    InputProps={{
                        startAdornment: <i className="fas fa-id-badge mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                    }}
                />
            </Box>
        </InfoCard>

        <SectionHeader icon="fas fa-id-card" title="Demographics" subtitle="Date of birth and identification details" />
        
        <InfoCard>
            {/* User Type, Sex, Birthday - 3 columns auto-fit */}
            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 2,
                mb: 2
            }}>
                <TextField
                    select
                    label="User Type"
                    value={logic.userType}
                    onChange={(e) => {
                        logic.setUserType(e.target.value);
                        clearErrorIfValid('userType', e.target.value);
                    }}
                    onBlur={() => onFieldTouch('userType')}
                    error={!!errors.userType}
                    helperText={errors.userType}
                    required
                    fullWidth
                    {...textFieldProps}
                    InputProps={{
                        startAdornment: <i className="fas fa-user-tag mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                    }}
                >
                    <MenuItem value="NEW" {...menuItemProps}>New</MenuItem>
                    <MenuItem value="RETURNEE" {...menuItemProps}>Returnee</MenuItem>
                </TextField>
                <TextField
                    select
                    label="Sex"
                    value={logic.sex}
                    onChange={(e) => {
                        logic.setSex(e.target.value);
                        clearErrorIfValid('sex', e.target.value);
                    }}
                    onBlur={() => onFieldTouch('sex')}
                    error={!!errors.sex}
                    helperText={errors.sex}
                    required
                    fullWidth
                    {...textFieldProps}
                    InputProps={{
                        startAdornment: <i className="fas fa-venus-mars mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                    }}
                >
                    <MenuItem value="MALE" {...menuItemProps}>Male</MenuItem>
                    <MenuItem value="FEMALE" {...menuItemProps}>Female</MenuItem>
                </TextField>
                <TextField 
                    label="Birthday" 
                    value={logic.birthday} 
                    onChange={(e) => {
                        logic.setBirthday(e.target.value);
                        clearErrorIfValid('birthday', e.target.value);
                    }} 
                    onBlur={() => onFieldTouch('birthday')}
                    error={!!errors.birthday}
                    helperText={errors.birthday}
                    required
                    fullWidth 
                    {...dateFieldProps}
                    InputProps={{
                        startAdornment: <i className="fas fa-calendar mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                    }}
                />
            </Box>
            
            {/* Civil Status and Nationality - 2 columns */}
            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 2
            }}>
                <TextField
                    select
                    label="Civil Status"
                    value={logic.civilStatus}
                    onChange={(e) => {
                        logic.setCivilStatus(e.target.value);
                        clearErrorIfValid('civilStatus', e.target.value);
                    }}
                    onBlur={() => onFieldTouch('civilStatus')}
                    error={!!errors.civilStatus}
                    helperText={errors.civilStatus}
                    required
                    fullWidth
                    {...textFieldProps}
                    InputProps={{
                        startAdornment: <i className="fas fa-ring mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                    }}
                >
                    <MenuItem value="SINGLE" {...menuItemProps}>Single</MenuItem>
                    <MenuItem value="MARRIED" {...menuItemProps}>Married</MenuItem>
                    <MenuItem value="WIDOWED" {...menuItemProps}>Widowed</MenuItem>
                    <MenuItem value="DIVORCED" {...menuItemProps}>Divorced</MenuItem>
                    <MenuItem value="SEPARATED" {...menuItemProps}>Separated</MenuItem>
                </TextField>
                <TextField
                    select
                    label="Nationality"
                    value={logic.nationality}
                    onChange={(e) => {
                        logic.setNationality(e.target.value);
                        clearErrorIfValid('nationality', e.target.value);
                    }}
                    onBlur={() => onFieldTouch('nationality')}
                    error={!!errors.nationality}
                    helperText={errors.nationality}
                    required
                    fullWidth
                    {...textFieldProps}
                    InputProps={{
                        startAdornment: <i className="fas fa-flag mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                    }}
                >
                    <MenuItem value="Filipino" {...menuItemProps}>Filipino</MenuItem>
                    <MenuItem value="Others" {...menuItemProps}>Others</MenuItem>
                </TextField>
                {logic.nationality === 'Others' && (
                    <TextField 
                        label="Specify Nationality" 
                        value={logic.nationalityOther} 
                        onChange={(e) => {
                            logic.setNationalityOther(e.target.value);
                            clearErrorIfValid('nationalityOther', e.target.value);
                        }} 
                        onBlur={() => onFieldTouch('nationalityOther')}
                        error={!!errors.nationalityOther}
                        helperText={errors.nationalityOther}
                        required 
                        fullWidth 
                        {...textFieldProps}
                        InputProps={{
                            startAdornment: <i className="fas fa-globe mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                        }}
                    />
                )}
            </Box>
        </InfoCard>
    </Box>
);

// Step 2: Contact Information
const ContactInfoStep = ({ logic, errors, onFieldTouch, clearErrorIfValid }) => (
    <Box>
        <SectionHeader icon="fas fa-phone-alt" title="Contact Numbers" subtitle="How can we reach you?" />
        
        <InfoCard>
            {/* Mobile Numbers - 2 columns */}
            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 2,
                mb: 2
            }}>
                <MuiTelInput 
                    label="Mobile Number 1" 
                    value={logic.mobileNumber1} 
                    onChange={(value, info) => {
                        // Limit to 11 digits for PH numbers
                        const digits = value.replace(/\D/g, '');
                        if (digits.length <= 13) { // +63 (2 digits) + 11 digits = 13
                            logic.setMobileNumber1(value);
                            clearErrorIfValid('mobileNumber1', value);
                        }
                    }}
                    onBlur={() => onFieldTouch('mobileNumber1')}
                    error={!!errors.mobileNumber1}
                    helperText={errors.mobileNumber1 || 'Max 11 digits'}
                    defaultCountry="PH"
                    required
                    fullWidth
                    {...textFieldProps}
                />
                <MuiTelInput 
                    label="Mobile Number 2" 
                    value={logic.mobileNumber2} 
                    onChange={(value, info) => {
                        // Limit to 11 digits for PH numbers
                        const digits = value.replace(/\D/g, '');
                        if (digits.length <= 13) { // +63 (2 digits) + 11 digits = 13
                            logic.setMobileNumber2(value);
                            clearErrorIfValid('mobileNumber2', value);
                        }
                    }}
                    onBlur={() => onFieldTouch('mobileNumber2')}
                    error={!!errors.mobileNumber2}
                    helperText={errors.mobileNumber2 || 'Max 11 digits'}
                    defaultCountry="PH"
                    required
                    fullWidth
                    {...textFieldProps}
                />
            </Box>

            {/* Area Code, Landline, Facebook - Auto-fit 3 columns */}
            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 2
            }}>
                <TextField 
                    label="Area Code" 
                    value={logic.areaCode} 
                    onChange={(e) => logic.setAreaCode(e.target.value)} 
                    fullWidth 
                    {...textFieldProps} 
                    placeholder="e.g., 02"
                    InputProps={{
                        startAdornment: <i className="fas fa-hashtag mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                    }}
                />
                <TextField 
                    label="Landline" 
                    value={logic.landline} 
                    onChange={(e) => logic.setLandline(e.target.value)} 
                    fullWidth 
                    {...textFieldProps} 
                    InputProps={{ startAdornment: <i className="fas fa-phone mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} 
                />
                <TextField 
                    label="Facebook Account" 
                    value={logic.facebookAccount} 
                    onChange={(e) => {
                        logic.setFacebookAccount(e.target.value);
                        clearErrorIfValid('facebookAccount', e.target.value);
                    }}
                    onBlur={() => onFieldTouch('facebookAccount')}
                    error={!!errors.facebookAccount}
                    helperText={errors.facebookAccount} 
                    required 
                    fullWidth 
                    {...textFieldProps} 
                    InputProps={{ startAdornment: <i className="fab fa-facebook mr-2" style={{ fontSize: '12px', color: '#1877F2' }}></i> }} 
                />
            </Box>
        </InfoCard>

        <SectionHeader icon="fas fa-map-marker-alt" title="Current Address" subtitle="Where do you currently reside?" />
        
        <InfoCard>
            {(errors.region || errors.province || errors.municipality || errors.barangay || errors.houseNo || errors.postalCode) && (
                <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#ffebee', borderRadius: 1, border: '1px solid #f44336' }}>
                    <Typography sx={{ fontSize: '13px', color: '#d32f2f', fontWeight: 500 }}>
                        <i className="fas fa-exclamation-circle mr-2"></i>
                        Please complete all required address fields
                    </Typography>
                </Box>
            )}
            <PhilippinesAddressDropdown 
                addressData={logic.addressData} 
                setAddressData={logic.setAddressData}
                errors={errors}
                onFieldTouch={onFieldTouch} 
            />
        </InfoCard>

        <SectionHeader icon="fas fa-birthday-cake" title="Birthplace" subtitle="Where were you born?" />
        
        <InfoCard>
            {(errors.birthplaceRegion || errors.birthplaceProvince || errors.birthplaceMunicipality || errors.birthplaceBarangay) && (
                <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#ffebee', borderRadius: 1, border: '1px solid #f44336' }}>
                    <Typography sx={{ fontSize: '13px', color: '#d32f2f', fontWeight: 500 }}>
                        <i className="fas fa-exclamation-circle mr-2"></i>
                        Please complete all required birthplace fields
                    </Typography>
                </Box>
            )}
            <PhilippinesAddressDropdown 
                addressData={logic.birthplaceAddress} 
                setAddressData={logic.setBirthplaceAddress} 
                showPostalCode={false}
                errors={errors}
                onFieldTouch={onFieldTouch}
                fieldPrefix="birthplace"
            />
        </InfoCard>
    </Box>
);

// Step 3: Contact Person
const ContactPersonStep = ({ logic, errors, onFieldTouch, clearErrorIfValid }) => (
    <Box>
        <SectionHeader icon="fas fa-user-friends" title="Emergency Contact Person" subtitle="Who should we contact in case of emergency?" />
        
        <InfoCard>
            {/* Name (60%) and Relationship (40%) - flexible layout */}
            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 2,
                mb: 2
            }}>
                <Box sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
                    <TextField 
                        label="Contact Person Name" 
                        value={logic.CPname} 
                        onChange={(e) => {
                            logic.setCPname(e.target.value);
                            clearErrorIfValid('CPname', e.target.value);
                        }}
                        onBlur={() => onFieldTouch('CPname')}
                        error={!!errors.CPname}
                        helperText={errors.CPname} 
                        required 
                        fullWidth 
                        {...textFieldProps} 
                        InputProps={{ startAdornment: <i className="fas fa-user mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} 
                    />
                </Box>
                <TextField 
                    label="Relationship" 
                    value={logic.CPrelationship} 
                    onChange={(e) => {
                        logic.setCPrelationship(e.target.value);
                        clearErrorIfValid('CPrelationship', e.target.value);
                    }}
                    onBlur={() => onFieldTouch('CPrelationship')}
                    error={!!errors.CPrelationship}
                    helperText={errors.CPrelationship} 
                    required 
                    fullWidth 
                    {...textFieldProps} 
                    InputProps={{ startAdornment: <i className="fas fa-heart mr-2 text-danger" style={{ fontSize: '12px' }}></i> }} 
                />
            </Box>

            {/* Address - Full width */}
            <TextField 
                label="Address" 
                value={logic.CPaddress} 
                onChange={(e) => {
                    logic.setCPaddress(e.target.value);
                    clearErrorIfValid('CPaddress', e.target.value);
                }}
                onBlur={() => onFieldTouch('CPaddress')}
                error={!!errors.CPaddress}
                helperText={errors.CPaddress} 
                required 
                fullWidth 
                {...textFieldProps} 
                InputProps={{ startAdornment: <i className="fas fa-home mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} 
            />
        </InfoCard>

        <SectionHeader icon="fas fa-address-book" title="Contact Person Details" subtitle="How can we reach them?" />
        
        <InfoCard>
            {/* Mobile numbers - 2 columns */}
            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 2,
                mb: 2
            }}>
                <MuiTelInput 
                    label="Contact Person Mobile Number 1" 
                    value={logic.CPmobileNumber1} 
                    onChange={(value, info) => {
                        // Limit to 11 digits for PH numbers
                        const digits = value.replace(/\D/g, '');
                        if (digits.length <= 13) { // +63 (2 digits) + 11 digits = 13
                            logic.setCPmobileNumber1(value);
                            clearErrorIfValid('CPmobileNumber1', value);
                        }
                    }}
                    onBlur={() => onFieldTouch('CPmobileNumber1')}
                    error={!!errors.CPmobileNumber1}
                    helperText={errors.CPmobileNumber1 || 'Max 11 digits'}
                    defaultCountry="PH"
                    required
                    fullWidth
                    {...textFieldProps}
                />
                <MuiTelInput 
                    label="Contact Person Mobile Number 2" 
                    value={logic.CPmobileNumber2} 
                    onChange={(value, info) => {
                        // Limit to 11 digits for PH numbers
                        const digits = value.replace(/\D/g, '');
                        if (digits.length <= 13) { // +63 (2 digits) + 11 digits = 13
                            logic.setCPmobileNumber2(value);
                            clearErrorIfValid('CPmobileNumber2', value);
                        }
                    }}
                    onBlur={() => onFieldTouch('CPmobileNumber2')}
                    error={!!errors.CPmobileNumber2}
                    helperText={errors.CPmobileNumber2 || 'Max 11 digits'}
                    defaultCountry="PH"
                    required
                    fullWidth
                    {...textFieldProps}
                />
            </Box>

            {/* Email and Telephone - 2 columns */}
            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 2
            }}>
                <TextField 
                    label="Email" 
                    type="email" 
                    value={logic.CPemail} 
                    onChange={(e) => {
                        logic.setCPemail(e.target.value);
                        clearErrorIfValid('CPemail', e.target.value);
                    }}
                    onBlur={() => onFieldTouch('CPemail')}
                    error={!!errors.CPemail}
                    helperText={errors.CPemail} 
                    required 
                    fullWidth 
                    {...textFieldProps} 
                    InputProps={{ startAdornment: <i className="fas fa-envelope mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} 
                />
                <TextField 
                    label="Telephone Number" 
                    value={logic.CPtelephoneNumber} 
                    onChange={(e) => logic.setCPtelephoneNumber(e.target.value)} 
                    fullWidth 
                    {...textFieldProps} 
                    InputProps={{ startAdornment: <i className="fas fa-phone mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} 
                />
            </Box>
        </InfoCard>
    </Box>
);

// Step 4: Educational Attainment
const EducationStep = ({ logic, errors, onFieldTouch, clearErrorIfValid }) => (
    <Box>
        <SectionHeader icon="fas fa-graduation-cap" title="Educational Background" subtitle="Tell us about your educational qualifications" />
        
        <InfoCard>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField 
                    label="Course Taken" 
                    value={logic.CourseTaken} 
                    onChange={(e) => {
                        logic.setCourseTaken(e.target.value);
                        clearErrorIfValid('CourseTaken', e.target.value);
                    }}
                    onBlur={() => onFieldTouch('CourseTaken')}
                    error={!!errors.CourseTaken}
                    helperText={errors.CourseTaken} 
                    required 
                    fullWidth 
                    {...textFieldProps} 
                    InputProps={{ startAdornment: <i className="fas fa-book mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} 
                    placeholder="e.g., BS Marine Transportation" 
                />
                <TextField 
                    label="School Name" 
                    value={logic.SchoolName} 
                    onChange={(e) => {
                        logic.setSchoolName(e.target.value);
                        clearErrorIfValid('SchoolName', e.target.value);
                    }}
                    onBlur={() => onFieldTouch('SchoolName')}
                    error={!!errors.SchoolName}
                    helperText={errors.SchoolName} 
                    required 
                    fullWidth 
                    {...textFieldProps} 
                    InputProps={{ startAdornment: <i className="fas fa-university mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} 
                    placeholder="e.g., Philippine Merchant Marine Academy" 
                />
                <TextField 
                    label="School Address" 
                    value={logic.SchoolAddress} 
                    onChange={(e) => {
                        logic.setSchoolAddress(e.target.value);
                        clearErrorIfValid('SchoolAddress', e.target.value);
                    }}
                    onBlur={() => onFieldTouch('SchoolAddress')}
                    error={!!errors.SchoolAddress}
                    helperText={errors.SchoolAddress} 
                    required 
                    fullWidth 
                    {...textFieldProps} 
                    InputProps={{ startAdornment: <i className="fas fa-map-marker-alt mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} 
                    placeholder="Complete school address" 
                />
            </Box>
        </InfoCard>
    </Box>
);

// Step 5: Shipboard Experience
const ShipboardStep = ({ logic, errors, onFieldTouch, clearErrorIfValid }) => (
    <Box>
        <SectionHeader icon="fas fa-ship" title="Shipboard Experience" subtitle="Do you have any previous maritime work experience?" />
        
        <InfoCard>
            <FormControl component="fieldset" fullWidth>
                <FormLabel {...radioGroupLabelProps} sx={{ mb: 1.5 }}>
                    <i className="fas fa-anchor mr-2 text-primary"></i>
                    Experience Status
                </FormLabel>
                <RadioGroup value={logic.shipboardExperience} onChange={(e) => logic.setShipboardExperience(e.target.value)} sx={{ pl: 3 }}>
                    <FormControlLabel value="With Shipboard Experience" control={<Radio {...radioProps} />} label={<span style={radioLabelProps.sx}><i className="fas fa-check-circle text-success mr-1"></i> With Shipboard Experience</span>} />
                    <FormControlLabel value="No Shipboard Experience" control={<Radio {...radioProps} />} label={<span style={radioLabelProps.sx}><i className="fas fa-times-circle text-muted mr-1"></i> No Shipboard Experience</span>} />
                </RadioGroup>
            </FormControl>
        </InfoCard>

        {logic.shipboardExperience === 'With Shipboard Experience' && (
            <>
                <SectionHeader icon="fas fa-certificate" title="Latest Shipboard Details" subtitle="Provide information about your most recent maritime experience" />
                
                <InfoCard>
                    {/* License, Rank, Disembarkation - flexible 2-3 columns */}
                    <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 2,
                        mb: 2
                    }}>
                        <TextField 
                            label="License" 
                            value={logic.license} 
                            onChange={(e) => {
                                logic.setLicense(e.target.value);
                                clearErrorIfValid('license', e.target.value);
                            }}
                            onBlur={() => onFieldTouch('license')}
                            error={!!errors.license}
                            helperText={errors.license}
                            required
                            fullWidth 
                            {...textFieldProps} 
                            InputProps={{ startAdornment: <i className="fas fa-id-card mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} 
                        />
                        <TextField 
                            label="Rank" 
                            value={logic.rank} 
                            onChange={(e) => {
                                logic.setRank(e.target.value);
                                clearErrorIfValid('rank', e.target.value);
                            }}
                            onBlur={() => onFieldTouch('rank')}
                            error={!!errors.rank}
                            helperText={errors.rank}
                            required
                            fullWidth 
                            {...textFieldProps} 
                            InputProps={{ startAdornment: <i className="fas fa-user-tie mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} 
                        />
                        <TextField 
                            label="Date of Disembarkation" 
                            value={logic.disembarkation} 
                            onChange={(e) => {
                                logic.setDisembarkation(e.target.value);
                                clearErrorIfValid('disembarkation', e.target.value);
                            }}
                            onBlur={() => onFieldTouch('disembarkation')}
                            error={!!errors.disembarkation}
                            helperText={errors.disembarkation}
                            required
                            fullWidth 
                            {...dateFieldProps}
                            InputProps={{
                                startAdornment: <i className="fas fa-calendar mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                            }}
                        />
                    </Box>

                    {/* Shipping Principal and Manning Company - 2 columns */}
                    <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 2,
                        mb: 2
                    }}>
                        <TextField 
                            label="Shipping Principal" 
                            value={logic.ShippingPrincipal} 
                            onChange={(e) => {
                                logic.setShippingPrincipal(e.target.value);
                                clearErrorIfValid('ShippingPrincipal', e.target.value);
                            }}
                            onBlur={() => onFieldTouch('ShippingPrincipal')}
                            error={!!errors.ShippingPrincipal}
                            helperText={errors.ShippingPrincipal}
                            required
                            fullWidth 
                            {...textFieldProps} 
                            InputProps={{ startAdornment: <i className="fas fa-building mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} 
                        />
                        <TextField 
                            label="Manning Company" 
                            value={logic.ManningCompany} 
                            onChange={(e) => {
                                logic.setManningCompany(e.target.value);
                                clearErrorIfValid('ManningCompany', e.target.value);
                            }}
                            onBlur={() => onFieldTouch('ManningCompany')}
                            error={!!errors.ManningCompany}
                            helperText={errors.ManningCompany}
                            required
                            fullWidth 
                            {...textFieldProps} 
                            InputProps={{ startAdornment: <i className="fas fa-briefcase mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} 
                        />
                    </Box>

                    {/* Optional Fields - 2 columns */}
                    <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 2
                    }}>
                        <TextField 
                            label="Landline Number (Optional)" 
                            value={logic.LandlineNumber} 
                            onChange={(e) => logic.setLandlineNumber(e.target.value)} 
                            fullWidth 
                            {...textFieldProps} 
                            InputProps={{ startAdornment: <i className="fas fa-phone mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} 
                        />
                        <MuiTelInput 
                            label="Mobile Number (Optional)" 
                            value={logic.LSEMobileNumber} 
                            onChange={(value, info) => {
                                // Limit to 11 digits for PH numbers
                                const digits = value.replace(/\D/g, '');
                                if (digits.length <= 13) { // +63 (2 digits) + 11 digits = 13
                                    logic.setLSEMobileNumber(value);
                                }
                            }}
                            helperText="Max 11 digits"
                            defaultCountry="PH"
                            fullWidth
                            {...textFieldProps}
                        />
                    </Box>
                </InfoCard>
            </>
        )}
    </Box>
);

// Step 6: Documents
const DocumentsStep = ({ logic, errors, onFieldTouch, clearErrorIfValid }) => (
    <Box>
        <SectionHeader icon="fas fa-folder-open" title="Required Documents" subtitle="Upload all necessary documents for your registration" />
        
        {(errors.signatureFile || errors.IDPicture || errors.SRNFile || errors.seamansBook) && (
            <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#ffebee', borderRadius: 1, border: '1px solid #f44336' }}>
                <Typography sx={{ fontSize: '13px', color: '#d32f2f', fontWeight: 500 }}>
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    Please upload all required documents before proceeding
                </Typography>
            </Box>
        )}
        
        <InfoCard>
            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 2
            }}>
                <DragDropFileInput 
                    label="Signature *" 
                    onChange={(e) => {
                        logic.CheckUploadedAvatar(e, 'signature');
                        onFieldTouch('signatureFile');
                        clearErrorIfValid('signatureFile');
                    }} 
                    accept="image/*"
                    fileName={logic.signatureFileName}
                    error={errors.signatureFile}
                />
                <DragDropFileInput 
                    label="1.5x1.5 ID Picture *" 
                    onChange={(e) => {
                        logic.CheckUploadedAvatar(e, 'idPicture');
                        onFieldTouch('IDPicture');
                        clearErrorIfValid('IDPicture');
                    }} 
                    accept="image/*"
                    fileName={logic.IDPictureFileName}
                    error={errors.IDPicture}
                />
                <DragDropFileInput 
                    label="SRN Screenshot *" 
                    onChange={(e) => {
                        logic.CheckUploadedAvatar(e, 'srnNumber');
                        onFieldTouch('SRNFile');
                        clearErrorIfValid('SRNFile');
                    }} 
                    accept="image/*"
                    fileName={logic.SRNFileName}
                    error={errors.SRNFile}
                />
                <DragDropFileInput 
                    label="Sea Service Book *" 
                    onChange={(e) => {
                        logic.CheckUploadedAvatar(e, 'seaService');
                        onFieldTouch('seamansBook');
                        clearErrorIfValid('seamansBook');
                    }}
                    fileName={logic.seamansBookFileName}
                    error={errors.seamansBook}
                />
            </Box>
        </InfoCard>

        <SectionHeader icon="fas fa-file-alt" title="Optional Documents" subtitle="Additional supporting documents (if available)" />
        
        <InfoCard>
            <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 2
            }}>
                <DragDropFileInput 
                    label="Last Disembarkation" 
                    onChange={(e) => logic.CheckUploadedAvatar(e, 'lastEmbarkment')}
                    fileName={logic.lastDisembarkationFileName}
                />
                <DragDropFileInput 
                    label="Marina License" 
                    onChange={(e) => logic.CheckUploadedAvatar(e, 'marinaLicense')}
                    fileName={logic.licenseFileName}
                />
            </Box>
        </InfoCard>
    </Box>
);

export default PersonalInfoStepper;
