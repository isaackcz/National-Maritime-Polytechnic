import { useEffect, useRef, useState } from 'react';
import useShowSubmitLoader from '../../../../hooks/useShowSubmitLoader';
import useWebToken from '../../../../hooks/useWebToken';
import useSystemURLCon from '../../../../hooks/useSystemURLCon';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SkeletonLoader from '../../component/SkeletonLoader/SkeletonLoader';

const CreateOrUpdate = ({ httpMethod, callbackFunction, data, documentId }) => {
    const [firstName, setFirstName] = useState('');
    const [middlename, setMiddlename] = useState('');
    const [lastName, setLastName] = useState('');
    const [suffix, setSuffix] = useState('');
    const [role, setRole] = useState('');
    const [sex, setSex] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('');

    const [isFetching, setIsFetching] = useState(true);
    const navigate = useNavigate();
    const { url } = useSystemURLCon();
    const { getToken, removeToken } = useWebToken();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if(data && isFetching) {
            setFirstName(data.fname);
            setMiddlename(data.mname);
            setLastName(data.lname);
            setRole(data.role);
            setSuffix(data.suffix);
            setEmail(data.email);
            setSex(data.sex);

            setIsFetching(false);
        }

        console.log(data);
    }, [data, isFetching])

    const CheckUploadedAvatar = (e) => {
        const file = e.files[0];
        if (!file) return;

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            if (img.width === img.height) {
                setAvatar(file);
            } else {
                alert(`❌ Invalid image size. Uploaded: ${img.width}x${img.height}px. Image height & width should be same.`);
                e.value = "";
                setAvatar('');
            }

            URL.revokeObjectURL(objectUrl);
        };

        img.src = objectUrl;
    }

    const SubmitFormAccount = async (e) => {
        e.preventDefault();

        try {
            setProgress(0);
            setIsSubmitting(true);
            setShowLoader(true);

            const token = getToken();
            const formData = new FormData();
            formData.append('httpMethod', httpMethod);
            formData.append('firstName', firstName);
            formData.append('middleName', middlename);
            formData.append('lastName', lastName);
            formData.append('suffix', suffix);
            formData.append('email', email.toLowerCase());
            formData.append('sex', sex);
            formData.append('role', role);
            formData.append('documentId', documentId);
            formData.append('avatar', avatar);

            const response = await axios.post(`${url}/accounts/create_or_update`, formData, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percent);
                    }
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if(response.status === 200) {
                alert(response.data.message);

                if(httpMethod === 'create') {
                    navigate('/welcome/account/list');
                } else {
                    callbackFunction();
                }
            } 
        } catch (error) {
            if(error.response.status === 500) {
                removeToken();
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
            setIsSubmitting(false);
            setShowLoader(false);
        }
    }

    return (
        <>
            { isSubmitting && <SubmitLoadingAnim cls='loader' /> }

            {
                isFetching && httpMethod === 'update'
                    ? <SkeletonLoader onViewMode={httpMethod} />
                    : <>
                        <section className="content">
                            <div className="container-fluid">
                                <div className={`row ${ httpMethod === 'create' && 'fade-up'}`}>
                                    <div className={`col-xl-12 ${httpMethod === 'update' && 'px-0'}`}>
                                        <div className={`card ${httpMethod === 'update' && 'rounded-0 elevation-0 m-0'}`}>
                                            <div className="card-body">
                                                <div className='alert alert-default border small'>
                                                    <div className='row'>
                                                        <div className='col-1 text-center' style={{ paddingTop: '5px' }}>
                                                            <span className='fas fa-exclamation text-danger text-bold' style={{ fontSize: '17px' }}></span>
                                                        </div>

                                                        <div className='col-11 pt-1'>
                                                            For account security, the system will generate a temporary password and send it to the email address you provided whenever you create or update an account credentials.
                                                        </div>
                                                    </div>
                                                </div>

                                                <form onSubmit={SubmitFormAccount}>
                                                    <div className='row'>
                                                        <div className='col-xl-3 mb-1'>
                                                            <label className="form-label small mb-0">First name <span className="text-danger">*</span></label>
                                                            <div className="input-group mb-1">
                                                                <input type="text" placeholder="Enter here.." value={firstName} onChange={(e) => setFirstName(e.target.value)} className="form-control form-control-sm" required />
                                                            </div>
                                                        </div>

                                                        <div className='col-xl-3 mb-1'>
                                                            <label className="form-label small mb-0">Middle name</label>
                                                            <div className="input-group mb-1">
                                                                <input type="text" placeholder="Enter here.." value={middlename} onChange={(e) => setMiddlename(e.target.value)} className="form-control form-control-sm" />
                                                            </div>
                                                        </div>

                                                        <div className='col-xl-3 mb-1'>
                                                            <label className="form-label small mb-0">Last name <span className="text-danger">*</span></label>
                                                            <div className="input-group mb-1">
                                                                <input type="text" placeholder="Enter here.." value={lastName} onChange={(e) => setLastName(e.target.value)} className="form-control form-control-sm" required />
                                                            </div>
                                                        </div>

                                                        <div className='col-xl-3 mb-1'>
                                                            <label className="form-label small mb-0">Suffix</label>
                                                            <select value={suffix} onChange={(e) => setSuffix(e.target.value)} className='form-control form-control-sm' defaultValue="">
                                                                <option value="">-- Choose --</option>
                                                                <option value="JR.">JR.</option>
                                                                <option value="SR.">SR.</option>
                                                                <option value="I">I</option>
                                                                <option value="II">II</option>
                                                                <option value="III">III</option>
                                                                <option value="IV">IV</option>
                                                                <option value="V">V</option>
                                                            </select>
                                                        </div>

                                                        <div className='col-xl-3 mb-1'>
                                                            <label className="form-label small mb-0">Sex</label>
                                                            <select value={sex} onChange={(e) => setSex(e.target.value)} className='form-control form-control-sm' defaultValue="">
                                                                <option value="MALE">MALE</option>
                                                                <option value="FEMALE">FEMALE</option>
                                                            </select>
                                                        </div>

                                                        <div className='col-xl-3 mb-1'>
                                                            <label className="form-label small mb-0">Role</label>
                                                            <select value={role} onChange={(e) => setRole(e.target.value)} className='form-control form-control-sm' defaultValue="">
                                                                <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                                                                <option value="STAFF">STAFF</option>
                                                            </select>
                                                        </div>

                                                        <div className='col-xl-3 mb-1'>
                                                            <label className="form-label small mb-0">Email <span className="text-danger">*</span></label>
                                                            <div className="input-group mb-1">
                                                                <input placeholder='Enter here..' type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control form-control-sm" required />
                                                            </div>
                                                        </div>

                                                        <div className='col-xl-3 mb-1'>
                                                            <label className="form-label small mb-0">Avatar</label>
                                                            <div className="input-group mb-1">
                                                                <input type="file" accept='image/*' ref={fileInputRef} onChange={(e) => CheckUploadedAvatar(e.target)} className="form-control form-control-sm" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button type="submit" disabled={ isSubmitting || 
                                                        !firstName || 
                                                        !middlename || 
                                                        !lastName || 
                                                        !sex || 
                                                        !role || 
                                                        !email 
                                                    } className={`btn btn-${httpMethod === 'create' ? 'primary' : 'warning'} btn-sm mt-3 elevation-1 text--fontPos13--xW8hS`}>
                                                        { httpMethod === 'create' ? 'Save Account' : 'Save Changes' }
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
            }
        </>
    )
}

export default CreateOrUpdate