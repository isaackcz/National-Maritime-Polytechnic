import { useNavigate } from "react-router-dom";
import useSystemURLCon from "../../../hooks/useSystemURLCon";
import Counter from "../component/Counter";
import PageName from "../component/PageName";
import useWebToken from "../../../hooks/useWebToken";
import SkeletonLoader from "../component/SkeletonLoader/SkeletonLoader";
import { useEffect, useState } from "react";
import axios from "axios";
import useGetCurrentUser from "../../../hooks/useGetCurrentUser";

const Dashboard = () => {
    const { url } = useSystemURLCon();
    const navigate = useNavigate();
    const { getToken, removeToken } = useWebToken();

    const [counterData, setCounterData] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const { userData } = useGetCurrentUser();

    useEffect(() => { GetDashboardData(); }, []);

    const GetDashboardData = async () => {
        try {
            setIsFetching(true);

            const token = getToken();
            const response = await axios.get(`${url}/dashboard`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setCounterData(response.data.count);
        } catch (error) {
            if(error.response.status === 500) {
                removeToken();
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
            setIsFetching(false);
        }
    }

    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'Dashboard',
                    'last' : true,
                    'address' : '/welcome/dashboard'
                }
            ]}/>

            {
                isFetching
                    ? <SkeletonLoader />
                    : <section className="content">
                        <div className="container-fluid">
                            <div className="row">
                                {
                                    userData?.role === "ADMINISTRATOR" && (
                                        <>
                                            <div className="col-xl-3">
                                                <div className="card fade-up" style={{ animationDelay: "0.1s" }}>
                                                    <div className="card-body pt-3">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <strong>Accounts</strong>
                                                            <span className="material-icons-outlined text-muted">account_circle</span>
                                                        </div>

                                                        <div className="text-bold mt-2" style={{ fontSize: '30px' }}>
                                                            <Counter target={counterData.accounts} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-xl-3">
                                                <div className="card fade-up" style={{ animationDelay: "0.3s" }}>
                                                    <div className="card-body pt-3">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <strong>Assistance</strong>
                                                            <span className="material-icons-outlined text-muted">redeem</span>
                                                        </div>

                                                        <div className="text-bold mt-2" style={{ fontSize: '30px' }}>
                                                            <Counter target={counterData.assistance} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )
                                }

                                <div className="col-xl-3">
                                    <div className="card fade-up" style={{ animationDelay: "0.5s" }}>
                                        <div className="card-body pt-3">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <strong>Family</strong>
                                                <span className="material-icons-outlined text-muted">family_restroom</span>
                                            </div>

                                            <div className="text-bold mt-2" style={{ fontSize: '30px' }}>
                                                <Counter target={counterData.family_composition} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-xl-3">
                                    <div className="card fade-up" style={{ animationDelay: "0.7s" }}>
                                        <div className="card-body pt-3">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <strong>Resident</strong>
                                                <span className="material-icons-outlined text-muted">person</span>
                                            </div>

                                            <div className="text-bold mt-2" style={{ fontSize: '30px' }}>
                                                <Counter target={counterData.resident} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-xl-3">
                                    <div className={`card fade-up ${counterData.non_family_resident > 0 && 'bg-danger card-danger'}`} style={{ animationDelay: "0.9s" }}>
                                        <div className="card-body pt-3">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <strong>Non-Family Resident</strong>
                                                <span className={`material-icons-outlined ${counterData.non_family_resident <= 0 && 'text-muted'}`}>no_accounts</span>
                                            </div>

                                            <div className="text-bold mt-2" style={{ fontSize: '30px' }}>
                                                <Counter target={counterData.non_family_resident} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
            }
        </>
    )
}

export default Dashboard;