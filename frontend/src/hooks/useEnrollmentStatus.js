import { useEffect, useState } from 'react';
import axios from 'axios';
import useGetToken from './useGetToken';
import useSystemURLCon from './useSystemURLCon';

/**
 * Hook: useEnrollmentStatus
 * - Returns { isLoading, isEnrolled, error }
 * - Calls backend when available at `/enrollment/get_enrolled`
 * - If endpoint is not available, it falls back to checking `/courses/get_trainee_courses`
 */
const useEnrollmentStatus = () => {
    const { url } = useSystemURLCon();
    const { getToken } = useGetToken();

    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchStatus = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const token = getToken('csrf-token');

                // Try preferred endpoint first (template for integration)
                try {
                    const resp = await axios.get(`${url}/enrollment/get_enrolled`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json'
                        }
                    });

                    // Expected backend response suggestion:
                    // { enrolled: boolean } or { count: number }
                    const data = resp.data;
                    const enrolledFromPrimary = (typeof data?.enrolled === 'boolean')
                        ? data.enrolled
                        : (typeof data?.count === 'number' ? data.count > 0 : false);

                    if (isMounted) {
                        setIsEnrolled(!!enrolledFromPrimary);
                        setIsLoading(false);
                    }
                    return; // success via primary endpoint
                } catch (primaryErr) {
                    // Fallback to existing courses endpoint
                }

                const fallbackResp = await axios.get(`${url}/courses/get_trainee_courses`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                });

                // Known backend shape from TraineeCourses@get_trainee_courses
                // { enrolled_courses: [ { trainee_enrolled_courses: [...] } ] }
                const enrolledCoursesContainer = fallbackResp?.data?.enrolled_courses;
                let hasAnyEnrollment = false;
                if (Array.isArray(enrolledCoursesContainer) && enrolledCoursesContainer.length > 0) {
                    const firstUser = enrolledCoursesContainer[0];
                    const list = firstUser?.trainee_enrolled_courses;
                    hasAnyEnrollment = Array.isArray(list) && list.length > 0;
                } else if (Array.isArray(fallbackResp?.data)) {
                    hasAnyEnrollment = fallbackResp.data.length > 0;
                }

                if (isMounted) {
                    setIsEnrolled(!!hasAnyEnrollment);
                    setIsLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err);
                    setIsEnrolled(false);
                    setIsLoading(false);
                }
            }
        };

        fetchStatus();
        return () => { isMounted = false; };
    }, [getToken, url]);

    return { isLoading, isEnrolled, error };
};

export default useEnrollmentStatus;


