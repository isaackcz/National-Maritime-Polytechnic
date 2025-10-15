import PageName from '../../../components/PageName';
import UpdateAdminAccount from '../../../components/MyAccountComponents/UpdateAdminAccount';
import UpdatePassword from '../../../components/MyAccountComponents/UpdatePassword';
import ViewActivities from '../../../components/MyAccountComponents/ViewActivities';

const DAAccount = () => {
    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'My Account',
                    'last' : true,
                    'address' : '/enrollment-admin/my-account'
                }
            ]} />
            
            {
                <section className="content">
                    <div className="container-fluid">
                        <div className="row fade-up">
                            <div className="col-xl-12">
                                <div className="card shadow-sm card-primary card-outline card-outline-tabs border">
                                    <div className="card-header rounded-0 p-0 border-bottom-0">
                                        <ul className="nav nav-tabs rounded-0" id="custom-tabs-header-tab" role="tablist">
                                            <li className="nav-item">
                                                <a className="nav-link py-1 active" id="custom-tabs-main-tab" data-toggle="pill" href="#custom-tabs-main" role="tab" aria-controls="custom-tabs-main" aria-selected="true">
                                                    <span className="fas fa-home pr-1"></span>
                                                    Personal
                                                </a>
                                            </li>

                                            <li className="nav-item">
                                                <a className="nav-link py-1" id="custom-tabs-change-password-tab" data-toggle="pill" href="#custom-tabs-change-password" role="tab" aria-controls="custom-tabs-change-password" aria-selected="false">
                                                    <span className="fas fa-key pr-1"></span>
                                                    Change Password
                                                </a>
                                            </li>

                                            <li className="nav-item">
                                                <a className="nav-link py-1" id="custom-tabs-activity-tab" data-toggle="pill" href="#custom-tabs-activity" role="tab" aria-controls="custom-tabs-activity" aria-selected="false">
                                                    <span className="fas fa-history pr-1"></span>
                                                    Activity
                                                </a>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="card-body p-0">
                                        <div className="tab-content" id="custom-tabs-header-tabContent">
                                            <div className="tab-pane fade show active" id="custom-tabs-main" role="tabpanel" aria-labelledby="custom-tabs-main-tab">
                                                <div className="card elevation-0 border-0 p-0 m-0 rounded-0">
                                                    <div className='card-body p-0'>
                                                        <UpdateAdminAccount urlPrefix={"dormitory-admin"} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="tab-pane fade" id="custom-tabs-change-password" role="tabpanel" aria-labelledby="custom-tabs-change-password-tab">
                                                <div className="card elevation-0 border-0 m-0 rounded-0">
                                                    <div className='card-body'>
                                                        <UpdatePassword urlPrefix={"dormitory-admin"}/>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="tab-pane fade" id="custom-tabs-activity" role="tabpanel" aria-labelledby="custom-tabs-activity-tab">
                                                <div className="card elevation-0 border-0 m-0 rounded-0">
                                                    <div className='card-body'>
                                                        <ViewActivities urlPrefix={"dormitory-admin"}/>
                                                    </div>
                                                </div>
                                            </div>
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

export default DAAccount;
