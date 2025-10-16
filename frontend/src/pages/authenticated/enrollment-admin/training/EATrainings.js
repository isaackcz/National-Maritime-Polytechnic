import { useEffect, useState } from 'react';
import PageName from '../../../components/PageName'
import axios from 'axios';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import useGetToken from '../../../../hooks/useGetToken';
import { Link, useNavigate } from 'react-router-dom';
import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';
import NMPDataTable from '../../../components/NMPDataTable/NMPDataTable';
import NoDataFound from '../../../components/NoDataFound';
import ModalDeleteRow from '../../components/ModalDeleteRow';
import { Chip } from '@mui/material';

const EATrainings = () => {
    const { getToken, removeToken } = useGetToken();
    const navigate = useNavigate();
    const { url } = useSystemURLCon();
    const [trainings, setTrainings] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        GetTrainings(true);
    }, []);

    const GetTrainings = async (isInitialLoad) => {
        try {
            setIsFetching(isInitialLoad);

            const token = getToken('csrf-token');
            const response = await axios.get(`${url}/enrollment-admin/trainings/get`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if(response.status === 200) {
                setTrainings(response.data.trainings);
            }
        } catch (error) {
            if(error.response.status === 500) {
                removeToken('csrf-token');
                navigate('/access-denied');
            }
        } finally {
            setIsFetching(false);
        }
    }

    const tableColumns = [
        {
            name: "ID#",
            selector: row => row.id,
            sortable: true,
            minWidth: "120px",  
            maxWidth: "120px",
        },
        {
            name: "Course",
            selector: row => row.course.course_name,
            sortable: true,
        },
        {
            name: "Module",
            selector: row => row.module.name,
            sortable: true,
        },
        {
            name: "Status",
            cell: (row) => (
               <div className='text-center'>
                    <Chip size="small" className="px-2 elevation-1" label={row.status} color={row.status === 'ACTIVE' ? 'primary' : 'error'} />
               </div> 
            ),
            sortable: true,
            minWidth: "150px",  
            maxWidth: "150px",
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className='text-center'>
                    <div className="dropdown w-100">
                        <Link to="#" className="text-dark text-center border rounded-circle text-bold mx-3 elevation-1 data-table-ellipsis-button" type="button" id={`dropdownMenuButton_${row.id}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-ellipsis-v"></i>
                        </Link>

                        <div className="dropdown-menu dropdown-menu-right py-0" aria-labelledby={`dropdownMenuButton_${row.id}`}>
                            <Link className="dropdown-item border-bottom text--fontPos13--xW8hS py-1" to={`/enrollment-admin/training/list/${row.id}`}>
                                View Training
                            </Link>

                            {
                                row.has_data_count === 0 &&
                                    <>
                                        <Link className="dropdown-item text--fontPos13--xW8hS py-1 text-danger" to="#" data-toggle="modal" data-target={`#data_row_${row.id}`}>
                                            Remove
                                        </Link>
                                    </> 
                            }
                        </div>
                    </div>
                    
                    {
                        row.has_data_count === 0 &&
                            <ModalDeleteRow
                                id={row.id}
                                modalTitle={`Remove Trainin. Training #${row.id}`}
                                url={`${url}/enrollment-admin/trainings/remove_training`}
                                message="Are you sure you want to remove this training? This cannot be undone."
                                callbackFunction={() => GetTrainings(false)}
                            />
                    }
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
                    'name' : 'Training',
                    'last' : false
                },
                {
                    'name' : 'List',
                    'last' : true,
                    'address' : '/enrollment-admin/training/list'
                }
            ]} />

            <section className="content">
                <div className="container-fluid">
                    <div className="row fade-up">
                        <div className="col-xl-12">
                            <div className="card border shadow-sm rounded-0">
                                <div className="card-body">
                                    {
                                        isFetching 
                                            ? <SkeletonLoader onViewMode="update" />
                                            : trainings.length > 0
                                                ? <NMPDataTable 
                                                    progressPending={isFetching}
                                                    columns={tableColumns} 
                                                    data={trainings}
                                                    selectableRows={false}
                                                    selectedRows={null}
                                                /> : <NoDataFound message="No trainings yet." />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default EATrainings;