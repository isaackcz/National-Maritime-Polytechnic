import { useEffect, useState } from 'react';
import { TextField, Button, CircularProgress, Chip, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PageName from '../../../components/PageName';
import NMPDataTable from '../../../components/NMPDataTable/NMPDataTable';
import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';
import NoDataFound from '../../../components/NoDataFound';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import useGetToken from '../../../../hooks/useGetToken';
import axios from 'axios';
import dayjs from 'dayjs';
import { PieChart } from '@mui/x-charts/PieChart';

const AdminDormitoryInvoices = () => {
    const { url } = useSystemURLCon();
    const { getToken } = useGetToken();
    const [isFetchingInvoices, setIsFetchingInvoices] = useState(true);
    const [dormitories, setDormitories] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dormitoryFilter, setDormitoryFilter] = useState('all');
    const [tenantFilter, setTenantFilter] = useState('all');
    const [receiptDialog, setReceiptDialog] = useState({ open: false, receipt: '' });
    const [tenants, setTenants] = useState([]);
    const [detailDialog, setDetailDialog] = useState({ open: false, invoice: null });

    // Fetch all dormitories with tenant counts
    const fetchDormitories = async () => {
        try {
            const token = getToken('csrf-token');
            const response = await axios.get(`${url}/admin/dormitory/get`, {
                headers: { 
                    Authorization: `Bearer ${token}`, 
                    Accept: 'application/json', 
                    'Content-Type': 'application/json' 
                }
            });
            console.log("rooms ",response);
            const data = response?.data?.dormitories || [];
            setDormitories(Array.isArray(data) ? data : []);
            return data;
        } catch (error) {
            // console.log('Failed to fetch dormitories:', error.response);
            setDormitories([]);
            return [];
        }
    };

    // Fetch tenants for a specific dormitory room
    const fetchTenantsForRoom = async (roomId) => {
        try {
            const token = getToken('csrf-token');
            const response = await axios.get(`${url}/admin/dormitory/get/tenants/${roomId}`, {
                headers: { 
                    Authorization: `Bearer ${token}`, 
                    Accept: 'application/json', 
                    'Content-Type': 'application/json' 
                }
            });
            console.log("tenants: ", response)
            return response?.data?.tenants || [];
        } catch (error) {
            // console.log('Failed to fetch tenants for room:', error.response);
            return [];
        }
    };

    // Fetch all tenants across all rooms
    const fetchAllTenants = async (dormitoriesList) => {
        const allTenants = [];
        for (const dorm of dormitoriesList) {
            const roomTenants = await fetchTenantsForRoom(dorm.id);
            const enhancedTenants = roomTenants.map(tenant => ({
                ...tenant,
                dormitory_room: dorm
            }));
            allTenants.push(...enhancedTenants);
        }
        setTenants(allTenants);
        return allTenants;
    };

    // Fetch invoices for a specific tenant
    const fetchTenantInvoices = async (tenantId) => {
        try {
            const token = getToken('csrf-token');
            const response = await axios.get(`${url}/admin/dormitory/get/tenants/invoice/${tenantId}`, {
                headers: { 
                    Authorization: `Bearer ${token}`, 
                    Accept: 'application/json', 
                    'Content-Type': 'application/json' 
                }
            });
            console.log("invoicesssss:  ", response);
            return response?.data?.tenant_invoices || [];
        } catch (error) {
            // console.log('invoices:', error.response);
            return [];
        }
    };

    // Comprehensive invoice fetching that gathers all available data
    const fetchAllInvoicesData = async (isInitialLoad) => {
        try {
            setIsFetchingInvoices(isInitialLoad);
            
            // First, fetch all dormitories
            const dormitoriesList = await fetchDormitories();
            
            // Then fetch all tenants
            const allTenants = await fetchAllTenants(dormitoriesList);
            
            const allInvoices = [];
            
            // For each tenant, fetch their invoices
            for (const tenant of allTenants) {
                const tenantInvoices = await fetchTenantInvoices(tenant.id);
                
                // Enhance invoice data with dormitory, tenant, and user information
                const enhancedInvoices = tenantInvoices.map(invoice => {
                    // Get user details from tenant relationship
                    const user = tenant.tenant || {};
                    const fullName = `${user.fname || ''} ${user.lname || ''} ${user.suffix || ''}`.trim().replace(/\s+/g, ' ');
                    
                    return {
                        // Invoice data
                        id: invoice.id,
                        dormitory_tenant_id: invoice.dormitory_tenant_id,
                        dormitory_room_id: invoice.dormitory_room_id,
                        invoice_status: invoice.invoice_status,
                        invoice_receipt: invoice.invoice_receipt,
                        invoice_date: invoice.invoice_date,
                        created_at: invoice.created_at,
                        updated_at: invoice.updated_at,
                        
                        // Tenant 
                        tenant_id: tenant.id,
                        tenant_from_date: tenant.tenant_from_date,
                        tenant_to_date: tenant.tenant_to_date,
                        tenant_status: tenant.tenant_status,
                        
                        // User/tenant data
                        user_id: user.id,
                        user_fname: user.fname,
                        user_lname: user.lname,
                        user_mname: user.mname,
                        user_suffix: user.suffix,
                        user_email: user.email,
                        user_birthdate: user.birthdate,
                        user_role: user.role,
                        user_profile_picture: user.profile_picture,
                        full_name: fullName,
                        
                        // Dormitory room data
                        dormitory_id: tenant.dormitory_room?.id,
                        room_name: tenant.dormitory_room?.room_name,
                        room_description: tenant.dormitory_room?.room_description,
                        room_cost: tenant.dormitory_room?.room_cost,
                        room_slot: tenant.dormitory_room?.room_slot,
                        room_status: tenant.dormitory_room?.room_status,
                        
                        // Calculated fields
                        is_active_tenant: tenant.tenant_status === 'APPROVED',
                        is_pending_tenant: tenant.tenant_status === 'PENDING',
                        is_terminated_tenant: tenant.tenant_status === 'TERMINATED',
                        booking_duration: tenant.tenant_from_date && tenant.tenant_to_date ? 
                            Math.ceil((new Date(tenant.tenant_to_date) - new Date(tenant.tenant_from_date)) / (1000 * 60 * 60 * 24)) : 0
                    };
                });
                
                allInvoices.push(...enhancedInvoices);
            }
            
            setInvoices(allInvoices);
            setFilteredInvoices(allInvoices);
            console.log("allInvoices: ", allInvoices);
        } catch (error) {
            console.log('Failed to fetch comprehensive invoice data:', error);
            setInvoices([]);
            setFilteredInvoices([]);
        } finally {
            setIsFetchingInvoices(false);
        }
    };

    useEffect(() => {
        fetchAllInvoicesData(true);
    }, []);

    // Filter invoices based on search term, status, dormitory, and tenant
    useEffect(() => {
        let filtered = invoices;

        // Filter by search term (user name, room name, email, invoice ID)
        if (searchTerm) {
            filtered = filtered.filter(invoice => 
                invoice.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.room_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.id?.toString().includes(searchTerm) ||
                invoice.dormitory_id?.toString().includes(searchTerm)
            );
        }

        // Filter by invoice status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(invoice => invoice.invoice_status === statusFilter);
        }

        // Filter by dormitory
        if (dormitoryFilter !== 'all') {
            filtered = filtered.filter(invoice => invoice.dormitory_id.toString() === dormitoryFilter);
        }

        // Filter by tenant status
        if (tenantFilter !== 'all') {
            filtered = filtered.filter(invoice => invoice.tenant_status === tenantFilter);
        }

        setFilteredInvoices(filtered);
    }, [searchTerm, statusFilter, dormitoryFilter, tenantFilter, invoices]);

    const handleViewReceipt = (invoice) => {
        setReceiptDialog({
            open: true,
            receipt: invoice.invoice_receipt
        });
    };

    const handleCloseReceiptDialog = () => {
        setReceiptDialog({ open: false, receipt: '' });
    };

    const handleViewDetails = (invoice) => {
        setDetailDialog({
            open: true,
            invoice: invoice
        });
    };

    const handleCloseDetailDialog = () => {
        setDetailDialog({ open: false, invoice: null });
    };

    const handleApprovePayment = async (invoice) => {
        if (!window.confirm(`Approve payment for ${invoice.full_name}? This will mark the invoice as PAID.`)) return;

        try {
            const token = getToken('csrf-token');

            await axios.post(`${url}/dormitory-admin/invoices/update/${invoice.id}`, 
                { invoice_status: 'PAID' },
                { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
            );

            await fetchAllInvoicesData(false);
            alert('Payment approved successfully!');
            
        } catch (error) {
            console.error('Failed to approve payment:', error);
            alert(error?.response?.data?.message || 'Failed to approve payment');
        }
    };

    const handleUpdateInvoiceStatus = async (invoice, newStatus) => {
        try {
            const token = getToken('csrf-token');
            
            await axios.post(`${url}/dormitory-admin/invoices/update/${invoice.id}`, 
                { invoice_status: newStatus },
                { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
            );

            await fetchAllInvoicesData(false);
            alert(`Invoice status updated to ${newStatus}!`);
            
        } catch (error) {
            console.error('Failed to update invoice status:', error);
            alert(error?.response?.data?.message || 'Failed to update invoice status');
        }
    };

    const handleUpdateTenantStatus = async (invoice, newStatus) => {
        try {
            const token = getToken('csrf-token');

            await axios.post(`${url}/dormitory-admin/update-status-dormitory`, 
                { 
                    document_id: invoice.tenant_id,
                    status: newStatus
                },
                { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
            );

            await fetchAllInvoicesData(false);
            alert(`Tenant status updated to ${newStatus}!`);
            
        } catch (error) {
            console.error('Failed to update tenant status:', error);
            alert(error?.response?.data?.message || 'Failed to update tenant status');
        }
    };

    const getInvoiceStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'success';
            case 'PENDING': return 'warning';
            case 'CANCELLED': return 'default';
            case 'TERMINATED': return 'error';
            default: return 'default';
        }
    };

    const getTenantStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'PENDING': return 'warning';
            case 'TERMINATED': return 'error';
            case 'CANCELLED': return 'default';
            case 'EXTENDING': return 'info';
            default: return 'default';
        }
    };

    const getRoomStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'success';
            case 'INACTIVE': return 'default';
            default: return 'default';
        }
    };

    const formatCurrency = (amount) => {
        return `₱${Number(amount || 0).toLocaleString()}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateAge = (birthdate) => {
        if (!birthdate) return '—';
        const today = new Date();
        const birthDate = new Date(birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Compact table columns
    const invoiceColumns = [
        {
            name: 'ID',
            selector: (row) => row.id || '—',
            sortable: true,
            minWidth: '14.2%',
            maxWidth: '14.2%',
            fontSize: '14px',   
            wrap: true,
        },
        {
            name: 'Tenant',
            cell: (row) => (
                <div style={{ fontSize: '14px', lineHeight: '1.3' }}>
                    <div><strong>{row.full_name || '—'}</strong></div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                        {row.user_email || '—'}
                    </div>
                </div>
            ),
            sortable: true,
            minWidth: '14.2%',
            maxWidth: '14.2%',
            wrap: true,
        },
        {
            name: 'Room',
            cell: (row) => (
                <div style={{ fontSize: '14px', lineHeight: '1.3' }}>
                    <div><strong>{row.room_name || '—'}</strong></div>
                    <div className='text-bold text-danger' style={{ fontSize: '11px', color: '#666' }}>
                        {formatCurrency(row.room_cost)} Total: {dayjs(row.tenant_to_date).diff(row.tenant_from_date, 'day') * row.room_cost}
                    </div>
                </div>
            ),
            sortable: true,
            minWidth: '14.2%',
            maxWidth: '14.2%',
            textAlign: 'center',
            wrap: true,
        },
        {
            name: 'Period',
            cell: (row) => (
                <div className='text-bold text-center'  style={{ fontSize: '14px', lineHeight: '1.3' }}>
                    <div>{formatDate(row.tenant_from_date)}</div>
                    to
                    <div>{formatDate(row.tenant_to_date)}</div>
                </div>
            ),
            sortable: true,
            minWidth: '14.2%',
            maxWidth: '14.2%',
            wrap: true,
            center: true,
        },
        {
            name: 'Tenant Status',
            cell: (row) => (
                <div>
                    <Chip 
                        label={row.tenant_status || 'PENDING'} 
                        color={getTenantStatusColor(row.tenant_status)}
                        size="small"
                        variant="outlined"
                        style={{ fontSize: '10px' }}
                    />
                </div>
            ),
            sortable: true,
            minWidth: '14.2%',
            maxWidth: '14.2%',
            center: true,
        },
        {
            name: 'Payment   Status',
            cell: (row) => (
                <div>
                    <Chip 
                        label={row.invoice_status || 'PENDING'} 
                        color={getInvoiceStatusColor(row.invoice_status)}
                        size="small"
                        style={{ marginBottom: '2px', fontSize: '10px' }}
                    />
                </div>
            ),
            sortable: true,
            minWidth: '14.2%',
            maxWidth: '14.2%',
            center: true,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="btn-group btn-group-sm" style={{ display: 'flex', gap: '2px' }}>
                    <button 
                        type="button" 
                        className="btn btn-info" 
                        title="View Details" 
                        onClick={() => handleViewDetails(row)}
                        style={{ padding: '2px 6px' }}
                    >
                        <i className="fas fa-eye"></i>
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-primary" 
                        title="View Receipt" 
                        onClick={() => handleViewReceipt(row)}
                        style={{ padding: '2px 6px' }}
                    >
                        <i className="fas fa-receipt"></i>
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            button: true,
            minWidth: '14.2%',
            maxWidth: '14.2%',
            center: true,
        },
    ];

    const statusOptions = [
        { value: 'all', label: 'All Invoice Status' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'PAID', label: 'Paid' },
        { value: 'CANCELLED', label: 'Cancelled' },
        { value: 'TERMINATED', label: 'Terminated' },
    ];

    const tenantStatusOptions = [
        { value: 'all', label: 'All Tenant Status' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'TERMINATED', label: 'Terminated' },
        { value: 'CANCELLED', label: 'Cancelled' },
        { value: 'EXTENDING', label: 'Extending' },
    ];
    const paidInvoicesCount = invoices.filter(inv => inv.invoice_status === 'PAID').length;
    const pendingInvoicesCount = invoices.filter(inv => inv.invoice_status === 'PENDING').length;
    const cancelledInvoicesCount = invoices.filter(inv => inv.invoice_status === 'CANCELLED').length;
    const terminatedInvoicesCount = invoices.filter(inv => inv.invoice_status === 'TERMINATED').length;

    const activeTenantsCount = invoices.filter(inv => inv.tenant_status === 'APPROVED').length;
    const pendingTenantsCount = invoices.filter(inv => inv.tenant_status === 'PENDING').length;
    const terminatedTenantsCount = invoices.filter(inv => inv.tenant_status === 'TERMINATED').length;
    const cancelledTenantsCount = invoices.filter(inv => inv.tenant_status === 'CANCELLED').length;
    const extendingTenantsCount = invoices.filter(inv => inv.tenant_status === 'EXTENDING').length;

    // Invoice Status Pie Chart Data
    const invoiceStatusData = [
        { label: 'Paid', value: paidInvoicesCount, color: '#28a745' },
        { label: 'Pending', value: pendingInvoicesCount, color: '#ffc107' },
        { label: 'Cancelled', value: cancelledInvoicesCount, color: '#6c757d' },
        { label: 'Terminated', value: terminatedInvoicesCount, color: '#dc3545' },
    ];

    // Tenant Status Pie Chart Data
    const tenantStatusData = [
        { label: 'Approved', value: activeTenantsCount, color: '#28a745' },
        { label: 'Pending', value: pendingTenantsCount, color: '#ffc107' },
        { label: 'Extending', value: extendingTenantsCount, color: '#17a2b8' },
        { label: 'Terminated', value: terminatedTenantsCount, color: '#dc3545' },
        { label: 'Cancelled', value: cancelledTenantsCount, color: '#6c757d' },
    ];

    // Room Occupancy Pie Chart Data
    const roomOccupancyData = dormitories.map((room, index) => ({
        label: room.room_name || `Room ${room.id}`,
        value: room.tenants_count || 0,
        color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`, // Generate consistent colors for rooms
        maxCapacity: room.room_slot || 0
    }));

    const pieChartSettings = {
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        width: 220,
        height: 220,
        hideLegend: false,
        innerRadius: 60,
        outerRadius: 100,
    };
    const calculateStats = () => {
        const total = invoices.length;
        const paid = invoices.filter(i => i.invoice_status === 'PAID').length;
        const pending = invoices.filter(i => i.invoice_status === 'PENDING').length;
        const cancelled = invoices.filter(i => i.invoice_status === 'CANCELLED').length;
        const terminated = invoices.filter(i => i.invoice_status === 'TERMINATED').length;

        const activeTenants = invoices.filter(i => i.tenant_status === 'APPROVED').length;
        const pendingTenants = invoices.filter(i => i.tenant_status === 'PENDING').length;

        return { total, paid, pending, cancelled, terminated, activeTenants, pendingTenants };
    };

    const stats = calculateStats();

    return (
        <>
            <PageName pageName={[
                { name: 'Admin', last: false, address: '/admin/dashboard' }, 
                { name: 'Dormitory', last: false, address: '/admin/dormitory' },
                { name: 'Invoices', last: true, address: '/admin/dormitory/invoices' }
            ]} />

            <section className="content">
                <div className="container-fluid">
                    <div className="col-xl-12">
                        <div className="alert alert-info border-0 shadow-sm mb-4" style={{ backgroundColor: '#e7f3ff', borderLeft: '4px solid #0078d4' }}>
                            <span className="fas fa-file-invoice-dollar text-primary mr-3" style={{ fontSize: '24px' }}></span>
                            <strong style={{ color: "black" }}>Dormitory Invoices Management</strong>
                            <p className="mb-0" style={{ fontSize: '13px', color: "black" }}>
                                Comprehensive invoice and tenant management system with complete user and room details.
                            </p>
                        </div>

                        {/* Statistics Cards */}
                        <div className="row mb-4">
                            <div className="col-md-2 col-sm-6">
                                <div className="card text-black shadow-sm" style={{backgroundColor:'#85c0ffff'}}>
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <h4 className="mb-0">{stats.total}</h4>
                                                <span className='fw-bold'>Total Invoices</span>
                                            </div>
                                            <div className="align-self-center">
                                                <i className="fas fa-file-invoice fa-2x opacity-50"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Invoice Status Pie Chart */}
                            <div className="col-md-2 col-sm-6">
                                <div className="card text-black shadow-sm" style={{backgroundColor:'#7bff9aff'}}>
                                    <div className="card-body p-3">
                                        <div className="text-center mb-2">
                                            <h6 className="fw-bold mb-1">Invoice Status</h6>
                                            <small className="text-muted">Payment Overview</small>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <PieChart
                                                series={[{
                                                    data: invoiceStatusData.filter(item => item.value > 0),
                                                    innerRadius: 40,
                                                    outerRadius: 80,
                                                    arcLabel: (item) => `${item.value}`,
                                                    arcLabelMinAngle: 30,
                                                }]}
                                                width={160}
                                                height={160}
                                                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                                                hideLegend={true}
                                                slotProps={{
                                                    legend: { hidden: true }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tenant Status Pie Chart */}
                            <div className="col-md-2 col-sm-6">
                                <div className="card text-black shadow-sm" style={{backgroundColor:'#ffd863ff'}}>
                                    <div className="card-body p-3">
                                        <div className="text-center mb-2">
                                            <h6 className="fw-bold mb-1">Tenant Status</h6>
                                            <small className="text-muted">Booking Overview</small>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <PieChart
                                                series={[{
                                                    data: tenantStatusData.filter(item => item.value > 0),
                                                    innerRadius: 40,
                                                    outerRadius: 80,
                                                    arcLabel: (item) => `${item.value}`,
                                                    arcLabelMinAngle: 30,
                                                }]}
                                                width={160}
                                                height={160}
                                                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                                                hideLegend={true}
                                                slotProps={{
                                                    legend: { hidden: true }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Room Occupancy Pie Chart */}
                            <div className="col-md-2 col-sm-6">
                                <div className="card text-black shadow-sm" style={{backgroundColor:'#ffa8b6ff'}}>
                                    <div className="card-body p-3">
                                        <div className="text-center mb-2">
                                            <h6 className="fw-bold mb-1">Room Occupancy</h6>
                                            <small className="text-muted">Current Usage</small>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <PieChart
                                                series={[{
                                                    data: roomOccupancyData.filter(item => item.value > 0),
                                                    innerRadius: 40,
                                                    outerRadius: 80,
                                                    arcLabel: (item) => `${item.value}`,
                                                    arcLabelMinAngle: 30,
                                                }]}
                                                width={160}
                                                height={160}
                                                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                                                hideLegend={true}
                                                slotProps={{
                                                    legend: { hidden: true }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Total Revenue Card */}
                            <div className="col-md-2 col-sm-6">
                                <div className="card text-black shadow-sm" style={{backgroundColor:'#a8e6cfff'}}>
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <h4 className="mb-0">₱{invoices
                                                    .filter(inv => inv.invoice_status === 'PAID')
                                                    .reduce((sum, inv) => {
                                                        const days = dayjs(inv.tenant_to_date).diff(inv.tenant_from_date, 'day');
                                                        return sum + (days * (inv.room_cost || 0));
                                                    }, 0)
                                                    .toLocaleString('en-US')}</h4>
                                                <span className='fw-bold'>Total Revenue</span>
                                            </div>
                                            <div className="align-self-center">
                                                <i className="fas fa-dollar-sign fa-2x opacity-50"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Average Stay Duration Card */}
                            <div className="col-md-2 col-sm-6">
                                <div className="card text-black shadow-sm" style={{backgroundColor:'#ffd3a5ff'}}>
                                    <div className="card-body p-3">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <h4 className="mb-0">{invoices.length > 0 ? 
                                                    Math.round(invoices.reduce((sum, inv) => {
                                                        const days = dayjs(inv.tenant_to_date).diff(inv.tenant_from_date, 'day');
                                                        return sum + (isNaN(days) ? 0 : days);
                                                    }, 0) / invoices.length) : 0} days</h4>
                                                <span className='fw-bold'>Avg Stay Duration</span>
                                            </div>
                                            <div className="align-self-center">
                                                <i className="fas fa-calendar-alt fa-2x opacity-50"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart Legends */}
                        <div className="row mb-4">
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body p-3">
                                        <h6 className="fw-bold mb-3 text-center">Invoice Status Legend</h6>
                                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                                            <span className="badge badge-success px-3 py-2">Paid ({paidInvoicesCount})</span>
                                            <span className="badge badge-warning px-3 py-2">Pending ({pendingInvoicesCount})</span>
                                            <span className="badge badge-secondary px-3 py-2">Cancelled ({cancelledInvoicesCount})</span>
                                            <span className="badge badge-danger px-3 py-2">Terminated ({terminatedInvoicesCount})</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body p-3">
                                        <h6 className="fw-bold mb-3 text-center">Tenant Status Legend</h6>
                                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                                            <span className="badge badge-success px-3 py-2">Approved ({activeTenantsCount})</span>
                                            <span className="badge badge-warning px-3 py-2">Pending ({pendingTenantsCount})</span>
                                            <span className="badge badge-info px-3 py-2">Extending ({extendingTenantsCount})</span>
                                            <span className="badge badge-danger px-3 py-2">Terminated ({terminatedTenantsCount})</span>
                                            <span className="badge badge-secondary px-3 py-2">Cancelled ({cancelledTenantsCount})</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body p-3">
                                        <h6 className="fw-bold mb-3 text-center">Room Occupancy Legend</h6>
                                        <div className="d-flex flex-wrap gap-1 justify-content-center">
                                            {roomOccupancyData.filter(item => item.value > 0).map((room, index) => (
                                                <span key={index} className="badge badge-light border px-2 py-1" style={{ backgroundColor: room.color + '20', color: room.color }}>
                                                    {room.label} ({room.value}/{room.maxCapacity})
                                                </span>
                                            ))}
                                        </div>
                                        {roomOccupancyData.filter(item => item.value > 0).length === 0 && (
                                            <p className="text-muted text-center mb-0">No occupied rooms</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card shadow-sm border-0">
                            <div className="card-header d-flex justify-content-between" 
                            style={{ backgroundColor: "#fafafa", borderBottom: "2px solid #e5e5e5", padding: "0.75rem 1rem" }}>
                                <h6 className="mb-0" style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
                                    <span className="fas fa-file-invoice text-primary mr-2"></span>
                                    Comprehensive Invoice & Tenant Management
                                </h6>
                                <div className="d-flex gap-2 flex-wrap">
                                    <FormControl size="small" style={{ minWidth: '150px' }}>
                                        <InputLabel>Invoice Status</InputLabel>
                                        <Select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            label="Invoice Status"
                                        >
                                            {statusOptions.map(option => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl size="small" style={{ minWidth: '150px' }}>
                                        <InputLabel>Tenant Status</InputLabel>
                                        <Select
                                            value={tenantFilter}
                                            onChange={(e) => setTenantFilter(e.target.value)}
                                            label="Tenant Status"
                                        >
                                            {tenantStatusOptions.map(option => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl size="small" style={{ minWidth: '150px' }}>
                                        <InputLabel>Dormitory</InputLabel>
                                        <Select
                                            value={dormitoryFilter}
                                            onChange={(e) => setDormitoryFilter(e.target.value)}
                                            label="Dormitory"
                                        >
                                            <MenuItem value="all">All Dormitories</MenuItem>
                                            {dormitories.map(dorm => (
                                                <MenuItem key={dorm.id} value={dorm.id.toString()}>
                                                    {dorm.room_name} ({dorm.tenants_count || 0})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className="card-body p-3">
                                {isFetchingInvoices ? (
                                    <SkeletonLoader />
                                ) : filteredInvoices.length > 0 ? (
                                    <NMPDataTable 
                                        progressPending={isFetchingInvoices} 
                                        columns={invoiceColumns} 
                                        data={filteredInvoices} 
                                        selectableRows={false}
                                        pagination
                                        highlightOnHover
                                        striped
                                        dense
                                    />
                                ) : (
                                    <NoDataFound message="No invoices found matching your criteria" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Receipt Dialog */}
            <Dialog 
                open={receiptDialog.open} 
                onClose={handleCloseReceiptDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <i className="fas fa-receipt mr-2"></i>
                    Invoice Receipt
                </DialogTitle>
                <DialogContent>
                    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px' }}>
                            {receiptDialog.receipt || 'No receipt data available'}
                        </pre>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseReceiptDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog 
                open={detailDialog.open} 
                onClose={handleCloseDetailDialog}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    <i className="fas fa-info-circle mr-2"></i>
                    Invoice & Tenant Details - ID: {detailDialog.invoice?.id}
                </DialogTitle>
                <DialogContent>
                {detailDialog.invoice && (
                    <div className="p-4">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h5 className="fw-semibold text-dark mb-1">Invoice Overview</h5>
                        <p className="text-muted small mb-0">
                        A summary of tenant, room, and invoice details
                        </p>
                    </div>

                    {/* Tenant and Room Info */}
                    <div className="row g-4">
                        {/* Tenant Info */}
                        <div className="col-md-6">
                        <div className="p-3 border rounded-4 bg-white shadow-sm">
                            <h6 className="fw-semibold text-secondary mb-3 d-flex align-items-center gap-2">
                            <i className="fas fa-user text-primary"></i> Tenant
                            </h6>
                            <ul className="list-unstyled mb-0 small text-muted">
                            <li><strong className="text-dark">Name:</strong> {detailDialog.invoice.full_name}</li>
                            <li><strong className="text-dark">Email:</strong> {detailDialog.invoice.user_email}</li>
                            <li><strong className="text-dark">Role:</strong> {detailDialog.invoice.user_role}</li>
                            <li className="mt-2">
                                <strong className="text-dark">Status:</strong>{' '}
                                <Chip
                                label={detailDialog.invoice.tenant_status}
                                color={getTenantStatusColor(detailDialog.invoice.tenant_status)}
                                size="small"
                                variant="outlined"
                                />
                            </li>
                            </ul>
                        </div>
                        </div>

                        {/* Room Info */}
                        <div className="col-md-6">
                        <div className="p-3 border rounded-4 bg-white shadow-sm">
                            <h6 className="fw-semibold text-secondary mb-3 d-flex align-items-center gap-2">
                            <i className="fas fa-door-closed text-success"></i> Room
                            </h6>
                            <ul className="list-unstyled mb-0 small text-muted">
                            <li><strong className="text-dark">Name:</strong> {detailDialog.invoice.room_name}</li>
                            <li><strong className="text-dark">Description:</strong> {detailDialog.invoice.room_description}</li>
                            <li className='text-danger text-bold'><strong className="text-dark">Cost:</strong> {formatCurrency(detailDialog.invoice.room_cost)}</li>
                            <li className="mt-2">
                                <strong className="text-dark">Status:</strong>{' '}
                                <Chip
                                label={detailDialog.invoice.room_status}
                                color={getRoomStatusColor(detailDialog.invoice.room_status)}
                                size="small"
                                variant="outlined"
                                />
                            </li>
                            </ul>
                        </div>
                        </div>
                    </div>

                    {/* Tenancy and Invoice */}
                    <div className="row g-4 mt-2">
                        <div className="col-md-6">
                        <div className="p-3 border rounded-4 bg-white shadow-sm">
                            <h6 className="fw-semibold text-secondary mb-3 d-flex align-items-center gap-2">
                            <i className="fas fa-calendar-alt text-info"></i> Tenancy
                            </h6>
                            <ul className="list-unstyled mb-0 small text-muted">
                            <li><strong className="text-dark">From:</strong> {formatDate(detailDialog.invoice.tenant_from_date)}</li>
                            <li><strong className="text-dark">To:</strong> {formatDate(detailDialog.invoice.tenant_to_date)}</li>
                            <li><strong className="text-dark">Duration:</strong> {detailDialog.invoice.booking_duration} day(s)</li>
                            </ul>
                        </div>
                        </div>

                        <div className="col-md-6">
                        <div className="p-3 border rounded-4 bg-white shadow-sm">
                            <h6 className="fw-semibold text-secondary mb-3 d-flex align-items-center gap-2">
                            <i className="fas fa-file-invoice text-warning"></i> Invoice
                            </h6>
                            <ul className="list-unstyled mb-0 small text-muted">
                            <li>
                                <strong className="text-dark">Status:</strong>{' '}
                                <Chip
                                label={detailDialog.invoice.invoice_status}
                                color={getInvoiceStatusColor(detailDialog.invoice.invoice_status)}
                                size="small"
                                variant="outlined"
                                />
                            </li>
                            <li><strong className="text-dark">Invoice Date:</strong> {formatDateTime(detailDialog.invoice.invoice_date)}</li>
                            <li><strong className="text-dark">Created:</strong> {formatDateTime(detailDialog.invoice.created_at)}</li>
                            {
                            detailDialog.invoice.updated_at !== detailDialog.invoice.created_at && (
                                <li><strong className="text-dark">Updated:</strong> {formatDateTime(detailDialog.invoice.updated_at)}</li>
                            )}
                            <li className='text-bold text-danger'><strong className="text-dark">Total Payment: </strong> 
                            ₱{dayjs(detailDialog.invoice.tenant_to_date).diff(detailDialog.invoice.tenant_from_date, 'day') * detailDialog.invoice.room_cost}
                            </li>
                            </ul>
                        </div>
                        </div>
                    </div>

           
                    </div>
                )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetailDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AdminDormitoryInvoices;