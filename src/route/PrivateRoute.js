import useGetToken from '../hooks/useGetToken';
import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoute = () => {
    const { getToken } = useGetToken();
    const isPrivate = getToken('csrf-token');
    return isPrivate ? <Outlet /> : <Navigate to="/access-denied" />
}

export default PrivateRoute;
