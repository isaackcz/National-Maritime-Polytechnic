import { useEffect, useState } from 'react';
import useSystemURLCon from '../../../hooks/useSystemURLCon';
import { Link, useNavigate } from 'react-router-dom';
import useWebToken from '../../../hooks/useWebToken';
import axios from 'axios';
import ModalDeleteRow from '../component/ModalDeleteRow';
import PageName from '../component/PageName';
import NoDataFound from '../component/NoDataFound';
import MSWDDataTable from '../component/MSWDDataTable/MSWDDataTable';
import SkeletonLoader from '../component/SkeletonLoader/SkeletonLoader';

const Accounts = () => {
    const { url, urlWithoutApi } = useSystemURLCon();
    const navigate = useNavigate();
    const { getToken, removeToken } = useWebToken();
    const [accounts, setAccount] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => { GetAccounts(); }, []);

    const GetAccounts = async () => {
        try {
            setIsFetching(!isInitialLoad);

            const token = getToken();
            const response = await axios.get(`${url}/accounts/get`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setAccount(response.data.accounts);
        } catch (error) {
            if(error.response.status === 500) {
                removeToken();
                navigate('/access-denied');
            } else {
                alert(error.response.data.message);
            }
        } finally {
            setIsInitialLoad(true);
            setIsFetching(false);
        }
    }

    const tableColumns = [
        {
            name: "ID#",
            selector: row => row.id,
            sortable: true,
            minWidth: "50px",
            maxWidth: "80px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Avatar",
            cell: (account) => (
                <>
                    <a href={`${urlWithoutApi}/user-images/${account.profile_picture}`} target="_blank">
                        <img src={`${urlWithoutApi}/user-images/${account.profile_picture}`} loading='lazy' class="rounded-circle" height="30" />
                    </a>
                </>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            minWidth: "50px",
            maxWidth: "80px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Name",
            selector: row => `${row.fname} ${row.mname} ${row.lname} ${row.suffix ?? ''}`,
            sortable: true
        },
        {
            name: "Role",
            selector: row => row.role,
            sortable: true,
            minWidth: "150px",
            maxWidth: "150px",
            style: { whiteSpace: "nowrap" },
        },
        {
            name: "Actions",
            cell: (account) => (
                <div className='text-center'>
                    <div className="dropdown w-100">
                        <Link to="#" className="text-dark text-center border rounded-circle text-bold mx-3 elevation-1 data-table-ellipsis-button" type="button" id={`dropdownMenuButton_${account.id}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-ellipsis-v"></i>
                        </Link>

                        <div className="dropdown-menu dropdown-menu-right py-0" aria-labelledby={`dropdownMenuButton_${account.id}`}>
                            <Link className="dropdown-item border-bottom text--fontPos13--xW8hS py-1" to={`/welcome/account/list/${account.id}`}>
                                View Account
                            </Link>

                            <Link className="dropdown-item text--fontPos13--xW8hS py-1 text-danger" to="#" data-toggle="modal" data-target={`#data_row_${account.id}`}>
                                Remove
                            </Link>
                        </div>
                    </div>

                    <ModalDeleteRow
                        id={account.id}
                        modalTitle={`Remove Account. Account #${account.id}`}
                        url={`${url}/accounts/remove`}
                        message="Are you sure you want to remove this account? This cannot be undone."
                        callbackFunction={GetAccounts}
                    />
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'Account',
                    'last' : false,
                },
                {
                    'name' : 'Accounts',
                    'last' : true,
                    'address' : '/welcome/account/list'
                }
            ]}/>

            {
                isFetching 
                    ? <SkeletonLoader />
                    : <section className="content">
                        <div className="container-fluid">
                            <div className="row fade-up">
                                <div className="col-xl-12">
                                    { accounts.length > 0
                                        ? <>
                                            <div className="card">
                                                <div className="card-body">
                                                    <MSWDDataTable 
                                                        progressPending={isFetching}
                                                        columns={tableColumns} 
                                                        data={accounts}
                                                        selectableRows={false}
                                                        selectedRows={null}
                                                    />
                                                </div>
                                            </div>
                                        </> : <>
                                            <div className="card">
                                                <div className="card-body">
                                                    <NoDataFound message="No data found. Please add account first." />
                                                </div>
                                            </div>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    </section>
            }
        </>
    )
}

export default Accounts