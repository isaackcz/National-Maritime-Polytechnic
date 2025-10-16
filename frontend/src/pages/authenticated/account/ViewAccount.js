import { useEffect, useState } from 'react';
import PageName from '../component/PageName'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import useWebToken from '../../../hooks/useWebToken';
import SkeletonLoader from '../component/SkeletonLoader/SkeletonLoader';
import CreateOrUpdate from './component/CreateOrUpdate';
import useDateFormat from '../../../hooks/useDateFormat';
import MSWDDataTable from '../component/MSWDDataTable/MSWDDataTable';
import NoDataFound from '../component/NoDataFound';

const ViewAccount = () => {
    const { formatDateToReadable } = useDateFormat();
    const navigate = useNavigate();
    const { url, urlWithoutApi } = useSystemURLCon();
    const { getToken, removeToken } = useWebToken();
    const [accountInfo, setAccountInfo] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [viewMode, setViewMode] = useState('view');
    const { account_id } = useParams();

    const [activities, setActivities] = useState([]);

    useEffect(() => { GetAccountInfo(); }, []);

    const GetAccountInfo = async () => {
        try {
            setIsFetching(!isInitialLoad);

            const token = getToken();
            const response = await axios.get(`${url}/accounts/list/${account_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setActivities(response.data.activities);
            setAccountInfo(response.data.accountInfo);
        } catch (error) {
            if(error.response.status === 500) {
                removeToken();
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
            setIsInitialLoad(true);
            setIsFetching(false);
        }
    }

    const tableColumns = [
        {
            name: "Date",
            selector: row => formatDateToReadable(row.created_at, true),
            sortable: true,
            minWidth: "300px",
            maxWidth: "300px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Activity",
            selector: row => row.user_activity,
            sortable: true,
        },
    ];

    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'Account',
                    'last' : false,
                },
                {
                    'name' : 'Accounts',
                    'last' : false,
                    'address' : '/welcome/account/list'
                },
                {
                    'name' : 'View',
                    'last' : false,
                },
                {
                    'name' : isFetching ? '...' : `${accountInfo.fname} ${accountInfo.mname} ${accountInfo.lname} ${accountInfo.suffix ?? ''}`,
                    'last' : true,
                    'address' : `/welcome/account/list/${account_id}`
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
                                                    <a className="nav-link py-1" id="custom-tabs-account-history-tab" data-toggle="pill" href="#custom-tabs-account-history" role="tab" aria-controls="custom-tabs-account-history" aria-selected="true">
                                                        <span className="fas fa-people-carry pr-1"></span>
                                                        Account History
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
                                                                            <div className="col-xl-5 text-center">
                                                                                <img src={`${urlWithoutApi}/user-images/${accountInfo.profile_picture}`} className="img-fluid w-100" alt="" loading='lazy' />
                                                                            </div>

                                                                            <div className="col-xl-7 mt-1 small">
                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-3 text-bold">Full name</div>
                                                                                    <div className="col-xl-9">{accountInfo.fname + ' ' + accountInfo.mname + ' ' + accountInfo.lname + ' ' + (accountInfo.suffix ?? '')}</div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-3 text-bold">Sex</div>
                                                                                    <div className="col-xl-9">{accountInfo.sex}</div>
                                                                                </div>

                                                                                <div className="row border-bottom py-2">
                                                                                    <div className="col-xl-3 text-bold">Email</div>
                                                                                    <div className="col-xl-9">{accountInfo.email}</div>
                                                                                </div>

                                                                                <div className="row py-2">
                                                                                    <div className="col-xl-3 text-bold">Role</div>
                                                                                    <div className="col-xl-9">{accountInfo.role}</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </> 
                                                                    : <CreateOrUpdate 
                                                                        httpMethod='update'
                                                                        data={accountInfo} 
                                                                        documentId={account_id} 
                                                                        callbackFunction={() => {
                                                                            GetAccountInfo();
                                                                            setViewMode('view');
                                                                        }}
                                                                    />
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="tab-pane fade p-4" id="custom-tabs-account-history" role="tabpanel" aria-labelledby="custom-tabs-account-history-tab">
                                                    {
                                                        activities.length > 0
                                                            ? <MSWDDataTable 
                                                                progressPending={isFetching}
                                                                columns={tableColumns} 
                                                                data={activities}
                                                                selectableRows={false}
                                                                selectedRows={null}
                                                            /> : <NoDataFound message="No activities." />
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

export default ViewAccount