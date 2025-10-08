import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useSystemURLCon from './useSystemURLCon';
import useGetToken from './useGetToken';

const useGetCurrentUser = () => {
    const [userData, setUserData] = useState(null);
    const { getToken, removeToken } = useGetToken();
    const { url } = useSystemURLCon();
    const navigate = useNavigate();

    const GetCurrentUser = useCallback(async () => {
        try {
            const token = getToken('csrf-token');
            
            const response = await axios.get(`${url}/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUserData(response.data.user);
        } catch (error) {
            removeToken('csrf-token');
            navigate('/access-denied');
        }
    }, [getToken, url, navigate, removeToken]);

    useEffect(() => {
        GetCurrentUser();
        // const intervalId = setInterval(GetCurrentUser, 2000);
        // return () => clearInterval(intervalId);
    }, []);

    return { userData, refreshUser: GetCurrentUser };
};

export default useGetCurrentUser;
