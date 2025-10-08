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
    const [activeTab, setActiveTab] = useState('capacity');
    const [isFetchingBuildings, setIsFetchingBuildings] = useState(true);
    const [buildings, setBuildings] = useState([]);
    const [editRowId, setEditRowId] = useState(null);
    const [editData, setEditData] = useState({});
    const [showAddRoomModal, setShowAddRoomModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newRoom, setNewRoom] = useState({
        document_id: '',
        room_name: '',
        room_slot: '',
        room_cost: ''
    });
    const [buildingErrors, setBuildingErrors] = useState({});
    const [roomErrors, setRoomErrors] = useState({});


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
        if (activeTab === 'requests') fetchRequests();

        // const intervalId = setInterval(fetchBuildings(false), 2000);
        // return () => clearInterval(intervalId);
    }, [activeTab]);

    //Buildings & Capacity
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
    await axios.get(`${url}/dormitory-admin/dormitory/remove/${id}`, {
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
        setEditData((prev) => ({ ...prev, 'document_id': id }));
        console.log('hlahdlasd', editData);

        const response = await axios.post(`${url}/dormitory-admin/dormitory/create_or_update_dormitory`, editData, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
        });
        console.log(response);
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
            onChange={(e) => handleEditChange('room_name', e.target.value)}
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
            onChange={(e) => handleEditChange('room_slot', e.target.value)}
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
            onChange={(e) => handleEditChange('room_cost', e.target.value)}
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
                                <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center"
                                    style={{ backgroundColor: "#fafafa", borderBottom: "2px solid #e5e5e5", padding: "0.75rem 1rem", }}>
                                    <div className="d-flex align-items-center">
                                        <span className="fas fa-building text-success mr-2" style={{ fontSize: "14px" }} ></span>
                                        <h6 className="mb-0" style={{ fontSize: "14px", fontWeight: "600", color: "#333" }} >
                                        Capacity Management
                                        </h6>
                                    </div>

                                    <div className="d-flex align-items-center mt-2 mt-md-0" style={{ gap: "0.5rem" }}>
                                        <button type="button" className="btn btn-success btn-sm" onClick={() => {
                                            setNewRoom({ building_id: "", room_number: "", capacity: "" });
                                            setRoomErrors({});
                                            setShowAddRoomModal(true);
                                        }} style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                                        <i className="fas fa-door-open mr-1"></i>
                                        <span className="d-none d-md-inline">Add </span>Room
                                        </button>
                                    </div>
                                    </div>
                                <div className="card-body" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                                    <div className="tab-content">
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


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
        </>
    );
};

export default AdminDormitory;