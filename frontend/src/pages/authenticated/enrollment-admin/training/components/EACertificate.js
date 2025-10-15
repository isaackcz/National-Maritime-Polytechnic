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
import ModalCertificate from "./modals-create-or-update/ModalCertificate";
import ModalViewCertificate from "./modals-create-or-update/ModalViewCertificate";
import useDateFormat from "../../../../../hooks/useDateFormat";

const EACertificate = () => {
    const { removeToken, getToken } = useGetToken();
    const navigate = useNavigate();
    const { url } = useSystemURLCon();
    const [isFetching, setIsFetching] = useState(true);
    const [certificates, setCertificates] = useState([]);
    const { formatDateToReadable } = useDateFormat();

    useEffect(() => {
        GetCertificates();
    }, []);

    const GetCertificates = async () => {
        try {
            setIsFetching(isFetching);
            
            const token = getToken('csrf-token');
            const response = await axios.get(`${url}/enrollment-admin/trainings/components/get_certificates`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setCertificates(response.data.certificates);
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
            name: "Created at",
            selector: row => formatDateToReadable(row.created_at),
            sortable: true,
        },
        {
            name: "Actions",
            cell: (certificate) => (
                <div className=''>
                    <div className="dropdown w-100">
                        <Link to="#" className="text-dark text-center border rounded-circle text-bold mx-3 elevation-1 data-table-ellipsis-button" type="button" id={`dropdownMenuButton_${certificate.id}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-ellipsis-v"></i>
                        </Link>

                        <div className="dropdown-menu dropdown-menu-right py-0" aria-labelledby={`dropdownMenuButton_${certificate.id}`}>
                            <Link className="dropdown-item border-bottom text--fontPos13--xW8hS py-1" to="#" data-toggle="modal" data-target={`#view_certificate_${certificate.id}`}>
                                View
                            </Link>

                            <Link className="dropdown-item border-bottom text--fontPos13--xW8hS py-1" to="#" data-toggle="modal" data-target={`#certificate_${certificate.id}`}>
                                Update
                            </Link>

                            { certificate.has_data_count <= 0 && (
                                <>
                                    <Link className="dropdown-item text--fontPos13--xW8hS py-1 text-danger" to="#" data-toggle="modal" data-target={`#data_row_${certificate.id}`}>
                                        Remove
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <ModalViewCertificate 
                        data={certificate}
                        id={certificate.id}
                    />

                    <ModalCertificate
                        id={certificate.id}
                        data={certificate}
                        modalTitle={`Update Certificate. Certificate #${certificate.id}`}
                        httpMethod="update"
                        callbackFunction={() => GetCertificates}
                    />

                    { certificate.has_data_count <= 0 && (
                        <ModalDeleteRow
                            id={certificate.id}
                            modalTitle={`Remove Certificate. Certificate #${certificate.id}`}
                            url={`${url}/enrollment-admin/trainings/components/remove_certificate`}
                            message="Are you sure you want to remove this certificate? This cannot be undone."
                            callbackFunction={() => GetCertificates}
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
                    'name' : 'Certificates',
                    'last' : true,
                    'address' : '/enrollment-admin/training/components/certificates'
                }
            ]} />

            <section className="content">
                <div className="container-fluid">
                    <button data-toggle="modal" data-target="#certificate_0" className="btn btn-default btn-sm mb-2">
                        <i className="fas fa-plus mr-1 text-primary"></i> Create New Certificate
                    </button>

                    <ModalCertificate 
                        data={null} 
                        httpMethod="POST"
                        id={0}
                        modalTitle="Create New Certificate"
                        callbackFunction={() => GetCertificates}
                    />

                    <div className="row fade-up">
                        <div className="col-xl-12">
                            <div className="card border shadow-sm rounded-0">
                                <div className="card-body">
                                    {
                                        isFetching
                                            ? <SkeletonLoader onViewMode="update" />
                                            : certificates.length > 0
                                                ? <NMPDataTable 
                                                    progressPending={isFetching}
                                                    columns={tableColumns} 
                                                    data={certificates}
                                                    selectableRows={false}
                                                    selectedRows={null}
                                                /> : <NoDataFound message="No certificates found." />
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

export default EACertificate;