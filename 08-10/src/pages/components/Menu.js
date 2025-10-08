import { useEffect, useState } from 'react';
import useWebToken from '../../../hooks/useWebToken';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import useShowSubmitLoader from '../../../hooks/useShowSubmitLoader';
import useGetCurrentUser from '../../../hooks/useGetCurrentUser';
import WelcomeGreeting from './WelcomeGreeting';

const Menu = () => {
    const location = useLocation();
    const locationPaths = location.pathname;
    const { url, urlWithoutApi } = useSystemURLCon();
    const navigate = useNavigate();

    const { setShowLoader, SubmitLoadingAnim } = useShowSubmitLoader();
    const [activeMenu, setActiveMenu] = useState("dashboard");
    const [isShowingMenu, setIsShowingMenu] = useState(true);
    const [isProcessingLogout, setIsProcessingLogout] = useState(false);
    const { getToken, removeToken } = useWebToken();

    const { userData } = useGetCurrentUser();

    useEffect(() => { 
        setShowLoader(true); 
        setIsShowingMenu(true); 

        if(userData) { setShowLoader(false); }
    }, [userData]);

    useEffect(() => {
        if(locationPaths.includes('welcome/dashboard')) {
            setActiveMenu('dashboard');
        } else if(locationPaths.includes('welcome/family')) {
            setActiveMenu('family');
        } else if(locationPaths.includes('welcome/resident')) {
            setActiveMenu('resident');
        } else if(locationPaths.includes('welcome/assistance')) {
            setActiveMenu('assistance');
        } else if(locationPaths.includes('welcome/account')) {
            setActiveMenu('account');
        } else if(locationPaths.includes('welcome/my-account')) {
            setActiveMenu('my-account');
        } else {}
    }, [locationPaths]);

    const logoutUser = async () => {
        try {
            setIsProcessingLogout(true);
            setShowLoader(true);

            const token = getToken();
            await axios.post(`${url}/logoutUser`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            removeToken();
            navigate('/');
        } catch (error) {
            removeToken();
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

            <nav className="main-header navbar navbar-expand navbar-primary border-bottom navbar-dark text--fontPos13--xW8hS">
                <ul className="navbar-nav">
                    <li className="nav-item d-flex align-items-center">
                        <a className="nav-link" data-widget="pushmenu" href="#" role="button">
                            <i className="fas fa-bars mr-2"></i>
                            <WelcomeGreeting name={`${userData?.sex === 'MALE' ? 'MR.' : 'MS.'} ${userData?.lname.toUpperCase()}`} />
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
                <div className="text-center w-100 small px-4 bg-white text-bold">
                    <img src="/assets/system-images/MSWD (3).png" className="w-100 img-fluid" alt="" />
                </div>

                <div className="sidebar" style={{'fontSize' : 15 }}>
                    <div className="user-panel mt-2 pb-1 mb-3 d-flex border-0 bg-light p-2 small">
                        <div className="image">
                            <img src={`${urlWithoutApi}/user-images/${ userData?.profile_picture }`} className="rounded-circle elevation-1 mt-1" height="40" alt="User Image" />
                        </div>
                        <div className="info">
                            <Link to="/welcome/my-account" className="d-block text-overflow text-truncate">
                                { userData?.fname + ' ' + userData?.mname + ' ' + userData?.lname + ' ' + userData?.suffix }<br />
                                <small className="text-bold">{ userData?.role }</small>
                            </Link>
                        </div>
                    </div>

                    <nav className="mt-2 text--fontPos13--xW8hS">
                        <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                            <li className="nav-item">
                                <Link to="/welcome/dashboard" onClick={() => setActiveMenu('dashboard')} className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('welcome/dashboard') ? 'active' : ''}`}>
                                    <span className="nav-icon material-icons-outlined">dashboard</span>
                                    <p>Dashboard</p>
                                </Link>
                            </li>

                            {
                                userData?.role === "ADMINISTRATOR" && (
                                    <li className="nav-item">
                                        <Link to="/welcome/assistance" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('welcome/assistance') ? 'active' : ''}`} onClick={() => setActiveMenu('assistance')}>
                                            <span className="nav-icon material-icons-outlined">redeem</span>
                                            <p>Assistance</p>
                                        </Link>
                                    </li>
                                )
                            }

                            <li className={`nav-item ${activeMenu === 'family' ? 'menu-open' : ''} `} onClick={() => setActiveMenu(activeMenu === 'family' ? activeMenu : 'family') }>
                                <Link to="#" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('welcome/family') ? 'active' : ''}`}>
                                    <span className="nav-icon material-icons-outlined">family_restroom</span>
                                    <p>
                                        Family
                                        <i className="fas fa-angle-left right"></i>
                                    </p>
                                </Link>
                                
                                { activeMenu === 'family' && ( 
                                    <ul className="nav nav-treeview bg-light rounded-sm">
                                        <li className="nav-item">
                                            <Link to="/welcome/family/list" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('welcome/family/list') ? 'active' : ''}`}>
                                                <span className="nav-icon material-icons-outlined">diversity_1</span>
                                                <p>Families</p>
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to="/welcome/family/new" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('welcome/family/new') ? 'active' : ''}`}>
                                                <span className="nav-icon material-icons-outlined">group_add</span>
                                                <p>New Family Composition</p>
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>

                            <li className={`nav-item ${activeMenu === "resident" ? 'menu-open' : ''} `} onClick={() => setActiveMenu(activeMenu === 'resident' ? activeMenu : 'resident') }>
                                <Link to="#" className={`nav-link py-1 d-flex align-items-center ${ locationPaths.includes('welcome/resident') ? 'active' : ''}`}>
                                    <span className="nav-icon material-icons-outlined">person</span>
                                    <p>
                                        Resident
                                        <i className="fas fa-angle-left right"></i>
                                    </p>
                                </Link>

                                { activeMenu === 'resident' && ( 
                                    <ul className="nav nav-treeview bg-light rounded-sm">
                                        <li className="nav-item">
                                            <Link to="/welcome/resident/list" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('welcome/resident/list') ? 'active' : ''}`}>
                                                <span className="nav-icon material-icons-outlined">group</span>
                                                <p>Residents</p>
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link to="/welcome/resident/new" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('welcome/resident/new') ? 'active' : ''}`}>
                                                <span className="nav-icon material-icons-outlined">person_add</span>
                                                <p>New Resident</p>
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>

                            {
                                userData?.role === "ADMINISTRATOR" && (
                                    <li className={`nav-item ${activeMenu === "account" ? 'menu-open' : ''} `} onClick={() => setActiveMenu(activeMenu === 'account' ? activeMenu : 'account') }>
                                        <Link to="#" className={`nav-link py-1 d-flex align-items-center ${ locationPaths.includes('welcome/account') ? 'active' : ''}`}>
                                            <span className="nav-icon material-icons-outlined">verified_user</span>
                                            <p>
                                                Account
                                                <i className="fas fa-angle-left right"></i>
                                            </p>
                                        </Link>

                                        { activeMenu === 'account' && ( 
                                            <ul className="nav nav-treeview bg-light rounded-sm">
                                                <li className="nav-item">
                                                    <Link to="/welcome/account/list" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('welcome/account/list') ? 'active' : ''}`}>
                                                        <span className="nav-icon material-icons-outlined">supervised_user_circle</span>
                                                        <p>Accounts</p>
                                                    </Link>
                                                </li>
                                                <li className="nav-item">
                                                    <Link to="/welcome/account/new" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('welcome/account/new') ? 'active' : ''}`}>
                                                        <span className="nav-icon material-icons-outlined">person_add</span>
                                                        <p>New Account</p>
                                                    </Link>
                                                </li>
                                            </ul>
                                        )}
                                    </li>
                                )
                            }

                            <li className="nav-item">
                                <Link to="/welcome/my-account" className={`nav-link py-1 d-flex align-items-center ${locationPaths.includes('welcome/my-account') ? 'active' : ''}`} onClick={() => setActiveMenu('my-account')}>
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

export default Menu;