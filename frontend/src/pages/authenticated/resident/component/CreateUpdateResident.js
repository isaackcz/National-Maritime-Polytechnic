import { useNavigate } from "react-router-dom";
import useWebToken from "../../../../hooks/useWebToken";
import useSystemURLCon from "../../../../hooks/useSystemURLCon";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import SkeletonLoader from "../../component/SkeletonLoader/SkeletonLoader";
import useShowSubmitLoader from "../../../../hooks/useShowSubmitLoader";

const CreateUpdateResident = ({ data, type, onViewPage, httpMethod, callbackFunction }) => {
    const navigate = useNavigate();
    const { getToken, removeToken } = useWebToken();
    const { url } = useSystemURLCon();
    const { SubmitLoadingAnim, setShowLoader, setProgress } = useShowSubmitLoader(); 
    const fileInputRef = useRef(null);

    const [fname, setFname] = useState('');
    const [mname, setMname] = useState('');
    const [lname, setLname] = useState('');
    const [suffix, setSuffix] = useState('');
    const [birthday, setBirthday] = useState('');
    const [sex, setSex] = useState('');
    const [civilStatus, setCivilStatus] = useState('');
    const [highestEducationalAttainment, setHighestEducationalAttainment] = useState('');
    const [occupation, setOccupation] = useState('');
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [barangay, setBarangay] = useState('');
    const [religion, setReligion] = useState('');
    const [ethnicity, setEthnicity] = useState('');
    const [isPwd, setIsPwd] = useState('');
    const [avatar, setAvatar] = useState('');
    const [documentId, setDocumentId] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [religionData, setReligionData] = useState([]);
    const [ethnicityData, setEthnicityData] = useState([]);

    useEffect(() => { 
        if(data !== null) {
            setFname(data.fname);
            setMname(data.mname);
            setLname(data.lname);
            setSuffix(data.suffix);
            setBirthday(data.birthday);
            setSex(data.sex);
            setCivilStatus(data.civil_status);
            setHighestEducationalAttainment(data.highest_educational_attainment);
            setOccupation(data.occupation ?? '');
            setMonthlyIncome(data.monthly_income ?? '');
            setBarangay(data.barangay);
            setReligion(data.religion_id);
            setEthnicity(data.ethnicity_id);
            setIsPwd(data.is_pwd);
            setDocumentId(data.id);
        }

        GetReligionEthnicity();
    }, []);

    const GetReligionEthnicity = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${url}/residents/getAdditionalData`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setReligionData(response.data.religionData);
            setEthnicityData(response.data.ethnicityData);
        } catch (error) {
            removeToken();
            navigate('/access-denied');
        } finally {
            setIsFetching(false);
        }
    }

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

    const SubmitForm = async (e) => {
        e.preventDefault();

        try {
            setProgress(0);
            setIsSubmitting(true);
            setShowLoader(true);

            const token = getToken();
            const formData = new FormData();
            formData.append('fname', fname);
            formData.append('mname', mname);
            formData.append('lname', lname);
            formData.append('suffix', suffix);
            formData.append('birthday', birthday);
            formData.append('sex', sex);
            formData.append('civilStatus', civilStatus);
            formData.append('highestEducationalAttainment', highestEducationalAttainment);
            formData.append('occupation', occupation);
            formData.append('monthlyIncome', monthlyIncome);
            formData.append('barangay', barangay);
            formData.append('religion', religion);
            formData.append('ethnicity', ethnicity);
            formData.append('isPwd', isPwd);
            formData.append('avatar', avatar);

            if(data !== null) {
                formData.append('httpMethod', 'update');
                formData.append('documentId', documentId);
            } else {
                formData.append('httpMethod', 'create');
            }

            const response = await axios.post(`${url}/residents/create_or_update`, formData, {
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
                navigate(type === "create" ? '/welcome/resident/list' : '');
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
            callbackFunction();
        }
    }

    return (
        <>
            <SubmitLoadingAnim cls='loader' />

            {
                isFetching 
                    ? <SkeletonLoader onViewMode={httpMethod} />
                    : <section className="content">
                        <div className="container-fluid">
                            <div className={`row ${ httpMethod === 'create' && 'fade-up'}`}>
                                <div className={`col-xl-12 ${onViewPage && 'px-0'}`}>
                                    <div className={`card ${onViewPage && 'rounded-0 elevation-0 m-0'}`}>
                                        <div className="card-body">
                                            <form onSubmit={SubmitForm} method='POST' encType="multipart/form-data">
                                                <div className='row'>
                                                    <div className='col-xl-3 mb-1'>
                                                        <label className="form-label small mb-0">First name <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <input type="text" placeholder="Enter here.." value={fname} onChange={(e) => setFname(e.target.value)} className="form-control form-control-sm" required />
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3 mb-1'>
                                                        <label className="form-label small mb-0">Middle name</label>
                                                        <div className="input-group mb-1">
                                                            <input type="text" placeholder="Enter here.." value={mname} onChange={(e) => setMname(e.target.value)} className="form-control form-control-sm" />
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3 mb-1'>
                                                        <label className="form-label small mb-0">Last name <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <input type="text" placeholder="Enter here.." value={lname} onChange={(e) => setLname(e.target.value)} className="form-control form-control-sm" required />
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
                                                        <label className="form-label small mb-0">Birthday <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} className="form-control form-control-sm" required />
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3 mb-1'>
                                                        <label className="form-label small mb-0">Sex <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <select value={sex} onChange={(e) => setSex(e.target.value)} className='form-control form-control-sm select' required defaultValue="">
                                                                <option value=''>-- Choose --</option>
                                                                <option value='MALE'>MALE</option>
                                                                <option value='FEMALE'>FEMALE</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3 mb-1'>
                                                        <label className="form-label small mb-0">Civil Status <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <select value={civilStatus} onChange={(e) => setCivilStatus(e.target.value)} className='form-control form-control-sm select' required defaultValue="">
                                                                <option value=''>-- Choose --</option>
                                                                <option value='SINGLE'>SINGLE</option>
                                                                <option value='MARRIED'>MARRIED</option>
                                                                <option value='WIDOWED'>WIDOWED</option>
                                                                <option value='SEPARATED'>SEPARATED</option>
                                                                <option value='DIVORCED'>DIVORCED</option>
                                                                <option value='ANNULLED'>ANNULLED</option>
                                                                <option value='LIVE-IN'>LIVE-IN</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3 mb-1'>
                                                        <label className="form-label small mb-0">Highest Educational Attainment <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <select value={highestEducationalAttainment} onChange={(e) => setHighestEducationalAttainment(e.target.value)} className='form-control form-control-sm select' required defaultValue="">
                                                                <option value=''>-- Choose --</option>
                                                                <option value="ELEMENTARY LEVEL">ELEMENTARY LEVEL</option>
                                                                <option value="ELEMENTARY GRADUATE">ELEMENTARY GRADUATE</option>
                                                                <option value="HIGH SCHOOL LEVEL">HIGH SCHOOL LEVEL</option>
                                                                <option value="HIGH SCHOOL GRADUATE">HIGH SCHOOL GRADUATE</option>
                                                                <option value="VOCATIONAL">VOCATIONAL</option>
                                                                <option value="COLLEGE LEVEL">COLLEGE LEVEL</option>
                                                                <option value="COLLEGE GRADUATE">COLLEGE GRADUATE</option>
                                                                <option value="POST GRADUATE">POST GRADUATE</option>
                                                                <option value="ALS">ALS</option>
                                                                <option value="NO FORMAL EDUCATION">NO FORMAL EDUCATION</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3 mb-1'>
                                                        <label className="form-label small mb-0">Occupation</label>
                                                        <div className="input-group mb-1">
                                                            <input type="text" placeholder="Enter here.." value={occupation} onChange={(e) => setOccupation(e.target.value)} className="form-control form-control-sm" />
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3 mb-1'>
                                                        <label className="form-label small mb-0">Monthly Income</label>
                                                        <div className="input-group mb-1">
                                                            <input type="number" placeholder="Enter here.." step="any" min="0" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} className="form-control form-control-sm" required={occupation.length > 0} />
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3 mb-1'>
                                                        <label className="form-label small mb-0">Barangay <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <select value={barangay} onChange={(e) => setBarangay(e.target.value)} className='form-control form-control-sm select' required defaultValue="">
                                                                <option value=''>-- Choose --</option>
                                                                <option value="BACULANAD">BACULANAD</option>
                                                                <option value="BADIANGAY">BADIANGAY</option>
                                                                <option value="BULOD">BULOD</option>
                                                                <option value="CATOOGAN">CATOOGAN</option>
                                                                <option value="KATIPUNAN">KATIPUNAN</option>
                                                                <option value="MILAGROSA">MILAGROSA</option>
                                                                <option value="PILIT">PILIT</option>
                                                                <option value="PITOGO">PITOGO</option>
                                                                <option value="ZONE 1 (POB.)">ZONE 1 (POB.)</option>
                                                                <option value="ZONE 2 (POB.)">ZONE 2 (POB.)</option>
                                                                <option value="ZONE 3 (POB.)">ZONE 3 (POB.)</option>
                                                                <option value="SAN ISIDRO">SAN ISIDRO</option>
                                                                <option value="SAN JUAN">SAN JUAN</option>
                                                                <option value="SAN MIGUELAY">SAN MIGUELAY</option>
                                                                <option value="SAN ROQUE">SAN ROQUE</option>
                                                                <option value="TIBAK">TIBAK</option>
                                                                <option value="VICTORIA">VICTORIA</option>
                                                                <option value="CUTAY">CUTAY</option>
                                                                <option value="GAPAS">GAPAS</option>
                                                                <option value="ZONE 4 POBLACION (CABANGCALAN)">ZONE 4 POBLACION (CABANGCALAN)</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3 mb-1'>
                                                        <label className="form-label small mb-0">Religion <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <select value={religion} onChange={(e) => setReligion(e.target.value)} className='form-control form-control-sm select' required defaultValue="">
                                                                <option value=''>-- Choose --</option>
                                                                { religionData.map((rel, _) => (<option value={rel.id}>{rel.name}</option>)) }
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3 mb-1'>
                                                        <label className="form-label small mb-0">Ethnicity <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <select value={ethnicity} onChange={(e) => setEthnicity(e.target.value)} className='form-control form-control-sm select' required defaultValue="">
                                                                <option value=''>-- Choose --</option>
                                                                { ethnicityData.map((eth, _) => (<option value={eth.id}>{eth.name}</option>)) }
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-3 mb-1'>
                                                        <label className="form-label small mb-0">Is PWD? <span className="text-danger">*</span></label>
                                                        <div className="input-group mb-1">
                                                            <select value={isPwd} onChange={(e) => setIsPwd(e.target.value)} className='form-control form-control-sm select' required defaultValue="">
                                                                <option value=''>-- Choose --</option>
                                                                <option value='1'>YES</option>
                                                                <option value='0'>NO</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className='col-xl-6 mb-1'>
                                                        <label className="form-label small mb-0">Avatar</label>
                                                        <div className="input-group mb-1">
                                                            <input type="file" accept='image/*' ref={fileInputRef} onChange={(e) => CheckUploadedAvatar(e.target)} className="form-control form-control-sm" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <button type="submit" disabled={ isSubmitting } className="btn btn-primary btn-sm mt-3 elevation-1 text--fontPos13--xW8hS">
                                                    { type === "create" ? 'Save Resident' : 'Save Changes' }
                                                </button>
                                            </form>
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

export default CreateUpdateResident;