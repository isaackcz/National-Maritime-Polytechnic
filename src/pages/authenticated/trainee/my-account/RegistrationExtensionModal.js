import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useGetToken from '../../../../hooks/useGetToken';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import useShowSubmitLoader from '../../../../hooks/useShowSubmitLoader';
import PhilippinesAddressDropdown from './PhilippinesAddressDropdown';

/**
 * RegistrationExtensionModal Component
 * Modal for extended registration form (Educational Attainment, Shipboard Experience, Emergency Contact)
 */
const RegistrationExtensionModal = ({ isOpen, onClose, isPersonalInfoComplete }) => {
    // mga hooks
    const { url } = useSystemURLCon();
    const navigate = useNavigate();
    const { getToken, removeToken } = useGetToken();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader();

    // Educational Attainment state
    const [highestEducationalAttainment, setHighestEducationalAttainment] = useState('');
    const [courseTaken, setCourseTaken] = useState('');
    const [schoolAddress, setSchoolAddress] = useState({
        region: '',
        province: '',
        municipality: '',
        barangay: '',
        houseNo: '',
        postalCode: '',
        completeAddress: ''
    });
    const [schoolGraduated, setSchoolGraduated] = useState('');

    // Shipboard Experience state
    const [hasShipboardExperience, setHasShipboardExperience] = useState('');
    const [shipboardExperienceDetails, setShipboardExperienceDetails] = useState('');
    const [vesselName, setVesselName] = useState('');
    const [positionHeld, setPositionHeld] = useState('');
    const [employmentPeriod, setEmploymentPeriod] = useState('');

    // Emergency Contact state
    const [emergencyContactName, setEmergencyContactName] = useState('');
    const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');
    const [emergencyContactAddress, setEmergencyContactAddress] = useState({
        region: '',
        province: '',
        municipality: '',
        barangay: '',
        houseNo: '',
        postalCode: '',
        completeAddress: ''
    });
    const [emergencyContactTelephone, setEmergencyContactTelephone] = useState('');
    const [emergencyContactMobile1, setEmergencyContactMobile1] = useState('');
    const [emergencyContactMobile2, setEmergencyContactMobile2] = useState('');
    const [emergencyContactEmail, setEmergencyContactEmail] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setHighestEducationalAttainment('');
            setCourseTaken('');
            setSchoolAddress({
                region: '',
                province: '',
                municipality: '',
                barangay: '',
                houseNo: '',
                postalCode: '',
                completeAddress: ''
            });
            setSchoolGraduated('');
            setHasShipboardExperience('');
            setShipboardExperienceDetails('');
            setVesselName('');
            setPositionHeld('');
            setEmploymentPeriod('');
            setEmergencyContactName('');
            setEmergencyContactRelationship('');
            setEmergencyContactAddress({
                region: '',
                province: '',
                municipality: '',
                barangay: '',
                houseNo: '',
                postalCode: '',
                completeAddress: ''
            });
            setEmergencyContactTelephone('');
            setEmergencyContactMobile1('');
            setEmergencyContactMobile2('');
            setEmergencyContactEmail('');
        }
    }, [isOpen]);

    /**
     * Submit extended registration form to Laravel API
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setProgress(0);
            setIsSubmitting(true);
            setShowLoader(true);

            // ===== LARAVEL API INTEGRATION - ALREADY IMPLEMENTED =====
            const token = getToken('csrf-token');
            const formData = new FormData();

            // Educational Attainment
            formData.append('highest_educational_attainment', highestEducationalAttainment);
            formData.append('course_taken', courseTaken);
            formData.append('school_address', schoolAddress.completeAddress);
            formData.append('school_region', schoolAddress.region);
            formData.append('school_province', schoolAddress.province);
            formData.append('school_municipality', schoolAddress.municipality);
            formData.append('school_barangay', schoolAddress.barangay);
            formData.append('school_house_no', schoolAddress.houseNo);
            formData.append('school_postal_code', schoolAddress.postalCode);
            formData.append('school_graduated', schoolGraduated);

            // Shipboard Experience
            formData.append('has_shipboard_experience', hasShipboardExperience);
            formData.append('shipboard_experience_details', shipboardExperienceDetails);
            formData.append('vessel_name', vesselName);
            formData.append('position_held', positionHeld);
            formData.append('employment_period', employmentPeriod);

            // Emergency Contact
            formData.append('emergency_contact_name', emergencyContactName);
            formData.append('emergency_contact_relationship', emergencyContactRelationship);
            formData.append('emergency_contact_address', emergencyContactAddress.completeAddress);
            formData.append('emergency_contact_region', emergencyContactAddress.region);
            formData.append('emergency_contact_province', emergencyContactAddress.province);
            formData.append('emergency_contact_municipality', emergencyContactAddress.municipality);
            formData.append('emergency_contact_barangay', emergencyContactAddress.barangay);
            formData.append('emergency_contact_house_no', emergencyContactAddress.houseNo);
            formData.append('emergency_contact_postal_code', emergencyContactAddress.postalCode);
            formData.append('emergency_contact_telephone', emergencyContactTelephone);
            formData.append('emergency_contact_mobile1', emergencyContactMobile1);
            formData.append('emergency_contact_mobile2', emergencyContactMobile2);
            formData.append('emergency_contact_email', emergencyContactEmail);

            const response = await axios.post(`${url}/my-account/save_registration_extension`, formData, {
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

            if (response.status === 200) {
                alert(response.data.message);
                onClose();
            }
            // ===== END API INTEGRATION SECTION =====
        } catch (error) {
            if (error.response.status === 500) {
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

    if (!isOpen) return null;

    return (
        <>
            {isSubmitting && <SubmitLoadingAnim cls='loader' />}
            
            {/* Modal Overlay */}
            <div 
                className="modal fade show d-block" 
                tabIndex="-1" 
                role="dialog"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
                <div className="modal-dialog modal-xl" role="document">
                    <div className="modal-content shadow-lg border-0">
                        {/* Modal Header */}
                        <div className="modal-header bg-primary text-white border-0">
                            <h5 className="modal-title font-weight-bold">
                                <i className="fas fa-user-graduate mr-2"></i>
                                Extended Registration Form
                            </h5>
                            <button 
                                type="button" 
                                className="close text-white" 
                                onClick={onClose}
                                style={{ fontSize: '1.5rem' }}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body p-0" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            <form onSubmit={handleSubmit}>
                                <div className="p-4">
                                    {/* Educational Attainment Section */}
                                    <div className="row mb-4">
                                        <div className="col-12">
                                            <div className="card shadow-sm border-0">
                                                <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                                    <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                                        <i className="fas fa-graduation-cap mr-2 text-primary"></i>
                                                        Highest Educational Attainment
                                                    </h6>
                                                </div>
                                                <div className="card-body p-4">
                                                    <div className="row">
                                                        <div className="col-xl-4 col-md-6 mb-3">
                                                            <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                Educational Level <span className="text-danger">*</span>
                                                            </label>
                                                            <select
                                                                value={highestEducationalAttainment}
                                                                onChange={(e) => setHighestEducationalAttainment(e.target.value)}
                                                                className="form-control form-control-sm"
                                                                style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                required
                                                            >
                                                                <option value="">-- Choose --</option>
                                                                <option value="Elementary">Elementary</option>
                                                                <option value="High School">High School</option>
                                                                <option value="Senior High School">Senior High School</option>
                                                                <option value="Vocational">Vocational</option>
                                                                <option value="Associate Degree">Associate Degree</option>
                                                                <option value="Bachelor's Degree">Bachelor's Degree</option>
                                                                <option value="Master's Degree">Master's Degree</option>
                                                                <option value="Doctorate">Doctorate</option>
                                                            </select>
                                                        </div>

                                                        <div className="col-xl-4 col-md-6 mb-3">
                                                            <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                Course Taken
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter course or program..."
                                                                value={courseTaken}
                                                                onChange={(e) => setCourseTaken(e.target.value)}
                                                                className="form-control form-control-sm"
                                                                style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                            />
                                                        </div>

                                                        <div className="col-xl-4 col-md-6 mb-3">
                                                            <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                School Graduated <span className="text-danger">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter school name..."
                                                                value={schoolGraduated}
                                                                onChange={(e) => setSchoolGraduated(e.target.value)}
                                                                className="form-control form-control-sm"
                                                                style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                required
                                                            />
                                                        </div>

                                                        <div className="col-12">
                                                            <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                School Address <span className="text-danger">*</span>
                                                            </label>
                                                            <PhilippinesAddressDropdown 
                                                                onAddressChange={setSchoolAddress}
                                                                defaultValues={schoolAddress}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipboard Experience Section */}
                                    <div className="row mb-4">
                                        <div className="col-12">
                                            <div className="card shadow-sm border-0">
                                                <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                                    <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                                        <i className="fas fa-ship mr-2 text-primary"></i>
                                                        Latest Shipboard Experience
                                                    </h6>
                                                </div>
                                                <div className="card-body p-4">
                                                    <div className="row mb-3">
                                                        <div className="col-12">
                                                            <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                Do you have shipboard experience? <span className="text-danger">*</span>
                                                            </label>
                                                            <div className="d-flex align-items-center">
                                                                <div className="form-check mr-4">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        name="shipboardExperience"
                                                                        id="withExperience"
                                                                        value="Yes"
                                                                        checked={hasShipboardExperience === 'Yes'}
                                                                        onChange={(e) => setHasShipboardExperience(e.target.value)}
                                                                        required
                                                                    />
                                                                    <label className="form-check-label" htmlFor="withExperience">
                                                                        With Shipboard Experience
                                                                    </label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        name="shipboardExperience"
                                                                        id="withoutExperience"
                                                                        value="No"
                                                                        checked={hasShipboardExperience === 'No'}
                                                                        onChange={(e) => setHasShipboardExperience(e.target.value)}
                                                                        required
                                                                    />
                                                                    <label className="form-check-label" htmlFor="withoutExperience">
                                                                        Without Shipboard Experience
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {hasShipboardExperience === 'Yes' && (
                                                        <div className="row">
                                                            <div className="col-xl-4 col-md-6 mb-3">
                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                    Vessel Name
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter vessel name..."
                                                                    value={vesselName}
                                                                    onChange={(e) => setVesselName(e.target.value)}
                                                                    className="form-control form-control-sm"
                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                />
                                                            </div>

                                                            <div className="col-xl-4 col-md-6 mb-3">
                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                    Position Held
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter position..."
                                                                    value={positionHeld}
                                                                    onChange={(e) => setPositionHeld(e.target.value)}
                                                                    className="form-control form-control-sm"
                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                />
                                                            </div>

                                                            <div className="col-xl-4 col-md-6 mb-3">
                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                    Employment Period
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g., Jan 2020 - Dec 2022"
                                                                    value={employmentPeriod}
                                                                    onChange={(e) => setEmploymentPeriod(e.target.value)}
                                                                    className="form-control form-control-sm"
                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                />
                                                            </div>

                                                            <div className="col-12">
                                                                <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                    Experience Details
                                                                </label>
                                                                <textarea
                                                                    placeholder="Describe your shipboard experience..."
                                                                    value={shipboardExperienceDetails}
                                                                    onChange={(e) => setShipboardExperienceDetails(e.target.value)}
                                                                    className="form-control"
                                                                    rows="3"
                                                                    style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Emergency Contact Section */}
                                    <div className="row mb-4">
                                        <div className="col-12">
                                            <div className="card shadow-sm border-0">
                                                <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                                    <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                                        <i className="fas fa-phone-alt mr-2 text-primary"></i>
                                                        Contact Person In Case of Emergency
                                                    </h6>
                                                </div>
                                                <div className="card-body p-4">
                                                    <div className="row">
                                                        <div className="col-xl-6 col-md-6 mb-3">
                                                            <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                Full Name <span className="text-danger">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="Enter full name..."
                                                                value={emergencyContactName}
                                                                onChange={(e) => setEmergencyContactName(e.target.value)}
                                                                className="form-control form-control-sm"
                                                                style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                required
                                                            />
                                                        </div>

                                                        <div className="col-xl-6 col-md-6 mb-3">
                                                            <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                Relationship <span className="text-danger">*</span>
                                                            </label>
                                                            <select
                                                                value={emergencyContactRelationship}
                                                                onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                                                                className="form-control form-control-sm"
                                                                style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                required
                                                            >
                                                                <option value="">-- Choose --</option>
                                                                <option value="Parent">Parent</option>
                                                                <option value="Spouse">Spouse</option>
                                                                <option value="Sibling">Sibling</option>
                                                                <option value="Child">Child</option>
                                                                <option value="Relative">Relative</option>
                                                                <option value="Friend">Friend</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                        </div>

                                                        <div className="col-12 mb-3">
                                                            <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                Address <span className="text-danger">*</span>
                                                            </label>
                                                            <PhilippinesAddressDropdown 
                                                                onAddressChange={setEmergencyContactAddress}
                                                                defaultValues={emergencyContactAddress}
                                                            />
                                                        </div>

                                                        <div className="col-xl-4 col-md-6 mb-3">
                                                            <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                Telephone Number
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g., 053-123-4567"
                                                                value={emergencyContactTelephone}
                                                                onChange={(e) => setEmergencyContactTelephone(e.target.value)}
                                                                className="form-control form-control-sm"
                                                                style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                            />
                                                        </div>

                                                        <div className="col-xl-4 col-md-6 mb-3">
                                                            <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                Mobile Number 1 <span className="text-danger">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="09XX XXX XXXX"
                                                                value={emergencyContactMobile1}
                                                                onChange={(e) => setEmergencyContactMobile1(e.target.value)}
                                                                className="form-control form-control-sm"
                                                                style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                maxLength="11"
                                                                pattern="[0-9]{11}"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="col-xl-4 col-md-6 mb-3">
                                                            <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                Mobile Number 2
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="Optional"
                                                                value={emergencyContactMobile2}
                                                                onChange={(e) => setEmergencyContactMobile2(e.target.value)}
                                                                className="form-control form-control-sm"
                                                                style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                                maxLength="11"
                                                            />
                                                        </div>

                                                        <div className="col-xl-6 col-md-6 mb-3">
                                                            <label className="form-label small mb-1 font-weight-semibold" style={{ color: '#323130' }}>
                                                                Email Address
                                                            </label>
                                                            <input
                                                                type="email"
                                                                placeholder="Enter email address..."
                                                                value={emergencyContactEmail}
                                                                onChange={(e) => setEmergencyContactEmail(e.target.value)}
                                                                className="form-control form-control-sm"
                                                                style={{ padding: '0.5rem 0.75rem', fontSize: '13px' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="modal-footer bg-light border-0 p-4">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary mr-2" 
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                    >
                                        <i className="fas fa-times mr-2"></i>
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={isSubmitting}
                                    >
                                        <i className="fas fa-save mr-2"></i>
                                        Save Registration Extension
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegistrationExtensionModal;