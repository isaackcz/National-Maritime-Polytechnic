import { useEffect, useState } from 'react';
import '../Guest.css';
import { Link, useSearchParams } from 'react-router-dom';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import axios from 'axios';

const EmailVerify = () => {
    const { url } = useSystemURLCon();
    const [ queryParams ] = useSearchParams();
    const [message, setMessage] = useState('');
    const [messageStatus, setMessageStatus] = useState('');

    useEffect(() => {
        VerifyEmail();
    }, []);

    const VerifyEmail = async () => {
        try {
            const response = await axios.get(`${url}/email/verify?expires=${queryParams.get('expires')}&hash=${queryParams.get('hash')}&id=${queryParams.get('id')}&signature=${queryParams.get('signature')}`);
            console.log(response.data);

            setMessageStatus('success');
            setMessage(response.data.message);
        } catch(error) {
            setMessageStatus('danger');
            setMessage(error.response.data.message);
        }
    }

    return (
        <>
            <div className='guest-card-height'>
                <div className="container">
                    <div className='row d-flex align-items-center justify-content-center'>
                        <div className='col-xl-8'>
                            <div className="card rounded-0 text-dark shadow fade-up">
                                <div className="card-body text--fontPos13--xW8hS px-5 py-4">
                                    <div className='text-center'>
                                        <img src='/system-images/banner-logo.png' height="80" className='mb-4' />
                                    </div>

                                    <div className='row'>
                                        <div className='col-xl-12'>
                                            <div className={`alert alert-default text-${ messageStatus } border text-center`}>
                                                <h3 className='text-bold'>{ message }</h3>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row mt-3">
                                        <div className="col-xl-12 mb-2">
                                            <Link to="/" className="text--fontPos13--xW8hS btn btn-default btn-block">
                                                Return homepage
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EmailVerify;