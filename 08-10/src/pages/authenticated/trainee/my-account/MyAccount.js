import { useEffect, useRef, useState } from 'react';
import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactPasswordChecklist from 'react-password-checklist';
import useGetCurrentUser from '../../../../hooks/useGetCurrentUser';
import PageName from '../../../components/PageName';
import useGetToken from '../../../../hooks/useGetToken';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import useShowSubmitLoader from '../../../../hooks/useShowSubmitLoader';
import NMPDataTable from '../../../components/NMPDataTable/NMPDataTable';
import useDateFormat from '../../../../hooks/useDateFormat';
import useToggleShowHidePass from '../../../../hooks/useToggleShowHidePass';
import NoDataFound from '../../../components/NoDataFound';
import { FormControl, InputLabel, OutlinedInput } from '@mui/material';
import PhilippinesAddressDropdown from './PhilippinesAddressDropdown';
import RegistrationExtensionModal from './RegistrationExtensionModal';

const MyAccount = () => {
    // mga hooks para han page
    const { url, urlWithoutToken } = useSystemURLCon(); // para API calls
    const navigate = useNavigate(); // para route
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader(); // loading animation kun mag submit
    const { getToken, removeToken } = useGetToken(); // para token han user
    const { userData, refreshUser } = useGetCurrentUser(); // makuha it user info
    const { formatDateToReadable } = useDateFormat(); // format han date
    const [isPasswordRuleValid, setIsPasswordRuleValid] = useState(false); // check kun valid password
    const { EndAdornment, visible, inputType } = useToggleShowHidePass(); // tago o tikdo password

    const [firstName, setFirstName] = useState('');
    const [middlename, setMiddlename] = useState('');
    const [lastName, setLastName] = useState('');
    const [suffix, setSuffix] = useState('');
    const [sex, setSex] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('');
    const [userType, setUserType] = useState('New');
    const fileInputRef = useRef(null);

    // dag dag input
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
    const [areaCode, setAreaCode] = useState('');
    const [landline, setLandline] = useState('');
    const [mobileNumber1, setMobileNumber1] = useState('');
    const [mobileNumber2, setMobileNumber2] = useState('');
    const [facebookAccount, setFacebookAccount] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [activities, setActivities] = useState([]);
    const [isFetchingActivities, setIsFetchingActivities] = useState(true);

    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [avatarPreview, setAvatarPreview] = useState(null);

    // Registration extension modal state
    const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);

    /**
     * Check if personal information is complete
     * 
     * @function isPersonalInfoComplete
     * @returns {boolean} true if all required personal info is filled
     */
    const isPersonalInfoComplete = () => {
        return firstName && 
               lastName && 
               email && 
               nationality && 
               (nationality !== 'Others' || nationalityOther) &&
               civilStatus && 
               birthday && 
               birthplaceAddress.completeAddress && 
               addressData.completeAddress && 
               mobileNumber1 && 
               sex;
    };

    /**
     * Handle extension modal button click
     * 
     * @function handleExtensionModalClick
     * @returns {void}
     */
    const handleExtensionModalClick = () => {
        if (!isPersonalInfoComplete()) {
            alert('Please complete all required personal information fields before proceeding with registration extension.');
            return;
        }
        setIsExtensionModalOpen(true);
    };

    useEffect(() => {
        if(userData && isFetching) {
            setFirstName(userData.fname);
            setMiddlename(userData.mname);
            setLastName(userData.lname);
            setSuffix(userData.suffix);
            setEmail(userData.email);
            setSex(userData.sex);

            setIsFetching(false);
        }
    }, [userData, isFetching]);

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
            // ===== END API INTEGRATION SECTION =====
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
    }

    /**
     * Validate uploaded avatar - must be square (equal width & height)
     */
    const CheckUploadedAvatar = (e) => {
        const file = e.files[0];
        if (!file) return;
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
    
        img.onload = () => {
            if (img.width === img.height) {
                setAvatar(file);
            } else {
                alert(`❌ Invalid image size. Uploaded: ${img.width}x${img.height}px. Image height & width should be same.`);
                e.value = "";
                setAvatar('');
                setAvatarPreview(null);
            }
    
            URL.revokeObjectURL(objectUrl);
        };
    
        img.src = objectUrl;
    }

    /**
     * Submit personal information update to Laravel API
     */
    const SubmitFormPersonal = async (e) => {
        e.preventDefault();

        try {
            setProgress(0);
            setIsSubmitting(true);
            setShowLoader(true);

            // ===== LARAVEL API INTEGRATION - ALREADY IMPLEMENTED =====
            const token = getToken('csrf-token');
            const formData = new FormData();
            formData.append('firstName', firstName);
            formData.append('middleName', middlename);
            formData.append('lastName', lastName);
            formData.append('suffix', suffix);
            formData.append('email', email.toLowerCase());
            formData.append('sex', sex);
            formData.append('avatar', avatar);
                        
            // Address fields
            formData.append('userType', userType);
            formData.append('nationality', nationality === 'Others' ? nationalityOther : nationality);
            formData.append('civilStatus', civilStatus);
            formData.append('birthday', birthday);
            formData.append('birthplace', birthplaceAddress.completeAddress);
            formData.append('mailingAddress', addressData.completeAddress);
            formData.append('region', addressData.region);
            formData.append('province', addressData.province);
            formData.append('municipality', addressData.municipality);
            formData.append('barangay', addressData.barangay);
            formData.append('houseNo', addressData.houseNo);
            formData.append('postalCode', addressData.postalCode);
            formData.append('areaCode', areaCode);
            formData.append('landline', landline);
            formData.append('mobileNumber1', mobileNumber1);
            formData.append('mobileNumber2', mobileNumber2);
            formData.append('facebookAccount', facebookAccount);

            const response = await axios.post(`${url}/my-account/update_personal`, formData, {
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
            // ===== END API INTEGRATION SECTION =====
        } catch (error) {
            if(error.response.status === 500) {
                removeToken('csrf-token');
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
            refreshUser();
            setIsSubmitting(false);
            setShowLoader(false);
            setAvatar('');

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }

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
    }

    const tableColumns = [
        {
            name: "Date",
            selector: row => formatDateToReadable(row.created_at, true),
            sortable: true,
            minWidth: "300px",
            maxWidth: "300px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Activity",
            selector: row => row.actions,
            sortable: true,
        },
    ];

    return (
        <>
            {/* loading kun mag submit */}
            { isSubmitting && <SubmitLoadingAnim cls='loader' /> }

            {/* breadcrumb navigation */}
            <PageName pageName={[
                {
                    'name' : 'My Account',
                    'last' : true,
                    'address' : '/welcome/my-account'
                }
            ]}/>

           
            {
                isFetching
                    ? <SkeletonLoader />
                    : <section className="content">
                        <div className="container-fluid">
                            <div className="row fade-up">
                                <div className="col-xl-12">
                                    <div className="card card-primary card-outline card-outline-tabs shadow-sm border-0">
                                        <div className="card-header p-0 border-bottom-0" style={{ backgroundColor: '#fafafa' }}>
                                            <div className="d-flex justify-content-between align-items-center" style={{ padding: '0 1.5rem' }}>
                                                <ul className="nav nav-tabs" id="custom-tabs-header-tab" role="tablist" style={{ borderBottom: '2px solid #e5e5e5' }}>
                                                <li className="nav-item">
                                                    <a 
                                                        className="nav-link active" 
                                                        id="custom-tabs-main-tab" 
                                                        data-toggle="pill" 
                                                        href="#custom-tabs-main" 
                                                        role="tab" 
                                                        aria-controls="custom-tabs-main" 
                                                        aria-selected="true"
                                                        style={{
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            padding: '0.75rem 1.5rem',
                                                            border: 'none',
                                                            borderBottom: '3px solid transparent',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        <span className="fas fa-user-circle mr-2"></span>
                                                        Personal Information
                                                    </a>
                                                </li>

                                                {/*password tab */}
                                                <li className="nav-item">
                                                    <a 
                                                        className="nav-link" 
                                                        id="custom-tabs-change-password-tab" 
                                                        data-toggle="pill" 
                                                        href="#custom-tabs-change-password" 
                                                        role="tab" 
                                                        aria-controls="custom-tabs-change-password" 
                                                        aria-selected="false"
                                                        style={{
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            padding: '0.75rem 1.5rem',
                                                            border: 'none',
                                                            borderBottom: '3px solid transparent',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        <span className="fas fa-shield-alt mr-2"></span>
                                                        Security & Password
                                                    </a>
                                                </li>

                                                {/*activities tab */}
                                                <li className="nav-item">
                                                    <a 
                                                        className="nav-link" 
                                                        id="custom-tabs-activity-tab" 
                                                        onClick={() => { GetActivities(); }} 
                                                        data-toggle="pill" 
                                                        href="#custom-tabs-activity" 
                                                        role="tab" 
                                                        aria-controls="custom-tabs-activity" 
                                                        aria-selected="false"
                                                        style={{
                                                            fontSize: '14px',
                                                            fontWeight: '500',
                                                            padding: '0.75rem 1.5rem',
                                                            border: 'none',
                                                            borderBottom: '3px solid transparent',
                                                            transition: 'all 0.3s ease',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <span className="fas fa-clock mr-2"></span>
                                                        Activity History
                                                    </a>
                                                </li>
                                                </ul>
                                                
                                                {/* Registration Extension Button */}
                                                <div className="d-flex align-items-center">
                                                    <button
                                                        type="button"
                                                        onClick={handleExtensionModalClick}
                                                        // disabled={!isPersonalInfoComplete()}
                                                        className="btn btn-success btn-sm shadow-sm"
                                                        style={{
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            borderRadius: '4px',
                                                            transition: 'all 0.3s ease',
                                                            opacity: isPersonalInfoComplete() ? 1 : 0.6,
                                                            cursor: isPersonalInfoComplete() ? 'pointer' : 'not-allowed'
                                                        }}
                                                        title={!isPersonalInfoComplete() ? 'Please complete personal information first' : 'Open registration extension form'}
                                                    >
                                                        <i className="fas fa-user-plus mr-1"></i>
                                                        Registration Extension
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-body" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                                            <div className="tab-content" id="custom-tabs-header-tabContent">
                                                <div className="tab-pane fade show active" id="custom-tabs-main" role="tabpanel" aria-labelledby="custom-tabs-main-tab">
                                                    <div className="alert alert-info border-0 shadow-sm mb-4" style={{ backgroundColor: '#e7f3ff', borderLeft: '4px solid #0078d4' }}>
                                                        <div className="row align-items-center">
                                                            <div className="col-auto">
                                                                <span className="fas fa-info-circle text-primary" style={{ fontSize: '24px' }}></span>
                                                            </div>
                                                            <div className="col" style={{ fontSize: '13px', lineHeight: '1.6', color:'black' }}>
                                                                <strong className="d-block mb-1">Important Information</strong>
                                                                Once you change your email, the system will generate a temporary password and send it to the new email address you provided to ensure account protection. You will then be logged out and need to log in again with the temporary password.
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <form onSubmit={SubmitFormPersonal} method='POST' encType="multipart/form-data">
                                                        
                                                        <div className="row mb-4">
                                                            <div className="col-12">
                                                                <div className="card shadow-sm border-0" style={{ backgroundColor: '#fafafa' }}>
                                                                    <div className="card-body p-4">
                                                                        <div className="row align-items-center">
                                                                            <div className="col-md-3 col-12 text-center mb-3 mb-md-0">
                                                                                <div className="position-relative d-inline-block">
                                                                                    <div 
                                                                                        className="bg-white rounded-circle d-flex align-items-center justify-content-center overflow-hidden shadow-sm" 
                                                                                        style={{
                                                                                            width: '140px', 
                                                                                            height: '140px', 
                                                                                            border: '4px solid #0078d4', 
                                                                                            cursor: 'pointer',
                                                                                            transition: 'all 0.3s ease'
                                                                                        }}
                                                                                        onClick={() => fileInputRef.current?.click()}
                                                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                                                    >
                                                                                        {avatarPreview ? (
                                                                                            <img 
                                                                                                src={avatarPreview} 
                                                                                                alt="Profile preview" 
                                                                                                className="w-100 h-100"
                                                                                                style={{objectFit: 'cover'}}
                                                                                            />
                                                                                        ) : (
                                                                                            <i className="fas fa-user text-muted" style={{fontSize: '3.5rem'}}></i>
                                                                                        )}
                                                                                    </div>
                                                                                    <div 
                                                                                        className="position-absolute bg-primary rounded-circle d-flex align-items-center justify-content-center shadow"
                                                                                        style={{
                                                                                            width: '36px',
                                                                                            height: '36px',
                                                                                            bottom: '5px',
                                                                                            right: '5px',
                                                                                            cursor: 'pointer'
                                                                                        }}
                                                                                        onClick={() => fileInputRef.current?.click()}
                                                                                    >
                                                                                        <i className="fas fa-camera text-white" style={{fontSize: '14px'}}></i>
                                                                                    </div>
                                                                                    <input
                                                                                        type="file" 
                                                                                        accept="image/*" 
                                                                                        ref={fileInputRef} 
                                                                                        onChange={(e) => {
                                                                                            CheckUploadedAvatar(e.target);
                                                                                            if (e.target.files && e.target.files[0]) {
                                                                                                const reader = new FileReader();
                                                                                                reader.onload = (e) => {
                                                                                                    setAvatarPreview(e.target.result);
                                                                                                };
                                                                                                reader.readAsDataURL(e.target.files[0]);
                                                                                            }
                                                                                        }} 
                                                                                        className="d-none"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-md-9 col-12">
                                                                                <h6 className="mb-2 font-weight-bold" style={{ color: '#323130' }}>
                                                                                    <i className="fas fa-image mr-2 text-primary"></i>
                                                                                    Profile Picture
                                                                                </h6>
                                                                                <p className="text-muted mb-2" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                                                                                    Click the profile picture or camera icon to upload or change your photo. Ensure the image is square (equal width and height) for best results.
                                                                                </p>
                                                                                <small className="text-muted d-block" style={{ fontSize: '12px' }}>
                                                                                    <i className="fas fa-check-circle text-success mr-1"></i>
                                                                                    Recommended: 500x500px or larger, JPG/PNG format
                                                                                </small>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="row mb-4">
                                                            <div className="col-12">
                                                                <div className="card shadow-sm border-0">
                                                                    <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                                                        <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                                                            <i className="fas fa-user-circle mr-2 text-primary"></i>
                                                                            Basic Information
                                                                        </h6>
                                                                    </div>
                                                                    <div className="card-body p-4">
                                                                        <div className="row mb-3">
                                                                            <div className="col-12">
                                                                                <div className="d-flex align-items-center justify-content-between p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                                                                                    <div className="d-flex align-items-center">
                                                                                        <i className={`fas ${userType === 'New' ? 'fa-user-plus' : 'fa-user-check'} mr-2`} style={{ fontSize: '20px', color: '#0078d4' }}></i>
                                                                                        <div>
                                                                                            <label className="mb-0 font-weight-semibold" style={{ color: '#323130', fontSize: '14px' }}>
                                                                                                Trainee Status
                                                                                            </label>
                                                                                            <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>
                                                                                                {userType === 'New' ? 'First time enrolling' : 'Previously enrolled trainee'}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="d-flex align-items-center">
                                                                                        <span className={`mr-2 font-weight-semibold ${userType === 'New' ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '13px' }}>
                                                                                            New
                                                                                        </span>
                                                                                        <div 
                                                                                            onClick={() => setUserType(userType === 'New' ? 'Returnee' : 'New')}
                                                                                            style={{
                                                                                                width: '50px',
                                                                                                height: '24px',
                                                                                                backgroundColor: userType === 'Returnee' ? '#0078d4' : '#d1d1d1',
                                                                                                borderRadius: '12px',
                                                                                                position: 'relative',
                                                                                                cursor: 'pointer',
                                                                                                transition: 'all 0.3s ease',
                                                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                                            }}
                                                                                        >
                                                                                            <div 
                                                                                                style={{
                                                                                                    width: '20px',
                                                                                                    height: '20px',
                                                                                                    backgroundColor: 'white',
                                                                                                    borderRadius: '50%',
                                                                                                    position: 'absolute',
                                                                                                    top: '2px',
                                                                                                    left: userType === 'Returnee' ? '28px' : '2px',
                                                                                                    transition: 'all 0.3s ease',
                                                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                                                                }}
                                                                                            ></div>
                                                                                        </div>
                                                                                        <span className={`ml-2 font-weight-semibold ${userType === 'Returnee' ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '13px' }}>
                                                                                            Returnee
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <div className="row">
                                                                            <div className='col-xl-3 col-md-6 mb-3'>
                                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    First Name <span className="text-danger">*</span>
                                                                                </label>
                                                                                <input 
                                                                                    type="text" 
                                                                                    placeholder="Enter first name..." 
                                                                                    value={firstName} 
                                                                                    onChange={(e) => setFirstName(e.target.value)} 
                                                                                    className="form-control form-control-sm" 
                                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                                    required 
                                                                                />
                                                                            </div>

                                                                            {/* middle name input */}
                                                                            <div className='col-xl-3 col-md-6 mb-3'>
                                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    Middle Name
                                                                                </label>
                                                                                <input 
                                                                                    type="text" 
                                                                                    placeholder="Enter middle name..." 
                                                                                    value={middlename} 
                                                                                    onChange={(e) => setMiddlename(e.target.value)} 
                                                                                    className="form-control form-control-sm"
                                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                                />
                                                                            </div>

                                                                            {/* last name input */}
                                                                            <div className='col-xl-3 col-md-6 mb-3'>
                                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    Last Name <span className="text-danger">*</span>
                                                                                </label>
                                                                                <input 
                                                                                    type="text" 
                                                                                    placeholder="Enter last name..." 
                                                                                    value={lastName} 
                                                                                    onChange={(e) => setLastName(e.target.value)} 
                                                                                    className="form-control form-control-sm"
                                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                                    required 
                                                                                />
                                                                            </div>

                                                                            <div className='col-xl-3 col-md-6 mb-3'>
                                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    Suffix
                                                                                </label>
                                                                                <select 
                                                                                    value={suffix} 
                                                                                    onChange={(e) => setSuffix(e.target.value)} 
                                                                                    className='form-control form-control-sm'
                                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                                >
                                                                                    <option value="">-- Choose --</option>
                                                                                    <option value="JR.">JR.</option>
                                                                                    <option value="SR.">SR.</option>
                                                                                    <option value="I">I</option>
                                                                                    <option value="II">II</option>
                                                                                    <option value="III">III</option>
                                                                                    <option value="IV">IV</option>
                                                                                    <option value="V">V</option>
                                                                                </select>
                                                                            </div>

                                                                            <div className="col-xl-3 col-md-6 mb-3">
                                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    Sex <span className="text-danger">*</span>
                                                                                </label>
                                                                                <select 
                                                                                    value={sex} 
                                                                                    onChange={(e) => setSex(e.target.value)} 
                                                                                    className='form-control form-control-sm'
                                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                                    required
                                                                                >
                                                                                    <option value="MALE">Male</option>
                                                                                    <option value="FEMALE">Female</option>
                                                                                </select>
                                                                            </div>

                                                                            <div className='col-xl-3 col-md-6 mb-3'>
                                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    Email Address <span className="text-danger">*</span>
                                                                                </label>
                                                                                <input 
                                                                                    type="email" 
                                                                                    placeholder="Enter email address..."
                                                                                    value={email} 
                                                                                    onChange={(e) => setEmail(e.target.value)} 
                                                                                    className="form-control form-control-sm"
                                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                                    required 
                                                                                />
                                                                            </div>

                                                                            <div className="col-xl-3 col-md-6 mb-3">
                                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    Nationality <span className="text-danger">*</span>
                                                                                </label>
                                                                                <select
                                                                                    value={nationality}
                                                                                    onChange={(e) => {
                                                                                        setNationality(e.target.value);
                                                                                        if (e.target.value !== 'Others') {
                                                                                            setNationalityOther('');
                                                                                        }
                                                                                    }}
                                                                                    className="form-control form-control-sm"
                                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                                    required
                                                                                >
                                                                                    <option value="Filipino">Filipino</option>
                                                                                    <option value="Others">Others</option>
                                                                                </select>
                                                                            </div>

                                                                            {nationality === 'Others' && (
                                                                                <div className="col-xl-3 col-md-6 mb-3">
                                                                                    <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                        Specify Nationality <span className="text-danger">*</span>
                                                                                    </label>
                                                                                    <input
                                                                                        type="text"
                                                                                        placeholder="Please specify your nationality"
                                                                                        value={nationalityOther}
                                                                                        onChange={(e) => setNationalityOther(e.target.value)}
                                                                                        className="form-control form-control-sm"
                                                                                        style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                                        required
                                                                                    />
                                                                                </div>
                                                                            )}

                                                                            <div className="col-xl-3 col-md-6 mb-3">
                                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    Civil Status <span className="text-danger">*</span>
                                                                                </label>
                                                                                <select
                                                                                    value={civilStatus}
                                                                                    onChange={(e) => setCivilStatus(e.target.value)}
                                                                                    className="form-control form-control-sm"
                                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                                    required
                                                                                >
                                                                                    <option value="">-- Choose --</option>
                                                                                    <option value="Single">Single</option>
                                                                                    <option value="Married">Married</option>
                                                                                    <option value="Widowed">Widowed</option>
                                                                                    <option value="Separated">Separated</option>
                                                                                    <option value="Divorced">Divorced</option>
                                                                                </select>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="row mb-4">
                                                            <div className="col-12">
                                                                <div className="card shadow-sm border-0">
                                                                    <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                                                        <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                                                            <i className="fas fa-birthday-cake mr-2 text-primary"></i>
                                                                            Birth Information
                                                                        </h6>
                                                                    </div>
                                                                    <div className="card-body p-4">
                                                                        <div className="row">
                                                                            <div className="col-xl-6 col-md-6 mb-3">
                                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    Date of Birth <span className="text-danger">*</span>
                                                                                </label>
                                                                                <input
                                                                                    type="date"
                                                                                    value={birthday}
                                                                                    onChange={(e) => setBirthday(e.target.value)}
                                                                                    className="form-control form-control-sm"
                                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                                    required
                                                                                />
                                                                            </div>

                                                                            <div className="col-12 mb-3">
                                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    <i className="fas fa-map-marker-alt mr-2 text-primary"></i>
                                                                                    Place of Birth <span className="text-danger">*</span>
                                                                                </label>
                                                                                <PhilippinesAddressDropdown 
                                                                                    onAddressChange={setBirthplaceAddress}
                                                                                    defaultValues={birthplaceAddress}
                                                                                    showHouseAndPostal={false}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="row mb-4">
                                                            <div className="col-12">
                                                                <div className="card shadow-sm border-0">
                                                                    <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                                                        <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                                                            <i className="fas fa-address-book mr-2 text-primary"></i>
                                                                            Contact Information
                                                                        </h6>
                                                                    </div>
                                                                    <div className="card-body p-4">
                                                                        <PhilippinesAddressDropdown 
                                                                            onAddressChange={setAddressData}
                                                                            defaultValues={addressData}
                                                                        />

                                                                        <div className="row">
                                                                            <div className="col-xl-3 col-md-6 mb-3">
                                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    Mobile Number 1 <span className="text-danger">*</span>
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="09XX XXX XXXX"
                                                                                    value={mobileNumber1}
                                                                                    onChange={(e) => setMobileNumber1(e.target.value)}
                                                                                    className="form-control form-control-sm"
                                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                                    maxLength="11"
                                                                                    pattern="[0-9]{11}"
                                                                                    required
                                                                                />
                                                                            </div>

                                                                            <div className="col-xl-3 col-md-6 mb-3">
                                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    Mobile Number 2
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Optional"
                                                                                    value={mobileNumber2}
                                                                                    onChange={(e) => setMobileNumber2(e.target.value)}
                                                                                    className="form-control form-control-sm"
                                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                                    maxLength="11"
                                                                                />
                                                                            </div>

                                                                            <div className="col-xl-3 col-md-6 mb-3">
                                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    Area Code
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="e.g., 053"
                                                                                    value={areaCode}
                                                                                    onChange={(e) => setAreaCode(e.target.value)}
                                                                                    className="form-control form-control-sm"
                                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                                    maxLength="4"
                                                                                />
                                                                            </div>

                                                                            <div className="col-xl-3 col-md-6 mb-3">
                                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    Landline
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="e.g., 123-4567"
                                                                                    value={landline}
                                                                                    onChange={(e) => setLandline(e.target.value)}
                                                                                    className="form-control form-control-sm"
                                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                                />
                                                                            </div>

                                                                            <div className="col-xl-12 col-md-12 mb-3">
                                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    <i className="fab fa-facebook mr-1" style={{ color: '#1877f2' }}></i>
                                                                                    Facebook Account
                                                                                </label>
                                                                                <input
                                                                                    type="text"
                                                                                    placeholder="Enter Facebook profile name or link..."
                                                                                    value={facebookAccount}
                                                                                    onChange={(e) => setFacebookAccount(e.target.value)}
                                                                                    className="form-control form-control-sm"
                                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="row">
                                                            <div className="col-12">
                                                                <div className="d-flex justify-content-end align-items-center">
                                                                    <button 
                                                                        type="submit" 
                                                                        // disabled={ 
                                                                        //     isSubmitting || 
                                                                        //     !firstName || 
                                                                        //     !lastName || 
                                                                        //     !email || 
                                                                        //     !nationality || 
                                                                        //     (nationality === 'Others' && !nationalityOther) ||
                                                                        //     !civilStatus || 
                                                                        //     !birthday || 
                                                                        //     !birthplaceAddress.completeAddress || 
                                                                        //     !addressData.completeAddress || 
                                                                        //     !mobileNumber1 || 
                                                                        //     !sex 
                                                                        // } 
                                                                        className="btn btn-primary shadow-sm px-4 py-2"
                                                                        style={{
                                                                            fontSize: '14px',
                                                                            fontWeight: '600',
                                                                            borderRadius: '4px',
                                                                            transition: 'all 0.3s ease'
                                                                        }}
                                                                    >
                                                                        <i className="fas fa-save mr-2"></i>
                                                                        Save Changes
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>

                                                <div className="tab-pane fade" id="custom-tabs-change-password" role="tabpanel" aria-labelledby="custom-tabs-change-password-tab">
                                                    <div className="alert alert-warning border-0 shadow-sm mb-4" style={{ backgroundColor: '#fff4e5', borderLeft: '4px solid #ff8c00' }}>
                                                        <div className="row align-items-center">
                                                            <div className="col-auto">
                                                                <span className="fas fa-shield-alt" style={{ fontSize: '24px', color: '#ff8c00' }}></span>
                                                            </div>
                                                            <div className="col" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                                                                <strong className="d-block mb-1">Security Reminder</strong>
                                                                Make sure your new password is strong and unique. After changing your password, you may be logged out and need to sign in again with your new credentials.
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <form onSubmit={SubmitFormChangePassword}>
                                                        <div className="row">
                                                            <div className="col-12">
                                                                <div className="card shadow-sm border-0">
                                                                    <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                                                        <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                                                            <i className="fas fa-key mr-2 text-primary"></i>
                                                                            Password Update
                                                                        </h6>
                                                                    </div>
                                                                    <div className="card-body p-4">
                                                                        <div className='row'>
                                                                            <div className='col-xl-12 mb-4'>
                                                                                <label className="form-label small mb-2 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    <i className="fas fa-lock mr-1"></i>
                                                                                    Current Password <span className='text-danger'>*</span>
                                                                                </label>
                                                                                <FormControl className='w-100' variant="outlined" size="small">
                                                                                    <InputLabel htmlFor="outlined-adornment-current-password">Enter your current password</InputLabel>
                                                                                    <OutlinedInput
                                                                                        required
                                                                                        value={currentPassword}
                                                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                                                        id="outlined-adornment-current-password"
                                                                                        type={inputType}
                                                                                        endAdornment={<EndAdornment />}
                                                                                        label="Enter your current password"
                                                                                        style={{ fontSize: '13px' }}
                                                                                    />
                                                                                </FormControl>
                                                                                <small className="text-muted d-block mt-1" style={{ fontSize: '12px' }}>
                                                                                    <i className="fas fa-info-circle mr-1"></i>
                                                                                    You must enter your current password to verify your identity
                                                                                </small>
                                                                            </div>

                                                                            <div className='col-xl-12 mb-4'>
                                                                                <label className="form-label small mb-2 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    <i className="fas fa-check-circle mr-1"></i>
                                                                                    Password Requirements
                                                                                </label>
                                                                                <ReactPasswordChecklist
                                                                                    rules={["minLength", "specialChar", "number", "capital"]}
                                                                                    minLength={6}
                                                                                    value={password}
                                                                                    iconSize={11}
                                                                                    onChange={(isValid) => {
                                                                                        setIsPasswordRuleValid(isValid);
                                                                                    }}
                                                                                    style={{ marginBottom: '0', minHeight: '130px' }}
                                                                                    className="alert alert-light border shadow-sm px-3 py-2 text-dark"
                                                                                />
                                                                            </div>

                                                                            <div className='col-xl-12 mb-4'>
                                                                                <label className="form-label small mb-2 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    <i className="fas fa-lock-open mr-1"></i>
                                                                                    New Password <span className='text-danger'>*</span>
                                                                                </label>
                                                                                <FormControl className='w-100' variant="outlined" size="small">
                                                                                    <InputLabel htmlFor="outlined-adornment-password">Enter your new password</InputLabel>
                                                                                    <OutlinedInput
                                                                                        required
                                                                                        value={password}
                                                                                        onChange={(e) => setPassword(e.target.value)}
                                                                                        id="outlined-adornment-password"
                                                                                        type={inputType}
                                                                                        endAdornment={<EndAdornment />}
                                                                                        label="Enter your new password"
                                                                                        style={{ fontSize: '13px' }}
                                                                                    />
                                                                                </FormControl>
                                                                            </div>

                                                                            <div className='col-xl-12 mb-3'>
                                                                                <label className="form-label small mb-2 font-weight-semibold" style={{ color: '#323130' }}>
                                                                                    <i className="fas fa-check-double mr-1"></i>
                                                                                    Confirm New Password <span className='text-danger'>*</span>
                                                                                </label>
                                                                                <FormControl className='w-100' variant="outlined" size="small">
                                                                                    <InputLabel htmlFor="outlined-adornment-confirm-password">Re-enter your new password</InputLabel>
                                                                                    <OutlinedInput
                                                                                        required
                                                                                        value={confirmPassword}
                                                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                                                        id="outlined-adornment-confirm-password"
                                                                                        type={inputType}
                                                                                        endAdornment={<EndAdornment />}
                                                                                        label="Re-enter your new password"
                                                                                        style={{ fontSize: '13px' }}
                                                                                    />
                                                                                </FormControl>
                                                                                {password && confirmPassword && (
                                                                                    <small className={`d-block mt-1 ${password === confirmPassword ? 'text-success' : 'text-danger'}`} style={{ fontSize: '12px' }}>
                                                                                        <i className={`fas ${password === confirmPassword ? 'fa-check-circle' : 'fa-times-circle'} mr-1`}></i>
                                                                                        {password === confirmPassword 
                                                                                            ? 'Passwords match' 
                                                                                            : 'Passwords do not match'}
                                                                                    </small>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="row mt-3">
                                                            <div className="col-12">
                                                                <div className="d-flex justify-content-end align-items-center">
                                                                    <button 
                                                                        type="submit" 
                                                                        disabled={ 
                                                                            isSubmitting || 
                                                                            !currentPassword || 
                                                                            !password || 
                                                                            !confirmPassword || 
                                                                            !isPasswordRuleValid ||
                                                                            password !== confirmPassword
                                                                        } 
                                                                        className="btn btn-primary shadow-sm px-4 py-2"
                                                                        style={{
                                                                            fontSize: '14px',
                                                                            fontWeight: '600',
                                                                            borderRadius: '4px',
                                                                            transition: 'all 0.3s ease'
                                                                        }}
                                                                    >
                                                                        <i className="fas fa-shield-alt mr-2"></i>
                                                                        Update Password
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>

                                                <div className="tab-pane fade" id="custom-tabs-activity" role="tabpanel" aria-labelledby="custom-tabs-activity-tab">
                                                    {/* activity log section */}
                                                    <div className="row">
                                                        <div className="col-12">
                                                            <div className="card shadow-sm border-0">
                                                                <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                                                    <div className="d-flex justify-content-between align-items-center">
                                                                        <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                                                            <i className="fas fa-history mr-2 text-primary"></i>
                                                                            Activity History
                                                                        </h6>
                                                                        {!isFetchingActivities && activities.length > 0 && (
                                                                            <span className="badge badge-primary px-3 py-2" style={{ fontSize: '12px' }}>
                                                                                <i className="fas fa-list mr-1"></i>
                                                                                {activities.length} {activities.length === 1 ? 'Activity' : 'Activities'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="card-body p-4">
                                                                    {
                                                                        isFetchingActivities
                                                                            ? <SkeletonLoader onViewMode='update' />
                                                                            : activities.length > 0 ? (
                                                                                <div className="table-responsive">
                                                                                    <NMPDataTable 
                                                                                        progressPending={isFetchingActivities}
                                                                                        columns={tableColumns} 
                                                                                        data={activities}
                                                                                        selectableRows={false}
                                                                                        selectedRows={null}
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-center py-5">
                                                                                    <div className="mb-3">
                                                                                        <i className="fas fa-inbox" style={{ fontSize: '4rem', color: '#d1d1d1' }}></i>
                                                                                    </div>
                                                                                    <h5 className="text-muted mb-2">No Activities Found</h5>
                                                                                    <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                                                                                        Your activity history will appear here once you start using the system.
                                                                                    </p>
                                                                                </div>
                                                                            )
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
            }

            {/* Registration Extension Modal */}
            <RegistrationExtensionModal 
                isOpen={isExtensionModalOpen}
                onClose={() => setIsExtensionModalOpen(false)}
                isPersonalInfoComplete={isPersonalInfoComplete()}
            />
        </>
    )
}

export default MyAccount;