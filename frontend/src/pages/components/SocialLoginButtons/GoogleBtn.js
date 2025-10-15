import { jwtDecode } from "jwt-decode";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import useGetToken from "../../../hooks/useGetToken";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useShowSubmitLoader from "../../../hooks/useShowSubmitLoader";
import { useState } from "react";
import useSystemURLCon from "../../../hooks/useSystemURLCon";

const GoogleBtn = () => {
    const { url } = useSystemURLCon();
    const { setToken } = useGetToken();
    const navigate = useNavigate();
    const { SubmitLoadingAnim, setShowLoader } = useShowSubmitLoader();
    const [isSubmittingSocialLogin, setIsSubmittingSocialLogin] = useState(false);

    const RegisterUser = async (res) => {
        try {
            setIsSubmittingSocialLogin(true);
            setShowLoader(true);

            const token = res.credential;
            const decodedToken = jwtDecode(token);

            // Debug: Log the decoded token to see what Google provides
            console.log('Google OAuth decoded token:', decodedToken);

            const formData = new FormData();
            formData.append('fname', decodedToken.given_name || decodedToken.name || 'User');
            formData.append('lname', decodedToken.family_name || decodedToken.name || 'User');
            formData.append('mname', ''); // Middle name not provided by Google
            formData.append('suffix', ''); // Suffix not provided by Google
            formData.append('email', decodedToken.email);
            formData.append('is_from_social_login', true);

            const response = await axios.post(`${url}/register`, formData);
            
            if (response.data.token) {
                setToken('csrf-token', response.data.token);
                navigate("/trainee/dashboard");
            } else {
                alert('Login successful but no token received');
            }
        } catch(error) {
            console.error('Google login error:', error);
            if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message);
            } else {
                alert('Login failed. Please try again.');
            }
        } finally {
            setIsSubmittingSocialLogin(false);
            setShowLoader(false);
        }
    }

    return (
        <>
            { isSubmittingSocialLogin && <SubmitLoadingAnim cls="loader2" /> }

            <GoogleOAuthProvider clientId='730778376063-6h3prea9odd284jmo5cpfdac9v8u28c6.apps.googleusercontent.com'>
                <GoogleLogin onSuccess={(response) => RegisterUser(response)} />
            </GoogleOAuthProvider>
        </>
    )
}

export default GoogleBtn;