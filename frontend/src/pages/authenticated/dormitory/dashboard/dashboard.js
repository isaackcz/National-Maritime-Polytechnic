import PageName from '../../../components/PageName';

const dormitoryDashboard = () => {
    return (
        <>
            <PageName pageName={[
                {
                    'name' : 'Admin',
                    'last' : false
                }, 
                {
                    'name' : 'Invoices',
                    'last' : true,
                    'address' : '/welcome/admin/Dormitory/Dashboard'
                }
            ]} />

            <section className="content">
                <div className="container-fluid">
                    <div className="row fade-up">
                        <div className="col-xl-12">
                            <div className="card border shadow-sm rounded-0">
                                <div className="card-body">
                                    sdgsdfhgsdfasef
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default dormitoryDashboard;