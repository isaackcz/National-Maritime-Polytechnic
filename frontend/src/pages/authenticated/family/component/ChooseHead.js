/* global $ */

import axios from 'axios';
import { useState } from 'react';
import useWebToken from '../../../../hooks/useWebToken';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import { useNavigate } from 'react-router-dom';
import useShowSubmitLoader from '../../../../hooks/useShowSubmitLoader';

const ChooseHead = ({ 
    httpMethod, 
    documentId, 
    familyName, 
    familyHead, 
    houseType,
    houseStructure,
    tenureStatus,
    withElectricity,
    sourceOfWater,
    aFarmOwner,
    soloParent,
    a4psBeneficiary,
    selectedGadgets,
    selectedRows, 
    selectedResidents, 
    callbackFunction
}) => {
    const navigate = useNavigate();
    const { getToken, removeToken } = useWebToken();
    const { url, urlWithoutApi } = useSystemURLCon();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader(); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [head, setHead] = useState('');

    useState(() => {
        if(documentId) { setHead(familyHead); }
    }, []);

    const FormSubmit = async (e) => {
        e.preventDefault();

        try {
            setProgress(0);
            setIsSubmitting(true);
            setShowLoader(true);

            const token = getToken();
            const formData = new FormData();
            formData.append('familyName', familyName);
            formData.append('head', head);

            formData.append('houseType', houseType);
            formData.append('houseStructure', houseStructure);
            formData.append('tenureStatus', tenureStatus);
            formData.append('withElectricity', withElectricity);
            formData.append('sourceOfWater', sourceOfWater);
            formData.append('aFarmOwner', aFarmOwner);
            formData.append('soloParent', soloParent);
            formData.append('a4psBeneficiary', a4psBeneficiary);
            formData.append('selectedGadgets', selectedGadgets);
            
            selectedRows.forEach(id => {
                formData.append('selectedRows[]', id);
            });

            selectedGadgets.forEach(id => {
                formData.append('selectedGadgets[]', id);
            });

            if(documentId) {
                formData.append('httpMethod', 'update');
                formData.append('documentId', documentId);
            } else {
                formData.append('httpMethod', httpMethod);
            }

            const response = await axios.post(`${url}/family/create_or_update`, formData, {
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
                navigate(httpMethod === "create" ? '/welcome/family/list' : '');
            } 
        } catch (error) {
            if(error.response.status === 500) {
                removeToken();
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
            setIsSubmitting(false);
            setShowLoader(false);
            callbackFunction();
            $('#chooseHead').modal('hide');
        }
    }

    return (
        <>
            <SubmitLoadingAnim cls='loader' />

            <div className="modal fade" data-backdrop="static" data-keyboard="false" id="chooseHead">
                <div className="modal-dialog">
                    <div className="modal-content small">
                        <div className="modal-header py-2">
                            <span className="modal-title text-bold">Choose Family Head</span>
                        </div>
                        <div className="modal-body pt-3">
                            <form method="POST" onSubmit={FormSubmit}>
                                <input type="hidden" name="documentId" value={documentId} />

                                <label className="form-label mb-1">Select Family Head <span className="text-danger">*</span></label>
                                <select className="form-control form-control-sm" value={head} onChange={(e) => setHead(e.target.value)} required>
                                    <option value="">-- Choose --</option>
                                    {selectedResidents.map(resident => (
                                        <option key={resident.id} value={resident.id}>
                                            {`${resident.fname} ${resident.mname} ${resident.lname} ${resident.suffix ?? ''}`}
                                        </option>
                                    ))}
                                </select>

                                <div className='text-right mt-4'>
                                    <div className='row'>
                                        <div className='col-6 pr-0'>
                                            <button type="button" className="btn btn-sm btn-block btn-default py-0 text--fontPos13--xW8hS" data-dismiss="modal">Cancel</button>
                                        </div>

                                        <div className='col-6 pl-0'>
                                            <button type="submit" className={`btn btn-sm btn-block btn-${httpMethod === 'create' ? 'primary' : 'warning'} py-0 elevation-1 text--fontPos13--xW8hS ml-2`}>
                                                { httpMethod === "create" ? 'Save Composition' : 'Save Changes' }
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

export default ChooseHead;