import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const bookingData = location.state?.bookingData;

    useEffect(() => {
        // Add animation on mount
        const successIcon = document.querySelector('.success-checkmark');
        if (successIcon) {
            setTimeout(() => {
                successIcon.classList.add('show');
            }, 100);
        }
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '3rem 0' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="card shadow-lg border-0">
                            <div className="card-body text-center p-5">
                                {/* Success Animation */}
                                <div className="success-checkmark mb-4">
                                    <div className="check-icon">
                                        <span className="icon-line line-tip"></span>
                                        <span className="icon-line line-long"></span>
                                        <div className="icon-circle"></div>
                                        <div className="icon-fix"></div>
                                    </div>
                                </div>

                                <h2 className="font-weight-bold mb-3" style={{ color: '#34a853' }}>Payment Successful!</h2>
                                <p className="text-muted mb-4" style={{ fontSize: '15px' }}>
                                    Your dormitory booking has been confirmed. A confirmation email has been sent to your registered email address.
                                </p>

                                {bookingData && (
                                    <div className="card bg-light border-0 mb-4">
                                        <div className="card-body p-4">
                                            <h6 className="font-weight-bold mb-3" style={{ color: '#202124' }}>Booking Summary</h6>
                                            <div className="row text-left">
                                                <div className="col-6 mb-2">
                                                    <small className="text-muted d-block" style={{ fontSize: '12px' }}>Room</small>
                                                    <strong>{bookingData.room_name}</strong>
                                                </div>
                                                <div className="col-6 mb-2">
                                                    <small className="text-muted d-block" style={{ fontSize: '12px' }}>Check-in</small>
                                                    <strong>{formatDate(bookingData.check_in)}</strong>
                                                </div>
                                                <div className="col-6 mb-2">
                                                    <small className="text-muted d-block" style={{ fontSize: '12px' }}>Check-out</small>
                                                    <strong>{formatDate(bookingData.check_out)}</strong>
                                                </div>
                                                <div className="col-6 mb-2">
                                                    <small className="text-muted d-block" style={{ fontSize: '12px' }}>Amount Paid</small>
                                                    <strong className="text-primary">₱{bookingData.amount?.toLocaleString()}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="alert alert-info border-0 mb-4" style={{ backgroundColor: '#e8f4fd' }}>
                                    <i className="fas fa-info-circle text-primary mr-2"></i>
                                    <small style={{ color: '#1967d2' }}>
                                        Please save this confirmation. You will need it upon check-in.
                                    </small>
                                </div>

                                <div className="d-flex justify-content-center gap-3">
                                    <button
                                        className="btn btn-outline-primary px-4 py-2 mr-2"
                                        onClick={() => window.print()}
                                        style={{ fontSize: '14px', fontWeight: '600' }}
                                    >
                                        <i className="fas fa-print mr-2"></i>
                                        Print Receipt
                                    </button>
                                    <button
                                        className="btn btn-primary px-5 py-2"
                                        onClick={() => navigate('/login')}
                                        style={{ fontSize: '14px', fontWeight: '600' }}
                                    >
                                        <i className="fas fa-home mr-2"></i>
                                        Go to Login
                                    </button>
                                </div>

                                <div className="mt-4">
                                    <small className="text-muted">
                                        Need help? Contact us at <a href="mailto:support@example.com">support@example.com</a>
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;

