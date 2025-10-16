import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import GuestRoute from "./route/GuestRoute";
import AccessDenied from "./pages/AccessDenied";
import PrivateRoute from "./route/PrivateRoute";
import Login from "./pages/guest/login/Login";
import ForgotPassword from "./pages/guest/forgot-password/ForgotPassword";
import ResetPassword from "./pages/guest/forgot-password/ResetPassword";
import Register from "./pages/guest/registration/Register";
import EmailVerify from "./pages/guest/email-verify/EmailVerify";

import EnrollmentAdminMenu from "./pages/authenticated/enrollment-admin/components/EnrollmentAdminMenu";
import EADashboard from "./pages/authenticated/enrollment-admin/dashboard/EADashboard";
import EAPending from "./pages/authenticated/enrollment-admin/enrollment/EAPending";
import EAEnrolled from "./pages/authenticated/enrollment-admin/enrollment/EAEnrolled";
import EAMyAccount from "./pages/authenticated/enrollment-admin/my-account/EAMyAccount";
import EATrainings from "./pages/authenticated/enrollment-admin/training/EATrainings";
import EANewTraining from "./pages/authenticated/enrollment-admin/training/EANewTraining";
import EAModules from "./pages/authenticated/enrollment-admin/training/components/EAModules";
import EACourses from "./pages/authenticated/enrollment-admin/training/components/EACourses";
import EATrainingFees from "./pages/authenticated/enrollment-admin/training/components/EATrainingFees";
import EACertificate from "./pages/authenticated/enrollment-admin/training/components/EACertificate";
import EAFinished from "./pages/authenticated/enrollment-admin/enrollment/EAFinished";

//dormitory
import DormitoryAdminMenu from "./pages/authenticated/dormitory/components/dormitoryMenu";
import DormitoryDormitory from "./pages/authenticated/dormitory/dormitory/dormitory";
import Request from "./pages/authenticated/dormitory/dormitory/Request";
import DAAccount from "./pages/authenticated/dormitory/adminAccount/AdminAccount";

//trainee
import MyAccount from "./pages/authenticated/trainee/my-account/MyAccount";
import Dormitory from "./pages/authenticated/trainee/dormitory/Dormitory";
import TraineeMenu from "./pages/authenticated/trainee/components/TraineeMenu";
import AdminDormitoryInvoices from "./pages/authenticated/dormitory/dormitory/InvoiceManagement";
import Invoices from './pages/authenticated/trainee/invoices/invoices';

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
                </Route>

                <Route element={<PrivateRoute />}>
                    {/* admin routes */}
                    {/* enrollment routes */}
                    <Route element={<EnrollmentAdminMenu />}>
                        <Route path="/enrollment-admin/dashboard" element={<EADashboard />} />
                        <Route path="/enrollment-admin/enrollment/pending" element={<EAPending />} />
                        <Route path="/enrollment-admin/enrollment/enrolled" element={<EAEnrolled />} />
                        <Route path="/enrollment-admin/enrollment/finished" element={<EAFinished />} />
                        <Route path="/enrollment-admin/training/list" element={<EATrainings />} />
                        <Route path="/enrollment-admin/training/new" element={<EANewTraining />} />
                        <Route path="/enrollment-admin/training/components/modules" element={<EAModules />} />
                        <Route path="/enrollment-admin/training/components/courses" element={<EACourses />} />
                        <Route path="/enrollment-admin/training/components/training-fees" element={<EATrainingFees />} />
                        <Route path="/enrollment-admin/training/components/certificates" element={<EACertificate />} />
                        <Route path="/enrollment-admin/my-account" element={<EAMyAccount />} />
                    </Route>
                    {/* dormitory routes */}
                    <Route element={<DormitoryAdminMenu />}>
                        <Route path="/dormitory/dashboard" element={<dormitoryDashboard />} />
                        <Route path="/dormitory/dormitory" element={<DormitoryDormitory />} />
                        <Route path="/dormitory/requests" element={<Request />} />
                        <Route path="/dormitory/InvoiceManagement" element={<AdminDormitoryInvoices/>} />
                        <Route path="/dormitory/AdminAccount" element={<DAAccount/>} />
                    </Route>
                    {/* Trainee routes */}
                    <Route element={<TraineeMenu />}>
                        <Route path="/trainee/dashboard" element={<p>dashboard is working</p> } />
                        <Route path="/trainee/course/list" element={<p>course is working</p>} />
                        <Route path="/trainee/course/enroll-new-course" element={<p> enroll new course is working</p> } />
                        <Route path="/trainee/dormitory" element={<Dormitory /> } />
                        <Route path="/trainee/my-account" element={<MyAccount />} />
                        <Route path="/trainee/invoices" element={<Invoices/>}/>
                    </Route>
                </Route>
                <Route path="*" element={<AccessDenied />} />
            </Routes>
        </Router>
    );
}

export default App;