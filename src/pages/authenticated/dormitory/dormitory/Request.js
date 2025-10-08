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

    const handleSendPaymentLink = async (requestId) => {
        if (!window.confirm('Send payment link to user\'s email?')) return;

        try {
            const token = getToken('csrf-token');

            const response = await axios.post(`${url}/dormitory-admin/requests/${requestId}/send-payment-link`, {}, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });

            if (response.status === 200) {
                alert(response?.data?.message || 'Payment link sent successfully');
                await fetchRequests();
            }
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to send payment link');
        }
    };

    const handleSendCounterNotification = async (requestId) => {
        if (!window.confirm('Send email notification for counter payment?')) return;

        try {
            const token = getToken('csrf-token');

            const response = await axios.post(`${url}/dormitory-admin/requests/${requestId}/send-counter-notification`, {}, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });

            if (response.status === 200) {
                alert(response?.data?.message || 'Counter payment notification sent successfully');
                await fetchRequests();
            }
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to send notification');
        }
    };

    const handleConfirmOnhandPayment = async (requestId) => {
        if (!window.confirm('Confirm that on-hand payment has been received?')) return;

        try {
            const token = getToken('csrf-token');

            const response = await axios.post(`${url}/dormitory-admin/requests/${requestId}/confirm-onhand-payment`, {}, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });

            if (response.status === 200) {
                alert(response?.data?.message || 'Payment confirmed successfully');
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
                    <div>{formatDateAcronym(row.check_in_date)}</div>
                    <small className="text-muted">to</small>
                    <div>{formatDateAcronym(row.check_out_date)}</div>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Room',
            selector: (row) => row.room?.room_name || '—',
            sortable: true,
        },
        {
            name: 'Room Status',
            cell: (row) => {
                const isAvailable = row.room?.room_status === 'AVAILABLE';
                return <span className={`badge badge-${isAvailable ? 'success' : 'danger'}`}>{row.room?.room_status || '—'}</span>;
            },
            sortable: true,
        },
        {
            name: 'Available Slots',
            selector: (row) => row.room ? `${row.room.tenants_count || 0}/${row.room.room_slot || 0}` : '—',
            sortable: true,
        },
        {
            name: 'Payment Method',
            cell: (row) => <span className={`badge badge-${row.payment_method === 'online' ? 'primary' : 'success'}`}>{row.payment_method === 'online' ? 'Online' : 'On-hand'}</span>,
            sortable: true,
        },
        {
            name: 'Request Status',
            cell: (row) => {
                const statusColors = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger', PROCESSING: 'info' };
                return <span className={`badge badge-${statusColors[row.status] || 'secondary'}`}>{row.status}</span>;
            },
            sortable: true,
        },
        {
            name: 'Action',
            cell: (row) => {
                if (row.status === 'PENDING') {
                    if (row.payment_method === 'online') {
                        return (
                            <div className="btn-group btn-group-sm">
                                <button type="button" className="btn btn-primary" title="Send Payment Link" onClick={() => handleSendPaymentLink(row.id)}><i className="fas fa-link"></i></button>
                                <button type="button" className="btn btn-danger" title="Reject" onClick={() => handleReject(row.id)}><i className="fas fa-times"></i></button>
                            </div>
                        );
                    } else {
                        return (
                            <div className="btn-group btn-group-sm">
                                <button type="button" className="btn btn-info" title="Send Counter Payment Email" onClick={() => handleSendCounterNotification(row.id)}><i className="fas fa-envelope"></i></button>
                                <button type="button" className="btn btn-success" title="Confirm Payment Received" onClick={() => handleConfirmOnhandPayment(row.id)}><i className="fas fa-check"></i></button>
                                <button type="button" className="btn btn-danger" title="Reject" onClick={() => handleReject(row.id)}><i className="fas fa-times"></i></button>
                            </div>
                        );
                    }
                } else if (row.status === 'PROCESSING' && row.payment_method === 'onhand') {
                    return (
                        <div className="btn-group btn-group-sm">
                            <button type="button" className="btn btn-success" title="Confirm Payment Received" onClick={() => handleConfirmOnhandPayment(row.id)}><i className="fas fa-check"></i></button>
                        </div>
                    );
                } else {
                    return <span className="text-muted">—</span>;
                }
            },
            ignoreRowClick: true,
            button: true,
            minWidth: '150px',
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
                            <strong style={{ color: "black" }}>Dormitory Requests</strong>
                            <p className="mb-0" style={{ fontSize: '13px', color: "black" }}>Review and manage trainee accommodation requests</p>
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

