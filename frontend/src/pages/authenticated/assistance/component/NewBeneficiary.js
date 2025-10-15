/* global $ */

import { useEffect, useState } from 'react';
import useShowSubmitLoader from '../../../../hooks/useShowSubmitLoader';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import useWebToken from '../../../../hooks/useWebToken';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const NewBeneficiary = ({ assistanceId, callbackFunction }) => {
    const { url } = useSystemURLCon();
    const { assistance_id } = useParams();
    const navigate = useNavigate();
    const { getToken, removeToken } = useWebToken();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader();
    const [isFetching, setIsFetching] = useState(false);
    const [residents, setResidents] = useState([]);

    const [beneficiary, setBeneficiary] = useState('');
    const [dateAcquired, setDateAcquired] = useState('');

    useEffect(() => { GetResidents(); }, []);

    const GetResidents = async () => {
        try {
            setIsFetching(true);

            const token = getToken();
            const response = await axios.get(`${url}/assistance/get_vacant_tobe_beneficiary_resident/${assistanceId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setResidents(response.data.eligibleResidents);
        } catch (error) {
            removeToken();
            navigate('/access-denied');
        } finally {
            setIsFetching(false);
            callbackFunction();
        }
    }

    const FormSubmit = async (e) => {
        e.preventDefault();

        try {
            setProgress(0);
            setShowLoader(true);

            const token = getToken();
            const formData = new FormData();
            formData.append('resident', beneficiary);
            formData.append('dataAcquired', dateAcquired);

            const response = await axios.post(`${url}/assistance/list/${assistance_id}/new_beneficiary`, formData, {
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
                alert(response.data.message);
            } 
        } catch (error) {
            if(error.response.status === 500) {
                removeToken();
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
            callbackFunction();
            setShowLoader(false);

            setBeneficiary('');
            setDateAcquired('');
            $('#addBeneficiary').modal('hide');
        }
    }

    return (
        <>
            <SubmitLoadingAnim cls='loader' />

            <div className="modal fade" data-backdrop="static" data-keyboard="false" id="addBeneficiary">
                <div className="modal-dialog">
                    <div className="modal-content small">
                        <div className="modal-header py-2">
                            <span className="modal-title text-bold">Add Beneficiary</span>
                        </div>
                        <div className="modal-body pt-3">
                            <div className='alert alert-default border mb-2'>
                                <div className='row'>
                                    <div className='col-1 text-center pt-2'>
                                        <span className='fas fa-exclamation text-danger text-bold' style={{ fontSize: '20px' }}></span>
                                    </div>

                                    <div className='col-11' style={{ lineHeight: '18px' }}>
                                        Assistance records are final and cannot be modified after saving to ensure accuracy and integrity of records.
                                    </div>
                                </div>
                            </div>

                            <form method="POST" onSubmit={FormSubmit}>
                                <input type="hidden" name="documentId" value={assistanceId} />

                                <label className="form-label mb-1">Select Beneficiary <span className="text-danger">*</span></label>    
                                <select className='form-control form-control-sm select' value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} required>
                                    <option value=''>-- Choose --</option>
                                    {
                                        residents.map((resident, _) => (
                                            <>
                                                <option value={resident.id}>{`${resident.fname} ${resident.mname} ${resident.lname} ${resident.suffix ?? ''}`}</option>
                                            </>
                                        ))
                                    }
                                </select>

                                <label className="form-label mt-2 mb-1">Date Acquired <span className="text-danger">*</span></label>    
                                <div className="input-group mb-1">
                                    <input type="date" value={dateAcquired} min={new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]}  onChange={(e) => setDateAcquired(e.target.value)} className="form-control form-control-sm" required />
                                </div>

                                <div className='text-right mt-4'>
                                    <div className='row'>
                                        <div className='col-6 pr-0'>
                                            <button type="button" className="btn btn-sm btn-block btn-default py-0 text--fontPos13--xW8hS" data-dismiss="modal">Cancel</button>
                                        </div>

                                        <div className='col-6 pl-0'>
                                            <button type="submit" disabled={!beneficiary || !dateAcquired} className='btn btn-sm btn-block btn-primary py-0 elevation-1 text--fontPos13--xW8hS ml-2'>
                                                Add to List
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

export default NewBeneficiary