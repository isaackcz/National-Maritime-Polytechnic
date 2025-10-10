import { useEffect } from 'react';
import ReactPasswordChecklist from 'react-password-checklist';
import { FormControl, InputLabel, OutlinedInput } from '@mui/material';
import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';
import PageName from '../../../components/PageName';
import NMPDataTable from '../../../components/NMPDataTable/NMPDataTable';
import PersonalInfoStepper from './PersonalInfoStepper';
import useMyAccountLogic from './useMyAccountLogic';
import { ProfilePictureSection, AlertBox } from './MyAccountFormSections';
import { passwordInputProps, passwordLabelProps, passwordFieldProps } from '../components/inputStyles';

const MyAccount = () => {
    const logic = useMyAccountLogic();

    useEffect(() => {
        logic.initializeUserData();
    }, []);

    const tableColumns = [
        {
            name: "Date",
            selector: row => logic.formatDateToReadable(row.created_at, true),
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
            <PageName pageName={[{ 'name': 'My Account', 'last': true, 'address': '/welcome/my-account' }]} />
            
            {/* Loading Animation */}
            <logic.SubmitLoadingAnim cls="loader" />
            
            {/* Toast Notifications */}
            <logic.Toast />

            {logic.isFetching ? <SkeletonLoader /> : (
                <section className="content">
                        <div className="container-fluid">
                            <div className="row fade-up">
                                <div className="col-xl-12">
                                    <div className="card card-primary card-outline card-outline-tabs shadow-sm border-0">
                                        <div className="card-header p-0 border-bottom-0" style={{ backgroundColor: '#fafafa' }}>
                                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center" style={{ padding: '0.5rem 1rem' }}>
                                                <ul className="nav nav-tabs flex-column flex-md-row w-100 w-md-auto" id="custom-tabs-header-tab" role="tablist" style={{ borderBottom: '2px solid #e5e5e5' }}>
                                                <li className="nav-item">
                                                    <a className="nav-link active" id="custom-tabs-main-tab" data-toggle="pill" href="#custom-tabs-main" role="tab" style={{ fontSize: '13px', fontWeight: '500', padding: '0.5rem 1rem', border: 'none', borderBottom: '3px solid transparent', transition: 'all 0.3s ease' }}>
                                                        <span className="fas fa-user-circle mr-2"></span><span className="d-none d-sm-inline">Personal Information</span><span className="d-inline d-sm-none">Personal</span>
                                                    </a>
                                                </li>
                                                <li className="nav-item">
                                                    <a className="nav-link" id="custom-tabs-change-password-tab" data-toggle="pill" href="#custom-tabs-change-password" role="tab" style={{ fontSize: '13px', fontWeight: '500', padding: '0.5rem 1rem', border: 'none', borderBottom: '3px solid transparent', transition: 'all 0.3s ease' }}>
                                                        <span className="fas fa-shield-alt mr-2"></span><span className="d-none d-sm-inline">Security & Password</span><span className="d-inline d-sm-none">Security</span>
                                                    </a>
                                                </li>
                                                <li className="nav-item">
                                                    <a className="nav-link" id="custom-tabs-activity-tab" onClick={() => logic.GetActivities()} data-toggle="pill" href="#custom-tabs-activity" role="tab" style={{ fontSize: '13px', fontWeight: '500', padding: '0.5rem 1rem', border: 'none', borderBottom: '3px solid transparent', transition: 'all 0.3s ease', cursor: 'pointer' }}>
                                                        <span className="fas fa-clock mr-2"></span><span className="d-none d-sm-inline">Activity History</span><span className="d-inline d-sm-none">Activity</span>
                                                    </a>
                                                </li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="card-body" style={{ padding: '1rem', backgroundColor: '#ffffff' }}>
                                        <div className="tab-content">
                                            {/* PERSONAL INFORMATION TAB */}
                                            <div className="tab-pane fade show active" id="custom-tabs-main" role="tabpanel">
                                                <AlertBox type="info" icon="info-circle" title="Important Information" message="Once you change your email, the system will generate a temporary password and send it to the new email address you provided to ensure account protection. You will then be logged out and need to log in again with the temporary password." />
                                                
                                                <ProfilePictureSection avatarPreview={logic.avatarPreview} fileInputRef={logic.fileInputRef} CheckUploadedAvatar={logic.CheckUploadedAvatar} setAvatarPreview={logic.setAvatarPreview} />

                                                {/* Form submission is now handled inside PersonalInfoStepper to prevent accidental submissions */}
                                                <PersonalInfoStepper logic={logic} />
                                                </div>

                                            {/* PASSWORD TAB */}
                                            <div className="tab-pane fade" id="custom-tabs-change-password" role="tabpanel">
                                                <AlertBox type="warning" icon="shield-alt" title="Security Reminder" message="Make sure your new password is strong and unique. After changing your password, you may be logged out and need to sign in again with your new credentials." color="#ff8c00" bgColor="#fff4e5" />

                                                <form onSubmit={logic.SubmitFormChangePassword}>
                                                        <div className="row">
                                                        <div className="col-12 mb-3">
                                                            <FormControl {...passwordInputProps}>
                                                                <InputLabel {...passwordLabelProps}>Current Password *</InputLabel>
                                                                <OutlinedInput value={logic.currentPassword} onChange={(e) => logic.setCurrentPassword(e.target.value)} type={logic.inputType} endAdornment={<logic.EndAdornment />} label="Current Password *" {...passwordFieldProps} />
                                                                                </FormControl>
                                                                            </div>
                                                        <div className="col-12 mb-4">
                                                                                <label className="form-label small mb-2 font-weight-semibold" style={{ color: '#323130', fontSize: '13px' }}>
                                                                <i className="fas fa-check-circle mr-1"></i>Password Requirements
                                                                                </label>
                                                            <ReactPasswordChecklist rules={["minLength", "specialChar", "number", "capital"]} minLength={6} value={logic.password} iconSize={10} onChange={(isValid) => logic.setIsPasswordRuleValid(isValid)} style={{ marginBottom: '0', minHeight: '110px', fontSize: '12px' }} />
                                                                            </div>
                                                        <div className="col-12 col-md-6 mb-3">
                                                            <FormControl {...passwordInputProps}>
                                                                <InputLabel {...passwordLabelProps}>New Password *</InputLabel>
                                                                <OutlinedInput value={logic.password} onChange={(e) => logic.setPassword(e.target.value)} type={logic.inputType} endAdornment={<logic.EndAdornment />} label="New Password *" {...passwordFieldProps} />
                                                                                </FormControl>
                                                                            </div>
                                                        <div className="col-12 col-md-6 mb-3">
                                                            <FormControl {...passwordInputProps}>
                                                                <InputLabel {...passwordLabelProps}>Confirm Password *</InputLabel>
                                                                <OutlinedInput value={logic.confirmPassword} onChange={(e) => logic.setConfirmPassword(e.target.value)} type={logic.inputType} endAdornment={<logic.EndAdornment />} label="Confirm Password *" {...passwordFieldProps} />
                                                                                </FormControl>
                                                                            </div>
                                                            <div className="col-12">
                                                            <button type="submit" disabled={logic.isSubmitting || !logic.currentPassword || !logic.password || !logic.confirmPassword || logic.password !== logic.confirmPassword || !logic.isPasswordRuleValid} className="btn btn-primary shadow-sm px-3 py-2 w-100 w-md-auto" style={{ fontSize: '13px', fontWeight: '600', borderRadius: '4px', transition: 'all 0.3s ease' }}>
                                                                <i className="fas fa-lock mr-2"></i>{logic.isSubmitting ? 'Updating...' : 'Update Password'}
                                                                    </button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>

                                            {/* ACTIVITY TAB */}
                                            <div className="tab-pane fade" id="custom-tabs-activity" role="tabpanel">
                                                <AlertBox type="success" icon="history" title="Activity Log" message="Here you can view all your account activities including logins, updates, and other important actions." color="#28a745" bgColor="#d4edda" />
                                                <NMPDataTable columns={tableColumns} data={logic.activities} progressPending={logic.isFetchingActivities} />
                                                                    </div>
                                                                </div>
                                                                                </div>
                                                                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
            )}
        </>
    );
};

export default MyAccount;