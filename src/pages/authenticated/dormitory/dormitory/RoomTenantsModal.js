import React from 'react';
import NMPDataTable from '../../../components/NMPDataTable/NMPDataTable';

const RoomTenantsModal = ({ show, onClose, room, tenants }) => {
    if (!show) return null;

    const calculateOverdueAmount = (tenant) => {
        if (!tenant.tenant_to_date) return { isOverdue: false, days: 0, amount: 0 };
        
        const toDate = new Date(tenant.tenant_to_date);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);
        
        if (currentDate > toDate && tenant.tenant_status === 'APPROVED') {
            const diffTime = currentDate - toDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const amount = diffDays * (room?.room_cost || 0);
            return { isOverdue: true, days: diffDays, amount };
        }
        
        return { isOverdue: false, days: 0, amount: 0 };
    };

    const conditionalRowStyles = [
        {
            when: row => calculateOverdueAmount(row).isOverdue,
            style: {
                backgroundColor: '#ffe6e6',
                color: '#d32f2f',
                fontWeight: '500',
            },
        },
    ];

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

    const tenantColumns = [
        {
            name: 'Name',
            selector: (row) => row.user?.name || `${row.user?.fname || ''} ${row.user?.lname || ''}`.trim() || '—',
            sortable: true,
        },
        {
            name: 'Email',
            selector: (row) => row.user?.email || '—',
            sortable: true,
        },
        {
            name: 'Stay Period',
            cell: (row) => (
                <div style={{ fontSize: '12px' }}>
                    <div>{formatDateAcronym(row.tenant_from_date)}</div>
                    <small className="text-muted">to</small>
                    <div>{formatDateAcronym(row.tenant_to_date)}</div>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Tenant Status',
            cell: (row) => {
                const statusColors = { APPROVED: 'success', PENDING: 'warning', TERMINATED: 'danger', CANCELLED: 'secondary' };
                const status = row.tenant_status || 'PENDING';
                return <span className={`badge badge-${statusColors[status] || 'secondary'}`}>{status}</span>;
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
                const overdue = calculateOverdueAmount(row);
                if (overdue.isOverdue) {
                    return (
                        <div className="text-danger font-weight-bold">
                            ₱{overdue.amount.toLocaleString()}
                            <small className="d-block" style={{ fontSize: '11px' }}>({overdue.days} days overdue)</small>
                        </div>
                    );
                }
                return <span className="text-muted">—</span>;
            },
            sortable: true,
        },
        {
            name: 'Total Amount',
            cell: (row) => {
                const totalPayment = calculateTotalPayment(row);
                const overdue = calculateOverdueAmount(row);
                const grandTotal = totalPayment + overdue.amount;
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
                    <div className="modal-header border-0" style={{ background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)', padding: '1.5rem 2rem' }}>
                        <div className="d-flex align-items-center">
                            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mr-3" style={{ width: '50px', height: '50px' }}>
                                <i className="fas fa-users text-primary" style={{ fontSize: '1.2rem' }}></i>
                            </div>
                            <div>
                                <h5 className="mb-1 font-weight-bold text-white">{room?.room_name || 'Room'} - Tenants</h5>
                                <p className="mb-0 text-white-50" style={{ fontSize: '13px' }}>{tenants?.length || 0} of {room?.room_slot || 0} slots occupied</p>
                            </div>
                        </div>
                        <button type="button" className="close text-white" onClick={onClose} style={{ opacity: 1 }}><span>&times;</span></button>
                    </div>

                    <div className="modal-body" style={{ padding: '2rem' }}>
                        {tenants && tenants.length > 0 ? (
                            <NMPDataTable columns={tenantColumns} data={tenants} selectableRows={false} conditionalRowStyles={conditionalRowStyles} />
                        ) : (
                            <div className="text-center py-5">
                                <i className="fas fa-user-slash text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                                <p className="text-muted mb-0" style={{ fontSize: '14px' }}>No tenants in this room</p>
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

export default RoomTenantsModal;

