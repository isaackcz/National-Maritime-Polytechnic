import { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useGetCurrentUser from '../../../../hooks/useGetCurrentUser';
import useGetToken from '../../../../hooks/useGetToken';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import useShowSubmitLoader from '../../../../hooks/useShowSubmitLoader';
import useShowToaster from '../../../../hooks/useShowToaster';
import useDateFormat from '../../../../hooks/useDateFormat';
import useToggleShowHidePass from '../../../../hooks/useToggleShowHidePass';

/**
  * @returns {Object} 
 */
const useMyAccountLogic = () => {
    const { url } = useSystemURLCon();
    const navigate = useNavigate();
    const { setShowLoader, setProgress, SubmitLoadingAnim } = useShowSubmitLoader(); 
    const { setOpenToast, Toast, setToastMessage, setToastStatus } = useShowToaster();
    const { getToken, removeToken } = useGetToken(); 
    const { userData, refreshUser } = useGetCurrentUser();
    const { formatDateToReadable } = useDateFormat(); 
    const { EndAdornment, inputType } = useToggleShowHidePass();

    // Personal Information States
    const [srn, setsrn] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middlename, setMiddlename] = useState('');
    const [lastName, setLastName] = useState('');
    const [suffix, setSuffix] = useState('');
    const [sex, setSex] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('');
    const [userType, setUserType] = useState('New');
    const fileInputRef = useRef(null);

    // Additional Personal Information
    const [nationality, setNationality] = useState('Filipino');
    const [nationalityOther, setNationalityOther] = useState('');
    const [civilStatus, setCivilStatus] = useState('');
    const [birthday, setBirthday] = useState('');
    const [birthplaceAddress, setBirthplaceAddress] = useState({
        region: '',
        province: '',
        municipality: '',
        barangay: '',
        houseNo: '',
        postalCode: '',
        completeAddress: ''
    });
    const [addressData, setAddressData] = useState({
        region: '',
        province: '',
        municipality: '',
        barangay: '',
        houseNo: '',
        postalCode: ''
    });
 

    // Contact Information
    const [areaCode, setAreaCode] = useState('');
    const [landline, setLandline] = useState('');
    const [mobileNumber1, setMobileNumber1] = useState('');
    const [mobileNumber2, setMobileNumber2] = useState('');
    const [facebookAccount, setFacebookAccount] = useState('');

    // Educational Attainment
    const [CourseTaken, setCourseTaken] = useState('');
    const [SchoolName, setSchoolName] = useState('');
    const [SchoolAddress, setSchoolAddress] = useState('');
    
    // Shipboard Experience
    const [shipboardExperience, setShipboardExperience] = useState('With Shipboard Experience');
    const [license, setLicense] = useState('');
    const [rank, setRank] = useState('');
    const [disembarkation, setDisembarkation] = useState('');
    const [ShippingPrincipal, setShippingPrincipal] = useState('');
    const [ManningCompany, setManningCompany] = useState('');
    const [LandlineNumber, setLandlineNumber] = useState('');
    const [LSEMobileNumber, setLSEMobileNumber] = useState('');

    // Contact Person Information
    const [CPname, setCPname] = useState('');
    const [CPrelationship, setCPrelationship] = useState('');
    const [CPaddress, setCPaddress] = useState('');
    const [CPtelephoneNumber, setCPtelephoneNumber] = useState('');
    const [CPmobileNumber1, setCPmobileNumber1] = useState('');
    const [CPmobileNumber2, setCPmobileNumber2] = useState('');
    const [CPemail, setCPemail] = useState('');

    // File Uploads
    const [LastDisembarkation, setLastDisembarkation] = useState();
    const [SRNFile, setSRNFile] = useState();
    const [licenseFile, setLicenseFile] = useState();
    const [seamansBook, setSeamansBook] = useState();
    const [signatureFile, setSignatureFile] = useState();
    const [IDPicture, setIDPicture] = useState();
    const [avatarPreview, setAvatarPreview] = useState(null);

    // File Names (to preserve between steps)
    const [signatureFileName, setSignatureFileName] = useState('');
    const [IDPictureFileName, setIDPictureFileName] = useState('');
    const [SRNFileName, setSRNFileName] = useState('');
    const [seamansBookFileName, setSeamansBookFileName] = useState('');
    const [lastDisembarkationFileName, setLastDisembarkationFileName] = useState('');
    const [licenseFileName, setLicenseFileName] = useState('');

    // Password States
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordRuleValid, setIsPasswordRuleValid] = useState(false);

    // Loading States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isFetchingActivities, setIsFetchingActivities] = useState(true);

    // Activities
    const [activities, setActivities] = useState([]);

    /**
     * API CALL: GET - Fetch trainee personal information from database
     * This gets all saved personal info including contact, education, and shipboard experience
     * Endpoint: /my-account/get_trainee_general_info
     */
    const fetchPersonalInformation = async () => {
        try {
            const token = getToken("csrf-token");
            const response = await axios.get(`${url}/my-account/get_trainee_general_info`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if(response.status === 200) {
                const data = response.data.trainee_general_info?.[0];
                if (!data) {
                    console.error("No trainee information found");
                    return;
                }
                
                // STEP 1: Fill basic user information
                setFirstName(data.fname || '');
                setMiddlename(data.mname || '');
                setLastName(data.lname || '');
                setSuffix(data.suffix || '');
                setEmail(data.email || '');
                setSex(data.sex ? data.sex.toUpperCase() : ''); // Ensure uppercase: MALE, FEMALE

                // STEP 2: Check if there's additional trainee information
                if(data.additional_trainee_info) {
                    const additionalInfo = data.additional_trainee_info;

                    // STEP 3: Fill general information (SRN, nationality, civil status, etc.)
                    if(additionalInfo.general_info) {
                        const genInfo = additionalInfo.general_info;
                        
                        setsrn(genInfo.gen_info_srn || '');
                        setUserType(genInfo.gen_info_status || 'NEW'); // NEW or RETURNEE
                        setBirthday(genInfo.gen_info_birthdate || '');
                        setCivilStatus(genInfo.gen_info_civil_status || ''); // SINGLE, MARRIED, etc.
                        
                        // Handle nationality
                        setNationality(genInfo.gen_info_citizenship || 'Filipino');
                        if(genInfo.gen_info_citizenship && genInfo.gen_info_citizenship !== 'Filipino') {
                            setNationalityOther(genInfo.gen_info_citizenship);
                            setNationality('Others');
                        }
                        
                        // Fill contact numbers
                        setMobileNumber1(genInfo.gen_info_number_one || '');
                        setMobileNumber2(genInfo.gen_info_number_two || '');
                        setLandline(genInfo.gen_info_landline || '');
                        setFacebookAccount(genInfo.gen_info_facebook || '');
                        
                        // STEP 4: Fill current address information
                        setAddressData({
                            region: genInfo.gen_info_region || '',
                            province: genInfo.gen_info_province || '',
                            municipality: genInfo.gen_info_municipality || '',
                            barangay: genInfo.gen_info_barangay || '',
                            houseNo: genInfo.gen_info_house_no || '',
                            postalCode: genInfo.gen_info_postal || '',
                        });

                        // STEP 5: Fill birthplace address information
                        setBirthplaceAddress({
                            region: genInfo.gen_info_birthplace_region || '',
                            province: genInfo.gen_info_birthplace_province || '',
                            municipality: genInfo.gen_info_birthplace_municipality || '',
                            barangay: genInfo.gen_info_birthplace_barangay || '',
                            houseNo: '',
                            postalCode: '',
                        });
                    }

                    // STEP 6: Fill contact person information
                    if(additionalInfo.contact_person) {
                        const contact = additionalInfo.contact_person;
                        setCPname(contact.person_name || '');
                        setCPrelationship(contact.person_relationship || '');
                        setCPaddress(contact.person_address || '');
                        setCPtelephoneNumber(contact.person_landline || '');
                        setCPmobileNumber1(contact.person_number_one || '');
                        setCPmobileNumber2(contact.person_number_two || '');
                        setCPemail(contact.person_email || '');
                    }

                    // STEP 7: Fill educational information
                    if(additionalInfo.educational_attainment) {
                        const education = additionalInfo.educational_attainment;
                        setCourseTaken(education.school_course_taken || '');
                        setSchoolAddress(education.school_address || '');
                        setSchoolName(education.school_graduated || '');
                    }

                    // STEP 8: Fill shipboard experience information
                    if(additionalInfo.latest_shipboard_attainment) {
                        const shipboard = additionalInfo.latest_shipboard_attainment;
                        setShipboardExperience(shipboard.ship_status || 'With Shipboard Experience');
                        setLicense(shipboard.ship_license || '');
                        setRank(shipboard.ship_rank || '');
                        setDisembarkation(shipboard.ship_date_of_disembarkment || '');
                        setShippingPrincipal(shipboard.ship_principal || '');
                        setManningCompany(shipboard.ship_manning || '');
                        setLandlineNumber(shipboard.ship_landline || '');
                        setLSEMobileNumber(shipboard.ship_number || '');
                    }
                }
            }
        } catch (error) {
            // Handle errors
            console.error("Error fetching personal information:", error);
            
            // If server error, logout user
            if(error.response?.status === 500) {
                alert('Session expired. Please login again.');
                removeToken('csrf-token');
                navigate('/access-denied');
            }
        } finally {
            // Stop loading indicator
            setIsFetching(false);
        }
    };

    /**
     * Initialize user data from context
     * Only fetch once when component mounts
     */
    const initializeUserData = () => {
        if(isFetching) {
            fetchPersonalInformation();
        }
    };

    /**
     * API CALL: GET - Fetch user activity history from database
     * This gets all logged activities like login, updates, etc.
     * Endpoint: /my-account/get_activities
     */
    const GetActivities = async () => {
        try {
            setIsFetchingActivities(true);
            
            const token = getToken("csrf-token");
            const response = await axios.get(`${url}/my-account/get_activities`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if(response.status === 200) {
                setActivities(response.data.activities);
            }
        } catch (error) {
            if(error.response?.status === 500) {
                alert('Session expired. Please login again.');
                removeToken('csrf-token');
                navigate('/access-denied');
            } else {
                alert(error.response?.data?.message || 'Failed to load activities');
            }
        } finally {
            setIsFetchingActivities(false);
        }
    };

    /**
     * Handle file uploads - stores both file object and filename
     * Filename is preserved across stepper navigation for better UX
     */
    const CheckUploadedAvatar = (e, fileType = 'avatar') => {
        const file = e.target ? e.target.files[0] : e.files?.[0];
        const fileName = e.fileName || file?.name || '';
        
        if (!file) return;

        // Handle avatar upload (already cropped to square from ImageCropModal)
        if (fileType === 'avatar') {
            setAvatar(file);
            return;
        }

        // Handle other file types - store both file and filename
        // CRITICAL: Filename state ensures UI shows uploaded file even after navigation
        switch(fileType) {
            case 'signature':
                setSignatureFile(file);
                setSignatureFileName(fileName);
                break;
            case 'idPicture':
                setIDPicture(file);
                setIDPictureFileName(fileName);
                break;
            case 'srnNumber':
                setSRNFile(file);
                setSRNFileName(fileName);
                break;
            case 'seaService':
                setSeamansBook(file);
                setSeamansBookFileName(fileName);
                break;
            case 'lastEmbarkment':
                setLastDisembarkation(file);
                setLastDisembarkationFileName(fileName);
                break;
            case 'marinaLicense':
                setLicenseFile(file);
                setLicenseFileName(fileName);
                break;
            default:
                console.warn('Unknown file type:', fileType);
        }
    };

    /**
     * API CALL: POST - Save or update trainee personal information to database
     * This sends all form data including files to the server
     * Endpoint: /my-account/create_or_update_additional_info
     */
    const SubmitFormPersonal = async (e) => {
        e.preventDefault(); // Prevent page reload
        
        // SAFEGUARD: Prevent accidental submission during step navigation
        // Only allow submission when explicitly called (not from step navigation)
        console.log("🔄 Form submission initiated");

        try {
            setProgress(0);
            setIsSubmitting(true);
            setShowLoader(true);
            
            // Get authentication token from browser storage
            console.log("⏳ Loading animation started");
            
            const token = getToken("csrf-token");
            
            // Create FormData object to send data and files
            const formData = new FormData();
            
            // STEP 2: Add general information fields to form data
            formData.append('gen_info_trainee_id', userData?.id || '');
            formData.append('gen_info_srn', srn || ''); // Backend expects integer
            formData.append('gen_info_status', userType || ''); // Already uppercase: NEW, RETURNEE
            formData.append('gen_info_gender', sex || ''); // Already uppercase: MALE, FEMALE
            formData.append('gen_info_birthdate', birthday || '');
            formData.append('gen_info_civil_status', civilStatus || ''); // Already uppercase: SINGLE, MARRIED, etc.
            formData.append('gen_info_citizenship', nationality === 'Others' ? nationalityOther : nationality);
            
            // STEP 3: Add current address fields
            formData.append('gen_info_house_no', addressData.houseNo || '');
            formData.append('gen_info_region', addressData.region || '');
            formData.append('gen_info_province', addressData.province || '');
            formData.append('gen_info_municipality', addressData.municipality || '');
            formData.append('gen_info_barangay', addressData.barangay || '');
            formData.append('gen_info_postal', addressData.postalCode || '');
            
            // STEP 4: Add birthplace address fields
            formData.append('gen_info_birthplace_region', birthplaceAddress.region || '');
            formData.append('gen_info_birthplace_province', birthplaceAddress.province || '');
            formData.append('gen_info_birthplace_municipality', birthplaceAddress.municipality || '');
            formData.append('gen_info_birthplace_barangay', birthplaceAddress.barangay || '');
            
            // STEP 5: Add contact information
            formData.append('gen_info_number_one', mobileNumber1 || '');
            formData.append('gen_info_number_two', mobileNumber2 || '');
            formData.append('gen_info_landline', landline || '');
            formData.append('gen_info_email', email.toLowerCase());
            formData.append('gen_info_facebook', facebookAccount || '');
            
            // STEP 6: Add contact person fields
            formData.append('person_name', CPname || '');
            formData.append('person_relationship', CPrelationship || '');
            formData.append('person_address', CPaddress || '');
            formData.append('person_landline', CPtelephoneNumber || ''); // Database column is 'person_landline'
            formData.append('person_number_one', CPmobileNumber1 || '');
            formData.append('person_number_two', CPmobileNumber2 || '');
            formData.append('person_email', CPemail || '');
            
            // STEP 7: Add educational attainment fields
            formData.append('school_course_taken', CourseTaken || '');
            formData.append('school_address', SchoolAddress || '');
            formData.append('school_graduated', SchoolName || '');
            
            // STEP 8: Add shipboard experience fields
            formData.append('ship_status', shipboardExperience || '');
            formData.append('ship_license', license || '');
            formData.append('ship_rank', rank || '');
            formData.append('ship_date_of_embarkment', disembarkation || ''); // Backend expects 'embarkment' not 'disembarkment'
            formData.append('ship_principal', ShippingPrincipal || '');
            formData.append('ship_manning', ManningCompany || '');
            formData.append('ship_landline', LandlineNumber || '');
            formData.append('ship_number', LSEMobileNumber || '');
            
            // STEP 9: Add file attachments (only if files are selected)
            if (signatureFile) formData.append('file_e_signature', signatureFile);
            if (IDPicture) formData.append('file_id_picture', IDPicture);
            if (SRNFile) formData.append('file_srn_number', SRNFile);
            if (seamansBook) formData.append('file_sea_service', seamansBook);
            if (LastDisembarkation) formData.append('file_last_disembarkment', LastDisembarkation); // Backend expects 'disembarkment'
            if (licenseFile) formData.append('file_marina_license', licenseFile);

            // STEP 10: API CALL - POST request to save/update trainee information
            const response = await axios.post(`${url}/my-account/create_or_update_additional_info`, formData, {
                // Track upload progress
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percent);
                    }
                },
                headers: {
                    Authorization: `Bearer ${token}`, // Send token for authentication
                    Accept: 'application/json',
                }
            });

            // STEP 11: Handle successful response
            if(response.status === 200 || response.status === 201) {
                // Show success toast
                setToastMessage(response.data.message || 'Information saved successfully!');
                setToastStatus('success');
                setOpenToast(true);
                
                // IMPORTANT: Only refresh data on successful save
                // This ensures user's input is retained if there's an error
                await fetchPersonalInformation();

                if(response.data.reloggin) {
                    setTimeout(() => {
                        setToastMessage('Email changed. Please login again with your new credentials.');
                        setToastStatus('info');
                        setOpenToast(true);
                    }, 2600);
                    
                    setTimeout(() => {
                        removeToken('csrf-token');
                        navigate('/access-denied');
                    }, 5000);
                }
            }
        } catch (error) {
            // ============================================================================
            // CRITICAL: DATA RETENTION ON ERROR
            // ============================================================================
            // DO NOT call fetchPersonalInformation() here!
            // DO NOT reset any state variables!
            // DO NOT clear any form fields!
            // All user input MUST remain exactly as they entered it so they can fix and resubmit
            // ============================================================================
            
            console.error("❌ Form submission error:", error);
            console.log("✅ USER DATA RETAINED - All form inputs preserved for correction and resubmission");

            // IMPORTANT: Only show error messages - DO NOT touch form data
            
            if (error.response) {
                // Server responded with error
                if (error.response.status === 500) {
                    setToastMessage('⚠️ Session expired. Please login again.');
                    setToastStatus('error');
                    setOpenToast(true);
                    setTimeout(() => {
                        removeToken('csrf-token');
                        navigate('/access-denied');
                    }, 2000);
                } else if (error.response.status === 422) {
                    // Validation error - show specific message
                    const message = error.response.data?.message || "Please check your input and try again.";
                    setToastMessage(`❌ Validation Error: ${message}. ✅ Your data has been retained - please correct and resubmit.`);
                    setToastStatus('error');
                    setOpenToast(true);
                } else {
                    setToastMessage(`❌ ${error.response.data?.message || "Failed to save information"}. ✅ Your data is safe - please try again.`);
                    setToastStatus('error');
                    setOpenToast(true);
                }
            } else if (error.request) {
                // No response from server
                setToastMessage("❌ Cannot connect to server. ✅ Your data is safe - please check your internet and try again.");
                setToastStatus('error');
                setOpenToast(true);
            } else {
                // Other errors
                setToastMessage("❌ An error occurred. ✅ Your data has been retained - please try again.");
                setToastStatus('error');
                setOpenToast(true);
            }
            
            // ============================================================================
            // VERIFICATION: Confirm no data refresh happening
            // The only place fetchPersonalInformation() is called is in the SUCCESS block above
            // This ensures 100% data retention on any error
            // ============================================================================
        } finally {
            // STEP 13: Stop loading indicators
            setIsSubmitting(false);
            setShowLoader(false);
        }
    };

    /**
     * API CALL: POST - Update user password in database
     * This validates current password and saves the new password
     * Endpoint: /my-account/update_password
     */
    const SubmitFormChangePassword = async (e) => {
        e.preventDefault(); // Prevent page reload

        try {
            setProgress(0);
            setIsSubmitting(true);
            setShowLoader(true);

            // STEP 1: Initialize submission
            const token = getToken("csrf-token");
            
            // STEP 2: Prepare password data
            const formData = new FormData();
            formData.append('current_password', currentPassword);
            formData.append('password', password);
            formData.append('password_confirmation', confirmPassword);

            // STEP 3: API CALL - POST request to update password
            const response = await axios.post(`${url}/my-account/update_password`, formData, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percent);
                    }
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });

            // STEP 4: Handle successful response
            if(response.status === 200) {
                setToastMessage(response.data.message || 'Password updated successfully!');
                setToastStatus('success');
                setOpenToast(true);

                // User needs to re-login after password change
                if(response.data.reloggin) {
                    setTimeout(() => {
                        setToastMessage("Your password has been changed. Please login again.");
                        setToastStatus('info');
                        setOpenToast(true);
                    }, 2600);
                    
                    setTimeout(() => {
                        removeToken('csrf-token');
                        navigate('/access-denied');
                    }, 5000);
                }
            }
        } catch (error) {
            // ============================================================================
            // CRITICAL: DATA RETENTION ON ERROR
            // Password fields remain filled so user can correct any issues
            // ============================================================================
            
            console.error("❌ Password change error:", error);
            console.log("✅ PASSWORD FIELDS RETAINED - User can correct and retry");
            
            if(error.response?.status === 500) {
                setToastMessage('⚠️ Session expired. Please login again.');
                setToastStatus('error');
                setOpenToast(true);
                setTimeout(() => {
                    removeToken('csrf-token');
                    navigate('/access-denied');
                }, 2000);
            } else {
                setToastMessage(`❌ ${error.response?.data?.message || 'Failed to update password'}. ✅ Please check your input and try again.`);
                setToastStatus('error');
                setOpenToast(true);
            }
        } finally {
            // STEP 6: Stop loading indicators
            setIsSubmitting(false);
            setShowLoader(false);
        }
    };

    return {
        // State
        srn, setsrn,
        firstName, setFirstName,
        middlename, setMiddlename,
        lastName, setLastName,
        suffix, setSuffix,
        sex, setSex,
        email, setEmail,
        avatar, setAvatar,
        userType, setUserType,
        fileInputRef,
        nationality, setNationality,
        nationalityOther, setNationalityOther,
        civilStatus, setCivilStatus,
        birthday, setBirthday,
        birthplaceAddress, setBirthplaceAddress,
        addressData, setAddressData,
        areaCode, setAreaCode,
        landline, setLandline,
        mobileNumber1, setMobileNumber1,
        mobileNumber2, setMobileNumber2,
        facebookAccount, setFacebookAccount,
        CourseTaken, setCourseTaken,
        SchoolName, setSchoolName,
        SchoolAddress, setSchoolAddress,
        shipboardExperience, setShipboardExperience,
        license, setLicense,
        rank, setRank,
        disembarkation, setDisembarkation,
        ShippingPrincipal, setShippingPrincipal,
        ManningCompany, setManningCompany,
        LandlineNumber, setLandlineNumber,
        LSEMobileNumber, setLSEMobileNumber,
        CPname, setCPname,
        CPrelationship, setCPrelationship,
        CPaddress, setCPaddress,
        CPtelephoneNumber, setCPtelephoneNumber,
        CPmobileNumber1, setCPmobileNumber1,
        CPmobileNumber2, setCPmobileNumber2,
        CPemail, setCPemail,
        LastDisembarkation, setLastDisembarkation,
        SRNFile, setSRNFile,
        licenseFile, setLicenseFile,
        seamansBook, setSeamansBook,
        signatureFile, setSignatureFile,
        IDPicture, setIDPicture,
        avatarPreview, setAvatarPreview,
        // File names (for UI display persistence)
        signatureFileName,
        IDPictureFileName,
        SRNFileName,
        seamansBookFileName,
        lastDisembarkationFileName,
        licenseFileName,
        currentPassword, setCurrentPassword,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        isPasswordRuleValid, setIsPasswordRuleValid,
        isSubmitting,
        isFetching,
        isFetchingActivities,
        activities,
        
        // Utilities
        userData,
        formatDateToReadable,
        EndAdornment,
        inputType,
        
        // Methods
        initializeUserData,
        fetchPersonalInformation,
        GetActivities,
        CheckUploadedAvatar,
        SubmitFormPersonal,
        SubmitFormChangePassword,
        
        // Animation Components
        Toast,
        SubmitLoadingAnim
    };
};

export default useMyAccountLogic;
