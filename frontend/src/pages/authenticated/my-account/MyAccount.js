import { useEffect, useRef, useState } from 'react';
import useGetCurrentUser from '../../../hooks/useGetCurrentUser';
import PageName from '../component/PageName';
import SkeletonLoader from '../component/SkeletonLoader/SkeletonLoader';
import { useNavigate } from 'react-router-dom';
import useWebToken from '../../../hooks/useWebToken';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import axios from 'axios';
import useShowSubmitLoader from '../../../hooks/useShowSubmitLoader';
import MSWDDataTable from '../component/MSWDDataTable/MSWDDataTable';
import useDateFormat from '../../../hooks/useDateFormat';
import ReactPasswordChecklist from 'react-password-checklist';
import useToggleShowHidePass from '../../../hooks/useToggleShowHidePass';

const MyAccount = () => {
    const { url } = useSystemURLCon();
    const navigate = useNavigate();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader();
    const { getToken, removeToken } = useWebToken();
    const { userData, refreshUser } = useGetCurrentUser();
    const { formatDateToReadable } = useDateFormat();
    const [isPasswordRuleValid, setIsPasswordRuleValid] = useState(false);
    const { inputType, toggle } = useToggleShowHidePass();

    const [firstName, setFirstName] = useState('');
    const [middlename, setMiddlename] = useState('');
    const [lastName, setLastName] = useState('');
    const [suffix, setSuffix] = useState('');
    const [sex, setSex] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('');
    const fileInputRef = useRef(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const [activities, setActivities] = useState([]);
    const [isFetchingActivities, setIsFetchingActivities] = useState(true);

    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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

            const token = getToken();
            const response = await axios.get(`${url}/my-account/get_activities`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if(response.status === 200) {
                setActivities(response.data.activities);
            } 
        } catch (error) {
            if(error.response.status === 500) {
                removeToken();
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
            setIsFetchingActivities(false);
        }
    }

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
            }

            URL.revokeObjectURL(objectUrl);
        };

        img.src = objectUrl;
    }

    const SubmitFormPersonal = async (e) => {
        e.preventDefault();

        try {
            setProgress(0);
            setIsSubmitting(true);
            setShowLoader(true);

            const token = getToken();
            const formData = new FormData();
            formData.append('firstName', firstName);
            formData.append('middleName', middlename);
            formData.append('lastName', lastName);
            formData.append('suffix', suffix);
            formData.append('email', email.toLowerCase());
            formData.append('sex', sex);
            formData.append('avatar', avatar);

            const response = await axios.post(`${url}/my-account/update_personal`, formData, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percent);
                    }
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if(response.status === 200) {
                alert(response.data.message);

                if(response.data.reloggin) {
                    alert("You will be logged out.");
                    removeToken();
                    navigate('/access-denied');
                }
            } 
        } catch (error) {
            if(error.response.status === 500) {
                removeToken();
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

            const token = getToken();
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
                    Authorization: `Bearer ${token}`
                }
            });

            if(response.status === 200) {
                alert(response.data.message);

                if(response.data.reloggin) {
                    alert("You will be logged out.");
                    removeToken();
                    navigate('/access-denied');
                }
            } 
        } catch (error) {
            if(error.response.status === 500) {
                removeToken();
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
            selector: row => row.user_activity,
            sortable: true,
        },
    ];

    return (
        <>
            { isSubmitting && <SubmitLoadingAnim cls='loader' /> }

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
                                    <div className="card card-primary card-outline card-outline-tabs">
                                        <div className="card-header p-0 border-bottom-0">
                                            <ul className="nav nav-tabs small" id="custom-tabs-header-tab" role="tablist">
                                                <li className="nav-item">
                                                    <a className="nav-link py-1 active" id="custom-tabs-main-tab" data-toggle="pill" href="#custom-tabs-main" role="tab" aria-controls="custom-tabs-main" aria-selected="true">
                                                        <span className="fas fa-home pr-1"></span>
                                                        Personal
                                                    </a>
                                                </li>

                                                <li className="nav-item">
                                                    <a className="nav-link py-1" id="custom-tabs-change-password-tab" data-toggle="pill" href="#custom-tabs-change-password" role="tab" aria-controls="custom-tabs-change-password" aria-selected="false">
                                                        <span className="fas fa-key pr-1"></span>
                                                        Change Password
                                                    </a>
                                                </li>

                                                <li className="nav-item">
                                                    <a className="nav-link py-1" id="custom-tabs-activity-tab" onClick={() => { GetActivities(); }} data-toggle="pill" href="#custom-tabs-activity" role="tab" aria-controls="custom-tabs-activity" aria-selected="false">
                                                        <span className="fas fa-history pr-1"></span>
                                                        Activity
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="card-body">
                                            <div className="tab-content" id="custom-tabs-header-tabContent">
                                                <div className="tab-pane fade show active" id="custom-tabs-main" role="tabpanel" aria-labelledby="custom-tabs-main-tab">
                                                    <div className='alert alert-default border small'>
                                                        <div className='row'>
                                                            <div className='col-1 text-center' style={{ paddingTop: '5px' }}>
                                                                <span className='fas fa-exclamation text-danger text-bold' style={{ fontSize: '23px' }}></span>
                                                            </div>

                                                            <div className='col-11' style={{ lineHeight: '17px' }}>
                                                                Once you change your email, the system will generate a temporary password and send it to the new email address you provided to ensure account protection. 
                                                                You will then be logged out and need to log in again with the temporary password.
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <form onSubmit={SubmitFormPersonal} method='POST' encType="multipart/form-data">
                                                        <div className='row'>
                                                            <div className='col-xl-3 mb-1'>
                                                                <label className="form-label small mb-0">First name <span className="text-danger">*</span></label>
                                                                <div className="input-group mb-1">
                                                                    <input type="text" placeholder="Enter here.." value={firstName} onChange={(e) => setFirstName(e.target.value)} className="form-control form-control-sm" required />
                                                                </div>
                                                            </div>

                                                            <div className='col-xl-3 mb-1'>
                                                                <label className="form-label small mb-0">Middle name</label>
                                                                <div className="input-group mb-1">
                                                                    <input type="text" placeholder="Enter here.." value={middlename} onChange={(e) => setMiddlename(e.target.value)} className="form-control form-control-sm" />
                                                                </div>
                                                            </div>

                                                            <div className='col-xl-3 mb-1'>
                                                                <label className="form-label small mb-0">Last name <span className="text-danger">*</span></label>
                                                                <div className="input-group mb-1">
                                                                    <input type="text" placeholder="Enter here.." value={lastName} onChange={(e) => setLastName(e.target.value)} className="form-control form-control-sm" required />
                                                                </div>
                                                            </div>

                                                            <div className='col-xl-3 mb-1'>
                                                                <label className="form-label small mb-0">Suffix</label>
                                                                <select value={suffix} onChange={(e) => setSuffix(e.target.value)} className='form-control form-control-sm' defaultValue="">
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

                                                            <div className='col-xl-3 mb-1'>
                                                                <label className="form-label small mb-0">Sex</label>
                                                                <select value={sex} onChange={(e) => setSex(e.target.value)} className='form-control form-control-sm' defaultValue={userData.sex}>
                                                                    <option value="MALE">MALE</option>
                                                                    <option value="FEMALE">FEMALE</option>
                                                                </select>
                                                            </div>

                                                            <div className='col-xl-3 mb-1'>
                                                                <label className="form-label small mb-0">Email <span className="text-danger">*</span></label>
                                                                <div className="input-group mb-1">
                                                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control form-control-sm" required />
                                                                </div>
                                                            </div>

                                                            <div className='col-xl-6 mb-1'>
                                                                <label className="form-label small mb-0">Avatar</label>
                                                                <div className="input-group mb-1">
                                                                    <input type="file" accept='image/*' ref={fileInputRef} onChange={(e) => CheckUploadedAvatar(e.target)} className="form-control form-control-sm" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <button type="submit" disabled={ isSubmitting || !firstName || !middlename || !lastName || !email } className="btn btn-primary btn-sm mt-3 elevation-1 text--fontPos13--xW8hS">
                                                            Save Changes
                                                        </button>
                                                    </form>
                                                </div>

                                                <div className="tab-pane fade" id="custom-tabs-change-password" role="tabpanel" aria-labelledby="custom-tabs-change-password-tab">
                                                    <form onSubmit={SubmitFormChangePassword}>
                                                        <div className='row'>
                                                            <div className='col-xl-12'>
                                                                <label className="form-label small mb-0">Enter Current Password <span className="text-danger">*</span></label>
                                                                <div className="input-group mb-1">
                                                                    <input required placeholder='Enter here..' type={inputType} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="form-control form-control-sm" />
                                                                </div>
                                                            </div>

                                                            <div className='col-xl-6'>
                                                                <label className="form-label small mb-0">New Password <span className="text-danger">*</span></label>
                                                                <div className="input-group mb-1">
                                                                    <input required placeholder='Enter here..' type={inputType} value={password} onChange={(e) => setPassword(e.target.value)} className="form-control form-control-sm" />
                                                                </div>
                                                            </div>

                                                            <div className='col-xl-6'>
                                                                <label className="form-label small mb-0">Confirm Password <span className="text-danger">*</span></label>
                                                                <div className="input-group mb-2">
                                                                    <input required placeholder='Enter here..' type={inputType} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-control form-control-sm" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <ReactPasswordChecklist
                                                            rules={["minLength","specialChar","number","capital","match"]}
                                                            minLength={5}
                                                            value={password}
                                                            valueAgain={confirmPassword}
                                                            iconSize={10}
                                                            onChange={(isValid) => {
                                                                setIsPasswordRuleValid(isValid);
                                                            }}
                                                            className="alert alert-light px-3 py-1 small text-dark"
                                                        />

                                                        <div className="d-flex align-items-center mt-2">
                                                            <input type="checkbox" onClick={toggle} className="mr-1" />
                                                            <small>Show Password</small>
                                                        </div>
                                                        
                                                        <button type="submit" disabled={ isSubmitting || !currentPassword || !password || !confirmPassword || !isPasswordRuleValid } className="btn btn-primary btn-sm mt-3 elevation-1 text--fontPos13--xW8hS">
                                                            Save Changes
                                                        </button>
                                                    </form>
                                                </div>

                                                <div className="tab-pane fade" id="custom-tabs-activity" role="tabpanel" aria-labelledby="custom-tabs-activity-tab">
                                                    {
                                                        isFetchingActivities
                                                            ? <SkeletonLoader onViewMode='update' />
                                                            : <MSWDDataTable 
                                                                progressPending={isFetchingActivities}
                                                                columns={tableColumns} 
                                                                data={activities}
                                                                selectableRows={false}
                                                                selectedRows={null}
                                                            />
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
            }
        </>
    )
}

export default MyAccount;