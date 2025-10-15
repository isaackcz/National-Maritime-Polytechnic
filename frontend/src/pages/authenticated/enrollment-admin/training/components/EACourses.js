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
import ModalCourse from "./modals-create-or-update/ModalCourse";

const EACourses = () => {
    const { removeToken, getToken } = useGetToken();
    const navigate = useNavigate();
    const { url } = useSystemURLCon();
    const [isFetching, setIsFetching] = useState(true);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        GetCourses();
    }, []);

    const GetCourses = async () => {
        try {
            setIsFetching(isFetching);
            
            const token = getToken('csrf-token');
            const response = await axios.get(`${url}/enrollment-admin/trainings/components/get_courses`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setCourses(response.data.courses);
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
            selector: row => row.course_name,
            sortable: true,
        },
        {
            name: "Status",
            selector: row => row.course_status,
            cell: (row) => (
               <div className='text-center'>
                    <Chip size="small" className="px-2 elevation-1" label={row.course_status} color={row.course_status === 'ACTIVE' ? 'primary' : 'error'} />
               </div> 
            ),
            sortable: true,
            minWidth: "150px",
            maxWidth: "150px",
        },
        {
            name: "Actions",
            cell: (course) => (
                <div className=''>
                    <div className="dropdown w-100">
                        <Link to="#" className="text-dark text-center border rounded-circle text-bold mx-3 elevation-1 data-table-ellipsis-button" type="button" id={`dropdownMenuButton_${course.id}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-ellipsis-v"></i>
                        </Link>

                        <div className="dropdown-menu dropdown-menu-right py-0" aria-labelledby={`dropdownMenuButton_${course.id}`}>
                            <Link className="dropdown-item border-bottom text--fontPos13--xW8hS py-1" to="#" data-toggle="modal" data-target={`#course_${course.id}`}>
                                Update
                            </Link>

                            { course.has_data_count <= 0 && (
                                <>
                                    <Link className="dropdown-item text--fontPos13--xW8hS py-1 text-danger" to="#" data-toggle="modal" data-target={`#data_row_${course.id}`}>
                                        Remove
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <ModalCourse
                        id={course.id}
                        data={course}
                        modalTitle={`Update course. Course #${course.id}`}
                        httpMethod="update"
                        callbackFunction={() => GetCourses}
                    />

                    { course.has_data_count <= 0 && (
                        <ModalDeleteRow
                            id={course.id}
                            modalTitle={`Remove course. Course #${course.id}`}
                            url={`${url}/enrollment-admin/trainings/components/remove_course`}
                            message="Are you sure you want to remove this course? This cannot be undone."
                            callbackFunction={() => GetCourses}
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
                    'name' : 'Courses',
                    'last' : true,
                    'address' : '/enrollment-admin/training/components/courses'
                }
            ]} />

            <section className="content">
                <div className="container-fluid">
                    <button data-toggle="modal" data-target="#course_0" className="btn btn-default btn-sm mb-2">
                        <i className="fas fa-plus mr-1 text-primary"></i> Create New Course
                    </button>

                    <ModalCourse 
                        data={null} 
                        httpMethod="POST"
                        id={0}
                        modalTitle="Create New Course"
                        callbackFunction={() => GetCourses}
                    />

                    <div className="row fade-up">
                        <div className="col-xl-12">
                            <div className="card border shadow-sm rounded-0">
                                <div className="card-body">
                                    {
                                        isFetching
                                            ? <SkeletonLoader onViewMode="update" />
                                            : courses.length > 0
                                                ? <NMPDataTable 
                                                    progressPending={isFetching}
                                                    columns={tableColumns} 
                                                    data={courses}
                                                    selectableRows={false}
                                                    selectedRows={null}
                                                /> : <NoDataFound message="No courses found." />
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

export default EACourses;