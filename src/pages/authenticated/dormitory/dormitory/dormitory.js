import { useEffect, useState } from 'react';
import { TextField, Button, CircularProgress } from '@mui/material';
import PageName from '../../../components/PageName';
import NMPDataTable from '../../../components/NMPDataTable/NMPDataTable';
import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';
import NoDataFound from '../../../components/NoDataFound';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import useGetToken from '../../../../hooks/useGetToken';
import axios from 'axios';
import RoomTenantsModal from './RoomTenantsModal';
import OverdueTenantsModal from './OverdueTenantsModal';

const AdminDormitory = () => {
    const { url } = useSystemURLCon();
    const { getToken } = useGetToken();
    const [isFetchingBuildings, setIsFetchingBuildings] = useState(true);
    const [buildings, setBuildings] = useState([]);
    const [editRowId, setEditRowId] = useState(null);
    const [editData, setEditData] = useState({});
    const [showAddRoomModal, setShowAddRoomModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newRoom, setNewRoom] = useState({ document_id: '', room_name: '', room_slot: '', room_cost: '' });
    const [roomErrors, setRoomErrors] = useState({});
    const [showTenantsModal, setShowTenantsModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomTenants, setRoomTenants] = useState([]);
    const [showOverdueModal, setShowOverdueModal] = useState(false);
    const [overdueTenants, setOverdueTenants] = useState([]);

    const fetchBuildings = async (isInitialLoad) => {
        try {
            setIsFetchingBuildings(isInitialLoad);
            const token = getToken('csrf-token');

            const response = await axios.get(`${url}/dormitory-admin/dormitory/get`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' }
            });
            const data = response?.data?.dormitories || [];
            setBuildings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log('Failed to fetch buildings:', error.response);
            setBuildings([]);
        } finally {
            setIsFetchingBuildings(false);
        }
    };

    useEffect(() => {
        fetchBuildings(true);
    }, []);

    const validateRoom = () => {
        const errs = {};
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
            
            const payload = { room_name: newRoom.room_name.trim(), room_slot: Number(newRoom.room_slot), room_cost: Number(newRoom.room_cost), httpMethod: "POST" };
            const response = await axios.post(`${url}/dormitory-admin/dormitory/create_or_update_dormitory`, payload, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' }
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

const deleteBuilding = async (id) => {
  if (!window.confirm('Delete this building? This cannot be undone.')) return;
  try {
    const token = getToken('csrf-token');
            
    await axios.get(`${url}/dormitory-admin/dormitory/remove/${id}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    });
    await fetchBuildings();
  } catch (error) {
    alert(error?.response?.data?.message || 'Failed to delete building');
  }
};

    const startEdit = (row) => {
    setEditRowId(row.id);
    setEditData({ ...row });
    };

    const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
    };

    const saveBuilding = async (id) => {
    if (!window.confirm('Save changes?')) return;
    try {
        const token = getToken('csrf-token');
            
        setEditData((prev) => ({ ...prev, 'document_id': id }));
        const response = await axios.post(`${url}/dormitory-admin/dormitory/create_or_update_dormitory`, editData, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        });
        setEditRowId(null);
        await fetchBuildings();
    } catch (error) {
        alert(error?.response?.data?.message || 'Failed to update building');
    }
    };

    const cancelEdit = () => {
    setEditRowId(null);
    };

    const fetchRoomTenants = async (room) => {
        try {
            const token = getToken('csrf-token');

            const response = await axios.get(`${url}/dormitory-admin/dormitory/get/tenants/${room.id}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            setRoomTenants(response?.data?.tenants || []);
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
            setRoomTenants([]);
        }
    };

    const handleSlotClick = async (room) => {
        setSelectedRoom(room);
        await fetchRoomTenants(room);
        setShowTenantsModal(true);
    };

    const fetchOverdueTenants = async (room) => {
        try {
            const token = getToken('csrf-token');

            const response = await axios.get(`${url}/dormitory-admin/dormitory/get/overdue-tenants/${room.id}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            setOverdueTenants(response?.data?.overdue_tenants || []);
        } catch (error) {
            console.error('Failed to fetch overdue tenants:', error);
            setOverdueTenants([]);
        }
    };

    const handleOverdueClick = async (room) => {
        if (room.overdue_count === 0) return;
        setSelectedRoom(room);
        await fetchOverdueTenants(room);
        setShowOverdueModal(true);
    };

    const toggleRoomStatus = async (room) => {
        const newStatus = room.room_status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
        const confirmMsg = newStatus === 'UNAVAILABLE' 
            ? 'Disable this room? Tenants will be notified and no new tenants can be accepted.' 
            : 'Enable this room? It will be available for new tenants.';
        
        if (!window.confirm(confirmMsg)) return;
        
        try {
            const token = getToken('csrf-token');
            
            const response = await axios.post(`${url}/dormitory-admin/dormitory/toggle-status/${room.id}`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
            );
            
            if (response.status === 200) {
                await fetchBuildings(false);
                alert(response?.data?.message || `Room ${newStatus === 'UNAVAILABLE' ? 'disabled' : 'enabled'} successfully. Tenants have been notified.`);
            }
        } catch (error) {
            alert(error?.response?.data?.message || 'Failed to update room status');
        }
    };

    const conditionalRowStyles = [
        {
            when: row => row.room_status === 'UNAVAILABLE',
            style: {
                backgroundColor: '#f5f5f5',
                color: '#999',
                opacity: '0.8',
            },
        },
    ];

    const buildingColumns = [
    {
        name: 'Room Name',
            selector: (row) => editRowId === row.id ? (
                <input type="text" className="form-control form-control-sm" value={editData.room_name || ''} onChange={(e) => handleEditChange('room_name', e.target.value)} />
            ) : (row.room_name || '—'),
        sortable: true,
    },
    {
        name: 'Slot',
            cell: (row) => editRowId === row.id ? (
                <input type="number" className="form-control form-control-sm" value={editData.room_slot || 0} onChange={(e) => handleEditChange('room_slot', e.target.value)} style={{ width: '80px' }} />
            ) : (
                <span onClick={() => handleSlotClick(row)} style={{ cursor: 'pointer', color: '#0078d4', textDecoration: 'underline', fontWeight: '500' }} title="Click to view tenants">
                    {row.tenants_count || 0}/{row.room_slot || 0}
                </span>
        ),
        sortable: true,
        maxWidth: '100px',
    },
    {
        name: 'Daily Rate',
            selector: (row) => editRowId === row.id ? (
                <input type="number" className="form-control form-control-sm" value={editData.room_cost || ''} onChange={(e) => handleEditChange('room_cost', e.target.value)} style={{ width: '100px' }} />
            ) : (row.room_cost ? `₱${Number(row.room_cost).toLocaleString()}` : '—'),
            sortable: true,
        },
        {
            name: 'Status',
            cell: (row) => <span className={`badge badge-${row.room_status === 'AVAILABLE' ? 'success' : 'secondary'}`}>{row.room_status || 'AVAILABLE'}</span>,
            sortable: true,
            maxWidth: '120px',
        },
        {
            name: 'Overdue',
            cell: (row) => row.overdue_count > 0 ? (
                <span onClick={() => handleOverdueClick(row)} className="badge badge-danger" style={{ cursor: 'pointer', fontSize: '13px' }} title="Click to view overdue tenants">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {row.overdue_count}
                </span>
            ) : (
                <span className="badge badge-success" style={{ fontSize: '13px' }}>
                    <i className="fas fa-check-circle mr-1"></i>
                    0
                </span>
        ),
        sortable: true,
            maxWidth: '100px',
    },
    {
        name: 'Action',
            cell: (row) => editRowId === row.id ? (
            <div className="btn-group btn-group-sm">
                    <button type="button" className="btn btn-success" title="Save" onClick={() => saveBuilding(row.id)}><i className="fas fa-save"></i></button>
                    <button type="button" className="btn btn-secondary" title="Cancel" onClick={cancelEdit}><i className="fas fa-times"></i></button>
            </div>
        ) : (
            <div className="btn-group btn-group-sm">
                    <button type="button" className="btn btn-info" title="Edit" onClick={() => startEdit(row)}><i className="fas fa-user-edit"></i></button>
                    <button type="button" className={`btn btn-${row.room_status === 'AVAILABLE' ? 'warning' : 'success'}`} title={row.room_status === 'AVAILABLE' ? 'Disable Room' : 'Enable Room'} onClick={() => toggleRoomStatus(row)}><i className={`fas fa-${row.room_status === 'AVAILABLE' ? 'ban' : 'check-circle'}`}></i></button>
                    {row.tenants_count === 0 && <button type="button" className="btn btn-danger" title="Delete" onClick={() => deleteBuilding(row.id)}><i className="fas fa-trash"></i></button>}
            </div>
        ),
        ignoreRowClick: true,
        button: true,
            maxWidth: '160px',
    },
    ];

    return (
        <>
            <PageName pageName={[{ name: 'Admin', last: false, address: '/admin/dashboard' }, { name: 'Dormitory', last: true, address: '/admin/dormitory' }]} />

            <section className="content">
                <div className="container-fluid">
                        <div className="col-xl-12">
                            <div className="alert alert-info border-0 shadow-sm mb-4" style={{ backgroundColor: '#e7f3ff', borderLeft: '4px solid #0078d4' }}>
                            <span className="fas fa-info-circle text-primary mr-3" style={{ fontSize: '24px' }}></span>
                            <strong style={{ color: "black" }}>Manage Dormitory</strong>
                            <p className="mb-0" style={{ fontSize: '13px', color: "black" }}>Manage building capacity, trainee room assignments, and reservation requests.</p>
                            </div>

                        <div className="card shadow-sm border-0">
                            <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: "#fafafa", borderBottom: "2px solid #e5e5e5", padding: "0.75rem 1rem" }}>
                                <h6 className="mb-0" style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>
                                    <span className="fas fa-building text-success mr-2"></span>
                                        Capacity Management
                                        </h6>
                                <button type="button" className="btn btn-success btn-sm" onClick={() => { setNewRoom({ document_id: "", room_number: "", capacity: "" }); setRoomErrors({}); setShowAddRoomModal(true); }} style={{ fontSize: "12px" }}>
                                        <i className="fas fa-door-open mr-1"></i>
                                        <span className="d-none d-md-inline">Add </span>Room
                                        </button>
                                                </div>
                                                <div className="card-body p-3">
                                {isFetchingBuildings ? <SkeletonLoader /> : buildings.length > 0 ? <NMPDataTable progressPending={isFetchingBuildings} columns={buildingColumns} data={buildings} selectableRows={false} conditionalRowStyles={conditionalRowStyles} /> : <NoDataFound />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {showAddRoomModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} onClick={() => !isSubmitting && setShowAddRoomModal(false)}>
                    <div className="modal-dialog modal-md modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0 d-flex justify-content-between" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20883b 100%)', padding: '1.5rem 2rem' }}>
                                    <div className="d-flex align-items-center">
                                    <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mr-3" style={{ width: '50px', height: '50px' }}>
                                            <i className="fas fa-door-open text-success" style={{ fontSize: '1.2rem' }}></i>
                                        </div>
                                        <div>
                                            <h5 className="mb-1 font-weight-bold text-white">Add Room</h5>
                                        <p className="mb-0 text-white-50" style={{ fontSize: '13px' }}>Add a new room to a building</p>
                                        </div>
                                    </div>
                                <button type="button" className="close text-white" onClick={() => !isSubmitting && setShowAddRoomModal(false)} disabled={isSubmitting} style={{ opacity: 1 }}><span>&times;</span></button>
                            </div>

                            <form onSubmit={submitAddRoom}>
                                <div className="modal-body" style={{ padding: '2rem' }}>
                                            <h6 className="mb-3 font-weight-bold" style={{ color: '#323130' }}>
                                                <i className="fas fa-door-open mr-2 text-primary"></i>
                                                Room Details
                                            </h6>
                                            <div className="row">
                                                <div className="col-12 col-sm-6 mb-3">
                                            <TextField fullWidth size="small" label="Room Name" value={newRoom.room_name} onChange={(e) => setNewRoom({ ...newRoom, room_name: e.target.value })} error={Boolean(roomErrors.room_name)} helperText={roomErrors.room_name || ''} />
                                                </div>
                                                <div className="col-12 col-sm-6 mb-3">
                                            <TextField fullWidth size="small" type="number" label="Capacity" value={newRoom.room_slot} onChange={(e) => setNewRoom({ ...newRoom, room_slot: e.target.value })} error={Boolean(roomErrors.room_slot)} helperText={roomErrors.room_slot || ''} inputProps={{ min: 1 }} />
                                                </div>
                                        <div className="col-12 mb-3">
                                            <TextField fullWidth size="small" label="Room Cost (₱)" type="number" value={newRoom.room_cost} onChange={(e) => setNewRoom({ ...newRoom, room_cost: e.target.value })} error={Boolean(roomErrors.room_cost)} helperText={roomErrors.room_cost || ''} />
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer border-0" style={{ backgroundColor: '#fafafa', padding: '1rem 2rem' }}>
                                    <button type="button" className="btn btn-secondary px-4 py-2" onClick={() => !isSubmitting && setShowAddRoomModal(false)} disabled={isSubmitting} style={{ fontSize: '13px', fontWeight: '600' }}>
                                        <i className="fas fa-times mr-2"></i>Cancel
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

            <RoomTenantsModal show={showTenantsModal} onClose={() => setShowTenantsModal(false)} room={selectedRoom} tenants={roomTenants} />
            <OverdueTenantsModal show={showOverdueModal} onClose={() => setShowOverdueModal(false)} room={selectedRoom} overdueTenants={overdueTenants} />
        </>
    );
};

export default AdminDormitory;
