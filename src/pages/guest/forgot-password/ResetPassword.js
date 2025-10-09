import { useEffect, useState } from 'react';
import '../Guest.css';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useToggleShowHidePass from '../../../hooks/useToggleShowHidePass';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ReactPasswordChecklist from 'react-password-checklist';

import useShowSubmitLoader from '../../../hooks/useShowSubmitLoader';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import useShowToaster from '../../../hooks/useShowToaster';
import axios from 'axios';

const Register = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setOpenToast, Toast, setToastMessage, setToastStatus } = useShowToaster();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader();
    const { url } = useSystemURLCon();
    const [ urlParams ] = useSearchParams(); 
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm_password, setConfirmPassword] = useState("");
    const [isPasswordRuleValid, setIsPasswordRuleValid] = useState(false);
    const { EndAdornment, visible, inputType } = useToggleShowHidePass();

    useEffect(() => {
        setEmail(urlParams.get('email'));
    }, []);

    const ResetPassword = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setShowLoader(true);
            setProgress(0);
            setOpenToast(false);
            setToastMessage("");

            const formData = new FormData();
            formData.append('token', urlParams.get('token'));
            formData.append('email', email);
            formData.append('password', password);
            formData.append('password_confirmation', confirm_password);

            const response = await axios.post(`${url}/reset-password`, formData, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percent);
                    }
                }
            });

            setOpenToast(true);
            setToastStatus('success');
            setToastMessage(response.data.message);
            navigate('/');
        } catch(error) {
            setOpenToast(true);
            setToastStatus('error');
            setToastMessage(error.response.data.message);
        } finally {
            setIsSubmitting(false);
            setShowLoader(false);
        }
    }

    return (
        <>
            { isSubmitting && <SubmitLoadingAnim cls="loader" /> }
            <Toast />

            <div className='guest-card-height'>
                <div className="container">
                    <div className='row d-flex align-items-center justify-content-center'>
                        <div className='col-xl-8'>
                            <div className="card rounded-0 text-dark shadow fade-up">
                                <div className="card-body text--fontPos13--xW8hS px-5 py-4">
                                    <div className='d-flex align-items-center justify-content-between'>
                                        <h2 className='text-bold'>Reset Password</h2>
                                        <img src='/system-images/banner-logo.png' height="80" className='mb-4' />
                                    </div>

                                    <form method="POST" className='mt-2' onSubmit={ResetPassword}>
                                        <div className='row'>
                                            <div className='col-xl-12'>
                                                <FormControl className='form-control form-control-sm' style={{ marginBottom: '33px' }} variant="outlined">
                                                    <InputLabel htmlFor="outlined-adornment-email">Email <span className='text-danger'>*</span></InputLabel>
                                                    <OutlinedInput
                                                        readOnly
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        id="outlined-adornment-email"
                                                        type='email'
                                                        label="Email"
                                                    />
                                                </FormControl>

                                                <ReactPasswordChecklist
                                                    rules={["minLength", "specialChar", "number", "capital"]}
                                                    minLength={6}
                                                    value={password}
                                                    iconSize={10}
                                                    onChange={(isValid) => {
                                                        setIsPasswordRuleValid(isValid);
                                                    }}
                                                    style={{ marginBottom: '8px', height: '125px' }}
                                                    className="alert alert-light px-3 pt-1 text-dark"
                                                />

                                                <FormControl className='form-control form-control-sm' style={{ marginBottom: '33px' }} variant="outlined">
                                                    <InputLabel htmlFor="outlined-adornment-password">Password <span className='text-danger'>*</span></InputLabel>
                                                    <OutlinedInput
                                                        required
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        id="outlined-adornment-password"
                                                        type={inputType}
                                                        endAdornment={<EndAdornment />}
                                                        label="Password"
                                                    />
                                                </FormControl>

                                                <FormControl className='form-control form-control-sm' style={{ marginBottom: '35px' }} variant="outlined">
                                                    <InputLabel htmlFor="outlined-adornment-confirm-password">Confirm Password <span className='text-danger'>*</span></InputLabel>
                                                    <OutlinedInput
                                                        required
                                                        value={confirm_password}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        id="outlined-adornment-confirm-password"
                                                        type={inputType}
                                                        endAdornment={<EndAdornment />}
                                                        label="Confirm Password"
                                                    />
                                                </FormControl>
                                            </div>
                                        </div>
                        
                                        {/* <div className="g-recaptcha" data-sitekey="6Ld4u90rAAAAAMZEiRe7Z9IKM4uF6tL-TPhilDwe"></div> */}
                                        <div className='alert alert-default border mt-2'>
                                            RECAPTCHA CONTAINER
                                        </div>

                                        <div className="row mt-3">
                                            <div className="col-xl-12 mb-2">
                                                <button type="submit" disabled={!email || !password || !confirm_password || !isPasswordRuleValid} className="text--fontPos13--xW8hS btn btn-primary btn-block elevation-1">
                                                    { isSubmitting ? 'PLEASE WAIT..' : 'SUBMIT' }
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Register;