import { useState } from 'react';
import useGetToken from '../../hooks/useGetToken';
import axios from 'axios';
import useSystemURLCon from '../../hooks/useSystemURLCon';
import { useNavigate } from 'react-router-dom';
import useShowSubmitLoader from '../../hooks/useShowSubmitLoader';

const LogoutBtn = () => {
    const { url } = useSystemURLCon();
    const navigate = useNavigate();
    const [isProcessingLogout, setIsProcessingLogout] = useState(false);
    const { setShowLoader, SubmitLoadingAnim } = useShowSubmitLoader();
    const { getToken, removeToken } = useGetToken();

    const logoutUser = async () => {
        try {
            setIsProcessingLogout(true);
            setShowLoader(true);

            const token = getToken('csrf-token');
            await axios.post(`${url}/logoutUser`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            removeToken('csrf-token');
            navigate('/');
        } catch (error) {
            removeToken('csrf-token');
            navigate('/');
        } finally {
            setIsProcessingLogout(false);
            setShowLoader(false);
        }
    }

    return (
        <>
            { isProcessingLogout && <SubmitLoadingAnim cls='loader2' /> }
            <button className="btn btn-danger elevation-1 btn-block" type='button' onClick={logoutUser}>
                Logout
                <i className="fas fa-sign-out-alt ml-2"></i>
            </button>
        </>
    )
}

export default LogoutBtn