import { FormControl, InputLabel, OutlinedInput } from '@mui/material';
import React, { useState } from 'react'
import ReactPasswordChecklist from 'react-password-checklist';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import axios from 'axios';
import useShowToaster from '../../../hooks/useShowToaster';
import useShowSubmitLoader from '../../../hooks/useShowSubmitLoader';
import useToggleShowHidePass from '../../../hooks/useToggleShowHidePass';
import useGetToken from '../../../hooks/useGetToken';
import { useNavigate } from 'react-router-dom';

const UpdatePassword = ({ urlPrefix }) => {
    const { removeToken, getToken } = useGetToken();
    const navigate = useNavigate();
    const { url } = useSystemURLCon();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader();
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordRuleValid, setIsPasswordRuleValid] = useState(false);
    const { setOpenToast, Toast, setToastMessage, setToastStatus } = useShowToaster();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { EndAdornment, visible, inputType } = useToggleShowHidePass();

    const SubmitFormChangePassword = async (e) => {
        e.preventDefault();

        try {
            setProgress(0);
            setIsSubmitting(true);
            setShowLoader(true);
            setOpenToast(false);
            setToastMessage("");

            const token = getToken("csrf-token");
            const formData = new FormData();
            formData.append('current_password', currentPassword);
            formData.append('password', password);
            formData.append('password_confirmation', confirmPassword);

            const response = await axios.post(`${url}/${urlPrefix}/my-account/update_password`, formData, {
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
                if(response.data.reloggin) {
                    setOpenToast(true);
                    setToastStatus('success');
                    setToastMessage(response.data.message);

                    removeToken('csrf-token');
                    navigate('/');
                }
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
            setIsSubmitting(false);
            setShowLoader(false);
        }
    }

    return (
        <>
            <Toast />
            <SubmitLoadingAnim cls="loader" />
            
            <form onSubmit={SubmitFormChangePassword}>
                <div className='row'>
                    <div className='col-xl-12'>
                        <ReactPasswordChecklist
                            rules={["minLength","specialChar","number","capital", "match"]}
                            minLength={5}
                            value={password}
                            valueAgain={confirmPassword}
                            iconSize={10}
                            onChange={(isValid) => {
                                setIsPasswordRuleValid(isValid);
                            }}
                            className="alert alert-light px-3 py-1 text-dark"
                        />
                    </div>

                    <div className='col-xl-12'>
                        <FormControl margin='dense' className='w-100' variant="outlined">
                            <InputLabel htmlFor="outlined-adornment-current-password">Enter your current password</InputLabel>
                            <OutlinedInput
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                id="outlined-adornment-current-password"
                                type={inputType}
                                endAdornment={<EndAdornment />}
                                label="Enter your current password"
                            />
                        </FormControl>
                    </div>

                    <div className='col-xl-12'>
                        <FormControl margin='dense' className='w-100' variant="outlined">
                            <InputLabel htmlFor="outlined-adornment-password">Enter your new password</InputLabel>
                            <OutlinedInput
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                id="outlined-adornment-password"
                                type={inputType}
                                endAdornment={<EndAdornment />}
                                label="Enter your new password"
                            />
                        </FormControl>
                    </div>

                    <div className='col-xl-12'>
                        <FormControl margin='dense' className='w-100' variant="outlined">
                            <InputLabel htmlFor="outlined-adornment-confirm-password">Re-enter your new password</InputLabel>
                            <OutlinedInput
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                id="outlined-adornment-confirm-password"
                                type={inputType}
                                endAdornment={<EndAdornment />}
                                label="Re-enter your new password"
                            />
                        </FormControl>
                    </div>
                </div>
                
                <button type="submit" disabled={ isSubmitting || !currentPassword || !password || !confirmPassword || !isPasswordRuleValid } className="btn btn-warning btn-sm mt-3 elevation-1 text--fontPos13--xW8hS">
                    <i className='fas fa-save mr-2'></i> Save Changes
                </button>
            </form>
        </>
    )
}

export default UpdatePassword