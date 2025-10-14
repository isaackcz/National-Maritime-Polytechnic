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
    const [userType, setUserType] = useState('NEW');
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
                setSex(data.sex ? data.sex.toUpperCase() : '');

                // STEP 2: Check if there's additional trainee information
                if(data.additional_trainee_info) {
                    const additionalInfo = data.additional_trainee_info;

                    // STEP 3: Fill general information (SRN, nationality, civil status, etc.)
                    if(additionalInfo.general_info) {
                        const genInfo = additionalInfo.general_info;
                        
                        setsrn(genInfo.gen_info_srn || '');
                        setUserType(genInfo.gen_info_status || 'NEW');
                        setBirthday(genInfo.gen_info_birthdate || '');
                        setCivilStatus(genInfo.gen_info_civil_status || '');
                        
                        // Handle nationality
                        setNationality(genInfo.gen_info_citizenship || 'FILIPINO');
                        if(genInfo.gen_info_citizenship && genInfo.gen_info_citizenship !== 'FILIPINO') {
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
            console.error("Error fetching personal information:", error);
            
            if(error.response?.status === 500) {
                alert('Session expired. Please login again.');
                removeToken('csrf-token');
                navigate('/access-denied');
                // console.log("sdfsdcvcf: ", error.response);
            }
        } finally {
            setIsFetching(false);
        }
    };

    const initializeUserData = () => {
        if(isFetching) {
            fetchPersonalInformation();
        }
    };

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
                // console.log("xm,cnv; ", error.response);
            } else {
                alert(error.response?.data?.message || 'Failed to load activities');
            }
        } finally {
            setIsFetchingActivities(false);
        }
    };

    const CheckUploadedAvatar = (e, fileType = 'avatar') => {
        const file = e.target ? e.target.files[0] : e.files?.[0];
        const fileName = e.fileName || file?.name || '';
        
        if (!file) return;

        if (fileType === 'avatar') {
            setAvatar(file);
            return;
        }

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

    const SubmitFormPersonal = async (e) => {
        e.preventDefault();
        
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
            
            // Utility: sanitize phone by stripping non-digits (remove '+' and formatting)
            const sanitizePhone = (phone) => {
                if (!phone) return '';
                return String(phone).replace(/\D/g, '');
            };

            // STEP 2: Add general information fields to form data
            formData.append('gen_info_trainee_id', userData?.id || '');
            formData.append('gen_info_srn', srn || '');
            formData.append('gen_info_status', userType || 'NEW');
            formData.append('gen_info_gender', sex || ''); 
            formData.append('gen_info_birthdate', birthday || '');
            formData.append('gen_info_civil_status', civilStatus || '');
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
            formData.append('gen_info_number_one', sanitizePhone(mobileNumber1));
            formData.append('gen_info_number_two', sanitizePhone(mobileNumber2));
            formData.append('gen_info_landline', sanitizePhone(landline));
            formData.append('gen_info_email', email.toLowerCase());
            formData.append('gen_info_facebook', facebookAccount || '');
            
            // STEP 6: Add contact person fields
            formData.append('person_name', CPname || '');
            formData.append('person_relationship', CPrelationship || '');
            formData.append('person_address', CPaddress || '');
            formData.append('person_landline', sanitizePhone(CPtelephoneNumber));
            formData.append('person_number_one', sanitizePhone(CPmobileNumber1));
            formData.append('person_number_two', sanitizePhone(CPmobileNumber2));
            formData.append('person_email', CPemail || '');
            
            // STEP 7: Add educational attainment fields
            formData.append('school_course_taken', CourseTaken || '');
            formData.append('school_address', SchoolAddress || '');
            formData.append('school_graduated', SchoolName || '');
            
            // STEP 8: Add shipboard experience fields
            formData.append('ship_status', shipboardExperience || '');
            formData.append('ship_license', license || '');
            formData.append('ship_rank', rank || '');
            formData.append('ship_date_of_embarkment', disembarkation || '');
            formData.append('ship_principal', ShippingPrincipal || '');
            formData.append('ship_manning', ManningCompany || '');
            formData.append('ship_landline', sanitizePhone(LandlineNumber));
            formData.append('ship_number', sanitizePhone(LSEMobileNumber));
            formData.append('httpMethod', "POST");
            
            // STEP 9: Add file attachments (only if files are selected)
            if (signatureFile) formData.append('file_e_signature', signatureFile);
            if (IDPicture) formData.append('file_id_picture', IDPicture);
            if (SRNFile) formData.append('file_srn_number', SRNFile);
            if (seamansBook) formData.append('file_sea_service', seamansBook);
            if (LastDisembarkation) formData.append('file_last_disembarkment', LastDisembarkation);
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
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                }
            });

            // STEP 11: Handle successful response
            if(response.status === 200 || response.status === 201) {
                // Show success toast
                setToastMessage(response.data.message || 'Information saved successfully!');
                setToastStatus('success');
                setOpenToast(true);
                
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
                        // console.log("blablalba",response.data)
                    }, 5000);
                }
            }
        } catch (error) {

            console.error("❌ Form submission error:", error);
            console.log("✅ USER DATA RETAINED - All form inputs preserved for correction and resubmission");

            
            
            if (error.response) {
                // Server responded with error
                if (error.response.status === 500) {
                    setToastMessage('⚠️ Session expired. Please login again.');
                    setToastStatus('error');
                    setOpenToast(true);
                    setTimeout(() => {
                        removeToken('csrf-token');
                        navigate('/access-denied');
                        // console.log("pep: ", error.response);
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
            
        } finally {
            // STEP 13: Stop loading indicators
            setIsSubmitting(false);
            setShowLoader(false);
        }
    };


    const SubmitFormChangePassword = async (e) => {
        e.preventDefault();

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
                        // console.loog("pew: ", response?.data);
                    }, 5000);
                }
            }
        } catch (error) {

            console.error("Password change error:", error);
            console.log("PASSWORD FIELDS RETAINED - User can correct and retry");
            
            if(error.response?.status === 500) {
                setToastMessage('⚠️ Session expired. Please login again.');
                setToastStatus('error');
                setOpenToast(true);
                setTimeout(() => {
                    removeToken('csrf-token');
                    navigate('/access-denied');
                    // console.log("asdas; ", error.response); 
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
