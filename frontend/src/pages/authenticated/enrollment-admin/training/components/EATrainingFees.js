import { useEffect, useState } from "react";
import PageName from "../../../../components/PageName";
import SkeletonLoader from "../../../../components/SkeletonLoader/SkeletonLoader";
import NMPDataTable from "../../../../components/NMPDataTable/NMPDataTable";
import NoDataFound from "../../../../components/NoDataFound";
import axios from "axios";
import useGetToken from "../../../../../hooks/useGetToken";
import { Link, useNavigate } from "react-router-dom";
import useSystemURLCon from "../../../../../hooks/useSystemURLCon";
import ModalDeleteRow from "../../../components/ModalDeleteRow";
import { Chip } from "@mui/material";
import ModalTrainingFee from "./modals-create-or-update/ModalTrainingFee";

const EATrainingFees = () => {
    const { removeToken, getToken } = useGetToken();
    const navigate = useNavigate();
    const { url } = useSystemURLCon();
    const [isFetching, setIsFetching] = useState(true);
    const [trainingFees, setTrainingFee] = useState([]);

    useEffect(() => {
        GetTrainingFee(true);
    }, []);

    const GetTrainingFee = async (isInitialLoad) => {
        try {
            setIsFetching(isInitialLoad);
            
            const token = getToken('csrf-token');
            const response = await axios.get(`${url}/enrollment-admin/trainings/components/get_training_fees`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setTrainingFee(response.data.training_fees);
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
        },
        {
            name: "Amount",
            selector: row => row.amount,
            sortable: true,
        },
        {
            name: "Category",
            selector: row => row.category,
            sortable: true,
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
            cell: (trainingFee) => (
                <div className=''>
                    <div className="dropdown w-100">
                        <Link to="#" className="text-dark text-center border rounded-circle text-bold mx-3 elevation-1 data-table-ellipsis-button" type="button" id={`dropdownMenuButton_${trainingFee.id}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-ellipsis-v"></i>
                        </Link>

                        <div className="dropdown-menu dropdown-menu-right py-0" aria-labelledby={`dropdownMenuButton_${trainingFee.id}`}>
                            <Link className="dropdown-item border-bottom text--fontPos13--xW8hS py-1" to="#" data-toggle="modal" data-target={`#training_fee_${trainingFee.id}`}>
                                Update
                            </Link>

                            { trainingFee.has_data_count <= 0 && (
                                <>
                                    <Link className="dropdown-item text--fontPos13--xW8hS py-1 text-danger" to="#" data-toggle="modal" data-target={`#data_row_${trainingFee.id}`}>
                                        Remove
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <ModalTrainingFee
                        id={trainingFee.id}
                        data={trainingFee}
                        modalTitle={`Update training fee. Training Fee #${trainingFee.id}`}
                        httpMethod="update"
                        callbackFunction={() => GetTrainingFee(false)}
                    />

                    { trainingFee.has_data_count <= 0 && (
                        <ModalDeleteRow
                            id={trainingFee.id}
                            modalTitle={`Remove Training Fee. Training Fee #${trainingFee.id}`}
                            url={`${url}/enrollment-admin/trainings/components/remove_fee`}
                            message="Are you sure you want to remove this Training Fee? This cannot be undone."
                            callbackFunction={() => GetTrainingFee(false)}
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
                    'name' : 'Training Fee',
                    'last' : true,
                    'address' : '/enrollment-admin/training/components/training-fees'
                }
            ]} />

            <section className="content">
                <div className="container-fluid">
                    <button data-toggle="modal" data-target="#training_fee_0" className="btn btn-default btn-sm mb-2">
                        <i className="fas fa-plus mr-1 text-primary"></i> Create New Training Fee
                    </button>

                    <ModalTrainingFee 
                        data={null} 
                        httpMethod="POST"
                        id={0}
                        modalTitle="Create New Training Fee"
                        callbackFunction={() => GetTrainingFee(false)}
                    />

                    <div className="row fade-up">
                        <div className="col-xl-12">
                            <div className="card border shadow-sm rounded-0">
                                <div className="card-body">
                                    {
                                        isFetching
                                            ? <SkeletonLoader onViewMode="update" />
                                            : trainingFees.length > 0
                                                ? <NMPDataTable 
                                                    progressPending={isFetching}
                                                    columns={tableColumns} 
                                                    data={trainingFees}
                                                    selectableRows={false}
                                                    selectedRows={null}
                                                /> : <NoDataFound message="No training fee found." />
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

export default EATrainingFees;