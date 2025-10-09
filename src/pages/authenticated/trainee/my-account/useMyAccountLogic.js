import { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useGetCurrentUser from '../../../../hooks/useGetCurrentUser';
import useGetToken from '../../../../hooks/useGetToken';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import useShowSubmitLoader from '../../../../hooks/useShowSubmitLoader';
import useDateFormat from '../../../../hooks/useDateFormat';
import useToggleShowHidePass from '../../../../hooks/useToggleShowHidePass';

/**
 * Custom hook for MyAccount logic and state management
 * @returns {Object} All state, handlers, and utilities for MyAccount
 */
const useMyAccountLogic = () => {
    const { url } = useSystemURLCon();
    const navigate = useNavigate();
    const { setShowLoader, setProgress } = useShowSubmitLoader(); 
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
        postalCode: '',
        completeAddress: ''
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
     * Fetch complete personal information from API
     */
    const fetchPersonalInformation = async () => {
        try {
            const token = getToken('csrf-token');
            const response = await axios.get(`${url}/my-account/get_trainee_general_info`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if(response.status === 200) {
                const data = response.data.personal_information;
                
                // Basic user data
                setFirstName(data.fname || '');
                setMiddlename(data.mname || '');
                setLastName(data.lname || '');
                setSuffix(data.suffix || '');
                setEmail(data.email || '');
                setSex(data.sex || '');

                // Check if additional info exists
                if(data.addtional_trainee_info) {
                    const additionalInfo = data.addtional_trainee_info;

                    // General Information
                    if(additionalInfo.general_info) {
                        const genInfo = additionalInfo.general_info;
                        setsrn(genInfo.gen_info_srn || '');
                        setUserType(genInfo.gen_info_status === 'NEW' ? 'New' : 'Returnee');
                        setNationality(genInfo.gen_info_citizenship || 'Filipino');
                        if(genInfo.gen_info_citizenship && !['Filipino'].includes(genInfo.gen_info_citizenship)) {
                            setNationalityOther(genInfo.gen_info_citizenship);
                            setNationality('Others');
                        }
                        setCivilStatus(genInfo.gen_info_civil_status || '');
                        setMobileNumber1(genInfo.gen_info_number_one || '');
                        setMobileNumber2(genInfo.gen_info_number_two || '');
                        setLandline(genInfo.gen_info_landline || '');
                        setFacebookAccount(genInfo.gen_info_facebook || '');
                        
                        // Current Address
                        setAddressData({
                            region: genInfo.gen_info_region || '',
                            province: genInfo.gen_info_province || '',
                            municipality: genInfo.gen_info_municipality || '',
                            barangay: genInfo.gen_info_barangay || '',
                            houseNo: genInfo.gen_info_house_no || '',
                            postalCode: genInfo.gen_info_postal || '',
                            completeAddress: genInfo.gen_info_region ? 
                                `${genInfo.gen_info_house_no}, ${genInfo.gen_info_barangay}, ${genInfo.gen_info_municipality}, ${genInfo.gen_info_province}, ${genInfo.gen_info_region}` : ''
                        });

                        // Birthplace Address
                        setBirthplaceAddress({
                            region: genInfo.gen_info_birthplace_region || '',
                            province: genInfo.gen_info_birthplace_province || '',
                            municipality: genInfo.gen_info_birthplace_municipality || '',
                            barangay: genInfo.gen_info_birthplace_barangay || '',
                            houseNo: '',
                            postalCode: '',
                            completeAddress: genInfo.gen_info_birthplace_region ? 
                                `${genInfo.gen_info_birthplace_barangay}, ${genInfo.gen_info_birthplace_municipality}, ${genInfo.gen_info_birthplace_province}, ${genInfo.gen_info_birthplace_region}` : ''
                        });
                    }

                    // Contact Person
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

                    // Educational Attainment
                    if(additionalInfo.educational_attainment) {
                        const education = additionalInfo.educational_attainment;
                        setCourseTaken(education.school_course_taken || '');
                        setSchoolAddress(education.school_address || '');
                        setSchoolName(education.school_graduated || '');
                    }

                    // Latest Shipboard Experience
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
                removeToken('csrf-token');
                navigate('/access-denied');
            }
        } finally {
            setIsFetching(false);
        }
    };

    /**
     * Initialize user data from context
     */
    const initializeUserData = () => {
        if(userData && isFetching) {
            fetchPersonalInformation();
        }
    };

    /**
     * Get user activities from API
     */
    const GetActivities = async () => {
        try {
            setIsFetchingActivities(true);
            const token = getToken('csrf-token');
            
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
            if(error.response.status === 500) {
                removeToken('csrf-token');
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
            setIsFetchingActivities(false);
        }
    };

    /**
     * Validate uploaded avatar - must be square
     */
    const CheckUploadedAvatar = (e, fileType = 'avatar') => {
        const file = e.target ? e.target.files[0] : e.files?.[0];
        if (!file) return;

        // Handle avatar upload (already cropped to square from ImageCropModal)
        if (fileType === 'avatar') {
            setAvatar(file);
            return;
        }

        // Handle other file types
        switch(fileType) {
            case 'signature':
                setSignatureFile(file);
                break;
            case 'idPicture':
                setIDPicture(file);
                break;
            case 'srnNumber':
                setSRNFile(file);
                break;
            case 'seaService':
                setSeamansBook(file);
                break;
            case 'lastEmbarkment':
                setLastDisembarkation(file);
                break;
            case 'marinaLicense':
                setLicenseFile(file);
                break;
            default:
                console.warn('Unknown file type:', fileType);
        }
    };

    /**
     * Submit personal information update to Laravel API
     */
    const SubmitFormPersonal = async (e) => {
        e.preventDefault();

        try {
            setProgress(0);
            setIsSubmitting(true);
            setShowLoader(true);
            const token = getToken('csrf-token');
            const formData = new FormData();
            
            // General Information Fields
            formData.append('gen_info_trainee_id', userData?.id || '');
            formData.append('gen_info_srn', srn);
            formData.append('gen_info_status', (userType || '').toUpperCase());
            formData.append('gen_info_gender', (sex || '').toUpperCase());
            formData.append('gen_info_civil_status', (civilStatus || '').toUpperCase());
            formData.append('gen_info_citizenship', nationality === 'Others' ? nationalityOther : nationality);
            formData.append('gen_info_house_no', addressData.houseNo || '');
            formData.append('gen_info_region', addressData.region || '');
            formData.append('gen_info_province', addressData.province || '');
            formData.append('gen_info_municipality', addressData.municipality || '');
            formData.append('gen_info_barangay', addressData.barangay || '');
            formData.append('gen_info_birthplace_region', birthplaceAddress.region || '');
            formData.append('gen_info_birthplace_province', birthplaceAddress.province || '');
            formData.append('gen_info_birthplace_municipality', birthplaceAddress.municipality || '');
            formData.append('gen_info_birthplace_barangay', birthplaceAddress.barangay || '');
            formData.append('gen_info_postal', addressData.postalCode || '');
            formData.append('gen_info_number_one', mobileNumber1 || '');
            formData.append('gen_info_number_two', mobileNumber2 || '');
            formData.append('gen_info_landline', landline || '');
            formData.append('gen_info_email', email.toLowerCase());
            formData.append('gen_info_facebook', facebookAccount || '');
            
            // Contact Person Fields
            formData.append('person_name', CPname || '');
            formData.append('person_relationship', CPrelationship || '');
            formData.append('person_address', CPaddress || '');
            formData.append('person_landline', CPtelephoneNumber || '');
            formData.append('person_number_one', CPmobileNumber1 || '');
            formData.append('person_number_two', CPmobileNumber2 || '');
            formData.append('person_email', CPemail || '');
            
            // Educational Attainment Fields
            formData.append('school_course_taken', CourseTaken || '');
            formData.append('school_address', SchoolAddress || '');
            formData.append('school_graduated', SchoolName || '');
            
            // Latest Shipboard Experience Fields
            formData.append('ship_status', shipboardExperience || '');
            formData.append('ship_license', license || '');
            formData.append('ship_rank', rank || '');
            formData.append('ship_date_of_disembarkment', disembarkation || '');
            formData.append('ship_principal', ShippingPrincipal || '');
            formData.append('ship_manning', ManningCompany || '');
            formData.append('ship_landline', LandlineNumber || '');
            formData.append('ship_number', LSEMobileNumber || '');
            
            // Trainee Registration Files
            if (signatureFile) formData.append('file_e_signature', signatureFile);
            if (IDPicture) formData.append('file_id_picture', IDPicture);
            if (SRNFile) formData.append('file_srn_number', SRNFile);
            if (seamansBook) formData.append('file_sea_service', seamansBook);
            if (LastDisembarkation) formData.append('file_last_embarkment', LastDisembarkation);
            if (licenseFile) formData.append('file_marina_license', licenseFile);

            const response = await axios.post(`${url}/my-account/create_or_update_additional_info`, formData, {
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

            console.log(response);

            if(response.status === 200) {
                alert(response.data.message);

                if(response.data.reloggin) {
                    alert("You will be logged out.");
                    removeToken('csrf-token');
                    navigate('/access-denied');
                }
            }
        } catch (error) {
            console.error("API Error:", error);

            if (error.response) {
                console.log("Response:", error.response);

                if (error.response.status === 500) {
                    removeToken('csrf-token');
                    console.log(error.response.data);
                } else {
                    alert(error.response.data?.message || "An error occurred while submitting the form.");
                }
            } else if (error.request) {
                console.error("No response received:", error.request);
                alert("No response from the server. Please check your connection or backend status.");
            } else {
                console.error("Unexpected error:", error.message);
                alert("Unexpected error occurred. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
            setShowLoader(false);
        }
    };

    /**
     * Submit password change to Laravel API
     */
    const SubmitFormChangePassword = async (e) => {
        e.preventDefault();

        try {
            setProgress(0);
            setIsSubmitting(true);
            setShowLoader(true);

            const token = getToken("csrf-token");
            const formData = new FormData();
            formData.append('current_password', currentPassword);
            formData.append('password', password);
            formData.append('password_confirmation', confirmPassword);

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

            if(response.status === 200) {
                alert(response.data.message);

                if(response.data.reloggin) {
                    alert("You will be logged out.");
                    removeToken('csrf-token');
                    navigate('/access-denied');
                }
            }
        } catch (error) {
            if(error.response.status === 500) {
                removeToken('csrf-token');
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
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
        SubmitFormChangePassword
    };
};

export default useMyAccountLogic;

