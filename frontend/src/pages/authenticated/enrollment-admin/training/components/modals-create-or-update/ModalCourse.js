/* global $ */
import { useEffect, useState } from 'react'
import useShowSubmitLoader from '../../../../../../hooks/useShowSubmitLoader';
import useShowToaster from '../../../../../../hooks/useShowToaster';
import { useNavigate } from 'react-router-dom';
import useGetToken from '../../../../../../hooks/useGetToken';
import axios from 'axios';
import useSystemURLCon from '../../../../../../hooks/useSystemURLCon';
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select, TextField } from '@mui/material';

const ModalCourse = ({ data, httpMethod, id, modalTitle, callbackFunction }) => {
    const { url } = useSystemURLCon();
    const { removeToken, getToken } = useGetToken();
    const navigate = useNavigate();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader();
    const { setOpenToast, Toast, setToastMessage, setToastStatus } = useShowToaster();

    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        setTitle(data?.course_name);
        setStatus(data?.course_status);
    }, [data]);

    const ProcessModalFunc = async (e) => {
        e.preventDefault();

        try {
            setShowLoader(true);
            setProgress(0);
            setOpenToast(false);
            setToastMessage("");

            const token = getToken('csrf-token');
            const formData = new FormData();
            formData.append('name', title);
            formData.append('httpMethod', httpMethod);
            if(id > 0) formData.append('documentId', id);
            if(id > 0) formData.append('status', status);

            const response = await axios.post(`${url}/enrollment-admin/trainings/components/create_or_update_course`, formData, {
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

            setOpenToast(true);
            setToastStatus('success');
            setToastMessage(response.data.message);
            $(`#course_${id}`).modal('hide');
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
            setTitle('');
            callbackFunction();
            $(`#course_${id}`).modal('hide');
        }
    }

    return (
        <>
            <Toast />
            <SubmitLoadingAnim cls='loader' />

            <div className="modal fade" data-backdrop="static" data-keyboard="false" id={`course_${id}`}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <span className="modal-title text-bold">{ modalTitle }</span>
                        </div>
                        <div className="modal-body pt-2">
                            <form method="POST" onSubmit={ProcessModalFunc}>
                                <FormControl fullWidth margin='dense' variant="outlined">
                                    <InputLabel htmlFor="title">Title <span className='text-danger'>*</span></InputLabel>
                                    <OutlinedInput
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        id="title"
                                        type="text"
                                        label="Title"
                                    />
                                </FormControl>

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
        
                                <div className='text-right mt-3'>
                                    <div className='row'>
                                        <div className={`col-6`}>
                                            <button type="button" className="btn btn-block btn-default" data-dismiss="modal">Cancel</button>
                                        </div>

                                        <div className='col-6'>
                                            <button type="submit" disabled={!title} className={`btn btn-block btn-${ httpMethod === 'POST' ? 'primary' : 'warning' } elevation-1`}>
                                                <i className='fas fa-save mr-2'></i> { httpMethod === 'POST' ? 'Submit' : 'Save Changes' }
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ModalCourse;