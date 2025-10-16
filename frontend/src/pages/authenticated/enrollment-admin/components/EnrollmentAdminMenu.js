import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import useShowSubmitLoader from '../../../../hooks/useShowSubmitLoader';
import useGetCurrentUser from '../../../../hooks/useGetCurrentUser';
import WelcomeGreeting from '../../../components/WelcomeGreeting';
import useGetToken from '../../../../hooks/useGetToken';
import CitizenCharterModal from '../../../components/CitizenCharterModal';

const EnrollmentAdminMenu = () => {
    const location = useLocation();
    const locationPaths = location.pathname;
    const { url, urlWithoutToken } = useSystemURLCon();
    const navigate = useNavigate();

    const { setShowLoader, SubmitLoadingAnim } = useShowSubmitLoader();
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [isShowingMenu, setIsShowingMenu] = useState(true);
    const [isProcessingLogout, setIsProcessingLogout] = useState(false);
    const { getToken, removeToken } = useGetToken();

    const { userData, refreshUser } = useGetCurrentUser();

    useEffect(() => { 
        setShowLoader(true); 
        setIsShowingMenu(true); 

        if(userData) { setShowLoader(false); }

        const intervalId = setInterval(refreshUser, 2000);
        return () => clearInterval(intervalId);
    }, [userData]);

    useEffect(() => {
        if(locationPaths.includes('enrollment-admin/dashboard')) {
            setActiveMenu('dashboard');
        } else if(locationPaths.includes('enrollment-admin/enrollment')) {
            setActiveMenu('enrollment');
        } else if(locationPaths.includes('enrollment-admin/training')) {
            setActiveMenu('training');
        } else if(locationPaths.includes('enrollment-admin/training/components')) {
            setActiveMenu('components');
        } else if(locationPaths.includes('enrollment-admin/my-account')) {
            setActiveMenu('my-account');
        } else {}
    }, [locationPaths]);

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
            { isShowingMenu && <SubmitLoadingAnim cls='loader2' /> }
            { isProcessingLogout && <SubmitLoadingAnim cls='loader2' /> }
            <CitizenCharterModal id="citizen_charter_0" />
            
            <nav className="main-header navbar navbar-expand navbar-primary border-bottom navbar-dark text--fontPos13--xW8hS">
                <ul className="navbar-nav">
                    <li className="nav-item d-flex align-items-center">
                        <a className="nav-link" data-widget="pushmenu" href="#" role="button">
                            <i className="fas fa-bars mr-2"></i>
                            <WelcomeGreeting name={`${userData?.role.toUpperCase()}`} />
                        </a>
                    </li>
                </ul>

                <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                        <a className="nav-link" data-toggle="modal" data-target="#citizen_charter_0" title="Citizens Charter" href="#" role="button">
                            <i className="fas fa-file-alt"></i>
                        </a>
                    </li>

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
                    style={{ 
                        right: '0', 
                        top: '0', 
                        zIndex: '1050',
                        borderRadius: '4px',
                        padding: '0.4rem 0.6rem'
                    }}
                    title="Close Sidebar"
                >
                    <i className="fas fa-times"></i>
                </button>

                <div className="text-center w-100 small px-4 my-2 bg-white text-bold">
                    <img src="/system-images/banner-logo.png" className="w-100 img-fluid mb-3" alt="" />
                    
                    <small className='text-bold'>
                        DEPARTMENT OF MIGRANT WORKERS
                        NATIONAL MARITIME POLYTECHNIC
                    </small>
                </div>

                <div className="sidebar" style={{'fontSize' : 15 }}>
                    <div className="user-panel mt-2 pb-1 mb-3 d-flex border-0 bg-light p-2 small">
                        <div className="image">
                            <img src={`${urlWithoutToken}/user_images/${ userData?.profile_picture }`} className="rounded-circle elevation-1 mt-1" height="40" alt="User Image" />
                        </div>
                        <div className="info">
                            <Link to="/enrollment-admin/my-account" className="d-block text-overflow text-truncate">
                                { userData?.fname + ' ' + userData?.mname + ' ' + userData?.lname + ' ' + (userData?.suffix ?? '')}<br />
                                <small className="text-bold">{ userData?.email }</small>
                            </Link>
                        </div>
                    </div>

                    <nav className="mt-2 text--fontPos13--xW8hS">
                        <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                            <li className="nav-item">
                                <Link to="/enrollment-admin/dashboard" onClick={() => setActiveMenu('dashboard')} className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('enrollment-admin/dashboard') ? 'active' : ''}`}>
                                    <span className="nav-icon material-icons-outlined">insights</span>
                                    <p>Dashboard</p>
                                </Link>
                            </li>

                            <li className={`nav-item ${activeMenu === 'enrollment' ? 'menu-open' : ''} `} onClick={() => setActiveMenu(activeMenu === 'enrollment' ? activeMenu : 'enrollment') }>
                                <Link to="#" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('enrollment-admin/enrollment') ? 'active' : ''}`}>
                                    <span className="nav-icon material-icons-outlined">approval</span>
                                    <p>
                                        Enrollment
                                        <i className="fas fa-angle-left right"></i>
                                    </p>
                                </Link>
                                
                                { activeMenu === 'enrollment' && ( 
                                    <ul className="nav nav-treeview bg-light rounded-sm">
                                        <li className="nav-item">
                                            <Link to="/enrollment-admin/enrollment/pending" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('enrollment-admin/enrollment/pending') ? 'active' : ''}`}>
                                                <span className="nav-icon material-icons-outlined">pending</span>
                                                <p>Pending</p>
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to="/enrollment-admin/enrollment/enrolled" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('enrollment-admin/enrollment/enrolled') ? 'active' : ''}`}>
                                                <span className="nav-icon material-icons-outlined">verified</span>
                                                <p>Enrolled</p>
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to="/enrollment-admin/enrollment/finished" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('enrollment-admin/enrollment/finished') ? 'active' : ''}`}>
                                                <span className="nav-icon material-icons-outlined">fact_check</span>
                                                <p>Finished</p>
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>

                            <li className={`nav-item ${activeMenu === 'training' || activeMenu === 'components' ? 'menu-open' : ''} `} onClick={() => setActiveMenu(activeMenu === 'training' || activeMenu === 'components' ? activeMenu : 'training') }>
                                <Link to="#" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('enrollment-admin/training') ? 'active' : ''}`}>
                                    <span className="nav-icon material-icons-outlined">golf_course</span>
                                    <p>
                                        Training
                                        <i className="fas fa-angle-left right"></i>
                                    </p>
                                </Link>
                                
                                { (activeMenu === 'training' || activeMenu === 'components') && ( 
                                    <ul className="nav nav-treeview bg-light rounded-sm">
                                        <li className="nav-item">
                                            <Link to="/enrollment-admin/training/list" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('enrollment-admin/training/list') ? 'active' : ''}`}>
                                                <span className="nav-icon material-icons-outlined">list_alt</span>
                                                <p>Trainings</p>
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to="/enrollment-admin/training/new" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('enrollment-admin/training/new') ? 'active' : ''}`}>
                                                <span className="nav-icon material-icons-outlined">add</span>
                                                <p>Create New Training</p>
                                            </Link>
                                        </li>

                                        <li className="nav-item">
                                            <div className={`text-bold py-1 d-flex align-items-center text-muted`} style={{ paddingLeft: '22px' }}>
                                                Components
                                            </div>
                                        </li>

                                        <li className="nav-item">
                                            <Link to="/enrollment-admin/training/components/modules" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('enrollment-admin/training/components/modules') ? 'active' : ''}`}>
                                                <span className="nav-icon material-icons-outlined">book</span>
                                                <p>Modules</p>
                                            </Link>
                                        </li>

                                        <li className="nav-item">
                                            <Link to="/enrollment-admin/training/components/courses" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('enrollment-admin/training/components/courses') ? 'active' : ''}`}>
                                                <span className="nav-icon material-icons-outlined">school</span>
                                                <p>Courses</p>
                                            </Link>
                                        </li>

                                        <li className="nav-item">
                                            <Link to="/enrollment-admin/training/components/training-fees" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('enrollment-admin/training/components/training-fees') ? 'active' : ''}`}>
                                                <span className="nav-icon material-icons-outlined">payment</span>
                                                <p>Training Fees</p>
                                            </Link>
                                        </li>

                                        <li className="nav-item">
                                            <Link to="/enrollment-admin/training/components/certificates" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('enrollment-admin/training/components/certificates') ? 'active' : ''}`}>
                                                <span className="nav-icon material-icons-outlined">workspace_premium</span>
                                                <p>Certificates</p>
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>

                            <li className="nav-item">
                                <Link to="/enrollment-admin/my-account" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('enrollment-admin/my-account') ? 'active' : ''}`} onClick={() => setActiveMenu('my-account')}>
                                    <span className="nav-icon material-icons-outlined">manage_accounts</span>
                                    <p>My Account</p>
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
}

export default EnrollmentAdminMenu;