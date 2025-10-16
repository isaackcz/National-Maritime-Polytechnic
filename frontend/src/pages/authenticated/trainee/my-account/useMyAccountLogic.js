import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useGetCurrentUser from '../../../../hooks/useGetCurrentUser';
import useGetToken from '../../../../hooks/useGetToken';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import useShowSubmitLoader from '../../../../hooks/useShowSubmitLoader';
import useShowToaster from '../../../../hooks/useShowToaster';
import useDateFormat from '../../../../hooks/useDateFormat';
import useToggleShowHidePass from '../../../../hooks/useToggleShowHidePass';
import { set } from 'date-fns';


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
    const [courses, setCourses] = useState([]);
    const [schools, setSchools] = useState([]);


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
    const [birthdate, setBirthdate] = useState('');
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
    const [YearGraduated, setYearGraduated] = useState('');
    
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

    // File Preview URLs for existing files
    const [signatureFileUrl, setSignatureFileUrl] = useState('');
    const [IDPictureFileUrl, setIDPictureFileUrl] = useState('');
    const [SRNFileUrl, setSRNFileUrl] = useState('');
    const [seamansBookFileUrl, setSeamansBookFileUrl] = useState('');
    const [lastDisembarkationFileUrl, setLastDisembarkationFileUrl] = useState('');
    const [licenseFileUrl, setLicenseFileUrl] = useState('');

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
                setBirthdate(data.birthdate || '');
                setSex(data.additional_trainee_info.general_info.gen_info_gender);
                // STEP 2: Check if there's additional trainee information
                if (data.additional_trainee_info) {
                    const additionalInfo = data.additional_trainee_info;

                // STEP 3: Fill general information (SRN, nationality, civil status, etc.)
                if (additionalInfo.general_info) {
                    const genInfo = additionalInfo.general_info;

                    setsrn(genInfo.gen_info_srn || '');
                    setUserType(genInfo.gen_info_status || 'NEW');
                    setCivilStatus(genInfo.gen_info_civil_status || '');

                    // Handle nationality
                    setNationality(genInfo.gen_info_citizenship || 'FILIPINO');
                    if (genInfo.gen_info_citizenship && genInfo.gen_info_citizenship !== 'FILIPINO') {
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
                if (additionalInfo.contact) {
                    const contact = additionalInfo.contact;
                    setCPname(contact.person_name || '');
                    setCPrelationship(contact.person_relationship || '');
                    setCPaddress(contact.person_address || '');
                    setCPtelephoneNumber(contact.person_landline || '');
                    setCPmobileNumber1(contact.person_number_one || '');
                    setCPmobileNumber2(contact.person_number_two || '');
                    setCPemail(contact.person_email || '');
                }

                // STEP 7: Fill educational information
                if (additionalInfo.educational_attainment) {
                    const education = additionalInfo.educational_attainment;
                    setCourseTaken(education.main_course_id || '');
                    setYearGraduated(education.school_graduated || '');
                    setSchoolName(education.main_school_id || '');
                }

                // STEP 8: Fill shipboard experience information
                if (additionalInfo.latest_shipboard_attainment) {
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
                if (additionalInfo.trainee_registration_file){
                const file = additionalInfo.trainee_registration_file;
                console.log("files: ", additionalInfo.trainee_registration_file);
                
                // Set file names
                console.log("Setting file names from API data:", {
                    signature: file.file_e_signature,
                    idPicture: file.file_id_picture,
                    srn: file.file_srn_number,
                    seamansBook: file.file_sea_service,
                    lastDisembarkation: file.file_last_disembarkment,
                    license: file.file_marina_license
                });
                
                setSignatureFileName(file.file_e_signature || '');
                setIDPictureFileName(file.file_id_picture || '');
                setSRNFileName(file.file_srn_number || '');
                setSeamansBookFileName(file.file_sea_service || '');
                setLastDisembarkationFileName(file.file_last_disembarkment || '');
                setLicenseFileName(file.file_marina_license || '');
                
                // Set file preview URLs for existing files
                // Construct the correct base URL for file access
                const baseUrl = url.replace('/api', ''); // Remove /api from backend URL to get base URL
                setSignatureFileUrl(file.file_e_signature ? `${baseUrl}/trainee-files/${file.file_e_signature}` : '');
                setIDPictureFileUrl(file.file_id_picture ? `${baseUrl}/trainee-files/${file.file_id_picture}` : '');
                setSRNFileUrl(file.file_srn_number ? `${baseUrl}/trainee-files/${file.file_srn_number}` : '');
                setSeamansBookFileUrl(file.file_sea_service ? `${baseUrl}/trainee-files/${file.file_sea_service}` : '');
                setLastDisembarkationFileUrl(file.file_last_disembarkment ? `${baseUrl}/trainee-files/${file.file_last_disembarkment}` : '');
                setLicenseFileUrl(file.file_marina_license ? `${baseUrl}/trainee-files/${file.file_marina_license}` : '');

                // Debug: Log the loaded file data
                console.log("Loaded file data from API:", {
                    signature: file.file_e_signature,
                    idPicture: file.file_id_picture,
                    srn: file.file_srn_number,
                    seamansBook: file.file_sea_service,
                    lastDisembarkation: file.file_last_disembarkment,
                    license: file.file_marina_license
                });

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


    



    const initializeUserData = () => {
        if(isFetching) {
            fetchPersonalInformation();
        }
    };

    // Clear validation errors when file data is loaded
    useEffect(() => {
        // This effect will run when file names are set, clearing any validation errors
        console.log("File names useEffect triggered:", {
            signature: signatureFileName,
            idPicture: IDPictureFileName,
            srn: SRNFileName,
            seamansBook: seamansBookFileName,
            lastDisembarkation: lastDisembarkationFileName,
            license: licenseFileName
        });
        
        if (signatureFileName || IDPictureFileName || SRNFileName || seamansBookFileName || lastDisembarkationFileName || licenseFileName) {
            console.log("File data loaded, clearing validation errors if any");
            // The validation will be re-run when the form is submitted or when stepping through the form
        }
    }, [signatureFileName, IDPictureFileName, SRNFileName, seamansBookFileName, lastDisembarkationFileName, licenseFileName]);

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


    const CheckUploadedAvatar = (e, fileType) => {
        // Handle both regular file input and drag-and-drop events
        const file = e.target?.files?.[0] || e.files?.[0];
        const fileName = file ? file.name : '';

        console.log(`Processing ${fileType}:`, { file, fileName, eventType: e.target ? 'input' : 'drag' });

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
            case 'lastDisembarkation':
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

        console.log(`Uploaded ${fileType}:`, file);
    };



    const SubmitFormPersonal = async (e) => {
        e.preventDefault();

        console.log("Form submission initiated");
        console.log("File states before submission:", {
            signatureFile: signatureFile,
            signatureFileName: signatureFileName,
            IDPicture: IDPicture,
            IDPictureFileName: IDPictureFileName,
            SRNFile: SRNFile,
            SRNFileName: SRNFileName,
            seamansBook: seamansBook,
            seamansBookFileName: seamansBookFileName,
            LastDisembarkation: LastDisembarkation,
            lastDisembarkationFileName: lastDisembarkationFileName,
            licenseFile: licenseFile,
            licenseFileName: licenseFileName
        });
        
        try {
            setProgress(0);
            setIsSubmitting(true);
            setShowLoader(true);
            const token = getToken("csrf-token");
            const formData = new FormData();

            // STEP 2: Add general information fields to form data
            formData.append('fname', firstName || '');
            formData.append('mname', middlename || '');
            formData.append('lname', lastName || '');
            formData.append('suffix', suffix || '');
            formData.append('email', email.toLowerCase() || '');
            formData.append('gen_info_trainee_id', userData?.id  || '');
            formData.append('gen_info_srn', srn || ''); 
            formData.append('gen_info_status', userType || 'NEW'); 
            formData.append('gen_info_gender', sex || ''); 
            formData.append('birthdate', birthdate || '');
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
            formData.append('gen_info_number_one', mobileNumber1 || 0);
            formData.append('gen_info_number_two', mobileNumber2 || 0);
            formData.append('gen_info_landline', landline || '');
            formData.append('gen_info_email', email.toLowerCase());
            formData.append('gen_info_facebook', facebookAccount || '');
            
            // STEP 6: Add contact person fields
            formData.append('person_name', CPname || '');
            formData.append('person_relationship', CPrelationship || '');
            formData.append('person_address', CPaddress || '');
            formData.append('landline', CPtelephoneNumber || ''); 
            formData.append('person_number_one', CPmobileNumber1 || '');
            formData.append('person_number_two', CPmobileNumber2 || '');
            formData.append('person_email', CPemail || '');
            
            // STEP 7: Add educational attainment fields
            formData.append('school_course_taken', CourseTaken || '');
            formData.append('school', SchoolName || '');
            formData.append('school_year_graduated', YearGraduated || '');
            
            // STEP 8: Add shipboard experience fields
            formData.append('ship_status', shipboardExperience || '');
            formData.append('ship_license', license || '');
            formData.append('ship_rank', rank || '');
            formData.append('ship_date_of_embarkment', disembarkation || ''); 
            formData.append('ship_principal', ShippingPrincipal || '');
            formData.append('ship_manning', ManningCompany || '');
            formData.append('ship_landline', LandlineNumber || '');
            formData.append('ship_number', LSEMobileNumber || '');
            formData.append('httpMethod', "POST");
            
            // STEP 9: Add file attachments (only if files are selected)
            // For updates: only append files if they are new uploads (not just existing filenames)
            // For new users: append the actual file objects
            
            if (signatureFile && signatureFile instanceof File) {
                formData.append('file_e_signature', signatureFile);
                console.log("Appending signature file:", signatureFile.name);
            } else if (signatureFileName) {
                console.log("Signature file exists but not uploading new one:", signatureFileName);
            }
            
            if (IDPicture && IDPicture instanceof File) {
                formData.append('file_id_picture', IDPicture);
                console.log("Appending ID picture file:", IDPicture.name);
            } else if (IDPictureFileName) {
                console.log("ID picture file exists but not uploading new one:", IDPictureFileName);
            }
            
            if (SRNFile && SRNFile instanceof File) {
                formData.append('file_srn_number', SRNFile);
                console.log("Appending SRN file:", SRNFile.name);
            } else if (SRNFileName) {
                console.log("file exists but not uploading new one:", SRNFileName);
            }
            
            if (seamansBook && seamansBook instanceof File) {
                formData.append('file_sea_service', seamansBook);
                console.log("Appending sea service file:", seamansBook.name);
            } else if (seamansBookFileName) {
                console.log("Sea service file exists but not uploading new one:", seamansBookFileName);
            }
            
            if (LastDisembarkation && LastDisembarkation instanceof File) {
                formData.append('file_last_disembarkment', LastDisembarkation);
                console.log("Appending last disembarkation file:", LastDisembarkation.name);
            } else if (lastDisembarkationFileName) {
                console.log("Last disembarkation file exists but not uploading new one:", lastDisembarkationFileName);
            }
            
            if (licenseFile && licenseFile instanceof File) {
                formData.append('file_marina_license', licenseFile);
                console.log("Appending license file:", licenseFile.name);
            } else if (licenseFileName) {
                console.log("License file exists but not uploading new one:", licenseFileName);
            }

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
            console.log("Files being sent:", {
                signature: signatureFile?.name,
                idPicture: IDPicture?.name,
                srn: SRNFile?.name,
                seamansBook: seamansBook?.name,
                lastDisembarkation: LastDisembarkation?.name,
                license: licenseFile?.name
            });
            console.log("payload: ", response);
            // STEP 11: Handle successful response
            if(response.status === 200 || response.status === 201) {
                // Show success toast
                setToastMessage(response.data.message || 'Information saved successfully!');
                setToastStatus('success');
                setOpenToast(true);
                
                // Refresh user data to get updated file information
                console.log("Refreshing user data after successful update...");
                await fetchPersonalInformation();

                if(response.data.reloggin) {
                    setTimeout(() => {
                        setToastMessage('Email changed. Please login again with your new credentials.');
                        setToastStatus('info');
                        setOpenToast(true);
                    }, 2600);
                    
                    setTimeout(() => {
                        // removeToken('csrf-token');
                        // navigate('/access-denied');
                    }, 5000);
                }
            }
            console.log("useridid: ", userData?.id);
        } catch (error) {
            console.log("id: ", userData?.id);
            console.error("Form submission error:", error);
            console.log("USER DATA RETAINED - All form inputs preserved for correction and resubmission");
            
            if (error.response) {
                // Server responded with error
                if (error.response.status === 500) {
                    setToastMessage('Session expired. Please login again.');
                    setToastStatus('error');
                    setOpenToast(true);
                    setTimeout(() => {
                        // removeToken('csrf-token');
                        // navigate('/access-denied');
                    }, 2000);
                } else if (error.response.status === 422) {
                    const message = error.response.data?.message || "Please check your input and try again.";
                    setToastMessage(`Validation Error: ${message}. Your data has been retained - please correct and resubmit.`);
                    setToastStatus('error');
                    setOpenToast(true);
                } else {
                    setToastMessage(`${error.response.data?.message || "Failed to save information"}. Your data is safe - please try again.`);
                    setToastStatus('error');
                    setOpenToast(true);
                }
            } else if (error.request) {
                // No response from server
                setToastMessage("Cannot connect to server. Your data is safe - please check your internet and try again.");
                setToastStatus('error');
                setOpenToast(true);
            } else {
                // Other errors
                setToastMessage("An error occurred. Your data has been retained - please try again.");
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
            console.error("Password change error:", error);
            console.log("PASSWORD FIELDS RETAINED - User can correct and retry");
            
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
        birthdate, setBirthdate,
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
        // File preview URLs (for existing files)
        signatureFileUrl,
        IDPictureFileUrl,
        SRNFileUrl,
        seamansBookFileUrl,
        lastDisembarkationFileUrl,
        licenseFileUrl,
        currentPassword, setCurrentPassword,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        isPasswordRuleValid, setIsPasswordRuleValid,
        isSubmitting,
        isFetching,
        isFetchingActivities,
        activities,
        courses,
        YearGraduated, setYearGraduated,
        
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