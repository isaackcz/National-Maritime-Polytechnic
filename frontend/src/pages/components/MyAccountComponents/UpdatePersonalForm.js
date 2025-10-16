/* global $ */
import { useEffect, useRef, useState } from "react";
import useGetCurrentUser from "../../../hooks/useGetCurrentUser";
import useSystemURLCon from "../../../hooks/useSystemURLCon";
import SkeletonLoader from "../SkeletonLoader/SkeletonLoader";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import useShowToaster from "../../../hooks/useShowToaster";
import useShowSubmitLoader from "../../../hooks/useShowSubmitLoader";
import useGetToken from "../../../hooks/useGetToken";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UpdatePersonalForm = ({ callbackFunction, urlPrefix }) => {
    const navigate = useNavigate();
    const { getToken, removeToken } = useGetToken();
    const { setOpenToast, Toast, setToastMessage, setToastStatus } = useShowToaster();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader();
    const { userData, refreshUser } = useGetCurrentUser();
    const { url } = useSystemURLCon();
    const [isFetchingPersonal, setIsFetchingPersonal] = useState(true);
    const [isSubmittingPersonal, setIsSubmittingPersonal] = useState(false);
    const [fetchData, setFetchData] = useState(true);

    const [fname, setFname] = useState("");
    const [mname, setMname] = useState("");
    const [lname, setLname] = useState("");
    const [suffix, setSuffix] = useState("");
    const [birthday, setBirthday] = useState(null);
    const [email, setEmail] = useState("");
    const fileInputRef = useRef(null);

    useEffect(() => {
        if(userData) {
            setFname(userData?.fname);
            setMname(userData?.mname);
            setLname(userData?.lname);
            setSuffix(userData?.suffix);
            setEmail(userData?.email);
            setBirthday(dayjs(userData?.birthdate));
            setIsFetchingPersonal(false);

            if($('.result') && window.initializeCropper) {
                window.initializeCropper();
            }
        }
    }, [userData, isFetchingPersonal]);

    const SubmitFormPersonal = async (e) => {
        e.preventDefault();
        
        try {
            setProgress(0);
            setIsSubmittingPersonal(true);
            setShowLoader(true);
            setOpenToast(false);
            setToastMessage("");

            const token = getToken("csrf-token");
            const formData = new FormData();
            formData.append('firstName', fname);
            formData.append('middleName', mname);
            formData.append('lastName', lname);
            formData.append('suffix', suffix);
            formData.append('email', email);
            formData.append('avatar', $('#image_data').val());
            formData.append('birthdate', birthday.format('YYYY-MM-DD'));

            const response = await axios.post(`${url}/${urlPrefix}/my-account/update_personal`, formData, {
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

                if(response.data.reloggin) {
                    removeToken('csrf-token');
                    navigate('/');
                } else {
                    refreshUser();
                }

                callbackFunction();
            } 
        } catch (error) {
            if(error.response.status === 500) {
                removeToken('csrf-token');
                navigate('/access-denied');
            } else {
                setOpenToast(true);
                setToastStatus('error');
                setToastMessage(error.response.data.message);
            }
        } finally {
            setIsSubmittingPersonal(false);
            setShowLoader(false);
        }
    }

    return (
        <>
            <Toast />
            <SubmitLoadingAnim cls="loader" />

            {
                isFetchingPersonal
                    ? <SkeletonLoader onViewMode="update" />
                    : <>
                        <div className="card elevation-0 border-0 p-0 m-0 rounded-0">
                            <div className='card-body p-0'>
                                <div className="card elevation-0 m-0">
                                    <div className="card-body">
                                        <div className='alert alert-default border'>
                                            <div className='row'>
                                                <div className='col-1 text-center' style={{ paddingTop: '5px' }}>
                                                    <span className='fas fa-exclamation text-danger text-bold' style={{ fontSize: '23px' }}></span>
                                                </div>

                                                <div className='col-11 pt-2' style={{ lineHeight: '17px' }}>
                                                    Once you change your email, the system will generate a temporary password and send it to the new email address you provided to ensure account protection. 
                                                    You will then be logged out and need to log in again with the temporary password.
                                                </div>
                                            </div>
                                        </div>

                                        <form onSubmit={SubmitFormPersonal} method='POST' encType="multipart/form-data">
                                            <div className='row'>
                                                <div className='col-xl-3 mb-1'>
                                                    <FormControl className='form-control form-control-sm' margin='dense' variant="outlined">
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
                                                </div>

                                                <div className='col-xl-3 mb-1'>
                                                    <FormControl className='form-control form-control-sm' margin='dense' variant="outlined">
                                                        <InputLabel htmlFor="mname">Middle name</InputLabel>
                                                        <OutlinedInput
                                                            value={mname}
                                                            onChange={(e) => setMname(e.target.value)}
                                                            id="mname"
                                                            type="text"
                                                            label="Middle name"
                                                        />
                                                    </FormControl>
                                                </div>

                                                <div className='col-xl-3 mb-1'>
                                                    <FormControl className='form-control form-control-sm' margin='dense' variant="outlined">
                                                        <InputLabel htmlFor="mname">Last name <span className='text-danger'>*</span></InputLabel>
                                                        <OutlinedInput
                                                            required
                                                            value={lname}
                                                            onChange={(e) => setLname(e.target.value)}
                                                            id="mname"
                                                            type="text"
                                                            label="last name"
                                                        />
                                                    </FormControl>
                                                </div>

                                                <div className='col-xl-3 mb-1'>
                                                    <FormControl fullWidth margin='dense'>
                                                        <InputLabel id="demo-simple-select-label">Suffix</InputLabel>
                                                        <Select
                                                            labelId="demo-simple-select-label"
                                                            id="demo-simple-select"
                                                            value={suffix}
                                                            defaultValue=""
                                                            label="Suffix"
                                                            onChange={(e) => setSuffix(e.target.value)}
                                                        >
                                                            <MenuItem value="">N/A</MenuItem>
                                                            <MenuItem value="JR.">JR.</MenuItem>
                                                            <MenuItem value="SR.">SR.</MenuItem>
                                                            <MenuItem value="I">I</MenuItem>
                                                            <MenuItem value="II">II</MenuItem>
                                                            <MenuItem value="III">III</MenuItem>
                                                            <MenuItem value="IV">IV</MenuItem>
                                                            <MenuItem value="V">V</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </div>

                                                <div className='col-xl-3 mb-1'>
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

                                                <div className='col-xl-3 mb-1'>
                                                    <FormControl className='form-control form-control-sm' margin='dense' variant="outlined">
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

                                            <div class="row">
                                                <div className='col-xl-12 my-1 mt-2'>
                                                    <label className='form-label mb-0'>New Avatar</label>
                                                    <FormControl className='form-control form-control-sm' margin='dense' variant="outlined">
                                                        <OutlinedInput
                                                            ref={fileInputRef}
                                                            id="file-input"
                                                            type='file'
                                                        />
                                                    </FormControl>
                                                </div>

                                                <div class="col-xl-6">
                                                    <div class="result mt-4 border" style={{ height: "400px", width: "100%" }}>
                                                        <div className="d-flex align-items-center text-muted justify-content-center" style={{ height: "400px", width: "100%" }}>
                                                            <small>No image chosen.</small>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="col-xl-6 mt-3">
                                                    <button type="button" id="done_adjust" disabled={fileInputRef !== null} class="btn btn-light small btn-sm elevation-1 text--fontPos13--xW8hS my-2">Done Cropping</button>
                                                    <textarea class="form-control form-control-sm sr-only" name="image_data" id="image_data" placeholder="-- Please click Done Cropping button if finish --" rows="3"></textarea>
                                                </div>
                                            </div>

                                            <button type="submit" disabled={ isSubmittingPersonal || !fname || !mname || !lname || !email || !birthday } className={`btn btn-warning btn-sm mt-3 elevation-1 text--fontPos13--xW8hS`}>
                                                <i className="fas fa-save mr-2"></i> Save Changes
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
            }
        </>
    )
}

export default UpdatePersonalForm;