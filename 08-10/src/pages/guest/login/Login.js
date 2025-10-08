import { useState } from 'react';
import '../Guest.css';
import { Link, useNavigate } from 'react-router-dom';
import useToggleShowHidePass from '../../../hooks/useToggleShowHidePass';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import axios from 'axios';
import useShowSubmitLoader from '../../../hooks/useShowSubmitLoader';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import useShowToaster from '../../../hooks/useShowToaster';
import DpoDpsModal from './DpoDpsModal';
import useGetToken from '../../../hooks/useGetToken';

const Login = () => {
    const { setOpenToast, Toast, setToastMessage, setToastStatus } = useShowToaster();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader();
    const { url } = useSystemURLCon();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { setToken } = useGetToken();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { EndAdornment, visible, inputType } = useToggleShowHidePass();

    const LoginUser = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setShowLoader(true);
            setProgress(0);
            setOpenToast(false);
            setToastMessage("");

            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);

            const response = await axios.post(`${url}/login`, formData, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percent);
                    }
                }
            });

            if (response.status === 200) {
                setToken('csrf-token', response.data.token);
                switch (response.data.role) {
                    case 'TRAINEE':
                        navigate("/trainee/dashboard");
                        break;
                    case 'ADMIN-DORMITORY':
                        navigate("/dormitory/dashboard");
                        break;
                    case 'ADMIN-ENROLLMENT':
                        navigate("/enrollment/dashboard");
                        break;
                    case 'TRAINER':
                        navigate("/trainer/dashboard");
                        break;
                    default:
                        navigate("/access-denied")
                        break;
                }
            }
        } catch(error) {
            setOpenToast(true);
            setToastStatus('error');
            setToastMessage(error.response.data.message);
        } finally {
            setPassword('');
            setIsSubmitting(false);
            setShowLoader(false);
        }
    }

    return (
        <>
            { isSubmitting && <SubmitLoadingAnim cls="loader" /> }
            <Toast />
            <DpoDpsModal />

            <div className='guest-bg'>
                <div className="container">
                    <div className='row d-flex align-items-center justify-content-center'>
                        <div className='col-xl-12'>
                            <div className="card rounded-0 text-dark shadow fade-up">
                                <div className="card-body py-0 text--fontPos13--xW8hS">
                                    <div className='row'>
                                        <div className='col-xl-6'>
                                            <img src='/system-images/guest-left-img.png' className='img-fluid' />
                                        </div>

                                        <div className='col-xl-6 px-5 py-4'>
                                            <div className='text-center'>
                                                <img src='/system-images/banner-logo.png' height="80" className='mb-4' />
                                                
                                                <h5 style={{ lineHeight: '15px' }}>DEPARTMENT OF MIGRANT WORKERS</h5>
                                                <h5 className='text-bold'>NATIONAL MARITIME POLYTECHNIC</h5>
                                            </div>

                                            <form method="POST" className='mt-4' onSubmit={LoginUser}>
                                                <FormControl className='form-control form-control-sm' style={{ marginBottom: '35px' }} variant="outlined">
                                                    <InputLabel htmlFor="email">Email <span className='text-danger'>*</span></InputLabel>
                                                    <OutlinedInput
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        id="email"
                                                        type="email"
                                                        label="Email"
                                                    />
                                                </FormControl>

                                                <FormControl className='form-control form-control-sm mb-4' variant="outlined">
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

                                                <div className='alert alert-default border mt-3'>
                                                    RECAPTCHA CONTAINER
                                                </div>

                                                <div className="row mt-3">
                                                    <div className="col-xl-7 mb-2">
                                                        <Link to="/register" className="text--fontPos13--xW8hS btn btn-default btn-block">
                                                            Want to be a Trainee? <strong>Register now!</strong>
                                                        </Link>
                                                    </div>

                                                    <div className="col-xl-5 mb-2">
                                                        <button type="submit" disabled={!email || !password || isSubmitting} className="text--fontPos13--xW8hS btn btn-primary btn-block elevation-1">
                                                            { isSubmitting ? 'PLEASE WAIT..' : 'LOGIN' }
                                                        </button>
                                                    </div>

                                                    <div className='col-xl-12 mt-2 text-center'>
                                                        <Link to="/forgot-password" className="text-muted">
                                                            Forgot Password? <span className="text-bold">Click here</span>
                                                        </Link>
                                                    </div>

                                                    <div className='col-xl-12 mt-2 text-center'>
                                                        <Divider>or</Divider>
                                                    </div>
                                                </div>

                                                <div className="row mt-2">
                                                    <div className="col-xl-6 mb-2">
                                                        <button className="text--fontPos13--xW8hS btn btn-default btn-block">
                                                            <i className='fab fa-google text-danger mr-2'></i> Sign in with Google
                                                        </button>
                                                    </div>

                                                    <div className="col-xl-6 mb-2">
                                                        <button className="text--fontPos13--xW8hS btn btn-default btn-block">
                                                            <i className='fab fa-facebook text-primary mr-2'></i> Login with Facebook
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
                </div>
            </div>
        </>
    )
}

export default Login;