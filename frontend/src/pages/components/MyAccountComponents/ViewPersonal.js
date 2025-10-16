/* global $ */
import { useEffect, useState } from "react";
import useDateFormat from "../../../hooks/useDateFormat";
import useGetCurrentUser from "../../../hooks/useGetCurrentUser";
import useSystemURLCon from "../../../hooks/useSystemURLCon";
import SkeletonLoader from "../SkeletonLoader/SkeletonLoader";
import dayjs from 'dayjs';

const ViewPersonal = () => {
    const { userData, refreshUser } = useGetCurrentUser();
    const { formatDateToReadable } = useDateFormat();
    const { urlWithoutToken } = useSystemURLCon();
    const [isFetchingPersonal, setIsFetchingPersonal] = useState(true);

    const [fname, setFname] = useState("");
    const [mname, setMname] = useState("");
    const [lname, setLname] = useState("");
    const [suffix, setSuffix] = useState("");
    const [birthday, setBirthday] = useState(null);
    const [email, setEmail] = useState("");

    useEffect(() => {
        if(userData) {
            setFname(userData?.fname);
            setMname(userData?.mname);
            setLname(userData?.lname);
            setSuffix(userData?.suffix);
            setEmail(userData?.email);
            setBirthday(dayjs(userData?.birthdate));
            setIsFetchingPersonal(false);
        }
    }, [userData, isFetchingPersonal]);

    return (
        <>
            {
                isFetchingPersonal
                    ? <SkeletonLoader onViewMode="update" />
                    : <>
                        <div className="card elevation-0 border-0 p-0 m-0 rounded-0">
                            <div className='card-body p-0'>
                                <div className="row p-3">
                                    <div className="col-xl-5 text-center">
                                        <img src={`${urlWithoutToken}/user_images/${userData?.profile_picture}`} className="img-fluid w-100" alt="" loading='lazy' />
                                    </div>

                                    <div className="col-xl-7">
                                        <div className="row border-bottom pb-2">
                                            <div className="col-xl-4 px-3 text-bold">First name:</div>
                                            <div className="col-xl-8">{fname}</div>
                                        </div>

                                        <div className="row border-bottom py-2">
                                            <div className="col-xl-4 px-3 text-bold">Middle name:</div>
                                            <div className="col-xl-8">{mname}</div>
                                        </div>

                                        <div className="row border-bottom py-2">
                                            <div className="col-xl-4 px-3 text-bold">Last name:</div>
                                            <div className="col-xl-8">{lname}</div>
                                        </div>

                                        { suffix && suffix !== 'null' && <div className="row border-bottom py-2">
                                            <div className="col-xl-4 px-3 text-bold">Suffix:</div>
                                            <div className="col-xl-8">{(suffix ?? '')}</div>
                                        </div> }

                                        <div className="row border-bottom py-2">
                                            <div className="col-xl-4 px-3 text-bold">Birthday:</div>
                                            <div className="col-xl-8">{formatDateToReadable(userData?.birthdate)}</div>
                                        </div>

                                        <div className="row py-2">
                                            <div className="col-xl-4 px-3 text-bold">Email:</div>
                                            <div className="col-xl-8">{email}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
            }
        </>
    )
}

export default ViewPersonal;