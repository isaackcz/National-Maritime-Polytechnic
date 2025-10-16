/* global $ */
/* global Wizard */
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import NMPDataTable from '../../../../components/NMPDataTable/NMPDataTable';
import ModalNewTrainingSchedule from './modals-create-or-update/ModalNewTrainingSchedule';
import useDateFormat from '../../../../../hooks/useDateFormat';
import useCountDaysWithoutSunday from '../../../../../hooks/useCountDaysWithoutSunday';
import axios from 'axios';
import useGetToken from '../../../../../hooks/useGetToken';
import useSystemURLCon from '../../../../../hooks/useSystemURLCon';
import SkeletonLoader from '../../../../components/SkeletonLoader/SkeletonLoader';
import useShowSubmitLoader from '../../../../../hooks/useShowSubmitLoader';
import useShowToaster from '../../../../../hooks/useShowToaster';
import NoDataFound from '../../../../components/NoDataFound';

const EACreateOrUpdateTraining = ({ data, id, httpMethod, callbackFunction }) => {
    const { url } = useSystemURLCon();
    const navigate = useNavigate();
    const [isFetching, setIsFetching] = useState(true);
    const { getToken, removeToken } = useGetToken();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader();
    const { setOpenToast, Toast, setToastMessage, setToastStatus } = useShowToaster();

    const [course, setCourse] = useState('');
    const [module, setModule] = useState('');
    const [trainingFee, setTrainingFee] = useState('');
    const [trainingAssessmentFee, setTrainingAssessmentFee] = useState('');
    const [dailyHour, setDailyHour] = useState('');
    const [batchNumber, setBatchNumber] = useState('');
    const [schedule, setSchedule] = useState([]);
    const [status, setStatus] = useState('');

    const { formatDateToReadable } = useDateFormat();
    const { countDays } = useCountDaysWithoutSunday();

    const [courses, setCourses] = useState([]);
    const [modules, setModules] = useState([]);
    const [trainingFees, setTrainingFees] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [selectedCertificatesRows, setSelectedCertificatesRows] = useState([]);

    useEffect(() => { 
        GetCourseAndModule(); 

        if ($(".basicwizard").length > 0) {
            new Wizard(".basicwizard", {
                validate: true,
                progress: true
            });
        }
    }, [isFetching]);

    const GetCourseAndModule = async () => {
        try {
            setIsFetching(isFetching);
            
            const token = getToken('csrf-token');
            const response = await axios.get(`${url}/enrollment-admin/trainings/components/get_cmtfc`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setCourses(response.data.courses);
            setModules(response.data.modules);
            setTrainingFees(response.data.trainingFees);
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

    const FormSubmit = async () => {
        try {
            setShowLoader(true);
            setProgress(0);
            setOpenToast(false);
            setToastMessage("");

            const token = getToken('csrf-token');
            const formData = new FormData();
            formData.append('course', course);
            formData.append('module', module);
            formData.append('training_fee', trainingFee);
            formData.append('assessment_fee', trainingAssessmentFee);
            formData.append('daily_hours', dailyHour);
            formData.append('batch_number', batchNumber);
            schedule.forEach((item, index) => {
                formData.append(`schedule[${index}][from_date]`, item.from_date);
                formData.append(`schedule[${index}][to_date]`, item.to_date);
                formData.append(`schedule[${index}][slot]`, item.slot);
                formData.append(`schedule[${index}][venue]`, item.venue);
                formData.append(`schedule[${index}][room]`, item.room);
                formData.append(`schedule[${index}][preference]`, item.preference);
            });
            selectedCertificatesRows.forEach((item) => formData.append('receivable_certificate[]', item));
            formData.append('httpMethod', httpMethod);
            if(id > 0) formData.append('documentId', id);
            if(id > 0) formData.append('status', status);

            const response = await axios.post(`${url}/enrollment-admin/trainings/components/create_or_update_training`, formData, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percent);
                    }
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if(response.status === 200) {
                setOpenToast(true);
                setToastStatus('success');
                setToastMessage(response.data.message);
            }
        } catch(error) {
            if(error.response.status === 500) {
                removeToken('csrf-token');
                navigate('/access-denied');
            } else {
                setOpenToast(true);
                setToastStatus('error');
                setToastMessage(error.response.data.message);
            }
        } finally {
            setShowLoader(false);
            callbackFunction();
        }
    }

    const tableColumns = [
        {
            name: "Date",
            selector: row => <div>{formatDateToReadable(row.from_date)} to {formatDateToReadable(row.to_date)} <strong>({countDays(row.from_date, row.to_date)} days)</strong></div>,
            sortable: true,
            minWidth: "500px",
            maxWidth: "500px",
        },
        {
            name: "Slot",
            selector: row => row.slot,
            sortable: true,
            minWidth: "150px",
            maxWidth: "150px",
        },
        {
            name: "Venue",
            selector: row => row.venue,
            sortable: true,
        },
        {
            name: "Room",
            selector: row => row.room,
            sortable: true,
            minWidth: "200px",
            maxWidth: "200px",
        },
        {
            name: "Preference",
            selector: row => row.preference,
            sortable: true,
            minWidth: "200px",
            maxWidth: "200px",
        },
        {
            name: "Actions",
            cell: (trainingSchedule) => (
                <div>
                    <div className="dropdown w-100">
                        <Link to="#" className="text-dark text-center border rounded-circle text-bold mx-3 elevation-1 data-table-ellipsis-button" type="button" id={`dropdownMenuButton_${trainingSchedule.id}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-ellipsis-v"></i>
                        </Link>

                        <div className="dropdown-menu dropdown-menu-right py-0" aria-labelledby={`dropdownMenuButton_${trainingSchedule.id}`}>
                            <Link className="dropdown-item border-bottom text--fontPos13--xW8hS py-1" to="#" data-toggle="modal" data-target={`#training_schedule_${trainingSchedule.id}`}>
                                Update
                            </Link>

                            <Link className="dropdown-item text--fontPos13--xW8hS py-1 text-danger" to="#" onClick={() => {
                                const updatedSchedule = schedule.filter(item => item.id !== trainingSchedule.id);
                                setSchedule(updatedSchedule);
                            }}>Remove</Link>
                        </div>
                    </div>

                    <ModalNewTrainingSchedule 
                        data={trainingSchedule}
                        id={trainingSchedule.id + 1}
                        httpMethod={"update"}
                        modalTitle="Update Schedule"
                        callbackFunction={(newSchedule) => { 
                            setSchedule(prevSchedules => 
                                prevSchedules.map(schedule => schedule.id === newSchedule.id ? newSchedule : schedule)
                            ); 
                        }}
                    />
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    const tableColumns2 = [
        {
            name: "Name",
            selector: row => row.name,
            sortable: true,
        },
        {
            name: "Actions",
            cell: (trainingCertificates) => (
                <div>
                    {/* <div className="dropdown w-100">
                        <Link to="#" className="text-dark text-center border rounded-circle text-bold mx-3 elevation-1 data-table-ellipsis-button" type="button" id={`dropdownMenuButton_${trainingCertificates.id}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-ellipsis-v"></i>
                        </Link>

                        <div className="dropdown-menu dropdown-menu-right py-0" aria-labelledby={`dropdownMenuButton_${trainingCertificates.id}`}>
                            <Link className="dropdown-item border-bottom text--fontPos13--xW8hS py-1" to="#" data-toggle="modal" data-target={`#receivable_certificate_${trainingCertificates.id}`}>
                                Update
                            </Link>

                            <Link className="dropdown-item text--fontPos13--xW8hS py-1 text-danger" to="#" onClick={() => {
                                const updatedCertificates = certificates.filter(item => item.id !== trainingCertificates.id);
                                setCertificates(updatedCertificates);
                            }}>
                                Remove
                            </Link>
                        </div>
                    </div>

                    <ModalReceivableCertificate 
                        data={trainingCertificates}
                        id={trainingCertificates.id}
                        httpMethod="UPDATE"
                        modalTitle="Update Receivable Certificate"
                        addedCertificate={certificates}
                        callbackFunction={(newCertificate) => { 
                            setCertificates(prevCertificates => 
                                prevCertificates.map(certificate => certificate.id === newCertificate.id ? newCertificate : certificate)
                            ); 
                        }}
                    /> */}
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    return (
        <>
            <ModalNewTrainingSchedule 
                data={null}
                id={id}
                httpMethod={httpMethod}
                modalTitle="Add Schedule"
                callbackFunction={(newSchedule) => { 
                    setSchedule(prevSchedules => [...prevSchedules, newSchedule]); 
                }}
            />

            <SubmitLoadingAnim cls="loader" />
            <Toast />

            {
                isFetching 
                    ? <SkeletonLoader onViewMode='update' />
                    : <>
                        <div class="card elevation-0 border-0 m-0 rounded-0 basicwizard">
                            <div class="card-header border-0 py-0">
                                <ul class="nav nav-tabs small sr-only" id="custom-tabs-header-tab" role="tablist">
                                    <li class="nav-item">
                                        <a class="nav-link active rounded-0" id="custom-tabs-1-tab" data-toggle="pill" href="#custom-tabs-1" role="tab" aria-controls="custom-tabs-1" aria-selected="true">
                                            I.
                                        </a>
                                    </li>

                                    <li class="nav-item">
                                        <a class="nav-link rounded-0" id="custom-tabs-2-tab" data-toggle="pill" href="#custom-tabs-2" role="tab" aria-controls="custom-tabs-2" aria-selected="true">
                                            II.
                                        </a>
                                    </li>

                                    <li class="nav-item">
                                        <a class="nav-link rounded-0" id="custom-tabs-3-tab" data-toggle="pill" href="#custom-tabs-3" role="tab" aria-controls="custom-tabs-3" aria-selected="false">
                                            III.
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div class="card-body pt-3">
                                <div class="tab-content" id="custom-tabs-four-tabContent">
                                    <div class="tab-pane fade show active" id="custom-tabs-1" role="tabpanel" aria-labelledby="custom-tabs-1-tab">
                                        <label className='form-label'>Training Basic Information</label>
                                        <form id={`training_form_1_${id}`}>
                                            <div className='row'>
                                                <div className='col-xl-4'>
                                                    <FormControl fullWidth margin='dense' variant="outlined">
                                                        <InputLabel id="demo-simple-course">Course <span className='text-danger'>*</span></InputLabel>
                                                        <Select
                                                            required
                                                            labelId="demo-simple-course"
                                                            id="demo-simple-course-0"
                                                            value={course}
                                                            label="Course"
                                                            onChange={(e) => setCourse(e.target.value)}
                                                        >
                                                            { 
                                                                courses.map((course, _) => (
                                                                    <MenuItem value={course.id}>{course.course_name}</MenuItem>
                                                                ))
                                                            }
                                                        </Select>
                                                    </FormControl>
                                                </div>

                                                <div className='col-xl-4'>
                                                    <FormControl fullWidth margin='dense' variant="outlined">
                                                        <InputLabel id="demo-simple-module">Module <span className='text-danger'>*</span></InputLabel>
                                                        <Select
                                                            required
                                                            labelId="demo-simple-module"
                                                            id="demo-simple-module-0"
                                                            value={module}
                                                            label="Module"
                                                            onChange={(e) => setModule(e.target.value)}
                                                        >
                                                            { 
                                                                modules.map((module, _) => (
                                                                    <MenuItem value={module.id}>{module.name}</MenuItem>
                                                                ))
                                                            }
                                                        </Select>
                                                    </FormControl>
                                                </div>

                                                <div className='col-xl-4'>
                                                    <FormControl fullWidth margin='dense' variant="outlined">
                                                        <InputLabel id="demo-simple-training-fee">Training Fee <span className='text-danger'>*</span></InputLabel>
                                                        <Select
                                                            required
                                                            labelId="demo-simple-training-fee"
                                                            id="demo-simple-training-fee-0"
                                                            value={trainingFee}
                                                            label="Training Fee"
                                                            onChange={(e) => setTrainingFee(e.target.value)}
                                                        >
                                                            { 
                                                                trainingFees.map((trainingFee, _) => (
                                                                    <MenuItem value={trainingFee.id}>{trainingFee.name} - {trainingFee.amount} - {trainingFee.category}</MenuItem>
                                                                ))
                                                            }
                                                        </Select>
                                                    </FormControl>
                                                </div>

                                                <div className='col-xl-4'>
                                                    <FormControl fullWidth margin='dense' variant="outlined">
                                                        <InputLabel htmlFor="batchNumber">Batch <span className='text-danger'>*</span></InputLabel>
                                                        <OutlinedInput
                                                            required
                                                            value={batchNumber}
                                                            onChange={(e) => setBatchNumber(e.target.value)}
                                                            id="batchNumber"
                                                            type="text"
                                                            label="Batch"
                                                        />
                                                    </FormControl>
                                                </div>

                                                <div className='col-xl-4'>
                                                    <FormControl fullWidth margin='dense' variant="outlined">
                                                        <InputLabel htmlFor="dailyHour">Daily Hour (Max of 8 Hours) <span className='text-danger'>*</span></InputLabel>
                                                        <OutlinedInput
                                                            required
                                                            value={dailyHour}
                                                            onChange={(e) => {
                                                                if(e.target.value < 9) setDailyHour(e.target.value)
                                                            }}
                                                            id="dailyHour"
                                                            type="number"
                                                            label="Daily Hour (Max of 8 Hours)"
                                                        />
                                                    </FormControl>
                                                </div>

                                                <div className='col-xl-4'>
                                                    <FormControl fullWidth margin='dense' variant="outlined">
                                                        <InputLabel id="demo-simple-assessment-fee">Assessment Fee <span className='text-danger'>*</span></InputLabel>
                                                        <Select
                                                            required
                                                            labelId="demo-simple-assessment-fee"
                                                            id="demo-simple-assessment-fee-0"
                                                            value={trainingAssessmentFee}
                                                            label="Assessment Fee"
                                                            onChange={(e) => setTrainingAssessmentFee(e.target.value)}
                                                        >
                                                            { 
                                                                trainingFees.map((trainingFee, _) => (
                                                                    <MenuItem value={trainingFee.id}>{trainingFee.name} - {trainingFee.amount} - {trainingFee.category}</MenuItem>
                                                                ))
                                                            }
                                                        </Select>
                                                    </FormControl>
                                                </div>

                                                <div className='col-xl-4'>
                                                    {
                                                        httpMethod === 'update' && <>
                                                            <FormControl fullWidth margin='dense' variant="outlined">
                                                                <InputLabel id="demo-simple-status">Status</InputLabel>
                                                                <Select
                                                                    labelId="demo-simple-status"
                                                                    id="demo-simple-select"
                                                                    value={status}
                                                                    label="Status"
                                                                    onChange={(e) => setStatus(e.target.value)}
                                                                >
                                                                    <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                                                                    <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                                                                </Select>
                                                            </FormControl>
                                                        </>
                                                    }
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                    <div class="tab-pane fade" id="custom-tabs-2" role="tabpanel" aria-labelledby="custom-tabs-2-tab">
                                        <form id={`training_form_2_${id}`}>
                                            <div className='row'>
                                                <div className='col-xl-12'>
                                                    {
                                                        schedule.length <= 0
                                                            ? <>
                                                                <div className='alert alert-light text-center mb-0'>
                                                                    <span className='material-icons-outlined' style={{ fontSize: '50px' }}>date_range</span><br/>
                                                                    Click <Link to="#" data-toggle="modal" data-target={`#training_schedule_${id}`} className="text-bold text-dark">here</Link> to add schedule.
                                                                </div>
                                                            </>
                                                            : <>
                                                                <label className='form-label'>
                                                                    <i className='fas fa-calendar-week mr-1 text-danger'></i> Schedule: 
                                                                    
                                                                    <Link to="#" data-toggle="modal" data-target={`#training_schedule_${id}`} className="text-bold text-primary">
                                                                        <i className='fas fa-plus ml-2 mr-1'></i> Add
                                                                    </Link>
                                                                </label>

                                                                <NMPDataTable 
                                                                    progressPending={null}
                                                                    columns={tableColumns} 
                                                                    data={schedule}
                                                                    selectableRows={false}
                                                                    selectedRows={null}
                                                                />
                                                            </>
                                                    }
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                    <div class="tab-pane fade" id="custom-tabs-3" role="tabpanel" aria-labelledby="custom-tabs4">
                                        <form id={`training_form_3_${id}`}>
                                            <div className='row'>
                                                <div className='col-xl-12'>
                                                    {
                                                        certificates.length <= 0
                                                            ? <NoDataFound message="No certificates found." />
                                                            : <>
                                                                <label className='form-label'>
                                                                    <i className='fas fa-calendar-week mr-1 text-danger'></i> Receivable Certificate: 
                                                                </label>

                                                                <NMPDataTable 
                                                                    progressPending={isFetching}
                                                                    columns={tableColumns2} 
                                                                    data={certificates}
                                                                    selectableRows={true}
                                                                    onSelectedRowsChange={(ids) => {
                                                                        const normalized = Array.isArray(ids) ? ids.map(Number) : [];
                                                                        if (JSON.stringify(normalized) !== JSON.stringify(selectedCertificatesRows)) {
                                                                            setSelectedCertificatesRows(normalized);
                                                                        }
                                                                    }}
                                                                    selectedRows={selectedCertificatesRows}
                                                                />
                                                            </>
                                                    }
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            <div class="card-footer border-top py-0 pb-3">
                                <div id="bar" class="progress my-3" style={{ height: '7px' }}>
                                    <div class="bar progress-bar progress-bar-striped progress-bar-animated bg-primary"></div>
                                </div>

                                <div class="row">
                                    <div class="col-xl-8">
                                        <a href="#" class="previous btn btn-default">
                                            <i class="fas fa-arrow-left mr-1"></i> Back
                                        </a>

                                        <a href="#" class="next btn btn-primary elevation-1 mx-1">
                                            Next <i class="fas fa-arrow-right ml-1"></i>
                                        </a>

                                        <button disabled={
                                            course.length === 0 ||
                                            module.length === 0 ||
                                            trainingFee.length === 0 ||
                                            batchNumber.length === 0 ||
                                            trainingAssessmentFee.length === 0 ||
                                            dailyHour.length === 0 ||
                                            schedule.length === 0 ||
                                            certificates.length === 0
                                        } onClick={FormSubmit} class={`submitRegistration ml-1 finish btn btn-${ httpMethod === 'POST' ? 'primary' : 'warning' } elevation-1 sr-only`}>
                                            { httpMethod === 'POST' ? 'Save Training' : 'Save Changes' } <i class="fas fa-save ml-1"></i>
                                        </button>
                                    </div>

                                    <div class="text-right col-xl-4 pt-1 counter"></div>
                                </div>
                            </div>
                        </div>
                    </>
            }
        </>
    )
}

export default EACreateOrUpdateTraining;