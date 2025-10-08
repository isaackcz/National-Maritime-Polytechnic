import { useEffect, useState } from 'react';
import { TextField, Button, CircularProgress, MenuItem } from '@mui/material';
import PageName from '../../../components/PageName';
import NMPDataTable from '../../../components/NMPDataTable/NMPDataTable';
import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';
import NoDataFound from '../../../components/NoDataFound';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import useGetToken from '../../../../hooks/useGetToken';
import axios from 'axios';

const AdminDormitory = () => {
    const { url } = useSystemURLCon();
    const { getToken } = useGetToken();

    const [activeTab, setActiveTab] = useState('capacity'); // capacity | assignments | requests

    // Capacity Management
    const [isFetchingBuildings, setIsFetchingBuildings] = useState(true);
    const [buildings, setBuildings] = useState([]);
    const [editRowId, setEditRowId] = useState(null);
    const [editData, setEditData] = useState({});
    const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
    const [showAddRoomModal, setShowAddRoomModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [newBuilding, setNewBuilding] = useState({
        name: '',
        total_rooms: '',
        total_cr: '',
        total_kitchen: '',
        daily_rate: '',
    });
    const [newRoom, setNewRoom] = useState({
        document_id: '',
        room_name: '',
        room_slot: '',
        room_cost: ''
    });
    const [buildingErrors, setBuildingErrors] = useState({});
    const [roomErrors, setRoomErrors] = useState({});

    // Trainee Assignments
    const [isFetchingAssignments, setIsFetchingAssignments] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [assignmentType, setAssignmentType] = useState('trainee'); // trainee | trainer
    const [availableTrainees, setAvailableTrainees] = useState([]);
    const [availableTrainers, setAvailableTrainers] = useState([]);
    const [isFetchingAvailable, setIsFetchingAvailable] = useState(false);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [isFetchingRooms, setIsFetchingRooms] = useState(false);
    const [newAssignment, setNewAssignment] = useState({
        person_id: '',
        person_type: 'trainee',
        building_id: '',
        room_number: '',
        check_in: '',
        check_out: '',
    });
    const [updateData, setUpdateData] = useState({
        check_in: '',
        check_out: '',
        payment_status: 'unpaid',
    });
    const [assignmentErrors, setAssignmentErrors] = useState({});

    // Reservation Requests
    const [isFetchingRequests, setIsFetchingRequests] = useState(false);
    const [requests, setRequests] = useState([]);
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [processData, setProcessData] = useState({
        status: 'approved',
        building_id: '',
        room_id: '',
        check_in: '',
        check_out: '',
        payment_status: 'unpaid',
    });

    const fetchBuildings = async (isInitialLoad) => {
        try {
            setIsFetchingBuildings(isInitialLoad);

            const token = getToken('csrf-token');
            const response = await axios.get(`${url}/dormitory-admin/dormitory/get`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            const data = response?.data?.dormitories || [];
            setBuildings(Array.isArray(data) ? data : []);
            console.log('data han api ehehehhehe: ', data);
        } catch (error) {
            console.log('Failed to fetch buildings:', error.response);
            setBuildings([]);
        } finally {
            setIsFetchingBuildings(false);
        }
    };

    const fetchAssignments = async () => {
        try {
            setIsFetchingAssignments(true);
            const token = getToken('csrf-token');
            const response = await axios.get(`${url}/admin/dormitory/assignments`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            const data = response?.data?.data || [];
            setAssignments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.warn('Failed to fetch assignments:', error?.response?.data || error?.message);
            setAssignments([]);
        } finally {
            setIsFetchingAssignments(false);
        }
    };

    const fetchRequests = async () => {
        try {
            setIsFetchingRequests(true);
            const token = getToken('csrf-token');
            const response = await axios.get(`${url}/admin/dormitory/requests`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            const data = response?.data?.data || [];
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.warn('Failed to fetch requests:', error?.response?.data || error?.message);
            setRequests([]);
        } finally {
            setIsFetchingRequests(false);
        }
    };

    useEffect(() => {
        fetchBuildings(true);

        if (activeTab === 'assignments') fetchAssignments();
        if (activeTab === 'requests') fetchRequests();

        // const intervalId = setInterval(fetchBuildings(false), 2000);
        // return () => clearInterval(intervalId);
    }, [activeTab]);

    const validateBuilding = () => {
        const errs = {};
        if (!newBuilding.name?.trim()) errs.name = 'Required';
        if (!newBuilding.total_rooms || isNaN(Number(newBuilding.total_rooms))) errs.total_rooms = 'Valid number required';
        if (!newBuilding.total_cr || isNaN(Number(newBuilding.total_cr))) errs.total_cr = 'Valid number required';
        if (!newBuilding.total_kitchen || isNaN(Number(newBuilding.total_kitchen))) errs.total_kitchen = 'Valid number required';
        if (!newBuilding.daily_rate || isNaN(Number(newBuilding.daily_rate))) errs.daily_rate = 'Valid amount required';
        setBuildingErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const submitAddBuilding = async (e) => {
        e?.preventDefault?.();
        if (!validateBuilding()) return;
        try {
            setIsSubmitting(true);
            const token = getToken('csrf-token');
            const payload = {
                name: newBuilding.name.trim(),
                total_rooms: Number(newBuilding.total_rooms),
                total_cr: Number(newBuilding.total_cr),
                total_kitchen: Number(newBuilding.total_kitchen),
                daily_rate: Number(newBuilding.daily_rate),
            };
            const response = await axios.post(`${url}/dormitory-admin/dormitory/create_or_update_dormitory`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            if (response.status === 201 || response.status === 200) {
                setShowAddBuildingModal(false);
                await fetchBuildings();
            }
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to add building');
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateRoom = () => {
        const errs = {};

        // if (!newRoom.building_id) errs.building_id = 'Required';
        if (!newRoom.room_name?.trim()) errs.room_name = 'Required';
        if (!newRoom.room_slot || isNaN(Number(newRoom.room_slot))) errs.room_slot = 'Valid number required';
        if (!newRoom.room_cost || isNaN(Number(newRoom.room_cost))) errs.room_cost = 'Valid cost required';

        setRoomErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const submitAddRoom = async (e) => {
        e?.preventDefault?.();
        if (!validateRoom()) return;
        try {
            setIsSubmitting(true);
            const token = getToken('csrf-token');
            const payload = {
                room_name: newRoom.room_name.trim(),
                room_slot: Number(newRoom.room_slot),
                room_cost: Number(newRoom.room_cost),
                httpMethod: "POST"
            };
            const response = await axios.post(`${url}/dormitory-admin/dormitory/create_or_update_dormitory`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            if (response.status === 201 || response.status === 200) {
                setShowAddRoomModal(false);
                await fetchBuildings();
            }
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to add room');
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitProcessRequest = async (e) => {
        e?.preventDefault?.();
        if (!selectedRequest) return;
        try {
            setIsSubmitting(true);
            const token = getToken('csrf-token');
            const payload = {
                status: processData.status,
                building_id: processData.building_id,
                room_id: processData.room_id,
                check_in: processData.check_in,
                check_out: processData.check_out,
                payment_status: processData.payment_status,
            };
            const response = await axios.post(`${url}/admin/dormitory/requests/${selectedRequest.id}/process`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            if (response.status === 200) {
                setShowProcessModal(false);
                await fetchRequests();
            }
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to process request');
        } finally {
            setIsSubmitting(false);
        }
    };



// Delete Building (keep as is)
const deleteBuilding = async (id) => {
  if (!window.confirm('Delete this building? This cannot be undone.')) return;
  try {
    const token = getToken('csrf-token');
    await axios.delete(`${url}/dormitory-admin/dormitory/create_or_update_dormitory/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      }
    });
    await fetchBuildings();
  } catch (error) {
    alert(error?.response?.data?.message || 'Failed to delete building');
  }
};

    // Start editing
    const startEdit = (row) => {
    setEditRowId(row.id);
    setEditData({ ...row });
    };

    // Handle input changes
    const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
    };

    // Save update
    const saveBuilding = async (id) => {
    if (!window.confirm('Save changes?')) return;
    try {
        const token = getToken('csrf-token');
        await axios.put(`${url}/dormitory-admin/dormitory/create_or_update_dormitory/${id}`, editData, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
        });
        setEditRowId(null);
        await fetchBuildings();
    } catch (error) {
        alert(error?.response?.data?.message || 'Failed to update building');
    }
    };

    // Cancel editing
    const cancelEdit = () => {
    setEditRowId(null);
    };

    // Table columns
    const buildingColumns = [
    {
        name: 'Room Name',
        selector: (row) =>
        editRowId === row.id ? (
            <input
            type="text"
            className="form-control form-control-sm"
            value={editData.room_name || ''}
            onChange={(e) => handleEditChange('name', e.target.value)}
            />
        ) : (
            row.room_name || '—'
        ),
        sortable: true,
    },
    {
        name: 'Slot',
        selector: (row) =>
        editRowId === row.id ? (
            <input
            type="number"
            className="form-control form-control-sm"
            value={editData.room_slot || 0}
            onChange={(e) => handleEditChange('total_rooms', e.target.value)}
            style={{ width: '80px' }}
            />
        ) : (
            row.room_slot || 0
        ),
        sortable: true,
        maxWidth: '100px',
    },
    {
        name: 'Daily Rate',
        selector: (row) =>
        editRowId === row.id ? (
            <input
            type="number"
            className="form-control form-control-sm"
            value={editData.room_cost || ''}
            onChange={(e) => handleEditChange('daily_rate', e.target.value)}
            style={{ width: '100px' }}
            />
        ) : (
            row.room_cost ? `₱${Number(row.room_cost).toLocaleString()}` : '—'
        ),
        sortable: true,
    },
    {
        name: 'Action',
        cell: (row) =>
        editRowId === row.id ? (
            <div className="btn-group btn-group-sm">
            <button
                type="button"
                className="btn btn-success"
                title="Save"
                onClick={() => saveBuilding(row.id)}
            >
                <i class="fas fa-save"></i>
            </button>
            <button
                type="button"
                className="btn btn-secondary"
                title="Cancel"
                onClick={cancelEdit}
            >
                <i class="fas fa-times"></i>
            </button>
            </div>
        ) : (
            <div className="btn-group btn-group-sm">
            <button
                type="button"
                className="btn btn-info"
                title="Edit"
                onClick={() => startEdit(row)}
            >
                <i className="fas fa-user-edit"></i>
            </button>
            { row.tenants_count === 0 && 
                <button
                    type="button"
                    className="btn btn-danger"
                    title="Delete"
                    onClick={() => deleteBuilding(row.id)}
                >
                    <i className="fas fa-trash"></i>
                </button>
            }
            </div>
        ),
        ignoreRowClick: true,
        button: true,
        maxWidth: '120px',
    },
    ];

    const openAssignModal = async (type) => {
        setAssignmentType(type);
        setNewAssignment({ person_id: '', person_type: type, building_id: '', room_number: '', check_in: '', check_out: '' });
        setAssignmentErrors({});
        setAvailableRooms([]);
        setShowAssignModal(true);

        try {
            setIsFetchingAvailable(true);
            const token = getToken('csrf-token');
            const endpoint = type === 'trainee' ? '/admin/users/trainees' : '/admin/users/trainers';
            const response = await axios.get(`${url}${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            const list = response?.data?.data || [];
            if (type === 'trainee') {
                setAvailableTrainees(Array.isArray(list) ? list : []);
            } else {
                setAvailableTrainers(Array.isArray(list) ? list : []);
            }
        } catch (error) {
            console.warn(`Failed to fetch ${type}s:`, error?.response?.data || error?.message);
            if (type === 'trainee') {
                setAvailableTrainees([]);
            } else {
                setAvailableTrainers([]);
            }
        } finally {
            setIsFetchingAvailable(false);
        }
    };

    const fetchRoomsForBuilding = async (buildingId) => {
        if (!buildingId) {
            setAvailableRooms([]);
            return;
        }

        try {
            setIsFetchingRooms(true);
            const token = getToken('csrf-token');
            const response = await axios.get(`${url}/admin/dormitory/buildings/${buildingId}/rooms`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                }
            });
            const rooms = response?.data?.data || [];
            setAvailableRooms(Array.isArray(rooms) ? rooms : []);
        } catch (error) {
            console.warn('Failed to fetch rooms:', error?.response?.data || error?.message);
            setAvailableRooms([]);
        } finally {
            setIsFetchingRooms(false);
        }
    };

    const handleBuildingChange = (buildingId) => {
        setNewAssignment({ ...newAssignment, building_id: buildingId, room_number: '' });
        fetchRoomsForBuilding(buildingId);
    };

    const validateAssignment = () => {
        const errs = {};
        if (!newAssignment.person_id) errs.person_id = 'Required';
        if (!newAssignment.building_id) errs.building_id = 'Required';
        if (!newAssignment.room_number) errs.room_number = 'Required';
        if (!newAssignment.check_in) errs.check_in = 'Required';
        if (!newAssignment.check_out) errs.check_out = 'Required';
        setAssignmentErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const submitAssignment = async (e) => {
        e?.preventDefault?.();
        if (!validateAssignment()) return;
        try {
            setIsSubmitting(true);
            const token = getToken('csrf-token');
            const payload = {
                person_id: newAssignment.person_id,
                person_type: newAssignment.person_type,
                building_id: newAssignment.building_id,
                room_number: newAssignment.room_number.trim(),
                check_in: newAssignment.check_in,
                check_out: newAssignment.check_out,
            };
            const response = await axios.post(`${url}/admin/dormitory/assignments`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            if (response.status === 201 || response.status === 200) {
                setShowAssignModal(false);
                await fetchAssignments();
            }
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to create assignment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteAssignment = async (id) => {
        if (!window.confirm('Remove this assignment? This cannot be undone.')) return;
        try {
            const token = getToken('csrf-token');
            await axios.delete(`${url}/admin/dormitory/assignments/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                }
            });
            await fetchAssignments();
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to delete assignment');
        }
    };

    const openUpdateModal = (assignment) => {
        setSelectedAssignment(assignment);
        setUpdateData({
            check_in: assignment.check_in || '',
            check_out: assignment.check_out || '',
            payment_status: assignment.payment_status || 'unpaid',
        });
        setShowUpdateModal(true);
    };

    const submitUpdate = async (e) => {
        e?.preventDefault?.();
        if (!selectedAssignment) return;
        try {
            setIsSubmitting(true);
            const token = getToken('csrf-token');
            const payload = {
                check_in: updateData.check_in,
                check_out: updateData.check_out,
                payment_status: updateData.payment_status,
            };
            const response = await axios.put(`${url}/admin/dormitory/assignments/${selectedAssignment.id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            if (response.status === 200) {
                setShowUpdateModal(false);
                await fetchAssignments();
            }
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to update assignment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const assignmentColumns = [
        { name: 'Name', selector: row => row.person_name || '—', sortable: true },
        { 
            name: 'Type', 
            selector: row => row.person_type || '—', 
            sortable: true,
            cell: (row) => (
                <span className={`badge ${row.person_type === 'trainee' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '10px', textTransform: 'capitalize' }}>
                    {row.person_type || '—'}
                </span>
            ),
            maxWidth: '100px',
        },
        { name: 'Building', selector: row => row.building_name || '—', sortable: true },
        { name: 'Room', selector: row => row.room_number || '—', sortable: true, maxWidth: '100px' },
        { name: 'Check-in', selector: row => row.check_in || '—', sortable: true },
        { name: 'Check-out', selector: row => row.check_out || '—', sortable: true },
        { 
            name: 'Payment', 
            selector: row => row.payment_status || '—', 
            sortable: true,
            cell: (row) => (
                <span className={`badge ${row.payment_status === 'paid' ? 'badge-success' : row.payment_status === 'partial' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '10px', textTransform: 'capitalize' }}>
                    {row.payment_status || '—'}
                </span>
            ),
        },
        {
            name: 'Action',
            selector: row => row.id,
            cell: (row) => (
                <div className="btn-group btn-group-sm">
                    <button type="button" className="btn btn-primary" title="Update" onClick={() => openUpdateModal(row)}>
                        <i className="fas fa-edit"></i>
                    </button>
                    <button type="button" className="btn btn-danger" title="Remove" onClick={() => deleteAssignment(row.id)}>
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            button: true,
            maxWidth: '120px',
        },
    ];

    const requestColumns = [
        { name: 'Trainee', selector: row => row.trainee_name || '—', sortable: true },
        { name: 'Requested Date', selector: row => row.requested_date || '—', sortable: true },
        { name: 'Status', selector: row => row.status || 'pending', sortable: true },
        {
            name: 'Action',
            selector: row => row.id,
            cell: (row) => (
                <button 
                    type="button" 
                    className="btn btn-sm btn-primary" 
                    onClick={() => {
                        setSelectedRequest(row);
                        setProcessData({ 
                            status: 'approved', 
                            building_id: '', 
                            room_id: '', 
                            check_in: '', 
                            check_out: '', 
                            payment_status: 'unpaid' 
                        });
                        setShowProcessModal(true);
                    }}
                >
                    <i className="fas fa-check mr-1"></i>
                    Process
                </button>
            ),
            ignoreRowClick: true,
            button: true,
        },
    ];

    return (
        <>
            <PageName pageName={[{ name: 'Admin', last: false, address: '/admin/dashboard' }, { name: 'Dormitory', last: true, address: '/admin/dormitory' }]} />

            <section className="content">
                <div className="container-fluid">
                    <div className="row fade-up">
                        <div className="col-xl-12">
                            <div className="alert alert-info border-0 shadow-sm mb-4" style={{ backgroundColor: '#e7f3ff', borderLeft: '4px solid #0078d4' }}>
                                <div className="row align-items-center">
                                    <div className="col-auto">
                                        <span className="fas fa-info-circle text-primary" style={{ fontSize: '24px' }}></span>
                                    </div>
                                    <div className="col" style={{ fontSize: '13px', lineHeight: '1.6', color: 'black' }}>
                                        <strong className="d-block mb-1">Manage Dormitory</strong>
                                        Manage building capacity, trainee room assignments, and reservation requests.
                                    </div>
                                </div>
                            </div>

                            <div className="card card-primary card-outline card-outline-tabs shadow-sm border-0">
                                <div className="card-header p-0 border-bottom-0" style={{ backgroundColor: '#fafafa' }}>
                                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center" style={{ padding: '0 0.75rem 0 0.75rem' }}>
                                        <ul className="nav nav-tabs flex-nowrap overflow-auto" role="tablist" style={{ borderBottom: '2px solid #e5e5e5', width: '100%', maxWidth: '100%' }}>
                                            <li className="nav-item">
                                                <a
                                                    className={`nav-link ${activeTab === 'capacity' ? 'active' : ''}`}
                                                    data-toggle="pill"
                                                    href="#tab-capacity"
                                                    role="tab"
                                                    aria-selected={activeTab === 'capacity'}
                                                    onClick={() => setActiveTab('capacity')}
                                                    style={{ fontSize: '13px', fontWeight: '500', padding: '0.75rem 0.75rem', border: 'none', borderBottom: '3px solid transparent', transition: 'all 0.3s ease', whiteSpace: 'nowrap' }}
                                                >
                                                    <span className="fas fa-building mr-1 mr-md-2" style={{ fontSize: '12px' }}></span>
                                                    <span className="d-none d-sm-inline">Capacity</span>
                                                    <span className="d-inline d-sm-none">Capacity</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a
                                                    className={`nav-link ${activeTab === 'assignments' ? 'active' : ''}`}
                                                    data-toggle="pill"
                                                    href="#tab-assignments"
                                                    role="tab"
                                                    aria-selected={activeTab === 'assignments'}
                                                    onClick={() => setActiveTab('assignments')}
                                                    style={{ fontSize: '13px', fontWeight: '500', padding: '0.75rem 0.75rem', border: 'none', borderBottom: '3px solid transparent', transition: 'all 0.3s ease', whiteSpace: 'nowrap' }}
                                                >
                                                    <span className="fas fa-bed mr-1 mr-md-2" style={{ fontSize: '12px' }}></span>
                                                    <span className="d-none d-sm-inline">Assignments</span>
                                                    <span className="d-inline d-sm-none">Assign</span>
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a
                                                    className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
                                                    data-toggle="pill"
                                                    href="#tab-requests"
                                                    role="tab"
                                                    aria-selected={activeTab === 'requests'}
                                                    onClick={() => setActiveTab('requests')}
                                                    style={{ fontSize: '13px', fontWeight: '500', padding: '0.75rem 0.75rem', border: 'none', borderBottom: '3px solid transparent', transition: 'all 0.3s ease', whiteSpace: 'nowrap' }}
                                                >
                                                    <span className="fas fa-clipboard-list mr-1 mr-md-2" style={{ fontSize: '12px' }}></span>
                                                    <span className="d-none d-sm-inline">Requests</span>
                                                    <span className="d-inline d-sm-none">Requests</span>
                                                </a>
                                            </li>
                                        </ul>

                                        <div className="d-flex align-items-center mt-2 mt-lg-0 ml-lg-3" style={{ gap: '0.5rem', paddingBottom: '0.5rem', paddingTop: '0.5rem' }}>
                                            {activeTab === 'capacity' && (
                                                <>
                                                    <button type="button" className="btn btn-success btn-sm" onClick={() => {
                                                        setNewRoom({ building_id: '', room_number: '', capacity: '' });
                                                        setRoomErrors({});
                                                        setShowAddRoomModal(true);
                                                    }} style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                                                        <i className="fas fa-door-open mr-1"></i>
                                                        <span className="d-none d-md-inline">Add </span>Room
                                                    </button>
                                                    <button type="button" className="btn btn-primary btn-sm" onClick={() => {
                                                        setNewBuilding({ name: '', total_rooms: '', total_cr: '', total_kitchen: '', daily_rate: '' });
                                                        setBuildingErrors({});
                                                        setShowAddBuildingModal(true);
                                                    }} style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                                                        <i className="fas fa-plus mr-1"></i>
                                                        <span className="d-none d-md-inline">Add </span>Building
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                                    <div className="tab-content">
                                        {/* Capacity Management Tab */}
                                        <div className={`tab-pane fade ${activeTab === 'capacity' ? 'show active' : ''}`} id="tab-capacity" role="tabpanel">
                                            <div className="card shadow-sm border-0">
                                                <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                                    <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                                        <i className="fas fa-building mr-2 text-primary"></i>
                                                        Buildings & Capacity
                                                    </h6>
                                                </div>
                                                <div className="card-body p-3">
                                                    {isFetchingBuildings ? (
                                                        <SkeletonLoader />
                                                    ) : buildings.length > 0 ? (
                                                        <div className="table-responsive">
                                                            <NMPDataTable
                                                                progressPending={isFetchingBuildings}
                                                                columns={buildingColumns}
                                                                data={buildings}
                                                                selectableRows={false}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <NoDataFound />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Trainee Assignments Tab */}
                                        <div className={`tab-pane fade ${activeTab === 'assignments' ? 'show active' : ''}`} id="tab-assignments" role="tabpanel">
                                            <div className="card shadow-sm border-0">
                                                <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center" style={{ padding: '1rem 1.5rem' }}>
                                                    <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                                        <i className="fas fa-bed mr-2 text-primary"></i>
                                                        Trainee & Trainer Assignments
                                                    </h6>
                                                    <div>
                                                        <button type="button" className="btn btn-success btn-sm mr-2" onClick={() => openAssignModal('trainee')}>
                                                            <i className="fas fa-user-plus mr-1"></i> Add Trainee
                                                        </button>
                                                        <button type="button" className="btn btn-primary btn-sm" onClick={() => openAssignModal('trainer')}>
                                                            <i className="fas fa-chalkboard-teacher mr-1"></i> Add Trainer
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="card-body p-3">
                                                    {isFetchingAssignments ? (
                                                        <SkeletonLoader />
                                                    ) : assignments.length > 0 ? (
                                                        <div className="table-responsive">
                                                            <NMPDataTable
                                                                progressPending={isFetchingAssignments}
                                                                columns={assignmentColumns}
                                                                data={assignments}
                                                                selectableRows={false}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <NoDataFound />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reservation Requests Tab */}
                                        <div className={`tab-pane fade ${activeTab === 'requests' ? 'show active' : ''}`} id="tab-requests" role="tabpanel">
                            <div className="card shadow-sm border-0">
                                                <div className="card-header bg-white border-bottom" style={{ padding: '1rem 1.5rem' }}>
                                                    <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                                        <i className="fas fa-clipboard-list mr-2 text-primary"></i>
                                                        Reservation Requests
                                                    </h6>
                                                </div>
                                                <div className="card-body p-3">
                                                    {isFetchingRequests ? (
                                                        <SkeletonLoader />
                                                    ) : requests.length > 0 ? (
                                                        <div className="table-responsive">
                                                            <NMPDataTable
                                                                progressPending={isFetchingRequests}
                                                                columns={requestColumns}
                                                                data={requests}
                                                                selectableRows={false}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <NoDataFound />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Add Building Modal */}
            {showAddBuildingModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} role="dialog" aria-modal="true" onClick={() => !isSubmitting && setShowAddBuildingModal(false)}>
                    <div className="modal-dialog modal-dialog-scrollable modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header border-0" style={{ 
                                background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
                                padding: '1.5rem 2rem',
                                color: 'white'
                            }}>
                                <div className="d-flex align-items-center justify-content-between w-100">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mr-3 shadow-sm" 
                                            style={{ width: '50px', height: '50px' }}>
                                            <i className="fas fa-building text-primary" style={{ fontSize: '1.2rem' }}></i>
                                        </div>
                                        <div>
                                            <h5 className="mb-1 font-weight-bold text-white">Add Building</h5>
                                            <p className="mb-0 text-white-50" style={{ fontSize: '13px' }}>
                                                Enter building capacity details
                                            </p>
                                        </div>
                                    </div>
                                    <button type="button" className="close text-white" onClick={() => !isSubmitting && setShowAddBuildingModal(false)} aria-label="Close" style={{ opacity: 1 }} disabled={isSubmitting}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={submitAddBuilding}>
                                <div className="modal-body" style={{ backgroundColor: '#ffffff', padding: '2rem' }}>
                                    <div className="card shadow-sm border-0 mb-4" style={{ backgroundColor: '#fafafa' }}>
                                        <div className="card-body p-4">
                                            <h6 className="mb-3 font-weight-bold" style={{ color: '#323130' }}>
                                                <i className="fas fa-info-circle mr-2 text-primary"></i>
                                                Building Information
                                            </h6>
                                            <div className="row">
                                                <div className="col-12 mb-3">
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        label="Building Name"
                                                        value={newBuilding.name}
                                                        onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
                                                        error={Boolean(buildingErrors.name)}
                                                        helperText={buildingErrors.name || ''}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card shadow-sm border-0" style={{ backgroundColor: '#fafafa' }}>
                                        <div className="card-body p-4">
                                            <h6 className="mb-2 font-weight-bold" style={{ color: '#323130' }}>
                                                <i className="fas fa-layer-group mr-2 text-primary"></i>
                                                Capacity & Rate
                                            </h6>
                                            <p className="text-muted mb-3" style={{ fontSize: '12px' }}>Set the total capacity and daily rate.</p>
                                            <div className="row">
                                            <div className="col-12 col-sm-6 mb-3">
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Room Name"
                                                    value={newRoom.room_name}
                                                    onChange={(e) => setNewRoom({ ...newRoom, room_name: e.target.value })}
                                                    error={Boolean(roomErrors.room_name)}
                                                    helperText={roomErrors.room_name || ''}
                                                />
                                            </div>

                                                <div className="col-12 col-sm-6 mb-3">
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="number"
                                                        label="Total CR"
                                                        value={newBuilding.total_cr}
                                                        onChange={(e) => setNewBuilding({ ...newBuilding, total_cr: e.target.value })}
                                                        error={Boolean(buildingErrors.total_cr)}
                                                        helperText={buildingErrors.total_cr || ''}
                                                        inputProps={{ min: 0 }}
                                                    />
                                                </div>

                                                <div className="col-12 col-sm-6 mb-3">
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="number"
                                                        label="Daily Rate (₱)"
                                                        value={newBuilding.daily_rate}
                                                        onChange={(e) => setNewBuilding({ ...newBuilding, daily_rate: e.target.value })}
                                                        error={Boolean(buildingErrors.daily_rate)}
                                                        helperText={buildingErrors.daily_rate || ''}
                                                        inputProps={{ min: 0 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer border-0" style={{ backgroundColor: '#fafafa', padding: '1rem 2rem' }}>
                                    <button type="button" className="btn btn-secondary shadow-sm px-4 py-2" onClick={() => !isSubmitting && setShowAddBuildingModal(false)} style={{ fontSize: '13px', fontWeight: '600', borderRadius: '4px' }} disabled={isSubmitting}>
                                        <i className="fas fa-times mr-2"></i>
                                        Cancel
                                    </button>
                                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                                        {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Save Building'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Room Modal */}
            {showAddRoomModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} role="dialog" aria-modal="true" onClick={() => !isSubmitting && setShowAddRoomModal(false)}>
                    <div className="modal-dialog modal-dialog-scrollable modal-md modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header border-0" style={{ 
                                background: 'linear-gradient(135deg, #28a745 0%, #20883b 100%)',
                                padding: '1.5rem 2rem',
                                color: 'white'
                            }}>
                                <div className="d-flex align-items-center justify-content-between w-100">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mr-3 shadow-sm" 
                                            style={{ width: '50px', height: '50px' }}>
                                            <i className="fas fa-door-open text-success" style={{ fontSize: '1.2rem' }}></i>
                                        </div>
                                        <div>
                                            <h5 className="mb-1 font-weight-bold text-white">Add Room</h5>
                                            <p className="mb-0 text-white-50" style={{ fontSize: '13px' }}>
                                                Add a new room to a building
                                            </p>
                                        </div>
                                    </div>
                                    <button type="button" className="close text-white" onClick={() => !isSubmitting && setShowAddRoomModal(false)} aria-label="Close" style={{ opacity: 1 }} disabled={isSubmitting}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={submitAddRoom}>
                                <div className="modal-body" style={{ backgroundColor: '#ffffff', padding: '2rem' }}>
                                    <div className="card shadow-sm border-0" style={{ backgroundColor: '#fafafa' }}>
                                        <div className="card-body p-4">
                                            <h6 className="mb-3 font-weight-bold" style={{ color: '#323130' }}>
                                                <i className="fas fa-door-open mr-2 text-primary"></i>
                                                Room Details
                                            </h6>
                                            <div className="row">
                                                <div className="col-12 col-sm-6 mb-3">
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        label="Room Name"
                                                        value={newRoom.room_name}
                                                        onChange={(e) => setNewRoom({ ...newRoom, room_name: e.target.value })}
                                                        error={Boolean(roomErrors.room_name)}
                                                        helperText={roomErrors.room_name || ''}
                                                    />
                                                </div>
                                                <div className="col-12 col-sm-6 mb-3">
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="number"
                                                        label="Capacity"
                                                        value={newRoom.room_slot}
                                                        onChange={(e) => setNewRoom({ ...newRoom, room_slot: e.target.value })}
                                                        error={Boolean(roomErrors.room_slot)}
                                                        helperText={roomErrors.room_slot || ''}
                                                        inputProps={{ min: 1 }}
                                                    />
                                                </div>
                                                <div className="col-12 col-sm-12 mb-3">
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        label="Room Cost (₱)"
                                                        type="number"
                                                        value={newRoom.room_cost}
                                                        onChange={(e) => setNewRoom({ ...newRoom, room_cost: e.target.value })}
                                                        error={Boolean(roomErrors.room_cost)}
                                                        helperText={roomErrors.room_cost || ''}
                                                        
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer border-0" style={{ backgroundColor: '#fafafa', padding: '1rem 2rem' }}>
                                    <button type="button" className="btn btn-secondary shadow-sm px-4 py-2" onClick={() => !isSubmitting && setShowAddRoomModal(false)} style={{ fontSize: '13px', fontWeight: '600', borderRadius: '4px' }} disabled={isSubmitting}>
                                        <i className="fas fa-times mr-2"></i>
                                        Cancel
                                    </button>
                                    <Button type="submit" variant="contained" color="success" disabled={isSubmitting}>
                                        {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Save Room'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Process Reservation Request Modal */}
            {showProcessModal && selectedRequest && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} role="dialog" aria-modal="true" onClick={() => !isSubmitting && setShowProcessModal(false)}>
                    <div className="modal-dialog modal-dialog-scrollable modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header border-0" style={{ 
                                background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                                padding: '1.5rem 2rem',
                                color: 'white'
                            }}>
                                <div className="d-flex align-items-center justify-content-between w-100">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mr-3 shadow-sm" 
                                            style={{ width: '50px', height: '50px' }}>
                                            <i className="fas fa-check-circle text-info" style={{ fontSize: '1.2rem' }}></i>
                                        </div>
                                        <div>
                                            <h5 className="mb-1 font-weight-bold text-white">Process Reservation</h5>
                                            <p className="mb-0 text-white-50" style={{ fontSize: '13px' }}>
                                                {selectedRequest.trainee_name}
                                            </p>
                                        </div>
                                    </div>
                                    <button type="button" className="close text-white" onClick={() => !isSubmitting && setShowProcessModal(false)} aria-label="Close" style={{ opacity: 1 }} disabled={isSubmitting}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={submitProcessRequest}>
                                <div className="modal-body" style={{ backgroundColor: '#ffffff', padding: '2rem' }}>
                                    <div className="card shadow-sm border-0 mb-4" style={{ backgroundColor: '#fafafa' }}>
                                        <div className="card-body p-4">
                                            <h6 className="mb-3 font-weight-bold" style={{ color: '#323130' }}>
                                                <i className="fas fa-clipboard-check mr-2 text-primary"></i>
                                                Assignment Details
                                            </h6>
                                            <div className="row">
                                                <div className="col-12 col-sm-6 mb-3">
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        size="small"
                                                        label="Status"
                                                        value={processData.status}
                                                        onChange={(e) => setProcessData({ ...processData, status: e.target.value })}
                                                    >
                                                        <MenuItem value="approved">Approved</MenuItem>
                                                        <MenuItem value="rejected">Rejected</MenuItem>
                                                    </TextField>
                                                </div>
                                                <div className="col-12 col-sm-6 mb-3">
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        size="small"
                                                        label="Building"
                                                        value={processData.building_id}
                                                        onChange={(e) => setProcessData({ ...processData, building_id: e.target.value })}
                                                    >
                                                        {buildings.map((b) => (
                                                            <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                                                        ))}
                                                    </TextField>
                                                </div>
                                                <div className="col-12 mb-3">
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        label="Room ID"
                                                        placeholder="Enter room ID"
                                                        value={processData.room_id}
                                                        onChange={(e) => setProcessData({ ...processData, room_id: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card shadow-sm border-0" style={{ backgroundColor: '#fafafa' }}>
                                        <div className="card-body p-4">
                                            <h6 className="mb-2 font-weight-bold" style={{ color: '#323130' }}>
                                                <i className="fas fa-calendar-alt mr-2 text-primary"></i>
                                                Stay Duration & Payment
                                            </h6>
                                            <p className="text-muted mb-3" style={{ fontSize: '12px' }}>Set check-in/out dates and payment status.</p>
                                            <div className="row">
                                                <div className="col-12 col-sm-6 mb-3">
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="date"
                                                        label="Check-in"
                                                        InputLabelProps={{ shrink: true }}
                                                        value={processData.check_in}
                                                        onChange={(e) => setProcessData({ ...processData, check_in: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-12 col-sm-6 mb-3">
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="date"
                                                        label="Check-out"
                                                        InputLabelProps={{ shrink: true }}
                                                        value={processData.check_out}
                                                        onChange={(e) => setProcessData({ ...processData, check_out: e.target.value })}
                                                    />
                                                </div>
                                                <div className="col-12 mb-3">
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        size="small"
                                                        label="Payment Status"
                                                        value={processData.payment_status}
                                                        onChange={(e) => setProcessData({ ...processData, payment_status: e.target.value })}
                                                    >
                                                        <MenuItem value="unpaid">Unpaid</MenuItem>
                                                        <MenuItem value="partial">Partial</MenuItem>
                                                        <MenuItem value="paid">Paid</MenuItem>
                                                    </TextField>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer border-0" style={{ backgroundColor: '#fafafa', padding: '1rem 2rem' }}>
                                    <button type="button" className="btn btn-secondary shadow-sm px-4 py-2" onClick={() => !isSubmitting && setShowProcessModal(false)} style={{ fontSize: '13px', fontWeight: '600', borderRadius: '4px' }} disabled={isSubmitting}>
                                        <i className="fas fa-times mr-2"></i>
                                        Cancel
                                    </button>
                                    <Button type="submit" variant="contained" style={{ backgroundColor: '#17a2b8' }} disabled={isSubmitting}>
                                        {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Process Request'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Assignment Modal */}
            {showAssignModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} role="dialog" aria-modal="true" onClick={() => !isSubmitting && setShowAssignModal(false)}>
                    <div className="modal-dialog modal-dialog-scrollable modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header border-0" style={{ 
                                background: assignmentType === 'trainee' ? 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)' : 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
                                padding: '1.5rem 2rem',
                                color: 'white'
                            }}>
                                <div className="d-flex align-items-center justify-content-between w-100">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mr-3 shadow-sm" 
                                            style={{ width: '50px', height: '50px' }}>
                                            <i className={`fas ${assignmentType === 'trainee' ? 'fa-user-plus' : 'fa-chalkboard-teacher'} ${assignmentType === 'trainee' ? 'text-success' : 'text-primary'}`} style={{ fontSize: '1.2rem' }}></i>
                                        </div>
                                        <h5 className="mb-0 font-weight-bold" style={{ fontSize: '18px', letterSpacing: '0.3px' }}>
                                            Add {assignmentType === 'trainee' ? 'Trainee' : 'Trainer'} to Dormitory
                                        </h5>
                                    </div>
                                    <button type="button" className="close text-white" onClick={() => !isSubmitting && setShowAssignModal(false)} disabled={isSubmitting}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={submitAssignment}>
                                <div className="modal-body" style={{ backgroundColor: '#f8f9fa', padding: '2rem' }}>
                                    {/* Person Selection */}
                                    <div className="card shadow-sm border-0 mb-3">
                                        <div className="card-body" style={{ padding: '1.5rem' }}>
                                            <div className="d-flex align-items-center mb-3">
                                                <i className={`fas ${assignmentType === 'trainee' ? 'fa-user' : 'fa-chalkboard-teacher'} ${assignmentType === 'trainee' ? 'text-success' : 'text-primary'} mr-2`} style={{ fontSize: '1.1rem' }}></i>
                                                <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>
                                                    {assignmentType === 'trainee' ? 'Trainee' : 'Trainer'} Information
                                                </h6>
                                            </div>
                                            <div className="row">
                                                <div className="col-12">
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        label={`Select ${assignmentType === 'trainee' ? 'Trainee' : 'Trainer'}`}
                                                        size="small"
                                                        value={newAssignment.person_id}
                                                        onChange={(e) => setNewAssignment({ ...newAssignment, person_id: e.target.value })}
                                                        error={!!assignmentErrors.person_id}
                                                        helperText={assignmentErrors.person_id}
                                                        disabled={isFetchingAvailable || isSubmitting}
                                                    >
                                                        {isFetchingAvailable ? (
                                                            <MenuItem disabled><CircularProgress size={16} /> Loading...</MenuItem>
                                                        ) : (
                                                            (assignmentType === 'trainee' ? availableTrainees : availableTrainers).map((person) => (
                                                                <MenuItem key={person.id} value={person.id}>
                                                                    {person.full_name || person.name} {person.email ? `(${person.email})` : ''}
                                                                </MenuItem>
                                                            ))
                                                        )}
                                                    </TextField>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dormitory Assignment */}
                                    <div className="card shadow-sm border-0 mb-3">
                                        <div className="card-body" style={{ padding: '1.5rem' }}>
                                            <div className="d-flex align-items-center mb-3">
                                                <i className="fas fa-building text-primary mr-2" style={{ fontSize: '1.1rem' }}></i>
                                                <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>Dormitory Assignment</h6>
                                            </div>
                                            <div className="row">
                                                <div className="col-12 col-md-6 mb-3">
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        label="Building"
                                                        size="small"
                                                        value={newAssignment.building_id}
                                                        onChange={(e) => handleBuildingChange(e.target.value)}
                                                        error={!!assignmentErrors.building_id}
                                                        helperText={assignmentErrors.building_id}
                                                        disabled={isSubmitting}
                                                    >
                                                        {buildings.map((building) => (
                                                            <MenuItem key={building.id} value={building.id}>
                                                                {building.name}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </div>
                                                <div className="col-12 col-md-6 mb-3">
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        label="Room Number"
                                                        size="small"
                                                        value={newAssignment.room_number}
                                                        onChange={(e) => setNewAssignment({ ...newAssignment, room_number: e.target.value })}
                                                        error={!!assignmentErrors.room_number}
                                                        helperText={assignmentErrors.room_number || (!newAssignment.building_id ? 'Select a building first' : '')}
                                                        disabled={isSubmitting || !newAssignment.building_id || isFetchingRooms}
                                                    >
                                                        {isFetchingRooms ? (
                                                            <MenuItem disabled><CircularProgress size={16} /> Loading rooms...</MenuItem>
                                                        ) : availableRooms.length > 0 ? (
                                                            availableRooms.map((room) => (
                                                                <MenuItem key={room.id} value={room.room_number}>
                                                                    {room.room_number} {room.capacity ? `(${room.occupied || 0}/${room.capacity})` : ''}
                                                                </MenuItem>
                                                            ))
                                                        ) : (
                                                            <MenuItem disabled>No rooms available</MenuItem>
                                                        )}
                                                    </TextField>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Check-in & Check-out */}
                                    <div className="card shadow-sm border-0">
                                        <div className="card-body" style={{ padding: '1.5rem' }}>
                                            <div className="d-flex align-items-center mb-3">
                                                <i className="fas fa-calendar-check text-info mr-2" style={{ fontSize: '1.1rem' }}></i>
                                                <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>Stay Duration</h6>
                                            </div>
                                            <div className="row">
                                                <div className="col-12 col-md-6 mb-3">
                                                    <TextField
                                                        fullWidth
                                                        type="date"
                                                        label="Check-in Date"
                                                        size="small"
                                                        value={newAssignment.check_in}
                                                        onChange={(e) => setNewAssignment({ ...newAssignment, check_in: e.target.value })}
                                                        error={!!assignmentErrors.check_in}
                                                        helperText={assignmentErrors.check_in}
                                                        disabled={isSubmitting}
                                                        InputLabelProps={{ shrink: true }}
                                                    />
                                                </div>
                                                <div className="col-12 col-md-6 mb-3">
                                                    <TextField
                                                        fullWidth
                                                        type="date"
                                                        label="Check-out Date"
                                                        size="small"
                                                        value={newAssignment.check_out}
                                                        onChange={(e) => setNewAssignment({ ...newAssignment, check_out: e.target.value })}
                                                        error={!!assignmentErrors.check_out}
                                                        helperText={assignmentErrors.check_out}
                                                        disabled={isSubmitting}
                                                        InputLabelProps={{ shrink: true }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer border-0" style={{ backgroundColor: '#fafafa', padding: '1rem 2rem' }}>
                                    <button type="button" className="btn btn-secondary shadow-sm px-4 py-2" onClick={() => !isSubmitting && setShowAssignModal(false)} style={{ fontSize: '13px', fontWeight: '600', borderRadius: '4px' }} disabled={isSubmitting}>
                                        <i className="fas fa-times mr-2"></i>
                                        Cancel
                                    </button>
                                    <Button type="submit" variant="contained" style={{ backgroundColor: assignmentType === 'trainee' ? '#28a745' : '#0078d4' }} disabled={isSubmitting}>
                                        {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Add Assignment'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Assignment Modal */}
            {showUpdateModal && selectedAssignment && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} role="dialog" aria-modal="true" onClick={() => !isSubmitting && setShowUpdateModal(false)}>
                    <div className="modal-dialog modal-dialog-scrollable modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header border-0" style={{ 
                                background: 'linear-gradient(135deg, #ff9800 0%, #e68900 100%)',
                                padding: '1.5rem 2rem',
                                color: 'white'
                            }}>
                                <div className="d-flex align-items-center justify-content-between w-100">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mr-3 shadow-sm" 
                                            style={{ width: '50px', height: '50px' }}>
                                            <i className="fas fa-edit text-warning" style={{ fontSize: '1.2rem' }}></i>
                                        </div>
                                        <h5 className="mb-0 font-weight-bold" style={{ fontSize: '18px', letterSpacing: '0.3px' }}>
                                            Update Assignment
                                        </h5>
                                    </div>
                                    <button type="button" className="close text-white" onClick={() => !isSubmitting && setShowUpdateModal(false)} disabled={isSubmitting}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={submitUpdate}>
                                <div className="modal-body" style={{ backgroundColor: '#f8f9fa', padding: '2rem' }}>
                                    {/* Assignment Info */}
                                    <div className="alert alert-info d-flex align-items-center mb-3" style={{ fontSize: '13px' }}>
                                        <i className="fas fa-info-circle mr-2"></i>
                                        <span>Updating assignment for <strong>{selectedAssignment.person_name}</strong> in <strong>{selectedAssignment.building_name}</strong> - Room <strong>{selectedAssignment.room_number}</strong></span>
                                    </div>

                                    {/* Check-in & Check-out */}
                                    <div className="card shadow-sm border-0 mb-3">
                                        <div className="card-body" style={{ padding: '1.5rem' }}>
                                            <div className="d-flex align-items-center mb-3">
                                                <i className="fas fa-calendar-check text-info mr-2" style={{ fontSize: '1.1rem' }}></i>
                                                <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>Stay Duration</h6>
                                            </div>
                                            <div className="row">
                                                <div className="col-12 col-md-6 mb-3">
                                                    <TextField
                                                        fullWidth
                                                        type="date"
                                                        label="Check-in Date"
                                                        size="small"
                                                        value={updateData.check_in}
                                                        onChange={(e) => setUpdateData({ ...updateData, check_in: e.target.value })}
                                                        disabled={isSubmitting}
                                                        InputLabelProps={{ shrink: true }}
                                                    />
                                                </div>
                                                <div className="col-12 col-md-6 mb-3">
                                                    <TextField
                                                        fullWidth
                                                        type="date"
                                                        label="Check-out Date"
                                                        size="small"
                                                        value={updateData.check_out}
                                                        onChange={(e) => setUpdateData({ ...updateData, check_out: e.target.value })}
                                                        disabled={isSubmitting}
                                                        InputLabelProps={{ shrink: true }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Status */}
                                    <div className="card shadow-sm border-0">
                                        <div className="card-body" style={{ padding: '1.5rem' }}>
                                            <div className="d-flex align-items-center mb-3">
                                                <i className="fas fa-money-bill-wave text-success mr-2" style={{ fontSize: '1.1rem' }}></i>
                                                <h6 className="mb-0 font-weight-bold" style={{ color: '#323130' }}>Payment Status</h6>
                                            </div>
                                            <div className="row">
                                                <div className="col-12">
                                                    <TextField
                                                        select
                                                        fullWidth
                                                        label="Payment Status"
                                                        size="small"
                                                        value={updateData.payment_status}
                                                        onChange={(e) => setUpdateData({ ...updateData, payment_status: e.target.value })}
                                                        disabled={isSubmitting}
                                                    >
                                                        <MenuItem value="unpaid">Unpaid</MenuItem>
                                                        <MenuItem value="partial">Partial</MenuItem>
                                                        <MenuItem value="paid">Paid</MenuItem>
                                                    </TextField>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer border-0" style={{ backgroundColor: '#fafafa', padding: '1rem 2rem' }}>
                                    <button type="button" className="btn btn-secondary shadow-sm px-4 py-2" onClick={() => !isSubmitting && setShowUpdateModal(false)} style={{ fontSize: '13px', fontWeight: '600', borderRadius: '4px' }} disabled={isSubmitting}>
                                        <i className="fas fa-times mr-2"></i>
                                        Cancel
                                    </button>
                                    <Button type="submit" variant="contained" style={{ backgroundColor: '#ff9800' }} disabled={isSubmitting}>
                                        {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Update Assignment'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminDormitory;