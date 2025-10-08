import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import useShowSubmitLoader from '../../../hooks/useShowSubmitLoader';
import useGetCurrentUser from '../../../hooks/useGetCurrentUser';
import WelcomeGreeting from '../WelcomeGreeting';
import useGetToken from '../../../hooks/useGetToken';

const AdminMenu = () => {
    const location = useLocation();
    const locationPaths = location.pathname;
    const { url, urlWithoutToken } = useSystemURLCon();
    const navigate = useNavigate();

    const { setShowLoader, SubmitLoadingAnim } = useShowSubmitLoader();
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [isShowingMenu, setIsShowingMenu] = useState(true);
    const [isProcessingLogout, setIsProcessingLogout] = useState(false);
    const { getToken, removeToken } = useGetToken();

    const { userData } = useGetCurrentUser();

    useEffect(() => {
        setShowLoader(true);
        setIsShowingMenu(true);
        if (userData) { setShowLoader(false); }
    }, [userData, setShowLoader]);

    useEffect(() => {
        if (locationPaths.includes('admin/userManagement')) {
            setActiveMenu('userManagement');
        } else if (locationPaths.includes('admin/dormitory')) {
            setActiveMenu('dormitory');
        } else if (locationPaths.includes('admin/courses')) {
            setActiveMenu('courses');
        } else if (locationPaths.includes('admin/adminAccount')) {
            setActiveMenu('adminAccount');
        } else if (locationPaths.includes('admin/dashboard')) {
            setActiveMenu('dashboard');
        } else {
            setActiveMenu('dashboard');
        }
    }, [locationPaths]);

    const logoutUser = async () => {
        try {
            setIsProcessingLogout(true);
            setShowLoader(true);

            const token = getToken('csrf-token');
            await axios.post(`${url}/logoutUser`, {}, {
                headers: { Authorization: `Bearer ${token}` },
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
    };

    return (
        <>
            { isShowingMenu && <SubmitLoadingAnim cls='loader2' /> }
            { isProcessingLogout && <SubmitLoadingAnim cls='loader2' /> }

            <nav className="main-header navbar navbar-expand navbar-primary border-bottom navbar-dark text--fontPos13--xW8hS">
                <ul className="navbar-nav">
                    <li className="nav-item d-flex align-items-center">
                        <a className="nav-link" data-widget="pushmenu" href="#" role="button">
                            <i className="fas fa-bars mr-2"></i>
                            <WelcomeGreeting name={`${userData?.role?.toUpperCase() || 'ADMIN'}`} />
                        </a>
                    </li>
                </ul>

                <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                        <a className="nav-link" data-widget="fullscreen" title="Fullscreen" href="#" role="button">
                            <i className="fas fa-expand-arrows-alt"></i>
                        </a>
                    </li>

                    <li className="nav-item pt-1">
                        <button className="btn btn-default btn-sm mx-2" type='button' onClick={logoutUser}>
                            Logout
                            <i className="fas fa-sign-out-alt ml-1 text-danger"></i>
                        </button>
                    </li>
                </ul>
            </nav>

            <aside className="main-sidebar main-sidebar-custom elevation-1 sidebar-light-primary ">
                <button 
                    className="btn btn-sm btn-light d-md-none m-2 position-absolute" 
                    data-widget="pushmenu" 
                    style={{ right: '0', top: '0', zIndex: '1050', borderRadius: '4px', padding: '0.4rem 0.6rem' }}
                    title="Close Sidebar"
                >
                    <i className="fas fa-times"></i>
                </button>

                <div className="text-center w-100 small px-4 my-2 bg-white text-bold">
                    <img src="/system-images/banner-logo.png" className="w-100 img-fluid mb-3" alt="" />
                    <small className='text-bold'>
                        NATIONAL MARITIME POLYTECHNIC
                    </small>
                </div>

                <div className="sidebar" style={{ 'fontSize': 15 }}>
                    <div className="user-panel mt-2 pb-1 mb-3 d-flex border-0 bg-light p-2 small">
                        <div className="image">
                            <img src={`${urlWithoutToken}/user_images/${userData?.profile_picture}`} className="rounded-circle elevation-1 mt-1" height="40" alt="User" />
                        </div>
                        <div className="info">
                            <Link to="/trainee/my-account" className="d-block text-overflow text-truncate">
                                { userData?.fname + ' ' + userData?.mname + ' ' + userData?.lname + ' ' + (userData?.suffix ?? '') }<br />
                                <small className="text-bold">{ userData?.email }</small>
                            </Link>
                        </div>
                    </div>

                    <nav className="mt-2 text--fontPos13--xW8hS">
                        <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                            <li className="nav-item">
                                <Link to="/admin/dashboard" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('admin/dashboard') ? 'active' : ''}`} onClick={() => setActiveMenu('dashboard')}>
                                    <span className="nav-icon material-icons-outlined">insights</span>
                                    <p>Dashboard</p>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/admin/userManagement" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('admin/userManagement') ? 'active' : ''}`} onClick={() => setActiveMenu('userManagement')}>
                                    <span className="nav-icon material-icons-outlined">supervised_user_circle</span>
                                    <p>User Management</p>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/admin/dormitory" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('admin/dormitory') ? 'active' : ''}`} onClick={() => setActiveMenu('dormitory')}>
                                    <span className="nav-icon material-icons-outlined">house_siding</span>
                                    <p>Dormitory</p>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/admin/courses" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('admin/courses') ? 'active' : ''}`} onClick={() => setActiveMenu('courses')}>
                                    <span className="nav-icon material-icons-outlined">class</span>
                                    <p>Courses</p>
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/admin/adminAccount" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('admin/adminAccount') ? 'active' : ''}`} onClick={() => setActiveMenu('adminAccount')}>
                                    <span className="nav-icon material-icons-outlined">manage_accounts</span>
                                    <p>Profile</p>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </aside>

            <div className="content-wrapper bg-white text--fontPos13--xW8hS">
                <Outlet />
            </div>
        </>
    );
};

export default AdminMenu;