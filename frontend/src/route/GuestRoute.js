import useGetToken from '../hooks/useGetToken';
import { Outlet, Navigate } from 'react-router-dom';

const GuestRoute = () => {
    const { getToken } = useGetToken();
    const isGuest = getToken('csrf-token');
    return !isGuest ? <Outlet /> : <Navigate to="/trainee/dashboard" />
}

export default GuestRoute;
