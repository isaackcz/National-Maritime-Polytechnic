import React, { useEffect, useState } from 'react';
import PageName from '../../../components/PageName';
import NMPDataTable from '../../../components/NMPDataTable/NMPDataTable';
import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';
import NoDataFound from '../../../components/NoDataFound';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import useGetToken from '../../../../hooks/useGetToken';
import axios from 'axios';

const Request = () => {
    const { url } = useSystemURLCon();
    const { getToken } = useGetToken();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);

    const formatDateAcronym = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const token = getToken('csrf-token');

            const roomsResponse = await axios.get(`${url}/admin/dormitory/get`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            const rooms = roomsResponse?.data?.dormitories || [];

            const allRequests = [];
            for (const room of rooms) {
                try {
                    const tenantsResponse = await axios.get(`${url}/admin/dormitory/get/tenants/${room.id}`, {
                        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
                    });
                    const tenants = tenantsResponse?.data?.tenants || [];
                    
                    // Filter using existing tenant_status enum (PENDING, EXTENDING, APPROVED)
                    const tenantsWithRoom = tenants
                        .filter(t => ['PENDING', 'EXTENDING', 'APPROVED', 'PROCESSING', 'PAID'].includes(t.tenant_status))
                        .map(t => ({
                            ...t,
                            dormitory_room: room
                        }));
                    allRequests.push(...tenantsWithRoom);
                    console.log(`Fetched ${tenantsWithRoom.length} tenants for room ${room.id}`);
                } catch (err) {
                    console.error(`Failed to fetch tenants for room ${room.id}:`, err);
                }
            }
            setRequests(allRequests);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };


    const handleReject = async (requestId) => {
        if (!window.confirm('Are you sure you want to reject this request? This action cannot be undone.')) return;
        try {
            const token = getToken('csrf-token');

            const response = await axios.post(`${url}/admin/dormitory/update_status_dormitory`, {
                'document_id': requestId,
                'status': 'CANCELLED',
            }, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });

            if (response.status === 200) {
                alert(response?.data?.message || 'Request rejected successfully');
                await fetchRequests();
            }
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to reject request');
        }
    };
    const handleFinalApprove = async (requestId) => {
        if (!window.confirm('Are you sure you want to finalize this booking? The tenant will be officially booked after this action.')) return;
        try {
            const token = getToken('csrf-token');

            const response = await axios.post(`${url}/admin/dormitory/update_status_dormitory`, {
                'document_id': requestId,
                'status': 'APPROVED',
            }, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });

            if (response.status === 200) {
                alert(response?.data?.message || 'Tenant successfully booked!');
                await fetchRequests();
            }
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to finalize booking');
        }
    };
    const handleConfirmPayment = async (requestId) => {
        if (!window.confirm('Have you verified the payment receipt? Confirm that payment has been received and is valid.')) return;

        try {
            const token = getToken('csrf-token');

            const response = await axios.post(`${url}/admin/dormitory/update_status_dormitory`, {
                'document_id': requestId,
                'status': 'PAID',
            },{
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });

            if (response.status === 200) {
                alert(response?.data?.message || 'Payment confirmed successfully. Ready for final approval.');
                await fetchRequests();
            }
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to confirm payment');
        } 
    };
    const handleApproveAndSendPaymentLink = async (requestId) => {
        if (!window.confirm('Approve this request and send payment link to the tenant\'s email? This will move the request to processing status.')) return;

        try {
            const token = getToken('csrf-token');

            const response = await axios.post(`${url}/admin/dormitory/update_status_dormitory`, {
                'document_id': requestId,
                'status': 'PROCESSING',
            }, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            if (response.status === 200) {
                alert(response?.data?.message || 'Request approved and payment link sent successfully');
                await fetchRequests();
            }
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to approve request');
        }
    };
const requestColumns = [
    {
        name: 'Trainee Name',
        selector: (row) => `${row.tenant?.fname || ''} ${row.tenant?.lname || ''}`.trim() || '—',
        sortable: true,
        style: { 
            fontSize: '14px'
        
        }, 
    },
    {
        name: 'Stay Period',
        cell: (row) => (
            <div style={{ fontSize: '14px', fontWeight: '500', textAlign: 'center' }}> {/* Fixed fontWeight value */}
                <div>{formatDateAcronym(row.tenant_from_date)}</div>
                <span className="text-muted">to</span>
                <div>{formatDateAcronym(row.tenant_to_date)}</div>
            </div>
        ),
        sortable: true,
    },
    {
        name: 'Room',
        selector: (row) => row.dormitory_room?.room_name || '—',
        sortable: true,
        style: { fontSize: '14px' }, // Added font size
    },
    {
        name: 'Slot',
        selector: (row) => `${row.dormitory_room?.tenants_count || 0}/${row.dormitory_room?.room_slot || 0}` || '—',
        sortable: true,
        style: { fontSize: '14px' }, // Added font size
    },
    {
        name: 'Daily Rate',
        cell: (row) => <span style={{ fontSize: '14px' }} className="text-primary font-weight-bold">₱{row.dormitory_room?.room_cost?.toLocaleString() || '0'}</span>, // Added inline style
        sortable: true,
    },
    {
        name: 'Request Status',
        cell: (row) => {
            const statusColors = { 
                PENDING: 'warning', 
                PROCESSING: 'info',
                PAID: 'success', 
                APPROVED: 'primary',
                TERMINATED: 'danger', 
                CANCELLED: 'secondary',
                EXTENDING: 'warning'
            };
            const statusText = {
                PENDING: 'Awaiting Review',
                PROCESSING: 'Payment Link Sent',
                PAID: 'Payment Received',
                APPROVED: 'Booked',
                TERMINATED: 'Terminated',
                CANCELLED: 'Cancelled',
                EXTENDING: 'Extension Request'
            };
            const currentStatus = row.tenant_status || row.invoice_status;
            return (
                <span 
                    style={{fontSize: '14px', textAlign: 'center'}} 
                    className={`badge badge-${statusColors[currentStatus] || 'secondary'}`}
                >
                    {statusText[currentStatus] || currentStatus}
                </span>
            );
        },
        sortable: true,
    },
    {
        name: 'Action',
        cell: (row) => {
            const currentStatus = row.tenant_status || row.invoice_status;
            
            if (currentStatus === 'PENDING' || currentStatus === 'EXTENDING') {
                return (
                    <div className="btn-group btn-group-sm" style={{ fontSize: '12px' }}>
                        <button 
                            type="button" 
                            className="btn btn-success" 
                            title="Approve request and send payment link" 
                            onClick={() => handleApproveAndSendPaymentLink(row.id)}
                        >
                            <i className="fas fa-check mr-1"></i>Approve & Send Payment Link
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-danger" 
                            title="Reject Request" 
                            onClick={() => handleReject(row.id)}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                );
            } else if (currentStatus === 'PROCESSING') {
                return (
                    <div className="btn-group btn-group-sm" style={{ fontSize: '12px' }}>
                        <button 
                            type="button" 
                            className="btn btn-primary" 
                            title="Confirm payment received" 
                            onClick={() => handleConfirmPayment(row.id)}
                        >
                            <i className="fas fa-credit-card mr-1"></i>Confirm Payment
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-danger" 
                            title="Reject Request" 
                            onClick={() => handleReject(row.id)}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                );
            } else if (currentStatus === 'PAID') {
                return (
                    <div className="btn-group btn-group-sm" style={{ fontSize: '12px' }}>
                        <button 
                            type="button" 
                            className="btn btn-success" 
                            title="Final approval - Book the tenant" 
                            onClick={() => handleFinalApprove(row.id)}
                        >
                            <i className="fas fa-check-circle mr-1"></i>Final Approve & Book
                        </button>
                    </div>
                );
            } else if (currentStatus === 'APPROVED') {
                return (
                    <span className="badge badge-primary" style={{ fontSize: '12px' }}>
                        <i className="fas fa-check-circle mr-1"></i>Booked
                    </span>
                );
            } else if (currentStatus === 'CANCELLED') {
                return (
                    <span className="badge badge-secondary" style={{ fontSize: '12px' }}>
                        <i className="fas fa-times-circle mr-1"></i>Cancelled
                    </span>
                );
            } else {
                return <span className="text-muted" style={{ fontSize: '14px' }}>—</span>;
            }
        },
        ignoreRowClick: true,
        button: true,
        minWidth: '200px',
    },
];

    return (
        <>
            <PageName pageName={[{ name: 'Admin', last: false, address: '/dormitory/dashboard' }, { name: 'Requests', last: true, address: '/dormitory/requests' }]} />

            <section className="content">
                <div className="container-fluid">
                    <div className="col-xl-12">
                        <div className="alert alert-info border-0 shadow-sm mb-4" style={{ backgroundColor: '#e7f3ff', borderLeft: '4px solid #0078d4' }}>
                            <span className="fas fa-inbox text-primary mr-3" style={{ fontSize: '24px' }}></span>
                            <strong style={{ color: "black" }}>Dormitory Request Management</strong>
                            <p className="mb-0" style={{ fontSize: '13px', color: "black" }}>
                                <strong>Workflow:</strong> Review Request → Approve & Send Payment Link → Verify Payment → Final Approve & Book Tenant
                            </p>
                            <small className="text-muted">
                                <strong>Status Flow:</strong> PENDING → PROCESSING → PAID → APPROVED (Booked)
                            </small>
                        </div>

                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                    <i className="fas fa-list mr-2 text-primary"></i>
                                    Pending & Processing Requests
                                </h6>
                            </div>
                            <div className="card-body p-3">
                                {loading ? <SkeletonLoader /> : requests.length > 0 ? <NMPDataTable columns={requestColumns} data={requests} selectableRows={false} /> : <NoDataFound />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Request;

