import React, { useEffect, useState } from 'react';
import PageName from '../../../components/PageName';
import { Skeleton, Box } from '@mui/material';
import NoDataFound from '../../../components/NoDataFound';
import PaymentMethodModal from './PaymentMethodModal';
import useGetToken from '../../../../hooks/useGetToken';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import axios from 'axios';

const Dormitory = () => {
    const { url } = useSystemURLCon();
    const { getToken } = useGetToken();
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState([]);
    const [userDormitory, setUserDormitory] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [dateErrors, setDateErrors] = useState({});

    useEffect(() => {
        fetchRooms();
        fetchUserRequest();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const token = getToken('csrf-token');
            
            // API: GET /dormitories/get_all_dormitories (existing, working)
            // RETURNS: { dormitories: Array<{ id, room_name, room_description, room_slot, room_cost, room_status, tenants_count }> }
            // NOTE: tenants_count comes from withCount(['tenants']) in backend
            const response = await axios.get(`${url}/dormitories/get_all_dormitories`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            const dormitories = response?.data?.dormitories || [];
            
            // Calculate available_slots (no DB column needed - calculated from existing fields)
            const roomsWithSlots = dormitories.map(room => ({
                ...room,
                available_slots: room.room_slot - (room.tenants_count || 0)
            }));
            setRooms(roomsWithSlots);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRequest = async () => {
        try {
            const token = getToken('csrf-token');
            
            // API: GET /trainee/dormitories/get_personal_dormitory (existing, working)
            // RETURNS: { trainee_dormitories: Array<User with trainee_dormitory relation> }
            // NOTE: Returns User model with trainee_dormitory relationship (hasMany DormitoryTenant)
            const response = await axios.get(`${url}/trainee/dormitories/get_personal_dormitory`, { 
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            const traineeDormitories = response?.data?.trainee_dormitories || [];
            
            // Get the first user's dormitories (should be current user)
            if (traineeDormitories.length > 0 && traineeDormitories[0].trainee_dormitory) {
                const dormitories = traineeDormitories[0].trainee_dormitory;
                
                // Find active dormitory using existing tenant_status field (no new DB columns)
                // Status flow: PENDING → APPROVED → EXTENDING → APPROVED (all from existing enum)
                const activeDormitory = dormitories.find(d => 
                    ['PENDING', 'APPROVED', 'EXTENDING'].includes(d.tenant_status)
                );
                setUserDormitory(activeDormitory || null);
            } else {
                setUserDormitory(null);
            }
        } catch (error) {
            console.error('Failed to fetch user dormitory:', error);
            setUserDormitory(null);
        }
    };

    const validateDates = () => {
        const errors = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!checkInDate) {
            errors.checkIn = 'Check-in date is required';
        } else {
            const checkIn = new Date(checkInDate);
            if (checkIn < today) {
                errors.checkIn = 'Check-in date cannot be in the past';
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

        setDateErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSendRequest = (room) => {
        if (!validateDates()) {
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

            // API NEEDED: POST /trainee/dormitories/request_tenant_room
            // POST DATA: { room_id: number, check_in_date: date, check_out_date: date }
            // RESPONSE: { message: string }
            // CREATES: New DormitoryTenant record with tenant_status='PENDING' (default from migration)
            // NOTE: Uses ONLY existing table columns - payment is always online (no column needed)
            const response = await axios.post(`${url}/trainee/dormitories/request_tenant_room`, {
                room_id: selectedRoom.id,
                check_in_date: checkInDate,
                check_out_date: checkOutDate
                // No payment_method - payment is always online, no DB column exists
            }, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });

            if (response.status === 200 || response.status === 201) {
                alert(response?.data?.message || 'Request submitted successfully!');
                setShowPaymentModal(false);
                setCheckInDate('');
                setCheckOutDate('');
                setDateErrors({});
                await fetchUserRequest();
            }
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasPendingRequest = () => {
        return userDormitory && userDormitory.tenant_status === 'PENDING';
    };

    const hasApprovedBooking = () => {
        return userDormitory && userDormitory.tenant_status === 'APPROVED';
    };

    const isExtending = () => {
        return userDormitory && userDormitory.tenant_status === 'EXTENDING';
    };

    const canRequestRoom = (room) => {
        // If no dormitory record, can request any active room with slots
        if (!userDormitory) return room.room_status === 'ACTIVE' && room.available_slots > 0;
        
        // If pending or extending, cannot request any room
        if (hasPendingRequest() || isExtending()) return false;
        
        // If has approved booking, can only extend the same room
        if (hasApprovedBooking()) {
            return room.id === userDormitory.dormitory_room_id;
        }
        
        // For other statuses (TERMINATED, CANCELLED), can request new room
        return room.room_status === 'ACTIVE' && room.available_slots > 0;
    };

    const getButtonText = (room) => {
        if (hasPendingRequest()) return 'Request Pending';
        if (isExtending()) return 'Extension Pending';
        if (hasApprovedBooking() && room.id === userDormitory.dormitory_room_id) return 'Extend Stay';
        return 'Send Request';
    };

    const handleCloseModal = () => {
        setShowPaymentModal(false);
        setDateErrors({});
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
                            <p className="mb-0" style={{ fontSize: '13px', color: "black" }}>Browse available rooms and submit your accommodation request</p>
                        </div>

                        {hasPendingRequest() && (
                            <div className="alert alert-warning border-0 shadow-sm mb-4">
                                <i className="fas fa-clock mr-2"></i>
                                <strong>Request Status: Pending Approval</strong>
                                <p className="mb-0" style={{ fontSize: '13px' }}>Your accommodation request is pending approval. You will receive a payment link via email once approved.</p>
                            </div>
                        )}

                        {isExtending() && (
                            <div className="alert alert-info border-0 shadow-sm mb-4">
                                <i className="fas fa-clock mr-2"></i>
                                <strong>Extension Request Pending</strong>
                                <p className="mb-0" style={{ fontSize: '13px' }}>Your extension request is pending approval. You will receive a payment link via email once approved.</p>
                            </div>
                        )}

                        {hasApprovedBooking() && !isExtending() && (
                            <div className="alert alert-success border-0 shadow-sm mb-4">
                                <i className="fas fa-check-circle mr-2"></i>
                                <strong>Accommodation Active</strong>
                                <p className="mb-0" style={{ fontSize: '13px' }}>
                                    Your stay is confirmed from {new Date(userDormitory.tenant_from_date).toLocaleDateString()} to {new Date(userDormitory.tenant_to_date).toLocaleDateString()}. 
                                    You can extend your stay by clicking "Extend Stay" on your room.
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
                                {rooms.map((room) => (
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

                                                <div className="row mb-3">
                                                    <div className="col-6">
                                                        <label className="text-muted mb-1" style={{ fontSize: '12px' }}><i className="fas fa-calendar-check mr-1"></i> Check-in Date</label>
                                                        <input 
                                                            type="date" 
                                                            className={`form-control form-control-sm ${dateErrors.checkIn ? 'is-invalid' : ''}`} 
                                                            value={checkInDate} 
                                                            onChange={(e) => setCheckInDate(e.target.value)} 
                                                            min={new Date().toISOString().split('T')[0]} 
                                                            disabled={!canRequestRoom(room)} 
                                                            style={{ fontSize: '13px' }} 
                                                        />
                                                        {dateErrors.checkIn && <div className="invalid-feedback" style={{ fontSize: '11px' }}>{dateErrors.checkIn}</div>}
                                                    </div>
                                                    <div className="col-6">
                                                        <label className="text-muted mb-1" style={{ fontSize: '12px' }}><i className="fas fa-calendar-times mr-1"></i> Check-out Date</label>
                                                        <input 
                                                            type="date" 
                                                            className={`form-control form-control-sm ${dateErrors.checkOut ? 'is-invalid' : ''}`} 
                                                            value={checkOutDate} 
                                                            onChange={(e) => setCheckOutDate(e.target.value)} 
                                                            min={checkInDate || new Date().toISOString().split('T')[0]} 
                                                            disabled={!canRequestRoom(room)} 
                                                            style={{ fontSize: '13px' }} 
                                                        />
                                                        {dateErrors.checkOut && <div className="invalid-feedback" style={{ fontSize: '11px' }}>{dateErrors.checkOut}</div>}
                                                    </div>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                                    <div>
                                                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>Daily Rate</small>
                                                        <h4 className="mb-0 text-primary font-weight-bold">₱{room.room_cost.toLocaleString()}</h4>
                                                    </div>
                                                    <button
                                                        className="btn btn-primary px-4"
                                                        onClick={() => handleSendRequest(room)}
                                                        disabled={!canRequestRoom(room)}
                                                        style={{ fontSize: '13px', fontWeight: '600' }}
                                                    >
                                                        <i className="fas fa-paper-plane mr-2"></i>
                                                        {getButtonText(room)}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <PaymentMethodModal show={showPaymentModal && !isSubmitting} onClose={handleCloseModal} onConfirm={handleConfirmRequest} room={selectedRoom} checkInDate={checkInDate} checkOutDate={checkOutDate} />
        </>
    );
};

export default Dormitory;