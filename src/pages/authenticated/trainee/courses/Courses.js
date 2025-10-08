import { useState, useEffect } from 'react';
import PageName from '../../../components/PageName';
import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';
import NoDataFound from '../../../components/NoDataFound';
import useGetToken from '../../../../hooks/useGetToken';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import useDateFormat from '../../../../hooks/useDateFormat';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Courses = () => {
    const { url } = useSystemURLCon(); // para API calls
    const navigate = useNavigate(); 
    const { getToken, removeToken } = useGetToken();
    const { formatDateToReadable } = useDateFormat(); 

    const [enrolledCourses, setEnrolledCourses] = useState([]); 
    const [isFetchingCourses, setIsFetchingCourses] = useState(true); 
    const [statusFilter, setStatusFilter] = useState('All');
    
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

/**
 * Fetch user's enrolled courses from Laravel API
 */
const fetchEnrolledCourses = async () => {
    try {
        setIsFetchingCourses(true);

        const token = getToken('csrf-token');
        const response = await axios.get(`${url}/courses/get_trainee_courses`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        // Add proper error handling and data validation
        const responseData = response.data;
        
        // Check if data exists and is an array
        if (responseData && Array.isArray(responseData.data)) {
            setEnrolledCourses(responseData.data);
        } else if (Array.isArray(responseData)) {
            // If the response itself is an array
            setEnrolledCourses(responseData);
        } else {
            // If no data or unexpected format, set empty array
            console.warn('Unexpected API response format:', responseData);
            setEnrolledCourses([]);
        }
        
        setIsFetchingCourses(false);

    } catch (error) {
        setIsFetchingCourses(false);
        console.error('Error fetching courses:', error);
        
        // Set empty array on error to prevent map errors
        setEnrolledCourses([]);
        
        if (error.response?.status === 500) {
            removeToken('csrf-token');
            navigate('/access-denied');
        } else {
            alert(error.response?.data?.message || 'Failed to fetch enrolled courses. Please try again.');
        }
    }
};

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    // mga status paa himoon na button filter
    const statuses = ['All', ...new Set(enrolledCourses.map(enrollment => enrollment.enrollment_status))];

    // Filter based on the selected courseseseses
    const filteredCourses = enrolledCourses.filter(enrollment => {
        return statusFilter === 'All' || enrollment.enrollment_status === statusFilter;
    });

    /**
     * 
     * @function getStatusColor
     * @param {string} status - enrollment status (pending, approved, ongoing, completed, cancelled)
     * @returns {string} 
     */
    const getStatusColor = (status) => {
        const colors = {
            'pending': 'badge-warning',   
            'approved': 'badge-info',      
            'ongoing': 'badge-primary',    
            'completed': 'badge-success',  
            'cancelled': 'badge-danger'  
        };
        return colors[status] || 'badge-secondary';
    };

    /**
     * badge color depende ha payment status
     *
     * @function getPaymentStatusColor
     * @param {string} status
     * @returns {string}
     */
    const getPaymentStatusColor = (status) => {
        const colors = {
            'unpaid': 'badge-danger', 
            'partial': 'badge-warning',
            'paid': 'badge-success' 
        };
        return colors[status] || 'badge-secondary';
    };

    /**
     * display details han modal
     * Handle view details button kon gin click
     * 
     * @function handleViewDetails
     * @param {Object} enrollment
     * @returns {void}
     */
    const handleViewDetails = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setShowDetailsModal(true);
    };

    /**
     * Process payment para course enrollment
     */
    const handlePayNow = async (enrollment) => {
        try {
            setSelectedEnrollment(enrollment);
            setShowPaymentModal(true);
            
            // ===== LARAVEL PAYMENT INTEGRATION - UNCOMMENT WHEN READY =====
            // setIsProcessingPayment(true);
            // const token = getToken('csrf-token');
            // const formData = new FormData();
            // formData.append('enrollment_id', enrollment.enrollment_id);
            // formData.append('amount', enrollment.course.total_fee);
            // 
            // const response = await axios.post(`${url}/courses/payment/process`, formData, {
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //         Accept: 'application/json',
            //         'Content-Type': 'application/json'
            //     }
            // });
            // 
            // if (response.status === 200) {
            //     // Redirect to payment gateway or show success
            //     if (response.data.payment_url) {
            //         window.location.href = response.data.payment_url;
            //     } else {
            //         alert(response.data.message);
            //         fetchEnrolledCourses(); // refresh courses
            //         setShowPaymentModal(false);
            //     }
            // }
            // setIsProcessingPayment(false);
            // ===== END PAYMENT INTEGRATION SECTION =====
            
        } catch (error) {
            setIsProcessingPayment(false);
            if (error.response?.status === 500) {
                removeToken('csrf-token');
                navigate('/access-denied');
            } else {
                alert(error.response?.data?.message || 'Failed to process payment. Please try again.');
            }
        }
    };

    /**
     * Closes the payment modal and resets payment-related states.
     * @function closePaymentModal
     * @returns {void}
     */
    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setSelectedEnrollment(null);
        setIsProcessingPayment(false);
    };


    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'Course',
                    'last' : false
                },
                {
                    'name' : 'My Courses',
                    'last' : true,
                    'address' : '/trainee/course/list'
                }
            ]}/>

            {
                isFetchingCourses
                    ? <SkeletonLoader />
                    : <section className="content">
                <div className="container-fluid">
                    <div className="row fade-up">
                        <div className="col-xl-12">
                                    <div className="card card-primary card-outline shadow-sm border-0">
                                        {/* Header */}
                                        <div className="card-header bg-white border-bottom" style={{ padding: '1.5rem' }}>
                                            <div className="row align-items-center">
                                                <div className="col-md-6 mb-3 mb-md-0">
                                                    <h5 className="mb-1 font-weight-bold" style={{ color: '#323130' }}>
                                                        <i className="fas fa-book-reader mr-2 text-primary"></i>
                                                        My Enrolled Courses
                                                    </h5>
                                                    <p className="mb-0 text-muted" style={{ fontSize: '13px' }}>
                                                        View and manage your course enrollments
                                                    </p>
                                                </div>
                                                <div className="col-md-6 text-md-right">
                                                    <button
                                                        onClick={() => navigate('/trainee/course/enroll-new-course')}
                                                        className="btn btn-primary shadow-sm"
                                                        style={{
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            borderRadius: '4px',
                                                            padding: '0.6rem 1.5rem',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        <i className="fas fa-plus mr-2"></i>
                                                        Enroll New Course
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Filter Tabs */}
                                        <div className="card-body p-0" style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e5e5e5' }}>
                                            <div className="d-flex align-items-center px-4 py-2" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                                {statuses.map((status, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setStatusFilter(status)}
                                                        className={`btn btn-sm mr-2 mb-2 ${statusFilter === status ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                        style={{
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            borderRadius: '20px',
                                                            padding: '0.4rem 1rem',
                                                            transition: 'all 0.3s ease',
                                                            whiteSpace: 'nowrap',
                                                            textTransform: 'capitalize'
                                                        }}
                                                    >
                                                        {status}
                                                        {statusFilter === status && (
                                                            <span className="badge badge-light ml-2" style={{ fontSize: '10px' }}>
                                                                {status === 'All' ? enrolledCourses.length : enrolledCourses.filter(e => e.enrollment_status === status).length}
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Course Cards */}
                                        <div className="card-body" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                                            {filteredCourses.length === 0 ? (
                                                <NoDataFound />
                                            ) : (
                                                <div className="row">
                                                    {filteredCourses.map((enrollment) => (
                                                        <div key={enrollment.enrollment_id} className="col-xl-6 col-md-12 mb-4">
                                                            <div className="card shadow-sm border-0 h-100" style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>
                                                                {/* Course Header */}
                                                                <div className="card-header border-0" style={{ 
                                                                    background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
                                                                    padding: '1.25rem'
                                                                }}>
                                                                    <div className="d-flex justify-content-between align-items-start">
                                                                        <div className="flex-grow-1">
                                                                            <div className="d-flex align-items-center mb-2">
                                                                                <span className="badge badge-light mr-2" style={{ 
                                                                                    fontSize: '10px', 
                                                                                    fontWeight: '600',
                                                                                    padding: '0.35rem 0.6rem'
                                                                                }}>
                                                                                    {enrollment.course.course_name}
                                                                                </span>
                                                                                <span className={`badge ${getStatusColor(enrollment.enrollment_status)}`} style={{ 
                                                                                    fontSize: '10px',
                                                                                    fontWeight: '600',
                                                                                    padding: '0.35rem 0.6rem',
                                                                                    textTransform: 'capitalize'
                                                                                }}>
                                                                                    {enrollment.enrollment_status}
                                                                                </span>
                                                                            </div>
                                                                            <h6 className="mb-0 text-white font-weight-bold" style={{ 
                                                                                fontSize: '14px',
                                                                                lineHeight: '1.4'
                                                                            }}>
                                                                                {enrollment.course.name}
                                                                            </h6>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Course Body */}
                                                                <div className="card-body" style={{ padding: '1.25rem' }}>
                                                                    {/* Course Info */}
                                                                    <div className="mb-3 pb-3 border-bottom">
                                                                        <div className="row">
                                                                            <div className="col-6 mb-2">
                                                                                <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                                                                                    <i className="fas fa-tag mr-1"></i>
                                                                                    Course Type
                                                                                </small>
                                                                                <span className="font-weight-semibold" style={{ fontSize: '12px', color: '#323130' }}>
                                                                                    {enrollment.course.course_type}
                                                                                </span>
                                                                            </div>
                                                                            <div className="col-6 mb-2">
                                                                                <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                                                                                    <i className="fas fa-clock mr-1"></i>
                                                                                    Duration
                                                                                </small>
                                                                                <span className="font-weight-semibold" style={{ fontSize: '12px', color: '#323130' }}>
                                                                                    {enrollment.course.duration}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Enrollment Details */}
                                                                    <div className="mb-3 pb-3 border-bottom">
                                                                        <p className="mb-2 font-weight-semibold" style={{ fontSize: '12px', color: '#323130' }}>
                                                                            <i className="fas fa-info-circle mr-1 text-primary"></i>
                                                                            Enrollment Details
                                                                        </p>
                                                                        <div className="pl-3">
                                                                            <div className="d-flex justify-content-between mb-1">
                                                                                <span className="text-muted" style={{ fontSize: '11px' }}>Enrolled:</span>
                                                                                <span style={{ fontSize: '11px', color: '#323130' }}>
                                                                                    {formatDateToReadable(enrollment.enrolled_date)}
                                                                                </span>
                                                                            </div>
                                                                            {enrollment.start_date && (
                                                                                <div className="d-flex justify-content-between mb-1">
                                                                                    <span className="text-muted" style={{ fontSize: '11px' }}>Start Date:</span>
                                                                                    <span style={{ fontSize: '11px', color: '#323130' }}>
                                                                                        {formatDateToReadable(enrollment.start_date)}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {enrollment.end_date && (
                                                                                <div className="d-flex justify-content-between mb-1">
                                                                                    <span className="text-muted" style={{ fontSize: '11px' }}>End Date:</span>
                                                                                    <span style={{ fontSize: '11px', color: '#323130' }}>
                                                                                        {formatDateToReadable(enrollment.end_date)}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            <div className="d-flex justify-content-between pt-2 border-top mt-2">
                                                                                <span className="text-muted" style={{ fontSize: '11px' }}>Payment:</span>
                                                                                <span className={`badge ${getPaymentStatusColor(enrollment.payment_status)}`} style={{ 
                                                                                    fontSize: '10px',
                                                                                    fontWeight: '600',
                                                                                    padding: '0.25rem 0.5rem',
                                                                                    textTransform: 'capitalize'
                                                                                }}>
                                                                                    {enrollment.payment_status}
                                                                                </span>
                                                                            </div>
                                                                            <div className="d-flex justify-content-between mt-1">
                                                                                <span className="text-muted" style={{ fontSize: '11px' }}>Total Fee:</span>
                                                                                <span className="font-weight-bold text-success" style={{ fontSize: '12px' }}>
                                                                                    ₱{enrollment.course.total_fee.toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Progress Bar (for ongoing courses) */}
                                                                    {enrollment.enrollment_status === 'ongoing' && (
                                                                        <div className="mb-3">
                                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                                <span className="font-weight-semibold" style={{ fontSize: '12px', color: '#323130' }}>
                                                                                    <i className="fas fa-tasks mr-1 text-primary"></i>
                                                                                    Progress
                                                                                </span>
                                                                                <span className="font-weight-bold text-primary" style={{ fontSize: '12px' }}>
                                                                                    {enrollment.progress}%
                                                                                </span>
                                                                            </div>
                                                                            <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                                                                                <div 
                                                                                    className="progress-bar bg-primary" 
                                                                                    role="progressbar" 
                                                                                    style={{ width: `${enrollment.progress}%` }}
                                                                                    aria-valuenow={enrollment.progress} 
                                                                                    aria-valuemin="0" 
                                                                                    aria-valuemax="100"
                                                                                ></div>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Action Buttons */}
                                                                    <div className="d-flex justify-content-between">
                                                                        <button
                                                                            onClick={() => handleViewDetails(enrollment)}
                                                                            className="btn btn-outline-primary btn-sm flex-grow-1 mr-2"
                                                                            style={{
                                                                                fontSize: '12px',
                                                                                fontWeight: '600',
                                                                                padding: '0.5rem',
                                                                                borderRadius: '4px',
                                                                                transition: 'all 0.3s ease'
                                                                            }}
                                                                        >
                                                                            <i className="fas fa-info-circle mr-1"></i>
                                                                            View Details
                                                                        </button>
                                                                        {enrollment.payment_status === 'unpaid' && (
                                                                            <button
                                                                                onClick={() => handlePayNow(enrollment)}
                                                                                className="btn btn-success btn-sm flex-grow-1"
                                                                                style={{
                                                                                    fontSize: '12px',
                                                                                    fontWeight: '600',
                                                                                    padding: '0.5rem',
                                                                                    borderRadius: '4px',
                                                                                    transition: 'all 0.3s ease'
                                                                                }}
                                                                            >
                                                                                <i className="fas fa-credit-card mr-1"></i>
                                                                                Pay Now
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    </section>
            }

            {/* Course Details Modal - para tikdo an full details han enrollment */}
            {showDetailsModal && selectedEnrollment && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0" style={{ 
                                background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
                                padding: '1.5rem'
                            }}>
                                <h5 className="modal-title text-white font-weight-bold">
                                    <i className="fas fa-info-circle mr-2"></i>
                                    Course Enrollment Details
                                </h5>
                                <button 
                                    type="button" 
                                    className="close text-white" 
                                    onClick={() => setShowDetailsModal(false)}
                                    style={{ opacity: 1 }}
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body" style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}>
                                {/* Course Information */}
                                <div className="card shadow-sm border-0 mb-4">
                                    <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                        <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                            <i className="fas fa-graduation-cap mr-2 text-primary"></i>
                                            Course Information
                                        </h6>
                                    </div>
                                    <div className="card-body p-4">
                                        <h6 className="font-weight-bold mb-3" style={{ color: '#323130' }}>
                                            {selectedEnrollment.course.name}
                                        </h6>
                                        
                                        <div className="row mb-3">
                                            <div className="col-md-6 mb-2">
                                                <small className="text-muted d-block" style={{ fontSize: '11px' }}>Course Code</small>
                                                <span className="font-weight-semibold" style={{ fontSize: '13px' }}>{selectedEnrollment.course.course_name}</span>
                                            </div>
                                            <div className="col-md-6 mb-2">
                                                <small className="text-muted d-block" style={{ fontSize: '11px' }}>Course Type</small>
                                                <span className="font-weight-semibold" style={{ fontSize: '13px' }}>{selectedEnrollment.course.course_type}</span>
                                            </div>
                                            <div className="col-md-6 mb-2">
                                                <small className="text-muted d-block" style={{ fontSize: '11px' }}>Duration</small>
                                                <span className="font-weight-semibold" style={{ fontSize: '13px' }}>{selectedEnrollment.course.duration}</span>
                                            </div>
                                            <div className="col-md-6 mb-2">
                                                <small className="text-muted d-block" style={{ fontSize: '11px' }}>Total Fee</small>
                                                <span className="font-weight-bold text-success" style={{ fontSize: '14px' }}>
                                                    ₱{selectedEnrollment.course.total_fee.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enrollment Status */}
                                <div className="card shadow-sm border-0 mb-4">
                                    <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                        <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                            <i className="fas fa-clipboard-list mr-2 text-primary"></i>
                                            Enrollment Status
                                        </h6>
                                    </div>
                                    <div className="card-body p-4">
                                        <div className="row mb-3">
                                            <div className="col-md-6 mb-2">
                                                <small className="text-muted d-block" style={{ fontSize: '11px' }}>Status</small>
                                                <span className={`badge ${getStatusColor(selectedEnrollment.enrollment_status)}`} style={{ 
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    padding: '0.4rem 0.8rem',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {selectedEnrollment.enrollment_status}
                                                </span>
                                            </div>
                                            <div className="col-md-6 mb-2">
                                                <small className="text-muted d-block" style={{ fontSize: '11px' }}>Payment Status</small>
                                                <span className={`badge ${getPaymentStatusColor(selectedEnrollment.payment_status)}`} style={{ 
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    padding: '0.4rem 0.8rem',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {selectedEnrollment.payment_status}
                                                </span>
                                            </div>
                                            <div className="col-md-6 mb-2">
                                                <small className="text-muted d-block" style={{ fontSize: '11px' }}>Enrolled Date</small>
                                                <span className="font-weight-semibold" style={{ fontSize: '13px' }}>
                                                    {formatDateToReadable(selectedEnrollment.enrolled_date)}
                                                </span>
                                            </div>
                                            {selectedEnrollment.start_date && (
                                                <>
                                                    <div className="col-md-6 mb-2">
                                                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>Start Date</small>
                                                        <span className="font-weight-semibold" style={{ fontSize: '13px' }}>
                                                            {formatDateToReadable(selectedEnrollment.start_date)}
                                                        </span>
                                                    </div>
                                                    <div className="col-md-6 mb-2">
                                                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>End Date</small>
                                                        <span className="font-weight-semibold" style={{ fontSize: '13px' }}>
                                                            {formatDateToReadable(selectedEnrollment.end_date)}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Progress Bar for Ongoing Courses */}
                                        {selectedEnrollment.enrollment_status === 'ongoing' && (
                                            <div className="mt-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <small className="text-muted" style={{ fontSize: '11px' }}>Course Progress</small>
                                                    <span className="font-weight-bold text-primary" style={{ fontSize: '13px' }}>
                                                        {selectedEnrollment.progress}%
                                                    </span>
                                                </div>
                                                <div className="progress" style={{ height: '10px', borderRadius: '5px' }}>
                                                    <div 
                                                        className="progress-bar bg-primary" 
                                                        role="progressbar" 
                                                        style={{ width: `${selectedEnrollment.progress}%` }}
                                                        aria-valuenow={selectedEnrollment.progress} 
                                                        aria-valuemin="0" 
                                                        aria-valuemax="100"
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div className="alert alert-light border" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                                    <i className="fas fa-info-circle mr-2 text-primary"></i>
                                    <strong>Note:</strong> For any concerns regarding your enrollment, please contact the administration office or email support@nmptacloban.edu.ph
                                </div>
                            </div>
                            <div className="modal-footer border-0 bg-light" style={{ padding: '1rem 2rem' }}>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary px-4"
                                    onClick={() => setShowDetailsModal(false)}
                                    style={{ fontSize: '13px', fontWeight: '600' }}
                                >
                                    <i className="fas fa-times mr-2"></i>
                                    Close
                                </button>
                                {selectedEnrollment.payment_status === 'unpaid' && (
                                    <button 
                                        type="button" 
                                        className="btn btn-success px-4"
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            handlePayNow(selectedEnrollment);
                                        }}
                                        style={{ fontSize: '13px', fontWeight: '600' }}
                                    >
                                        <i className="fas fa-credit-card mr-2"></i>
                                        Proceed to Payment
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal - para han payment process */}
            {showPaymentModal && selectedEnrollment && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0" style={{ 
                                background: 'linear-gradient(135deg, #28a745 0%, #20883b 100%)',
                                padding: '1.5rem'
                            }}>
                                <h5 className="modal-title text-white font-weight-bold">
                                    <i className="fas fa-credit-card mr-2"></i>
                                    Course Payment
                                </h5>
                                <button 
                                    type="button" 
                                    className="close text-white" 
                                    onClick={closePaymentModal}
                                    style={{ opacity: 1 }}
                                    disabled={isProcessingPayment}
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body" style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}>
                                <div className="alert alert-info border-0 shadow-sm mb-4" style={{ backgroundColor: '#e7f3ff' }}>
                                    <i className="fas fa-info-circle mr-2" style={{ color: '#323130' }}></i>
                                    <span style={{ fontSize: '13px', color: '#323130' }}>
                                        You are about to make a payment for this course. Please review the payment details below.
                                    </span>
                                </div>

                                {/* Payment Summary */}
                                <div className="card shadow-sm border-0 mb-4">
                                    <div className="card-body p-4">
                                        <h6 className="font-weight-bold mb-3" style={{ color: '#323130' }}>
                                            {selectedEnrollment.course.name}
                                        </h6>
                                        
                                        <div className="mb-3 pb-3 border-bottom">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted" style={{ fontSize: '13px' }}>Course Code:</span>
                                                <span className="font-weight-semibold" style={{ fontSize: '13px' }}>{selectedEnrollment.course.course_name}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted" style={{ fontSize: '13px' }}>Duration:</span>
                                                <span className="font-weight-semibold" style={{ fontSize: '13px' }}>{selectedEnrollment.course.duration}</span>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center pt-2">
                                            <span className="font-weight-bold" style={{ fontSize: '16px', color: '#323130' }}>Total Amount:</span>
                                            <span className="font-weight-bold text-success" style={{ fontSize: '24px' }}>
                                                ₱{selectedEnrollment.course.total_fee.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method Selection - placeholder para ha future payment integration */}
                                <div className="card shadow-sm border-0 mb-4">
                                    <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                        <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                            <i className="fas fa-wallet mr-2 text-success"></i>
                                            Payment Method
                                        </h6>
                                    </div>
                                    <div className="card-body p-4">
                                        <div className="alert alert-warning border-0 mb-0" style={{ backgroundColor: '#fff4e5' }}>
                                            <i className="fas fa-exclamation-triangle mr-2"></i>
                                            <span style={{ fontSize: '13px' }}>
                                                <strong>Payment Gateway Integration:</strong> Payment method selection will be available once the payment gateway is configured. For now, please contact the administration office for payment instructions.
                                            </span>
                                        </div>
                                        
                                        {/* TODO:payment method options pag ready na an payment gateway
                                            Example: GCash, PayMaya, Credit Card, Over-the-counter, etc. */}
                                    </div>
                                </div>

                                <div className="alert alert-light border mb-0" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                                    <strong>Note:</strong> Once payment is confirmed, you will receive a receipt via email. Please keep it for your records.
                                </div>
                            </div>
                            <div className="modal-footer border-0 bg-light" style={{ padding: '1rem 2rem' }}>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary px-4"
                                    onClick={closePaymentModal}
                                    disabled={isProcessingPayment}
                                    style={{ fontSize: '13px', fontWeight: '600' }}
                                >
                                    <i className="fas fa-times mr-2"></i>
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-success px-4 shadow-sm"
                                    disabled={isProcessingPayment}
                                    onClick={() => {
                                        // 
                                        alert('Payment gateway integration pending. Please contact administration for payment instructions.');
                                        closePaymentModal();
                                    }}
                                    style={{ fontSize: '13px', fontWeight: '600' }}
                                >
                                    <i className={`fas ${isProcessingPayment ? 'fa-spinner fa-spin' : 'fa-check'} mr-2`}></i>
                                    {isProcessingPayment ? 'Processing...' : 'Proceed to Payment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Courses;