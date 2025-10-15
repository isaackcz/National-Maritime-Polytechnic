/* global $ */
import { useEffect, useState } from 'react'
import useShowSubmitLoader from '../../../../../../hooks/useShowSubmitLoader';
import useShowToaster from '../../../../../../hooks/useShowToaster';
import { useNavigate } from 'react-router-dom';
import useGetToken from '../../../../../../hooks/useGetToken';
import axios from 'axios';
import useSystemURLCon from '../../../../../../hooks/useSystemURLCon';
import { FormControl, InputLabel, OutlinedInput, TextField } from '@mui/material';

const ModalCertificate = ({ data, httpMethod, id, modalTitle, callbackFunction }) => {
    const { url } = useSystemURLCon();
    const { removeToken, getToken } = useGetToken();
    const navigate = useNavigate();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader();
    const { setOpenToast, Toast, setToastMessage, setToastStatus } = useShowToaster();

    const [name, setName] = useState('');
    const [header, setHeader] = useState('');
    const [header1, setHeader1] = useState('');
    const [header2, setHeader2] = useState('');
    const [body, setBody] = useState('');

    useEffect(() => {
        setName(data?.name);
        setHeader(data?.header);
        setHeader1(data?.header_1);
        setHeader2(data?.header_2);
        setBody(data?.body);
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
            formData.append('name', name);
            formData.append('header', header);
            formData.append('header_1', header1);
            formData.append('header_2', header2);
            formData.append('body', body);
            formData.append('httpMethod', httpMethod);
            if(id > 0) formData.append('documentId', id);

            const response = await axios.post(`${url}/enrollment-admin/trainings/components/create_or_update_certificate`, formData, {
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

            setName('');
            setHeader('');
            setHeader1('');
            setHeader2('');
            setBody('');

            setOpenToast(true);
            setToastStatus('success');
            setToastMessage(response.data.message);
            $(`#certificate_${id}`).modal('hide');
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

    return (
        <>
            <Toast />
            <SubmitLoadingAnim cls='loader' />

            <div className="modal fade" data-backdrop="static" data-keyboard="false" id={`certificate_${id}`}>
                <div className="modal-dialog modal-xl modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <span className="modal-title text-bold">{ modalTitle }</span>
                        </div>
                        <div className="modal-body pt-2">
                            <div className='alert alert-light mb-1'>
                                <div className='d-flex align-items-center'>
                                    <span className='fas fa-code text-primary mb-2'></span>
                                </div>
                                <div><strong>Current Day:</strong> {`{currentDay}`}</div>
                                <div><strong>Date From:</strong> {`{fromDate}`}</div>
                                <div><strong>Date To:</strong> {`{toDate}`}</div>
                                <div><strong>Month:</strong> {`{month}`}</div>
                                <div><strong>Bold Text:</strong> {`{b} content {/b}`}</div>
                                <div><strong>Text Break:</strong> {`{br}`}</div>
                                <div><strong>Training Hours Taken:</strong> {`{trainingHours}`}</div>
                            </div>

                            <form method="POST" onSubmit={ProcessModalFunc}>
                                <FormControl margin='dense' className='w-100' variant="outlined">
                                    <InputLabel htmlFor="outlined-adornment-cert-name">Name</InputLabel>
                                    <OutlinedInput
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        id="outlined-adornment-cert-name"
                                        type="text"
                                        label="Name"
                                    />
                                </FormControl>

                                <TextField
                                    margin='dense'
                                    fullWidth
                                    id="outlined-multiline-static"
                                    label={<><span>Header <span className='text-danger'>*</span></span></>}
                                    multiline
                                    value={header}
                                    onChange={(e) => setHeader(e.target.value)}
                                    rows={7}
                                />

                                <TextField
                                    margin='dense'
                                    fullWidth
                                    id="outlined-multiline-static-header-1"
                                    label={<><span>Header 1 <span className='text-danger'>*</span></span></>}
                                    multiline
                                    value={header1}
                                    onChange={(e) => setHeader1(e.target.value)}
                                    rows={7}
                                />

                                <TextField
                                    margin='dense'
                                    fullWidth
                                    id="outlined-multiline-static-header-2"
                                    label={<><span>Header 2 <span className='text-danger'>*</span></span></>}
                                    multiline
                                    value={header2}
                                    onChange={(e) => setHeader2(e.target.value)}
                                    rows={7}
                                />

                                <TextField
                                    margin='dense'
                                    fullWidth
                                    id="outlined-multiline-static-body"
                                    label={<><span>Body <span className='text-danger'>*</span></span></>}
                                    multiline
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={7}
                                />
        
                                <div className='text-right mt-3'>
                                    <div className='row'>
                                        <div className={`col-6`}>
                                            <button type="button" className="btn btn-block btn-default" data-dismiss="modal">Cancel</button>
                                        </div>

                                        <div className='col-6'>
                                            <button type="submit" className={`btn btn-block btn-${ httpMethod === 'POST' ? 'primary' : 'warning' } elevation-1`}>
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

export default ModalCertificate;