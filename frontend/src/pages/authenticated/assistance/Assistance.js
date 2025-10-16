import { useEffect, useState } from 'react';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import useWebToken from '../../../hooks/useWebToken';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageName from '../component/PageName';
import NoDataFound from '../component/NoDataFound';
import ModalNewUpdateAssistance from './ModalNewUpdateAssistance';
import SkeletonLoader from '../component/SkeletonLoader/SkeletonLoader';
import ModalDeleteRow from '../component/ModalDeleteRow';
import MSWDDataTable from '../component/MSWDDataTable/MSWDDataTable';

const Assistance = () => {
    const { url } = useSystemURLCon();
    const navigate = useNavigate();
    const { getToken, removeToken } = useWebToken();
    const [assistances, setAssistance] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => { GetAssistance(); }, []);

    const GetAssistance = async () => {
        try {
            setIsFetching(!isInitialLoad);

            const token = getToken();
            const response = await axios.get(`${url}/assistance/get`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setAssistance(response.data.assistance);
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
            name: "ID#",
            selector: row => row.id,
            sortable: true,
            minWidth: "50px",
            maxWidth: "80px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Assistance",
            selector: row => row.name,
            sortable: true
        },
        {
            name: "Actions",
            cell: (assistance) => (
                <div className='text-center'>
                    <div className="dropdown w-100">
                        <Link to="#" className="text-dark text-center border rounded-circle text-bold mx-3 elevation-1 data-table-ellipsis-button" type="button" id={`dropdownMenuButton_${assistance.id}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-ellipsis-v"></i>
                        </Link>

                        <div className="dropdown-menu dropdown-menu-right py-0" aria-labelledby={`dropdownMenuButton_${assistance.id}`}>
                            <Link className="dropdown-item border-bottom text--fontPos13--xW8hS py-1" to={`/welcome/assistance/list/${assistance.id}`}>
                                View Beneficiaries
                            </Link>

                            <Link className="dropdown-item border-bottom text--fontPos13--xW8hS py-1" to="#" data-toggle="modal"  data-target={`#assistance_${assistance.id}`}>
                                Update
                            </Link>

                            { assistance.check_for_connection_count <= 0 && (
                                <>
                                    <Link className="dropdown-item text--fontPos13--xW8hS py-1 text-danger" to="#" data-toggle="modal" data-target={`#data_row_${assistance.id}`}>
                                        Remove
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <ModalNewUpdateAssistance
                        id={assistance.id}
                        modalTitle={`Update Assistance. ASSISTANCE #${assistance.id}`}
                        httpMethod="update"
                        defaultValue={assistance.name}
                        callbackFunction={GetAssistance}
                    />

                    { assistance.check_for_connection_count <= 0 && (
                        <ModalDeleteRow
                            id={assistance.id}
                            modalTitle={`Remove Assistance. ASSISTANCE #${assistance.id}`}
                            url={`${url}/assistance/remove`}
                            message="Are you sure you want to remove this assistance? This cannot be undone."
                            callbackFunction={GetAssistance}
                        />
                    )}
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'Assistance',
                    'last' : true,
                    'address' : '/welcome/assistance'
                }
            ]}/>

            {
                isFetching 
                    ? <SkeletonLoader />
                    : <section className="content">
                        <div className="container-fluid">
                            <button data-toggle="modal" data-target="#assistance_0" className='btn btn-sm mb-2 btn-default text--fontPos13--xW8hS'>
                                <div className='d-flex align-items-center'>
                                    <span className='material-icons-outlined mr-1 text-primary' style={{ fontSize: '20px' }}>add</span>
                                    Create Assistance
                                </div>
                            </button>

                            <ModalNewUpdateAssistance 
                                id="0" 
                                modalTitle="Create Assistance" 
                                httpMethod="create"
                                callbackFunction={GetAssistance}
                            />

                            <div className="row">
                                <div className="col-xl-12">
                                    { assistances.length > 0
                                        ? <>
                                            <div className="card fade-up">
                                                <div className="card-body">
                                                    <MSWDDataTable 
                                                        progressPending={isFetching}
                                                        columns={tableColumns} 
                                                        data={assistances}
                                                        selectableRows={false}
                                                        selectedRows={null}
                                                    />
                                                </div>
                                            </div>
                                        </> : <>
                                            <div className="card">
                                                <div className="card-body">
                                                    <NoDataFound message="No data found. Please add Assistance first." />
                                                </div>
                                            </div>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    </section>
            }
        </>
    )
}

export default Assistance;
