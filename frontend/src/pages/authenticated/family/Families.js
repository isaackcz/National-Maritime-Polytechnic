import { useEffect, useState } from 'react';
import NoDataFound from '../component/NoDataFound';
import MSWDDataTable from '../component/MSWDDataTable/MSWDDataTable';
import SkeletonLoader from '../component/SkeletonLoader/SkeletonLoader';
import PageName from '../component/PageName';
import ModalDeleteRow from '../component/ModalDeleteRow';
import { Link, useNavigate } from 'react-router-dom';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import useWebToken from '../../../hooks/useWebToken';
import axios from 'axios';

const Families = () => {
    const { url } = useSystemURLCon();
    const navigate = useNavigate();
    const { getToken, removeToken } = useWebToken();
    const [families, setFamilies] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => { GetFamilies(); }, []);

    const GetFamilies = async () => {
        try {
            setIsFetching(!isInitialLoad);

            const token = getToken();
            const response = await axios.get(`${url}/family/list`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setFamilies(response.data.compositions);
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
            name: "Name",
            selector: row => row.name,
            sortable: true,
            minWidth: "280px",
            maxWidth: "280px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Head",
            selector: row => row.family_head 
                ? `${row.family_head.resident.fname} ${row.family_head.resident.mname} ${row.family_head.resident.lname} ${row.family_head.resident.suffix}` 
                : '-- None --',
            sortable: true
        },
        {
            name: "Actions",
            cell: (family) => (
                <div className='text-center'>
                    <div className="dropdown w-100">
                        <Link to="#" className="text-dark text-center border rounded-circle text-bold mx-3 elevation-1 data-table-ellipsis-button" type="button" id={`dropdownMenuButton_${family.id}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-ellipsis-v"></i>
                        </Link>

                        <div className="dropdown-menu dropdown-menu-right py-0" aria-labelledby={`dropdownMenuButton_${family.id}`}>
                            <Link className="dropdown-item border-bottom text--fontPos13--xW8hS py-1" to={`/welcome/family/list/${family.id}`}>
                                View
                            </Link>

                            <Link className="dropdown-item text--fontPos13--xW8hS py-1 text-danger" to="#" data-toggle="modal" data-target={`#data_row_${family.id}`}>
                                Remove
                            </Link>
                        </div>
                    </div>

                    <ModalDeleteRow
                        id={family.id}
                        modalTitle={`Remove family. Family #${family.id}`}
                        url={`${url}/family/remove`}
                        message="Are you sure you want to remove this family? This cannot be undone."
                        callbackFunction={GetFamilies}
                    />
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
                    'name' : 'Family',
                    'last' : false,
                },
                {
                    'name' : 'Families',
                    'last' : true,
                    'address' : '/welcome/family/list'
                }
            ]}/>

            {
                isFetching 
                    ? <SkeletonLoader />
                    : <section className="content">
                        <div className="container-fluid">
                            <div className="row fade-up">
                                <div className="col-xl-12">
                                    { families.length > 0 
                                        ? <>
                                            <div className="card">
                                                <div className="card-body">
                                                    <MSWDDataTable 
                                                        progressPending={isFetching}
                                                        columns={tableColumns} 
                                                        data={families}
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

export default Families;