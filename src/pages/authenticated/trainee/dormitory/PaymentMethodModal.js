import React from 'react';

const PaymentMethodModal = ({ show, onClose, onSelectPayment, room, checkInDate, checkOutDate }) => {
    if (!show) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const calculateDays = () => {
        if (!checkInDate || !checkOutDate) return 0;
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const diffTime = Math.abs(checkOut - checkIn);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const totalCost = () => {
        const days = calculateDays();
        return days * (room?.room_cost || 0);
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={onClose}>
            <div className="modal-dialog modal-md modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-0" style={{ background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)', padding: '1.5rem 2rem' }}>
                        <div className="d-flex align-items-center">
                            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mr-3" style={{ width: '50px', height: '50px' }}>
                                <i className="fas fa-credit-card text-primary" style={{ fontSize: '1.2rem' }}></i>
                            </div>
                            <div>
                                <h5 className="mb-1 font-weight-bold text-white">Select Payment Method</h5>
                                <p className="mb-0 text-white-50" style={{ fontSize: '13px' }}>{room?.room_name || 'Room'}</p>
                            </div>
                        </div>
                        <button type="button" className="close text-white" onClick={onClose} style={{ opacity: 1 }}><span>&times;</span></button>
                    </div>

                    <div className="modal-body" style={{ padding: '2rem' }}>
                        <div className="card border-0 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                            <div className="card-body p-3">
                                <h6 className="mb-3 font-weight-bold" style={{ fontSize: '14px' }}><i className="fas fa-info-circle mr-2 text-primary"></i>Booking Summary</h6>
                                <div className="row mb-2">
                                    <div className="col-6">
                                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>Check-in</small>
                                        <strong style={{ fontSize: '13px' }}>{formatDate(checkInDate)}</strong>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>Check-out</small>
                                        <strong style={{ fontSize: '13px' }}>{formatDate(checkOutDate)}</strong>
                                    </div>
                                </div>
                                <div className="row mb-2">
                                    <div className="col-6">
                                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>Duration</small>
                                        <strong style={{ fontSize: '13px' }}>{calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}</strong>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block" style={{ fontSize: '11px' }}>Daily Rate</small>
                                        <strong style={{ fontSize: '13px' }}>₱{room?.room_cost?.toLocaleString() || 0}</strong>
                                    </div>
                                </div>
                                <div className="border-top pt-2 mt-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted" style={{ fontSize: '11px' }}>Total Amount</small>
                                        <h5 className="mb-0 text-primary font-weight-bold">₱{totalCost().toLocaleString()}</h5>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="alert alert-info border-0 mb-4" style={{ backgroundColor: '#e7f3ff' }}>
                            <i className="fas fa-payment mr-2 text-primary"></i>
                            <small style={{ fontSize: '13px', color: '#0078d4' }}>Choose how you would like to pay for your dormitory accommodation</small>
                        </div>

                        <div className="row">
                            <div className="col-12 mb-3">
                                <button className="btn btn-outline-primary btn-block py-3" onClick={() => onSelectPayment('online')} style={{ borderWidth: '2px', transition: 'all 0.3s' }}>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-globe mr-3" style={{ fontSize: '24px' }}></i>
                                            <div className="text-left">
                                                <strong className="d-block" style={{ fontSize: '15px' }}>Online Payment</strong>
                                                <small className="text-muted">Pay via payment link sent to your email</small>
                                            </div>
                                        </div>
                                        <i className="fas fa-chevron-right"></i>
                                    </div>
                                </button>
                            </div>

                            <div className="col-12 mb-3">
                                <button className="btn btn-outline-success btn-block py-3" onClick={() => onSelectPayment('onhand')} style={{ borderWidth: '2px', transition: 'all 0.3s' }}>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-hand-holding-usd mr-3" style={{ fontSize: '24px' }}></i>
                                            <div className="text-left">
                                                <strong className="d-block" style={{ fontSize: '15px' }}>On-hand Payment</strong>
                                                <small className="text-muted">Pay in person at the office</small>
                                            </div>
                                        </div>
                                        <i className="fas fa-chevron-right"></i>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer border-0" style={{ backgroundColor: '#fafafa', padding: '1rem 2rem' }}>
                        <button type="button" className="btn btn-secondary px-4 py-2" onClick={onClose} style={{ fontSize: '13px', fontWeight: '600' }}>
                            <i className="fas fa-times mr-2"></i>Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodModal;

