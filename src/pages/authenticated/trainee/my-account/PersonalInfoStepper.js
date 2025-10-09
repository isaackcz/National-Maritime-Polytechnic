import { useState } from 'react';
import { Stepper, Step, StepLabel, Box, Button, TextField, MenuItem, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Paper, Typography, Divider, Grid } from '@mui/material';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../components/phoneInputCustom.css';
import '../components/stepperCustom.css';
import PhilippinesAddressDropdown from './PhilippinesAddressDropdown';
import DragDropFileInput from '../components/DragDropFileInput';
import { textFieldProps, dateFieldProps, menuItemProps, phoneInputWrapperProps, radioProps, radioLabelProps, radioGroupLabelProps, formLabelProps, sectionTitleProps } from '../components/inputStyles';

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

    const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return <BasicInfoStep logic={logic} />;
            case 1:
                return <ContactInfoStep logic={logic} />;
            case 2:
                return <ContactPersonStep logic={logic} />;
            case 3:
                return <EducationStep logic={logic} />;
            case 4:
                return <ShipboardStep logic={logic} />;
            case 5:
                return <DocumentsStep logic={logic} />;
            default:
                return null;
        }
    };

    return (
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

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: { xs: 2, sm: 0 }, mt: 3 }}>
                <Button 
                    disabled={activeStep === 0} 
                    onClick={handleBack}
                    fullWidth
                    sx={{ display: { xs: 'block', sm: 'inline-flex' }, fontSize: '13px', py: 0.75 }}
                >
                    Back
                </Button>
                <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    {activeStep === steps.length - 1 ? (
                        <Button 
                            variant="contained" 
                            color="primary" 
                            type="submit"
                            fullWidth
                            sx={{ display: { xs: 'block', sm: 'inline-flex' }, fontSize: '13px', py: 0.75 }}
                        >
                            Save Changes
                        </Button>
                    ) : (
                        <Button 
                            variant="contained" 
                            onClick={handleNext}
                            fullWidth
                            sx={{ display: { xs: 'block', sm: 'inline-flex' }, fontSize: '13px', py: 0.75 }}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

// Step 1: Basic Information
const BasicInfoStep = ({ logic }) => (
    <Box>
        <SectionHeader icon="fas fa-user-circle" title="Personal Information" subtitle="Provide your basic personal details" />
        
        <InfoCard>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="First Name" value={logic.firstName} onChange={(e) => logic.setFirstName(e.target.value)} required fullWidth {...textFieldProps} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Middle Name" value={logic.middleName} onChange={(e) => logic.setMiddlename(e.target.value)} fullWidth {...textFieldProps} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Last Name" value={logic.lastName} onChange={(e) => logic.setLastName(e.target.value)} required fullWidth {...textFieldProps} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Suffix" value={logic.suffix} onChange={(e) => logic.setSuffix(e.target.value)} fullWidth {...textFieldProps} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField label="Email" type="email" value={logic.email} onChange={(e) => logic.setEmail(e.target.value)} required fullWidth {...textFieldProps} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField label="SRN Number" value={logic.srn} onChange={(e) => logic.setsrn(e.target.value)} fullWidth {...textFieldProps} />
                </Grid>
            </Grid>
        </InfoCard>

        <SectionHeader icon="fas fa-id-card" title="Demographics" subtitle="Date of birth and identification details" />
        
        <InfoCard>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <TextField
                        select
                        label="User Type"
                        value={logic.userType}
                        onChange={(e) => logic.setUserType(e.target.value)}
                        required
                        fullWidth
                        {...textFieldProps}
                        InputProps={{
                            startAdornment: <i className="fas fa-user-tag mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                        }}
                    >
                        <MenuItem value="New" {...menuItemProps}>New</MenuItem>
                        <MenuItem value="Old" {...menuItemProps}>Old</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <TextField
                        select
                        label="Sex"
                        value={logic.sex}
                        onChange={(e) => logic.setSex(e.target.value)}
                        required
                        fullWidth
                        {...textFieldProps}
                        InputProps={{
                            startAdornment: <i className="fas fa-venus-mars mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                        }}
                    >
                        <MenuItem value="Male" {...menuItemProps}>Male</MenuItem>
                        <MenuItem value="Female" {...menuItemProps}>Female</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <TextField 
                        label="Birthday" 
                        value={logic.birthday} 
                        onChange={(e) => logic.setBirthday(e.target.value)} 
                        fullWidth 
                        {...dateFieldProps}
                        InputProps={{
                            startAdornment: <i className="fas fa-calendar mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <TextField
                        select
                        label="Civil Status"
                        value={logic.civilStatus}
                        onChange={(e) => logic.setCivilStatus(e.target.value)}
                        required
                        fullWidth
                        {...textFieldProps}
                        InputProps={{
                            startAdornment: <i className="fas fa-ring mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                        }}
                    >
                        <MenuItem value="Single" {...menuItemProps}>Single</MenuItem>
                        <MenuItem value="Married" {...menuItemProps}>Married</MenuItem>
                        <MenuItem value="Widowed" {...menuItemProps}>Widowed</MenuItem>
                        <MenuItem value="Separated" {...menuItemProps}>Separated</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <TextField
                        select
                        label="Nationality"
                        value={logic.nationality}
                        onChange={(e) => logic.setNationality(e.target.value)}
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
                </Grid>
                {logic.nationality === 'Others' && (
                    <Grid item xs={12} md={6}>
                        <TextField 
                            label="Specify Nationality" 
                            value={logic.nationalityOther} 
                            onChange={(e) => logic.setNationalityOther(e.target.value)} 
                            required 
                            fullWidth 
                            {...textFieldProps}
                            InputProps={{
                                startAdornment: <i className="fas fa-globe mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                            }}
                        />
                    </Grid>
                )}
            </Grid>
        </InfoCard>
    </Box>
);

// Step 2: Contact Information
const ContactInfoStep = ({ logic }) => (
    <Box>
        <SectionHeader icon="fas fa-phone-alt" title="Contact Numbers" subtitle="How can we reach you?" />
        
        <InfoCard>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ 
                        position: 'relative',
                        '& .react-tel-input .form-control': {
                            height: '40px',
                            fontSize: '13px',
                            fontFamily: 'inherit'
                        }
                    }}>
                        <Typography sx={{ 
                            fontSize: '8px', 
                            color: '#605E5C', 
                            mb: 0.5,
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}>
                            <i className="fas fa-mobile-alt text-primary" style={{ fontSize: '12px' }}></i>
                            Mobile Number 1 *
                        </Typography>
                        <PhoneInput value={logic.mobileNumber1} onChange={logic.setMobileNumber1} {...phoneInputWrapperProps} />
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box sx={{ 
                        position: 'relative',
                        '& .react-tel-input .form-control': {
                            height: '40px',
                            fontSize: '13px',
                            fontFamily: 'inherit'
                        }
                    }}>
                        <Typography sx={{ 
                            fontSize: '8px', 
                            color: '#605E5C', 
                            mb: 0.5,
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}>
                            <i className="fas fa-mobile-alt text-primary" style={{ fontSize: '12px' }}></i>
                            Mobile Number 2 *
                        </Typography>
                        <PhoneInput value={logic.mobileNumber2} onChange={logic.setMobileNumber2} {...phoneInputWrapperProps} />
                    </Box>
                </Grid>
                <Grid item xs={12} md={3}>
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
                </Grid>
                <Grid item xs={12} md={3}>
                    <TextField 
                        label="Landline" 
                        value={logic.landline} 
                        onChange={(e) => logic.setLandline(e.target.value)} 
                        fullWidth 
                        {...textFieldProps} 
                        InputProps={{ startAdornment: <i className="fas fa-phone mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} 
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField 
                        label="Facebook Account" 
                        value={logic.facebookAccount} 
                        onChange={(e) => logic.setFacebookAccount(e.target.value)} 
                        required 
                        fullWidth 
                        {...textFieldProps} 
                        InputProps={{ startAdornment: <i className="fab fa-facebook mr-2" style={{ fontSize: '12px', color: '#1877F2' }}></i> }} 
                    />
                </Grid>
            </Grid>
        </InfoCard>

        <SectionHeader icon="fas fa-map-marker-alt" title="Current Address" subtitle="Where do you currently reside?" />
        
        <InfoCard>
            <PhilippinesAddressDropdown addressData={logic.addressData} setAddressData={logic.setAddressData} />
        </InfoCard>

        <SectionHeader icon="fas fa-birthday-cake" title="Birthplace" subtitle="Where were you born?" />
        
        <InfoCard>
            <PhilippinesAddressDropdown 
                addressData={logic.birthplaceAddress} 
                setAddressData={logic.setBirthplaceAddress} 
                showPostalCode={false}
            />
        </InfoCard>
    </Box>
);

// Step 3: Contact Person
const ContactPersonStep = ({ logic }) => (
    <Box>
        <SectionHeader icon="fas fa-user-friends" title="Emergency Contact Person" subtitle="Who should we contact in case of emergency?" />
        
        <InfoCard>
            <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                    <TextField label="Contact Person Name" value={logic.CPname} onChange={(e) => logic.setCPname(e.target.value)} required fullWidth {...textFieldProps} InputProps={{ startAdornment: <i className="fas fa-user mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} />
                </Grid>
                <Grid item xs={12} md={5}>
                    <TextField label="Relationship" value={logic.CPrelationship} onChange={(e) => logic.setCPrelationship(e.target.value)} required fullWidth {...textFieldProps} InputProps={{ startAdornment: <i className="fas fa-heart mr-2 text-danger" style={{ fontSize: '12px' }}></i> }} />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="Address" value={logic.CPaddress} onChange={(e) => logic.setCPaddress(e.target.value)} required fullWidth {...textFieldProps} InputProps={{ startAdornment: <i className="fas fa-home mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} />
                </Grid>
            </Grid>
        </InfoCard>

        <SectionHeader icon="fas fa-address-book" title="Contact Person Details" subtitle="How can we reach them?" />
        
        <InfoCard>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ 
                        position: 'relative',
                        '& .react-tel-input .form-control': {
                            height: '40px',
                            fontSize: '13px',
                            fontFamily: 'inherit'
                        }
                    }}>
                        <Typography sx={{ 
                            fontSize: '12px', 
                            color: '#605E5C', 
                            mb: 0.5,
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}>
                            <i className="fas fa-mobile-alt text-primary" style={{ fontSize: '12px' }}></i>
                            Mobile Number 1 *
                        </Typography>
                        <PhoneInput value={logic.CPmobileNumber1} onChange={logic.setCPmobileNumber1} {...phoneInputWrapperProps} />
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box sx={{ 
                        position: 'relative',
                        '& .react-tel-input .form-control': {
                            height: '40px',
                            fontSize: '13px',
                            fontFamily: 'inherit'
                        }
                    }}>
                        <Typography sx={{ 
                            fontSize: '12px', 
                            color: '#605E5C', 
                            mb: 0.5,
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}>
                            <i className="fas fa-mobile-alt text-primary" style={{ fontSize: '12px' }}></i>
                            Mobile Number 2 *
                        </Typography>
                        <PhoneInput value={logic.CPmobileNumber2} onChange={logic.setCPmobileNumber2} {...phoneInputWrapperProps} />
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField label="Email" type="email" value={logic.CPemail} onChange={(e) => logic.setCPemail(e.target.value)} fullWidth {...textFieldProps} InputProps={{ startAdornment: <i className="fas fa-envelope mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField label="Telephone Number" value={logic.CPtelephoneNumber} onChange={(e) => logic.setCPtelephoneNumber(e.target.value)} fullWidth {...textFieldProps} InputProps={{ startAdornment: <i className="fas fa-phone mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} />
                </Grid>
            </Grid>
        </InfoCard>
    </Box>
);

// Step 4: Educational Attainment
const EducationStep = ({ logic }) => (
    <Box>
        <SectionHeader icon="fas fa-graduation-cap" title="Educational Background" subtitle="Tell us about your educational qualifications" />
        
        <InfoCard>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField label="Course Taken" value={logic.CourseTaken} onChange={(e) => logic.setCourseTaken(e.target.value)} required fullWidth {...textFieldProps} InputProps={{ startAdornment: <i className="fas fa-book mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} placeholder="e.g., BS Marine Transportation" />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="School Name" value={logic.SchoolName} onChange={(e) => logic.setSchoolName(e.target.value)} required fullWidth {...textFieldProps} InputProps={{ startAdornment: <i className="fas fa-university mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} placeholder="e.g., Philippine Merchant Marine Academy" />
                </Grid>
                <Grid item xs={12}>
                    <TextField label="School Address" value={logic.SchoolAddress} onChange={(e) => logic.setSchoolAddress(e.target.value)} required fullWidth {...textFieldProps} InputProps={{ startAdornment: <i className="fas fa-map-marker-alt mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} placeholder="Complete school address" />
                </Grid>
            </Grid>
        </InfoCard>
    </Box>
);

// Step 5: Shipboard Experience
const ShipboardStep = ({ logic }) => (
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
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField label="License (Optional)" value={logic.license} onChange={(e) => logic.setLicense(e.target.value)} fullWidth {...textFieldProps} InputProps={{ startAdornment: <i className="fas fa-id-card mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="Rank (Optional)" value={logic.rank} onChange={(e) => logic.setRank(e.target.value)} fullWidth {...textFieldProps} InputProps={{ startAdornment: <i className="fas fa-user-tie mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField 
                                label="Date of Disembarkation (Optional)" 
                                value={logic.disembarkation} 
                                onChange={(e) => logic.setDisembarkation(e.target.value)} 
                                fullWidth 
                                {...dateFieldProps}
                                InputProps={{
                                    startAdornment: <i className="fas fa-calendar mr-2 text-muted" style={{ fontSize: '12px' }}></i>
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="Shipping Principal (Optional)" value={logic.ShippingPrincipal} onChange={(e) => logic.setShippingPrincipal(e.target.value)} fullWidth {...textFieldProps} InputProps={{ startAdornment: <i className="fas fa-building mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="Manning Company (Optional)" value={logic.ManningCompany} onChange={(e) => logic.setManningCompany(e.target.value)} fullWidth {...textFieldProps} InputProps={{ startAdornment: <i className="fas fa-briefcase mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="Landline Number (Optional)" value={logic.LandlineNumber} onChange={(e) => logic.setLandlineNumber(e.target.value)} fullWidth {...textFieldProps} InputProps={{ startAdornment: <i className="fas fa-phone mr-2 text-muted" style={{ fontSize: '12px' }}></i> }} />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ 
                                position: 'relative',
                                '& .react-tel-input .form-control': {
                                    height: '40px',
                                    fontSize: '13px',
                                    fontFamily: 'inherit'
                                }
                            }}>
                                <Typography sx={{ 
                                    fontSize: '12px', 
                                    color: '#605E5C', 
                                    mb: 0.5,
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                }}>
                                    <i className="fas fa-mobile-alt text-primary" style={{ fontSize: '12px' }}></i>
                                    Mobile Number (Optional)
                                </Typography>
                                <PhoneInput value={logic.LSEMobileNumber} onChange={logic.setLSEMobileNumber} {...phoneInputWrapperProps} />
                            </Box>
                        </Grid>
                    </Grid>
                </InfoCard>
            </>
        )}
    </Box>
);

// Step 6: Documents
const DocumentsStep = ({ logic }) => (
    <Box>
        <SectionHeader icon="fas fa-folder-open" title="Required Documents" subtitle="Upload all necessary documents for your registration" />
        
        <InfoCard>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <DragDropFileInput label="Signature *" onChange={(e) => logic.CheckUploadedAvatar(e, 'signature')} accept="image/*" />
                </Grid>
                <Grid item xs={12} md={6}>
                    <DragDropFileInput label="1.5x1.5 ID Picture *" onChange={(e) => logic.CheckUploadedAvatar(e, 'idPicture')} accept="image/*" />
                </Grid>
                <Grid item xs={12} md={6}>
                    <DragDropFileInput label="SRN Screenshot *" onChange={(e) => logic.CheckUploadedAvatar(e, 'srnNumber')} accept="image/*" />
                </Grid>
                <Grid item xs={12} md={6}>
                    <DragDropFileInput label="Sea Service Book *" onChange={(e) => logic.CheckUploadedAvatar(e, 'seaService')} />
                </Grid>
            </Grid>
        </InfoCard>

        <SectionHeader icon="fas fa-file-alt" title="Optional Documents" subtitle="Additional supporting documents (if available)" />
        
        <InfoCard>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <DragDropFileInput label="Last Disembarkation" onChange={(e) => logic.CheckUploadedAvatar(e, 'lastEmbarkment')} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <DragDropFileInput label="Marina License" onChange={(e) => logic.CheckUploadedAvatar(e, 'marinaLicense')} />
                </Grid>
            </Grid>
        </InfoCard>
    </Box>
);

export default PersonalInfoStepper;

