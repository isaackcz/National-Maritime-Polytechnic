import React from 'react';
import NMPDataTable from '../../../components/NMPDataTable/NMPDataTable';

const OverdueTenantsModal = ({ show, onClose, room, overdueTenants }) => {
    if (!show) return null;

    const calculateOverdueDetails = (tenant) => {
        if (!tenant.tenant_to_date) return { days: 0, amount: 0 };
        
        const toDate = new Date(tenant.tenant_to_date);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        
        if (currentDate > toDate) {
            const diffTime = currentDate - toDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const amount = diffDays * (room?.room_cost || 0);
            return { days: diffDays, amount };
        }
        
        return { days: 0, amount: 0 };
    };

    const calculateTotalOverdue = () => {
        return overdueTenants.reduce((total, tenant) => {
            const { amount } = calculateOverdueDetails(tenant);
            return total + amount;
        }, 0);
    };

    const calculateGrandTotal = () => {
        return overdueTenants.reduce((total, tenant) => {
            const totalPayment = calculateTotalPayment(tenant);
            const { amount } = calculateOverdueDetails(tenant);
            return total + totalPayment + amount;
        }, 0);
    };

    const formatDateAcronym = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    const calculateTotalPayment = (row) => {
        if (!row.tenant_from_date || !row.tenant_to_date) return 0;
        const fromDate = new Date(row.tenant_from_date);
        const toDate = new Date(row.tenant_to_date);
        const diffTime = Math.abs(toDate - fromDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays * (room?.room_cost || 0);
    };

    const overdueColumns = [
        {
            name: 'Name',
            selector: (row) => row.tenant?.name || `${row.tenant?.fname || ''} ${row.tenant?.lname || ''}`.trim() || '—',
            sortable: true,
        },
        {
            name: 'Email',
            selector: (row) => row.tenant?.email || '—',
            sortable: true,
        },
        {
            name: 'Stay Period',
            cell: (row) => (
                <div style={{ fontSize: '12px' }}>
                    <div>{formatDateAcronym(row.tenant_from_date)}</div>
                    <small className="text-muted">to</small>
                    <div className="text-danger font-weight-bold">{formatDateAcronym(row.tenant_to_date)}</div>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Days Overdue',
            cell: (row) => {
                const { days } = calculateOverdueDetails(row);
                return <span className="badge badge-danger">{days} days</span>;
            },
            sortable: true,
            maxWidth: '120px',
        },
        {
            name: 'Invoice Status',
            cell: (row) => {
                const statusColors = { PAID: 'success', PENDING: 'warning', CANCELLED: 'secondary', TERMINATED: 'danger' };
                // Backend relationship is 'tenant_invoices' (plural, hasMany)
                // Access first invoice from array
                const status = row.tenant_invoices?.[0]?.invoice_status || 'PENDING';
                return <span className={`badge badge-${statusColors[status] || 'warning'}`}>{status}</span>;
            },
            sortable: true,
            maxWidth: '120px',
        },
        {
            name: 'Total Payment',
            cell: (row) => {
                const totalAmount = calculateTotalPayment(row);
                return (
                    <div className="font-weight-bold">
                        ₱{totalAmount.toLocaleString()}
                        <small className="d-block text-muted" style={{ fontSize: '11px' }}>for stay period</small>
                    </div>
                );
            },
            sortable: true,
        },
        {
            name: 'Due Amount',
            cell: (row) => {
                const { amount } = calculateOverdueDetails(row);
                return (
                    <div className="text-danger font-weight-bold">
                        ₱{amount.toLocaleString()}
                        <small className="d-block" style={{ fontSize: '11px' }}>overdue penalty</small>
                    </div>
                );
            },
            sortable: true,
        },
        {
            name: 'Total Amount',
            cell: (row) => {
                const totalPayment = calculateTotalPayment(row);
                const { amount } = calculateOverdueDetails(row);
                const grandTotal = totalPayment + amount;
                return (
                    <div className="font-weight-bold text-primary" style={{ fontSize: '14px' }}>
                        ₱{grandTotal.toLocaleString()}
                        <small className="d-block text-muted" style={{ fontSize: '11px' }}>total owed</small>
                    </div>
                );
            },
            sortable: true,
        },
    ];

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={onClose}>
            <div className="modal-dialog modal-xl modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-0" style={{ background: 'linear-gradient(135deg, #dc3545 0%,#c82333 100%)', padding: '1.5rem 2rem' }}>
                        <div className="d-flex align-items-center">
                            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mr-3" style={{ width: '50px', height: '50px' }}>
                                <i className="fas fa-exclamation-triangle text-danger" style={{ fontSize: '1.2rem' }}></i>
                            </div>
                            <div>
                                <h5 className="mb-1 font-weight-bold text-white">{room?.room_name || 'Room'} - Overdue Tenants</h5>
                                <p className="mb-0 text-white-50" style={{ fontSize: '13px' }}>{overdueTenants?.length || 0} tenant(s) exceeded check-out date</p>
                            </div>
                        </div>
                        <button type="button" className="close text-white" onClick={onClose} style={{ opacity: 1 }}><span>&times;</span></button>
                    </div>

                    <div className="modal-body" style={{ padding: '2rem' }}>
                        {overdueTenants && overdueTenants.length > 0 ? (
                            <>
                                <div className="alert alert-danger border-0 mb-3" style={{ backgroundColor: '#ffe6e6' }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <i className="fas fa-info-circle mr-2" style={{ color: "#c82333" }}></i>
                                            <strong style={{ color: "#c82333" }}>Total Amount Due:</strong>
                                        </div>
                                        <h4 className="mb-0 font-weight-bold text-danger">₱{calculateGrandTotal().toLocaleString()}</h4>
                                    </div>
                                    <small className="d-block mt-2" style={{ fontSize: '12px', color: "#c82333" }}>
                                        Includes stay period payment + overdue penalty (₱{room?.room_cost?.toLocaleString() || 0}/day)
                                    </small>
                                </div>
                                <NMPDataTable columns={overdueColumns} data={overdueTenants} selectableRows={false} />
                            </>
                        ) : (
                            <div className="text-center py-5">
                                <i className="fas fa-check-circle text-success mb-3" style={{ fontSize: '3rem' }}></i>
                                <p className="text-muted mb-0" style={{ fontSize: '14px' }}>No overdue tenants</p>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer border-0" style={{ backgroundColor: '#fafafa', padding: '1rem 2rem' }}>
                        <button type="button" className="btn btn-secondary px-4 py-2" onClick={onClose} style={{ fontSize: '13px', fontWeight: '600' }}>
                            <i className="fas fa-times mr-2"></i>Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverdueTenantsModal;
