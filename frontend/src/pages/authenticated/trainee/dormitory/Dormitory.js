import React, { useEffect, useState } from 'react';
import PageName from '../../../components/PageName';
import { Skeleton, Box, Tabs, Tab } from '@mui/material';
import NoDataFound from '../../../components/NoDataFound';
import PaymentMethodModal from './PaymentMethodModal';
import useGetToken from '../../../../hooks/useGetToken';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import axios from 'axios';
import useGetCurrentUser from '../../../../hooks/useGetCurrentUser';

const Dormitory = () => {
    const { url, urlWithoutToken } = useSystemURLCon();
    const { getToken } = useGetToken();
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState([]);
    const [userDormitory, setUserDormitory] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roomDates, setRoomDates] = useState({});
    const [dateErrors, setDateErrors] = useState({});
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    const [userRequests, setUserRequests] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const { userData } = useGetCurrentUser();
    const [previewList, setPreviewList] = useState([]);
    const [previewIndex, setPreviewIndex] = useState(0);

    useEffect(() => {
        fetchRooms();
        if (userData?.id) {
            fetchUserRequest(userData.id);
            disableAllRoomsIfUserHasDormitory(userData.id);
        }
    }, [userData]);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const token = getToken('csrf-token');
            
            const response = await axios.get(`${url}/dormitories/get_all_dormitories`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
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
            console.error('Failed to fetch rooms:', error);
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRequest = async (id) => {
        try {
            const token = getToken('csrf-token');
            console.log("userID:", id);

            const response = await axios.get(`${url}/dormitories/get_personal_dormitory`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                params: { user_id: id },
            });

            console.log("User requests response:", response.data);

            let userRequests = [];
            if (Array.isArray(response.data)) {
                userRequests = response.data;
            } else if (response.data?.data) {
                userRequests = response.data.data;
            } else if (response.data?.requests) {
                userRequests = response.data.requests;
            }

            const activeDormitory = userRequests.find((d) =>
                ['PENDING', 'APPROVED', 'EXTENDING', 'AVAILABLE', 'UNAVAILABLE'].includes(d.tenant_status)
            );

            setUserDormitory(activeDormitory || null);
            setHasPendingRequest(
                activeDormitory?.tenant_status === 'PENDING' ||
                activeDormitory?.tenant_status === 'EXTENDING'
            );
            setUserRequests(userRequests);

            // Set default extension dates for user's current room
            if (activeDormitory) {
                setRoomDates(prev => ({
                    ...prev,
                    [activeDormitory.dormitory_room_id]: {
                        checkInDate: activeDormitory.tenant_to_date, // Start extension from current check-out date
                        checkOutDate: ''
                    }
                }));
            }
        } catch (error) {
            console.error('Failed to fetch user dormitory:', error);
            setUserDormitory(null);
            setHasPendingRequest(false);
            setUserRequests([]);
        }
    };

    const disableAllRoomsIfUserHasDormitory = async (id) => {
        try {
            const token = getToken('csrf-token');

            const response = await axios.get(`${url}/dormitories/get_personal_dormitory`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
                params: { user_id: id },
            });

            let hasDormitory = false;
            if (Array.isArray(response.data) && response.data.length > 0) {
                hasDormitory = true;
            } else if (response.data?.data && response.data.data.length > 0) {
                hasDormitory = true;
            } else if (response.data?.user_id) {
                hasDormitory = true;
            }

            if (hasDormitory) {
                setRooms((prevRooms) =>
                    prevRooms.map((room) => ({
                        ...room,
                        disabled: true,
                    }))
                );
            }
        } catch (error) {
            console.error("Error checking personal dormitory:", error);
        }
    };

    // NEW FUNCTION: Validate dates with extension logic
    const validateDates = (roomId, isExtension = false) => {
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
    };

    const handleDateChange = (roomId, field, value) => {
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
    };

    const handleSendRequest = (room) => {
        if (hasPendingRequest) {
            alert('You already have a pending request. Please wait for it to be settled before sending another request.');
            return;
        }

        const isExtension = hasApprovedBooking() && room.id === userDormitory.dormitory_room_id;
        
        if (!validateDates(room.id, isExtension)) {
            alert('Please select valid check-in and check-out dates');
            return;
        }
        setSelectedRoom(room);
        setShowPaymentModal(true);
    };

    const handleConfirmRequest = async () => {
        try {
            setIsSubmitting(true);
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
                alert(response?.data?.message || 'Request submitted successfully!');
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
            console.log(error?.response?.data?.message);
            console.log("Error: ", error);
            if (userData?.id) {
                await fetchUserRequest(userData.id);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const checkPendingRequest = () => {
        return userDormitory && (userDormitory.tenant_status === 'PENDING' || userDormitory.tenant_status === 'EXTENDING');
    };

    const hasApprovedBooking = () => {
        return userDormitory && userDormitory.tenant_status === 'APPROVED';
    };

    const isExtending = () => {
        return userDormitory && userDormitory.tenant_status === 'EXTENDING';
    };

    const canRequestRoom = (room) => {
        if (checkPendingRequest()) return false;
        
        if (hasApprovedBooking()) {
            return room.id === userDormitory.dormitory_room_id;
        }
        
        return room.room_status === 'ACTIVE' && room.available_slots > 0;
    };
 
    const getButtonText = (room) => {
        if (checkPendingRequest()) {
            return userDormitory.tenant_status === 'EXTENDING' ? 'Extension Pending' : 'Request Pending';
        }
        if (hasApprovedBooking() && room.id === userDormitory.dormitory_room_id) return 'Extend Stay';
        return 'Send Request';
    };

    const getButtonDisabledState = (room) => {
        if (checkPendingRequest()) return true;
        if (!canRequestRoom(room)) return true;
        
        const roomDate = roomDates[room.id] || {};
        const roomErrors = dateErrors[room.id] || {};
        
        return !roomDate.checkInDate || !roomDate.checkOutDate || 
               Object.keys(roomErrors).length > 0 || 
               isSubmitting;
    };

    // NEW FUNCTION: Get minimum date for extension
    const getMinDateForRoom = (room) => {
        if (hasApprovedBooking() && room.id === userDormitory.dormitory_room_id) {
            // For extension, the minimum date is the day after current booking ends
            const currentEndDate = new Date(userDormitory.tenant_to_date);
            currentEndDate.setDate(currentEndDate.getDate() + 1);
            return currentEndDate.toISOString().split('T')[0];
        }
        // For new bookings, minimum date is today
        return new Date().toISOString().split('T')[0];
    };

    // NEW FUNCTION: Get default check-in date for extension
    const getDefaultCheckInDate = (room) => {
        if (hasApprovedBooking() && room.id === userDormitory.dormitory_room_id) {
            // For extension, default check-in is the day after current booking ends
            const currentEndDate = new Date(userDormitory.tenant_to_date);
            currentEndDate.setDate(currentEndDate.getDate() + 1);
            return currentEndDate.toISOString().split('T')[0];
        }
        return '';
    };

    const handleCloseModal = () => {
        setShowPaymentModal(false);
    };

    const buildImageUrl = (filename) => `${urlWithoutToken}/room-images/${filename}`;

    const openPreview = (images, startIndex = 0) => {
        const list = (images || []).map((i) => buildImageUrl(i.room_filename));
        if (list.length === 0) return;
        setPreviewList(list);
        setPreviewIndex(Math.max(0, Math.min(startIndex, list.length - 1)));
    };

    const closePreview = () => {
        setPreviewList([]);
        setPreviewIndex(0);
    };

    const showPrev = (e) => {
        e?.stopPropagation?.();
        setPreviewIndex((idx) => (idx > 0 ? idx - 1 : idx));
    };

    const showNext = (e) => {
        e?.stopPropagation?.();
        setPreviewIndex((idx) => (idx < previewList.length - 1 ? idx + 1 : idx));
    };

    const getRoomDates = (roomId) => {
        return roomDates[roomId] || { checkInDate: '', checkOutDate: '' };
    };

    const getRoomErrors = (roomId) => {
        return dateErrors[roomId] || {};
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

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
    const StatusBadge = ({ status }) => {
        const statusConfig = {
            'PENDING': { class: 'warning', text: 'Pending Approval', icon: 'fa-clock' },
            'APPROVED': { class: 'success', text: 'Approved', icon: 'fa-check-circle' },
            'REJECTED': { class: 'danger', text: 'Rejected', icon: 'fa-times-circle' },
            'EXTENDING': { class: 'info', text: 'Extension Pending', icon: 'fa-sync' },
            'CANCELLED': { class: 'secondary', text: 'Cancelled', icon: 'fa-ban' },
            'COMPLETED': { class: 'primary', text: 'Completed', icon: 'fa-flag-checkered' }
        };
        
        const config = statusConfig[status] || { class: 'secondary', text: status, icon: 'fa-question' };
        
        return (
            <span className={`badge badge-${config.class} px-3 py-2`}>
                <i className={`fas ${config.icon} mr-1`}></i>
                {config.text}
            </span>
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
                        <div className="alert alert-info border-0 shadow-sm mb-4" style={{ backgroundColor: '#e7f3ff', borderLeft: '4px solid #0078d4' }}>
                            <span className="fas fa-bed text-primary mr-3" style={{ fontSize: '24px' }}></span>
                            <strong style={{ color: "black" }}>Dormitory Accommodation</strong>
                            <p className="mb-0" style={{ fontSize: '13px', color: "black" }}>Browse available rooms and manage your accommodation requests</p>
                        </div>

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

                            {loading ? (
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
                                                            <span className={`badge badge-${room.room_status === 'ACTIVE' ? 'success' : 'secondary'} px-3 py-2`} style={{ fontSize: '12px' }}>{room.room_status}</span>
                                                        </div>
                                                    </div>
                                                    <div className="card-body" style={{ padding: '1.25rem' }}>
                                                        <p className="text-muted mb-3" style={{ fontSize: '14px' }}>{room.room_description}</p>
                                                        {/* Thumbnails */}
                                                        {Array.isArray(room.room_images) && room.room_images.length > 0 && (
                                                            <div className="mb-3">
                                                                <div className="d-flex flex-wrap" style={{ gap: '8px' }}>
                                                                    {room.room_images.slice(0, 4).map((img, idx) => (
                                                                        <img
                                                                            key={img.id || idx}
                                                                            src={buildImageUrl(img.room_filename)}
                                                                            alt="Room"
                                                                            style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid #ddd' }}
                                                                            onClick={() => openPreview(room.room_images, idx)}
                                                                        />
                                                                    ))}
                                                                    {room.room_images.length > 4 && (
                                                                        <div className="d-flex align-items-center justify-content-center text-muted" style={{ width: '64px', height: '64px', border: '1px dashed #ccc', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }} onClick={() => openPreview(room.room_images, 4)}>
                                                                            +{room.room_images.length - 4}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

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

                                                        {isExtension && (
                                                            <div className="alert alert-info border-0 mb-3 py-2" style={{ fontSize: '12px' }}>
                                                                <i className="fas fa-info-circle mr-1"></i>
                                                                <strong>Extension:</strong> Your extension must start after your current booking ends on {new Date(userDormitory.tenant_to_date).toLocaleDateString()}
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
                                                                    disabled={!canRequestRoom(room) || checkPendingRequest()} 
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
                                                                    disabled={!canRequestRoom(room) || checkPendingRequest()} 
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
                                                                className={`btn ${isButtonDisabled ? 'btn-secondary' : 'btn-primary'} px-4`}
                                                                onClick={() => handleSendRequest(room)}
                                                                disabled={isButtonDisabled}
                                                                style={{ fontSize: '13px', fontWeight: '600' }}
                                                            >
                                                                <i className="fas fa-paper-plane mr-2"></i>
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
            {/* Image Preview Modal with navigation */}
            {previewList.length > 0 && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={closePreview}>
                    <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0" style={{ padding: '0.75rem 1rem' }}>
                                <h6 className="mb-0">Room Image {previewList.length > 1 ? `(${previewIndex + 1}/${previewList.length})` : ''}</h6>
                                <button type="button" className="close" onClick={closePreview}><span>&times;</span></button>
                            </div>
                            <div className="modal-body p-0 position-relative">
                                {previewList.length > 1 && (
                                    <>
                                        <button type="button" className="btn btn-light position-absolute" style={{ top: '50%', left: '10px', transform: 'translateY(-50%)' }} onClick={showPrev} disabled={previewIndex === 0}>
                                            <i className="fas fa-chevron-left"></i>
                                        </button>
                                        <button type="button" className="btn btn-light position-absolute" style={{ top: '50%', right: '10px', transform: 'translateY(-50%)' }} onClick={showNext} disabled={previewIndex === previewList.length - 1}>
                                            <i className="fas fa-chevron-right"></i>
                                        </button>
                                    </>
                                )}
                                <img src={previewList[previewIndex]} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <PaymentMethodModal 
                show={showPaymentModal && !isSubmitting} 
                onClose={handleCloseModal} 
                onConfirm={handleConfirmRequest} 
                room={selectedRoom} 
                checkInDate={selectedRoom ? getRoomDates(selectedRoom.id).checkInDate : ''} 
                checkOutDate={selectedRoom ? getRoomDates(selectedRoom.id).checkOutDate : ''} 
                isExtension={selectedRoom ? (hasApprovedBooking() && selectedRoom.id === userDormitory.dormitory_room_id) : false}
            />
        </>
    );
};

export default Dormitory;