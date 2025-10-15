/* global $ */

import { useEffect, useState } from 'react';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import useWebToken from '../../../hooks/useWebToken';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useShowSubmitLoader from '../../../hooks/useShowSubmitLoader';

const ModalNewUpdateAssistance = ({ id, modalTitle, httpMethod, defaultValue, callbackFunction }) => {
    const { url } = useSystemURLCon();
    const navigate = useNavigate();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader(); 
    const { getToken, removeToken } = useWebToken();
    const [assistanceName, setAssistanceName] = useState("");

    useEffect(() => { setAssistanceName(defaultValue); }, [defaultValue]);

    const ProcessModalFunc = async (e) => {
        e.preventDefault();
        
        try {
            setProgress(0);
            setShowLoader(true);

            const token = getToken();
            const formData = new FormData();
            formData.append('assistanceName', assistanceName);

            if(httpMethod === 'create') {
                formData.append('httpMethod', 'create');
            } else {
                formData.append('httpMethod', 'update');
                formData.append('documentId', id);
            }

            const response = await axios.post(`${url}/assistance/create_or_update`, formData, {
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
                setAssistanceName("");
                alert(response.data.message);
                $(`#assistance_${id}`).modal('hide');
            }
        } catch (error) {
            if(error.response.status === 500) {
                removeToken();
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
            setShowLoader(false);
            callbackFunction();
        }
    }

    return (
        <>
            <SubmitLoadingAnim cls='loader' />

            <div className="modal fade" data-backdrop="static" data-keyboard="false" id={`assistance_${id}`}>
                <div className="modal-dialog">
                    <div className={`modal-content ${ httpMethod !== "update" ? '' : 'small' }`}>
                        <div className="modal-header py-2">
                            <span className="modal-title text-bold">{ modalTitle }</span>
                        </div>
                        <div className="modal-body pt-3 text-left">
                            <form method="POST" onSubmit={ProcessModalFunc}>
                                <input type="hidden" name="http_method" value={httpMethod} />
                                <input type="hidden" name="document_id" value={id} />

                                <label className={`form-label ${ httpMethod == "update" ? '' : 'small' } mb-0`}>Assistance <span className="text-danger">*</span></label>
                                <div className="input-group mt-1">
                                    <input  type="text" value={assistanceName} onChange={(e) => setAssistanceName(e.target.value)} className="form-control form-control-sm" placeholder='Enter here..' required />
                                </div>

                                <div className='text-right mt-4'>
                                    <div className='row'>
                                        <div className='col-6 pr-0'>
                                            <button type="button" className="btn btn-sm btn-block btn-default py-0 text--fontPos13--xW8hS" data-dismiss="modal">Cancel</button>
                                        </div>

                                        <div className='col-6 pl-0'>
                                            <button type="submit" disabled={!assistanceName} className={`btn btn-sm btn-block btn-${httpMethod == "update" ? 'warning' : 'primary'} py-0 elevation-1 text--fontPos13--xW8hS ml-2 `}>
                                                { httpMethod == "update" ? 'Save Changes' : 'Submit' }
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

export default ModalNewUpdateAssistance;