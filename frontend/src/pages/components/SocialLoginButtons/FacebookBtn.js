import { useEffect } from 'react';

const FacebookBtn = ({ textShown }) => {
    useEffect(() => {
        window.fbAsyncInit = function() {
            window.FB.init({
                appId: '1499627791303163',
                cookie: true,
                xfbml: true,
                version: 'v13.0'
            });
        };

        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }, []);

    const responseFacebook = (response) => {
        console.log(`Facebook Response: ${response}`);
    };

    const handleFacebookLogin = () => {
        window.FB.login(function(response) {
            if (response.authResponse) {
                window.FB.api('/me', { fields: 'first_name,middle_name,last_name,email,picture' }, responseFacebook);
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, { scope: 'email' });
    };

    return (
        <button style={{ paddingTop: '5.8px', paddingBottom: '5.8px' }} className="text--fontPos13--xW8hS btn btn-default btn-block bg-white" onClick={handleFacebookLogin}>
            <div className='row'>
                <div className='col-1'>
                    <i className='fab fa-facebook text-primary' style={{ fontSize: '18px', paddingTop: '3px' }}></i>
                </div>

                <div className='col-11' style={{ fontSize: '13px', paddingTop: '1px' }}>
                    { textShown } Facebook
                </div>
            </div>
        </button>
    );
};

export default FacebookBtn;