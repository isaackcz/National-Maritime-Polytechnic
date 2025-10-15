import { useEffect, useState } from "react";
import PageName from "../../../../components/PageName";
import SkeletonLoader from "../../../../components/SkeletonLoader/SkeletonLoader";
import NMPDataTable from "../../../../components/NMPDataTable/NMPDataTable";
import NoDataFound from "../../../../components/NoDataFound";
import ModalModule from "./modals-create-or-update/ModalModule";
import axios from "axios";
import useGetToken from "../../../../../hooks/useGetToken";
import { Link, useNavigate } from "react-router-dom";
import useSystemURLCon from "../../../../../hooks/useSystemURLCon";
import ModalDeleteRow from "../../../components/ModalDeleteRow";
import { Chip } from "@mui/material";

const EAModules = () => {
    const { removeToken, getToken } = useGetToken();
    const navigate = useNavigate();
    const { url } = useSystemURLCon();
    const [isFetching, setIsFetching] = useState(true);
    const [modules, setModules] = useState([]);

    useEffect(() => {
        GetModules(true);
    }, []);

    const GetModules = async (isInitialLoad) => {
        try {
            setIsFetching(isInitialLoad);
            
            const token = getToken('csrf-token');
            const response = await axios.get(`${url}/enrollment-admin/trainings/components/get_modules`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setModules(response.data.modules);
        } catch(error) {
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
            minWidth: "130px",
            maxWidth: "130px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Name",
            selector: row => row.name,
            sortable: true,
            minWidth: "280px",
            maxWidth: "280px",
        },
        {
            name: "Acronym",
            selector: row => row.acronym,
            sortable: true,
            minWidth: "220px",
            maxWidth: "220px",
        },
        {
            name: "Description",
            selector: row => row.compendium,
            sortable: true,
            minWidth: "550px",
            maxWidth: "550px",
        },
        {
            name: "Status",
            selector: row => row.status,
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
            cell: (module) => (
                <div className=''>
                    <div className="dropdown w-100">
                        <Link to="#" className="text-dark text-center border rounded-circle text-bold mx-3 elevation-1 data-table-ellipsis-button" type="button" id={`dropdownMenuButton_${module.id}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-ellipsis-v"></i>
                        </Link>

                        <div className="dropdown-menu dropdown-menu-right py-0" aria-labelledby={`dropdownMenuButton_${module.id}`}>
                            <Link className="dropdown-item border-bottom text--fontPos13--xW8hS py-1" to="#" data-toggle="modal"  data-target={`#module_${module.id}`}>
                                Update
                            </Link>

                            { module.has_data_count <= 0 && (
                                <>
                                    <Link className="dropdown-item text--fontPos13--xW8hS py-1 text-danger" to="#" data-toggle="modal" data-target={`#data_row_${module.id}`}>
                                        Remove
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <ModalModule
                        id={module.id}
                        data={module}
                        modalTitle={`Update module. Module #${module.id}`}
                        httpMethod="update"
                        callbackFunction={() => GetModules(false)}
                    />

                    { module.has_data_count <= 0 && (
                        <ModalDeleteRow
                            id={module.id}
                            modalTitle={`Remove module. Module #${module.id}`}
                            url={`${url}/enrollment-admin/trainings/components/remove_module`}
                            message="Are you sure you want to remove this module? This cannot be undone."
                            callbackFunction={() => GetModules(false)}
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
                    'name' : 'Training',
                    'last' : false
                },
                {
                    'name' : 'Components',
                    'last' : false
                },
                {
                    'name' : 'Modules',
                    'last' : true,
                    'address' : '/enrollment-admin/training/components/modules'
                }
            ]} />

            <section className="content">
                <div className="container-fluid">
                    <button data-toggle="modal" data-target="#module_0" className="btn btn-default btn-sm mb-2">
                        <i className="fas fa-plus mr-1 text-primary"></i> Create New Module
                    </button>

                    <ModalModule 
                        data={null} 
                        httpMethod="POST"
                        id={0}
                        modalTitle="Create New Module"
                        callbackFunction={() => GetModules(false)}
                    />

                    <div className="row fade-up">
                        <div className="col-xl-12">
                            <div className="card border shadow-sm rounded-0">
                                <div className="card-body">
                                    {
                                        isFetching
                                            ? <SkeletonLoader onViewMode="update" />
                                            : modules.length > 0
                                                ? <NMPDataTable 
                                                    progressPending={isFetching}
                                                    columns={tableColumns} 
                                                    data={modules}
                                                    selectableRows={false}
                                                    selectedRows={null}
                                                /> : <NoDataFound message="No modules found." />
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

export default EAModules;