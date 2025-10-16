import { Link, useNavigate, useParams } from "react-router-dom";
import useDateFormat from "../../../hooks/useDateFormat";
import useSystemURLCon from "../../../hooks/useSystemURLCon";
import useWebToken from "../../../hooks/useWebToken";
import { useEffect, useState } from "react";
import axios from "axios";
import PageName from "../component/PageName";
import SkeletonLoader from "../component/SkeletonLoader/SkeletonLoader";
import CreateOrUpdate from "./component/CreateOrUpdate";
import MSWDDataTable from "../component/MSWDDataTable/MSWDDataTable";
import NoDataFound from "../component/NoDataFound";

const ViewFamily = () => {
    const { formatDateToReadable, calculateAge } = useDateFormat();
    const navigate = useNavigate();
    const { url, urlWithoutApi } = useSystemURLCon();
    const { getToken, removeToken } = useWebToken();
    const { family_id } = useParams();
    const [familyCompositionInfo, setFamilyCompositionInfo] = useState(null);
    const [availedAssistance, setAvailedAssistance] = useState(null);
    const [isFetching, setIsFetching] = useState(true);
    const [viewMode, setViewMode] = useState('view');

    useEffect(() => { GetFamilyCompositionData(); }, []);

    const GetFamilyCompositionData = async () => {
        try {
            setIsFetching(true);

            const token = getToken();
            const response = await axios.get(`${url}/family/list/${family_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setFamilyCompositionInfo(response.data.composition);
            setAvailedAssistance(response.data.availedAssistance);
        } catch (error) {
            if(error.response.status === 500) {
                removeToken();
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
            setIsFetching(false);
        }
    }

    const tableColumns = [
        {
            name: "Family Member",
            selector: row => `${row.resident.fname} ${row.resident.mname} ${row.resident.lname} ${row.resident.suffix ?? ''}`,
            sortable: true,
            minWidth: "500px",
            maxWidth: "500px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Assistance",
            selector: row => row.assistance.name,
            sortable: true,
            minWidth: "300px",
            maxWidth: "300px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Date Acquired",
            selector: row => formatDateToReadable(row.date_acquired),
            sortable: true,
            minWidth: "150px",
            maxWidth: "150px",
            style: { whiteSpace: "nowrap" },
        }
    ];

    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'Family',
                    'last' : false,
                },
                {
                    'name' : 'Families',
                    'last' : false,
                    'address' : '/welcome/family/list'
                },
                {
                    'name' : 'View',
                    'last' : false,
                },
                {
                    'name' : isFetching ? '...' : `${familyCompositionInfo.name}`,
                    'last' : true,
                    'address' : `/welcome/family/list/${family_id}`
                }
            ]}/>

            {
                isFetching 
                    ? <SkeletonLoader />
                    : <section className="content">
                        <div className="container-fluid">
                            <div className="row fade-up">
                                <div className="col-xl-12">
                                    <div className="card card-primary card-outline card-outline-tabs">
                                        <div className="card-header p-0 border-bottom-0">
                                            <ul className="nav nav-tabs small" id="custom-tabs-header-tab" role="tablist">
                                                <li className="nav-item">
                                                    <a className="nav-link py-1 active" id="custom-tabs-main-tab" data-toggle="pill" href="#custom-tabs-main" role="tab" aria-controls="custom-tabs-main" aria-selected="true">
                                                        <span className="fas fa-home pr-1"></span>
                                                        Profile
                                                    </a>
                                                </li>

                                                <li className="nav-item">
                                                    <a className="nav-link py-1" id="custom-tabs-availed-assistance-tab" data-toggle="pill" href="#custom-tabs-availed-assistance" role="tab" aria-controls="custom-tabs-availed-assistance" aria-selected="true">
                                                        <span className="fas fa-people-carry pr-1"></span>
                                                        Availed Assistance
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="card-body p-0">
                                            <div className="tab-content" id="custom-tabs-header-tabContent">
                                                <div className="tab-pane fade show active" id="custom-tabs-main" role="tabpanel" aria-labelledby="custom-tabs-main-tab">
                                                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom px-3">
                                                        <div>
                                                            <button onClick={() => setViewMode('view')} className={`text--fontPos13--xW8hS py-0 btn btn-sm btn-${ viewMode === 'view' ? 'primary elevation-1' : 'default' }`}>
                                                                <i className="fas fa-eye mr-1"></i> View Mode
                                                            </button>
                                                            <button onClick={() => setViewMode('update')} className={`text--fontPos13--xW8hS py-0 btn btn-sm btn-${ viewMode === 'update' ? 'primary elevation-1' : 'default' } ml-1`}>
                                                                <i className="fas fa-edit mr-1"></i> Update Mode
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="card elevation-0 border-0 p-0 m-0 rounded-0">
                                                        <div className='card-body p-0'>
                                                            {
                                                                viewMode === 'view'
                                                                    ? <>
                                                                        <div className="row p-3 px-4">
                                                                            <div className="col-xl-12 h5">
                                                                                <strong>{familyCompositionInfo.name}</strong>
                                                                            </div>
                                                                           
                                                                            <div className="col-xl-12 mt-1">
                                                                                <label className="form-label small text-muted text-bold mb-1" htmlFor="">Composition:</label>
                                                                                <div className="w-100">
                                                                                    <div className="card mb-0 px-0 elevation-0">
                                                                                        <div className="card-body p-0 small">
                                                                                            {
                                                                                                familyCompositionInfo['members'].map((comp, index) => (
                                                                                                    <div className={`row py-2 ${index < familyCompositionInfo['members'].length - 1 && 'border-bottom'}`}>
                                                                                                        <div className="col-xl-1">
                                                                                                            <img src={`${urlWithoutApi}/user-images/${comp.resident.profile_picture}`} loading='lazy' class="rounded-circle" height="45" />
                                                                                                        </div>

                                                                                                        <div className="col-xl-10">
                                                                                                            <strong>{ comp.resident.fname + ' ' + comp.resident.mname + ' ' + comp.resident.lname + ' ' + (comp.resident.suffix ?? '') }</strong><br/>
                                                                                                            { calculateAge(comp.resident.birthday) } years old {comp.is_head == "YES" && (<> • <span className="text-danger text-bold">HEAD</span> </>)}  
                                                                                                        </div>

                                                                                                        <div className="col-xl-1 text-center pt-2">
                                                                                                            <Link to={`/welcome/resident/list/${comp.resident.id}`} className="text-bold text-muted">
                                                                                                                View <span className="fas fa-eye ml-1"></span>
                                                                                                            </Link>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ))
                                                                                            }
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="col-xl-12 mt-1 small">
                                                                                <label className="form-label text-muted text-bold mb-1" htmlFor="">Housing Unit:</label>
                                                                            
                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-3 text-bold">House Type</div>
                                                                                    <div className="col-xl-9">{familyCompositionInfo.housing_unit.house_type}</div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-3 text-bold">House Structure</div>
                                                                                    <div className="col-xl-9">{familyCompositionInfo.housing_unit.house_structure}</div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-3 text-bold">Tenure Status</div>
                                                                                    <div className="col-xl-9">{familyCompositionInfo.housing_unit.tenure_status}</div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-3 text-bold">Source of Water</div>
                                                                                    <div className="col-xl-9">{familyCompositionInfo.housing_unit.source_of_water}</div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-3 text-bold">With Electricity</div>
                                                                                    <div className={`col-xl-9 text-${familyCompositionInfo.housing_unit.with_electricity === 'YES' ? 'success' : 'danger'}`}>
                                                                                        {
                                                                                            familyCompositionInfo.housing_unit.with_electricity === 'YES'
                                                                                                ? <span className="fas fa-check"></span>
                                                                                                : <span className="fas fa-times"></span>
                                                                                        }
                                                                                    </div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-3 text-bold">A Farm Owner</div>
                                                                                    <div className={`col-xl-9 text-${familyCompositionInfo.housing_unit.a_farm_owner === 'YES' ? 'success' : 'danger'}`}>
                                                                                        {
                                                                                            familyCompositionInfo.housing_unit.a_farm_owner === 'YES'
                                                                                                ? <span className="fas fa-check"></span>
                                                                                                : <span className="fas fa-times"></span>
                                                                                        }
                                                                                    </div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-3 text-bold">A Solo Parent</div>
                                                                                    <div className={`col-xl-9 text-${familyCompositionInfo.housing_unit.a_solo_parent === 'YES' ? 'success' : 'danger'}`}>
                                                                                        {
                                                                                            familyCompositionInfo.housing_unit.a_solo_parent === 'YES'
                                                                                                ? <span className="fas fa-check"></span>
                                                                                                : <span className="fas fa-times"></span>
                                                                                        }
                                                                                    </div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-3 text-bold">A 4ps Beneficiary</div>
                                                                                    <div className={`col-xl-9 text-${familyCompositionInfo.housing_unit.a_4ps_beneficiary === 'YES' ? 'success' : 'danger'}`}>
                                                                                        {
                                                                                            familyCompositionInfo.housing_unit.a_4ps_beneficiary === 'YES'
                                                                                                ? <span className="fas fa-check"></span>
                                                                                                : <span className="fas fa-times"></span>
                                                                                        }
                                                                                    </div>
                                                                                </div>

                                                                                <div className="row py-2">
                                                                                    <div className="col-xl-3 text-bold">Gadgets & Appliances Owned</div>
                                                                                    <div className="col-xl-9">
                                                                                        {
                                                                                            familyCompositionInfo.housing_unit.housing_unit_gadgets.map((gadget, _) => (
                                                                                                <>
                                                                                                    <div className="w-100">
                                                                                                        { gadget.gadget }
                                                                                                    </div>
                                                                                                </>
                                                                                            ))
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </> 
                                                                    : <CreateOrUpdate 
                                                                        httpMethod='update'
                                                                        data={familyCompositionInfo} 
                                                                        documentId={family_id} 
                                                                        onViewPage={true} 
                                                                        callbackFunction={() => {
                                                                            GetFamilyCompositionData();
                                                                            setViewMode('view');
                                                                        }}
                                                                    />
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="tab-pane fade p-4" id="custom-tabs-availed-assistance" role="tabpanel" aria-labelledby="custom-tabs-availed-assistance-tab">
                                                    {
                                                        availedAssistance.length > 0
                                                            ? <MSWDDataTable 
                                                                progressPending={isFetching}
                                                                columns={tableColumns} 
                                                                data={availedAssistance}
                                                                selectableRows={false}
                                                                selectedRows={null}
                                                            /> : <NoDataFound message="No availed assistance." />
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
            }
        </>
    )
}

export default ViewFamily