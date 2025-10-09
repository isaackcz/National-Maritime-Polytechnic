import { useState } from 'react';
import '../Guest.css';
import { Link } from 'react-router-dom';
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
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

const Register = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setOpenToast, Toast, setToastMessage, setToastStatus } = useShowToaster();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader();
    const { url } = useSystemURLCon();

    const [fname, setFname] = useState("");
    const [mname, setMname] = useState("");
    const [lname, setLname] = useState("");
    const [suffix, setSuffix] = useState("");
    const [birthday, setBirthday] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm_password, setConfirmPassword] = useState("");
    const [isPasswordRuleValid, setIsPasswordRuleValid] = useState(false);
    const { EndAdornment, visible, inputType } = useToggleShowHidePass();

    const RegisterUser = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setShowLoader(true);
            setProgress(0);
            setOpenToast(false);
            setToastMessage("");

            const formData = new FormData();
            formData.append('fname', fname);
            formData.append('mname', mname);
            formData.append('lname', lname);
            formData.append('suffix', suffix);
            formData.append('email', email);
            formData.append('birthdate', birthday.format('YYYY-MM-DD'));
            formData.append('password', password);
            formData.append('password_confirmation', confirm_password);

            const response = await axios.post(`${url}/register`, formData, {
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
            
            setFname("");
            setMname("");
            setLname("");
            setBirthday(null);
            setSuffix("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
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

            <div className='guest-bg'>
                <div className="container">
                    <div className='row d-flex align-items-center justify-content-center'>
                        <div className='col-xl-12'>
                            <div className="card rounded-0 text-dark shadow fade-up">
                                <div className="card-body text--fontPos13--xW8hS px-5 py-4">
                                    <div className='d-flex align-items-center justify-content-between'>
                                        <h2 className='text-bold'>Create Your Account</h2>
                                        <img src='/system-images/banner-logo.png' height="80" className='mb-4' />
                                    </div>

                                    <form method="POST" className='mt-2' onSubmit={RegisterUser}>
                                        <div className='row'>
                                            <div className='col-xl-6 mb-2'>
                                                <FormControl className='form-control form-control-sm' style={{ marginBottom: '35px' }} variant="outlined">
                                                    <InputLabel htmlFor="fname">First name <span className='text-danger'>*</span></InputLabel>
                                                    <OutlinedInput
                                                        required
                                                        value={fname}
                                                        onChange={(e) => setFname(e.target.value)}
                                                        id="fname"
                                                        type="text"
                                                        label="First name"
                                                    />
                                                </FormControl>

                                                <FormControl className='form-control form-control-sm' style={{ marginBottom: '35px' }} variant="outlined">
                                                    <InputLabel htmlFor="mname">Middle name <span className='text-danger'>*</span></InputLabel>
                                                    <OutlinedInput
                                                        value={mname}
                                                        onChange={(e) => setMname(e.target.value)}
                                                        id="mname"
                                                        type="text"
                                                        label="Middle name"
                                                    />
                                                </FormControl>

                                                <FormControl className='form-control form-control-sm' style={{ marginBottom: '35px' }} variant="outlined">
                                                    <InputLabel htmlFor="lname">Last name <span className='text-danger'>*</span></InputLabel>
                                                    <OutlinedInput
                                                        value={lname}
                                                        onChange={(e) => setLname(e.target.value)}
                                                        id="lname"
                                                        type="text"
                                                        label="Last name"
                                                    />
                                                </FormControl>

                                                <FormControl fullWidth>
                                                    <InputLabel id="demo-simple-select-label">Suffix</InputLabel>
                                                    <Select
                                                        labelId="demo-simple-select-label"
                                                        id="demo-simple-select"
                                                        value={suffix}
                                                        label="Suffix"
                                                        onChange={(e) => setSuffix(e.target.value)}
                                                    >
                                                        <MenuItem value="JR.">JR.</MenuItem>
                                                        <MenuItem value="SR.">SR.</MenuItem>
                                                        <MenuItem value="I">I</MenuItem>
                                                        <MenuItem value="II">II</MenuItem>
                                                        <MenuItem value="III">III</MenuItem>
                                                        <MenuItem value="IV">IV</MenuItem>
                                                        <MenuItem value="V">V</MenuItem>
                                                    </Select>
                                                </FormControl>

                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DemoContainer components={['DatePicker']}>
                                                        <DatePicker 
                                                            value={birthday} 
                                                            onChange={(e) => setBirthday(e)} 
                                                            label={<p>Birthdate <span className='text-danger'>*</span></p>} sx={{ width: '100%' }} 
                                                        />
                                                    </DemoContainer>
                                                </LocalizationProvider>
                                            </div>

                                            <div className='col-xl-6'>
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
                        
                                        <div className='alert alert-default border mt-2'>
                                            RECAPTCHA CONTAINER
                                        </div>

                                        <FormGroup fullWidth>
                                            <FormControlLabel required control={<Checkbox />} label={<span>I agree to the <Link to="https://reserve.nmp.gov.ph/termsofservice" target='_blank'>terms of service</Link> and <Link to="http://reserve.nmp.gov.ph/privacypolicy" target='_blank'>privacy policy</Link>.</span>} />
                                        </FormGroup>

                                        <div className="row mt-3">
                                            <div className="col-xl-7 mb-2">
                                                <Link to="/" className="text--fontPos13--xW8hS btn btn-default btn-block">
                                                    Already have an account? <strong>Login now!</strong>
                                                </Link>
                                            </div>

                                            <div className="col-xl-5 mb-2">
                                                <button type="submit" disabled={
                                                    !fname || 
                                                    !mname || 
                                                    !lname || 
                                                    !birthday ||
                                                    !email ||
                                                    !password ||
                                                    !confirm_password || 
                                                    !isPasswordRuleValid
                                                } className="text--fontPos13--xW8hS btn btn-primary btn-block elevation-1">
                                                    { isSubmitting ? 'PLEASE WAIT..' : 'SUBMIT' }
                                                </button>
                                            </div>

                                            <div className='col-xl-12 mt-2 text-center'>
                                                <Divider>or</Divider>
                                            </div>
                                        </div>

                                        <div className="row mt-2">
                                            <div className="col-xl-6 mb-2">
                                                <button className="text--fontPos13--xW8hS btn btn-default btn-block">
                                                    <i className='fab fa-google text-danger mr-2'></i> Sign up with Google
                                                </button>
                                            </div>

                                            <div className="col-xl-6 mb-2">
                                                <button className="text--fontPos13--xW8hS btn btn-default btn-block">
                                                    <i className='fab fa-facebook text-primary mr-2'></i> Sign up with Facebook
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