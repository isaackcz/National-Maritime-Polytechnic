// Mock Configuration for Frontend Testing
// Set MOCK_MODE to true to use hardcoded data when backend is offline
export const MOCK_MODE = true;

// Mock Trainee User Data
export const MOCK_TRAINEE_USER = {
    id: 1,
    email: 'trainee@test.com',
    password: 'password123', // Only used for login comparison
    role: 'TRAINEE',
    user: {
        id: 1,
        email: 'trainee@test.com',
        email_verified_at: '2024-01-01T00:00:00.000000Z',
        role: 'TRAINEE',
        created_at: '2024-01-01T00:00:00.000000Z',
        updated_at: '2024-01-01T00:00:00.000000Z',
        general_information: {
            id: 1,
            user_id: 1,
            first_name: 'Juan',
            middle_name: 'Santos',
            last_name: 'Dela Cruz',
            extension_name: null,
            date_of_birth: '1995-05-15',
            place_of_birth: 'Manila, Philippines',
            gender: 'MALE',
            civil_status: 'SINGLE',
            nationality: 'Filipino',
            height: '170',
            weight: '65',
            eye_color: 'Brown',
            hair_color: 'Black',
            distinguishing_marks: 'None',
            photo: '/system-images/logo.png',
            created_at: '2024-01-01T00:00:00.000000Z',
            updated_at: '2024-01-01T00:00:00.000000Z'
        },
        additional_trainee_info: {
            id: 1,
            user_id: 1,
            present_address: '123 Main St, Manila',
            present_province: 'Metro Manila',
            present_city: 'Manila',
            present_barangay: 'Barangay 1',
            present_zip_code: '1000',
            provincial_address: '456 Province Rd',
            provincial_province: 'Bulacan',
            provincial_city: 'Malolos',
            provincial_barangay: 'Barangay Centro',
            provincial_zip_code: '3000',
            mobile_number: '09171234567',
            telephone_number: '(02) 1234-5678',
            tin_number: '123-456-789-000',
            sss_number: '12-3456789-0',
            philhealth_number: '12-345678901-2',
            pagibig_number: '1234-5678-9012',
            created_at: '2024-01-01T00:00:00.000000Z',
            updated_at: '2024-01-01T00:00:00.000000Z'
        },
        contact_people: [
            {
                id: 1,
                user_id: 1,
                full_name: 'Maria Dela Cruz',
                relationship: 'Mother',
                mobile_number: '09181234567',
                telephone_number: '(02) 8765-4321',
                address: '123 Main St, Manila',
                province: 'Metro Manila',
                city: 'Manila',
                barangay: 'Barangay 1',
                zip_code: '1000',
                created_at: '2024-01-01T00:00:00.000000Z',
                updated_at: '2024-01-01T00:00:00.000000Z'
            }
        ],
        educational_attainments: [
            {
                id: 1,
                user_id: 1,
                level: 'TERTIARY',
                school_name: 'University of the Philippines',
                degree_course: 'Bachelor of Science in Marine Transportation',
                year_graduated: '2018',
                created_at: '2024-01-01T00:00:00.000000Z',
                updated_at: '2024-01-01T00:00:00.000000Z'
            }
        ],
        latest_shipboard_experience: {
            id: 1,
            user_id: 1,
            vessel_name: 'MV Pacific Star',
            vessel_type: 'Container Ship',
            gross_tonnage: '25000',
            engine_type: 'Diesel',
            rank_position: 'Ordinary Seaman',
            date_from: '2019-01-15',
            date_to: '2019-12-15',
            manning_agency: 'Philippine Manning Agency Inc.',
            created_at: '2024-01-01T00:00:00.000000Z',
            updated_at: '2024-01-01T00:00:00.000000Z'
        },
        trainee_registration_files: {
            id: 1,
            user_id: 1,
            birth_certificate: '/uploads/mock/birth-cert.pdf',
            nbi_clearance: '/uploads/mock/nbi.pdf',
            medical_certificate: '/uploads/mock/medical.pdf',
            transcript_of_records: '/uploads/mock/tor.pdf',
            diploma: '/uploads/mock/diploma.pdf',
            passport_photo: '/uploads/mock/passport.jpg',
            valid_id: '/uploads/mock/id.pdf',
            created_at: '2024-01-01T00:00:00.000000Z',
            updated_at: '2024-01-01T00:00:00.000000Z'
        },
        enrolled_courses: [
            {
                id: 1,
                user_id: 1,
                course_schedule_id: 1,
                enrollment_status: 'ENROLLED',
                enrollment_date: '2024-01-15',
                completion_date: null,
                created_at: '2024-01-01T00:00:00.000000Z',
                updated_at: '2024-01-01T00:00:00.000000Z',
                course_schedule: {
                    id: 1,
                    main_course_id: 1,
                    batch_number: 'BATCH-2024-001',
                    start_date: '2024-02-01',
                    end_date: '2024-06-30',
                    max_students: 30,
                    current_students: 15,
                    status: 'ACTIVE',
                    created_at: '2024-01-01T00:00:00.000000Z',
                    updated_at: '2024-01-01T00:00:00.000000Z',
                    main_course: {
                        id: 1,
                        course_code: 'BST-101',
                        course_name: 'Basic Safety Training',
                        description: 'Basic Safety Training Course for Maritime Students',
                        duration_hours: 160,
                        duration_days: 20,
                        created_at: '2024-01-01T00:00:00.000000Z',
                        updated_at: '2024-01-01T00:00:00.000000Z'
                    }
                }
            }
        ],
        certificates: [],
        dormitory_tenant: null
    }
};

// Mock Token
export const MOCK_TOKEN = 'mock-token-12345-trainee-test';

// Mock Login Response
export const mockLoginResponse = (email, password) => {
    // Simple validation - you can customize this
    if (email === MOCK_TRAINEE_USER.email && password === MOCK_TRAINEE_USER.password) {
        return {
            status: 200,
            data: {
                token: MOCK_TOKEN,
                role: MOCK_TRAINEE_USER.role,
                user: MOCK_TRAINEE_USER.user
            }
        };
    }
    
    throw {
        response: {
            data: {
                message: 'Invalid credentials. Use trainee@test.com / password123'
            }
        }
    };
};

// Mock User Response
export const mockUserResponse = () => {
    return {
        status: 200,
        data: {
            user: MOCK_TRAINEE_USER.user
        }
    };
};

