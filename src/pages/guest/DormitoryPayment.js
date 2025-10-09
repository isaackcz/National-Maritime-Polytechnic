import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useSystemURLCon from '../../hooks/useSystemURLCon';
import axios from 'axios';
import './DormitoryPayment.css';

const DormitoryPayment = () => {
    const { url } = useSystemURLCon();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBookingDetails();
    }, []);

    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (!token) {
                setError('Invalid payment link');
                return;
            }

            const response = await axios.get(`${url}/payment/dormitory/details?token=${token}`);
            setBookingData(response?.data?.booking || null);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const calculateDuration = () => {
        if (!bookingData) return 0;
        const checkIn = new Date(bookingData.tenant_from_date);
        const checkOut = new Date(bookingData.tenant_to_date);
        return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    };

    const calculateTotal = () => {
        if (!bookingData) return 0;
        return calculateDuration() * (bookingData.dormitory_room?.room_cost || 0);
    };

    const handlePayment = async () => {
        if (!selectedPaymentMethod) {
            alert('Please select a payment method');
            return;
        }

        try {
            setIsProcessing(true);
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            const response = await axios.post(`${url}/payment/dormitory/process`, {
                token,
                payment_method: selectedPaymentMethod
            });

            if (response.status === 200) {
                // Redirect to payment gateway or show success
                if (response.data.redirect_url) {
                    window.location.href = response.data.redirect_url;
                } else {
                    alert('Payment initiated successfully!');
                    navigate('/');
                }
            }
        } catch (err) {
            alert(err?.response?.data?.message || 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const paymentMethods = [
        { id: 'gcash', name: 'GCash', icon: 'fas fa-mobile-alt', color: '#007DFE' },
        { id: 'paymaya', name: 'PayMaya', icon: 'fas fa-credit-card', color: '#00D632' },
        { id: 'bank_transfer', name: 'Bank Transfer', icon: 'fas fa-university', color: '#1a73e8' },
        { id: 'credit_card', name: 'Credit/Debit Card', icon: 'fas fa-credit-card', color: '#5f6368' },
    ];

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p className="text-muted">Loading payment details...</p>
                </div>
            </div>
        );
    }

    if (error || !bookingData) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
                <div className="card shadow-lg border-0" style={{ maxWidth: '500px', width: '100%' }}>
                    <div className="card-body text-center p-5">
                        <i className="fas fa-exclamation-circle text-danger mb-4" style={{ fontSize: '64px' }}></i>
                        <h4 className="mb-3">Payment Link Error</h4>
                        <p className="text-muted mb-4">{error || 'This payment link is invalid or has expired.'}</p>
                        <button className="btn btn-primary px-4" onClick={() => navigate('/')}>
                            <i className="fas fa-home mr-2"></i>Go to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '2rem 0' }}>
            <div className="container">
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                        <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                            <i className="fas fa-bed text-primary" style={{ fontSize: '36px' }}></i>
                        </div>
                    </div>
                    <h3 className="font-weight-bold mb-2" style={{ color: '#202124' }}>Dormitory Payment</h3>
                    <p className="text-muted">Complete your accommodation booking</p>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        {/* Booking Details Card */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white border-0" style={{ padding: '1.5rem' }}>
                                <h5 className="mb-0 font-weight-bold" style={{ color: '#202124' }}>
                                    <i className="fas fa-info-circle text-primary mr-2"></i>
                                    Booking Details
                                </h5>
                            </div>
                            <div className="card-body" style={{ padding: '1.5rem' }}>
                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <small className="text-muted d-block mb-1" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Room</small>
                                        <h6 className="mb-0 font-weight-bold" style={{ color: '#202124' }}>{bookingData.dormitory_room?.room_name || '—'}</h6>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <small className="text-muted d-block mb-1" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daily Rate</small>
                                        <h6 className="mb-0 font-weight-bold text-primary">₱{bookingData.dormitory_room?.room_cost?.toLocaleString() || '0'}</h6>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6 mb-3">
                                        <small className="text-muted d-block mb-1" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check-in Date</small>
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-calendar-check text-success mr-2"></i>
                                            <span className="font-weight-bold" style={{ color: '#202124' }}>{formatDate(bookingData.tenant_from_date)}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <small className="text-muted d-block mb-1" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Check-out Date</small>
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-calendar-times text-danger mr-2"></i>
                                            <span className="font-weight-bold" style={{ color: '#202124' }}>{formatDate(bookingData.tenant_to_date)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <small className="text-muted d-block mb-1" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Duration</small>
                                        <h6 className="mb-0 font-weight-bold" style={{ color: '#202124' }}>
                                            <i className="fas fa-clock text-info mr-2"></i>
                                            {calculateDuration()} {calculateDuration() === 1 ? 'day' : 'days'}
                                        </h6>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <small className="text-muted d-block mb-1" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Guest Name</small>
                                        <h6 className="mb-0 font-weight-bold" style={{ color: '#202124' }}>
                                            <i className="fas fa-user text-secondary mr-2"></i>
                                            {bookingData.user?.fname} {bookingData.user?.lname}
                                        </h6>
                                    </div>
                                </div>

                                <div className="border-top pt-3 mt-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <small className="text-muted d-block mb-1" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</small>
                                            <h3 className="mb-0 font-weight-bold text-primary">₱{calculateTotal().toLocaleString()}</h3>
                                        </div>
                                        <div className="text-right">
                                            <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                                                {calculateDuration()} {calculateDuration() === 1 ? 'day' : 'days'} × ₱{bookingData.dormitory_room?.room_cost?.toLocaleString() || '0'}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-header bg-white border-0" style={{ padding: '1.5rem' }}>
                                <h5 className="mb-0 font-weight-bold" style={{ color: '#202124' }}>
                                    <i className="fas fa-credit-card text-primary mr-2"></i>
                                    Select Payment Method
                                </h5>
                            </div>
                            <div className="card-body" style={{ padding: '1.5rem' }}>
                                <div className="row">
                                    {paymentMethods.map((method) => (
                                        <div key={method.id} className="col-md-6 mb-3">
                                            <div
                                                className={`card h-100 cursor-pointer ${selectedPaymentMethod === method.id ? 'border-primary' : 'border'}`}
                                                onClick={() => setSelectedPaymentMethod(method.id)}
                                                style={{
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s',
                                                    borderWidth: selectedPaymentMethod === method.id ? '2px' : '1px',
                                                    backgroundColor: selectedPaymentMethod === method.id ? '#f0f7ff' : 'white'
                                                }}
                                            >
                                                <div className="card-body d-flex align-items-center justify-content-between p-3">
                                                    <div className="d-flex align-items-center">
                                                        <div
                                                            className="rounded-circle d-flex align-items-center justify-content-center mr-3"
                                                            style={{
                                                                width: '48px',
                                                                height: '48px',
                                                                backgroundColor: selectedPaymentMethod === method.id ? method.color : '#f1f3f4'
                                                            }}
                                                        >
                                                            <i className={method.icon} style={{ color: selectedPaymentMethod === method.id ? 'white' : method.color, fontSize: '20px' }}></i>
                                                        </div>
                                                        <span className="font-weight-bold" style={{ color: '#202124' }}>{method.name}</span>
                                                    </div>
                                                    {selectedPaymentMethod === method.id && (
                                                        <i className="fas fa-check-circle text-primary" style={{ fontSize: '24px' }}></i>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="alert alert-info border-0 mt-4 mb-0" style={{ backgroundColor: '#e8f4fd' }}>
                                    <i className="fas fa-shield-alt text-primary mr-2"></i>
                                    <small style={{ color: '#1967d2' }}>Your payment is secured with industry-standard encryption.</small>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-4 py-2"
                                        onClick={() => navigate('/')}
                                        disabled={isProcessing}
                                        style={{ fontSize: '14px', fontWeight: '600' }}
                                    >
                                        <i className="fas fa-arrow-left mr-2"></i>
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary px-5 py-2"
                                        onClick={handlePayment}
                                        disabled={!selectedPaymentMethod || isProcessing}
                                        style={{ fontSize: '15px', fontWeight: '600', minWidth: '200px' }}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-lock mr-2"></i>
                                                Pay ₱{calculateTotal().toLocaleString()}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="text-center mt-4">
                            <small className="text-muted">
                                <i className="fas fa-lock mr-1"></i>
                                Secured by SSL encryption · Your data is protected
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DormitoryPayment;

