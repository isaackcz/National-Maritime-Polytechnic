/* global $ */
import { useEffect, useState } from 'react'
import useShowSubmitLoader from '../../../../../../hooks/useShowSubmitLoader';
import useShowToaster from '../../../../../../hooks/useShowToaster';
import { useNavigate } from 'react-router-dom';
import useGetToken from '../../../../../../hooks/useGetToken';
import axios from 'axios';
import useSystemURLCon from '../../../../../../hooks/useSystemURLCon';
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select, TextField } from '@mui/material';

const ModalTrainingFee = ({ data, httpMethod, id, modalTitle, callbackFunction }) => {
    const { url } = useSystemURLCon();
    const { removeToken, getToken } = useGetToken();
    const navigate = useNavigate();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader();
    const { setOpenToast, Toast, setToastMessage, setToastStatus } = useShowToaster();

    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        setName(data?.name);
        setAmount(data?.amount);
        setCategory(data?.category);
        setStatus(data?.status);
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
            formData.append('amount', amount);
            formData.append('category', category);
            formData.append('httpMethod', httpMethod);
            if(id > 0) formData.append('documentId', id);
            if(id > 0) formData.append('status', status);

            const response = await axios.post(`${url}/enrollment-admin/trainings/components/create_or_update_training_fee`, formData, {
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
            $(`#training_fee_${id}`).modal('hide');
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
            setName('');
            setAmount('');
            setCategory('');
            setStatus('');
            callbackFunction();
        }
    }

    return (
        <>
            <Toast />
            <SubmitLoadingAnim cls='loader' />

            <div className="modal fade" data-backdrop="static" data-keyboard="false" id={`training_fee_${id}`}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <span className="modal-title text-bold">{ modalTitle }</span>
                        </div>
                        <div className="modal-body pt-2">
                            <form method="POST" onSubmit={ProcessModalFunc}>
                                <FormControl fullWidth margin='dense' variant="outlined">
                                    <InputLabel htmlFor="name">Name <span className='text-danger'>*</span></InputLabel>
                                    <OutlinedInput
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        id="name"
                                        type="text"
                                        label="Name"
                                    />
                                </FormControl>

                                <FormControl fullWidth margin='dense' variant="outlined">
                                    <InputLabel htmlFor="amount">Amount <span className='text-danger'>*</span></InputLabel>
                                    <OutlinedInput
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        id="amount"
                                        type="number"
                                        label="Amount"
                                    />
                                </FormControl>

                                <FormControl fullWidth margin='dense' variant="outlined">
                                    <InputLabel id="demo-simple-category">Category</InputLabel>
                                    <Select
                                        labelId="demo-simple-category"
                                        id="demo-simple-category"
                                        value={category}
                                        label="category"
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <MenuItem value="REGULAR FUNDS">REGULAR FUNDS</MenuItem>
                                        <MenuItem value="LCCA">LCCA</MenuItem>
                                        <MenuItem value="DISCOUNT">DISCOUNT</MenuItem>
                                        <MenuItem value="GROUP PAYMENTS">GROUP PAYMENTS</MenuItem>
                                        <MenuItem value="ALL REGULAR FUNDS">ALL REGULAR FUNDS</MenuItem>
                                        <MenuItem value="ALL LCCA">ALL LCCA</MenuItem>
                                        <MenuItem value="CURRENT TRUST FUNDS">CURRENT TRUST FUNDS</MenuItem>
                                    </Select>
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
                                            <button type="submit" disabled={
                                                !name ||
                                                !amount ||
                                                !category
                                            } className={`btn btn-block btn-${ httpMethod === 'POST' ? 'primary' : 'warning' } elevation-1`}>
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

export default ModalTrainingFee;