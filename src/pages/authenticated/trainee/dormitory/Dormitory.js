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
    const [userRequest, setUserRequest] = useState(null);
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

            const response = await axios.get(`${url}/trainee/dormitory/rooms`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            setRooms(response?.data?.rooms || []);
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

            const response = await axios.get(`${url}/trainee/dormitory/my-request`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            setUserRequest(response?.data?.request || null);
        } catch (error) {
            console.error('Failed to fetch user request:', error);
            setUserRequest(null);
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

    const handlePaymentMethodSelect = async (paymentMethod) => {
        try {
            setIsSubmitting(true);
            const token = getToken('csrf-token');

            const response = await axios.post(`${url}/trainee/dormitory/request`, {
                room_id: selectedRoom.id,
                payment_method: paymentMethod,
                check_in_date: checkInDate,
                check_out_date: checkOutDate
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
        return userRequest && ['PENDING', 'PROCESSING', 'APPROVED'].includes(userRequest.status);
    };

    const handleCloseModal = () => {
        setShowPaymentModal(false);
        setDateErrors({});
    };

    return (
        <>
            <PageName pageName={[{ name: 'Dormitory', last: true, address: '/trainee/dormitory' }]} />

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
                                <strong>Request Status: {userRequest.status}</strong>
                                <p className="mb-0" style={{ fontSize: '13px' }}>You already have a pending request. Please wait for admin approval.</p>
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
                                        <div className="card shadow-sm border-0 h-100" style={{ transition: 'transform 0.2s' }}>
                                            <div className="card-header bg-white border-bottom-0" style={{ padding: '1.25rem' }}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h5 className="mb-0 font-weight-bold">{room.room_name}</h5>
                                                    <span className={`badge badge-${room.room_status === 'AVAILABLE' ? 'success' : 'secondary'} px-3 py-2`} style={{ fontSize: '12px' }}>{room.room_status}</span>
                                                </div>
                                            </div>
                                            <div className="card-body" style={{ padding: '1.25rem' }}>
                                                <p className="text-muted mb-3" style={{ fontSize: '14px' }}>{room.description}</p>
                                                
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
                                                        <input type="date" className={`form-control form-control-sm ${dateErrors.checkIn ? 'is-invalid' : ''}`} value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} min={new Date().toISOString().split('T')[0]} disabled={hasPendingRequest()} style={{ fontSize: '13px' }} />
                                                        {dateErrors.checkIn && <div className="invalid-feedback" style={{ fontSize: '11px' }}>{dateErrors.checkIn}</div>}
                                                    </div>
                                                    <div className="col-6">
                                                        <label className="text-muted mb-1" style={{ fontSize: '12px' }}><i className="fas fa-calendar-times mr-1"></i> Check-out Date</label>
                                                        <input type="date" className={`form-control form-control-sm ${dateErrors.checkOut ? 'is-invalid' : ''}`} value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} min={checkInDate || new Date().toISOString().split('T')[0]} disabled={hasPendingRequest()} style={{ fontSize: '13px' }} />
                                                        {dateErrors.checkOut && <div className="invalid-feedback" style={{ fontSize: '11px' }}>{dateErrors.checkOut}</div>}
                                                    </div>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                                    <div>
                                                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>Daily Rate</small>
                                                        <h4 className="mb-0 text-primary font-weight-bold">₱{room.room_cost.toLocaleString()}</h4>
                                                    </div>
                                                    <button className="btn btn-primary px-4" onClick={() => handleSendRequest(room)} disabled={hasPendingRequest() || room.room_status !== 'AVAILABLE' || room.available_slots === 0} style={{ fontSize: '13px', fontWeight: '600' }}>
                                                        <i className="fas fa-paper-plane mr-2"></i>
                                                        {hasPendingRequest() ? 'Request Pending' : 'Send Request'}
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

            <PaymentMethodModal show={showPaymentModal && !isSubmitting} onClose={handleCloseModal} onSelectPayment={handlePaymentMethodSelect} room={selectedRoom} checkInDate={checkInDate} checkOutDate={checkOutDate} />
        </>
    );
};

export default Dormitory;
