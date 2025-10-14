/* global $ */
import useShowSubmitLoader from '../../../hooks/useShowSubmitLoader';
import useWebToken from '../../../hooks/useWebToken';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ModalDeleteRow = ({ id, url, message, modalTitle, callbackFunction }) => {
    const { removeToken, getToken } = useWebToken();
    const navigate = useNavigate();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader();

    const ProcessModalFunc = async (e) => {
        e.preventDefault();

        try {
            setProgress(0);
            setShowLoader(true);

            const token = getToken();
            const response = await axios.post(url, {
                documentId: id
            }, {
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
                $(`#data_row_${id}`).modal('hide');
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

            <div className="modal fade" data-backdrop="static" data-keyboard="false" id={`data_row_${id}`}>
                <div className="modal-dialog">
                    <div className="modal-content small">
                        <div className="modal-header py-2">
                            <span className="modal-title text-bold">{ modalTitle }</span>
                        </div>
                        <div className="modal-body pt-3">
                            <form method="POST" onSubmit={ProcessModalFunc}>
                                <input type="hidden" name="documentId" value={id} />

                                <p className='text-left'>{ message }</p>

                                <div className='text-right mt-4'>
                                    <div className='row'>
                                        <div className='col-6 pr-0'>
                                            <button type="button" className="btn btn-sm btn-block btn-default py-0 text--fontPos13--xW8hS" data-dismiss="modal">Cancel</button>
                                        </div>

                                        <div className='col-6 pl-0'>
                                            <button type="submit" className={`btn btn-sm btn-block btn-danger py-0 elevation-1 text--fontPos13--xW8hS ml-2`}>
                                                Delete
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

export default ModalDeleteRow;