import { useEffect, useState } from 'react';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import useWebToken from '../../../hooks/useWebToken';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageName from '../component/PageName';
import NoDataFound from '../component/NoDataFound';
import SkeletonLoader from '../component/SkeletonLoader/SkeletonLoader';
import ModalDeleteRow from '../component/ModalDeleteRow';
import MSWDDataTable from '../component/MSWDDataTable/MSWDDataTable';

const Resident = () => {
    const { url, urlWithoutApi } = useSystemURLCon();
    const navigate = useNavigate();
    const { getToken, removeToken } = useWebToken();
    const [residents, setResidents] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => { GetResident(); }, []);

    const GetResident = async () => {
        try {
            setIsFetching(!isInitialLoad);

            const token = getToken();
            const response = await axios.get(`${url}/residents/get`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setResidents(response.data.residents);
            console.log(response.data.residents); 
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
            name: "Avatar",
            cell: (resident) => (
                <>
                    <a href={`${urlWithoutApi}/user-images/${resident.profile_picture}`} target="_blank">
                        <img src={`${urlWithoutApi}/user-images/${resident.profile_picture}`} loading='lazy' class="rounded-circle" height="30" />
                    </a>
                </>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            minWidth: "50px",
            maxWidth: "80px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Name",
            selector: row => `${row.fname} ${row.mname} ${row.lname} ${row.suffix ?? ''}`,
            sortable: true
        },
        {
            name: "Sex",
            selector: row => row.sex,
            sortable: true,
            minWidth: "50px",
            maxWidth: "100px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Barangay",
            selector: row => row.barangay,
            sortable: true,
            minWidth: "130px",
            maxWidth: "180px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Actions",
            cell: (resident) => (
                <div className='text-center'>
                    <div className="dropdown w-100">
                        <Link to="#" className="text-dark text-center border rounded-circle text-bold mx-3 elevation-1 data-table-ellipsis-button" type="button" id={`dropdownMenuButton_${resident.id}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-ellipsis-v"></i>
                        </Link>

                        <div className="dropdown-menu dropdown-menu-right py-0" aria-labelledby={`dropdownMenuButton_${resident.id}`}>
                            <Link className="dropdown-item border-bottom text--fontPos13--xW8hS py-1" to={`/welcome/resident/list/${resident.id}`}>
                                View
                            </Link>

                            { resident.acquired_assistances_count <= 0 && (
                                <>
                                    <Link className="dropdown-item text--fontPos13--xW8hS py-1 text-danger" to="#" data-toggle="modal" data-target={`#data_row_${resident.id}`}>
                                        Remove
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    
                    { resident.acquired_assistances_count <= 0 && (
                        <ModalDeleteRow
                            id={resident.id}
                            modalTitle={`Remove resident. Resident #${resident.id}`}
                            url={`${url}/residents/remove`}
                            message="Are you sure you want to remove this resident? This cannot be undone."
                            callbackFunction={GetResident}
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
                    'name' : 'Resident',
                    'last' : false,
                },
                {
                    'name' : 'Residents',
                    'last' : true,
                    'address' : '/welcome/resident/list'
                }
            ]}/>

            {
                isFetching 
                    ? <SkeletonLoader />
                    : <section className="content">
                        <div className="container-fluid">
                            <div className="row fade-up">
                                <div className="col-xl-12">
                                    { residents.length > 0 
                                        ? <>
                                            <div className="card">
                                                <div className="card-body">
                                                    <MSWDDataTable 
                                                        progressPending={isFetching}
                                                        columns={tableColumns} 
                                                        data={residents}
                                                        selectableRows={false}
                                                        selectedRows={null}
                                                    />
                                                </div>
                                            </div>
                                        </> : <>
                                            <div className="card">
                                                <div className="card-body">
                                                    <NoDataFound message="No data found. Please add resident first." />
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

export default Resident;
