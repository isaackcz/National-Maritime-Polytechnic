import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PageName from '../../../components/PageName';
import { Skeleton, Box, Tabs, Tab, Modal, Backdrop, Fade } from '@mui/material';
import NoDataFound from '../../../components/NoDataFound';
import PaymentMethodModal from './PaymentMethodModal';
import useGetToken from '../../../../hooks/useGetToken';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import axios from 'axios';
import useGetCurrentUser from '../../../../hooks/useGetCurrentUser';

// Constants
const COLORS = {
    INFO_BG: '#e7f3ff',
    INFO_BORDER: '#0078d4'
};

const STATUS_CONFIG = {
    'PENDING': { class: 'warning', text: 'Pending Approval', icon: 'fa-clock' },
    'APPROVED': { class: 'success', text: 'Approved', icon: 'fa-check-circle' },
    'REJECTED': { class: 'danger', text: 'Rejected', icon: 'fa-times-circle' },
    'EXTENDING': { class: 'info', text: 'Extension Pending', icon: 'fa-sync' },
    'CANCELLED': { class: 'secondary', text: 'Cancelled', icon: 'fa-ban' },
    'COMPLETED': { class: 'primary', text: 'Completed', icon: 'fa-flag-checkered' }
};

const ACTIVE_STATUSES = ['PENDING', 'APPROVED', 'EXTENDING', 'AVAILABLE', 'UNAVAILABLE'];

const Dormitory = () => {
    const { url } = useSystemURLCon();
    const { getToken } = useGetToken();
    const [loading, setLoading] = useState({
        rooms: true,
        userRequest: false,
        submitting: false
    });
    const [rooms, setRooms] = useState([]);
    const [userDormitory, setUserDormitory] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomDates, setRoomDates] = useState({});
    const [dateErrors, setDateErrors] = useState({});
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    const [userRequests, setUserRequests] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [error, setError] = useState(null);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [selectedRoomForPhotos, setSelectedRoomForPhotos] = useState(null);
    const { userData } = useGetCurrentUser();

    const fetchRooms = useCallback(async (signal = null) => {
        try {
            setLoading(prev => ({ ...prev, rooms: true }));
            setError(null);
            const token = getToken('csrf-token');
            
            const response = await axios.get(`${url}/dormitories/get_all_dormitories`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                signal
            });
            const dormitories = response?.data?.dormitories || [];
            
            const roomsWithSlots = dormitories.map(room => ({
                ...room,
                available_slots: room.room_slot - (room.tenants_count || 0)
            }));
            setRooms(roomsWithSlots);
            
            const initialDates = {};
            roomsWithSlots.forEach(room => {
                initialDates[room.id] = {
                    checkInDate: '',
                    checkOutDate: ''
                };
            });
            setRoomDates(initialDates);
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error('Failed to fetch rooms:', error);
                setError('Failed to load rooms. Please try again.');
                setRooms([]);
            }
        } finally {
            setLoading(prev => ({ ...prev, rooms: false }));
        }
    }, [url, getToken]);


    const fetchUserRequest = useCallback(async (id, signal = null) => {
        try {
            setLoading(prev => ({ ...prev, userRequest: true }));
            const token = getToken('csrf-token');

            const response = await axios.get(`${url}/dormitories/get_personal_dormitory`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                params: { user_id: id },
                signal
            });

            let userRequests = [];
            if (Array.isArray(response.data)) {
                userRequests = response.data;
            } else if (response.data?.data) {
                userRequests = response.data.data;
            } else if (response.data?.requests) {
                userRequests = response.data.requests;
            }

            const activeDormitory = userRequests.find((d) =>
                ACTIVE_STATUSES.includes(d.tenant_status)
            );

            setUserDormitory(activeDormitory || null);
            setHasPendingRequest(
                activeDormitory?.tenant_status === 'PENDING' ||
                activeDormitory?.tenant_status === 'EXTENDING'
            );
            setUserRequests(userRequests);

            // Disable rooms if user has dormitory
            if (activeDormitory) {
                setRooms((prevRooms) =>
                    prevRooms.map((room) => ({
                        ...room,
                        disabled: true,
                    }))
                );

                // Set default extension dates for user's current room
                setRoomDates(prev => ({
                    ...prev,
                    [activeDormitory.dormitory_room_id]: {
                        checkInDate: activeDormitory.tenant_to_date,
                        checkOutDate: ''
                    }
                }));
            }
        } catch (error) {
            if (!axios.isCancel(error)) {
                console.error('Failed to fetch user dormitory:', error);
                setError('Failed to load user dormitory data. Please try again.');
                setUserDormitory(null);
                setHasPendingRequest(false);
                setUserRequests([]);
            }
        } finally {
            setLoading(prev => ({ ...prev, userRequest: false }));
        }
    }, [url, getToken]);

    useEffect(() => {
        const controller = new AbortController();
        
        const loadData = async () => {
            try {
                await fetchRooms(controller.signal);
                if (userData?.id) {
                    await fetchUserRequest(userData.id, controller.signal);
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error('Failed to load data:', error);
                    setError('Failed to load data. Please refresh the page.');
                }
            }
        };
        
        loadData();
        
        return () => {
            controller.abort();
        };
    }, [userData, fetchRooms, fetchUserRequest]);

    // Validate dates with extension logic
    const validateDates = useCallback((roomId, isExtension = false) => {
        const errors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const roomDate = roomDates[roomId] || {};
        const { checkInDate, checkOutDate } = roomDate;

        if (!checkInDate) {
            errors.checkIn = 'Check-in date is required';
        } else {
            const checkIn = new Date(checkInDate);
            
            if (isExtension) {
                // For extensions, check-in date should be the day after current booking ends
                const currentBookingEnd = new Date(userDormitory.tenant_to_date);
                currentBookingEnd.setHours(0, 0, 0, 0);
                
                if (checkIn <= currentBookingEnd) {
                    errors.checkIn = 'Extension must start after your current booking ends';
                }
            } else {
                // For new bookings, normal validation
                if (checkIn < today) {
                    errors.checkIn = 'Check-in date cannot be in the past';
                }
            }
        }

        if (!checkOutDate) {
            errors.checkOut = 'Check-out date is required';
        } else if (checkInDate) {
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);
            if (checkOut <= checkIn) {
                errors.checkOut = 'Check-out date must be after check-in date';
            }
        }

        setDateErrors(prev => ({
            ...prev,
            [roomId]: errors
        }));
        return Object.keys(errors).length === 0;
    }, [roomDates, userDormitory]);

    const handleDateChange = useCallback((roomId, field, value) => {
        setRoomDates(prev => ({
            ...prev,
            [roomId]: {
                ...prev[roomId],
                [field]: value
            }
        }));

        if (dateErrors[roomId]?.[field]) {
            setDateErrors(prev => ({
                ...prev,
                [roomId]: {
                    ...prev[roomId],
                    [field]: ''
                }
            }));
        }
    }, [dateErrors]);

    // Utility functions - defined early to avoid hoisting issues
    const checkPendingRequest = useCallback(() => {
        return userDormitory && (userDormitory.tenant_status === 'PENDING' || userDormitory.tenant_status === 'EXTENDING');
    }, [userDormitory]);

    const hasApprovedBooking = useCallback(() => {
        return userDormitory && userDormitory.tenant_status === 'APPROVED';
    }, [userDormitory]);

    const isExtending = useCallback(() => {
        return userDormitory && userDormitory.tenant_status === 'EXTENDING';
    }, [userDormitory]);

    const canRequestRoom = useCallback((room) => {
        if (checkPendingRequest()) return false;
        
        if (hasApprovedBooking()) {
            return room.id === userDormitory.dormitory_room_id;
        }
        
        return room.room_status === 'ACTIVE' && room.available_slots > 0;
    }, [checkPendingRequest, hasApprovedBooking, userDormitory]);

    const canExtendRoom = useCallback((room) => {
        if (!hasApprovedBooking() || room.id !== userDormitory.dormitory_room_id) return false;
        
        // Check if room is unavailable - user can stay but cannot extend
        return room.room_status === 'ACTIVE';
    }, [hasApprovedBooking, userDormitory]);

    const getButtonText = useCallback((room) => {
        if (checkPendingRequest()) {
            return userDormitory.tenant_status === 'EXTENDING' ? 'Extension Pending' : 'Request Pending';
        }
        if (hasApprovedBooking() && room.id === userDormitory.dormitory_room_id) {
            return canExtendRoom(room) ? 'Extend Stay' : 'Room Unavailable';
        }
        return 'Send Request';
    }, [checkPendingRequest, hasApprovedBooking, userDormitory, canExtendRoom]);

    const getButtonDisabledState = useCallback((room) => {
        if (checkPendingRequest()) return true;
        if (!canRequestRoom(room)) return true;
        
        // For users with approved booking trying to extend - check if extension is allowed
        if (hasApprovedBooking() && room.id === userDormitory.dormitory_room_id && !canExtendRoom(room)) {
            return true;
        }
        
        const roomDate = roomDates[room.id] || {};
        const roomErrors = dateErrors[room.id] || {};
        
        return !roomDate.checkInDate || !roomDate.checkOutDate || 
               Object.keys(roomErrors).length > 0 || 
               loading.submitting;
    }, [checkPendingRequest, canRequestRoom, hasApprovedBooking, userDormitory, canExtendRoom, roomDates, dateErrors, loading.submitting]);

    const handleSendRequest = useCallback((room) => {
        if (hasPendingRequest) {
            setError('You already have a pending request. Please wait for it to be settled before sending another request.');
            return;
        }

        const isExtension = hasApprovedBooking() && room.id === userDormitory.dormitory_room_id;
        
        // Check if user is trying to extend an unavailable room
        if (isExtension && !canExtendRoom(room)) {
            setError('Extension is not available for this room. The room is currently unavailable for new bookings or extensions. You can continue to stay until your current booking ends.');
            return;
        }
        
        if (!validateDates(room.id, isExtension)) {
            setError('Please select valid check-in and check-out dates');
            return;
        }
        setSelectedRoom(room);
        setShowPaymentModal(true);
    }, [hasPendingRequest, userDormitory, validateDates, hasApprovedBooking, canExtendRoom]);

    const handleConfirmRequest = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, submitting: true }));
            setError(null);
            const token = getToken('csrf-token');
            
            const roomDate = roomDates[selectedRoom.id] || {};
            const { checkInDate, checkOutDate } = roomDate;
            const isExtension = hasApprovedBooking() && selectedRoom.id === userDormitory.dormitory_room_id;

            const requestData = {
                room_id: selectedRoom.id,
                tenant_from_date: checkInDate,
                tenant_to_date: checkOutDate,
                tenant_status: 'PENDING'
            };

            // If it's an extension, add extension-specific data
            if (isExtension) {
                requestData.extension_of = userDormitory.id;
                requestData.tenant_status = 'EXTENDING';
            }

            const response = await axios.post(`${url}/dormitories/request_tenant_room`, 
                requestData, 
                {
                    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
                }
            );

            if (response.status === 200 || response.status === 201) {
                setError(null);
                setShowPaymentModal(false);
                setHasPendingRequest(true);
                
                setRoomDates(prev => ({
                    ...prev,
                    [selectedRoom.id]: {
                        checkInDate: '',
                        checkOutDate: ''
                    }
                }));
                
                setDateErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[selectedRoom.id];
                    return newErrors;
                });
                
                if (userData?.id) {
                    await fetchUserRequest(userData.id);
                }
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.message || 'Failed to submit request. Please try again.';
            setError(errorMessage);
            console.error('Request submission failed:', error);
            
            if (userData?.id) {
                await fetchUserRequest(userData.id);
            }
        } finally {
            setLoading(prev => ({ ...prev, submitting: false }));
        }
    }, [roomDates, selectedRoom, userDormitory, hasApprovedBooking, url, getToken, userData, fetchUserRequest]);


    // Get minimum date for extension
    const getMinDateForRoom = useCallback((room) => {
        if (hasApprovedBooking() && room.id === userDormitory.dormitory_room_id) {
            // For extension, the minimum date is the day after current booking ends
            const currentEndDate = new Date(userDormitory.tenant_to_date);
            currentEndDate.setDate(currentEndDate.getDate() + 1);
            return currentEndDate.toISOString().split('T')[0];
        }
        // For new bookings, minimum date is today
        return new Date().toISOString().split('T')[0];
    }, [hasApprovedBooking, userDormitory]);

    // Get default check-in date for extension
    const getDefaultCheckInDate = useCallback((room) => {
        if (hasApprovedBooking() && room.id === userDormitory.dormitory_room_id) {
            // For extension, default check-in is the day after current booking ends
            const currentEndDate = new Date(userDormitory.tenant_to_date);
            currentEndDate.setDate(currentEndDate.getDate() + 1);
            return currentEndDate.toISOString().split('T')[0];
        }
        return '';
    }, [hasApprovedBooking, userDormitory]);

    const handleCloseModal = useCallback(() => {
        setShowPaymentModal(false);
        setError(null);
    }, []);

    const handleShowPhotos = useCallback((room) => {
        setSelectedRoomForPhotos(room);
        setShowPhotoModal(true);
    }, []);

    const handleClosePhotoModal = useCallback(() => {
        setShowPhotoModal(false);
        setSelectedRoomForPhotos(null);
    }, []);

    const getRoomDates = useCallback((roomId) => {
        return roomDates[roomId] || { checkInDate: '', checkOutDate: '' };
    }, [roomDates]);

    const getRoomErrors = useCallback((roomId) => {
        return dateErrors[roomId] || {};
    }, [dateErrors]);

    const handleTabChange = useCallback((event, newValue) => {
        setActiveTab(newValue);
    }, []);

    // Tab Panel Component
    const TabPanel = ({ children, value, index, ...other }) => {
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`dormitory-tabpanel-${index}`}
                aria-labelledby={`dormitory-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 3 }}>
                        {children}
                    </Box>
                )}
            </div>
        );
    };

    // Status Badge Component
    const StatusBadge = useCallback(({ status }) => {
        const config = STATUS_CONFIG[status] || { class: 'secondary', text: status, icon: 'fa-question' };
        
        return (
            <span className={`badge badge-${config.class} px-3 py-2`}>
                <i className={`fas ${config.icon} mr-1`}></i>
                {config.text}
            </span>
        );
    }, []);

    // Photo Modal Component
    const PhotoModal = () => {
        if (!selectedRoomForPhotos) return null;

        // Get photos from room data - handle different possible photo field names
        const roomPhotos = selectedRoomForPhotos.room_photos || 
                          selectedRoomForPhotos.photos || 
                          selectedRoomForPhotos.photo || 
                          selectedRoomForPhotos.images || 
                          [];

        // Ensure photos is an array
        const photos = Array.isArray(roomPhotos) ? roomPhotos : 
                      (roomPhotos ? [roomPhotos] : []);

        return (
            <Modal
                open={showPhotoModal}
                onClose={handleClosePhotoModal}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Fade in={showPhotoModal}>
                    <div 
                        className="bg-white rounded-lg shadow-lg"
                        style={{
                            width: '90%',
                            maxWidth: '800px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            outline: 'none'
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                            <h5 className="mb-0 font-weight-bold">
                                <i className="fas fa-images mr-2 text-primary"></i>
                                {selectedRoomForPhotos.room_name} - Room Photos
                            </h5>
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                onClick={handleClosePhotoModal}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div className="p-3">
                            {photos.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="fas fa-image fa-3x text-muted mb-3"></i>
                                    <h6 className="text-muted">No photos available</h6>
                                    <p className="text-muted mb-0">This room doesn't have any photos yet.</p>
                                </div>
                            ) : (
                                <div className="row">
                                    {photos.map((photo, index) => (
                                        <div key={index} className="col-md-6 mb-3">
                                            <div className="card border-0 shadow-sm">
                                                <img
                                                    src={photo.url || photo.path || photo.src || photo}
                                                    alt={`${selectedRoomForPhotos.room_name} - Photo ${index + 1}`}
                                                    className="card-img-top"
                                                    style={{
                                                        height: '200px',
                                                        objectFit: 'cover',
                                                        cursor: 'pointer'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                                                    }}
                                                />
                                                <div className="card-body p-2">
                                                    <small className="text-muted">
                                                        <i className="fas fa-image mr-1"></i>
                                                        Photo {index + 1}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Fade>
            </Modal>
        );
    };

    // Request Status Table Component
    const RequestStatusTable = () => {
        if (userRequests.length === 0) {
            return (
                <div className="card shadow-sm border-0">
                    <div className="card-body p-5 text-center">
                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <h5 className="text-muted">No Accommodation Requests</h5>
                        <p className="text-muted mb-0">You haven't made any accommodation requests yet.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-bottom-0">
                    <h5 className="mb-0 font-weight-bold">
                        <i className="fas fa-table mr-2 text-primary"></i>
                        Accommodation Request Status
                    </h5>
                    <p className="mb-0 text-muted small mt-1">
                        Overview of all your accommodation requests and their current status
                    </p>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="thead-light">
                                <tr>
                                    <th scope="col" className="border-0">Room</th>
                                    <th scope="col" className="border-0">Status</th>
                                    <th scope="col" className="border-0">Check-in</th>
                                    <th scope="col" className="border-0">Check-out</th>
                                    <th scope="col" className="border-0">Request Date</th>
                                    <th scope="col" className="border-0">Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userRequests.map((request, index) => (
                                    <tr key={request.id || index} className={index % 2 === 0 ? 'bg-light' : ''}>
                                        <td className="align-middle">
                                            <div>
                                                <strong className="d-block">{request.room_name || 'Unknown Room'}</strong>
                                                <small className="text-muted">
                                                    Capacity: {request.room_slot || 'N/A'} persons
                                                </small>
                                            </div>
                                        </td>
                                        <td className="align-middle">
                                            <StatusBadge status={request.tenant_status} />
                                        </td>
                                        <td className="align-middle">
                                            {request.tenant_from_date ? 
                                                new Date(request.tenant_from_date).toLocaleDateString() : 
                                                <span className="text-muted">Not set</span>
                                            }
                                        </td>
                                        <td className="align-middle">
                                            {request.tenant_to_date ? 
                                                new Date(request.tenant_to_date).toLocaleDateString() : 
                                                <span className="text-muted">Not set</span>
                                            }
                                        </td>
                                        <td className="align-middle">
                                            {request.created_at ? 
                                                new Date(request.created_at).toLocaleDateString() : 
                                                <span className="text-muted">Unknown</span>
                                            }
                                        </td>
                                        <td className="align-middle">
                                            {request.updated_at && request.updated_at !== request.created_at ? 
                                                new Date(request.updated_at).toLocaleDateString() : 
                                                <span className="text-muted">-</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <PageName pageName={[{ name: 'Dormitory', last: true, address: '/trainee/dormitories/get_all_dormitories' }]} />

            <section className="content">
                <div className="container-fluid">
                    <div className="col-xl-12">
                        <div className="alert alert-info border-0 shadow-sm mb-4" style={{ backgroundColor: COLORS.INFO_BG, borderLeft: `4px solid ${COLORS.INFO_BORDER}` }}>
                            <span className="fas fa-bed text-primary mr-3" style={{ fontSize: '24px' }}></span>
                            <strong style={{ color: "black" }}>Dormitory Accommodation</strong>
                            <p className="mb-0" style={{ fontSize: '13px', color: "black" }}>Browse available rooms and manage your accommodation requests</p>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="alert alert-danger border-0 shadow-sm mb-4">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                <strong>Error:</strong> {error}
                                <button 
                                    type="button" 
                                    className="close" 
                                    onClick={() => setError(null)}
                                    style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: '1', color: '#000', textShadow: '0 1px 0 #fff', opacity: '.5' }}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                        )}

                        {/* Tabs Navigation */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body p-0">
                                <Tabs 
                                    value={activeTab} 
                                    onChange={handleTabChange}
                                    indicatorColor="primary"
                                    textColor="primary"
                                    variant="fullWidth"
                                >
                                    <Tab 
                                        label={
                                            <span>
                                                <i className="fas fa-door-open mr-2"></i>
                                                Available Rooms
                                            </span>
                                        }
                                    />
                                    <Tab 
                                        label={
                                            <span>
                                                <i className="fas fa-table mr-2"></i>
                                                Request Status
                                            </span>
                                        }
                                    />
                                </Tabs>
                            </div>
                        </div>

                        {/* Tab Panels */}
                        <TabPanel value={activeTab} index={0}>
                            {/* Available Rooms Tab */}
                            {checkPendingRequest() && (
                                <div className={`alert ${userDormitory.tenant_status === 'EXTENDING' ? 'alert-info' : 'alert-warning'} border-0 shadow-sm mb-4`}>
                                    <i className="fas fa-clock mr-2"></i>
                                    <strong>
                                        {userDormitory.tenant_status === 'EXTENDING' 
                                            ? 'Extension Request Pending' 
                                            : 'Request Status: Pending Approval'}
                                    </strong>
                                    <p className="mb-0" style={{ fontSize: '13px' }}>
                                        {userDormitory.tenant_status === 'EXTENDING'
                                            ? 'Your extension request is pending approval. You will receive a payment link via email once approved.'
                                            : 'Your accommodation request is pending approval. You will receive a payment link via email once approved.'}
                                    </p>
                                </div>
                            )}

                            {hasApprovedBooking() && !isExtending() && (
                                <div className="alert alert-success border-0 shadow-sm mb-4">
                                    <i className="fas fa-check-circle mr-2"></i>
                                    <strong>Accommodation Active</strong>
                                    <p className="mb-0" style={{ fontSize: '13px' }}>
                                        Your stay is confirmed from {new Date(userDormitory.tenant_from_date).toLocaleDateString()} to {new Date(userDormitory.tenant_to_date).toLocaleDateString()}. 
                                        {!checkPendingRequest() && ' You can extend your stay by clicking "Extend Stay" on your room.'}
                                    </p>
                                </div>
                            )}

                            {/* Notification for unavailable room when user has approved booking */}
                            {hasApprovedBooking() && !isExtending() && rooms.length > 0 && (() => {
                                const currentRoom = rooms.find(room => room.id === userDormitory.dormitory_room_id);
                                if (currentRoom && !canExtendRoom(currentRoom)) {
                                    return (
                                        <div className="alert alert-warning border-0 shadow-sm mb-4">
                                            <i className="fas fa-exclamation-triangle mr-2"></i>
                                            <strong>Room Extension Unavailable</strong>
                                            <p className="mb-0" style={{ fontSize: '13px' }}>
                                                Your current room is no longer available for extensions. You can continue to stay until your booking ends on {new Date(userDormitory.tenant_to_date).toLocaleDateString()}, 
                                                but you won't be able to extend your stay in this room.
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {loading.rooms ? (
                                <Box>
                                    <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} animation="wave" />
                                    <Skeleton variant="rectangular" height={200} animation="wave" />
                                </Box>
                            ) : rooms.length === 0 ? (
                                <div className="card shadow-sm border-0">
                                    <div className="card-body p-5">
                                        <NoDataFound />
                                    </div>
                                </div>
                            ) : (
                                <div className="row">
                                    {rooms.map((room) => {
                                        const roomDate = getRoomDates(room.id);
                                        const roomErrors = getRoomErrors(room.id);
                                        const minCheckOutDate = roomDate.checkInDate || new Date().toISOString().split('T')[0];
                                        const isButtonDisabled = getButtonDisabledState(room);
                                        const isExtension = hasApprovedBooking() && room.id === userDormitory.dormitory_room_id;
                                        const minCheckInDate = getMinDateForRoom(room);

                                        return (
                                            <div key={room.id} className="col-md-6 mb-4">
                                                <div className="card shadow-sm border-0 h-100" style={{ transition: 'transform 0.2s', backgroundColor: '#F5F5F5' }}>
                                                    <div className="card-header border-bottom-0" style={{ padding: '1.25rem', backgroundColor: '#dae6f377' }}>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <h5 className="mb-0 font-weight-bold">{room.room_name}</h5>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-info btn-sm"
                                                                    onClick={() => handleShowPhotos(room)}
                                                                    style={{ fontSize: '11px', padding: '0.25rem 0.5rem' }}
                                                                    title="View room photos"
                                                                >
                                                                    <i className="fas fa-images mr-1"></i>
                                                                    Photos
                                                                </button>
                                                                <span className={`badge badge-${room.room_status === 'ACTIVE' ? 'success' : 'secondary'} px-3 py-2`} style={{ fontSize: '12px' }}>{room.room_status}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="card-body" style={{ padding: '1.25rem' }}>
                                                        <p className="text-muted mb-3" style={{ fontSize: '14px' }}>{room.room_description}</p>
                                                        
                                                        <div className="row mb-3">
                                                            <div className="col-6">
                                                                <div className="d-flex align-items-center">
                                                                    <i className="fas fa-users text-primary mr-2"></i>
                                                                    <div>
                                                                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>Capacity</small>
                                                                        <strong>{room.room_slot} persons</strong>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-6">
                                                                <div className="d-flex align-items-center">
                                                                    <i className="fas fa-door-open text-success mr-2"></i>
                                                                    <div>
                                                                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>Available</small>
                                                                        <strong>{room.available_slots} slots</strong>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isExtension && canExtendRoom(room) && (
                                                            <div className="alert alert-info border-0 mb-3 py-2" style={{ fontSize: '12px' }}>
                                                                <i className="fas fa-info-circle mr-1"></i>
                                                                <strong>Extension:</strong> Your extension must start after your current booking ends on {new Date(userDormitory.tenant_to_date).toLocaleDateString()}
                                                            </div>
                                                        )}

                                                        {isExtension && !canExtendRoom(room) && (
                                                            <div className="alert alert-warning border-0 mb-3 py-2" style={{ fontSize: '12px' }}>
                                                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                                                <strong>Extension Unavailable:</strong> This room is no longer available for extensions. You can continue to stay until your booking ends.
                                                            </div>
                                                        )}

                                                        <div className="row mb-3">
                                                            <div className="col-6">
                                                                <label className="text-muted mb-1" style={{ fontSize: '12px' }}><i className="fas fa-calendar-check mr-1"></i> Check-in Date</label>
                                                                <input 
                                                                    type="date" 
                                                                    className={`form-control form-control-sm ${roomErrors.checkIn ? 'is-invalid' : ''}`} 
                                                                    value={roomDate.checkInDate} 
                                                                    onChange={(e) => handleDateChange(room.id, 'checkInDate', e.target.value)} 
                                                                    min={minCheckInDate}
                                                                    disabled={!canRequestRoom(room) || checkPendingRequest() || (isExtension && !canExtendRoom(room))} 
                                                                    style={{ fontSize: '13px' }} 
                                                                />
                                                                {roomErrors.checkIn && <div className="invalid-feedback" style={{ fontSize: '11px' }}>{roomErrors.checkIn}</div>}
                                                            </div>
                                                            <div className="col-6">
                                                                <label className="text-muted mb-1" style={{ fontSize: '12px' }}><i className="fas fa-calendar-times mr-1"></i> Check-out Date</label>
                                                                <input 
                                                                    type="date" 
                                                                    className={`form-control form-control-sm ${roomErrors.checkOut ? 'is-invalid' : ''}`} 
                                                                    value={roomDate.checkOutDate} 
                                                                    onChange={(e) => handleDateChange(room.id, 'checkOutDate', e.target.value)} 
                                                                    min={minCheckOutDate} 
                                                                    disabled={!canRequestRoom(room) || checkPendingRequest() || (isExtension && !canExtendRoom(room))} 
                                                                    style={{ fontSize: '13px' }} 
                                                                />
                                                                {roomErrors.checkOut && <div className="invalid-feedback" style={{ fontSize: '11px' }}>{roomErrors.checkOut}</div>}
                                                            </div>
                                                        </div>

                                                        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                                            <div>
                                                                <small className="text-muted d-block" style={{ fontSize: '11px' }}>Daily Rate</small>
                                                                <h4 className="mb-0 text-primary font-weight-bold">₱{room.room_cost.toLocaleString()}</h4>
                                                            </div>
                                                            <button
                                                                className={`btn ${
                                                                    isButtonDisabled 
                                                                        ? (isExtension && !canExtendRoom(room)) 
                                                                            ? 'btn-warning' 
                                                                            : 'btn-secondary'
                                                                        : 'btn-primary'
                                                                } px-4`}
                                                                onClick={() => handleSendRequest(room)}
                                                                disabled={isButtonDisabled}
                                                                style={{ fontSize: '13px', fontWeight: '600' }}
                                                            >
                                                                <i className={`fas ${
                                                                    isExtension && !canExtendRoom(room) 
                                                                        ? 'fa-exclamation-triangle' 
                                                                        : 'fa-paper-plane'
                                                                } mr-2`}></i>
                                                                {getButtonText(room)}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </TabPanel>

                        <TabPanel value={activeTab} index={1}>
                            {/* Request Status Table Tab */}
                            <RequestStatusTable />
                        </TabPanel>

                    </div>
                </div>
            </section>

            <PaymentMethodModal 
                show={showPaymentModal && !loading.submitting} 
                onClose={handleCloseModal} 
                onConfirm={handleConfirmRequest} 
                room={selectedRoom} 
                checkInDate={selectedRoom ? getRoomDates(selectedRoom.id).checkInDate : ''} 
                checkOutDate={selectedRoom ? getRoomDates(selectedRoom.id).checkOutDate : ''} 
                isExtension={selectedRoom ? (hasApprovedBooking() && selectedRoom.id === userDormitory.dormitory_room_id) : false}
                isLoading={loading.submitting}
            />
            
            <PhotoModal />
        </>
    );
};

export default Dormitory;