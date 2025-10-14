import { useState } from 'react';
import '../Guest.css';
import { Link } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import useShowSubmitLoader from '../../../hooks/useShowSubmitLoader';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import useShowToaster from '../../../hooks/useShowToaster';
import axios from 'axios';

const Register = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setOpenToast, Toast, setToastMessage, setToastStatus } = useShowToaster();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader();
    const { url } = useSystemURLCon();
    const [email, setEmail] = useState("");

    const RegisterUser = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setShowLoader(true);
            setProgress(0);
            setOpenToast(false);
            setToastMessage("");

            const formData = new FormData();
            formData.append('email', email);

            const response = await axios.post(`${url}/forgot-password`, formData, {
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
                                        <h2 className='text-bold'>Forgot Password</h2>
                                        <img src='/system-images/banner-logo.png' height="80" className='mb-4' />
                                    </div>

                                    <form method="POST" className='mt-2' onSubmit={RegisterUser}>
                                        <div className='row'>
                                            <div className='col-xl-12'>
                                                <FormControl className='form-control form-control-sm' style={{ marginBottom: '33px' }} variant="outlined">
                                                    <InputLabel htmlFor="outlined-adornment-email">Email <span className='text-danger'>*</span></InputLabel>
                                                    <OutlinedInput
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        id="outlined-adornment-email"
                                                        type='email'
                                                        label="Email"
                                                    />
                                                </FormControl>
                                            </div>
                                        </div>
                        
                                        {/* <div className="g-recaptcha" data-sitekey="6Ld4u90rAAAAAMZEiRe7Z9IKM4uF6tL-TPhilDwe"></div> */}
                                        <div className='alert alert-default border mt-2'>
                                            RECAPTCHA CONTAINER
                                        </div>

                                        <div className="row mt-3">
                                            <div className="col-xl-7 mb-2">
                                                <Link to="/" className="text--fontPos13--xW8hS btn btn-default btn-block">
                                                    Return homepage
                                                </Link>
                                            </div>

                                            <div className="col-xl-5 mb-2">
                                                <button type="submit" disabled={!email} className="text--fontPos13--xW8hS btn btn-primary btn-block elevation-1">
                                                    SUBMIT
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