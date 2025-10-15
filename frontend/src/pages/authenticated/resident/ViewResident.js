import { useEffect, useState } from 'react';
import SkeletonLoader from '../component/SkeletonLoader/SkeletonLoader';
import PageName from '../component/PageName';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useWebToken from '../../../hooks/useWebToken';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import axios from 'axios';
import CreateUpdateResident from './component/CreateUpdateResident';
import useDateFormat from '../../../hooks/useDateFormat';
import MSWDDataTable from '../component/MSWDDataTable/MSWDDataTable';
import NoDataFound from '../component/NoDataFound';

const ViewResident = () => {
    const { formatDateToReadable, calculateAge } = useDateFormat();
    const navigate = useNavigate();
    const { url, urlWithoutApi } = useSystemURLCon();
    const { getToken, removeToken } = useWebToken();
    const { resident_id } = useParams();
    const [availedAssistance, setAvailedAssistance] = useState([]);
    const [residentInfo, setResidentInfo] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [viewMode, setViewMode] = useState('view');

    useEffect(() => {
        GetResidentInfo(true);

        const intervalId = setInterval(() => { GetResidentInfo(false); }, 2000);
        return () => { clearInterval(intervalId); };
    }, []);

    const GetResidentInfo = async (isInitialLoad) => {
        try {
            setIsFetching(isInitialLoad);

            const token = getToken();
            const response = await axios.get(`${url}/residents/list/${resident_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setResidentInfo(response.data.residentInfo);
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
            name: "Assistance",
            selector: row => row.assistance.name,
            sortable: true,
            minWidth: "600px",
            maxWidth: "600px",
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
                    'name' : 'Resident',
                    'last' : false,
                },
                {
                    'name' : 'Residents',
                    'last' : false,
                    'address' : '/welcome/resident/list'
                },
                {
                    'name' : 'View',
                    'last' : false,
                },
                {
                    'name' : isFetching ? '...' : `${residentInfo.fname} ${residentInfo.mname} ${residentInfo.lname} ${residentInfo.suffix ?? ''}`,
                    'last' : true,
                    'address' : `/welcome/resident/list/${resident_id}`
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
                                                        <span className="fas fa-user pr-1"></span>
                                                        Personal
                                                    </a>
                                                </li>

                                                <li className="nav-item">
                                                    <a className="nav-link py-1" id="custom-tabs-availed-assistance-tab" data-toggle="pill" href="#custom-tabs-availed-assistance" role="tab" aria-controls="custom-tabs-availed-assistance" aria-selected="true">
                                                        <span className="fas fa-wallet pr-1"></span>
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
                                                                        <div className="row p-3">
                                                                            <div className="col-xl-5 text-center">
                                                                                <img src={`${urlWithoutApi}/user-images/${residentInfo.profile_picture}`} className="img-fluid w-100" alt="" loading='lazy' />
                                                                            </div>

                                                                            <div className="col-xl-7 small">
                                                                                <div className="row border-bottom pb-2">
                                                                                    <div className="col-xl-4 px-3 text-bold">Full name:</div>
                                                                                    <div className="col-xl-8">{residentInfo.fname + ' ' + residentInfo.mname + ' ' + residentInfo.lname + ' ' + (residentInfo.suffix ?? '')}</div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-4 px-3 text-bold">Civil Status:</div>
                                                                                    <div className="col-xl-8">{residentInfo.civil_status}</div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-4 px-3 text-bold">Highest Educational Attainment:</div>
                                                                                    <div className="col-xl-8">{residentInfo.highest_educational_attainment}</div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-4 px-3 text-bold">Sex:</div>
                                                                                    <div className="col-xl-8">{residentInfo.sex}</div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-4 px-3 text-bold">Birthday:</div>
                                                                                    <div className="col-xl-8">{formatDateToReadable(residentInfo.birthday)} ({ calculateAge(residentInfo.birthday) } years old)</div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-4 px-3 text-bold">Occupation:</div>
                                                                                    <div className="col-xl-8">{residentInfo.occupation ?? '-'}</div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-4 px-3 text-bold">Monthly Income:</div>
                                                                                    <div className="col-xl-8">{residentInfo.monthly_income ? `₱${residentInfo.monthly_income}` : '-'}</div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-4 px-3 text-bold">Religion:</div>
                                                                                    <div className="col-xl-8">{residentInfo.religion.name}</div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-4 px-3 text-bold">Ethnicity:</div>
                                                                                    <div className="col-xl-8">{residentInfo.ethnicity.name}</div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-4 px-3 text-bold">Is PWD?:</div>
                                                                                    <div className={`col-xl-8 text-${residentInfo.is_pwd === 'YES' ? 'success' : 'danger'}`}>
                                                                                        {
                                                                                            residentInfo.is_pwd === 'YES'
                                                                                                ? <span className="fas fa-check"></span>
                                                                                                : <span className="fas fa-times"></span>
                                                                                        }
                                                                                    </div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-4 px-3 text-bold">Composition:</div>
                                                                                    <div className="col-xl-8">
                                                                                        {  residentInfo.composition !== 'NOT IN FAMILY' ? (
                                                                                            <>
                                                                                                <span className="text-bold text-warning">{residentInfo.composition}</span>
                                                                                                {" - "}
                                                                                                <Link to={`/welcome/family/list/${residentInfo.family_member.composition.id}`}>{residentInfo.family_member.composition.name}</Link>
                                                                                            </>
                                                                                        ) : (residentInfo.composition) }
                                                                                    </div>
                                                                                </div>

                                                                                <div className="row py-2">
                                                                                    <div className="col-xl-4 px-3 text-bold">Barangay:</div>
                                                                                    <div className="col-xl-8">{residentInfo.barangay}</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </> 
                                                                    : <CreateUpdateResident
                                                                        data={residentInfo} 
                                                                        onViewPage={true} 
                                                                        httpMethod='update'
                                                                        callbackFunction={() => {
                                                                            GetResidentInfo();
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

export default ViewResident;