import { useState, useEffect } from 'react';
import PageName from '../../../components/PageName';
import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';
import useGetToken from '../../../../hooks/useGetToken';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import useShowSubmitLoader from '../../../../hooks/useShowSubmitLoader';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * EnrollNewCourse Component - Display available courses for enrollment
 * Shows all available maritime training courses that users can enroll in
 */
const EnrollNewCourse = () => {
    // mga hooks para han page
    const { url } = useSystemURLCon(); // para API calls
    const navigate = useNavigate(); // para route
    const { getToken, removeToken } = useGetToken(); // para token han user
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader(); // loading animation kun mag submit

    // mga state para han available courses
    const [coursesData, setCoursesData] = useState([]); // listahan han mga available courses
    const [isFetchingCourses, setIsFetchingCourses] = useState(true); // loading state kun nag fetch
    const [selectedCourseType, setSelectedCourseType] = useState('All'); // filter para han course type
    const [searchQuery, setSearchQuery] = useState(''); // para search
    const [selectedCourse, setSelectedCourse] = useState(null); // pinili na course para enrollment
    const [showEnrollModal, setShowEnrollModal] = useState(false); // pakita o tago an enrollment modal
    const [isEnrolling, setIsEnrolling] = useState(false); // loading state kun nag eenroll
/**
 * Fetch available courses from Laravel API
 */
const fetchCourses = async () => {
    try {
        setIsFetchingCourses(true);

        const token = getToken('csrf-token');
        const response = await axios.get(`${url}/courses/get_all_courses`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        // Use the correct response structure based on the console log
        setCoursesData(response.data.courses || []);
        setIsFetchingCourses(false);
        console.log('Fetched Courses:', response.data); // Debug log to check the response structure
    } catch (error) {
        setIsFetchingCourses(false);
        // Set empty array on error to prevent undefined issues
        setCoursesData([]);
        if (error.response?.status === 500) {
            // kun 500 error, logout nala it user
            removeToken('csrf-token');
            navigate('/access-denied');
        } else {
            // ipakita an error message
            alert(error.response?.data?.message || 'Failed to fetch courses. Please try again.');
        }
    }
};

/**
 * Submit enrollment request to Laravel API
 */
const submitEnrollment = async (course) => {
    try {
        setProgress(0);
        setIsEnrolling(true);
        setShowLoader(true);

        // ===== LARAVEL ENROLLMENT INTEGRATION - UNCOMMENT WHEN READY =====
        // const token = getToken('csrf-token');
        // const formData = new FormData();
        // formData.append('course_id', course.id);
        // 
        // const response = await axios.post(`${url}/courses/enroll`, formData, {
        //     onUploadProgress: (progressEvent) => {
        //         if (progressEvent.total) {
        //             const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        //             setProgress(percent);
        //         }
        //     },
        //     headers: {
        //         Authorization: `Bearer ${token}`,
        //         Accept: 'application/json',
        //         'Content-Type': 'application/json'
        //     }
        // });
        // 
        // if (response.status === 200) {
        //     alert(response.data.message);
        //     setShowEnrollModal(false);
        //     setSelectedCourse(null);
        //     // Optionally redirect to My Courses after successful enrollment
        //     // navigate('/trainee/course/list');
        // }
        // setIsEnrolling(false);
        // setShowLoader(false);
        // ===== END ENROLLMENT INTEGRATION SECTION =====

        // ===== TEMPORARY SIMULATION - DELETE WHEN API IS READY =====
        setTimeout(() => {
            setProgress(100);
            alert(`Enrollment request submitted for ${course.name}! You will receive a confirmation email shortly.`);
            setShowEnrollModal(false);
            setSelectedCourse(null);
            setIsEnrolling(false);
            setShowLoader(false);
        }, 1500);
        // ===== END SIMULATION SECTION =====

    } catch (error) {
        setIsEnrolling(false);
        setShowLoader(false);
        if (error.response?.status === 500) {
            // kun 500 error, logout nala it user
            removeToken('csrf-token');
            navigate('/access-denied');
        } else {
            // ipakita an error message
            alert(error.response?.data?.message || 'Failed to submit enrollment. Please try again.');
        }
    }
};

    // Kuha it courses pag load han page
    useEffect(() => {
        fetchCourses();
    }, []);

    // Kuha an mga unique course types para han filter buttons - ADD SAFETY CHECKS
    const courseTypes = ['All', ...new Set(coursesData?.map(course => course?.course_type) || [])];

    // Filter an courses base han selected type ngan search query - ADD SAFETY CHECKS
    const filteredCourses = coursesData?.filter(course => {
        const matchesType = selectedCourseType === 'All' || course?.course_type === selectedCourseType;
        const matchesSearch = course?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course?.acronym?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    }) || [];

    /**
     * Kuwenta an total fees han course
     * Calculate total fees for a course
     * 
     * @function calculateTotalFee
     * @param {Object} course - The course object
     * @returns {number} Total fee amount
     */
    const calculateTotalFee = (course) => {
        // I-add an tanan nga fees
        return parseFloat(course.course_fee || 0) + 
               parseFloat(course.miscellaneous_fee || 0) + 
               parseFloat(course.id_fee || 0) + 
               parseFloat(course.ctc_fee || 0);
    };

    /**
     * Check kun available ba an course para enroll
     * Check if course is available for enrollment
     * 
     * @function isAvailable
     * @param {Object} course - The course object
     * @returns {boolean} True if course is available
     */
    const isAvailable = (course) => {
        // Available kun may slot (diri 0) ngan diri fully booked
        return course.slots !== "0";
    };

    /**
     * Pag click han enroll button
     * Handle enrollment button click
     * 
     * @function handleEnroll
     * @param {Object} course - The course to enroll in
     * @returns {void}
     */
    const handleEnroll = (course) => {
        setSelectedCourse(course); // i-set an selected course
        setShowEnrollModal(true); // pakita an modal
    };

    /**
     * Confirm an enrollment
     * Confirm enrollment
     * 
     * @function confirmEnrollment
     * @returns {void}
     */
    const confirmEnrollment = () => {
        if (selectedCourse) {
            submitEnrollment(selectedCourse); // i-submit an enrollment
        }
    };

    return (
        <>
            {/* Loading animation for enrollment submission */}
            {isEnrolling && <SubmitLoadingAnim cls='loader' />}

            <PageName pageName={[
                {
                    'name' : 'Course',
                    'last' : false
                },
                {
                    'name' : 'Enroll New Course',
                    'last' : true,
                    'address' : '/trainee/course/enroll-new-course'
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
                                                        <i className="fas fa-graduation-cap mr-2 text-primary"></i>
                                                        Course Catalog
                                                    </h5>
                                                    <p className="mb-0 text-muted" style={{ fontSize: '13px' }}>
                                                        Browse and enroll in available maritime training courses
                                                    </p>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="input-group">
                                                        <div className="input-group-prepend">
                                                            <span className="input-group-text bg-white border-right-0" style={{ borderColor: '#d1d1d1' }}>
                                                                <i className="fas fa-search text-muted"></i>
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className="form-control border-left-0"
                                                            placeholder="Search courses by name or acronym..."
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            style={{ fontSize: '13px', borderColor: '#d1d1d1' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Filter Tabs */}
                                        <div className="card-body p-0" style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e5e5e5' }}>
                                            <div className="d-flex align-items-center px-4 py-2" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                                                {courseTypes.map((type, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setSelectedCourseType(type)}
                                                        className={`btn btn-sm mr-2 mb-2 ${selectedCourseType === type ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                        style={{
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            borderRadius: '20px',
                                                            padding: '0.4rem 1rem',
                                                            transition: 'all 0.3s ease',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {type}
                                                        {selectedCourseType === type && (
                                                            <span className="badge badge-light ml-2" style={{ fontSize: '10px' }}>
                                                                {type === 'All' ? coursesData.length : coursesData.filter(c => c.course_type === type).length}
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Course Cards */}
                                        <div className="card-body" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                                            {coursesData.length === 0 ? (
                                                <div className="text-center py-5">
                                                    <i className="fas fa-search" style={{ fontSize: '4rem', color: '#d1d1d1' }}></i>
                                                    <h5 className="text-muted mt-3 mb-2">No Courses Found</h5>
                                                    <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                                                        Try adjusting your search or filter criteria
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="row">
                                                    {coursesData.map((course) => (
                                                        <div key={course.id} className="col-xl-4 col-md-6 mb-4">
                                                            <div className="card shadow-sm border-0 h-100" style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>
                                                                {/* Course Header */}
                                                                <div className="card-header border-0" style={{ 
                                                                    background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
                                                                    padding: '1.25rem'
                                                                }}>
                                                                    <div className="d-flex justify-content-between align-items-start">
                                                                        <div className="flex-grow-1">
                                                                            <span className="badge badge-light mb-2" style={{ 
                                                                                fontSize: '10px', 
                                                                                fontWeight: '600',
                                                                                padding: '0.35rem 0.6rem'
                                                                            }}>
                                                                                {course.acronym}
                                                                            </span>
                                                                            <h6 className="mb-0 text-white font-weight-bold" style={{ 
                                                                                fontSize: '14px',
                                                                                lineHeight: '1.4'
                                                                            }}>
                                                                                {course.name}
                                                                            </h6>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Course Body */}
                                                                <div className="card-body" style={{ padding: '1.25rem' }}>
                                                                    <div className="mb-3 pb-3 border-bottom">
                                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                                            <span className="text-muted" style={{ fontSize: '12px' }}>
                                                                                <i className="fas fa-tag mr-1"></i>
                                                                                Course Type
                                                                            </span>
                                                                            <span className="badge badge-primary" style={{ 
                                                                                fontSize: '11px',
                                                                                fontWeight: '500',
                                                                                padding: '0.3rem 0.6rem'
                                                                            }}>
                                                                                {course.course_type}
                                                                            </span>
                                                                        </div>
                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                            <span className="text-muted" style={{ fontSize: '12px' }}>
                                                                                <i className="fas fa-clock mr-1"></i>
                                                                                Duration
                                                                            </span>
                                                                            <span className="font-weight-semibold" style={{ fontSize: '12px', color: '#323130' }}>
                                                                                {course.duration}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Fee Breakdown */}
                                                                    <div className="mb-3 pb-3 border-bottom">
                                                                        <p className="mb-2 font-weight-semibold" style={{ fontSize: '12px', color: '#323130' }}>
                                                                            <i className="fas fa-money-bill-wave mr-1 text-success"></i>
                                                                            Fee Breakdown
                                                                        </p>
                                                                        <div className="pl-3">
                                                                            <div className="d-flex justify-content-between mb-1">
                                                                                <span className="text-muted" style={{ fontSize: '11px' }}>Course Fee:</span>
                                                                                <span style={{ fontSize: '11px', color: '#323130' }}>₱{parseFloat(course.course_price).toLocaleString()}</span>
                                                                            </div>
                                                                            {/* <div className="d-flex justify-content-between mb-1">
                                                                                <span className="text-muted" style={{ fontSize: '11px' }}>Miscellaneous:</span>
                                                                                <span style={{ fontSize: '11px', color: '#323130' }}>₱{parseFloat(course.miscellaneous_fee).toLocaleString()}</span>
                                                                            </div> */}
                                                                            {/* <div className="d-flex justify-content-between mb-1">
                                                                                <span className="text-muted" style={{ fontSize: '11px' }}>ID Fee:</span>
                                                                                <span style={{ fontSize: '11px', color: '#323130' }}>₱{parseFloat(course.id_fee).toLocaleString()}</span>
                                                                            </div> */}
                                                                            {/* <div className="d-flex justify-content-between mb-2">
                                                                                <span className="text-muted" style={{ fontSize: '11px' }}>CTC Fee:</span>
                                                                                <span style={{ fontSize: '11px', color: '#323130' }}>₱{parseFloat(course.ctc_fee).toLocaleString()}</span>
                                                                            </div> */}
                                                                            <div className="d-flex justify-content-between pt-2 border-top">
                                                                                <span className="font-weight-bold" style={{ fontSize: '12px', color: '#323130' }}>Total:</span>
                                                                                <span className="font-weight-bold text-success" style={{ fontSize: '13px' }}>
                                                                                    ₱{parseFloat(course.course_price).toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Slot Info */}
                                                                    <div className="mb-3">
                                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                                            <span className="text-muted" style={{ fontSize: '12px' }}>
                                                                                <i className="fas fa-users mr-1"></i>
                                                                                Max Slots
                                                                            </span>
                                                                            <span className={`badge ${course.course_slots === "0" ? 'badge-secondary' : 'badge-info'}`} style={{ 
                                                                                fontSize: '11px',
                                                                                fontWeight: '600',
                                                                                padding: '0.3rem 0.6rem'
                                                                            }}>
                                                                                {course.course_slots === "0" ? "Contact Admin" : `${course.course_slots} slots`}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Schedule Status */}
                                                                    <div className="alert mb-3" style={{ 
                                                                        backgroundColor: isAvailable(course) ? '#fff4e5' : '#e7f3ff',
                                                                        border: 'none',
                                                                        padding: '0.75rem',
                                                                        fontSize: '11px',
                                                                        lineHeight: '1.5',
                                                                        color: '#323130'
                                                                    }}>
                                                                        <i className={`fas ${isAvailable(course) ? 'fa-exclamation-circle text-warning' : 'fa-info-circle text-primary'} mr-1`}></i>
                                                                        {course.sched_status}
                                                                    </div>

                                                                    {/* Action Button */}
                                                                    <button
                                                                        onClick={() => handleEnroll(course)}
                                                                        disabled={!isAvailable(course)}
                                                                        className={`btn btn-block shadow-sm ${isAvailable(course) ? 'btn-primary' : 'btn-secondary'}`}
                                                                        style={{
                                                                            fontSize: '13px',
                                                                            fontWeight: '600',
                                                                            padding: '0.6rem',
                                                                            borderRadius: '4px',
                                                                            transition: 'all 0.3s ease',
                                                                            opacity: isAvailable(course) ? 1 : 0.6
                                                                        }}
                                                                    >
                                                                        <i className={`fas ${isAvailable(course) ? 'fa-check-circle' : 'fa-ban'} mr-2`}></i>
                                                                        {isAvailable(course) ? 'Enroll Now' : 'Not Available'}
                                                                    </button>
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

            {/* Enrollment Modal */}
            {showEnrollModal && selectedCourse && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0" style={{ 
                                background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
                                padding: '1.5rem'
                            }}>
                                <h5 className="modal-title text-white font-weight-bold">
                                    <i className="fas fa-clipboard-check mr-2"></i>
                                    Confirm Enrollment
                                </h5>
                                <button 
                                    type="button" 
                                    className="close text-white" 
                                    onClick={() => setShowEnrollModal(false)}
                                    style={{ opacity: 1 }}
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body" style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}>
                                <div className="alert alert-info border-0 shadow-sm mb-4" style={{ backgroundColor: '#e7f3ff' }}>
                                    <i className="fas fa-info-circle mr-2" style={{ color: '#323130' }}></i>
                                    <span style={{ fontSize: '13px', color: '#323130' }}>
                                        You are about to enroll in the following course. Please review the details before confirming.
                                    </span>
                                </div>

                                <div className="card shadow-sm border-0 mb-4">
                                    <div className="card-body p-4">
                                        <h6 className="font-weight-bold mb-3" style={{ color: '#323130' }}>
                                            {selectedCourse.name}
                                        </h6>
                                        
                                        <div className="row mb-3">
                                            <div className="col-md-6 mb-2">
                                                <small className="text-muted d-block" style={{ fontSize: '11px' }}>Course Code</small>
                                                <span className="font-weight-semibold" style={{ fontSize: '13px' }}>{selectedCourse.acronym}</span>
                                            </div>
                                            <div className="col-md-6 mb-2">
                                                <small className="text-muted d-block" style={{ fontSize: '11px' }}>Duration</small>
                                                <span className="font-weight-semibold" style={{ fontSize: '13px' }}>{selectedCourse.duration}</span>
                                            </div>
                                            <div className="col-md-6 mb-2">
                                                <small className="text-muted d-block" style={{ fontSize: '11px' }}>Course Type</small>
                                                <span className="font-weight-semibold" style={{ fontSize: '13px' }}>{selectedCourse.course_type}</span>
                                            </div>
                                            <div className="col-md-6 mb-2">
                                                <small className="text-muted d-block" style={{ fontSize: '11px' }}>Total Fee</small>
                                                <span className="font-weight-bold text-success" style={{ fontSize: '14px' }}>
                                                    ₱{calculateTotalFee(selectedCourse).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="alert alert-light border mb-0" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                                            <strong>Note:</strong> After submitting your enrollment request, you will receive a confirmation email with further instructions for payment and schedule selection.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 bg-light" style={{ padding: '1rem 2rem' }}>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary px-4"
                                    onClick={() => setShowEnrollModal(false)}
                                    disabled={isEnrolling}
                                    style={{ fontSize: '13px', fontWeight: '600' }}
                                >
                                    <i className="fas fa-times mr-2"></i>
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary px-4 shadow-sm"
                                    onClick={confirmEnrollment}
                                    disabled={isEnrolling}
                                    style={{ fontSize: '13px', fontWeight: '600' }}
                                >
                                    <i className={`fas ${isEnrolling ? 'fa-spinner fa-spin' : 'fa-check'} mr-2`}></i>
                                    {isEnrolling ? 'Processing...' : 'Confirm Enrollment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default EnrollNewCourse;