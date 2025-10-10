import { useState, useEffect } from 'react';
import useGetToken from '../../../../hooks/useGetToken';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * Custom Hook - Dashboard Data Management
 * Handles all API calls, state management, and business logic for the Dashboard
 * 
 * @returns {Object} Dashboard data and utility functions
 */
const useDashboardData = () => {
    const { url } = useSystemURLCon();
    const navigate = useNavigate();
    const { getToken, removeToken } = useGetToken();

    // State management
    const [isLoading, setIsLoading] = useState(true);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [userStats, setUserStats] = useState({});
    const [registrationStatus, setRegistrationStatus] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch dashboard data from Laravel API
     * Uses existing API endpoints and calculates statistics on the frontend
     * - Calls /api/courses/get_trainee_courses for enrolled courses
     * - Calls /api/my-account/get_trainee_general_info for registration status
     * - Calculates statistics from the fetched data
     */
    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = getToken('csrf-token');
            const headers = {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json'
            };

            // Fetch enrolled courses and trainee info in parallel
            const [coursesResponse, traineeInfoResponse] = await Promise.all([
                axios.get(`${url}/api/courses/get_trainee_courses`, { headers }),
                axios.get(`${url}/api/my-account/get_trainee_general_info`, { headers })
            ]);

            // Extract the user data with enrolled courses
            const userData = coursesResponse.data.enrolled_courses[0];
            const enrolledCoursesRaw = userData?.trainee_enrolled_courses || [];
            
            // Transform enrolled courses data to match frontend format
            const transformedCourses = enrolledCoursesRaw.map(enrollment => {
                // Map backend status to frontend format
                const statusMap = {
                    'PENDING': 'pending',
                    'ENROLLED': 'ongoing',
                    'COMPLETED': 'completed',
                    'CANCELLED': 'cancelled'
                };

                const course = enrollment.main_course || {};
                
                return {
                    enrollment_id: enrollment.id,
                    course: {
                        id: course.id || 0,
                        acronym: course.course_name || 'N/A',
                        name: course.course_title || 'Untitled Course',
                        duration: 'TBD', // Not in database, static for now
                        course_type: course.course_category || 'General',
                        total_fee: 0 // Will be calculated from invoices or schedules
                    },
                    enrollment_status: statusMap[enrollment.enrolled_course_status] || 'pending',
                    payment_status: 'unpaid', // Will be determined from enrollment_invoices
                    enrolled_date: enrollment.created_at ? enrollment.created_at.split('T')[0] : null,
                    start_date: null, // Not in enrolled_courses table
                    end_date: null, // Not in enrolled_courses table
                    progress: enrollment.enrolled_course_status === 'COMPLETED' ? 100 : 
                             enrollment.enrolled_course_status === 'ENROLLED' ? 50 : 0
                };
            });

            // Separate courses by payment status
            // For now, all courses with PENDING status are considered pending payment
            const pending = transformedCourses.filter(c => c.payment_status === 'unpaid');
            const enrolled = transformedCourses.filter(c => c.payment_status === 'paid' || c.enrollment_status !== 'pending');

            // Calculate statistics
            const stats = {
                total_courses: transformedCourses.length,
                completed_courses: transformedCourses.filter(c => c.enrollment_status === 'completed').length,
                ongoing_courses: transformedCourses.filter(c => c.enrollment_status === 'ongoing').length,
                pending_courses: transformedCourses.filter(c => c.enrollment_status === 'pending').length,
                total_paid: 0, // Will be calculated from invoices
                total_pending: 0 // Will be calculated from pending invoices
            };

            // Check registration status - if trainee has additional info, they've completed registration
            const hasRegistration = traineeInfoResponse.data?.additional_trainee_info !== null;

            setEnrolledCourses(transformedCourses);
            setPendingPayments(pending);
            setUserStats(stats);
            setRegistrationStatus(hasRegistration);
            setIsLoading(false);

        } catch (error) {
            console.error('Dashboard API Error:', error);
            setIsLoading(false);
            setError(error.response?.data?.message || error.response?.data?.error || 'Failed to fetch dashboard data');

            if (error.response?.status === 401 || error.response?.status === 500) {
                // Unauthorized or server error - logout user
                removeToken('csrf-token');
                navigate('/access-denied');
            }
        }
    };

    /**
     * Get status badge color based on enrollment status
     * @param {string} status - The enrollment status
     * @returns {string} Bootstrap badge class
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
     * Get payment status badge color
     * @param {string} status - The payment status
     * @returns {string} Bootstrap badge class
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
     * Navigate to course list page
     */
    const navigateToCourseList = () => {
        navigate('/trainee/course/list');
    };

    /**
     * Navigate to enrollment page
     */
    const navigateToEnrollment = () => {
        navigate('/trainee/course/enroll-new-course');
    };

    /**
     * Retry fetching dashboard data
     */
    const retryFetch = () => {
        fetchDashboardData();
    };

    // Fetch dashboard data on component mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    return {
        // State
        isLoading,
        enrolledCourses,
        pendingPayments,
        userStats,
        registrationStatus,
        error,
        
        // Utility functions
        getStatusColor,
        getPaymentStatusColor,
        navigateToCourseList,
        navigateToEnrollment,
        retryFetch,
        fetchDashboardData
    };
};

export default useDashboardData;

