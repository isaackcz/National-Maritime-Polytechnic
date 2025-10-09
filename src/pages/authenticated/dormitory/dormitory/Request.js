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

            const response = await axios.get(`${url}/dormitory-admin/requests`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            setRequests(response?.data?.requests || []);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveAndSendPaymentLink = async (requestId) => {
        if (!window.confirm('Approve this request and send payment link to user\'s email?')) return;

        try {
            const token = getToken('csrf-token');

            const response = await axios.post(`${url}/dormitory-admin/requests/${requestId}/approve`, {}, {
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

    const handleConfirmPayment = async (requestId) => {
        if (!window.confirm('Confirm that online payment has been received?')) return;

        try {
            const token = getToken('csrf-token');

            const response = await axios.post(`${url}/dormitory-admin/requests/${requestId}/confirm-payment`, {}, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });

            if (response.status === 200) {
                alert(response?.data?.message || 'Payment confirmed successfully. Trainee is now booked.');
                await fetchRequests();
            }
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to confirm payment');
        }
    };

    const handleReject = async (requestId) => {
        if (!window.confirm('Reject this request? This action cannot be undone.')) return;
        try {
            const token = getToken('csrf-token');

            const response = await axios.post(`${url}/dormitory-admin/requests/${requestId}/reject`, {}, {
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

    const requestColumns = [
        {
            name: 'Trainee Name',
            selector: (row) => `${row.user?.fname || ''} ${row.user?.lname || ''}`.trim() || '—',
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
            name: 'Room',
            selector: (row) => row.dormitory_room?.room_name || '—',
            sortable: true,
        },
        {
            name: 'Daily Rate',
            cell: (row) => <span className="text-primary font-weight-bold">₱{row.dormitory_room?.room_cost?.toLocaleString() || '0'}</span>,
            sortable: true,
        },
        {
            name: 'Status',
            cell: (row) => {
                const statusColors = { 
                    PENDING: 'warning', 
                    APPROVED: 'success', 
                    EXTENDING: 'info',
                    TERMINATED: 'danger', 
                    CANCELLED: 'secondary' 
                };
                const statusText = {
                    PENDING: 'Awaiting Approval',
                    APPROVED: 'Payment Link Sent',
                    EXTENDING: 'Extension Pending',
                    TERMINATED: 'Terminated',
                    CANCELLED: 'Cancelled'
                };
                return <span className={`badge badge-${statusColors[row.tenant_status] || 'secondary'}`}>{statusText[row.tenant_status] || row.tenant_status}</span>;
            },
            sortable: true,
        },
        {
            name: 'Action',
            cell: (row) => {
                if (row.tenant_status === 'PENDING' || row.tenant_status === 'EXTENDING') {
                    return (
                        <div className="btn-group btn-group-sm">
                            <button 
                                type="button" 
                                className="btn btn-success" 
                                title="Approve & Send Payment Link" 
                                onClick={() => handleApproveAndSendPaymentLink(row.id)}
                            >
                                <i className="fas fa-check mr-1"></i>Approve
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
                } else if (row.tenant_status === 'APPROVED') {
                    return (
                        <div className="btn-group btn-group-sm">
                            <button 
                                type="button" 
                                className="btn btn-primary" 
                                title="Confirm Payment Received" 
                                onClick={() => handleConfirmPayment(row.id)}
                            >
                                <i className="fas fa-check-circle mr-1"></i>Confirm Payment
                            </button>
                        </div>
                    );
                } else {
                    return <span className="text-muted">—</span>;
                }
            },
            ignoreRowClick: true,
            button: true,
            minWidth: '180px',
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
                            <strong style={{ color: "black" }}>Dormitory Requests - Online Payment Only</strong>
                            <p className="mb-0" style={{ fontSize: '13px', color: "black" }}>
                                <strong>Workflow:</strong> Approve request → Payment link sent to email → Confirm payment → Trainee booked
                            </p>
                        </div>

                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                    <i className="fas fa-list mr-2 text-primary"></i>
                                    Pending Requests
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

