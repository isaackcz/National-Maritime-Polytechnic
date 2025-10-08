import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import GuestRoute from "./route/GuestRoute";
import AccessDenied from "./pages/AccessDenied";
import PrivateRoute from "./route/PrivateRoute";
import Login from "./pages/guest/login/Login";
import ForgotPassword from "./pages/guest/forgot-password/ForgotPassword";
import ResetPassword from "./pages/guest/forgot-password/ResetPassword";
import Register from "./pages/guest/registration/Register";
import EmailVerify from "./pages/guest/email-verify/EmailVerify";
import MyAccount from "./pages/authenticated/trainee/my-account/MyAccount";
import Dashboard from "./pages/authenticated/trainee/dashboard/Dashboard";
import Dormitory from "./pages/authenticated/trainee/dormitory/Dormitory";
import Certificate from "./pages/authenticated/trainee/certificates/Certificate";
import Courses from "./pages/authenticated/trainee/courses/Courses";
import EnrollNewCourse from "./pages/authenticated/trainee/courses/EnrollNewCourse";
import TraineeMenu from "./pages/authenticated/trainee/components/TraineeMenu";
import UserManagement from "./pages/authenticated/admin/userManagement/userManagement";
import AdminDashboard from "./pages/authenticated/admin/dashboard/dashboard";
import AdminDormitory from "./pages/authenticated/admin/dormitory/dormitory";
import AdminCourses from "./pages/authenticated/admin/courses/courses";
import AdminAccount from "./pages/authenticated/admin/adminAccount/adminAccount";
import AdminMenu from "./pages/components/admin/AdminMenu";
import DormitoryAdminMenu from "./pages/authenticated/dormitory/components/dormitoryMenu";
import DormitoryDormitory from "./pages/authenticated/dormitory/dormitory/dormitory";


const App = () => {
    return (
        <Router>
            <Routes>
                <Route element={<GuestRoute />}>
                    <Route path="/" element={<Login /> } />
                    <Route path="/email/verify" element={<EmailVerify /> } />
                    <Route path="/register" element={<Register /> } />
                    <Route path="/forgot-password" element={<ForgotPassword /> } />
                    <Route path="/reset-password" element={<ResetPassword /> } />
                    <Route path="/User-Profile" element={<TraineeMenu /> } />
                </Route>

                <Route element={<PrivateRoute />}>
                    <Route element={<TraineeMenu />}>
                        <Route path="/trainee/dashboard" element={<Dashboard /> } />

                        <Route path="/trainee/course/list" element={<Courses /> } />
                        <Route path="/trainee/course/enroll-new-course" element={<EnrollNewCourse /> } />

                        <Route path="/trainee/certificate" element={<Certificate /> } />
                        <Route path="/trainee/dormitory" element={<Dormitory /> } />
                        <Route path="/trainee/my-account" element={<MyAccount />} />
                    </Route>

                    <Route element={<DormitoryAdminMenu />}>
                        <Route path="/dormitory/dashboard" element={<p>juu</p>} />
                        <Route path="/dormitory/dormitory" element={<DormitoryDormitory />} />
                        <Route path="/dormitory/adminAccount" element={<p>pewpew</p>} />
                    </Route>
                </Route>


                <Route path="*" element={<AccessDenied />} />
            </Routes>
        </Router>
    );
}

export default App;