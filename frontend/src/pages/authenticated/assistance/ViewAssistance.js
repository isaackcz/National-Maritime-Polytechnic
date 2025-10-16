import React, { useEffect, useState } from 'react'
import PageName from '../component/PageName';
import SkeletonLoader from '../component/SkeletonLoader/SkeletonLoader';
import MSWDDataTable from '../component/MSWDDataTable/MSWDDataTable';
import axios from 'axios';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import { useNavigate, useParams } from 'react-router-dom';
import useWebToken from '../../../hooks/useWebToken';
import NoDataFound from '../component/NoDataFound';
import NewBeneficiary from './component/NewBeneficiary';
import useDateFormat from '../../../hooks/useDateFormat';
import Report from './component/Report';

const ViewAssistance = () => {
    const { formatDateToReadable } = useDateFormat()
    const { url, urlWithoutApi } = useSystemURLCon();
    const navigate = useNavigate();
    const { assistance_id } = useParams();
    const { getToken, removeToken } = useWebToken();
    const [isInitialLoad, setIsInitialLoad] = useState(false);
    const [assistance, setAssistanceInfo] = useState(null);
    const [beneficiaries, setBeneficiaries] = useState(null);
    const [isFetching, setIsFetching] = useState(true);
    const [reloadReport, setReloadReport] = useState(false);

    useEffect(() => { GetAssistanceBeneficiary(); }, []);

    const GetAssistanceBeneficiary = async () => {
        try {
            setIsFetching(!isInitialLoad);

            const token = getToken();
            const response = await axios.get(`${url}/assistance/list/${assistance_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setAssistanceInfo(response.data.assistance);
            setBeneficiaries(response.data.beneficiaries);
        } catch (error) {
            if(error.response.status === 500) {
                removeToken();
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
            setReloadReport(prev => !prev);
            setIsInitialLoad(true);
            setIsFetching(false);
        }
    }

    const tableColumns = [
        {
            name: "Family",
            searchable: true,
            selector: row => {
                const familyName = row.family;
                const members = row.members
                    .map(m => `${m.member.fname} ${m.member.mname} ${m.member.lname} ${m.member.suffix ?? ''}`)
                    .join(" ");
                return `${familyName} ${members}`;
            },
            cell: row => (
                <div className='my-3'>
                    <div className={`text-bold text-${row.family === 'No Family' ? 'danger' : 'dark'} pb-3`}>
                        {row.family}
                    </div>
                    {row.members.map((m, i) => (
                        <div key={i} className='mb-2'>
                            <a href={`${urlWithoutApi}/user-images/${m.member.profile_picture}`} target="_blank">
                                <img
                                    src={`${urlWithoutApi}/user-images/${m.member.profile_picture}`}
                                    loading='lazy'
                                    className="rounded-circle mr-2"
                                    height="20"
                                />
                            </a>
                            {`${m.member.fname} ${m.member.mname} ${m.member.lname} ${m.member.suffix ?? ''}`}
                        </div>
                    ))}
                </div>
            ),
            minWidth: "280px",
        },
        {
            name: "Latest Date Acquired",
            searchable: true,
            selector: row => row.members
                .map(m => m.date !== '-' ? formatDateToReadable(m.date) : '-')
                .join(" "),
            cell: row => (
                <div className='my-2'>
                    <div className='pb-3'></div>
                    {row.members.map((m, i) => (
                        <div key={i} style={{ paddingTop: '7.5px', paddingBottom: '7.5px' }} className={`text-${ m.date !== '-' ? 'danger' : 'muted'}`}>
                            {m.date !== '-' ? formatDateToReadable(m.date) : <i>-</i>}
                        </div>
                    ))}
                </div>
            ),
            minWidth: "150px",
        }
    ];

    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'Assistance',
                    'last' : false,
                    'address' : '/welcome/assistance'
                },
                {
                    'name' : isFetching ? '...' : `${assistance?.name}`,
                    'last' : false,
                    'address' : '/welcome/assistance'
                },
                {
                    'name' : 'View Beneficiaries',
                    'last' : true,
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
                                                    <a className="nav-link py-1 active" onClick={() => GetAssistanceBeneficiary} id="custom-tabs-main-tab" data-toggle="pill" href="#custom-tabs-main" role="tab" aria-controls="custom-tabs-main" aria-selected="true">
                                                        <span className="fas fa-home pr-1"></span>
                                                        Family Beneficiaries
                                                    </a>
                                                </li>

                                                <li className="nav-item">
                                                    <a className="nav-link py-1" id="custom-tabs-report-tab" data-toggle="pill" href="#custom-tabs-report" role="tab" aria-controls="custom-tabs-report" aria-selected="true">
                                                        <span className="fas fa-list pr-1"></span>
                                                        Report
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="card-body p-0">
                                            <div className="tab-content" id="custom-tabs-header-tabContent">
                                                <div className="tab-pane fade show active" id="custom-tabs-main" role="tabpanel" aria-labelledby="custom-tabs-main-tab">
                                                    <NewBeneficiary 
                                                        assistanceId={assistance.id}
                                                        callbackFunction={GetAssistanceBeneficiary}
                                                    />

                                                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom px-3">
                                                        <div>
                                                            <button data-toggle="modal" data-target="#addBeneficiary" className='btn btn-sm ml-1 btn-default text--fontPos13--xW8hS'>
                                                                <div className='d-flex align-items-center'>
                                                                    <span className='material-icons-outlined mr-1 text-primary' style={{ fontSize: '20px' }}>add</span>
                                                                    Add Beneficiary
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    { beneficiaries.length > 0 
                                                        ? <div className="card m-0 elevation-0">
                                                                <div className="card-body">
                                                                    <MSWDDataTable 
                                                                        progressPending={isFetching}
                                                                        columns={tableColumns} 
                                                                        data={beneficiaries}
                                                                        selectableRows={false}
                                                                        selectedRows={null}
                                                                    /> 
                                                                </div>
                                                            </div> 
                                                        : <div className="card m-0 elevation-0">
                                                            <div className="card-body">
                                                                <NoDataFound message="No data found. Please add beneficiary first." />
                                                            </div>
                                                        </div>
                                                    }
                                                </div>

                                                <div className="tab-pane fade" id="custom-tabs-report" role="tabpanel" aria-labelledby="custom-tabs-report-tab">
                                                    <Report assistanceId={assistance_id} doReload={reloadReport} />
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

export default ViewAssistance;